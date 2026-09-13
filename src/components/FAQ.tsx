import React, { useState } from 'react';
import { FAQS_DATA } from '../data/avalimoData';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full py-24 md:py-32 px-6 md:px-12 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Common Questions
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-white/60">
            Everything you need to know before booking your Houston luxury ride.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS_DATA.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-xl transition-all ${openIndex === index ? 'border-[var(--gold)] bg-luxury' : 'border-white/10 bg-white/5'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp size={18} className="text-[var(--gold)] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-white/40 flex-shrink-0" />
                  )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-white/60 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
