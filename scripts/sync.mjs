import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const projectsPath = path.join(rootDir, 'data', 'projects.json');
const enrichedOutputPath = path.join(rootDir, 'data', 'projects-enriched.json');
const publicOutputPath = path.join(rootDir, 'public', 'data', 'projects-enriched.json');

// Automatically load .env if available
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // Ignore if .env is missing
  }
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const headers = {
  'User-Agent': 'arabic-opensource-directory-sync',
  Accept: 'application/vnd.github.v3+json',
};

if (GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  console.log('🔑 Using authenticated GitHub Token.');
} else {
  console.log('⚠️ No GITHUB_TOKEN provided; using unauthenticated requests (rate limit 60 req/hour).');
}

function calculateActivityStatus(pushedAt, isArchived) {
  if (isArchived) return 'archived';
  if (!pushedAt) return 'inactive';

  const diffDays = (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 180) return 'active';
  if (diffDays <= 365) return 'maintained';
  return 'inactive';
}

async function fetchRepoData(repo) {
  const repoUrl = `https://api.github.com/repos/${repo}`;
  const releasesUrl = `https://api.github.com/repos/${repo}/releases/latest`;

  try {
    const repoRes = await fetch(repoUrl, { headers });
    if (!repoRes.ok) {
      console.warn(`⚠️ GitHub API error for ${repo}: HTTP ${repoRes.status} ${repoRes.statusText}`);
      return null;
    }
    const repoData = await repoRes.json();

    let latestRelease = null;
    try {
      const releaseRes = await fetch(releasesUrl, { headers });
      if (releaseRes.ok) {
        const releaseData = await releaseRes.json();
        latestRelease = {
          tag: releaseData.tag_name,
          publishedAt: releaseData.published_at,
        };
      }
    } catch {
      // Releases are optional; ignore errors
    }

    return {
      owner: repoData.owner?.login || repo.split('/')[0],
      name: repoData.name || repo.split('/')[1],
      url: repoData.html_url || `https://github.com/${repo}`,
      stars: repoData.stargazers_count ?? 0,
      forks: repoData.forks_count ?? 0,
      openIssues: repoData.open_issues_count ?? 0,
      license: repoData.license
        ? {
            spdxId: repoData.license.spdx_id,
            name: repoData.license.name,
          }
        : undefined,
      primaryLanguage: repoData.language || undefined,
      lastCommitAt: repoData.pushed_at,
      latestRelease,
      isArchived: repoData.archived === true,
      topics: repoData.topics || [],
    };
  } catch (err) {
    console.warn(`⚠️ Network exception fetching ${repo}: ${err.message}`);
    return null;
  }
}

async function sync() {
  if (!fs.existsSync(projectsPath)) {
    console.error(`❌ Missing projects file: ${projectsPath}`);
    process.exit(1);
  }

  const curatedProjects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

  // Load existing enriched cache if present
  let existingCache = new Map();
  if (fs.existsSync(enrichedOutputPath)) {
    try {
      const existingList = JSON.parse(fs.readFileSync(enrichedOutputPath, 'utf8'));
      existingList.forEach(p => existingCache.set(p.repo.toLowerCase(), p));
    } catch {
      // Ignore cache read errors
    }
  }

  console.log(`📡 Starting telemetry sync for ${curatedProjects.length} projects...`);

  const enrichedProjects = [];
  const concurrency = 3;

  for (let i = 0; i < curatedProjects.length; i += concurrency) {
    const batch = curatedProjects.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (project) => {
        console.log(`  -> Fetching [${project.id}] (${project.repo})...`);
        const github = await fetchRepoData(project.repo);
        const cached = existingCache.get(project.repo.toLowerCase());

        let finalGithub = github;
        if (!finalGithub && cached?.github) {
          console.log(`     Using cached GitHub data for ${project.repo}`);
          finalGithub = cached.github;
        }

        const activityStatus = finalGithub
          ? calculateActivityStatus(finalGithub.lastCommitAt, finalGithub.isArchived)
          : cached?.activityStatus || 'maintained';

        return {
          ...project,
          github: finalGithub || undefined,
          activityStatus,
          lastSyncedAt: new Date().toISOString(),
        };
      })
    );

    enrichedProjects.push(...results);
    // Short pause between batches to respect rate limits
    if (i + concurrency < curatedProjects.length) {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // Ensure directories exist
  fs.mkdirSync(path.dirname(enrichedOutputPath), { recursive: true });
  fs.mkdirSync(path.dirname(publicOutputPath), { recursive: true });

  const formattedJson = JSON.stringify(enrichedProjects, null, 2);
  fs.writeFileSync(enrichedOutputPath, formattedJson, 'utf8');
  fs.writeFileSync(publicOutputPath, formattedJson, 'utf8');

  console.log(`✓ Telemetry sync complete! Saved ${enrichedProjects.length} enriched projects to:`);
  console.log(`   - ${enrichedOutputPath}`);
  console.log(`   - ${publicOutputPath}`);
}

sync();
