import { boolean, index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  open_id: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  login_method: varchar("login_method", { length: 64 }),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  
  // User preferences
  preferred_language: varchar("preferred_language", { length: 50 }).default("nl").notNull(),
  
  // Statistics
  total_exams_completed: integer("total_exams_completed").default(0).notNull(),
  total_vocabulary_learned: integer("total_vocabulary_learned").default(0).notNull(),
  total_time_spent_minutes: integer("total_time_spent_minutes").default(0).notNull(),
  current_streak: integer("current_streak").default(0).notNull(),
  longest_streak: integer("longest_streak").default(0).notNull(),
  last_activity_date: timestamp("last_activity_date"),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  last_signed_in: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Dutch B1 texts for exam generation
 */
export const texts = pgTable("texts", {
  id: serial("id").primaryKey(),
  
  // Text content
  dutchText: text("dutchText").notNull(),
  title: varchar("title", { length: 255 }),
  
  // Metadata
  wordCount: integer("wordCount").notNull(),
  estimatedReadingMinutes: integer("estimatedReadingMinutes").notNull(),
  min_hash_signature: text("min_hash_signature"), // JSON string of MinHash signature for duplicate detection
  
  // Validation status
  isValidDutch: boolean("isValidDutch").default(true).notNull(),
  detectedLevel: varchar("detectedLevel", { length: 50 }),
  levelConfidence: integer("levelConfidence"), // 0-100
  isB1Level: boolean("isB1Level").default(true).notNull(),
  
  // Status
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  
  // Source tracking
  createdBy: integer("createdBy").notNull(),
  source: varchar("source", { length: 50 }).default("paste").notNull(),
  
  // Admin moderation
  moderatedBy: integer("moderatedBy"),
  moderationNote: text("moderationNote"),
  moderatedAt: timestamp("moderatedAt"),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  createdByIdx: index("createdBy_idx").on(table.createdBy),
  statusIdx: index("status_idx").on(table.status),
}));

export type Text = typeof texts.$inferSelect;
export type InsertText = typeof texts.$inferInsert;

/**
 * Cached translations for texts
 */
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  text_id: integer("text_id").notNull(),
  
  // Translations (Dutch text translated to other languages)
  arabicTranslation: text("arabicTranslation"),
  englishTranslation: text("englishTranslation"),
  turkishTranslation: text("turkishTranslation"),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  text_idIdx: index("text_id_idx").on(table.text_id),
}));

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = typeof translations.$inferInsert;

/**
 * User exam attempts
 */
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  text_id: integer("text_id").notNull(),
  
  // Exam data
  questions: text("questions").notNull(), // JSON array of questions
  answers: text("answers"), // JSON array of user answers
  
  // Scoring
  totalQuestions: integer("totalQuestions").notNull(),
  correctAnswers: integer("correctAnswers"),
  scorePercentage: integer("scorePercentage"),
  
  // Timing
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  time_spent_minutes: integer("time_spent_minutes"),
  
  // Status
  status: varchar("status", { length: 50 }).default("in_progress").notNull(),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  user_idIdx: index("user_id_idx").on(table.user_id),
  text_idIdx: index("text_id_idx").on(table.text_id),
  statusIdx: index("status_idx").on(table.status),
}));

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

/**
 * Vocabulary extracted from texts
 */
export const vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  text_id: integer("text_id").notNull(),
  
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
  difficulty: varchar("difficulty", { length: 50 }),
  frequency: integer("frequency").default(1).notNull(), // How many times it appears
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  text_idIdx: index("text_id_idx").on(table.text_id),
  dutchWordIdx: index("dutchWord_idx").on(table.dutchWord),
}));

export type Vocabulary = typeof vocabulary.$inferSelect;
export type InsertVocabulary = typeof vocabulary.$inferInsert;

/**
 * User vocabulary learning progress
 */
export const userVocabulary = pgTable("userVocabulary", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  vocabulary_id: integer("vocabulary_id").notNull(),
  
  // Learning progress
  status: varchar("status", { length: 50 }).default("new").notNull(),
  correctCount: integer("correctCount").default(0).notNull(),
  incorrectCount: integer("incorrectCount").default(0).notNull(),
  
  // Spaced repetition (SM-2 algorithm)
  last_reviewed_at: timestamp("last_reviewed_at"),
  next_review_at: timestamp("next_review_at").defaultNow().notNull(),
  ease_factor: integer("ease_factor").default(2500).notNull(), // Stored as integer (2.5 * 1000)
  interval: integer("interval").default(0).notNull(), // Days until next review
  repetitions: integer("repetitions").default(0).notNull(), // Number of successful reviews
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  user_idIdx: index("user_id_idx").on(table.user_id),
  vocabulary_idIdx: index("vocabulary_id_idx").on(table.vocabulary_id),
}));

export type UserVocabulary = typeof userVocabulary.$inferSelect;
export type InsertUserVocabulary = typeof userVocabulary.$inferInsert;

/**
 * User reports for texts (level issues or content issues)
 */
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  text_id: integer("text_id").notNull(),
  reported_by: integer("reported_by").notNull(),
  
  // Report type (2 simple options)
  report_type: varchar("report_type", { length: 50 }).notNull(),
  
  // Level issue details
  level_issue_type: varchar("level_issue_type", { length: 50 }),
  
  // Content issue details
  content_issue_type: varchar("content_issue_type", { length: 50 }),
  
  // Additional details
  details: text("details"),
  
  // Status
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  
  // Admin response
  reviewed_by: integer("reviewed_by"),
  review_note: text("review_note"),
  reviewed_at: timestamp("reviewed_at"),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  text_idIdx: index("text_id_idx").on(table.text_id),
  reported_byIdx: index("reported_by_idx").on(table.reported_by),
  statusIdx: index("status_idx").on(table.status),
}));

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * User achievements and badges
 */
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  
  // Achievement type
  achievementType: varchar("achievementType", { length: 100 }).notNull(),
  achievementName: varchar("achievementName", { length: 255 }).notNull(),
  achievementDescription: text("achievementDescription"),
  
  // Achievement data
  iconUrl: text("iconUrl"),
  
  // Progress
  currentProgress: integer("currentProgress").default(0).notNull(),
  targetProgress: integer("targetProgress").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  
  completedAt: timestamp("completedAt"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  user_idIdx: index("user_id_idx").on(table.user_id),
}));

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
