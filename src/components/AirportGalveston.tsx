import React from 'react';
import { AIRPORT_GUIDES, COMPANY_INFO } from '../data/avalimoData';
import { Plane, Ship, Clock, MapPin, ShieldCheck, Phone } from 'lucide-react';

const AirportGalveston: React.FC = () => {
  return (
    <section id="airport-galveston" className="w-full py-24 md:py-32 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Airport & Cruise
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            IAH • Hobby • Galveston Cruise Terminal
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Real-time flight tracking, 45/60 min complimentary wait time, and direct pier-to-ship service for every Houston airport and cruise terminal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {AIRPORT_GUIDES.map((airport) => (
            <div key={airport.code} className="bg-luxury border border-white/5 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Plane size={24} className="text-[var(--gold)]" />
                <h3 className="text-xl font-serif font-bold text-white">{airport.name}</h3>
                <span className="text-[10px] font-bold text-black bg-[var(--gold)] px-2 py-0.5 rounded">{airport.code}</span>
              </div>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">{airport.description}</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Curbside VIP</div>
                    <div className="text-[12px] text-white/50">{airport.curbsidePickup}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Inside Meet & Greet</div>
                    <div className="text-[12px] text-white/50">{airport.insideMeetAndGreet}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Private FBOs</div>
                    <div className="text-[12px] text-white/50">{airport.fboLocations}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-luxury border border-gold/10 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Ship size={28} className="text-[var(--gold)]" />
                <h3 className="text-2xl font-serif font-bold text-white">Port of Galveston Cruise Transfers</h3>
              </div>
              <p className="text-white/60 leading-relaxed mb-6">
                Avoid crowded cruise shuttles and expensive parking. AvaLimo provides direct, door-to-ship private black car service to all Galveston cruise terminals including Carnival, Royal Caribbean, Disney, Princess, and Norwegian.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Direct baggage unloading at porters station',
                  'Custom disembarkation pickup as you clear customs',
                  'Child car seats ready for traveling families',
                  'Accommodates 1 to 24 passengers with heavy luggage'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-[var(--gold)]">•</span>{item}
                  </li>
                ))}
              </ul>
              <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="inline-flex items-center gap-2 text-[var(--gold)] font-semibold">
                <Phone size={16} /> Call {COMPANY_INFO.phone} for cruise transfers
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { route: 'Hobby Airport ⇄ Galveston', price: '$190 SUV / $290 Sprinter' },
                { route: 'Bush Airport (IAH) ⇄ Galveston', price: '$260 SUV / $390 Sprinter' },
                { route: 'Downtown / Galleria ⇄ Galveston', price: 'Custom quote' },
                { route: 'Round-trip cruise package', price: '10% off return' }
              ].map((card, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-xl">
                  <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">{card.route}</div>
                  <div className="text-[var(--gold)] font-bold text-sm">{card.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirportGalveston;
