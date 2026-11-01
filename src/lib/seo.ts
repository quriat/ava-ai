/**
 * Shared SEO helpers for client-side rendering.
 *
 * The prerender script (`scripts/prerender.mjs`) writes the canonical head for
 * every page. These helpers keep SPA navigation consistent with it:
 * - the same title rule (<= 60 characters, brand suffix only when it fits)
 * - descriptions derived from the summary or the article body
 * - legacy/broken links rewritten before article HTML is injected
 * - duplicate and misspelled slugs hidden from listings
 */

/** Blog slugs that redirect to a canonical article (kept out of listings). */
export const REDIRECTED_SLUGS: ReadonlySet<string> = new Set([
  'luxury-transportation-houston-availimo',
  'luxury-transportation-houston-avalimo',
  'why-choose-availimo-houston-luxury-transportation',
  'why-choose-avalimo-houston-luxury-transportation',
  'choose-avalimo-luxury-transportation-houston',
  'luxury-travel-houston-availimo',
]);

const decode = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

export const plainText = (html = '') =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (text: string, max: number) => {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const boundary = cut.lastIndexOf(' ');
  return (boundary > max * 0.6 ? cut.slice(0, boundary) : cut).replace(/[\s,;:.\-–—]+$/, '');
};

/** Title tag <= 60 characters, matching the prerendered title. */
export const fitTitle = (title: string) => {
  const clean = String(title || '').replace(/\s+/g, ' ').trim();
  const suffix = ' | AvaLimo';
  if (clean.length <= 60 - suffix.length) return `${clean}${suffix}`;
  if (clean.length <= 60) return clean;
  const head = clean.split(/\s*[:|—–]\s*/)[0].trim();
  if (head.length >= 25 && head.length + suffix.length <= 60) return `${head}${suffix}`;
  return truncate(clean.split('|')[0], 59);
};

/** 110-158 character description, derived from the body when the summary is unusable. */
export const descriptionFrom = (summary: string, content: string) => {
  const cleanSummary = plainText(summary);
  if (cleanSummary.length >= 110 && cleanSummary.length <= 158) return cleanSummary;
  if (cleanSummary.length > 158) return truncate(cleanSummary, 158);
  const body = plainText(content);
  const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean);
  const derived = truncate(sentences.slice(0, 2).join(' '), 158);
  if (derived.length >= 60) return derived;
  if (cleanSummary.length >= 60) return cleanSummary;
  return truncate(body || 'AvaLimo Houston chauffeur and airport transfer service.', 158);
};

/** Rewrite legacy/dead links in article HTML before rendering. */
export const sanitizeArticleHtml = (html: string) =>
  String(html || '')
    .replace(/href="\/book"/g, 'href="/#booking-section"')
    .replace(/href="\/contact"/g, 'href="/contact"')
    .replace(/href="http:\/\/avalimo\.net/g, 'href="https://avalimo.net')
    .replace(/href="https:\/\/www\.avalimo\.net/g, 'href="/')
    .replace(/href="https:\/\/avalimo\.net\/?"/g, 'href="/"')
    .replace(/href="\/blog\/luxury-limo-services-houston"/g, 'href="/services"')
    .replace(/<h1([^>]*)>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');
