import React from 'react';
import VoiceAgent from './VoiceAgent';
import { AgentType } from '../types';
import { COMPANY_INFO } from '../data/avalimoData';
import { Phone, User, Truck, ChevronDown } from 'lucide-react';

const UserIcon = () => (
  <User size={28} strokeWidth={1.5} />
);

const TruckIcon = () => (
  <Truck size={28} strokeWidth={1.5} />
);

const Hero: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-50 scale-105"
          aria-label="AvaLimo luxury vehicles"
        >
          <source src="/videos/hero_bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-[var(--gold)] font-bold tracking-[0.5em] text-sm uppercase mb-6">
            Houston Limo Service
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.1] mb-8">
            The Pinnacle of <br />
            <span className="text-gold-gradient">Luxury Travel</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
            AvaLimo provides professional Houston limo service for corporate travel, airport transfers, Galveston cruises, and special events — 24/7 with zero surge pricing.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 mb-12">
            <button
              onClick={() => scrollTo('booking')}
              className="gold-gradient text-black px-12 py-5 font-extrabold tracking-[0.2em] uppercase text-[12px] shadow-2xl shadow-gold/20 hover:scale-[1.02] transition-transform"
            >
              Get A Quote
            </button>
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="flex items-center justify-center gap-2 border-2 border-white/20 hover:border-gold px-12 py-5 font-bold tracking-[0.2em] uppercase text-[12px] transition-all bg-white/5 backdrop-blur-sm text-white"
            >
              <Phone size={16} />
              Call {COMPANY_INFO.phone}
            </a>
          </div>

          <div className="flex flex-wrap gap-8 text-[10px] tracking-[0.3em] uppercase font-bold text-white/60">
            <span>Reliable</span>
            <span className="text-[var(--gold)]">Punctual</span>
            <span>Professional</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 bg-black/40 backdrop-blur-xl p-8 rounded-[2rem] border border-gold/10 shadow-2xl">
          <div className="text-center mb-4">
            <h3 className="text-[var(--gold)] text-xs font-bold tracking-[0.3em] uppercase mb-2">
              AI Concierge Services
            </h3>
            <p className="text-white/50 text-[10px] uppercase tracking-widest">
              Talk to our AI voice assistants
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <VoiceAgent type={AgentType.FRONT_DESK} icon={<UserIcon />} />
            <VoiceAgent type={AgentType.DISPATCH} icon={<TruckIcon />} />
          </div>
          <p className="text-[10px] text-white/40 text-center tracking-widest uppercase">
            Microphone required • Powered by Gemini
          </p>
        </div>
      </div>

      <button
        onClick={() => scrollTo('fleet')}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/40 hover:text-[var(--gold)] transition-colors"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase mb-2">Explore</span>
        <ChevronDown size={24} className="animate-bounce" />
      </button>
    </section>
  );
};

export default Hero;
