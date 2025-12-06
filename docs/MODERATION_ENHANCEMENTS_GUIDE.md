# دليل التحسينات الجديدة لنظام إدارة المجتمع

## 📋 ملخص التحسينات

تم إضافة تحسينات شاملة لنظام إدارة المجتمع (المشرفين) تشمل:

### 1. **جداول قاعدة البيانات الجديدة**

#### أ) جدول التحذيرات (`forum_warnings`)
```sql
CREATE TABLE forum_warnings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  moderator_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  topic_id INTEGER,
  post_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**الاستخدام:**
- تسجيل التحذيرات الموجهة للمستخدمين
- تتبع سجل التحذيرات لكل مستخدم
- تصنيف التحذيرات حسب الخطورة (منخفض، متوسط، عالي)

#### ب) جدول الملاحظات الداخلية (`forum_moderator_notes`)
```sql
CREATE TABLE forum_moderator_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  moderator_id INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**الاستخدام:**
- ملاحظات خاصة بين المشرفين عن المستخدمين
- لا يراها المستخدمون العاديون
- مفيدة لتتبع السلوك والأنماط

---

## 🚀 الميزات الجديدة

### 1. **لوحة الإحصائيات (Moderation Dashboard)**

**المسار:** `/forum/moderation-dashboard`

**الميزات:**
- إحصائيات شاملة عن البلاغات (معلقة، محلولة، إجمالي)
- تحليل البلاغات حسب السبب مع رسوم بيانية
- قائمة بأكثر المستخدمين المبلغ عنهم
- نشاط المشرفين (من حل أكثر بلاغات)
- الإجراءات الإدارية حسب النوع
- فلترة حسب الفترة الزمنية (يوم، أسبوع، شهر، كل الوقت)

**API المستخدمة:**
```typescript
trpc.forumModeration.getModerationStats.useQuery({ period: "week" })
```

---

### 2. **صفحة البلاغات المحسّنة (Enhanced Reports)**

**المسار:** `/forum/reports` (يمكن استبدال الصفحة القديمة)

**التحسينات:**

#### أ) فلترة متقدمة
- فلترة حسب سبب البلاغ (spam, harassment, etc.)
- فلترة حسب نوع المحتوى (موضوع/رد)
- فلترة حسب الحالة (pending/resolved/all)

#### ب) إجراءات سريعة (Quick Actions)
1. **حذف + حظر (Delete & Ban)**
   - حذف المحتوى المخالف
   - حظر المستخدم (مؤقت أو دائم)
   - تسجيل الإجراءين في سجل الإجراءات
   - كل ذلك في خطوة واحدة

2. **إخفاء + تحذير (Hide & Warn)**
   - إخفاء المحتوى (بدلاً من الحذف)
   - إرسال تحذير للمستخدم
   - تحديد مستوى خطورة التحذير
   - تسجيل الإجراءين

#### ج) عرض محسّن للمعلومات
- عرض التحذيرات السابقة للمستخدم
- عرض الملاحظات الداخلية للمشرفين
- إحصائيات شاملة عن المستخدم
- معاينة أفضل للمحتوى المبلغ عنه

---

## 🔌 API Endpoints الجديدة

### 1. إضافة تحذير
```typescript
trpc.forumModeration.addWarning.useMutation({
  userId: number,
  reason: string,
  severity: "low" | "medium" | "high",
  topicId?: number,
  postId?: number,
})
```

### 2. الحصول على تحذيرات المستخدم
```typescript
trpc.forumModeration.getUserWarnings.useQuery({
  userId: number
})
```

### 3. إضافة ملاحظة داخلية
```typescript
trpc.forumModeration.addModeratorNote.useMutation({
  userId: number,
  note: string,
})
```

### 4. الحصول على ملاحظات المستخدم
```typescript
trpc.forumModeration.getModeratorNotes.useQuery({
  userId: number
})
```

