-- Add banned_until field to users table for temporary bans
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP;

-- Create forum moderation actions table (audit log)
CREATE TABLE IF NOT EXISTS forum_moderation_actions (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL, -- ban, unban, delete_post, delete_topic, warn, bulk_delete
  moderator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content references (if deleting specific content)
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE SET NULL,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE SET NULL,
  
  reason TEXT,
  ban_duration VARCHAR(20), -- 1day, 1week, 1month, permanent
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator ON forum_moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target_user ON forum_moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created_at ON forum_moderation_actions(created_at DESC);
