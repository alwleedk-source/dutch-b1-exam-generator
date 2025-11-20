import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as gemini from "./lib/gemini";

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
        preferred_language: z.enum(["nl", "ar", "en", "tr"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPreferences(ctx.user.id, input.preferred_language);
        return { success: true };
      }),
  }),

  // Text management
  text: router({
    extractFromImage: protectedProcedure
      .input(z.object({
        imageBase64: z.string(), // Base64 encoded image
      }))
      .mutation(async ({ input }) => {
        const { extractTextFromImage, validateExtractedText } = await import("./lib/ocr");
        
        // Extract text from image
        const result = await extractTextFromImage(input.imageBase64);
        
        // Validate extracted text
        const validation = validateExtractedText(result.text);
        if (!validation.isValid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: validation.reason });
        }
        
        return {
          text: result.text,
          confidence: result.confidence,
          isTruncated: result.isTruncated,
          characterCount: result.text.length,
        };
      }),

    checkDuplicate: protectedProcedure
      .input(z.object({
        text: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { checkDuplicate } = await import("./lib/minhash");
        
        // Get all existing texts with their signatures
        const allTexts = await db.getAllTexts();
        const textsWithSignatures = allTexts
          .filter(t => t.min_hash_signature)
          .map(t => ({
            id: t.id,
            title: t.title || `Text #${t.id}`,
            signature: JSON.parse(t.min_hash_signature!),
          }));
        
        // Check for duplicates
        const duplicateCheck = checkDuplicate(input.text, textsWithSignatures);
        
        return {
          isDuplicate: duplicateCheck.isDuplicate,
          similarTexts: duplicateCheck.similarTexts.map(t => ({
            id: t.id,
            title: t.title,
            similarity: Math.round(t.similarity * 100), // Convert to percentage
          })),
        };
      }),

    getTextById: publicProcedure
      .input(z.object({ text_id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTextById(input.text_id);
      }),

    create: protectedProcedure
      .input(z.object({
        dutch_text: z.string()
          .min(2500, "Text must be at least 2500 characters for quality exam generation")
          .max(6000, "Text must not exceed 6000 characters"),
        title: z.string().optional(),
        source: z.enum(["paste", "upload", "scan"]).default("paste"),
      }))
      .mutation(async ({ ctx, input }) => {
        const { calculateMinHash } = await import("./lib/minhash");
        
        // Calculate word count and reading time
        const wordCount = input.dutch_text.split(/\s+/).length;
        const estimatedReadingMinutes = Math.ceil(wordCount / 200);
        
        // Calculate MinHash signature for duplicate detection
        const minHashSignature = calculateMinHash(input.dutch_text);
        const minHashSignatureJson = JSON.stringify(minHashSignature);

        // Check for duplicate text BEFORE calling Gemini (save API costs)
        const isDuplicate = await db.checkDuplicateText(minHashSignature, ctx.user.id);
        if (isDuplicate) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "This text already exists. Please use a different text." 
          });
        }

        // Format text automatically
        const { formatText } = await import("./lib/text-formatter");
        const formattedResult = formatText(input.dutch_text);
        
        // Generate title using AI if not provided
        let finalTitle = input.title;
        if (!finalTitle || finalTitle.trim() === "") {
          try {
            finalTitle = await gemini.generateTitle(input.dutch_text);
          } catch (error) {
            console.error("Failed to generate title:", error);
            // Fallback: use first 50 characters of text
            finalTitle = input.dutch_text.substring(0, 50).trim() + "...";
          }
        }

        // Generate exam questions with Gemini AI BEFORE saving to DB
        let examData;
        try {
          examData = await gemini.generateExamQuestions(input.dutch_text);
        } catch (error: any) {
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: `Failed to generate exam: ${error.message}` 
          });
        }

        // Only save to DB if Gemini succeeded
        const result = await db.createText({
          dutch_text: input.dutch_text,
          title: finalTitle,
          formatted_html: formattedResult.html,
          text_type: formattedResult.textType,
          word_count: wordCount,
          estimated_reading_minutes: estimatedReadingMinutes,
          min_hash_signature: minHashSignatureJson,
          created_by: ctx.user.id,
          source: input.source,
          // status defaults to pending in schema
          is_valid_dutch: true, // Will be validated by AI
          is_b1_level: true, // Will be validated by AI
        });

        const textId = result[0].id;

        // Create exam record
        const examResult = await db.createExam({
          user_id: ctx.user.id,
          text_id: textId,
          questions: JSON.stringify(examData.questions),
          total_questions: examData.questions.length,
          status: "in_progress",
        });

        // Notify admin about new text submission
        try {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: "New Text Submitted for Review",
            content: `User ${ctx.user.name || ctx.user.email || 'Unknown'} submitted a new text: "${finalTitle}" (${wordCount} words). Please review at /admin`,
          });
        } catch (error) {
          console.error("Failed to notify admin:", error);
          // Don't fail the request if notification fails
        }

        return { 
          success: true, 
          text_id: textId,
          exam_id: examResult[0].id,
          word_count: wordCount,
          estimated_reading_minutes: estimatedReadingMinutes,
          questions: examData.questions,
        };
      }),

    validateText: protectedProcedure
      .input(z.object({
        text_id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const text = await db.getTextById(input.text_id);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        // Validate with Gemini AI
        const validation = await gemini.validateDutchText(text.dutch_text);

        // Update text validation
        await db.updateTextValidation(input.text_id, {
          is_valid_dutch: validation.isDutch,
          detectedLevel: validation.level,
          levelConfidence: validation.confidence,
          is_b1_level: validation.level === "B1",
        });

        return {
          success: true,
          is_valid_dutch: validation.isDutch,
          detectedLevel: validation.level,
          levelConfidence: validation.confidence,
          is_b1_level: validation.level === "B1",
          warning: validation.level !== "B1" ? `Text appears to be ${validation.level} level, not B1` : null,
        };
      }),

    translateText: protectedProcedure
      .input(z.object({
        text_id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const text = await db.getTextById(input.text_id);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        // Check if translation already exists
        const existing = await db.getTranslationByTextId(input.text_id);
        if (existing) {
          return { success: true, cached: true };
        }

        // Translate with Gemini AI
        const translations = await gemini.translateText(text.dutch_text);

        // Save translations
        await db.createTranslation({
          text_id: input.text_id,
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

    listPublicTexts: publicProcedure.query(async () => {
      // Get all approved texts with exam statistics
      const texts = await db.getApprovedTexts();
      return texts;
    }),

    getTextWithTranslation: publicProcedure
      .input(z.object({
        text_id: z.number(),
      }))
      .query(async ({ input }) => {
        const text = await db.getTextById(input.text_id);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        const translation = await db.getTranslationByTextId(input.text_id);

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
        text_id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const text = await db.getTextById(input.text_id);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        // Try to find an existing exam for this text to reuse questions
        const existingExams = await db.getExamsByTextId(input.text_id);
        let questions;

        if (existingExams && existingExams.length > 0) {
          // Reuse questions from existing exam
          const existingExam = existingExams[0];
          questions = JSON.parse(existingExam.questions);
          console.log('[generateExam] Reusing questions from existing exam', existingExam.id);
        } else {
          // Generate new questions with Gemini AI
          console.log('[generateExam] No existing exam found, generating new questions with Gemini');
          const examData = await gemini.generateExamQuestions(text.dutch_text);
          questions = examData.questions;
        }

        // Create exam record for current user
        const result = await db.createExam({
          user_id: ctx.user.id,
          text_id: input.text_id,
          questions: JSON.stringify(questions),
          total_questions: questions.length,
          status: "in_progress",
        });

        return {
          success: true,
          examId: result[0].id,
          questions: questions,
        };
      }),

    submitExam: protectedProcedure
      .input(z.object({
        examId: z.number(),
        answers: z.array(z.string()),
        time_spent_minutes: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const exam = await db.getExamById(input.examId);
        if (!exam) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
        }

        // Debug logging
        console.log('[submitExam] Exam user_id:', exam.user_id, 'Current user id:', ctx.user.id);
        
        // Allow dev user (999) to submit any exam when DISABLE_AUTH is enabled
        const DISABLE_AUTH = process.env.DISABLE_AUTH === "true";
        const isDevUser = ctx.user.id === 999;
        
        if (exam.user_id !== ctx.user.id && !(DISABLE_AUTH && isDevUser)) {
          console.error('[submitExam] User mismatch! Exam belongs to user', exam.user_id, 'but current user is', ctx.user.id);
          throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: `This exam belongs to another user. Exam user: ${exam.user_id}, Your user: ${ctx.user.id}` 
          });
        }
        
        if (DISABLE_AUTH && isDevUser && exam.user_id !== ctx.user.id) {
          console.log('[submitExam] Dev user bypassing ownership check');
        }

        const questions = JSON.parse(exam.questions);
        let correctCount = 0;

        // Grade the exam
        questions.forEach((q: any, index: number) => {
          const correctAnswer = String.fromCharCode(65 + (q.correctAnswerIndex || 0)); // Convert 0->A, 1->B, etc.
          if (input.answers[index] === correctAnswer) {
            correctCount++;
          }
        });

        const score_percentage = Math.round((correctCount / questions.length) * 100);
        
        // Calculate official Staatsexamen score
        const { calculateStaatsexamenScore, analyzePerformanceByType, generateRecommendations } = await import("./lib/scoring");
        const staatsexamen_score = calculateStaatsexamenScore(correctCount);
        const performanceAnalysis = analyzePerformanceByType(questions, input.answers);
        const recommendations = generateRecommendations(performanceAnalysis);

        // Update exam
        await db.updateExam(input.examId, {
          answers: JSON.stringify(input.answers),
          correct_answers: correctCount,
          score_percentage,
          staatsexamen_score,
          performance_analysis: JSON.stringify(performanceAnalysis),
          recommendations: JSON.stringify(recommendations),
          completed_at: new Date(),
          time_spent_minutes: input.time_spent_minutes,
          status: "completed",
        });

        // Update user stats
        const userStats = await db.getUserExamStats(ctx.user.id);
        await db.updateUserStats(ctx.user.id, {
          total_exams_completed: Number(userStats?.completedExams || 0),
          total_time_spent_minutes: Number(userStats?.totalTimeMinutes || 0),
          last_activity_date: new Date(),
        });

        return {
          success: true,
          correct_answers: correctCount,
          total_questions: questions.length,
          score_percentage,
          staatsexamen_score,
          performanceAnalysis,
          recommendations,
        };
      }),

    getMyExams: protectedProcedure.query(async ({ ctx }) => {
      return await db.getExamsByUser(ctx.user.id);
    }),

    getExamDetails: publicProcedure
      .input(z.object({
        examId: z.number(),
      }))
      .query(async ({ input }) => {
        const exam = await db.getExamById(input.examId);
        if (!exam) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
        }

        // Get text details including formatted_html
        const text = await db.getTextById(exam.text_id);
        
        return {
          ...exam,
          formatted_html: text?.formatted_html,
          text_type: text?.text_type,
        };
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

    getDetailedAnalysis: protectedProcedure.query(async ({ ctx }) => {
      const completedExams = await db.getCompletedExamsByUser(ctx.user.id);
      
      // Initialize counters for each question type
      const questionTypeStats: Record<string, { correct: number; total: number }> = {
        main_idea: { correct: 0, total: 0 },
        search: { correct: 0, total: 0 },
        sequence: { correct: 0, total: 0 },
        inference: { correct: 0, total: 0 },
        vocabulary: { correct: 0, total: 0 },
      };

      let totalQuestions = 0;
      let totalCorrect = 0;

      // Analyze each exam
      for (const exam of completedExams) {
        if (!exam.user_answers || !exam.questions) continue;
        
        const questions = JSON.parse(exam.questions);
        const userAnswers = JSON.parse(exam.user_answers);

        questions.forEach((q: any, idx: number) => {
          const questionType = q.question_type || 'search';
          const isCorrect = userAnswers[idx] === q.correct_answer;

          if (questionTypeStats[questionType]) {
            questionTypeStats[questionType].total++;
            if (isCorrect) {
              questionTypeStats[questionType].correct++;
            }
          }

          totalQuestions++;
          if (isCorrect) totalCorrect++;
        });
      }

      // Calculate percentages and identify strengths/weaknesses
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const recommendations: string[] = [];

      const typeLabels: Record<string, string> = {
        main_idea: "Hoofdgedachte (Main Idea)",
        search: "Zoeken naar informatie (Search)",
        sequence: "Volgorde begrijpen (Sequence)",
        inference: "Conclusies trekken (Inference)",
        vocabulary: "Woordenschat (Vocabulary)",
      };

      Object.entries(questionTypeStats).forEach(([type, stats]) => {
        if (stats.total === 0) return;
        
        const percentage = (stats.correct / stats.total) * 100;
        const label = typeLabels[type];

        if (percentage >= 80) {
          strengths.push(`Uitstekend in ${label} (${percentage.toFixed(0)}%)`);
        } else if (percentage < 60) {
          weaknesses.push(`Verbeter ${label} (${percentage.toFixed(0)}%)`);
          
          // Add specific recommendations
          if (type === 'main_idea') {
            recommendations.push("Oefen met het identificeren van de hoofdgedachte door te vragen: 'Waar gaat deze tekst vooral over?'");
          } else if (type === 'vocabulary') {
            recommendations.push("Leer meer Nederlandse woorden. Gebruik de woordenschat functie om nieuwe woorden te oefenen.");
          } else if (type === 'inference') {
            recommendations.push("Oefen met het trekken van conclusies. Vraag jezelf: 'Wat kan ik afleiden uit deze informatie?'");
          } else if (type === 'sequence') {
            recommendations.push("Let op signaalwoorden zoals 'eerst', 'daarna', 'ten slotte' om de volgorde te begrijpen.");
          } else if (type === 'search') {
            recommendations.push("Oefen met scannen: zoek snel naar specifieke informatie zonder de hele tekst te lezen.");
          }
        }
      });

      // General recommendations based on overall performance
      const overallPercentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
      if (overallPercentage < 70) {
        recommendations.push("Lees elke dag 15-30 minuten Nederlandse teksten om je leesvaardigheid te verbeteren.");
      }

      return {
        totalQuestions,
        totalCorrect,
        byQuestionType: questionTypeStats,
        strengths,
        weaknesses,
        recommendations,
      };
    }),

    getMyAchievements: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAchievements(ctx.user.id);
    }),

    getLeaderboard: publicProcedure
      .input(z.object({
        period: z.enum(['week', 'month', 'all']),
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        return await db.getLeaderboard(input.period, input.limit);
      }),
  }),

  // Vocabulary
  vocabulary: router({
    generateAudio: protectedProcedure
      .input(z.object({
        vocabId: z.number(),
        word: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { generateDutchSpeech } = await import("./lib/tts");
        const { audioUrl, audioKey } = await generateDutchSpeech(input.word);
        await db.updateVocabularyAudio(input.vocabId, audioUrl, audioKey);
        return { audioUrl, audioKey };
      }),

    getVocabularyByText: publicProcedure
      .input(z.object({ text_id: z.number() }))
      .query(async ({ input }) => {
        return await db.getVocabularyByTextId(input.text_id);
      }),

    extractVocabulary: protectedProcedure
      .input(z.object({
        text_id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const text = await db.getTextById(input.text_id);
        if (!text) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Text not found" });
        }

        // Extract vocabulary with Gemini AI
        const vocabData = await gemini.extractVocabulary(text.dutch_text);

        // Save vocabulary
        for (const word of vocabData.vocabulary) {
          await db.createVocabulary({
            text_id: input.text_id,
            dutchWord: word.dutch,
            dutchDefinition: word.dutch_definition,
            wordType: word.word_type,
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

    getMyVocabularyProgress: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserVocabularyProgress(ctx.user.id);
    }),

    getDueForReview: protectedProcedure.query(async ({ ctx }) => {
      const { getDueCards } = await import("./lib/srs");
      const allVocab = await db.getUserVocabularyProgress(ctx.user.id);
      return getDueCards(allVocab.map((v: any) => ({
        ...v,
        next_review_at: v.next_review_at || new Date(),
      })));
    }),

    submitReview: protectedProcedure
      .input(z.object({
        userVocabId: z.number(),
        quality: z.number().min(0).max(5), // SM-2 quality rating
      }))
      .mutation(async ({ ctx, input }) => {
        const { calculateNextReview } = await import("./lib/srs");
        
        const userVocab = await db.getUserVocabularyById(input.userVocabId);
        if (!userVocab || userVocab.user_id !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vocabulary not found" });
        }

        // Calculate next review using SM-2
        const srsResult = calculateNextReview(input.quality, {
          ease_factor: userVocab.ease_factor / 1000, // Convert back to float
          interval: userVocab.interval,
          repetitions: userVocab.repetitions,
          next_review_at: userVocab.next_review_at || new Date(),
        });

        // Update user vocabulary
        await db.updateUserVocabularySRS(input.userVocabId, {
          ease_factor: Math.round(srsResult.ease_factor * 1000), // Store as integer
          interval: srsResult.interval,
          repetitions: srsResult.repetitions,
          next_review_at: srsResult.next_review_at,
          last_reviewed_at: new Date(),
          correct_count: input.quality >= 3 ? userVocab.correct_count + 1 : userVocab.correct_count,
          incorrect_count: input.quality < 3 ? userVocab.incorrect_count + 1 : userVocab.incorrect_count,
          status: srsResult.repetitions >= 5 ? "mastered" : "learning",
        });

        return { success: true, ...srsResult };
      }),
  }),

  // Reporting
  report: router({
    createReport: protectedProcedure
      .input(z.object({
        text_id: z.number(),
        report_type: z.enum(["level_issue", "content_issue"]),
        level_issue_type: z.enum(["too_easy", "too_hard"]).optional(),
        content_issue_type: z.enum(["inappropriate", "spam", "not_dutch", "other"]).optional(),
        details: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createReport({
          text_id: input.text_id,
          reported_by: ctx.user.id,
          report_type: input.report_type === "level_issue" ? "level_incorrect" : "content_issue",
          level_issue_type: input.level_issue_type,
          content_issue_type: input.content_issue_type,
          details: input.details,
        });

        return { success: true };
      }),

    getReportsByText: adminProcedure
      .input(z.object({
        text_id: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getReportsByTextId(input.text_id);
      }),
  }),

  // Admin dashboard
  admin: router({
    getStats: adminProcedure.query(async () => {
      const allTexts = await db.getAllTexts();
      const allUsers = await db.getAllUsers();
      
      return {
        pending: allTexts.filter((t: any) => t.status === 'pending').length,
        approved: allTexts.filter((t: any) => t.status === 'approved').length,
        rejected: allTexts.filter((t: any) => t.status === 'rejected').length,
        totalUsers: allUsers.length,
      };
    }),

    getAllUsers: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    getPendingTexts: adminProcedure.query(async () => {
      return await db.getPendingTexts();
    }),

    approveText: adminProcedure
      .input(z.object({
        text_id: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateTextStatus(input.text_id, "approved", ctx.user.id, input.note);
        return { success: true };
      }),

    rejectText: adminProcedure
      .input(z.object({
        text_id: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateTextStatus(input.text_id, "rejected", ctx.user.id, input.note);
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

  // User management
  user: router({    updatePreferredLanguage: protectedProcedure
      .input(z.object({
        language: z.enum(["ar", "en", "tr", "nl"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPreferences(ctx.user.id, input.language);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
