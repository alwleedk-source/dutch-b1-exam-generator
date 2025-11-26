/**
 * Migration Script: Convert rating reasons from translated text to language-independent keys
 * 
 * This script converts existing rating reasons in the database from translated strings
 * (e.g., "ظهر في امتحان حقيقي", "Appeared in real exam") to language-independent keys
 * (e.g., "real_exam") so that filters work correctly across all languages.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { textRatings } from './drizzle/schema';
import { eq, or } from 'drizzle-orm';

// Mapping of all possible translated texts to their keys
const REASON_MAPPINGS: Record<string, string> = {
  // helpful
  'نص مفيد': 'helpful',
  'Nuttige tekst': 'helpful',
  'Helpful text': 'helpful',
  'Faydalı metin': 'helpful',
  
  // clear
  'أسئلة واضحة': 'clear',
  'Duidelijke vragen': 'clear',
  'Clear questions': 'clear',
  'Açık sorular': 'clear',
  
  // good_level
  'مستوى مناسب': 'good_level',
  'Goed niveau': 'good_level',
  'Good level': 'good_level',
  'İyi seviye': 'good_level',
  
  // real_exam
  'ظهر في امتحان حقيقي': 'real_exam',
  'Kwam voor in echt examen': 'real_exam',
  'Appeared in real exam': 'real_exam',
  'Gerçek sınavda çıktı': 'real_exam',
  
  // good_practice
  'تمرين جيد': 'good_practice',
  'Goede oefening': 'good_practice',
  'Good practice': 'good_practice',
  'İyi pratik': 'good_practice',
  
  // other
  'آخر': 'other',
  'Anders': 'other',
  'Other': 'other',
  'Diğer': 'other',
};

async function migrateRatingReasons() {
  console.log('🚀 Starting rating reasons migration...\n');
  
  // Connect to database
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    // Get all ratings with reasons
    const allRatings = await db
      .select()
      .from(textRatings)
      .where(eq(textRatings.reason, textRatings.reason)); // Get all non-null reasons
    
    console.log(`📊 Found ${allRatings.length} total ratings in database`);
    
    const ratingsWithReasons = allRatings.filter(r => r.reason && r.reason.trim() !== '');
    console.log(`📊 Found ${ratingsWithReasons.length} ratings with reasons\n`);
    
    if (ratingsWithReasons.length === 0) {
      console.log('✅ No ratings with reasons to migrate');
      await client.end();
      return;
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    let alreadyKeyCount = 0;
    
    // Process each rating
    for (const rating of ratingsWithReasons) {
      const oldReason = rating.reason!;
      
      // Check if it's already a key (not a translated text)
      if (Object.values(REASON_MAPPINGS).includes(oldReason)) {
        alreadyKeyCount++;
        console.log(`⏭️  Rating #${rating.id}: Already using key "${oldReason}"`);
        continue;
      }
      
      // Find the corresponding key
      const newKey = REASON_MAPPINGS[oldReason];
      
      if (newKey) {
        // Update the rating
        await db
          .update(textRatings)
          .set({ reason: newKey })
          .where(eq(textRatings.id, rating.id));
        
        updatedCount++;
        console.log(`✅ Rating #${rating.id}: "${oldReason}" → "${newKey}"`);
      } else {
        skippedCount++;
        console.log(`⚠️  Rating #${rating.id}: Unknown reason "${oldReason}" (skipped)`);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Already keys: ${alreadyKeyCount}`);
    console.log(`   ⚠️  Skipped (unknown): ${skippedCount}`);
    console.log(`   📊 Total processed: ${ratingsWithReasons.length}`);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migration
migrateRatingReasons()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
