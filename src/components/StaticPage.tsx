import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { fitTitle } from '../lib/seo';

const SITE = 'https://avalimo.net';

interface TrustPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  body: string;
}

/** Static trust pages (/about, /contact, /privacy-policy, /terms). */
const StaticPage: React.FC<{ page: TrustPage }> = ({ page }) => {
  useEffect(() => {
    const title = fitTitle(page.title);
    const description = page.description;
    const canonical = `${SITE}/${page.slug}`;
    document.title = title;

    const meta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    const link = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    meta('description', description);
    meta('og:title', title, 'property');
    meta('og:description', description, 'property');
    meta('og:url', canonical, 'property');
    meta('twitter:title', title);
    meta('twitter:description', description);
    link('canonical', canonical);
  }, [page]);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 antialiased">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <nav className="mb-8 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <a href="/" className="hover:text-gold-400 transition-colors">Home</a>
          <span className="mx-2">›</span>
          <span className="text-gold-400">{page.h1}</span>
        </nav>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
          {page.h1}
        </h1>
        <article
          className="page-content text-white/75 leading-relaxed [&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-white/75 [&_strong]:text-white [&_a]:text-[var(--gold)]"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </main>
      <Footer />
    </div>
  );
};

export default StaticPage;
