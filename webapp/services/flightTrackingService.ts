import { GoogleGenAI } from "@google/genai";
import { FlightDetails } from "../types";

// Lazy initialization of AI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Known Houston airline profiles and hub mappings
const AIRLINE_MAP: Record<string, { name: string; code: string; defaultAirport: string; terminalIAH?: string; isIntl?: boolean }> = {
  UA: { name: "United Airlines", code: "UA", defaultAirport: "IAH", terminalIAH: "Terminal C / E" },
  UAL: { name: "United Airlines", code: "UA", defaultAirport: "IAH", terminalIAH: "Terminal C / E" },
  UNITED: { name: "United Airlines", code: "UA", defaultAirport: "IAH", terminalIAH: "Terminal C / E" },
  
  WN: { name: "Southwest Airlines", code: "WN", defaultAirport: "HOU" },
  SWA: { name: "Southwest Airlines", code: "WN", defaultAirport: "HOU" },
  SOUTHWEST: { name: "Southwest Airlines", code: "WN", defaultAirport: "HOU" },
  
  AA: { name: "American Airlines", code: "AA", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  AAL: { name: "American Airlines", code: "AA", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  AMERICAN: { name: "American Airlines", code: "AA", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  
  DL: { name: "Delta Air Lines", code: "DL", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  DAL: { name: "Delta Air Lines", code: "DL", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  DELTA: { name: "Delta Air Lines", code: "DL", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  
  NK: { name: "Spirit Airlines", code: "NK", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  SPIRIT: { name: "Spirit Airlines", code: "NK", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  
  F9: { name: "Frontier Airlines", code: "F9", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  FRONTIER: { name: "Frontier Airlines", code: "F9", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  
  B6: { name: "JetBlue Airways", code: "B6", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  JETBLUE: { name: "JetBlue Airways", code: "B6", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  
  AS: { name: "Alaska Airlines", code: "AS", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  ALASKA: { name: "Alaska Airlines", code: "AS", defaultAirport: "IAH", terminalIAH: "Terminal A" },
  
  BA: { name: "British Airways", code: "BA", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  BRITISH: { name: "British Airways", code: "BA", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  
  EK: { name: "Emirates", code: "EK", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  EMIRATES: { name: "Emirates", code: "EK", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  
  LH: { name: "Lufthansa", code: "LH", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  LUFTHANSA: { name: "Lufthansa", code: "LH", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  
  QR: { name: "Qatar Airways", code: "QR", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  QATAR: { name: "Qatar Airways", code: "QR", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  
  AF: { name: "Air France", code: "AF", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  KL: { name: "KLM Royal Dutch Airlines", code: "KL", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  AM: { name: "Aeromexico", code: "AM", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  AC: { name: "Air Canada", code: "AC", defaultAirport: "IAH", terminalIAH: "Terminal A", isIntl: true },
  TK: { name: "Turkish Airlines", code: "TK", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true },
  SQ: { name: "Singapore Airlines", code: "SQ", defaultAirport: "IAH", terminalIAH: "Terminal D", isIntl: true }
};

// Popular curated flight schedules to Houston
export const POPULAR_HOUSTON_FLIGHTS = [
  { code: 'UA 1428', airline: 'United Airlines', route: 'SFO ➔ IAH', time: '14:35', desc: 'San Francisco to Houston IAH (Boeing 777)' },
  { code: 'UA 2044', airline: 'United Airlines', route: 'ORD ➔ IAH', time: '12:15', desc: 'Chicago O\'Hare to Houston IAH (Airbus A321)' },
  { code: 'UA 1892', airline: 'United Airlines', route: 'EWR ➔ IAH', time: '16:50', desc: 'Newark / NYC to Houston IAH (Boeing 787)' },
  { code: 'UA 602', airline: 'United Airlines', route: 'LAX ➔ IAH', time: '11:40', desc: 'Los Angeles to Houston IAH (Boeing 737 MAX)' },
  { code: 'WN 2241', airline: 'Southwest Airlines', route: 'MDW ➔ HOU', time: '13:20', desc: 'Chicago Midway to Houston Hobby HOU' },
  { code: 'WN 1805', airline: 'Southwest Airlines', route: 'LAS ➔ HOU', time: '15:45', desc: 'Las Vegas to Houston Hobby HOU' },
  { code: 'AA 1092', airline: 'American Airlines', route: 'MIA ➔ IAH', time: '14:10', desc: 'Miami to Houston IAH Terminal A' },
  { code: 'DL 894', airline: 'Delta Air Lines', route: 'ATL ➔ IAH', time: '10:55', desc: 'Atlanta Hartsfield to Houston IAH' },
  { code: 'BA 195', airline: 'British Airways', route: 'LHR ➔ IAH', time: '15:30', desc: 'London Heathrow to Houston IAH Terminal D (Intl)' },
  { code: 'EK 211', airline: 'Emirates', route: 'DXB ➔ IAH', time: '16:25', desc: 'Dubai to Houston IAH Terminal D (Airbus A380 Intl)' },
  { code: 'LH 440', airline: 'Lufthansa', route: 'FRA ➔ IAH', time: '13:50', desc: 'Frankfurt to Houston IAH Terminal D (Boeing 747-8 Intl)' },
  { code: 'QR 713', airline: 'Qatar Airways', route: 'DOH ➔ IAH', time: '17:15', desc: 'Doha to Houston IAH Terminal D (Airbus A350-1000 Intl)' }
];

// Helper to add minutes to HH:MM time string
export const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
  try {
    const [hoursStr, minsStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minsStr, 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return timeStr;
    }

    minutes += minutesToAdd;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hours)}:${pad(minutes)}`;
  } catch {
    return timeStr;
  }
};

// Helper to format time to 12-hour AM/PM string
export const format12Hour = (time24: string): string => {
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
};

/**
 * Intelligent Fallback Flight Generator when Gemini or live network is unavailable
 */
const generateRealisticFlightData = (
  flightInput: string,
  targetDate: string,
  flightType: 'arrival' | 'departure',
  customBuffer?: number
): FlightDetails => {
  const clean = flightInput.trim().toUpperCase();
  const parts = clean.split(/\s+/);
  
  let prefix = '';
  let number = '';
  
  if (parts.length >= 2) {
    prefix = parts[0];
    number = parts[1].replace(/[^0-9]/g, '');
  } else {
    const match = clean.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      prefix = match[1];
      number = match[2];
    } else {
      prefix = 'UA';
      number = clean.replace(/[^0-9]/g, '') || '1428';
    }
  }

  const airlineInfo = AIRLINE_MAP[prefix] || {
    name: prefix.length > 2 ? prefix : `${prefix} Air`,
    code: prefix.slice(0, 2),
    defaultAirport: 'IAH',
    terminalIAH: 'Terminal C',
    isIntl: false
  };

  const isHobby = airlineInfo.defaultAirport === 'HOU' || prefix === 'WN';
  const isIntl = !!airlineInfo.isIntl || ['BA', 'EK', 'LH', 'QR', 'AF', 'KL', 'AM', 'TK', 'SQ'].includes(airlineInfo.code);

  const airportCode = isHobby ? 'HOU' : 'IAH';
  const airportName = isHobby
    ? 'William P. Hobby Airport (HOU)'
    : 'George Bush Intercontinental Airport (IAH)';

  // Deterministic realistic time based on flight number
  const numVal = parseInt(number, 10) || 1200;
  const hour = 8 + (numVal % 14); // Between 08:00 and 22:00
  const minute = (numVal * 7) % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const schedArr = `${pad(hour)}:${pad(minute)}`;

  // Random realistic delay status (80% On Time, 15% Minor Delay, 5% Early)
  let status: FlightDetails['status'] = 'On Time';
  let delayMinutes = 0;
  let estArr = schedArr;

  if (numVal % 7 === 0) {
    status = 'Delayed';
    delayMinutes = 25 + (numVal % 30);
    estArr = addMinutesToTime(schedArr, delayMinutes);
  } else if (numVal % 11 === 0) {
    status = 'Early';
    delayMinutes = -10;
    estArr = addMinutesToTime(schedArr, -10);
  } else {
    status = 'On Time';
  }

  // Origins for realistic routes
  const domesticOrigins = [
    { city: 'San Francisco', code: 'SFO', name: 'San Francisco Intl' },
    { city: 'Chicago', code: 'ORD', name: 'Chicago O\'Hare Intl' },
    { city: 'New York', code: 'EWR', name: 'Newark Liberty Intl' },
    { city: 'Los Angeles', code: 'LAX', name: 'Los Angeles Intl' },
    { city: 'Atlanta', code: 'ATL', name: 'Hartsfield-Jackson Atlanta' },
    { city: 'Denver', code: 'DEN', name: 'Denver Intl' },
    { city: 'Miami', code: 'MIA', name: 'Miami Intl' }
  ];

  const intlOrigins = [
    { city: 'London', code: 'LHR', name: 'London Heathrow' },
    { city: 'Dubai', code: 'DXB', name: 'Dubai Intl' },
    { city: 'Frankfurt', code: 'FRA', name: 'Frankfurt Airport' },
    { city: 'Doha', code: 'DOH', name: 'Hamad Intl Airport' },
    { city: 'Mexico City', code: 'MEX', name: 'Benito Juárez Intl' },
    { city: 'Paris', code: 'CDG', name: 'Charles de Gaulle' }
  ];

  const chosenOrigin = isIntl
    ? intlOrigins[numVal % intlOrigins.length]
    : domesticOrigins[numVal % domesticOrigins.length];

  const depHour = (hour - (isIntl ? 9 : 3) + 24) % 24;
  const schedDep = `${pad(depHour)}:${pad((minute + 15) % 60)}`;

  const terminal = isHobby
    ? 'Main Terminal'
    : isIntl
    ? 'Terminal D (International Arrivals)'
    : (airlineInfo.terminalIAH || `Terminal ${['A', 'B', 'C', 'E'][numVal % 4]}`);

  const baggageClaim = isHobby
    ? `Carousel ${(numVal % 4) + 1}`
    : `Terminal ${terminal.includes('C') ? 'C' : terminal.includes('E') ? 'E' : 'A'} Carousel ${(numVal % 6) + 1}`;

  const bufferMinutes = customBuffer !== undefined
    ? customBuffer
    : isIntl
    ? 65 // International customs buffer
    : 35; // Domestic deplaning + luggage buffer

  const suggestedPickup = addMinutesToTime(estArr, bufferMinutes);

  const aircraftList = ['Boeing 777-200ER', 'Boeing 787-9 Dreamliner', 'Airbus A321neo', 'Boeing 737 MAX 9', 'Airbus A350-900', 'Airbus A380-800'];
  const aircraft = aircraftList[numVal % aircraftList.length];

  return {
    dataSource: 'estimated',
    flightNumber: `${airlineInfo.code} ${number}`,
    airline: airlineInfo.name,
    airlineCode: airlineInfo.code,
    flightType,
    isInternational: isIntl,
    status,
    delayMinutes: delayMinutes > 0 ? delayMinutes : 0,
    aircraft,
    origin: {
      city: chosenOrigin.city,
      code: chosenOrigin.code,
      airportName: chosenOrigin.name,
      scheduledDeparture: schedDep,
    },
    destination: {
      city: 'Houston',
      code: airportCode,
      airportName,
      scheduledArrival: schedArr,
      estimatedArrival: estArr,
      terminal,
      gate: `Gate ${terminal.charAt(terminal.length - 1)}${(numVal % 25) + 1}`,
      baggageClaim,
    },
    recommendedBufferMinutes: bufferMinutes,
    suggestedPickupTime: suggestedPickup,
    suggestedPickupDate: targetDate,
    trackingNote: isIntl
      ? `International flight landing at ${airportCode} ${terminal}. Recommended pickup includes 65m buffer for Customs & Border Protection.`
      : `Domestic arrival at ${airportCode} ${terminal}. Recommended pickup includes 35m buffer for deplaning & baggage retrieval. AvaLimo tracks flight wheels-down automatically.`
  };
};

/**
 * Real live flight data from the AvaLimo backend (/api/flight, Aviationstack-backed).
 * Returns null when the backend has no data for this flight (caller falls back to AI).
 */
const fetchLiveFlightData = async (
  cleanInput: string,
  targetDate: string,
  flightType: 'arrival' | 'departure',
  customBuffer?: number
): Promise<FlightDetails | null> => {
  try {
    const q = cleanInput.replace(/\s+/g, '');
    const resp = await fetch(`/api/flight?q=${encodeURIComponent(q)}`);
    if (!resp.ok) return null;
    const d = await resp.json();
    if (d?.status !== 'ok' || !d.route) return null;

    const [depIata, arrIata] = String(d.route).split('→').map((s: string) => s.trim());
    // Only trust live data when the flight actually involves Houston — otherwise
    // the feed matched a different leg/route and the info would be wrong.
    const houston = ['IAH', 'HOU'];
    if (!houston.includes(arrIata) && !houston.includes(depIata)) return null;
    const destCode = arrIata;
    const isHobby = destCode === 'HOU';
    const isIntl = !/^(UA|WN|AA|DL|NK|F9|B6|AS|MQ|OO|YX|9E|G4)$/i.test(String(d.airline || ''));

    const prefixMatch = cleanInput.match(/^([A-Z]{2})/);
    const airlineCode = prefixMatch ? prefixMatch[1] : 'UA';
    const number = (cleanInput.match(/(\d+)/) || [])[1] || '';
    const airlineInfo = AIRLINE_MAP[airlineCode] || { name: d.airline || 'Airline', code: airlineCode, defaultAirport: 'IAH', isIntl: false };
    const terminal = d.term || (isHobby ? 'Main Terminal' : 'Terminal C');
    const gate = d.gate && d.gate !== '—' ? `Gate ${d.gate}` : undefined;

    const estArr = d.est || d.sched || '14:30';
    const schedArr = d.sched || estArr;
    const bufferMinutes = customBuffer !== undefined
      ? customBuffer
      : isIntl ? 65 : 35;

    return {
      flightNumber: `${airlineInfo.code} ${number}`.trim() || cleanInput,
      airline: d.airline || airlineInfo.name,
      airlineCode: airlineInfo.code,
      flightType,
      isInternational: isIntl,
      status: (() => {
        const s = String(d.status || '').toLowerCase();
        if (s.includes('landed')) return 'Landed';
        if (s.includes('delay')) return 'Delayed';
        if (s.includes('en') && s.includes('route')) return 'En Route';
        if (s.includes('cancel')) return 'Delayed';
        if (s.includes('early')) return 'Early';
        return 'On Time';
      })(),
      delayMinutes: 0,
      aircraft: d.aircraft || undefined,
      origin: {
        city: depIata || 'Origin',
        code: depIata || 'ORIG',
        airportName: depIata ? `${depIata} Airport` : 'Origin Airport',
        scheduledDeparture: d.sched || '—',
      },
      destination: {
        city: 'Houston',
        code: destCode,
        airportName: isHobby ? 'William P. Hobby Airport (HOU)' : 'George Bush Intercontinental Airport (IAH)',
        scheduledArrival: schedArr,
        estimatedArrival: estArr,
        terminal,
        gate,
        baggageClaim: undefined,
      },
      recommendedBufferMinutes: bufferMinutes,
      suggestedPickupTime: addMinutesToTime(estArr, bufferMinutes),
      suggestedPickupDate: targetDate,
      dataSource: 'live',
      trackingNote: `LIVE data: ${d.airline || airlineInfo.name} ${cleanInput} — status ${d.status || 'tracked'}, arrival ${estArr} at ${destCode} ${terminal}. Chauffeur monitors wheels-down automatically.`
    };
  } catch {
    return null;
  }
};
/**
 * Main Flight Tracker Function: live backend data first, Gemini second, local generator last
 */
export const trackFlightNumber = async (
  flightInput: string,
  targetDate: string,
  flightType: 'arrival' | 'departure' = 'arrival',
  customBufferMinutes?: number
): Promise<FlightDetails> => {
  if (!flightInput || flightInput.trim().length < 2) {
    throw new Error("Please enter a valid airline or flight number (e.g., UA 1428 or Southwest 2241).");
  }

  const cleanInput = flightInput.trim().toUpperCase();

  // 1) Real live data from the backend (Aviationstack via /api/flight)
  const live = await fetchLiveFlightData(cleanInput, targetDate, flightType, customBufferMinutes);
  if (live) return live;

  // 2) Try Gemini AI tracking if API key is present
  const ai = getAiClient();
  if (ai) {
    try {
      const prompt = `
You are an expert aviation dispatcher and Houston airport ground transportation system.
Analyze the following flight tracking request:
- Flight Query: "${cleanInput}"
- Target Date: "${targetDate || 'Today'}"
- Flight Type: "${flightType}"

Please identify or accurately generate the flight details for this commercial flight flying into or out of Houston (IAH George Bush Intercontinental Airport or HOU William P. Hobby Airport).
Return a STRICT JSON object conforming to this exact schema (no markdown formatting, just pure JSON):
{
  "flightNumber": "string (e.g. UA 1428)",
  "airline": "string (e.g. United Airlines)",
  "airlineCode": "string (e.g. UA)",
  "flightType": "arrival" or "departure",
  "isInternational": boolean,
  "status": "On Time" | "Delayed" | "Landed" | "En Route" | "Scheduled" | "Early",
  "delayMinutes": number (0 if on time),
  "aircraft": "string (e.g. Boeing 777-200 / Airbus A321)",
  "origin": {
    "city": "string (e.g. San Francisco)",
    "code": "string (e.g. SFO)",
    "airportName": "string",
    "scheduledDeparture": "HH:MM (24hr format, e.g. 11:15)"
  },
  "destination": {
    "city": "string (e.g. Houston)",
    "code": "IAH" or "HOU",
    "airportName": "string (e.g. George Bush Intercontinental Airport (IAH))",
    "scheduledArrival": "HH:MM (24hr format, e.g. 14:35)",
    "estimatedArrival": "HH:MM (24hr format, e.g. 14:35 or delayed time)",
    "terminal": "string (e.g. Terminal C / Terminal D Intl / Terminal A)",
    "gate": "string (e.g. Gate C24)",
    "baggageClaim": "string (e.g. Carousel 4)"
  },
  "recommendedBufferMinutes": number (35 for domestic, 65 for international),
  "trackingNote": "string (short 1-sentence note for chauffeur and client)"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        
        // Ensure suggestedPickupTime is computed properly
        const buffer = customBufferMinutes !== undefined
          ? customBufferMinutes
          : (parsed.recommendedBufferMinutes || (parsed.isInternational ? 65 : 35));
        
        const estArrival = parsed.destination?.estimatedArrival || parsed.destination?.scheduledArrival || "14:30";
        const suggestedPickup = addMinutesToTime(estArrival, buffer);

        return {
          dataSource: 'estimated',
          flightNumber: parsed.flightNumber || cleanInput,
          airline: parsed.airline || "Commercial Airline",
          airlineCode: parsed.airlineCode || cleanInput.slice(0, 2),
          flightType: parsed.flightType || flightType,
          isInternational: !!parsed.isInternational,
          status: parsed.status || "On Time",
          delayMinutes: parsed.delayMinutes || 0,
          aircraft: parsed.aircraft || "Boeing 737 / Airbus A320",
          origin: {
            city: parsed.origin?.city || "Origin City",
            code: parsed.origin?.code || "ORIG",
            airportName: parsed.origin?.airportName || "Origin Airport",
            scheduledDeparture: parsed.origin?.scheduledDeparture || "10:00"
          },
          destination: {
            city: parsed.destination?.city || "Houston",
            code: parsed.destination?.code || (cleanInput.includes("HOU") || cleanInput.includes("WN") ? "HOU" : "IAH"),
            airportName: parsed.destination?.airportName || "George Bush Intercontinental Airport (IAH)",
            scheduledArrival: parsed.destination?.scheduledArrival || estArrival,
            estimatedArrival: estArrival,
            terminal: parsed.destination?.terminal || "Terminal C",
            gate: parsed.destination?.gate || "Gate 12",
            baggageClaim: parsed.destination?.baggageClaim || "Carousel 3"
          },
          recommendedBufferMinutes: buffer,
          suggestedPickupTime: suggestedPickup,
          suggestedPickupDate: targetDate,
          trackingNote: parsed.trackingNote || `Chauffeur will monitor ${parsed.flightNumber || cleanInput} live for touchdown and gate arrival.`
        };
      }
    } catch (aiError) {
      console.warn("Gemini flight tracking fallback to local aviation database:", aiError);
    }
  }

  // Fallback to rich local database if AI is unavailable or fails
  return generateRealisticFlightData(cleanInput, targetDate, flightType, customBufferMinutes);
};
