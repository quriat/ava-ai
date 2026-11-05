import React, { useState } from 'react';
import { TripType } from '../types';
import {
  QUOTE_ROUTES,
  QUOTE_VEHICLE_CLASSES,
  QuoteRoute,
  QuoteVehicleClass,
  COMPANY_INFO,
  WHATSAPP_URL,
} from '../data/avalimoData';
import { Phone, MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

export interface QuoteBookData {
  tripType: TripType;
  vehicleId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
}

interface QuoteWidgetProps {
  onBook?: (data: QuoteBookData) => void;
}

/** Booking-form vehicle preselect per class (Sedan leaves the form default). */
const CLASS_VEHICLE_ID: Record<QuoteVehicleClass, string | undefined> = {
  sedan: undefined,
  suv: 'cadillac-escalade-esv',
  sclass: 'mercedes-s-class',
};

const formatPrice = (route: QuoteRoute, cls: QuoteVehicleClass) => {
  const price = route.prices[cls];
  return price === null ? 'Call for quote' : `$${price}`;
};

/**
 * Instant flat-rate quote: pick a route and a vehicle class, see the
 * guaranteed price, then jump to the booking form. Prices come from
 * QUOTE_ROUTES in avalimoData.ts — combinations listed as null are
 * phone-quote only and are never estimated.
 */
export default function QuoteWidget({ onBook }: QuoteWidgetProps) {
  const [routeId, setRouteId] = useState<string>(QUOTE_ROUTES[0].id);
  const [vehicleClass, setVehicleClass] = useState<QuoteVehicleClass>('sedan');

  const route = QUOTE_ROUTES.find((r) => r.id === routeId) || QUOTE_ROUTES[0];
  const price = route.prices[vehicleClass];

  const handleBook = () => {
    trackEvent('quote_widget_book', { route: route.id, vehicleClass, price });
    onBook?.({
      tripType: route.tripType === 'galveston' ? TripType.GALVESTON : TripType.AIRPORT,
      vehicleId: CLASS_VEHICLE_ID[vehicleClass],
      pickupLocation: route.pickupLocation,
      dropoffLocation: route.dropoffLocation,
    });
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border-champagne shadow-2xl relative backdrop-blur-xl">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-champagne">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[var(--gold)] uppercase block">
            Instant Flat Rate
          </span>
          <h3 className="font-serif text-lg font-bold text-white">Get Your Price in Seconds</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
          No Surge Ever
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route picker */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            1. Select Your Route
          </label>
          <div className="space-y-2">
            {QUOTE_ROUTES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRouteId(r.id)}
                className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left ${
                  routeId === r.id
                    ? 'border-[var(--gold)] bg-gold/10'
                    : 'border-slate-800/80 bg-dark-950/60 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold text-white pr-2">{r.label}</span>
                <span className="text-[11px] font-bold text-gold-400 whitespace-nowrap">
                  {r.prices.sedan === null ? 'Call for quote' : `from $${r.prices.sedan}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle class + price */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            2. Select Vehicle Class
          </label>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {QUOTE_VEHICLE_CLASSES.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setVehicleClass(cls.id)}
                className={`py-2.5 px-2 rounded-xl transition-all border ${
                  vehicleClass === cls.id
                    ? 'bg-gold/20 border-[var(--gold)] text-gold-300'
                    : 'bg-dark-900/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider">{cls.label}</span>
                <span className="block text-[10px] font-semibold mt-0.5">
                  {formatPrice(route, cls.id)}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-dark-950 border border-gold/30 mb-5">
            {price !== null ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Your Flat Rate
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                      ${price}
                    </span>
                    <span className="text-[11px] text-gold-400 font-bold uppercase tracking-wider">
                      Flat Rate
                    </span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 leading-tight">
                  <span className="text-emerald-400 font-semibold block">✓ Per Car, All-Inclusive</span>
                  <span>Meet &amp; greet, taxes &amp; tolls included</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--gold)] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  This route is quoted personally by dispatch — one flat price for the whole car,
                  confirmed before you book.{' '}
                  <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="text-gold-400 font-bold hover:text-white">
                    Call {COMPANY_INFO.phone}
                  </a>
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleBook}
            className="w-full py-4 rounded-full gold-gradient text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.99] transition-transform flex items-center justify-center gap-2 mb-3"
          >
            <span>Book This Ride</span>
            <ChevronRight size={16} />
          </button>

          <div className="flex gap-2">
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              onClick={() => trackEvent('quote_widget_call', { route: route.id })}
              className="flex-1 py-2.5 rounded-full bg-dark-900 hover:bg-dark-800 border border-gold/40 text-gold-400 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Phone size={13} />
              <span>Call Dispatch</span>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('quote_widget_whatsapp', { route: route.id })}
              className="flex-1 py-2.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#4be07f] text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <MessageCircle size={13} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
