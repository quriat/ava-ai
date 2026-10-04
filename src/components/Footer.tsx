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
    <footer id="contact" className="py-16 bg-black text-center border-t border-gold-500/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="font-serif text-2xl font-bold text-white mb-2">{COMPANY_INFO.name}</h3>
        <p className="text-slate-400 text-xs mb-6">
          {COMPANY_INFO.legalName} • {COMPANY_INFO.address}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs text-gold-400 font-bold mb-6">
          <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="hover:text-white transition-colors flex items-center gap-1.5">
            <Phone size={12} /> {COMPANY_INFO.phone}
            <span className="text-slate-500 font-semibold">(Human Dispatch)</span>
          </a>
          <a href={`tel:${COMPANY_INFO.aiConciergePhoneRaw}`} className="hover:text-white transition-colors flex items-center gap-1.5">
            <Phone size={12} /> {COMPANY_INFO.aiConciergePhone}
            <span className="text-slate-500 font-semibold">(AI Concierge)</span>
          </a>
          <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-white transition-colors flex items-center gap-1.5">
            <Mail size={12} /> {COMPANY_INFO.email}
          </a>
          <a
            href="https://g.page/r/CVgUaFV7t4-8EBM/review"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Star size={12} /> Google Review Link
          </a>
        </div>
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[11px] text-slate-500 font-semibold mb-8">
          {SERVICE_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-gold-400 transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="text-[11px] text-slate-600">
          &copy; {new Date().getFullYear()} AvaLimo Houston. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;