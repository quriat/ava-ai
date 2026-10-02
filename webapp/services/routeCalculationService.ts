import { RouteEstimate } from '../types';

export interface LocationNode {
  id: string;
  name: string;
  category: 'airport' | 'cruise' | 'downtown' | 'uptown' | 'suburb' | 'medical' | 'intercity';
  keywords: string[];
  lat: number;
  lng: number;
  shortLabel: string;
}

// Key Houston & Texas geographic reference points
export const HOUSTON_LOCATIONS: LocationNode[] = [
  {
    id: 'iah',
    name: 'George Bush Intercontinental Airport (IAH)',
    category: 'airport',
    keywords: ['iah', 'bush', 'intercontinental', 'bush airport', 'terminal a', 'terminal b', 'terminal c', 'terminal d', 'terminal e', 'jfk blvd', 'will clayton'],
    lat: 29.9902,
    lng: -95.3368,
    shortLabel: 'IAH Airport'
  },
  {
    id: 'hou',
    name: 'William P. Hobby Airport (HOU)',
    category: 'airport',
    keywords: ['hou', 'hobby', 'william p hobby', 'hobby airport', 'airport blvd', 'telephone rd'],
    lat: 29.6454,
    lng: -95.2789,
    shortLabel: 'Hobby (HOU)'
  },
  {
    id: 'downtown',
    name: 'Downtown Houston (Toyota Center / Minute Maid / GRB)',
    category: 'downtown',
    keywords: ['downtown', 'toyota center', 'minute maid', 'george r brown', 'grb', 'four seasons', 'marriott marquis', 'theater district', 'main st', 'louisiana'],
    lat: 29.7570,
    lng: -95.3633,
    shortLabel: 'Downtown'
  },
  {
    id: 'galleria',
    name: 'The Galleria / Uptown Post Oak / River Oaks',
    category: 'uptown',
    keywords: ['galleria', 'uptown', 'post oak', 'post oak hotel', 'river oaks', 'westheimer', 'st regis', 'san felipe', '610 loop', 'west loop'],
    lat: 29.7400,
    lng: -95.4638,
    shortLabel: 'Galleria / Post Oak'
  },
  {
    id: 'med-center',
    name: 'Texas Medical Center (MD Anderson / Methodist / Rice)',
    category: 'medical',
    keywords: ['medical center', 'tmc', 'md anderson', 'methodist', 'rice university', 'hermann park', 'texas children', 'fannin', 'museum district'],
    lat: 29.7100,
    lng: -95.3970,
    shortLabel: 'Medical Center'
  },
  {
    id: 'woodlands',
    name: 'The Woodlands / Spring / Cynthia Woods Pavilion',
    category: 'suburb',
    keywords: ['woodlands', 'the woodlands', 'spring', 'cynthia woods', 'hughes landing', 'woodlands waterway', 'exxon', 'exxonmobil', 'shenandoah'],
    lat: 30.1658,
    lng: -95.4613,
    shortLabel: 'The Woodlands'
  },
  {
    id: 'galveston',
    name: 'Port of Galveston Cruise Terminal / Island Piers',
    category: 'cruise',
    keywords: ['galveston', 'cruise', 'port of galveston', 'royal caribbean', 'carnival', 'disney cruise', 'terminal 10', 'terminal 25', 'terminal 28', 'harborside', 'strand', 'san luis'],
    lat: 29.3013,
    lng: -94.7977,
    shortLabel: 'Galveston Cruise'
  },
  {
    id: 'sugarland',
    name: 'Sugar Land / Missouri City (Smart Financial Centre)',
    category: 'suburb',
    keywords: ['sugar land', 'sugarland', 'missouri city', 'smart financial', 'first colony', 'sienna', 'hwy 6', 'sweetwater', 'fort bend'],
    lat: 29.5984,
    lng: -95.6226,
    shortLabel: 'Sugar Land'
  },
  {
    id: 'energy-corridor',
    name: 'Energy Corridor / Katy / Cinco Ranch',
    category: 'suburb',
    keywords: ['energy corridor', 'katy', 'cinco ranch', 'katy mills', 'eldridge', 'i-10 west', 'bp campus', 'shell', 'conocophillips', 'fulshear'],
    lat: 29.7858,
    lng: -95.6420,
    shortLabel: 'Energy Corridor / Katy'
  },
  {
    id: 'clearlake',
    name: 'Clear Lake / NASA Johnson Space Center / Kemah',
    category: 'suburb',
    keywords: ['clear lake', 'nasa', 'space center', 'kemah', 'webster', 'friendswood', 'pearland', 'league city', 'south shore'],
    lat: 29.5519,
    lng: -95.0970,
    shortLabel: 'NASA / Clear Lake'
  },
  {
    id: 'austin',
    name: 'Austin, TX (Downtown / Austin-Bergstrom AUS)',
    category: 'intercity',
    keywords: ['austin', 'aus', 'bergstrom', 'congress ave', 'domain', 'texas capitol', 'round rock'],
    lat: 30.2672,
    lng: -97.7431,
    shortLabel: 'Austin, TX'
  },
  {
    id: 'san-antonio',
    name: 'San Antonio, TX (River Walk / SAT Airport)',
    category: 'intercity',
    keywords: ['san antonio', 'sat', 'river walk', 'riverwalk', 'alamo', 'pearl district'],
    lat: 29.4241,
    lng: -98.4936,
    shortLabel: 'San Antonio, TX'
  },
  {
    id: 'dallas',
    name: 'Dallas / Fort Worth, TX (Downtown / DFW)',
    category: 'intercity',
    keywords: ['dallas', 'dfw', 'fort worth', 'love field', 'uptown dallas', 'arlington'],
    lat: 32.7767,
    lng: -96.7970,
    shortLabel: 'Dallas, TX'
  },
  {
    id: 'college-station',
    name: 'College Station, TX (Texas A&M / Kyle Field)',
    category: 'intercity',
    keywords: ['college station', 'texas a&m', 'tamu', 'kyle field', 'bryan'],
    lat: 30.6280,
    lng: -96.3344,
    shortLabel: 'College Station'
  }
];

