# 🚀 دليل النشر على Coolify

## ✅ تم رفع التغييرات إلى GitHub

جميع التغييرات تم رفعها بنجاح إلى المستودع:
```
https://github.com/alwleedk-source/dutch-b1-exam-generator
```

---

## 📊 قاعدة البيانات - لديك 3 خيارات:

### ✨ الخيار 1: التهجير التلقائي (موصى به) ⭐

**لا تحتاج لفعل أي شيء!**

عند إعادة نشر التطبيق على Coolify، سيتم تشغيل migrations تلقائياً:

```bash
# هذا يحدث تلقائياً عند npm start
npm run migrate
```

الـ migration الجديد موجود في:
- `migrations/1764513010_add_moderation_enhancements.sql`
- تم إضافته إلى `server/runMigrations.ts`

**الخطوات:**
1. ✅ افتح Coolify
2. ✅ اذهب إلى مشروعك
3. ✅ اضغط "Redeploy" أو "Deploy"
4. ✅ انتظر حتى ينتهي البناء
5. ✅ سيتم تشغيل migrations تلقائياً!

---

### 🔧 الخيار 2: تشغيل SQL يدوياً

إذا كنت تفضل التحكم الكامل:

```sql
-- اتصل بقاعدة البيانات وشغّل هذا:

-- Forum Warnings table
CREATE TABLE IF NOT EXISTS forum_warnings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moderator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE SET NULL,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Forum Moderator Notes table
CREATE TABLE IF NOT EXISTS forum_moderator_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moderator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_forum_warnings_user_id ON forum_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_warnings_created_at ON forum_warnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_moderator_notes_user_id ON forum_moderator_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_reports(status);
CREATE INDEX IF NOT EXISTS idx_forum_reports_created_at ON forum_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_moderation_actions_created_at ON forum_moderation_actions(created_at DESC);
```

**كيف تصل لقاعدة البيانات:**
1. افتح Coolify
2. اذهب إلى قاعدة البيانات
3. اضغط "Connect" أو "psql"
4. الصق الكود أعلاه

---

### 🌐 الخيار 3: أعطني رابط القاعدة

إذا أعطيتني:
- Database URL
- أو (Host, Port, Database Name, Username, Password)

سأقوم أنا بتشغيل الـ migration مباشرة.

---

## 🎯 التوصية

**استخدم الخيار 1 (التهجير التلقائي)**

لأن:
- ✅ آمن - الـ migration يستخدم `IF NOT EXISTS`
- ✅ تلقائي - لا حاجة لأي إجراء يدوي
- ✅ موثق - كل شيء مسجل في Git
- ✅ قابل للتكرار - يعمل في أي بيئة

---

## 📝 التحقق من نجاح الـ Migration

بعد النشر، تحقق من logs في Coolify:

```
[Migrations] Starting migrations...
[Migrations] Running 1764513010_add_moderation_enhancements.sql...
[Migrations] ✅ 1764513010_add_moderation_enhancements.sql completed successfully
[Migrations] All migrations completed successfully!
```

أو تحقق من قاعدة البيانات:
```sql
-- تحقق من الجداول الجديدة
SELECT * FROM forum_warnings LIMIT 1;
SELECT * FROM forum_moderator_notes LIMIT 1;

-- تحقق من الـ indexes
\d forum_warnings
\d forum_moderator_notes
```

---

## 🔍 الوصول إلى الميزات الجديدة

بعد النشر الناجح:

1. **لوحة المشرف:**
   ```
   https://your-domain.com/forum/moderator
   ```

2. **لوحة الإحصائيات:**
   ```
   https://your-domain.com/forum/moderation-dashboard
   ```

3. **صفحة البلاغات:**
   ```
   https://your-domain.com/forum/reports
   ```

---

## ⚠️ ملاحظات مهمة

1. **الصلاحيات:**
   - تحتاج صلاحيات مشرف (moderator) أو أدمن (admin)
   - تأكد من وجود مستخدم بصلاحيات مناسبة

2. **التوافق:**
   - جميع التحسينات متوافقة مع النظام القديم
   - لا breaking changes
   - الصفحات القديمة تعمل بشكل طبيعي

3. **الأداء:**
   - تم إضافة indexes للأداء الأفضل
   - لا تأثير على سرعة التطبيق

---

## 🐛 استكشاف الأخطاء

### المشكلة: Migration فشل
```
[Migrations] ❌ Failed to run 1764513010_add_moderation_enhancements.sql
```

**الحلول:**
1. تحقق من logs الكاملة في Coolify
2. تأكد من صلاحيات قاعدة البيانات
3. شغّل SQL يدوياً (الخيار 2)

### المشكلة: الصفحات الجديدة لا تظهر
**الحل:**
1. امسح cache المتصفح
2. تأكد من اكتمال البناء في Coolify
3. تحقق من console للأخطاء

### المشكلة: API لا يعمل
**الحل:**
1. تحقق من logs الخادم
2. تأكد من اكتمال migration
3. أعد تشغيل التطبيق

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع logs في Coolify
2. تحقق من قاعدة البيانات
3. راجع الوثائق في `MODERATION_ENHANCEMENTS_GUIDE.md`

---

## ✨ الخلاصة

**الطريقة الموصى بها:**
1. ✅ افتح Coolify
2. ✅ اضغط "Redeploy"
3. ✅ انتظر حتى ينتهي
4. ✅ استمتع بالميزات الجديدة!

**لا حاجة لأي إجراء يدوي في قاعدة البيانات!** 🎉
