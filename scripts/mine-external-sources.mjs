import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const projectsPath = path.join(rootDir, 'data', 'projects.json');
const outputPath = path.join(rootDir, 'data', 'external-candidates.json');

// Load environment variables (.env)
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {}
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const headers = {
  'User-Agent': 'arabic-directory-external-miner',
  Accept: 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {})
};

const isApplyMode = process.argv.includes('--apply');

// Target external curated resource repositories
const CURATED_LIST_REPOS = [
  '01walid/awesome-arabic',
  'mobadarah/tajmeeaton',
  'OmarSalah26/Awesome-Arabic-AI',
  'SaudiOpenSourceCommunity/SaudiOSS',
  'hamdibenjarrar/awesome-arabic-dev',
  'yementechcollective/aweasome-yemeni-open-source',
  'awesome-arabic-speakers/awesome-egyptian-open-source',
  'linuxscout/arabicnlptoolslist',
  'Pac-Man-PT/Awesome_Arabic_NLP',
  'Curated-Awesome-Lists/awesome-arabic-nlp',
  'NNLP-IL/Arabic-Resources'
];

// Exclusion list according to docs/INCLUSION_CRITERIA.md
const EXCLUSION_LIST = new Set([
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
  'mobadarah/tajmeeaton',
  'omarsalah26/awesome-arabic-ai',
  'saudiopensourcecommunity/saudioss',
  'hamdibenjarrar/awesome-arabic-dev',
  'yementechcollective/aweasome-yemeni-open-source',
  'awesome-arabic-speakers/awesome-egyptian-open-source',
  'linuxscout/arabicnlptoolslist',
  'pac-man-pt/awesome_arabic_nlp',
  'curated-awesome-lists/awesome-arabic-nlp',
  'nnlp-il/arabic-resources',
  'rastikerdar/vazirmatn',
  'aminabedi68/estedad',
  'quran/quran_android',
  'batoulapps/adhan-js',
  'gaitco/quran-database',
  'sunnah-com/api',
  'sindresorhus/awesome'
]);

// Category heuristics dictionary
const CATEGORY_RULES = {
  'ocr-vision': {
    keywords: ['ocr', 'handwriting', 'vision', 'recognition', 'image-to-text', 'document-analysis', 'scene-text', 'calligraphy-recognition', 'hwr'],
    weight: 2.2,
  },
  'platforms-apps': {
    keywords: ['platform', 'web-app', 'desktop', 'electron', 'nextjs', 'fullstack', 'compiler', 'frontend', 'portal', 'browser', 'application', 'system', 'editor', 'keyboard', 'tool'],
    weight: 1.8,
  },
  'fonts-calligraphy': {
    keywords: ['font', 'typeface', 'calligraphy', 'naskh', 'ruqaa', 'thuluth', 'kufi', 'otf', 'ttf', 'glyph', 'typography', 'opentype', 'diwani'],
    weight: 2.5,
  },
  'text-tashkeel': {
    keywords: ['tashkeel', 'diacritiz', 'vocaliz', 'shakkala', 'mishkal', 'harakat', 'segment', 'stemmer', 'morphology', 'lemmatiz', 'affix', 'root', 'phonet', 'tanween'],
    weight: 2.2,
  },
  'dictionaries-datasets': {
    keywords: ['dataset', 'corpus', 'lexicon', 'dictionary', 'stop-words', 'masader', 'wordnet', 'thesaurus', 'benchmark', 'corpora', 'glossary'],
    weight: 2.0,
  },
  'nlp-ai': {
    keywords: ['nlp', 'bert', 'llm', 'transformer', 'ner', 'sentiment', 'speech', 'asr', 'tts', 'embedding', 'classification', 'machine-learning', 'deep-learning', 'pytorch', 'huggingface', 'voice', 'audio'],
    weight: 1.7,
  },
  'dev-tools': {
    keywords: ['library', 'package', 'sdk', 'helper', 'utils', 'converter', 'reshaper', 'bidi', 'toolkit', 'plugin', 'parser', 'tafqit', 'transliterat'],
    weight: 1.2,
  },
};

function classifyCategory(repo) {
  const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
  let bestCat = 'dev-tools';
  let bestScore = 0;

  for (const [cat, rule] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        score += rule.weight;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }

  return bestCat;
}

