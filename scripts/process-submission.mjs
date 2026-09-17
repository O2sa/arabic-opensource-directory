import fs from 'node:fs';
import path from 'node:path';
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
  'User-Agent': 'arabic-directory-submission-processor',
  Accept: 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {})
};

/**
 * Extracts a section value from an Issue Form body by looking for ### Header
 */
function extractSection(body, headerPattern) {
  const lines = body.split(/\r?\n/);
  let capturing = false;
  const capturedLines = [];

  for (const line of lines) {
    if (line.startsWith('### ')) {
      const headerText = line.replace(/^###\s+/, '').trim();
      if (headerPattern.test(headerText)) {
        capturing = true;
        continue;
      } else if (capturing) {
        break;
      }
    } else if (capturing) {
      capturedLines.push(line);
    }
  }

  const result = capturedLines.join('\n').trim();
  // Filter out GitHub placeholder "_No response_"
  if (result === '_No response_' || result === '###') return '';
  return result;
}

/**
 * Parses markdown Issue Form body into structured project submission data
 */
export function parseIssueBody(body) {
  if (!body || typeof body !== 'string') {
    throw new Error('Issue body is empty or invalid.');
  }

  const rawRepoUrl = extractSection(body, /Repository URL|رابط مستودع/i);
  const rawCategory = extractSection(body, /Category|التصنيف/i);
  const titleAr = extractSection(body, /Arabic Title|اسم المشروع بالعربية/i);
  const titleEn = extractSection(body, /English Title|اسم المشروع بالإنجليزية/i);
  const descriptionAr = extractSection(body, /Arabic Description|نبذة موجزة بالعربية/i);
  const descriptionEn = extractSection(body, /English Description|نبذة موجزة بالإنجليزية/i);
  const rawHomepage = extractSection(body, /Documentation|Homepage|الموقع/i);
  const rawTags = extractSection(body, /Tags|الكلمات المفتاحية/i);

  // Extract owner/repo
  const repoMatch = rawRepoUrl.match(/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/i) ||
                    rawRepoUrl.match(/^([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)$/);
  if (!repoMatch) {
    throw new Error(`Invalid GitHub repository URL or format: "${rawRepoUrl}"`);
  }
  const repo = repoMatch[1].replace(/\.git$/i, '').trim();

  // Extract category id (e.g., "nlp-ai (الذكاء الاصطناعي...)" -> "nlp-ai")
  const categoryMatch = rawCategory.match(/^([a-z0-9-]+)/i);
  const category = categoryMatch ? categoryMatch[1].toLowerCase().trim() : '';

  // Tags
  const tags = rawTags
    ? rawTags
        .split(/[,،]/)
        .map(t => t.trim().toLowerCase().replace(/[^a-z0-9-_]/gi, ''))
        .filter(t => t.length > 0)
    : [];

  // Homepage URL cleanup
  let homepage = undefined;
  if (rawHomepage && /^https?:\/\//i.test(rawHomepage.trim())) {
    homepage = rawHomepage.trim();
  }

  return {
    repo,
    category,
    title: {
      ar: titleAr.trim(),
      en: titleEn.trim()
    },
    description: {
      ar: descriptionAr.trim(),
      en: descriptionEn.trim()
    },
    homepage,
    tags
  };
}

/**
 * Validates candidate repository via GitHub API
 */
export async function validateWithGitHub(repo) {
  const apiUrl = `https://api.github.com/repos/${repo}`;
  const res = await fetch(apiUrl, { headers });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Repository "${repo}" not found or is private on GitHub.`);
    }
    throw new Error(`GitHub API error (${res.status} ${res.statusText}) for repo "${repo}".`);
  }

  const data = await res.json();

  if (data.archived) {
    console.warn(`⚠️ Note: Repository ${repo} is archived on GitHub.`);
  }

  return {
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    license: data.license?.spdx_id || data.license?.name || null,
    isArchived: data.archived === true,
    htmlUrl: data.html_url,
    defaultBranch: data.default_branch || 'main',
    topics: data.topics || []
  };
}

/**
 * Generates clean unique project ID slug
 */
export function generateUniqueId(repo, titleEn, existingIds) {
  const baseName = (titleEn || repo.split('/')[1] || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let candidate = baseName || 'arabic-project';
  let counter = 1;
  while (existingIds.has(candidate.toLowerCase())) {
    candidate = `${baseName}-${++counter}`;
  }
  return candidate;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Processing Arabic Open Source Project Submission...');

  let issueBody = process.env.ISSUE_BODY || '';
  let issueNumber = process.env.ISSUE_NUMBER || '';
  let issueSender = process.env.ISSUE_SENDER || 'contributor';

  // If GITHUB_EVENT_PATH is available (GitHub Actions)
  if (process.env.GITHUB_EVENT_PATH && fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
    try {
      const eventData = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
      if (eventData.issue) {
        issueBody = eventData.issue.body || issueBody;
        issueNumber = String(eventData.issue.number) || issueNumber;
        issueSender = eventData.issue.user?.login || issueSender;
      }
    } catch (e) {
      console.warn('⚠️ Could not parse GITHUB_EVENT_PATH:', e.message);
    }
  }

  // CLI argument fallback for manual or local testing
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--body' && args[i + 1]) issueBody = args[i + 1];
    if (args[i] === '--file' && args[i + 1]) issueBody = fs.readFileSync(args[i + 1], 'utf8');
    if (args[i] === '--issue' && args[i + 1]) issueNumber = args[i + 1];
  }

  if (!issueBody) {
    console.error('❌ Error: No issue body provided to process.');
    process.exit(1);
  }

  // 1. Parse Issue body
  const submission = parseIssueBody(issueBody);
  console.log(`✓ Parsed submission for repository: ${submission.repo}`);

  // 2. Check Categories
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const validCategoryIds = new Set(categories.map(c => c.id));
  if (!validCategoryIds.has(submission.category)) {
    throw new Error(`Invalid category: "${submission.category}". Must be one of: ${[...validCategoryIds].join(', ')}`);
  }

  // 3. Check existing projects for duplicate
  const existingProjects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  const existingRepos = new Set(existingProjects.map(p => p.repo.toLowerCase()));
  const existingIds = new Set(existingProjects.map(p => p.id.toLowerCase()));

  if (existingRepos.has(submission.repo.toLowerCase())) {
    throw new Error(`Repository "${submission.repo}" already exists in the directory.`);
  }

  // 4. Validate with GitHub API
  console.log(`📡 Validating repo on GitHub: ${submission.repo}...`);
  const ghData = await validateWithGitHub(submission.repo);
  console.log(`✓ GitHub repo valid! ⭐ Stars: ${ghData.stars}, License: ${ghData.license || 'None'}`);

  // Combine topics from GitHub with submission tags
  const mergedTags = Array.from(new Set([...submission.tags, ...ghData.topics.slice(0, 5)]));

  // 5. Generate Unique ID
  const projectId = generateUniqueId(submission.repo, submission.title.en, existingIds);

  // 6. Build Project Object
  const newProject = {
    id: projectId,
    repo: submission.repo,
    category: submission.category,
    title: submission.title,
    description: submission.description,
    ...(submission.homepage ? { homepage: submission.homepage } : {}),
    featured: false,
    tags: mergedTags.length > 0 ? mergedTags : ['arabic', submission.category]
  };

  // 7. Append to projects.json
  existingProjects.push(newProject);
  fs.writeFileSync(projectsPath, JSON.stringify(existingProjects, null, 2) + '\n', 'utf8');
  console.log(`✓ Added [${projectId}] (${submission.repo}) to ${projectsPath}`);

  // 7b. Append to enriched cache files so it is immediately visible without full sync
  if (fs.existsSync(enrichedPath)) {
    try {
      const enrichedList = JSON.parse(fs.readFileSync(enrichedPath, 'utf8'));
      const enrichedItem = {
        ...newProject,
        github: {
          owner: submission.repo.split('/')[0],
          name: submission.repo.split('/')[1],
          url: ghData.htmlUrl || `https://github.com/${submission.repo}`,
          stars: ghData.stars ?? 0,
          forks: ghData.forks ?? 0,
          openIssues: 0,
          license: ghData.license ? { spdxId: ghData.license, name: ghData.license } : undefined,
          primaryLanguage: undefined,
          lastCommitAt: new Date().toISOString(),
          isArchived: ghData.isArchived,
          topics: ghData.topics || []
        },
        activityStatus: ghData.isArchived ? 'archived' : 'active',
        lastSyncedAt: new Date().toISOString()
      };
      enrichedList.push(enrichedItem);
      fs.writeFileSync(enrichedPath, JSON.stringify(enrichedList, null, 2) + '\n', 'utf8');
      fs.writeFileSync(publicEnrichedPath, JSON.stringify(enrichedList, null, 2) + '\n', 'utf8');
      console.log(`✓ Added [${projectId}] to enriched cache files.`);
    } catch (err) {
      console.warn('⚠️ Could not update enriched cache files:', err.message);
    }
  }

  // 8. Generate GitHub Action outputs if in GITHUB_OUTPUT environment
  const branchName = `submission/${projectId}`;
  const prTitle = `feat(catalog): add ${newProject.title.en} (${newProject.repo})`;
  const prBody = `### 🚀 New Project Submission

Closes #${issueNumber || 'N/A'}
Submitted by: @${issueSender}

| Field | Value |
|---|---|
| **ID** | \`${newProject.id}\` |
| **Repository** | [${newProject.repo}](https://github.com/${newProject.repo}) |
| **Category** | \`${newProject.category}\` |
| **Arabic Title** | ${newProject.title.ar} |
| **English Title** | ${newProject.title.en} |
| **Arabic Description** | ${newProject.description.ar} |
| **English Description** | ${newProject.description.en} |
| **Stars** | ⭐ ${ghData.stars} |
| **License** | \`${ghData.license || 'None'}\` |
| **Tags** | ${newProject.tags.map(t => '`' + t + '`').join(', ')} |
${newProject.homepage ? `| **Homepage** | ${newProject.homepage} |\n` : ''}
---
*Automated Pull Request created by GitHub Actions Submission Pipeline.*
`;

  if (process.env.GITHUB_OUTPUT) {
    const outputPath = process.env.GITHUB_OUTPUT;
    fs.appendFileSync(outputPath, `branch_name=${branchName}\n`);
    fs.appendFileSync(outputPath, `project_id=${projectId}\n`);
    fs.appendFileSync(outputPath, `project_name=${newProject.title.en}\n`);
    fs.appendFileSync(outputPath, `repo_name=${newProject.repo}\n`);
    fs.appendFileSync(outputPath, `pr_title=${prTitle}\n`);
    // Multi-line GITHUB_OUTPUT delimiter
    fs.appendFileSync(outputPath, `pr_body<<EOF\n${prBody}\nEOF\n`);
    console.log('✓ Wrote output variables to GITHUB_OUTPUT.');
  }

  console.log('\n🎉 Submission processed successfully!');
  console.log(`   PR Title: ${prTitle}`);
  console.log(`   Branch:   ${branchName}`);
}

// If run directly as a script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(`❌ Submission processing failed: ${err.message}`);
    process.exit(1);
  });
}
