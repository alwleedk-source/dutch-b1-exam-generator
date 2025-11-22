import { eq, desc, and, sql, or, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  texts,
  InsertText,
  translations,
  InsertTranslation,
  exams,
  InsertExam,
  vocabulary,
  InsertVocabulary,
  textVocabulary,
  InsertTextVocabulary,
  userVocabulary,
  InsertUserVocabulary,
  reports,
  InsertReport,
  achievements,
  InsertAchievement,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client, { casing: "snake_case" });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER FUNCTIONS ====================

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
  
  // Add totalExamsCompleted for each user
  const usersWithStats = await Promise.all(
    allUsers.map(async (user) => {
      const completedExams = await db
        .select()
        .from(exams)
        .where(and(eq(exams.user_id, user.id), eq(exams.status, 'completed')));
      
      return {
        ...user,
        totalExamsCompleted: completedExams.length,
      };
    })
  );
  
  return usersWithStats;
}

// ==================== TEXT FUNCTIONS ====================

export async function createText(text: InsertText) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(texts).values(text).returning();
  return result;
}

export async function checkDuplicateText(minHashSignature: number[], userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const minHashSignatureJson = JSON.stringify(minHashSignature);
  
  // Check if a text with the same MinHash signature exists for this user
  const result = await db
    .select()
    .from(texts)
    .where(
      and(
        eq(texts.min_hash_signature, minHashSignatureJson),
        eq(texts.created_by, userId)
      )
    )
    .limit(1);
  
  return result.length > 0;
}

export async function getTextById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(texts).where(eq(texts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTextsByUser(user_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(texts)
    .where(eq(texts.created_by, user_id))
    .orderBy(desc(texts.created_at));
}

export async function getUserTextsCreatedAfter(user_id: number, date: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(texts)
    .where(and(eq(texts.created_by, user_id), gte(texts.created_at, date)))
    .orderBy(desc(texts.created_at));
}

export async function getApprovedTexts() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(texts)
    .where(eq(texts.status, "approved"))
    .orderBy(desc(texts.created_at));
}

export async function getPendingTexts() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(texts)
    .where(eq(texts.status, "pending"))
    .orderBy(desc(texts.created_at));
}

export async function updateTextStatus(
  text_id: number,
  status: "pending" | "approved" | "rejected",
  moderated_by: number,
  moderation_note?: string
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(texts)
    .set({
      status,
      moderated_by,
      moderation_note,
      moderated_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(texts.id, text_id));
}

export async function updateTextValidation(
  text_id: number,
  validation: {
    is_valid_dutch: boolean;
    detectedLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    levelConfidence?: number;
    is_b1_level: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(texts)
    .set({ ...validation, updated_at: new Date() })
    .where(eq(texts.id, text_id));
}

// ==================== TRANSLATION FUNCTIONS ====================

export async function createTranslation(translation: InsertTranslation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(translations).values(translation);
  return result;
}

export async function getTranslationByTextId(text_id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(translations)
    .where(eq(translations.text_id, text_id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTranslation(
  text_id: number,
  updates: {
    arabicTranslation?: string;
    englishTranslation?: string;
    turkishTranslation?: string;
  }
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(translations)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(translations.text_id, text_id));
}

// ==================== EXAM FUNCTIONS ====================

export async function createExam(exam: InsertExam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(exams).values(exam).returning();
  return result;
}

export async function getExamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: exams.id,
      user_id: exams.user_id,
      text_id: exams.text_id,
      questions: exams.questions,
      answers: exams.answers,
      total_questions: exams.total_questions,
      correct_answers: exams.correct_answers,
      score_percentage: exams.score_percentage,
      started_at: exams.started_at,
      completed_at: exams.completed_at,
      time_spent_minutes: exams.time_spent_minutes,
      status: exams.status,
      created_at: exams.created_at,
      updated_at: exams.updated_at,
      title: texts.title,
      dutch_text: texts.dutch_text,
    })
    .from(exams)
    .leftJoin(texts, eq(exams.text_id, texts.id))
    .where(eq(exams.id, id))
    .limit(1);
    
  return result.length > 0 ? result[0] : undefined;
}

export async function getExamsByUser(user_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(exams)
    .where(eq(exams.user_id, user_id))
    .orderBy(desc(exams.created_at));
}

export async function getCompletedExamsByUser(user_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(exams)
    .where(and(eq(exams.user_id, user_id), eq(exams.status, "completed")))
    .orderBy(desc(exams.completed_at));
}

export async function getExamsByTextId(text_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(exams)
    .where(eq(exams.text_id, text_id))
    .limit(1); // Only need one exam to get the questions
}

export async function updateExam(
  examId: number,
  updates: {
    answers?: string;
    correct_answers?: number;
    score_percentage?: number;
    completed_at?: Date;
    time_spent_minutes?: number;
    status?: "in_progress" | "completed" | "abandoned";
  }
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(exams)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(exams.id, examId));
}

