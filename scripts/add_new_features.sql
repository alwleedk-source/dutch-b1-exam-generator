-- Add new columns to texts table
ALTER TABLE texts ADD COLUMN IF NOT EXISTS formatted_html TEXT;
ALTER TABLE texts ADD COLUMN IF NOT EXISTS text_type VARCHAR(50);

-- Add new column to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS staatsexamen_score INTEGER;

-- Add new columns to vocabulary table
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS dutchDefinition TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS wordType VARCHAR(50);

-- Create index on staatsexamen_score for performance
CREATE INDEX IF NOT EXISTS exams_staatsexamen_score_idx ON exams(staatsexamen_score);
