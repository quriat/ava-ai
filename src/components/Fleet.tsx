import React, { useState } from 'react';
import { FLEET_DATA } from '../data/avalimoData';
import { FleetItem } from '../types';
import { Users, Briefcase, ChevronRight, Sparkles } from 'lucide-react';

interface FleetProps {
  onSelectVehicle?: (vehicleId: string) => void;
}

type FilterCat = 'all' | 'suv' | 'sprinter' | 'sedan';

const FILTERS: { id: FilterCat; label: string }[] = [
  { id: 'all', label: 'All Fleet' },
  { id: 'suv', label: 'Luxury SUVs' },
  { id: 'sprinter', label: 'Sprinters & Coaches' },
  { id: 'sedan', label: 'Executive Sedans' },
];

const CARD_ORDER = ['cadillac-escalade-esv', 'mercedes-sprinter-van', 'gmc-yukon-suburban', 'mercedes-s-class'];

const CATEGORY_MAP: Record<FilterCat, string[]> = {
  all: CARD_ORDER,
  suv: ['cadillac-escalade-esv', 'gmc-yukon-suburban'],
  sprinter: ['mercedes-sprinter-van'],
  sedan: ['mercedes-s-class'],
};

const Fleet: React.FC<FleetProps> = ({ onSelectVehicle }) => {
  const [filter, setFilter] = useState<FilterCat>('all');

  const vehicles: FleetItem[] = CATEGORY_MAP[filter]
    .map((id) => FLEET_DATA.find((v) => v.id === id))
    .filter((v): v is FleetItem => Boolean(v));

  const handleBook = (id: string) => {
    onSelectVehicle?.(id);
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="fleet" className="py-24 bg-dark-950 relative border-t border-champagne">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles size={12} className="text-[var(--gold)]" />
            <span>Meticulously Maintained Livery</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Houston Executive Fleet
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Every vehicle in our fleet is smoke-free, sanitized before every trip, and equipped with chilled artesian bottled water, 5G Wi-Fi, and multiple device chargers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === f.id
                  ? 'bg-gold/20 border-[var(--gold)] text-white shadow-md'
                  : 'bg-dark-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="glass-panel rounded-3xl overflow-hidden glass-panel-hover flex flex-col justify-between border-champagne transition-all duration-300"
            >
              <div>
                <div className="vehicle-img-container p-6 flex items-center justify-center h-64 border-b border-champagne relative">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.name} — ${vehicle.category} available from AvaLimo Houston`}
                    className="max-h-52 object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-dark-900/90 border border-champagne text-gold-400 px-3 py-1 rounded-full text-[11px] font-bold">
                    ${vehicle.pricePerHour}/hr
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-serif text-xl font-bold text-white">{vehicle.name}</h3>
                  </div>

                  {/* Badges for capacity */}
                  <div className="flex items-center gap-4 text-xs text-slate-300 mb-4 pb-3 border-b border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-[var(--gold)]" />
                      <span>{vehicle.passengers} Passengers</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-[var(--gold)]" />
                      <span>{vehicle.luggage} Luggage</span>
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed mb-5 min-h-[36px]">
                    {vehicle.description}
                  </p>

                  {/* Flat Rate breakdown */}
                  <div className="bg-dark-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1.5 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">IAH Airport Flat Rate:</span>
                      <span className="text-white font-bold">${vehicle.flatRateIAH}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Hobby Airport (HOU):</span>
                      <span className="text-white font-bold">${vehicle.flatRateHobby}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Port of Galveston Cruise:</span>
                      <span className="text-white font-bold">${vehicle.flatRateGalveston}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <button
                  type="button"
                  onClick={() => handleBook(vehicle.id)}
                  className="w-full py-3 rounded-full gold-gradient text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-gold/10 hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-1.5"
                >
                  <span>Select &amp; Book Vehicle</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Fleet;
