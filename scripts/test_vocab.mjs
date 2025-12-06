import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function testVocabulary() {
  try {
    // Test the query that getUserVocabularyProgress uses
    const results = await sql`
      SELECT 
        uv.id,
        uv.user_id,
        uv.vocabulary_id,
        uv.status,
        uv.correct_count,
        uv.incorrect_count,
        uv.last_reviewed_at,
        uv.next_review_at,
        uv.ease_factor,
        uv.interval,
        uv.repetitions,
        uv.created_at,
        uv.updated_at,
        v."dutchWord" as dutch_word,
        v."arabicTranslation" as arabic_translation,
        v."englishTranslation" as english_translation,
        v."turkishTranslation" as turkish_translation,
        v."dutchDefinition" as dutch_definition,
        v."audioUrl" as audio_url
      FROM user_vocabulary uv
      INNER JOIN vocabulary v ON uv.vocabulary_id = v.id
      WHERE uv.user_id = 21
      ORDER BY uv.created_at DESC
      LIMIT 5
    `;
    
    console.log('Found', results.length, 'vocabulary entries');
    console.log('\nFirst entry:');
    if (results.length > 0) {
      const first = results[0];
      console.log('- ID:', first.id);
      console.log('- Dutch word:', first.dutch_word);
      console.log('- Arabic translation:', first.arabic_translation);
      console.log('- English translation:', first.english_translation);
      console.log('- Turkish translation:', first.turkish_translation);
      console.log('- Definition:', first.dutch_definition);
      console.log('- Ease factor (DB):', first.ease_factor);
      console.log('- Ease factor (converted):', Math.round(parseFloat(first.ease_factor) * 1000));
      console.log('- Status:', first.status);
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

testVocabulary();
