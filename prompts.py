"""
Prompt templates for Dutch B1 exam generation
"""

SYSTEM_PROMPT = """أنت خبير متخصص في تصميم امتحانات اللغة الهولندية مستوى B1 حسب معايير CEFR الأوروبية.
لديك خبرة واسعة في امتحانات Inburgering و Staatsexamen NT2.

مهمتك هي تحليل النصوص الهولندية وإنشاء أسئلة امتحان قراءة احترافية تحاكي الامتحانات الرسمية.

معايير مستوى B1:
- يستطيع المتعلم فهم نصوص واضحة عن مواضيع مألوفة
- يستطيع فهم الأفكار الرئيسية في نصوص الحياة اليومية
- المفردات: 2000-2500 كلمة
- القواعد: جمل متوسطة التعقيد

أنواع النصوص في امتحان B1:
- رسائل رسمية من البلدية (gemeente)
- إعلانات من الصحف
- إشعارات من أماكن العمل
- نصوص معلوماتية عن الحياة في هولندا
"""

ANALYSIS_PROMPT = """حلل النص الهولندي التالي بدقة:

النص:
{text}

قدم تحليلاً شاملاً يتضمن:
1. نوع النص (رسالة رسمية، إعلان، مقال، إشعار، إلخ)
2. الموضوع الرئيسي
3. مستوى الصعوبة المقدر (A2, B1, B2)
4. الأفكار الرئيسية (3-5 نقاط)
5. الكلمات المفتاحية المهمة
6. الطابع (رسمي/غير رسمي/معلوماتي)

أرجع النتيجة بصيغة JSON:
{{
  "text_type": "نوع النص",
  "main_topic": "الموضوع الرئيسي",
  "difficulty_level": "المستوى",
  "key_ideas": ["فكرة 1", "فكرة 2", ...],
  "key_words": ["كلمة 1", "كلمة 2", ...],
  "tone": "الطابع"
}}
"""

QUESTION_GENERATION_PROMPT = """بناءً على التحليل السابق، ولّد امتحان قراءة احترافي لمستوى B1.

النص:
{text}

التحليل:
{analysis}

المتطلبات:
1. ولّد {num_questions} أسئلة متنوعة
2. التوزيع المطلوب:
   - 30% Globalverstehen (فهم عام) - سهلة
   - 30% Detailverstehen (فهم التفاصيل) - متوسطة
   - 20% Woordbetekenis (معنى الكلمات) - متوسطة
   - 10% Tekstdoel (هدف النص) - صعبة
   - 10% Inferentie (استنتاج) - صعبة

3. قواعد مهمة:
   ✅ كل سؤال يجب أن يكون قابل للإجابة من النص فقط
   ✅ الخيارات الخاطئة يجب أن تكون معقولة ومنطقية (ليست سخيفة)
   ✅ استخدم اللغة الهولندية في صياغة الأسئلة
   ✅ لا تكرر نفس المعلومة في أكثر من سؤال
   ✅ الخيارات يجب أن تكون متقاربة في الطول
   ✅ رتب الأسئلة من السهل إلى الصعب

4. صيغ الأسئلة المفضلة:
   - Globalverstehen: "Waar gaat deze tekst over?", "Wat is het hoofdonderwerp?"
   - Detailverstehen: "Wanneer...?", "Waar...?", "Hoeveel...?", "Wie...?"
   - Woordbetekenis: "Wat betekent het woord '...' in de tekst?"
   - Tekstdoel: "Waarom heeft de schrijver deze tekst geschreven?"
   - Inferentie: "Wat kun je concluderen uit deze tekst?"

أرجع النتيجة بصيغة JSON:
{{
  "exam_title": "عنوان الامتحان",
  "total_questions": {num_questions},
  "questions": [
    {{
      "id": 1,
      "type": "نوع السؤال",
      "difficulty": "easy/medium/hard",
      "question_nl": "السؤال بالهولندية",
      "question_ar": "السؤال بالعربية (اختياري)",
      "options": [
        {{"id": "a", "text": "الخيار الأول", "correct": false}},
        {{"id": "b", "text": "الخيار الثاني", "correct": true}},
        {{"id": "c", "text": "الخيار الثالث", "correct": false}},
        {{"id": "d", "text": "الخيار الرابع (اختياري)", "correct": false}}
      ],
      "explanation": "شرح مختصر لماذا هذه الإجابة صحيحة"
    }}
  ]
}}

مهم جداً: تأكد من أن كل سؤال يختبر فهماً حقيقياً وليس مجرد نسخ من النص.
"""

VERIFICATION_PROMPT = """راجع الأسئلة التالية وتحقق من جودتها:

الأسئلة:
{questions}

النص الأصلي:
{text}

تحقق من:
1. ✅ هل كل سؤال قابل للإجابة من النص؟
2. ✅ هل الخيارات الخاطئة معقولة ومنطقية؟
3. ✅ هل هناك تكرار في المعلومات المختبرة؟
4. ✅ هل مستوى الصعوبة مناسب لـ B1؟
5. ✅ هل التوزيع بين أنواع الأسئلة متوازن؟
6. ✅ هل الأسئلة مرتبة من السهل إلى الصعب؟

إذا وجدت أي مشاكل، قدم اقتراحات للتحسين.

أرجع النتيجة بصيغة JSON:
{{
  "quality_score": "درجة من 10",
  "issues_found": ["مشكلة 1", "مشكلة 2", ...],
  "suggestions": ["اقتراح 1", "اقتراح 2", ...],
  "approved": true/false
}}
"""

FEW_SHOT_EXAMPLES = """
أمثلة على أسئلة جيدة:

مثال 1 - Globalverstehen (سهل):
النص: "De gemeente Amsterdam organiseert een gratis cursus Nederlands voor nieuwe inwoners. De cursus begint op 1 september en duurt 3 maanden."

✅ سؤال جيد:
Waar gaat deze tekst over?
a) Een betaalde cursus Engels
b) Een gratis cursus Nederlands ✅
c) Een cursus van 6 maanden

---

مثال 2 - Detailverstehen (متوسط):
النص: "De vergadering vindt plaats op dinsdag 15 maart om 14:00 uur in kamer 305."

✅ سؤال جيد:
Wanneer is de vergadering?
a) Op maandag 15 maart om 14:00 uur
b) Op dinsdag 15 maart om 14:00 uur ✅
c) Op woensdag 15 maart om 14:00 uur

---

مثال 3 - Woordbetekenis (متوسط):
النص: "Het aanbod is geldig tot eind deze maand. Daarna betaalt u de normale prijs."

✅ سؤال جيد:
Wat betekent "aanbod" in deze tekst?
a) Vraag
b) Korting of speciale prijs ✅
c) Probleem

---

مثال 4 - Tekstdoel (صعب):
النص: "Beste klant, Helaas moeten we u mededelen dat uw bestelling vertraagd is. We doen ons best om het probleem op te lossen."

✅ سؤال جيد:
Waarom heeft het bedrijf deze brief geschreven?
a) Om te klagen over de klant
b) Om de klant te informeren over een vertraging ✅
c) Om een nieuwe bestelling te vragen

---

الآن استخدم هذه الأمثلة كمرجع لإنشاء أسئلة مشابهة في الجودة.
"""
