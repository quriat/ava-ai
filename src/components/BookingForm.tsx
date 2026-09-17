import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, User, Mail, Phone, Plane, Users, Briefcase, Check, Sparkles, AlertCircle, Navigation, ShieldCheck } from 'lucide-react';
import { VehicleType, TripType, RouteEstimate } from '../types';
import { FLEET_DATA, COMPANY_INFO } from '../data/avalimoData';
import { calculateRouteEstimate } from '../services/routeCalculationService';
import { submitBookingRequest } from '../services/bookingService';

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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('cadillac-escalade-esv');
  const [hourlyHours, setHourlyHours] = useState<number>(3);
  const [showFlightTracker] = useState<boolean>(true);
  const [trackedFlight, setTrackedFlight] = useState<{ flightNumber: string; airline?: string } | null>(null);
  const [trackingNote, setTrackingNote] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    time: '14:30',
    pickup: 'George Bush Intercontinental Airport (IAH)',
    dropoff: 'Downtown Houston / Galleria',
    flightNumber: '',
    airline: '',
    passengers: 2,
    luggage: 2,
    specialInstructions: '',
    needChildSeat: false,
    needMeetAndGreet: true,
  });

  const [submittedBooking, setSubmittedBooking] = useState<any | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'fallback'>('idle');
  const [submitResult, setSubmitResult] = useState<{ status: 'success' | 'error' | 'fallback'; message: string; reference?: string } | null>(null);

  const routeEstimate: RouteEstimate = useMemo(() => {
    return calculateRouteEstimate(formData.pickup, formData.dropoff, formData.time);
  }, [formData.pickup, formData.dropoff, formData.time]);

  useEffect(() => {
    if (initialData) {
      if (initialData.tripType) setTripType(initialData.tripType);
      if (initialData.vehicleId) setSelectedVehicleId(initialData.vehicleId);
      if (initialData.pickupLocation) {
        setFormData(prev => ({ ...prev, pickup: initialData.pickupLocation || prev.pickup }));
      }
      if (initialData.dropoffLocation) {
        setFormData(prev => ({ ...prev, dropoff: initialData.dropoffLocation || prev.dropoff }));
      }
      if (initialData.date) {
        setFormData(prev => ({ ...prev, date: initialData.date || prev.date }));
      }
      if (initialData.flightNumber) {
        setFormData(prev => ({ ...prev, flightNumber: initialData.flightNumber || prev.flightNumber }));
      }
      if (initialData.specialInstructions) {
        setFormData(prev => ({ ...prev, specialInstructions: initialData.specialInstructions || prev.specialInstructions }));
      }
    }
  }, [initialData]);

  const selectedVehicle = FLEET_DATA.find(v => v.id === selectedVehicleId) || FLEET_DATA[1];

  const captureFlight = () => {
    if (!formData.flightNumber.trim()) return;
    setTrackedFlight({ flightNumber: formData.flightNumber, airline: formData.airline });
    setTrackingNote('Flight number recorded. Our dispatch team will monitor your flight and adjust pickup as needed.');
    setFormData(prev => ({
      ...prev,
      specialInstructions: `${prev.specialInstructions ? prev.specialInstructions + '\n' : ''}Flight: ${formData.flightNumber}${prev.airline ? ` | Airline: ${prev.airline}` : ''}`.trim()
    }));
  };

  const calculateEstimatedTotal = () => {
    let base = 0;
    if (tripType === TripType.HOURLY) {
      base = selectedVehicle.pricePerHour * Math.max(hourlyHours, selectedVehicle.minHours);
    } else if (tripType === TripType.GALVESTON) {
      base = selectedVehicle.flatRateGalveston;
    } else if (tripType === TripType.AIRPORT) {
      const isHobby = formData.pickup.toLowerCase().includes('hobby') || formData.dropoff.toLowerCase().includes('hobby');
      base = isHobby ? selectedVehicle.flatRateHobby : selectedVehicle.flatRateIAH;
    } else {
      base = selectedVehicle.flatRateIAH;
    }
    let extras = 0;
    if (formData.needChildSeat) extras += 20;
    return { base, extras, total: base + extras };
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
    setTrackedFlight(null);
    if (type === TripType.AIRPORT) {
      setFormData(prev => ({ ...prev, pickup: 'George Bush Intercontinental Airport (IAH)', dropoff: 'Downtown Houston / Galleria' }));
    } else if (type === TripType.GALVESTON) {
      setFormData(prev => ({ ...prev, pickup: 'George Bush Intercontinental Airport (IAH)', dropoff: 'Port of Galveston Cruise Terminal' }));
    } else if (type === TripType.HOURLY) {
      setFormData(prev => ({ ...prev, pickup: 'Downtown Houston / Galleria', dropoff: 'As Directed (Hourly Chauffeur)' }));
    } else if (type === TripType.POINT_TO_POINT) {
      setFormData(prev => ({ ...prev, pickup: 'The Galleria / Uptown Post Oak', dropoff: 'Downtown Houston / Galleria' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('sending');

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

    try {
      const result = await submitBookingRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pickup: formData.pickup,
        dropoff: formData.dropoff,
        date: formData.date,
        time: formData.time,
        passengers: Number(formData.passengers) || 1,
        luggage: Number(formData.luggage) || 0,
        vehicle: selectedVehicle.name,
        tripType,
        hours: tripType === TripType.HOURLY ? hourlyHours : undefined,
        flightNumber: formData.flightNumber || undefined,
        airline: formData.airline || undefined,
        childSeat: formData.needChildSeat,
        specialInstructions: formData.specialInstructions,
        estimatedTotal: costEstimate.total,
      });

      setSubmitResult({
        status: result.status,
        message: result.message,
        reference: result.reference,
      });

      if (result.ok) {
        setSubmittedBooking(submission);
        setSubmitStatus('success');
      } else {
        // Even on error/fallback we show the modal with the reference the user should cite.
        setSubmittedBooking(submission);
        setSubmitStatus(result.status);
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setSubmitStatus('error');
      setSubmitResult({ status: 'error', message: 'Booking request could not be sent. Please call dispatch.' });
      setSubmittedBooking(submission);
    }
  };

  const formatBookingEmail = (data: any) => {
    return `
NEW AVALIMO RESERVATION REQUEST

Request Reference: ${data.confirmationId}
Customer: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

Trip Type: ${data.tripType}
Date: ${typeof data.date === 'string' ? data.date : data.date()}
Time: ${data.time}
Pickup: ${data.pickup}
Dropoff: ${data.dropoff}
Passengers: ${data.passengers}
Luggage: ${data.luggage}

Vehicle: ${data.vehicle.name}
Estimated Total: $${data.totalCost}

Flight Number: ${data.flightNumber || 'N/A'}
Airline: ${data.airline || 'N/A'}
Special Requests: ${data.specialInstructions || 'None'}

Route / Timing: ${data.routeEstimate?.durationFormatted || 'To be confirmed'}
Submitted at: ${data.submittedAt}

NOTE: This is a reservation request. Dispatch must confirm availability and chauffeur assignment before it is a confirmed booking.
    `.trim();
  };

  return (
    <section className="py-24 bg-black text-white relative" id="booking-section">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-[var(--gold)] text-xs font-bold tracking-widest uppercase mb-3">
            <Sparkles size={14} />
            <span>Instant Reservation Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Reserve Your Chauffeur
          </h2>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed">
            All rates are guaranteed flat fares with zero surge pricing. Real-time flight tracking, 60 minutes free airport wait time, and complimentary bottled water.
          </p>
        </div>

        <div className="bg-luxury border border-gold/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/10 bg-black/40 p-2 gap-1">
            {[
              { type: TripType.AIRPORT, label: '✈️ Airport' },
              { type: TripType.GALVESTON, label: '⚓ Galveston' },
              { type: TripType.POINT_TO_POINT, label: '📍 Point to Point' },
              { type: TripType.HOURLY, label: '⏱️ Hourly' },
            ].map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => handleTripTypeChange(tab.type)}
                className={`py-3 px-2 text-[10px] font-bold rounded-lg transition-all ${
                  tripType === tab.type
                    ? 'bg-[var(--gold)] text-black shadow-lg'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)] flex items-center">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-[var(--gold)] text-xs flex items-center justify-center mr-2 border border-gold/40">1</span>
                  Pickup & Dropoff Details
                </h3>

        {(tripType === TripType.AIRPORT || tripType === TripType.GALVESTON || tripType === TripType.POINT_TO_POINT) && (
          <div className="text-[10px] text-white/40 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Flight number capture
          </div>
        )}
              </div>

              {showFlightTracker && (tripType === TripType.AIRPORT || tripType === TripType.GALVESTON || tripType === TripType.POINT_TO_POINT) && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      name="flightNumber"
                      value={formData.flightNumber}
                      onChange={handleChange}
                      placeholder="e.g. UA 1428"
                      className="flex-1 bg-black border border-white/20 rounded-lg p-3 pl-10 text-xs text-white focus:border-[var(--gold)] focus:outline-none relative"
                    />
                    <Plane className="absolute left-4 mt-3.5 text-[var(--gold)]" size={16} />
                    <button
                      type="button"
                      onClick={captureFlight}
                      disabled={!formData.flightNumber.trim()}
                      className="bg-[var(--gold)] text-black px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                  {trackedFlight && (
                    <div className="text-xs text-white/70 bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Check size={14} className="text-emerald-400" />
                        <span className="font-semibold text-white">Flight recorded: {trackedFlight.airline || ''} {trackedFlight.flightNumber}</span>
                      </div>
                      <div className="text-white/60">{trackingNote}</div>
                    </div>
                  )}
                  <p className="text-[10px] text-white/40 mt-2">
                    Live flight status is not shown on the website. Dispatch monitors flights directly.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-[var(--gold)]" size={16} />
                  <input
                    type="text"
                    name="pickup"
                    value={formData.pickup}
                    onChange={handleChange}
                    required
                    placeholder="Pickup location"
                    className="w-full bg-black border border-white/20 rounded-lg p-3 pl-10 text-xs text-white focus:border-[var(--gold)] focus:outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-[var(--gold)]" size={16} />
                  <input
                    type="text"
                    name="dropoff"
                    value={formData.dropoff}
                    onChange={handleChange}
                    required
                    placeholder="Dropoff destination"
                    className="w-full bg-black border border-white/20 rounded-lg p-3 pl-10 text-xs text-white focus:border-[var(--gold)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[var(--gold)]">
                    <Navigation size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Route / Timing</span>
                  </div>
                </div>
                <div className="text-white text-sm font-semibold mb-1">
                  {routeEstimate.durationFormatted}
                </div>
                <p className="text-[11px] text-white/40">{routeEstimate.routeSummary}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 text-white/40" size={16} />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-white/20 rounded-lg p-3 pl-10 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Clock className={`absolute left-3.5 top-3.5 ${trackedFlight ? 'text-emerald-400' : 'text-white/40'}`} size={16} />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className={`w-full bg-black border rounded-lg p-3 pl-10 text-xs text-white focus:border-[var(--gold)] focus:outline-none ${trackedFlight ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-white/20'}`}
                  />
                </div>
                {tripType === TripType.AIRPORT && (
                  <>
                    <input
                      type="text"
                      name="airline"
                      value={formData.airline}
                      onChange={handleChange}
                      placeholder="Airline"
                      className="bg-black border border-white/20 rounded-lg p-3 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
                    />
                    <input
                      type="text"
                      name="flightNumber"
                      value={formData.flightNumber}
                      onChange={handleChange}
                      placeholder="Flight #"
                      className="bg-black border border-white/20 rounded-lg p-3 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
                    />
                  </>
                )}
                {tripType === TripType.HOURLY && (
                  <div className="sm:col-span-2">
                    <select
                      value={hourlyHours}
                      onChange={(e) => setHourlyHours(Number(e.target.value))}
                      className="w-full bg-black border border-white/20 rounded-lg p-3 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 10, 12, 24].map((hr) => (
                        <option key={hr} value={hr}>
                          {hr} Hours (${selectedVehicle.pricePerHour * hr})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)] mb-4 flex items-center">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-[var(--gold)] text-xs flex items-center justify-center mr-2 border border-gold/40">2</span>
                Select Your Executive Vehicle
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FLEET_DATA.map((car) => {
                  const isSelected = selectedVehicleId === car.id;
                  let carPrice = car.flatRateIAH;
                  if (tripType === TripType.HOURLY) carPrice = car.pricePerHour * Math.max(hourlyHours, car.minHours);
                  else if (tripType === TripType.GALVESTON) carPrice = car.flatRateGalveston;
                  else if (tripType === TripType.AIRPORT) {
                    const isHobby = formData.pickup.toLowerCase().includes('hobby') || formData.dropoff.toLowerCase().includes('hobby');
                    carPrice = isHobby ? car.flatRateHobby : car.flatRateIAH;
                  }

                  return (
                    <div
                      key={car.id}
                      onClick={() => setSelectedVehicleId(car.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[var(--gold)] bg-gold/10 ring-1 ring-[var(--gold)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                          <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-[var(--gold)] font-bold border border-gold/30">
                            ${carPrice}
                          </div>
                        </div>
                        <h4 className="font-serif font-bold text-white text-sm">{car.name}</h4>
                        <p className="text-[11px] text-white/40 line-clamp-1 mb-3">{car.category}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-white/60 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Users size={12} className="text-[var(--gold)]" />{car.passengers}</span>
                          <span className="flex items-center gap-1"><Briefcase size={12} className="text-[var(--gold)]" />{car.luggage}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-[var(--gold)]' : 'text-white/30'}`}>
                          {isSelected ? '✓ Selected' : 'Choose'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--gold)] mb-4 flex items-center">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-[var(--gold)] text-xs flex items-center justify-center mr-2 border border-gold/40">3</span>
                Passenger & Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-white/40" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                    className="w-full bg-black border border-white/20 rounded-lg p-3 pl-10 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 text-white/40" size={16} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Phone Number"
                    className="w-full bg-black border border-white/20 rounded-lg p-3 pl-10 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-white/40" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email Address"
                    className="w-full bg-black border border-white/20 rounded-lg p-3 pl-10 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="needChildSeat"
                    checked={formData.needChildSeat}
                    onChange={handleChange}
                    className="h-4 w-4 rounded bg-black border-white/20 text-[var(--gold)]"
                  />
                  <span className="text-xs text-white/70">
                    Add Child Safety Car Seat <span className="text-[var(--gold)] font-semibold">(+$20)</span>
                  </span>
                </label>
                <div>
                  <label className="block text-[11px] font-medium text-white/40 mb-1 uppercase tracking-wider">Special Requests</label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Gate code, luggage handling, beverage preference..."
                    className="w-full bg-black border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="text-xs uppercase tracking-widest text-white/40">Guaranteed Transparent Fare</div>
                <div className="text-3xl sm:text-4xl font-serif font-bold text-[var(--gold)]">
                  ${costEstimate.total}{' '}
                  <span className="text-xs font-sans text-white/40 font-normal">
                    {tripType === TripType.HOURLY ? `(${hourlyHours} hrs @ $${selectedVehicle.pricePerHour}/hr)` : 'Flat Rate'}
                  </span>
                </div>
                <p className="text-[11px] text-white/40">Includes taxes, tolls, airport parking, and 60-min wait time.</p>
              </div>

          <button
            type="submit"
            disabled={submitStatus === 'sending'}
            className="w-full md:w-auto gold-gradient text-black font-bold py-4 px-10 rounded-lg text-xs tracking-widest uppercase transition-all hover:scale-105 shadow-xl shadow-gold/20 disabled:opacity-50"
          >
            {submitStatus === 'sending' ? 'Sending Request...' : 'Request Reservation'}
          </button>
        </div>
          </form>
        </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-white/50">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2">
            <ShieldCheck size={18} className="text-[var(--gold)]" />
            <span>100% On-Time Guarantee or Refund</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2">
            <Plane size={18} className="text-[var(--gold)]" />
            <span>Manual Flight Monitoring by Dispatch</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2">
            <Phone size={18} className="text-[var(--gold)]" />
            <span>24/7 Live Houston Dispatch</span>
          </div>
        </div>
      </div>

      {submittedBooking && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSubmittedBooking(null)}></div>
          <div className="relative bg-luxury w-full max-w-lg rounded-2xl shadow-2xl border border-gold/40 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gold/20 border border-[var(--gold)] text-[var(--gold)] flex items-center justify-center mx-auto mb-4">
              {submitStatus === 'success' ? <Check size={36} /> : <AlertCircle size={36} />}
            </div>

            <span className="text-xs uppercase tracking-widest text-[var(--gold)] font-bold">
              {submitStatus === 'success' ? 'Reservation Request Received' : 'Request Received — Needs Confirmation'}
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1 mb-2">
              Thank You, {submittedBooking.name}!
            </h3>
            <p className="text-white/60 text-xs mb-6">
              {submitStatus === 'success'
                ? 'Your request has been forwarded to dispatch. A dispatcher will confirm availability, final quote, and chauffeur assignment.'
                : (submitResult && submitResult.message) || 'Your request was recorded. Please call dispatch to confirm.'}
            </p>

            <div className="bg-black p-4 rounded-xl border border-white/10 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40">Request Reference:</span>
                <span className="text-[var(--gold)] font-mono font-bold">{submittedBooking.confirmationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Vehicle:</span>
                <span className="text-white font-semibold">{submittedBooking.vehicle.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Date & Time:</span>
                <span className="text-white">{submittedBooking.date} at {submittedBooking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Pickup:</span>
                <span className="text-white truncate max-w-[200px]">{submittedBooking.pickup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Dropoff:</span>
                <span className="text-white truncate max-w-[200px]">{submittedBooking.dropoff}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold">
                <span className="text-white/70">Estimated Total:</span>
                <span className="text-[var(--gold)]">${submittedBooking.totalCost}</span>
              </div>
              <div className="text-white/40 text-[10px] pt-1">
                This is a reservation request, not a confirmed booking, until dispatch approves.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center"
              >
                Call Dispatch: {COMPANY_INFO.phone}
              </a>
              <button
                onClick={() => setSubmittedBooking(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BookingForm;
