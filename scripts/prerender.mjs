// Build-time prerender: generates fully-static, crawlable HTML for the blog
// index, every blog post, the landing pages, the core routes, and the trust
// pages (about/contact/privacy/terms). The SPA JS still boots and replaces
// #root for interactivity, but crawlers get real content, per-page meta, and
// one JSON-LD block per page.
//
// SEO rules enforced here (see avalimo-net-seo-audit.md):
// - clean URLs without a trailing slash, matching deploy/nginx.conf
// - titles <= 60 chars, unique descriptions 110-158 chars
// - ISO 8601 dates in structured data
// - no duplicate H1 in the prerendered body
// - broken/legacy links in article HTML are rewritten, not copied
// - duplicate and misspelled blog slugs become redirects (nginx.conf + page)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const SITE = 'https://avalimo.net';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const posts = JSON.parse(fs.readFileSync(path.join(root, 'public', 'blog_posts.json'), 'utf8'));
const landing = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'landingPages.json'), 'utf8'));
const faqs = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'faqs.json'), 'utf8'));

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const decode = (s = '') =>
  String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

const plainText = (html = '') =>
  decode(
    String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

/** ISO 8601 (yyyy-mm-dd) from either an ISO date or a human date like "October 30, 2026". */
const isoDate = (value) => {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? BUILD_DATE : parsed.toISOString().slice(0, 10);
};

/** Cut at a word boundary without leaving a dangling separator. */
const truncate = (text, max) => {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const boundary = cut.lastIndexOf(' ');
  return (boundary > max * 0.6 ? cut.slice(0, boundary) : cut).replace(/[\s,;:.\-–—]+$/, '');
};

/**
 * Title <= 60 characters. Short titles keep the brand suffix; long titles drop
 * it rather than being truncated by the SERP.
 */
const fitTitle = (title) => {
  const clean = String(title || '').replace(/\s+/g, ' ').trim();
  const suffix = ' | AvaLimo';
  // Titles that already name the brand (trust pages, landing pages) keep their wording.
  if (/avalimo/i.test(clean)) return clean.length <= 60 ? clean : truncate(clean, 60);
  if (clean.length <= 60 - suffix.length) return `${clean}${suffix}`;
  if (clean.length <= 60) return clean;
  const head = clean.split(/\s*[:|—–]\s*/)[0].trim();
  if (head.length >= 25 && head.length + suffix.length <= 60) return `${head}${suffix}`;
  return truncate(clean.split('|')[0], 59);
};

/** Unique 110-158 char description, derived from the post content when the summary is unusable. */
const usedDescriptions = new Set();
const makeDescription = (summary, content, fallbackPrefix) => {
  const candidates = [];
  const cleanSummary = plainText(summary);
  const body = plainText(content);
  if (cleanSummary.length >= 110 && cleanSummary.length <= 158) candidates.push(cleanSummary);
  if (cleanSummary.length > 60) candidates.push(truncate(cleanSummary, 158));
  const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length) candidates.push(truncate(sentences.slice(0, 2).join(' '), 158));
  if (body.length) candidates.push(truncate(body, 158));
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (value.length < 110) continue;
    if (usedDescriptions.has(value)) continue;
    usedDescriptions.add(value);
    return value;
  }
  // Last resort: the longest available text, padded with a concrete next step.
  const base = truncate(body || cleanSummary || `${fallbackPrefix} with AvaLimo Houston`, 120);
  const unique = truncate(`${base} Flat rates and 24/7 dispatch from AvaLimo Houston.`, 158);
  usedDescriptions.add(unique);
  return unique;
};

// ---- Legacy / duplicate / misspelled paths that must redirect ----
// deploy/nginx.conf carries the matching 301s for the deployed image.
const REDIRECTS = {
  'blog/luxury-transportation-houston-availimo': '/blog/luxury-transportation-houston',
  'blog/luxury-transportation-houston-avalimo': '/blog/luxury-transportation-houston',
  'blog/why-choose-availimo-houston-luxury-transportation': '/blog/luxury-transportation-houston',
  'blog/why-choose-avalimo-houston-luxury-transportation': '/blog/luxury-transportation-houston',
  'blog/choose-avalimo-luxury-transportation-houston': '/blog/luxury-transportation-houston',
  'blog/luxury-travel-houston-availimo': '/blog/luxury-travel-houston-avalimo',
  book: '/#booking-section',
  'corporate-transportation': '/corporate-chauffeur-houston',
  'galveston-limo': '/galveston-cruise-transportation',
  privacy: '/privacy-policy',
};
const REDIRECTED_SLUGS = new Set(
  Object.keys(REDIRECTS)
    .filter((key) => key.startsWith('blog/'))
    .map((key) => key.slice('blog/'.length))
);

