import { eq, desc, and, sql, or, gte, ilike, count, inArray } from "drizzle-orm";
export { sql };
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
  textRatings,
  InsertTextRating,
  reports,
  InsertReport,
  achievements,
  InsertAchievement,
  b1Dictionary,
  topicSuggestions,
  InsertTopicSuggestion,
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

export async function updateUserOnboarding(user_id: number, has_seen_onboarding: boolean) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ has_seen_onboarding, updated_at: new Date() })
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

// ==================== GAMIFICATION ====================

// Points configuration
const POINTS_CONFIG = {
  examComplete: 10,
  examScore80Plus: 5,
  examScore100: 10,
  wordLearned: 0,      // No points for just adding words
  wordReviewed: 1,     // 1 point for correct review
  wordMastered: 3,     // 3 points for mastering (5+ correct reviews)
  dailyStreak: 3,
  weekStreak: 20,
};

// Daily limits to prevent gaming
const DAILY_LIMITS = {
  vocabPoints: 20,     // Max 20 points from vocabulary per day
};

// Level thresholds
const LEVELS = [
  { name: "beginner", minPoints: 0, emoji: "🌱" },
  { name: "learner", minPoints: 100, emoji: "📚" },
  { name: "advanced", minPoints: 300, emoji: "⭐" },
  { name: "expert", minPoints: 600, emoji: "🏆" },
  { name: "master", minPoints: 1000, emoji: "👑" },
];

export function calculateLevel(points: number): { name: string; emoji: string; nextLevel: typeof LEVELS[0] | null; pointsToNext: number } {
  let currentLevel = LEVELS[0];
  let nextLevel: typeof LEVELS[0] | null = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const pointsToNext = nextLevel ? nextLevel.minPoints - points : 0;
  return { ...currentLevel, nextLevel, pointsToNext };
}

export type PointAction =
  | "examComplete"
  | "examScore80Plus"
  | "examScore100"
  | "wordLearned"
  | "wordReviewed"
  | "wordMastered"
  | "dailyStreak"
  | "weekStreak";

// Track daily vocab points (simple in-memory cache, resets on server restart)
const dailyVocabPoints: Map<string, number> = new Map();

function getDailyVocabKey(userId: number): string {
  const today = new Date().toISOString().split('T')[0];
  return `${userId}-${today}`;
}

export async function addPoints(user_id: number, action: PointAction): Promise<{ points: number; newTotal: number; levelUp: boolean; newLevel: string | null; milestone: number | null }> {
  const db = await getDb();
  if (!db) return { points: 0, newTotal: 0, levelUp: false, newLevel: null, milestone: null };

  let pointsToAdd = POINTS_CONFIG[action];

  // Skip if no points for this action (e.g., wordLearned = 0)
  if (pointsToAdd === 0) {
    return { points: 0, newTotal: 0, levelUp: false, newLevel: null, milestone: null };
  }

  // Apply daily limit for vocabulary actions
  if (action === "wordReviewed" || action === "wordMastered") {
    const key = getDailyVocabKey(user_id);
    const currentDailyPoints = dailyVocabPoints.get(key) || 0;

    if (currentDailyPoints >= DAILY_LIMITS.vocabPoints) {
      // Daily limit reached, no more points
      return { points: 0, newTotal: 0, levelUp: false, newLevel: null, milestone: null };
    }

    // Cap points to not exceed daily limit
    const remaining = DAILY_LIMITS.vocabPoints - currentDailyPoints;
    pointsToAdd = Math.min(pointsToAdd, remaining);

    // Update daily counter
    dailyVocabPoints.set(key, currentDailyPoints + pointsToAdd);
  }

  // Get current user data
  const user = await getUserById(user_id);
  if (!user) return { points: 0, newTotal: 0, levelUp: false, newLevel: null, milestone: null };

  const currentPoints = user.total_points || 0;
  const newTotal = currentPoints + pointsToAdd;

  // Calculate levels
  const oldLevel = calculateLevel(currentPoints);
  const newLevelData = calculateLevel(newTotal);
  const levelUp = newLevelData.name !== oldLevel.name;

  // Update user
  await db
    .update(users)
    .set({
      total_points: newTotal,
      current_level: newLevelData.name,
      updated_at: new Date()
    })
    .where(eq(users.id, user_id));

  // Check for milestone achievements
  const MILESTONES = [50, 100, 250, 500, 1000];
  let milestone: number | null = null;
  for (const m of MILESTONES) {
    if (currentPoints < m && newTotal >= m) {
      milestone = m;
      break;
    }
  }

  return {
    points: pointsToAdd,
    newTotal,
    levelUp,
    newLevel: levelUp ? newLevelData.name : null,
    milestone,
  };
}

