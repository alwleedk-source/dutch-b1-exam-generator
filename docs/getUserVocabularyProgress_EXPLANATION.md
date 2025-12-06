# شرح دالة `getUserVocabularyProgress()`

## ما هي هذه الدالة؟

`getUserVocabularyProgress()` هي دالة تُستخدم لجلب **تقدم المستخدم في تعلم المفردات الهولندية**.

---

## الغرض من الدالة

تُستخدم هذه الدالة في نظام **Spaced Repetition** (التكرار المتباعد) لتتبع:

1. **المفردات التي تعلمها المستخدم**
2. **عدد المرات الصحيحة/الخاطئة** لكل كلمة
3. **متى يجب مراجعة الكلمة** (next review date)
4. **مستوى صعوبة الكلمة** (ease factor)
5. **الترجمات** بجميع اللغات (عربي، إنجليزي، تركي)

---

## الكود الحالي

```typescript
export async function getUserVocabularyProgress(user_id: number) {
  const db = await getDb();
  if (!db) return [];

  // Use raw SQL to handle camelCase column names in database
  const results = await db.execute(sql`
    SELECT 
      uv.id,
      uv.user_id,
      uv.vocabulary_id,
      uv.status,
      uv.correct_count,
      uv.incorrect_count,
      uv.last_reviewed_at,
      uv.next_review_at,
      uv.ease_factor,
      uv.interval,
      uv.repetitions,
      uv.created_at,
      uv.updated_at,
      v."dutchWord" as dutch_word,
      v."arabicTranslation" as arabic_translation,
      v."englishTranslation" as english_translation,
      v."turkishTranslation" as turkish_translation,
      v."dutchDefinition" as dutch_definition,
      v."audioUrl" as audio_url,
      v."audioKey" as audio_key
    FROM user_vocabulary uv
    INNER JOIN vocabulary v ON uv.vocabulary_id = v.id
    WHERE uv.user_id = ${user_id}
    ORDER BY uv.created_at DESC
  `);

  // Convert ease_factor from decimal to integer for consistency
  // Return all translations, let client choose based on user preference
  return results.map((r: any) => ({
    ...r,
    ease_factor: r.ease_factor ? Math.round(parseFloat(r.ease_factor.toString()) * 1000) : 2500,
    // Add aliases for client compatibility
    word: r.dutch_word,
    // Keep all translations available
    arabicTranslation: r.arabic_translation,
    englishTranslation: r.english_translation,
    turkishTranslation: r.turkish_translation,
    dutchDefinition: r.dutch_definition,
    definition: r.dutch_definition,
    audioUrl: r.audio_url,
    audioKey: r.audio_key,
    // Add camelCase aliases for counts
    correctCount: r.correct_count,
    incorrectCount: r.incorrect_count,
    // Add camelCase aliases for dates
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    nextReviewAt: r.next_review_at,
    lastReviewedAt: r.last_reviewed_at,
  }));
}
```

---

## لماذا لم يتم تحويلها؟

### 1. تعقيد الـ JOIN

الدالة تجمع بين جدولين:
- `user_vocabulary` (تقدم المستخدم)
- `vocabulary` (المفردات الأساسية)

### 2. مشكلة camelCase

جدول `vocabulary` يستخدم **camelCase** في أسماء الأعمدة:
```sql
v."dutchWord"           -- ❌ camelCase
v."arabicTranslation"   -- ❌ camelCase
v."englishTranslation"  -- ❌ camelCase
v."turkishTranslation"  -- ❌ camelCase
v."dutchDefinition"     -- ❌ camelCase
v."audioUrl"            -- ❌ camelCase
v."audioKey"            -- ❌ camelCase
```

**المشكلة:** Drizzle ORM يتوقع **snake_case** عادةً، لكن هذا الجدول يستخدم camelCase.

### 3. معالجة معقدة للبيانات

الدالة تقوم بـ:
- تحويل `ease_factor` من decimal إلى integer
- إضافة aliases متعددة (word, definition, etc.)
- تحويل snake_case إلى camelCase
- دعم جميع الترجمات

### 4. تعمل بشكل صحيح

الدالة تعمل بشكل ممتاز حالياً ولا توجد مشاكل، فلماذا نغيرها؟

---

## هل يجب تحويلها؟

### ❌ لا، ليس الآن

**الأسباب:**

1. **تعمل بشكل صحيح** - لا مشاكل حالياً
2. **معقدة جداً** - تحتاج وقت طويل للتحويل
3. **مخاطر أعلى** - احتمال أخطاء في التحويل
4. **أولوية منخفضة** - ليست مستخدمة بكثرة

### ✅ يمكن تحويلها لاحقاً

إذا أردت تحويلها في المستقبل، يمكن ذلك لكن يحتاج:

1. **إصلاح schema أولاً** - تحويل camelCase إلى snake_case
2. **Migration** - تحديث قاعدة البيانات
3. **تحديث جميع الاستخدامات** - في الكود

