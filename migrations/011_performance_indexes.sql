-- Performance Indexes Migration
-- Add indexes for frequently queried tables

-- user_vocabulary indexes
CREATE INDEX IF NOT EXISTS user_vocabulary_user_id_idx ON user_vocabulary (user_id);
CREATE INDEX IF NOT EXISTS user_vocabulary_vocabulary_id_idx ON user_vocabulary (vocabulary_id);
CREATE INDEX IF NOT EXISTS user_vocabulary_status_idx ON user_vocabulary (status);
CREATE INDEX IF NOT EXISTS user_vocabulary_next_review_idx ON user_vocabulary (next_review_at);

-- ratings indexes
CREATE INDEX IF NOT EXISTS ratings_text_id_idx ON ratings (text_id);
CREATE INDEX IF NOT EXISTS ratings_user_id_idx ON ratings (user_id);

-- notifications indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications (is_read);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications (created_at DESC);

-- vocabulary_text_links indexes (many-to-many)
CREATE INDEX IF NOT EXISTS vocab_text_links_vocabulary_idx ON vocabulary_text_links (vocabulary_id);
CREATE INDEX IF NOT EXISTS vocab_text_links_text_idx ON vocabulary_text_links (text_id);
