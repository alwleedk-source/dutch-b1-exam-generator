// Exam router
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import * as gemini from "../lib/gemini";

export const examRouter = router({
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

            console.log('[submitExam] Exam user_id:', exam.user_id, 'Current user id:', ctx.user.id);

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
                const correctAnswer = String.fromCharCode(65 + (q.correctAnswerIndex || 0));
                if (input.answers[index] === correctAnswer) {
                    correctCount++;
                }
            });

            const score_percentage = Math.round((correctCount / questions.length) * 100);

            // Calculate official Staatsexamen score
            const { calculateStaatsexamenScore, analyzePerformanceByType, generateRecommendations } = await import("../lib/scoring");
            const staatsexamen_score = calculateStaatsexamenScore(correctCount);
            const performanceAnalysis = analyzePerformanceByType(questions, input.answers);
            const recommendations = generateRecommendations(performanceAnalysis);

            // Calculate skill-based analysis
            const { analyzeSkillPerformance } = await import("../lib/skillAnalysis");
            const userAnswerIndices = input.answers.map(ans => ans.charCodeAt(0) - 65);
            const skillAnalysis = analyzeSkillPerformance(questions, userAnswerIndices);

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

            // Update user streak
            await db.updateUserStreak(ctx.user.id);

            // Add gamification points
            let pointsResult = await db.addPoints(ctx.user.id, "examComplete");

            // Bonus points for high scores
            if (score_percentage >= 100) {
                await db.addPoints(ctx.user.id, "examScore100");
            } else if (score_percentage >= 80) {
                await db.addPoints(ctx.user.id, "examScore80Plus");
            }

            // Create level up notification if needed
            if (pointsResult.levelUp && pointsResult.newLevel) {
                try {
                    const { createNotification } = await import("./notifications");
                    const levelEmojis: Record<string, string> = {
                        learner: "📚",
                        advanced: "⭐",
                        expert: "🏆",
                        master: "👑",
                    };
                    await createNotification({
                        userId: ctx.user.id,
                        type: "level_up",
                        title: `${levelEmojis[pointsResult.newLevel] || "🎉"} Level Up!`,
                        message: `Congratulations! You've reached ${pointsResult.newLevel} level!`,
                        actionUrl: "/progress",
                        priority: "high",
                    });
                } catch (error) {
                    console.error("[Gamification] Failed to create level up notification:", error);
                }
            }

            return {
                success: true,
                correct_answers: correctCount,
                total_questions: questions.length,
                score_percentage,
                staatsexamen_score,
                skillAnalysis,
                performanceAnalysis,
                recommendations,
                pointsEarned: pointsResult.points,
                totalPoints: pointsResult.newTotal,
                levelUp: pointsResult.levelUp,
                newLevel: pointsResult.newLevel,
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

            const text = await db.getTextById(exam.text_id);

            return {
                ...exam,
                formatted_html: text?.formatted_html,
                text_type: text?.text_type,
            };
        }),
});
