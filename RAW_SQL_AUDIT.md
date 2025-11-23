# تقرير فحص استخدام Raw SQL في قاعدة البيانات

## ملخص الفحص

تم فحص ملف `server/db.ts` بالكامل للتحقق من استخدام Drizzle ORM vs Raw SQL.

---

## النتيجة

❌ **ليس كل شيء يستخدم Drizzle ORM**

وجدت **19 استخدام لـ raw SQL** في الملف، معظمها في دوال نظام التقييم الجديد.

---

## الدوال التي تستخدم Raw SQL

### 1. نظام التقييم (Rating System) - 5 دوال

#### أ. `addOrUpdateRating()`
```typescript
// استخدامات raw SQL:
.from(sql`text_ratings`)  // ❌
.where(sql`text_id = ${textId} AND user_id = ${userId}`)  // ❌

await db.execute(
  sql`UPDATE text_ratings ...`  // ❌
);

await db.execute(
  sql`INSERT INTO text_ratings ...`  // ❌
);
```

**المشكلة:** استخدام `sql` template literals بدلاً من Drizzle schema

---

#### ب. `getUserRating()`
```typescript
const result = await db.execute(
  sql`SELECT * FROM text_ratings WHERE text_id = ${textId} AND user_id = ${userId} LIMIT 1`
);  // ❌
```

**المشكلة:** raw SQL query بدلاً من Drizzle query builder

---

#### ج. `getTextRatings()`
```typescript
const result = await db.execute(
  sql`SELECT 
        tr.*,
        u.name as user_name,
        u.email as user_email
      FROM text_ratings tr
      LEFT JOIN users u ON tr.user_id = u.id
      WHERE tr.text_id = ${textId}
      ORDER BY tr.created_at DESC`
);  // ❌
```

**المشكلة:** raw SQL مع JOIN

---

#### د. `getTextsWithRatings()`
```typescript
const result = await db.execute(
  sql`SELECT 
        t.*,
        u.name as creator_name,
        u.email as creator_email
      FROM texts t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.status = 'approved' ${minRatingFilter}
      ${sql.raw(orderByClause)}
      LIMIT ${options.limit || 50}
      OFFSET ${options.offset || 0}`
);  // ❌
```

**المشكلة:** raw SQL مع dynamic ORDER BY

---

#### هـ. `deleteRating()`
```typescript
await db.execute(
  sql`DELETE FROM text_ratings WHERE id = ${ratingId}`
);  // ❌
```

**المشكلة:** raw SQL للحذف

---

### 2. دوال المفردات (Vocabulary) - 2 دوال

#### أ. `getUserVocabularyProgress()`
```typescript
const result = await db.execute(sql`
  SELECT 
    COUNT(DISTINCT uv.word) as learned_count,
    (SELECT COUNT(*) FROM b1_dictionary) as total_count
  FROM user_vocabulary uv
  WHERE uv.user_id = ${user_id}
`);  // ❌
```

**المشكلة:** raw SQL مع subquery

---

#### ب. `updateUserVocabularyCount()`
```typescript
const result = await db.execute(sql`
  SELECT COUNT(DISTINCT word) as count
  FROM user_vocabulary
  WHERE user_id = ${user_id}
`);  // ❌
```

**المشكلة:** raw SQL للعد

---

## لماذا يجب تحويلها إلى Drizzle ORM؟

### المشاكل مع Raw SQL

1. **عدم الأمان من الأخطاء:**
   - لا type safety
   - أخطاء إملائية في أسماء الأعمدة لا تُكتشف حتى runtime

2. **صعوبة الصيانة:**
   - تغيير schema يتطلب تحديث يدوي لكل query
   - لا autocomplete في IDE

3. **عدم الاتساق:**
   - بعض الدوال تستخدم Drizzle، بعضها raw SQL
   - يصعب فهم الكود

4. **مشاكل محتملة:**
   - SQL injection (رغم أن template literals آمنة نسبياً)
   - مشاكل في التوافق بين قواعد البيانات المختلفة

### الفوائد من استخدام Drizzle ORM

1. **Type Safety ✅**
   ```typescript
   // Drizzle - type safe
   const ratings = await db.select().from(textRatings).where(eq(textRatings.textId, textId));
   
   // Raw SQL - no type safety
   const result = await db.execute(sql`SELECT * FROM text_ratings WHERE text_id = ${textId}`);
   ```