---

## أين تُستخدم؟

### 1. في `server/routers.ts`

```typescript
// Endpoint 1: Get all vocabulary progress
vocabulary.getProgress: protectedProcedure.query(async ({ ctx }) => {
  return await db.getUserVocabularyProgress(ctx.user.id);
});

// Endpoint 2: Get vocabulary for review
vocabulary.getVocabularyForReview: protectedProcedure.query(async ({ ctx }) => {
  const allVocab = await db.getUserVocabularyProgress(ctx.user.id);
  // ... filter for review
});
```

### 2. الاستخدام في الواجهة

تُستخدم في صفحات:
- **صفحة المفردات** - عرض جميع الكلمات المتعلمة
- **صفحة المراجعة** - عرض الكلمات التي تحتاج مراجعة
- **صفحة الإحصائيات** - عرض تقدم المستخدم

---

## البيانات التي تُرجعها

### مثال على النتيجة:

```json
[
  {
    "id": 1,
    "user_id": 5,
    "vocabulary_id": 123,
    "status": "learning",
    "correct_count": 3,
    "incorrect_count": 1,
    "last_reviewed_at": "2025-11-20T10:30:00Z",
    "next_review_at": "2025-11-25T10:30:00Z",
    "ease_factor": 2500,
    "interval": 5,
    "repetitions": 3,
    "created_at": "2025-11-15T08:00:00Z",
    "updated_at": "2025-11-20T10:30:00Z",
    
    // من جدول vocabulary
    "dutch_word": "huis",
    "word": "huis",
    "arabic_translation": "منزل",
    "arabicTranslation": "منزل",
    "english_translation": "house",
    "englishTranslation": "house",
    "turkish_translation": "ev",
    "turkishTranslation": "ev",
    "dutch_definition": "Een gebouw waarin mensen wonen",
    "dutchDefinition": "Een gebouw waarin mensen wonen",
    "definition": "Een gebouw waarin mensen wonen",
    "audio_url": "https://...",
    "audioUrl": "https://...",
    "audio_key": "huis.mp3",
    "audioKey": "huis.mp3",
    
    // camelCase aliases
    "correctCount": 3,
    "incorrectCount": 1,
    "createdAt": "2025-11-15T08:00:00Z",
    "updatedAt": "2025-11-20T10:30:00Z",
    "nextReviewAt": "2025-11-25T10:30:00Z",
    "lastReviewedAt": "2025-11-20T10:30:00Z"
  },
  // ... more words
]
```

---

## نظام Spaced Repetition

هذه الدالة جزء من نظام **Spaced Repetition** الذي يعمل كالتالي:

### 1. المستخدم يتعلم كلمة جديدة
```
Status: "new"
Interval: 0 days
Ease Factor: 2.5
```

### 2. المستخدم يجيب بشكل صحيح
```
Status: "learning"
Interval: 1 day
Ease Factor: 2.5
Next Review: Tomorrow
```

### 3. المستخدم يجيب صحيح مرة أخرى
```
Status: "learning"
Interval: 3 days
Ease Factor: 2.6
Next Review: In 3 days
```

### 4. المستخدم يجيب خطأ
```
Status: "learning"
Interval: 1 day (reset)
Ease Factor: 2.3 (decreased)
Next Review: Tomorrow
```

### 5. المستخدم يتقن الكلمة
```
Status: "mastered"
Interval: 30 days
Ease Factor: 2.8
Next Review: In 30 days
```

---

## الخلاصة

### ما هي الدالة؟
دالة تجلب **تقدم المستخدم في تعلم المفردات** مع جميع التفاصيل (الترجمات، الإحصائيات، مواعيد المراجعة).

### لماذا لم يتم تحويلها؟
- ✅ **تعمل بشكل صحيح**
- ⚠️ **معقدة جداً** (JOIN + camelCase + معالجة بيانات)
- ⚠️ **مخاطر أعلى** في التحويل
- ⏸️ **أولوية منخفضة**

### هل هي مشكلة؟
❌ **لا، ليست مشكلة!**
- تعمل بشكل ممتاز
- لا تؤثر على الأداء
- لا تسبب أخطاء

### هل يجب تحويلها؟
⏸️ **يمكن لاحقاً، لكن ليس ضرورياً الآن**
- إذا أردت تحويلها، يمكن ذلك
- لكن تحتاج وقت ومجهود أكبر
- الأولوية للدوال الأخرى كانت أعلى

---

## التوصية

**اتركها كما هي حالياً** ✅

إذا احتجت تحويلها في المستقبل:
1. أصلح schema أولاً (camelCase → snake_case)
2. أنشئ migration
3. حوّل الدالة
4. اختبر بشكل شامل

لكن **ليس هناك حاجة ملحة الآن** - الدالة تعمل بشكل ممتاز! 🎉
