// User Vocabulary functions (SRS - Spaced Repetition System)
import { eq, and, desc, sql, count } from "drizzle-orm";
import { getDb } from "./connection";
import { userVocabulary, vocabulary, users, InsertUserVocabulary } from "../../drizzle/schema";

// Import getUserById from users module to avoid circular dependency issue
async function getUserByIdInternal(id: number) {
    const db = await getDb();
    if (!db) return undefined;
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
}

export async function updateUserVocabularyCount(user_id: number) {
    const db = await getDb();
    if (!db) return;

    const result = await db
        .select({ count: count() })
        .from(userVocabulary)
        .where(eq(userVocabulary.user_id, user_id));

    const vocabularyCount = result[0]?.count || 0;

    await db
        .update(users)
        .set({
            total_vocabulary_learned: Number(vocabularyCount),
            updated_at: new Date()
        })
        .where(eq(users.id, user_id));
}

export async function updateUserStreak(user_id: number) {
    const db = await getDb();
    if (!db) return;

    const user = await getUserByIdInternal(user_id);
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lastActivity = user.last_activity_date ? new Date(user.last_activity_date) : null;
    const lastActivityDay = lastActivity ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate()) : null;

    let newStreak = user.current_streak || 0;
    let newLongestStreak = user.longest_streak || 0;

    if (!lastActivityDay) {
        newStreak = 1;
    } else {
        const daysDiff = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            return;
        } else if (daysDiff === 1) {
            newStreak = (user.current_streak || 0) + 1;
        } else {
            newStreak = 1;
        }
    }

    if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
    }

    await db
        .update(users)
        .set({
            current_streak: newStreak,
            longest_streak: newLongestStreak,
            last_activity_date: now,
            updated_at: now
        })
        .where(eq(users.id, user_id));
}

export async function createUserVocabulary(userVocab: InsertUserVocabulary) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const easeFactor = userVocab.ease_factor ? userVocab.ease_factor / 1000 : 2.5;
    const nextReviewDate = userVocab.next_review_at instanceof Date
        ? userVocab.next_review_at.toISOString()
        : userVocab.next_review_at;

    const result = await db.execute(sql`
    INSERT INTO "user_vocabulary" (
      "user_id", "vocabulary_id", "status", "correct_count", "incorrect_count",
      "next_review_at", "ease_factor", "interval", "repetitions"
    ) VALUES (
      ${userVocab.user_id}, ${userVocab.vocabulary_id}, ${userVocab.status}, 
      ${userVocab.correct_count}, ${userVocab.incorrect_count},
      ${nextReviewDate}, ${easeFactor}, 
      ${userVocab.interval}, ${userVocab.repetitions}
    )
  `);

    await updateUserVocabularyCount(userVocab.user_id);
    await updateUserStreak(userVocab.user_id);

    return result;
}

