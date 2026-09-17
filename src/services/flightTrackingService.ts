import { FlightDetails } from '../types';

export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  try {
    const [hoursStr, minsStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minsStr, 10);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    minutes += minutesToAdd;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hours)}:${pad(minutes)}`;
  } catch {
    return timeStr;
  }
}

export function format12Hour(time24: string): string {
  try {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  } catch {
    return time24;
  }
}

export async function trackFlightNumber(
  flightInput: string,
  _targetDate: string,
  _flightType: 'arrival' | 'departure' = 'arrival',
  _customBufferMinutes?: number
): Promise<FlightDetails> {
  throw new Error(
    'Live flight tracking is temporarily unavailable on the website. Please provide your flight number in the special requests and our dispatch team will monitor your flight manually.'
  );
}
