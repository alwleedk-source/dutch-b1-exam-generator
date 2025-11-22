-- Add timer system fields to exams table
-- Migration 006: Add exam timer fields

-- Add exam_mode column (practice or exam)
ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_mode VARCHAR(20) DEFAULT 'practice';

-- Add time_limit_minutes column
ALTER TABLE exams ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;

-- Add timer_paused_at column for practice mode
ALTER TABLE exams ADD COLUMN IF NOT EXISTS timer_paused_at TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN exams.exam_mode IS 'Exam mode: practice (no time limit) or exam (timed)';
COMMENT ON COLUMN exams.time_limit_minutes IS 'Time limit in minutes for exam mode';
COMMENT ON COLUMN exams.timer_paused_at IS 'Timestamp when timer was paused (practice mode only)';
