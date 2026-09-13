import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, User, Mail, Phone, Plane, Users, Briefcase, Check, Sparkles, AlertCircle, RefreshCw, Navigation, ShieldCheck } from 'lucide-react';
import { VehicleType, TripType, FlightDetails, RouteEstimate } from '../types';
import { FLEET_DATA, COMPANY_INFO } from '../data/avalimoData';
import { trackFlightNumber, format12Hour } from '../services/flightTrackingService';
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('cadillac-escalade-esv');
  const [hourlyHours, setHourlyHours] = useState<number>(3);
  const [showFlightTracker, setShowFlightTracker] = useState<boolean>(true);
  const [trackedFlight, setTrackedFlight] = useState<FlightDetails | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

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
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

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

  const trackFlight = async () => {
    if (!formData.flightNumber.trim()) return;
    setTrackingLoading(true);
    try {
      const date = typeof formData.date === 'string' ? formData.date : formData.date();
      const details = await trackFlightNumber(formData.flightNumber, date, 'arrival');
      setTrackedFlight(details);
      setFormData(prev => ({
        ...prev,
        airline: details.airline,
        time: details.suggestedPickupTime,
        date: details.suggestedPickupDate || prev.date,
        pickup: details.destination.airportName,
        specialInstructions: `${prev.specialInstructions ? prev.specialInstructions + '\n' : ''}Flight: ${details.flightNumber} | Status: ${details.status} | Estimated arrival: ${format12Hour(details.destination.estimatedArrival)}`.trim()
      }));
    } catch (err) {
      alert('Could not track flight. Please check the flight number and try again.');
    } finally {
      setTrackingLoading(false);
    }
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
      const emailBody = formatBookingEmail(submission);
      const webhookUrl = process.env.BOOKING_WEBHOOK_URL;

      let response;
      if (webhookUrl) {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            confirmationId,
            ...formData,
            tripType,
            vehicle: selectedVehicle,
            hours: tripType === TripType.HOURLY ? hourlyHours : undefined,
            flightDetails: trackedFlight,
            routeEstimate,
            totalCost: costEstimate.total,
            emailBody,
            _subject: `New AvaLimo Reservation Request - ${confirmationId}`
          })
        });
      } else {
        response = await fetch(`https://formsubmit.co/ajax/${process.env.BOOKING_EMAIL || COMPANY_INFO.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: emailBody,
            _subject: `New AvaLimo Reservation Request - ${confirmationId}`,
            _template: 'table'
          })
        });
      }

      if (response.ok) {
        setSubmittedBooking(submission);
        setSubmitStatus('success');
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setSubmitStatus('error');
      setSubmittedBooking(submission);
    }
  };

  const formatBookingEmail = (data: any) => {
    return `
NEW AVALIMO RESERVATION REQUEST

Confirmation: ${data.confirmationId}
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

Route Estimate: ${data.routeEstimate?.durationFormatted || 'N/A'} via ${data.routeEstimate?.primaryHighway || 'N/A'}
Submitted at: ${data.submittedAt}
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
                  <button
                    type="button"
                    onClick={() => setShowFlightTracker(!showFlightTracker)}
                    className="text-xs text-[var(--gold)] hover:text-white font-semibold flex items-center gap-1 bg-white/5 border border-white/10 hover:border-gold/40 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plane size={13} />
                    <span>{showFlightTracker ? 'Hide Flight Tracker' : 'Track Flight'}</span>
                  </button>
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
                      onClick={trackFlight}
                      disabled={trackingLoading || !formData.flightNumber.trim()}
                      className="bg-[var(--gold)] text-black px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {trackingLoading ? 'Tracking...' : 'Track'}
                    </button>
                  </div>
                  {trackedFlight && (
                    <div className="text-xs text-white/70 bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Check size={14} className="text-emerald-400" />
                        <span className="font-semibold text-white">Flight synced: {trackedFlight.airline} {trackedFlight.flightNumber}</span>
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">{trackedFlight.status}</span>
                      </div>
                      <div className="text-white/60">
                        Touchdown: {format12Hour(trackedFlight.destination.estimatedArrival)} → Pickup adjusted to <strong className="text-white">{format12Hour(formData.time)}</strong>
                      </div>
                    </div>
                  )}
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
                    <span className="text-xs font-bold uppercase tracking-wider">Route Estimate</span>
                  </div>
                  <span className="text-[11px] text-white/50">{routeEstimate.trafficLevel}</span>
                </div>
                <div className="text-white text-sm font-semibold mb-1">
                  {routeEstimate.durationFormatted} • {routeEstimate.distanceMiles} miles via {routeEstimate.primaryHighway}
                </div>
                <p className="text-[11px] text-white/40">{routeEstimate.routeSummary}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 text-white/40" size={16} />
                  <input
                    type="date"
                    name="date"
                    value={typeof formData.date === 'string' ? formData.date : formData.date()}
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
                {submitStatus === 'sending' ? 'Sending...' : 'Confirm & Request Reservation'}
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
            <span>Automatic Flight Delay Adjustments</span>
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
              {submitStatus === 'success' || submitStatus === 'idle' ? <Check size={36} /> : <AlertCircle size={36} />}
            </div>

            <span className="text-xs uppercase tracking-widest text-[var(--gold)] font-bold">
              {submitStatus === 'success' ? 'Reservation Request Received' : 'Request Saved'}
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1 mb-2">
              Thank You, {submittedBooking.name}!
            </h3>
            <p className="text-white/60 text-xs mb-6">
              {submitStatus === 'success'
                ? 'Your reservation has been emailed to our 24/7 concierge desk. A confirmation SMS & email will arrive momentarily.'
                : 'Your request was prepared but could not be emailed automatically. Please call dispatch to confirm.'}
            </p>

            <div className="bg-black p-4 rounded-xl border border-white/10 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40">Confirmation Code:</span>
                <span className="text-[var(--gold)] font-mono font-bold">{submittedBooking.confirmationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Vehicle:</span>
                <span className="text-white font-semibold">{submittedBooking.vehicle.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Date & Time:</span>
                <span className="text-white">{typeof submittedBooking.date === 'string' ? submittedBooking.date : submittedBooking.date()} at {submittedBooking.time}</span>
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
