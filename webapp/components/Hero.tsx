import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, Plane, Clock, Phone, MapPin, Sparkles, Star, Calendar } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';
import { TripType } from '../types';

interface HeroProps {
  onBookNow: (prefillData?: any) => void;
  onViewFleet: () => void;
  onOpenAirportGuide: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookNow, onViewFleet, onOpenAirportGuide }) => {
  const [selectedTripType, setSelectedTripType] = useState<TripType>(TripType.AIRPORT);
  const [pickup, setPickup] = useState('George Bush Intercontinental (IAH)');
  const [dropoff, setDropoff] = useState('Downtown Houston, TX');
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    onBookNow({
      tripType: selectedTripType,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      date: date,
      flightNumber: flightNumber ? flightNumber.toUpperCase() : undefined,
    });
  };

  return (
    <div className="relative min-h-[95vh] w-full overflow-hidden pt-36 sm:pt-40 lg:pt-36 pb-16 flex flex-col justify-center bg-neutral-950">
      {/* Background with Dark Luxe Overlay — AvaLimo's own Cadillac Escalade ESV */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Cadillac_Escalade_ESV_GMTK2YL_Black_Raven_%281%29.jpg/1920px-Cadillac_Escalade_ESV_GMTK2YL_Black_Raven_%281%29.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-black/70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headings & Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center space-x-2 bg-neutral-900/90 border border-amber-500/30 rounded-full px-4 py-1.5 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Serving Greater Houston & Galveston Since 2008
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif text-white leading-[1.1] font-bold">
              The Premier <br />
              <span className="gold-gradient-text">
                Chauffeur & Limo
              </span> <br />
              Service in Houston
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
              Experience the pinnacle of discreet luxury transportation. From Bush (IAH) and Hobby (HOU) airport transfers to executive roadshows, weddings, and Galveston cruise port journeys.
            </p>

            {/* Key feature pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-200 bg-neutral-900/80 border border-neutral-800 p-2.5 rounded">
                <Plane size={16} className="text-amber-500 flex-shrink-0" />
                <span>Real-Time Flight Tracking</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-200 bg-neutral-900/80 border border-neutral-800 p-2.5 rounded">
                <ShieldCheck size={16} className="text-amber-500 flex-shrink-0" />
                <span>Guaranteed Flat Rates</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-200 bg-neutral-900/80 border border-neutral-800 p-2.5 rounded col-span-2 sm:col-span-1">
                <Clock size={16} className="text-amber-500 flex-shrink-0" />
                <span>24/7 Live Dispatch</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <button 
                onClick={() => onBookNow()}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8 py-4 rounded text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-xl shadow-amber-900/40 hover:scale-105 flex items-center"
              >
                Reserve Your Chauffeur
                <ChevronRight className="ml-2" size={18} />
              </button>
              
              <button 
                onClick={onViewFleet}
                className="bg-neutral-900/90 border border-neutral-700 hover:border-amber-500 text-white hover:text-amber-400 px-7 py-4 rounded text-sm font-bold tracking-widest uppercase transition-all backdrop-blur-md"
              >
                Explore Luxury Fleet
              </button>
              
              <a 
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="inline-flex items-center text-xs text-amber-400 hover:text-amber-300 font-semibold px-3 py-2"
              >
                <Phone size={14} className="mr-1.5 animate-pulse" />
                24/7 Dispatch: {COMPANY_INFO.phone}
              </a>
              <a 
                href="tel:+18329176331"
                className="inline-flex items-center text-xs text-gray-300 hover:text-amber-300 font-semibold px-3 py-2"
              >
                <Phone size={13} className="mr-1.5 text-gray-500" />
                AI Concierge: {COMPANY_INFO.aiConciergePhone}
              </a>
            </div>
          </div>

          {/* Right Column: Quick Booking / Instant Quote Card */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-900/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Instant Rate Quote
              </div>

              <div className="mb-5">
                <h3 className="text-xl font-serif font-bold text-white flex items-center">
                  <Sparkles size={18} className="text-amber-500 mr-2" />
                  Quick Fare Estimator
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Select your journey details for an instant transparent rate estimate.
                </p>
              </div>

              {/* Trip Type Selector */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTripType(TripType.AIRPORT);
                    setPickup('George Bush Intercontinental (IAH)');
                    setDropoff('Downtown Houston, TX');
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-all ${
                    selectedTripType === TripType.AIRPORT 
                      ? 'bg-amber-600 border-amber-500 text-white' 
                      : 'bg-neutral-800 border-neutral-700 text-gray-300 hover:border-neutral-500'
                  }`}
                >
                  ✈️ Airport Transfer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTripType(TripType.GALVESTON);
                    setPickup('Houston Hobby Airport (HOU)');
                    setDropoff('Port of Galveston Cruise Terminal');
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-all ${
                    selectedTripType === TripType.GALVESTON 
                      ? 'bg-amber-600 border-amber-500 text-white' 
                      : 'bg-neutral-800 border-neutral-700 text-gray-300 hover:border-neutral-500'
                  }`}
                >
                  ⚓ Galveston Cruise
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTripType(TripType.POINT_TO_POINT);
                    setPickup('Galleria / Uptown Houston');
                    setDropoff('The Woodlands Waterway');
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-all ${
                    selectedTripType === TripType.POINT_TO_POINT 
                      ? 'bg-amber-600 border-amber-500 text-white' 
                      : 'bg-neutral-800 border-neutral-700 text-gray-300 hover:border-neutral-500'
                  }`}
                >
                  📍 Point to Point
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTripType(TripType.HOURLY);
                    setPickup('River Oaks Country Club');
                    setDropoff('Downtown Houston (As Directed)');
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-all ${
                    selectedTripType === TripType.HOURLY 
                      ? 'bg-amber-600 border-amber-500 text-white' 
                      : 'bg-neutral-800 border-neutral-700 text-gray-300 hover:border-neutral-500'
                  }`}
                >
                  ⏱️ Hourly Charter
                </button>
              </div>

              <form onSubmit={handleQuickEstimate} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-amber-500" size={16} />
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      required
                      placeholder="Airport, Hotel, or Houston Address"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2.5 pl-9 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Dropoff Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-amber-500" size={16} />
                    <input
                      type="text"
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      required
                      placeholder="Destination or Airport"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2.5 pl-9 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Service Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2.5 pl-9 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {selectedTripType === TripType.AIRPORT && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Flight # (Optional for live tracking)</span>
                      <span className="text-[10px] text-amber-400 font-normal">Auto-pickup sync</span>
                    </label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-3 text-amber-500" size={16} />
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. UA 1428, WN 2241, AA 1092"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded p-2.5 pl-9 text-xs text-white focus:border-amber-500 focus:outline-none uppercase font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded text-xs tracking-widest uppercase transition-all shadow-lg flex items-center justify-center"
                  >
                    View Rates & Complete Booking
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center text-amber-400">
                  <Star size={12} className="fill-amber-400 text-amber-400 mr-1" />
                  5.0 Rated Houston Chauffeur
                </span>
                <button 
                  onClick={onOpenAirportGuide}
                  className="text-gray-300 hover:text-amber-400 underline underline-offset-2"
                >
                  View Airport Rate Sheet →
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Metrics Ribbon */}
        <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-amber-400">100%</div>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium">On-Time Guarantee</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-white">2008</div>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium">Serving Houston Since</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-amber-400">15,000+</div>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium">Trips & Flights Handled</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-white">24/7</div>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium">Live Dispatch & Support</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
