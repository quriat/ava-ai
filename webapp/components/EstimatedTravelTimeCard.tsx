import React from 'react';
import { 
  Clock, 
  Navigation, 
  MapPin, 
  ArrowRight, 
  ArrowLeftRight, 
  ShieldCheck, 
  Sparkles, 
  Gauge, 
  Info,
  TrendingUp,
  Plane,
  Anchor
} from 'lucide-react';
import { RouteEstimate } from '../types';
import { HOUSTON_LOCATIONS } from '../services/routeCalculationService';

interface EstimatedTravelTimeCardProps {
  pickup: string;
  dropoff: string;
  estimate: RouteEstimate;
  onSwapLocations?: () => void;
  onSelectQuickLocation?: (locationName: string, isDropoff: boolean) => void;
  tripTime?: string;
}

const EstimatedTravelTimeCard: React.FC<EstimatedTravelTimeCardProps> = ({
  pickup,
  dropoff,
  estimate,
  onSwapLocations,
  onSelectQuickLocation,
  tripTime,
}) => {
  const isAirportRoute = 
    pickup.toLowerCase().includes('iah') || 
    pickup.toLowerCase().includes('hobby') || 
    dropoff.toLowerCase().includes('iah') || 
    dropoff.toLowerCase().includes('hobby') ||
    pickup.toLowerCase().includes('airport') ||
    dropoff.toLowerCase().includes('airport');

  const isCruiseRoute = 
    pickup.toLowerCase().includes('galveston') || 
    dropoff.toLowerCase().includes('galveston') ||
    pickup.toLowerCase().includes('cruise') ||
    dropoff.toLowerCase().includes('cruise');

  const getTrafficBadge = (level: RouteEstimate['trafficLevel']) => {
    switch (level) {
      case 'Heavy':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          label: 'Heavy Volume (Buffer Added)',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-900/60 text-amber-200 border-amber-500/30',
          label: 'Moderate Traffic',
        };
      case 'Low':
        return {
          bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
          label: 'Light Traffic (Off-Peak)',
        };
      case 'Optimal Flow':
      default:
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
          label: 'Optimal Flow (Express Lanes)',
        };
    }
  };

  const trafficBadge = getTrafficBadge(estimate.trafficLevel);

  return (
    <div className="mt-4 bg-gradient-to-br from-neutral-950 via-neutral-900/90 to-neutral-950 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Subtle accent glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Navigation size={13} className="text-amber-400" />
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
            Dynamic Route & Travel Time Estimate
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold flex items-center space-x-1 ${trafficBadge.bg}`}>
            <span className="relative flex h-1.5 w-1.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>{trafficBadge.label}</span>
          </span>

          {onSwapLocations && (
            <button
              type="button"
              onClick={onSwapLocations}
              title="Swap pickup and dropoff locations"
              className="text-[11px] text-gray-400 hover:text-amber-400 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-2 py-1 rounded transition-colors flex items-center space-x-1"
            >
              <ArrowLeftRight size={12} />
              <span className="hidden sm:inline">Swap</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Metric Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3.5">
        {/* Estimated Duration */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Est. Travel Time
            </div>
            <div className="text-base sm:text-lg font-serif font-bold text-white flex items-baseline space-x-1">
              <span>{estimate.durationRangeFormatted}</span>
            </div>
            <div className="text-[10px] text-amber-400/90 font-mono">
              Typical: ~{estimate.durationFormatted}
            </div>
          </div>
        </div>

        {/* Driving Distance */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Gauge size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Total Highway Distance
            </div>
            <div className="text-base sm:text-lg font-serif font-bold text-white">
              {estimate.distanceMiles} <span className="text-xs font-sans text-gray-400 font-normal">Miles</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
              <ShieldCheck size={11} />
              <span>EZ-Tag Tolls Included</span>
            </div>
          </div>
        </div>

        {/* Primary Highway Corridor */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <TrendingUp size={20} />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Chauffeur Optimal Route
            </div>
            <div className="text-xs font-bold text-amber-300 truncate" title={estimate.primaryHighway}>
              {estimate.primaryHighway}
            </div>
            <div className="text-[10px] text-gray-400 truncate" title={estimate.routeSummary}>
              {estimate.routeSummary}
            </div>
          </div>
        </div>
      </div>

      {/* Advisory & Buffer Recommendations */}
      {estimate.recommendedDepartureNote && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 flex items-start space-x-2 text-[11px] text-amber-200">
          <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Chauffeur Advisory:</strong> {estimate.recommendedDepartureNote}
          </div>
        </div>
      )}

      {/* Quick Location Shortcuts for fast testing & selection */}
      {onSelectQuickLocation && (
        <div className="pt-2.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            Quick Hub Select:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'IAH Airport', isDropoff: false },
              { label: 'Hobby (HOU)', isDropoff: false },
              { label: 'Downtown', isDropoff: true },
              { label: 'The Galleria', isDropoff: true },
              { label: 'Galveston Cruise', isDropoff: true },
              { label: 'The Woodlands', isDropoff: true },
              { label: 'Medical Center', isDropoff: true },
              { label: 'Sugar Land', isDropoff: true },
            ].map((hub) => (
              <button
                key={hub.label}
                type="button"
                onClick={() => onSelectQuickLocation(hub.label, hub.isDropoff)}
                className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-gray-300 hover:text-amber-300 border border-neutral-700 hover:border-amber-500/40 transition-colors font-medium"
              >
                + {hub.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimatedTravelTimeCard;
