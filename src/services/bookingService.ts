import { getPublicConfig } from '../config/runtimeConfig';

export interface BookingPayload {
  name: string;
  email: string;
  phone: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  vehicle: string;
  tripType: string;
  hours?: number;
  flightNumber?: string;
  airline?: string;
  childSeat?: boolean;
  specialInstructions?: string;
  estimatedTotal?: number;
  [key: string]: unknown;
}

export interface BookingResult {
  ok: boolean;
  status: 'success' | 'error' | 'fallback';
  message: string;
  reference?: string;
}

// WhatsApp number AvaLimo already publishes on the site (toll-free, WABA-connected).
export const WHATSAPP_NUMBER = '18557102439';

const MAX_PREFILL_FIELD = 120;
const MAX_PREFILL_TOTAL = 700;

function clipField(value: unknown, max = MAX_PREFILL_FIELD): string {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * One-tap escape hatch for a failed website submission: opens WhatsApp with the
 * visitor's trip details prefilled, so the lead still reaches dispatch on a
 * channel that cannot silently fail. Long values are truncated gracefully.
 */
export function buildWhatsAppFallbackUrl(payload: BookingPayload, reference?: string): string {
  const lines = [
    'Hi AvaLimo, I just tried the website request form and it could not send.',
    `Name: ${clipField(payload.name) || '—'}`,
    `Pickup: ${clipField(payload.pickup)}`,
    `Dropoff: ${clipField(payload.dropoff)}`,
    `Date: ${clipField(payload.date, 20)}`,
    `Time: ${clipField(payload.time, 20)}`,
    `Passengers: ${clipField(payload.passengers, 10)}`,
    `Vehicle: ${clipField(payload.vehicle)}`,
    `My phone: ${clipField(payload.phone, 30)}`,
  ];
  if (reference) lines.push(`Reference: ${clipField(reference, 30)}`);
  let message = lines.join('\n');
  if (message.length > MAX_PREFILL_TOTAL) {
    message = `${message.slice(0, MAX_PREFILL_TOTAL - 1)}…`;
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export async function submitBookingRequest(payload: BookingPayload): Promise<BookingResult> {
  const endpoint = getPublicConfig().BOOKING_API_ENDPOINT || '/api/book';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as any;

    if (response.ok && data.status === 'ok') {
      return {
        ok: true,
        status: 'success',
        message: data.message || 'Booking request received. Dispatch will confirm shortly.',
        reference: data.reference || data.confirmationId,
      };
    }

    return {
      ok: false,
      status: 'error',
      message: data.message || 'Your request could not be sent to dispatch. Use WhatsApp below or call (832) 567-8050.',
    };
  } catch (err) {
    // Network / server down — the request did NOT reach dispatch. The form
    // shows a WhatsApp fallback so the lead is not lost.
    return {
      ok: false,
      status: 'fallback',
      message: 'Your request could not be sent automatically — it has not reached dispatch. Use WhatsApp below or call (832) 567-8050.',
    };
  }
}
