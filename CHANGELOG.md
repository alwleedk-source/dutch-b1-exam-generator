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
