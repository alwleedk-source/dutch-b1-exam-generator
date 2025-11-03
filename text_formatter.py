"""
Automatic text formatting module using AI
Formats Dutch text to appear natural with proper structure
"""

import os
import re
from typing import Dict
import google.generativeai as genai


class DutchTextFormatter:
    """Formats Dutch text automatically using AI"""
    
    def __init__(self, api_key: str = None):
        """Initialize formatter with Gemini API"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        
        genai.configure(api_key=self.api_key)
        
        self.generation_config = {
            "temperature": 0.2,  # Low temperature for consistent formatting
            "top_p": 0.8,
            "top_k": 20,
            "max_output_tokens": 4096,
        }
        
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config=self.generation_config
        )
    
    def format_text(self, text: str) -> Dict:
        """
        Format Dutch text with proper structure
        
        Args:
            text: Raw Dutch text
            
        Returns:
            Dictionary with formatted text and metadata
        """
        prompt = f"""Je bent een expert in het formatteren van Nederlandse teksten.

Taak: Analyseer en formatteer de volgende Nederlandse tekst zodat deze er natuurlijk en professioneel uitziet.

Originele tekst:
{text}

Instructies:
1. **Identificeer de structuur** (brief, artikel, advertentie, kennisgeving, etc.)
2. **Voeg passende opmaak toe**:
   - Paragrafen (scheiding met dubbele nieuwe regel)
   - Koppen indien nodig (markeer met ## voor hoofdkop, ### voor subkop)
   - Opsommingen indien aanwezig (gebruik - of •)
   - Aanhef en afsluiting voor brieven
   - Datum en locatie indien relevant

3. **Behoud de originele inhoud** - verander GEEN woorden of betekenis
4. **Maak het leesbaar** - voeg witruimte toe waar nodig
5. **Natuurlijke presentatie** - alsof het een echt document is

Retourneer het resultaat in JSON formaat:
{{
  "formatted_text": "De geformatteerde tekst met opmaak",
  "structure_type": "Type document (brief/artikel/advertentie/etc)",
  "has_title": true/false,
  "has_paragraphs": true/false,
  "formatting_notes": "Korte uitleg van toegepaste opmaak"
}}

**BELANGRIJK**: 
- Gebruik \\n\\n voor paragraafscheiding
- Gebruik ## voor hoofdkoppen
- Gebruik ### voor subkoppen
- Gebruik - voor opsommingen
- Behoud alle originele tekst!
"""
        
        try:
            response = self.model.generate_content(prompt)
            result = self._extract_json(response.text)
            
            # Ensure formatted_text exists
            if "formatted_text" not in result:
                result["formatted_text"] = text
            
            return result
        except Exception as e:
            print(f"Formatting error: {e}")
            return {
                "formatted_text": text,
                "structure_type": "unknown",
                "has_title": False,
                "has_paragraphs": False,
                "formatting_notes": "Formatting failed, using original text"
            }
    
    def _extract_json(self, text: str) -> Dict:
        """Extract JSON from model response"""
        import json
        
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
            return {}


# Example usage
if __name__ == "__main__":
    formatter = DutchTextFormatter()
    
    sample_text = """Beste bewoner, De gemeente Amsterdam organiseert een gratis cursus Nederlands voor nieuwe inwoners. De cursus begint op 1 september 2024 en duurt 3 maanden. De lessen zijn elke dinsdag en donderdag van 19:00 tot 21:00 uur. U kunt zich aanmelden via onze website www.amsterdam.nl of telefonisch op nummer 020-1234567. Het aantal plaatsen is beperkt, dus wacht niet te lang met aanmelden! Met vriendelijke groet, Gemeente Amsterdam"""
    
    result = formatter.format_text(sample_text)
    print("Formatted text:")
    print(result.get("formatted_text"))
    print("\nStructure type:", result.get("structure_type"))
    print("Formatting notes:", result.get("formatting_notes"))
