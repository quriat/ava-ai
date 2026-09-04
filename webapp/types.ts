import React from 'react';

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
  images: string[];
  alt?: string;
  description: string;
  features: string[];
  idealFor: string[];
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

export interface GoogleReview {
  id: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  rating: number;
  date: string;
  tripType: string;
  vehicleExperienced?: string;
  chauffeurName?: string;
  routeOrArea?: string;
  comment: string;
  tags?: string[];
  confirmationCode?: string;
  verifiedTrip: boolean;
  helpfulCount: number;
  hasLeftOnGoogle?: boolean;
  userVotedHelpful?: boolean;
  ownerResponse?: {
    date: string;
    responder: string;
    text: string;
  };
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

export interface ServiceArea {
  name: string;
  category: 'core' | 'north' | 'west' | 'south' | 'east' | 'coastal';
  description: string;
  typicalTransferTime: string;
  popularDestinations: string[];
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
  dataSource?: 'live' | 'estimated'; // live = real Aviationstack data, estimated = AI projection
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
  suggestedPickupTime: string; // HH:MM format
  suggestedPickupDate?: string;
  trackingNote: string;
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
}

export type AlertSeverity = 'advisory' | 'warning' | 'critical' | 'optimal';

export interface ServiceAlert {
  id: string;
  corridor: 'IAH Airport' | 'HOU Hobby' | 'Galveston / I-45' | 'Galleria / Metro' | 'Energy Corridor';
  title: string;
  summary: string;
  details: string;
  severity: AlertSeverity;
  affectedRoads: string[];
  delayEstimateMinutes?: number;
  chauffeurAction: string;
  recommendedDepartureBuffer?: string;
  timestamp: string;
  isLive: boolean;
}

export interface HoustonCorridorStatus {
  id: string;
  name: string;
  destination: string;
  status: 'Clear' | 'Moderate' | 'Heavy Congestion' | 'Construction Detour';
  currentSpeedMph: number;
  typicalTimeMins: number;
  currentTimeMins: number;
  preferredRoute: string;
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
  recommendedDepartureNote?: string;
}

export type CorporatePolicyTier = 'Executive VIP' | 'Senior Management' | 'Standard Business' | 'Guest & Client';

export interface CorporateEmployee {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  costCenter: string;
  policyTier: CorporatePolicyTier;
  monthlySpendLimit: number;
  currentMonthSpend: number;
  status: 'Active' | 'Invited' | 'Suspended';
  totalRides: number;
  phone: string;
}

export interface CorporateRideRecord {
  id: string;
  confirmationCode: string;
  date: string;
  time: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  department: string;
  costCenter: string;
  bookingCode?: string;
  tripType: TripType;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleName: string;
  vehicleCategory: string;
  chauffeurName: string;
  chauffeurRating: number;
  flightNumber?: string;
  status: 'Completed' | 'En Route' | 'Scheduled' | 'Cancelled';
  distanceMiles: number;
  durationMinutes: number;
  baseFare: number;
  gratuity: number;
  tollsAndAirportFees: number;
  totalFare: number;
  invoiceId: string;
  notes?: string;
}

export interface CorporateMonthlyInvoice {
  id: string;
  invoiceNumber: string;
  billingMonth: string; // e.g. "September 2026"
  billingPeriod: string; // e.g. "Sep 1, 2026 - Sep 30, 2026"
  issueDate: string;
  dueDate: string;
  totalRides: number;
  subtotal: number;
  gratuityTotal: number;
  tollsComplimentaryDiscount: number;
  totalAmount: number;
  status: 'Paid' | 'Due' | 'Overdue' | 'Processing';
  paymentMethodUsed?: string;
  pdfUrl?: string;
  breakdownByDepartment: {
    department: string;
    rideCount: number;
    amount: number;
  }[];
}

export interface CorporateDepartmentBudget {
  department: string;
  monthlyBudget: number;
  currentSpend: number;
  employeeCount: number;
  manager: string;
}

export interface CorporateAccount {
  id: string;
  companyName: string;
  accountNumber: string;
  tier: 'Enterprise Platinum' | 'Corporate Gold' | 'Executive Preferred';
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  billingAddress: string;
  taxId: string;
  paymentTerms: 'Net-30' | 'Net-15' | 'Central Auto-Pay (AMEX/Card)' | 'Monthly ACH Direct Debit';
  defaultPaymentMethod: string;
  autoApproveUnderAmount: number;
  employees: CorporateEmployee[];
  rides: CorporateRideRecord[];
  invoices: CorporateMonthlyInvoice[];
  departmentBudgets: CorporateDepartmentBudget[];
  monthlySpendLimit: number;
  currentMonthTotalSpend: number;
  corporateDiscountRate: number; // e.g. 10%
}

