# 🚀 دليل الإعداد الكامل - منصة امتحانات B1 الهولندية

## نظرة عامة

هذا الدليل يشرح كيفية إعداد ونشر المنصة الكاملة على Railway مع جميع الميزات:
- ✅ Google OAuth 2.0
- ✅ قاعدة بيانات Neon PostgreSQL
- ✅ رفع الصور/PDF
- ✅ حفظ الامتحانات
- ✅ Gemini AI / Vertex AI

---

## 📋 المتطلبات الأساسية

### 1. حساب GitHub
- المشروع موجود على: https://github.com/alwleedk-source/dutch-b1-exam-generator

### 2. حساب Railway
- التسجيل: https://railway.app
- مجاني للبداية ($5 credit شهرياً)

### 3. حساب Google Cloud
- للحصول على OAuth credentials و Gemini API key
- التسجيل: https://console.cloud.google.com

### 4. حساب Neon
- قاعدة بيانات PostgreSQL مجانية
- التسجيل: https://neon.tech

---

## 🔑 الخطوة 1: الحصول على Gemini API Key

### الطريقة الأولى: Google AI Studio (موصى بها للبداية)

1. اذهب إلى: https://aistudio.google.com/app/apikey
2. سجل الدخول بحساب Google
3. اضغط **"Create API key"**
4. اختر مشروعاً أو أنشئ مشروعاً جديداً
5. انسخ المفتاح (يبدأ بـ `AIzaSy...`)

**الحدود المجانية:**
- 60 طلب/دقيقة
- 1,500 طلب/يوم
- 32,000 طلب/شهر

### الطريقة الثانية: Vertex AI (للإنتاج)

إذا كنت تحتاج حدوداً أعلى:

1. اذهب إلى: https://console.cloud.google.com/vertex-ai
2. فعّل Vertex AI API
3. أنشئ Service Account
4. حمّل JSON key file
5. استخدم متغيرات `VERTEX_*` (انظر أدناه)

---

## 🗄️ الخطوة 2: إعداد قاعدة بيانات Neon

### 1. إنشاء قاعدة البيانات

1. اذهب إلى: https://neon.tech
2. سجل الدخول أو أنشئ حساباً
3. اضغط **"Create a project"**
4. اختر:
   - **Region**: قريب من موقعك (مثلاً: EU West)
   - **Postgres version**: 15 أو أحدث
5. اضغط **"Create project"**

### 2. الحصول على Connection String

1. في لوحة التحكم، اضغط **"Connection string"**
2. اختر **"Pooled connection"**
3. انسخ الـ connection string (يبدأ بـ `postgresql://`)

**مثال:**
```
postgresql://user:password@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 3. ملاحظات مهمة

- ✅ الخطة المجانية تعطيك **0.5 GB** تخزين
- ✅ كافية لآلاف الامتحانات
- ✅ يمكنك الترقية لاحقاً إذا احتجت

---

## 🔐 الخطوة 3: إعداد Google OAuth

### 1. إنشاء OAuth Client ID

1. اذهب إلى: https://console.cloud.google.com/apis/credentials
2. اختر مشروعاً أو أنشئ مشروعاً جديداً
3. اضغط **"Create Credentials"** → **"OAuth client ID"**
4. إذا طُلب منك، قم بإعداد **OAuth consent screen** أولاً:
   - User Type: **External**
   - App name: **Dutch B1 Exam Generator**
   - User support email: بريدك الإلكتروني
   - Developer contact: بريدك الإلكتروني
   - Scopes: أضف `email`, `profile`, `openid`
   - Test users: أضف بريدك الإلكتروني

### 2. إعداد OAuth Client

1. Application type: **Web application**
2. Name: **Dutch B1 Exam Generator**
3. Authorized JavaScript origins:
   ```
   https://your-app-name.railway.app
   ```
4. Authorized redirect URIs:
   ```
   https://your-app-name.railway.app/auth/callback
   ```
5. اضغط **"Create"**

### 3. نسخ Credentials

بعد الإنشاء، ستحصل على:
- **Client ID** (يبدأ بـ `123456789-...apps.googleusercontent.com`)
- **Client Secret** (يبدأ بـ `GOCSPX-...`)

احفظهما في مكان آمن!

---

## 🚂 الخطوة 4: النشر على Railway

### 1. ربط GitHub

1. اذهب إلى: https://railway.app
2. سجل الدخول بـ GitHub
3. اضغط **"New Project"**
4. اختر **"Deploy from GitHub repo"**
5. اختر: **`alwleedk-source/dutch-b1-exam-generator`**

### 2. إضافة متغيرات البيئة

في Railway Dashboard → **Variables**، أضف:

#### متغيرات إلزامية:

```bash
# Gemini API
GEMINI_API_KEY=AIzaSy...

