import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const projectsPath = path.join(rootDir, 'data', 'projects.json');
const categoriesPath = path.join(rootDir, 'data', 'categories.json');
const candidatesOutputPath = path.join(rootDir, 'data', 'discovered-candidates.json');

// Load environment variables (.env)
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // Ignore if .env is missing
  }
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const headers = {
  'User-Agent': 'arabic-opensource-directory-discover',
  Accept: 'application/vnd.github.v3+json',
};

if (GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  console.log('🔑 Authenticated with GitHub Token (5,000 req/hr limit).');
} else {
  console.log('⚠️ No GITHUB_TOKEN provided; rate limits will be restricted.');
}

const isApplyMode = process.argv.includes('--apply');
const categoryArg = process.argv.find(arg => arg.startsWith('--category='))?.split('=')[1];

// Category heuristics dictionary
const CATEGORY_RULES = {
  'ocr-vision': {
    keywords: ['ocr', 'tesseract', 'easyocr', 'handwriting', 'vision', 'craft', 'text-recognition', 'image-to-text', 'document-analysis', 'scene-text'],
    weight: 2.2,
  },
  'platforms-apps': {
    keywords: ['platform', 'web-app', 'desktop', 'electron', 'nextjs', 'fullstack', 'compiler', 'frontend', 'portal', 'browser', 'application', 'system'],
    weight: 1.8,
  },
  'islamic-tech': {
    keywords: ['quran', 'hadith', 'prayer', 'adhan', 'azkar', 'salat', 'athan', 'tafsir', 'islamic', 'islam', 'sunnah', 'mushaf', 'quranic'],
    weight: 2.5,
  },
  'fonts-calligraphy': {
    keywords: ['font', 'typeface', 'calligraphy', 'naskh', 'ruqaa', 'thuluth', 'kufi', 'otf', 'ttf', 'glyph', 'typography', 'opentype'],
    weight: 2.5,
  },
  'text-tashkeel': {
    keywords: ['tashkeel', 'diacritiz', 'vocaliz', 'shakkala', 'mishkal', 'harakat', 'segment', 'stemmer', 'morphology', 'lemmatiz', 'affix'],
    weight: 2.2,
  },
  'dictionaries-datasets': {
    keywords: ['dataset', 'corpus', 'lexicon', 'dictionary', 'stop-words', 'masader', 'wordnet', 'thesaurus', 'benchmark', 'corpora'],
    weight: 2.0,
  },
  'nlp-ai': {
    keywords: ['nlp', 'bert', 'llm', 'transformer', 'ner', 'sentiment', 'speech', 'asr', 'tts', 'embedding', 'classification', 'machine-learning', 'deep-learning', 'pytorch', 'huggingface'],
    weight: 1.7,
  },
  'dev-tools': {
    keywords: ['library', 'package', 'sdk', 'helper', 'utils', 'hijri', 'calendar', 'converter', 'reshaper', 'bidi', 'toolkit', 'plugin'],
    weight: 1.2,
  },
};

// Known Arabic tech organizations & research labs & prolific creators
const TARGET_ORGS = [
  'CAMeL-Lab',
  'aub-mind',
  'UBC-NLP',
  'ARBML',
  'linuxscout',
  'quran',
  'batoulapps',
  'aliftype',
  'alifcommunity',
  'ojuba-org',
  'qcri',
  'Barqawiz',
  'AudarAI',
  'mbzuai-oryx',
  'mawdoo3',
  'Alfanous-team',
  'TarteelAI',
  'sunnah-com',
  'SinaLab',
  'rn0x',
  'zonetecde',
  'AHR-OCR2024',
  'SWivid',
  'AliOsm',
  'MagedSaeed',
  'mohabmes',
  'alisafaya',
  'assem-ch',
  'alsaydi',
  'disooqi',
  'cpfair',
  'yazinsai'
];

// High-signal topic queries across Arabic software and linguistics
const TARGET_TOPICS = [
  'arabic-ocr',
  'arabic-nlp',
  'tashkeel',
  'quran',
  'hadith',
  'islamic-tech',
  'arabic-speech',
  'arabic-font',
  'arabic-fonts',
  'arabic-calligraphy',
  'arabic-dataset',
  'arabic-language',
  'arabic-tts',
  'arabic-asr',
  'arabic-stemmer',
  'arabic-morphology',
  'arabic-programming-language',
  'arabic-llm'
];

// Focused, high-yield search queries covering specialized Arabic domains
const TARGET_QUERIES = [
  'arabic ocr stars:>2',
  'arabic speech stars:>2',
  'arabic tts stars:>2',
  'arabic asr stars:>2',
  'arabic stemmer stars:>2',
  'arabic morphology stars:>2',
  'arabic diacritization stars:>2',
  'arabic tashkeel stars:>2',
  'arabic tokenizer stars:>2',
  'arabic font stars:>2',
  'arabic bert stars:>2',
  'arabic nlp stars:>5',
  'arabic programming language stars:>2',
  'quran audio stars:>10',
  'quran api stars:>10',
  'القرآن الكريم stars:>20'
];

function hasArabicText(text) {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
}

