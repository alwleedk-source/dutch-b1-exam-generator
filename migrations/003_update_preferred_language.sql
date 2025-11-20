-- Make preferred_language nullable and remove default
ALTER TABLE users ALTER COLUMN preferred_language DROP NOT NULL;
ALTER TABLE users ALTER COLUMN preferred_language DROP DEFAULT;

-- Update existing users to NULL to force language selection
UPDATE users SET preferred_language = NULL WHERE preferred_language = 'nl';
