// Leaderboard functions
import { eq, and, gte } from "drizzle-orm";
import { getDb } from "./connection";
import { exams, users } from "../../drizzle/schema";

export async function getLeaderboard(period: 'week' | 'month' | 'all', limit: number = 10) {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    let dateThreshold: Date | null = null;

    if (period === 'week') {
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    try {
        const completedExams = await db
            .select({
                user_id: exams.user_id,
                userName: users.name,
                score_percentage: exams.score_percentage,
                completed_at: exams.completed_at,
            })
            .from(exams)
            .innerJoin(users, eq(users.id, exams.user_id))
            .where(
                and(
                    eq(exams.status, "completed"),
                    dateThreshold ? gte(exams.completed_at, dateThreshold) : undefined
                )
            );

        const userStats = new Map<number, { name: string; scores: number[] }>();

        for (const exam of completedExams) {
            if (!exam.score_percentage) continue;

            if (!userStats.has(exam.user_id)) {
                userStats.set(exam.user_id, { name: exam.userName || "Anonymous", scores: [] });
            }
            userStats.get(exam.user_id)!.scores.push(exam.score_percentage);
        }

        const leaderboard = Array.from(userStats.entries())
            .map(([userId, data]) => ({
                userId,
                name: data.name,
                totalExams: data.scores.length,
                averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
            }))
            .sort((a, b) => b.averageScore - a.averageScore || b.totalExams - a.totalExams)
            .slice(0, limit);

        return leaderboard;
    } catch (error) {
        console.error("[Database] Failed to get leaderboard:", error);
        return [];
    }
}
