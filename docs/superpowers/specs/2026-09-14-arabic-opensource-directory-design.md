# Design Specification: Arabic Open Source Directory & Showcase

**Date**: 2026-09-14  
**Status**: Approved (Brainstorming Phase)  
**Target Repository**: `ar_dir`  

---

## 1. Executive Summary & Goals

The Arabic Open Source Directory is an open-source hub dedicated to curating, tracking, and showcasing open-source software, packages, models, and platforms centered around the Arabic language.

### Core Objectives:
1. **Curated Living Catalog**: Maintain a community-driven repository of Arabic open-source projects across NLP, diacritization, fonts, developer tools, OCR, and digital platforms.
2. **Automated Live Metrics**: Continuously enrich repository data with real-time GitHub statistics (stars, forks, open issues, license, last commit, latest release, active/archived status).
3. **Premium Bilingual Showcase Website**: Deliver a modern, high-performance React web application with Arabic/English bilingual support, seamless RTL/LTR switching, instant search, and category filtering.
4. **Zero-Maintenance Monorepo**: Package the curated dataset, automated sync scripts, and frontend showcase in a single repository hosted for free via GitHub Pages.

---

## 2. System Architecture & Repository Layout

The project uses a unified Node.js / TypeScript stack to eliminate multi-runtime dependencies and streamline open-source contributions.

```
ar_dir/
├── .github/
│   ├── workflows/
│   │   └── sync-and-deploy.yml    # Daily cron + push trigger to sync stats & deploy to Pages
│   └── ISSUE_TEMPLATE/
│       └── submit-project.yml     # GitHub Issue form for community project suggestions
├── data/
│   ├── categories.json            # Category definitions (IDs, bilingual names, icons)
│   ├── projects.json              # Curated base registry (human-maintained source of truth)
│   └── projects-enriched.json     # Machine-generated dataset with live GitHub metrics
├── scripts/
│   ├── sync.mjs                   # Automated script querying GitHub API to enrich project data
│   └── validate.mjs               # JSON schema and URL validator for PRs
├── src/                           # React Showcase Web Application
│   ├── assets/                    # Icons and vector graphics
│   ├── components/
│   │   ├── Navbar.tsx             # Brand, language toggle (AR/EN), theme toggle, submit CTA
│   │   ├── Hero.tsx               # Header title, mission statement, and live ecosystem counters
│   │   ├── SearchAndFilters.tsx   # Search input, category pills, language & status dropdowns, sort
│   │   ├── ProjectCard.tsx        # Project card with status indicator, metrics, tags, and links
│   │   ├── ProjectGrid.tsx        # Responsive grid layout with empty state handling
│   │   └── Footer.tsx             # Open-source footer, contribution link, and credits
│   ├── context/
│   │   ├── LanguageContext.tsx    # Manages locale ('ar' | 'en') and direction ('rtl' | 'ltr')
│   │   └── ThemeContext.tsx       # Manages theme ('dark' | 'light')
│   ├── hooks/
│   │   └── useProjects.ts         # Loads, filters, searches, and sorts projects
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces for Project, Category, and Metrics
│   ├── App.tsx                    # Main application view assembling components
│   ├── index.css                  # CSS tokens, typography, gradients, and micro-animations
│   └── main.tsx                   # React root mount
├── public/
│   └── data/
│       └── projects-enriched.json # Symlinked or generated copy for frontend runtime consumption
├── index.html                     # HTML entry point with bilingual fonts and SEO metadata
├── package.json                   # Root scripts and dependencies (React 18+, Vite, Lucide-React)
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler configuration (with GitHub Pages base path)
```

---

## 3. Data Schema Specifications

