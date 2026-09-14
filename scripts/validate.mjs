import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const categoriesPath = path.join(rootDir, 'data', 'categories.json');
const projectsPath = path.join(rootDir, 'data', 'projects.json');

function validate() {
  const errors = [];

  // 1. Validate categories
  if (!fs.existsSync(categoriesPath)) {
    console.error(`❌ Categories file not found: ${categoriesPath}`);
    process.exit(1);
  }

  let categories;
  try {
    categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  } catch (err) {
    console.error(`❌ Invalid JSON in ${categoriesPath}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    errors.push('categories.json must be a non-empty array.');
  }

  const categoryIds = new Set();
  categories.forEach((cat, index) => {
    if (!cat.id || typeof cat.id !== 'string') {
      errors.push(`Category at index ${index} missing valid 'id'.`);
    } else if (categoryIds.has(cat.id)) {
      errors.push(`Duplicate category id '${cat.id}' found.`);
    } else {
      categoryIds.add(cat.id);
    }

    if (!cat.name?.ar || !cat.name?.en) {
      errors.push(`Category '${cat.id || index}' missing 'name.ar' or 'name.en'.`);
    }
    if (!cat.description?.ar || !cat.description?.en) {
      errors.push(`Category '${cat.id || index}' missing 'description.ar' or 'description.en'.`);
    }
    if (!cat.icon || typeof cat.icon !== 'string') {
      errors.push(`Category '${cat.id || index}' missing 'icon'.`);
    }
  });

  // 2. Validate projects
  if (!fs.existsSync(projectsPath)) {
    console.error(`❌ Projects file not found: ${projectsPath}`);
    process.exit(1);
  }

  let projects;
  try {
    projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  } catch (err) {
    console.error(`❌ Invalid JSON in ${projectsPath}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(projects) || projects.length === 0) {
    errors.push('projects.json must be a non-empty array.');
  }

  const projectIds = new Set();
  const repoPaths = new Set();
  const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

  projects.forEach((proj, index) => {
    const label = proj.id || `at index ${index}`;

    if (!proj.id || typeof proj.id !== 'string') {
      errors.push(`Project at index ${index} missing valid 'id'.`);
    } else if (projectIds.has(proj.id)) {
      errors.push(`Duplicate project id '${proj.id}'.`);
    } else {
      projectIds.add(proj.id);
    }

    if (!proj.repo || typeof proj.repo !== 'string' || !repoRegex.test(proj.repo)) {
      errors.push(`Project '${label}' has invalid 'repo' format: '${proj.repo}'. Expected 'owner/repo'.`);
    } else if (repoPaths.has(proj.repo.toLowerCase())) {
      errors.push(`Duplicate project repository '${proj.repo}'.`);
    } else {
      repoPaths.add(proj.repo.toLowerCase());
    }

    if (!proj.category || !categoryIds.has(proj.category)) {
      errors.push(`Project '${label}' has unknown category '${proj.category}'. Must match a category in categories.json.`);
    }

    if (!proj.title?.ar?.trim() || !proj.title?.en?.trim()) {
      errors.push(`Project '${label}' missing non-empty 'title.ar' or 'title.en'.`);
    }

    if (!proj.description?.ar?.trim() || !proj.description?.en?.trim()) {
      errors.push(`Project '${label}' missing non-empty 'description.ar' or 'description.en'.`);
    }

    if (!Array.isArray(proj.tags) || proj.tags.some(t => typeof t !== 'string' || !t.trim())) {
      errors.push(`Project '${label}' 'tags' must be an array of non-empty strings.`);
    }

    if (proj.homepage && typeof proj.homepage !== 'string') {
      errors.push(`Project '${label}' 'homepage' must be a valid URL string.`);
    }
  });

  if (errors.length > 0) {
    console.error('❌ Validation failed with the following errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log(`✓ Validation successful: ${projects.length} projects and ${categories.length} categories verified.`);
}

validate();
