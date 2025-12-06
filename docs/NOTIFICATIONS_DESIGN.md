# نظام الإشعارات الشامل - StaatKlaar

## 📋 الوضع الحالي

### ✅ موجود حالياً:
- جدول `forum_notifications` للإشعارات المتعلقة بالمنتدى فقط
- أيقونة جرس في Desktop فقط (مخفية على Mobile)
- أنواع إشعارات محدودة:
  - `reply_to_topic` - رد على موضوعك
  - `upvote_topic` - إعجاب بموضوعك
  - `upvote_post` - إعجاب بمشاركتك

### ❌ المشاكل:
1. **الجرس لا يظهر على الجوال** (السطر 77-78 في AppHeader.tsx)
2. **إشعارات المنتدى فقط** - لا توجد إشعارات للامتحانات، المفردات، إلخ
3. **جدول منفصل للمنتدى** - يجب توحيد جميع الإشعارات

---

## 🎯 التصميم الجديد

### 1. أنواع الإشعارات المقترحة

#### 📚 إشعارات الامتحانات
- ✅ `new_public_exam` - امتحان عام جديد متاح
- ✅ `exam_rated` - شخص قيّم امتحانك
- ✅ `exam_comment` - تعليق جديد على امتحانك
- ✅ `exam_milestone` - إنجاز (مثلاً: أكملت 10 امتحانات!)

#### 📖 إشعارات المفردات
- ✅ `vocab_milestone` - وصلت لـ 100 كلمة!
- ✅ `vocab_review_due` - لديك 15 كلمة للمراجعة اليوم
- ✅ `vocab_mastered` - أتقنت 50 كلمة جديدة!

#### 🏆 إشعارات الإنجازات
- ✅ `achievement_unlocked` - فتحت إنجاز جديد
- ✅ `leaderboard_rank` - ترتيبك تحسن في لوحة المتصدرين
- ✅ `streak_milestone` - سلسلة 7 أيام متتالية!

#### 💬 إشعارات المنتدى (موجودة)
- ✅ `reply_to_topic` - رد على موضوعك
- ✅ `upvote_topic` - إعجاب بموضوعك
- ✅ `upvote_post` - إعجاب بمشاركتك
- ✅ `mention` - ذكرك شخص في تعليق

#### 👥 إشعارات اجتماعية
- ✅ `new_follower` - متابع جديد (إذا أضفنا نظام متابعة)
- ✅ `friend_exam` - صديقك نشر امتحان جديد

#### ⚙️ إشعارات النظام
- ✅ `system_update` - تحديث جديد في التطبيق
- ✅ `maintenance` - صيانة مجدولة
- ✅ `welcome` - رسالة ترحيب للمستخدمين الجدد

---

### 2. هيكل قاعدة البيانات الموحد

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- نوع الإشعار
  type VARCHAR(50) NOT NULL,
  
  -- المحتوى
  title VARCHAR(255) NOT NULL,          -- العنوان
  message TEXT,                          -- الرسالة التفصيلية
  
  -- المراجع (nullable لأن ليس كل إشعار له مرجع)
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  vocab_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
  from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- رابط الإجراء
  action_url VARCHAR(255),              -- مثلاً: /exam/123 أو /forum/topic/456
  
  -- الحالة
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- التواريخ
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  read_at TIMESTAMP,
  expires_at TIMESTAMP                   -- للإشعارات المؤقتة
);

-- Indexes للأداء
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
```

---

### 3. واجهة المستخدم - Mobile Responsive

#### قبل (Desktop فقط):
```tsx
{/* Desktop Navigation */}
<nav className="hidden md:flex items-center gap-2">
  <NotificationsDropdown />
  ...
</nav>
```

#### بعد (Desktop + Mobile):
```tsx
{/* Desktop Navigation */}
<nav className="hidden md:flex items-center gap-2">
  <NotificationsDropdown />
  ...
</nav>

