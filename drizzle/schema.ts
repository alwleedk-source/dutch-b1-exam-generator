import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // User preferences
  preferredLanguage: mysqlEnum("preferredLanguage", ["nl", "ar", "en", "tr"]).default("nl").notNull(),
  
  // Statistics
  totalExamsCompleted: int("totalExamsCompleted").default(0).notNull(),
  totalVocabularyLearned: int("totalVocabularyLearned").default(0).notNull(),
  totalTimeSpentMinutes: int("totalTimeSpentMinutes").default(0).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Dutch B1 texts for exam generation
 */
export const texts = mysqlTable("texts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Text content
  dutchText: text("dutchText").notNull(),
  title: varchar("title", { length: 255 }),
  
  // Metadata
  wordCount: int("wordCount").notNull(),
  estimatedReadingMinutes: int("estimatedReadingMinutes").notNull(),
  minHashSignature: text("minHashSignature"), // JSON string of MinHash signature for duplicate detection
  
  // Validation status
  isValidDutch: boolean("isValidDutch").default(true).notNull(),
  detectedLevel: mysqlEnum("detectedLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]),
  levelConfidence: int("levelConfidence"), // 0-100
  isB1Level: boolean("isB1Level").default(true).notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  
  // Source tracking
  createdBy: int("createdBy").notNull(),
  source: mysqlEnum("source", ["paste", "upload", "scan", "admin"]).default("paste").notNull(),
  
  // Admin moderation
  moderatedBy: int("moderatedBy"),
  moderationNote: text("moderationNote"),
  moderatedAt: timestamp("moderatedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  createdByIdx: index("createdBy_idx").on(table.createdBy),
  statusIdx: index("status_idx").on(table.status),
}));

export type Text = typeof texts.$inferSelect;
export type InsertText = typeof texts.$inferInsert;

/**
 * Cached translations for texts
 */
export const translations = mysqlTable("translations", {
  id: int("id").autoincrement().primaryKey(),
  textId: int("textId").notNull(),
  
  // Translations (Dutch text translated to other languages)
  arabicTranslation: text("arabicTranslation"),
  englishTranslation: text("englishTranslation"),
  turkishTranslation: text("turkishTranslation"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  textIdIdx: index("textId_idx").on(table.textId),
}));

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = typeof translations.$inferInsert;

/**
 * User exam attempts
 */
export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  textId: int("textId").notNull(),
  
  // Exam data
  questions: text("questions").notNull(), // JSON array of questions
  answers: text("answers"), // JSON array of user answers
  
  // Scoring
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers"),
  scorePercentage: int("scorePercentage"),
  
  // Timing
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  timeSpentMinutes: int("timeSpentMinutes"),
  
  // Status
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  textIdIdx: index("textId_idx").on(table.textId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

/**
 * Vocabulary extracted from texts
 */
export const vocabulary = mysqlTable("vocabulary", {
  id: int("id").autoincrement().primaryKey(),
  textId: int("textId").notNull(),
  
  // Word data
  dutchWord: varchar("dutchWord", { length: 255 }).notNull(),
  
  // Translations
  arabicTranslation: varchar("arabicTranslation", { length: 255 }),
  englishTranslation: varchar("englishTranslation", { length: 255 }),
  turkishTranslation: varchar("turkishTranslation", { length: 255 }),
  
  // Audio
  audioUrl: text("audioUrl"), // Cloudflare R2 URL
  audioKey: varchar("audioKey", { length: 255 }), // R2 key for reference
  
  // Context
  exampleSentence: text("exampleSentence"),
  
  // Metadata
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]),
  frequency: int("frequency").default(1).notNull(), // How many times it appears
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  textIdIdx: index("textId_idx").on(table.textId),
  dutchWordIdx: index("dutchWord_idx").on(table.dutchWord),
}));

export type Vocabulary = typeof vocabulary.$inferSelect;
export type InsertVocabulary = typeof vocabulary.$inferInsert;

/**
 * User vocabulary learning progress
 */
export const userVocabulary = mysqlTable("userVocabulary", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  vocabularyId: int("vocabularyId").notNull(),
  
  // Learning progress
  status: mysqlEnum("status", ["new", "learning", "mastered"]).default("new").notNull(),
  correctCount: int("correctCount").default(0).notNull(),
  incorrectCount: int("incorrectCount").default(0).notNull(),
  
  // Spaced repetition (SM-2 algorithm)
  lastReviewedAt: timestamp("lastReviewedAt"),
  nextReviewAt: timestamp("nextReviewAt").defaultNow().notNull(),
  easeFactor: int("easeFactor").default(2500).notNull(), // Stored as integer (2.5 * 1000)
  interval: int("interval").default(0).notNull(), // Days until next review
  repetitions: int("repetitions").default(0).notNull(), // Number of successful reviews
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  vocabularyIdIdx: index("vocabularyId_idx").on(table.vocabularyId),
}));

export type UserVocabulary = typeof userVocabulary.$inferSelect;
export type InsertUserVocabulary = typeof userVocabulary.$inferInsert;

/**
 * User reports for texts (level issues or content issues)
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  textId: int("textId").notNull(),
  reportedBy: int("reportedBy").notNull(),
  
  // Report type (2 simple options)
  reportType: mysqlEnum("reportType", ["level_issue", "content_issue"]).notNull(),
  
  // Level issue details
  levelIssueType: mysqlEnum("levelIssueType", ["too_easy", "too_hard"]),
  
  // Content issue details
  contentIssueType: mysqlEnum("contentIssueType", ["inappropriate", "spam", "not_dutch", "other"]),
  
  // Additional details
  details: text("details"),
  
  // Status
  status: mysqlEnum("status", ["pending", "reviewed", "resolved", "dismissed"]).default("pending").notNull(),
  
  // Admin response
  reviewedBy: int("reviewedBy"),
  reviewNote: text("reviewNote"),
  reviewedAt: timestamp("reviewedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  textIdIdx: index("textId_idx").on(table.textId),
  reportedByIdx: index("reportedBy_idx").on(table.reportedBy),
  statusIdx: index("status_idx").on(table.status),
}));

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * User achievements and badges
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Achievement type
  achievementType: varchar("achievementType", { length: 100 }).notNull(),
  achievementName: varchar("achievementName", { length: 255 }).notNull(),
  achievementDescription: text("achievementDescription"),
  
  // Achievement data
  iconUrl: text("iconUrl"),
  
  // Progress
  currentProgress: int("currentProgress").default(0).notNull(),
  targetProgress: int("targetProgress").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
