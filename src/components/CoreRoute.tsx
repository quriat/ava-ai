import React, { useEffect } from 'react';
import { ArrowRight, ChevronRight, Phone } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import StickyCallBar from './StickyCallBar';
import Fleet from './Fleet';
import Rates from './Rates';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import EndTripReview from './EndTripReview';
import BookingForm from './BookingForm';
import Corporate from './Corporate';
import Sienna from './Sienna';
import { COMPANY_INFO } from '../data/avalimoData';
import landingPages from '../data/landingPages.json';

const SITE = 'https://avalimo.net';

interface LandingPage {
  slug: string;
  serviceName: string;
  h1: string;
  description: string;
  intro: string;
}

const LANDING = landingPages as LandingPage[];

interface CoreRouteDef {
  h1: string;
  title: string;
  description: string;
  crumb: string;
  // Landing-page slugs surfaced as a hub when there is no dedicated section.
  hubs?: string[];
  section?: 'fleet' | 'rates' | 'reviews' | 'faq' | 'review' | 'corporate' | 'sienna';
}

// Mirrors CORE_ROUTES in scripts/prerender.mjs. Both must stay in sync or the
// client-rendered page and the prerendered HTML will disagree.
export const CORE_ROUTES: Record<string, CoreRouteDef> = {
  fleet: {
    h1: 'Our Luxury Fleet',
    title: 'Luxury Fleet | Mercedes S-Class, Escalade | AvaLimo',
    description:
      'Houston luxury sedan & SUV fleet: Mercedes S-Class, Cadillac Escalade, Mercedes Sprinter. Black car service for airport transfers & events.',
    crumb: 'Fleet',
    section: 'fleet',
  },
  services: {
    h1: 'Limo Services in Houston',
    title: 'Limo Services Houston | Airport & Corporate | AvaLimo',
    description:
      'Houston limo services: IAH & Hobby airport transfers, corporate car service, wedding limousine, prom, events. Luxury sedans, SUVs, Sprinters.',
    crumb: 'Services',
    hubs: ['houston-airport-transfers', 'galveston-cruise-transportation', 'corporate-chauffeur-houston', 'houston-wedding-limo', 'city-to-city-texas'],
  },
  'airport-galveston': {
    h1: 'Airport to Galveston Cruise Transfers',
    title: 'Airport to Galveston Cruise Transfer | AvaLimo',
    description:
      'Reliable IAH & Hobby airport transfers to Galveston cruise port. Flight tracking, meet-and-greet, flat rates. Call (832) 567-8050.',
    crumb: 'Airport & Galveston',
    hubs: ['houston-airport-transfers', 'galveston-cruise-transportation'],
  },
  rates: {
    h1: 'Rates & Flat Pricing',
    title: 'Limo Rates & Flat Pricing Houston | AvaLimo',
    description:
      'Transparent flat-rate pricing for Houston airport transfers, hourly charters, weddings and Galveston cruise ports. No surge, no surprises.',
    crumb: 'Rates',
    section: 'rates',
  },
  reviews: {
    h1: 'Customer Reviews',
    title: 'Customer Reviews | AvaLimo Houston',
    description:
      'Read verified reviews from Houston travelers who rode with AvaLimo for airport transfers, weddings and corporate travel.',
    crumb: 'Reviews',
    section: 'reviews',
  },
  faq: {
    h1: 'Frequently Asked Questions',
    title: 'FAQ | AvaLimo Houston Limo Service',
    description:
      'Answers on booking, pricing, flight tracking, car seats, cancellations and service area for AvaLimo Houston luxury transportation.',
    crumb: 'FAQ',
    section: 'faq',
  },
  'end-of-trip-review': {
    h1: 'Review Your Trip',
    title: 'Review Your Trip | AvaLimo',
    description:
      'Rate your recent AvaLimo ride. Your feedback keeps our Houston chauffeur service five-star.',
    crumb: 'Review',
    section: 'review',
  },
  corporate: {
    h1: 'Corporate Accounts & Business Travel',
    title: 'Corporate Car Service Houston | Business Accounts | AvaLimo',
    description:
      'AvaLimo corporate accounts: executive airport transfers, client pickups, and roadshows with a dedicated dispatch line, monthly billing, flat rates, and zero surge. Call (832) 567-8050 to set up your account.',
    crumb: 'Corporate',
    section: 'corporate',
  },
  sienna: {
    h1: 'Sienna Plantation Chauffeur & Airport Car Service',
    title: 'Sienna Plantation Limo & Airport Transfers | AvaLimo',
    description:
      'Sienna Plantation luxury car service: IAH & Hobby airport transfers, Astros/Texans games, concerts, weddings. Your Sienna neighbor with flat rates, no surge. Call (832) 567-8050.',
    crumb: 'Sienna',
    section: 'sienna',
  },
};

