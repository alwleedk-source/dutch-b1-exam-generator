# R2 Storage - الاستخدام الحالي

## 📦 ما هو R2؟

**Cloudflare R2** هو خدمة تخزين سحابية (Object Storage) مشابهة لـ AWS S3، لكن بدون رسوم على نقل البيانات (egress).

---

## 🔧 الإعدادات الحالية

في ملف `.env`:
```env
R2_ACCOUNT_ID="b64f82cfcef1137e14debdd974ecc017"
R2_ACCESS_KEY_ID="a5aed61b166e5737a3526c9b1c1afb23"
R2_SECRET_ACCESS_KEY="f49acd44611c82a4d8265c402ce83aeb1b26280b311ad597a26c175733f89361"
R2_BUCKET_NAME="buildo-images"
R2_PUBLIC_URL="https://pub-d7d27ea540844e02b2a9ebb7e1f16900.r2.dev"
```

---

## 📁 الملفات المتعلقة بـ R2

### 1. `server/lib/r2.ts` - مكتبة R2 الأساسية

يحتوي على 3 دوال رئيسية:

#### أ) `uploadToR2(key, body, contentType)`
- **الوظيفة:** رفع ملف إلى R2
- **المدخلات:**
  - `key`: مسار الملف في R2 (مثل: `audio/1732208400-abc123.mp3`)
  - `body`: محتوى الملف (Buffer أو string)
  - `contentType`: نوع MIME (مثل: `audio/mpeg`, `image/png`)
- **المخرجات:** رابط عام للملف (Public URL)

**مثال:**
```typescript
const audioUrl = await uploadToR2(
  'audio/1732208400-abc123.mp3',
  audioBuffer,
  'audio/mpeg'
);
// Returns: https://pub-d7d27ea540844e02b2a9ebb7e1f16900.r2.dev/audio/1732208400-abc123.mp3
```

#### ب) `getR2SignedUrl(key, expiresIn)`
- **الوظيفة:** الحصول على رابط موقع للملف
- **الاستخدام:** إذا لم يكن الـ bucket عام

#### ج) `generateFileKey(prefix, filename)`
- **الوظيفة:** توليد مفتاح فريد للملف
- **الصيغة:** `{prefix}/{timestamp}-{random}.{extension}`
- **مثال:** `audio/1732208400-abc123def.mp3`

---

## 🎯 الاستخدام الحالي في التطبيق

### ✅ حالياً يُستخدم فقط لـ: **Text-to-Speech (TTS)**

**الملف:** `server/lib/tts.ts`

```typescript
import { uploadToR2 } from './r2';

// في دالة generateSpeech:
const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
const contentType = 'audio/mpeg'; // أو audio/ogg

const audioUrl = await uploadToR2(filename, audioBuffer, contentType);
```

**الوظيفة:**
1. توليد صوت من نص باستخدام Google Text-to-Speech
2. رفع الملف الصوتي إلى R2
3. إرجاع رابط الصوت للمستخدم

---

## ❌ ما لا يُستخدم حالياً

### 1. **رفع الصور**
- لا يوجد endpoint لرفع الصور إلى R2
- الصور حالياً تُرسل كـ Base64 فقط (للـ OCR)
- لا يتم حفظ الصور في R2

### 2. **الصور في النصوص**
- النصوص حالياً نص عادي فقط (plain text)
- لا يوجد دعم لـ Markdown images
- لا يوجد دعم لعرض الصور في الامتحانات

### 3. **المرفقات**
- لا يوجد نظام لرفع ملفات PDF أو مستندات

---

## 🔄 كيف يعمل R2 تقنياً؟

### 1. الاتصال:
```typescript
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
```

### 2. الرفع:
```typescript
const command = new PutObjectCommand({
  Bucket: R2_BUCKET_NAME,      // "buildo-images"
  Key: key,                     // "audio/123-abc.mp3"
  Body: body,                   // Buffer أو string
  ContentType: contentType,     // "audio/mpeg"
});

await r2Client.send(command);
```

### 3. الرابط العام:
```typescript
return `${R2_PUBLIC_URL}/${key}`;
// https://pub-d7d27ea540844e02b2a9ebb7e1f16900.r2.dev/audio/123-abc.mp3
```

---

## 📊 البنية الحالية في R2

```
buildo-images/           (Bucket)
├── audio/               (مجلد الصوتيات)
│   ├── 1732208400-abc123.mp3
│   ├── 1732208401-def456.mp3
│   └── ...
└── (لا يوجد مجلدات أخرى حالياً)
```

---

## 💡 ما يمكن إضافته

### 1. رفع الصور:
```typescript
// في server/routers.ts
uploadImage: protectedProcedure
  .input(z.object({
    imageBase64: z.string(),
    filename: z.string(),
  }))
  .mutation(async ({ input }) => {
    const buffer = Buffer.from(input.imageBase64.split(',')[1], 'base64');
    const key = generateFileKey('images', input.filename);
    const imageUrl = await uploadToR2(key, buffer, 'image/png');
    return { imageUrl, key };
  });
```

### 2. دعم الصور في النصوص:
```markdown
Dit is een Nederlandse tekst.

![Beschrijving](https://pub-d7d27ea540844e02b2a9ebb7e1f16900.r2.dev/images/123-abc.png)

Meer tekst hier...
```

### 3. عرض الصور في الامتحانات:
- تعديل `InteractiveText` component
- استخدام markdown-to-jsx أو react-markdown

---

## 🎯 الخلاصة

**الاستخدام الحالي:**
- ✅ TTS (Text-to-Speech) فقط
- ✅ رفع ملفات الصوت إلى R2
- ✅ روابط عامة تعمل

**غير مستخدم:**
- ❌ رفع الصور
- ❌ الصور في النصوص
- ❌ المرفقات الأخرى

**لإضافة دعم الصور:**
1. إنشاء mutation لرفع الصور
2. تعديل RichTextEditor لدعم لصق الصور
3. تعديل InteractiveText لعرض الصور
4. تخزين روابط الصور في النص (Markdown)
