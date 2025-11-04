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