function passesStrictCriteria(repo) {
  const fullName = repo.full_name.toLowerCase();
  if (EXCLUSION_LIST.has(fullName)) return false;

  // Star threshold
  if ((repo.stargazers_count || 0) < 5) return false;

  // Ignore forks unless exceptionally notable
  if (repo.fork) return false;

  const name = repo.name.toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  const topics = (repo.topics || []).join(' ').toLowerCase();
  const combined = `${name} ${desc} ${topics}`;

  // Check 1: Awesome lists & link aggregates
  if (name.startsWith('awesome-') || desc.startsWith('a curated list') || combined.includes('curated list of')) {
    return false;
  }

  // Check 2: Generic multilingual tools
  const multilingualMarkers = ['80+ languages', '100+ languages', 'multilingual ocr', 'chinese nlp', 'multilingual translation', 'latin alphabet'];
  if (multilingualMarkers.some(m => desc.includes(m))) {
    return false;
  }

  // Check 3: Religious / Lifestyle Reading apps
  const religiousMarkers = [
    'quran', "qur'an", 'koran', 'hadith', 'hadeeth', 'adhan', 'athan',
    'prayer time', 'prayer times', 'salat', 'salah', 'azkar', 'athkar',
    'mushaf', 'tafsir', 'tafseer', 'surah', 'ayah', 'tajweed', 'tilawa',
    'qibla', 'islamic app'
  ];
  if (religiousMarkers.some(m => combined.includes(m))) {
    return false;
  }

  // Check 4: Non-Arabic languages using Arabic script
  const otherScriptMarkers = ['persian', 'farsi', 'urdu', 'uyghur', 'hebrew'];
  if (otherScriptMarkers.some(m => combined.includes(m) && !combined.includes('arabic'))) {
    return false;
  }

  // Check 5: Homework & school course projects
  const homeworkMarkers = ['homework', 'assignment', 'course notes', 'interview prep', 'exam'];
  if (homeworkMarkers.some(m => combined.includes(m))) {
    return false;
  }

  // Check 6: Arabic-Centric Acid Test
  const hasArabicUnicode = /[\u0600-\u06FF]/.test(repo.description || '') || /[\u0600-\u06FF]/.test(repo.name);
  const arabicMarkers = ['arabic', 'arab', 'tashkeel', 'amiri', 'naskh', 'ruqaa', 'shakkala', 'mishkal', 'morphology', 'diacriti', 'kashida', 'tatweel', 'stemmer', 'lemmatiz', 'edtech', 'learn-arabic', 'tafqit'];
  const hasArabicMarker = arabicMarkers.some(m => combined.includes(m)) || hasArabicUnicode;
  if (!hasArabicMarker) {
    return false;
  }

  return true;
}

function synthesizeTitle(repo) {
  const rawName = repo.name
    .replace(/^arabic[-_]?/i, '')
    .replace(/[-_]arabic$/i, '')
    .replace(/[-_]/g, ' ')
    .trim();

  const formattedEn = rawName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || repo.name;

  return {
    ar: repo.name,
    en: formattedEn,
  };
}

function synthesizeDescription(repo, category) {
  const originalDesc = (repo.description || '').trim();
  const hasArabicDesc = /[\u0600-\u06FF]/.test(originalDesc);

  let arDesc = '';
  let enDesc = '';

  if (hasArabicDesc) {
    arDesc = originalDesc;
    enDesc = `Open source Arabic ${category.replace('-', ' ')} repository: ${repo.name}.`;
  } else {
    enDesc = originalDesc || `Open source project for Arabic language computing: ${repo.name}.`;
    const catArLabels = {
      'nlp-ai': 'مشروع مفتوح المصدر في الذكاء الاصطناعي ومعالجة اللغات الطبيعية للغة العربية.',
      'text-tashkeel': 'أداة برمجية لمعالجة النصوص وتشكيل وتجذيع اللغة العربية.',
      'fonts-calligraphy': 'مشروع خطوط وطباعة رقمية مخصص للخط العربي الأصيل.',
      'dev-tools': 'حزمة وأداة برمجية للمطورين لتمكين ودعم البرمجيات العربية.',
      'ocr-vision': 'نظام مفتوح المصدر للتعرف الضوئي على الحروف والنصوص العربية.',
      'dictionaries-datasets': 'معجم لغوي وقاعدة بيانات مفتوحة للأبحاث والنماذج العربية.',
      'platforms-apps': 'منصة وتطبيق تفاعلي مفتوح المصدر لخدمة وتمكين اللغة العربية.',
    };
    arDesc = `${catArLabels[category] || 'مشروع برمجيات مفتوحة المصدر لخدمة اللغة العربية.'} (${repo.name})`;
  }

  return { ar: arDesc, en: enDesc };
}

function extractTags(repo, category) {
  const tags = new Set();
  tags.add(category);
  if (repo.language) tags.add(repo.language.toLowerCase());

  for (const t of repo.topics || []) {
    const clean = t.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (clean && clean.length <= 20 && !clean.includes('awesome') && clean !== 'arabic') {
      tags.add(clean);
    }
  }

  return Array.from(tags).slice(0, 5);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchReadme(repoPath) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repoPath}/readme`, { headers });
    if (!res.ok) return '';
    const data = await res.json();
    if (data.content && data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf8');
    }
    return '';
  } catch (err) {
    return '';
  }
}

async function fetchRepo(repoPath) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repoPath}`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

