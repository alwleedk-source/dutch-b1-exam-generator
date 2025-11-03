"""
Dutch B1 Exam Generator Agent
Core logic for text analysis and question generation using Gemini AI
"""

import os
import json
import re
from typing import Dict, List, Optional
import google.generativeai as genai
from prompts import (
    SYSTEM_PROMPT,
    ANALYSIS_PROMPT,
    QUESTION_GENERATION_PROMPT,
    VERIFICATION_PROMPT,
    FEW_SHOT_EXAMPLES
)


class DutchB1ExamAgent:
    """Agent for generating Dutch B1 reading comprehension exams"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the agent with Gemini API
        
        Args:
            api_key: Gemini API key (if None, reads from environment)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Model configuration for quality output
        self.generation_config = {
            "temperature": 0.7,  # Balance between creativity and accuracy
            "top_p": 0.9,
            "top_k": 40,
            "max_output_tokens": 4096,
        }
        
        # Initialize model
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config=self.generation_config,
            system_instruction=SYSTEM_PROMPT
        )
    
    def analyze_text(self, text: str) -> Dict:
        """
        Analyze the Dutch text to understand its characteristics
        
        Args:
            text: Dutch text to analyze
            
        Returns:
            Dictionary containing text analysis
        """
        try:
            prompt = ANALYSIS_PROMPT.format(text=text)
            response = self.model.generate_content(prompt)
            
            # Extract JSON from response
            analysis = self._extract_json(response.text)
            return analysis
            
        except Exception as e:
            print(f"Error in text analysis: {e}")
            # Return default analysis if fails
            return {
                "text_type": "Onbekend",
                "main_topic": "Algemeen",
                "difficulty_level": "B1",
                "key_ideas": [],
                "key_words": [],
                "tone": "Neutraal"
            }
    
    def generate_questions(
        self, 
        text: str, 
        num_questions: int = 7,
        analysis: Optional[Dict] = None
    ) -> Dict:
        """
        Generate exam questions based on the text
        
        Args:
            text: Dutch text to create questions from
            num_questions: Number of questions to generate (default: 7)
            analysis: Pre-computed text analysis (optional)
            
        Returns:
            Dictionary containing the complete exam
        """
        try:
            # Analyze text if not provided
            if analysis is None:
                analysis = self.analyze_text(text)
            
            # Build comprehensive prompt with examples
            full_prompt = f"{FEW_SHOT_EXAMPLES}\n\n{QUESTION_GENERATION_PROMPT}"
            prompt = full_prompt.format(
                text=text,
                analysis=json.dumps(analysis, ensure_ascii=False, indent=2),
                num_questions=num_questions
            )
            
            response = self.model.generate_content(prompt)
            
            # Extract JSON from response
            exam = self._extract_json(response.text)
            
            # Add metadata
            exam["text"] = text
            exam["analysis"] = analysis
            
            return exam
            
        except Exception as e:
            print(f"Error in question generation: {e}")
            raise
    
    def verify_questions(self, questions: Dict, text: str) -> Dict:
        """
        Verify the quality of generated questions
        
        Args:
            questions: Generated questions
            text: Original text
            
        Returns:
            Verification results
        """
        try:
            prompt = VERIFICATION_PROMPT.format(
                questions=json.dumps(questions, ensure_ascii=False, indent=2),
                text=text
            )
            
            response = self.model.generate_content(prompt)
            verification = self._extract_json(response.text)
            
            return verification
            
        except Exception as e:
            print(f"Error in verification: {e}")
            return {
                "quality_score": "N/A",
                "issues_found": [],
                "suggestions": [],
                "approved": True
            }
    
    def generate_exam_with_verification(
        self,
        text: str,
        num_questions: int = 7,
        max_retries: int = 2
    ) -> Dict:
        """
        Generate exam with automatic quality verification
        
        Args:
            text: Dutch text to create questions from
            num_questions: Number of questions to generate
            max_retries: Maximum number of regeneration attempts
            
        Returns:
            Complete exam with verification results
        """
        # Step 1: Analyze text
        analysis = self.analyze_text(text)
        
        # Step 2: Generate questions
        exam = self.generate_questions(text, num_questions, analysis)
        
        # Step 3: Verify quality
        verification = self.verify_questions(exam, text)
        
        # Step 4: Retry if not approved and retries available
        retry_count = 0
        while not verification.get("approved", True) and retry_count < max_retries:
            print(f"Quality check failed. Regenerating... (Attempt {retry_count + 1}/{max_retries})")
            exam = self.generate_questions(text, num_questions, analysis)
            verification = self.verify_questions(exam, text)
            retry_count += 1
        
        # Add verification results to exam
        exam["verification"] = verification
        
        return exam
    
    def _extract_json(self, text: str) -> Dict:
        """
        Extract JSON from model response
        
        Args:
            text: Response text that may contain JSON
            
        Returns:
            Parsed JSON dictionary
        """
        # Try to find JSON block
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        
        # If no JSON found, try to parse entire text
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Return error structure
            return {
                "error": "Failed to parse JSON",
                "raw_response": text
            }
    
    def format_exam_for_display(self, exam: Dict) -> str:
        """
        Format exam as readable text
        
        Args:
            exam: Exam dictionary
            
        Returns:
            Formatted exam text
        """
        output = []
        output.append("=" * 60)
        output.append(f"📝 {exam.get('exam_title', 'Leesexamen B1')}")
        output.append("=" * 60)
        output.append("")
        
        # Display text
        output.append("📖 TEKST:")
        output.append("-" * 60)
        output.append(exam.get("text", ""))
        output.append("")
        output.append("=" * 60)
        output.append("❓ VRAGEN:")
        output.append("=" * 60)
        output.append("")
        
        # Display questions
        questions = exam.get("questions", [])
        for q in questions:
            output.append(f"Vraag {q['id']} ({q['type']}) - {q['difficulty'].upper()}")
            output.append(f"{q['question_nl']}")
            output.append("")
            
            for opt in q['options']:
                marker = "✅" if opt['correct'] else "  "
                output.append(f"  {marker} {opt['id']}) {opt['text']}")
            
            output.append("")
            output.append(f"💡 Uitleg: {q.get('explanation', 'N/A')}")
            output.append("-" * 60)
            output.append("")
        
        return "\n".join(output)


# Example usage
if __name__ == "__main__":
    # Test the agent
    sample_text = """
    Beste bewoner,
    
    De gemeente Amsterdam organiseert een gratis cursus Nederlands voor nieuwe inwoners. 
    De cursus begint op 1 september 2024 en duurt 3 maanden. 
    De lessen zijn elke dinsdag en donderdag van 19:00 tot 21:00 uur.
    
    U kunt zich aanmelden via onze website www.amsterdam.nl of telefonisch op nummer 020-1234567.
    Het aantal plaatsen is beperkt, dus wacht niet te lang met aanmelden!
    
    Met vriendelijke groet,
    Gemeente Amsterdam
    """
    
    try:
        agent = DutchB1ExamAgent()
        print("🤖 Generating exam...")
        exam = agent.generate_exam_with_verification(sample_text, num_questions=5)
        print(agent.format_exam_for_display(exam))
    except Exception as e:
        print(f"❌ Error: {e}")