2. **Autocomplete ✅**
   - IDE يعرف جميع الأعمدة المتاحة
   - لا أخطاء إملائية

3. **Query Builder ✅**
   - أسهل في القراءة والكتابة
   - يمكن بناء queries ديناميكية بسهولة

4. **Consistency ✅**
   - كل الكود يستخدم نفس الأسلوب
   - أسهل للصيانة

---

## الحل المقترح

### المرحلة 1: إضافة text_ratings schema

أولاً، يجب إضافة `textRatings` schema في `drizzle/schema.ts`:

```typescript
export const textRatings = pgTable("text_ratings", {
  id: serial("id").primaryKey(),
  textId: integer("text_id").notNull().references(() => texts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TextRating = typeof textRatings.$inferSelect;
export type InsertTextRating = typeof textRatings.$inferInsert;
```

### المرحلة 2: تحويل الدوال

#### مثال: `addOrUpdateRating()` - قبل وبعد

**قبل (Raw SQL):**
```typescript
const existingRating = await db
  .select()
  .from(sql`text_ratings`)
  .where(sql`text_id = ${textId} AND user_id = ${userId}`)
  .limit(1);

if (existingRating.length > 0) {
  await db.execute(
    sql`UPDATE text_ratings 
        SET rating = ${rating}, comment = ${comment || null}, updated_at = NOW() 
        WHERE text_id = ${textId} AND user_id = ${userId}`
  );
} else {
  await db.execute(
    sql`INSERT INTO text_ratings (text_id, user_id, rating, comment) 
        VALUES (${textId}, ${userId}, ${rating}, ${comment || null})`
  );
}
```

**بعد (Drizzle ORM):**
```typescript
const existingRating = await db
  .select()
  .from(textRatings)
  .where(and(
    eq(textRatings.textId, textId),
    eq(textRatings.userId, userId)
  ))
  .limit(1);

if (existingRating.length > 0) {
  await db
    .update(textRatings)
    .set({ 
      rating, 
      comment: comment || null,
      updatedAt: new Date()
    })
    .where(and(
      eq(textRatings.textId, textId),
      eq(textRatings.userId, userId)
    ));
} else {
  await db
    .insert(textRatings)
    .values({
      textId,
      userId,
      rating,
      comment: comment || null
    });
}
```

---

## الخطة

### ✅ ما يجب فعله

1. **إضافة schema للتقييمات**
   - إنشاء `textRatings` في `drizzle/schema.ts`
   - تصدير types

2. **تحويل دوال التقييم**
   - `addOrUpdateRating()` → Drizzle
   - `getUserRating()` → Drizzle
   - `getTextRatings()` → Drizzle with JOIN
   - `getTextsWithRatings()` → Drizzle (أو حذفها لأننا نستخدم `listPublicTexts` الآن)
   - `deleteRating()` → Drizzle

3. **تحويل دوال المفردات**
   - `getUserVocabularyProgress()` → Drizzle with subquery
   - `updateUserVocabularyCount()` → Drizzle with count

### ⚠️ ملاحظات مهمة

- **`getTextsWithRatings()` لم تعد مستخدمة!**
  - تم استبدالها بـ `listPublicTexts()` في آخر تحديث
  - يمكن حذفها أو تحويلها للاحتياط

- **الأولوية:**
  1. دوال التقييم (مستخدمة حالياً)
  2. دوال المفردات (مستخدمة حالياً)
  3. `getTextsWithRatings()` (غير مستخدمة - أولوية منخفضة)

---

## التوصية

**نعم، يجب تحويل كل شيء إلى Drizzle ORM** للأسباب التالية:

1. ✅ **Consistency** - كل الكود بنفس الأسلوب
2. ✅ **Type Safety** - منع الأخطاء في وقت التطوير
3. ✅ **Maintainability** - أسهل في الصيانة والتطوير
4. ✅ **Best Practices** - استخدام ORM هو best practice

---

## هل تريد أن أقوم بالتحويل الآن؟

يمكنني:
1. إضافة `textRatings` schema
2. تحويل جميع دوال التقييم إلى Drizzle ORM
3. تحويل دوال المفردات إلى Drizzle ORM
4. حذف أو تحديث `getTextsWithRatings()` غير المستخدمة

**الوقت المتوقع:** 15-20 دقيقة
**الفائدة:** كود أنظف، أكثر أماناً، وأسهل في الصيانة
