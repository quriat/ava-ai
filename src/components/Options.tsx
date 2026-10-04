import React from 'react';
import { Check } from 'lucide-react';

interface OptionsProps {
  onSelect?: (route: 'iah' | 'galveston') => void;
}

const Options: React.FC<OptionsProps> = ({ onSelect }) => {
  return (
    <section id="options" className="py-20 bg-dark-900 border-t border-b border-gold-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold text-gold-400 tracking-widest block mb-2">
            Dual Travel Pathways
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Tailored Luxury Journeys
          </h2>
          <p className="text-slate-400 text-sm">Select the service that matches your destination today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl glass-panel-hover relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-bl-full pointer-events-none"></div>
            <div>
              <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">
                Executive &amp; Business
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">Relentless Punctuality</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Designed for executives, business travelers, and flight departures. Live flight status tracking, 15-minute early arrival guarantee, and whisper-quiet mobile office interiors.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold-400 flex-shrink-0" /> IAH &amp; HOU Airport Transfers
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold-400 flex-shrink-0" /> Energy Corridor &amp; Downtown Roadshows
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold-400 flex-shrink-0" /> Cadillac Escalade ESV &amp; Mercedes S-Class
                </li>
              </ul>
            </div>
            <button
              onClick={() => onSelect?.('iah')}
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Book Airport / Executive Transfer
            </button>
          </div>

          <div className="glass-panel p-8 sm:p-10 rounded-3xl glass-panel-hover relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none"></div>
            <div>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">
                Events, Cruise &amp; Nightlife
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">The VIP Experience</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Make an unforgettable entrance at concerts, weddings, NRG Stadium events, or Galveston cruise terminals. High-capacity Sprinters and stretch limousines equipped with Smart TVs and ambient lighting.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold-400 flex-shrink-0" /> Port of Galveston Cruise Terminal Shuttles
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold-400 flex-shrink-0" /> Concerts, Weddings &amp; Houston Nightlife
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-gold-400 flex-shrink-0" /> 14-Passenger Sprinter &amp; Stretch Limos
                </li>
              </ul>
            </div>
            <button
              onClick={() => onSelect?.('galveston')}
              className="w-full py-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-gold-500/50 text-gold-400 font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Book Cruise / VIP Event Ride
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Options;