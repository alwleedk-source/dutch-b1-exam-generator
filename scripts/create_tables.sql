-- PostgreSQL Schema for Dutch B1 Exam Generator
-- Run this in Neon SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(255) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  preferred_language VARCHAR(10) DEFAULT 'nl' NOT NULL CHECK (preferred_language IN ('nl', 'ar', 'en', 'tr')),
  total_exams_completed INTEGER DEFAULT 0 NOT NULL,
  total_vocabulary_learned INTEGER DEFAULT 0 NOT NULL,
  total_time_spent_minutes INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_activity_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_signed_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Texts table
CREATE TABLE IF NOT EXISTS texts (
  id SERIAL PRIMARY KEY,
  dutch_text TEXT NOT NULL,
  title VARCHAR(255),
  word_count INTEGER NOT NULL,
  estimated_reading_minutes INTEGER NOT NULL,
  is_valid_dutch BOOLEAN DEFAULT TRUE NOT NULL,
  detected_level VARCHAR(10) CHECK (detected_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  level_confidence INTEGER,
  is_b1_level BOOLEAN DEFAULT TRUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by INTEGER NOT NULL,
  source VARCHAR(20) DEFAULT 'paste' NOT NULL CHECK (source IN ('paste', 'upload', 'scan', 'admin')),
  moderated_by INTEGER,
  moderation_note TEXT,
  moderated_at TIMESTAMP,
  min_hash_signature TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS texts_created_by_idx ON texts(created_by);
CREATE INDEX IF NOT EXISTS texts_status_idx ON texts(status);

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  text_id INTEGER NOT NULL,
  arabic_translation TEXT,
  english_translation TEXT,
  turkish_translation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS translations_text_id_idx ON translations(text_id);

-- Vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id SERIAL PRIMARY KEY,
  text_id INTEGER NOT NULL,
  dutch_word VARCHAR(255) NOT NULL,
  arabic_translation VARCHAR(255),
  english_translation VARCHAR(255),
  turkish_translation VARCHAR(255),
  audio_url TEXT,
  audio_key VARCHAR(255),
  example_sentence TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  frequency INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS vocabulary_text_id_idx ON vocabulary(text_id);
CREATE INDEX IF NOT EXISTS vocabulary_dutch_word_idx ON vocabulary(dutch_word);

-- User Vocabulary table
CREATE TABLE IF NOT EXISTS user_vocabulary (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  vocabulary_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'learning', 'mastered')),
  correct_count INTEGER DEFAULT 0 NOT NULL,
  incorrect_count INTEGER DEFAULT 0 NOT NULL,
  last_reviewed_at TIMESTAMP,
  next_review_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS user_vocabulary_user_id_idx ON user_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS user_vocabulary_vocabulary_id_idx ON user_vocabulary(vocabulary_id);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  text_id INTEGER NOT NULL,
  score INTEGER,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0 NOT NULL,
  incorrect_answers INTEGER DEFAULT 0 NOT NULL,
  time_spent_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'in_progress' NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS exams_user_id_idx ON exams(user_id);
CREATE INDEX IF NOT EXISTS exams_text_id_idx ON exams(text_id);
CREATE INDEX IF NOT EXISTS exams_status_idx ON exams(status);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON achievements(user_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  text_id INTEGER NOT NULL,
  reported_by INTEGER NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('level_issue', 'content_issue')),
  level_issue_type VARCHAR(50) CHECK (level_issue_type IN ('too_easy', 'too_hard')),
  content_issue_type VARCHAR(50) CHECK (content_issue_type IN ('inappropriate', 'spam', 'not_dutch', 'other')),
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by INTEGER,
  review_note TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS reports_text_id_idx ON reports(text_id);
CREATE INDEX IF NOT EXISTS reports_reported_by_idx ON reports(reported_by);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);

-- Success message
SELECT 'All tables created successfully!' AS message;
