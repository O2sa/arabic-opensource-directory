# دليل المساهمة في دليل البرمجيات العربية مفتوحة المصدر
# Contributing to the Arabic Open Source Directory

شكراً لاهتمامك بالمساهمة في إثراء ودعم المنظومة التقنية للغة العربية! نرحب بمساهمات الجميع ليبقى هذا الدليل المرجع الحي والمفتوح الأكبر للمشاريع والأدوات العربية.

Thank you for your interest in contributing to the Arabic Open Source Directory! We welcome all community contributions to keep this directory the premier living showcase for Arabic open-source software and tools.

---

## 📌 جدول المحتويات | Table of Contents
1. [إضافة المشاريع الجديدة (حصرياً عبر GitHub Issues) | Submitting New Projects](#-1-إضافة-المشاريع-الجديدة-حصرياً-عبر-github-issues--submitting-new-projects)
2. [المساهمة البرمجية وتطوير الموقع (عبر Pull Requests) | Code & Website Contributions](#-2-المساهمة-البرمجية-وتطوير-الموقع-عبر-pull-requests--code--website-contributions)
3. [معايير قبول المشاريع | Inclusion Criteria](#-3-معايير-قبول-المشاريع--inclusion-criteria)
4. [بيئة التطوير المحلي والتحقق | Local Development & Verification](#-4-بيئة-التطوير-المحلي-والتحقق--local-development--verification)

---

## 🚀 1. إضافة المشاريع الجديدة (حصرياً عبر GitHub Issues) | Submitting New Projects

> [!IMPORTANT]
> **إضافة المشاريع الجديدة متاحة ومقبولة حصرياً عبر نموذج التذاكر (GitHub Issues)!**  
> **New project submissions are accepted EXCLUSIVELY via GitHub Issues.**  
> يُرجى **عدم** فتح طلبات سحب (Pull Requests) يدوية لتعديل ملف `data/projects.json` مباشرة. أي طلب سحب يهدف فقط لإضافة مشروع يدوياً سيتم إغلاقه وتوجيه صاحبه لتعبئة النموذج.

### لماذا تم حصر إضافة المشاريع عبر GitHub Issues؟
1. **التحقق الآلي الذكي (Automated Validation):** يقوم روبوت GitHub Actions بفحص المستودع عبر واجهة GitHub API والتأكد من وجوده، وتطابق رخصته المفتوحة المصدر، واستخراج عدد النجوم والتصنيفات بدقة.
2. **فحص المطابقة البنائية (Schema Integrity):** يضمن عدم كسر بنية الكتالوج أو التسبب في أخطاء برمجية في واجهة العرض.
3. **توليد طلب سحب آلي موثق (Automated PR):** يقوم النظام تلقائياً بإنشاء فرع وتوليد Pull Request منسق بالكامل ومربوط بالتذكرة الأصلية ليقوم مدير المشروع بمراجعته واعتماده بضغطة زر واحدة.

### خطوات تقديم مشروع جديد:
1. توجه إلى صفحة تقديم مشروع جديد:  
   👉 **[🚀 Submit an Arabic Project / اقتراح مشروع عربي](https://github.com/O2sa/arabic-opensource-directory/issues/new?template=submit-project.yml)**
2. املأ حقول النموذج:
   - **رابط المستودع على GitHub (Repository URL)**: مثل `https://github.com/owner/repo`.
   - **التصنيف الأساسي (Category)**: اختر أحد التصنيفات الـ 7 المعتمدة.
   - **الاسم بالعربية والإنجليزية (Titles)**.
   - **نبذة موجزة بالعربية والإنجليزية (Descriptions)**.
   - **الكلمات المفتاحية (Tags)**: مفصولة بفواصل.
   - **تأكيد شروط المصدر المفتوح واللغة العربية (Confirmation checkbox)**.
3. اضغط **Submit new issue**.
4. خلال ثوانٍ معدودة، سيقوم النظام بمعالجة الاقتراح آلياً، وفتح طلب سحب (PR) ووضع تعليق برابطه في تذكرتك لمتابعة اعتماده.

---

## 💻 2. المساهمة البرمجية وتطوير الموقع (عبر Pull Requests) | Code & Website Contributions

نرحب ونسعد جداً بطلبات السحب (Pull Requests) الموجهة لتطوير منصة الدليل وميزاتها!

### مجالات المساهمة البرمجية المرحب بها:
- 🎨 **تحسينات التصميم وواجهة المستخدم (UI/UX)**: تحسين تجربة التصفح، والوضع الداكن/الفاتح، وتناسق الخطوط الطباعية.
- ⚡ **الميزات والأدوات التفاعلية**: تطوير محرك البحث، وتحسين الفلاتر والفرز، وميزات المقارنة ومشاركة المشاريع.
- 🌐 **دعم التدويل واللغات (i18n)**: تدقيق الترجمات، وإضافة لغات جديدة، وضبط دعم RTL/LTR.
- 🛠️ **أدوات وسكربتات الأتمتة**: تحسين سكربتات الاستكشاف ومزامنة الإحصائيات وفحص الجودة.
- 📝 **التوثيق وإصلاح الأخطاء (Bug Fixes & Documentation)**: إصلاح أي أخطاء برمجية أو تحسين ملفات التوثيق والإرشادات.

### خطوات فتح طلب سحب برمجي:
1. قم بعمل Fork للمستودع واستنسخه على جهازك:
   ```bash
   git clone https://github.com/<your-username>/arabic-opensource-directory.git
   cd arabic-opensource-directory
   ```
2. أنشئ فرعاً جديداً لتعديلاتك:
   ```bash
   git checkout -b feature/my-cool-improvement
   ```
3. قم بتثبيت الاعتماديات وتشغيل بيئة التطوير:
   ```bash
   pnpm install
   pnpm dev
   ```
4. بعد إجراء تعديلاتك، تأكد من اجتياز الفحوصات وبناء المشروع بنجاح:
   ```bash
   pnpm validate
   pnpm build
   ```
5. قم بعمل Commit واضح وادفع إلى فرعك، ثم افتح Pull Request إلى فرع `main` مستخدماً قالب طلبات السحب.

---

## 🎯 3. معايير قبول المشاريع | Inclusion Criteria

قبل اقتراح أي مشروع، نرجو مراجعة وثيقة المعايير الرسمية:  
📄 **[وثيقة معايير وسياسة قبول وإدراج المشاريع (docs/INCLUSION_CRITERIA.md)](docs/INCLUSION_CRITERIA.md)**

### القواعد الأساسية:
- **المركزية العربية (Arabic-Centric):** يجب أن يكون المشروع مصمماً خصيصاً في أصله وجوهره لخدمة وحوسبة وطباعة أو تعليم اللغة العربية.
- **كود فعلي ومفتوح المصدر:** مستودع نشط برخصة معترف بها (MIT, Apache, GPL, إلخ) وكود حقيقي قابل للاستخدام.
- **تجنب الخطوط الحمراء للاستبعاد:** لا نقبل الأدوات العامة متعددة اللغات التي تعتبر العربية مجرد لغة ثانوية مضافة (مثل EasyOCR و SpaCy)، ولا التطبيقات الدينية العامة أو قوائم الروابط الثابتة بدون برمجيات.

---

## 🛠️ 4. بيئة التطوير المحلي والتحقق | Local Development & Verification

نستخدم في هذا المشروع مدير الحزم **pnpm** وبيئة **Node.js 18+**:

| الأمر | الوظيفة |
| :--- | :--- |
| `pnpm dev` | تشغيل خادم التطوير المحلي السريع (Vite) |
| `pnpm validate` | فحص صحة بيانات الكتالوج `data/projects.json` وتوافق الـ Schema |
| `pnpm build` | فحص الأنواع وبناء حزمة الإنتاج وتوليد ملفات الـ SEO و Sitemap |
| `pnpm sync` | مزامنة إحصائيات GitHub الحية للمشاريع وتحديث التخزين المؤقت |
| `node scripts/check-candidate.mjs <owner/repo>` | فحص مشروع مرشح وتطبيق معايير القبول والاستبعاد عليه آلياً |

---

شكراً لمساهمتكم في رفعة ودعم المحتوى والبرمجيات العربية مفتوحة المصدر! ❤️
