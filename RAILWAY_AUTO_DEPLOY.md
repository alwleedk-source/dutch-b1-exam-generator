# 🚀 إعداد Auto-Deploy التلقائي في Railway

## المشكلة
أحياناً Railway لا ينشر التحديثات تلقائياً عند Push على GitHub.

---

## ✅ الحل: تفعيل Auto-Deploy

### الخطوات:

#### 1. افتح Railway Dashboard
```
https://railway.app
```

#### 2. اختر مشروعك
```
dutch-b1-exam-generator-production
```

#### 3. اذهب إلى Settings
```
اضغط على "Settings" في القائمة العلوية
```

#### 4. تحقق من GitHub Integration
```
Settings → Service → Source
```

**يجب أن ترى:**
- ✅ **Repository**: `alwleedk-source/dutch-b1-exam-generator`
- ✅ **Branch**: `master`
- ✅ **Auto Deploy**: **ON** (مفعّل)

#### 5. إذا كان Auto Deploy معطلاً:
```
1. اضغط على "Configure"
2. فعّل "Auto Deploy"
3. احفظ التغييرات
```

---

## 🔧 إعدادات إضافية موصى بها

### 1. Watch Paths (اختياري)
إذا أردت النشر فقط عند تغيير ملفات معينة:

```
Settings → Service → Watch Paths

أضف:
- **/*
- requirements.txt
- Procfile
```

**ملاحظة:** اتركها فارغة لمراقبة جميع الملفات (موصى به).

### 2. Deploy Triggers
```
Settings → Service → Deploy Triggers

تأكد من تفعيل:
✅ GitHub Push
✅ Manual Deploy
```

### 3. Build Settings
```
Settings → Service → Build

Build Command: (فارغ - يستخدم Procfile تلقائياً)
Install Command: pip install -r requirements.txt
```

---

## 🧪 اختبار Auto-Deploy

### الطريقة 1: تغيير بسيط
```bash
# على جهازك المحلي أو في Sandbox
echo "# Test" >> README.md
git add README.md
git commit -m "Test auto-deploy"
git push
```

**النتيجة المتوقعة:**
- خلال 10-30 ثانية، يجب أن يبدأ Deployment جديد في Railway
- يمكنك رؤيته في: `Deployments` tab

### الطريقة 2: Empty Commit
```bash
git commit --allow-empty -m "Trigger deploy"
git push
```

---

## 📊 مراقبة النشر

### في Railway Dashboard:

#### 1. Deployments Tab
```
Deployments → Latest Deployment

يجب أن ترى:
- Status: Building → Deploying → Success
- Logs: تفاصيل النشر
- Duration: الوقت المستغرق
```

#### 2. Logs Tab
```
Logs → Real-time logs

شاهد:
- Installing dependencies...
- Starting server...
- INFO: Uvicorn running on...
```

#### 3. Metrics Tab (اختياري)
```
Metrics → CPU, Memory, Network

راقب أداء التطبيق
```

---

## ⚠️ إذا لم يعمل Auto-Deploy

### السبب 1: GitHub Integration معطلة
**الحل:**
```
Settings → Service → Source → Reconnect GitHub
```

### السبب 2: Branch خاطئ
**الحل:**
```
Settings → Service → Source → Branch: master
```

### السبب 3: Build Failures
**الحل:**
```
Deployments → Failed Deployment → View Logs
```
ابحث عن الأخطاء وأصلحها.

### السبب 4: Railway Service Down
**الحل:**
```
تحقق من: https://status.railway.app/
```

---

## 🎯 أفضل الممارسات

### 1. استخدم Branches
```bash
# للتطوير
git checkout -b feature/new-feature
# ... عمل التغييرات
git push origin feature/new-feature

# للإنتاج (بعد الاختبار)
git checkout master
git merge feature/new-feature
git push origin master  # ← ينشر تلقائياً
```

### 2. استخدم Tags للإصدارات
```bash
git tag -a v4.1.0 -m "Release v4.1.0"
git push origin v4.1.0
```

### 3. راقب Deployment Status
```
- قبل كل Push، تحقق من أن آخر Deployment نجح
- إذا فشل، أصلح الأخطاء قبل Push جديد
```

### 4. استخدم Environment Variables
```
- لا ترفع Secrets على GitHub
- استخدم Railway Variables فقط
```

---

## 🔄 سير العمل الكامل

```
1. تطوير محلي
   ↓
2. git add, commit, push
   ↓
3. GitHub يستقبل التحديث
   ↓
4. Railway يكتشف التحديث (خلال 10-30 ثانية)
   ↓
5. يبدأ Build جديد
   ↓
6. يثبت المكتبات (pip install)
   ↓
7. يشغل التطبيق (uvicorn)
   ↓
8. يختبر الصحة (health check)
   ↓
9. ينشر على الإنتاج
   ↓
10. التطبيق جاهز! ✅
```

**الوقت الكلي:** 2-4 دقائق

---

## 🆘 الحلول السريعة

### إذا لم ينشر تلقائياً:
```bash
# الحل 1: Empty commit
git commit --allow-empty -m "Trigger deploy"
git push

# الحل 2: من Railway Dashboard
Deployments → Redeploy

# الحل 3: إعادة الاتصال
Settings → Service → Source → Reconnect
```

---

## 📝 Checklist للتحقق

قبل كل Push، تأكد من:

- [ ] ✅ Auto Deploy مفعّل في Railway
- [ ] ✅ Branch الصحيح (master)
- [ ] ✅ لا توجد أخطاء في الكود
- [ ] ✅ requirements.txt محدّث
- [ ] ✅ Environment Variables موجودة
- [ ] ✅ آخر Deployment نجح

---

## 🎉 الخلاصة

بعد تفعيل Auto-Deploy:

✅ **كل Push → نشر تلقائي**  
✅ **لا حاجة لتدخل يدوي**  
✅ **سير عمل سلس**  
✅ **توفير الوقت**  

**Railway سيراقب GitHub ويحدّث تلقائياً! 🚀**
