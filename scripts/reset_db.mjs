import postgres from 'postgres';

const DATABASE_URL = process.argv[2];
const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function resetDatabase() {
  try {
    console.log('🔌 Connecting to PostgreSQL...\n');

    // Get all tables
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    
    console.log('🗑️  Dropping old tables...');
    for (const table of tables) {
      console.log(`  - Dropping ${table.tablename}...`);
      await sql.unsafe(`DROP TABLE IF EXISTS ${table.tablename} CASCADE`);
    }
    console.log('✅ All old tables dropped\n');

    // Create new tables
    console.log('📝 Creating users table...');
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        open_id VARCHAR(255) UNIQUE NOT NULL,
        name TEXT,
        email VARCHAR(320),
        login_method VARCHAR(64),
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        preferred_language VARCHAR(10) DEFAULT 'nl' NOT NULL,
        total_exams_completed INTEGER DEFAULT 0 NOT NULL,
        total_vocabulary_learned INTEGER DEFAULT 0 NOT NULL,
        total_time_spent_minutes INTEGER DEFAULT 0 NOT NULL,
        current_streak INTEGER DEFAULT 0 NOT NULL,
        longest_streak INTEGER DEFAULT 0 NOT NULL,
        last_activity_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        last_signed_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    console.log('✅ users\n');

    console.log('📝 Creating texts table...');
    await sql`
      CREATE TABLE texts (
        id SERIAL PRIMARY KEY,
        dutch_text TEXT NOT NULL,
        title VARCHAR(255),
        word_count INTEGER NOT NULL,
        estimated_reading_minutes INTEGER NOT NULL,
        is_valid_dutch BOOLEAN DEFAULT TRUE NOT NULL,
        detected_level VARCHAR(10),
        level_confidence INTEGER,
        is_b1_level BOOLEAN DEFAULT TRUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        created_by INTEGER NOT NULL,
        source VARCHAR(20) DEFAULT 'paste' NOT NULL,
        moderated_by INTEGER,
        moderation_note TEXT,
        moderated_at TIMESTAMP,
        min_hash_signature TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await sql`CREATE INDEX texts_created_by_idx ON texts(created_by)`;
    await sql`CREATE INDEX texts_status_idx ON texts(status)`;
    console.log('✅ texts\n');

    console.log('📝 Creating translations table...');
    await sql`
      CREATE TABLE translations (
        id SERIAL PRIMARY KEY,
        text_id INTEGER NOT NULL,
        arabic_translation TEXT,
        english_translation TEXT,
        turkish_translation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await sql`CREATE INDEX translations_text_id_idx ON translations(text_id)`;
    console.log('✅ translations\n');

    console.log('📝 Creating vocabulary table...');
    await sql`
      CREATE TABLE vocabulary (
        id SERIAL PRIMARY KEY,
        text_id INTEGER NOT NULL,
        dutch_word VARCHAR(255) NOT NULL,
        arabic_translation VARCHAR(255),
        english_translation VARCHAR(255),
        turkish_translation VARCHAR(255),
        audio_url TEXT,
        audio_key VARCHAR(255),
        example_sentence TEXT,
        difficulty VARCHAR(20),
        frequency INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await sql`CREATE INDEX vocabulary_text_id_idx ON vocabulary(text_id)`;
    await sql`CREATE INDEX vocabulary_dutch_word_idx ON vocabulary(dutch_word)`;
    console.log('✅ vocabulary\n');

    console.log('📝 Creating user_vocabulary table...');
    await sql`
      CREATE TABLE user_vocabulary (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        vocabulary_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'new' NOT NULL,
        correct_count INTEGER DEFAULT 0 NOT NULL,
        incorrect_count INTEGER DEFAULT 0 NOT NULL,
        last_reviewed_at TIMESTAMP,
        next_review_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await sql`CREATE INDEX user_vocabulary_user_id_idx ON user_vocabulary(user_id)`;
    await sql`CREATE INDEX user_vocabulary_vocabulary_id_idx ON user_vocabulary(vocabulary_id)`;
    console.log('✅ user_vocabulary\n');

    console.log('📝 Creating exams table...');
    await sql`
      CREATE TABLE exams (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        text_id INTEGER NOT NULL,
        score INTEGER,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0 NOT NULL,
        incorrect_answers INTEGER DEFAULT 0 NOT NULL,
        time_spent_minutes INTEGER,
        status VARCHAR(20) DEFAULT 'in_progress' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await sql`CREATE INDEX exams_user_id_idx ON exams(user_id)`;
    await sql`CREATE INDEX exams_text_id_idx ON exams(text_id)`;
    await sql`CREATE INDEX exams_status_idx ON exams(status)`;
    console.log('✅ exams\n');

    console.log('📝 Creating achievements table...');
    await sql`
      CREATE TABLE achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        achievement_type VARCHAR(50) NOT NULL,
        achievement_name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await sql`CREATE INDEX achievements_user_id_idx ON achievements(user_id)`;
    console.log('✅ achievements\n');

    console.log('📝 Creating reports table...');
    await sql`
      CREATE TABLE reports (
        id SERIAL PRIMARY KEY,
        text_id INTEGER NOT NULL,
        reported_by INTEGER NOT NULL,
        report_type VARCHAR(50) NOT NULL,
        level_issue_type VARCHAR(50),
        content_issue_type VARCHAR(50),
        details TEXT,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        reviewed_by INTEGER,
        review_note TEXT,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await sql`CREATE INDEX reports_text_id_idx ON reports(text_id)`;
    await sql`CREATE INDEX reports_reported_by_idx ON reports(reported_by)`;
    await sql`CREATE INDEX reports_status_idx ON reports(status)`;
    console.log('✅ reports\n');

    // Verify
    const newTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n🎉 Database reset complete!\n');
    console.log('📊 New tables:');
    newTables.forEach(t => console.log(`  ✅ ${t.table_name}`));
    
  } catch (error) {
    console.error('\n❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

resetDatabase();
