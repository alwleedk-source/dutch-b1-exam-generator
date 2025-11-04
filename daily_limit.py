"""
Daily Limit Module
Handles daily exam generation limits for users
"""

from datetime import date
from typing import Dict


class DailyLimitManager:
    """Manager for daily exam generation limits"""
    
    DAILY_LIMIT = 5  # Maximum exams per day
    
    def __init__(self, database):
        """Initialize with database instance"""
        self.db = database
    
    def check_and_update_limit(self, user_id: int) -> Dict:
        """
        Check if user can generate exam and update counter
        Returns dict with: can_generate, remaining, reset_date
        """
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            
            # Get user's current count and last exam date
            cursor.execute("""
                SELECT daily_exam_count, last_exam_date
                FROM users
                WHERE id = %s
            """, (user_id,))
            
            result = cursor.fetchone()
            if not result:
                return {
                    "can_generate": False,
                    "remaining": 0,
                    "message": "User not found"
                }
            
            current_count, last_exam_date = result
            today = date.today()
            
            # Reset counter if it's a new day
            if last_exam_date is None or last_exam_date < today:
                current_count = 0
                cursor.execute("""
                    UPDATE users
                    SET daily_exam_count = 0, last_exam_date = %s
                    WHERE id = %s
                """, (today, user_id))
            
            # Check if user has reached limit
            if current_count >= self.DAILY_LIMIT:
                return {
                    "can_generate": False,
                    "remaining": 0,
                    "current": current_count,
                    "limit": self.DAILY_LIMIT,
                    "message": f"لقد وصلت للحد اليومي ({self.DAILY_LIMIT} امتحانات). يرجى المحاولة غداً."
                }
            
            # Increment counter
            new_count = current_count + 1
            cursor.execute("""
                UPDATE users
                SET daily_exam_count = %s, last_exam_date = %s
                WHERE id = %s
            """, (new_count, today, user_id))
            
            remaining = self.DAILY_LIMIT - new_count
            
            return {
                "can_generate": True,
                "remaining": remaining,
                "current": new_count,
                "limit": self.DAILY_LIMIT,
                "message": f"تم توليد الامتحان. المتبقي اليوم: {remaining} / {self.DAILY_LIMIT}"
            }
    
    def get_remaining_exams(self, user_id: int) -> Dict:
        """Get remaining exams for today without updating counter"""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT daily_exam_count, last_exam_date
                FROM users
                WHERE id = %s
            """, (user_id,))
            
            result = cursor.fetchone()
            if not result:
                return {
                    "remaining": 0,
                    "current": 0,
                    "limit": self.DAILY_LIMIT
                }
            
            current_count, last_exam_date = result
            today = date.today()
            
            # Reset if new day
            if last_exam_date is None or last_exam_date < today:
                current_count = 0
            
            remaining = max(0, self.DAILY_LIMIT - current_count)
            
            return {
                "remaining": remaining,
                "current": current_count,
                "limit": self.DAILY_LIMIT
            }
