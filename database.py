"""
Database module for Dutch B1 Exam Generator
Handles PostgreSQL (Neon) database operations
"""

import os
from datetime import datetime
from typing import Optional, List, Dict
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager


class Database:
    """Database manager for Neon PostgreSQL"""
    
    def __init__(self):
        """Initialize database connection"""
        self.database_url = os.getenv("DATABASE_URL")
        if not self.database_url:
            raise ValueError("DATABASE_URL not found in environment variables")
        
        # Create tables if they don't exist
        self.init_tables()
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = psycopg2.connect(self.database_url)
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def init_tables(self):
        """Create database tables if they don't exist"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    google_id VARCHAR(255) UNIQUE NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    name VARCHAR(255),
                    picture VARCHAR(500),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Exams table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS exams (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(500) NOT NULL,
                    original_text TEXT NOT NULL,
                    formatted_text TEXT,
                    questions JSONB NOT NULL,
                    word_translations JSONB,
                    num_questions INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Vocabulary table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vocabulary (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    word VARCHAR(255) NOT NULL,
                    translation TEXT NOT NULL,
                    context TEXT,
                    exam_id INTEGER REFERENCES exams(id) ON DELETE SET NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for better performance
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_exams_created_at ON exams(created_at DESC)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_vocabulary_created_at ON vocabulary(created_at DESC)
            """)
            
            print("✅ Database tables initialized successfully")
    
    # User operations
    def create_or_update_user(self, google_id: str, email: str, name: str, picture: str) -> int:
        """Create or update user and return user_id"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO users (google_id, email, name, picture, last_login)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (google_id) 
                DO UPDATE SET 
                    email = EXCLUDED.email,
                    name = EXCLUDED.name,
                    picture = EXCLUDED.picture,
                    last_login = CURRENT_TIMESTAMP
                RETURNING id
            """, (google_id, email, name, picture))
            
            user_id = cursor.fetchone()[0]
            return user_id
    
    def get_user_by_google_id(self, google_id: str) -> Optional[Dict]:
        """Get user by Google ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT * FROM users WHERE google_id = %s
            """, (google_id,))
            
            return cursor.fetchone()
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT * FROM users WHERE id = %s
            """, (user_id,))
            
            return cursor.fetchone()
    
    # Exam operations
    def save_exam(
        self, 
        user_id: int, 
        title: str, 
        original_text: str, 
        formatted_text: str,
        questions: List[Dict],
        word_translations: Dict[str, str],
        num_questions: int
    ) -> int:
        """Save exam and return exam_id"""
        import json
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO exams (
                    user_id, title, original_text, formatted_text, 
                    questions, word_translations, num_questions
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_id, title, original_text, formatted_text,
                json.dumps(questions), json.dumps(word_translations), num_questions
            ))
            
            exam_id = cursor.fetchone()[0]
            return exam_id
    
    def get_exam(self, exam_id: int, user_id: int) -> Optional[Dict]:
        """Get exam by ID (only if it belongs to the user)"""
        import json
        
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT * FROM exams 
                WHERE id = %s AND user_id = %s
            """, (exam_id, user_id))
            
            exam = cursor.fetchone()
            
            if exam:
                # Parse JSON fields if they are strings
                if isinstance(exam['questions'], str):
                    exam['questions'] = json.loads(exam['questions'])
                elif exam['questions'] is None:
                    exam['questions'] = []
                
                if isinstance(exam['word_translations'], str):
                    exam['word_translations'] = json.loads(exam['word_translations'])
                elif exam['word_translations'] is None:
                    exam['word_translations'] = {}
            
            return exam
    
    def get_user_exams(self, user_id: int, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get all exams for a user"""
        import json
        
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT id, title, num_questions, created_at, updated_at
                FROM exams 
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """, (user_id, limit, offset))
            
            return cursor.fetchall()
    
    def delete_exam(self, exam_id: int, user_id: int) -> bool:
        """Delete exam (only if it belongs to the user)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                DELETE FROM exams 
                WHERE id = %s AND user_id = %s
            """, (exam_id, user_id))
            
            return cursor.rowcount > 0
    
    def update_exam_title(self, exam_id: int, user_id: int, new_title: str) -> bool:
        """Update exam title"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE exams 
                SET title = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            """, (new_title, exam_id, user_id))
            
            return cursor.rowcount > 0
    
    def get_user_exam_count(self, user_id: int) -> int:
        """Get total number of exams for a user"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT COUNT(*) FROM exams WHERE user_id = %s
            """, (user_id,))
            
            return cursor.fetchone()[0]
    
    # Vocabulary operations
    def save_word(self, user_id: int, word: str, translation: str, context: str = None, exam_id: int = None) -> int:
        """Save a word to vocabulary and return word_id"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Check if word already exists for this user
            cursor.execute("""
                SELECT id FROM vocabulary 
                WHERE user_id = %s AND LOWER(word) = LOWER(%s)
            """, (user_id, word))
            
            existing = cursor.fetchone()
            if existing:
                # Word already exists, don't add duplicate
                return existing[0]
            
            cursor.execute("""
                INSERT INTO vocabulary (user_id, word, translation, context, exam_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (user_id, word, translation, context, exam_id))
            
            word_id = cursor.fetchone()[0]
            return word_id
    
    def get_user_vocabulary(self, user_id: int, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Get all vocabulary words for a user"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT v.*, e.title as exam_title
                FROM vocabulary v
                LEFT JOIN exams e ON v.exam_id = e.id
                WHERE v.user_id = %s
                ORDER BY v.created_at DESC
                LIMIT %s OFFSET %s
            """, (user_id, limit, offset))
            
            return cursor.fetchall()
    
    def delete_word(self, word_id: int, user_id: int) -> bool:
        """Delete a word (only if it belongs to the user)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                DELETE FROM vocabulary 
                WHERE id = %s AND user_id = %s
            """, (word_id, user_id))
            
            return cursor.rowcount > 0
    
    def get_user_vocabulary_count(self, user_id: int) -> int:
        """Get total number of vocabulary words for a user"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT COUNT(*) FROM vocabulary WHERE user_id = %s
            """, (user_id,))
            
            return cursor.fetchone()[0]
    
    def search_vocabulary(self, user_id: int, search_term: str) -> List[Dict]:
        """Search vocabulary by word or translation"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT v.*, e.title as exam_title
                FROM vocabulary v
                LEFT JOIN exams e ON v.exam_id = e.id
                WHERE v.user_id = %s 
                AND (LOWER(v.word) LIKE LOWER(%s) OR LOWER(v.translation) LIKE LOWER(%s))
                ORDER BY v.created_at DESC
            """, (user_id, f'%{search_term}%', f'%{search_term}%'))
            
            return cursor.fetchall()


# Singleton instance
_db_instance = None

def get_db() -> Database:
    """Get database singleton instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance
