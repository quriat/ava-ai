import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, User, Mail, Phone, Plane, Users, Briefcase, ShieldCheck, Check, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Navigation, Gauge, Star } from 'lucide-react';
import { VehicleType, TripType, FlightDetails, RouteEstimate } from '../types';
import { FLEET_DATA, COMPANY_INFO, POPULAR_ROUTES } from '../data/avalimoData';
import FlightTrackerWidget from './FlightTrackerWidget';
import EstimatedTravelTimeCard from './EstimatedTravelTimeCard';
import LeaveGoogleReviewModal from './LeaveGoogleReviewModal';
import { format12Hour } from '../services/flightTrackingService';
import { calculateRouteEstimate } from '../services/routeCalculationService';

interface BookingFormProps {
  initialData?: {
    tripType?: TripType;
    pickupLocation?: string;
    dropoffLocation?: string;
    date?: string;
    vehicleId?: string;
    flightNumber?: string;
    specialInstructions?: string;
  };
}

const BookingForm: React.FC<BookingFormProps> = ({ initialData }) => {
  const [tripType, setTripType] = useState<TripType>(TripType.AIRPORT);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('cadillac-escalade');
  const [hourlyHours, setHourlyHours] = useState<number>(3);
  const [showFlightTracker, setShowFlightTracker] = useState<boolean>(true);
  const [trackedFlight, setTrackedFlight] = useState<FlightDetails | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    },
    time: '14:30',
    pickup: 'George Bush Intercontinental Airport (IAH)',
    dropoff: 'Downtown Houston (Galleria / Medical Center)',
    flightNumber: '',
    airline: '',
    passengers: 2,
    luggage: 2,
    specialInstructions: '',
    needChildSeat: false,
    childSeatType: 'Toddler Front-Facing (20-40 lbs)',
    needMeetAndGreet: true,
  });

  const [submittedBooking, setSubmittedBooking] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Calculate dynamic travel time and route estimate
  const routeEstimate: RouteEstimate = useMemo(() => {
    return calculateRouteEstimate(formData.pickup, formData.dropoff, formData.time);
  }, [formData.pickup, formData.dropoff, formData.time]);

  // Swap pickup & dropoff
  const handleSwapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      pickup: prev.dropoff,
      dropoff: prev.pickup,
    }));
  };

  // Quick select location
  const handleSelectQuickLocation = (locationLabel: string, isDropoff: boolean) => {
    let fullLocation = locationLabel;
    if (locationLabel === 'IAH Airport') fullLocation = 'George Bush Intercontinental Airport (IAH)';
    else if (locationLabel === 'Hobby (HOU)') fullLocation = 'William P. Hobby Airport (HOU)';
    else if (locationLabel === 'Downtown') fullLocation = 'Downtown Houston (Toyota Center / Convention Center)';
    else if (locationLabel === 'The Galleria') fullLocation = 'The Galleria / Uptown Post Oak';
    else if (locationLabel === 'Galveston Cruise') fullLocation = 'Port of Galveston Cruise Terminal';
    else if (locationLabel === 'The Woodlands') fullLocation = 'The Woodlands / Cynthia Woods Pavilion';
    else if (locationLabel === 'Medical Center') fullLocation = 'Texas Medical Center (MD Anderson / Methodist)';
    else if (locationLabel === 'Sugar Land') fullLocation = 'Sugar Land / Missouri City (Smart Financial Centre)';

    setFormData((prev) => ({
      ...prev,
      [isDropoff ? 'dropoff' : 'pickup']: fullLocation,
    }));
  };

  // Sync initialData if provided from parent or hero
  useEffect(() => {
    if (initialData) {
      if (initialData.tripType) setTripType(initialData.tripType);
      if (initialData.vehicleId) setSelectedVehicleId(initialData.vehicleId);
      if (initialData.pickupLocation) {
        setFormData((prev) => ({ ...prev, pickup: initialData.pickupLocation || prev.pickup }));
      }
      if (initialData.dropoffLocation) {
        setFormData((prev) => ({ ...prev, dropoff: initialData.dropoffLocation || prev.dropoff }));
      }
      if (initialData.date) {
        setFormData((prev) => ({ ...prev, date: initialData.date || prev.date }));
      }
      if (initialData.flightNumber) {
        setFormData((prev) => ({ ...prev, flightNumber: initialData.flightNumber || prev.flightNumber }));
      }
      if (initialData.specialInstructions) {
        setFormData((prev) => ({ ...prev, specialInstructions: initialData.specialInstructions || prev.specialInstructions }));
      }
    }
  }, [initialData]);

  const selectedVehicle = FLEET_DATA.find((v) => v.id === selectedVehicleId) || FLEET_DATA[1];

  // Callback when flight is tracked & synced
  const handleFlightApplied = (info: {
    flightNumber: string;
    airline: string;
    pickupTime: string;
    date?: string;
    terminalPickupLocation?: string;
    flightDetails: FlightDetails;
  }) => {
    setTrackedFlight(info.flightDetails);
    setFormData((prev) => ({
      ...prev,
      flightNumber: info.flightNumber,
      airline: info.airline,
      time: info.pickupTime,
      date: info.date || prev.date,
      pickup: info.terminalPickupLocation || prev.pickup,
    }));
  };

  // Calculate estimated total
  const calculateEstimatedTotal = () => {
    let base = 0;
    if (tripType === TripType.HOURLY) {
      base = selectedVehicle.pricePerHour * Math.max(hourlyHours, selectedVehicle.minHours);
    } else if (tripType === TripType.GALVESTON) {
      base = selectedVehicle.flatRateGalveston;
    } else if (tripType === TripType.AIRPORT) {
      // Check if Hobby or IAH in pickup/dropoff
      const isHobby = formData.pickup.toLowerCase().includes('hobby') || formData.dropoff.toLowerCase().includes('hobby');
      base = isHobby ? selectedVehicle.flatRateHobby : selectedVehicle.flatRateIAH;
    } else {
      // Point to Point estimate
      base = selectedVehicle.flatRateIAH;
    }

    let extras = 0;
    if (formData.needChildSeat) extras += 20;
    if (formData.needMeetAndGreet && tripType === TripType.AIRPORT) extras += 0; // Complimentary inside IAH/HOU

    return {
      base,
      extras,
      total: base + extras,
    };
  };

  const costEstimate = calculateEstimatedTotal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTripTypeChange = (type: TripType) => {
    setTripType(type);
    if (type === TripType.AIRPORT) {
      setFormData((prev) => ({
        ...prev,
        pickup: 'George Bush Intercontinental Airport (IAH)',
        dropoff: 'Downtown Houston / Galleria',
      }));
    } else if (type === TripType.GALVESTON) {
      setFormData((prev) => ({
        ...prev,
        pickup: 'George Bush Intercontinental Airport (IAH)',
        dropoff: 'Port of Galveston Cruise Terminal',
      }));
    } else if (type === TripType.HOURLY) {
      setFormData((prev) => ({
        ...prev,
        pickup: 'Downtown Houston / Galleria',
        dropoff: 'As Directed (Hourly Chauffeur)',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const confirmationId = `AVA-${Math.floor(100000 + Math.random() * 900000)}`;
    const submission = {
      confirmationId,
      ...formData,
      tripType,
      vehicle: selectedVehicle,
      hours: tripType === TripType.HOURLY ? hourlyHours : undefined,
      flightDetails: trackedFlight,
      routeEstimate,
      totalCost: costEstimate.total,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Dispatch to the production backend (email + Google Sheets + n8n follow-ups)
    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    }).catch((err) => console.error('Booking dispatch failed:', err));

    setSubmittedBooking(submission);
  };

  return (
    <section className="py-24 bg-neutral-950 text-white relative overflow-hidden" id="booking-section">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">
            <Sparkles size={14} />
            <span>Instant Reservation Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Reserve Your Chauffeur
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            All rates are guaranteed flat fares with zero surge pricing. Enjoy real-time flight tracking, 60 minutes free airport wait time, and complimentary bottled water.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-neutral-900/90 border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Trip Type Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-neutral-800 bg-neutral-950/60 p-2 gap-1">
            {[
              { type: TripType.AIRPORT, label: '✈️ Airport Transfer' },
              { type: TripType.GALVESTON, label: '⚓ Galveston Cruise' },
              { type: TripType.POINT_TO_POINT, label: '📍 Point to Point' },
              { type: TripType.HOURLY, label: '⏱️ Hourly Charter' },
            ].map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => handleTripTypeChange(tab.type)}
                className={`py-3 px-4 text-xs font-bold rounded-lg transition-all ${
                  tripType === tab.type
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                    : 'text-gray-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            
            {/* Step 1: Route & Time */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 text-xs flex items-center justify-center mr-2 border border-amber-500/40">1</span>
                  Pickup & Dropoff Details
                </h3>

                {(tripType === TripType.AIRPORT || tripType === TripType.POINT_TO_POINT || tripType === TripType.GALVESTON) && (
                  <button
                    type="button"
                    onClick={() => setShowFlightTracker(!showFlightTracker)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plane size={13} className="text-amber-500" />
                    <span>{showFlightTracker ? 'Hide Flight Tracker' : '✈️ Track Flight & Auto-Adjust Time'}</span>
                    {showFlightTracker ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
              </div>

              {/* Integrated Real-Time Flight Tracker */}
              {(showFlightTracker && (tripType === TripType.AIRPORT || tripType === TripType.POINT_TO_POINT || tripType === TripType.GALVESTON)) && (
                <div className="mb-6">
                  <FlightTrackerWidget
                    onApplyFlightInfo={handleFlightApplied}
                    initialFlightNumber={formData.flightNumber}
                    initialDate={typeof formData.date === 'string' ? formData.date : formData.date()}
                  />
                </div>
              )}

              {/* Flight Sync Status Banner */}
              {trackedFlight && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Check size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>Flight Synced: {trackedFlight.airline} {trackedFlight.flightNumber}</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono">
                          {trackedFlight.status}
                        </span>
                      </div>
                      <div className="text-emerald-300 text-[11px] mt-0.5">
                        Touchdown: {format12Hour(trackedFlight.destination.estimatedArrival)} ➔ Pickup adjusted to <strong className="text-white underline">{format12Hour(formData.time)}</strong> ({trackedFlight.recommendedBufferMinutes}m buffer at {trackedFlight.destination.terminal})
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowFlightTracker(true);
                      const widget = document.getElementById('booking-section');
                      widget?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold self-start sm:self-auto flex items-center space-x-1"
                  >
                    <RefreshCw size={11} />
                    <span>Change Flight</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Pickup Location / Airport
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-amber-500" size={16} />
                    <input
                      type="text"
                      name="pickup"
                      value={formData.pickup}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Bush Intercontinental Airport (IAH) or Address"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Dropoff Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-amber-500" size={16} />
                    <input
                      type="text"
                      name="dropoff"
                      value={formData.dropoff}
                      onChange={handleChange}
                      required
                      placeholder="e.g. The Galleria, Medical Center, or Cruise Terminal"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Estimated Travel Time & Route Summary */}
              <EstimatedTravelTimeCard
                pickup={formData.pickup}
                dropoff={formData.dropoff}
                estimate={routeEstimate}
                onSwapLocations={handleSwapLocations}
                onSelectQuickLocation={handleSelectQuickLocation}
                tripTime={formData.time}
              />

              {/* Date, Time & Flight Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                    <input
                      type="date"
                      name="date"
                      value={typeof formData.date === 'string' ? formData.date : formData.date()}
                      onChange={handleChange}
                      required
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Pickup Time
                    </label>
                    {trackedFlight && (
                      <span className="text-[10px] text-emerald-400 font-bold">Auto-Synced</span>
                    )}
                  </div>
                  <div className="relative">
                    <Clock className={`absolute left-3.5 top-3.5 ${trackedFlight ? 'text-emerald-400' : 'text-gray-400'}`} size={16} />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className={`w-full bg-neutral-950 border rounded-lg p-3 pl-10 text-xs text-white focus:border-amber-500 focus:outline-none ${
                        trackedFlight ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-neutral-700'
                      }`}
                    />
                  </div>
                </div>

                {tripType === TripType.AIRPORT && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                        Airline Name
                      </label>
                      <input
                        type="text"
                        name="airline"
                        value={formData.airline}
                        onChange={handleChange}
                        placeholder="e.g. United, Delta, American"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                        Flight Number
                      </label>
                      <div className="relative">
                        <Plane className="absolute left-3.5 top-3.5 text-amber-500" size={16} />
                        <input
                          type="text"
                          name="flightNumber"
                          value={formData.flightNumber}
                          onChange={handleChange}
                          placeholder="e.g. UA 1428"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {tripType === TripType.HOURLY && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                      Charter Duration (Hours)
                    </label>
                    <select
                      value={hourlyHours}
                      onChange={(e) => setHourlyHours(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 10, 12, 24].map((hr) => (
                        <option key={hr} value={hr}>
                          {hr} Hours Charter ({selectedVehicle.pricePerHour * hr} total)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Vehicle Selection */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4 flex items-center">
                <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 text-xs flex items-center justify-center mr-2 border border-amber-500/40">2</span>
                Select Your Executive Vehicle
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FLEET_DATA.map((car) => {
                  const isSelected = selectedVehicleId === car.id;
                  let carPrice = car.flatRateIAH;
                  if (tripType === TripType.HOURLY) {
                    carPrice = car.pricePerHour * Math.max(hourlyHours, car.minHours);
                  } else if (tripType === TripType.GALVESTON) {
                    carPrice = car.flatRateGalveston;
                  }

                  return (
                    <div
                      key={car.id}
                      onClick={() => setSelectedVehicleId(car.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
                          : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                          <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-amber-400 font-bold border border-amber-500/30">
                            ${carPrice}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-serif font-bold text-white text-sm">{car.name}</h4>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-1 mb-3">{car.category}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-300 pt-2 border-t border-neutral-800/80">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Users size={12} className="text-amber-500 mr-1" />
                            {car.passengers}
                          </span>
                          <span className="flex items-center">
                            <Briefcase size={12} className="text-amber-500 mr-1" />
                            {car.luggage}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-gray-500'}`}>
                          {isSelected ? '✓ Selected' : 'Choose'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Passenger & Contact Info */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4 flex items-center">
                <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 text-xs flex items-center justify-center mr-2 border border-amber-500/40">3</span>
                Passenger & Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Robert Sterling"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Phone Number (SMS Updates) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="(713) 000-0000"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="robert@example.com"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Special Requests & Extras */}
              <div className="mt-5 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="needChildSeat"
                      checked={formData.needChildSeat}
                      onChange={handleChange}
                      className="h-4 w-4 rounded bg-neutral-900 border-neutral-700 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs text-gray-300">
                      Add Child Safety Car Seat <span className="text-amber-400 font-semibold">(+$20 cleaned & sanitized)</span>
                    </span>
                  </label>

                  {formData.needChildSeat && (
                    <select
                      name="childSeatType"
                      value={formData.childSeatType}
                      onChange={handleChange}
                      className="bg-neutral-900 border border-neutral-700 rounded p-1.5 text-xs text-white"
                    >
                      <option value="Rear-Facing Infant (5-22 lbs)">Rear-Facing Infant (5-22 lbs)</option>
                      <option value="Toddler Front-Facing (20-40 lbs)">Toddler Front-Facing (20-40 lbs)</option>
                      <option value="Booster Seat (40-80 lbs)">Booster Seat (40-80 lbs)</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
                    Special Chauffeur Instructions or Requests
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g., Gate code, specific luggage handling, beverage preference, quiet cabin..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Price Summary & Submit Button */}
            <div className="pt-6 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="text-xs uppercase tracking-widest text-gray-400">Guaranteed Transparent Fare</div>
                <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-400">
                  ${costEstimate.total}{' '}
                  <span className="text-xs font-sans text-gray-400 font-normal">
                    {tripType === TripType.HOURLY ? `(${hourlyHours} hrs @ $${selectedVehicle.pricePerHour}/hr)` : 'Flat Rate (Zero Surge)'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Includes taxes, tolls, airport parking, and 60-min wait time.
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-4 px-10 rounded-lg text-xs tracking-widest uppercase transition-all shadow-xl shadow-amber-900/30 hover:scale-105"
                >
                  Confirm & Request Reservation
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-gray-400">
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80 flex items-center justify-center space-x-2">
            <ShieldCheck size={18} className="text-amber-500" />
            <span>100% On-Time Guarantee or Refund</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80 flex items-center justify-center space-x-2">
            <Plane size={18} className="text-amber-500" />
            <span>Automatic Flight Delay Adjustments</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80 flex items-center justify-center space-x-2">
            <Phone size={18} className="text-amber-500" />
            <span>24/7 Live Houston Dispatch</span>
          </div>
        </div>

      </div>

      {/* Booking Confirmation Modal */}
      {submittedBooking && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSubmittedBooking(null)}></div>
          
          <div className="relative bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl border border-amber-500/40 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>

            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Reservation Request Received
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1 mb-2">
              Thank You, {submittedBooking.name}!
            </h3>
            <p className="text-gray-300 text-xs mb-6">
              Your reservation has been dispatched to our 24/7 concierge desk. A confirmation SMS & email will arrive momentarily.
            </p>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-gray-400">Confirmation Code:</span>
                <span className="text-amber-400 font-mono font-bold">{submittedBooking.confirmationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Selected Vehicle:</span>
                <span className="text-white font-semibold">{submittedBooking.vehicle.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date & Time:</span>
                <span className="text-white">{submittedBooking.date} at {submittedBooking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pickup:</span>
                <span className="text-white truncate max-w-[200px]">{submittedBooking.pickup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dropoff:</span>
                <span className="text-white truncate max-w-[200px]">{submittedBooking.dropoff}</span>
              </div>
              {submittedBooking.routeEstimate && (
                <div className="flex justify-between border-t border-neutral-800/80 pt-1.5 text-[11px]">
                  <span className="text-amber-400/90 font-medium">Est. Travel & Distance:</span>
                  <span className="text-white font-medium">
                    {submittedBooking.routeEstimate.durationFormatted} ({submittedBooking.routeEstimate.distanceMiles} mi via {submittedBooking.routeEstimate.primaryHighway.split('&')[0].trim()})
                  </span>
                </div>
              )}
              {submittedBooking.flightNumber && (
                <div className="border-t border-neutral-800 pt-2 space-y-1 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-400 font-bold flex items-center">
                      <Plane size={13} className="mr-1" />
                      Flight Synchronized:
                    </span>
                    <span className="text-white font-mono font-bold bg-neutral-900 px-2 py-0.5 rounded text-[11px] border border-neutral-800">
                      {submittedBooking.airline} {submittedBooking.flightNumber}
                    </span>
                  </div>
                  {submittedBooking.flightDetails && (
                    <div className="text-[11px] text-gray-300 space-y-0.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Route:</span>
                        <span>{submittedBooking.flightDetails.origin.code} ({submittedBooking.flightDetails.origin.city}) ➔ {submittedBooking.flightDetails.destination.code} ({submittedBooking.flightDetails.destination.city})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status & Landing:</span>
                        <span className="text-emerald-400 font-semibold">
                          {submittedBooking.flightDetails.status} ({format12Hour(submittedBooking.flightDetails.destination.estimatedArrival)})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Arrival Terminal:</span>
                        <span className="text-white">{submittedBooking.flightDetails.destination.terminal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Baggage Carousel:</span>
                        <span className="text-amber-300">{submittedBooking.flightDetails.destination.baggageClaim || 'Assigned on arrival'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pickup Grace Period:</span>
                        <span className="text-emerald-300">60 Min Free Wait from Touchdown</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm font-bold">
                <span className="text-gray-300">Estimated Total:</span>
                <span className="text-amber-400">${submittedBooking.totalCost}</span>
              </div>
            </div>

            {/* Google Review Prompt Banner */}
            <div className="bg-gradient-to-r from-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-xl p-3 mb-4 text-left flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Returning AvaLimo Traveler?</div>
                  <div className="text-[10px] text-gray-400">Leave a Google Review & unlock 10% promo code!</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/40 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors flex items-center space-x-1"
              >
                <Star size={12} className="fill-amber-400" />
                <span>Rate Chauffeur</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center"
              >
                Call Dispatch: {COMPANY_INFO.phone}
              </a>
              <a
                href="tel:+18329176331"
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-200 hover:text-amber-300 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center"
              >
                AI Concierge: {COMPANY_INFO.aiConciergePhone}
              </a>
              <button
                onClick={() => setSubmittedBooking(null)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-gray-300 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Google Review Modal */}
      {submittedBooking && (
        <LeaveGoogleReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          prefillData={{
            confirmationCode: submittedBooking.confirmationId,
            passengerName: submittedBooking.name,
            passengerEmail: submittedBooking.email,
            vehicleName: submittedBooking.vehicle?.name,
            tripType: submittedBooking.tripType,
            route: `${submittedBooking.pickup} → ${submittedBooking.dropoff}`
          }}
        />
      )}

    </section>
  );
};

export default BookingForm;

