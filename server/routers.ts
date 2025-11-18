import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updatePreferences: protectedProcedure
      .input(z.object({
        preferredLanguage: z.enum(["nl", "ar", "en", "tr"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPreferences(ctx.user.id, input.preferredLanguage);
        return { success: true };
      }),
  }),

  // Text management
  text: router({
    create: protectedProcedure
      .input(z.object({
        dutchText: z.string().min(50, "Text must be at least 50 characters"),
        title: z.string().optional(),
        source: z.enum(["paste", "upload", "scan"]).default("paste"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Calculate word count and reading time
        const wordCount = input.dutchText.split(/\s+/).length;
        const estimatedReadingMinutes = Math.ceil(wordCount / 200); // Average reading speed

        // Create text record
        const result = await db.createText({
          dutchText: input.dutchText,
          title: input.title,
          wordCount,
          estimatedReadingMinutes,
          createdBy: ctx.user.id,
          source: input.source,
          status: "pending",
          isValidDutch: true, // Will be validated by AI
          isB1Level: true, // Will be validated by AI
        });

        return { 
          success: true, 
          textId: result[0].insertId,
          wordCount,
          estimatedReadingMinutes,
        };
      }),

    validateText: protectedProcedure
      .input(z.object({
        textId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const text = await db.getTextById(input.textId);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        // Validate with AI
        const validationPrompt = `Analyze the following text and determine:
1. Is it in Dutch language? (yes/no)
2. What CEFR level is it? (A1, A2, B1, B2, C1, C2)
3. Confidence level for the CEFR assessment (0-100)

Text: ${text.dutchText}

Respond in JSON format:
{
  "isDutch": true/false,
  "level": "B1",
  "confidence": 85
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a Dutch language expert specializing in CEFR level assessment." },
            { role: "user", content: validationPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "validation_result",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  isDutch: { type: "boolean" },
                  level: { type: "string", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
                  confidence: { type: "integer", minimum: 0, maximum: 100 },
                },
                required: ["isDutch", "level", "confidence"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const validation = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

        // Update text validation
        await db.updateTextValidation(input.textId, {
          isValidDutch: validation.isDutch,
          detectedLevel: validation.level,
          levelConfidence: validation.confidence,
          isB1Level: validation.level === "B1",
        });

        return {
          success: true,
          isValidDutch: validation.isDutch,
          detectedLevel: validation.level,
          levelConfidence: validation.confidence,
          isB1Level: validation.level === "B1",
          warning: validation.level !== "B1" ? `Text appears to be ${validation.level} level, not B1` : null,
        };
      }),

    translateText: protectedProcedure
      .input(z.object({
        textId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const text = await db.getTextById(input.textId);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        // Check if translation already exists
        const existing = await db.getTranslationByTextId(input.textId);
        if (existing) {
          return { success: true, cached: true };
        }

        // Translate to Arabic, English, and Turkish
        const translationPrompt = `Translate the following Dutch text to Arabic, English, and Turkish.

Dutch text: ${text.dutchText}

Respond in JSON format:
{
  "arabic": "...",
  "english": "...",
  "turkish": "..."
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional translator specializing in Dutch to Arabic, English, and Turkish translations." },
            { role: "user", content: translationPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "translations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  arabic: { type: "string" },
                  english: { type: "string" },
                  turkish: { type: "string" },
                },
                required: ["arabic", "english", "turkish"],
                additionalProperties: false,
              },
            },
          },
        });

        const content2 = response.choices[0].message.content;
        const translations = JSON.parse(typeof content2 === 'string' ? content2 : JSON.stringify(content2));

        // Save translations
        await db.createTranslation({
          textId: input.textId,
          arabicTranslation: translations.arabic,
          englishTranslation: translations.english,
          turkishTranslation: translations.turkish,
        });

        return { success: true, cached: false };
      }),

    getMyTexts: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTextsByUser(ctx.user.id);
    }),

    getApprovedTexts: publicProcedure.query(async () => {
      return await db.getApprovedTexts();
    }),

    getTextWithTranslation: publicProcedure
      .input(z.object({
        textId: z.number(),
      }))
      .query(async ({ input }) => {
        const text = await db.getTextById(input.textId);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        const translation = await db.getTranslationByTextId(input.textId);

        return {
          text,
          translation,
        };
      }),
  }),

  // Exam management
  exam: router({
    generateExam: protectedProcedure
      .input(z.object({
        textId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const text = await db.getTextById(input.textId);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        // Generate exam questions with AI
        const examPrompt = `Based on the following Dutch B1 text, generate 10 multiple-choice reading comprehension questions.

Text: ${text.dutchText}

Requirements:
- 10 questions total
- Each question has 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should test reading comprehension at B1 level
- Mix of question types: main idea, details, inference, vocabulary

Respond in JSON format:
{
  "questions": [
    {
      "question": "Question text in Dutch",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    }
  ]
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a Dutch language teacher creating B1 level reading comprehension exams." },
            { role: "user", content: examPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "exam_questions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          minItems: 4,
                          maxItems: 4,
                        },
                        correctAnswer: { type: "string", enum: ["A", "B", "C", "D"] },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correctAnswer", "explanation"],
                      additionalProperties: false,
                    },
                    minItems: 10,
                    maxItems: 10,
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content3 = response.choices[0].message.content;
        const examData = JSON.parse(typeof content3 === 'string' ? content3 : JSON.stringify(content3));

        // Create exam record
        const result = await db.createExam({
          userId: ctx.user.id,
          textId: input.textId,
          questions: JSON.stringify(examData.questions),
          totalQuestions: examData.questions.length,
          status: "in_progress",
        });

        return {
          success: true,
          examId: result[0].insertId,
          questions: examData.questions,
        };
      }),

    submitExam: protectedProcedure
      .input(z.object({
        examId: z.number(),
        answers: z.array(z.string()),
        timeSpentMinutes: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const exam = await db.getExamById(input.examId);
        if (!exam) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
        }

        if (exam.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not your exam" });
        }

        const questions = JSON.parse(exam.questions);
        let correctCount = 0;

        // Grade the exam
        questions.forEach((q: any, index: number) => {
          if (input.answers[index] === q.correctAnswer) {
            correctCount++;
          }
        });

        const scorePercentage = Math.round((correctCount / questions.length) * 100);

        // Update exam
        await db.updateExam(input.examId, {
          answers: JSON.stringify(input.answers),
          correctAnswers: correctCount,
          scorePercentage,
          completedAt: new Date(),
          timeSpentMinutes: input.timeSpentMinutes,
          status: "completed",
        });

        // Update user stats
        const userStats = await db.getUserExamStats(ctx.user.id);
        await db.updateUserStats(ctx.user.id, {
          totalExamsCompleted: Number(userStats?.completedExams || 0),
          totalTimeSpentMinutes: Number(userStats?.totalTimeMinutes || 0),
          lastActivityDate: new Date(),
        });

        return {
          success: true,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          scorePercentage,
        };
      }),

    getMyExams: protectedProcedure.query(async ({ ctx }) => {
      return await db.getExamsByUser(ctx.user.id);
    }),

    getExamDetails: protectedProcedure
      .input(z.object({
        examId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const exam = await db.getExamById(input.examId);
        if (!exam) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
        }

        if (exam.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not your exam" });
        }

        return exam;
      }),
  }),

  // Progress tracking
  progress: router({
    getMyStats: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      const examStats = await db.getUserExamStats(ctx.user.id);
      const completedExams = await db.getCompletedExamsByUser(ctx.user.id);

      return {
        user,
        examStats,
        completedExams,
      };
    }),

    getMyAchievements: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAchievements(ctx.user.id);
    }),
  }),

  // Vocabulary
  vocabulary: router({
    extractVocabulary: protectedProcedure
      .input(z.object({
        textId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const text = await db.getTextById(input.textId);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        // Extract vocabulary with AI
        const vocabPrompt = `Extract 10-15 important B1-level Dutch words from this text that would be useful for language learners.

Text: ${text.dutchText}

For each word, provide:
- The Dutch word
- Arabic translation
- English translation
- Turkish translation
- An example sentence from the text
- Difficulty level (easy, medium, hard)

Respond in JSON format:
{
  "vocabulary": [
    {
      "dutch": "word",
      "arabic": "translation",
      "english": "translation",
      "turkish": "translation",
      "example": "sentence",
      "difficulty": "medium"
    }
  ]
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a Dutch language teacher helping students learn B1-level vocabulary." },
            { role: "user", content: vocabPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "vocabulary_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  vocabulary: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        dutch: { type: "string" },
                        arabic: { type: "string" },
                        english: { type: "string" },
                        turkish: { type: "string" },
                        example: { type: "string" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                      },
                      required: ["dutch", "arabic", "english", "turkish", "example", "difficulty"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["vocabulary"],
                additionalProperties: false,
              },
            },
          },
        });

        const content4 = response.choices[0].message.content;
        const vocabData = JSON.parse(typeof content4 === 'string' ? content4 : JSON.stringify(content4));

        // Save vocabulary
        for (const word of vocabData.vocabulary) {
          await db.createVocabulary({
            textId: input.textId,
            dutchWord: word.dutch,
            arabicTranslation: word.arabic,
            englishTranslation: word.english,
            turkishTranslation: word.turkish,
            exampleSentence: word.example,
            difficulty: word.difficulty,
          });
        }

        return {
          success: true,
          vocabularyCount: vocabData.vocabulary.length,
        };
      }),

    getVocabularyByText: publicProcedure
      .input(z.object({
        textId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getVocabularyByTextId(input.textId);
      }),

    getMyVocabularyProgress: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserVocabularyProgress(ctx.user.id);
    }),
  }),

  // Reporting
  report: router({
    createReport: protectedProcedure
      .input(z.object({
        textId: z.number(),
        reportType: z.enum(["level_issue", "content_issue"]),
        levelIssueType: z.enum(["too_easy", "too_hard"]).optional(),
        contentIssueType: z.enum(["inappropriate", "spam", "not_dutch", "other"]).optional(),
        details: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createReport({
          textId: input.textId,
          reportedBy: ctx.user.id,
          reportType: input.reportType,
          levelIssueType: input.levelIssueType,
          contentIssueType: input.contentIssueType,
          details: input.details,
          status: "pending",
        });

        return { success: true };
      }),

    getReportsByText: adminProcedure
      .input(z.object({
        textId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getReportsByTextId(input.textId);
      }),
  }),

  // Admin dashboard
  admin: router({
    getAllUsers: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    getPendingTexts: adminProcedure.query(async () => {
      return await db.getPendingTexts();
    }),

    approveText: adminProcedure
      .input(z.object({
        textId: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateTextStatus(input.textId, "approved", ctx.user.id, input.note);
        return { success: true };
      }),

    rejectText: adminProcedure
      .input(z.object({
        textId: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateTextStatus(input.textId, "rejected", ctx.user.id, input.note);
        return { success: true };
      }),

    getPendingReports: adminProcedure.query(async () => {
      return await db.getPendingReports();
    }),

    resolveReport: adminProcedure
      .input(z.object({
        reportId: z.number(),
        status: z.enum(["reviewed", "resolved", "dismissed"]),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateReportStatus(input.reportId, input.status, ctx.user.id, input.note);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
