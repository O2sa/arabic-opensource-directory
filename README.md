# دليل البرمجيات العربية مفتوحة المصدر
### Arabic Open Source Directory & Showcase Hub

<p align="center">
  <img src="https://img.shields.io/badge/مشاريع_عربية-240+-10b981?style=for-the-badge&logo=github&logoColor=white" alt="Projects" />
  <img src="https://img.shields.io/badge/التصنيفات-7-06b6d4?style=for-the-badge" alt="Categories" />
  <img src="https://img.shields.io/badge/التحديث-تلقائي_أسبوعياً-f59e0b?style=for-the-badge&logo=githubactions&logoColor=white" alt="Automation" />
  <img src="https://img.shields.io/badge/الرخصة-MIT-3b82f6?style=for-the-badge" alt="License" />
</p>

---

## 📖 عن المشروع | About The Project

**دليل البرمجيات العربية مفتوحة المصدر** هو منصة مجتمعية مفتوحة تهدف إلى توثيق، تتبع، واستعراض أفضل المشاريع والمكتبات والحزم البرمجية والنماذج اللغوية المخصصة لخدمة اللغة العربية وحوسبتها وتمكينها تقنياً.

The **Arabic Open Source Directory** is a centralized, living showcase dedicated to discovering, tracking, and celebrating open-source packages, libraries, models, and tools developed specifically for the Arabic language.

### ✨ أبرز المميزات | Key Features
* 🔄 **تحديث تلقائي عبر GitHub Actions**: يُحدّث عداد النجوم، آخر نشاط، وحالة الصيانة دورياً دون أي تدخل يدوي.
* 🌐 **واجهة ثنائية اللغة وتوافق كامل (RTL/LTR)**: دعم كامل للغتين العربية والإنجليزية مع تبديل سلس للاتجاهات.
* ⚡ **محرك بحث وتصنيف فوري**: بحث في العناوين، الأوصاف، والتقنيات مع فلترة حسب لغات البرمجة وحالة المشروع.
* 📦 **قاعدة بيانات مفتوحة ومجانية (JSON)**: يمكنك استخدام بيانات المستودع كـ API مجاني عبر `data/projects-enriched.json`.
* 🌙 **تصميم عصري داكن وفاتح**: مبني على أفضل ممارسات التصميم والخطوط العربية الحديثة (`IBM Plex Sans Arabic`).

---

## 🗂️ تصنيفات المشاريع | Categories (7)

| التصنيف بالعربية | Category in English | الوصف |
| :--- | :--- | :--- |
| **الذكاء الاصطناعي ومعالجة اللغات** | NLP & Artificial Intelligence | نماذج لغوية (LLMs)، محولات، وتوليد النصوص |
| **معالجة النصوص والتشكيل** | Text Processing & Tashkeel | أدوات التشكيل الآلي، الصرف، والتحليل النحوي |
| **الخطوط والطباعة الرقمية** | Fonts & Digital Typography | خطوط عربية مفتوحة المصدر وأدوات صف الحروف |
| **مكتبات وأدوات المطورين** | Developer Libraries & Utilities | حزم ومكتبات لمختلف لغات البرمجة، محولات الأرقام، والمساعدات |
| **التعرف الضوئي والرؤية الحاسوبية** | OCR & Computer Vision | استخراج النصوص العربية من الصور والمستندات والمخطوطات |
| **المعاجم وقواعد البيانات** | Dictionaries & Datasets | مدونات لغوية، قواميس، ومجموعات بيانات التدريب للذكاء الاصطناعي |
| **المنصات والتطبيقات** | Platforms & Web Applications | منصات وتطبيقات ويب متكاملة وأدوات تفاعلية لتعليم وتيسير العربية |

---

## 📜 معايير وسياسة قبول المشاريع | Inclusion Policy

لضمان أصالة ورصانة الدليل واقتصاره على البرمجيات المخصصة لخدمة اللغة العربية 100%، يخضع أي مشروع مقترح لمعايير صارمة ومحددة في:  
👉 **[وثيقة معايير القبول والإدراج الرسمية (docs/INCLUSION_CRITERIA.md)](docs/INCLUSION_CRITERIA.md)**

يمكنك فحص أي مشروع مرشح آلياً للتأكد من استيفائه لكافة الشروط قبل تقديمه عبر الأمر:
```bash
pnpm run check-candidate <owner/repo>
```