### 5. إحصائيات الإدارة
```typescript
trpc.forumModeration.getModerationStats.useQuery({
  period: "day" | "week" | "month" | "all"
})
```

### 6. حذف + حظر (إجراء سريع)
```typescript
trpc.forumModeration.deleteAndBan.useMutation({
  userId: number,
  topicId?: number,
  postId?: number,
  banReason: string,
  banDuration: "1day" | "1week" | "1month" | "permanent",
})
```

### 7. إخفاء + تحذير (إجراء سريع)
```typescript
trpc.forumModeration.hideAndWarn.useMutation({
  userId: number,
  topicId?: number,
  postId?: number,
  warnReason: string,
  severity: "low" | "medium" | "high",
})
```

---

## 📁 الملفات الجديدة

### Backend (Server)
1. **`server/routers/forum_moderation_enhancements.ts`**
   - Router جديد يحتوي على جميع API endpoints الجديدة
   - تم إضافته إلى `server/routers.ts`

2. **`drizzle/schema.ts`** (محدّث)
   - إضافة `forumWarnings` table
   - إضافة `forumModeratorNotes` table

3. **`add_moderation_features.sql`**
   - SQL script لإنشاء الجداول الجديدة
   - Indexes للأداء الأفضل

### Frontend (Client)
1. **`client/src/pages/forum/ModerationDashboard.tsx`**
   - لوحة الإحصائيات الشاملة
   - رسوم بيانية وتحليلات

2. **`client/src/pages/forum/ForumReportsEnhanced.tsx`**
   - نسخة محسّنة من صفحة البلاغات
   - فلترة متقدمة وإجراءات سريعة

3. **`client/src/pages/forum/ModeratorPanel.tsx`** (محدّث)
   - إضافة رابط للوحة الإحصائيات

---

## 🔧 التثبيت والإعداد

### 1. تشغيل SQL Migration
```bash
# تشغيل SQL script لإنشاء الجداول الجديدة
psql -U your_user -d your_database -f add_moderation_features.sql
```

أو استخدام Drizzle ORM:
```bash
npm run db:push
# أو
npm run db:migrate
```

### 2. تحديث الروابط في التطبيق

إذا كنت تريد استخدام الصفحة المحسّنة بدلاً من القديمة:

**في `client/src/pages/forum/ModeratorPanel.tsx`:**
```typescript
{
  title: t.reportsManagement || "Reports Management",
  description: t.reportsManagementDesc || "Review and resolve user reports",
  icon: AlertCircle,
  href: "/forum/reports-enhanced", // تغيير من /forum/reports
  color: "text-yellow-500",
  badge: pendingCount && pendingCount > 0 ? pendingCount : undefined,
},
```

**إضافة Route في Router:**
```typescript
// في ملف الروابط الرئيسي
<Route path="/forum/reports-enhanced" component={ForumReportsEnhanced} />
<Route path="/forum/moderation-dashboard" component={ModerationDashboard} />
```

---

## 📊 أمثلة الاستخدام

### مثال 1: عرض التحذيرات في صفحة البلاغ
```typescript
const { data: userWarnings } = trpc.forumModeration.getUserWarnings.useQuery(
  { userId: reportDetails?.userStats?.id || 0 },
  { enabled: !!reportDetails?.userStats?.id }
);

// عرض التحذيرات
{userWarnings && userWarnings.length > 0 && (
  <div className="p-4 border-l-4 border-orange-500">
    <h3>Previous Warnings ({userWarnings.length})</h3>
    {userWarnings.map((warning) => (
      <div key={warning.id}>
        <Badge>{warning.severity}</Badge>
        <p>{warning.reason}</p>
      </div>
    ))}
  </div>
)}
```

### مثال 2: استخدام الإجراء السريع "حذف + حظر"
```typescript
const deleteAndBanMutation = trpc.forumModeration.deleteAndBan.useMutation({
  onSuccess: () => {
    toast.success("Content deleted and user banned");
    // تحديث البيانات
  },
});

// عند النقر على الزر
deleteAndBanMutation.mutate({
  userId: user.id,
  topicId: topic.id,
  banReason: "Repeated violations",
  banDuration: "1week",
});
```

