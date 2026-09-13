import React from 'react';
import { FLEET_DATA, POPULAR_ROUTES } from '../data/avalimoData';
import { Check } from 'lucide-react';

const Rates: React.FC = () => {
  return (
    <section id="rates" className="w-full py-24 md:py-32 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Transparent Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Flat Rates — Zero Surge
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            All-inclusive pricing with taxes, tolls, airport parking, and gratuity clearly shown. The price you see is the price you pay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-luxury border border-white/5 rounded-2xl p-8">
            <h3 className="text-xl font-serif font-bold text-white mb-6">Popular Routes</h3>
            <div className="space-y-3">
              {POPULAR_ROUTES.map((route, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <div className="text-sm font-semibold text-white">{route.from} → {route.to}</div>
                    <div className="text-[11px] text-white/40">{route.duration}</div>
                  </div>
                  <div className="text-[var(--gold)] font-bold text-sm">{route.startingPrice}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-luxury border border-white/5 rounded-2xl p-8">
            <h3 className="text-xl font-serif font-bold text-white mb-6">Fleet Hourly Rates</h3>
            <div className="space-y-3">
              {FLEET_DATA.map((vehicle) => (
                <div key={vehicle.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <div className="text-sm font-semibold text-white">{vehicle.name}</div>
                    <div className="text-[11px] text-white/40">{vehicle.passengers} pax • {vehicle.luggage} bags • {vehicle.minHours} hr min</div>
                  </div>
                  <div className="text-[var(--gold)] font-bold text-sm">${vehicle.pricePerHour}/hr</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {[
            'No surge pricing ever',
            'All tolls included',
            'Airport parking included',
            '60 min free wait time'
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70">
              <Check size={16} className="text-[var(--gold)]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Rates;