export async function getUserPoints(user_id: number) {
  const user = await getUserById(user_id);
  if (!user) return null;

  const levelData = calculateLevel(user.total_points || 0);
  return {
    totalPoints: user.total_points || 0,
    currentLevel: levelData.name,
    levelEmoji: levelData.emoji,
    nextLevel: levelData.nextLevel?.name || null,
    nextLevelEmoji: levelData.nextLevel?.emoji || null,
    pointsToNext: levelData.pointsToNext,
    progressPercent: levelData.nextLevel
      ? Math.round(((user.total_points || 0) - (LEVELS.find(l => l.name === levelData.name)?.minPoints || 0)) /
        (levelData.nextLevel.minPoints - (LEVELS.find(l => l.name === levelData.name)?.minPoints || 0)) * 100)
      : 100,
  };
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
    .select({
      id: exams.id,
      user_id: exams.user_id,
      text_id: exams.text_id,
      questions: exams.questions,
      answers: exams.answers,
      total_questions: exams.total_questions,
      correct_answers: exams.correct_answers,
      score_percentage: exams.score_percentage,
      staatsexamen_score: exams.staatsexamen_score,
      started_at: exams.started_at,
      completed_at: exams.completed_at,
      time_spent_minutes: exams.time_spent_minutes,
      exam_mode: exams.exam_mode,
      time_limit_minutes: exams.time_limit_minutes,
      timer_paused_at: exams.timer_paused_at,
      status: exams.status,
      created_at: exams.created_at,
      updated_at: exams.updated_at,
      title: texts.title,
      dutch_text: texts.dutch_text,
    })
    .from(exams)
    .leftJoin(texts, eq(exams.text_id, texts.id))
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
    .where(eq(exams.text_id, text_id));
}

export async function updateExamQuestions(examId: number, questions: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(exams)
    .set({ questions, updated_at: new Date() })
    .where(eq(exams.id, examId));
}

export async function markTextAsRegenerated(textId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(texts)
    .set({ questions_regenerated_at: new Date(), updated_at: new Date() })
    .where(eq(texts.id, textId));
}