function classifyCategory(repo) {
  const textCorpus = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
  
  let bestCategory = 'dev-tools';
  let highestScore = 0;

  for (const [catId, config] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    for (const kw of config.keywords) {
      if (textCorpus.includes(kw)) {
        score += config.weight;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestCategory = catId;
    }
  }

  return { category: bestCategory, score: highestScore };
}

function isHighQuality(repo) {
  // Exclude forks unless very popular
  if (repo.fork && repo.stargazers_count < 100) return false;
  // Must have minimal stars
  if (repo.stargazers_count < 5) return false;
  // Exclude empty descriptions
  if (!repo.description || repo.description.trim().length < 10) return false;

  const desc = (repo.description || '').toLowerCase();
  const name = repo.name.toLowerCase();
  const topics = (repo.topics || []).join(' ').toLowerCase();
  const combined = `${name} ${desc} ${topics}`;

  // Blacklist of repositories whose primary role is NOT Arabic (general multilingual or non-Arabic)
  const NON_ARABIC_FIRST = [
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
    'lightsidekittens/unitext',
    'eymenefealtun/all-words-in-all-languages',
    'peter-tharwat/dashboard',
    'abdumostafa/awesome-in-arabic',
    'rastikerdar/vazirmatn',
    'aminabedi68/estedad',
    'eqraatech/software-engineering-in-arabic',
    'mostafa-saad/arabiccompetitiveprogramming'
  ];

  if (NON_ARABIC_FIRST.includes(repo.full_name.toLowerCase())) {
    return false;
  }

  // Exclude pure curation/awesome lists without software code
  if (name.startsWith('awesome-') || desc.startsWith('a curated list') || desc.startsWith('curated list')) {
    return false;
  }

  // Exclude generic multilingual projects or Persian/Farsi-first tools where Arabic is merely an incidental language
  const multilingualMarkers = [
    '80+ languages',
    '100+ languages',
    'multilingual ocr',
    'chinese nlp',
    'chinese',
    'latin alphabet',
    'persian font',
    'farsi font',
    'persian typeface',
    'persian date'
  ];
  if (multilingualMarkers.some(m => desc.includes(m))) {
    return false;
  }

  // Filter out irrelevant or junk repos
  const excludeKeywords = ['homework', 'course', 'assignment', 'tutorial', 'learn-arabic', 'flashcard', 'cheat-sheet', 'interview'];
  if (excludeKeywords.some(kw => combined.includes(kw))) {
    return false;
  }

  // Must have Arabic relevance as its primary subject
  const arabicMarkers = ['arabic', 'arab', 'quran', 'hadith', 'tashkeel', 'hijri', 'islam', 'amiri', 'naskh', 'ruqaa', 'shakkala', 'mishkal', 'morphology', 'diacriti'];
  const hasMarker = arabicMarkers.some(m => combined.includes(m)) || hasArabicText(repo.description) || hasArabicText(repo.name);
  if (!hasMarker) return false;

  return true;
}

// Curated metadata dictionary for known flagship repositories
const CURATED_DESCRIPTIONS = {
  'maidaly/arabic_ocr': {
    category: 'ocr-vision',
    title: { ar: 'تطبيق التعرف البصري العربي CRAFT', en: 'Arabic OCR with CRAFT' },
    description: {
      ar: 'تطبيق وبرمجية مفتوحة المصدر للتعرف الضوئي على الحروف واستخراج النصوص العربية بدقة عالية من المستندات والصور.',
      en: 'Open-source application and pipeline for high-accuracy Arabic text extraction and character recognition from images.'
    },
    tags: ['python', 'ocr', 'arabic-ocr', 'craft', 'computer-vision']
  },
  'aliftype/reem-kufi': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط كوفي ريم', en: 'Reem Kufi Typeface' },
    description: {
      ar: 'خط كوفي رقمي حديث مخصص للعناوين والنصوص البصرية مستوحى من خطوط المصاحف والكتابات الكوفية المبكرة.',
      en: 'A modern digital Kufic typeface designed for display and text, inspired by early Quranic and architectural calligraphy.'
    },
    tags: ['font', 'typography', 'kufic', 'arabic', 'arabic-font']
  },
  'aliftype/mada': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط مدى', en: 'Mada Typeface' },
    description: {
      ar: 'خط عربي حديث ذو تباين منخفض وهندسة بصرية واضحة، مصمم خصيصاً لشاشات الأجهزة الرقمية وتطبيقات الويب.',
      en: 'A geometric, low-contrast Arabic typeface designed specifically for digital interfaces, user experiences, and web screens.'
    },
    tags: ['font', 'typography', 'webfont', 'arabic', 'arabic-font']
  },
  'alfanous-team/alfanous': {
    category: 'platforms-apps',
    title: { ar: 'محرك بحث الفانوس', en: 'Alfanous Search Engine' },
    description: {
      ar: 'محرك وبوابة برمجية متقدمة مفتوحة المصدر للبحث اللغوي والدلالي والصوتي في نصوص القرآن الكريم والمعاجم العربية.',
      en: 'An advanced open-source Arabic search engine API and platform providing linguistic, semantic, and vocalic search in Quranic texts.'
    },
    tags: ['python', 'arabic-search', 'quran', 'linguistics', 'search-engine']
  },
  'arbml/tkseem': {
    category: 'dev-tools',
    title: { ar: 'مكتبة تقسيم للتقطيع اللغوي', en: 'Tkseem Tokenizer' },
    description: {
      ar: 'مكتبة بايثون متخصصة لتقطيع الكلمات والنصوص العربية (Tokenization) تدعم خوارزميات BPE وWordPiece والتحليل الصرفي.',
      en: 'A dedicated Python library for Arabic tokenization supporting subword algorithms (BPE, WordPiece) and morphological tokenizers.'
    },
    tags: ['python', 'nlp', 'tokenization', 'arabic-nlp', 'preprocessing']
  },
  'mohamedalaouimhamdi/arabic_ocr': {
    category: 'ocr-vision',
    title: { ar: 'محرك التعرف الضوئي العربي', en: 'Deep Arabic OCR' },
    description: {
      ar: 'نظام متقدم للتعرف البصري على الحروف والنصوص العربية بالتعلم العميق والشبكات الالتفافية.',
      en: 'Deep learning Arabic optical character recognition pipeline using convolutional neural networks.'
    },
    tags: ['python', 'deep-learning', 'ocr', 'cnn', 'vision']
  },
  'quran/quran.com-frontend-next': {
    category: 'platforms-apps',
    title: { ar: 'منصة قرآن.كوم الحديثة', en: 'Quran.com Next.js Platform' },
    description: {
      ar: 'التطبيق البرمجي الكامل مفتوح المصدر لمنصة القرآن الكريم الرائدة عالمياً مبني بإطار Next.js و TypeScript.',
      en: 'The official open-source Next.js web application for Quran.com.'
    },
    tags: ['typescript', 'nextjs', 'react', 'quran', 'web-app']
  },
  'ojuba-org/othman': {
    category: 'platforms-apps',
    title: { ar: 'متصفح عثمان للقرآن الكريم', en: 'Othman Quran Browser' },
    description: {
      ar: 'متصفح ومحرك بحث إلكتروني مفتوح المصدر للقرآن الكريم بالرسم العثماني لأنظمة سطح المكتب.',
      en: 'An open-source electronic Quran browser and search engine in Othmani script.'
    },
    tags: ['python', 'desktop', 'quran', 'search-engine', 'linux']
  },
  'alifcommunity/alif5': {
    category: 'platforms-apps',
    title: { ar: 'لغة البرمجة العربية «ألف»', en: 'Alif Programming Language' },
    description: {
      ar: 'لغة برمجة عربية حديثة ومفتوحة المصدر مكتوبة بلغة C++ لتمكين البرمجة والتعليم بلغة الضاد.',
      en: 'A modern open-source Arabic programming language implemented in C++.'
    },
    tags: ['cpp', 'compiler', 'programming-language', 'education']
  },
  'quran/quran_android': {
    category: 'islamic-tech',
    title: { ar: 'تطبيق قرآن أندرويد', en: 'Quran Android' },
    description: {
      ar: 'التطبيق الرسمي مفتوح المصدر لقراءة وتصفح والاستماع للقرآن الكريم على أجهزة أندرويد.',
      en: 'The official open-source Quran reading and listening application for Android.'
    },
    tags: ['kotlin', 'android', 'quran', 'audio', 'recitations']
  },
  'batoulapps/adhan-js': {
    category: 'islamic-tech',
    title: { ar: 'مكتبة أذان لمواقيت الصلاة', en: 'Adhan JS' },
    description: {
      ar: 'مكتبة فلكية عالية الدقة ومفتوحة المصدر لحساب مواقيت الصلاة الإسلامية لجافاسكريبت وNode.js.',
      en: 'High precision prayer times calculation library for JavaScript and Node.js.'
    },
    tags: ['javascript', 'typescript', 'prayer-times', 'islamic-tech']
  },
  'fawazahmed0/quran-api': {
    category: 'islamic-tech',
    title: { ar: 'واجهة القرآن الكريم البرمجية', en: 'Quran JSON REST API' },
    description: {
      ar: 'واجهة برمجية سريعة ومجانية لنصوص وتفاسير وترجمات القرآن الكريم بصيغة JSON بأكثر من 40 لغة.',
      en: 'Free and comprehensive JSON REST API for Quranic texts, translations, and audio.'
    },
    tags: ['api', 'json', 'quran', 'translations', 'tafsir']
  },
  'fawazahmed0/hadith-api': {
    category: 'islamic-tech',
    title: { ar: 'واجهة الحديث الشريف البرمجية', en: 'Hadith JSON API' },
    description: {
      ar: 'قاعدة بيانات وواجهة برمجية رقمية مفتوحة المصدر لكتب الحديث الشريف التسعة.',
      en: 'Comprehensive and curated Hadith collections API with multiple translations in JSON.'
    },
    tags: ['api', 'hadith', 'json', 'sunnah', 'datasets']
  },
  'aiaf/kawkab-mono': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط كوكب مونو البرمجي', en: 'Kawkab Mono Typeface' },
    description: {
      ar: 'خط عربي أحادي العرض (Monospace) مخصص للمبرمجين ومحررات الأكواد ولوحات التحكم.',
      en: 'An open-source monospaced Arabic typeface designed for coding and terminal environments.'
    },
    tags: ['font', 'monospace', 'coding', 'typography', 'editor']
  },
  'aliftype/aref-ruqaa': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط رقعة عارف', en: 'Aref Ruqaa Typeface' },
    description: {
      ar: 'خط عربي رقمي كلاسيكي يحاكي أسلوب خط الرقعة الأصيل من تصميم الخطاط خالد حسني.',
      en: 'A classical Arabic typeface in Ruqaa style designed by Khaled Hosny.'
    },
    tags: ['font', 'calligraphy', 'ruqaa', 'typography', 'opentype']
  },
  'rastikerdar/vazirmatn': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط وزير متن', en: 'Vazirmatn Typeface' },
    description: {
      ar: 'خط رقمي حديث وعالي الوضوح مخصص لشاشات الويب والقراءة يدعم الأبجدية العربية والفارسية.',
      en: 'A modern, highly legible Arabic and Persian typeface crafted for digital screens and reading.'
    },
    tags: ['font', 'typography', 'webfont', 'arabic', 'farsi']
  },
  'arbml/klaam': {
    category: 'nlp-ai',
    title: { ar: 'مكتبة كلام للصوتيات العربية', en: 'Klaam Speech Toolkit' },
    description: {
      ar: 'حزمة متقدمة للتعرف الآلي على الكلام العربي (ASR)، تحويل النص إلى صوت (TTS)، وتصنيف اللهجات.',
      en: 'An Arabic speech recognition (ASR), text-to-speech (TTS), and classification toolkit.'
    },
    tags: ['python', 'speech-to-text', 'asr', 'tts', 'audio']
  },
  'ubc-nlp/arat5': {
    category: 'nlp-ai',
    title: { ar: 'نموذج AraT5 التوليدي', en: 'AraT5 Seq2Seq Model' },
    description: {
      ar: 'نموذج توليدي متقدم (Sequence-to-Sequence) مخصص لتوليد وتلخيص وترجمة النصوص العربية.',
      en: 'A sequence-to-sequence pre-trained transformer model for Arabic text generation and translation.'
    },
    tags: ['python', 't5', 'transformers', 'seq2seq', 'summarization']
  },
  'aliosm/shakkelha': {
    category: 'text-tashkeel',
    title: { ar: 'نظام شكّلها للتشكيل الآلي', en: 'Shakkelha Diacritizer' },
    description: {
      ar: 'نظام وتطبيق ويب مفتوح المصدر لتشكيل وضبط الكلمات والجمل العربية آلياً.',
      en: 'Automatic Arabic text diacritization system and web service.'
    },
    tags: ['python', 'tashkeel', 'diacritics', 'nlp']
  },
  'linuxscout/tashaphyne': {
    category: 'text-tashkeel',
    title: { ar: 'تاشفين للتجذيع الخفيف', en: 'Tashaphyne Light Stemmer' },
    description: {
      ar: 'مكتبة بايثون خفيفة وسريعة لتجذيع الكلمات العربية وفصل السوابق واللواحق للبحث والاسترجاع اللغوي.',
      en: 'A lightweight Python library for Arabic light stemming and word segmentation.'
    },
    tags: ['python', 'stemmer', 'segmenter', 'linguistics', 'morphology']
  },
  'magedsaeed/farasapy': {
    category: 'text-tashkeel',
    title: { ar: 'فراسة بايثون للتحليل اللغوي', en: 'FarasaPy NLP' },
    description: {
      ar: 'مكتبة بايثون للتفاعل السريع مع أدوات فراسة للتشكيل والتحليل الصرفي والإعرابي للغة العربية.',
      en: 'Python wrapper for Farasa Arabic NLP tools for segmentation, NER, POS tagging and diacritization.'
    },
    tags: ['python', 'farasa', 'nlp', 'pos-tagging', 'tashkeel']
  },
  'linuxscout/naftawayh': {
    category: 'dev-tools',
    title: { ar: 'نفطويه لتصنيف الكلمات', en: 'Naftawayh Word Classifier' },
    description: {
      ar: 'مكتبة بايثون لتصنيف بنية الكلمات العربية (اسم، فعل، حرف) والتعرف على الأسماء المبنية والمعربة.',
      en: 'An Arabic word form classifier identifying nouns, verbs, particles, and inflections.'
    },
    tags: ['python', 'word-classifier', 'nlp', 'linguistics']
  },
  'linuxscout/ayaspell': {
    category: 'dev-tools',
    title: { ar: 'قاموس آياسبل للتدقيق الإملائي', en: 'Ayaspell Spell Checker' },
    description: {
      ar: 'معجم وقاموس قواعدي متكامل للتدقيق الإملائي العربي متوافق مع أنظمة Hunspell و MySpell ومفتوح المصدر.',
      en: 'Arabic spell checker dictionaries and morphological data for Hunspell/Myspell.'
    },
    tags: ['hunspell', 'spell-checker', 'dictionary', 'linguistics']
  },
  'linuxscout/arramooz': {
    category: 'dictionaries-datasets',
    title: { ar: 'الراموز - معجم الكلمات العربية', en: 'Arramooz Arabic Lexicon' },
    description: {
      ar: 'قاعدة بيانات معجمية عربية مفتوحة المصدر تحتوي على تصاريف وجذور الكلمات العربية.',
      en: 'Open-source Arabic lexical database and dictionary for language engineering.'
    },
    tags: ['dataset', 'lexicon', 'dictionary', 'database', 'arabic']
  },
  'ahr-ocr2024/arabic-handwriting-recognition': {
    category: 'ocr-vision',
    title: { ar: 'نظام التعرف على خط اليد العربي', en: 'Arabic Handwriting Recognition' },
    description: {
      ar: 'نموذج تعلم عميق للتعرف البصري واستخراج النصوص المكتوبة بخط اليد باللغة العربية بدقة عالية.',
      en: 'End-to-end deep learning pipeline for offline Arabic handwritten text recognition.'
    },
    tags: ['python', 'ocr', 'handwriting', 'deep-learning', 'computer-vision']
  },
  'camel-lab/arafix_ocr': {
    category: 'ocr-vision',
    title: { ar: 'أداة تدقيق أخطاء التعرف الضوئي', en: 'Arafix Arabic OCR Correction' },
    description: {
      ar: 'أداة متخصصة من مختبر CAMeL لتصحيح وتدقيق الأخطاء الناتجة عن محركات التعرف الضوئي على النصوص العربية.',
      en: 'CAMeL Lab post-processing and error correction toolkit for Arabic OCR output text.'
    },
    tags: ['python', 'ocr', 'error-correction', 'camel-lab', 'nlp']
  },
  'manshar/manshar': {
    category: 'platforms-apps',
    title: { ar: 'منصة منشر للتدوين المفتوح', en: 'Manshar Publishing Platform' },
    description: {
      ar: 'منصة تدوين ونشر مفتوحة المصدر مخصصة لدعم المحتوى العربي وتجربة القراءة والكتابة العربية على الويب.',
      en: 'An open-source Arabic-first publishing and blogging platform built for the web.'
    },
    tags: ['ruby', 'rails', 'publishing', 'blogging', 'arabic-web']
  },
  'arbml/qawafi': {
    category: 'platforms-apps',
    title: { ar: 'منصة قوافي لعروض الشعر العربي', en: 'Qawafi Arabic Poetry Platform' },
    description: {
      ar: 'أداة وتطبيق ويب مفتوح المصدر لتحليل بحور الشعر العربي، وتقطيع الأبيات، واكتشاف القوافي آلياً.',
      en: 'Open-source Arabic poetry analysis, poetic meter detection, and rhyming tool.'
    },
    tags: ['python', 'poetry', 'meter', 'literature', 'arbml']
  },
  'swivid/habibi-tts': {
    category: 'nlp-ai',
    title: { ar: 'حبيبي لتوليد الصوت العربي', en: 'Habibi Arabic TTS' },
    description: {
      ar: 'محرك ونظام ذكاء اصطناعي مفتوح المصدر لتوليد ونطق الكلام العربي بأصوات طبيعية عالية الجودة.',
      en: 'Open-source high-quality neural Arabic text-to-speech (TTS) synthesis system.'
    },
    tags: ['python', 'tts', 'speech-synthesis', 'voice', 'deep-learning']
  },
  'arbml/calliar': {
    category: 'fonts-calligraphy',
    title: { ar: 'كاليار للخط العربي الرقمي', en: 'Calliar Calligraphy Tool' },
    description: {
      ar: 'أكبر مشروع مفتوح لبيانات وخوارزميات رسم ومحاكاة الخط العربي وتوليد اللوحات الخطية بالحاسوب.',
      en: 'The largest open-source stroked Arabic calligraphy dataset and stroke generation toolkit.'
    },
    tags: ['calligraphy', 'arabic-art', 'stroke', 'dataset', 'typography']
  },
  'aliftype/qahiri': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط قاهري الكوفي', en: 'Qahiri Kufic Font' },
    description: {
      ar: 'خط عربي رقمي مفتوح المصدر يحاكي الطراز الكوفي القيرواني والأنماط المعمارية الكلاسيكية من تصميم خالد حسني.',
      en: 'A digital Kufic typeface inspired by classical architectural inscriptions by Khaled Hosny.'
    },
    tags: ['font', 'kufi', 'calligraphy', 'typography', 'opentype']
  },
  'linuxscout/qutrub': {
    category: 'dev-tools',
    title: { ar: 'قطرب لتصريف الأفعال العربية', en: 'Qutrub Verb Conjugator' },
    description: {
      ar: 'مكتبة بايثون متقدمة لتصريف الأفعال العربية في كافة الأزمنة وحالات الإسناد للضمائر.',
      en: 'Comprehensive Python library for Arabic verb conjugation across tenses and pronouns.'
    },
    tags: ['python', 'conjugation', 'verbs', 'linguistics', 'arabic']
  },
  'arbml/tnkeeh': {
    category: 'text-tashkeel',
    title: { ar: 'تنقيح لمعالجة النصوص العربية', en: 'Tnkeeh Preprocessing' },
    description: {
      ar: 'حزمة بايثون خفيفة وسريعة لتنظيف وتجهيز النصوص العربية وتجريد التشكيل والترميز لنماذج الذكاء الاصطناعي.',
      en: 'A fast Python library for preprocessing, cleaning, and normalizing Arabic text for NLP models.'
    },
    tags: ['python', 'nlp', 'preprocessing', 'cleaning', 'normalization']
  },
  'alisafaya/arabic-bert': {
    category: 'nlp-ai',
    title: { ar: 'نموذج بيرت العربي', en: 'Arabic BERT' },
    description: {
      ar: 'نماذج لغوية محولة مسبقة التدريب مخصصة لفهم ومعالجة اللغة العربية واللهجات المتعددة بدقة عالية.',
      en: 'Pretrained BERT language models customized for Arabic language understanding and representation.'
    },
    tags: ['nlp', 'bert', 'transformers', 'pytorch', 'arabic-nlp']
  },
  'assem-ch/arabicstemmer': {
    category: 'text-tashkeel',
    title: { ar: 'محلل الجذوع العربي عاصم', en: 'Assem Arabic Stemmer' },
    description: {
      ar: 'مكتبة وخوارزمية مفتوحة المصدر للاشتقاق الخفيف واستخراج جذوع الكلمات العربية مبنية على خوارزمية Snowball.',
      en: 'Open-source Snowball-based light stemming algorithm and library for the Arabic language.'
    },
    tags: ['nlp', 'stemmer', 'snowball', 'arabic-stemmer', 'linguistics']
  },
  'nipponjo/tts-arabic-pytorch': {
    category: 'nlp-ai',
    title: { ar: 'حزمة توليد الصوت العربي تاكوترون', en: 'Arabic TTS PyTorch' },
    description: {
      ar: 'نماذج شبكات عصبية لتحويل النصوص العربية إلى كلام صوتي طبيعي بالاعتماد على Tacotron 2 و FastPitch.',
      en: 'Neural network models for Arabic text-to-speech synthesis using Tacotron 2 and FastPitch.'
    },
    tags: ['python', 'tts', 'speech', 'pytorch', 'deep-learning']
  },
  'yoosif0/arabic-tacotron-tts': {
    category: 'nlp-ai',
    title: { ar: 'نظام تاكوترون لنطق العربية', en: 'Arabic Tacotron TTS' },
    description: {
      ar: 'نظام متكامل لتوليد الكلام الصوتي العربي عالي الدقة مبني على نموذج Tacotron و WaveRNN.',
      en: 'An end-to-end neural Arabic speech synthesis system based on Tacotron and WaveRNN.'
    },
    tags: ['python', 'tts', 'speech-synthesis', 'tacotron', 'audio']
  },
  'alsaydi/sarf': {
    category: 'dev-tools',
    title: { ar: 'نظام الصرف العربي', en: 'Sarf Morphology System' },
    description: {
      ar: 'نظام ومكتبة مفتوحة المصدر للتحليل الصرفي وتوليد الأوزان وتصريف الكلمات العربية وفق القواعد النحوية.',
      en: 'An open-source morphological system for Arabic root extraction, pattern generation, and word inflections.'
    },
    tags: ['arabic', 'morphology', 'sarf', 'linguistics', 'nlp']
  },
  'mbzuai-oryx/ain': {
    category: 'nlp-ai',
    title: { ar: 'نموذج عَين البصري اللغوي', en: 'AIN Multimodal Model' },
    description: {
      ar: 'أول نموذج بصري لغوي متعدد الوسائط باللغة العربية طورته جامعة محمد بن زايد للذكاء الاصطناعي.',
      en: 'The first Arabic-first multimodal large language model excelling in visual and textual Arabic comprehension.'
    },
    tags: ['multimodal', 'vision-language', 'arabic-llm', 'deep-learning', 'mbzuai']
  },
  'camel-lab/camel_morph': {
    category: 'text-tashkeel',
    title: { ar: 'نماذج كامل للصرف العربي', en: 'Camel Morph' },
    description: {
      ar: 'مجموعة متكاملة مفتوحة المصدر لبناء وتدريب نماذج الصرف للغة العربية الفصحى واللهجات الدارجة.',
      en: 'Large-scale open-source morphological models and databases for Modern Standard Arabic and dialects.'
    },
    tags: ['python', 'morphology', 'camel-lab', 'nlp', 'linguistics']
  },
  'camel-lab/camelbert': {
    category: 'nlp-ai',
    title: { ar: 'نماذج كامل بيرت العربية', en: 'CAMeLBERT Models' },
    description: {
      ar: 'سلسلة نماذج محولات مسبقة التدريب من جامعة نيويورك أبوظبي متخصصة في العربية الفصحى واللهجات والشعر.',
      en: 'Pretrained BERT models for classical Arabic, modern standard Arabic, and dialectal Arabic.'
    },
    tags: ['nlp', 'bert', 'transformers', 'camel-lab', 'arabic']
  },
  'camel-lab/arabic-gec': {
    category: 'text-tashkeel',
    title: { ar: 'مصحح الأخطاء النحوية العربية', en: 'Arabic GEC' },
    description: {
      ar: 'أدوات ونماذج تعلم عميق مفتوحة المصدر لاكتشاف وتصحيح الأخطاء الإملائية والنحوية في النصوص العربية.',
      en: 'Open-source models and dataset for Arabic grammatical error correction (GEC).'
    },
    tags: ['nlp', 'gec', 'grammar-correction', 'camel-lab', 'deep-learning']
  },
  'aliftype/raqq': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط رَقّ الكوفي', en: 'Raqq Manuscript Kufic' },
    description: {
      ar: 'خط رقمي تاريخي مستوحى من المخطوطات القرآنية القديمة على الرق في القرون الهجرية الأولى من تصميم خالد حسني.',
      en: 'A historical manuscript Kufic typeface inspired by early Quranic parchments by Khaled Hosny.'
    },
    tags: ['font', 'kufic', 'manuscript', 'typography', 'quran']
  },
  'aliftype/rana-kufi': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط كوفي رنا', en: 'Rana Kufi Typeface' },
    description: {
      ar: 'خط كوفي رقمي مستلهم من النمط الفاطمي التذكاري المستخدم في العمارة والنقوش التاريخية في القاهرة.',
      en: 'A digital Fatimid Kufic typeface inspired by monumental architectural inscriptions in Cairo.'
    },
    tags: ['font', 'kufic', 'fatimid', 'typography', 'arabic-font']
  },
  'aliftype/amiri-typewriter': {
    category: 'fonts-calligraphy',
    title: { ar: 'خط أميري الآلة الكاتبة', en: 'Amiri Typewriter Font' },
    description: {
      ar: 'نسخة ثابتة العرض (Monospace) من خط أميري الكلاسيكي مخصصة لكتابة الشيفرات البرمجية والآلة الكاتبة.',
      en: 'A monospaced companion to the classical Amiri font family designed for code editors and terminals.'
    },
    tags: ['font', 'monospace', 'typography', 'amiri', 'webfont']
  },
  'linuxscout/adawat': {
    category: 'dev-tools',
    title: { ar: 'أدوات معالجة النصوص العربية', en: 'Adawat Arabic Text Tools' },
    description: {
      ar: 'حزمة أدوات سطر أوامر ومكتبات لمعالجة وضبط وتحويل النصوص العربية وفصل الكلمات والتصنيف.',
      en: 'Command-line tools and utilities for Arabic text manipulation, conversion, and token filtering.'
    },
    tags: ['python', 'cli', 'arabic-tools', 'nlp', 'text-processing']
  },
  'linuxscout/yaraspell': {
    category: 'dev-tools',
    title: { ar: 'مدقق يارا الإملائي المبسط', en: 'YaraSpell Arabic Checker' },
    description: {
      ar: 'مدقق إملائي ومعجم لغوي خفيف ومبسط للغة العربية مبني لتطبيقات الويب والمحررات النصية.',
      en: 'A lightweight and simplified Arabic spell checker and lexicon designed for text editors and web apps.'
    },
    tags: ['spellchecker', 'arabic', 'hunspell', 'linguistics', 'text-tools']
  },
  'linuxscout/festival-tts-arabic-voices': {
    category: 'nlp-ai',
    title: { ar: 'أصوات فيستفال العربية', en: 'Festival Arabic Voices' },
    description: {
      ar: 'قواعد بيانات صوتية وأصوات عربية مفتوحة المصدر لنظام نطق وتوليد الكلام Festival.',
      en: 'Open-source Arabic voice databases and phonetic mappings for the Festival speech synthesis system.'
    },
    tags: ['tts', 'speech', 'festival', 'voice', 'arabic']
  },
  'arbml/ashaar': {
    category: 'platforms-apps',
    title: { ar: 'أشعار لتحليل ونظم الشعر', en: 'Ashaar Arabic Poetry' },
    description: {
      ar: 'أدوات ذكاء اصطناعي مفتوحة المصدر لوزن القصائد العربية، وتحليل القوافي، والمساعدة في نظم الشعر.',
      en: 'Open-source AI tools for Arabic poetic meter classification, rhyming analysis, and poetry generation.'
    },
    tags: ['python', 'poetry', 'meter', 'nlp', 'literature']
  },
  'arbml/cidar': {
    category: 'dictionaries-datasets',
    title: { ar: 'مجموعة تعليمات صيدار', en: 'CIDAR Instruction Dataset' },
    description: {
      ar: 'أكبر مجموعة تعليمات وأوامر عربية مفتوحة المصدر لتدريب وتوجيه النماذج التوليدية ونماذج المحادثة.',
      en: 'The largest open-source Arabic instruction dataset comprising 10,000 diverse prompts and answers.'
    },
    tags: ['dataset', 'instruction-tuning', 'arabic-llm', 'chatgpt', 'nlp']
  },
  'tarteelai/quranic-universal-library': {
    category: 'islamic-tech',
    title: { ar: 'المكتبة القرآنية الشاملة ترتيل', en: 'Tarteel Quranic Universal Library' },
    description: {
      ar: 'مستودع شامل ومكتبة برمجية مفتوحة المصدر تضم بيانات السور والآيات والترجمات الصوتية والنصية.',
      en: 'A comprehensive collection of open-source Quranic text resources, recitations, and audio metadata.'
    },
    tags: ['quran', 'islamic-tech', 'datasets', 'tarteel', 'audio']
  },
  'zonetecde/qurancaption': {
    category: 'platforms-apps',
    title: { ar: 'أداة كتابة الآيات المرئية', en: 'QuranCaption' },
    description: {
      ar: 'أداة مفتوحة المصدر لتوليد ومزامنة نصوص الآيات القرآنية تلقائياً على المقاطع الصوتية والفيديوهات.',
      en: 'Transform Quranic recitations into synchronized captioned videos with professional typography.'
    },
    tags: ['python', 'quran', 'caption', 'video', 'automation']
  },
  'yazinsai/tilawa': {
    category: 'islamic-tech',
    title: { ar: 'تلاوة للتعرف الصوتي على الآيات', en: 'Tilawa Audio Recognition' },
    description: {
      ar: 'نظام ومكتبة مفتوحة المصدر للتعرف على الآيات والسور من التلاوات الصوتية دون الحاجة لاتصال بالإنترنت.',
      en: 'Offline Quran verse and surah recognition from audio recitations using acoustic matching.'
    },
    tags: ['python', 'audio-recognition', 'quran', 'speech', 'signal-processing']
  },
  'cpfair/quran-align': {
    category: 'islamic-tech',
    title: { ar: 'محاذاة التلاوات القرآنية', en: 'Quran Audio Align' },
    description: {
      ar: 'نظام مفتوح المصدر لحساب الطوابع الزمنية الدقيقة لكل كلمة في التلاوات القرآنية الصوتية.',
      en: 'Word-accurate timestamps and alignment generator for Quranic audio recitations.'
    },
    tags: ['python', 'audio-alignment', 'speech', 'quran', 'forced-alignment']
  },
  'rn0x/altaqwaa-desktop': {
    category: 'platforms-apps',
    title: { ar: 'تطبيق التقوى المكتبي', en: 'Altaqwaa Desktop' },
    description: {
      ar: 'تطبيق إلكتروني مكتبي مفتوح المصدر لقراءة القرآن الكريم وعرض مواقيت الصلاة والأذكار النبوية.',
      en: 'Open-source desktop application for Quran reading, prayer times reminders, and Azkar.'
    },
    tags: ['electron', 'vue', 'desktop', 'quran', 'prayer-times']
  },
  'sunnah-com/api': {
    category: 'islamic-tech',
    title: { ar: 'واجهة برمجية موقع سنة.كوم', en: 'Sunnah.com API' },
    description: {
      ar: 'الواجهة البرمجية الرسمية ومستودع بيانات كتب الحديث الشريف باللغة العربية وترجماتها المعتمدة.',
      en: 'The official API backend for Sunnah.com offering structured access to canonical Hadith collections.'
    },
    tags: ['php', 'hadith', 'api', 'islamic-tech', 'rest-api']
  },
  'sinalab/arabicner': {
    category: 'nlp-ai',
    title: { ar: 'مستخرج الكيانات المسماة العربي', en: 'SinaLab ArabicNER' },
    description: {
      ar: 'أداة ونموذج مفتوح المصدر من مختبر سينا لاستخراج الكيانات المسماة المتداخلة في النصوص العربية.',
      en: 'Arabic nested named entity recognition pipeline and benchmark developed by SinaLab.'
    },
    tags: ['python', 'ner', 'information-extraction', 'nlp', 'deep-learning']
  },
  'ubc-nlp/turjuman': {
    category: 'nlp-ai',
    title: { ar: 'ترجمان للترجمة العصبية', en: 'Turjuman Neural Translation' },
    description: {
      ar: 'أداة ونموذج عصبي مفتوح المصدر متخصص في ترجمة النصوص إلى اللغة العربية من أكثر من 20 لغة.',
      en: 'A neural machine translation toolkit specifically optimized for translating into the Arabic language.'
    },
    tags: ['python', 'translation', 'nmt', 'transformers', 'nlp']
  },
  'disooqi/arabicprocessingcog': {
    category: 'dev-tools',
    title: { ar: 'مكتبة معالجة النصوص العربية', en: 'ArabicProcessingCog' },
    description: {
      ar: 'حزمة بايثون متخصصة في تجذيع وتقطيع النصوص العربية وتقسيم الجمل وإزالة علامات الترقيم.',
      en: 'A Python package for Arabic stemming, tokenization, sentence breaking, and text cleaning.'
    },
    tags: ['python', 'stemmer', 'tokenization', 'arabic-nlp', 'preprocessing']
  },
  'motazsaad/comparable-text-miner': {
    category: 'dev-tools',
    title: { ar: 'منقب النصوص الصرفي المقارن', en: 'Comparable Text Miner' },
    description: {
      ar: 'نظام استخراج وتحليل صرفي للنصوص العربية والإنجليزية لبناء المعاجم الثنائية واستخراج المصطلحات.',
      en: 'Morphological analysis and comparable documents miner for Arabic-English parallel extraction.'
    },
    tags: ['python', 'morphology', 'bilingual', 'nlp', 'text-mining']
  },
  'mawdoo3/multi-dialect-arabic-bert': {
    category: 'nlp-ai',
    title: { ar: 'بيرت موضوع للهجات العربية', en: 'Mawdoo3 Dialectal BERT' },
    description: {
      ar: 'نموذج محولات مسبق التدريب من فريق موضوع لفهم وتمثيل اللهجات العربية المتعددة والنصوص العامية.',
      en: 'Pre-trained multi-dialect Arabic BERT model designed for dialectal Arabic NLP tasks.'
    },
    tags: ['nlp', 'bert', 'dialects', 'mawdoo3', 'transformers']
  }
};

