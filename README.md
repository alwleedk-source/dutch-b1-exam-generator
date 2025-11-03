# 🇳🇱 Dutch B1 Exam Generator | مولد امتحانات القراءة الهولندية B1

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal)
![Gemini](https://img.shields.io/badge/Gemini-AI-orange)

أداة ذكية مدعومة بالذكاء الاصطناعي لتوليد امتحانات قراءة احترافية للغة الهولندية بمستوى B1 حسب معايير CEFR الأوروبية.

An AI-powered tool for generating professional Dutch reading comprehension exams at B1 level according to CEFR standards.

## ✨ المميزات | Features

- 🤖 **توليد ذكي**: استخدام Gemini AI لإنشاء أسئلة احترافية
- 📊 **تحليل النصوص**: تحليل تلقائي لنوع النص ومستوى الصعوبة
- 🎯 **أنواع متعددة من الأسئلة**: 
  - Globalverstehen (فهم عام)
  - Detailverstehen (فهم التفاصيل)
  - Woordbetekenis (معنى الكلمات)
  - Tekstdoel (هدف النص)
  - Inferentie (استنتاج)
- ✅ **التحقق من الجودة**: تحقق تلقائي من جودة الأسئلة
- 🎨 **واجهة عربية جميلة**: تصميم عصري وسهل الاستخدام
- 📱 **متجاوب**: يعمل على جميع الأجهزة
- 🖨️ **طباعة ونسخ**: إمكانية طباعة ونسخ النتائج

## 🚀 النشر على Railway

### الخطوة 1: إعداد المشروع

1. قم بإنشاء حساب على [Railway](https://railway.app)
2. قم بإنشاء مشروع جديد: **New Project** → **Deploy from GitHub repo**
3. اختر هذا المستودع

### الخطوة 2: إضافة متغيرات البيئة

في لوحة تحكم Railway، اذهب إلى **Variables** وأضف:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

**كيفية الحصول على مفتاح Gemini:**
1. اذهب إلى [Google AI Studio](https://aistudio.google.com/)
2. سجل الدخول بحساب Google
3. اضغط على "Get API key"
4. انسخ المفتاح وضعه في Railway

### الخطوة 3: النشر

- Railway سينشر التطبيق تلقائياً!
- ستحصل على رابط مثل: `https://your-app.railway.app`

## 💻 التشغيل المحلي | Local Development

### المتطلبات

- Python 3.11+
- مفتاح Gemini API

### التثبيت

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dutch-b1-exam-generator.git
cd dutch-b1-exam-generator

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export GEMINI_API_KEY="your_api_key_here"

# Run the app
python main.py
```

افتح المتصفح على: `http://localhost:8000`

## 📖 كيفية الاستخدام | How to Use

1. **أدخل النص الهولندي**: الصق نصاً هولندياً (رسالة، إعلان، مقال، إلخ)
2. **اختر عدد الأسئلة**: من 3 إلى 15 سؤال (الافتراضي: 7)
3. **فعّل التحقق من الجودة**: للحصول على أسئلة عالية الجودة
4. **اضغط "توليد الامتحان"**: انتظر 10-30 ثانية
5. **استمتع بالنتائج**: اطبع، انسخ، أو ابدأ امتحاناً جديداً

## 🏗️ البنية التقنية | Architecture

```
dutch-b1-exam-generator/
├── main.py              # FastAPI backend
├── agent.py             # AI agent logic
├── prompts.py           # Prompt templates
├── requirements.txt     # Python dependencies
├── Procfile            # Railway deployment
├── runtime.txt         # Python version
├── static/
│   ├── index.html      # Frontend HTML
│   ├── style.css       # Styling
│   └── app.js          # Frontend JavaScript
└── README.md           # Documentation
```

## 🔧 API Endpoints

### `GET /`
الصفحة الرئيسية

### `GET /health`
فحص صحة النظام

### `POST /api/generate-exam`
توليد امتحان كامل

**Request:**
```json
{
  "text": "النص الهولندي...",
  "num_questions": 7,
  "verify_quality": true
}
```

**Response:**
```json
{
  "exam_title": "Leesexamen B1",
  "total_questions": 7,
  "text": "النص الأصلي...",
  "analysis": {...},
  "questions": [...],
  "verification": {...}
}
```

### `POST /api/analyze-text`
تحليل النص فقط

### `GET /api/info`
معلومات عن التطبيق

## 🎓 معايير B1

التطبيق يتبع معايير CEFR للمستوى B1:
- **المفردات**: 2000-2500 كلمة
- **القواعد**: جمل متوسطة التعقيد
- **المحتوى**: نصوص الحياة اليومية والعمل
- **الفهم**: الأفكار الرئيسية والتفاصيل المهمة

متوافق مع:
- ✅ امتحان Inburgering
- ✅ Staatsexamen NT2 Programma I
- ✅ معايير CEFR الأوروبية

## 🛠️ التقنيات المستخدمة | Technologies

- **Backend**: FastAPI, Python 3.11
- **AI**: Google Gemini 2.0 Flash
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Railway
- **Version Control**: Git, GitHub

## 📝 أمثلة على الأسئلة | Question Examples

### Globalverstehen (سهل)
```
Waar gaat deze tekst over?
a) Een nieuwe cursus
b) Een verandering in de planning ✅
c) Een klacht
```

### Detailverstehen (متوسط)
```
Wanneer begint de cursus?
a) Op 1 augustus
b) Op 1 september ✅
c) Op 1 oktober
```

### Woordbetekenis (متوسط)
```
Wat betekent "aanbod" in deze tekst?
a) Vraag
b) Korting ✅
c) Probleem
```

## 🤝 المساهمة | Contributing

المساهمات مرحب بها! يرجى:
1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص | License

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.

## 🙏 شكر وتقدير | Acknowledgments

- **Google Gemini AI** - للذكاء الاصطناعي القوي
- **CEFR Standards** - لمعايير اللغة الأوروبية
- **Inburgering & Staatsexamen NT2** - للإلهام في تصميم الامتحانات

## 📞 الدعم | Support

إذا واجهت أي مشاكل أو لديك اقتراحات:
- افتح Issue على GitHub
- أو تواصل عبر البريد الإلكتروني

---

صُنع بـ ❤️ للمتعلمين الهولندية | Made with ❤️ for Dutch learners

**النسخة**: 1.0.0  
**آخر تحديث**: نوفمبر 2025
