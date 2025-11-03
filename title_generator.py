"""
Title Generator for Exams
Uses Gemini AI to generate meaningful titles from text content
"""

import os
import google.generativeai as genai


class TitleGenerator:
    """Generate meaningful titles for exams using AI"""
    
    def __init__(self, api_key: str = None):
        """Initialize title generator"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY required for title generation")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def generate_title(self, text: str) -> str:
        """
        Generate a short, meaningful title from text
        
        Args:
            text: The original Dutch text
            
        Returns:
            A short title (max 50 characters)
        """
        prompt = f"""
Analyseer deze Nederlandse tekst en genereer een korte, duidelijke titel.

Tekst:
{text[:500]}...

Regels:
1. Maximaal 50 tekens
2. Beschrijf het hoofdonderwerp
3. Gebruik geen aanhalingstekens
4. Wees specifiek maar beknopt
5. Gebruik Nederlands

Voorbeelden:
- "Brief van gemeente over cursus"
- "Advertentie voor baan bij bedrijf"
- "Kennisgeving over afvalinzameling"
- "Artikel over Nederlandse cultuur"

Genereer alleen de titel, geen uitleg:
"""
        
        try:
            response = self.model.generate_content(prompt)
            title = response.text.strip()
            
            # Remove quotes if present
            title = title.strip('"').strip("'")
            
            # Limit to 50 characters
            if len(title) > 50:
                title = title[:47] + "..."
            
            return title
        
        except Exception as e:
            print(f"Error generating title: {e}")
            # Fallback: use first 50 chars of text
            fallback = text[:50].strip()
            if len(text) > 50:
                fallback += "..."
            return fallback


# Singleton instance
_generator_instance = None

def get_title_generator() -> TitleGenerator:
    """Get title generator singleton"""
    global _generator_instance
    if _generator_instance is None:
        _generator_instance = TitleGenerator()
    return _generator_instance