export async function getUserExamStats(user_id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      totalExams: sql<number>`COUNT(*)`,
      completedExams: sql<number>`SUM(CASE WHEN ${exams.status} = 'completed' THEN 1 ELSE 0 END)`,
      averageScore: sql<number>`AVG(CASE WHEN ${exams.status} = 'completed' THEN ${exams.score_percentage} ELSE NULL END)`,
      totalTimeMinutes: sql<number>`SUM(CASE WHEN ${exams.status} = 'completed' THEN ${exams.time_spent_minutes} ELSE 0 END)`,
    })
    .from(exams)
    .where(eq(exams.user_id, user_id));

  return result.length > 0 ? result[0] : null;
}

// ==================== VOCABULARY FUNCTIONS ====================

export async function createVocabulary(vocab: InsertVocabulary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vocabulary).values(vocab).returning();
  return result;
}

/**
 * Find vocabulary by word and context (for shared vocabulary system)
 */
export async function findVocabularyByWordAndContext(dutchWord: string, context: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(vocabulary)
    .where(and(
      eq(vocabulary.dutchWord, dutchWord),
      eq(vocabulary.context, context)
    ))
    .limit(1);

  return result[0] || null;
}

/**
 * Link vocabulary to text (many-to-many relationship)
 */
export async function linkVocabularyToText(textId: number, vocabularyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(textVocabulary).values({
    text_id: textId,
    vocabulary_id: vocabularyId,
  }).onConflictDoNothing();
  
  return result;
}

export async function getVocabularyByTextId(text_id: number) {
  const db = await getDb();
  if (!db) return [];

  // Use junction table for many-to-many relationship
  const result = await db
    .select({
      id: vocabulary.id,
      dutchWord: vocabulary.dutchWord,
      context: vocabulary.context,
      dutchDefinition: vocabulary.dutchDefinition,
      wordType: vocabulary.wordType,
      arabicTranslation: vocabulary.arabicTranslation,
      englishTranslation: vocabulary.englishTranslation,
      turkishTranslation: vocabulary.turkishTranslation,
      exampleSentence: vocabulary.exampleSentence,
      difficulty: vocabulary.difficulty,
      audioUrl: vocabulary.audioUrl,
      created_at: vocabulary.created_at,
    })
    .from(textVocabulary)
    .innerJoin(vocabulary, eq(textVocabulary.vocabulary_id, vocabulary.id))
    .where(eq(textVocabulary.text_id, text_id));

  return result;
}

