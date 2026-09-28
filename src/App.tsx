import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Options from './components/Options';
import Fleet from './components/Fleet';
import Rates from './components/Rates';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import BlogArticle from './components/BlogArticle';
import ServiceLanding, { landingSlugs } from './components/ServiceLanding';
import FAQ from './components/FAQ';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import { TripType } from './types';

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
  // Lightweight path-based routing for blog pages (SPA served via nginx fallback).
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/blog' || path === '/blog/' || path.startsWith('/blog/')) {
    return (
      <GlobalErrorCatcher>
        <BlogArticle />
      </GlobalErrorCatcher>
    );
  }
  const cleanPath = path.replace(/^\//, '').replace(/\/+$/, '');
  if (landingSlugs().includes(cleanPath)) {
    return (
      <GlobalErrorCatcher>
        <ServiceLanding />
      </GlobalErrorCatcher>
    );
  }

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

  const handleSelectRoute = (route: 'iah' | 'galveston') => {
    setBookingPrefill(prev => ({
      ...prev,
      tripType: route === 'galveston' ? TripType.GALVESTON : TripType.AIRPORT,
      dropoffLocation: route === 'galveston' ? 'Port of Galveston Cruise Terminal' : undefined,
    }));
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <GlobalErrorCatcher>
      <div className="min-h-screen bg-dark-950 text-slate-100 antialiased">
        <Header />
        <main>
          <Hero />
          <Options onSelect={handleSelectRoute} />
          <Fleet onSelectVehicle={handleSelectVehicle} />
          <Rates />
          <Testimonials />
          <Blog />
          <FAQ />
          <BookingForm initialData={bookingPrefill} />
        </main>
        <Footer />
      </div>
    </GlobalErrorCatcher>
  );
}

export default App;