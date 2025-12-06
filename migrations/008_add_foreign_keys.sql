-- Migration: Add Foreign Key Constraints for Referential Integrity
-- This migration adds foreign keys to ensure data consistency
-- Note: Some constraints use SET NULL or CASCADE depending on requirements

-- ============================================
-- CORE TABLE FOREIGN KEYS
-- ============================================

-- texts.created_by → users.id
ALTER TABLE "texts"
ADD CONSTRAINT "fk_texts_created_by"
FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;

-- texts.moderated_by → users.id
ALTER TABLE "texts"
ADD CONSTRAINT "fk_texts_moderated_by"
FOREIGN KEY ("moderated_by") REFERENCES "users"("id") ON DELETE SET NULL;

-- translations.text_id → texts.id
ALTER TABLE "translations"
ADD CONSTRAINT "fk_translations_text_id"
FOREIGN KEY ("text_id") REFERENCES "texts"("id") ON DELETE CASCADE;

-- exams.user_id → users.id
ALTER TABLE "exams"
ADD CONSTRAINT "fk_exams_user_id"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- exams.text_id → texts.id
ALTER TABLE "exams"
ADD CONSTRAINT "fk_exams_text_id"
FOREIGN KEY ("text_id") REFERENCES "texts"("id") ON DELETE CASCADE;

-- ============================================
-- VOCABULARY FOREIGN KEYS
-- ============================================

-- vocabulary.sourceTextId → texts.id
ALTER TABLE "vocabulary"
ADD CONSTRAINT "fk_vocabulary_source_text_id"
FOREIGN KEY ("sourceTextId") REFERENCES "texts"("id") ON DELETE SET NULL;

-- user_vocabulary.user_id → users.id
ALTER TABLE "user_vocabulary"
ADD CONSTRAINT "fk_user_vocabulary_user_id"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- user_vocabulary.vocabulary_id → vocabulary.id
ALTER TABLE "user_vocabulary"
ADD CONSTRAINT "fk_user_vocabulary_vocabulary_id"
FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE;

-- text_vocabulary.text_id → texts.id
ALTER TABLE "text_vocabulary"
ADD CONSTRAINT "fk_text_vocabulary_text_id"
FOREIGN KEY ("text_id") REFERENCES "texts"("id") ON DELETE CASCADE;

-- text_vocabulary.vocabulary_id → vocabulary.id
ALTER TABLE "text_vocabulary"
ADD CONSTRAINT "fk_text_vocabulary_vocabulary_id"
FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE;

-- ============================================
-- REPORTS AND ACHIEVEMENTS FOREIGN KEYS
-- ============================================

-- reports.text_id → texts.id
ALTER TABLE "reports"
ADD CONSTRAINT "fk_reports_text_id"
FOREIGN KEY ("text_id") REFERENCES "texts"("id") ON DELETE CASCADE;

-- reports.reported_by → users.id
ALTER TABLE "reports"
ADD CONSTRAINT "fk_reports_reported_by"
FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE CASCADE;

-- reports.reviewed_by → users.id (nullable)
ALTER TABLE "reports"
ADD CONSTRAINT "fk_reports_reviewed_by"
FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL;

-- achievements.user_id → users.id
ALTER TABLE "achievements"
ADD CONSTRAINT "fk_achievements_user_id"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- ============================================
-- USER BAN FOREIGN KEY
-- ============================================

-- users.banned_by → users.id
ALTER TABLE "users"
ADD CONSTRAINT "fk_users_banned_by"
FOREIGN KEY ("banned_by") REFERENCES "users"("id") ON DELETE SET NULL;

-- ============================================
-- TEXT RATINGS FOREIGN KEY
-- ============================================

-- text_ratings.user_id → users.id
ALTER TABLE "text_ratings"
ADD CONSTRAINT "fk_text_ratings_user_id"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- text_ratings.text_id → texts.id
ALTER TABLE "text_ratings"
ADD CONSTRAINT "fk_text_ratings_text_id"
FOREIGN KEY ("text_id") REFERENCES "texts"("id") ON DELETE CASCADE;
