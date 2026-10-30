import React, { useState } from 'react';
import { TripType, VehicleType } from '../types';
import { FLEET_DATA, COMPANY_INFO } from '../data/avalimoData';
import { Phone, Calendar, Star, ShieldCheck, Plane, Clock, Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

interface HeroProps {
  onSelectRoute?: (route: 'iah' | 'galveston') => void;
  onBookingPrefill?: (data: {
    tripType: TripType;
    vehicleId: string;
    pickupLocation?: string;
    dropoffLocation?: string;
  }) => void;
}

export default function Hero({ onSelectRoute, onBookingPrefill }: HeroProps) {
  const [selectedTripType, setSelectedTripType] = useState<TripType>(TripType.AIRPORT);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('cadillac-escalade-esv');
  const [airportRoute, setAirportRoute] = useState<'iah' | 'hobby'>('iah');
  const [hourlyHours, setHourlyHours] = useState<number>(3);

  const selectedVehicle = FLEET_DATA.find((v) => v.id === selectedVehicleId) || FLEET_DATA[1];

  const calculateEstimate = () => {
    if (selectedTripType === TripType.HOURLY) {
      return selectedVehicle.pricePerHour * Math.max(hourlyHours, selectedVehicle.minHours);
    }
    if (selectedTripType === TripType.GALVESTON) {
      return selectedVehicle.flatRateGalveston;
    }
    if (selectedTripType === TripType.AIRPORT) {
      return airportRoute === 'hobby' ? selectedVehicle.flatRateHobby : selectedVehicle.flatRateIAH;
    }
    return selectedVehicle.flatRateIAH;
  };

  const handleProceedToBooking = () => {
    let pickup = '';
    let dropoff = '';

    if (selectedTripType === TripType.AIRPORT) {
      pickup = airportRoute === 'iah' ? 'George Bush Intercontinental Airport (IAH)' : 'William P. Hobby Airport (HOU)';
      dropoff = 'Downtown Houston / Galleria';
    } else if (selectedTripType === TripType.GALVESTON) {
      pickup = 'Greater Houston Metropolitan Area';
      dropoff = 'Port of Galveston Cruise Terminal';
    } else if (selectedTripType === TripType.HOURLY) {
      pickup = 'Downtown Houston / Galleria';
      dropoff = 'As Directed (Hourly As-Directed)';
    }

    onBookingPrefill?.({
      tripType: selectedTripType,
      vehicleId: selectedVehicleId,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
    });

    trackEvent('hero_quote_proceed', {
      tripType: selectedTripType,
      vehicleId: selectedVehicleId,
      estimatedPrice: calculateEstimate(),
    });

    const el = document.getElementById('booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentPrice = calculateEstimate();

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-dark-950">
      {/* Cinematic Ambient Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/og-image.jpg"
          className="w-full h-full object-cover filter brightness-[0.22] contrast-115"
        >
          <source src="/videos/hero_bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.12),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Top Trust Capsule */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-900/90 border border-champagne text-xs font-semibold text-slate-200 backdrop-blur-md">
            <span className="flex items-center text-[var(--gold)]">
              <Star size={13} className="fill-[var(--gold)] mr-1" /> 4.9 Rating
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">500+ Verified 5-Star Rides</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-[11px] font-bold text-gold-400 uppercase tracking-wider backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Houston Livery • 24/7 Dispatch Active</span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Authority & Brand Position */}
          <div className="lg:col-span-7 text-center sm:text-left">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
              Houston Luxury Chauffeur &amp; Private Car Service
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-light">
              Punctual, flat-rate airport transfers to <strong className="text-white font-medium">IAH</strong> and <strong className="text-white font-medium">Hobby</strong>, executive roadshows, and <strong className="text-white font-medium">Port of Galveston</strong> cruise departures. Real-time commercial flight tracking with zero surge pricing.
            </p>

            {/* 4 Trust Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 max-w-xl text-left">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-dark-900/70 border border-champagne">
                <ShieldCheck size={18} className="text-[var(--gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fixed Flat Rates</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">No surge, tolls &amp; taxes included</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-dark-900/70 border border-champagne">
                <Plane size={18} className="text-[var(--gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Flight Tracking</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Auto-adjusted for delays &amp; early landings</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-dark-900/70 border border-champagne">
                <Clock size={18} className="text-[var(--gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">15-Min Early Arrival</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Chauffeur waiting on-site guarantee</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-dark-900/70 border border-champagne">
                <Award size={18} className="text-[var(--gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Vetted Chauffeurs</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">FBI background checked &amp; suited</p>
                </div>
              </div>
            </div>

            {/* Direct Contact & AI Pill */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-dark-900 hover:bg-dark-800 border border-gold/40 text-gold-400 hover:text-white font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Phone size={15} />
                <span>Call Dispatch: {COMPANY_INFO.phone}</span>
              </a>

              <a
                href="#ai-concierge"
                className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className="text-[var(--gold)]" />
                <span>Talk with 24/7 AI Concierge</span>
              </a>
            </div>
          </div>

          {/* Right Column: Instant Live Fare Estimator Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border-champagne shadow-2xl relative backdrop-blur-xl">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-champagne">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[var(--gold)] uppercase block">
                    Instant Fare Estimator
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white">Guaranteed Flat Rate</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  No Surge Ever
                </span>
              </div>

              {/* Trip Type Selector */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Travel Route
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTripType(TripType.AIRPORT)}
                    className={`py-2 px-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all border ${
                      selectedTripType === TripType.AIRPORT
                        ? 'bg-gold/20 border-[var(--gold)] text-gold-300'
                        : 'bg-dark-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Airport
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTripType(TripType.GALVESTON)}
                    className={`py-2 px-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all border ${
                      selectedTripType === TripType.GALVESTON
                        ? 'bg-gold/20 border-[var(--gold)] text-gold-300'
                        : 'bg-dark-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cruise
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTripType(TripType.HOURLY)}
                    className={`py-2 px-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all border ${
                      selectedTripType === TripType.HOURLY
                        ? 'bg-gold/20 border-[var(--gold)] text-gold-300'
                        : 'bg-dark-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Hourly
                  </button>
                </div>
              </div>

              {/* Sub-options based on Trip Type */}
              {selectedTripType === TripType.AIRPORT && (
                <div className="mb-5 p-3 rounded-2xl bg-dark-950/70 border border-slate-800/80">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Airport Hub
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAirportRoute('iah')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between border ${
                        airportRoute === 'iah'
                          ? 'border-[var(--gold)] text-white bg-gold/15'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>IAH Intercontinental</span>
                      <span className="text-[10px] text-gold-400 font-bold">$125+</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAirportRoute('hobby')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between border ${
                        airportRoute === 'hobby'
                          ? 'border-[var(--gold)] text-white bg-gold/15'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Hobby Airport (HOU)</span>
                      <span className="text-[10px] text-gold-400 font-bold">$110+</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedTripType === TripType.HOURLY && (
                <div className="mb-5 p-3 rounded-2xl bg-dark-950/70 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Charter Duration:</span>
                  <div className="flex items-center gap-2">
                    {[3, 4, 6, 8].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHourlyHours(h)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                          hourlyHours === h
                            ? 'bg-gold/20 border-[var(--gold)] text-white'
                            : 'bg-dark-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTripType === TripType.GALVESTON && (
                <div className="mb-5 p-3 rounded-2xl bg-dark-950/70 border border-slate-800/80 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-gold-400 font-bold mb-1">
                    <CheckCircle2 size={14} />
                    <span>Port of Galveston Cruise Terminals</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Direct terminal drop-off &amp; pickup for Royal Caribbean, Carnival, Disney, and Norwegian.
                  </p>
                </div>
              )}

              {/* Vehicle Selection Tabs */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Select Luxury Vehicle
                </label>
                <div className="space-y-2">
                  {FLEET_DATA.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                        selectedVehicleId === v.id
                          ? 'border-[var(--gold)] bg-gold/10'
                          : 'border-slate-800/80 bg-dark-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-dark-900 flex items-center justify-center border border-white/5 flex-shrink-0">
                          <img
                            src={v.image}
                            alt={v.name}
                            className="max-h-7 object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{v.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {v.category} • {v.passengers} Pax
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gold-400 block">
                          ${selectedTripType === TripType.HOURLY
                            ? `${v.pricePerHour * Math.max(hourlyHours, v.minHours)}`
                            : selectedTripType === TripType.GALVESTON
                            ? `${v.flatRateGalveston}`
                            : airportRoute === 'hobby'
                            ? `${v.flatRateHobby}`
                            : `${v.flatRateIAH}`}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase">
                          {selectedTripType === TripType.HOURLY ? `${hourlyHours}h Total` : 'Flat Rate'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Callout Banner */}
              <div className="p-4 rounded-2xl bg-dark-950 border border-gold/30 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Estimated Total
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                      ${currentPrice}
                    </span>
                    <span className="text-[11px] text-gold-400 font-bold uppercase tracking-wider">
                      Flat Rate
                    </span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 leading-tight">
                  <span className="text-emerald-400 font-semibold block">✓ 60m Wait Included</span>
                  <span>Tolls &amp; Fees Included</span>
                </div>
              </div>

              {/* Reserve Button */}
              <button
                type="button"
                onClick={handleProceedToBooking}
                className="w-full py-4 rounded-full gold-gradient text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
              >
                <span>Reserve This Vehicle</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
