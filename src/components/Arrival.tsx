import React from 'react';
import { Plane, UserCheck, Luggage, ShieldCheck, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    icon: Plane,
    title: 'Your flight is tracked in real time',
    text: 'Your pickup adjusts automatically to your actual landing — early or late, your chauffeur is dispatched to the real arrival time.',
  },
  {
    icon: UserCheck,
    title: 'Chauffeur waits at baggage claim with your name',
    text: 'No searching the curb. Your chauffeur is inside the terminal at baggage claim, holding a personalized name sign.',
  },
  {
    icon: Luggage,
    title: 'Every bag carried, carousel to car',
    text: 'Full luggage assistance from the carousel straight to your vehicle — you never touch a suitcase.',
  },
  {
    icon: ShieldCheck,
    title: 'One flat rate. No surge. No surprises.',
    text: 'The price quoted before you book is the price you pay. Traffic, delays and demand never change it.',
  },
];

const INCLUDED = [
  'Meet & greet at baggage claim with a name sign',
  'Real-time flight tracking — no charge for delays',
  'Help with every bag, carousel to car',
  '24/7 live Houston dispatch, 365 days a year',
  'Taxes, tolls and airport parking included',
];

/**
 * "The AvaLimo Arrival" — how an airport pickup works, step by step,
 * plus everything bundled into the flat rate.
 */
const Arrival: React.FC = () => {
  return (
    <section id="arrival" className="py-24 bg-dark-900/50 border-t border-champagne relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold text-gold-400 tracking-widest block mb-2">
            The AvaLimo Arrival
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Wheels down. Car waiting.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            From the moment your plane touches down at IAH or Hobby, everything is already handled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="glass-panel rounded-3xl p-6 border-champagne glass-panel-hover transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <step.icon size={26} className="text-[var(--gold)]" />
                <span className="font-serif text-3xl font-extrabold text-gold/20">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-white mb-2 leading-snug">
                {step.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-3xl border-champagne p-6 sm:p-8">
          <h3 className="font-serif text-lg font-bold text-white mb-1">One price. Everything included.</h3>
          <p className="text-slate-400 text-xs mb-5">
            One flat rate for the whole car, quoted before you book. It does not change with traffic, delays or demand.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Arrival;
