import React from 'react';
import { FLEET_DATA } from '../data/avalimoData';
import { FleetItem } from '../types';

const ROW_ORDER = ['mercedes-s-class', 'gmc-yukon-suburban', 'cadillac-escalade-esv', 'lincoln-stretch-limo', 'mercedes-sprinter-van', 'executive-mini-coach'];

const FEATURED_RATES = [
  {
    route: 'IAH ↔ Downtown',
    sedan: { label: 'Sedan', price: 125 },
    suv: { label: 'SUV', price: 165 },
  },
  {
    route: 'Hobby ↔ Downtown',
    sedan: { label: 'Sedan', price: 105 },
    suv: { label: 'SUV', price: 135 },
  },
];

const Rates: React.FC = () => {
  const rows: FleetItem[] = ROW_ORDER
    .map((id) => FLEET_DATA.find((v) => v.id === id))
    .filter((v): v is FleetItem => Boolean(v));

  return (
    <section id="rates" className="py-24 md:py-32 bg-smoke border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="eyebrow mb-4">Transparent Pricing</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-5">
            Flat Rates. <span className="text-gold-gradient">No Surprises.</span>
          </h2>
          <p className="text-white/50 font-light">
            The price we quote is the price you pay. No surge, no hidden tolls — ever.
          </p>
        </div>

        {/* Featured airport rates */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {FEATURED_RATES.map((r) => (
            <div key={r.route} className="luxe-card rounded-3xl p-8 text-center">
              <h3 className="text-[11px] tracking-[0.3em] uppercase text-white/40 mb-6">{r.route}</h3>
              <div className="flex justify-center gap-12">
                {[r.sedan, r.suv].map((v) => (
                  <div key={v.label}>
                    <div className="font-serif text-5xl text-gold">${v.price}</div>
                    <div className="text-[10px] tracking-[0.25em] uppercase text-white/40 mt-2">{v.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Full matrix */}
        <div className="luxe-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink text-gold uppercase font-bold text-[11px] tracking-[0.2em] border-b border-gold/15">
                <tr>
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Capacity</th>
                  <th className="py-4 px-6">Hourly</th>
                  <th className="py-4 px-6">IAH</th>
                  <th className="py-4 px-6">Hobby</th>
                  <th className="py-4 px-6">Galveston</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/60">
                {rows.map((vehicle) => {
                  const isFeatured = vehicle.id === 'cadillac-escalade-esv';
                  return (
                    <tr
                      key={vehicle.id}
                      className={`hover:bg-gold/5 transition-colors ${isFeatured ? 'bg-gold/5' : ''}`}
                    >
                      <td className={`py-4 px-6 font-semibold ${isFeatured ? 'text-gold' : 'text-white'}`}>
                        {vehicle.name}
                        {isFeatured && ' ★'}
                      </td>
                      <td className="py-4 px-6">{vehicle.passengers} Pax / {vehicle.luggage} Bags</td>
                      <td className="py-4 px-6 font-semibold text-gold">${vehicle.pricePerHour} / hr</td>
                      <td className={`py-4 px-6 font-bold ${isFeatured ? 'text-gold' : 'text-white'}`}>${vehicle.flatRateIAH}</td>
                      <td className={`py-4 px-6 font-bold ${isFeatured ? 'text-gold' : 'text-white'}`}>${vehicle.flatRateHobby}</td>
                      <td className={`py-4 px-6 font-bold ${isFeatured ? 'text-gold' : 'text-white'}`}>${vehicle.flatRateGalveston}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-8 tracking-wide">
          60-minute airport wait time included · Flight tracking included · Tolls &amp; taxes included
        </p>
      </div>
    </section>
  );
};

export default Rates;