async function main() {
  console.log('🚀 Starting External Sources Mining Engine...');
  console.log('==================================================');

  const existingProjects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  const existingRepos = new Set(existingProjects.map(p => p.repo.toLowerCase()));
  console.log(`📦 Currently cataloged: ${existingProjects.length} projects.`);

  const candidateRepoUrls = new Set();

  // 1. Fetch READMEs from all curated list repos
  for (const listRepo of CURATED_LIST_REPOS) {
    console.log(`\n📥 Fetching curated list: ${listRepo}...`);
    const readme = await fetchReadme(listRepo);
    if (!readme) {
      console.log(`   ⚠️ Could not fetch README for ${listRepo}`);
      continue;
    }

    // Extract all github.com/owner/repo patterns
    const regex = /github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/g;
    let match;
    let count = 0;
    while ((match = regex.exec(readme)) !== null) {
      const owner = match[1];
      const repo = match[2].replace(/[)#?].*$/, '').replace(/\.git$/, '');
      const full = `${owner}/${repo}`.toLowerCase();

      // Skip non-repos, blobs, releases, issues, etc.
      if (
        ['topics', 'features', 'pricing', 'site', 'collections', 'search', 'orgs'].includes(owner.toLowerCase()) ||
        ['issues', 'pull', 'actions', 'releases', 'wiki', 'blob', 'tree'].includes(repo.toLowerCase())
      ) {
        continue;
      }

      if (!existingRepos.has(full) && !EXCLUSION_LIST.has(full)) {
        candidateRepoUrls.add(`${owner}/${repo}`);
        count++;
      }
    }
    console.log(`   Found ${count} prospective new candidate URLs.`);
    await sleep(200);
  }

  console.log(`\n🔍 Total unique prospective candidates found: ${candidateRepoUrls.size}`);
  console.log('Evaluating each repository against Inclusion Criteria...');

  const validCandidates = [];
  let evaluated = 0;

  for (const candidate of candidateRepoUrls) {
    evaluated++;
    process.stdout.write(`\r[${evaluated}/${candidateRepoUrls.size}] Checking ${candidate.padEnd(45)}`);

    const repo = await fetchRepo(candidate);
    await sleep(80); // rate limiting throttle
    if (!repo) continue;

    if (passesStrictCriteria(repo)) {
      const cat = classifyCategory(repo);
      const title = synthesizeTitle(repo);
      const desc = synthesizeDescription(repo, cat);
      const tags = extractTags(repo, cat);

      const id = repo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      validCandidates.push({
        id,
        title,
        description: desc,
        category: cat,
        repo: repo.full_name,
        tags,
        featured: repo.stargazers_count >= 100,
        activityStatus: repo.archived ? 'archived' : 'active',
        stargazers_count: repo.stargazers_count,
        language: repo.language
      });
    }
  }

  console.log(`\n\n🎯 Evaluation complete!`);
  console.log(`✅ Passed all strict criteria: ${validCandidates.length} new projects.`);

  // Sort by star count
  validCandidates.sort((a, b) => b.stargazers_count - a.stargazers_count);

  fs.writeFileSync(outputPath, JSON.stringify(validCandidates, null, 2), 'utf8');
  console.log(`💾 Saved candidate preview to: ${outputPath}`);

  // Summary by category
  const catSummary = {};
  for (const c of validCandidates) {
    catSummary[c.category] = (catSummary[c.category] || 0) + 1;
  }
  console.log('\n📊 Candidate Distribution by Category:');
  console.table(catSummary);

  if (isApplyMode) {
    console.log('\n🔄 --apply mode detected! Merging into data/projects.json...');
    const merged = [...existingProjects];
    const existingIds = new Set(existingProjects.map(p => p.id));

    let addedCount = 0;
    for (const cand of validCandidates) {
      let uniqueId = cand.id;
      let counter = 1;
      while (existingIds.has(uniqueId)) {
        uniqueId = `${cand.id}-${counter++}`;
      }
      existingIds.add(uniqueId);

      const { stargazers_count, language, ...projectData } = cand;
      merged.push({
        ...projectData,
        id: uniqueId,
      });
      addedCount++;
    }

    fs.writeFileSync(projectsPath, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`✨ Successfully added ${addedCount} new projects to data/projects.json!`);
    console.log(`📈 New total project count: ${merged.length}`);
  } else {
    console.log('\n💡 Run with --apply to merge these candidates into data/projects.json:');
    console.log('   node scripts/mine-external-sources.mjs --apply');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
