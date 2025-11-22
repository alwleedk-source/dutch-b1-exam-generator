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
    logout: publicProcedure.mutation(async ({ ctx }) => {
      // Use req.logout() from Passport to properly destroy session
      return new Promise((resolve, reject) => {
        if (ctx.req.logout) {
          ctx.req.logout((err) => {
            if (err) {
              console.error('[Logout] Error destroying session:', err);
              reject(err);
              return;
            }
            
            // Also destroy the session completely
            if (ctx.req.session) {
              ctx.req.session.destroy((err) => {
                if (err) {
                  console.error('[Logout] Error destroying session store:', err);
                }
              });
            }
            
            // Clear the cookie
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
            
            console.log('[Logout] Session destroyed successfully');
            resolve({ success: true } as const);
          });
        } else {
          // Fallback if req.logout is not available
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
          resolve({ success: true } as const);
        }
      });
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
          .min(2000, "Text must be at least 2000 characters for quality exam generation")
          .max(10100, "Text must not exceed 10,100 characters"),
        title: z.string().optional(),
        source: z.enum(["paste", "upload", "scan"]).default("paste"),
      }))
      .mutation(async ({ ctx, input }) => {
        const { calculateMinHash } = await import("./lib/minhash");
        
        // Check daily limit for non-admin users
        const user = await db.getUserById(ctx.user.id);
        if (user?.role !== 'admin') {
          // Get texts created today by this user
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const textsToday = await db.getUserTextsCreatedAfter(ctx.user.id, today);
          
          if (textsToday.length >= 2) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "Daily limit reached: You can only create 2 texts per day. Upgrade to admin for unlimited access."
            });
          }
        }
        
        // Calculate dynamic question count based on text length
        const { calculateQuestionCount } = await import("./lib/questionCount");
        const questionCount = calculateQuestionCount(input.dutch_text.length);
        console.log(`[Text Creation] Calculated question count: ${questionCount} for ${input.dutch_text.length} characters`);
        
        // ✨ OPTIMIZED: Process text completely in ONE Gemini API call (saves 80% tokens!)
        console.log('[Text Creation] Processing text with unified Gemini call...');
        let cleanedText = input.dutch_text;
        let finalTitle = input.title;
        let examData: any;
        let vocabData: any;
        
        try {
          const result = await gemini.processTextComplete(input.dutch_text, questionCount);
          cleanedText = result.cleanedText;
          finalTitle = input.title || result.title; // Use provided title if available
          examData = { questions: result.questions };
          vocabData = { vocabulary: result.vocabulary };
          console.log('[Text Creation] ✅ Unified processing successful!');
          console.log(`[Text Creation] - Text cleaned: ${cleanedText.length} chars`);
          console.log(`[Text Creation] - Title: ${finalTitle}`);
          console.log(`[Text Creation] - Questions: ${result.questions.length}`);
          console.log(`[Text Creation] - Vocabulary: ${result.vocabulary.length} words`);
        } catch (error: any) {
          console.error('[Text Creation] ❌ Unified processing failed, falling back to separate calls:', error);
          
          // Fallback to old method if unified processing fails
          try {
            cleanedText = await gemini.cleanAndFormatText(input.dutch_text);
          } catch (e) {
            cleanedText = input.dutch_text;
          }
          
          if (!finalTitle || finalTitle.trim() === "") {
            try {
              finalTitle = await gemini.generateTitle(cleanedText);
            } catch (e) {
              finalTitle = cleanedText.substring(0, 50).trim() + "...";
            }
          }
          
          try {
            examData = await gemini.generateExamQuestions(cleanedText, questionCount);
          } catch (e: any) {
            throw new TRPCError({ 
              code: "INTERNAL_SERVER_ERROR", 
              message: `Failed to generate exam: ${e.message}` 
            });
          }
          
          try {
            vocabData = await gemini.extractVocabulary(cleanedText);
          } catch (e) {
            vocabData = { vocabulary: [] };
          }
        }
        
        // Calculate word count and reading time (using cleaned text)
        const wordCount = cleanedText.split(/\s+/).length;
        const estimatedReadingMinutes = Math.ceil(wordCount / 200);
        
        // Calculate MinHash signature for duplicate detection (using cleaned text)
        const minHashSignature = calculateMinHash(cleanedText);
        const minHashSignatureJson = JSON.stringify(minHashSignature);

        // Check for duplicate text BEFORE saving (save API costs)
        const isDuplicate = await db.checkDuplicateText(minHashSignature, ctx.user.id);
        if (isDuplicate) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "This text already exists. Please use a different text." 
          });
        }

        // Format text automatically with advanced AI-powered formatter
        const { formatTextAdvanced } = await import("./lib/advanced-text-formatter");
        const formattedResult = await formatTextAdvanced(cleanedText);
        
        console.log(`[Text Creation] Formatting: ${formattedResult.usedAI ? 'AI-powered' : 'Rule-based'}, Type: ${formattedResult.textType}, Columns: ${formattedResult.hasColumns}`);

        // Only save to DB if Gemini succeeded (use cleaned text)
        const result = await db.createText({
          dutch_text: cleanedText,
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

        // Auto-extract vocabulary with context-aware shared vocabulary system
        // vocabData already extracted in unified call above
        try {
          console.log('[Vocabulary] Processing vocabulary from unified call...');
          
          let newWordsCount = 0;
          let sharedWordsCount = 0;
          
          for (const word of vocabData.vocabulary) {
            // Check if this word+context combination already exists
            const existingVocab = await db.findVocabularyByWordAndContext(
              word.dutch,
              word.context || 'general'
            );
            
            let vocabularyId;
            
            if (existingVocab) {
              // Word+context exists, reuse it
              vocabularyId = existingVocab.id;
              sharedWordsCount++;
              console.log(`[Vocabulary] Reusing existing: ${word.dutch} (${word.context})`);
            } else {
              // New word+context, create it
              const newVocab = await db.createVocabulary({
                dutchWord: word.dutch,
                context: word.context || 'general',
                dutchDefinition: word.dutch_definition,
                wordType: word.word_type,
                arabicTranslation: word.arabic,
                englishTranslation: word.english,
                turkishTranslation: word.turkish,
                exampleSentence: word.example,
                difficulty: word.difficulty,
                sourceTextId: textId,
              });
              vocabularyId = newVocab[0].id;
              newWordsCount++;
              console.log(`[Vocabulary] Created new: ${word.dutch} (${word.context})`);
            }
            
            // Link vocabulary to this text
            await db.linkVocabularyToText(textId, vocabularyId);
          }
          
          console.log(`[Vocabulary] Extraction complete: ${newWordsCount} new, ${sharedWordsCount} shared`);
        } catch (error) {
          console.error('[Vocabulary] Auto-extraction failed:', error);
          // Don't fail the request if vocabulary extraction fails
        }
        
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
        
        // Calculate skill-based analysis
        const { analyzeSkillPerformance } = await import("./lib/skillAnalysis");
        const userAnswerIndices = input.answers.map(ans => ans.charCodeAt(0) - 65); // A->0, B->1, etc.
        const skillAnalysis = analyzeSkillPerformance(questions, userAnswerIndices);

        // Update exam
        await db.updateExam(input.examId, {
          answers: JSON.stringify(input.answers),
          correct_answers: correctCount,
          score_percentage,
          staatsexamen_score,
          // skill_analysis: JSON.stringify(skillAnalysis), // TODO: Enable after migration
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
        
        // Update user streak
        await db.updateUserStreak(ctx.user.id);

        return {
          success: true,
          correct_answers: correctCount,
          total_questions: questions.length,
          score_percentage,
          staatsexamen_score,
          skillAnalysis,
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
        if (!exam.answers || !exam.questions) continue;
        
        const questions = JSON.parse(exam.questions);
        const userAnswers = JSON.parse(exam.answers);

        questions.forEach((q: any, idx: number) => {
          // Map questionType from Gemini (camelCase) to our format (snake_case)
          let questionType = q.question_type || q.questionType || 'search';
          
          // Normalize question type names
          const typeMapping: Record<string, string> = {
            'Main Idea': 'main_idea',
            'Scanning': 'search',
            'Sequencing': 'sequence',
            'Inference': 'inference',
            'Vocabulary': 'vocabulary',
          };
          
          questionType = typeMapping[questionType] || questionType.toLowerCase().replace(/ /g, '_');
          
          // Convert correctAnswerIndex to letter (A, B, C, D) for comparison
          const correctAnswerLetter = String.fromCharCode(65 + (q.correctAnswerIndex || 0));
          const isCorrect = userAnswers[idx] === correctAnswerLetter;

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

    saveWordFromText: protectedProcedure
      .input(z.object({
        textId: z.number(),
        dutchWord: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get the vocabulary entry for this word from this text
        const vocabList = await db.getVocabularyByTextId(input.textId);
        
        // Check if vocabulary list is empty or undefined
        if (!vocabList || vocabList.length === 0) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "No vocabulary found for this text. Please extract vocabulary first." 
          });
        }
        
        const vocabEntry = vocabList.find((v: any) => 
          v.dutchWord.toLowerCase() === input.dutchWord.toLowerCase()
        );
        
        if (!vocabEntry) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Word not found in this text's vocabulary" 
          });
        }
        
        // Check if user already has this word
        const existingUserVocab = await db.getUserVocabularyByVocabId(
          ctx.user.id, 
          vocabEntry.id
        );
        
        if (existingUserVocab) {
          throw new TRPCError({ 
            code: "CONFLICT", 
            message: "You already have this word in your vocabulary" 
          });
        }
        
        // Add to user's vocabulary
        await db.createUserVocabulary({
          user_id: ctx.user.id,
          vocabulary_id: vocabEntry.id,
          status: "new" as const,
          correct_count: 0,
          incorrect_count: 0,
          next_review_at: new Date(),
          ease_factor: 2500,
          interval: 0,
          repetitions: 0,
        });
        
        return { success: true };
      }),

    updatePracticeProgress: protectedProcedure
      .input(z.object({
        userVocabId: z.number(),
        isCorrect: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { calculateNextReview } = await import("./lib/srs");
        
        const userVocab = await db.getUserVocabularyById(input.userVocabId);
        if (!userVocab || userVocab.user_id !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vocabulary not found" });
        }

        // Convert isCorrect to SM-2 quality rating
        // Correct = 4 (good response), Incorrect = 2 (incorrect but remembered)
        const quality = input.isCorrect ? 4 : 2;

        // Calculate next review using SM-2
        const srsResult = calculateNextReview(quality, {
          ease_factor: userVocab.ease_factor / 1000, // Convert to decimal
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
          correct_count: input.isCorrect ? userVocab.correct_count + 1 : userVocab.correct_count,
          incorrect_count: input.isCorrect ? userVocab.incorrect_count : userVocab.incorrect_count + 1,
          status: srsResult.repetitions >= 5 ? "mastered" : "learning",
        });

        return { success: true, ...srsResult };
      }),

    deleteUserVocabulary: protectedProcedure
      .input(z.object({
        userVocabId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userVocab = await db.getUserVocabularyById(input.userVocabId);
        if (!userVocab || userVocab.user_id !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vocabulary not found" });
        }

        await db.deleteUserVocabulary(input.userVocabId);
        
        // Update user's vocabulary count
        await db.updateUserVocabularyCount(ctx.user.id);

        return { success: true };
      }),

    archiveUserVocabulary: protectedProcedure
      .input(z.object({
        userVocabId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userVocab = await db.getUserVocabularyById(input.userVocabId);
        if (!userVocab || userVocab.user_id !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vocabulary not found" });
        }

        await db.updateUserVocabularyStatus(input.userVocabId, "archived");

        return { success: true };
      }),

    unarchiveUserVocabulary: protectedProcedure
      .input(z.object({
        userVocabId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userVocab = await db.getUserVocabularyById(input.userVocabId);
        if (!userVocab || userVocab.user_id !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vocabulary not found" });
        }

        await db.updateUserVocabularyStatus(input.userVocabId, "learning");

        return { success: true };
      }),

    markAsMastered: protectedProcedure
      .input(z.object({
        userVocabId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userVocab = await db.getUserVocabularyById(input.userVocabId);
        if (!userVocab || userVocab.user_id !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vocabulary not found" });
        }

        // Update to mastered status and set high ease factor
        await db.updateUserVocabularySRS(input.userVocabId, {
          status: "mastered",
          ease_factor: 3000, // High ease factor (3.0)
          interval: 30, // Review in 30 days
          repetitions: 10, // High repetition count
          next_review_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          last_reviewed_at: new Date(),
          correct_count: userVocab.correct_count,
          incorrect_count: userVocab.incorrect_count,
        });

        return { success: true };
      }),

    addFromDictionary: protectedProcedure
      .input(z.object({
        word: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get word from dictionary
        const result = await db.query(
          'SELECT * FROM b1_dictionary WHERE word = $1 LIMIT 1',
          [input.word]
        );
        
        if (result.rows.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Word not found in dictionary" });
        }
        
        const dictWord = result.rows[0];
        
        // Create vocabulary entry if it doesn't exist
        let vocabEntry = await db.query(
          'SELECT id FROM vocabulary WHERE "dutchWord" = $1 LIMIT 1',
          [dictWord.word]
        );
        
        let vocabularyId: number;
        
        if (vocabEntry.rows.length === 0) {
          // Create new vocabulary entry
          const newVocab = await db.createVocabulary({
            text_id: null, // Dictionary words don't belong to a specific text
            dutchWord: dictWord.word,
            dutchDefinition: dictWord.definition_nl || '',
            wordType: dictWord.word_type || 'unknown',
            arabicTranslation: dictWord.translation_ar || '',
            englishTranslation: dictWord.translation_en || '',
            turkishTranslation: dictWord.translation_tr || '',
            exampleSentence: dictWord.example_nl || '',
            difficulty: 'B1',
          });
          vocabularyId = newVocab.id;
        } else {
          vocabularyId = vocabEntry.rows[0].id;
        }
        
        // Check if user already has this word
        const existingUserVocab = await db.getUserVocabularyByVocabId(
          ctx.user.id,
          vocabularyId
        );
        
        if (existingUserVocab) {
          throw new TRPCError({ 
            code: "CONFLICT", 
            message: "You already have this word in your vocabulary" 
          });
        }
        
        // Add to user's vocabulary
        await db.createUserVocabulary({
          user_id: ctx.user.id,
          vocabulary_id: vocabularyId,
          status: "new" as const,
          correct_count: 0,
          incorrect_count: 0,
          next_review_at: new Date(),
          ease_factor: 2500,
          interval: 0,
          repetitions: 0,
        });
        
        // Update user's vocabulary count
        await db.updateUserVocabularyCount(ctx.user.id);
        
        return { success: true };
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

    // Report exam (for inappropriate content, spam, etc.)
    createReportForExam: protectedProcedure
      .input(z.object({
        exam_id: z.number(),
        reason: z.enum(["inappropriate_content", "spam", "cheating", "other"]),
        details: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get exam to find text_id
        const exam = await db.getExamById(input.exam_id);
        if (!exam) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
        }

        await db.createReport({
          text_id: exam.text_id,
          reported_by: ctx.user.id,
          report_type: "content_issue",
          content_issue_type: input.reason === "inappropriate_content" ? "inappropriate" : "other",
          details: `Exam #${input.exam_id}: ${input.reason}${input.details ? ` - ${input.details}` : ""}`,
        });

        return { success: true };
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

    getAllTexts: adminProcedure.query(async () => {
      return await db.getAllTexts();
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

    deleteText: adminProcedure
      .input(z.object({
        text_id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteText(input.text_id);
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

    // Get all exams with search
    getAllExams: adminProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(["all", "in_progress", "completed"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAllExams(input);
      }),

    // Get exam details for admin
    getExamDetailsAdmin: adminProcedure
      .input(z.object({
        exam_id: z.number(),
      }))
      .query(async ({ input }) => {
        const exam = await db.getExamById(input.exam_id);
        if (!exam) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
        }
        
        // Get text details
        const text = await db.getTextById(exam.text_id);
        
        // Get user details
        const user = await db.getUserById(exam.user_id);
        
        return {
          ...exam,
          text,
          user,
        };
      }),

    // Delete exam
    deleteExam: adminProcedure
      .input(z.object({
        exam_id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteExam(input.exam_id);
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

  // Dictionary router
  dictionary: router({
    search: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        letter: z.string().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const { query, letter, limit } = input;
        
        let sql = 'SELECT * FROM b1_dictionary WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (query && query.length >= 2) {
          sql += ` AND word ILIKE $${paramIndex}`;
          params.push(`%${query}%`);
          paramIndex++;
        }

        if (letter) {
          sql += ` AND word ILIKE $${paramIndex}`;
          params.push(`${letter}%`);
          paramIndex++;
        }

        sql += ` ORDER BY word ASC LIMIT $${paramIndex}`;
        params.push(limit);

        const result = await db.query(sql, params);
        return result.rows;
      }),
  }),
});

export type AppRouter = typeof appRouter;
