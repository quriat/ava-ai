import React from 'react';
import { TESTIMONIALS_DATA } from '../data/avalimoData';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-24 md:py-32 bg-ink border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
            <Star size={13} className="fill-gold text-gold" /> Verified Google Reviews
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-5">
            4.9 Stars. <span className="text-gold-gradient">500+ Happy Riders.</span>
          </h2>
          <p className="text-white/50 font-light">
            Trusted by executives, law firms, brides, and families across Greater Houston.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {TESTIMONIALS_DATA.map((review) => (
            <div key={review.id} className="luxe-card p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-gold mb-5">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                  <span className="text-[11px] text-white/30 ml-2 tracking-wide">{review.date}</span>
                </div>
                <p className="text-white/70 font-light leading-relaxed mb-8 italic font-serif text-lg">
                  "{review.text}"
                </p>
              </div>
              <div className="border-t border-white/10 pt-5 flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-serif font-semibold text-white text-lg">{review.name}</h4>
                  <p className="text-xs text-gold/80">
                    {review.role}
                    {review.company ? ` · ${review.company.replace(' Sector', '')}` : ''}
                  </p>
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] text-right">{review.serviceType}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://g.page/r/CVgUaFV7t4-8EBM/review"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-gold/40 hover:border-gold text-white hover:text-gold font-bold text-[11px] uppercase tracking-[0.2em] transition-all"
          >
            <Star size={15} className="text-gold" />
            <span>Leave a Google Review</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
