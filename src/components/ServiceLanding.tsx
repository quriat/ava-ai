import React, { useEffect } from 'react';
import { ArrowRight, Phone, ChevronRight } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { COMPANY_INFO } from '../data/avalimoData';
import landingPages from '../data/landingPages.json';

const SITE = 'https://avalimo.net';

interface Section { h2: string; body: string; }
interface Faq { q: string; a: string; }
interface LandingPage {
  slug: string; serviceName: string; title: string; h1: string;
  description: string; intro: string; sections: Section[]; faqs: Faq[];
}

const PAGES = landingPages as LandingPage[];

export function landingSlugs(): string[] {
  return PAGES.map(p => p.slug);
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
  el.setAttribute('href', href);
}
function setJsonLd(id: string, data: object | null) {
  const ex = document.getElementById(id); if (ex) ex.remove();
  if (!data) return;
  const s = document.createElement('script'); s.type = 'application/ld+json'; s.id = id;
  s.textContent = JSON.stringify(data); document.head.appendChild(s);
}

const ServiceLanding: React.FC = () => {
  const slug = window.location.pathname.replace(/^\//, '').replace(/\/+$/, '');
  const page = PAGES.find(p => p.slug === slug);

  useEffect(() => {
    if (!page) return;
    const url = `${SITE}/${page.slug}`;
    document.title = page.title;
    setMeta('description', page.description);
    setCanonical(url);
    setMeta('og:title', page.title, 'property');
    setMeta('og:description', page.description, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:title', page.title);
    setMeta('twitter:description', page.description);
    setJsonLd('ld-service', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: page.serviceName,
      name: page.h1,
      description: page.description,
      url,
      areaServed: { '@type': 'AdministrativeArea', name: 'Greater Houston Metropolitan Area, Texas' },
      provider: { '@type': 'LimousineService', name: 'AvaLimo Houston', telephone: '+18325678050', url: SITE },
    });
    setJsonLd('ld-faq', page.faqs.length ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map(f => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    } : null);
    return () => { setJsonLd('ld-service', null); setJsonLd('ld-faq', null); };
  }, [page]);

  if (!page) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Page not found</h1>
          <a href="/" className="text-[var(--gold)] font-bold uppercase tracking-wider text-sm">← Home</a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <nav className="flex items-center gap-1 text-xs text-white/40 mb-8">
          <a href="/" className="hover:text-[var(--gold)]">Home</a>
          <ChevronRight size={12} />
          <span className="text-white/70">{page.serviceName}</span>
        </nav>
        <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">AvaLimo Houston</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">{page.h1}</h1>
        <p className="text-white/70 text-lg leading-relaxed mb-10">{page.intro}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="inline-flex items-center justify-center gap-2 border-2 border-gold/40 text-[var(--gold)] px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase hover:bg-[var(--gold)] hover:text-black transition-all">
            <Phone size={14} /> Call {COMPANY_INFO.phone}
          </a>
          <a href="/#booking-section" className="inline-flex items-center justify-center gap-2 gold-gradient text-black px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase">
            Book Online <ArrowRight size={14} />
          </a>
        </div>

        <div className="space-y-12">
          {page.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">{s.h2}</h2>
              <div
                className="text-white/75 leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-white/75 [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: s.body }}
              />
            </section>
          ))}
        </div>

        {page.faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {page.faqs.map((f, i) => (
                <div key={i} className="border-b border-white/10 pb-5">
                  <h3 className="text-white font-bold mb-2">{f.q}</h3>
                  <p className="text-white/65 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 p-8 rounded-2xl bg-luxury border border-gold/20 text-center">
          <h2 className="text-xl font-serif font-bold text-white mb-3">Book your {page.serviceName.toLowerCase()} today</h2>
          <p className="text-white/60 text-sm mb-6">24/7 dispatch across Greater Houston. Flat rates, professional chauffeurs.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="inline-flex items-center justify-center gap-2 border-2 border-gold/40 text-[var(--gold)] px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase hover:bg-[var(--gold)] hover:text-black transition-all">
              <Phone size={14} /> Call {COMPANY_INFO.phone}
            </a>
            <a href="/#booking-section" className="inline-flex items-center justify-center gap-2 gold-gradient text-black px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase">
              Book Online <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceLanding;
