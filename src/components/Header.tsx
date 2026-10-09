import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';

const navItems = [
  { label: 'Fleet', id: 'fleet' },
  { label: 'Services', id: 'options' },
  { label: 'Flat Rates', id: 'rates' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'Blog', id: 'blog' },
  { label: 'FAQ', id: 'faqs' },
  { label: 'Sienna', href: '/sienna' },
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
      <div className="bg-ink border-b border-gold/15 text-[10px] tracking-[0.25em] uppercase">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center text-white/50">
          <span className="hidden sm:inline">24/7 Dispatch · Houston, TX</span>
          <span className="sm:hidden">24/7 Dispatch</span>
          <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="text-gold font-semibold tracking-widest">
            {COMPANY_INFO.phone}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gold/60 flex items-center justify-center bg-ink text-gold font-serif font-bold text-xl sm:text-2xl transition-transform group-hover:scale-105">
              A
            </div>
            <div className="text-left">
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-white block leading-none">
                AVA<span className="text-gold">LIMO</span>
              </span>
              <span className="block text-[8px] sm:text-[9px] tracking-[0.3em] text-gold/70 uppercase mt-1">
                Houston Luxury Chauffeur
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            {navItems.map((item) =>
              item.href ? (
                <a key={item.label} href={item.href} className="hover:text-gold transition-colors">
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id!)}
                  className="hover:text-gold transition-colors"
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              aria-label={`Call AvaLimo now at ${COMPANY_INFO.phone}`}
              className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full border border-gold/40 bg-gold/10 text-gold"
            >
              <Phone size={18} />
            </a>
            <button
              onClick={() => scrollTo('booking-section')}
              className="btn-gold font-bold text-[11px] uppercase tracking-[0.15em] px-5 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-lg"
            >
              Book Now
            </button>
            <button className="lg:hidden text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden fixed inset-0 top-[104px] bg-ink/98 z-40 flex flex-col items-center justify-center gap-8">
            {navItems.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-xl font-serif text-white/80 hover:text-gold transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id!)}
                  className="text-xl font-serif text-white/80 hover:text-gold transition-colors"
                >
                  {item.label}
                </button>
              )
            )}
            <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="text-lg text-gold font-semibold mt-4">
              {COMPANY_INFO.phone}
            </a>
            <button
              onClick={() => scrollTo('booking-section')}
              className="btn-gold font-bold text-xs uppercase tracking-[0.2em] px-8 py-3 rounded-full"
            >
              Book Now
            </button>
          </div>
        )}
      </header>
    </>
  );
}
