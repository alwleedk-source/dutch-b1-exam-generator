// Improved database functions with word normalization

import { eq } from "drizzle-orm";
import { b1Dictionary, vocabulary } from "../drizzle/schema";

/**
 * Normalize a Dutch word for consistent searching
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove extra spaces
 */
export function normalizeWord(word: string): string {
  return word.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Get a word from B1 dictionary with normalized search
 * This is the IMPROVED version that handles case-insensitive search
 */
export async function getDictionaryWordImproved(db: any, word: string) {
  if (!db) return null;

  // Normalize the word for case-insensitive search
  const normalizedWord = normalizeWord(word);

  console.log(`[DB] Searching dictionary for normalized word: "${normalizedWord}" (original: "${word}")`);

  const result = await db
    .select()
    .from(b1Dictionary)
    .where(eq(b1Dictionary.word, normalizedWord))
    .limit(1);

  if (result[0]) {
    console.log(`[DB] Found dictionary entry for "${normalizedWord}":`, {
      id: result[0].id,
      word: result[0].word,
      hasAudio: !!result[0].audio_url,
      audioUrl: result[0].audio_url?.substring(0, 50),
    });
  } else {
    console.log(`[DB] No dictionary entry found for "${normalizedWord}"`);
  }

  return result[0] || null;
}

/**
 * Get vocabulary entry by Dutch word with normalized search
 */
export async function getVocabularyByWordImproved(db: any, word: string) {
  if (!db) return null;

  const normalizedWord = normalizeWord(word);

  console.log(`[DB] Searching vocabulary for normalized word: "${normalizedWord}" (original: "${word}")`);

  const result = await db
    .select()
    .from(vocabulary)
    .where(eq(vocabulary.dutchWord, normalizedWord))
    .limit(1);

  if (result[0]) {
    console.log(`[DB] Found vocabulary entry for "${normalizedWord}":`, {
      id: result[0].id,
      word: result[0].dutchWord,
      hasAudio: !!result[0].audioUrl,
      audioUrl: result[0].audioUrl?.substring(0, 50),
    });
  } else {
    console.log(`[DB] No vocabulary entry found for "${normalizedWord}"`);
  }

  return result[0] || null;
}

/**
 * Verify that an audio URL is accessible
 * Returns true if the URL returns a valid audio response
 */
export async function verifyAudioUrl(url: string): Promise<boolean> {
  try {
    console.log(`[DB] Verifying audio URL: ${url.substring(0, 50)}...`);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    const isValid = response.ok && response.headers.get('content-type')?.includes('audio');
    
    console.log(`[DB] Audio URL verification result: ${isValid ? 'VALID' : 'INVALID'}`, {
      status: response.status,
      contentType: response.headers.get('content-type'),
    });
    
    return isValid;
  } catch (error: any) {
    console.error(`[DB] Failed to verify audio URL:`, {
      url: url.substring(0, 50),
      error: error.message,
    });
    return false;
  }
}

/**
 * Update vocabulary audio with URL verification
 */
export async function updateVocabularyAudioSafe(
  db: any,
  vocabId: number,
  audioUrl: string,
  audioKey: string,
  skipVerification: boolean = false
): Promise<boolean> {
  if (!db) return false;

  // Optionally verify URL before saving
  if (!skipVerification) {
    const isValid = await verifyAudioUrl(audioUrl);
    if (!isValid) {
      console.warn(`[DB] Refusing to save invalid audio URL for vocabId=${vocabId}`);
      return false;
    }
  }

  console.log(`[DB] Updating vocabulary audio for vocabId=${vocabId}:`, {
    audioUrl: audioUrl.substring(0, 50),
    audioKey,
  });

  await db
    .update(vocabulary)
    .set({ audioUrl, audioKey, updated_at: new Date() })
    .where(eq(vocabulary.id, vocabId));

  return true;
}

// Export helper to add to existing db.ts
export const dbImprovements = {
  normalizeWord,
  getDictionaryWordImproved,
  getVocabularyByWordImproved,
  verifyAudioUrl,
  updateVocabularyAudioSafe,
};
