import React from 'react';
import { SERVICES_DATA } from '../data/avalimoData';
import { Plane, Ship, Briefcase, Heart, Clock, MapPin } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Plane: <Plane size={28} strokeWidth={1.5} />,
  Ship: <Ship size={28} strokeWidth={1.5} />,
  Briefcase: <Briefcase size={28} strokeWidth={1.5} />,
  Heart: <Heart size={28} strokeWidth={1.5} />,
  Clock: <Clock size={28} strokeWidth={1.5} />,
  MapPin: <MapPin size={28} strokeWidth={1.5} />,
};

const Services: React.FC = () => {
  const scrollToBooking = () => {
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="w-full py-24 md:py-32 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Our Services</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Every Occasion, Covered
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            From airport pickups to weddings, we provide premium transportation for every occasion across Houston.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              className="group bg-luxury border border-white/5 p-8 rounded-2xl hover:border-gold/30 transition-all duration-300"
            >
              <div className="text-[var(--gold)] mb-6">{iconMap[service.iconName] || <MapPin size={28} />}</div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">{service.title}</h3>
              <p className="text-[var(--gold)] text-[10px] font-bold tracking-[0.15em] uppercase mb-4">{service.tagline}</p>
              <p className="text-white/60 text-sm leading-relaxed mb-6">{service.description}</p>
              <ul className="space-y-2 mb-6">
                {service.features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[13px] text-white/50">
                    <span className="text-[var(--gold)] mt-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={scrollToBooking}
                className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-[var(--gold)] hover:text-white transition-colors"
              >
                Book This Service →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
