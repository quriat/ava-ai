import React from 'react';
import { TESTIMONIALS_DATA } from '../data/avalimoData';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="w-full py-24 md:py-32 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Client Reviews
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Trusted by Houston's Finest
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            See why executives, families, and event planners choose AvaLimo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS_DATA.map((review) => (
            <div
              key={review.id}
              className="bg-luxury border border-white/5 p-8 rounded-2xl relative"
            >
              <Quote className="absolute top-6 right-6 text-gold/20" size={48} />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-[var(--gold)] text-[var(--gold)]" />
                ))}
              </div>
              <p className="text-white/80 leading-relaxed mb-6 relative z-10">
                "{review.text}"
              </p>
              <div>
                <div className="font-bold text-white">{review.name}</div>
                <div className="text-[11px] text-[var(--gold)] uppercase tracking-wider">
                  {review.role}{review.company ? `, ${review.company}` : ''}
                </div>
                <div className="text-[11px] text-white/40 mt-1">{review.serviceType}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
