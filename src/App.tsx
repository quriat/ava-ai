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
import CoreRoute, { coreSlugs } from './components/CoreRoute';
import FAQ from './components/FAQ';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import StickyCallBar from './components/StickyCallBar';
import { TripType } from './types';
import { getPublicConfig } from './config/runtimeConfig';
import { initAnalytics, trackEvent, trackOutboundClicks, trackPageView } from './lib/analytics';

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
  const cleanPath = path.replace(/^\//, '').replace(/\/+$/, '');

  const [bookingPrefill, setBookingPrefill] = useState<{
    tripType?: TripType;
    pickupLocation?: string;
    dropoffLocation?: string;
    date?: string;
    vehicleId?: string;
    specialInstructions?: string;
  } | undefined>(undefined);

  // SPA navigations do not reload the page, so GA4 never sees them on its own.
  // CoreRoute and ServiceLanding set document.title in their own effects, so
  // read it on the next frame to pick up the route-specific title.
  useEffect(() => {
    const cfg = getPublicConfig();
    initAnalytics(cfg.GA_MEASUREMENT_ID, cfg.CLARITY_PROJECT_ID);
    const detach = trackOutboundClicks();
    const frame = requestAnimationFrame(() => {
      const resolved = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
      trackPageView(window.location.pathname, document.title);
      const existing = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      if (!existing) {
        const el = document.createElement('link');
        el.rel = 'canonical';
        el.href = `https://avalimo.net/${resolved === 'home' ? '' : resolved}`;
        document.head.appendChild(el);
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      detach();
    };
  }, [path]);

  // In-page anchors such as /#booking-section are resolved by the browser before
  // React mounts, so the target does not exist yet. Re-run the scroll once it does.
  useEffect(() => {
    if (path !== '/' && path !== '') return;
    const id = window.location.hash.replace(/^#/, '');
    if (!id) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(t);
  }, [path]);

  if (path === '/blog' || path === '/blog/' || path.startsWith('/blog/')) {
    return (
      <GlobalErrorCatcher>
        <BlogArticle />
      </GlobalErrorCatcher>
    );
  }
  if (landingSlugs().includes(cleanPath)) {
    return (
      <GlobalErrorCatcher>
        <ServiceLanding />
      </GlobalErrorCatcher>
    );
  }
  if (coreSlugs().includes(cleanPath)) {
    return (
      <GlobalErrorCatcher>
        <CoreRoute />
      </GlobalErrorCatcher>
    );
  }

  const handleSelectVehicle = (vehicleId: string) => {
    setBookingPrefill(prev => ({
      ...prev,
      vehicleId,
    }));
    trackEvent('vehicle_select', { vehicle: vehicleId, placement: 'homepage' });
  };

  const handleSelectRoute = (route: 'iah' | 'galveston') => {
    setBookingPrefill(prev => ({
      ...prev,
      tripType: route === 'galveston' ? TripType.GALVESTON : TripType.AIRPORT,
      dropoffLocation: route === 'galveston' ? 'Port of Galveston Cruise Terminal' : undefined,
    }));
    trackEvent('route_select', { route, placement: 'homepage' });
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
        <StickyCallBar />
      </div>
    </GlobalErrorCatcher>
  );
}

export default App;