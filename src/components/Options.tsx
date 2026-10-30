import React from 'react';
import { Check, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

interface OptionsProps {
  onSelect?: (route: 'iah' | 'galveston') => void;
}

const Options: React.FC<OptionsProps> = ({ onSelect }) => {
  return (
    <section id="options" className="py-20 bg-dark-900/60 border-t border-b border-champagne">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest mb-3">
            <Sparkles size={12} className="text-[var(--gold)]" />
            <span>Dual Travel Pathways</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Tailored Luxury Journeys
          </h2>
          <p className="text-slate-300 text-sm">Select the service that matches your destination today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl glass-panel-hover border-champagne relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full pointer-events-none"></div>
            <div>
              <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-400 text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">
                Executive &amp; Airport
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">Relentless Punctuality</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Designed for executives, business travelers, and flight departures. Live flight status tracking, 15-minute early arrival guarantee, and whisper-quiet mobile office interiors.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[var(--gold)] flex-shrink-0" /> IAH &amp; HOU Airport Transfers with Baggage Meet &amp; Greet
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[var(--gold)] flex-shrink-0" /> Energy Corridor, Galleria &amp; Downtown Roadshows
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[var(--gold)] flex-shrink-0" /> Cadillac Escalade ESV &amp; Mercedes S-Class
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onSelect?.('iah')}
              className="w-full py-3.5 rounded-full gold-gradient text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-gold/10 hover:scale-[1.02] flex items-center justify-center gap-1.5"
            >
              <span>Book Airport / Executive Transfer</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="glass-panel p-8 sm:p-10 rounded-3xl glass-panel-hover border-champagne relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full pointer-events-none"></div>
            <div>
              <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-400 text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">
                Events, Cruise &amp; Nightlife
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">The VIP Experience</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Make an unforgettable entrance at concerts, weddings, NRG Stadium events, or Galveston cruise terminals. High-capacity Sprinters and stretch limousines equipped with Smart TVs and ambient lighting.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[var(--gold)] flex-shrink-0" /> Port of Galveston Cruise Terminal Shuttles
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[var(--gold)] flex-shrink-0" /> Concerts, Weddings &amp; Houston Nightlife
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[var(--gold)] flex-shrink-0" /> 14-Passenger Executive Sprinter &amp; Stretch Limos
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onSelect?.('galveston')}
              className="w-full py-3.5 rounded-full bg-dark-950 hover:bg-gold/15 border border-champagne text-gold-400 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <span>Book Cruise / VIP Event Ride</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Options;