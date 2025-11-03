# 📚 منصة امتحانات B1 الهولندية - Dutch B1 Exam Generator

<div align="center">

![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)

**منصة ذكية متكاملة لتوليد امتحانات القراءة الهولندية مستوى B1 بالذكاء الاصطناعي**

[🚀 Demo](https://dutch-b1-exam-generator-production.up.railway.app) | [📖 دليل الإعداد](SETUP_GUIDE.md) | [🐛 الإبلاغ عن مشكلة](https://github.com/alwleedk-source/dutch-b1-exam-generator/issues)

</div>

---

## ✨ المميزات الرئيسية

### 🤖 توليد ذكي بالذكاء الاصطناعي
- توليد امتحانات احترافية تلقائياً باستخدام **Gemini AI**
- 5 أنواع من الأسئلة حسب معايير **CEFR B1**
- توزيع متوازن للصعوبة (سهل، متوسط، صعب)
- تحقق تلقائي من الجودة

### 🔐 نظام مستخدمين كامل
- تسجيل دخول آمن بـ **Google OAuth 2.0**
- حفظ جميع امتحاناتك في قاعدة بيانات
- تسمية تلقائية ذكية للامتحانات
- إدارة كاملة: عرض، حذف، تعديل

### 📸 رفع الملفات
- رفع صور (JPG, PNG, etc.)
- رفع مستندات PDF (متعدد الصفحات)
- استخراج النص تلقائياً بـ **OCR**
- حذف تلقائي للملفات بعد المعالجة

### 🌐 ترجمة تفاعلية
- ترجمة عربية لكل كلمة هولندية
- تظهر عند التمرير بالماوس
- ترجمة سياقية (ليست حرفية)
- تغطية 85%+ من الكلمات

### 📝 تنسيق احترافي
- تنسيق تلقائي للنصوص بالذكاء الاصطناعي
- عناوين، فقرات، قوائم
- يظهر النص كمستند حقيقي

### ✏️ وضع اختبار تفاعلي
- اختبر نفسك بشكل حقيقي
- اختر الإجابات ثم صحّح
- عرض النتيجة والدرجة

### 🎨 تصميم عصري
- واجهة عربية جميلة
- تصميم متجاوب (موبايل + ديسكتوب)
- ألوان واضحة ومريحة للعين

---

## 🚀 البدء السريع

### النشر على Railway

1. **Fork المشروع** على GitHub
2. **ربطه بـ Railway**: New Project → Deploy from GitHub repo
3. **إضافة متغيرات البيئة** (انظر أدناه)
4. **النشر!**

راجع [دليل الإعداد الكامل](SETUP_GUIDE.md) للتعليمات التفصيلية.

### متغيرات البيئة الإلزامية

```bash
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=https://your-app/auth/callback
SESSION_SECRET_KEY=random_secret_key
```

---

## 📖 الوثائق

- [📘 دليل الإعداد الكامل](SETUP_GUIDE.md) - خطوة بخطوة
- [🔧 دليل النشر على Railway](DEPLOYMENT_GUIDE.md)
- [📝 التحديثات v3.0](UPDATES_v3.0.md)
- [🐛 الإصلاحات v3.0.2](FIXES_v3.0.2.md)

---

## 🎯 أنواع الأسئلة

حسب معايير **CEFR B1** و **Staatsexamen NT2**:

| النوع | الهدف | الصعوبة | النسبة |
|:-----|:------|:--------|:-------|
| **Globalverstehen** | الفكرة الرئيسية | 🟢 سهلة | 30% |
| **Detailverstehen** | التفاصيل المحددة | 🟡 متوسطة | 30% |
| **Woordbetekenis** | معنى الكلمات | 🟡 متوسطة | 20% |
| **Tekstdoel** | هدف النص | 🔴 صعبة | 10% |
| **Inferentie** | الاستنتاج | 🔴 صعبة | 10% |

---

## 🏗️ البنية التقنية

### Backend
- **FastAPI** - إطار عمل Python حديث
- **PostgreSQL (Neon)** - قاعدة بيانات سحابية
- **Google Generative AI (Gemini)** - ذكاء اصطناعي
- **Tesseract OCR** - استخراج النص من الصور

### Frontend
- **HTML5 + CSS3** - واجهة عصرية
- **Vanilla JavaScript** - بدون مكتبات ثقيلة

### Authentication
- **Google OAuth 2.0** - تسجيل دخول آمن

---

## 💡 أمثلة الاستخدام

### 1. توليد امتحان من نص
```
1. الصق نصاً هولندياً (100-500 كلمة)
2. اختر عدد الأسئلة (5-15)
3. اضغط "توليد الامتحان"
4. انتظر 10-30 ثانية
```

### 2. رفع صورة
```
1. اضغط "رفع ملف"
2. اختر صورة بنص هولندي
3. يُستخرج النص تلقائياً
```

### 3. حفظ ومراجعة
```
1. بعد توليد امتحان، اضغط "حفظ"
2. اذهب إلى "امتحاناتي"
3. افتح أي امتحان قديم
```

---

## 📊 الأداء والحدود

### Gemini AI Studio (مجاني)
- ⚡ 60 طلب/دقيقة
- 📅 1,500 طلب/يوم
- 💰 مجاني تماماً

### Vertex AI (مدفوع)
- ⚡ 60 طلب/دقيقة
- 📅 بدون حد يومي
- 💰 ~$0.25 لكل 1M حرف

---

## 🤝 المساهمة

المساهمات مرحب بها! إذا كان لديك اقتراح:

1. Fork المشروع
2. أنشئ branch جديد
3. Commit تغييراتك
4. Push إلى branch
5. افتح Pull Request

---

## 🐛 الإبلاغ عن مشاكل

إذا واجهت مشكلة:

1. تحقق من [دليل استكشاف الأخطاء](SETUP_GUIDE.md#استكشاف-الأخطاء)
2. ابحث في [Issues الموجودة](https://github.com/alwleedk-source/dutch-b1-exam-generator/issues)
3. افتح [Issue جديد](https://github.com/alwleedk-source/dutch-b1-exam-generator/issues/new)

---

## 📜 الترخيص

هذا المشروع مرخص تحت **MIT License**.

---

## 🙏 شكر وتقدير

- **Google Gemini** - الذكاء الاصطناعي المتقدم
- **FastAPI** - إطار العمل الرائع
- **Neon** - قاعدة البيانات السحابية
- **Railway** - منصة النشر السهلة
- **Tesseract** - OCR مفتوح المصدر

---

## 📞 التواصل

- **GitHub**: [@alwleedk-source](https://github.com/alwleedk-source)
- **المشروع**: [dutch-b1-exam-generator](https://github.com/alwleedk-source/dutch-b1-exam-generator)
- **Issues**: [الإبلاغ عن مشكلة](https://github.com/alwleedk-source/dutch-b1-exam-generator/issues)

---

<div align="center">

**صُنع بـ ❤️ للمتعلمين الهولندية**

[⬆ العودة للأعلى](#-منصة-امتحانات-b1-الهولندية---dutch-b1-exam-generator)

</div>
