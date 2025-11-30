-- Add new tables for enhanced moderation features

-- Forum Warnings table
CREATE TABLE IF NOT EXISTS forum_warnings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moderator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE SET NULL,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Forum Moderator Notes table (internal notes for moderators)
CREATE TABLE IF NOT EXISTS forum_moderator_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moderator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_warnings_user_id ON forum_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_warnings_created_at ON forum_warnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_moderator_notes_user_id ON forum_moderator_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_reports(status);
CREATE INDEX IF NOT EXISTS idx_forum_reports_created_at ON forum_reports(created_at DESC);