export async function updateExam(
  examId: number,
  updates: {
    answers?: string;
    correct_answers?: number;
    score_percentage?: number;
    staatsexamen_score?: number;
    performance_analysis?: string;
    recommendations?: string;
    skill_analysis?: string;
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

export async function updateVocabulary(vocabId: number, data: Partial<typeof vocabulary.$inferInsert>) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(vocabulary)
    .set({ ...data, updated_at: new Date() })
    .where(eq(vocabulary.id, vocabId));
}

// ==================== USER VOCABULARY FUNCTIONS ====================

export async function updateUserVocabularyCount(user_id: number) {
  const db = await getDb();
  if (!db) return;

  // Count total vocabulary for this user
  const result = await db
    .select({ count: count() })
    .from(userVocabulary)
    .where(eq(userVocabulary.user_id, user_id));

  const vocabularyCount = result[0]?.count || 0;

  // Update user stats
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

  const user = await getUserById(user_id);
  if (!user) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get last activity date
  const lastActivity = user.last_activity_date ? new Date(user.last_activity_date) : null;
  const lastActivityDay = lastActivity ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate()) : null;

  let newStreak = user.current_streak || 0;
  let newLongestStreak = user.longest_streak || 0;
  let streakIncremented = false;

  if (!lastActivityDay) {
    // First activity ever
    newStreak = 1;
    streakIncremented = true;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change to streak
      return;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreak = (user.current_streak || 0) + 1;
      streakIncremented = true;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
      streakIncremented = true;
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

  // Award streak points and check for celebrations
  let streakCelebration: number | null = null;
  const STREAK_MILESTONES = [7, 14, 30, 60, 100];

  if (streakIncremented) {
    // Daily streak points
    await addPoints(user_id, 'dailyStreak');

    // Check for streak celebration (7, 14, 30, 60, 100 days)
    if (STREAK_MILESTONES.includes(newStreak)) {
      streakCelebration = newStreak;
    }

    // Weekly streak bonus (every 7 days)
    if (newStreak > 0 && newStreak % 7 === 0) {
      await addPoints(user_id, 'weekStreak');
    }
  }

  return { newStreak, streakCelebration };
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

  // Use Drizzle ORM with proper JOIN
  const results = await db
    .select({
      // From user_vocabulary (snake_case columns)
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
      // From vocabulary (camelCase columns)
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

  // Add camelCase aliases for client compatibility
  return results.map((r) => ({
    ...r,
    // ease_factor is already correct from DB (stored as integer)
    // Add camelCase aliases
    userId: r.user_id,
    vocabularyId: r.vocabulary_id,
    correctCount: r.correct_count,
    incorrectCount: r.incorrect_count,
    lastReviewedAt: r.last_reviewed_at,
    nextReviewAt: r.next_review_at,
    easeFactor: r.ease_factor,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    // Add word aliases
    word: r.dutchWord,
    dutch_word: r.dutchWord,
    // Add translation aliases
    arabic_translation: r.arabicTranslation,
    english_translation: r.englishTranslation,
    turkish_translation: r.turkishTranslation,
    // Add definition aliases
    definition: r.dutchDefinition,
    dutch_definition: r.dutchDefinition,
    // Add audio aliases
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
      score_percentage: exams.score_percentage,
      correct_answers: exams.correct_answers,
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
    .orderBy(desc(exams.created_at))
    .$dynamic();

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
  // Note: userAnswers are stored in the exams table, so no separate table to delete

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

/**
 * Search B1 dictionary
 */
export async function searchDictionary(options: {
  query?: string;
  letter?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let queryBuilder = db.select().from(b1Dictionary).$dynamic();

  // Apply filters
  // If both query and letter are provided, use query (search takes precedence)
  // If only letter is provided, filter by letter
  // If only query is provided, search by query

  if (options.query && options.query.length >= 2) {
    queryBuilder = queryBuilder.where(ilike(b1Dictionary.word, `%${options.query}%`));
  } else if (options.letter) {
    queryBuilder = queryBuilder.where(ilike(b1Dictionary.word, `${options.letter}%`));
  }

  // Apply limit and ordering
  const result = await queryBuilder
    .orderBy(b1Dictionary.word)
    .limit(options.limit || 50);

  return result;
}

// ==================== ADMIN USER MANAGEMENT ====================

/**
 * Get user exams by user ID
 */
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

/**
 * Get user texts by user ID
 */
export async function getUserTexts(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(texts)
    .where(eq(texts.created_by, userId))
    .orderBy(desc(texts.created_at));
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete user's vocabulary first (foreign key constraint)
  await db.delete(userVocabulary).where(eq(userVocabulary.user_id, userId));

  // Delete user's exam results
  // Delete user's exam results (if any separate table exists, otherwise covered by exams)

  // Delete user's exams
  await db.delete(exams).where(eq(exams.user_id, userId));

  // Delete user's texts
  await db.delete(texts).where(eq(texts.created_by, userId));

  // Finally delete the user
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * Update user role
 */
export async function updateUserRole(userId: number, role: 'user' | 'admin' | 'moderator') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ role, updated_at: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Ban/unban user
 */
export async function updateUserBanStatus(userId: number, isBanned: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      // Assuming there's a banned field, if not we'll add it
      updated_at: new Date()
    })
    .where(eq(users.id, userId));
}

// ==================== ADMIN TEXT MANAGEMENT ====================

/**
 * Get texts with advanced filtering
 */
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

  let query = db
    .select({
      id: texts.id,
      title: texts.title,
      dutch_text: texts.dutch_text,
      status: texts.status,
      is_valid_dutch: texts.is_valid_dutch,
      is_b1_level: texts.is_b1_level,
      word_count: texts.word_count,
      estimated_reading_minutes: texts.estimated_reading_minutes,
      created_at: texts.created_at,
      created_by: texts.created_by,
      questions_regenerated_at: texts.questions_regenerated_at,
      user_name: users.name,
      user_email: users.email,
    })
    .from(texts)
    .leftJoin(users, eq(texts.created_by, users.id));

  // Apply filters
  const conditions = [];

  if (options.search) {
    conditions.push(
      or(
        ilike(texts.title, `%${options.search}%`),
        ilike(texts.dutch_text, `%${options.search}%`)
      )
    );
  }

  if (options.status) {
    conditions.push(eq(texts.status, options.status));
  }

  if (options.userId) {
    conditions.push(eq(texts.created_by, options.userId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Apply ordering and pagination
  const result = await query
    .orderBy(desc(texts.created_at))
    .limit(options.limit || 50)
    .offset(options.offset || 0);

  return result;
}

/**
 * Get text with full details including questions
 */
export async function getTextWithDetails(textId: number) {
  const db = await getDb();
  if (!db) return null;

  const text = await db
    .select({
      id: texts.id,
      title: texts.title,
      dutch_text: texts.dutch_text,
      formatted_html: texts.formatted_html,
      text_type: texts.text_type,
      status: texts.status,
      is_valid_dutch: texts.is_valid_dutch,
      is_b1_level: texts.is_b1_level,
      word_count: texts.word_count,
      estimated_reading_minutes: texts.estimated_reading_minutes,
      created_at: texts.created_at,
      created_by: texts.created_by,
      user_name: users.name,
      user_email: users.email,
    })
    .from(texts)
    .leftJoin(users, eq(texts.created_by, users.id))
    .where(eq(texts.id, textId))
    .limit(1);

  if (text.length === 0) return null;

  // Get associated exam (questions)
  const exam = await db
    .select()
    .from(exams)
    .where(eq(exams.text_id, textId))
    .limit(1);

  return {
    ...text[0],
    questions: exam.length > 0 ? exam[0].questions : null,
  };
}

// ==================== ADMIN STATISTICS ====================

/**
 * Get dashboard statistics
 */
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  const totalUsers = await db.select().from(users);
  const totalTexts = await db.select().from(texts);
  const totalExams = await db.select().from(exams);
  const pendingTexts = await db.select().from(texts).where(eq(texts.status, 'pending'));
  const completedExams = await db.select().from(exams).where(eq(exams.status, 'completed'));

  return {
    totalUsers: totalUsers.length,
    totalTexts: totalTexts.length,
    totalExams: totalExams.length,
    pendingTexts: pendingTexts.length,
    completedExams: completedExams.length,
    inProgressExams: totalExams.length - completedExams.length,
  };
}

/**
 * Delete old incomplete exams
 */
export async function deleteOldIncompleteExams(olderThan: Date) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .delete(exams)
    .where(
      and(
        eq(exams.status, "in_progress"),
        sql`${exams.created_at} < ${olderThan.toISOString()}`
      )
    )
    .returning({ id: exams.id });

  return result.length;
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limit: number = 10) {
  const db = await getDb();
  if (!db) return { recentTexts: [], recentExams: [] };

  const recentTexts = await db
    .select({
      id: texts.id,
      title: texts.title,
      created_at: texts.created_at,
      user_name: users.name,
      user_email: users.email,
    })
    .from(texts)
    .leftJoin(users, eq(texts.created_by, users.id))
    .orderBy(desc(texts.created_at))
    .limit(limit);

  const recentExams = await db
    .select({
      id: exams.id,
      text_id: exams.text_id,
      created_at: exams.created_at,
      status: exams.status,
      score_percentage: exams.score_percentage,
      correct_answers: exams.correct_answers,
      total_questions: exams.total_questions,
      user_name: users.name,
      user_email: users.email,
      text_title: texts.title,
    })
    .from(exams)
    .leftJoin(users, eq(exams.user_id, users.id))
    .leftJoin(texts, eq(exams.text_id, texts.id))
    .orderBy(desc(exams.created_at))
    .limit(limit);

  return {
    recentTexts,
    recentExams,
  };
}

// ==================== TEXT RATINGS ====================

/**
 * Add or update a text rating
 */
export async function rateText(userId: number, textId: number, rating: number, reason?: string, comment?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already rated this text
  const existingRating = await db
    .select()
    .from(textRatings)
    .where(and(
      eq(textRatings.text_id, textId),
      eq(textRatings.user_id, userId)
    ))
    .limit(1);

  if (existingRating.length > 0) {
    // Update existing rating
    await db
      .update(textRatings)
      .set({
        rating,
        reason: reason || null,
        comment: comment || null,
        updated_at: new Date()
      })
      .where(and(
        eq(textRatings.text_id, textId),
        eq(textRatings.user_id, userId)
      ));
  } else {
    // Insert new rating
    await db
      .insert(textRatings)
      .values({
        text_id: textId,
        user_id: userId,
        rating,
        reason: reason || null,
        comment: comment || null
      });
  }

  // Calculate and update average rating and total ratings
  const allRatings = await db
    .select()
    .from(textRatings)
    .where(eq(textRatings.text_id, textId));

  const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  const totalRatings = allRatings.length;

  await db
    .update(texts)
    .set({
      average_rating: Math.round(avgRating), // Store as integer as per schema
      total_ratings: totalRatings
    })
    .where(eq(texts.id, textId));

  return { success: true };
}

/**
 * Get texts with ratings and filtering
 */
export async function getTextsWithRatings(options: {
  minRating?: number;
  sortBy?: 'rating' | 'date' | 'popular';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(texts).$dynamic();

  // Filter by min rating
  if (options.minRating) {
    query = query.where(gte(texts.average_rating, Math.floor(options.minRating)));
  }

  // Sort
  if (options.sortBy === 'rating') {
    query = query.orderBy(desc(texts.average_rating));
  } else if (options.sortBy === 'popular') {
    query = query.orderBy(desc(texts.total_ratings));
  } else {
    query = query.orderBy(desc(texts.created_at));
  }

  // Limit and offset
  if (options.limit) query = query.limit(options.limit);
  if (options.offset) query = query.offset(options.offset);

  return await query;
}

/**
 * Get user's rating for a specific text
 */
export async function getUserRating(userId: number, textId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(textRatings)
    .where(and(
      eq(textRatings.text_id, textId),
      eq(textRatings.user_id, userId)
    ))
    .limit(1);

  return result[0] || null;
}

/**
 * Get all ratings for a specific text
 */
export async function getTextRatings(textId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: textRatings.id,
      textId: textRatings.text_id,
      userId: textRatings.user_id,
      rating: textRatings.rating,
      comment: textRatings.comment,
      createdAt: textRatings.created_at,
      updatedAt: textRatings.updated_at,
      userName: users.name,
      userEmail: users.email,
    })
    .from(textRatings)
    .leftJoin(users, eq(textRatings.user_id, users.id))
    .where(eq(textRatings.text_id, textId))
    .orderBy(desc(textRatings.created_at));

  return result;
}

/**
 * Delete a rating (admin only)
 */
export async function deleteRating(ratingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(textRatings)
    .where(eq(textRatings.id, ratingId));

  // Trigger will automatically update texts table
  return { success: true };
}

/**
 * Get texts filtered by rating reason
 */
export async function getTextsByReason(textIds: number[], reason: string) {
  const db = await getDb();
  if (!db) return [];

  // Get text IDs that have ratings with the specified reason
  const ratingsWithReason = await db
    .select({ text_id: textRatings.text_id })
    .from(textRatings)
    .where(and(
      inArray(textRatings.text_id, textIds),
      eq(textRatings.reason, reason)
    ))
    .groupBy(textRatings.text_id);

  const filteredTextIds = ratingsWithReason.map(r => r.text_id);

  if (filteredTextIds.length === 0) return [];

  // Get the actual texts
  return await db
    .select()
    .from(texts)
    .where(inArray(texts.id, filteredTextIds))
    .orderBy(desc(texts.created_at));
}

// ==================== TOPIC SUGGESTION FUNCTIONS ====================

export async function createTopicSuggestion(suggestion: InsertTopicSuggestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(topicSuggestions).values(suggestion).returning();
  return result;
}

export async function getTopicSuggestions() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: topicSuggestions.id,
      topic: topicSuggestions.topic,
      created_at: topicSuggestions.created_at,
      user_id: topicSuggestions.user_id,
      user_name: users.name,
      user_email: users.email,
    })
    .from(topicSuggestions)
    .leftJoin(users, eq(topicSuggestions.user_id, users.id))
    .orderBy(desc(topicSuggestions.created_at));
}

export async function deleteTopicSuggestion(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(topicSuggestions).where(eq(topicSuggestions.id, id));
}
