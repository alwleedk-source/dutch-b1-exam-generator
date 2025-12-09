-- Add gamification fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "total_points" integer DEFAULT 0 NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "current_level" varchar(50) DEFAULT 'beginner' NOT NULL;