### 3.1 `data/categories.json`
Array of taxonomy categories:
```json
[
  {
    "id": "nlp-ai",
    "name": { "ar": "الذكاء الاصطناعي ومعالجة اللغات الطبيعية", "en": "NLP & Artificial Intelligence" },
    "description": { "ar": "نماذج لغوية، معالجة النصوص، والترجمة الآلية", "en": "LLMs, text processing, and machine translation" },
    "icon": "Cpu"
  },
  {
    "id": "text-tashkeel",
    "name": { "ar": "معالجة النصوص والتشكيل", "en": "Text Processing & Diacritization" },
    "description": { "ar": "تشكيل النصوص، الصرف، والتحليل النحوي", "en": "Tashkeel, morphology, and grammar parsing" },
    "icon": "Type"
  },
  {
    "id": "fonts-calligraphy",
    "name": { "ar": "الخطوط والطباعة الرقمية", "en": "Fonts & Digital Typography" },
    "description": { "ar": "خطوط عربية مفتوحة المصدر وأدوات صف الحروف", "en": "Open source Arabic typefaces and typesetting tools" },
    "icon": "PenTool"
  },
  {
    "id": "dev-tools",
    "name": { "ar": "مكتبات وأدوات المطورين", "en": "Developer Libraries & Utilities" },
    "description": { "ar": "حزم برمجية، محولات التاريخ والتقويم الهجري، والمساعدات العامة", "en": "Packages, Hijri calendars, and developer utilities" },
    "icon": "Code2"
  },
  {
    "id": "ocr-vision",
    "name": { "ar": "التعرف الضوئي والرؤية الحاسوبية", "en": "OCR & Computer Vision" },
    "description": { "ar": "استخراج النصوص العربية من الصور والمستندات", "en": "Arabic text extraction from images and scanned documents" },
    "icon": "ScanText"
  },
  {
    "id": "islamic-tech",
    "name": { "ar": "التقنية الإسلامية والقرآنية", "en": "Quranic & Islamic Tech" },
    "description": { "ar": "واجهات برمجية ومكتبات للقرآن الكريم ومواقيت الصلاة", "en": "APIs and libraries for Quranic texts and prayer timings" },
    "icon": "BookOpen"
  },
  {
    "id": "dictionaries-datasets",
    "name": { "ar": "المعاجم وقواعد البيانات", "en": "Dictionaries & Datasets" },
    "description": { "ar": "قواميس لغوية، مدونات نصوص، ومجموعات بيانات", "en": "Lexicons, corpora, and training datasets" },
    "icon": "Database"
  },
  {
    "id": "platforms-apps",
    "name": { "ar": "المنصات والتطبيقات", "en": "Platforms & Web Applications" },
    "description": { "ar": "منصات مفتوحة المصدر وتطبيقات كاملة لخدمة المحتوى العربي", "en": "Full-stack applications and platforms serving Arabic users" },
    "icon": "Globe"
  }
]
```

### 3.2 `data/projects.json` (Curated Input)
Minimal human-curated project metadata:
```json
{
  "id": "camel-tools",
  "repo": "CAMeL-Lab/camel_tools",
  "category": "nlp-ai",
  "title": { "ar": "CAMeL Tools", "en": "CAMeL Tools" },
  "description": {
    "ar": "مجموعة أدوات لتحليل ومعالجة وتشكيل اللغة العربية من مختبر CAMeL",
    "en": "A suite of Arabic natural language processing tools developed by CAMeL Lab"
  },
  "homepage": "https://camel-tools.readthedocs.io",
  "featured": true,
  "tags": ["python", "nlp", "morphology", "tashkeel"]
}
```

### 3.3 `data/projects-enriched.json` (Enriched Output)
Combines curated input with automated GitHub telemetry:
```json
{
  "id": "camel-tools",
  "repo": "CAMeL-Lab/camel_tools",
  "category": "nlp-ai",
  "title": { "ar": "CAMeL Tools", "en": "CAMeL Tools" },
  "description": {
    "ar": "مجموعة أدوات لتحليل ومعالجة وتشكيل اللغة العربية من مختبر CAMeL",
    "en": "A suite of Arabic natural language processing tools developed by CAMeL Lab"
  },
  "homepage": "https://camel-tools.readthedocs.io",
  "featured": true,
  "tags": ["python", "nlp", "morphology", "tashkeel"],
  "github": {
    "owner": "CAMeL-Lab",
    "name": "camel_tools",
    "url": "https://github.com/CAMeL-Lab/camel_tools",
    "stars": 1280,
    "forks": 240,
    "openIssues": 28,
    "license": { "spdxId": "MIT", "name": "MIT License" },
    "primaryLanguage": "Python",
    "lastCommitAt": "2025-11-20T14:32:10Z",
    "latestRelease": { "tag": "v1.5.2", "publishedAt": "2025-10-15T10:00:00Z" },
    "isArchived": false,
    "topics": ["arabic", "nlp", "morphology", "tashkeel"]
  },
  "activityStatus": "active",
  "lastSyncedAt": "2026-09-14T17:00:00Z"
}
```

**Activity Status Heuristics**:
- `archived`: GitHub reports `isArchived: true`.
- `active`: Last commit date within the past 180 days (6 months).
- `maintained`: Last commit date between 180 and 365 days (6-12 months).
- `inactive`: Last commit date older than 365 days.

---

## 4. Automation Pipeline & Scripts

### 4.1 Sync Script (`scripts/sync.mjs`)
* Reads `data/projects.json`.
* Queries GitHub REST API: `GET https://api.github.com/repos/{owner}/{repo}` and `/releases/latest`.
* Uses `GITHUB_TOKEN` environment variable if available (5,000 req/hr rate limit); operates without token in dev mode (60 req/hr).
* Employs batching with concurrency limit of 5 to respect rate limiting.
* Fallback resilience: If a network error or rate limit occurs for a repo, it retains the previously enriched data if available, ensuring pipeline continuity.
* Writes output to both `data/projects-enriched.json` and `public/data/projects-enriched.json`.