export async function getUserVocabularyByVocabId(user_id: number, vocabulary_id: number) {
    const db = await getDb();
    if (!db) return null;

    const result = await db
        .select()
        .from(userVocabulary)
        .where(
            and(
                eq(userVocabulary.user_id, user_id),
                eq(userVocabulary.vocabulary_id, vocabulary_id)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function getUserVocabularyCount(user_id: number) {
    const db = await getDb();
    if (!db) return 0;

    const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(userVocabulary)
        .where(eq(userVocabulary.user_id, user_id));

    return Number(result[0]?.count || 0);
}

export async function getUserVocabularyProgress(user_id: number) {
    const db = await getDb();
    if (!db) return [];

    const results = await db
        .select({
            id: userVocabulary.id,
            user_id: userVocabulary.user_id,
            vocabulary_id: userVocabulary.vocabulary_id,
            status: userVocabulary.status,
            correct_count: userVocabulary.correct_count,
            incorrect_count: userVocabulary.incorrect_count,
            last_reviewed_at: userVocabulary.last_reviewed_at,
            next_review_at: userVocabulary.next_review_at,
            ease_factor: userVocabulary.ease_factor,
            interval: userVocabulary.interval,
            repetitions: userVocabulary.repetitions,
            created_at: userVocabulary.created_at,
            updated_at: userVocabulary.updated_at,
            dutchWord: vocabulary.dutchWord,
            arabicTranslation: vocabulary.arabicTranslation,
            englishTranslation: vocabulary.englishTranslation,
            turkishTranslation: vocabulary.turkishTranslation,
            dutchDefinition: vocabulary.dutchDefinition,
            audioUrl: vocabulary.audioUrl,
            audioKey: vocabulary.audioKey,
        })
        .from(userVocabulary)
        .innerJoin(vocabulary, eq(userVocabulary.vocabulary_id, vocabulary.id))
        .where(eq(userVocabulary.user_id, user_id))
        .orderBy(desc(userVocabulary.created_at));

    return results.map((r) => ({
        ...r,
        userId: r.user_id,
        vocabularyId: r.vocabulary_id,
        correctCount: r.correct_count,
        incorrectCount: r.incorrect_count,
        lastReviewedAt: r.last_reviewed_at,
        nextReviewAt: r.next_review_at,
        easeFactor: r.ease_factor,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        word: r.dutchWord,
        dutch_word: r.dutchWord,
        arabic_translation: r.arabicTranslation,
        english_translation: r.englishTranslation,
        turkish_translation: r.turkishTranslation,
        definition: r.dutchDefinition,
        dutch_definition: r.dutchDefinition,
        audio_url: r.audioUrl,
        audio_key: r.audioKey,
    }));
}

export async function updateUserVocabularyProgress(
    user_id: number,
    vocabulary_id: number,
    updates: {
        status?: "new" | "learning" | "mastered";
        correctCount?: number;
        incorrectCount?: number;
        lastReviewedAt?: Date;
        next_review_at?: Date;
    }
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(userVocabulary)
        .set({ ...updates, updated_at: new Date() })
        .where(
            and(
                eq(userVocabulary.user_id, user_id),
                eq(userVocabulary.vocabulary_id, vocabulary_id)
            )
        );
}

export async function getUserVocabularyById(userVocabId: number) {
    const db = await getDb();
    if (!db) return null;

    const result = await db
        .select({
            id: userVocabulary.id,
            user_id: userVocabulary.user_id,
            vocabulary_id: userVocabulary.vocabulary_id,
            status: userVocabulary.status,
            correct_count: userVocabulary.correct_count,
            incorrect_count: userVocabulary.incorrect_count,
            last_reviewed_at: userVocabulary.last_reviewed_at,
            next_review_at: userVocabulary.next_review_at,
            ease_factor: userVocabulary.ease_factor,
            interval: userVocabulary.interval,
            repetitions: userVocabulary.repetitions,
            created_at: userVocabulary.created_at,
            updated_at: userVocabulary.updated_at,
        })
        .from(userVocabulary)
        .where(eq(userVocabulary.id, userVocabId))
        .limit(1);

    return result[0] || null;
}

export async function updateUserVocabularySRS(
    userVocabId: number,
    data: {
        ease_factor: number;
        interval: number;
        repetitions: number;
        next_review_at: Date;
        last_reviewed_at: Date;
        correct_count: number;
        incorrect_count: number;
        status: "new" | "learning" | "mastered";
    }
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(userVocabulary)
        .set({
            ease_factor: data.ease_factor,
            interval: data.interval,
            repetitions: data.repetitions,
            next_review_at: data.next_review_at,
            last_reviewed_at: data.last_reviewed_at,
            correct_count: data.correct_count,
            incorrect_count: data.incorrect_count,
            status: data.status,
            updated_at: new Date(),
        })
        .where(eq(userVocabulary.id, userVocabId));
}

export async function deleteUserVocabulary(userVocabId: number) {
    const db = await getDb();
    if (!db) return;

    await db.delete(userVocabulary).where(eq(userVocabulary.id, userVocabId));
}

export async function updateUserVocabularyStatus(
    userVocabId: number,
    status: "new" | "learning" | "mastered" | "archived"
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(userVocabulary)
        .set({ status, updated_at: new Date() })
        .where(eq(userVocabulary.id, userVocabId));
}