# Database
DATABASE_URL=postgresql://user:password@host/database

# Google OAuth
GOOGLE_CLIENT_ID=123456789-...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://your-app.railway.app/auth/callback

# Session Secret (generate random string)
SESSION_SECRET_KEY=your-random-secret-key-here
```

#### متغيرات اختيارية:

```bash
# Vertex AI (إذا أردت استخدامه بدلاً من AI Studio)
USE_VERTEX_AI=false
VERTEX_PROJECT_ID=your-gcp-project-id
VERTEX_LOCATION=us-central1

# Port (Railway يضبطه تلقائياً)
PORT=8000
```

### 3. توليد Session Secret

استخدم هذا الأمر لتوليد مفتاح عشوائي آمن:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

أو استخدم أي string عشوائي طويل (32+ حرف).

### 4. تحديث Redirect URI

بعد النشر، ستحصل على رابط مثل:
```
https://dutch-b1-exam-generator-production.up.railway.app
```

1. انسخ الرابط
2. ارجع إلى Google Cloud Console → OAuth Client
3. حدّث **Authorized redirect URIs** إلى:
   ```
   https://your-actual-railway-url.railway.app/auth/callback
   ```
4. حدّث متغير `GOOGLE_REDIRECT_URI` في Railway

### 5. إعادة النشر

بعد تحديث جميع المتغيرات:
1. اذهب إلى **Deployments**
2. اضغط **"Redeploy"**
3. انتظر 2-3 دقائق

---

## 🧪 الخطوة 5: الاختبار

### 1. افتح التطبيق

اذهب إلى رابط Railway الخاص بك.

### 2. تسجيل الدخول

1. يجب أن تُحوّل تلقائياً إلى `/login`
2. اضغط **"تسجيل الدخول بحساب Google"**
3. اختر حساب Google
4. وافق على الصلاحيات
5. يجب أن تُحوّل إلى الصفحة الرئيسية

### 3. اختبر الميزات

#### أ) توليد امتحان:
1. الصق نصاً هولندياً (100-500 كلمة)
2. اضغط **"توليد الامتحان"**
3. انتظر 10-30 ثانية
4. يجب أن ترى الامتحان مع الترجمات

#### ب) حفظ امتحان:
1. بعد توليد امتحان، اضغط **"حفظ الامتحان"**
2. يجب أن ترى رسالة نجاح

#### ج) قائمة الامتحانات:
1. اذهب إلى `/exams`
2. يجب أن ترى جميع امتحاناتك
3. جرب فتح امتحان قديم
4. جرب حذف امتحان

#### د) رفع صورة/PDF:
1. في الصفحة الرئيسية، اضغط **"رفع ملف"**
2. اختر صورة أو PDF بنص هولندي
3. يجب أن يُستخرج النص تلقائياً
4. الملف يُحذف تلقائياً بعد الاستخراج

---

## 🔧 استكشاف الأخطاء

### المشكلة: "Authentication required"

**السبب:** OAuth غير مُعد بشكل صحيح

**الحل:**
1. تحقق من `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET`
2. تحقق من `GOOGLE_REDIRECT_URI` (يجب أن يطابق Google Console)
3. تأكد من إضافة بريدك الإلكتروني في Test users

### المشكلة: "Database not available"

**السبب:** `DATABASE_URL` غير صحيح

**الحل:**
1. تحقق من connection string من Neon
2. تأكد من أنه يبدأ بـ `postgresql://`
3. تأكد من أنه ينتهي بـ `?sslmode=require`

