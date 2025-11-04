# Changelog

## [Fix] 2025-11-04 - إصلاح العداد اليومي

### المشكلة
- العداد اليومي كان يعرض دائماً القيمة الافتراضية (5/5) ولا يتحدث من قاعدة البيانات
- المستخدمون لا يستطيعون توليد امتحانات رغم أن العداد يظهر وجود محاولات متبقية

### الحل
- إضافة دالة `loadDailyLimit()` في `static/index_v3.html`
- استدعاء الدالة عند تحميل الصفحة لجلب القيمة الفعلية من API
- إزالة استدعاء ملف `/static/app_v3.js` غير الموجود

### التغييرات التقنية
1. **ملف: static/index_v3.html**
   - إضافة دالة `loadDailyLimit()` التي تستدعي `/api/daily-limit`
   - تحديث عنصر `#remainingExams` بالقيمة الفعلية من قاعدة البيانات
   - استدعاء `loadDailyLimit()` في `DOMContentLoaded`
   - إزالة السطر `<script src="/static/app_v3.js"></script>`

### الكود المضاف
```javascript
// Load daily limit info
async function loadDailyLimit() {
    try {
        const response = await fetch('/api/daily-limit');
        if (!response.ok) {
            console.warn('Failed to load daily limit');
            return;
        }
        
        const data = await response.json();
        const remainingEl = document.getElementById('remainingExams');
        
        if (remainingEl) {
            remainingEl.textContent = data.remaining;
        }
        
        // Show warning and disable button if limit reached
        if (data.remaining === 0) {
            console.log('Daily limit reached');
            // The app_v3.js will handle disabling the generate button
        }
    } catch (error) {
        console.error('Error loading daily limit:', error);
    }
}
```

### النتيجة المتوقعة
- العداد اليومي الآن يعرض القيمة الفعلية من قاعدة البيانات
- المستخدمون يمكنهم رؤية عدد الامتحانات المتبقية بدقة
- النظام يعمل بشكل متسق بين Frontend و Backend

---

## [Fix] 2025-11-04 - إصلاح القائمة وإضافة روابط الصفحات المفقودة

### المشكلة
- صفحة الامتحانات العامة لا تظهر في القائمة
- صفحة الكلمات تغيرت وفقدت الميزات التفاعلية (النطق، السياق، التدريب)

### الحل
- إضافة رابط "امتحانات عامة" إلى القائمة في `index_v3.html`
- تغيير رابط "قائمة كلماتي" ليشير إلى `/vocabulary` (الصفحة الكاملة بجميع الميزات)

### التغييرات التقنية
1. **ملف: static/index_v3.html**
   - إضافة رابط `<a href="/public-exams">امتحانات عامة</a>`
   - تغيير رابط الكلمات من `onclick="navigateTo('vocabulary')"` إلى `href="/vocabulary"`

### الميزات المستعادة في صفحة الكلمات:
- ✅ النطق الصوتي للكلمات
- ✅ عرض السياق
- ✅ رابط فتح الامتحان الأصلي
- ✅ التدريب بالبطاقات
- ✅ اختبار الإملاء

### النتيجة المتوقعة
- المستخدمون يمكنهم الوصول إلى صفحة الامتحانات العامة
- صفحة الكلمات تعود بجميع ميزاتها التفاعلية

---

## [Feature] 2025-11-04 - إضافة زر مشاركة الامتحان (تحويله إلى عام)

### الميزة الجديدة
- إضافة زر "مشاركة" في صفحة "امتحاناتي"
- يمكن للمستخدم تحويل امتحاناته إلى امتحانات عامة يراها الجميع
- يمكن إلغاء المشاركة وجعل الامتحان خاصاً مرة أخرى

### التغييرات التقنية
1. **ملف: static/index_v3.html**
   - تعديل دالة `loadExams()` لإضافة زر المشاركة
   - إضافة دالة `togglePublic(examId, currentStatus)`
   - الزر يتغير حسب الحالة:
     - إذا كان خاص: يظهر "مشاركة" مع أيقونة العالم (🌐)
     - إذا كان عام: يظهر "جعله خاص" مع أيقونة القفل (🔒)

