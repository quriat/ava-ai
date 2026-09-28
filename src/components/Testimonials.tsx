import React from 'react';
import { TESTIMONIALS_DATA } from '../data/avalimoData';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-24 bg-dark-950 border-t border-gold-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase mb-4">
            <Star size={14} /> Verified 5.0 Google Reviews
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            What Our Clients Say
          </h2>
          <p className="text-slate-400 text-sm">
            Trusted by Fortune 500 executives, law firms, brides, and family travelers across Greater Houston.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {TESTIMONIALS_DATA.map((review) => (
            <div key={review.id} className="glass-panel p-8 rounded-3xl glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-gold-400 mb-4 text-sm">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-gold-400 text-gold-400" />
                  ))}
                  <span className="text-xs text-slate-400 ml-2">{review.date}</span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed mb-6 italic">
                  "{review.text}"
                </p>
              </div>
              <div className="border-t border-slate-800 pt-4 flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-serif font-bold text-white text-base">{review.name}</h4>
                  <p className="text-xs text-gold-400">
                    {review.role}
                    {review.company ? ` • ${review.company.replace(' Sector', '')}` : ''}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-bold text-right">{review.serviceType}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://g.page/r/CVgUaFV7t4-8EBM/review"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-dark-900 border border-gold-500/40 hover:border-gold-400 text-white font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl"
          >
            <Star size={16} className="text-gold-400" />
            <span>Leave a Google Review / Read More Ratings</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;