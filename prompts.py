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

QUESTION_GENERATION_PROMPT = """بناءً على التحليل السابق، ولّد امتحان قراءة احترافي لمستوى B1 يحاكي الامتحانات الرسمية الهولندية.

النص:
{text}

التحليل:
{analysis}

⚠️ **قواعد ذهبية - إلزامية (من امتحانات B1 الرسمية):**

1. **Paraphrasing (إعادة الصياغة) - إلزامي 100%:**
   - ✅ السؤال يجب أن يستخدم كلمات مختلفة عن النص
   - ✅ الإجابة الصحيحة يجب أن تكون بصياغة مختلفة
   - ❌ لا تنسخ نفس الكلمات من النص
   
   مثال من امتحان رسمي:
   النص: "De centrale bakkerij werkt op een industriële manier met machines"
   ❌ سؤال سيء: "Waar werkt men met machines?"
   ✅ سؤال جيد: "Karl houdt van techniek. Welke werkplek past bij hem?"

2. **Sophisticated Distractors (خيارات مربكة متطورة):**
   - ✅ جميع الخيارات يجب أن تكون مذكورة في النص
   - ✅ واحد فقط يجيب على السؤال بشكل صحيح
   - ✅ الخيارات الخاطئة منطقية لكن لسياق مختلف
   
   مثال من امتحان رسمي:
   السؤال: "Joshua wil in de decentrale bakkerij werken. Hoe laat moet hij beginnen?"
   a) tussen 2.00 en 4.00 uur ← مذكور في النص (لكن للسائقين)
   b) om 7.00 uur ← ✅ الإجابة الصحيحة (للمخبز اللامركزي)
   c) om 17.00 uur ← مذكور في النص (لكن وقت الإغلاق)

3. **3 خيارات فقط (A, B, C):**
   - ✅ دائماً 3 خيارات فقط
   - ❌ لا تضع خيار D أبداً
   - هذا هو المعيار في امتحانات B1 الرسمية

4. **يتطلب فهم عميق:**
   - ✅ لا يمكن الإجابة بمجرد البحث عن كلمة
   - ✅ يتطلب فهم السياق والعلاقات
   - ✅ يتطلب ربط معلومات من أجزاء مختلفة
   - ❌ لا أسئلة سهلة يمكن الإجابة عليها بالتخمين

---

**المتطلبات:**

1. ولّد {num_questions} أسئلة متنوعة

2. **أنواع الأسئلة (حسب الامتحانات الرسمية):**
   - **Detail questions (40%):** عن تفاصيل محددة (لكن بإعادة صياغة)
     مثال: "Hoe laat moet hij beginnen?", "Waar vindt de vergadering plaats?"
   
   - **Inference questions (40%):** تتطلب استنتاج وربط معلومات
     مثال: "Welke werkplek past bij hem?", "Wat heeft [naam] nodig om...?"
   
   - **Main idea questions (20%):** عن الهدف العام للنص
     مثال: "Wat is het doel van deze tekst?"

3. **مستوى الصعوبة:**
   - Medium: 50-60% من الأسئلة
   - Hard: 40-50% من الأسئلة
   - ❌ لا أسئلة سهلة (easy)

4. **أمثلة من امتحانات B1 الرسمية:**

   **مثال 1 - Detail Question (Medium):**
   ```
   النص: "In de centrale bakkerij wordt van 5.00 uur tot 23.00 uur gewerkt.
           In de decentrale bakkerij start je om 7.00 uur.
           Chauffeurs leveren tussen 2.00 en 4.00 uur."
   
   السؤال: "Joshua wil in de decentrale bakkerij werken. Hoe laat moet hij beginnen?"
   a) tussen 2.00 en 4.00 uur ← مذكور (السائقون)
   b) om 7.00 uur ← ✅ الإجابة الصحيحة
   c) om 17.00 uur ← مذكور (وقت الإغلاق)
   ```

   **مثال 2 - Inference Question (Hard):**
   ```
   النص: "De centrale bakkerij werkt op een industriële manier. Door techniek kunnen we 
           per uur wel 1500 appeltaarten maken. Heb je gevoel voor techniek en machines..."
   
   السؤال: "Karl houdt van techniek. Welke werkplek past bij hem?"
   a) de centrale bakkerij ← ✅ الإجابة الصحيحة (تستخدم machines)
   b) de decentrale bakkerij ← مذكور (لكن لا تركز على techniek)
   c) de proefbakkerij ← مذكور (لكن للتطوير)
   ```

   **مثال 3 - Main Idea Question (Hard):**
   ```
   النص: [نص عن وظائف في Marké bakkerij]
   
   السؤال: "Wat is het doel van deze tekst?"
   a) de lezer informeren over de werkprocessen ← جزئياً صحيح
   b) de lezer overhalen om te solliciteren ← ✅ الإجابة الصحيحة
   c) de lezer uitleggen hoe professioneel de afdelingen zijn ← جزئياً صحيح
   ```

5. **تنسيق النص المطلوب:**
   - قم بإعادة صياغة النص الأصلي بشكل منظم ومنسق
   - أضف عنوان رئيسي واضح في السطر الأول
   - قسّم النص إلى فقرات منطقية (كل فقرة في سطر منفصل)
   - أضف عناوين فرعية إذا كان النص يحتوي على أقسام مختلفة
   - استخدم سطر جديد (\n) بين كل فقرة
   - احتفظ بنفس المحتوى والمعنى، فقط حسّن التنسيق

---

**أرجع النتيجة بصيغة JSON:**
{{
  "exam_title": "عنوان الامتحان",
  "formatted_text": "النص المنسق مع عناوين وفقرات (استخدم \n للفصل)",
  "total_questions": {num_questions},
  "questions": [
    {{
      "id": 1,
      "type": "detail/inference/main_idea",
      "difficulty": "medium/hard",
      "question_nl": "السؤال بالهولندية (بإعادة صياغة - ليس نفس كلمات النص)",
      "question_ar": "السؤال بالعربية (اختياري)",
      "options": [
        {{"id": "a", "text": "خيار من النص - سياق مختلف", "correct": false}},
        {{"id": "b", "text": "الإجابة الصحيحة - بإعادة صياغة", "correct": true}},
        {{"id": "c", "text": "خيار من النص - سياق مختلف", "correct": false}}
      ],
      "explanation": "شرح مختصر لماذا هذه الإجابة صحيحة"
    }}
  ]
}}

⚠️ **تذكر - هذه قواعد إلزامية:**
- Paraphrasing إلزامي في كل سؤال (استخدم كلمات مختلفة)
- جميع الخيارات من النص (لكن واحد فقط يجيب على السؤال)
- 3 خيارات فقط (A, B, C) - لا تضع D
- يتطلب فهم عميق (ليس بحث عن كلمة)
- لا أسئلة سهلة - فقط medium و hard
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
