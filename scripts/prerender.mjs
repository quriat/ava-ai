// Build-time prerender: generates fully-static, crawlable HTML for the blog
// index and every blog post. The SPA JS still boots and replaces #root for
// interactivity, but crawlers get real content + per-page meta + JSON-LD.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const SITE = 'https://avalimo.net';

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const posts = JSON.parse(fs.readFileSync(path.join(root, 'public', 'blog_posts.json'), 'utf8'));
const landing = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'landingPages.json'), 'utf8'));

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Replace SEO-relevant head fields + inject content into #root.
function buildPage({ title, description, canonical, ogType, jsonLd, bodyHtml }) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[\s\S]*?" \/>/,
    `<meta name="description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<link rel="canonical" href="[\s\S]*?" \/>/,
    `<link rel="canonical" href="${canonical}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[\s\S]*?" \/>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[\s\S]*?" \/>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[\s\S]*?" \/>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = html.replace(
    /<meta property="og:type" content="[\s\S]*?" \/>/,
    `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[\s\S]*?" \/>/,
    `<meta name="twitter:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[\s\S]*?" \/>/,
    `<meta name="twitter:description" content="${esc(description)}" />`
  );
  if (jsonLd) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>\n</head>`
    );
  }
  // Inject prerendered content into #root (React overwrites it on mount).
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${bodyHtml}</div>`
  );
  return html;
}

function writeFile(rel, html) {
  const full = path.join(dist, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

// ---- Blog index ----
const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
const indexBody = `
<main style="max-width:1200px;margin:0 auto;padding:96px 24px;">
  <h1 style="font-size:2.5rem;">Houston Travel Insights</h1>
  <p>Tips, guides, and updates for airport transfers, cruise travel, and luxury ground transportation in Houston.</p>
  <ul>
    ${sorted
      .map(
        (p) =>
          `<li><a href="/blog/${p.slug}"><strong>${esc(p.title)}</strong></a> — ${esc(
            p.summary || ''
          )} <em>(${fmtDate(p.date)})</em></li>`
      )
      .join('\n    ')}
  </ul>
</main>`;

writeFile(
  'blog/index.html',
  buildPage({
    title: 'Houston Travel Insights & Luxury Transport Blog | AvaLimo Houston',
    description:
      'Guides, tips, and updates on Houston airport transfers, Galveston cruise travel, corporate chauffeur service, and luxury ground transportation from AvaLimo.',
    canonical: `${SITE}/blog`,
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'AvaLimo Houston Blog',
      url: `${SITE}/blog`,
      blogPost: sorted.slice(0, 20).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE}/blog/${p.slug}`,
        datePublished: p.date,
      })),
    },
    bodyHtml: indexBody,
  })
);

// ---- Each article ----
let count = 0;
for (const p of posts) {
  if (!p.slug) continue;
  const desc = (p.summary || '').slice(0, 160);
  const body = `
<article style="max-width:768px;margin:0 auto;padding:96px 24px;">
  <nav><a href="/blog">← All Articles</a></nav>
  <p><strong>${esc(p.cat || '')}</strong> · ${fmtDate(p.date)} · ${esc(p.read || '')}</p>
  <h1 style="font-size:2.5rem;">${esc(p.title)}</h1>
  ${p.content}
  <div>
    <h2>Ready to ride in style?</h2>
    <p>Book your Houston chauffeur or airport transfer with AvaLimo — 24/7 dispatch.</p>
    <a href="tel:+18325678050">Call (832) 567-8050</a> · <a href="/#booking-section">Book Online</a>
  </div>
</article>`;
  const html = buildPage({
    title: `${p.title} | AvaLimo Houston Blog`,
    description: desc,
    canonical: `${SITE}/blog/${p.slug}`,
    ogType: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: desc,
      datePublished: p.date,
      dateModified: p.date,
      author: { '@type': 'Organization', name: 'AvaLimo Houston', url: SITE },
      publisher: {
        '@type': 'Organization',
        name: 'AvaLimo Houston',
        logo: { '@type': 'ImageObject', url: `${SITE}/og-image.jpg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${p.slug}` },
      image: `${SITE}/og-image.jpg`,
    },
    bodyHtml: body,
  });
  writeFile(`blog/${p.slug}/index.html`, html);
  count++;
}

// ---- Service landing pages ----
let lcount = 0;
for (const pg of landing) {
  const sections = pg.sections
    .map((s) => `<section><h2>${esc(s.h2)}</h2>${s.body}</section>`)
    .join('\n    ');
  const faqs = pg.faqs.length
    ? `<section><h2>Frequently Asked Questions</h2>${pg.faqs
        .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
        .join('')}</section>`
    : '';
  const body = `
<main style="max-width:896px;margin:0 auto;padding:96px 24px;">
  <nav><a href="/">Home</a> › ${esc(pg.serviceName)}</nav>
  <h1 style="font-size:2.5rem;">${esc(pg.h1)}</h1>
  <p>${esc(pg.intro)}</p>
  <p><a href="tel:+18325678050">Call (832) 567-8050</a> · <a href="/#booking-section">Book Online</a></p>
    ${sections}
    ${faqs}
</main>`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: pg.serviceName,
      name: pg.h1,
      description: pg.description,
      url: `${SITE}/${pg.slug}`,
      areaServed: { '@type': 'AdministrativeArea', name: 'Greater Houston Metropolitan Area, Texas' },
      provider: { '@type': 'LimousineService', name: 'AvaLimo Houston', telephone: '+18325678050', url: SITE },
    },
  ];
  if (pg.faqs.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pg.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  const html = buildPage({
    title: pg.title,
    description: pg.description,
    canonical: `${SITE}/${pg.slug}`,
    ogType: 'website',
    jsonLd,
    bodyHtml: body,
  });
  writeFile(`${pg.slug}/index.html`, html);
  lcount++;
}

// ---- Sitemap (kept in sync with generated pages) ----
const today = new Date().toISOString().slice(0, 10);
const u = (loc, priority, changefreq, lastmod = today) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
const pdate = (d) => { try { return new Date(d).toISOString().slice(0, 10); } catch { return today; } };
const urls = [u(`${SITE}/`, '1.0', 'daily')];
for (const pg of landing) urls.push(u(`${SITE}/${pg.slug}`, '0.9', 'monthly'));
urls.push(u(`${SITE}/blog`, '0.8', 'weekly'));
for (const p of posts) if (p.slug) urls.push(u(`${SITE}/blog/${p.slug}`, '0.6', 'monthly', pdate(p.date)));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);

console.log(`✓ prerendered blog index + ${count} articles + ${lcount} landing pages; sitemap ${urls.length} urls`);
