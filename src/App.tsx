import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Fleet from './components/Fleet';
import AirportGalveston from './components/AirportGalveston';
import Rates from './components/Rates';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import FAQ from './components/FAQ';
import EndTripReview from './components/EndTripReview';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import { TripType } from './types';
import { COMPANY_INFO } from './data/avalimoData';
import { Phone, Calendar } from 'lucide-react';

function GlobalErrorCatcher({ children }: { children: React.ReactNode }) {
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      const msg = e.error ? `${e.message}\n${e.error.stack || ''}` : e.message;
      setErr(msg);
    };
    const rejHandler = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const msg = reason instanceof Error ? `${reason.message}\n${reason.stack || ''}` : String(reason);
      setErr(msg);
    };
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rejHandler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rejHandler);
    };
  }, []);

  if (!err) return <>{children}</>;

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[9999] bg-black/95 text-white p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-red-500 font-bold text-lg mb-4">App Crashed</h2>
          <pre className="text-xs whitespace-pre-wrap break-words bg-white/10 p-4 rounded">{err}</pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-[var(--gold)] text-black font-bold rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    </>
  );
}

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
    <GlobalErrorCatcher>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main>
          <Hero />
          <Services />
          <Fleet onSelectVehicle={handleSelectVehicle} />
          <AirportGalveston />
          <Rates />
          <Testimonials />
          <Blog />
          <FAQ />
          <EndTripReview />
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
    </GlobalErrorCatcher>
  );
}

export default App;
