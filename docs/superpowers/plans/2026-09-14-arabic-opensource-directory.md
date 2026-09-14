# Arabic Open Source Directory & Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-ready Arabic Open Source Directory monorepo comprising a curated project catalog, automated GitHub telemetry sync script, GitHub Actions scheduled deployment, and a bilingual React showcase website with RTL/LTR support.

**Architecture:** Monorepo powered by Node.js/TypeScript and Vite. Human-maintained project entries live in `data/projects.json`, an automated Node.js sync script (`scripts/sync.mjs`) enriches them with live GitHub stats into `projects-enriched.json`, and a high-performance React SPA renders the interactive showcase deployed to GitHub Pages.

**Tech Stack:** React 18+, TypeScript, Vite, Lucide-React, Vanilla CSS design tokens with modern Arabic typography (IBM Plex Sans Arabic), Node.js ESM scripts, GitHub Actions (`actions/deploy-pages@v4`).

**Spec:** [2026-09-14-arabic-opensource-directory-design.md](file:///c:/Users/Osa.mabkhoot/Documents/zkt_projects/ar_dir/docs/superpowers/specs/2026-09-14-arabic-opensource-directory-design.md)

## Global Constraints

- Runtime: Node.js 20+ with ES modules (`"type": "module"` in `package.json`).
- Typography: Google Fonts `IBM Plex Sans Arabic` for Arabic text, `Plus Jakarta Sans` for English and numerical data.
- Dual Language: Full bilingual support (`ar` and `en`) with automatic `dir="rtl"` and `dir="ltr"` attribute switching on `<html>`.
- Zero External Hosting Costs: 100% static hosting on GitHub Pages with automated cron workflows.
- Resilience: Sync script must never break builds if an individual repository API request fails.

---

### Task 1: Repository Foundation, Project Scaffolding & Data Taxonomies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `data/categories.json`
- Create: `data/projects.json`
- Create: `src/types/index.ts`

**Interfaces:**
- Produces:
  - `Category`: `{ id: string; name: { ar: string; en: string }; description: { ar: string; en: string }; icon: string }`
  - `CuratedProject`: `{ id: string; repo: string; category: string; title: { ar: string; en: string }; description: { ar: string; en: string }; homepage?: string; featured?: boolean; tags: string[] }`
  - `EnrichedProject`: Extends `CuratedProject` with `github` metrics, `activityStatus`, and `lastSyncedAt`.

- [ ] **Step 1: Create `package.json` with scripts and dependencies**

```json
{
  "name": "arabic-opensource-directory",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "validate": "node scripts/validate.mjs",
    "sync": "node scripts/sync.mjs"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.2"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`, `tsconfig.node.json`, and `vite.config.ts`**

Configure Vite with relative/configured base URL for GitHub Pages compatibility and TypeScript path aliases.

- [ ] **Step 3: Create `data/categories.json`**

Define the 8 taxonomy categories: `nlp-ai`, `text-tashkeel`, `fonts-calligraphy`, `dev-tools`, `ocr-vision`, `islamic-tech`, `dictionaries-datasets`, and `platforms-apps`.

- [ ] **Step 4: Create `data/projects.json` with initial seed catalog**

Populate at least 12 well-known Arabic open-source repositories:
- `CAMeL-Lab/camel_tools`
- `aub-mind/arabert`
- `linuxscout/pyarabic`
- `linuxscout/mishkal`
- `linuxscout/qalsadi`
- `alif-type/amiri`
- `mpcabd/python-arabic-reshaper`
- `quran/quran.com-api`
- `UBC-NLP/almo_gem`
- `bshramin/hanzala`
- `arbml/klaam`
- `raghavan/tashkeela`

- [ ] **Step 5: Create `src/types/index.ts`**

Export TypeScript definitions for `Category`, `CuratedProject`, `GitHubMetrics`, `EnrichedProject`, `FilterState`, and `SortOption`.

- [ ] **Step 6: Install dependencies & verify base install**

Run: `npm install`  
Expected: Dependencies installed with clean exit code 0.

- [ ] **Step 7: Commit foundation**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts index.html data/ src/types/
git commit -m "chore: scaffold project structure, types, and initial catalog"
```

---

### Task 2: Data Validation Script & Schema Checker

**Files:**
- Create: `scripts/validate.mjs`
- Test: Run `npm run validate`

**Interfaces:**
- Consumes: `data/categories.json`, `data/projects.json`
- Produces: CLI exit code 0 on success, exit code 1 with descriptive error messages on invalid entries.

- [ ] **Step 1: Write `scripts/validate.mjs`**

Implement validation logic:
1. Validates that `data/categories.json` is a non-empty array with valid `id`, `name.ar`, `name.en`, and `icon`.
2. Validates `data/projects.json`:
   - Unique project IDs.
   - Unique `repo` paths in `owner/name` format.
   - `category` exists in categories list.
   - Non-empty `title.ar`, `title.en`, `description.ar`, and `description.en`.
   - `tags` is an array of strings.

- [ ] **Step 2: Run validation on initial dataset**

Run: `npm run validate`  
Expected: Outputs "✓ Validation successful: 12 projects and 8 categories verified." with exit code 0.

- [ ] **Step 3: Commit validation script**

```bash
git add scripts/validate.mjs
git commit -m "feat(scripts): add schema validator for categories and project catalog"
```

---

### Task 3: GitHub Telemetry Sync Script & Snapshot Generator

**Files:**
- Create: `scripts/sync.mjs`
- Create: `data/projects-enriched.json`
- Create: `public/data/projects-enriched.json`

**Interfaces:**
- Consumes: `data/projects.json`, `process.env.GITHUB_TOKEN`
- Produces: `data/projects-enriched.json` and `public/data/projects-enriched.json` containing live statistics and computed activity status.

- [ ] **Step 1: Implement `scripts/sync.mjs`**

Implement GitHub REST API fetcher:
1. Read existing `data/projects-enriched.json` if present (to serve as fallback cache).
2. For each project in `data/projects.json`, query:
   - `https://api.github.com/repos/${repo}`
   - `https://api.github.com/repos/${repo}/releases/latest`
3. Extract:
   - `stars` (`stargazers_count`)
   - `forks` (`forks_count`)
   - `openIssues` (`open_issues_count`)
   - `primaryLanguage` (`language`)
   - `license` (`license.spdx_id`, `license.name`)
   - `lastCommitAt` (`pushed_at`)
   - `latestRelease` (`tag_name`, `published_at`)
   - `isArchived` (`archived`)
   - `topics` (`topics`)
4. Compute `activityStatus`:
   - If `isArchived` -> `"archived"`
   - If `lastCommitAt` < 180 days -> `"active"`
   - If `lastCommitAt` < 365 days -> `"maintained"`
   - Otherwise -> `"inactive"`
5. Write formatted JSON to `data/projects-enriched.json` and `public/data/projects-enriched.json`.

- [ ] **Step 2: Run sync script locally and generate snapshot**

Run: `node scripts/sync.mjs`  
Expected: Successfully queries repos, calculates metrics, and generates enriched files without fatal errors.

- [ ] **Step 3: Commit sync script and enriched snapshot**

```bash
git add scripts/sync.mjs data/projects-enriched.json public/data/projects-enriched.json
git commit -m "feat(scripts): add github telemetry sync script and initial snapshot"
```

---

### Task 4: GitHub Actions Workflow & Community Contribution Templates

**Files:**
- Create: `.github/workflows/sync-and-deploy.yml`
- Create: `.github/ISSUE_TEMPLATE/submit-project.yml`
- Create: `.github/ISSUE_TEMPLATE/config.yml`

**Interfaces:**
- Automates: Weekly telemetry sync, validation on PRs, static building, and deployment to GitHub Pages.

- [ ] **Step 1: Write `.github/workflows/sync-and-deploy.yml`**

Workflow specification:
- Triggers: `schedule` (`cron: '0 4 * * 1'`), `push` to `main`, and `workflow_dispatch`.
- Steps:
  - Checkout repository.
  - Setup Node.js with cache: `npm`.
  - Install dependencies: `npm ci`.
  - Validate catalog: `npm run validate`.
  - Sync data: `npm run sync` with `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
  - Commit updated `data/projects-enriched.json` back to repo if changes occurred (`[skip ci]`).
  - Build React SPA: `npm run build`.
  - Upload Pages artifact & deploy via `actions/deploy-pages@v4`.

- [ ] **Step 2: Write `.github/ISSUE_TEMPLATE/submit-project.yml`**

Provide a clean GitHub issue form asking contributors for:
- Repository URL (e.g. `https://github.com/owner/repo`)
- Project Title (Arabic & English)
- Category selector (dropdown with 8 categories)
- Project Description (Arabic & English)
- Homepage / Demo link
- Tags / Keywords

- [ ] **Step 3: Commit workflow & templates**

```bash
git add .github/
git commit -m "ci: add automated sync and pages deployment workflow and issue templates"
```

---

### Task 5: Design Tokens, Typography & Context Providers (Language & Theme)

**Files:**
- Modify: `index.html` (add Google Fonts preconnect & stylesheet)
- Create: `src/index.css` (custom design tokens, dark/light variables, glassmorphic styling, RTL utilities)
- Create: `src/context/LanguageContext.tsx`
- Create: `src/context/ThemeContext.tsx`

**Interfaces:**
- `LanguageContext`: provides `{ lang: 'ar' | 'en', dir: 'rtl' | 'ltr', setLang: (lang: 'ar' | 'en') => void, t: (key: string) => string }`
- `ThemeContext`: provides `{ theme: 'dark' | 'light', toggleTheme: () => void }`

- [ ] **Step 1: Configure Google Fonts in `index.html`**

Add preconnect and font links for:
- `IBM Plex Sans Arabic:wght@300;400;500;600;700`
- `Plus Jakarta Sans:wght@400;500;600;700`

- [ ] **Step 2: Create `src/index.css`**

Implement:
- HSL CSS variables for `:root` and `[data-theme="dark"]`.
- Emerald accent palette (`--accent-500: 160 84% 39%`).
- Glassmorphism background blur classes (`.glass-panel`, `.glass-card`).
- RTL / LTR typography font-family binding.
- Card hover micro-animations and smooth transition rules.

- [ ] **Step 3: Create `src/context/LanguageContext.tsx`**

Implement language state with `localStorage` persistence. Update `document.documentElement.dir = dir` and `document.documentElement.lang = lang` dynamically on change. Provide bilingual dictionary strings for UI labels.

- [ ] **Step 4: Create `src/context/ThemeContext.tsx`**

Implement theme state with `localStorage` persistence and system preference fallback (`prefers-color-scheme`). Update `document.documentElement.setAttribute('data-theme', theme)`.

- [ ] **Step 5: Commit UI foundations & contexts**

```bash
git add index.html src/index.css src/context/
git commit -m "feat(ui): add typography, design tokens, language and theme providers"
```

---

### Task 6: Data Fetching & Filter Hook (`useProjects`)

**Files:**
- Create: `src/hooks/useProjects.ts`
- Test: Verify project filtering, search matching, and sorting with unit tests.

**Interfaces:**
- `useProjects()` hook returning:
  - `projects: EnrichedProject[]` (filtered and sorted)
  - `allProjects: EnrichedProject[]` (raw dataset)
  - `categories: Category[]`
  - `isLoading: boolean`
  - `error: string | null`
  - `searchQuery: string`, `setSearchQuery`
  - `selectedCategory: string`, `setSelectedCategory`
  - `selectedLanguage: string`, `setSelectedLanguage`
  - `selectedStatus: string`, `setSelectedStatus`
  - `sortBy: SortOption`, `setSortBy`
  - `stats: { totalProjects: number, totalStars: number, activePercentage: number, categoryCount: number }`
  - `availableLanguages: string[]`
  - `resetFilters: () => void`

- [ ] **Step 1: Implement `src/hooks/useProjects.ts`**

1. Load `data/categories.json` and `data/projects-enriched.json` (fallback to bundled imports if fetch fails).
2. Filter by category, programming language, and status (`active`, `maintained`, `all`).
3. Multi-field search: query matches against Arabic title, English title, Arabic description, English description, repo name, and tags.
4. Sort by:
   - `stars`: Descending star count.
   - `updated`: Descending `lastCommitAt`.
   - `name`: Alphabetical order by title in active language.
5. Compute live aggregate ecosystem stats: total projects count, sum of all stars, percentage of active/maintained projects, and category count.

- [ ] **Step 2: Commit hook**

```bash
git add src/hooks/useProjects.ts
git commit -m "feat(hooks): implement useProjects hook for data fetching, search, and filtering"
```

---

### Task 7: Showcase UI Components

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Hero.tsx`
- Create: `src/components/SearchAndFilters.tsx`
- Create: `src/components/ProjectCard.tsx`
- Create: `src/components/ProjectGrid.tsx`
- Create: `src/components/Footer.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Builds the modular, interactive user interface assembling the full showcase page.

- [ ] **Step 1: Create `src/components/Navbar.tsx`**

Render:
- Bilingual logo mark with Arabic typography.
- Quick stats badge.
- Language switcher button (العربية / English).
- Theme toggle button (Sun / Moon).
- "Submit Project" CTA link opening the GitHub issue template or repository.

- [ ] **Step 2: Create `src/components/Hero.tsx`**

Render:
- Compelling bilingual heading & pitch.
- 4 dynamic stats pill cards:
  - Total Projects
  - Ecosystem Stars ⭐
  - Active Health Rate %
  - Categories
- Fast "Explore Projects" and "Submit a Package" buttons.

- [ ] **Step 3: Create `src/components/SearchAndFilters.tsx`**

Render:
- Instant search input with clear button.
- Category pills with category icons and dynamic item count badges.
- Dropdown filters for Programming Language and Health Status.
- Sort dropdown (Most Stars, Recently Updated, Name).

- [ ] **Step 4: Create `src/components/ProjectCard.tsx`**

Render:
- Status indicator pulse with tooltip (`Active`, `Maintained`, `Inactive`).
- Category badge.
- Title and description in active language.
- Programming language badge & tags.
- Telemetry bar: Stars (formatted with k notation, e.g. 1.2k), Forks, Latest Release version, License badge.
- Links: GitHub Repository button and Homepage/Docs button.

- [ ] **Step 5: Create `src/components/ProjectGrid.tsx` and `Footer.tsx`**

- `ProjectGrid`: Renders grid of `ProjectCard` components, loading skeletons, and an empty state card with a "Reset Filters" action button.
- `Footer`: Links to GitHub repository, license info, and contribution instructions.

- [ ] **Step 6: Assemble in `src/App.tsx` and mount in `src/main.tsx`**

Wrap with `LanguageProvider` and `ThemeProvider`. Assemble `Navbar`, `Hero`, `SearchAndFilters`, `ProjectGrid`, and `Footer`.

- [ ] **Step 7: Commit UI components**

```bash
git add src/components/ src/App.tsx src/main.tsx
git commit -m "feat(ui): implement modern bilingual showcase components and main application"
```

---

### Task 8: Verification, Production Build & Testing

**Files:**
- Modify: `README.md` (add documentation, contribution guide, and badges)

- [ ] **Step 1: Run validation suite**

Run: `npm run validate`  
Expected: Exit code 0, all projects and categories valid.

- [ ] **Step 2: Run production build**

Run: `npm run build`  
Expected: TypeScript compiles without errors, Vite builds static bundle to `dist/` cleanly.

- [ ] **Step 3: Interactive UI verification via dev server**

Start dev server: `npm run dev`  
Verify:
1. Page loads smoothly with modern Arabic typography.
2. Language toggle switches between Arabic (RTL) and English (LTR) seamlessly.
3. Dark and light themes apply clean colors with high contrast.
4. Search filters projects in real time across Arabic and English.
5. Category pills update active selection and counts accurately.
6. Sorting by stars, updates, and names works correctly.

- [ ] **Step 4: Create comprehensive `README.md`**

Add bilingual README explaining:
- Mission of the Arabic Open Source Directory.
- How to submit new projects (via Issue or PR).
- How the automated GitHub sync works.
- Local development commands (`npm install`, `npm run dev`, `npm run sync`, `npm run build`).

- [ ] **Step 5: Final commit & tag**

```bash
git add README.md
git commit -m "docs: add comprehensive bilingual README and contribution instructions"
```
