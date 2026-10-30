import { getPublicConfig } from '../config/runtimeConfig';

export interface BookingPayload {
  booking_id: string;
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

export async function submitBookingRequest(payload: BookingPayload): Promise<BookingResult> {
  // n8n webhook is public and CORS-enabled for avalimo.net, so we call it directly.
  // The BOOKING_API_ENDPOINT env var can still override this in runtimeConfig.
  const endpoint =
    getPublicConfig().BOOKING_API_ENDPOINT ||
    'https://n8napp.adamj.fit/webhook/avalimo-booking';

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

    // n8n router returns 200 with {"message":"Workflow was started"}.
    // Any successful HTTP response means the booking was accepted.
    if (response.ok) {
      return {
        ok: true,
        status: 'success',
        message: data.message || 'Booking request received. Dispatch will confirm shortly.',
        reference: data.reference || payload.booking_id,
      };
    }

    return {
      ok: false,
      status: 'error',
      message: data.message || 'Could not submit booking request. Please call dispatch.',
    };
  } catch (err) {
    // Network / server down — still show the user their request was captured locally
    return {
      ok: false,
      status: 'fallback',
      message: 'Booking request could not be sent automatically. Please call (832) 567-8050 to confirm.',
    };
  }
}
