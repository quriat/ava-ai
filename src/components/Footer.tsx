import React from 'react';
import { COMPANY_INFO } from '../data/avalimoData';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="w-full bg-luxury border-t border-gold/10 pt-20 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <span className="text-2xl font-serif font-bold tracking-[0.15em] text-white block mb-4">
              AVALIMO
            </span>
            <p className="text-white/60 max-w-md mb-6 leading-relaxed">
              Houston's premier luxury chauffeur service since 2013. Airport transfers, corporate travel, weddings, Galveston cruises, and special events — 24/7 with zero surge pricing.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[var(--gold)] text-[11px] font-bold tracking-[0.2em] uppercase mb-6">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>Airport Transfers (IAH / HOU)</li>
              <li>Galveston Cruise Transfers</li>
              <li>Corporate & Executive Travel</li>
              <li>Weddings & Special Events</li>
              <li>Hourly As-Directed Charters</li>
              <li>City-to-City Texas Travel</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--gold)] text-[11px] font-bold tracking-[0.2em] uppercase mb-6">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="flex items-center gap-2 hover:text-[var(--gold)] transition-colors">
                  <Phone size={16} />
                  {COMPANY_INFO.phone}
                </a>
              </li>
              <li>
                <a href={`tel:${COMPANY_INFO.secondaryPhone.replace(/\D/g, '')}`} className="flex items-center gap-2 hover:text-[var(--gold)] transition-colors">
                  <Phone size={16} />
                  {COMPANY_INFO.secondaryPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-2 hover:text-[var(--gold)] transition-colors">
                  <Mail size={16} />
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                {COMPANY_INFO.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-white/40 tracking-widest uppercase text-center md:text-left">
            &copy; {new Date().getFullYear()} {COMPANY_INFO.legalName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-[11px] text-white/40">
            <button className="hover:text-[var(--gold)] transition-colors">Privacy Policy</button>
            <button className="hover:text-[var(--gold)] transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
