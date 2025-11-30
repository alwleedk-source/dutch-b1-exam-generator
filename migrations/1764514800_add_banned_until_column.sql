-- Add banned_until column to users table (missing from previous migration)
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP;