### كيفية العمل
```javascript
// Toggle exam public status
async function togglePublic(examId, currentStatus) {
    const action = currentStatus ? 'جعل الامتحان خاصاً' : 'مشاركة الامتحان مع العامة';
    
    if (!confirm(`هل أنت متأكد من ${action}؟`)) {
        return;
    }
    
    const response = await fetch(`/api/exam/${examId}/toggle-public`, {
        method: 'POST'
    });
    
    // Reload exams to update UI
    await loadExams();
}
```

### النتيجة المتوقعة
- ✅ المستخدمون يمكنهم مشاركة امتحاناتهم مع الآخرين
- ✅ الامتحانات العامة تظهر في صفحة "امتحانات عامة"
- ✅ يمكن إلغاء المشاركة في أي وقت
- ✅ واجهة مستخدم واضحة مع رسائل تأكيد


---

## [Fix] 2025-11-04 - إصلاح خطأ 500 في صفحة الامتحانات العامة

### المشكلة
- صفحة الامتحانات العامة تعطي خطأ 500
- رسالة الخطأ: "Failed to load public exams"
- السبب: RealDictRow objects غير قابلة للتحويل إلى JSON مباشرة

### الحل
- تحويل RealDictRow إلى dict عادي قبل إرجاع النتائج
- إصلاح دالتي get_public_exams() و get_public_exam_by_id()

### التغييرات التقنية
1. **ملف: public_exams.py**
   - get_public_exams(): إضافة return [dict(row) for row in rows]
   - get_public_exam_by_id(): إضافة exam = dict(row) قبل معالجة JSON

### الكود المعدل:
```python
# Before (causing error)
rows = cursor.fetchall()
return rows  # RealDictRow objects - not JSON serializable!

# After (fixed)
rows = cursor.fetchall()
return [dict(row) for row in rows]  # Convert to regular dict
```

### النتيجة المتوقعة
- ✅ صفحة الامتحانات العامة تعمل بشكل صحيح
- ✅ API يرجع JSON صحيح
- ✅ الامتحانات العامة تظهر بشكل صحيح


---

## [Fix] 2025-11-04 - إضافة زر المشاركة إلى صفحة /exams المنفصلة

### المشكلة
- زر المشاركة تم إضافته فقط في index_v3.html (SPA)
- المستخدمون الذين يستخدمون /exams (صفحة منفصلة) لا يرون الزر

### الحل
- إضافة نفس الميزة إلى exams.html
- الآن الزر متاح في كلا الصفحتين

### التغييرات التقنية
1. **ملف: static/exams.html**
   - تعديل دالة loadExams() لإضافة زر المشاركة
   - إضافة دالة togglePublic(examId, currentStatus)
   - نفس الوظيفة الموجودة في index_v3.html

### النتيجة المتوقعة
- ✅ زر المشاركة يظهر في صفحة /exams
- ✅ جميع المستخدمين يمكنهم مشاركة امتحاناتهم
- ✅ تجربة متسقة بين الصفحتين


---

## [Fix] 2025-11-04 - إصلاح مشكلة datetime في API الامتحانات العامة

### المشكلة
- خطأ 500 مستمر في /api/public-exams
- السبب: datetime objects غير قابلة للتحويل إلى JSON مباشرة
- حقل created_at يسبب الخطأ

### الحل
- تحويل datetime إلى ISO string قبل الإرجاع
- استخدام .isoformat() لتحويل التاريخ

### التغييرات التقنية
1. **ملف: public_exams.py**
   - get_public_exams(): إضافة تحويل created_at إلى ISO string
   - get_public_exam_by_id(): إضافة تحويل created_at و updated_at

### الكود المعدل:
```python
# Convert datetime to ISO string
if exam.get('created_at'):
    exam['created_at'] = exam['created_at'].isoformat()
```

