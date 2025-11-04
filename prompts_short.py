"""
Shortened prompts for Dutch B1 exam generation
"""

QUESTION_GENERATION_PROMPT_SHORT = """Generate a B1 Dutch reading exam.

Text:
{text}

Analysis:
{analysis}

Requirements:
1. Generate {num_questions} questions
2. Use paraphrasing (different words than text)
3. All options from text, only one correct
4. 3 options only (a, b, c)
5. Medium/hard difficulty

Return JSON:
{{
  "exam_title": "...",
  "formatted_text": "...",
  "total_questions": {num_questions},
  "questions": [
    {{
      "id": 1,
      "type": "detail/inference/main_idea",
      "difficulty": "medium/hard",
      "question_nl": "...",
      "question_ar": "...",
      "options": [
        {{"id": "a", "text": "...", "correct": false}},
        {{"id": "b", "text": "...", "correct": true}},
        {{"id": "c", "text": "...", "correct": false}}
      ],
      "explanation": "..."
    }}
  ]
}}

⚠️ IMPORTANT: JSON MUST contain "questions" array with {num_questions} questions!
"""
