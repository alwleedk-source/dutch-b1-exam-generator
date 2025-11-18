import { eq, desc, and, sql, or, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER FUNCTIONS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPreferences(userId: number, preferredLanguage: "nl" | "ar" | "en" | "tr") {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ preferredLanguage, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserStats(
  userId: number,
  stats: {
    totalExamsCompleted?: number;
    totalVocabularyLearned?: number;
    totalTimeSpentMinutes?: number;
    currentStreak?: number;
    longestStreak?: number;
    lastActivityDate?: Date;
  }
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ ...stats, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ==================== TEXT FUNCTIONS ====================

export async function createText(text: InsertText) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(texts).values(text);
  return result;
}

export async function getTextById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(texts).where(eq(texts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTextsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(texts)
    .where(eq(texts.createdBy, userId))
    .orderBy(desc(texts.createdAt));
}

export async function getApprovedTexts() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(texts)
    .where(eq(texts.status, "approved"))
    .orderBy(desc(texts.createdAt));
}

export async function getPendingTexts() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(texts)
    .where(eq(texts.status, "pending"))
    .orderBy(desc(texts.createdAt));
}

export async function updateTextStatus(
  textId: number,
  status: "pending" | "approved" | "rejected",
  moderatedBy: number,
  moderationNote?: string
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(texts)
    .set({
      status,
      moderatedBy,
      moderationNote,
      moderatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(texts.id, textId));
}

export async function updateTextValidation(
  textId: number,
  validation: {
    isValidDutch: boolean;
    detectedLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    levelConfidence?: number;
    isB1Level: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(texts)
    .set({ ...validation, updatedAt: new Date() })
    .where(eq(texts.id, textId));
}

// ==================== TRANSLATION FUNCTIONS ====================

export async function createTranslation(translation: InsertTranslation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(translations).values(translation);
  return result;
}

export async function getTranslationByTextId(textId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(translations)
    .where(eq(translations.textId, textId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTranslation(
  textId: number,
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
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(translations.textId, textId));
}

// ==================== EXAM FUNCTIONS ====================

export async function createExam(exam: InsertExam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(exams).values(exam);
  return result;
}

export async function getExamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(exams).where(eq(exams.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getExamsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(exams)
    .where(eq(exams.userId, userId))
    .orderBy(desc(exams.createdAt));
}

export async function getCompletedExamsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(exams)
    .where(and(eq(exams.userId, userId), eq(exams.status, "completed")))
    .orderBy(desc(exams.completedAt));
}

export async function updateExam(
  examId: number,
  updates: {
    answers?: string;
    correctAnswers?: number;
    scorePercentage?: number;
    completedAt?: Date;
    timeSpentMinutes?: number;
    status?: "in_progress" | "completed" | "abandoned";
  }
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(exams)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(exams.id, examId));
}

export async function getUserExamStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      totalExams: sql<number>`COUNT(*)`,
      completedExams: sql<number>`SUM(CASE WHEN ${exams.status} = 'completed' THEN 1 ELSE 0 END)`,
      averageScore: sql<number>`AVG(CASE WHEN ${exams.status} = 'completed' THEN ${exams.scorePercentage} ELSE NULL END)`,
      totalTimeMinutes: sql<number>`SUM(CASE WHEN ${exams.status} = 'completed' THEN ${exams.timeSpentMinutes} ELSE 0 END)`,
    })
    .from(exams)
    .where(eq(exams.userId, userId));

  return result.length > 0 ? result[0] : null;
}

// ==================== VOCABULARY FUNCTIONS ====================

export async function createVocabulary(vocab: InsertVocabulary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vocabulary).values(vocab);
  return result;
}

export async function getVocabularyByTextId(textId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(vocabulary)
    .where(eq(vocabulary.textId, textId));
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
    .set({ audioUrl, audioKey, updatedAt: new Date() })
    .where(eq(vocabulary.id, vocabId));
}

// ==================== USER VOCABULARY FUNCTIONS ====================

export async function createUserVocabulary(userVocab: InsertUserVocabulary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userVocabulary).values(userVocab);
  return result;
}

export async function getUserVocabularyProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userVocabulary)
    .where(eq(userVocabulary.userId, userId))
    .orderBy(desc(userVocabulary.lastReviewedAt));
}

export async function updateUserVocabularyProgress(
  userId: number,
  vocabularyId: number,
  updates: {
    status?: "new" | "learning" | "mastered";
    correctCount?: number;
    incorrectCount?: number;
    lastReviewedAt?: Date;
    nextReviewAt?: Date;
  }
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(userVocabulary)
    .set({ ...updates, updatedAt: new Date() })
    .where(
      and(
        eq(userVocabulary.userId, userId),
        eq(userVocabulary.vocabularyId, vocabularyId)
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

export async function getReportsByTextId(textId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reports)
    .where(eq(reports.textId, textId))
    .orderBy(desc(reports.createdAt));
}

export async function getPendingReports() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reports)
    .where(eq(reports.status, "pending"))
    .orderBy(desc(reports.createdAt));
}

export async function updateReportStatus(
  reportId: number,
  status: "pending" | "reviewed" | "resolved" | "dismissed",
  reviewedBy: number,
  reviewNote?: string
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(reports)
    .set({
      status,
      reviewedBy,
      reviewNote,
      reviewedAt: new Date(),
      updatedAt: new Date(),
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

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.createdAt));
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
    updatedAt: new Date(),
  };

  if (isCompleted) {
    updates.completedAt = new Date();
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
        userId: exams.userId,
        userName: users.name,
        scorePercentage: exams.scorePercentage,
        completedAt: exams.completedAt,
      })
      .from(exams)
      .innerJoin(users, eq(users.id, exams.userId))
      .where(
        and(
          eq(exams.status, "completed"),
          dateThreshold ? gte(exams.completedAt, dateThreshold) : undefined
        )
      );

    // Group by user and calculate stats
    const userStats = new Map<number, { name: string; scores: number[] }>();
    
    for (const exam of completedExams) {
      if (!exam.scorePercentage) continue;
      
      if (!userStats.has(exam.userId)) {
        userStats.set(exam.userId, { name: exam.userName || "Anonymous", scores: [] });
      }
      userStats.get(exam.userId)!.scores.push(exam.scorePercentage);
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
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReviewAt: Date;
    lastReviewedAt: Date;
    correctCount: number;
    incorrectCount: number;
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
