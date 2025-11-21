-- Migration: Add context field to vocabulary table for context-aware shared vocabulary
-- This allows the same word to have different meanings based on context

-- Add context field
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS context VARCHAR(100);

-- Add sourceTextId to track which text first introduced this word+context combination
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS "sourceTextId" INTEGER;

-- Remove old text_id foreign key constraint if exists
ALTER TABLE vocabulary DROP CONSTRAINT IF EXISTS vocabulary_text_id_fkey;

-- Drop old index on text_id
DROP INDEX IF EXISTS vocabulary_text_id_idx;

-- Create new unique constraint on (dutchWord, context)
-- This ensures each word+context combination appears only once
CREATE UNIQUE INDEX IF NOT EXISTS vocabulary_word_context_unique 
ON vocabulary (dutchWord, context) 
WHERE context IS NOT NULL;

-- Create index on sourceTextId for faster lookups
CREATE INDEX IF NOT EXISTS vocabulary_source_text_id_idx ON vocabulary ("sourceTextId");

-- Create junction table for many-to-many relationship between texts and vocabulary
CREATE TABLE IF NOT EXISTS text_vocabulary (
  id SERIAL PRIMARY KEY,
  text_id INTEGER NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  vocabulary_id INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Ensure each text-vocabulary pair is unique
  UNIQUE(text_id, vocabulary_id)
);

-- Create indexes for faster joins
CREATE INDEX IF NOT EXISTS text_vocabulary_text_id_idx ON text_vocabulary(text_id);
CREATE INDEX IF NOT EXISTS text_vocabulary_vocabulary_id_idx ON text_vocabulary(vocabulary_id);

-- Migrate existing data: create text_vocabulary entries for existing vocabulary
INSERT INTO text_vocabulary (text_id, vocabulary_id)
SELECT text_id, id FROM vocabulary
WHERE text_id IS NOT NULL
ON CONFLICT (text_id, vocabulary_id) DO NOTHING;

-- Update sourceTextId for existing vocabulary
UPDATE vocabulary SET "sourceTextId" = text_id WHERE "sourceTextId" IS NULL AND text_id IS NOT NULL;

-- text_id is now optional (for shared vocabulary)
-- We keep it for backwards compatibility but new records will use text_vocabulary table
