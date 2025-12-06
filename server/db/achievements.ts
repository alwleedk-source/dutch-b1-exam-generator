// Achievement-related database functions
import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { achievements, InsertAchievement } from "../../drizzle/schema";

export async function createAchievement(achievement: InsertAchievement) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(achievements).values(achievement);
    return result;
}

export async function getUserAchievements(user_id: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(achievements)
        .where(eq(achievements.user_id, user_id))
        .orderBy(desc(achievements.created_at));
}

export async function updateAchievementProgress(
    achievementId: number,
    currentProgress: number,
    isCompleted: boolean
) {
    const db = await getDb();
    if (!db) return;

    const updates: any = {
        currentProgress,
        isCompleted,
        updated_at: new Date(),
    };

    if (isCompleted) {
        updates.completed_at = new Date();
    }

    await db
        .update(achievements)
        .set(updates)
        .where(eq(achievements.id, achievementId));
}
