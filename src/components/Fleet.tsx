import React, { useState } from 'react';
import { FLEET_DATA } from '../data/avalimoData';
import { FleetItem } from '../types';
import { ArrowRight } from 'lucide-react';

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
    <section id="fleet" className="py-24 md:py-32 bg-ink">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="eyebrow mb-4">The Fleet</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-5">
            Three Ways to <span className="text-gold-gradient">Travel First-Class</span>
          </h2>
          <p className="text-white/50 font-light leading-relaxed">
            Immaculate, late-model, commercially insured. Every ride includes bottled water,
            phone chargers, and a professional chauffeur.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${
                filter === f.id
                  ? 'btn-gold shadow-lg'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-gold/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="luxe-card rounded-3xl overflow-hidden flex flex-col">
              <div
                className="p-8 flex items-center justify-center h-64 border-b border-gold/10"
                style={{ background: 'radial-gradient(circle at center, rgba(201,169,106,.10) 0%, rgba(10,10,11,.95) 70%)' }}
              >
                <img
                  src={vehicle.image}
                  alt={`${vehicle.name} — ${vehicle.category} available from AvaLimo Houston`}
                  className="max-h-52 object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-7 flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-serif text-2xl text-white">{vehicle.name}</h3>
                  <span className="text-[11px] font-bold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/30 flex-shrink-0">
                    ${vehicle.pricePerHour}/hr
                  </span>
                </div>
                <p className="text-xs text-gold/80 font-semibold tracking-wide mb-3">
                  {vehicle.category} · {vehicle.passengers} Guests · {vehicle.luggage} Bags
                </p>
                <p className="text-white/50 text-sm font-light leading-relaxed mb-5">
                  {vehicle.description}
                </p>
                <div className="bg-ink rounded-2xl border border-white/5 p-4 text-xs text-white/50 space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span>Flat Rate IAH</span>
                    <span className="text-white font-semibold">${vehicle.flatRateIAH}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flat Rate Hobby</span>
                    <span className="text-white font-semibold">${vehicle.flatRateHobby}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flat Rate Galveston</span>
                    <span className="text-white font-semibold">${vehicle.flatRateGalveston}</span>
                  </div>
                </div>
              </div>
              <div className="px-7 pb-7">
                <button
                  onClick={() => handleBook(vehicle.id)}
                  className="w-full py-3.5 rounded-full btn-gold font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Select {vehicle.name.split(' ').slice(0, 2).join(' ')}
                  <ArrowRight size={14} />
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
