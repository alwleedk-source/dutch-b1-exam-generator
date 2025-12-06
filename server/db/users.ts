// User-related database functions
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { users, exams, texts, InsertUser } from "../../drizzle/schema";
import { ENV } from "../_core/env";

export async function upsertUser(user: InsertUser): Promise<void> {
    if (!user.open_id) {
        throw new Error("User openId is required for upsert");
    }

    const db = await getDb();
    if (!db) {
        console.warn("[Database] Cannot upsert user: database not available");
        return;
    }

    try {
        const values: InsertUser = {
            open_id: user.open_id,
        };
        const updateSet: Record<string, unknown> = {};

        const textFields = ["name", "email", "login_method"] as const;
        type TextField = (typeof textFields)[number];

        const assignNullable = (field: TextField) => {
            const value = user[field];
            if (value === undefined) return;
            const normalized = value ?? null;
            values[field] = normalized;
            updateSet[field] = normalized;
        };

        textFields.forEach(assignNullable);

        if (user.last_signed_in !== undefined) {
            values.last_signed_in = user.last_signed_in;
            updateSet.last_signed_in = user.last_signed_in;
        }
        if (user.role !== undefined) {
            values.role = user.role;
            updateSet.role = user.role;
        } else if (user.open_id === ENV.ownerOpenId || user.email === 'waleed.qodami@gmail.com') {
            values.role = "admin";
            updateSet.role = "admin";
        }

        if (!values.last_signed_in) {
            values.last_signed_in = new Date();
        }

        if (Object.keys(updateSet).length === 0) {
            updateSet.last_signed_in = new Date();
        }

        await db.insert(users).values(values).onConflictDoUpdate({
            target: users.open_id,
            set: updateSet,
        });
    } catch (error) {
        console.error("[Database] Failed to upsert user:", error);
        throw error;
    }
}

export async function getUserByOpenId(open_id: string) {
    const db = await getDb();
    if (!db) {
        console.warn("[Database] Cannot get user: database not available");
        return undefined;
    }

    const result = await db
        .select()
        .from(users)
        .where(eq(users.open_id, open_id))
        .limit(1);

    return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
    const db = await getDb();
    if (!db) return undefined;

    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPreferences(user_id: number, preferred_language: "nl" | "ar" | "en" | "tr") {
    const db = await getDb();
    if (!db) return;

    await db
        .update(users)
        .set({ preferred_language, updated_at: new Date() })
        .where(eq(users.id, user_id));
}

export async function updateUserStats(
    user_id: number,
    stats: {
        total_exams_completed?: number;
        total_vocabulary_learned?: number;
        total_time_spent_minutes?: number;
        current_streak?: number;
        longest_streak?: number;
        last_activity_date?: Date;
    }
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(users)
        .set({ ...stats, updated_at: new Date() })
        .where(eq(users.id, user_id));
}

export async function getAllUsers() {
    const db = await getDb();
    if (!db) return [];

    const allUsers = await db.select().from(users).orderBy(desc(users.created_at));

    // Add comprehensive stats for each user
    const usersWithStats = await Promise.all(
        allUsers.map(async (user) => {
            // Count completed exams
            const completedExams = await db
                .select()
                .from(exams)
                .where(and(eq(exams.user_id, user.id), eq(exams.status, 'completed')));

            // Count created texts
            const createdTexts = await db
                .select()
                .from(texts)
                .where(eq(texts.created_by, user.id));

            // Calculate average score
            const examsWithScores = completedExams.filter(e => e.score_percentage !== null);
            const avgScore = examsWithScores.length > 0
                ? Math.round(
                    examsWithScores.reduce((sum, e) => sum + e.score_percentage!, 0) / examsWithScores.length
                )
                : 0;

            return {
                ...user,
                totalExamsCompleted: completedExams.length,
                totalTextsCreated: createdTexts.length,
                averageScore: avgScore,
            };
        })
    );

    return usersWithStats;
}
