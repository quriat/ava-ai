import { Plane, Trophy, Heart, Users, Phone, MapPin, Star, ArrowRight } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';
import { trackEvent } from '../lib/analytics';

const SERVICES = [
  {
    icon: Plane,
    title: 'Airport Transfers',
    body: 'IAH and Hobby pickups with live flight tracking. Your chauffeur is already there when you land — no waiting, no surge pricing at 1 AM.',
  },
  {
    icon: Trophy,
    title: 'Games & Concerts',
    body: 'Astros, Texans, Rockets, Toyota Center shows — ride downtown in style, skip the parking nightmare, and get home safe.',
  },
  {
    icon: Heart,
    title: 'Weddings & Proms',
    body: 'Sienna weddings deserve a proper entrance. S-Class sedans, Escalades, and 14-passenger Sprinters for the whole party.',
  },
  {
    icon: Users,
    title: 'Nights Out & Events',
    body: 'Date night in Sugar Land, dinner downtown, quinceañeras — a chauffeur means everyone enjoys the evening.',
  },
];

const WHY = [
  {
    icon: MapPin,
    title: 'Your neighbor, not a stranger',
    body: 'AvaLimo is based right here in Sienna Plantation. When you book, you\u2019re supporting a neighbor — and your driver already knows the gates, the streets, and the fastest way out.',
  },
  {
    icon: Star,
    title: '4.9 stars from 500+ clients',
    body: 'Houston families trust AvaLimo for the rides that matter — early flights, big nights, once-in-a-lifetime events.',
  },
];

export default function Sienna() {
  return (
    <div className="bg-ink">
      {/* Services */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="eyebrow mb-4 text-center">Sienna Plantation</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 text-center">
            What Sienna Neighbors <span className="text-gold-gradient">Book Us For</span>
          </h2>
          <p className="text-white/50 font-light text-center mb-14 max-w-2xl mx-auto">
            From 4 AM airport runs to Saturday night downtown — one text and a luxury car is at your door.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="luxe-card rounded-3xl p-7">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-6">
                  <s.icon className="text-gold" size={22} />
                </div>
                <h3 className="font-serif text-xl text-white mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why local */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5 bg-smoke">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-12 text-center">
            Why Sienna <span className="text-gold-gradient">Chooses AvaLimo</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {WHY.map((w) => (
              <div key={w.title} className="luxe-card rounded-3xl p-8">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-6">
                  <w.icon className="text-gold" size={22} />
                </div>
                <h3 className="font-serif text-xl text-white mb-2">{w.title}</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet strip */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow mb-4">The Fleet</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-5">Ride in Style</h2>
          <p className="text-white/50 font-light mb-10 max-w-2xl mx-auto">
            Mercedes S-Class sedans, Cadillac Escalades, and 14-passenger Mercedes Sprinters.
            Immaculate, late-model, driven by professional chauffeurs.
          </p>
          <a
            href="/#fleet"
            className="inline-flex items-center gap-2 border border-gold/50 text-gold rounded-full px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors"
          >
            See the fleet <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5 bg-smoke">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-5">
            Ready When <span className="text-gold-gradient">You Are</span>
          </h2>
          <p className="text-white/50 font-light mb-10">
            Call or text — we answer. Flat rates quoted upfront, no surge, no surprises.
          </p>
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            onClick={() => trackEvent('sienna_call_click', { placement: 'sienna_page' })}
            className="inline-flex items-center gap-2 btn-gold rounded-full px-12 py-4 text-sm font-bold tracking-[0.15em] uppercase shadow-xl"
          >
            <Phone size={18} />
            {COMPANY_INFO.phone}
          </a>
          <p className="text-white/30 text-sm mt-5">
            or book online at avalimo.net
          </p>
        </div>
      </section>
    </div>
  );
}
