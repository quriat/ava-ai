import React, { useState } from 'react';
import VoiceAgent from './VoiceAgent';
import { AgentType } from '../types';
import { CreditCard, Phone, Star, User, Truck } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';
import { trackEvent } from '../lib/analytics';

const UserIcon = () => (
  <User size={28} strokeWidth={1.5} />
);

const TruckIcon = () => (
  <Truck size={28} strokeWidth={1.5} />
);

const MODE_A_CLASS = 'px-4 sm:px-6 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-extrabold tracking-wider uppercase transition-all bg-gold-500 text-black shadow-lg';
const MODE_B_CLASS = 'px-4 sm:px-6 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-extrabold tracking-wider uppercase transition-all text-slate-300 hover:text-white';

const Hero: React.FC = () => {
  const [mode, setMode] = useState<'A' | 'B'>('A');

  const scrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden py-20 sm:py-24 px-4">
      <div className="absolute inset-0 z-0">
        <img
          src="/og-image.jpg"
          alt="AvaLimo Houston fleet banner"
          className="w-full h-full object-cover filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-400 text-xs font-bold uppercase tracking-widest mb-6 badge-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping"></span>
          <span>AI Voice Concierge & Square Secure Checkout Active</span>
        </div>

        <div className="flex justify-center mb-8 px-4">
          <div className="inline-flex flex-col sm:flex-row p-1.5 rounded-2xl sm:rounded-full bg-dark-900/90 border border-gold-500/30 backdrop-blur-md w-full max-w-xs sm:max-w-none sm:w-auto">
            <button
              onClick={() => setMode('A')}
              className={mode === 'A' ? MODE_A_CLASS + ' whitespace-nowrap' : MODE_B_CLASS + ' whitespace-nowrap'}
            >
              Business &amp; Airport
            </button>
            <button
              onClick={() => setMode('B')}
              className={mode === 'B' ? MODE_A_CLASS + ' whitespace-nowrap' : MODE_B_CLASS + ' whitespace-nowrap'}
            >
              VIP Nightlife &amp; Cruise
            </button>
          </div>
        </div>

        {mode === 'A' ? (
          <div className="transition-all duration-500">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none mb-6">
              Houston Luxury Chauffeur &amp; Limo Service
            </h1>
            <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed mb-8">
              Flat-rate airport transfers to IAH and Hobby, corporate roadshows, wedding transportation, and Galveston cruise shuttles — 24/7 with real-time flight tracking and zero surge pricing.
            </p>
            <div className="p-4 rounded-xl bg-dark-900/90 border border-gold-500/30 inline-block mb-10 max-w-xl text-gold-300 font-semibold text-sm">
              The Avalimo Standard: Reliability isn't an option; it's our standard.
            </div>
          </div>
        ) : (
          <div className="transition-all duration-500">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none mb-6">
              VIP Events, Cruises &amp; Houston Nights Out
            </h2>
            <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed mb-8">
              Make an entrance at NRG Stadium, Toyota Center, or the Port of Galveston. Group-ready Sprinters, Escalades, and stretch limousines with professional chauffeurs and flat-rate pricing.
            </p>
            <div className="p-4 rounded-xl bg-dark-900/90 border border-gold-500/30 inline-block mb-10 max-w-xl text-gold-300 font-semibold text-sm">
              The Avalimo Promise: Be VIPs from start to finish.
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            onClick={() => trackEvent('call_click', { placement: 'hero' })}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-xl shadow-gold-500/25 flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            <span>Call {COMPANY_INFO.phone}</span>
          </a>
          <button
            onClick={scrollToBooking}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-dark-800/90 hover:bg-dark-700 text-white border border-gold-500/40 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <CreditCard size={16} />
            <span>Book &amp; Pay via Square</span>
          </button>
          <a
            href="https://g.page/r/CVgUaFV7t4-8EBM/review"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-dark-800/90 hover:bg-dark-700 text-white border border-gold-500/40 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Star size={16} className="text-gold-400" />
            <span>Read Google Reviews ★★★★★</span>
          </a>
        </div>

        <div className="max-w-3xl mx-auto mt-12">
          <div className="flex flex-col gap-6 glass-panel p-6 sm:p-8 rounded-3xl">
            <div className="text-center">
              <h3 className="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase mb-1">
                AI Voice Concierge
              </h3>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest">
                Talk to our AI voice assistants 24/7
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <VoiceAgent type={AgentType.FRONT_DESK} icon={<UserIcon />} />
              <VoiceAgent type={AgentType.DISPATCH} icon={<TruckIcon />} />
            </div>
            <p className="text-[10px] text-slate-500 text-center tracking-widest uppercase">
              Microphone required • Powered by Vapi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;