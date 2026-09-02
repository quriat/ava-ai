import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Fleet from './components/Fleet';
import AirportAndCruiseGuide from './components/AirportAndCruiseGuide';
import TestimonialsAndAreas from './components/TestimonialsAndAreas';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import AIConcierge from './components/AIConcierge';
import TripReviewDispatcher from './components/TripReviewDispatcher';
import LeaveGoogleReviewModal from './components/LeaveGoogleReviewModal';
import { TripType } from './types';
import { COMPANY_INFO } from './data/avalimoData';
import { Phone, Calendar, MessageSquareText } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<{
    tripType?: TripType;
    pickupLocation?: string;
    dropoffLocation?: string;
    date?: string;
    vehicleId?: string;
    specialInstructions?: string;
  } | undefined>(undefined);

  // Auto-detect URL query params (e.g. avalimo.net?review=true or avalimo.net?dispatch=true)
  useEffect(() => {
    const query = window.location.search;
    if (query.includes('review=true')) {
      setIsReviewModalOpen(true);
    }
    if (query.includes('dispatch=true') || window.location.hash.includes('dispatch')) {
      setCurrentPage('review-dispatcher');
    }
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    
    if (page === 'home' || page === 'review-dispatcher') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    let elementId = '';
    if (page === 'services' || page === 'services-section') elementId = 'services-section';
    if (page === 'fleet' || page === 'fleet-section') elementId = 'fleet-section';
    if (page === 'rates' || page === 'rates-section' || page === 'airports' || page === 'galveston' || page === 'airport-galveston') elementId = 'rates-section';
    if (page === 'areas' || page === 'areas-section') elementId = 'areas-section';
    if (page === 'reviews' || page === 'reviews-section') elementId = 'reviews-section';
    if (page === 'blog' || page === 'blog-section') elementId = 'blog-section';
    if (page === 'book' || page === 'contact' || page === 'booking-section') elementId = 'booking-section';
    if (page === 'faq') {
      // FAQs live as a tab inside the Airport & Galveston guide — open that tab, then scroll
      window.dispatchEvent(new CustomEvent('avalimo:open-faqs'));
      elementId = 'rates-section';
    }

    if (elementId) {
      const element = document.getElementById(elementId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const handleBookWithPrefill = (prefillData?: any) => {
    if (prefillData) {
      setBookingPrefill(prefillData);
    }
    handleNavigation('booking-section');
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setBookingPrefill((prev) => ({
      ...prev,
      vehicleId,
    }));
    handleNavigation('booking-section');
  };

  const handleSelectAirport = (airportName: string) => {
    setBookingPrefill({
      tripType: TripType.AIRPORT,
      pickupLocation: airportName,
      dropoffLocation: 'Downtown Houston / Galleria',
    });
    handleNavigation('booking-section');
  };

  const handleSelectCruise = () => {
    setBookingPrefill({
      tripType: TripType.GALVESTON,
      pickupLocation: 'George Bush Intercontinental Airport (IAH)',
      dropoffLocation: 'Port of Galveston Cruise Terminal',
    });
    handleNavigation('booking-section');
  };

  const handleSelectServiceArea = (areaName?: string) => {
    if (areaName) {
      setBookingPrefill({
        tripType: TripType.POINT_TO_POINT,
        pickupLocation: `${areaName}, TX`,
        dropoffLocation: 'George Bush Intercontinental Airport (IAH)',
      });
    }
    handleNavigation('booking-section');
  };

  return (
    <div className="bg-neutral-950 min-h-screen text-gray-100 selection:bg-amber-500 selection:text-black">
      {/* Navigation Bar */}
      <Navbar onNavigate={handleNavigation} currentPage={currentPage} />
      
      {/* NOTE: Corporate Portal + internal Review Dispatcher are intentionally NOT
          reachable from the public site. They are internal tools, re-enable only
          behind real authentication. */}
      {currentPage === 'review-dispatcher' ? (
        <main>
          <TripReviewDispatcher />
        </main>
      ) : (
        <main>
          {/* Hero with Instant Fare Estimator */}
          <Hero 
            onBookNow={handleBookWithPrefill} 
            onViewFleet={() => handleNavigation('fleet')}
            onOpenAirportGuide={() => handleNavigation('rates-section')}
          />
          
          {/* Services Showcase */}
          <div id="services-section">
            <Services onSelectService={(serviceTitle) => {
              handleBookWithPrefill({
                specialInstructions: `Requested Service: ${serviceTitle}`
              });
            }} />
          </div>
          
          {/* Luxury Fleet Showcase */}
          <div id="fleet-section">
            <Fleet onSelect={handleSelectVehicle} />
          </div>

          {/* Airport Guides, Galveston Port & FAQs */}
          <div id="rates-section">
            <AirportAndCruiseGuide 
              onBookAirport={handleSelectAirport}
              onBookCruise={handleSelectCruise}
            />
          </div>

          {/* Reviews, Testimonials & Houston Service Areas */}
          <div id="areas-section">
            <TestimonialsAndAreas 
              onBookNow={handleSelectServiceArea}
            />
          </div>

          {/* Full-Featured Reservation Engine */}
          <div id="booking-section">
            <BookingForm initialData={bookingPrefill} />
          </div>
        </main>
      )}

      {/* Global Footer */}
      <Footer 
        onNavigate={handleNavigation}
        onSelectVehicle={handleSelectVehicle}
      />

      {/* Leave Google Review Modal (Opens when client visits via review link or clicks leave review) */}
      <LeaveGoogleReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

      {/* Gemini AI Chauffeur Concierge */}
      <AIConcierge />

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 p-2.5 flex items-center justify-around sm:hidden">
        <a 
          href={`tel:${COMPANY_INFO.phoneRaw}`}
          className="flex items-center text-xs font-bold text-amber-400 py-1.5 px-3 rounded-md bg-neutral-900 border border-amber-500/30"
        >
          <Phone size={14} className="mr-1.5" />
          Call 24/7
        </a>
        <button
          onClick={() => handleNavigation('booking-section')}
          className="flex items-center text-xs font-bold text-white py-1.5 px-4 rounded-md bg-amber-600 shadow-md uppercase tracking-wider"
        >
          <Calendar size={14} className="mr-1.5" />
          Book Online
        </button>
      </div>
    </div>
  );
}

export default App;
