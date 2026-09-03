import React, { useState, useEffect } from 'react';
import { Plane, Search, Clock, MapPin, AlertCircle, CheckCircle, Sparkles, RefreshCw, Luggage, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { FlightDetails } from '../types';
import { trackFlightNumber, POPULAR_HOUSTON_FLIGHTS, format12Hour, addMinutesToTime } from '../services/flightTrackingService';

interface FlightTrackerWidgetProps {
  onApplyFlightInfo: (info: {
    flightNumber: string;
    airline: string;
    pickupTime: string;
    date?: string;
    terminalPickupLocation?: string;
    flightDetails: FlightDetails;
  }) => void;
  initialFlightNumber?: string;
  initialDate?: string;
  isInsideForm?: boolean;
}

const FlightTrackerWidget: React.FC<FlightTrackerWidgetProps> = ({
  onApplyFlightInfo,
  initialFlightNumber = '',
  initialDate,
  isInsideForm = true,
}) => {
  const [flightInput, setFlightInput] = useState<string>(initialFlightNumber || '');
  const [targetDate, setTargetDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [flightType, setFlightType] = useState<'arrival' | 'departure'>('arrival');
  const [bufferOption, setBufferOption] = useState<'custom' | 'express' | 'standard' | 'international'>('standard');
  const [customBufferMinutes, setCustomBufferMinutes] = useState<number>(35);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [flightData, setFlightData] = useState<FlightDetails | null>(null);
  const [applied, setApplied] = useState<boolean>(false);

  // Sync initial flight number if it changes externally
  useEffect(() => {
    if (initialFlightNumber && initialFlightNumber !== flightInput) {
      setFlightInput(initialFlightNumber);
    }
  }, [initialFlightNumber]);

  // Sync initial date if it changes externally
  useEffect(() => {
    if (initialDate && initialDate !== targetDate) {
      setTargetDate(initialDate);
    }
  }, [initialDate]);

  // Recalculate suggested pickup time when buffer option changes
  useEffect(() => {
    if (!flightData) return;

    let buffer = 35;
    if (bufferOption === 'express') buffer = 15;
    else if (bufferOption === 'standard') buffer = 35;
    else if (bufferOption === 'international') buffer = 65;
    else buffer = customBufferMinutes;

    const estArr = flightData.destination.estimatedArrival;
    const newSuggestedTime = addMinutesToTime(estArr, buffer);

    setFlightData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        recommendedBufferMinutes: buffer,
        suggestedPickupTime: newSuggestedTime,
      };
    });
  }, [bufferOption, customBufferMinutes]);

  const handleTrackFlight = async (flightToTrack?: string) => {
    const query = flightToTrack || flightInput;
    if (!query || query.trim().length < 2) {
      setError('Please enter a flight number (e.g. UA 1428, WN 2241, AA 1092, EK 211).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApplied(false);

    try {
      let buffer = 35;
      if (bufferOption === 'express') buffer = 15;
      else if (bufferOption === 'international') buffer = 65;
      else if (bufferOption === 'custom') buffer = customBufferMinutes;

      const details = await trackFlightNumber(query, targetDate, flightType, buffer);
      setFlightData(details);
      setFlightInput(details.flightNumber);

      // Auto-set buffer option if international is detected
      if (details.isInternational && bufferOption === 'standard') {
        setBufferOption('international');
      }

      // Automatically apply the flight timing and terminal to the parent booking form
      const terminalPickup = `${details.destination.airportName} - ${details.destination.terminal}${
        details.destination.baggageClaim ? ` (${details.destination.baggageClaim})` : ''
      }`;

      onApplyFlightInfo({
        flightNumber: details.flightNumber,
        airline: details.airline,
        pickupTime: details.suggestedPickupTime,
        date: details.suggestedPickupDate || targetDate,
        terminalPickupLocation: terminalPickup,
        flightDetails: details,
      });

      setApplied(true);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve flight tracking data. Please check flight number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreset = (flightCode: string) => {
    setFlightInput(flightCode);
    handleTrackFlight(flightCode);
  };

  const handleApplyManually = () => {
    if (!flightData) return;

    const terminalPickup = `${flightData.destination.airportName} - ${flightData.destination.terminal}${
      flightData.destination.baggageClaim ? ` (${flightData.destination.baggageClaim})` : ''
    }`;

    onApplyFlightInfo({
      flightNumber: flightData.flightNumber,
      airline: flightData.airline,
      pickupTime: flightData.suggestedPickupTime,
      date: flightData.suggestedPickupDate || targetDate,
      terminalPickupLocation: terminalPickup,
      flightDetails: flightData,
    });

    setApplied(true);
  };

  return (
    <div className="bg-neutral-950 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl transition-all relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Plane size={18} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-serif font-bold text-white text-sm sm:text-base">
                Real-Time Flight Tracking & Pickup Sync
              </h4>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                LIVE GPS
              </span>
            </div>
            <p className="text-gray-400 text-xs">
              Enter your flight to automatically adjust chauffeur pickup time and terminal location.
            </p>
          </div>
        </div>

        {/* Direction Switcher */}
        <div className="inline-flex bg-neutral-900 p-1 rounded-lg border border-neutral-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFlightType('arrival')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              flightType === 'arrival'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🛬 Inbound Arrival
          </button>
          <button
            type="button"
            onClick={() => setFlightType('departure')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              flightType === 'departure'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🛫 Outbound Departure
          </button>
        </div>
      </div>

      {/* Input Search Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
        <div className="sm:col-span-8 relative">
          <Plane className="absolute left-3.5 top-3.5 text-amber-500" size={16} />
          <input
            type="text"
            value={flightInput}
            onChange={(e) => {
              setFlightInput(e.target.value.toUpperCase());
              setApplied(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTrackFlight();
              }
            }}
            placeholder="Enter Airline or Flight # (e.g., UA 1428, WN 2241, AA 1092, EK 211)"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 pl-10 text-xs font-medium text-white focus:border-amber-500 focus:outline-none placeholder-gray-500 uppercase tracking-wider"
          />
        </div>

        <div className="sm:col-span-4 flex gap-2">
          <button
            type="button"
            onClick={() => handleTrackFlight()}
            disabled={isLoading || !flightInput.trim()}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-amber-950/40"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Tracking...</span>
              </>
            ) : (
              <>
                <Search size={14} />
                <span>Track & Sync</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Flight Presets for Houston Airports */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
        <span className="text-gray-500 text-[10px] uppercase font-bold mr-1">Popular Houston Flights:</span>
        {POPULAR_HOUSTON_FLIGHTS.slice(0, 6).map((preset) => (
          <button
            key={preset.code}
            type="button"
            onClick={() => handleQuickPreset(preset.code)}
            className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-amber-950/40 border border-neutral-800 hover:border-amber-500/40 text-gray-300 hover:text-amber-300 transition-all font-mono"
            title={preset.desc}
          >
            {preset.code} <span className="text-[9px] text-gray-500">({preset.route})</span>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 mb-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Flight Tracking Results Card */}
      {flightData && (
        <div className="bg-neutral-900 border border-amber-500/40 rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Top Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 font-mono text-xs">
                {flightData.airlineCode}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm sm:text-base font-serif">
                    {flightData.airline}
                  </span>
                  <span className="font-mono text-xs text-amber-400 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                    {flightData.flightNumber}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {flightData.aircraft} • {flightData.isInternational ? '🌍 International Inbound' : '🇺🇸 Domestic Inbound'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center ${
                  flightData.status === 'On Time'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    : flightData.status === 'Delayed'
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30 animate-pulse'
                    : flightData.status === 'Landed'
                    ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                    : 'bg-neutral-800 text-gray-300 border border-neutral-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                {flightData.status}
                {flightData.delayMinutes > 0 && ` (+${flightData.delayMinutes}m)`}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  flightData.dataSource === 'live'
                    ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                    : 'bg-neutral-950 text-gray-400 border-neutral-700'
                }`}
                title={flightData.dataSource === 'live'
                  ? 'Confirmed from live aviation data feed'
                  : 'Estimated schedule — AvaLimo dispatch will confirm exact times and monitor this flight automatically'}
              >
                {flightData.dataSource === 'live' ? '🔴 LIVE' : 'ESTIMATED'}
              </span>
            </div>
          </div>

          {/* Route Visual Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center bg-neutral-950/80 p-4 rounded-xl border border-neutral-800">
            
            {/* Origin */}
            <div className="sm:col-span-4 space-y-1 text-center sm:text-left">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Origin</span>
              <div className="text-xl font-bold font-mono text-white flex items-center justify-center sm:justify-start space-x-1.5">
                <span>{flightData.origin.code}</span>
                <span className="text-xs font-sans text-gray-400 font-normal">({flightData.origin.city})</span>
              </div>
              <div className="text-xs text-gray-300">
                Departs: <span className="font-semibold text-white">{format12Hour(flightData.origin.scheduledDeparture)}</span>
              </div>
              <div className="text-[10px] text-gray-500 truncate max-w-[180px]">
                {flightData.origin.airportName}
              </div>
            </div>

            {/* Flight Path Graphic */}
            <div className="sm:col-span-3 flex flex-col items-center justify-center text-center py-2 sm:py-0">
              <div className="text-[10px] text-amber-500 font-semibold mb-1 flex items-center">
                <Clock size={10} className="mr-1" />
                Live Flight Path
              </div>
              <div className="w-full flex items-center px-2">
                <div className="h-0.5 bg-neutral-700 flex-grow"></div>
                <div className="w-7 h-7 rounded-full bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-1 shadow-md shadow-amber-900/40">
                  <Plane size={14} className="rotate-90" />
                </div>
                <div className="h-0.5 bg-neutral-700 flex-grow"></div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Direct Non-Stop</span>
            </div>

            {/* Destination */}
            <div className="sm:col-span-4 space-y-1 text-center sm:text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Arrival Destination</span>
              <div className="text-xl font-bold font-mono text-amber-400 flex items-center justify-center sm:justify-end space-x-1.5">
                <span>{flightData.destination.code}</span>
                <span className="text-xs font-sans text-gray-300 font-normal">({flightData.destination.city})</span>
              </div>
              <div className="text-xs text-gray-300">
                Touchdown:{' '}
                <span className={`font-semibold ${flightData.status === 'Delayed' ? 'text-amber-400 underline' : 'text-emerald-400'}`}>
                  {format12Hour(flightData.destination.estimatedArrival)}
                </span>
                {flightData.destination.scheduledArrival !== flightData.destination.estimatedArrival && (
                  <span className="text-[10px] text-gray-500 line-through ml-1.5">
                    {format12Hour(flightData.destination.scheduledArrival)}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-gray-400 font-semibold truncate">
                {flightData.destination.terminal}
              </div>
            </div>
          </div>

          {/* Terminal & Luggage Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
              <MapPin size={14} className="text-amber-500 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase">Arrival Terminal</div>
                <div className="font-semibold text-white truncate">{flightData.destination.terminal}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
              <Luggage size={14} className="text-amber-500 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase">Baggage Carousel</div>
                <div className="font-semibold text-white truncate">{flightData.destination.baggageClaim || 'Assigned on Landing'}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center space-x-2">
              <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase">Grace Period</div>
                <div className="font-semibold text-emerald-300">60 Min Free Wait</div>
              </div>
            </div>
          </div>

          {/* Smart Pickup Time Auto-Adjustment Section */}
          <div className="bg-gradient-to-r from-amber-950/30 via-neutral-950 to-amber-950/30 border border-amber-500/40 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center">
                  <Sparkles size={12} className="mr-1" />
                  Auto-Calculated Chauffeur Pickup Time
                </span>
                <div className="text-sm font-semibold text-white mt-0.5">
                  Touchdown ({format12Hour(flightData.destination.estimatedArrival)}) + {flightData.recommendedBufferMinutes}m Buffer ={' '}
                  <span className="text-amber-400 text-base font-bold underline font-mono">
                    {format12Hour(flightData.suggestedPickupTime)} ({flightData.suggestedPickupTime})
                  </span>
                </div>
              </div>

              {applied ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle size={14} />
                  <span>Synced to Form</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyManually}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md flex items-center space-x-1"
                >
                  <span>Apply {format12Hour(flightData.suggestedPickupTime)} to Booking</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {/* Buffer Selector Pills */}
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="text-[11px] text-gray-400 mb-2 flex items-center">
                <Info size={12} className="mr-1 text-amber-500" />
                Select your airport buffer for chauffeur curbside / baggage claim arrival:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBufferOption('express')}
                  className={`p-2 rounded-lg text-left text-xs transition-all border ${
                    bufferOption === 'express'
                      ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>⚡ Carry-On Only</span>
                    <span className="text-[10px] text-amber-400">+15 min</span>
                  </div>
                  <div className="text-[10px] text-gray-400">Direct walk to curbside</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBufferOption('standard')}
                  className={`p-2 rounded-lg text-left text-xs transition-all border ${
                    bufferOption === 'standard'
                      ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>🧳 Domestic Checked Bags</span>
                    <span className="text-[10px] text-amber-400">+35 min</span>
                  </div>
                  <div className="text-[10px] text-gray-400">Standard carousel retrieval</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBufferOption('international')}
                  className={`p-2 rounded-lg text-left text-xs transition-all border ${
                    bufferOption === 'international'
                      ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>🌍 International Customs</span>
                    <span className="text-[10px] text-amber-400">+65 min</span>
                  </div>
                  <div className="text-[10px] text-gray-400">Passport control & customs</div>
                </button>
              </div>
            </div>

            {/* Tracking Note */}
            <div className="text-[11px] text-gray-400 italic bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
              💡 {flightData.trackingNote}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default FlightTrackerWidget;