// Helper: Haversine distance in statute miles
function calculateHaversineDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fuzzy node matcher
export function matchLocationNode(input: string): LocationNode | null {
  if (!input || !input.trim()) return null;
  const normalized = input.toLowerCase().trim();

  // Exact ID or name check
  for (const loc of HOUSTON_LOCATIONS) {
    if (loc.id === normalized || loc.name.toLowerCase() === normalized) {
      return loc;
    }
  }

  // Keyword check
  for (const loc of HOUSTON_LOCATIONS) {
    for (const kw of loc.keywords) {
      if (normalized.includes(kw)) {
        return loc;
      }
    }
  }

  return null;
}

/**
 * Calculates dynamic travel time, distance, and highway route estimate
 * for any pickup and dropoff combination in Greater Houston and Texas.
 */
export function calculateRouteEstimate(
  pickupStr: string,
  dropoffStr: string,
  tripTime?: string
): RouteEstimate {
  const pickupNode = matchLocationNode(pickupStr);
  const dropoffNode = matchLocationNode(dropoffStr);

  // Determine baseline distance & driving time
  let drivingMiles = 20;
  let baseDurationMinutes = 30;
  let primaryHighway = 'Hardy Toll Road & I-69 / US-59 North';
  let routeSummary = 'Direct highway corridor via electronic tollways';
  let recommendedDepartureNote: string | undefined = undefined;

  if (pickupNode && dropoffNode && pickupNode.id === dropoffNode.id) {
    // Same area local trip
    drivingMiles = 5.5;
    baseDurationMinutes = 12;
    primaryHighway = 'Local thoroughfares & express connector';
    routeSummary = `Local transit within ${pickupNode.shortLabel}`;
  } else if (pickupNode && dropoffNode) {
    // Calculate geographic road routing
    const directDist = calculateHaversineDistanceMiles(
      pickupNode.lat,
      pickupNode.lng,
      dropoffNode.lat,
      dropoffNode.lng
    );

    // Houston road network routing winding coefficient:
    // Intercity ~ 1.18x, Urban highway ~ 1.32x
    const windingFactor = directDist > 80 ? 1.18 : 1.35;
    drivingMiles = Math.round(directDist * windingFactor * 10) / 10;

    // Highway speed modeling
    if (directDist > 80) {
      // Highway cruising (e.g. Austin, Dallas, San Antonio) ~68-72 mph
      baseDurationMinutes = Math.round((drivingMiles / 65) * 60);
      if (dropoffNode.id === 'austin' || pickupNode.id === 'austin') {
        primaryHighway = 'US-290 West & TX-71 Highway Express';
        routeSummary = 'Scenic Texas Hill Country direct door-to-door transit';
      } else if (dropoffNode.id === 'dallas' || pickupNode.id === 'dallas') {
        primaryHighway = 'I-45 North Direct Corridor';
        routeSummary = 'Straight interstate cruising with optional premium rest stop';
      } else if (dropoffNode.id === 'san-antonio' || pickupNode.id === 'san-antonio') {
        primaryHighway = 'I-10 West Interstate Corridor';
        routeSummary = 'Smooth non-stop highway transit to the Alamo City';
      } else if (dropoffNode.id === 'college-station' || pickupNode.id === 'college-station') {
        primaryHighway = 'US-290 W to TX-6 North Express';
        routeSummary = 'Direct route to Texas A&M University campus';
      }
    } else {
      // Urban Houston corridors
      if (
        (pickupNode.id === 'iah' && dropoffNode.id === 'downtown') ||
        (pickupNode.id === 'downtown' && dropoffNode.id === 'iah')
      ) {
        drivingMiles = 21.8;
        baseDurationMinutes = 26;
        primaryHighway = 'Hardy Toll Road & I-69 North';
        routeSummary = 'Fastest route via Hardy Airport Connector bypassing Eastex traffic';
      } else if (
        (pickupNode.id === 'iah' && dropoffNode.id === 'galleria') ||
        (pickupNode.id === 'galleria' && dropoffNode.id === 'iah')
      ) {
        drivingMiles = 27.4;
        baseDurationMinutes = 34;
        primaryHighway = 'Hardy Toll Road to I-610 West Loop';
        routeSummary = 'Express toll bypass directly to Post Oak & Galleria district';
      } else if (
        (pickupNode.id === 'iah' && dropoffNode.id === 'galveston') ||
        (pickupNode.id === 'galveston' && dropoffNode.id === 'iah')
      ) {
        drivingMiles = 71.5;
        baseDurationMinutes = 75;
        primaryHighway = 'Hardy Toll Road to I-45 South Gulf Freeway & Causeway';
        routeSummary = 'Direct north-to-south cruise corridor with dedicated port access';
      } else if (
        (pickupNode.id === 'hou' && dropoffNode.id === 'galveston') ||
        (pickupNode.id === 'galveston' && dropoffNode.id === 'hou')
      ) {
        drivingMiles = 41.2;
        baseDurationMinutes = 45;
        primaryHighway = 'I-45 South Direct to Harborside Drive';
        routeSummary = 'Quickest coastal transit from Hobby to Port of Galveston';
      } else if (
        (pickupNode.id === 'iah' && dropoffNode.id === 'woodlands') ||
        (pickupNode.id === 'woodlands' && dropoffNode.id === 'iah')
      ) {
        drivingMiles = 22.0;
        baseDurationMinutes = 24;
        primaryHighway = 'Hardy Toll Road North to I-45 Woodlands Pkwy';
        routeSummary = 'Swift northern business corridor transit';
      } else if (
        (pickupNode.id === 'hou' && dropoffNode.id === 'downtown') ||
        (pickupNode.id === 'downtown' && dropoffNode.id === 'hou')
      ) {
        drivingMiles = 10.5;
        baseDurationMinutes = 18;
        primaryHighway = 'I-45 North Gulf Freeway / MLK Express';
        routeSummary = 'Direct 10-mile hop between Hobby and central downtown towers';
      } else if (
        (pickupNode.id === 'iah' && dropoffNode.id === 'sugarland') ||
        (pickupNode.id === 'sugarland' && dropoffNode.id === 'iah')
      ) {
        drivingMiles = 39.8;
        baseDurationMinutes = 48;
        primaryHighway = 'Beltway 8 Sam Houston Tollway / US-59 South';
        routeSummary = 'Outer loop express connection with all EZ-Tag tolls included';
      } else if (
        (pickupNode.id === 'iah' && dropoffNode.id === 'energy-corridor') ||
        (pickupNode.id === 'energy-corridor' && dropoffNode.id === 'iah')
      ) {
        drivingMiles = 36.2;
        baseDurationMinutes = 42;
        primaryHighway = 'Sam Houston Tollway West / I-10 Katy Freeway';
        routeSummary = 'Northwest loop bypass to Energy Corridor business parks';
      } else {
        // General Houston urban formula: average ~42 mph with signals and tollways
        baseDurationMinutes = Math.max(15, Math.round((drivingMiles / 42) * 60));
        primaryHighway = 'Sam Houston Tollway & Houston Highway Network';
        routeSummary = `Connecting ${pickupNode.shortLabel} and ${dropoffNode.shortLabel} via optimal tollway`;
      }
    }
  } else {
    // Generic fallback based on string length and general words
    const combined = (pickupStr + ' ' + dropoffStr).toLowerCase();
    if (combined.includes('galveston')) {
      drivingMiles = 52.0;
      baseDurationMinutes = 58;
      primaryHighway = 'I-45 South Gulf Freeway & Causeway';
      routeSummary = 'Island & Cruise Port Route';
    } else if (combined.includes('woodlands')) {
      drivingMiles = 31.0;
      baseDurationMinutes = 35;
      primaryHighway = 'I-45 North & Hardy Tollway';
      routeSummary = 'North Houston Corridor';
    } else if (combined.includes('hobby') || combined.includes('hou')) {
      drivingMiles = 16.5;
      baseDurationMinutes = 24;
      primaryHighway = 'I-45 & Airport Blvd';
      routeSummary = 'Hobby Airport Transit';
    } else if (combined.includes('bush') || combined.includes('iah')) {
      drivingMiles = 24.5;
      baseDurationMinutes = 32;
      primaryHighway = 'Hardy Airport Connector & I-69';
      routeSummary = 'IAH Airport Corridor';
    } else if (combined.includes('austin') || combined.includes('dallas') || combined.includes('san antonio')) {
      drivingMiles = 165.0;
      baseDurationMinutes = 165;
      primaryHighway = 'Interstate Highway Corridor';
      routeSummary = 'Texas Intercity Long Distance Transit';
    } else {
      drivingMiles = 18.0;
      baseDurationMinutes = 28;
      primaryHighway = 'Houston Metro Managed Highway & Tollways';
      routeSummary = 'Point-to-Point City Transit';
    }
  }

  // Peak Hour Traffic Multiplier Modeling
  let trafficLevel: 'Low' | 'Moderate' | 'Heavy' | 'Optimal Flow' = 'Optimal Flow';
  let trafficMultiplier = 1.0;

  if (tripTime) {
    const [hourStr] = tripTime.split(':');
    const hour = parseInt(hourStr, 10);
    if (!isNaN(hour)) {
      if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
        // Morning or Evening Rush
        trafficMultiplier = 1.25;
        trafficLevel = 'Moderate';
      } else if (hour >= 21 || hour <= 5) {
        // Late night / early morning clear roads
        trafficMultiplier = 0.92;
        trafficLevel = 'Low';
      }
    }
  }

  const adjustedDuration = Math.round(baseDurationMinutes * trafficMultiplier);
  const minRange = Math.max(10, Math.round(adjustedDuration * 0.9));
  const maxRange = Math.round(adjustedDuration * 1.2);

  // Departure buffer notes for airports / cruise
  const isAirportDropoff =
    (dropoffNode?.category === 'airport') ||
    dropoffStr.toLowerCase().includes('airport') ||
    dropoffStr.toLowerCase().includes('iah') ||
    dropoffStr.toLowerCase().includes('hobby');

  const isCruiseDropoff =
    (dropoffNode?.category === 'cruise') ||
    dropoffStr.toLowerCase().includes('galveston') ||
    dropoffStr.toLowerCase().includes('cruise');

  if (isAirportDropoff) {
    recommendedDepartureNote = `Allow ${minRange + 120} - ${maxRange + 150} mins before scheduled takeoff for domestic flights (2.5 hrs before gate closure).`;
  } else if (isCruiseDropoff) {
    recommendedDepartureNote = `Recommended arrival at Port of Galveston terminal is 60-90 minutes prior to your embarkation window.`;
  }

  const durationFormatted = formatDurationMinutes(adjustedDuration);
  const durationRangeFormatted = `${minRange} - ${maxRange} min`;

  return {
    distanceMiles: drivingMiles,
    durationMinutes: adjustedDuration,
    durationFormatted,
    durationRangeFormatted,
    primaryHighway,
    trafficLevel,
    tollNote: 'All EZ-Tag & TxTag electronic toll charges are 100% complimentary & included in your flat rate.',
    routeSummary,
    recommendedDepartureNote
  };
}

function formatDurationMinutes(mins: number): string {
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr ${remainder} min`;
}
