// Progress router
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const progressRouter = router({
    getMyStats: protectedProcedure.query(async ({ ctx }) => {
        const user = await db.getUserById(ctx.user.id);
        const examStats = await db.getUserExamStats(ctx.user.id);
        const completedExams = await db.getCompletedExamsByUser(ctx.user.id);
        const vocabularyCount = await db.getUserVocabularyCount(ctx.user.id);

        return {
            user: {
                ...user,
                total_vocabulary_learned: vocabularyCount,
            },
            examStats,
            completedExams,
        };
    }),

    getDetailedAnalysis: protectedProcedure.query(async ({ ctx }) => {
        const completedExams = await db.getCompletedExamsByUser(ctx.user.id);

        const questionTypeStats: Record<string, { correct: number; total: number }> = {
            main_idea: { correct: 0, total: 0 },
            search: { correct: 0, total: 0 },
            sequence: { correct: 0, total: 0 },
            inference: { correct: 0, total: 0 },
            vocabulary: { correct: 0, total: 0 },
        };

        let totalQuestions = 0;
        let totalCorrect = 0;

        for (const exam of completedExams) {
            if (!exam.answers || !exam.questions) continue;

            const questions = JSON.parse(exam.questions);
            const userAnswers = JSON.parse(exam.answers);

            questions.forEach((q: any, idx: number) => {
                let questionType = q.skillType || q.question_type || q.questionType || 'search';

                const typeMapping: Record<string, string> = {
                    'Main Idea': 'main_idea',
                    'Scanning': 'search',
                    'Sequencing': 'sequence',
                    'Inference': 'inference',
                    'Vocabulary': 'vocabulary',
                    'hoofdgedachte': 'main_idea',
                    'zoeken': 'search',
                    'volgorde': 'sequence',
                    'conclusie': 'inference',
                    'woordenschat': 'vocabulary',
                };

                questionType = typeMapping[questionType] || questionType.toLowerCase().replace(/ /g, '_');

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
});
