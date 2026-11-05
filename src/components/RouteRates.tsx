import React from 'react';
import { QUOTE_ROUTES, QUOTE_VEHICLE_CLASSES, COMPANY_INFO } from '../data/avalimoData';
import { ShieldCheck, ChevronRight, Phone } from 'lucide-react';

/**
 * Homepage flat-rates table by route, with the S-Class premium tier as a
 * distinct highlighted column. Values come from QUOTE_ROUTES in
 * avalimoData.ts (shared with the instant quote widget); null means the
 * combination is quoted by phone only.
 */
const RouteRates: React.FC = () => {
  const handleBook = () => {
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="rates" className="py-24 bg-dark-900/50 border-t border-champagne relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <ShieldCheck size={12} className="text-[var(--gold)]" />
            <span>Guaranteed Pricing Policy</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Flat Rates by Route
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            No surge. No surprises. Every rate is flat, per vehicle, and includes meet &amp; greet,
            wait time, taxes, tolls and airport parking.
          </p>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border-champagne shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 text-gold-400 uppercase font-bold text-[10px] sm:text-[11px] tracking-wider border-b border-champagne">
                <tr>
                  <th className="py-4 px-5 sm:px-6">Route</th>
                  {QUOTE_VEHICLE_CLASSES.map((cls) => (
                    <th
                      key={cls.id}
                      className={`py-4 px-4 sm:px-6 ${cls.id === 'sclass' ? 'bg-gold/10 text-gold-300' : ''}`}
                    >
                      {cls.label}
                      {cls.id === 'sclass' && (
                        <span className="ml-2 text-[9px] text-black bg-[var(--gold)] px-2 py-0.5 rounded-full uppercase">
                          Premium
                        </span>
                      )}
                      <span className="block text-[9px] font-semibold normal-case tracking-normal text-slate-500 mt-0.5">
                        {cls.note}
                      </span>
                    </th>
                  ))}
                  <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {QUOTE_ROUTES.map((route) => (
                  <tr key={route.id} className="hover:bg-gold/5 transition-colors">
                    <td className="py-4 px-5 sm:px-6 font-bold text-white">{route.label}</td>
                    {QUOTE_VEHICLE_CLASSES.map((cls) => {
                      const price = route.prices[cls.id];
                      const isPremium = cls.id === 'sclass';
                      return (
                        <td
                          key={cls.id}
                          className={`py-4 px-4 sm:px-6 ${isPremium ? 'bg-gold/5' : ''}`}
                        >
                          {price !== null ? (
                            <span className={`font-bold ${isPremium ? 'text-gold-300' : 'text-white'}`}>
                              ${price}
                            </span>
                          ) : (
                            <a
                              href={`tel:${COMPANY_INFO.phoneRaw}`}
                              className="inline-flex items-center gap-1 text-gold-400 hover:text-white font-semibold whitespace-nowrap"
                            >
                              <Phone size={11} />
                              <span>Call for quote</span>
                            </a>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={handleBook}
                        className="px-3.5 py-1.5 rounded-full bg-dark-950 hover:bg-gold/20 border border-champagne text-gold-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1"
                      >
                        <span>Book</span>
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          All rates are flat, per vehicle — not per person — and include meet &amp; greet, wait time,
          taxes, tolls and airport parking. Medical Center, NRG, Sugar Land, Missouri City and
          long-distance trips get one flat quote by phone.
        </p>
      </div>
    </section>
  );
};

export default RouteRates;
