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
