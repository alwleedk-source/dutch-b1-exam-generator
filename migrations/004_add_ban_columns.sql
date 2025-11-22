-- Add ban-related columns to users table for forum moderation
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_by INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
