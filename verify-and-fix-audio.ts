#!/usr/bin/env tsx
/**
 * Script to verify and fix incorrect audio in vocabulary
 * 
 * This script:
 * 1. Checks all words in vocabulary that have audioUrl
 * 2. Verifies the hash in audioKey matches the word
 * 3. If incorrect, deletes the audio and regenerates it
 * 
 * Usage:
 *   npx tsx verify-and-fix-audio.ts [--fix]
 * 
 * Options:
 *   --fix    Actually fix the incorrect audio (default: dry-run)
 *   --limit  Limit number of words to check (default: all)
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { vocabulary } from './drizzle/schema';
import { isNotNull, eq } from 'drizzle-orm';
import crypto from 'crypto';

const FIX_MODE = process.argv.includes('--fix');
const LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '0') || undefined;

console.log('🔍 Verifying audio in vocabulary...\n');
console.log(`Mode: ${FIX_MODE ? '🔧 FIX' : '👀 DRY-RUN'}`);
if (LIMIT) console.log(`Limit: ${LIMIT} words`);
console.log('');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { casing: 'snake_case' });

  // Get all words with audio
  let query = db
    .select({
      id: vocabulary.id,
      dutchWord: vocabulary.dutchWord,
      audioUrl: vocabulary.audioUrl,
      audioKey: vocabulary.audioKey,
    })
    .from(vocabulary)
    .where(isNotNull(vocabulary.audioUrl))
    .orderBy(vocabulary.dutchWord);

  if (LIMIT) {
    query = query.limit(LIMIT) as any;
  }

  const wordsWithAudio = await query;

  console.log(`Found ${wordsWithAudio.length} words with audio\n`);
  console.log('Checking each word...\n');

  let correctCount = 0;
  let incorrectCount = 0;
  let fixedCount = 0;
  let failedCount = 0;

  const incorrectWords: Array<{
    id: number;
    word: string;
    expectedHash: string;
    foundHash: string;
    audioUrl: string;
  }> = [];

  for (const word of wordsWithAudio) {
    // Calculate correct hash for the word
    const normalizedWord = word.dutchWord.trim().toLowerCase();
    const correctHash = crypto.createHash('md5').update(normalizedWord).digest('hex').slice(0, 8);

    // Extract hash from audioKey
    // Format: tts/nl-NL/HASH-TIMESTAMP.mp3
    const audioKeyHash = word.audioKey?.split('/').pop()?.split('-')[0];

    if (audioKeyHash === correctHash) {
      console.log(`✅ ${word.dutchWord.padEnd(30)} hash: ${correctHash}`);
      correctCount++;
    } else {
      console.log(`❌ ${word.dutchWord.padEnd(30)} INCORRECT!`);
      console.log(`   Expected hash: ${correctHash}`);
      console.log(`   Found hash:    ${audioKeyHash || 'N/A'}`);
      console.log(`   audioUrl:      ${word.audioUrl?.substring(0, 60)}...`);
      
      incorrectCount++;
      incorrectWords.push({
        id: word.id,
        word: word.dutchWord,
        expectedHash: correctHash,
        foundHash: audioKeyHash || 'N/A',
        audioUrl: word.audioUrl || '',
      });

      if (FIX_MODE) {
        try {
          console.log(`   🔧 Regenerating audio...`);
          
          // Import here to avoid loading if not needed
          const { generateDutchSpeech } = await import('./server/lib/tts');
          const { audioUrl, audioKey } = await generateDutchSpeech(normalizedWord);
          
          // Update database
          await db
            .update(vocabulary)
            .set({ 
              audioUrl, 
              audioKey, 
              updated_at: new Date() 
            })
            .where(eq(vocabulary.id, word.id));
          
          console.log(`   ✅ Fixed! New hash: ${audioKey.split('/').pop()?.split('-')[0]}`);
          fixedCount++;
        } catch (error: any) {
          console.error(`   ❌ Failed to fix: ${error.message}`);
          failedCount++;
        }
      } else {
        console.log(`   💡 Run with --fix to regenerate audio`);
      }
      console.log('');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  console.log(`Total words checked:     ${wordsWithAudio.length}`);
  console.log(`✅ Correct audio:        ${correctCount} (${((correctCount / wordsWithAudio.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Incorrect audio:      ${incorrectCount} (${((incorrectCount / wordsWithAudio.length) * 100).toFixed(1)}%)`);
  
  if (FIX_MODE) {
    console.log(`🔧 Fixed:                ${fixedCount}`);
    console.log(`❌ Failed to fix:        ${failedCount}`);
  }
  
  console.log('='.repeat(60));

  if (incorrectCount > 0 && !FIX_MODE) {
    console.log('\n💡 To fix the incorrect audio, run:');
    console.log('   npx tsx verify-and-fix-audio.ts --fix\n');
    
    console.log('📝 Incorrect words list:');
    incorrectWords.forEach((w, i) => {
      console.log(`${i + 1}. ${w.word} (ID: ${w.id})`);
    });
  }

  await client.end();
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
