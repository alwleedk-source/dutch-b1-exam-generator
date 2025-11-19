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
    } else if (user.open_id === ENV.ownerOpenId) {
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

  return await db.select().from(users).orderBy(desc(users.created_at));
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
      time_spent_seconds: exams.time_spent_seconds,
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

  const result = await db.insert(vocabulary).values(vocab);
  return result;
}

export async function getVocabularyByTextId(text_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(vocabulary)
    .where(eq(vocabulary.text_id, text_id));
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

export async function createUserVocabulary(userVocab: InsertUserVocabulary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userVocabulary).values(userVocab);
  return result;
}

export async function getUserVocabularyProgress(user_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userVocabulary)
    .where(eq(userVocabulary.user_id, user_id))
    .orderBy(desc(userVocabulary.last_reviewed_at));
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

  return result[0];
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
    .set(data)
    .where(eq(userVocabulary.id, userVocabId));
}


export async function getAllTexts() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(texts);
}
