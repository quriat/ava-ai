import { RouteEstimate } from '../types';

export function calculateRouteEstimate(
  pickup: string,
  dropoff: string,
  _tripTime: string = '12:00'
): RouteEstimate {
  // Note: this no longer simulates live traffic. It returns a transparent estimate.
  return {
    distanceMiles: 0,
    durationMinutes: 0,
    durationFormatted: 'To be confirmed',
    durationRangeFormatted: 'To be confirmed',
    primaryHighway: 'Pending dispatch review',
    trafficLevel: 'Moderate',
    tollNote: 'All tolls included in final quote',
    routeSummary: `A dispatcher will confirm time, distance, and route for ${pickup} → ${dropoff}. Estimates are not live traffic data.`,
  };
}
