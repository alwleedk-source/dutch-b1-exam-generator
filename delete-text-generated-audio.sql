-- Delete audio generated from texts (not from dictionary)
-- This will keep dictionary audio intact and only remove TTS-generated audio

-- First, let's see how many records will be affected
SELECT 
  COUNT(*) as total_with_audio,
  COUNT(CASE WHEN "audioKey" LIKE 'tts/nl-NL/%' THEN 1 END) as text_generated_audio,
  COUNT(CASE WHEN "audioKey" NOT LIKE 'tts/nl-NL/%' AND "audioKey" IS NOT NULL THEN 1 END) as dictionary_audio
FROM vocabulary
WHERE "audioUrl" IS NOT NULL;

-- Show some examples of what will be deleted
SELECT 
  id,
  "dutchWord",
  "audioKey",
  LEFT("audioUrl", 50) as audio_url_preview
FROM vocabulary
WHERE "audioKey" LIKE 'tts/nl-NL/%'
LIMIT 10;

-- Delete text-generated audio (uncomment to execute)
-- UPDATE vocabulary 
-- SET "audioUrl" = NULL, "audioKey" = NULL 
-- WHERE "audioKey" LIKE 'tts/nl-NL/%';

-- Verify deletion (run after uncommenting above)
-- SELECT 
--   COUNT(*) as remaining_with_audio,
--   COUNT(CASE WHEN "audioKey" LIKE 'tts/nl-NL/%' THEN 1 END) as text_generated_audio,
--   COUNT(CASE WHEN "audioKey" NOT LIKE 'tts/nl-NL/%' AND "audioKey" IS NOT NULL THEN 1 END) as dictionary_audio
-- FROM vocabulary
-- WHERE "audioUrl" IS NOT NULL;
