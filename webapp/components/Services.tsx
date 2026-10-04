import React from 'react';
import { Plane, Anchor, Building2, Wine, Sparkles, Clock, Compass, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SERVICES_DATA, COMPANY_INFO } from '../data/avalimoData';

interface ServicesProps {
  onSelectService?: (serviceTitle: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Plane':
        return <Plane className="text-amber-500" size={32} />;
      case 'Anchor':
        return <Anchor className="text-amber-500" size={32} />;
      case 'Building2':
        return <Building2 className="text-amber-500" size={32} />;
      case 'Wine':
        return <Wine className="text-amber-500" size={32} />;
      case 'Sparkles':
        return <Sparkles className="text-amber-500" size={32} />;
      case 'Clock':
        return <Clock className="text-amber-500" size={32} />;
      case 'Compass':
        return <Compass className="text-amber-500" size={32} />;
      default:
        return <ShieldCheck className="text-amber-500" size={32} />;
    }
  };

  return (
    <section className="py-24 bg-neutral-900 text-white relative overflow-hidden" id="services-section">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-2 inline-block">
            Elite Chauffeur Solutions
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Tailored For Distinction & Luxury
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Whether arriving at Bush Intercontinental, boarding a Royal Caribbean cruise in Galveston, or orchestrating a corporate roadshow, AvaLimo delivers flawless execution.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service) => (
            <div 
              key={service.id} 
              className="group p-8 rounded-2xl border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-950 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-amber-950/20"
            >
              <div>
                <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-amber-500/30 transition-all">
                  {getIcon(service.iconName)}
                </div>

                <div className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider mb-2">
                  {service.tagline}
                </div>

                <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                  {service.title}
                </h3>

                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Key Service Highlights */}
                <div className="space-y-2 mb-6 border-t border-neutral-800/80 pt-4">
                  {service.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-start text-xs text-gray-300">
                      <CheckCircle2 size={14} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer / Recommended Vehicle */}
              <div className="pt-4 border-t border-neutral-800">
                <div className="text-[11px] text-gray-400 mb-3">
                  <span className="text-amber-500 font-semibold">Recommended:</span> {service.recommendedVehicle}
                </div>
                
                <button
                  onClick={() => onSelectService && onSelectService(service.title)}
                  className="w-full bg-neutral-900 hover:bg-amber-600 text-gray-300 hover:text-white py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white"
                >
                  Book This Service
                  <ChevronRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;

