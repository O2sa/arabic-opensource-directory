import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile(); } catch {}
}

const token = process.env.GITHUB_TOKEN;
const repoArg = process.argv[2];

if (!repoArg || !repoArg.includes('/')) {
  console.log('Usage: node scripts/check-candidate.mjs <owner/repo>');
  console.log('Example: node scripts/check-candidate.mjs linuxscout/pyarabic');
  process.exit(1);
}

const targetRepo = repoArg.trim();

const headers = {
  'User-Agent': 'arabic-directory-candidate-checker',
  Accept: 'application/vnd.github.v3+json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
};

const CATEGORIES = [
  'nlp-ai',
  'text-tashkeel',
  'fonts-calligraphy',
  'dev-tools',
  'ocr-vision',
  'dictionaries-datasets',
  'platforms-apps'
];

const KNOWN_BLACKLIST = new Set([
  'jaidedai/easyocr',
  'zibo-chen/ocr-rs',
  'fabrizioschiavi/pragmatapro',
  'bluemix/tourism-demo',
  'shraga100/claude-desktop-rtl-patch',
  'yaqiin/boycott',
  'shahabyazdi/react-multi-date-picker',
  'pnarimani/rtltmpro',
  'yongzhuo/macropodus',
  '01walid/awesome-arabic',
  'rastikerdar/vazirmatn',
  'aminabedi68/estedad',
  'quran/quran_android',
  'batoulapps/adhan-js',
  'gaitco/quran-database',
  'sunnah-com/api'
]);

async function evaluate() {
  console.log(`\n🔍 Evaluating candidate repository: ${targetRepo}`);
  console.log('----------------------------------------------------');

  try {
    const res = await fetch(`https://api.github.com/repos/${targetRepo}`, { headers });
    if (!res.ok) {
      console.error(`❌ [FAIL] Repository not found or inaccessible (HTTP ${res.status}): ${targetRepo}`);
      process.exit(1);
    }

    const repo = await res.json();
    const name = repo.name.toLowerCase();
    const desc = (repo.description || '').toLowerCase();
    const topics = (repo.topics || []).join(' ').toLowerCase();
    const combined = `${name} ${desc} ${topics}`;

    const checks = [];

    // Check 1: Known blacklist
    if (KNOWN_BLACKLIST.has(targetRepo.toLowerCase())) {
      checks.push({ name: 'Known Blacklist Check', passed: false, reason: 'Repository is on the explicit exclusion blacklist.' });
    } else {
      checks.push({ name: 'Known Blacklist Check', passed: true });
    }

    // Check 2: Curation list / Awesome list
    const isCuratedList = name.startsWith('awesome-') || desc.startsWith('a curated list') || desc.startsWith('curated list') || combined.includes('curated list of');
    if (isCuratedList) {
      checks.push({ name: 'Software vs Link List Check', passed: false, reason: 'Repository is a curated link list, not functional software.' });
    } else {
      checks.push({ name: 'Software vs Link List Check', passed: true });
    }

    // Check 3: Generic Multilingual Tools
    const multilingualMarkers = ['80+ languages', '100+ languages', 'multilingual ocr', 'chinese nlp', 'latin alphabet', 'persian font', 'farsi font', 'persian date'];
    const hasMultilingual = multilingualMarkers.some(m => desc.includes(m));
    if (hasMultilingual) {
      checks.push({ name: 'Multilingual Non-Arabic First Check', passed: false, reason: 'Repository is a generic multilingual tool where Arabic is only secondary.' });
    } else {
      checks.push({ name: 'Multilingual Non-Arabic First Check', passed: true });
    }

    // Check 4: Religious / Lifestyle Content Apps
    const religiousMarkers = [
      'quran', 'qur\'an', 'koran', 'hadith', 'hadeeth', 'adhan', 'athan',
      'prayer time', 'prayer times', 'salat', 'salah', 'azkar', 'athkar',
      'mushaf', 'tafsir', 'tafseer', 'surah', 'ayah', 'tajweed', 'tilawa',
      'qibla', 'islamic app'
    ];
    const hasReligious = religiousMarkers.some(m => combined.includes(m));
    if (hasReligious) {
      checks.push({ name: 'Religious App Exclusion Check', passed: false, reason: 'Repository is a religious lifestyle/reading app, prayer time calculator, or scriptural data dump.' });
    } else {
      checks.push({ name: 'Religious App Exclusion Check', passed: true });
    }

    // Check 5: Non-Arabic Script Languages (Farsi, Urdu, Uyghur)
    const otherScriptMarkers = ['persian', 'farsi', 'urdu', 'uyghur', 'turkish', 'hebrew'];
    const hasOtherScript = otherScriptMarkers.some(m => combined.includes(m) && !combined.includes('arabic'));
    if (hasOtherScript) {
      checks.push({ name: 'Arabic vs Perso-Arabic Script Check', passed: false, reason: 'Repository targets Persian, Urdu, or other non-Arabic languages.' });
    } else {
      checks.push({ name: 'Arabic vs Perso-Arabic Script Check', passed: true });
    }

    // Check 6: Homework / School assignments
    const homeworkMarkers = ['homework', 'assignment', 'course notes', 'interview prep'];
    const hasHomework = homeworkMarkers.some(m => combined.includes(m));
    if (hasHomework) {
      checks.push({ name: 'Quality & Viability Check', passed: false, reason: 'Repository appears to be student coursework or assignment.' });
    } else {
      checks.push({ name: 'Quality & Viability Check', passed: true });
    }

    // Check 7: Arabic Core Relevance
    const hasArabicUnicode = /[\u0600-\u06FF]/.test(repo.description || '') || /[\u0600-\u06FF]/.test(repo.name);
    const arabicMarkers = ['arabic', 'arab', 'tashkeel', 'amiri', 'naskh', 'ruqaa', 'shakkala', 'mishkal', 'morphology', 'diacriti', 'kashida', 'tatweel', 'stemmer', 'lemmatiz', 'edtech', 'learn-arabic'];
    const hasArabicMarker = arabicMarkers.some(m => combined.includes(m)) || hasArabicUnicode;
    if (!hasArabicMarker) {
      checks.push({ name: 'Arabic-Centric Acid Test', passed: false, reason: 'Repository does not demonstrate dedicated Arabic language computing or educational focus.' });
    } else {
      checks.push({ name: 'Arabic-Centric Acid Test', passed: true });
    }

    // Summary
    console.log('📋 Evaluation Checklist:');
    let allPassed = true;
    for (const c of checks) {
      if (c.passed) {
        console.log(`  ✅ [PASS] ${c.name}`);
      } else {
        console.log(`  ❌ [FAIL] ${c.name} -> ${c.reason}`);
        allPassed = false;
      }
    }

    console.log('----------------------------------------------------');
    if (allPassed) {
      console.log(`🎉 VERDICT: ACCEPTED! [${targetRepo}] qualifies for inclusion in the directory.`);
      console.log(`⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count} | 💻 Language: ${repo.language || 'N/A'}`);
      console.log(`📝 Description: ${repo.description || 'None'}`);
    } else {
      console.log(`🚫 VERDICT: REJECTED. [${targetRepo}] does NOT meet the inclusion criteria.`);
    }

  } catch (err) {
    console.error('Error evaluating repository:', err.message);
  }
}

evaluate();
