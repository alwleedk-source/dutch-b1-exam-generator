# مشكلة نسخ الصور (Image Paste Issue)

## 🔍 المشكلة المكتشفة

**ميزة نسخ الصور مع النص لا تعمل حالياً** في صفحة إنشاء الامتحان.

### السبب
الكود الحالي في `client/src/components/RichTextEditor.tsx` يتعامل فقط مع:
- ✅ نص عادي (`text/plain`)
- ✅ HTML (`text/html`)
- ❌ **الصور** (`clipboardData.files`) - **غير مدعوم**

### الكود الحالي (السطر 32-73)
```typescript
handlePaste: (view, event) => {
  const html = event.clipboardData?.getData('text/html');
  const text = event.clipboardData?.getData('text/plain');

  // يتعامل فقط مع HTML والنص
  // لا يتحقق من event.clipboardData.files
  
  if (preserveFormatting) {
    // ...
  } else {
    // ...
  }

  return false;
},
```

---

## ✅ الحل المقترح

يجب إضافة معالج للصور في الـ clipboard. هناك طريقتان:

### الطريقة 1: استخراج النص من الصورة مباشرة (OCR)
```typescript
handlePaste: (view, event) => {
  // 1. التحقق من وجود صور أولاً
  const files = Array.from(event.clipboardData?.files || []);
  const imageFile = files.find(file => file.type.startsWith('image/'));
  
  if (imageFile) {
    // تحويل الصورة إلى Base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      
      // استدعاء API لاستخراج النص
      try {
        const response = await trpc.text.extractFromImage.mutate({
          imageBase64: base64.split(',')[1], // إزالة data:image/png;base64,
        });
        
        // إدراج النص المستخرج في المحرر
        editor?.commands.insertContent(response.text);
        
        // إظهار رسالة نجاح
        toast.success(`تم استخراج ${response.characterCount} حرف من الصورة`);
      } catch (error) {
        toast.error('فشل استخراج النص من الصورة');
      }
    };
    reader.readAsDataURL(imageFile);
    
    event.preventDefault();
    return true;
  }
  
  // 2. بعد ذلك التعامل مع HTML والنص كالمعتاد
  const html = event.clipboardData?.getData('text/html');
  const text = event.clipboardData?.getData('text/plain');
  // ...
}
```

### الطريقة 2: رفع الصورة إلى قسم "Upload Image (OCR)"
```typescript
handlePaste: (view, event) => {
  const files = Array.from(event.clipboardData?.files || []);
  const imageFile = files.find(file => file.type.startsWith('image/'));
  
  if (imageFile) {
    // تمرير الصورة إلى component الأب
    if (onImagePaste) {
      onImagePaste(imageFile);
      event.preventDefault();
      return true;
    }
  }
  
  // ...
}
```

---

## 🔧 التنفيذ الموصى به

**الطريقة 1 أفضل** لأنها توفر تجربة مستخدم سلسة:
1. المستخدم ينسخ صورة
2. يلصقها في حقل النص
3. يتم استخراج النص تلقائياً وإدراجه
4. لا حاجة للتبديل بين الحقول

### الخطوات:
1. تعديل `RichTextEditor.tsx` لإضافة معالج الصور
2. إضافة loading state أثناء استخراج النص
3. إضافة error handling للحالات الفاشلة
4. إضافة toast notifications للتغذية الراجعة

---

## 📋 ملاحظات إضافية

### الحالات التي يجب التعامل معها:
- ✅ صورة واحدة
- ✅ صورة + نص معاً
- ✅ صور متعددة (معالجة الأولى فقط أو جميعها)
- ✅ صورة غير واضحة (OCR فاشل)
- ✅ صورة كبيرة جداً (> 10MB)

### تحسينات مقترحة:
1. إضافة progress indicator أثناء OCR
2. إضافة preview للصورة قبل الاستخراج
3. إضافة خيار "Edit extracted text" بعد الاستخراج
4. حفظ الصورة الأصلية كمرجع

---

## 🧪 كيفية الاختبار

### اختبار يدوي:
1. افتح صفحة إنشاء الامتحان
2. انسخ صورة تحتوي على نص هولندي (Ctrl+C من ملف أو screenshot)
3. الصق في حقل "Dutch Text" (Ctrl+V)
4. **النتيجة المتوقعة**: يتم استخراج النص وإدراجه تلقائياً
5. **النتيجة الحالية**: لا يحدث شيء ❌

### اختبار تلقائي:
```typescript
describe('RichTextEditor - Image Paste', () => {
  it('should extract text from pasted image', async () => {
    const { getByRole } = render(<RichTextEditor value="" onChange={jest.fn()} />);
    const editor = getByRole('textbox');
    
    // محاكاة لصق صورة
    const file = new File(['image content'], 'test.png', { type: 'image/png' });
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    });
    pasteEvent.clipboardData.items.add(file);
    
    fireEvent.paste(editor, pasteEvent);
    
    // انتظار استخراج النص
    await waitFor(() => {
      expect(editor).toHaveTextContent('Extracted text from image');
    });
  });
});
```
