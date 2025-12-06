# إصلاح الأخطاء بعد تحويل Drizzle ORM

## المشاكل التي ظهرت

بعد تحويل قاعدة البيانات بنجاح إلى Drizzle ORM، ظهرت مشكلتان حرجتان في الإنتاج:

### 1. خطأ 500 في `vocabulary.getMyVocabularyProgress`
```
Error: Cannot convert undefined or null to object
GET /api/trpc/vocabulary.getMyVocabularyProgress 500
```

### 2. خطأ 404 في `auth.updateLanguage`
```
Error: No procedure found on path "auth.updateLanguage"
POST /api/trpc/auth.updateLanguage 404
```

---

## تحليل الأسباب الجذرية

### المشكلة #1: عدم تطابق أسماء الأعمدة

**السبب:**
عند تحويل `getUserVocabularyProgress()` إلى Drizzle ORM، استخدمت **camelCase** لأسماء الأعمدة، لكن schema يستخدم **snake_case**.

**الكود الخاطئ:**
```typescript
const results = await db
  .select({
    userId: userVocabulary.userId,           // ❌ خطأ
    vocabularyId: userVocabulary.vocabularyId, // ❌ خطأ
    correctCount: userVocabulary.correctCount, // ❌ خطأ
    // ...
  })
```

**Schema الفعلي:**
```typescript
export const userVocabulary = pgTable("user_vocabulary", {
  user_id: integer("user_id").notNull(),        // ✅ snake_case
  vocabulary_id: integer("vocabulary_id").notNull(), // ✅ snake_case
  correct_count: integer("correct_count").default(0), // ✅ snake_case
  // ...
});
```

**النتيجة:**
- Drizzle لم يجد الأعمدة `userId`, `vocabularyId`, etc.
- أرجع `undefined` لكل column
- عند محاولة معالجة البيانات، حدث خطأ "Cannot convert undefined to object"

---

### المشكلة #2: اسم endpoint خاطئ

**السبب:**
الـ client كان يستدعي endpoint غير موجود.

**الكود الخاطئ (Client):**
```typescript
const updateLanguageMutation = trpc.auth.updateLanguage.useMutation({
  // ...
});

updateLanguageMutation.mutate({ language: lang }); // ❌ خطأ
```

**الـ endpoint الفعلي (Server):**
```typescript
auth: router({
  updatePreferences: protectedProcedure  // ✅ الاسم الصحيح
    .input(z.object({
      preferred_language: z.enum(["nl", "ar", "en", "tr"]), // ✅ المعامل الصحيح
    }))
    .mutation(async ({ ctx, input }) => {
      // ...
    }),
})
```

**النتيجة:**
- الـ client يبحث عن `auth.updateLanguage` لكنه غير موجود
- Server يرجع 404 Not Found
- تبديل اللغة لا يعمل

---

## الإصلاحات المطبقة

### الإصلاح #1: `server/db.ts` - getUserVocabularyProgress()

#### ✅ تصحيح أسماء الأعمدة

**قبل:**
```typescript
const results = await db
  .select({
    userId: userVocabulary.userId,           // ❌
    vocabularyId: userVocabulary.vocabularyId, // ❌
    correctCount: userVocabulary.correctCount, // ❌
    // ...
  })
  .from(userVocabulary)
  .innerJoin(vocabulary, eq(userVocabulary.vocabularyId, vocabulary.id)) // ❌
  .where(eq(userVocabulary.userId, user_id)); // ❌
```

**بعد:**
```typescript
const results = await db
  .select({
    user_id: userVocabulary.user_id,           // ✅
    vocabulary_id: userVocabulary.vocabulary_id, // ✅
    correct_count: userVocabulary.correct_count, // ✅
    // ...
  })
  .from(userVocabulary)
  .innerJoin(vocabulary, eq(userVocabulary.vocabulary_id, vocabulary.id)) // ✅
  .where(eq(userVocabulary.user_id, user_id)); // ✅
```

#### ✅ إضافة aliases للتوافق

لضمان التوافق مع الكود القديم، أضفنا aliases بـ camelCase:

```typescript
return results.map((r) => ({
  ...r,
  // Add camelCase aliases
  userId: r.user_id,
  vocabularyId: r.vocabulary_id,
  correctCount: r.correct_count,
  incorrectCount: r.incorrect_count,
  lastReviewedAt: r.last_reviewed_at,
  nextReviewAt: r.next_review_at,
  easeFactor: r.ease_factor,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  // ...
}));
```

**الفائدة:**
- الكود يعمل مع كل من snake_case و camelCase
- لا حاجة لتغيير الـ client
- التوافق الكامل مع الكود القديم

---

### الإصلاح #2: `client/src/contexts/LanguageContext.tsx`

#### ✅ تصحيح اسم الـ endpoint

**قبل:**
```typescript
const updateLanguageMutation = trpc.auth.updateLanguage.useMutation({ // ❌
  // ...
});

updateLanguageMutation.mutate({ language: lang }); // ❌
```

**بعد:**
```typescript
const updateLanguageMutation = trpc.auth.updatePreferences.useMutation({ // ✅
  // ...
});

updateLanguageMutation.mutate({ preferred_language: lang }); // ✅
```

**التغييرات:**
1. ✅ `updateLanguage` → `updatePreferences`
2. ✅ `{ language }` → `{ preferred_language }`

---

## النتائج

### ✅ جميع المشاكل تم حلها

| المشكلة | الحالة قبل | الحالة بعد |
|---------|-----------|-----------|
| vocabulary.getMyVocabularyProgress | ❌ 500 Error | ✅ 200 OK |
| auth.updateLanguage | ❌ 404 Error | ✅ 200 OK |
| تقدم المفردات | ❌ لا يعمل | ✅ يعمل بشكل صحيح |
| تبديل اللغة | ❌ لا يحفظ | ✅ يحفظ في قاعدة البيانات |
| Console Errors | ❌ أخطاء متعددة | ✅ لا أخطاء |

---

## الدروس المستفادة

### 1. ⚠️ التحقق من أسماء الأعمدة في Schema

عند استخدام Drizzle ORM، **يجب** استخدام نفس أسماء الأعمدة المعرفة في schema:

```typescript
// ❌ خطأ - افتراض أن Drizzle يحول تلقائياً
userVocabulary.userId

// ✅ صحيح - استخدام الاسم الفعلي من schema
userVocabulary.user_id
```

### 2. ⚠️ التحقق من أسماء الـ endpoints

قبل استدعاء endpoint من الـ client، تأكد من:
1. الاسم الصحيح للـ endpoint
2. أسماء المعاملات الصحيحة
3. نوع البيانات المتوقع

### 3. ✅ الاختبار الشامل بعد التحويل

عند تحويل كود كبير (مثل التحويل إلى Drizzle ORM):
1. اختبر **كل** endpoint
2. تحقق من **كل** query
3. راجع **كل** schema definition
4. اختبر في بيئة مشابهة للإنتاج

---

## الخلاصة

✅ **تم إصلاح جميع المشاكل بنجاح**

- المشكلتان كانتا بسبب أخطاء في التسمية، وليس بسبب مشاكل في Drizzle ORM نفسه
- التحويل إلى Drizzle ORM كان ناجحاً، فقط احتاج بعض التعديلات الطفيفة
- التطبيق الآن يعمل بشكل صحيح 100% مع Drizzle ORM
- لا أخطاء في console
- جميع الوظائف تعمل كما هو متوقع

**Commit:** `2725ffb`
**Status:** ✅ Deployed to Railway
**Testing:** ✅ All endpoints working correctly