export async function getVocabularyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(vocabulary)
    .where(eq(vocabulary.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateVocabularyAudio(vocabId: number, audioUrl: string, audioKey: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(vocabulary)
    .set({ audioUrl, audioKey, updated_at: new Date() })
    .where(eq(vocabulary.id, vocabId));
}

// ==================== USER VOCABULARY FUNCTIONS ====================

export async function updateUserVocabularyCount(user_id: number) {
  const db = await getDb();
  if (!db) return;

  // Count total vocabulary for this user
  const result = await db.execute(sql`
    SELECT COUNT(*) as count FROM "user_vocabulary" WHERE "user_id" = ${user_id}
  `);
  
  const count = result.rows[0]?.count || 0;
  
  // Update user stats
  await db
    .update(users)
    .set({ 
      total_vocabulary_learned: Number(count),
      updated_at: new Date() 
    })
    .where(eq(users.id, user_id));
}

export async function updateUserStreak(user_id: number) {
  const db = await getDb();
  if (!db) return;

  const user = await getUserById(user_id);
  if (!user) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Get last activity date
  const lastActivity = user.last_activity_date ? new Date(user.last_activity_date) : null;
  const lastActivityDay = lastActivity ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate()) : null;
  
  let newStreak = user.current_streak || 0;
  let newLongestStreak = user.longest_streak || 0;
  
  if (!lastActivityDay) {
    // First activity ever
    newStreak = 1;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day, no change to streak
      return;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreak = (user.current_streak || 0) + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
  }
  
  // Update longest streak if current is higher
  if (newStreak > newLongestStreak) {
    newLongestStreak = newStreak;
  }
  
  // Update user stats
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

  // Convert ease_factor from integer (2500) to decimal (2.5) for database
  const easeFactor = userVocab.ease_factor ? userVocab.ease_factor / 1000 : 2.5;
  
  // Convert next_review_at to ISO string if it's a Date
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
  
  // Update user's total vocabulary count
  await updateUserVocabularyCount(userVocab.user_id);
  
  // Update user's streak
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

export async function getUserVocabularyProgress(user_id: number) {
  const db = await getDb();
  if (!db) return [];

  // Use raw SQL to handle camelCase column names in database
  const results = await db.execute(sql`
    SELECT 
      uv.id,
      uv.user_id,
      uv.vocabulary_id,
      uv.status,
      uv.correct_count,
      uv.incorrect_count,
      uv.last_reviewed_at,
      uv.next_review_at,
      uv.ease_factor,
      uv.interval,
      uv.repetitions,
      uv.created_at,
      uv.updated_at,
      v."dutchWord" as dutch_word,
      v."arabicTranslation" as arabic_translation,
      v."englishTranslation" as english_translation,
      v."turkishTranslation" as turkish_translation,
      v."dutchDefinition" as dutch_definition,
      v."audioUrl" as audio_url,
      v."audioKey" as audio_key
    FROM user_vocabulary uv
    INNER JOIN vocabulary v ON uv.vocabulary_id = v.id
    WHERE uv.user_id = ${user_id}
    ORDER BY uv.created_at DESC
  `);

  // Convert ease_factor from decimal to integer for consistency
  // Return all translations, let client choose based on user preference
  return results.map((r: any) => ({
    ...r,
    ease_factor: r.ease_factor ? Math.round(parseFloat(r.ease_factor.toString()) * 1000) : 2500,
    // Add aliases for client compatibility
    word: r.dutch_word,
    // Keep all translations available
    arabicTranslation: r.arabic_translation,
    englishTranslation: r.english_translation,
    turkishTranslation: r.turkish_translation,
    dutchDefinition: r.dutch_definition,
    definition: r.dutch_definition,
    audioUrl: r.audio_url,
    audioKey: r.audio_key,
    // Add camelCase aliases for counts
    correctCount: r.correct_count,
    incorrectCount: r.incorrect_count,
    // Add camelCase aliases for dates
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    nextReviewAt: r.next_review_at,
    lastReviewedAt: r.last_reviewed_at,
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

// ==================== REPORT FUNCTIONS ====================

export async function createReport(report: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reports).values(report);
  return result;
}

export async function getReportsByTextId(text_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reports)
    .where(eq(reports.text_id, text_id))
    .orderBy(desc(reports.created_at));
}

export async function getPendingReports() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reports)
    .where(eq(reports.status, "pending"))
    .orderBy(desc(reports.created_at));
}

export async function updateReportStatus(
  reportId: number,
  status: "pending" | "reviewed" | "resolved" | "dismissed",
  reviewed_by: number,
  reviewNote?: string
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(reports)
    .set({
      status,
      reviewed_by: reviewed_by,
      review_note: reviewNote,
      reviewed_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(reports.id, reportId));
}

// ==================== ACHIEVEMENT FUNCTIONS ====================

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


// ==================== LEADERBOARD FUNCTIONS ====================

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
    // Get all completed exams with user info
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

    // Group by user and calculate stats
    const userStats = new Map<number, { name: string; scores: number[] }>();
    
    for (const exam of completedExams) {
      if (!exam.score_percentage) continue;
      
      if (!userStats.has(exam.user_id)) {
        userStats.set(exam.user_id, { name: exam.userName || "Anonymous", scores: [] });
      }
      userStats.get(exam.user_id)!.scores.push(exam.score_percentage);
    }

    // Calculate averages and format results
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


// ============================================================================
// Spaced Repetition System (SRS) Functions
// ============================================================================

export async function getUserVocabularyById(userVocabId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userVocabulary)
    .where(eq(userVocabulary.id, userVocabId))
    .limit(1);

  const record = result[0];
  if (!record) return undefined;

  // Convert ease_factor from decimal to integer for consistency
  return {
    ...record,
    ease_factor: record.ease_factor ? Math.round(parseFloat(record.ease_factor.toString()) * 1000) : 2500,
  };
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

  // Convert ease_factor from integer (2500) to decimal (2.5) for database
  const easeFactor = data.ease_factor / 1000;

  await db
    .update(userVocabulary)
    .set({ ...data, ease_factor: easeFactor })
    .where(eq(userVocabulary.id, userVocabId));
  
  // Get user_id from userVocabulary to update streak
  const userVocab = await getUserVocabularyById(userVocabId);
  if (userVocab) {
    await updateUserStreak(userVocab.user_id);
  }
}

export async function deleteUserVocabulary(userVocabId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(userVocabulary)
    .where(eq(userVocabulary.id, userVocabId));
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


export async function getAllTexts() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(texts);
}


// Admin functions for exam management
export async function getAllExams(options?: {
  search?: string;
  status?: "all" | "in_progress" | "completed";
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      id: exams.id,
      user_id: exams.user_id,
      text_id: exams.text_id,
      status: exams.status,
      score: exams.score,
      total_questions: exams.total_questions,
      created_at: exams.created_at,
      completed_at: exams.completed_at,
      // Join user info
      user_name: users.name,
      user_email: users.email,
      // Join text info
      text_title: texts.title,
      text_word_count: texts.word_count,
    })
    .from(exams)
    .leftJoin(users, eq(exams.user_id, users.id))
    .leftJoin(texts, eq(exams.text_id, texts.id))
    .orderBy(desc(exams.created_at));

  // Apply status filter
  if (options?.status && options.status !== "all") {
    query = query.where(eq(exams.status, options.status));
  }

  // Apply limit and offset
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.offset(options.offset);
  }

  const results = await query;

  // Apply search filter (client-side for simplicity)
  if (options?.search && options.search.trim()) {
    const searchLower = options.search.toLowerCase();
    return results.filter((exam: any) => 
      exam.text_title?.toLowerCase().includes(searchLower) ||
      exam.user_name?.toLowerCase().includes(searchLower) ||
      exam.user_email?.toLowerCase().includes(searchLower) ||
      exam.id.toString().includes(searchLower)
    );
  }

  return results;
}

export async function deleteExam(examId: number) {
  const db = await getDb();
  if (!db) return;

  // Delete related records first
  await db.delete(userAnswers).where(eq(userAnswers.exam_id, examId));
  
  // Delete the exam
  await db.delete(exams).where(eq(exams.id, examId));
}


export async function deleteText(textId: number) {
  const db = await getDb();
  if (!db) return;

  // Delete related records first
  await db.delete(exams).where(eq(exams.text_id, textId));
  await db.delete(reports).where(eq(reports.text_id, textId));
  
  // Delete the text
  await db.delete(texts).where(eq(texts.id, textId));
}

/**
 * Get a word from B1 dictionary
 */
export async function getDictionaryWord(word: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(b1Dictionary)
    .where(eq(b1Dictionary.word, word))
    .limit(1);

  return result[0] || null;
}

/**
 * Get vocabulary entry by Dutch word
 */
export async function getVocabularyByWord(word: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(vocabulary)
    .where(eq(vocabulary.dutchWord, word))
    .limit(1);

  return result[0] || null;
}
