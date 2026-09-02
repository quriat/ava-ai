import React, { useState } from 'react';
import { Users, Briefcase, Wifi, X, Check, ChevronRight, Star, Shield, Award, Fuel, Sparkles } from 'lucide-react';
import { FleetItem, VehicleType } from '../types';
import { FLEET_DATA, COMPANY_INFO } from '../data/avalimoData';

interface FleetProps {
  onSelect: (vehicleId: string) => void;
}

const Fleet: React.FC<FleetProps> = ({ onSelect }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<FleetItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { label: 'All Fleet', value: 'all' },
    { label: 'Luxury Sedans', value: VehicleType.SEDAN },
    { label: 'Premium SUVs', value: VehicleType.SUV },
    { label: 'Executive Sprinters', value: VehicleType.SPRINTER },
    { label: 'Stretch Limousines & Buses', value: 'limo-bus' },
  ];

  const filteredFleet = FLEET_DATA.filter((car) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'limo-bus') {
      return car.type === VehicleType.LIMO || car.type === VehicleType.PARTY_BUS;
    }
    return car.type === selectedCategory;
  });

  const openModal = (car: FleetItem) => {
    setSelectedVehicle(car);
    setActiveImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedVehicle(null);
    document.body.style.overflow = 'unset';
  };

  const handleBookFromModal = () => {
    if (selectedVehicle) {
      onSelect(selectedVehicle.id);
      closeModal();
    }
  };

  return (
    <section className="py-24 bg-neutral-950 text-white relative" id="fleet-section">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">
            <Award size={14} />
            <span>The AvaLimo Executive Collection</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            World-Class Fleet & Flawless Comfort
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Every vehicle in our Houston fleet is late-model, rigorously detailed before each dispatch, and appointed with chilled artesian waters and 5G Wi-Fi.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                    : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFleet.map((car) => (
            <div 
              key={car.id} 
              className="group bg-neutral-900/90 rounded-xl overflow-hidden border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-950/30 flex flex-col"
            >
              {/* Image Banner */}
              <div 
                className="relative h-64 overflow-hidden cursor-pointer bg-neutral-950"
                onClick={() => openModal(car)}
              >
                <img 
                  src={car.image} 
                  alt={car.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                
                {/* Rate Badges */}
                <div className="absolute top-3 left-3 bg-neutral-950/90 backdrop-blur-md border border-amber-500/30 text-amber-400 px-3 py-1 rounded text-xs font-bold tracking-wider">
                  ${car.pricePerHour}/hr <span className="text-[10px] text-gray-400 font-normal">({car.minHours}hr min)</span>
                </div>
                
                <div className="absolute top-3 right-3 bg-amber-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold">
                  IAH from ${car.flatRateIAH}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-amber-600/90 text-white px-3 py-1.5 rounded font-semibold tracking-wider uppercase">
                    View Specs & Interior
                  </span>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-amber-500 font-bold tracking-widest uppercase">
                    {car.category}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Galveston: ${car.flatRateGalveston}
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {car.name}
                </h3>
                
                <p className="text-gray-400 text-xs leading-relaxed mb-5 line-clamp-2">
                  {car.description}
                </p>
                
                {/* Capacity Badges */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-neutral-950/60 rounded-lg border border-neutral-800 text-xs text-gray-300 mb-6 mt-auto">
                  <div className="flex items-center justify-center space-x-1.5">
                    <Users size={14} className="text-amber-500" />
                    <span>{car.passengers} Seats</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1.5 border-x border-neutral-800">
                    <Briefcase size={14} className="text-amber-500" />
                    <span>{car.luggage} Bags</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1.5">
                    <Wifi size={14} className="text-amber-500" />
                    <span>5G Wi-Fi</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => openModal(car)}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-200 py-2.5 rounded text-xs font-semibold tracking-wider transition-colors"
                  >
                    SPECS & PHOTOS
                  </button>
                  <button 
                    onClick={() => onSelect(car.id)}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-colors shadow-md"
                  >
                    RESERVE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Fleet Banner */}
        <div className="mt-14 p-6 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white">Need a Multi-Vehicle Executive Motorcade or Custom Route?</h4>
              <p className="text-gray-400 text-xs">Our 24/7 Houston logistics team coordinates VIP security convoys, corporate summits, and wedding guest fleets.</p>
            </div>
          </div>
          <a 
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            className="whitespace-nowrap bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded text-xs font-bold tracking-widest uppercase transition-all"
          >
            Call Dispatch: {COMPANY_INFO.phone}
          </a>
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={closeModal}></div>
          
          <div className="relative bg-neutral-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 fade-in duration-300">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-950">
              <div>
                <span className="text-amber-500 text-xs uppercase tracking-widest font-bold">{selectedVehicle.category}</span>
                <h3 className="text-2xl font-serif font-bold text-white">{selectedVehicle.name}</h3>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-gray-400 hover:text-white"
                aria-label="Close vehicle details"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                
                {/* Left Side: Images */}
                <div className="lg:col-span-6 bg-black flex flex-col">
                  <div className="relative h-64 sm:h-80 lg:h-[380px] w-full">
                    <img 
                      src={selectedVehicle.images ? selectedVehicle.images[activeImageIndex] : selectedVehicle.image} 
                      alt={selectedVehicle.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded text-xs text-amber-400 border border-amber-500/30">
                      Photo {activeImageIndex + 1} of {selectedVehicle.images?.length || 1}
                    </div>
                  </div>

                  {selectedVehicle.images && selectedVehicle.images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto bg-neutral-950 border-t border-neutral-800">
                      {selectedVehicle.images.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-20 h-14 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                            activeImageIndex === idx ? 'border-amber-500 opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Specs & Rates */}
                <div className="lg:col-span-6 p-6 space-y-6 bg-neutral-900">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-amber-400 font-bold mb-2 flex items-center">
                      <Sparkles size={16} className="mr-1.5" />
                      Vehicle Overview
                    </h4>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                      {selectedVehicle.description}
                    </p>
                  </div>

                  {/* Rate Breakdown Table */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2.5">
                    <h5 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                      Transparent Flat Rates & Minimums
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between p-2 rounded bg-neutral-900">
                        <span className="text-gray-400">Hourly Charter:</span>
                        <span className="text-amber-400 font-bold">${selectedVehicle.pricePerHour}/hr ({selectedVehicle.minHours}hr min)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-neutral-900">
                        <span className="text-gray-400">IAH Airport:</span>
                        <span className="text-white font-bold">${selectedVehicle.flatRateIAH} flat</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-neutral-900">
                        <span className="text-gray-400">Hobby (HOU):</span>
                        <span className="text-white font-bold">${selectedVehicle.flatRateHobby} flat</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-neutral-900">
                        <span className="text-gray-400">Galveston Port:</span>
                        <span className="text-white font-bold">${selectedVehicle.flatRateGalveston} flat</span>
                      </div>
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-neutral-800/80 p-3 rounded-lg border border-neutral-700">
                      <Users size={16} className="text-amber-500 mx-auto mb-1" />
                      <div className="text-gray-400 text-[10px] uppercase">Passengers</div>
                      <div className="text-white font-bold">{selectedVehicle.passengers} Guests</div>
                    </div>
                    <div className="bg-neutral-800/80 p-3 rounded-lg border border-neutral-700">
                      <Briefcase size={16} className="text-amber-500 mx-auto mb-1" />
                      <div className="text-gray-400 text-[10px] uppercase">Luggage</div>
                      <div className="text-white font-bold">{selectedVehicle.luggage} Suitcases</div>
                    </div>
                    <div className="bg-neutral-800/80 p-3 rounded-lg border border-neutral-700">
                      <Wifi size={16} className="text-amber-500 mx-auto mb-1" />
                      <div className="text-gray-400 text-[10px] uppercase">Connectivity</div>
                      <div className="text-white font-bold">5G Wi-Fi Included</div>
                    </div>
                  </div>

                  {/* Included Features */}
                  <div>
                    <h5 className="text-xs uppercase tracking-wider text-gray-300 font-semibold mb-2.5">
                      Included Cabin Amenities
                    </h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                      {selectedVehicle.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check size={14} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-gray-400 text-center sm:text-left">
                * All rates are flat with zero surge fees. Complimentary flight tracking and meet & greet available.
              </div>
              <button 
                onClick={handleBookFromModal}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8 py-3 rounded text-xs font-bold tracking-widest uppercase transition-all shadow-lg flex items-center justify-center"
              >
                RESERVE THIS {selectedVehicle.name.toUpperCase()}
                <ChevronRight size={16} className="ml-1.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};

export default Fleet;
