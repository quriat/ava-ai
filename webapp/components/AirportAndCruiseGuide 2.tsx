import React, { useState } from 'react';
import { Plane, Anchor, ChevronDown, ChevronUp, HelpCircle, MapPin, CheckCircle2, ShieldCheck, Clock, Phone, AlertCircle } from 'lucide-react';
import { AIRPORT_GUIDES, GALVESTON_CRUISE_INFO, FAQS, POPULAR_ROUTES, COMPANY_INFO } from '../data/avalimoData';

interface AirportAndCruiseGuideProps {
  onBookAirport: (airportName: string) => void;
  onBookCruise: () => void;
}

const AirportAndCruiseGuide: React.FC<AirportAndCruiseGuideProps> = ({ onBookAirport, onBookCruise }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'airports' | 'cruise' | 'rates' | 'faqs'>('airports');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-neutral-900 text-white relative" id="rates-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-2 inline-block">
            Airport, Port & Route Intelligence
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Houston Travel & Port Guides
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Everything you need for seamless arrivals at George Bush Intercontinental (IAH), William P. Hobby (HOU), and the Port of Galveston Cruise Terminals.
          </p>

          {/* Guide Switcher Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button
              onClick={() => setActiveTab('airports')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center ${
                activeTab === 'airports'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'bg-neutral-950 text-gray-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Plane size={14} className="mr-1.5" />
              Airport Arrival Protocols
            </button>
            <button
              onClick={() => setActiveTab('cruise')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center ${
                activeTab === 'cruise'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'bg-neutral-950 text-gray-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Anchor size={14} className="mr-1.5" />
              Galveston Cruise Terminal
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center ${
                activeTab === 'rates'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'bg-neutral-950 text-gray-400 hover:text-white border border-neutral-800'
              }`}
            >
              <MapPin size={14} className="mr-1.5" />
              Popular Route Rates
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center ${
                activeTab === 'faqs'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'bg-neutral-950 text-gray-400 hover:text-white border border-neutral-800'
              }`}
            >
              <HelpCircle size={14} className="mr-1.5" />
              Chauffeur FAQs
            </button>
          </div>
        </div>

        {/* Tab 1: Airport Arrival Guides */}
        {activeTab === 'airports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
            {AIRPORT_GUIDES.map((airport) => (
              <div key={airport.code} className="bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-4">
                    <div>
                      <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">{airport.code} Airport</span>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-0.5">{airport.name}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Plane size={24} />
                    </div>
                  </div>

                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
                    {airport.description}
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                        <Clock size={14} className="mr-1.5" /> Curbside Express Pickup
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{airport.curbsidePickup}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                        <ShieldCheck size={14} className="mr-1.5" /> Baggage Claim Meet & Greet
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{airport.insideMeetAndGreet}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                        Private FBOs Serviced
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{airport.fboLocations}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Free Flight Tracking + 60m Grace Period
                  </div>
                  <button
                    onClick={() => onBookAirport(airport.name)}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Book {airport.code} Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Galveston Cruise Terminal */}
        {activeTab === 'cruise' && (
          <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-6 sm:p-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-bold tracking-widest uppercase">
                  <Anchor size={16} />
                  <span>Port of Galveston Direct Luxury Shuttle</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                  Galveston Cruise Port Transfers
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {GALVESTON_CRUISE_INFO.description}
                </p>

                <div className="space-y-3 pt-2">
                  {GALVESTON_CRUISE_INFO.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start text-xs sm:text-sm text-gray-300">
                      <CheckCircle2 size={16} className="text-amber-500 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap gap-4 items-center">
                  <button
                    onClick={onBookCruise}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                  >
                    Reserve Cruise Transfer
                  </button>
                  <a
                    href={`tel:${COMPANY_INFO.phoneRaw}`}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Call Cruise Dispatch: {COMPANY_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider text-amber-400">
                  Terminals Serviced:
                </h4>
                <ul className="space-y-2.5 text-xs text-gray-300">
                  {GALVESTON_CRUISE_INFO.terminals.map((term, idx) => (
                    <li key={idx} className="p-2.5 rounded bg-neutral-950 border border-neutral-800 flex items-center">
                      <Anchor size={14} className="text-amber-500 mr-2 flex-shrink-0" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-3 rounded bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300">
                  Tip: We recommend booking your debarkation pickup 3.5 hours before flight departure for IAH and 2.5 hours for Hobby.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Route Rate Sheet */}
        {activeTab === 'rates' && (
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">Popular Flat-Rate Houston Destinations</h3>
                <p className="text-gray-400 text-xs">All fares include taxes and standard airport fees. No hidden surge multipliers.</p>
              </div>
              <div className="text-xs text-amber-400 font-semibold bg-neutral-900 px-3 py-1.5 rounded border border-neutral-800">
                Hourly charters available from $85/hr
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POPULAR_ROUTES.map((route, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-1">
                      {route.from} ➔
                    </div>
                    <div className="text-sm font-bold text-white mb-2">
                      {route.to}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center mb-3">
                      <Clock size={12} className="mr-1 text-gray-500" />
                      Approx. {route.duration}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                    <span className="text-xs text-gray-400">Sedan / SUV:</span>
                    <span className="text-amber-400 font-bold text-sm">{route.startingPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: FAQs */}
        {activeTab === 'faqs' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-medium text-white hover:text-amber-400 transition-colors"
                  >
                    <span className="flex items-center">
                      <HelpCircle size={18} className="text-amber-500 mr-3 flex-shrink-0" />
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-amber-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500 flex-shrink-0 ml-2" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-neutral-900">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default AirportAndCruiseGuide;
