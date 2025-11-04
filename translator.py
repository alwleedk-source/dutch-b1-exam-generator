"""
Word-by-word translation module for Dutch to Arabic
"""

import os
import re
from typing import Dict, List
import google.generativeai as genai


class DutchToArabicTranslator:
    """Translator for Dutch words to Arabic with context"""
    
    def __init__(self, api_key: str = None):
        """Initialize translator with Gemini API"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        
        genai.configure(api_key=self.api_key)
        
        self.generation_config = {
            "temperature": 0.3,  # Low temperature for consistent translations
            "top_p": 0.8,
            "top_k": 20,
            "max_output_tokens": 2048,
        }
        
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config=self.generation_config
        )
    
    def translate_text_with_words(self, text: str) -> Dict:
        """
        Translate Dutch text and provide word-by-word translations
        
        Args:
            text: Dutch text to translate
            
        Returns:
            Dictionary with full translation and word translations
        """
        prompt = f"""أنت مترجم محترف متخصص في تعليم اللغة الهولندية لمستوى B1.

النص الهولندي:
{text}

مهمتك:
1. ترجم النص كاملاً إلى العربية (ترجمة طبيعية وسلسة)
2. قدم ترجمة **انتقائية للكلمات المهمة فقط**

🎯 **معايير اختيار الكلمات للترجمة:**

✅ **ترجم فقط:**
1. **الكلمات الطويلة** (6+ أحرف) التي قد تكون صعبة
2. **المصطلحات المتخصصة** (voedselfabrikanten, etiket, glucose, wetgeving)
3. **الأفعال المعقدة** (verplichten, waarschuwen, voorschrijven)
4. **الصفات المتقدمة** (industriële, biologische, natuurlijke)
5. **الأسماء المركبة** (voedingsstoffen, suikergehalte, gezondheidsrisico's)
6. **كلمات مستوى B1 وأعلى**

❌ **لا تترجم أبداً:**
1. **أدوات التعريف**: de, het, een
2. **أدوات الربط**: en, of, maar, want, omdat, als, dat, door, om, voor
3. **الأفعال الأساسية** (< 6 أحرف): is, zijn, was, heeft, kan, wil, moet, gaat, komt, geeft
4. **حروف الجر**: in, op, van, voor, met, naar, uit, bij, over, onder
5. **الضمائر**: ik, jij, hij, zij, wij, ze, dit, dat, deze, die, wat, wie
6. **الكلمات الشائعة جداً**: ja, nee, niet, ook, veel, meer, nu, dan, nog, al
7. **الأرقام والتواريخ**
8. **الكلمات القصيرة** (< 6 أحرف) إلا إذا كانت متخصصة جداً

💡 **مبادئ الترجمة:**
- **الجودة > الكمية**: أفضل 15-25 كلمة مهمة من 100 كلمة بسيطة
- **سياقية**: ترجم الكلمة حسب معناها في النص
- **مفيدة**: ركز على الكلمات التي تساعد على فهم النص
- **طويلة**: الأولوية للكلمات الطويلة (6+ أحرف)

📊 **الحد الأقصى**: 
- لا تترجم أكثر من **30 كلمة** حتى لو كان النص طويل
- اختر الكلمات الأكثر أهمية وصعوبة

أرجع النتيجة بصيغة JSON:
{{
  "full_translation": "الترجمة الكاملة للنص بالعربية",
  "word_translations": {{
    "gemeente": "البلدية",
    "organiseert": "تنظم",
    "cursus": "دورة",
    "inwoners": "سكان",
    "september": "سبتمبر",
    "maanden": "أشهر"
  }}
}}

**مهم**: ترجم فقط الكلمات المهمة الطويلة (6+ أحرف)، وليس الكلمات البسيطة القصيرة!
"""
        
        try:
            response = self.model.generate_content(prompt)
            result = self._extract_json(response.text)
            return result
        except Exception as e:
            print(f"Translation error: {e}")
            return {
                "full_translation": "فشلت الترجمة",
                "word_translations": {}
            }
    
    def translate_words_batch(self, words: List[str], context: str = "") -> Dict[str, str]:
        """
        Translate a batch of Dutch words to Arabic
        
        Args:
            words: List of Dutch words to translate
            context: Optional context text for better translation
            
        Returns:
            Dictionary mapping Dutch words to Arabic translations
        """
        words_list = ", ".join(words)
        
        prompt = f"""ترجم الكلمات الهولندية التالية إلى العربية.

الكلمات: {words_list}

{f"السياق: {context}" if context else ""}

قواعد:
- ترجمة سياقية (حسب المعنى في السياق إن وُجد)
- ترجمة واحدة لكل كلمة
- إذا كانت الكلمة فعل، اذكر المصدر

أرجع النتيجة بصيغة JSON:
{{
  "word1": "ترجمة1",
  "word2": "ترجمة2",
  ...
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            translations = self._extract_json(response.text)
            return translations
        except Exception as e:
            print(f"Batch translation error: {e}")
            return {}
    
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
    translator = DutchToArabicTranslator()
    
    sample_text = """
    De gemeente Amsterdam organiseert een gratis cursus Nederlands voor nieuwe inwoners.
    De cursus begint op 1 september en duurt 3 maanden.
    """
    
    result = translator.translate_text_with_words(sample_text)
    print("Full translation:", result.get("full_translation"))
    print("\nWord translations:")
    for word, translation in result.get("word_translations", {}).items():
        print(f"  {word} → {translation}")