{/* Mobile Navigation */}
<div className="flex md:hidden items-center gap-1.5">
  <NotificationsDropdown />  {/* ← إضافة هنا */}
  <LanguageSwitcher />
  <DropdownMenu>...</DropdownMenu>
</div>
```

#### تحسينات الواجهة:
1. **أيقونة responsive** - حجم مناسب للجوال
2. **Badge للعدد** - يظهر عدد الإشعارات غير المقروءة
3. **تصنيف الإشعارات** - tabs للفلترة (الكل، امتحانات، مفردات، منتدى)
4. **ألوان حسب النوع**:
   - 🔵 أزرق: امتحانات
   - 🟢 أخضر: إنجازات
   - 🟡 أصفر: مفردات
   - 🟣 بنفسجي: منتدى
   - 🔴 أحمر: عاجل/مهم

---

### 4. Backend API

```typescript
// server/routes.ts

// Get all notifications
router.getNotifications = publicProcedure
  .query(async ({ ctx }) => {
    const notifications = await db.query.notifications.findMany({
      where: eq(notifications.user_id, ctx.user.id),
      orderBy: desc(notifications.created_at),
      limit: 50,
    });
    return notifications;
  });

// Get unread count
router.getUnreadCount = publicProcedure
  .query(async ({ ctx }) => {
    const count = await db
      .select({ count: sql`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.user_id, ctx.user.id),
          eq(notifications.is_read, false)
        )
      );
    return { count: count[0].count };
  });

// Mark as read
router.markNotificationRead = publicProcedure
  .input(z.object({ notificationId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    await db
      .update(notifications)
      .set({ is_read: true, read_at: new Date() })
      .where(
        and(
          eq(notifications.id, input.notificationId),
          eq(notifications.user_id, ctx.user.id)
        )
      );
  });

// Mark all as read
router.markAllNotificationsRead = publicProcedure
  .mutation(async ({ ctx }) => {
    await db
      .update(notifications)
      .set({ is_read: true, read_at: new Date() })
      .where(eq(notifications.user_id, ctx.user.id));
  });

// Create notification (helper function)
async function createNotification({
  userId,
  type,
  title,
  message,
  actionUrl,
  examId,
  topicId,
  fromUserId,
  priority = 'normal',
}: {
  userId: number;
  type: string;
  title: string;
  message?: string;
  actionUrl?: string;
  examId?: number;
  topicId?: number;
  fromUserId?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}) {
  await db.insert(notifications).values({
    user_id: userId,
    type,
    title,
    message,
    action_url: actionUrl,
    exam_id: examId,
    topic_id: topicId,
    from_user_id: fromUserId,
    priority,
  });
}
```

---

### 5. متى نرسل الإشعارات؟

#### عند إنشاء امتحان عام:
```typescript
// في createExam mutation
if (input.isPublic) {
  // إرسال إشعار لجميع المتابعين (إذا كان هناك نظام متابعة)
  // أو للمستخدمين المهتمين بنفس المستوى
  await createNotification({
    userId: targetUserId,
    type: 'new_public_exam',
    title: t.newPublicExamAvailable,
    message: `${user.name} نشر امتحان جديد: ${exam.title}`,
    actionUrl: `/exam/${exam.id}`,
    examId: exam.id,
    fromUserId: user.id,
  });
}
```

#### عند إضافة تقييم:
```typescript
// في rateExam mutation
if (exam.created_by !== ctx.user.id) {
  await createNotification({
    userId: exam.created_by,
    type: 'exam_rated',
    title: t.someoneRatedYourExam,
    message: `${ctx.user.name} قيّم امتحانك "${exam.title}" بـ ${input.rating} نجوم`,
    actionUrl: `/exam/${exam.id}`,
    examId: exam.id,
    fromUserId: ctx.user.id,
  });
}
```

#### عند الوصول لإنجاز:
```typescript
// في checkAchievements function
if (totalWords === 100) {
  await createNotification({
    userId: user.id,
    type: 'vocab_milestone',
    title: t.congratulations,
    message: t.youReached100Words,
    actionUrl: '/vocabulary',
    priority: 'high',
  });
}
```

#### عند وجود كلمات للمراجعة:
```typescript
// Cron job يومي
const dueWords = await getDueWordsCount(userId);
if (dueWords > 0) {
  await createNotification({
    userId,
    type: 'vocab_review_due',
    title: t.timeToReview,
    message: `لديك ${dueWords} كلمة للمراجعة اليوم`,
    actionUrl: '/vocabulary',
    priority: 'normal',
  });
}
```

---

### 6. الترجمات المطلوبة

```typescript
// shared/i18n.ts
export interface Translations {
  // ... existing
  
  // Notifications
  notifications: string;
  markAllRead: string;
  noNotifications: string;
  notificationTypes: string;
  allNotifications: string;
  examsNotifications: string;
  vocabNotifications: string;
  forumNotifications: string;
  achievementsNotifications: string;
  
  // Notification messages
  newPublicExamAvailable: string;
  someoneRatedYourExam: string;
  someoneCommentedOnExam: string;
  youReached100Words: string;
  timeToReview: string;
  achievementUnlocked: string;
  streakMilestone: string;
  // ... more
}
```

---

## 🚀 خطة التنفيذ

### المرحلة 1: قاعدة البيانات ✅
1. إنشاء جدول `notifications` الموحد
2. Migration لنقل بيانات `forum_notifications` القديمة
3. إضافة indexes للأداء

### المرحلة 2: Backend API ✅
1. إنشاء tRPC routes للإشعارات
2. Helper function لإنشاء الإشعارات
3. دمج الإشعارات في الأحداث المختلفة

### المرحلة 3: Frontend - Mobile Support ✅
1. إضافة الجرس للـ Mobile في AppHeader
2. تحسين NotificationsDropdown للجوال
3. إضافة تصنيفات/tabs للإشعارات

### المرحلة 4: أنواع الإشعارات ✅
1. إشعارات الامتحانات
2. إشعارات المفردات
3. إشعارات الإنجازات
4. إشعارات النظام

### المرحلة 5: الترجمات والاختبار ✅
1. إضافة جميع الترجمات (4 لغات)
2. اختبار على Desktop و Mobile
3. اختبار الأداء
4. النشر

---

## 📊 الفوائد المتوقعة

1. **زيادة التفاعل** - المستخدمون يعودون للتطبيق أكثر
2. **تجربة أفضل على الجوال** - الجرس يظهر على كل الأجهزة
3. **تحفيز المستخدمين** - إشعارات الإنجازات تشجع الاستمرار
4. **بناء مجتمع** - إشعارات اجتماعية تربط المستخدمين
5. **تذكير بالمراجعة** - يساعد في الاستمرارية

---

## 🎨 أمثلة على الإشعارات

### امتحان جديد:
```
🔵 امتحان عام جديد
أحمد نشر امتحان "قراءة عن الطقس في هولندا"
منذ 5 دقائق
```

### إنجاز:
```
🏆 إنجاز جديد!
مبروك! وصلت لـ 100 كلمة في قاموسك
منذ دقيقة
```

### مراجعة:
```
📖 وقت المراجعة
لديك 15 كلمة للمراجعة اليوم
منذ ساعة
```

### منتدى:
```
💬 رد جديد
سارة ردت على موضوعك "كيف أحسن النطق؟"
منذ 10 دقائق
```

---

## ✅ Checklist

- [ ] إنشاء جدول notifications
- [ ] Migration للبيانات القديمة
- [ ] Backend API routes
- [ ] إضافة الجرس للـ Mobile
- [ ] تحسين واجهة الإشعارات
- [ ] دمج إشعارات الامتحانات
- [ ] دمج إشعارات المفردات
- [ ] دمج إشعارات الإنجازات
- [ ] إضافة الترجمات (4 لغات)
- [ ] الاختبار على Desktop
- [ ] الاختبار على Mobile
- [ ] النشر على Railway

---

**هل تريد البدء في التنفيذ؟** 🚀