// Generate bilingual presentation entries
function synthesizeProject(repo, detectedCategory) {
  const repoName = repo.name;
  const owner = repo.owner.login;
  const key = `${owner}/${repoName}`.toLowerCase();
  const rawDesc = repo.description?.trim() || '';

  // Check if curated metadata exists
  if (CURATED_DESCRIPTIONS[key]) {
    const curated = CURATED_DESCRIPTIONS[key];
    return {
      id: `${owner.toLowerCase()}-${repoName.toLowerCase()}`.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
      repo: `${owner}/${repoName}`,
      category: curated.category || detectedCategory,
      title: curated.title,
      description: curated.description,
      homepage: repo.homepage || `https://github.com/${owner}/${repoName}`,
      featured: repo.stargazers_count >= 100,
      tags: curated.tags,
    };
  }

  // Clean and formatted title fallback
  let titleAr = repoName;
  let titleEn = repoName
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  let descAr = rawDesc;
  let descEn = rawDesc;

  if (hasArabicText(rawDesc)) {
    descAr = rawDesc;
    descEn = `Open-source Arabic software repository for ${repoName}.`;
  } else {
    descEn = rawDesc;
    descAr = `مشروع وحزمة برمجية مفتوحة المصدر لخدمة المحتوى واللغة العربية: ${rawDesc}`;
  }

  // Refine common tags
  const tags = new Set();
  if (repo.language) tags.add(repo.language.toLowerCase());
  (repo.topics || []).forEach(t => tags.add(t.toLowerCase()));
  if (detectedCategory) tags.add(detectedCategory.replace('-', ' '));

  return {
    id: `${owner.toLowerCase()}-${repoName.toLowerCase()}`.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
    repo: `${owner}/${repoName}`,
    category: detectedCategory,
    title: {
      ar: titleAr,
      en: titleEn,
    },
    description: {
      ar: descAr,
      en: descEn,
    },
    homepage: repo.homepage || `https://github.com/${owner}/${repoName}`,
    featured: repo.stargazers_count >= 100,
    tags: Array.from(tags).slice(0, 6),
  };
}

