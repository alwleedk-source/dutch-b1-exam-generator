# تصميم نظام التقييم للامتحانات

## الهدف
السماح للطلاب بتقييم الامتحانات (النصوص) وعرض التقييمات في صفحة public-exams للمساعدة في اختيار أفضل الامتحانات.

## البنية

### جدول قاعدة البيانات: text_ratings

```sql
CREATE TABLE text_ratings (
  id SERIAL PRIMARY KEY,
  text_id INTEGER NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(text_id, user_id) -- كل مستخدم يمكنه تقييم النص مرة واحدة فقط
);

CREATE INDEX idx_text_ratings_text_id ON text_ratings(text_id);
CREATE INDEX idx_text_ratings_user_id ON text_ratings(user_id);
```

### إضافة حقول للنصوص

```sql
ALTER TABLE texts ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE texts ADD COLUMN total_ratings INTEGER DEFAULT 0;
```

## المميزات

### 1. تقييم النص (1-5 نجوم)
- يمكن للمستخدم تقييم النص بعد إكمال الامتحان
- نظام 5 نجوم (1 = سيء جداً، 5 = ممتاز)
- تعليق اختياري

### 2. عرض التقييمات
- متوسط التقييم لكل نص
- عدد التقييمات الكلي
- التقييمات الفردية مع التعليقات

### 3. الفلترة والترتيب
- ترتيب حسب الأعلى تقييماً
- فلترة حسب الحد الأدنى للتقييم (مثلاً: 4 نجوم فما فوق)
- عرض "الأكثر توصية" (Most Recommended)

## API Endpoints

### 1. إضافة/تحديث تقييم
```typescript
rateText: protectedProcedure
  .input(z.object({
    text_id: z.number(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }))
  .mutation()
```

### 2. جلب تقييمات نص معين
```typescript
getTextRatings: publicProcedure
  .input(z.object({ text_id: z.number() }))
  .query()
```

### 3. جلب تقييم المستخدم لنص معين
```typescript
getUserRating: protectedProcedure
  .input(z.object({ text_id: z.number() }))
  .query()
```

### 4. جلب النصوص مع التقييمات
```typescript
getTextsWithRatings: publicProcedure
  .input(z.object({
    minRating: z.number().optional(),
    sortBy: z.enum(['rating', 'date', 'popular']).optional(),
  }))
  .query()
```

## UI Components

### 1. مكون التقييم (RatingStars)
- عرض النجوم (للقراءة فقط أو تفاعلي)
- عرض متوسط التقييم
- عرض عدد التقييمات

### 2. نموذج التقييم (RatingForm)
- اختيار عدد النجوم
- حقل التعليق الاختياري
- زر الحفظ

### 3. قائمة التقييمات (RatingsList)
- عرض جميع التقييمات
- اسم المستخدم
- التقييم
- التعليق
- التاريخ

## التكامل مع الصفحات

### صفحة public-exams
- عرض متوسط التقييم لكل نص
- فلترة حسب التقييم
- ترتيب حسب الأعلى تقييماً
- badge للنصوص الأعلى تقييماً (4.5+)

### صفحة TakeExam
- عرض نموذج التقييم بعد إكمال الامتحان
- عرض التقييمات السابقة للنص

### صفحة Admin
- عرض متوسط التقييم في قائمة النصوص
- إمكانية حذف التقييمات غير اللائقة
