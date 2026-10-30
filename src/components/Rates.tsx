import React from 'react';
import { FLEET_DATA } from '../data/avalimoData';
import { FleetItem } from '../types';
import { ShieldCheck, ChevronRight } from 'lucide-react';

const ROW_ORDER = ['mercedes-s-class', 'gmc-yukon-suburban', 'cadillac-escalade-esv', 'lincoln-stretch-limo', 'mercedes-sprinter-van', 'executive-mini-coach'];

const Rates: React.FC = () => {
  const rows: FleetItem[] = ROW_ORDER
    .map((id) => FLEET_DATA.find((v) => v.id === id))
    .filter((v): v is FleetItem => Boolean(v));

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
            Transparent Houston Flat Rates
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            All prices are quoted before you ride. Zero surge charges, zero surprise toll surcharges, and complimentary commercial flight tracking with 60 minutes airport baggage grace period included.
          </p>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border-champagne shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 text-gold-400 uppercase font-bold text-[10px] sm:text-[11px] tracking-wider border-b border-champagne">
                <tr>
                  <th className="py-4 px-5 sm:px-6">Luxury Vehicle</th>
                  <th className="py-4 px-4 sm:px-6">Capacity</th>
                  <th className="py-4 px-4 sm:px-6">Hourly Livery</th>
                  <th className="py-4 px-4 sm:px-6">IAH Airport</th>
                  <th className="py-4 px-4 sm:px-6">Hobby (HOU)</th>
                  <th className="py-4 px-4 sm:px-6">Port of Galveston</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {rows.map((vehicle) => {
                  const isFeatured = vehicle.id === 'cadillac-escalade-esv';
                  return (
                    <tr
                      key={vehicle.id}
                      className={`hover:bg-gold/5 transition-colors ${isFeatured ? 'bg-gold/5' : ''}`}
                    >
                      <td className={`py-4 px-5 sm:px-6 font-bold ${isFeatured ? 'text-gold-300' : 'text-white'}`}>
                        {vehicle.name}
                        {isFeatured && <span className="ml-2 text-[10px] text-gold-400 bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20 uppercase font-normal">Popular</span>}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-slate-400">
                        {vehicle.passengers} Pax • {vehicle.luggage} Bags
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-semibold text-gold-400">
                        ${vehicle.pricePerHour}/hr
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-white">
                        ${vehicle.flatRateIAH}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-white">
                        ${vehicle.flatRateHobby}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-white">
                        ${vehicle.flatRateGalveston}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={handleBook}
                          className="px-3.5 py-1.5 rounded-full bg-dark-950 hover:bg-gold/20 border border-champagne text-gold-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1"
                        >
                          <span>Quote</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rates;
