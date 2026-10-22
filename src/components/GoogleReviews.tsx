import React from 'react';
import { Star, ExternalLink } from 'lucide-react';

export const GOOGLE_REVIEW_URL = 'https://g.page/r/CVgUaFV7t4-8EBM/review';

const GoogleReviews: React.FC = () => {
  return (
    <section id="google-reviews" className="w-full py-16 md:py-20 px-6 md:px-12 bg-black border-y border-gold/10">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
          Rated by Houston Riders
        </span>
        <div className="flex justify-center gap-1 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={26} className="fill-[var(--gold)] text-[var(--gold)]" />
          ))}
        </div>
        <p className="text-5xl md:text-6xl font-serif font-bold text-white mb-4">
          4.9 <span className="text-[var(--gold)]">on Google</span>
        </p>
        <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
          Houston riders rate AvaLimo 4.9 out of 5 on Google - for on-time pickups,
          flat rates with no surge, and professional chauffeurs, 24/7.
        </p>
        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-[var(--gold)] text-[var(--gold)] px-6 py-3 rounded-lg text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--gold)] hover:text-black transition-colors"
        >
          Read our Google reviews
          <ExternalLink size={14} />
        </a>
      </div>
    </section>
  );
};

export default GoogleReviews;