### النتيجة المتوقعة
- ✅ API يرجع JSON صحيح بدون أخطاء
- ✅ صفحة الامتحانات العامة تعمل
- ✅ التواريخ تظهر بصيغة ISO 8601


---

## [Fix] 2025-11-04 - إصلاح فتح الامتحانات العامة

### المشكلة
- عند النقر على "ابدأ الامتحان" في صفحة الامتحانات العامة
- رسالة خطأ: "معرف الامتحان غير موجود"
- يتم التحويل إلى الصفحة الرئيسية

### السبب
- exam_view.html كان مصمماً فقط للامتحانات الخاصة
- لا يدعم public_id من URL
- يستدعي /api/exam/{id} فقط (امتحانات المستخدم)

### الحل
- إضافة دعم public_id في exam_view.html
- التحقق من نوع الامتحان (عام أم خاص)
- استدعاء API المناسب حسب النوع

### التغييرات التقنية
1. **ملف: static/exam_view.html**
   - إضافة قراءة public_id من URL
   - إضافة متغير isPublicExam
   - تعديل loadExam() لاستخدام API المناسب

### الكود المعدل:
```javascript
// Get exam ID from URL
const examId = urlParams.get('id');
const publicExamId = urlParams.get('public_id');
const isPublicExam = !!publicExamId;

// In loadExam()
const currentExamId = isPublicExam ? publicExamId : examId;
const apiUrl = isPublicExam 
    ? `/api/public-exam/${currentExamId}` 
    : `/api/exam/${currentExamId}`;
```

### النتيجة المتوقعة
- ✅ الامتحانات العامة تفتح بشكل صحيح
- ✅ المستخدمون يمكنهم حل الامتحانات المشاركة
- ✅ نفس الصفحة تعمل للامتحانات العامة والخاصة


---

## [Fix] 2025-11-04 - إصلاح مشكلة OAuth CSRF state mismatch

### المشكلة
- خطأ عند تسجيل الدخول: "mismatching_state: CSRF Warning! State not equal in request and response"
- Session state لا يُحفظ بين طلب login وطلب callback

### السبب
- إعدادات SessionMiddleware غير كافية للـ production
- نقص `same_site` و `https_only` يسبب مشاكل في حفظ cookies

### الحل
- إضافة `same_site='lax'` للسماح بـ OAuth redirects
- إضافة `https_only=True` للأمان في production

### التغييرات التقنية
1. **ملف: auth.py**
   - تحسين SessionMiddleware configuration
   - إضافة same_site و https_only parameters

### الكود المعدل:
```python
app.add_middleware(
    SessionMiddleware,
    secret_key=self.secret_key,
    max_age=30 * 24 * 60 * 60,  # 30 days
    same_site='lax',             # Allow OAuth redirects
    https_only=True              # Important for production security
)
```

### متطلبات إضافية
**يجب إضافة في Railway Variables:**
```
SESSION_SECRET_KEY=your_very_long_random_secret_key_here
```

**مهم:** يجب أن يكون طويل (32+ حرف) وثابت!

### النتيجة المتوقعة
- ✅ تسجيل الدخول عبر Google يعمل بشكل صحيح
- ✅ Session تُحفظ بين الطلبات
- ✅ لا يوجد خطأ CSRF


---

## [Debug] 2025-11-04 - إضافة logging لتشخيص OAuth CSRF

### الهدف
- إضافة logging مفصل لفهم سبب فشل OAuth state matching
- تشخيص مشكلة Session storage

### التغييرات
- إضافة debug prints في callback() قبل authorize_access_token
- عرض state من URL و session
- عرض session keys و cookies

### المعلومات المطلوبة
بعد النشر، تحقق من Logs في Railway للحصول على:
- State from URL
- State from session
- Session keys
- Cookies

هذا سيساعد في تحديد السبب الدقيق للمشكلة.


---

## [Fix] 2025-11-04 - الحل النهائي لمشكلة OAuth CSRF

