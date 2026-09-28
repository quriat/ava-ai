import React from 'react';
import { FLEET_DATA } from '../data/avalimoData';
import { FleetItem } from '../types';

const ROW_ORDER = ['mercedes-s-class', 'gmc-yukon-suburban', 'cadillac-escalade-esv', 'lincoln-stretch-limo', 'mercedes-sprinter-van', 'executive-mini-coach'];

const Rates: React.FC = () => {
  const rows: FleetItem[] = ROW_ORDER
    .map((id) => FLEET_DATA.find((v) => v.id === id))
    .filter((v): v is FleetItem => Boolean(v));

  return (
    <section id="rates" className="py-24 bg-dark-900 border-t border-gold-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold text-gold-400 tracking-widest block mb-2">
            Guaranteed Pricing
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Houston Flat Rates Matrix
          </h2>
          <p className="text-slate-400 text-sm">
            All quoted prices are strictly fixed with zero surge pricing, zero hidden toll fees, and complimentary wait times included.
          </p>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border border-gold-500/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 text-gold-400 uppercase font-bold text-[11px] tracking-wider border-b border-gold-500/20">
                <tr>
                  <th className="py-4 px-6">Vehicle Type</th>
                  <th className="py-4 px-6">Capacity</th>
                  <th className="py-4 px-6">Hourly Rate</th>
                  <th className="py-4 px-6">IAH Airport</th>
                  <th className="py-4 px-6">Hobby (HOU)</th>
                  <th className="py-4 px-6">Port of Galveston</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {rows.map((vehicle, i) => {
                  const isFeatured = vehicle.id === 'cadillac-escalade-esv';
                  return (
                    <tr
                      key={vehicle.id}
                      className={`hover:bg-gold-500/5 transition-colors ${isFeatured ? 'bg-gold-500/5' : ''}`}
                    >
                      <td className={`py-4 px-6 font-bold ${isFeatured ? 'text-gold-400' : 'text-white'}`}>
                        {vehicle.name}
                        {isFeatured && ' ★'}
                      </td>
                      <td className="py-4 px-6">{vehicle.passengers} Pax / {vehicle.luggage} Luggage</td>
                      <td className="py-4 px-6 font-semibold text-gold-400">${vehicle.pricePerHour} / hr</td>
                      <td className={`py-4 px-6 font-bold ${isFeatured ? 'text-gold-400' : 'text-white'}`}>${vehicle.flatRateIAH}</td>
                      <td className={`py-4 px-6 font-bold ${isFeatured ? 'text-gold-400' : 'text-white'}`}>${vehicle.flatRateHobby}</td>
                      <td className={`py-4 px-6 font-bold ${isFeatured ? 'text-gold-400' : 'text-white'}`}>${vehicle.flatRateGalveston}</td>
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