export function coreSlugs(): string[] {
  return Object.keys(CORE_ROUTES);
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: object | null) {
  const ex = document.getElementById(id);
  if (ex) ex.remove();
  if (!data) return;
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id = id;
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

function CtaRow() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={`tel:${COMPANY_INFO.phoneRaw}`}
        className="inline-flex items-center justify-center gap-2 border-2 border-gold/40 text-[var(--gold)] px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase hover:bg-[var(--gold)] hover:text-black transition-all"
      >
        <Phone size={14} /> Call {COMPANY_INFO.phone}
      </a>
      <a
        href="/#booking-section"
        className="inline-flex items-center justify-center gap-2 gold-gradient text-black px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase"
      >
        Book Online <ArrowRight size={14} />
      </a>
    </div>
  );
}

const CoreRoute: React.FC = () => {
  const slug = window.location.pathname.replace(/^\//, '').replace(/\/+$/, '');
  const route = CORE_ROUTES[slug];
  const hubs = (route?.hubs || []).map((s) => LANDING.find((p) => p.slug === s)).filter(Boolean) as LandingPage[];

  useEffect(() => {
    if (!route) return;
    const url = `${SITE}/${slug}`;
    document.title = route.title;
    setMeta('description', route.description);
    setCanonical(url);
    setMeta('og:title', route.title, 'property');
    setMeta('og:description', route.description, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:title', route.title);
    setMeta('twitter:description', route.description);
    setJsonLd('ld-core', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: route.h1,
      description: route.description,
      url,
      inLanguage: 'en-US',
      isPartOf: { '@type': 'WebSite', name: 'AvaLimo Houston', url: SITE },
    });
    return () => setJsonLd('ld-core', null);
  }, [slug, route]);

  if (!route) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Page not found</h1>
          <a href="/" className="text-[var(--gold)] font-bold uppercase tracking-wider text-sm">
            &larr; Home
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
          <nav className="flex items-center gap-1 text-xs text-white/40 mb-8">
            <a href="/" className="hover:text-[var(--gold)]">
              Home
            </a>
            <ChevronRight size={12} />
            <span className="text-white/70">{route.crumb}</span>
          </nav>
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            AvaLimo Houston
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">{route.h1}</h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8">{route.description}</p>
          {route.section !== 'review' && <CtaRow />}
        </div>

        {route.section === 'fleet' && <Fleet />}
        {route.section === 'rates' && <Rates />}
        {route.section === 'reviews' && <Testimonials />}
        {route.section === 'faq' && <FAQ />}
        {route.section === 'review' && <EndTripReview />}
        {route.section === 'corporate' && <Corporate />}
        {route.section === 'sienna' && <Sienna />}

        {hubs.length > 0 && (
          <section className="py-20 bg-dark-950 border-t border-gold-500/10">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-serif font-bold text-white mb-10">Explore our services</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {hubs.map((p) => (
                  <a
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="group bg-luxury border border-gold/10 rounded-2xl p-6 hover:border-[var(--gold)] transition-colors"
                  >
                    <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-[var(--gold)]">
                      {p.serviceName}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">{p.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {route.section !== 'review' && <BookingForm />}
      </main>
      <Footer />
      <StickyCallBar />
    </div>
  );
};

export default CoreRoute;