// ---- Trust pages (About / Contact / Privacy / Terms) ----
const TRUST_PAGES = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'trustPages.json'), 'utf8'));
const TRUST_LINKS = `
  <nav aria-label="Company">
    <strong>AvaLimo Houston</strong>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
      <li><a href="/privacy-policy">Privacy policy</a></li>
      <li><a href="/terms">Terms of service</a></li>
      <li><a href="tel:+18325678050">(832) 567-8050</a></li>
    </ul>
    <strong>Service areas</strong>
    <ul>
      <li><a href="/iah-airport-limo-service">IAH airport limo service</a></li>
      <li><a href="/hobby-airport-limo-service">Hobby Airport limo service</a></li>
      <li><a href="/sugar-land-limo-service">Sugar Land limo service</a></li>
      <li><a href="/missouri-city-limo-service">Missouri City limo service</a></li>
    </ul>
  </nav>`;

// ---- Rewrite legacy links inside article HTML ----
const knownSlugs = new Set(posts.map((post) => post.slug));
const rewriteContentLinks = (html) =>
  String(html || '')
    .replace(/\shref="\/book"/g, ' href="/#booking-section"')
    .replace(/\shref="\/contact"/g, ' href="/contact"')
    .replace(/\shref="http:\/\/avalimo\.net/g, ' href="https://avalimo.net')
    .replace(/\shref="https:\/\/www\.avalimo\.net/g, ' href="/')
    .replace(/\shref="https:\/\/avalimo\.net\/?"/g, ' href="/"')
    .replace(/\shref="\/blog\/luxury-limo-services-houston"/g, ' href="/services"')
    .replace(/\shref="(\/blog\/[^"#?]+)"/g, (match, href) => {
      const slug = href.slice('/blog/'.length);
      return knownSlugs.has(slug) ? match : ' href="/blog"';
    });

/** Demote any <h1> inside article content so the page keeps one H1. */
const stripLeadingH1 = (html) =>
  String(html || '')
    .replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '')
    .replace(/<h1([^>]*)>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');

function buildPage({ title, description, canonical, ogType, jsonLd, bodyHtml, noindex = false }) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[\s\S]*?" \/>/,
    `<meta name="description" content="${esc(description)}" />`
  );
  if (noindex) {
    html = html.replace(
      /<meta name="robots" content="[\s\S]*?" \/>/,
      '<meta name="robots" content="noindex, follow" />'
    );
  }
  html = html.replace(/<link rel="canonical" href="[\s\S]*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
  html = html.replace(
    /<meta property="og:title" content="[\s\S]*?" \/>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[\s\S]*?" \/>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  html = html.replace(/<meta property="og:url" content="[\s\S]*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
  html = html.replace(/<meta property="og:type" content="[\s\S]*?" \/>/, `<meta property="og:type" content="${ogType}" />`);
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
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${bodyHtml}</div>`);
  return html;
}

function writeFile(rel, html) {
  const full = path.join(dist, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

// ---- Redirects: static fallback pages plus nginx 301s ----
let redirectCount = 0;
for (const [from, to] of Object.entries(REDIRECTS)) {
  const target = to.startsWith('http') ? to : `${SITE}${to}`;
  writeFile(
    `${from}/index.html`,
    buildPage({
      title: 'Redirecting | AvaLimo',
      description: 'This page has moved.',
      canonical: target,
      ogType: 'website',
      noindex: true,
      bodyHtml: `
<main style="max-width:720px;margin:0 auto;padding:96px 24px;">
  <h1>This page has moved</h1>
  <p>Redirecting to <a href="${to}">${esc(target)}</a>.</p>
</main>
<script>location.replace(${JSON.stringify(to)});</script>`,
    })
  );
  redirectCount++;
}

// ---- Homepage ----
const homeBody = `
<main style="max-width:1200px;margin:0 auto;padding:96px 24px;">
  <h1 style="font-size:2.5rem;">Houston Luxury Chauffeur &amp; Private Car Service</h1>
  <p>AvaLimo is Houston's trusted luxury chauffeur service, offering 24/7 flat-rate airport transfers at George Bush Intercontinental (<a href="/houston-airport-transfers">IAH</a>) and William P. Hobby (<a href="/houston-airport-transfers">HOU</a>), <a href="/galveston-cruise-transportation">Galveston cruise port shuttles</a>, <a href="/corporate-chauffeur-houston">corporate travel</a> and <a href="/houston-wedding-limo">weddings</a> across Greater Houston — with flight tracking and zero surge pricing.</p>
  <p><a href="tel:+18325678050">Call (832) 567-8050</a> · <a href="/#booking-section">Book Online</a></p>
  <nav aria-label="Site">
    <ul>
      <li><a href="/services">Limo Services</a></li>
      <li><a href="/fleet">Luxury Fleet</a></li>
      <li><a href="/houston-airport-transfers">IAH &amp; Hobby Airport Transfers</a></li>
      <li><a href="/galveston-cruise-transportation">Galveston Cruise Transfers</a></li>
      <li><a href="/corporate-chauffeur-houston">Corporate Chauffeur</a></li>
      <li><a href="/houston-wedding-limo">Wedding Limo</a></li>
      <li><a href="/city-to-city-texas">City-to-City Texas</a></li>
      <li><a href="/rates">Rates &amp; Flat Pricing</a></li>
      <li><a href="/reviews">Customer Reviews</a></li>
      <li><a href="/faq">FAQ</a></li>
      <li><a href="/blog">Travel Blog</a></li>
    </ul>
  </nav>
  ${TRUST_LINKS}
</main>`;
writeFile(
  'index.html',
  buildPage({
    title: 'Houston Limo & Chauffeur Service | AvaLimo',
    description:
      'Luxury Houston limo and chauffeur service for IAH and Hobby airport rides, corporate travel, weddings and Galveston cruises. Flat rates, 24/7 dispatch.',
    canonical: `${SITE}/`,
    ogType: 'website',
    bodyHtml: homeBody,
  })
);

// ---- Blog index (canonical posts only) ----
const visiblePosts = posts
  .filter((post) => post.slug && !REDIRECTED_SLUGS.has(post.slug))
  .sort((a, b) => isoDate(b.date).localeCompare(isoDate(a.date)));
const indexBody = `
<main style="max-width:1200px;margin:0 auto;padding:96px 24px;">
  <h1 style="font-size:2.5rem;">Houston Travel Insights</h1>
  <p>Tips, guides and updates for airport transfers, cruise travel and luxury ground transportation in Houston.</p>
  <ul>
    ${visiblePosts
      .map(
        (p) =>
          `<li><a href="/blog/${p.slug}"><strong>${esc(p.title)}</strong></a> — ${esc(
            plainText(p.summary).slice(0, 140)
          )} <em>(${isoDate(p.date)})</em></li>`
      )
      .join('\n    ')}
  </ul>
  ${TRUST_LINKS}
</main>`;
writeFile(
  'blog/index.html',
  buildPage({
    title: 'Houston Travel & Chauffeur Blog | AvaLimo',
    description:
      'Guides and tips on Houston airport transfers, Galveston cruise travel, corporate chauffeur service and luxury ground transportation from AvaLimo Houston.',
    canonical: `${SITE}/blog`,
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'AvaLimo Houston Blog',
      url: `${SITE}/blog`,
      blogPost: visiblePosts.slice(0, 20).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE}/blog/${p.slug}`,
        datePublished: isoDate(p.date),
      })),
    },
    bodyHtml: indexBody,
  })
);