---

## 🚀 كيفية المساهمة وإضافة مشروعك | How to Submit a Project

> [!IMPORTANT]
> **إضافة المشاريع الجديدة متاحة ومقبولة حصرياً عبر نموذج التذاكر (GitHub Issues)!**  
> **New project submissions are accepted EXCLUSIVELY via GitHub Issues.**  
> يُرجى عدم فتح طلبات سحب يدوية لتعديل ملف `data/projects.json` مباشرة. جميع المشاريع تتم معالجتها والتحقق من رخصتها وإحصائياتها آلياً عبر خط الأتمتة.

### خطوات إضافة مشروع عربي جديد:
1. انتقل إلى نموذج تقديم المشاريع:  
   👉 **[🚀 Submit an Arabic Project / اقتراح مشروع عربي](https://github.com/O2sa/arabic-opensource-directory/issues/new?template=submit-project.yml)**.
2. املأ بيانات المشروع (رابط المستودع، التصنيف، العناوين، والوصف بالعربية والإنجليزية).
3. اضغط **Submit new issue**.

بمجرد إرسال التذكرة، سيتولى **GitHub Actions** الآتي تلقائياً:
- 📡 التحقق من صحة المستودع ووجود رخصة مفتوحة المصدر عبر GitHub API.
- ⭐ جلب عدد النجوم، والفروع، والكلمات المفتاحية (Topics).
- 🛡️ تدقيق سلامة بنية البيانات (Schema Validation).
- 🔀 فتح طلب سحب آلي (Automated Pull Request) وربطه بالتذكرة ليعتمده مدير المشروع بضغطة زر واحدة.

لمزيد من التفاصيل ومعايير القبول، يُرجى مراجعة **[دليل المساهمة (CONTRIBUTING.md)](CONTRIBUTING.md)** و **[معايير القبول والاستبعاد (docs/INCLUSION_CRITERIA.md)](docs/INCLUSION_CRITERIA.md)**.

---

### المساهمة البرمجية وتطوير الموقع (Code Contributions)
نرحب بطلبات السحب (Pull Requests) لتطوير منصة الدليل (واجهات المستخدم، تحسينات الأداء، دعم اللغات، إصلاح الأخطاء البرمجية). راجع **[CONTRIBUTING.md](CONTRIBUTING.md)** للتعرف على الخطوات وإرشادات التطوير.

---

## 🛠️ التشغيل والتطوير المحلي | Local Development

يتطلب المشروع توفر بيئة [Node.js](https://nodejs.org/) (إصدار 18 فما فوق) ومدير الحزم [pnpm](https://pnpm.io/) (إصدار 9 فما فوق).

```bash
# 1. تثبيت الحزم والاعتماديات
pnpm install

# 2. تشغيل خادم التطوير المحلي
pnpm dev

# 3. فحص صحة بيانات الكتالوج
pnpm validate

# 4. تحديث إحصائيات المشاريع من GitHub API
pnpm sync

# 5. بناء الحزمة النهائية للإنتاج
pnpm build
```

---

## 🤖 خط الأتمتة | Automation Pipelines

يحتوي المستودع على منظومة أتمتة متكاملة عبر GitHub Actions:
1. **معالجة اقتراحات المشاريع ([`process-submission.yml`](.github/workflows/process-submission.yml)):**
   - ينطلق فورياً عند فتح تذكرة اقتراح مشروع جديد.
   - يتحقق من المستودع، ويستخرج الإحصائيات والرخص، ويولد طلب سحب (PR) آلي وموثق للمراجعة.
2. **المزامنة الدورية والنشر ([`sync-and-deploy.yml`](.github/workflows/sync-and-deploy.yml)):**
   - يعمل أسبوعياً بجدول زمني (كل يوم إثنين الساعة 04:00 UTC) وعند كل دفع لفرع `main`.
   - يقوم بتحديث إحصائيات النجوم والنشاط لكافة المشاريع وبناء ونشر الموقع تلقائياً على **GitHub Pages**.


---

## 📄 الترخيص | License

هذا المستودع متاح كبرمجية مفتوحة المصدر بموجب رخصة **[MIT License](LICENSE)**.
جميع الحقوق الفكرية للمشاريع المدرجة تعود لأصحابها ومطوريها الأصليين.
