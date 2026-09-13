import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Fleet from './components/Fleet';
import Testimonials from './components/Testimonials';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import { TripType } from './types';
import { COMPANY_INFO } from './data/avalimoData';
import { Phone, Calendar, MessageSquare } from 'lucide-react';

function App() {
  const [bookingPrefill, setBookingPrefill] = useState<{
    tripType?: TripType;
    pickupLocation?: string;
    dropoffLocation?: string;
    date?: string;
    vehicleId?: string;
    specialInstructions?: string;
  } | undefined>(undefined);

  const handleSelectVehicle = (vehicleId: string) => {
    setBookingPrefill(prev => ({
      ...prev,
      vehicleId,
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
        <Services />
        <Fleet onSelectVehicle={handleSelectVehicle} />
        <Testimonials />
        <BookingForm initialData={bookingPrefill} />
      </main>
      <Footer />

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-white/10 p-3 flex items-center justify-around sm:hidden">
        <a
          href={`tel:${COMPANY_INFO.phoneRaw}`}
          className="flex items-center text-xs font-bold text-[var(--gold)] py-2 px-3 rounded-md bg-white/5 border border-gold/30"
        >
          <Phone size={14} className="mr-1.5" />
          Call 24/7
        </a>
        <button
          onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center text-xs font-bold text-black py-2 px-4 rounded-md gold-gradient shadow-md uppercase tracking-wider"
        >
          <Calendar size={14} className="mr-1.5" />
          Book Online
        </button>
      </div>
    </div>
  );
}

export default App;
