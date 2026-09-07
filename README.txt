محادثتي + Gemini — نسخة Vercel

1) ارفع الملفات إلى GitHub.
2) في Vercel اختر Add New > Project ثم اختر مستودع GitHub واضغط Deploy.
3) بعد إنشاء المشروع:
   Settings > Environment Variables
   أضف:
   GEMINI_API_KEY = مفتاح Gemini الخاص بك
   GEMINI_MODEL = gemini-2.5-flash (اختياري)
4) اختر Production/Preview حسب الحاجة ثم Save.
5) أعد Deploy لأن متغيرات البيئة الجديدة تحتاج إعادة نشر.

هيكل المشروع:
- index.html
- script.js
- api/chat.js
- vercel.json

مفتاح Gemini موجود فقط في Vercel Environment Variables وليس في الواجهة.
