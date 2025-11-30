-- Add forum_moderation_actions table for tracking moderation activities
CREATE TABLE IF NOT EXISTS forum_moderation_actions (
  id SERIAL PRIMARY KEY,
  moderator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL, -- ban, unban, delete_topic, delete_post, hide_topic, hide_post, warn, etc.
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE SET NULL,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE SET NULL,
  reason TEXT,
  ban_duration INTEGER, -- in days, null for permanent
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forum_moderation_actions_moderator_id ON forum_moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_forum_moderation_actions_target_user_id ON forum_moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_forum_moderation_actions_created_at ON forum_moderation_actions(created_at DESC);
