// Admin-related database functions
import { eq, and, desc, sql, ilike, or, gte, count } from "drizzle-orm";
import { getDb } from "./connection";
import { users, exams, texts, userVocabulary, b1Dictionary, textRatings } from "../../drizzle/schema";

// ==================== ADMIN USER MANAGEMENT ====================

export async function getUserExams(userId: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select({
            id: exams.id,
            text_id: exams.text_id,
            status: exams.status,
            score_percentage: exams.score_percentage,
            correct_answers: exams.correct_answers,
            total_questions: exams.total_questions,
            time_spent_minutes: exams.time_spent_minutes,
            created_at: exams.created_at,
            text_title: texts.title,
        })
        .from(exams)
        .leftJoin(texts, eq(exams.text_id, texts.id))
        .where(eq(exams.user_id, userId))
        .orderBy(desc(exams.created_at));
}

export async function getUserTexts(userId: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(texts)
        .where(eq(texts.created_by, userId))
        .orderBy(desc(texts.created_at));
}

export async function deleteUser(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(userVocabulary).where(eq(userVocabulary.user_id, userId));
    await db.delete(exams).where(eq(exams.user_id, userId));
    await db.delete(texts).where(eq(texts.created_by, userId));
    await db.delete(users).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: 'user' | 'admin' | 'moderator') {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
        .update(users)
        .set({ role, updated_at: new Date() })
        .where(eq(users.id, userId));
}

export async function updateUserBanStatus(userId: number, isBanned: boolean) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
        .update(users)
        .set({ updated_at: new Date() })
        .where(eq(users.id, userId));
}

// ==================== ADMIN TEXT MANAGEMENT ====================

export async function getTextsFiltered(options: {
    search?: string;
    status?: 'pending' | 'approved' | 'rejected';
    level?: string;
    userId?: number;
    limit?: number;
    offset?: number;
}) {
    const db = await getDb();
    if (!db) return [];

    const { search, status, level, userId, limit = 50, offset = 0 } = options;

    let query = db
        .select({
            id: texts.id,
            title: texts.title,
            dutch_text: texts.dutch_text,
            status: texts.status,
            created_by: texts.created_by,
            created_at: texts.created_at,
            word_count: texts.word_count,
            detected_level: texts.detected_level,
            userName: users.name,
            userEmail: users.email,
        })
        .from(texts)
        .leftJoin(users, eq(texts.created_by, users.id))
        .orderBy(desc(texts.created_at))
        .limit(limit)
        .offset(offset);

    const conditions = [];

    if (status) {
        conditions.push(eq(texts.status, status));
    }

    if (userId) {
        conditions.push(eq(texts.created_by, userId));
    }

    if (search) {
        conditions.push(
            or(
                ilike(texts.title, `%${search}%`),
                ilike(texts.dutch_text, `%${search}%`),
                ilike(users.name, `%${search}%`)
            )
        );
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
    }

    return await query;
}

export async function getTextWithDetails(textId: number) {
    const db = await getDb();
    if (!db) return null;

    const textResult = await db
        .select()
        .from(texts)
        .where(eq(texts.id, textId))
        .limit(1);

    if (textResult.length === 0) return null;

    const examResult = await db
        .select()
        .from(exams)
        .where(eq(exams.text_id, textId))
        .limit(1);

    return {
        ...textResult[0],
        questions: examResult.length > 0 ? examResult[0].questions : null,
    };
}

// ==================== ADMIN STATISTICS ====================

export async function getAdminStats() {
    const db = await getDb();
    if (!db) return null;

    const [userCount] = await db.select({ count: count() }).from(users);
    const [textCount] = await db.select({ count: count() }).from(texts);
    const [examCount] = await db.select({ count: count() }).from(exams);
    const [pendingTextCount] = await db.select({ count: count() }).from(texts).where(eq(texts.status, 'pending'));

    return {
        totalUsers: Number(userCount?.count || 0),
        totalTexts: Number(textCount?.count || 0),
        totalExams: Number(examCount?.count || 0),
        pendingTexts: Number(pendingTextCount?.count || 0),
    };
}

export async function getRecentActivity(limit: number = 10) {
    const db = await getDb();
    if (!db) return [];

    const recentExams = await db
        .select({
            type: sql<string>`'exam'`,
            id: exams.id,
            user_id: exams.user_id,
            userName: users.name,
            score_percentage: exams.score_percentage,
            correct_answers: exams.correct_answers,
            total_questions: exams.total_questions,
            status: exams.status,
            created_at: exams.created_at,
            textTitle: texts.title,
        })
        .from(exams)
        .leftJoin(users, eq(exams.user_id, users.id))
        .leftJoin(texts, eq(exams.text_id, texts.id))
        .orderBy(desc(exams.created_at))
        .limit(limit);

    return recentExams;
}

// ==================== DICTIONARY FUNCTIONS ====================

export async function getDictionaryWord(word: string) {
    const db = await getDb();
    if (!db) return null;

    const result = await db
        .select()
        .from(b1Dictionary)
        .where(ilike(b1Dictionary.word, word))
        .limit(1);

    return result[0] || null;
}

export async function searchDictionary(options: {
    query?: string;
    letter?: string;
    limit?: number;
}) {
    const db = await getDb();
    if (!db) return [];

    const { query, letter, limit = 50 } = options;

    let dbQuery = db.select().from(b1Dictionary).limit(limit);

    if (query) {
        dbQuery = dbQuery.where(ilike(b1Dictionary.word, `%${query}%`)) as typeof dbQuery;
    } else if (letter) {
        dbQuery = dbQuery.where(ilike(b1Dictionary.word, `${letter}%`)) as typeof dbQuery;
    }

    return await dbQuery;
}

// ==================== TEXT RATINGS ====================

export async function rateText(userId: number, textId: number, rating: number, reason?: string, comment?: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existing = await db
        .select()
        .from(textRatings)
        .where(and(eq(textRatings.user_id, userId), eq(textRatings.text_id, textId)))
        .limit(1);

    if (existing.length > 0) {
        await db
            .update(textRatings)
            .set({ rating, reason, comment, updated_at: new Date() })
            .where(eq(textRatings.id, existing[0].id));
        return { updated: true };
    } else {
        await db.insert(textRatings).values({
            user_id: userId,
            text_id: textId,
            rating,
            reason,
            comment,
        });
        return { created: true };
    }
}

export async function getUserRating(userId: number, textId: number) {
    const db = await getDb();
    if (!db) return null;

    const result = await db
        .select()
        .from(textRatings)
        .where(and(eq(textRatings.user_id, userId), eq(textRatings.text_id, textId)))
        .limit(1);

    return result[0] || null;
}

export async function getTextRatings(textId: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select({
            id: textRatings.id,
            rating: textRatings.rating,
            reason: textRatings.reason,
            comment: textRatings.comment,
            created_at: textRatings.created_at,
            userName: users.name,
        })
        .from(textRatings)
        .leftJoin(users, eq(textRatings.user_id, users.id))
        .where(eq(textRatings.text_id, textId))
        .orderBy(desc(textRatings.created_at));
}

export async function deleteRating(ratingId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(textRatings).where(eq(textRatings.id, ratingId));
}
