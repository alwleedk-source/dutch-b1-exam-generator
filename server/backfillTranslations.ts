/**
 * Backfill missing translations from dictionary
 * 
 * This script:
 * 1. Finds all vocabulary words without translations
 * 2. Looks them up in the dictionary
 * 3. Updates vocabulary with dictionary translations
 */

import { getDb } from './db';
import { vocabulary, b1Dictionary } from '../drizzle/schema';
import { eq, or, isNull } from 'drizzle-orm';

async function backfillTranslations() {
  console.log('[Backfill] Starting translation backfill...');
  
  const db = await getDb();
  if (!db) {
    console.error('[Backfill] Database not available');
    process.exit(1);
  }

  // Find all vocabulary words missing at least one translation
  const wordsNeedingTranslation = await db
    .select()
    .from(vocabulary)
    .where(
      or(
        isNull(vocabulary.arabicTranslation),
        isNull(vocabulary.englishTranslation),
        isNull(vocabulary.turkishTranslation),
        isNull(vocabulary.dutchDefinition)
      )
    );

  console.log(`[Backfill] Found ${wordsNeedingTranslation.length} words needing translation`);

  let updated = 0;
  let notFound = 0;
  let alreadyComplete = 0;

  for (const word of wordsNeedingTranslation) {
    // Look up in dictionary
    const dictEntry = await db
      .select()
      .from(b1Dictionary)
      .where(eq(b1Dictionary.word, word.dutchWord))
      .limit(1);

    if (dictEntry.length === 0) {
      notFound++;
      console.log(`[Backfill] ⚠️  Not in dictionary: ${word.dutchWord}`);
      continue;
    }

    const dict = dictEntry[0];

    // Check if we have anything to update
    const needsUpdate = 
      (!word.arabicTranslation && dict.translation_ar) ||
      (!word.englishTranslation && dict.translation_en) ||
      (!word.turkishTranslation && dict.translation_tr) ||
      (!word.dutchDefinition && dict.definition_nl) ||
      (!word.audioUrl && dict.audio_url);

    if (!needsUpdate) {
      alreadyComplete++;
      continue;
    }

    // Update with dictionary data
    await db
      .update(vocabulary)
      .set({
        arabicTranslation: word.arabicTranslation || dict.translation_ar || null,
        englishTranslation: word.englishTranslation || dict.translation_en || null,
        turkishTranslation: word.turkishTranslation || dict.translation_tr || null,
        dutchDefinition: word.dutchDefinition || dict.definition_nl || null,
        audioUrl: word.audioUrl || dict.audio_url || null,
        audioKey: word.audioKey || dict.audio_key || null,
        wordType: word.wordType || dict.word_type || null,
      })
      .where(eq(vocabulary.id, word.id));

    updated++;
    console.log(`[Backfill] ✅ Updated: ${word.dutchWord}`);
  }

  console.log('\n[Backfill] Summary:');
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ⚠️  Not in dictionary: ${notFound}`);
  console.log(`  ℹ️  Already complete: ${alreadyComplete}`);
  console.log(`  📊 Total processed: ${wordsNeedingTranslation.length}`);

  process.exit(0);
}

backfillTranslations().catch((error) => {
  console.error('[Backfill] Error:', error);
  process.exit(1);
});
