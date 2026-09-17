import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const SITE_URL = 'https://aros.osamamabkhot.dev';

const SEO_DATA = {
  ar: {
    lang: 'ar',
    dir: 'rtl',
    title: 'دليل المصادر المفتوحة للغة العربية | برمجيات ونماذج حوسبة اللغة العربية',
    description: 'الدليل الحي والمحدث تلقائياً لأبرز المكتبات، النماذج، والأدوات البرمجية مفتوحة المصدر لخدمة اللغة العربية والذكاء الاصطناعي.',
    canonical: `${SITE_URL}/ar`,
    ogLocale: 'ar_AR',
    ogTitle: 'دليل المصادر المفتوحة للغة العربية | برمجيات ونماذج حوسبة اللغة العربية',
    ogDesc: 'الدليل الحي والمحدث تلقائياً لأبرز المكتبات، النماذج، والأدوات البرمجية مفتوحة المصدر لخدمة اللغة العربية والذكاء الاصطناعي.',
  },
  en: {
    lang: 'en',
    dir: 'ltr',
    title: 'Arabic Open Source Directory | Open-Source NLP, AI & Tools for Arabic',
    description: 'The comprehensive living directory of open-source libraries, models, datasets, and developer tools for the Arabic language.',
    canonical: `${SITE_URL}/en`,
    ogLocale: 'en_US',
    ogTitle: 'Arabic Open Source Directory | Open-Source NLP, AI & Tools for Arabic',
    ogDesc: 'The comprehensive living directory of open-source libraries, models, datasets, and developer tools for the Arabic language.',
  },
};

function generateRouteHtml(baseHtml, lang) {
  const seo = SEO_DATA[lang];
  let html = baseHtml;

  // 1. Update <html lang="..." dir="...">
  html = html.replace(/<html[^>]*>/i, `<html lang="${seo.lang}" dir="${seo.dir}" data-theme="dark">`);

  // 2. Fix relative asset links for nested sub-directory (/ar/ or /en/)
  // Replace "./assets/" with "../assets/" or "/assets/"
  html = html.replace(/(href|src)=["']\.\/assets\//g, '$1="../assets/');

  // 3. Update Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${seo.title}</title>`);
  html = html.replace(/<meta\s+name=["']title["'][^>]*>/i, `<meta name="title" content="${seo.title}" />`);

  // 4. Update Meta Description
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${seo.description}" />`);

  // 5. Update Canonical
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${seo.canonical}" />`);

  // 6. Update OpenGraph Tags
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${seo.canonical}" />`);
  html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${seo.ogTitle}" />`);
  html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${seo.ogDesc}" />`);
  html = html.replace(/<meta\s+property=["']og:locale["'][^>]*>/i, `<meta property="og:locale" content="${seo.ogLocale}" />`);

  // 7. Update Twitter Cards
  html = html.replace(/<meta\s+name=["']twitter:url["'][^>]*>/i, `<meta name="twitter:url" content="${seo.canonical}" />`);
  html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${seo.ogTitle}" />`);
  html = html.replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${seo.ogDesc}" />`);

  return html;
}

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE_URL}/</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/ar"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/ar</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/ar"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/en</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/ar"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
`;
}

function generateRobotsTxt() {
  return `# Robots.txt for Arabic Open Source Directory
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

async function main() {
  console.log('🚀 Running SEO & Multi-language Route Generator...');

  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.html not found! Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexPath, 'utf-8');

  // 1. Generate /ar/index.html
  const arDir = path.join(distDir, 'ar');
  fs.mkdirSync(arDir, { recursive: true });
  fs.writeFileSync(path.join(arDir, 'index.html'), generateRouteHtml(baseHtml, 'ar'), 'utf-8');
  console.log('  ✓ Generated dist/ar/index.html (Arabic SEO pre-rendered)');

  // 2. Generate /en/index.html
  const enDir = path.join(distDir, 'en');
  fs.mkdirSync(enDir, { recursive: true });
  fs.writeFileSync(path.join(enDir, 'index.html'), generateRouteHtml(baseHtml, 'en'), 'utf-8');
  console.log('  ✓ Generated dist/en/index.html (English SEO pre-rendered)');

  // 3. Generate 404.html (GitHub Pages SPA fallback)
  fs.writeFileSync(path.join(distDir, '404.html'), baseHtml, 'utf-8');
  console.log('  ✓ Generated dist/404.html (GitHub Pages SPA fallback)');

  // 4. Generate sitemap.xml
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), generateSitemap(), 'utf-8');
  console.log('  ✓ Generated dist/sitemap.xml (Multilingual Google Sitemap)');

  // 5. Generate robots.txt
  fs.writeFileSync(path.join(distDir, 'robots.txt'), generateRobotsTxt(), 'utf-8');
  console.log('  ✓ Generated dist/robots.txt');

  console.log('🎉 SEO assets and multilingual routes generated successfully!');
}

main();
