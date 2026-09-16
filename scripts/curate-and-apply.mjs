import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const projectsPath = path.join(rootDir, 'data', 'projects.json');

const curatedProjects = [
  {
    id: 'qalb-lang',
    title: { ar: 'لغة قَلْب (Qalb)', en: 'Qalb Programming Language' },
    description: {
      ar: 'لغة برمجة وظيفية شبيهة بـ Scheme تُكتب بالكامل بالحروف والأرقام العربية الكلاسيكية.',
      en: 'An Arabic Scheme-like functional programming language exploring non-English coding and classical Arabic calligraphy algorithms.'
    },
    category: 'dev-tools',
    repo: 'nasser/---',
    tags: ['programming-language', 'scheme', 'dev-tools', 'lisp'],
    featured: true,
    activityStatus: 'active'
  },
  {
    id: 'cairo-font',
    title: { ar: 'خط كايرو (Cairo)', en: 'Cairo Typeface' },
    description: {
      ar: 'عائلة خطوط عربية ولاتينية معاصرة ومفتوحة المصدر مصممة استناداً إلى النمط الكوفي المعاصر.',
      en: 'A contemporary open-source Arabic and Latin typeface family based on the modern Kufi style.'
    },
    category: 'fonts-calligraphy',
    repo: 'Gue3bara/Cairo',
    tags: ['font', 'kufi', 'typography', 'open-font'],
    featured: true,
    activityStatus: 'active'
  },
  {
    id: 'kawkab-mono',
    title: { ar: 'خط كوكب مونو (Kawkab Mono)', en: 'Kawkab Mono Font' },
    description: {
      ar: 'خط عربي أحادي المسافة (Monospaced) حر ومفتوح المصدر مخصص لمحررات الأكواد والشاشات الطرفية.',
      en: 'A free and open source monospaced Arabic typeface created for code editors, terminals, and tabular text.'
    },
    category: 'fonts-calligraphy',
    repo: 'aiaf/kawkab-mono',
    tags: ['monospace', 'font', 'code-editor', 'typography'],
    featured: true,
    activityStatus: 'active'
  },
  {
    id: 'markdown-arabic',
    title: { ar: 'ماركداون بالعربية (Markdown Arabic)', en: 'Markdown Arabic' },
    description: {
      ar: 'مجموعة أدوات وإرشادات لتنسيق مستندات ماركداون ودعم اتجاه النصوص من اليمين لليسار بسلاسة.',
      en: 'Tools and best-practice styling guide for writing clean bidirectional Markdown in Arabic.'
    },
    category: 'dev-tools',
    repo: 'ahmadajmi/markdown-arabic',
    tags: ['markdown', 'dev-tools', 'rtl', 'writing'],
    featured: true,
    activityStatus: 'active'
  },
  {
    id: 'arabic-poem-generator',
    title: { ar: 'مولّد الشعر العربي (Arabic Poem Generator)', en: 'Arabic Poem Generator' },
    description: {
      ar: 'نظام توليد أبيات الشعر العربي الكلاسيكي ومحاكاته باستخدام سلاسل ماركوف الإحصائية.',
      en: 'Statistical Arabic classical poetry generation system based on Markov chains and poetic meter analysis.'
    },
    category: 'nlp-ai',
    repo: 'hayderkharrufa/arabic_poem_generator',
    tags: ['poetry', 'markov-chain', 'arabic-nlp', 'nlp-ai'],
    featured: true,
    activityStatus: 'active'
  },
  {
    id: 'mr-dictionaries',
    title: { ar: 'محرك قواميس المورد العربي (MR)', en: 'MR Arabic Dictionaries' },
    description: {
      ar: 'محرك لتجميع وفهرسة قواميس اللغة العربية والمعاجم الثنائية (عربي - إنجليزي) للبحث الفوري.',
      en: 'Fast computational indexer and search engine for Arabic-English lexical dictionaries and root lookups.'
    },
    category: 'dictionaries-datasets',
    repo: 'ejtaal/mr',
    tags: ['dictionary', 'lexicon', 'arabic-english', 'search'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'softvenue-i18n',
    title: { ar: 'مكتبة تدويل البرمجيات للعربية (Softvenue i18n)', en: 'Softvenue i18n' },
    description: {
      ar: 'مكتبة مساعدة لتسريع تعريب وتدويل تطبيقات الويب والواجهات للغة العربية.',
      en: 'Lightweight internationalization utility designed to streamline Arabic localization in web applications.'
    },
    category: 'dev-tools',
    repo: 'softvenue/i18n',
    tags: ['i18n', 'localization', 'arabic', 'dev-tools'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabi-js',
    title: { ar: 'عربي (Arabi JS)', en: 'Arabi JS' },
    description: {
      ar: 'مترجم لغة جافاسكريبت يسمح بكتابة الشفرات البرمجية والكلمات المحجوزة باللغة العربية بالكامل.',
      en: 'A transpiler that enables writing full JavaScript applications using Arabic keywords and syntax.'
    },
    category: 'dev-tools',
    repo: 'arabi-js/arabi',
    tags: ['javascript', 'transpiler', 'arabic-code', 'dev-tools'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'aosus-dictionary',
    title: { ar: 'معجم أسس للمصطلحات التقنية', en: 'Aosus Technical Dictionary' },
    description: {
      ar: 'معجم عربي مفتوح المصدر لتوحيد وترجمة المصطلحات التقنية والبرمجية الحرة إلى العربية.',
      en: 'Open source community dictionary standardizing Arabic translations of technical and software terminology.'
    },
    category: 'dictionaries-datasets',
    repo: 'aosus/aosus-dictionary',
    tags: ['glossary', 'dictionary', 'terminology', 'tech'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'mujallad',
    title: { ar: 'مُجلّد (Mujallad)', en: 'Mujallad Doc Generator' },
    description: {
      ar: 'مُوَلّد مواقع توثيق وكتب إلكترونية ساكنة من ملفات ماركداون مصمم خصيصاً للمحتوى العربي.',
      en: 'Static book and documentation site generator built from the ground up for Arabic Markdown content.'
    },
    category: 'dev-tools',
    repo: 'mhsabbagh/mujallad',
    tags: ['static-site-generator', 'markdown', 'docs', 'books'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabicner-lucasliu',
    title: { ar: 'نظام استخراج الكيانات المسماة (ArabicNER)', en: 'ArabicNER' },
    description: {
      ar: 'نموذج تعلم عميق متقدم للتعرف على الكيانات المسماة (الأشخاص، الأماكن، المنظمات) في النصوص العربية.',
      en: 'High-performance deep learning model for Named Entity Recognition (NER) on Arabic text.'
    },
    category: 'nlp-ai',
    repo: 'LiyuanLucasLiu/ArabicNER',
    tags: ['ner', 'nlp-ai', 'information-extraction', 'deep-learning'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'hard-arabic-dataset',
    title: { ar: 'مجموعة بيانات تقييمات الفنادق العربية (HARD)', en: 'HARD Arabic Dataset' },
    description: {
      ar: 'مجموعة بيانات معيارية تحتوي على مئات الآلاف من المراجعات المصنفة لتحليل المشاعر بالعربية.',
      en: 'Hotel Arabic Reviews Dataset comprising hundreds of thousands of annotated reviews for sentiment analysis.'
    },
    category: 'dictionaries-datasets',
    repo: 'elnagara/HARD-Arabic-Dataset',
    tags: ['dataset', 'sentiment-analysis', 'reviews', 'benchmark'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'thawab',
    title: { ar: 'نظام ثواب الموسوعي (Thawab)', en: 'Thawab Encyclopedia System' },
    description: {
      ar: 'محرك موسوعي وبحثي مفتوح المصدر لإدارة وفهرسة وعرض أمهات كتب التراث والمصنفات العربية.',
      en: 'Open source electronic encyclopedia and full-text search engine for Arabic classical literature.'
    },
    category: 'platforms-apps',
    repo: 'ojuba-org/thawab',
    tags: ['encyclopedia', 'full-text-search', 'literature', 'corpus'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'festival-tts-arabic-voices',
    title: { ar: 'أصوات فيستيفال العربية (Festival TTS Docker)', en: 'Festival Arabic TTS Voices' },
    description: {
      ar: 'حاوية دوكر مجهزة بأصوات نظام Festival لتوليد الكلام العربي الآلي ومعالجة الصوتيات.',
      en: 'Docker container packaging Festival speech synthesis engine configured with natural Arabic voice diphone models.'
    },
    category: 'nlp-ai',
    repo: 'nawarhalabi/festival-tts-arabic-voices-docker',
    tags: ['tts', 'speech-synthesis', 'audio', 'nlp-ai'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-mathjax',
    title: { ar: 'الرموز والرياضيات العربية (Arabic MathJax)', en: 'Arabic MathJax' },
    description: {
      ar: 'إضافة لمكتبة MathJax لدعم كتابة المعادلات والرموز الرياضية العربية من اليمين إلى اليسار.',
      en: 'MathJax extension providing native RTL typesetting and notation for Arabic mathematical formulas.'
    },
    category: 'dev-tools',
    repo: 'OmarIthawi/arabic-mathjax',
    tags: ['math', 'mathjax', 'latex', 'dev-tools'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-ner-azzam',
    title: { ar: 'التعرف على الكيانات المسماة بالعربية (Arabic NER)', en: 'Arabic-NER' },
    description: {
      ar: 'حزمة ونماذج تعتمد على معمارية المحولات (Transformers) لاستخراج الكيانات الاسمية في العربية.',
      en: 'Transformer-based Arabic Named Entity Recognition pipelines and token classification models.'
    },
    category: 'nlp-ai',
    repo: 'HassanAzzam/Arabic-NER',
    tags: ['ner', 'transformers', 'nlp-ai', 'information-extraction'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'atkspy',
    title: { ar: 'مكتبة بايثون لخدمات ATKS العربية (ATKSpy)', en: 'ATKSpy' },
    description: {
      ar: 'حزمة بايثون للتواصل مع خدمات Microsoft ATKS للتحليل الصرفي ووسم أجزاء الكلام (POS Tagger).',
      en: 'Python client library for communicating with Microsoft Arabic Toolkit Services for POS tagging and parsing.'
    },
    category: 'nlp-ai',
    repo: 'AliAbdelaal/ATKSpy',
    tags: ['pos-tagger', 'atks', 'morphology', 'nlp-ai'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-word-embeddings-word2vec',
    title: { ar: 'تضمينات الكلمات العربية Word2Vec', en: 'Arabic Word2Vec Embeddings' },
    description: {
      ar: 'متجهات تضمين دلالي مدرّبة مسبقاً على مليارات الكلمات العربية باستخدام خوارزميات Word2Vec.',
      en: 'Pretrained Word2Vec semantic word vectors trained on large-scale Arabic web corpora.'
    },
    category: 'nlp-ai',
    repo: 'rozester/Arabic-Word-Embeddings-Word2vec',
    tags: ['word2vec', 'embeddings', 'semantic-search', 'nlp-ai'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'asrajeh-arabic-tts',
    title: { ar: 'الناطق العربي (Arabic TTS)', en: 'Arabic TTS' },
    description: {
      ar: 'نظام تحويل النصوص العربية إلى كلام منطوق يعتمد على التعلم العميق وتحليل الصوامت والصوائت.',
      en: 'Text-to-Speech synthesis system tailored for Arabic phonetic rules and pronunciation.'
    },
    category: 'nlp-ai',
    repo: 'asrajeh/arabic-tts',
    tags: ['tts', 'speech-synthesis', 'phonetics', 'nlp-ai'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-hatespeech-dataset',
    title: { ar: 'كاشف خطاب الكراهية في التغريدات العربية', en: 'Arabic Hate Speech Detection' },
    description: {
      ar: 'مجموعة بيانات معيارية ونماذج لتصنيف واكتشاف خطاب الكراهية والتعصب في المحتوى العربي الرقمي.',
      en: 'Annotated dataset and classification benchmarks for detecting online hate speech in Arabic social media.'
    },
    category: 'nlp-ai',
    repo: 'nuhaalbadi/Arabic_hatespeech',
    tags: ['hate-speech', 'social-media', 'nlp-ai', 'classification'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'osman-readability',
    title: { ar: 'مقياس عثمان لمقروئية النصوص العربية (Osman)', en: 'Osman Arabic Readability' },
    description: {
      ar: 'أداة ومكتبة حسابية مفتوحة المصدر لقياس مدى سهولة ومقروئية النصوص العربية ومعامل الصعوبة.',
      en: 'Open source computational tool and metric for assessing Arabic text readability and comprehension levels.'
    },
    category: 'nlp-ai',
    repo: 'drelhaj/OsmanReadability',
    tags: ['readability', 'nlp-ai', 'metrics', 'text-analysis'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-handwriting-matlab',
    title: { ar: 'التعرف على الخط العربي اليدوي بماتلاب', en: 'Arabic Handwriting OCR Matlab' },
    description: {
      ar: 'نظام رؤية حاسوبية وشبكات عصبية للتعرف البصري على الكلمات العربية المكتوبة بخط اليد.',
      en: 'Computer vision and neural network system for offline Arabic handwritten word recognition in MATLAB.'
    },
    category: 'ocr-vision',
    repo: 'JubbaSmail/Arabic-Handwriting-Recognition-Using-Matlab',
    tags: ['ocr', 'handwriting-recognition', 'computer-vision', 'ocr-vision'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'laravel-arabic-numbers-middleware',
    title: { ar: 'وسيط تحويل الأرقام العربية للارافيل', en: 'Laravel Arabic Numbers Middleware' },
    description: {
      ar: 'وسيط برمجي لإطار عمل لارافيل للتحويل التلقائي بين الأرقام العربية المشرقية والمغربية في الطلبات.',
      en: 'Laravel middleware automatically converting between Eastern Arabic (١٢٣) and Western Arabic numerals.'
    },
    category: 'dev-tools',
    repo: 'salkhwlani/laravel-arabic-numbers-middleware',
    tags: ['laravel', 'numerals', 'dev-tools', 'php'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'l-hsab-levantine-dataset',
    title: { ar: 'مدونة خطاب الكراهية الشامية (L-HSAB)', en: 'L-HSAB Levantine Dataset' },
    description: {
      ar: 'أول مجموعة بيانات مخصصة لتحليل واكتشاف خطاب الكراهية والتحريض في اللهجات الشامية.',
      en: 'The first specialized annotated corpus for detecting hate speech and abusive language in Levantine Arabic.'
    },
    category: 'dictionaries-datasets',
    repo: 'Hala-Mulki/L-HSAB-First-Arabic-Levantine-HateSpeech-Dataset',
    tags: ['levantine', 'dialects', 'dataset', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'labiba-lang',
    title: { ar: 'لغة البرمجة لبيبة (Labiba)', en: 'Labiba Programming Language' },
    description: {
      ar: 'لغة برمجة عربية تعليمية مبنية لتسهيل استيعاب المفاهيم الخوارزمية بلغة الضاد.',
      en: 'An educational Arabic-first programming language designed to introduce algorithmic thinking in Arabic.'
    },
    category: 'dev-tools',
    repo: 'fakoua/labiba',
    tags: ['programming-language', 'education', 'dev-tools', 'compiler'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-font-detector',
    title: { ar: 'كاشف أنواع الخط العربي (Font Detector)', en: 'Arabic Font Detector' },
    description: {
      ar: 'نموذج رؤية حاسوبية يتعرف على نوع الخط العربي (نسخ، رقعة، كوفي، إلخ) تلقائياً من صور النصوص.',
      en: 'Computer vision model classifying traditional Arabic calligraphic styles (Naskh, Ruq\'ah, etc.) from images.'
    },
    category: 'ocr-vision',
    repo: 'd7miiZ/Arabic-Font-Detector',
    tags: ['font-detection', 'calligraphy', 'ocr-vision', 'classification'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabizi-transliteration',
    title: { ar: 'محول لغة العربيزي إلى العربية (Arabizi)', en: 'Arabizi Transliteration' },
    description: {
      ar: 'نموذج ونظام لتحويل النصوص المكتوبة بالعربيزي (الأحرف اللاتينية والأرقام) إلى نصوص عربية قياسية.',
      en: 'Automated transliteration system mapping Arabizi (Arabic chat alphabet) into standard Arabic script.'
    },
    category: 'nlp-ai',
    repo: 'bashartalafha/Arabizi-Transliteration',
    tags: ['arabizi', 'transliteration', 'nlp-ai', 'social-media'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'covid-fakes-dataset',
    title: { ar: 'مدونة كوفيد للأخبار العربية المضللة (COVID-FAKES)', en: 'COVID-FAKES Arabic Dataset' },
    description: {
      ar: 'مجموعة بيانات بحثية لتقييم خوارزميات كشف الشائعات والأخبار الكاذبة الموجهة للمجتمعات العربية.',
      en: 'Bilingual dataset benchmark for detecting misleading news and rumors circulating in Arabic Twitter spheres.'
    },
    category: 'dictionaries-datasets',
    repo: 'mohaddad/COVID-FAKES',
    tags: ['fake-news', 'dataset', 'fact-checking', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'ud-arabic-padt',
    title: { ar: 'شجرة التبعية النحوية العربية (UD Arabic PADT)', en: 'Universal Dependencies Arabic PADT' },
    description: {
      ar: 'شجرة النحو المعياري الدولي للعربية الفصحى لتدريب المحللات النحوية وفق Universal Dependencies.',
      en: 'Universal Dependencies treebank for Modern Standard Arabic based on the Prague Arabic Dependency Treebank.'
    },
    category: 'dictionaries-datasets',
    repo: 'UniversalDependencies/UD_Arabic-PADT',
    tags: ['treebank', 'syntax', 'grammar', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'qcri-dialectal-resources',
    title: { ar: 'موارد معالجة اللهجات العربية من QCRI', en: 'QCRI Dialectal Arabic Resources' },
    description: {
      ar: 'مجموعة موارد ومعاجم وخوارزميات معالجة اللهجات العربية المتعددة من معهد قطر لبحوث الحوسبة.',
      en: 'Dialectal Arabic NLP corpora, lexicons, and identification tools developed by Qatar Computing Research Institute.'
    },
    category: 'nlp-ai',
    repo: 'qcri/dialectal_arabic_resources',
    tags: ['dialects', 'qcri', 'corpora', 'nlp-ai'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'nileulex-sentiment-lexicon',
    title: { ar: 'معجم النيل للمشاعر والوجدان (NileULex)', en: 'NileULex Sentiment Lexicon' },
    description: {
      ar: 'معجم دلالي شامل لتحليل المشاعر بالعربية الفصحى واللهجة المصرية من جامعة النيل.',
      en: 'Comprehensive Arabic sentiment lexicon covering MSA and Egyptian dialect from Nile University.'
    },
    category: 'dictionaries-datasets',
    repo: 'NileTMRG/NileULex',
    tags: ['lexicon', 'sentiment', 'egyptian-dialect', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-virtual-keyboard',
    title: { ar: 'لوحة المفاتيح الافتراضية العربية', en: 'Arabic Virtual Keyboard' },
    description: {
      ar: 'مكوّن برمجي يوفر لوحة مفاتيح افتراضية متكاملة لطباعة الأحرف والتشكيل العربي في تطبيقات الويب.',
      en: 'Interactive virtual on-screen Arabic keyboard component supporting diacritics and custom layouts.'
    },
    category: 'dev-tools',
    repo: 'onattech/Arabic-Keyboard',
    tags: ['keyboard', 'virtual-keyboard', 'ui-component', 'dev-tools'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-tech-terminology',
    title: { ar: 'مسرد المصطلحات التقنية العربية', en: 'Arabic Tech Terminology' },
    description: {
      ar: 'مسرد عربي مفتوح المصدر للمصطلحات البرمجية والتقنية لتسهيل توحيد التعريب.',
      en: 'Curated open source English-Arabic glossary of computer science and software engineering terms.'
    },
    category: 'dictionaries-datasets',
    repo: 'forabi/arabic-tech-terminology',
    tags: ['terminology', 'glossary', 'dictionary', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'brad-arabic-dataset',
    title: { ar: 'مجموعة بيانات مراجعات الكتب العربية (BRAD)', en: 'BRAD Arabic Dataset' },
    description: {
      ar: 'مدونة ضخمة لمراجعات وتقييمات الكتب العربية لاستخدامها في نماذج تصنيف النصوص وتحليل الآراء.',
      en: 'Book Reviews in Arabic Dataset containing annotated reader reviews for sentiment classification.'
    },
    category: 'dictionaries-datasets',
    repo: 'elnagara/BRAD-Arabic-Dataset',
    tags: ['reviews', 'sentiment', 'dataset', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'kalimat-lang',
    title: { ar: 'لغة البرمجة كلمات (Kalimat)', en: 'Kalimat Programming Language' },
    description: {
      ar: 'لغة برمجة عربية تفاعلية مفتوحة المصدر لتعليم مبادئ الخوارزميات وتطوير الرسوميات والألعاب.',
      en: 'An interactive educational Arabic programming language for teaching algorithmic concepts and graphics.'
    },
    category: 'dev-tools',
    repo: 'mobadarah/kalimat-lang',
    tags: ['programming-language', 'educational', 'graphics', 'dev-tools'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'ammoria-lang',
    title: { ar: 'لغة البرمجة عموريا (Ammoria)', en: 'Ammoria Programming Language' },
    description: {
      ar: 'بيئة ولغة برمجية عربية لتسهيل تعلم المنطق البرمجي وكتابة الأوامر باللغة العربية.',
      en: 'An Arabic programming language environment built to facilitate computational logic in Arabic script.'
    },
    category: 'dev-tools',
    repo: 'mobadarah/Ammoria',
    tags: ['programming-language', 'education', 'compiler', 'dev-tools'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'ajgt-arabic-twitter-corpus',
    title: { ar: 'مدونة التغريدات الأردنية للمشاعر (AJGT)', en: 'AJGT Twitter Corpus' },
    description: {
      ar: 'مدونة التغريدات الأردنية المصنفة إلى مشاعر إيجابية وسلبية لتدريب واختبار خوارزميات الذكاء الاصطناعي.',
      en: 'Arabic Jordanian General Tweets corpus annotated for sentiment analysis and dialectal NLP.'
    },
    category: 'dictionaries-datasets',
    repo: 'komari6/Arabic-twitter-corpus-AJGT',
    tags: ['sentiment', 'jordanian', 'twitter', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'tead-emotion-dataset',
    title: { ar: 'مجموعة بيانات المشاعر التونسية (TEAD)', en: 'TEAD Emotion Analysis Dataset' },
    description: {
      ar: 'مجموعة بيانات ضخمة للتغريدات باللهجة التونسية مصنفة دلالياً وفق العواطف والمشاعر الإنسانية.',
      en: 'Large scale Tunisian Emotion Analysis Dataset constructed for multi-class emotional NLP tasks.'
    },
    category: 'dictionaries-datasets',
    repo: 'HSMAabdellaoui/TEAD',
    tags: ['tunisian', 'dialects', 'emotion-analysis', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-verbnet',
    title: { ar: 'معجم شبكة الأفعال العربية (Arabic VerbNet)', en: 'Arabic VerbNet' },
    description: {
      ar: 'معجم حوسبي واسع النطاق يصنف الأفعال العربية وفق التحولات التركيبية والدلالية (VerbNet).',
      en: 'Large scale computational verb lexicon classifying Arabic verbs based on syntactic alternations.'
    },
    category: 'dictionaries-datasets',
    repo: 'JaouadMousser/Arabic-Verbnet',
    tags: ['lexicon', 'verbs', 'computational-linguistics', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'circular-arabic',
    title: { ar: 'رسم الخط العربي الدائري (Circular Arabic)', en: 'Circular Arabic Canvas' },
    description: {
      ar: 'مكتبة لرسم وتنسيق حروف الخط العربي على مسارات دائرية وزخرفية باستخدام HTML5 Canvas.',
      en: 'JavaScript library rendering connected Arabic typography along circular curves on HTML5 Canvas.'
    },
    category: 'fonts-calligraphy',
    repo: 'mapmeld/circular-arabic',
    tags: ['calligraphy', 'canvas', 'typography', 'fonts-calligraphy'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'nimra-font',
    title: { ar: 'خط نمرة للأرقام المشرقية (Nimra)', en: 'Nimra Arabic Numerals Font' },
    description: {
      ar: 'خط رقمي مفتوح المصدر مخصص للأرقام العربية المشرقية بنمط التعرف البصري المغناطيسي (MICR E13B).',
      en: 'Typeface featuring Eastern Arabic numerals designed in the style of MICR E13B optical encoding.'
    },
    category: 'fonts-calligraphy',
    repo: 'aiaf/nimra',
    tags: ['font', 'numerals', 'micr', 'fonts-calligraphy'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'aracon-verb-conjugator',
    title: { ar: 'مُصرّف ومحلل الأفعال العربية (ARACON)', en: 'ARACON Verb Conjugator' },
    description: {
      ar: 'نظام حوسبي لتصريف الأفعال وتوليد المشتقات وتحليل الصرف العربي وفق القواعد النحوية.',
      en: 'Arabic verb conjugator and morphological generator analyzing patterns and inflections.'
    },
    category: 'nlp-ai',
    repo: 'JaouadMousser/Aracon',
    tags: ['conjugation', 'morphology', 'verbs', 'nlp-ai'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'masc-sentiment-corpus',
    title: { ar: 'مدونة المشاعر متعددة المجالات (MASC)', en: 'MASC Arabic Sentiment Corpus' },
    description: {
      ar: 'مدونة نصوص عربية فصحى متعددة المجالات وموسومة بالكامل للأبحاث وتدريب نماذج الآراء.',
      en: 'Multi-domain Arabic Sentiment Corpus providing labeled benchmark texts for opinion mining.'
    },
    category: 'dictionaries-datasets',
    repo: 'almoslmi/masc',
    tags: ['sentiment', 'corpus', 'dataset', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'arabic-satirical-news-dataset',
    title: { ar: 'مجموعة بيانات الأخبار الساخرة والمفبركة', en: 'Arabic Satirical News Dataset' },
    description: {
      ar: 'مجموعة بيانات للتمييز بين الأخبار الحقيقية والساخرة والمضللة في وسائل الإعلام والمواقع العربية.',
      en: 'Benchmark dataset enabling AI models to differentiate between legitimate news, satire, and misinformation.'
    },
    category: 'dictionaries-datasets',
    repo: 'sadanyh/Arabic-Satirical-Fake-News-Dataset',
    tags: ['dataset', 'fake-news', 'satire', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'vscode-arabic-rtl',
    title: { ar: 'دعم العربية والاتجاه لليمين في VS Code', en: 'Arabic RTL Support for VS Code' },
    description: {
      ar: 'إضافة لمحرر فيجوال ستوديو كود لتحسين عرض وحركة المؤشر وتحرير النصوص والتعليقات العربية.',
      en: 'VS Code extension providing bidirectional rendering and seamless Arabic RTL editing in code editors.'
    },
    category: 'dev-tools',
    repo: 'i74ifa/arabic-rtl-support-vscode',
    tags: ['vscode', 'rtl', 'editor', 'dev-tools'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'aqad-arabic-qa-dataset',
    title: { ar: 'مجموعة بيانات الأسئلة والأجوبة العربية (AQAD)', en: 'AQAD Arabic QA Dataset' },
    description: {
      ar: 'مجموعة بيانات تضم أكثر من 17,000 سؤال وجواب باللغة العربية لتدريب نماذج الفهم القرائي الآلي.',
      en: 'Reading comprehension dataset with 17,000+ Arabic questions and answers for question-answering AI.'
    },
    category: 'dictionaries-datasets',
    repo: 'adelmeleka/AQAD',
    tags: ['question-answering', 'comprehension', 'dataset', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'kawarith-crisis-dataset',
    title: { ar: 'مدونة كوارث لتغريدات الأزمات العربية (Kawarith)', en: 'Kawarith Crisis Tweets Dataset' },
    description: {
      ar: 'مدونة نصوص عربية لتغريدات الأزمات وحالات الطوارئ الإنسانية لتحليل استجابة المجتمعات.',
      en: 'Curated Arabic Twitter corpus focused on disaster response and crisis communication during emergencies.'
    },
    category: 'dictionaries-datasets',
    repo: 'alaa-a-a/kawarith',
    tags: ['crisis-computing', 'disaster', 'twitter', 'dictionaries-datasets'],
    featured: false,
    activityStatus: 'active'
  },
  {
    id: 'adam-morphology',
    title: { ar: 'المحلل الصرفي للهجات العربية (ADAM)', en: 'ADAM Arabic Morphology Analyzer' },
    description: {
      ar: 'أداة ومحلل صرفي متقدم لفك غموض وتجزئة وتشكيل اللهجات العربية وتجريد الجذور.',
      en: 'Advanced Analyzer for Dialectal Arabic Morphology performing morphological disambiguation and tokenization.'
    },
    category: 'text-tashkeel',
    repo: 'WaelSalloum/adam',
    tags: ['morphology', 'dialects', 'tokenization', 'text-tashkeel'],
    featured: false,
    activityStatus: 'active'
  }
];

function applyCuratedProjects() {
  const existingProjects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  const existingRepos = new Set(existingProjects.map(p => p.repo.toLowerCase()));
  const existingIds = new Set(existingProjects.map(p => p.id.toLowerCase()));

  const added = [];
  for (const proj of curatedProjects) {
    if (existingRepos.has(proj.repo.toLowerCase())) {
      console.log(`⚠️ Repo already exists, skipping: ${proj.repo}`);
      continue;
    }

    let finalId = proj.id;
    let counter = 1;
    while (existingIds.has(finalId.toLowerCase())) {
      finalId = `${proj.id}-${counter++}`;
    }
    existingIds.add(finalId.toLowerCase());

    const enrichedProj = {
      ...proj,
      id: finalId
    };

    existingProjects.push(enrichedProj);
    added.push(enrichedProj);
  }

  fs.writeFileSync(projectsPath, JSON.stringify(existingProjects, null, 2), 'utf8');
  console.log(`\n🎉 Successfully added ${added.length} new curated projects!`);
  console.log(`📊 Previous total: ${existingProjects.length - added.length} -> New total: ${existingProjects.length}`);
}

applyCuratedProjects();
