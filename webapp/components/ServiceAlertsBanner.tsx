import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Radio, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  Navigation, 
  Car, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Plane,
  Anchor
} from 'lucide-react';
import { ServiceAlert, HoustonCorridorStatus } from '../types';
import { HOUSTON_SERVICE_ALERTS, HOUSTON_CORRIDORS } from '../data/serviceAlertsData';

interface ServiceAlertsBannerProps {
  onOpenBooking?: () => void;
  onAskAI?: (promptText?: string) => void;
}

const ServiceAlertsBanner: React.FC<ServiceAlertsBannerProps> = ({ onOpenBooking, onAskAI }) => {
  const [alerts, setAlerts] = useState<ServiceAlert[]>(HOUSTON_SERVICE_ALERTS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showFullModal, setShowFullModal] = useState<boolean>(false);
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<string>('All');
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');

  // Auto-rotate alerts every 6.5 seconds unless hovered or modal open
  useEffect(() => {
    if (isPaused || showFullModal || isMinimized) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, showFullModal, isMinimized, alerts.length]);

  // Update refresh time text periodically
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastRefreshedTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const currentAlert = alerts[currentIndex] || alerts[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % alerts.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
  };

  const filteredAlerts = selectedCorridorFilter === 'All'
    ? alerts
    : alerts.filter((a) => a.corridor.toLowerCase().includes(selectedCorridorFilter.toLowerCase()));

  // Render minimized floating pill if dismissed/minimized
  if (isMinimized) {
    return (
      <div className="bg-neutral-950/95 border-b border-amber-500/20 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400">Houston Service Alerts</span>
            <span className="text-gray-400 hidden sm:inline">• IAH Hardy Express Fast • Galveston Clear</span>
            <span className="underline text-[10px] ml-1 text-gray-300 hover:text-white">Show Live Bar</span>
          </button>

          <button
            onClick={() => setShowFullModal(true)}
            className="text-[11px] text-gray-300 hover:text-amber-400 font-medium flex items-center space-x-1"
          >
            <Radio size={12} className="text-amber-500 animate-pulse" />
            <span>View All Corridors</span>
          </button>
        </div>
      </div>
    );
  }

  // Severity color configurations
  const getSeverityBadge = (severity: ServiceAlert['severity']) => {
    switch (severity) {
      case 'warning':
      case 'critical':
        return {
          bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
          icon: <AlertTriangle size={13} className="text-amber-400 animate-bounce-slow" />,
          label: 'Traffic Advisory'
        };
      case 'advisory':
        return {
          bg: 'bg-amber-950/60 border-amber-500/30 text-amber-200',
          icon: <Info size={13} className="text-amber-400" />,
          label: 'Roadwork Delay'
        };
      case 'optimal':
      default:
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
          icon: <CheckCircle2 size={13} className="text-emerald-400" />,
          label: 'Corridor Clear'
        };
    }
  };

  const badgeConfig = getSeverityBadge(currentAlert.severity);

  return (
    <>
      {/* Top Real-Time Houston Service Alerts Bar */}
      <div 
        className="relative z-50 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-amber-500/30 text-xs shadow-lg shadow-black/40 transition-all"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Live Indicator & Channel Tag */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-1.5 bg-neutral-950 px-2.5 py-1 rounded-md border border-amber-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  TRAFFIC ALERT
                </span>
              </div>

              {/* Corridor Badge */}
              <span className="hidden md:inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-gray-300 border border-neutral-700">
                {currentAlert.corridor}
              </span>
            </div>

            {/* Main Alert Headline & Ticker */}
            <div 
              className="flex-1 flex items-center overflow-hidden cursor-pointer group"
              onClick={() => setShowFullModal(true)}
              title="Click to view detailed Houston airport traffic & road report"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeConfig.bg} flex-shrink-0`}>
                  {badgeConfig.icon}
                  <span className="ml-1 hidden sm:inline">{badgeConfig.label}</span>
                </span>

                <span className="font-semibold text-white group-hover:text-amber-300 transition-colors text-xs truncate">
                  {currentAlert.title}:
                </span>
                <span className="text-gray-300 hidden lg:inline truncate text-xs">
                  {currentAlert.summary}
                </span>
              </div>
            </div>

            {/* Quick Actions & Controls */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Expand Details Trigger */}
              <button
                type="button"
                onClick={() => setShowFullModal(true)}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-950/80 border border-amber-500/30 px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 shadow-sm"
              >
                <Radio size={12} className="text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Live Road Status</span>
                <ChevronRight size={12} />
              </button>

              {/* Prev / Next Carousel Controls */}
              <div className="hidden sm:flex items-center space-x-0.5 bg-neutral-950 rounded border border-neutral-800 p-0.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 hover:text-amber-400 text-gray-400 transition-colors"
                  aria-label="Previous alert"
                  title="Previous Houston alert"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="text-[9px] font-mono text-gray-400 px-1">
                  {currentIndex + 1}/{alerts.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 hover:text-amber-400 text-gray-400 transition-colors"
                  aria-label="Next alert"
                  title="Next Houston alert"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Minimize/Close Button */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
                title="Minimize alerts banner"
                aria-label="Minimize"
              >
                <Minimize2 size={13} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Comprehensive Houston Road Conditions & Corridor Status Modal */}
      {showFullModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-neutral-900 border border-amber-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-800 bg-neutral-950 flex items-start justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                  <Navigation size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                      Houston Airport & Metro Road Conditions
                    </h3>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      LIVE DISPATCH
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Real-time telemetry from Houston TranStar, TxDOT, and AvaLimo executive fleet dispatch.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFullModal(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Corridor Filter Tabs */}
            <div className="px-5 sm:px-6 pt-4 pb-2 bg-neutral-950/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {['All', 'IAH Airport', 'HOU Hobby', 'Galveston', 'Galleria'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedCorridorFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedCorridorFilter === filter
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-neutral-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter === 'All' ? 'All Corridors' : filter}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-gray-400 flex items-center space-x-1 font-mono">
                <Clock size={12} className="text-amber-500" />
                <span>Refreshed: {lastRefreshedTime}</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              
              {/* Corridor Speeds Grid */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-3 flex items-center">
                  <Car size={14} className="mr-1.5 text-amber-500" />
                  Primary Airport & Cruise Arteries Speed Sensors
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {HOUSTON_CORRIDORS.map((corridor) => (
                    <div 
                      key={corridor.id}
                      className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white text-xs">{corridor.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            corridor.status === 'Clear' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          }`}>
                            {corridor.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mb-2">
                          Destination: {corridor.destination}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase">Avg Speed:</span>{' '}
                          <strong className="text-amber-400 font-mono">{corridor.currentSpeedMph} MPH</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase">Transit:</span>{' '}
                          <strong className="text-white font-mono">{corridor.currentTimeMins}m</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Incidents & Construction Advisories List */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-3 flex items-center">
                  <AlertTriangle size={14} className="mr-1.5 text-amber-500" />
                  Active Construction, Delays & Dispatch Advisories
                </h4>

                <div className="space-y-3">
                  {filteredAlerts.map((alert) => {
                    const badge = getSeverityBadge(alert.severity);
                    return (
                      <div 
                        key={alert.id}
                        className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${badge.bg}`}>
                              {badge.icon}
                              <span className="ml-1.5">{badge.label}</span>
                            </span>
                            <span className="font-mono text-xs text-gray-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                              {alert.corridor}
                            </span>
                          </div>

                          <span className="text-[11px] text-gray-400 font-mono">
                            {alert.timestamp}
                          </span>
                        </div>

                        <h5 className="font-bold text-white text-sm">
                          {alert.title}
                        </h5>

                        <p className="text-xs text-gray-300 leading-relaxed">
                          {alert.details}
                        </p>

                        {/* Chauffeur Action & Toll Bypass Guarantee */}
                        <div className="bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-lg flex items-start space-x-2 text-xs text-amber-200">
                          <ShieldCheck size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white">AvaLimo Chauffeur Action:</strong> {alert.chauffeurAction}
                          </div>
                        </div>

                        {alert.recommendedDepartureBuffer && (
                          <div className="text-[11px] text-gray-400 flex items-center space-x-1.5">
                            <Clock size={12} className="text-amber-500" />
                            <span>Recommended buffer: <strong className="text-gray-200">{alert.recommendedDepartureBuffer}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Luxury Guarantee Callout */}
              <div className="bg-gradient-to-r from-amber-950/40 via-neutral-950 to-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                      Zero Toll Surcharges & Proactive Flight Guard
                    </h5>
                    <p className="text-xs text-gray-400">
                      Our dispatch desk monitors highway traffic and inbound flights 24/7 so you never miss a departure.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullModal(false);
                      if (onOpenBooking) onOpenBooking();
                    }}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md text-center"
                  >
                    Reserve Chauffeur
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-gray-400">
              <span>Houston TranStar Partner Telemetry</span>
              <button
                onClick={() => setShowFullModal(false)}
                className="text-amber-400 hover:text-amber-300 font-semibold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceAlertsBanner;
