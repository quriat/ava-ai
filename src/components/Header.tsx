import { useState } from 'react';
import { Menu, X, Phone, CreditCard } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';

const navItems = [
  { label: 'Home', id: 'hero' },
  { label: 'Travel Modes', id: 'options' },
  { label: 'Official Fleet', id: 'fleet' },
  { label: 'Flat Rates', id: 'rates' },
  { label: 'AI Concierge', id: 'ai-concierge' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'Blog', id: 'blog' },
  { label: 'FAQ', id: 'faqs' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // Section does not exist on this route, so fall back to the homepage anchor.
    window.location.href = `/#${id}`;
  };

  return (
    <>
      <div className="bg-dark-900 border-b border-champagne text-slate-300 font-semibold text-[10px] sm:text-xs py-2 px-3 sm:px-4 text-center tracking-wider uppercase flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
        <span className="flex items-center text-[var(--gold)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
          24/7 Houston Chauffeur &amp; Airport Dispatch
        </span>
        <span className="hidden sm:inline text-slate-600">•</span>
        <span className="text-slate-300">Flight-Tracked Pickups at IAH &amp; Hobby</span>
        <span className="hidden sm:inline text-slate-600">•</span>
        <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="text-gold-400 hover:text-white transition-colors font-bold underline">
          Call {COMPANY_INFO.phone}
        </a>
      </div>

      <header className="sticky top-0 z-50 bg-dark-950/95 backdrop-blur-md border-b border-champagne">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-champagne flex items-center justify-center bg-dark-900 text-gold-400 font-serif font-bold text-xl sm:text-2xl gold-glow transition-transform group-hover:scale-105">
              A
            </div>
            <div className="text-left">
              <span className="font-serif text-xl sm:text-2xl font-extrabold tracking-wider text-white group-hover:text-gold-400 transition-colors block leading-none">
                AVALIMO
              </span>
              <span className="block text-[8px] sm:text-[9px] tracking-widest text-gold-400 uppercase font-bold mt-1">
                Houston Luxury Chauffeur
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="hover:text-gold-400 transition-colors nav-link relative py-1"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-gold-400 hover:text-white transition-colors px-3.5 py-2 rounded-full border border-champagne bg-dark-900/80"
            >
              <Phone size={14} />
              <span>{COMPANY_INFO.phone}</span>
            </a>
            <button
              onClick={() => scrollTo('booking-section')}
              className="gold-gradient text-black font-extrabold text-[10px] sm:text-xs uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all duration-300 shadow-md shadow-gold/15 transform hover:scale-105 flex items-center gap-1.5 sm:gap-2"
            >
              <CreditCard size={14} />
              <span>Book Ride</span>
            </button>
            <button className="lg:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden fixed inset-0 top-[80px] bg-dark-950/98 z-40 flex flex-col items-center justify-center gap-6 p-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-lg font-serif text-white/90 hover:text-gold-400 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="text-base text-gold-400 font-bold mt-2">
              Call {COMPANY_INFO.phone}
            </a>
            <button
              onClick={() => scrollTo('booking-section')}
              className="gold-gradient text-black font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full mt-2"
            >
              Book Ride
            </button>
          </div>
        )}
      </header>
    </>
  );
}