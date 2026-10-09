import { Clock, Receipt, ShieldCheck, CalendarCheck, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';
import { trackEvent } from '../lib/analytics';

const BENEFITS = [
  {
    icon: Clock,
    title: 'One text, car dispatched',
    body: 'No apps, no hold music. Text (832) 567-8050 and a chauffeur is on the way — flight tracked, early arrival standard.',
  },
  {
    icon: Receipt,
    title: 'Monthly billing & receipts',
    body: 'Itemized receipts per ride and a single monthly invoice. Your accounting team will love you.',
  },
  {
    icon: ShieldCheck,
    title: 'Flat rates, zero surge',
    body: 'The price quoted is the price charged — during storms, holidays, and 2 AM airport runs alike.',
  },
  {
    icon: CalendarCheck,
    title: 'Priority scheduling',
    body: 'Corporate accounts jump the queue. Recurring pickups, roadshows, and multi-car events handled.',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Reach out',
    body: 'Call or text (832) 567-8050 — tell us about your team\u2019s travel needs.',
  },
  {
    n: '2',
    title: 'Trial ride',
    body: 'Experience the service firsthand on a complimentary airport transfer.',
  },
  {
    n: '3',
    title: 'Account live',
    body: 'We set up your billing, priority line, and preferences. Done.',
  },
];

export default function Corporate() {
  return (
    <div className="bg-dark-950">
      {/* Benefits */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Built for <span className="gold-gradient-text">business travel</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="glass-panel rounded-3xl p-6">
                <b.icon size={28} className="text-gold-400 mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet strip */}
      <section className="py-16 px-4 border-t border-gold-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-6">
            The fleet your executives deserve
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            Cadillac Escalade · Mercedes S-Class · Mercedes Sprinter (14 passengers).
            Every vehicle detailed, insured, and chauffeur-driven.
          </p>
          <div className="inline-flex flex-wrap justify-center gap-3 text-xs font-bold uppercase tracking-widest">
            {['IAH & Hobby flat rates', 'Flight tracking', 'Meet & greet', 'Hourly charters', 'Group events'].map((t) => (
              <span key={t} className="px-4 py-2 rounded-full border border-gold-500/30 text-gold-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 px-4 border-t border-gold-500/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Up and running in <span className="gold-gradient-text">three steps</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-black font-extrabold text-xl flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              onClick={() => trackEvent('call_click', { placement: 'corporate_steps' })}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-extrabold text-sm uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-xl shadow-gold-500/25"
            >
              <Phone size={16} />
              <span>Start with a call — {COMPANY_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
