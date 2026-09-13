import React, { useState } from 'react';
import { FLEET_DATA, COMPANY_INFO } from '../data/avalimoData';
import { Users, Briefcase, ChevronRight, Check } from 'lucide-react';

interface FleetProps {
  onSelectVehicle?: (vehicleId: string) => void;
}

const Fleet: React.FC<FleetProps> = ({ onSelectVehicle }) => {
  const [selectedId, setSelectedId] = useState(FLEET_DATA[1].id);
  const selected = FLEET_DATA.find(v => v.id === selectedId) || FLEET_DATA[1];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectVehicle?.(id);
  };

  const scrollToBooking = () => {
    onSelectVehicle?.(selectedId);
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="fleet" className="w-full py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Our Fleet</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Choose Your Executive Vehicle
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Late-model luxury vehicles, meticulously detailed before every dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FLEET_DATA.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => handleSelect(vehicle.id)}
                className={`relative overflow-hidden rounded-2xl cursor-pointer border transition-all duration-300 ${
                  selectedId === vehicle.id
                    ? 'border-[var(--gold)] ring-1 ring-[var(--gold)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-[10px] text-[var(--gold)] font-bold tracking-[0.15em] uppercase">
                    {vehicle.category}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white mt-1">{vehicle.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-white/70">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {vehicle.passengers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} /> {vehicle.luggage}
                    </span>
                  </div>
                </div>
                {selectedId === vehicle.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--gold)] flex items-center justify-center">
                    <Check size={14} className="text-black" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-luxury border border-gold/10 rounded-2xl p-8">
            <span className="text-[10px] text-[var(--gold)] font-bold tracking-[0.15em] uppercase">
              {selected.category}
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-2 mb-4">{selected.name}</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">{selected.description}</p>

            <div className="space-y-3 mb-8">
              {selected.features.slice(0, 4).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-[13px] text-white/70">
                  <Check size={14} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-white/40 uppercase">IAH → Downtown</div>
                <div className="text-lg font-bold text-white">${selected.flatRateIAH}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-white/40 uppercase">Hobby → Downtown</div>
                <div className="text-lg font-bold text-white">${selected.flatRateHobby}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-white/40 uppercase">Hourly</div>
                <div className="text-lg font-bold text-white">${selected.pricePerHour}/hr</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-white/40 uppercase">IAH → Galveston</div>
                <div className="text-lg font-bold text-white">${selected.flatRateGalveston}</div>
              </div>
            </div>

            <button
              onClick={scrollToBooking}
              className="w-full gold-gradient text-black py-4 rounded-full text-[11px] font-extrabold tracking-[0.2em] uppercase hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Book {selected.name}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Fleet;
