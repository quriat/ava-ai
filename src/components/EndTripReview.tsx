import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';

const EndTripReview: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="review" className="w-full py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            End of Trip Review
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            How Was Your Ride?
          </h2>
          <p className="text-white/60">
            Your feedback helps us maintain the highest standards of Houston luxury chauffeur service.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="bg-luxury border border-gold/10 rounded-2xl p-8 md:p-10">
            <div className="mb-8">
              <label className="block text-xs font-bold text-white uppercase tracking-widest mb-4">Rate your chauffeur</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl transition-colors"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= (hoverRating || rating)
                          ? 'fill-[var(--gold)] text-[var(--gold)]'
                          : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <input
                type="text"
                placeholder="Full Name"
                required
                className="bg-black border border-white/20 rounded-lg p-3 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Confirmation Code (optional)"
                className="bg-black border border-white/20 rounded-lg p-3 text-xs text-white focus:border-[var(--gold)] focus:outline-none"
              />
            </div>

            <textarea
              placeholder="Tell us about your experience..."
              rows={4}
              required
              className="w-full bg-black border border-white/20 rounded-lg p-3 text-xs text-white focus:border-[var(--gold)] focus:outline-none mb-6"
            ></textarea>

            <button
              type="submit"
              className="w-full gold-gradient text-black py-4 rounded-lg text-xs font-extrabold tracking-[0.2em] uppercase hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
              <Send size={16} /> Submit Review
            </button>
          </form>
        ) : (
          <div className="bg-luxury border border-gold/10 rounded-2xl p-10 text-center">
            <CheckCircle2 size={48} className="text-[var(--gold)] mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Thank You for Your Feedback</h3>
            <p className="text-white/60">Your review helps us improve our Houston chauffeur service.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EndTripReview;
