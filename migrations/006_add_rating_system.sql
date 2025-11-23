-- Migration: Add Rating System for Texts
-- This allows users to rate texts and helps others find the best exams

-- Create text_ratings table
CREATE TABLE IF NOT EXISTS text_ratings (
  id SERIAL PRIMARY KEY,
  text_id INTEGER NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(text_id, user_id) -- Each user can rate a text only once
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_text_ratings_text_id ON text_ratings(text_id);
CREATE INDEX IF NOT EXISTS idx_text_ratings_user_id ON text_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_text_ratings_rating ON text_ratings(rating);

-- Add rating columns to texts table
ALTER TABLE texts ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE texts ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Create index for filtering by rating
CREATE INDEX IF NOT EXISTS idx_texts_average_rating ON texts(average_rating DESC);

-- Function to update text rating statistics
CREATE OR REPLACE FUNCTION update_text_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE texts
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM text_ratings
      WHERE text_id = COALESCE(NEW.text_id, OLD.text_id)
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM text_ratings
      WHERE text_id = COALESCE(NEW.text_id, OLD.text_id)
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.text_id, OLD.text_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update rating stats
DROP TRIGGER IF EXISTS trigger_update_text_rating_stats ON text_ratings;
CREATE TRIGGER trigger_update_text_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON text_ratings
FOR EACH ROW
EXECUTE FUNCTION update_text_rating_stats();

-- Comments for documentation
COMMENT ON TABLE text_ratings IS 'Stores user ratings and reviews for texts';
COMMENT ON COLUMN text_ratings.rating IS 'Rating from 1 (poor) to 5 (excellent)';
COMMENT ON COLUMN text_ratings.comment IS 'Optional user comment/review';
COMMENT ON COLUMN texts.average_rating IS 'Calculated average rating (0-5)';
COMMENT ON COLUMN texts.total_ratings IS 'Total number of ratings received';
