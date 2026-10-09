import React from 'react';
import { Plane, Briefcase, Heart, Sparkles, ArrowRight } from 'lucide-react';

interface OptionsProps {
  onSelect?: (route: 'iah' | 'galveston') => void;
}

const SERVICES = [
  {
    icon: Plane,
    title: 'Airport Transfers',
    body: 'Flat rates to IAH & Hobby. Live flight tracking, 60-minute wait included, chauffeur waiting at arrivals.',
    route: 'iah' as const,
    cta: 'Book Airport Ride',
  },
  {
    icon: Briefcase,
    title: 'Corporate',
    body: 'Roadshows, client pickups, executive travel. Monthly billing, dedicated dispatch, your image handled.',
    route: 'iah' as const,
    cta: 'Book Corporate',
  },
  {
    icon: Heart,
    title: 'Weddings',
    body: 'Red-carpet arrival, ribbon-dressed cars, champagne on request. The entrance your day deserves.',
    route: 'galveston' as const,
    cta: 'Book Wedding Ride',
  },
  {
    icon: Sparkles,
    title: 'Nights Out & Events',
    body: 'Astros, Texans, concerts, Galveston cruises. Door to door — no parking, no worries, everyone home safe.',
    route: 'galveston' as const,
    cta: 'Book Event Ride',
  },
];

const Options: React.FC<OptionsProps> = ({ onSelect }) => {
  return (
    <section id="options" className="py-24 md:py-32 bg-smoke border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="eyebrow mb-4">Services</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-5">
            Built Around <span className="text-gold-gradient">Your Day</span>
          </h2>
          <p className="text-white/50 font-light">
            One call covers it all — pick the occasion, we'll handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((s) => (
            <button
              key={s.title}
              onClick={() => onSelect?.(s.route)}
              className="luxe-card rounded-3xl p-8 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                <s.icon size={22} className="text-gold" />
              </div>
              <h3 className="font-serif text-2xl text-white mb-3">{s.title}</h3>
              <p className="text-white/50 text-sm font-light leading-relaxed mb-6">{s.body}</p>
              <span className="inline-flex items-center gap-2 text-gold text-[11px] font-bold uppercase tracking-[0.2em] group-hover:gap-3 transition-all">
                {s.cta} <ArrowRight size={13} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Options;