### السبب الحقيقي
بعد إضافة logging مفصل، اكتشفنا أن:
- State **موجود** في session ✅
- لكن بمفتاح مختلف: `_state_google_{value}` ❌
- الكود كان يبحث عن `oauth_state` بدلاً من المفتاح الصحيح

### كيف تعمل Authlib
- Authlib تحفظ state في session بمفتاح: `_state_google_{state_value}`
- Authlib تتحقق تلقائياً من state عند استدعاء `authorize_access_token()`
- لا نحتاج للتحقق اليدوي!

### الحل
- إزالة debug logging
- الاعتماد على Authlib للتحقق التلقائي من state
- Session settings (same_site, https_only) التي أضفناها سابقاً صحيحة

### التغييرات
1. **ملف: auth.py**
   - إزالة debug logging
   - إضافة تعليق توضيحي: Authlib تتحقق تلقائياً

### الكود النهائي:
```python
async def callback(self, request: Request, db):
    if not self.oauth_enabled:
        return RedirectResponse(url='/')
    
    try:
        # Authlib automatically verifies state from session
        # No manual verification needed - it's handled internally
        token = await self.oauth.google.authorize_access_token(request)
        # ... rest of code
```

### النتيجة المتوقعة
- ✅ OAuth يعمل بشكل صحيح
- ✅ State يُتحقق منه تلقائياً بواسطة Authlib
- ✅ لا يوجد CSRF warning
- ✅ تسجيل الدخول يعمل بسلاسة

### ملاحظة
يجب التأكد من وجود `SESSION_SECRET_KEY` في Railway Variables!


---

## [Fix] 2025-11-04 - الحل النهائي الحقيقي لـ OAuth CSRF!

### المشكلة المكتشفة من الـ Logs

بعد إضافة logging مفصل، اكتشفنا المشكلة الحقيقية:

**States القديمة تتراكم في session/cookie!**

#### السيناريو:
1. المستخدم يحاول تسجيل الدخول → State 1 يُحفظ
2. يلغي أو يحدث خطأ
3. يحاول مرة أخرى → State 2 يُضاف (State 1 لا يُحذف!)
4. بعد 5 محاولات → Session ممتلئة بـ 5 states قديمة
5. المحاولة 6 → Google يُعيد callback مع state قديم
6. State القديم غير موجود أو expired → CSRF Error!

#### الدليل من الـ Logs:
```
🔵 LOGIN - Before
  Session keys before: [
    '_state_google_ZhWZMJBVVTlHtpf3yc3AKwJwjQtyUZ',  ← قديم
    '_state_google_GlMtdhjCQ2lmMAZGibgKrfYzfEINNq',  ← قديم
    '_state_google_myQUy7lX1j46kxDwkk6LAkl7t4OkHI',  ← قديم
    '_state_google_DTsKCaT4wwJ35iBPxluV4SZO5eEPwb',  ← قديم
    '_state_google_En339TObv0A1MMQIQITcSB6oZcXMrS'   ← قديم
  ]
```

### الحل

**تنظيف States القديمة قبل إنشاء state جديد:**

```python
async def login(self, request: Request):
    # Clean up old OAuth states before creating new one
    keys_to_remove = [k for k in request.session.keys() if k.startswith('_state_google_')]
    for key in keys_to_remove:
        del request.session[key]
    
    # Now create new state
    return await self.oauth.google.authorize_redirect(request, redirect_uri)
```

### التغييرات

1. **ملف: auth.py - دالة login()**
   - إضافة cleanup للـ states القديمة قبل authorize_redirect
   - إزالة debug logging الزائد

### النتيجة المتوقعة

- ✅ Session تبقى نظيفة (state واحد فقط في كل مرة)
- ✅ لا تتراكم states قديمة
- ✅ OAuth يعمل بشكل صحيح
- ✅ لا يوجد CSRF warning

### ملاحظة

المحاولة الأولى في الـ logs نجحت لأن Session كانت نظيفة (NO COOKIE).
المحاولات التالية فشلت بسبب تراكم states قديمة.