// ---- Each article ----
let count = 0;
for (const p of posts) {
  if (!p.slug || REDIRECTED_SLUGS.has(p.slug)) continue;
  const date = isoDate(p.date);
  const description = makeDescription(p.summary, p.content, p.title);
  const body = `
<article style="max-width:768px;margin:0 auto;padding:96px 24px;">
  <nav><a href="/blog">← All Articles</a></nav>
  <p><strong>${esc(p.cat || '')}</strong> · ${date} · ${esc(p.read || '')}</p>
  <h1 style="font-size:2.5rem;">${esc(p.title)}</h1>
  ${stripLeadingH1(rewriteContentLinks(p.content))}
  <div>
    <h2>Ready to ride in style?</h2>
    <p>Book your Houston chauffeur or airport transfer with AvaLimo — 24/7 dispatch, flat rates.</p>
    <p><a href="tel:+18325678050">Call (832) 567-8050</a> · <a href="/#booking-section">Book Online</a></p>
  </div>
  <nav aria-label="Related services">
    <h2>Plan your Houston ride</h2>
    <ul>
      <li><a href="/houston-airport-transfers">IAH &amp; Hobby airport transfers</a></li>
      <li><a href="/galveston-cruise-transportation">Galveston cruise port transfers</a></li>
      <li><a href="/corporate-chauffeur-houston">Corporate chauffeur service</a></li>
      <li><a href="/fleet">Our fleet and rates</a></li>
    </ul>
  </nav>
  ${TRUST_LINKS}
</article>`;
  writeFile(
    `blog/${p.slug}/index.html`,
    buildPage({
      title: fitTitle(p.title),
      description,
      canonical: `${SITE}/blog/${p.slug}`,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description,
        datePublished: date,
        dateModified: date,
        author: { '@type': 'Organization', name: 'AvaLimo Houston', url: SITE },
        publisher: {
          '@type': 'Organization',
          name: 'AvaLimo Houston',
          logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${p.slug}` },
        image: `${SITE}/og-image.jpg`,
        articleSection: p.cat || 'Travel',
        inLanguage: 'en-US',
      },
      bodyHtml: body,
    })
  );
  count++;
}

// ---- Service landing pages ----
let lcount = 0;
for (const pg of landing) {
  const sections = pg.sections.map((s) => `<section><h2>${esc(s.h2)}</h2>${s.body}</section>`).join('\n    ');
  const pageFaqs = pg.faqs.length
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
    ${pageFaqs}
    ${TRUST_LINKS}
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
  writeFile(
    `${pg.slug}/index.html`,
    buildPage({
      title: fitTitle(pg.title),
      description: truncate(pg.description, 158),
      canonical: `${SITE}/${pg.slug}`,
      ogType: 'website',
      jsonLd,
      bodyHtml: body,
    })
  );
  lcount++;
}

// ---- Core SPA routes ----
const CORE_ROUTES = [
  { slug: 'fleet', title: 'Luxury Fleet | Mercedes S-Class, Escalade | AvaLimo', desc: 'Houston luxury sedan & SUV fleet: Mercedes S-Class, Cadillac Escalade, Mercedes Sprinter. Black car service for airport transfers & events.', h1: 'Our Luxury Fleet' },
  { slug: 'services', title: 'Limo Services Houston | Airport & Corporate | AvaLimo', desc: 'Houston limo services: IAH & Hobby airport transfers, corporate car service, wedding limousine, prom, events. Luxury sedans, SUVs, Sprinters.', h1: 'Limo Services in Houston' },
  { slug: 'airport-galveston', title: 'Airport to Galveston Cruise Transfer | AvaLimo', desc: 'Reliable IAH & Hobby airport transfers to Galveston cruise port. Flight tracking, meet-and-greet, flat rates. Call (832) 567-8050.', h1: 'Airport to Galveston Cruise Transfers' },
  { slug: 'rates', title: 'Limo Rates & Flat Pricing Houston | AvaLimo', desc: 'Transparent flat-rate pricing for Houston airport transfers, hourly charters, weddings and Galveston cruise ports. No surge, no surprises.', h1: 'Rates & Flat Pricing' },
  { slug: 'reviews', title: 'Customer Reviews | AvaLimo Houston', desc: 'Read verified reviews from Houston travelers who rode with AvaLimo for airport transfers, weddings and corporate travel.', h1: 'Customer Reviews' },
  { slug: 'faq', title: 'FAQ | AvaLimo Houston Limo Service', desc: 'Answers on booking, pricing, flight tracking, car seats, cancellations and service area for AvaLimo Houston luxury transportation.', h1: 'Frequently Asked Questions' },
  { slug: 'end-of-trip-review', title: 'Review Your Trip | AvaLimo', desc: 'Rate your recent AvaLimo ride. Your feedback keeps our Houston chauffeur service five-star.', h1: 'Review Your Trip', noindex: true },
];
let ccount = 0;
for (const r of CORE_ROUTES) {
  const body = `
<main style="max-width:896px;margin:0 auto;padding:96px 24px;">
  <nav><a href="/">Home</a></nav>
  <h1 style="font-size:2.5rem;">${esc(r.h1)}</h1>
  <p>${esc(r.desc)}</p>
  <p><a href="tel:+18325678050">Call (832) 567-8050</a> · <a href="/#booking-section">Book Online</a></p>
  ${TRUST_LINKS}
</main>`;
  writeFile(
    `${r.slug}/index.html`,
    buildPage({
      title: fitTitle(r.title),
      description: r.desc,
      canonical: `${SITE}/${r.slug}`,
      noindex: r.noindex,
      ogType: 'website',
      bodyHtml: body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: r.h1,
          description: r.desc,
          url: `${SITE}/${r.slug}`,
          inLanguage: 'en-US',
          isPartOf: { '@type': 'WebSite', name: 'AvaLimo Houston', url: SITE },
        },
        ...(r.slug === 'faq'
          ? [
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map((f) => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: { '@type': 'Answer', text: f.answer },
                })),
              },
            ]
          : []),
      ],
    })
  );
  ccount++;
}

// ---- Trust pages ----
for (const page of TRUST_PAGES) {
  writeFile(
    `${page.slug}/index.html`,
    buildPage({
      title: fitTitle(page.title),
      description: page.description,
      canonical: `${SITE}/${page.slug}`,
      ogType: page.ogType,
      bodyHtml: `
<main style="max-width:896px;margin:0 auto;padding:96px 24px;">
  <nav><a href="/">Home</a> › ${esc(page.h1)}</nav>
  <h1 style="font-size:2.5rem;">${esc(page.h1)}</h1>
  ${page.body}
  ${TRUST_LINKS}
</main>`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': page.jsonLdType,
          name: page.h1,
          description: page.description,
          url: `${SITE}/${page.slug}`,
          inLanguage: 'en-US',
          isPartOf: { '@type': 'WebSite', name: 'AvaLimo Houston', url: SITE },
        },
      ],
    })
  );
}

// ---- Hand-written static landing pages: normalise their head ----
// These files live in public/ and are copied by Vite, so they bypass buildPage.
const STATIC_PAGES = [
  'iah-airport-limo-service',
  'hobby-airport-limo-service',
  'sugar-land-limo-service',
  'missouri-city-limo-service',
];
for (const slug of STATIC_PAGES) {
  const file = path.join(dist, slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const rawTitle = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const rawDesc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const title = fitTitle(decode(rawTitle));
  const description = truncate(decode(rawDesc), 158);
  const canonical = `${SITE}/${slug}`;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(description)}"`);
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`);
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${esc(title)}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(description)}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical}"`);
  // Structured data in these files still uses the old trailing-slash URLs.
  html = html.split(`${SITE}/${slug}/`).join(canonical);
  fs.writeFileSync(file, html);
}

// ---- Sitemap: canonical, indexable URLs only, with lastmod ----
const urlEntry = (loc, lastmod = BUILD_DATE) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
const urls = [urlEntry(`${SITE}/`)];
for (const page of TRUST_PAGES) urls.push(urlEntry(`${SITE}/${page.slug}`));
for (const r of CORE_ROUTES) if (!r.noindex) urls.push(urlEntry(`${SITE}/${r.slug}`));
for (const pg of landing) urls.push(urlEntry(`${SITE}/${pg.slug}`));
for (const slug of STATIC_PAGES) urls.push(urlEntry(`${SITE}/${slug}`));
urls.push(urlEntry(`${SITE}/blog`));
for (const p of visiblePosts) urls.push(urlEntry(`${SITE}/blog/${p.slug}`, isoDate(p.date)));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);

console.log(
  `✓ prerendered blog index + ${count} articles + ${lcount} landing pages + ${ccount} core routes + ${TRUST_PAGES.length} trust pages + ${redirectCount} redirects; sitemap ${urls.length} urls`
);
