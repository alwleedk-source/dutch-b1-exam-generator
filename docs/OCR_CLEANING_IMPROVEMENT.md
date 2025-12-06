# OCR Text Cleaning - تحسين استخراج النص من الصور

## 🐛 المشكلة

عند رفع صورة لإنشاء امتحان، OCR (Tesseract) يستخرج نص مليء بأخطاء:

### مثال من exam/58:
```
Wat moet mijn vader doen op een bedrijfsfeest a IA n t | Ee | Ek SE \ EN £ 5 NA An "We Dl ON DE ED << WW 2 * + J EG EN © Ab bee ee! \ j > > + «- fl Het bedrijf van mijn vaders
```

**المشاكل:**
- ✅ حروف وأرقام عشوائية: `a IA n t | Ee | Ek SE`
- ✅ رموز غريبة: `£ 5 NA An "We Dl ON`
- ✅ أسهم ورموز: `<< WW 2 * + J EG EN ©`
- ✅ نص مشوه تماماً

---

## ✅ الحل المُنفذ

### 1. إضافة دالة `cleanOCRText` في `server/lib/gemini.ts`

```typescript
/**
 * Clean and correct OCR-extracted text using Gemini AI
 * Removes OCR artifacts, fixes spelling errors, and improves readability
 */
export async function cleanOCRText(text: string): Promise<string> {
  const response = await generateWithGemini({
    messages: [
      {
        role: "user",
        parts: `Je bent een expert in het corrigeren van OCR-gescande Nederlandse teksten.

Taak: Corrigeer de volgende tekst die is geëxtraheerd uit een afbeelding met OCR. De tekst bevat veel fouten zoals:
- Vreemde tekens en symbolen (|, \\, £, *, +, etc.)
- Verkeerd herkende letters
- Ontbrekende spaties
- Extra spaties
- Zinnen die door elkaar lopen

Corrigeer de tekst en maak deze leesbaar, maar:
- Behoud de originele betekenis
- Behoud de structuur (paragrafen, lijnen)
- Verwijder ALLE vreemde symbolen en tekens
- Corrigeer spelfouten
- Voeg ontbrekende leestekens toe
- Zorg dat de tekst grammaticaal correct is

Originele OCR tekst:
${text}

Geef ALLEEN de gecorrigeerde tekst terug, zonder uitleg of opmerkingen.`,
      },
    ],
    temperature: 0.3, // Lower temperature for more accurate corrections
    maxOutputTokens: 4096,
    responseFormat: "text",
  });

  return response.trim();
}
```

**المميزات:**
- ✅ يستخدم Gemini AI لتصحيح النص
- ✅ Temperature منخفضة (0.3) للدقة
- ✅ يحافظ على المعنى والبنية الأصلية
- ✅ يزيل جميع الرموز الغريبة
- ✅ يصحح الأخطاء الإملائية
- ✅ يضيف علامات الترقيم المفقودة

---

### 2. تحديث `extractTextFromImage` في `server/lib/ocr.ts`

```typescript
export async function extractTextFromImage(imageBuffer: Buffer | string): Promise<{
  text: string;
  confidence: number;
  isTruncated: boolean;
  cleaned: boolean; // ✨ جديد
}> {
  const worker = await createWorker('nld');
  
  try {
    const { data } = await worker.recognize(imageBuffer);
    
    let extractedText = data.text.trim();
    let isTruncated = false;
    let cleaned = false;
    
    // Enforce 6000 character limit BEFORE cleaning
    if (extractedText.length > MAX_TEXT_LENGTH) {
      extractedText = extractedText.substring(0, MAX_TEXT_LENGTH);
      isTruncated = true;
    }
    
    // ✨ جديد: Clean OCR text with Gemini AI if it contains errors
    // Check for common OCR artifacts
    const hasOCRErrors = /[|\\£*+<>{}\[\]~`]/.test(extractedText) || 
                        /[A-Z]{3,}/.test(extractedText) || // Multiple consecutive capitals
                        /\s{3,}/.test(extractedText);      // Multiple consecutive spaces
    
    if (hasOCRErrors) {
      console.log('[OCR] Detected OCR errors, cleaning with Gemini AI...');
      try {
        const { cleanOCRText } = await import('./gemini');
        extractedText = await cleanOCRText(extractedText);
        cleaned = true;
        console.log('[OCR] Text cleaned successfully');
      } catch (error) {
        console.error('[OCR] Failed to clean text with Gemini:', error);
        // Continue with uncleaned text
      }
    }
    
    return {
      text: extractedText,
      confidence: data.confidence,
      isTruncated,
      cleaned, // ✨ جديد
    };
  } finally {
    await worker.terminate();
  }
}
```

**التحسينات:**
1. ✅ **كشف تلقائي للأخطاء:**
   - رموز غريبة: `|`, `\\`, `£`, `*`, `+`, `<`, `>`, `{`, `}`, `[`, `]`, `~`, `` ` ``
   - حروف كبيرة متتالية: `ABCDE`
   - مسافات متعددة: `   `

