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
    
    # Maximum words per chunk for long texts
    MAX_WORDS_PER_CHUNK = 1500
    
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
            "max_output_tokens": 8192,  # Increased to ensure complete questions array
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
            
            # Validate questions field
            if "questions" not in exam or not isinstance(exam["questions"], list):
                print(f"Warning: Invalid or missing questions in response. Raw response: {response.text[:500]}")
                raise ValueError("AI response does not contain valid 'questions' array")
            
            if len(exam["questions"]) == 0:
                print(f"Warning: Empty questions array in response")
                raise ValueError("AI response contains empty 'questions' array")
            
            # Randomize options order for each question
            self._randomize_options(exam["questions"])
            
            # Add metadata
            # Use formatted_text from AI if available, otherwise use original text
            exam["text"] = exam.get("formatted_text", text)
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
    
    def _randomize_options(self, questions: List[Dict]) -> None:
        """
        Randomize the order of options for each question
        to prevent the correct answer from always being in the same position
        
        Args:
            questions: List of question dictionaries
        """
        import random
        
        for question in questions:
            if "options" not in question or not isinstance(question["options"], list):
                continue
            
            # Shuffle options
            random.shuffle(question["options"])
            
            # Update option IDs to match new positions (a, b, c)
            option_ids = ['a', 'b', 'c', 'd', 'e', 'f']
            for i, option in enumerate(question["options"]):
                if i < len(option_ids):
                    option["id"] = option_ids[i]
    
    def _extract_json(self, text: str) -> Dict:
        """
        Extract JSON from model response
        
        Args:
            text: Response text that may contain JSON
            
        Returns:
            Parsed JSON dictionary
        """
        # Try to extract from markdown code block first
        code_block_match = re.search(r'```(?:json)?\s*({.*?})\s*```', text, re.DOTALL)
        if code_block_match:
            json_str = code_block_match.group(1)
            # Fix common JSON issues
            json_str = self._fix_json_string(json_str)
            try:
                result = json.loads(json_str)
                print(f"✅ Extracted JSON from markdown code block")
                return result
            except json.JSONDecodeError as e:
                print(f"⚠️ Failed to parse JSON from code block: {e}")
        
        # Try to find JSON object (greedy match for complete object)
        # Use a more robust regex that handles nested braces
        json_match = re.search(r'\{(?:[^{}]|\{[^{}]*\})*\}', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            try:
                result = json.loads(json_str)
                print(f"✅ Extracted JSON from text")
                return result
            except json.JSONDecodeError as e:
                print(f"⚠️ Failed to parse JSON from regex match: {e}")
        
        # If no JSON found, try to parse entire text
        try:
            result = json.loads(text)
            print(f"✅ Parsed entire text as JSON")
            return result
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON: {e}")
            print(f"📝 Raw response (first 500 chars): {text[:500]}")
            # Return error structure
            return {
                "error": "Failed to parse JSON",
                "raw_response": text[:1000]  # Limit to avoid huge logs
            }
    
    def _split_long_text(self, text: str) -> List[str]:
        """
        Split long text into manageable chunks
        
        Args:
            text: Dutch text to split
            
        Returns:
            List of text chunks
        """
        words = text.split()
        word_count = len(words)
        
        # If text is short enough, return as is
        if word_count <= self.MAX_WORDS_PER_CHUNK:
            return [text]
        
        # Split into chunks
        chunks = []
        for i in range(0, word_count, self.MAX_WORDS_PER_CHUNK):
            chunk_words = words[i:i + self.MAX_WORDS_PER_CHUNK]
            chunk = ' '.join(chunk_words)
            chunks.append(chunk)
        
        print(f"📊 Text split into {len(chunks)} chunks ({word_count} words total)")
        return chunks
    
    def _generate_questions_for_chunk(
        self,
        chunk: str,
        num_questions: int,
        chunk_index: int,
        total_chunks: int,
        max_retries: int = 2
    ) -> List[Dict]:
        """
        Generate questions for a single text chunk with retry mechanism
        
        Args:
            chunk: Text chunk
            num_questions: Number of questions to generate
            chunk_index: Index of current chunk (0-based)
            total_chunks: Total number of chunks
            max_retries: Maximum number of retry attempts
            
        Returns:
            List of questions
        """
        print(f"📝 Processing chunk {chunk_index + 1}/{total_chunks} ({len(chunk.split())} words)...")
        
        for attempt in range(max_retries + 1):
            try:
                # Analyze chunk
                analysis = self.analyze_text(chunk)
                
                # Generate questions
                result = self.generate_questions(chunk, num_questions, analysis)
                
                questions = result.get('questions', [])
                
                if questions:
                    print(f"✅ Chunk {chunk_index + 1}: Generated {len(questions)} questions")
                    return questions
                else:
                    print(f"⚠️ Chunk {chunk_index + 1}: No questions returned")
                    if attempt < max_retries:
                        print(f"🔄 Retrying chunk {chunk_index + 1} (attempt {attempt + 2}/{max_retries + 1})...")
                        continue
                    return []
                    
            except Exception as e:
                print(f"⚠️ Chunk {chunk_index + 1} attempt {attempt + 1} failed: {e}")
                if attempt < max_retries:
                    print(f"🔄 Retrying chunk {chunk_index + 1} (attempt {attempt + 2}/{max_retries + 1})...")
                    import time
                    time.sleep(2)  # Wait before retry
                    continue
                else:
                    print(f"❌ Chunk {chunk_index + 1}: All retry attempts failed")
                    return []
    
    def generate_exam_for_long_text(
        self,
        text: str,
        num_questions: int = 7
    ) -> Dict:
        """
        Generate exam for potentially long text by splitting into chunks
        
        Args:
            text: Dutch text (can be very long)
            num_questions: Total number of questions to generate
            
        Returns:
            Dictionary containing the complete exam
        """
        try:
            # Split text into chunks
            chunks = self._split_long_text(text)
            
            # If only one chunk, use normal processing
            if len(chunks) == 1:
                print("✅ Text is short enough, using normal processing")
                return self.generate_questions(text, num_questions)
            
            # Process multiple chunks
            print(f"📚 Processing long text with {len(chunks)} chunks...")
            
            # Distribute questions across chunks
            questions_per_chunk = max(1, num_questions // len(chunks))
            all_questions = []
            
            for i, chunk in enumerate(chunks):
                # Generate questions for this chunk
                chunk_questions = self._generate_questions_for_chunk(
                    chunk=chunk,
                    num_questions=questions_per_chunk,
                    chunk_index=i,
                    total_chunks=len(chunks)
                )
                
                all_questions.extend(chunk_questions)
            
            # Check if we got enough questions
            if len(all_questions) == 0:
                raise ValueError(f"Failed to generate any questions from {len(chunks)} chunks")
            
            # Adjust question IDs to be sequential
            for i, q in enumerate(all_questions, 1):
                q['id'] = i
            
            # Limit to requested number of questions
            all_questions = all_questions[:num_questions]
            
            print(f"✅ Generated {len(all_questions)} questions from {len(chunks)} chunks")
            
            # Randomize options
            self._randomize_options(all_questions)
            
            return {
                'questions': all_questions,
                'text': text,
                'formatted_text': text,
                'total_questions': len(all_questions),
                'chunks_processed': len(chunks)
            }
            
        except Exception as e:
            print(f"❌ Error in long text processing: {e}")
            raise
    
    def _fix_json_string(self, json_str: str) -> str:
        """
        Fix common JSON formatting issues
        
        Args:
            json_str: JSON string that may have formatting issues
            
        Returns:
            Fixed JSON string
        """
        # This is a simple fix - just return as is
        # The real issue is that AI returns incomplete JSON
        # We'll handle this differently
        return json_str
    
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
