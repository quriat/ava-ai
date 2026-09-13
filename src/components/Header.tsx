import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';

const navItems = [
  { label: 'Home', id: 'hero' },
  { label: 'Fleet', id: 'fleet' },
  { label: 'Services', id: 'services' },
  { label: 'Airport & Galveston', id: 'airport-galveston' },
  { label: 'Rates', id: 'rates' },
  { label: 'End of Trip Review', id: 'review' },
  { label: 'Reviews', id: 'testimonials' },
  { label: 'Blog', id: 'blog' },
  { label: 'FAQ', id: 'faq' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.92)' : 'rgba(10, 10, 10, 0.45)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(197, 160, 89, 0.15)' : '1px solid rgba(197, 160, 89, 0.05)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-[70px] flex items-center justify-between">
        <button onClick={() => scrollTo('hero')} className="font-serif text-lg tracking-[0.15em] text-white font-semibold flex flex-col items-start leading-none">
          <span>AVALIMO</span>
          <span className="text-[8px] tracking-[0.4em] text-[var(--gold)] font-normal mt-0.5">HOUSTON • SINCE 2008</span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="relative nav-link text-[11px] font-semibold tracking-[0.12em] uppercase text-white/70 hover:text-[var(--gold)] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="flex items-center gap-2 text-sm font-semibold text-[var(--gold)]">
            <Phone size={14} />
            {COMPANY_INFO.phone}
          </a>
          <button
            onClick={() => scrollTo('booking')}
            className="gold-gradient text-black px-5 py-2 rounded-full text-[10px] font-extrabold tracking-[0.15em] uppercase hover:scale-105 transition-transform"
          >
            Book Now
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-[70px] bg-black/98 z-40 flex flex-col items-center justify-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-xl font-serif text-white/80 hover:text-[var(--gold)] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="text-lg text-[var(--gold)] font-semibold mt-4">
            {COMPANY_INFO.phone}
          </a>
        </div>
      )}
    </header>
  );
}
