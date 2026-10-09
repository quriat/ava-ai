import { MapPin, ArrowRight } from 'lucide-react';

/**
 * Homepage banner promoting the Sienna Plantation neighborhood page.
 */
export default function SiennaBanner() {
  return (
    <section className="py-20 md:py-24 px-6 bg-ink">
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden relative p-10 md:p-14 md:flex justify-between items-center gap-10"
          style={{
            background: 'linear-gradient(135deg, #17171a, #0c0c0e)',
            border: '1px solid rgba(201,169,106,.25)',
          }}
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative">
            <p className="eyebrow mb-4 flex items-center gap-2">
              <MapPin size={14} /> Your Neighborhood Service
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
              Sienna Plantation's <span className="text-gold-gradient">Own Chauffeur</span>
            </h2>
            <p className="text-white/50 font-light max-w-lg leading-relaxed">
              Adam lives right here in Sienna. Airport runs, Astros games, weddings —
              your neighbor is your driver, with flat rates and zero surge.
            </p>
          </div>
          <a
            href="/sienna"
            className="relative shrink-0 mt-8 md:mt-0 inline-flex items-center gap-2 btn-gold font-bold text-[11px] tracking-[0.2em] uppercase px-10 py-4 rounded-full shadow-xl"
          >
            Sienna Rates <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
