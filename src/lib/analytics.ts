// Analytics for avalimo.net. GA4 for numbers, Microsoft Clarity for free session
// recordings. Both are opt-in: with no IDs configured every function is a no-op,
// so a build without secrets still works and sends nothing.
//
// Never send PII. No names, emails, phone numbers, addresses or flight numbers
// leave this module. GA4 terms prohibit it and Clarity records the DOM.

type ParamValue = string | number | boolean | undefined;
type Params = Record<string, ParamValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const PII_KEYS = new Set([
  'name', 'email', 'phone', 'address', 'pickup', 'dropoff',
  'flightnumber', 'flight', 'specialinstructions', 'note', 'message',
]);

let gaId = '';
let clarityId = '';
let initialised = false;

function clean(params: Params = {}): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (PII_KEYS.has(k.toLowerCase())) continue;
    out[k] = v;
  }
  return out;
}

function gtag(...args: unknown[]) {
  if (window.gtag) window.gtag(...args);
}

function clarity(...args: unknown[]) {
  if (window.clarity) window.clarity(...args);
}

export function initAnalytics(ga?: string, clarityProjectId?: string): void {
  gaId = (ga || '').trim();
  clarityId = (clarityProjectId || '').trim();
  if (initialised) return;
  initialised = true;

  if (gaId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtagShim(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: false, anonymize_ip: true });
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
  }

  if (clarityId) {
    // Official Microsoft Clarity loader: install the queue shim, then load the
    // tag for this project id. Clarity's own snippet does exactly this, so the
    // shim has to exist before the tag script runs.
    window.clarity = function clarityShim(...args: unknown[]) {
      const c = window.clarity as unknown as { q?: unknown[] };
      c.q = c.q || [];
      c.q.push(args);
    };

    // Session replay records the DOM, so every field this site collects is PII:
    // rider name, email, phone, addresses and flight numbers. Mask all of them
    // rather than relying on Clarity's heuristics for individual field types.
    window.clarity('set', 'privacy', { mask: ['input', 'textarea', 'select'] });

    const s = document.createElement('script');
    s.id = 'clarity-script';
    s.async = true;
    s.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}`;
    const first = document.getElementsByTagName('script')[0];
    if (first && first.parentNode) first.parentNode.insertBefore(s, first);
    else document.head.appendChild(s);
  }
}

function injectScript(src: string, onLoad?: () => void): void {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  if (onLoad) s.addEventListener('load', onLoad);
  document.head.appendChild(s);
}

export function isAnalyticsActive(): boolean {
  return Boolean(gaId || clarityId);
}

export function trackPageView(path: string, title?: string): void {
  const p = clean({ page_path: path, page_title: title || document.title });
  if (gaId) {
    gtag('event', 'page_view', p);
    gtag('set', { page_path: path });
  }
  if (clarityId) clarity('set', 'page', path);
}

export function trackEvent(name: string, params: Params = {}): void {
  const p = clean(params);
  if (gaId) gtag('event', name, p);
  if (clarityId) clarity('event', { name, ...p });
}

// One delegated listener catches all tel:, sms: and wa.me links, of which there
// are 22 across the site, instead of instrumenting each component.
const OUTBOUND: { match: RegExp; method: string }[] = [
  { match: /^tel:/i, method: 'call' },
  { match: /^sms:/i, method: 'sms' },
  { match: /^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i, method: 'whatsapp' },
];

export function trackOutboundClicks(): () => void {
  const handler = (e: MouseEvent) => {
    const anchor = (e.target as HTMLElement | null)?.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    const hit = OUTBOUND.find((o) => o.match.test(href));
    if (!hit) return;
    let placement = 'unknown';
    try {
      const path = window.location.pathname.replace(/^\/|\/$/g, '');
      placement = path || 'home';
    } catch {
      /* ignore */
    }
    trackEvent('outbound_click', { method: hit.method, placement, label: (anchor.textContent || '').trim().slice(0, 40) });
  };
  document.addEventListener('click', handler, true);
  return () => document.removeEventListener('click', handler, true);
}
