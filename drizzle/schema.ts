import { boolean, index, integer, pgTable, serial, text, timestamp, unique, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
  preferred_language: varchar("preferred_language", { length: 50 }), // ar, en, tr, nl
  
  // Statistics
  total_exams_completed: integer("total_exams_completed").default(0).notNull(),
  total_vocabulary_learned: integer("total_vocabulary_learned").default(0).notNull(),
  total_time_spent_minutes: integer("total_time_spent_minutes").default(0).notNull(),
  current_streak: integer("current_streak").default(0).notNull(),
  longest_streak: integer("longest_streak").default(0).notNull(),
  last_activity_date: timestamp("last_activity_date"),
  
  // Forum ban status
  is_banned: boolean("is_banned").default(false).notNull(),
  banned_at: timestamp("banned_at"),
  banned_until: timestamp("banned_until"), // For temporary bans
  banned_by: integer("banned_by"),
  ban_reason: text("ban_reason"),
  
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
  dutch_text: text("dutch_text").notNull(),
  title: varchar("title", { length: 255 }),
  formatted_html: text("formatted_html"), // Auto-formatted HTML version
  text_type: varchar("text_type", { length: 50 }), // newspaper, article, instruction, list, plain
  
  // Metadata
  word_count: integer("word_count").notNull(),
  estimated_reading_minutes: integer("estimated_reading_minutes").notNull(),
  min_hash_signature: text("min_hash_signature"), // JSON string of MinHash signature for duplicate detection
  
  // Validation status
  is_valid_dutch: boolean("is_valid_dutch").default(true).notNull(),
  detected_level: varchar("detected_level", { length: 50 }),
  level_confidence: integer("level_confidence"), // 0-100
  is_b1_level: boolean("is_b1_level").default(true).notNull(),
  
  // Status
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  
  // Ratings
  average_rating: integer("average_rating").default(0),
  total_ratings: integer("total_ratings").default(0),
  
  // Source tracking
  created_by: integer("created_by").notNull(),
  source: varchar("source", { length: 50 }).default("paste").notNull(),
  
  // Admin moderation
  moderated_by: integer("moderated_by"),
  moderation_note: text("moderation_note"),
  moderated_at: timestamp("moderated_at"),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  texts_createdByIdx: index("texts_created_by_idx").on(table.created_by),
  texts_statusIdx: index("texts_status_idx").on(table.status),
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
  arabicTranslation: text("arabic_translation"),
  englishTranslation: text("english_translation"),
  turkishTranslation: text("turkish_translation"),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  translations_text_idIdx: index("translations_text_id_idx").on(table.text_id),
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
  total_questions: integer("total_questions").notNull(),
  correct_answers: integer("correct_answers"),
  score_percentage: integer("score_percentage"),
  staatsexamen_score: integer("staatsexamen_score"), // Official Staatsexamen score (276-740)
  // skill_analysis: text("skill_analysis"), // JSON object with performance per skill type - TEMPORARILY DISABLED until migration
  
  // Timing
  started_at: timestamp("started_at").defaultNow().notNull(),
  completed_at: timestamp("completed_at"),
  time_spent_minutes: integer("time_spent_minutes"),
  
  // Timer System
  exam_mode: varchar("exam_mode", { length: 20 }).default("practice"), // "practice" or "exam"
  time_limit_minutes: integer("time_limit_minutes"), // Time limit for exam mode
  timer_paused_at: timestamp("timer_paused_at"), // When timer was paused (practice mode only)
  
  // Status
  status: varchar("status", { length: 50 }).default("in_progress").notNull(),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  exams_user_idIdx: index("exams_user_id_idx").on(table.user_id),
  exams_text_idIdx: index("exams_text_id_idx").on(table.text_id),
  exams_statusIdx: index("exams_status_idx").on(table.status),
}));

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

/**
 * Vocabulary extracted from texts
 */
