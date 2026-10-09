import { Plane, Trophy, Heart, Users, Phone, MapPin, Star } from 'lucide-react';
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
    <div className="bg-dark-950">
      {/* Services */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-white mb-4 text-center">
            What Sienna neighbors book us for
          </h2>
          <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
            From 4 AM airport runs to Saturday night downtown — one text and a luxury car is at your door.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="bg-luxury border border-gold/10 rounded-2xl p-6 hover:border-[var(--gold)] transition-colors"
              >
                <s.icon className="text-[var(--gold)] mb-4" size={28} />
                <h3 className="text-lg font-serif font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why local */}
      <section className="py-16 sm:py-20 px-4 border-t border-gold-500/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-white mb-10 text-center">
            Why Sienna chooses AvaLimo
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {WHY.map((w) => (
              <div
                key={w.title}
                className="bg-luxury border border-gold/10 rounded-2xl p-6"
              >
                <w.icon className="text-[var(--gold)] mb-4" size={28} />
                <h3 className="text-lg font-serif font-bold text-white mb-2">{w.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet strip */}
      <section className="py-16 sm:py-20 px-4 border-t border-gold-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            The fleet
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Mercedes S-Class sedans, Cadillac Escalades, and 14-passenger Mercedes Sprinters.
            Immaculate, late-model, driven by professional chauffeurs.
          </p>
          <a
            href="/fleet"
            className="inline-block border border-[var(--gold)] text-[var(--gold)] rounded-full px-8 py-3 font-semibold hover:bg-[var(--gold)] hover:text-black transition-colors"
          >
            See the fleet
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 border-t border-gold-500/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Ready when you are
          </h2>
          <p className="text-white/60 mb-8">
            Call or text — we answer. Flat rates quoted upfront, no surge, no surprises.
          </p>
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            onClick={() => trackEvent('sienna_call_click', { placement: 'sienna_page' })}
            className="inline-flex items-center gap-2 bg-[var(--gold)] text-black rounded-full px-10 py-4 text-lg font-bold hover:opacity-90 transition-opacity"
          >
            <Phone size={20} />
            {COMPANY_INFO.phone}
          </a>
          <p className="text-white/40 text-sm mt-4">
            or book online at avalimo.net
          </p>
        </div>
      </section>
    </div>
  );
}