### المشكلة: "Failed to generate exam: 429"

**السبب:** تجاوزت الحد المجاني من Gemini

**الحل:**
1. انتظر دقيقة (إذا كان 60 طلب/دقيقة)
2. انتظر حتى منتصف الليل (إذا كان 1500 طلب/يوم)
3. أو ترقى إلى Vertex AI

### المشكلة: "Failed to process file"

**السبب:** Tesseract أو poppler غير مثبت

**الحل:**
في Railway، أضف **Nixpacks** configuration:

إنشاء ملف `nixpacks.toml`:
```toml
[phases.setup]
aptPkgs = ["tesseract-ocr", "tesseract-ocr-nld", "tesseract-ocr-eng", "poppler-utils"]
```

---

## 📊 مراقبة الاستخدام

### Gemini API (AI Studio)

1. اذهب إلى: https://aistudio.google.com/
2. API keys → اضغط على مفتاحك
3. شاهد Usage statistics

### Neon Database

1. اذهب إلى: https://console.neon.tech
2. اختر مشروعك
3. شاهد Storage usage

### Railway

1. Dashboard → Usage
2. شاهد:
   - CPU usage
   - Memory usage
   - Network bandwidth

---

## 💰 التكاليف

### المجاني (كافٍ للبداية):

| الخدمة | الحد المجاني | كافٍ لـ |
|:------|:-------------|:--------|
| **Gemini AI Studio** | 1,500 طلب/يوم | ~375 امتحان/يوم |
| **Neon Database** | 0.5 GB | ~10,000 امتحان |
| **Railway** | $5 credit/شهر | استخدام خفيف-متوسط |

### الترقية (للاستخدام المكثف):

| الخدمة | السعر | متى تحتاجه |
|:------|:-----|:-----------|
| **Vertex AI** | ~$0.25 لكل 1M حرف | إذا تجاوزت 1500 طلب/يوم |
| **Neon Pro** | $19/شهر | إذا تجاوزت 0.5 GB |
| **Railway Pro** | $20/شهر | للاستخدام المكثف |

---

## 🔒 الأمان

### Best Practices:

1. ✅ **لا ترفع `.env` على GitHub** (محمي بـ `.gitignore`)
2. ✅ **غيّر `SESSION_SECRET_KEY`** في الإنتاج
3. ✅ **استخدم HTTPS** (Railway يوفره تلقائياً)
4. ✅ **قيّد OAuth Test Users** في البداية
5. ✅ **راقب الاستخدام** بانتظام

---

## 📚 الموارد الإضافية

### الوثائق الرسمية:

- **FastAPI**: https://fastapi.tiangolo.com/
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Neon**: https://neon.tech/docs
- **Railway**: https://docs.railway.app/
- **Gemini API**: https://ai.google.dev/docs

### الدعم:

- **GitHub Issues**: https://github.com/alwleedk-source/dutch-b1-exam-generator/issues
- **Railway Discord**: https://discord.gg/railway
- **Neon Discord**: https://discord.gg/neon

---

## ✅ Checklist النشر

قبل أن تعتبر النشر مكتملاً، تحقق من:

- [ ] Gemini API key يعمل (`/health` يظهر `gemini_configured: true`)
- [ ] Database متصلة (`/health` يظهر `database_ready: true`)
- [ ] OAuth يعمل (يمكنك تسجيل الدخول)
- [ ] يمكنك توليد امتحان
- [ ] يمكنك حفظ امتحان
- [ ] يمكنك رؤية قائمة امتحاناتك
- [ ] يمكنك رفع صورة/PDF
- [ ] الترجمات تظهر عند hover
- [ ] التصميم يعمل على الموبايل

---

## 🎉 تهانينا!

إذا وصلت هنا، فقد نشرت منصة تعليمية كاملة! 🚀

الآن يمكنك:
- ✅ توليد امتحانات احترافية
- ✅ حفظها ومراجعتها
- ✅ رفع صور ومستندات
- ✅ التعلم بشكل تفاعلي

**استمتع بالتعلم! 📚🇳🇱**
