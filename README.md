# دليل البرمجيات العربية مفتوحة المصدر
### Arabic Open Source Directory & Showcase Hub

<p align="center">
  <img src="https://img.shields.io/badge/مشاريع_عربية-14+-10b981?style=for-the-badge&logo=github&logoColor=white" alt="Projects" />
  <img src="https://img.shields.io/badge/التصنيفات-8-06b6d4?style=for-the-badge" alt="Categories" />
  <img src="https://img.shields.io/badge/التحديث-تلقائي_أسبوعياً-f59e0b?style=for-the-badge&logo=githubactions&logoColor=white" alt="Automation" />
  <img src="https://img.shields.io/badge/الرخصة-MIT-3b82f6?style=for-the-badge" alt="License" />
</p>

---

## 📖 عن المشروع | About The Project

**دليل البرمجيات العربية مفتوحة المصدر** هو منصة مجتمعية مفتوحة تهدف إلى توثيق، تتبع، واستعراض أفضل المشاريع والمكتبات والحزم البرمجية والنماذج اللغوية المخصصة لخدمة اللغة العربية والذكاء الاصطناعي.

The **Arabic Open Source Directory** is a centralized, living showcase dedicated to discovering, tracking, and celebrating open-source packages, libraries, models, and tools developed for the Arabic language.

### ✨ أبرز المميزات | Key Features
* 🔄 **تحديث تلقائي عبر GitHub Actions**: يُحدّث عداد النجوم، آخر نشاط، وحالة الصيانة دورياً دون أي تدخل يدوي.
* 🌐 **واجهة ثنائية اللغة وتوافق كامل (RTL/LTR)**: دعم كامل للغتين العربية والإنجليزية مع تبديل سلس للاتجاهات.
* ⚡ **محرك بحث وتصنيف فوري**: بحث في العناوين، الأوصاف، والتقنيات مع فلترة حسب لغات البرمجة وحالة المشروع.
* 📦 **قاعدة بيانات مفتوحة ومجانية (JSON)**: يمكنك استخدام بيانات المستودع كـ API مجاني عبر `data/projects-enriched.json`.
* 🌙 **تصميم عصري داكن وفاتح**: مبني على أفضل ممارسات التصميم والخطوط العربية الحديثة (`IBM Plex Sans Arabic`).

---

## 🗂️ تصنيفات المشاريع | Categories

| التصنيف بالعربية | Category in English | الوصف |
| :--- | :--- | :--- |
| **الذكاء الاصطناعي ومعالجة اللغات** | NLP & Artificial Intelligence | نماذج لغوية (LLMs)، محولات، وتوليد النصوص |
| **معالجة النصوص والتشكيل** | Text Processing & Tashkeel | أدوات التشكيل الآلي، الصرف، والتحليل النحوي |
| **الخطوط والطباعة الرقمية** | Fonts & Digital Typography | خطوط عربية مفتوحة المصدر وأدوات صف الحروف |
| **مكتبات وأدوات المطورين** | Developer Libraries & Utilities | حزم ومكتبات لمختلف لغات البرمجة (Python, PHP, etc.) |
| **التعرف الضوئي والرؤية الحاسوبية** | OCR & Computer Vision | استخراج النصوص العربية من الصور والمستندات |
| **التقنية الإسلامية والقرآنية** | Quranic & Islamic Tech | واجهات برمجية ومكتبات للقرآن الكريم والحديث الشريف |
| **المعاجم وقواعد البيانات** | Dictionaries & Datasets | مدونات لغوية، قواميس، ومجموعات بيانات التدريب |
| **المنصات والتطبيقات** | Platforms & Web Applications | منصات وتطبيقات ويب كاملة مفتوحة المصدر |

---

## 🚀 كيفية المساهمة وإضافة مشروعك | How to Submit a Project

المساهمة مفتوحة ومرحَّب بها من الجميع! يمكنك إضافة مشروع عربي بإحدى طريقتين:

### الطريقة الأولى: فتح تذكرة (GitHub Issue)
1. انتقل إلى تبويب **[Issues](../../issues/new?template=submit-project.yml)**.
2. اختر قالب **"Submit an Arabic Project"**.
3. املأ بيانات المشروع (الرابط، التصنيف، الوصف بالعربية والإنجليزية).

### الطريقة الثانية: طلب سحب مباشر (Pull Request)
1. قم بعمل Fork للمستودع.
2. أضف مشروعك في نهاية ملف [`data/projects.json`](data/projects.json):
```json
{
  "id": "my-arabic-project",
  "repo": "owner/repo",
  "category": "nlp-ai",
  "title": {
    "ar": "اسم المشروع بالعربية",
    "en": "Project Name in English"
  },
  "description": {
    "ar": "نبذة موجزة تشرح ما يفعله المشروع...",
    "en": "A concise description of what the project does..."
  },
  "homepage": "https://docs.my-project.com",
  "featured": false,
  "tags": ["python", "nlp", "arabic"]
}
```
3. تأكد من صحة البيانات بتشغيل فاحص البنية:
```bash
npm run validate
```
4. افتح طلب سحب (Pull Request)!

---

## 🛠️ التشغيل والتطوير المحلي | Local Development

يتطلب المشروع توفر بيئة [Node.js](https://nodejs.org/) (إصدار 18 فما فوق).

```bash
# 1. تثبيت الحزم والاعتماديات
npm install

# 2. تشغيل خادم التطوير المحلي
npm run dev

# 3. فحص صحة بيانات الكتالوج
npm run validate

# 4. تحديث إحصائيات المشاريع من GitHub API
npm run sync

# 5. بناء الحزمة النهائية للإنتاج
npm run build
```

---

## 🤖 خط الأتمتة | Automation Pipeline

يحتوي المستودع على سير عمل مؤتمت عبر GitHub Actions في [`.github/workflows/sync-and-deploy.yml`](.github/workflows/sync-and-deploy.yml):
1. يعمل أسبوعياً بجدول زمني (كل يوم إثنين الساعة 04:00 UTC) وعند كل دفع لفرع `main`.
2. يستعلم واجهة GitHub API لجلب النجوم والتحديثات وحالة الصيانة.
3. يقوم بعمل commit لملف `data/projects-enriched.json` المحدث.
4. يبني تطبيق React وينشره تلقائياً على **GitHub Pages**.

---

## 📄 الترخيص | License

هذا المستودع متاح كبرمجية مفتوحة المصدر بموجب رخصة **[MIT License](LICENSE)**.
جميع الحقوق الفكرية للمشاريع المدرجة تعود لأصحابها ومطوريها الأصليين.
