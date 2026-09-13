export enum AgentType {
  FRONT_DESK = 'Front Desk',
  DISPATCH = 'Dispatch'
}

export enum VehicleType {
  SEDAN = 'Luxury Executive Sedan',
  SUV = 'Premium Luxury SUV',
  SPRINTER = 'Executive Mercedes Sprinter Van',
  LIMO = 'Lincoln Stretch Limousine',
  PARTY_BUS = 'Luxury Executive Mini Coach'
}

export enum TripType {
  AIRPORT = 'Airport Transfer (IAH / HOU / FBO)',
  POINT_TO_POINT = 'Point to Point / One Way',
  HOURLY = 'Hourly / As Directed Charter',
  GALVESTON = 'Galveston Cruise Port Transfer',
  INTERCITY = 'City-to-City (Austin / Dallas / SA)'
}

export interface FleetItem {
  id: string;
  name: string;
  category: string;
  type: VehicleType;
  passengers: number;
  luggage: number;
  pricePerHour: number;
  flatRateIAH: number;
  flatRateHobby: number;
  flatRateGalveston: number;
  minHours: number;
  image: string;
  description: string;
  features: string[];
  idealFor: string[];
}

export interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  features: string[];
  recommendedVehicle: string;
  popularRoutes?: string[];
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company?: string;
  location: string;
  text: string;
  stars: number;
  date: string;
  serviceType: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'booking' | 'airport' | 'fleet' | 'policies';
}

export interface FlightDetails {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  flightType: 'arrival' | 'departure';
  isInternational: boolean;
  status: 'On Time' | 'Delayed' | 'Landed' | 'En Route' | 'Scheduled' | 'Early';
  origin: {
    city: string;
    code: string;
    airportName: string;
    scheduledDeparture: string;
    actualDeparture?: string;
  };
  destination: {
    city: string;
    code: string;
    airportName: string;
    scheduledArrival: string;
    estimatedArrival: string;
    terminal?: string;
    gate?: string;
    baggageClaim?: string;
  };
  aircraft?: string;
  delayMinutes?: number;
  recommendedBufferMinutes: number;
  suggestedPickupTime: string;
  suggestedPickupDate?: string;
  trackingNote: string;
}

export interface RouteEstimate {
  distanceMiles: number;
  durationMinutes: number;
  durationFormatted: string;
  durationRangeFormatted: string;
  primaryHighway: string;
  trafficLevel: 'Low' | 'Moderate' | 'Heavy' | 'Optimal Flow';
  tollNote: string;
  routeSummary: string;
}

export interface BookingSubmission {
  tripType: TripType;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  vehicleId: string;
  hoursNeeded?: number;
  flightNumber?: string;
  airline?: string;
  flightDetails?: FlightDetails;
  isReturnTrip?: boolean;
  returnDate?: string;
  returnTime?: string;
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  selectedAddons?: string[];
  estimatedTotal?: number;
}

export type ServiceItem = Service;
export type Vehicle = FleetItem;