### مثال 3: عرض إحصائيات الإدارة
```typescript
const { data: stats } = trpc.forumModeration.getModerationStats.useQuery({
  period: "week"
});

// عرض الإحصائيات
<div>
  <h3>Pending Reports: {stats?.pendingReports}</h3>
  <h3>Resolved Reports: {stats?.resolvedReports}</h3>
  
  {/* رسم بياني للبلاغات حسب السبب */}
  {stats?.reportsByReason.map((item) => (
    <div key={item.reason}>
      <span>{item.reason}: {item.count}</span>
      <ProgressBar value={item.count} max={stats.totalReports} />
    </div>
  ))}
</div>
```

---

## 🎨 التخصيص

### تغيير ألوان مستويات التحذير
في `ForumReportsEnhanced.tsx`:
```typescript
const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    low: "bg-yellow-500/20 text-yellow-700",
    medium: "bg-orange-500/20 text-orange-700",
    high: "bg-red-500/20 text-red-700",
  };
  return colors[severity] || colors.medium;
};
```

### إضافة فلاتر إضافية
يمكنك إضافة فلاتر جديدة مثل:
- فلترة حسب تاريخ البلاغ
- فلترة حسب المشرف الذي حل البلاغ
- فلترة حسب عدد البلاغات للمستخدم

---

## 🔐 الصلاحيات

جميع الميزات الجديدة تتطلب صلاحيات **مشرف (moderator)** أو **أدمن (admin)**:

```typescript
const moderatorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const isModerator = await database
    .select()
    .from(forumModerators)
    .where(eq(forumModerators.user_id, ctx.user.id))
    .limit(1);
  
  if (ctx.user.role !== "admin" && isModerator.length === 0) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  
  return next({ ctx });
});
```

---

## 📝 ملاحظات مهمة

1. **الأداء**: تم إضافة indexes على الجداول الجديدة لتحسين الأداء
2. **الأمان**: جميع الإجراءات تُسجل في `forum_moderation_actions`
3. **التوافق**: الميزات الجديدة لا تؤثر على الوظائف القديمة
4. **الترجمة**: يمكن إضافة ترجمات للنصوص الجديدة في ملفات اللغة

---

## 🐛 استكشاف الأخطاء

### مشكلة: الجداول الجديدة غير موجودة
**الحل:** تأكد من تشغيل SQL migration:
```bash
psql -U your_user -d your_database -f add_moderation_features.sql
```

### مشكلة: API endpoints لا تعمل
**الحل:** تأكد من إضافة router في `server/routers.ts`:
```typescript
import { forumModerationEnhancementsRouter } from "./routers/forum_moderation_enhancements";

export const appRouter = router({
  // ...
  forumModeration: forumModerationEnhancementsRouter,
  // ...
});
```

### مشكلة: الصفحات الجديدة لا تظهر
**الحل:** تأكد من إضافة routes في router الرئيسي للتطبيق

---

## 🎯 الخطوات التالية (اختياري)

1. **نظام الإشعارات للمشرفين**
   - إشعار فوري عند ورود بلاغ جديد
   - إشعار عند تصعيد بلاغ

2. **تقارير دورية**
   - تقرير أسبوعي/شهري للأدمن
   - ملخص نشاط المشرفين

3. **نظام نقاط الثقة**
   - حساب نقاط ثقة لكل مستخدم
   - إجراءات تلقائية بناءً على النقاط

4. **قوالب الردود**
   - رسائل جاهزة للحظر/التحذير
   - توفير الوقت للمشرفين

---

## 📞 الدعم

للمساعدة أو الأسئلة:
- راجع الكود في الملفات المذكورة أعلاه
- تحقق من console logs للأخطاء
- تأكد من تشغيل migrations بشكل صحيح
