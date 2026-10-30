import React from 'react';
import VoiceAgent from './VoiceAgent';
import { AgentType } from '../types';
import { User, Truck, Phone, Sparkles, Shield, Clock } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';

const UserIcon = () => (
  <User size={26} strokeWidth={1.5} className="text-[var(--gold)]" />
);

const TruckIcon = () => (
  <Truck size={26} strokeWidth={1.5} className="text-[var(--gold)]" />
);

export default function AIConciergeSection() {
  return (
    <section id="ai-concierge" className="py-24 bg-dark-900/60 relative border-t border-b border-champagne">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles size={12} className="text-[var(--gold)]" />
            <span>Next-Gen Livery Technology</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            24/7 AI Voice Concierge &amp; Live Dispatch
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Need an immediate quote, flight pickup check, or driver update? Speak naturally with our automated voice concierge anytime, or connect instantly to live Houston human dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between border-champagne glass-panel-hover">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)] px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20">
                  Reservations &amp; Quotes
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Available 24/7
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">Front Desk Concierge</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Inquire about flat rates to IAH or Hobby, vehicle capacities, wedding packages, or hourly service. Answers questions and books your ride seamlessly.
              </p>
            </div>
            <VoiceAgent type={AgentType.FRONT_DESK} icon={<UserIcon />} />
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between border-champagne glass-panel-hover">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)] px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20">
                  Active Rides &amp; ETA
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Real-Time Livery
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">Dispatch &amp; Operations</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Check chauffeur arrival status, update flight numbers for delayed arrivals, or coordinate airport baggage claim meet-and-greet details.
              </p>
            </div>
            <VoiceAgent type={AgentType.DISPATCH} icon={<TruckIcon />} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center max-w-2xl mx-auto p-4 rounded-2xl bg-dark-950/80 border border-champagne text-xs text-slate-400">
          <div className="flex items-center gap-2 text-white font-medium">
            <Phone size={14} className="text-[var(--gold)]" />
            <span>Prefer a direct phone conversation?</span>
          </div>
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            className="text-gold-400 hover:text-white font-bold underline transition-colors"
          >
            Call Dispatch at {COMPANY_INFO.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
