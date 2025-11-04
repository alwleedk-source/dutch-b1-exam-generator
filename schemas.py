"""
Pydantic schemas for structured output
"""

from pydantic import BaseModel, Field
from typing import List
import enum


class QuestionType(str, enum.Enum):
    """Question type enum"""
    DETAIL = "detail"
    INFERENCE = "inference"
    MAIN_IDEA = "main_idea"


class Difficulty(str, enum.Enum):
    """Difficulty level enum"""
    MEDIUM = "medium"
    HARD = "hard"


class Option(BaseModel):
    """Question option"""
    id: str = Field(description="Option ID (a, b, or c)")
    text: str = Field(description="Option text in Dutch")
    correct: bool = Field(description="Whether this option is correct")


class Question(BaseModel):
    """Exam question"""
    id: int = Field(description="Question number")
    type: QuestionType = Field(description="Question type")
    difficulty: Difficulty = Field(description="Question difficulty")
    question_nl: str = Field(description="Question in Dutch")
    question_ar: str = Field(description="Question in Arabic")
    options: List[Option] = Field(description="List of 3 options")
    explanation: str = Field(description="Explanation in Arabic")


class Exam(BaseModel):
    """Complete exam"""
    exam_title: str = Field(description="Exam title")
    formatted_text: str = Field(description="Formatted text with newlines")
    total_questions: int = Field(description="Total number of questions")
    questions: List[Question] = Field(description="List of questions")
