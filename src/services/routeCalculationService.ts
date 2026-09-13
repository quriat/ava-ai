import { RouteEstimate } from '../types';

const HOUSTON_LOCATIONS: Record<string, { lat: number; lng: number; region: string }> = {
  'George Bush Intercontinental Airport (IAH)': { lat: 29.9902, lng: -95.3368, region: 'north' },
  'William P. Hobby Airport (HOU)': { lat: 29.6454, lng: -95.2789, region: 'south' },
  'Downtown Houston / Galleria': { lat: 29.7573, lng: -95.3636, region: 'central' },
  'Downtown Houston (Toyota Center / Convention Center)': { lat: 29.7573, lng: -95.3636, region: 'central' },
  'The Galleria / Uptown Post Oak': { lat: 29.7399, lng: -95.4674, region: 'central' },
  'Texas Medical Center (MD Anderson / Methodist)': { lat: 29.7074, lng: -95.4016, region: 'central' },
  'The Woodlands / Cynthia Woods Pavilion': { lat: 30.1658, lng: -95.4613, region: 'north' },
  'Sugar Land / Missouri City (Smart Financial Centre)': { lat: 29.6194, lng: -95.6349, region: 'southwest' },
  'Katy / Energy Corridor': { lat: 29.7858, lng: -95.8245, region: 'west' },
  'Port of Galveston Cruise Terminal': { lat: 29.3057, lng: -94.7934, region: 'coast' },
  'Galveston Island': { lat: 29.3013, lng: -94.7977, region: 'coast' },
  'Clear Lake / NASA': { lat: 29.5647, lng: -95.0811, region: 'southeast' }
};

function getCoordinates(location: string): { lat: number; lng: number; region: string } | null {
  const normalized = location.toLowerCase();
  for (const [key, value] of Object.entries(HOUSTON_LOCATIONS)) {
    if (normalized.includes(key.toLowerCase().split('(')[0].trim()) ||
        key.toLowerCase().includes(normalized.split(' ')[0])) {
      return value;
    }
  }
  return null;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateRouteEstimate(
  pickup: string,
  dropoff: string,
  tripTime: string = '12:00'
): RouteEstimate {
  const p = getCoordinates(pickup);
  const d = getCoordinates(dropoff);

  if (!p || !d) {
    return {
      distanceMiles: 22,
      durationMinutes: 38,
      durationFormatted: '35-45 min',
      durationRangeFormatted: '35-45 min',
      primaryHighway: 'I-69 / I-45 / I-610',
      trafficLevel: 'Moderate',
      tollNote: 'Toll-free routing available; Hardy Toll Road used only when faster at no extra charge',
      routeSummary: 'Route estimate based on typical Houston corridor timing'
    };
  }

  const distance = haversine(p.lat, p.lng, d.lat, d.lng);
  const hour = parseInt(tripTime.split(':')[0], 10);

  let trafficMultiplier = 1.0;
  let trafficLevel: 'Low' | 'Moderate' | 'Heavy' | 'Optimal Flow' = 'Moderate';

  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    trafficMultiplier = 1.45;
    trafficLevel = 'Heavy';
  } else if (hour >= 10 && hour <= 15) {
    trafficMultiplier = 1.05;
    trafficLevel = 'Optimal Flow';
  } else if (hour >= 22 || hour <= 5) {
    trafficMultiplier = 0.85;
    trafficLevel = 'Low';
  }

  const baseDuration = distance * 1.8;
  const durationMinutes = Math.round(baseDuration * trafficMultiplier);
  const minMinutes = Math.max(15, Math.round(durationMinutes * 0.85));
  const maxMinutes = Math.round(durationMinutes * 1.15);

  let primaryHighway = 'I-610 Loop';
  if (p.region === 'north' || d.region === 'north') primaryHighway = 'I-45 N / Hardy Toll Rd';
  if (p.region === 'coast' || d.region === 'coast') primaryHighway = 'I-45 S';
  if (p.region === 'west' || d.region === 'west') primaryHighway = 'I-10 W / Energy Corridor';
  if (p.region === 'southwest' || d.region === 'southwest') primaryHighway = 'US-59 S / Southwest Fwy';

  return {
    distanceMiles: Math.round(distance),
    durationMinutes,
    durationFormatted: `${minMinutes}-${maxMinutes} min`,
    durationRangeFormatted: `${minMinutes}-${maxMinutes} min`,
    primaryHighway,
    trafficLevel,
    tollNote: 'All tolls included; AvaLimo pre-routes via managed lanes when faster at zero extra charge',
    routeSummary: `Estimated ${Math.round(distance)} miles via ${primaryHighway}, ${trafficLevel.toLowerCase()} traffic conditions`
  };
}