2. ✅ **تنظيف ذكي:**
   - فقط إذا تم اكتشاف أخطاء
   - يستخدم Gemini AI
   - يسجل في console

3. ✅ **معالجة الأخطاء:**
   - إذا فشل التنظيف، يستمر بالنص الأصلي
   - لا يعطل العملية

4. ✅ **معلومات إضافية:**
   - `cleaned: boolean` - هل تم تنظيف النص؟

---

## 🔄 سير العمل الجديد

### قبل:
```
1. رفع صورة
2. OCR (Tesseract) يستخرج النص
3. النص المليء بالأخطاء يُحفظ مباشرة
4. ❌ الامتحان يحتوي على نص غير قابل للقراءة
```

### بعد:
```
1. رفع صورة
2. OCR (Tesseract) يستخرج النص
3. ✨ كشف الأخطاء تلقائياً
4. ✨ Gemini AI ينظف ويصحح النص
5. ✅ النص النظيف يُحفظ
6. ✅ الامتحان يحتوي على نص قابل للقراءة
```

---

## 📊 أمثلة التحسين

### مثال 1:
**قبل:**
```
Wat moet mijn vader doen op een bedrijfsfeest a IA n t | Ee | Ek SE \ EN £ 5 NA An
```

**بعد (متوقع):**
```
Wat moet mijn vader doen op een bedrijfsfeest?
```

### مثال 2:
**قبل:**
```
Het bedrijf van mijn vaders << WW 2 * + J EG EN © Ab bee ee! \ j > > + «- fl
```

**بعد (متوقع):**
```
Het bedrijf van mijn vader
```

---

## 🧪 الاختبار

### لاختبار التحسين:
1. رفع صورة بنص هولندي
2. انتظر استخراج النص
3. تحقق من console logs:
   ```
   [OCR] Detected OCR errors, cleaning with Gemini AI...
   [OCR] Text cleaned successfully
   ```
4. تحقق من النص في صفحة إنشاء الامتحان
5. أنشئ امتحان وتحقق من النص في الامتحان

---

## 📁 الملفات المعدلة

1. **server/lib/gemini.ts**
   - ✨ إضافة `cleanOCRText()` function

2. **server/lib/ocr.ts**
   - ✨ تحديث `extractTextFromImage()` لاستخدام التنظيف التلقائي
   - ✨ إضافة `cleaned` flag في النتيجة

---

## 💡 ملاحظات

### المزايا:
- ✅ تحسين جودة النص بشكل كبير
- ✅ تلقائي - لا يحتاج تدخل المستخدم
- ✅ ذكي - يكتشف الأخطاء فقط
- ✅ آمن - لا يعطل العملية إذا فشل

### القيود:
- ⚠️ يستغرق وقت إضافي (5-10 ثواني) لـ Gemini API
- ⚠️ يستهلك tokens من Gemini API
- ⚠️ يعتمد على جودة Gemini في فهم السياق

### التحسينات المستقبلية:
- 💡 إضافة cache للنصوص المنظفة
- 💡 إضافة خيار للمستخدم لتعطيل التنظيف
- 💡 عرض النص قبل وبعد التنظيف للمقارنة

---

## 🎯 الخلاصة

✅ **تم إضافة تنظيف تلقائي للنصوص المستخرجة من الصور باستخدام Gemini AI**

**النتيجة:**
- النصوص المستخرجة من الصور ستكون **نظيفة وقابلة للقراءة**
- الامتحانات المُنشأة من الصور ستكون **ذات جودة عالية**
- المستخدمون لن يحتاجوا إلى **تصحيح يدوي** للنصوص

**جاهز للاختبار! 🚀**