export const vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  text_id: integer("text_id"), // Optional now, kept for backwards compatibility
  
  // Word data
  dutchWord: varchar("dutchWord", { length: 255 }).notNull(),
  context: varchar("context", { length: 100 }), // Context for word meaning (e.g., "financial", "furniture")
  dutchDefinition: text("dutchDefinition"), // Dutch definition or synonym
  wordType: varchar("wordType", { length: 50 }), // noun, verb, adjective, adverb, other
  
  // Translations (context-aware)
  arabicTranslation: varchar("arabicTranslation", { length: 255 }),
  englishTranslation: varchar("englishTranslation", { length: 255 }),
  turkishTranslation: varchar("turkishTranslation", { length: 255 }),
  
  // Audio
  audioUrl: text("audioUrl"), // Cloudflare R2 URL
  audioKey: varchar("audioKey", { length: 255 }), // R2 key for reference
  
  // Context
  exampleSentence: text("exampleSentence"), // Example sentence from source text
  sourceTextId: integer("sourceTextId"), // First text that introduced this word+context
  
  // Metadata
  difficulty: varchar("difficulty", { length: 50 }),
  frequency: integer("frequency").default(1).notNull(), // How many times it appears
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  vocabulary_dutchWordIdx: index("vocabulary_dutchWord_idx").on(table.dutchWord),
  vocabulary_sourceTextIdIdx: index("vocabulary_source_text_id_idx").on(table.sourceTextId),
  // Unique constraint on (dutchWord, context) to ensure one entry per word+context
  vocabulary_word_context_unique: uniqueIndex("vocabulary_word_context_unique")
    .on(table.dutchWord, table.context)
    .where(sql`${table.context} IS NOT NULL`),
}));

export type Vocabulary = typeof vocabulary.$inferSelect;
export type InsertVocabulary = typeof vocabulary.$inferInsert;

/**
 * User vocabulary learning progress
 */
export const userVocabulary = pgTable("user_vocabulary", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  vocabulary_id: integer("vocabulary_id").notNull(),
  
  // Learning progress
  status: varchar("status", { length: 50 }).default("new").notNull(),
  correct_count: integer("correct_count").default(0).notNull(),
  incorrect_count: integer("incorrect_count").default(0).notNull(),
  
  // Spaced repetition (SM-2 algorithm)
  last_reviewed_at: timestamp("last_reviewed_at"),
  next_review_at: timestamp("next_review_at").defaultNow().notNull(),
  ease_factor: integer("ease_factor").default(2500).notNull(), // Stored as integer (2.5 * 1000)
  interval: integer("interval").default(0).notNull(), // Days until next review
  repetitions: integer("repetitions").default(0).notNull(), // Number of successful reviews
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  user_vocabulary_user_idIdx: index("user_vocabulary_user_id_idx").on(table.user_id),
  user_vocabulary_vocabulary_idIdx: index("user_vocabulary_vocabulary_id_idx").on(table.vocabulary_id),
}));

export type UserVocabulary = typeof userVocabulary.$inferSelect;
export type InsertUserVocabulary = typeof userVocabulary.$inferInsert;

/**
 * Junction table for many-to-many relationship between texts and vocabulary
 * Allows shared vocabulary across multiple texts
 */
export const textVocabulary = pgTable("text_vocabulary", {
  id: serial("id").primaryKey(),
  text_id: integer("text_id").notNull(),
  vocabulary_id: integer("vocabulary_id").notNull(),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  text_vocabulary_text_idIdx: index("text_vocabulary_text_id_idx").on(table.text_id),
  text_vocabulary_vocabulary_idIdx: index("text_vocabulary_vocabulary_id_idx").on(table.vocabulary_id),
  text_vocabulary_unique: uniqueIndex("text_vocabulary_unique").on(table.text_id, table.vocabulary_id),
}));

export type TextVocabulary = typeof textVocabulary.$inferSelect;
export type InsertTextVocabulary = typeof textVocabulary.$inferInsert;

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
  reports_text_idIdx: index("reports_text_id_idx").on(table.text_id),
  reports_reported_byIdx: index("reports_reported_by_idx").on(table.reported_by),
  reports_statusIdx: index("reports_status_idx").on(table.status),
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
  achievements_user_idIdx: index("achievements_user_id_idx").on(table.user_id),
}));

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * B1 Dictionary - Complete vocabulary list with translations
 */
export const b1Dictionary = pgTable("b1_dictionary", {
  id: serial("id").primaryKey(),
  
  // Dutch word
  word: varchar("word", { length: 255 }).notNull().unique(),
  
  // Translations
  translation_ar: text("translation_ar"), // Arabic
  translation_en: text("translation_en"), // English
  translation_tr: text("translation_tr"), // Turkish
  
  // Dutch definition
  definition_nl: text("definition_nl"), // Dutch explanation
  
  // Example sentence (optional)
  example_nl: text("example_nl"),
  
  // Metadata
  word_type: varchar("word_type", { length: 50 }), // noun, verb, adjective, etc.
  frequency_rank: integer("frequency_rank"), // 1-5000
  
  // Audio
  audio_url: text("audio_url"), // Cloudflare R2 URL
  audio_key: varchar("audio_key", { length: 255 }), // R2 key for reference
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  b1Dictionary_wordIdx: index("b1_dictionary_word_idx").on(table.word),
  b1Dictionary_frequencyRankIdx: index("b1_dictionary_frequency_rank_idx").on(table.frequency_rank),
}));

