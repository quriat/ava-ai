import React from 'react';
import { COMPANY_INFO } from '../data/avalimoData';
import { Phone, Mail, Star } from 'lucide-react';

const SERVICE_LINKS = [
  { label: 'Airport Transfers (IAH / HOU)', href: '/houston-airport-transfers' },
  { label: 'Galveston Cruise Transfers', href: '/galveston-cruise-transportation' },
  { label: 'Corporate & Executive Travel', href: '/corporate-chauffeur-houston' },
  { label: 'Weddings & Special Events', href: '/houston-wedding-limo' },
  { label: 'City-to-City Texas Travel', href: '/city-to-city-texas' },
  { label: 'Houston Travel Blog', href: '/blog' },
];

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="border-t border-white/10 bg-ink">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <div className="font-serif text-2xl mb-4">
            AVA<span className="text-gold">LIMO</span>
          </div>
          <p className="text-white/40 text-sm max-w-xs font-light leading-relaxed">
            Houston's luxury chauffeur service. Airport, corporate, weddings — done right.
          </p>
          <p className="text-white/30 text-xs mt-4">
            {COMPANY_INFO.legalName} · {COMPANY_INFO.address}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-5">Contact</p>
          <div className="space-y-3 text-sm text-white/60">
            <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="flex items-center gap-2 hover:text-gold transition-colors">
              <Phone size={14} className="text-gold" /> {COMPANY_INFO.phone}
              <span className="text-white/30 text-xs">(Human Dispatch)</span>
            </a>
            <a href={`tel:${COMPANY_INFO.aiConciergePhoneRaw}`} className="flex items-center gap-2 hover:text-gold transition-colors">
              <Phone size={14} className="text-gold" /> {COMPANY_INFO.aiConciergePhone}
              <span className="text-white/30 text-xs">(AI Concierge)</span>
            </a>
            <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-2 hover:text-gold transition-colors">
              <Mail size={14} className="text-gold" /> {COMPANY_INFO.email}
            </a>
            <a
              href="https://g.page/r/CVgUaFV7t4-8EBM/review"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-gold transition-colors"
            >
              <Star size={14} className="text-gold" /> Google Review Link
            </a>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-5">Explore</p>
          <nav className="grid gap-3 text-sm text-white/50">
            {SERVICE_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-gold transition-colors">
                {link.label}
              </a>
            ))}
            <a href="/sienna" className="hover:text-gold transition-colors text-gold/80">
              Sienna Plantation →
            </a>
          </nav>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-white/25 text-[11px] tracking-[0.25em] uppercase">
        © {new Date().getFullYear()} AvaLimo · Houston, TX
      </div>
    </footer>
  );
};

export default Footer;
