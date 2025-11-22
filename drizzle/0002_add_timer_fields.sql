-- Add timer system fields to exams table
ALTER TABLE "exams" ADD COLUMN IF NOT EXISTS "exam_mode" varchar(20) DEFAULT 'practice';
ALTER TABLE "exams" ADD COLUMN IF NOT EXISTS "time_limit_minutes" integer;
ALTER TABLE "exams" ADD COLUMN IF NOT EXISTS "timer_paused_at" timestamp;
