import { useState } from 'react';
import { Menu, X, Phone, CreditCard } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';

const navItems = [
  { label: 'Home', id: 'hero' },
  { label: 'Travel Modes', id: 'options' },
  { label: 'Official Fleet', id: 'fleet' },
  { label: 'Flat Rates', id: 'rates' },
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
      <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-black font-extrabold text-xs py-2 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-3 flex-wrap">
        <span>AI Voice Concierge Active 24/7</span>
        <span className="hidden md:inline">•</span>
        <span>Instant Checkout via Square Payments</span>
        <span className="hidden md:inline">•</span>
        <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="underline hover:text-white transition-colors font-black">
          {COMPANY_INFO.phone}
        </a>
      </div>

      <header className="sticky top-0 z-50 bg-dark-950/95 backdrop-blur-md border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full border-2 border-gold-500 flex items-center justify-center bg-dark-900 text-gold-400 font-serif font-bold text-2xl gold-glow transition-transform group-hover:scale-105">
              A
            </div>
            <div className="text-left">
              <span className="font-serif text-2xl font-extrabold tracking-wider text-white group-hover:text-gold-400 transition-colors block leading-none">
                AVALIMO
              </span>
              <span className="block text-[9px] tracking-widest text-gold-400 uppercase font-bold mt-1">
                Houston Luxury Chauffeur
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-300">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="hover:text-gold-400 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-gold-400 hover:text-white transition-colors px-3 py-2 rounded-lg border border-gold-500/30 bg-gold-500/10"
            >
              <Phone size={14} />
              <span>{COMPANY_INFO.phone}</span>
            </a>
            <button
              onClick={() => scrollTo('booking-section')}
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-full transition-all duration-300 shadow-lg shadow-gold-500/20 transform hover:scale-105 flex items-center gap-2"
            >
              <CreditCard size={14} />
              <span>Book &amp; Pay</span>
            </button>
            <button className="lg:hidden text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden fixed inset-0 top-[80px] bg-black/98 z-40 flex flex-col items-center justify-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-xl font-serif text-white/80 hover:text-gold-400 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="text-lg text-gold-400 font-semibold mt-4">
              {COMPANY_INFO.phone}
            </a>
            <button
              onClick={() => scrollTo('booking-section')}
              className="bg-gradient-to-r from-gold-500 to-gold-600 text-black font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-full"
            >
              Book &amp; Pay
            </button>
          </div>
        )}
      </header>
    </>
  );
}