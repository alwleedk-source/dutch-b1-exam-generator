-- Add missing columns to exams table
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS score_percentage INTEGER,
ADD COLUMN IF NOT EXISTS total_questions INTEGER,
ADD COLUMN IF NOT EXISTS correct_answers INTEGER,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Add missing columns to user_vocabulary table
ALTER TABLE user_vocabulary
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS incorrect_count INTEGER DEFAULT 0;

-- Show tables to verify
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('exams', 'user_vocabulary')
ORDER BY table_name, ordinal_position;
