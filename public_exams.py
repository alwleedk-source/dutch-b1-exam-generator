"""
Public Exams Module
Handles public exam sharing functionality
"""

from typing import List, Dict, Optional
from psycopg2.extras import RealDictCursor


class PublicExamsManager:
    """Manager for public exam sharing"""
    
    def __init__(self, database):
        """Initialize with database instance"""
        self.db = database
    
    def toggle_exam_public(self, exam_id: int, user_id: int, is_public: bool) -> bool:
        """
        Toggle exam public status
        Only the owner can change this
        """
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE exams
                SET is_public = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            """, (is_public, exam_id, user_id))
            
            return cursor.rowcount > 0
    
    def get_public_exams(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get all public exams"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT 
                    e.id,
                    e.title,
                    e.num_questions,
                    e.created_at,
                    u.name as creator_name
                FROM exams e
                JOIN users u ON e.user_id = u.id
                WHERE e.is_public = TRUE
                ORDER BY e.created_at DESC
                LIMIT %s OFFSET %s
            """, (limit, offset))
            
            rows = cursor.fetchall()
            # Convert RealDictRow to regular dict for JSON serialization
            return [dict(row) for row in rows]
    
    def get_public_exam_by_id(self, exam_id: int) -> Optional[Dict]:
        """Get a specific public exam (anyone can access)"""
        import json
        
        with self.db.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT 
                    e.*,
                    u.name as creator_name
                FROM exams e
                JOIN users u ON e.user_id = u.id
                WHERE e.id = %s AND e.is_public = TRUE
            """, (exam_id,))
            
            row = cursor.fetchone()
            
            if row:
                # Convert RealDictRow to regular dict
                exam = dict(row)
                
                # Parse JSON fields
                if isinstance(exam['questions'], str):
                    try:
                        exam['questions'] = json.loads(exam['questions'])
                    except json.JSONDecodeError:
                        exam['questions'] = []
                elif exam['questions'] is None:
                    exam['questions'] = []
                
                if isinstance(exam['word_translations'], str):
                    try:
                        exam['word_translations'] = json.loads(exam['word_translations'])
                    except json.JSONDecodeError:
                        exam['word_translations'] = {}
                elif exam['word_translations'] is None:
                    exam['word_translations'] = {}
                
                return exam
            
            return None
    
    def get_public_exam_count(self) -> int:
        """Get total number of public exams"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT COUNT(*) FROM exams WHERE is_public = TRUE
            """)
            
            return cursor.fetchone()[0]
