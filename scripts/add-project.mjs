import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const projectsPath = path.join(rootDir, 'data', 'projects.json');
const categoriesPath = path.join(rootDir, 'data', 'categories.json');
const enrichedPath = path.join(rootDir, 'data', 'projects-enriched.json');
const publicEnrichedPath = path.join(rootDir, 'public', 'data', 'projects-enriched.json');

// Load .env if present
if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile(); } catch {}
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = {
  'User-Agent': 'arabic-directory-cli',
  Accept: 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {})
};

function askQuestion(rl, query, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function detectCategory(repoData) {
  const text = `${repoData.name} ${repoData.description || ''} ${(repoData.topics || []).join(' ')}`.toLowerCase();

  if (/tashkeel|diacrit|harakat|vocaliz|tajweed|morpholog/i.test(text)) return 'text-tashkeel';
  if (/ocr|tesseract|handwrit|vision|recognition|detect/i.test(text)) return 'ocr-vision';
  if (/font|type|calligraph|kufi|naskh|ruq/i.test(text)) return 'fonts-calligraphy';
  if (/corpus|dataset|lexicon|dictionary|quran-data|hadith-data|wordnet/i.test(text)) return 'dictionaries-datasets';
  if (/nlp|bert|transformer|llm|embedding|sentiment|summariz|speech|tts|stt|asr/i.test(text)) return 'nlp-ai';
  if (/app|platform|portal|search-engine|mushaf/i.test(text)) return 'platforms-apps';
  return 'dev-tools';
}

function generateSlug(name, existingIds) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let id = base || 'project';
  let c = 1;
  while (existingIds.has(id.toLowerCase())) {
    id = `${base}-${++c}`;
  }
  return id;
}

async function fetchGitHubRepo(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API returned HTTP ${res.status}: ${res.statusText}`);
  }
  return await res.json();
}

async function main() {
  console.log('⚡ Arabic Open Source Directory - Quick Project Addition CLI\n');

  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  const existingRepos = new Set(projects.map(p => p.repo.toLowerCase()));
  const existingIds = new Set(projects.map(p => p.id.toLowerCase()));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    let repoInput = process.argv[2] || '';
    if (!repoInput) {
      repoInput = await askQuestion(rl, 'Enter GitHub repo or URL (e.g. owner/repo or https://github.com/owner/repo)');
    }

    // Clean repo
    const match = repoInput.match(/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/i) ||
                  repoInput.match(/^([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)$/);
    if (!match) {
      throw new Error(`Invalid GitHub repository input: "${repoInput}"`);
    }

    const repo = match[1].replace(/\.git$/i, '').trim();
    if (existingRepos.has(repo.toLowerCase())) {
      throw new Error(`Repository "${repo}" already exists in data/projects.json!`);
    }

    console.log(`📡 Fetching repository info from GitHub: ${repo}...`);
    const repoData = await fetchGitHubRepo(repo);
    console.log(`✓ Found: ${repoData.full_name} (⭐ ${repoData.stargazers_count} stars, license: ${repoData.license?.spdx_id || 'None'})`);

    const suggestedCat = detectCategory(repoData);
    console.log('\nAvailable Categories:');
    categories.forEach((c, idx) => {
      const isSuggested = c.id === suggestedCat ? ' ⭐ (Suggested)' : '';
      console.log(`  ${idx + 1}. [${c.id}] ${c.name.ar} / ${c.name.en}${isSuggested}`);
    });

    const catChoice = await askQuestion(rl, `Select category number (1-${categories.length})`, String(categories.findIndex(c => c.id === suggestedCat) + 1));
    const chosenIndex = parseInt(catChoice, 10) - 1;
    const category = (categories[chosenIndex] ? categories[chosenIndex].id : suggestedCat);

    const defaultTitleEn = repoData.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const titleEn = await askQuestion(rl, 'English Title', defaultTitleEn);
    const titleAr = await askQuestion(rl, 'Arabic Title (اسم المشروع بالعربية)', titleEn);

    const defaultDescEn = repoData.description || `${titleEn} for Arabic language and natural language processing.`;
    const descriptionEn = await askQuestion(rl, 'English Description', defaultDescEn);
    const descriptionAr = await askQuestion(rl, 'Arabic Description (نبذة موجزة بالعربية)', '');

    if (!descriptionAr) {
      throw new Error('Arabic description is required!');
    }

    const homepage = repoData.homepage || undefined;
    const topics = repoData.topics || [];
    const langTag = repoData.language ? repoData.language.toLowerCase() : '';
    const suggestedTags = Array.from(new Set([langTag, ...topics, 'arabic', category].filter(Boolean)));
    const tagsInput = await askQuestion(rl, 'Tags (comma separated)', suggestedTags.join(', '));
    const tags = tagsInput.split(/[,،]/).map(t => t.trim().toLowerCase()).filter(Boolean);

    const id = generateSlug(repoData.name, existingIds);

    const newProject = {
      id,
      repo,
      category,
      title: { ar: titleAr, en: titleEn },
      description: { ar: descriptionAr, en: descriptionEn },
      ...(homepage ? { homepage } : {}),
      featured: false,
      tags
    };

    // Save to data/projects.json
    projects.push(newProject);
    fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + '\n', 'utf8');
    console.log(`\n✓ Successfully appended "${id}" to ${projectsPath}!`);

    // Synchronize into enriched files immediately
    if (fs.existsSync(enrichedPath)) {
      try {
        const enriched = JSON.parse(fs.readFileSync(enrichedPath, 'utf8'));
        const enrichedItem = {
          ...newProject,
          github: {
            owner: repoData.owner?.login || repo.split('/')[0],
            name: repoData.name,
            url: repoData.html_url,
            stars: repoData.stargazers_count ?? 0,
            forks: repoData.forks_count ?? 0,
            openIssues: repoData.open_issues_count ?? 0,
            license: repoData.license ? { spdxId: repoData.license.spdx_id, name: repoData.license.name } : undefined,
            primaryLanguage: repoData.language || undefined,
            lastCommitAt: repoData.pushed_at,
            isArchived: repoData.archived === true,
            topics: repoData.topics || []
          },
          activityStatus: repoData.archived ? 'archived' : 'active',
          lastSyncedAt: new Date().toISOString()
        };
        enriched.push(enrichedItem);
        fs.writeFileSync(enrichedPath, JSON.stringify(enriched, null, 2), 'utf8');
        fs.writeFileSync(publicEnrichedPath, JSON.stringify(enriched, null, 2), 'utf8');
        console.log(`✓ Enriched cache updated in data/ and public/data/`);
      } catch (err) {
        console.warn('⚠️ Could not update enriched cache:', err.message);
      }
    }

    console.log(`\n🎉 Project "${titleEn}" [${id}] added successfully! Total projects: ${projects.length}`);

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