### 4.2 Validation Script (`scripts/validate.mjs`)
* Verifies `data/projects.json` structure:
  * Unique `id` and `repo` entries.
  * Valid `category` matching `data/categories.json`.
  * `repo` matches `^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$`.
  * Bilingual `title` and `description` are present.

### 4.3 GitHub Actions Workflow (`.github/workflows/sync-and-deploy.yml`)
* **Schedule**: Weekly cron (`0 4 * * 1`) and manual trigger (`workflow_dispatch`).
* **Push**: Triggered on changes to `main` branch.
* **Steps**:
  1. Checkout with full commit history.
  2. Setup Node.js 20 with npm caching.
  3. Install dependencies (`npm ci`).
  4. Run validation (`node scripts/validate.mjs`).
  5. Run sync (`node scripts/sync.mjs`) with `GITHUB_TOKEN`.
  6. Git commit & push `data/projects-enriched.json` if changes exist (`[skip ci]`).
  7. Build React SPA (`npm run build`).
  8. Upload & deploy static artifact to GitHub Pages (`actions/deploy-pages@v4`).

---

## 5. React Showcase Web Application

### 5.1 Design System & Typography
* **Fonts**: Google Fonts `IBM Plex Sans Arabic` for Arabic typography and `Plus Jakarta Sans` for English, numeric counters, and code badges.
* **Colors & Themes**:
  * Dark Mode: Deep slate background (`#0b0f19`), elevated card surfaces (`#111827`), emerald accent (`#10b981`), and cyan highlights.
  * Light Mode: Clean off-white background (`#f8fafc`), card surfaces (`#ffffff`), and emerald slate contrast.
* **RTL / LTR**: Seamless direction switching. When `ar` is active, document root has `dir="rtl"`; when `en` is active, `dir="ltr"`.

### 5.2 Key User Interface Components
* **Navbar**: Logo with Arabic calligraphy icon, search shortcut, Language Switcher (العربية / English), Theme Toggle, and "Submit Project" link.
* **Hero Section**:
  * Impactful headline in Arabic/English.
  * Key performance indicator (KPI) counters:
    * Total Projects
    * Combined GitHub Stars
    * Active Projects (%)
    * Categories Covered
* **Search & Filter Controls**:
  * Debounced instant text search (filters title, description, repo, and tags).
  * Category Pills with icons and count badges.
  * Technology Stack filter (Python, TypeScript, Rust, Go, C++, PHP, etc.).
  * Activity Status filter (Active, Maintained, All).
  * Sort options: Most Stars (default), Recently Updated, Name (A-Z).
* **Project Card**:
  * Status indicator dot (Green: Active, Yellow: Maintained, Gray: Inactive).
  * Category badge.
  * Project title and bilingual description.
  * Topic tags.
  * Live telemetry bar: Star count badge, fork count, latest release version, license.
  * Direct action buttons: GitHub Repository and Live Documentation/Website.
* **Empty & Loading States**:
  * Smooth skeleton loaders while data is fetching.
  * Informative empty state if search/filter produces no results, with a reset filter button.

---

## 6. Testing & Quality Assurance Plan

1. **Schema Validation**: Automated test runs `scripts/validate.mjs` verifying JSON validity.
2. **Build Verification**: `npm run build` compiles TypeScript and creates Vite production bundle without errors.
3. **Responsive & RTL Verification**: Verify rendering across desktop and mobile screens in both Arabic (RTL) and English (LTR) modes.
4. **Sync Script Dry Run**: Test `scripts/sync.mjs` with sample repos and mock responses.

---

## 7. Initial Curated Dataset (Day 1)

The directory will launch populated with prominent Arabic open-source repositories:
- `CAMeL-Lab/camel_tools` (NLP & Morphology)
- `aub-mind/arabert` (Arabic BERT Models)
- `linuxscout/pyarabic` (Arabic Python Library)
- `linuxscout/mishkal` (Arabic Diacritization / Tashkeel)
- `linuxscout/qalsadi` (Arabic Morphological Analyzer)
- `alif-type/amiri` (Classic Arabic Naskh Typeface)
- `mpcabd/python-arabic-reshaper` (Arabic Text Reshaper)
- `quran/quran.com-api` (Comprehensive Quranic API)
- `UBC-NLP/almo_gem` (Arabic Natural Language Generation)
- `bshramin/hanzala` (Arabic Sentiment Analysis)
- `arbml/klaam` (Arabic Speech Recognition & TTS)
- `raghavan/tashkeela` (Vocalized Arabic Text Corpus)