export type B1DictionaryEntry = typeof b1Dictionary.$inferSelect;
export type InsertB1DictionaryEntry = typeof b1Dictionary.$inferInsert;

/**
 * ============================================
 * FORUM SYSTEM
 * ============================================
 */

/**
 * Forum categories (language-based sections)
 */
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name_key: varchar("name_key", { length: 100 }).notNull(), // Translation key
  language: varchar("language", { length: 10 }).notNull(), // ar, en, tr, nl
  category_type: varchar("category_type", { length: 50 }).notNull(), // exams_tips, experiences, questions
  description_key: varchar("description_key", { length: 255 }), // Translation key
  icon: varchar("icon", { length: 50 }), // Icon name
  sort_order: integer("sort_order").default(0).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = typeof forumCategories.$inferInsert;

/**
 * Forum topics (threads)
 */
export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  category_id: integer("category_id").references(() => forumCategories.id, { onDelete: "cascade" }).notNull(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Rich text HTML
  
  // Status
  is_pinned: boolean("is_pinned").default(false).notNull(),
  is_locked: boolean("is_locked").default(false).notNull(),
  is_hidden: boolean("is_hidden").default(false).notNull(), // Hidden by moderators
  
  // Statistics
  view_count: integer("view_count").default(0).notNull(),
  reply_count: integer("reply_count").default(0).notNull(),
  upvote_count: integer("upvote_count").default(0).notNull(),
  downvote_count: integer("downvote_count").default(0).notNull(),
  
  // Last activity
  last_post_at: timestamp("last_post_at"),
  last_post_user_id: integer("last_post_user_id").references(() => users.id),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = typeof forumTopics.$inferInsert;

/**
 * Forum posts (replies)
 */
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  topic_id: integer("topic_id").references(() => forumTopics.id, { onDelete: "cascade" }).notNull(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  content: text("content").notNull(), // Rich text HTML
  
  // Status
  is_hidden: boolean("is_hidden").default(false).notNull(),
  
  // Statistics
  upvote_count: integer("upvote_count").default(0).notNull(),
  downvote_count: integer("downvote_count").default(0).notNull(),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

/**
 * Forum votes (upvote/downvote for topics and posts)
 */
export const forumVotes = pgTable("forum_votes", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Can vote on either topic or post
  topic_id: integer("topic_id").references(() => forumTopics.id, { onDelete: "cascade" }),
  post_id: integer("post_id").references(() => forumPosts.id, { onDelete: "cascade" }),
  
  vote_type: varchar("vote_type", { length: 10 }).notNull(), // upvote, downvote
  
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type ForumVote = typeof forumVotes.$inferSelect;
export type InsertForumVote = typeof forumVotes.$inferInsert;

/**
 * Forum notifications
 */
export const forumNotifications = pgTable("forum_notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  notification_type: varchar("notification_type", { length: 50 }).notNull(), // reply_to_topic, reply_to_post, mention, new_topic_in_language
  
  // References
  topic_id: integer("topic_id").references(() => forumTopics.id, { onDelete: "cascade" }),
  post_id: integer("post_id").references(() => forumPosts.id, { onDelete: "cascade" }),
  from_user_id: integer("from_user_id").references(() => users.id, { onDelete: "cascade" }),
  
  is_read: boolean("is_read").default(false).notNull(),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type ForumNotification = typeof forumNotifications.$inferSelect;
export type InsertForumNotification = typeof forumNotifications.$inferInsert;

/**
 * Unified notifications system
 * Supports all types of notifications: exams, vocabulary, achievements, forum, system
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Notification type and content
  type: varchar("type", { length: 50 }).notNull(), // new_public_exam, exam_rated, vocab_milestone, achievement_unlocked, etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  
  // References (nullable - not all notifications have references)
  exam_id: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  topic_id: integer("topic_id").references(() => forumTopics.id, { onDelete: "cascade" }),
  post_id: integer("post_id").references(() => forumPosts.id, { onDelete: "cascade" }),
  vocab_id: integer("vocab_id").references(() => vocabulary.id, { onDelete: "cascade" }),
  from_user_id: integer("from_user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Action URL for navigation
  action_url: varchar("action_url", { length: 255 }),
  
  // Status and priority
  is_read: boolean("is_read").default(false).notNull(),
  priority: varchar("priority", { length: 20 }).default("normal").notNull(), // low, normal, high, urgent
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  read_at: timestamp("read_at"),
  expires_at: timestamp("expires_at"), // For temporary notifications
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Forum moderators
 */
export const forumModerators = pgTable("forum_moderators", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  assigned_by: integer("assigned_by").references(() => users.id),
  assigned_at: timestamp("assigned_at").defaultNow().notNull(),
});

export type ForumModerator = typeof forumModerators.$inferSelect;
export type InsertForumModerator = typeof forumModerators.$inferInsert;

/**
 * Forum reports (spam/inappropriate content)
 */
export const forumReports = pgTable("forum_reports", {
  id: serial("id").primaryKey(),
  reporter_user_id: integer("reporter_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Can report topic or post
  topic_id: integer("topic_id").references(() => forumTopics.id, { onDelete: "cascade" }),
  post_id: integer("post_id").references(() => forumPosts.id, { onDelete: "cascade" }),
  
  reason: varchar("reason", { length: 50 }).notNull(), // spam, inappropriate, off_topic, duplicate, other
  details: text("details"),
  
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, resolved, dismissed
  resolved_by: integer("resolved_by").references(() => users.id),
  resolved_at: timestamp("resolved_at"),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type ForumReport = typeof forumReports.$inferSelect;
export type InsertForumReport = typeof forumReports.$inferInsert;

/**
 * Forum rate limits (spam protection)
 */
export const forumRateLimits = pgTable("forum_rate_limits", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  action_type: varchar("action_type", { length: 50 }).notNull(), // create_topic, create_post, vote
  action_count: integer("action_count").default(1).notNull(),
  
  window_start: timestamp("window_start").defaultNow().notNull(),
  window_end: timestamp("window_end").notNull(),
});

export type ForumRateLimit = typeof forumRateLimits.$inferSelect;
export type InsertForumRateLimit = typeof forumRateLimits.$inferInsert;

/**
 * Text ratings (user ratings for texts)
 */
export const textRatings = pgTable("text_ratings", {
  id: serial("id").primaryKey(),
  text_id: integer("text_id").references(() => texts.id, { onDelete: "cascade" }).notNull(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  rating: integer("rating").notNull(), // 1-5 stars
  reason: varchar("reason", { length: 100 }), // Rating reason (helpful, clear, good_level, etc.)
  comment: text("comment"), // Additional comment
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  textRatings_textIdIdx: index("idx_text_ratings_text_id").on(table.text_id),
  textRatings_userIdIdx: index("idx_text_ratings_user_id").on(table.user_id),
  textRatings_ratingIdx: index("idx_text_ratings_rating").on(table.rating),
  textRatings_textUserUnique: unique("text_ratings_text_id_user_id_key").on(table.text_id, table.user_id),
}));

export type TextRating = typeof textRatings.$inferSelect;
export type InsertTextRating = typeof textRatings.$inferInsert;

/**
 * User ban status (added to users table via migration)
 * Fields: is_banned, banned_at, banned_until, banned_by, ban_reason
 */

/**
 * Forum moderation actions (audit log)
 */
export const forumModerationActions = pgTable("forum_moderation_actions", {
  id: serial("id").primaryKey(),
  
  action_type: varchar("action_type", { length: 50 }).notNull(), // ban, unban, delete_post, delete_topic, warn, bulk_delete
  moderator_id: integer("moderator_id").references(() => users.id, { onDelete: "set null" }).notNull(),
  target_user_id: integer("target_user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Content references (if deleting specific content)
  topic_id: integer("topic_id").references(() => forumTopics.id, { onDelete: "set null" }),
  post_id: integer("post_id").references(() => forumPosts.id, { onDelete: "set null" }),
  
  reason: text("reason"),
  ban_duration: varchar("ban_duration", { length: 20 }), // 1day, 1week, 1month, permanent
  
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type ForumModerationAction = typeof forumModerationActions.$inferSelect;
export type InsertForumModerationAction = typeof forumModerationActions.$inferInsert;

/**
 * Forum warnings (moderator warnings to users)
 */
export const forumWarnings = pgTable("forum_warnings", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  moderator_id: integer("moderator_id").references(() => users.id, { onDelete: "set null" }).notNull(),
  reason: text("reason").notNull(),
  severity: varchar("severity", { length: 20 }).default("medium").notNull(), // low, medium, high
  topic_id: integer("topic_id").references(() => forumTopics.id, { onDelete: "set null" }),
  post_id: integer("post_id").references(() => forumPosts.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type ForumWarning = typeof forumWarnings.$inferSelect;
export type InsertForumWarning = typeof forumWarnings.$inferInsert;

/**
 * Forum moderator notes (internal notes for moderators)
 */
export const forumModeratorNotes = pgTable("forum_moderator_notes", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  moderator_id: integer("moderator_id").references(() => users.id, { onDelete: "set null" }).notNull(),
  note: text("note").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type ForumModeratorNote = typeof forumModeratorNotes.$inferSelect;
export type InsertForumModeratorNote = typeof forumModeratorNotes.$inferInsert;

/**
 * System settings (admin-controlled)
 */
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updated_by: integer("updated_by").references(() => users.id),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