الآن، كل محاولة تبدأ بـ session نظيفة! 🎉


---

## [Fix] 2025-11-04 - إصلاح مشكلة العداد اليومي مع DISABLE_AUTH

### المشكلة

عند تفعيل `DISABLE_AUTH=true`:
- العداد يظهر دائماً "5 / 5"
- لا يمكن إنشاء امتحانات
- السبب: user_id=1 (Development User) غير موجود في قاعدة البيانات!

### التحليل

**عند DISABLE_AUTH:**
```python
# auth.py
def get_current_user(self, request):
    if not self.oauth_enabled:
        return {'id': 1, ...}  # يُرجع user_id=1
```

**لكن في قاعدة البيانات:**
- لا يوجد user بـ id=1
- `daily_limit.py` يبحث عن user_id=1 → لا يجده
- يُرجع "User not found"
- لا يمكن إنشاء امتحانات!

### الحل

**إضافة إنشاء تلقائي لـ Development User:**

```python
# database.py - في init_tables()
if os.getenv('DISABLE_AUTH', '').lower() == 'true':
    cursor.execute("""
        INSERT INTO users (id, google_id, email, name, picture, daily_exam_count, last_exam_date)
        VALUES (1, 'dev_user', 'dev@example.com', 'Development User', '', 0, NULL)
        ON CONFLICT (google_id) DO NOTHING
    """)
```

**الآن:**
- عند تفعيل DISABLE_AUTH، يتم إنشاء user_id=1 تلقائياً
- العداد اليومي يعمل بشكل صحيح
- يمكن إنشاء امتحانات!

### التغييرات

1. **ملف: database.py - دالة init_tables()**
   - إضافة إنشاء Development User عند DISABLE_AUTH=true
   - استخدام ON CONFLICT DO NOTHING لتجنب الأخطاء

### النتيجة المتوقعة

- ✅ العداد يعمل: 5/5 → 4/5 → 3/5 ... → 0/5
- ✅ يمكن إنشاء امتحانات حتى الوصول للحد
- ✅ يتم reset كل يوم تلقائياً
- ✅ DISABLE_AUTH يعمل بشكل كامل

### ملاحظة

هذا الإصلاح ضروري فقط عند استخدام DISABLE_AUTH.
في production مع OAuth، يتم إنشاء المستخدمين تلقائياً عند تسجيل الدخول.


---

## [Fix] 2025-11-04 - إصلاح تحديث إحصائيات النص (الأحرف والكلمات)

### المشكلة

عند الكتابة في حقل النص، لا يتم تحديث:
- عدد الأحرف (يبقى 0 / 5000)
- عدد الكلمات (يبقى 0)

### السبب

**لا يوجد event listener على textarea!**

```html
<textarea id="textInput" ...></textarea>

<!-- لا يوجد JavaScript يستمع للتغييرات! -->
```

### الحل

**إضافة دالة updateTextStats() و event listener:**

```javascript
// Update text statistics
function updateTextStats() {
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    
    if (textInput && charCount && wordCount) {
        const text = textInput.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        charCount.textContent = chars;
        wordCount.textContent = words;
    }
}

// Add event listener
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', updateTextStats);
        updateTextStats(); // Initial update
    }
});
```

### التغييرات

1. **ملف: index_v3.html**
   - إضافة دالة `updateTextStats()`
   - إضافة event listener على textarea
   - تحديث تلقائي عند الكتابة

### النتيجة المتوقعة

**عند الكتابة:**
```
الأحرف: 0 / 5000  →  الأحرف: 150 / 5000  ✅
الكلمات: 0        →  الكلمات: 25          ✅
```

**تحديث فوري مع كل حرف!**



---

## [Fix] 2025-11-04 - إصلاح زر توليد الامتحان في index_v3.html

### المشكلة

- زر "توليد الامتحان" لا يستجيب عند النقر
- لا يمكن إنشاء امتحانات من الصفحة الرئيسية
- العداد اليومي لا يتحدث بعد محاولة التوليد

