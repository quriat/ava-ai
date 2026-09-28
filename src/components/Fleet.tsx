import React, { useState } from 'react';
import { FLEET_DATA } from '../data/avalimoData';
import { FleetItem } from '../types';
import { Check } from 'lucide-react';

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
    <section id="fleet" className="py-24 bg-dark-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold text-gold-400 tracking-widest block mb-2">
            Official Fleet Lineup
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Your Private Sanctuary
          </h2>
          <p className="text-slate-400 text-sm">
            Every vehicle in our fleet is meticulously maintained, smoke-free, and inspected daily for maximum safety and comfort.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f.id
                  ? 'bg-gold-500 text-black shadow-md'
                  : 'bg-dark-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="glass-panel rounded-3xl overflow-hidden glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="vehicle-img-container p-6 flex items-center justify-center h-64 border-b border-gold-500/20">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.name} — ${vehicle.category} available from AvaLimo Houston`}
                    className="max-h-52 object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-serif text-xl font-bold text-white">{vehicle.name}</h3>
                    <span className="text-xs font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/30 flex-shrink-0">
                      ${vehicle.pricePerHour}/hr
                    </span>
                  </div>
                  <p className="text-xs text-gold-400 font-semibold mb-3">
                    {vehicle.category} • {vehicle.passengers} Pax • {vehicle.luggage} Bags
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    {vehicle.description}
                  </p>
                  <div className="bg-dark-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span>Flat Rate IAH:</span>
                      <span className="text-white font-bold">${vehicle.flatRateIAH}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flat Rate Hobby:</span>
                      <span className="text-white font-bold">${vehicle.flatRateHobby}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flat Rate Galveston:</span>
                      <span className="text-white font-bold">${vehicle.flatRateGalveston}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleBook(vehicle.id)}
                  className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  Select {vehicle.name.split(' ').slice(0, 2).join(' ')}
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