async function apiFetch(url, retries = 2) {
  try {
    const res = await fetch(url, { headers });
    if (res.status === 403 || res.status === 429) {
      if (retries > 0) {
        console.warn(`\n  ⚠️ GitHub API rate-limit reached. Waiting 25s before retrying...`);
        await new Promise(r => setTimeout(r, 25000));
        return apiFetch(url, retries - 1);
      }
    }
    if (!res.ok) {
      console.warn(`  [HTTP ${res.status}] ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`  [Network error] ${err.message}`);
    return null;
  }
}

async function searchRepositories(query, maxPages = 2) {
  let allItems = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30&page=${page}`;
    const data = await apiFetch(url);
    if (!data?.items || data.items.length === 0) break;
    allItems.push(...data.items);
    if (data.items.length < 30) break;
    await new Promise(r => setTimeout(r, 2200));
  }
  return allItems;
}

async function fetchOrgRepositories(org) {
  const url = `https://api.github.com/users/${org}/repos?per_page=100&sort=pushed`;
  const data = await apiFetch(url);
  return Array.isArray(data) ? data : [];
}

async function main() {
  console.log('🚀 Starting Automated Arabic Open-Source Discovery Engine...');

  const existingProjects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  const registeredRepos = new Set(existingProjects.map(p => p.repo.toLowerCase()));

  console.log(`📦 Existing catalog has ${existingProjects.length} registered projects.`);

  const candidateMap = new Map();

  // 1. Crawl curated organizations
  console.log('\n🏛️ [Phase 1] Crawling Recognized Organizations & Research Labs...');
  for (const org of TARGET_ORGS) {
    process.stdout.write(`  Crawling org [${org}]... `);
    const repos = await fetchOrgRepositories(org);
    let addedCount = 0;
    for (const repo of repos) {
      const fullRepo = repo.full_name.toLowerCase();
      if (!registeredRepos.has(fullRepo) && isHighQuality(repo)) {
        candidateMap.set(fullRepo, repo);
        addedCount++;
      }
    }
    console.log(`found ${repos.length} repos, +${addedCount} candidates.`);
    await new Promise(r => setTimeout(r, 300));
  }

  // 2. Search Topics
  console.log('\n🏷️ [Phase 2] Querying GitHub Topics...');
  for (const topic of TARGET_TOPICS) {
    process.stdout.write(`  Topic search [${topic}]... `);
    const repos = await searchRepositories(`topic:${topic}`);
    let addedCount = 0;
    for (const repo of repos) {
      const fullRepo = repo.full_name.toLowerCase();
      if (!registeredRepos.has(fullRepo) && isHighQuality(repo)) {
        candidateMap.set(fullRepo, repo);
        addedCount++;
      }
    }
    console.log(`returned ${repos.length} items, +${addedCount} new.`);
    await new Promise(r => setTimeout(r, 2200));
  }

  // 3. Search Targeted Domain Queries
  console.log('\n🔍 [Phase 3] Querying Targeted Domain Queries...');
  for (const query of TARGET_QUERIES) {
    process.stdout.write(`  Query [${query}]... `);
    const repos = await searchRepositories(query);
    let addedCount = 0;
    for (const repo of repos) {
      const fullRepo = repo.full_name.toLowerCase();
      if (!registeredRepos.has(fullRepo) && isHighQuality(repo)) {
        candidateMap.set(fullRepo, repo);
        addedCount++;
      }
    }
    console.log(`returned ${repos.length} items, +${addedCount} new.`);
    await new Promise(r => setTimeout(r, 2200));
  }

  const allCandidates = Array.from(candidateMap.values());
  console.log(`\n✨ Discovery Complete! Found ${allCandidates.length} unique candidates.`);

  // Categorize and rank candidates
  const enrichedCandidates = allCandidates.map(repo => {
    const { category, score } = classifyCategory(repo);
    const curated = synthesizeProject(repo, category);
    return {
      ...curated,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      primaryLanguage: repo.language,
      confidenceScore: score,
      updatedAt: repo.pushed_at,
    };
  });

  // Sort by stars and classification score
  enrichedCandidates.sort((a, b) => b.stars - a.stars);

  // Group by category for reporting
  const categoryGroups = {};
  for (const item of enrichedCandidates) {
    if (!categoryGroups[item.category]) categoryGroups[item.category] = [];
    categoryGroups[item.category].push(item);
  }

  console.log('\n📊 Candidate Distribution by Category:');
  for (const [cat, items] of Object.entries(categoryGroups)) {
    console.log(`  - ${cat.padEnd(24)}: ${items.length} candidates (top star: ${items[0]?.stars || 0}★ - ${items[0]?.repo})`);
  }

  // Save detailed discovery report
  fs.writeFileSync(candidatesOutputPath, JSON.stringify(enrichedCandidates, null, 2), 'utf8');
  console.log(`\n💾 Saved detailed candidates report to: ${candidatesOutputPath}`);

  // Ingest mode
  if (isApplyMode) {
    console.log('\n⚡ [--apply] mode enabled: Merging top-scoring candidates into data/projects.json...');

    // Select top high-quality candidates per category ensuring balanced representation
    const toAdd = [];
    const MAX_PER_CATEGORY = 10;
    const addedRepos = new Set(registeredRepos);

    for (const [cat, items] of Object.entries(categoryGroups)) {
      if (categoryArg && cat !== categoryArg) continue;

      // Prioritize curated items, then sort by stars
      items.sort((a, b) => {
        const aCurated = CURATED_DESCRIPTIONS[a.repo.toLowerCase()] ? 1 : 0;
        const bCurated = CURATED_DESCRIPTIONS[b.repo.toLowerCase()] ? 1 : 0;
        if (aCurated !== bCurated) return bCurated - aCurated;
        return b.stars - a.stars;
      });

      let count = 0;
      for (const item of items) {
        if (count >= MAX_PER_CATEGORY) break;
        if (!addedRepos.has(item.repo.toLowerCase()) && item.stars >= 5) {
          toAdd.push({
            id: item.id,
            repo: item.repo,
            category: item.category,
            title: item.title,
            description: item.description,
            homepage: item.homepage,
            featured: item.featured,
            tags: item.tags,
          });
          addedRepos.add(item.repo.toLowerCase());
          count++;
        }
      }
    }

    const mergedProjects = [...existingProjects, ...toAdd];
    fs.writeFileSync(projectsPath, JSON.stringify(mergedProjects, null, 2), 'utf8');

    console.log(`🎉 Ingested ${toAdd.length} new repositories!`);
    console.log(`📈 Catalog expanded from ${existingProjects.length} to ${mergedProjects.length} projects.`);
  } else {
    console.log('\n💡 Run with --apply to automatically ingest candidates, e.g.:');
    console.log('   npm run discover:apply');
  }
}

main().catch(err => {
  console.error('Fatal discovery error:', err);
  process.exit(1);
});