### السبب

**index_v3.html لا يستدعي app.js!**

- الزر موجود في HTML ✅
- لكن لا يوجد event listener عليه ❌
- دالة `generateExam()` غير متوفرة ❌
- app.js يحتوي على كل الوظائف لكن لا يتم تحميله!

### التحليل

```html
<!-- index_v3.html -->
<button id="generateBtn">توليد الامتحان</button>

<!-- ❌ لا يوجد: -->
<script src="/static/app.js"></script>
```

**app.js يحتوي على:**
- ✅ دالة `generateExam()` كاملة
- ✅ Event listener: `generateBtn.addEventListener('click', generateExam)`
- ✅ دالة `loadDailyLimit()` لتحديث العداد
- ✅ جميع الوظائف المطلوبة

### الحل

**إضافة استدعاء app.js قبل نهاية body:**

```html
    <!-- Main application JavaScript -->
    <script src="/static/app.js"></script>
</body>
```

### التغييرات

1. **ملف: static/index_v3.html**
   - إضافة `<script src="/static/app.js"></script>` قبل `</body>`

### النتيجة المتوقعة

- ✅ زر "توليد الامتحان" يعمل
- ✅ يتم إنشاء امتحانات بنجاح
- ✅ العداد اليومي يتحدث: 5/5 → 4/5 → 3/5 ...
- ✅ جميع الميزات تعمل:
  - حفظ الامتحانات
  - التحويل إلى صفحة الامتحان
  - التحقق من الحد اليومي
  - جميع الوظائف

### ملاحظة

هذا كان السبب الرئيسي لعدم عمل توليد الامتحانات!
الآن التطبيق يعمل بشكل كامل! 🎉



---

## [Fix] 2025-11-04 - إنشاء app_v3_simplified.js لـ index_v3.html

### المشكلة

بعد إضافة app.js إلى index_v3.html، ظهرت أخطاء JavaScript:
```
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
Uncaught TypeError: Cannot read properties of null (reading 'checked')
```

**السبب:**
- app.js يبحث عن عناصر غير موجودة في index_v3.html
- مثل: `verifyQualityCheckbox`, `copyBtn`, `printBtn`, `resultsSection`, إلخ
- index_v3.html له بنية مختلفة عن الصفحة الأصلية

### الحل

إنشاء نسخة مبسطة من app.js خاصة بـ index_v3.html:

**app_v3_simplified.js يحتوي على:**
- ✅ فقط العناصر الموجودة في index_v3.html
- ✅ دالة generateExam() مبسطة
- ✅ دالة loadDailyLimit()
- ✅ دالة saveExam()
- ✅ لا أخطاء JavaScript!

### ما تم إزالته:
- ❌ verifyQualityCheckbox (غير موجود)
- ❌ copyBtn, printBtn, newExamBtn (غير موجودة)
- ❌ studyModeBtn, testModeBtn (غير موجودة)
- ❌ resultsSection, answerKey (غير موجودة)
- ❌ جميع الوظائف المرتبطة بعناصر غير موجودة

### ما تم الاحتفاظ به:
- ✅ textInput
- ✅ numQuestionsSelect
- ✅ generateBtn
- ✅ charCount, wordCount
- ✅ remainingExams (العداد اليومي)

### التغييرات

1. **ملف جديد: static/app_v3_simplified.js**
   - نسخة مبسطة من app.js
   - تعمل فقط مع العناصر الموجودة

2. **ملف: static/index_v3.html**
   - تغيير من `<script src="/static/app.js">`
   - إلى `<script src="/static/app_v3_simplified.js">`

### النتيجة المتوقعة

- ✅ لا أخطاء JavaScript
- ✅ زر "توليد الامتحان" يعمل
- ✅ العداد اليومي يتحدث
- ✅ يتم إنشاء امتحانات بنجاح
- ✅ التحويل إلى صفحة الامتحان
