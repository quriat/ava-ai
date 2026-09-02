import React from 'react';
import { MapPin, Phone, Mail, Globe, ShieldCheck, Clock, Award, ArrowUp, Star } from 'lucide-react';
import { COMPANY_INFO, SERVICE_AREAS, FLEET_DATA, SERVICES_DATA } from '../data/avalimoData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectVehicle }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-neutral-800 text-white pt-20 pb-28 sm:pb-12 relative overflow-hidden">
      
      {/* Top CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Ready For Distinction?</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">Experience Houston's Highest-Rated Limo Service</h3>
            <p className="text-gray-400 text-xs sm:text-sm">24/7 Live Dispatch, Flight Tracking, and Guaranteed Flat Pricing.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('booking-section')}
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
            >
              Book Online Now
            </button>
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30 px-6 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-center"
            >
              Direct: {COMPANY_INFO.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-wider text-white">
                AVALIMO<span className="text-amber-500">.</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-semibold uppercase">
                Houston Chauffeur
              </span>
            </div>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              {COMPANY_INFO.name} is Houston's premier chauffeured luxury limousine service, delivering punctual, discreet, and refined ground transportation across Houston, Galveston, and Texas since 2013.
            </p>

            <div className="space-y-2 pt-2 text-xs text-gray-300">
              <div className="flex items-start space-x-2.5">
                <MapPin size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span>{COMPANY_INFO.address}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone size={16} className="text-amber-500 flex-shrink-0" />
                <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="hover:text-amber-400 transition-colors font-semibold">
                  {COMPANY_INFO.phone}
                </a>
                <span className="text-gray-600">•</span>
                <a href={`tel:${COMPANY_INFO.aiConciergePhone.replace(/\D/g, '').replace(/^/, '+1')}`} className="hover:text-amber-400 transition-colors">
                  AI Line: {COMPANY_INFO.aiConciergePhone}
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail size={16} className="text-amber-500 flex-shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-amber-400 transition-colors">
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Globe size={16} className="text-amber-500 flex-shrink-0" />
                <span>{COMPANY_INFO.domains.join(' | ')}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
              Chauffeur Services
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {SERVICES_DATA.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <button
                    onClick={() => onNavigate('services-section')}
                    className="hover:text-white transition-colors text-left"
                  >
                    {service.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Fleet */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
              Executive Fleet
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {FLEET_DATA.map((car) => (
                <li key={car.id}>
                  <button
                    onClick={() => {
                      onSelectVehicle(car.id);
                      onNavigate('fleet-section');
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    {car.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Top Service Areas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
              Key Service Areas
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {SERVICE_AREAS.slice(0, 7).map((area, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => onNavigate('areas-section')}
                    className="hover:text-white transition-colors text-left"
                  >
                    {area.name} Limo Service
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom copyright & back to top */}
        <div className="border-t border-neutral-800/80 mt-16 pt-8 flex flex-wrap justify-center sm:justify-between items-center gap-4 gap-y-3 text-xs text-gray-500 text-center">
          <div>
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved. Registered Houston Livery Service.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:space-x-6">
            <button onClick={() => onNavigate('reviews-section')} className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center space-x-1">
              <Star size={12} className="fill-amber-400" />
              <span>Google Reviews (4.9★)</span>
            </button>
            <button onClick={() => onNavigate('rates-section')} className="text-gray-300 hover:text-white transition-colors">
              Corporate Transportation
            </button>
            <button onClick={() => onNavigate('rates-section')} className="hover:text-gray-300 transition-colors">
              Rates & Airports
            </button>
            <button onClick={() => onNavigate('rates-section')} className="hover:text-gray-300 transition-colors">
              Port of Galveston
            </button>
            <button onClick={() => onNavigate('rates-section')} className="hover:text-gray-300 transition-colors">
              FAQs
            </button>
            <button 
              onClick={scrollToTop} 
              className="p-2 rounded bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-all flex items-center"
              title="Back to Top"
            >
              <ArrowUp size={14} />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
