import React, { useState } from 'react';
import VoiceAgent from './VoiceAgent';
import { AgentType } from '../types';
import { Phone, Star, User, Truck, ChevronDown } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';
import { trackEvent } from '../lib/analytics';

const UserIcon = () => (
  <User size={28} strokeWidth={1.5} />
);

const TruckIcon = () => (
  <Truck size={28} strokeWidth={1.5} />
);

const MODE_ACTIVE = 'px-6 py-3 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all btn-gold shadow-lg whitespace-nowrap';
const MODE_IDLE = 'px-6 py-3 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all text-white/50 hover:text-white whitespace-nowrap';

const Hero: React.FC = () => {
  const [mode, setMode] = useState<'A' | 'B'>('A');

  const scrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[94vh] flex items-center overflow-hidden">
      {/* Cinematic backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="/og-image.jpg"
          alt="AvaLimo Houston luxury chauffeur fleet at dusk"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-ink/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
        <p className="eyebrow mb-6">Houston's Premier Chauffeur Service</p>

        <div className="flex mb-10">
          <div className="inline-flex p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setMode('A')}
              className={mode === 'A' ? MODE_ACTIVE : MODE_IDLE}
            >
              Business &amp; Airport
            </button>
            <button
              onClick={() => setMode('B')}
              className={mode === 'B' ? MODE_ACTIVE : MODE_IDLE}
            >
              VIP Nights &amp; Cruise
            </button>
          </div>
        </div>

        {mode === 'A' ? (
          <div className="transition-all duration-500 max-w-3xl">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-white mb-6">
              Arrive Like You<br />
              <span className="text-gold-gradient font-semibold">Own the City.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl">
              Flat-rate airport transfers to IAH &amp; Hobby, corporate roadshows, and wedding
              transportation — with live flight tracking and a 100% on-time guarantee. Zero surge, ever.
            </p>
          </div>
        ) : (
          <div className="transition-all duration-500 max-w-3xl">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-white mb-6">
              Own the Night.<br />
              <span className="text-gold-gradient font-semibold">We'll Handle the Road.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl">
              NRG Stadium, Toyota Center, Galveston cruises — Escalades, Sprinters, and stretch
              limousines with professional chauffeurs at flat rates.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-14">
          <button
            onClick={scrollToBooking}
            className="btn-gold font-bold text-xs tracking-[0.2em] uppercase px-10 py-4 rounded-full shadow-xl"
          >
            Get Instant Quote
          </button>
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            onClick={() => trackEvent('call_click', { placement: 'hero' })}
            className="inline-flex items-center justify-center gap-2 border border-gold/50 text-gold font-bold text-xs tracking-[0.2em] uppercase px-10 py-4 rounded-full hover:bg-gold/10 transition-colors"
          >
            <Phone size={15} />
            <span>Call {COMPANY_INFO.phone}</span>
          </a>
          <a
            href="https://g.page/r/CVgUaFV7t4-8EBM/review"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 text-white/60 hover:text-gold text-xs tracking-[0.2em] uppercase font-semibold px-6 py-4 transition-colors"
          >
            <Star size={14} className="text-gold" />
            <span>4.9 ★ · 500+ Reviews</span>
          </a>
        </div>

        <div className="flex gap-10 md:gap-14 text-white/70">
          <div>
            <div className="font-serif text-4xl text-gold">4.9★</div>
            <div className="text-[10px] tracking-[0.25em] uppercase mt-1 text-white/40">500+ Clients</div>
          </div>
          <div>
            <div className="font-serif text-4xl text-gold">24/7</div>
            <div className="text-[10px] tracking-[0.25em] uppercase mt-1 text-white/40">Live Dispatch</div>
          </div>
          <div>
            <div className="font-serif text-4xl text-gold">$0</div>
            <div className="text-[10px] tracking-[0.25em] uppercase mt-1 text-white/40">Surge Pricing</div>
          </div>
        </div>

        <div className="max-w-3xl mt-14">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl">
            <div className="text-center mb-6">
              <h3 className="eyebrow mb-1">AI Voice Concierge</h3>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.25em]">
                Talk to our AI assistants 24/7
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <VoiceAgent type={AgentType.FRONT_DESK} icon={<UserIcon />} />
              <VoiceAgent type={AgentType.DISPATCH} icon={<TruckIcon />} />
            </div>
            <p className="text-[10px] text-white/30 text-center tracking-[0.25em] uppercase mt-6">
              Microphone required • Powered by Vapi
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-16">
          <ChevronDown size={20} className="text-gold/60 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
