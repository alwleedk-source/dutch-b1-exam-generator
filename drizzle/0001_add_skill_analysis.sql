-- Add skill_analysis column to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS skill_analysis TEXT;

-- Add b1_dictionary table
CREATE TABLE IF NOT EXISTS b1_dictionary (
  id SERIAL PRIMARY KEY,
  word VARCHAR(255) NOT NULL UNIQUE,
  translation_ar TEXT,
  translation_en TEXT,
  translation_tr TEXT,
  definition_nl TEXT,
  example_nl TEXT,
  word_type VARCHAR(50),
  frequency_rank INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS b1_dictionary_word_idx ON b1_dictionary(word);
CREATE INDEX IF NOT EXISTS b1_dictionary_frequency_rank_idx ON b1_dictionary(frequency_rank);
