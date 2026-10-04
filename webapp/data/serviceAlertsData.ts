import { ServiceAlert, HoustonCorridorStatus } from '../types';

export const HOUSTON_SERVICE_ALERTS: ServiceAlert[] = [
  {
    id: 'iah-hardy-express',
    corridor: 'IAH Airport',
    title: 'IAH North Access: Hardy Toll Road Clear & Fast',
    summary: 'Hardy Airport Connector is free-flowing at 65+ mph. Recommended route for Downtown & Galleria transfers.',
    details: 'TxDOT and Houston TranStar report no incidents on Hardy Toll Road Northbound to IAH terminal loops. Estimated transit from Downtown Houston is 24 minutes.',
    severity: 'optimal',
    affectedRoads: ['Hardy Toll Road', 'Hardy Airport Connector', 'JFK Blvd'],
    delayEstimateMinutes: 0,
    chauffeurAction: 'AvaLimo dispatch is actively pre-routing all airport outbound & inbound vehicles via EZ-Tag tollways at no surcharge to passengers.',
    recommendedDepartureBuffer: 'Standard 2.5 hrs before domestic / 3 hrs before intl',
    timestamp: 'Updated 5 mins ago',
    isLive: true
  },
  {
    id: 'iah-59-willclayton',
    corridor: 'IAH Airport',
    title: 'I-69 / US-59 North at Will Clayton Pkwy: Moderate Slowdown',
    summary: 'Airport entrance roadwork near Beltway 8 interchange causing +12 min delay on general lanes.',
    details: 'Lane resurfacing project on I-69 Northbound between Beltway 8 and Will Clayton Pkwy. Two right lanes congested during peak volume.',
    severity: 'advisory',
    affectedRoads: ['I-69 / US-59 North', 'Will Clayton Pkwy', 'Beltway 8 Interchange'],
    delayEstimateMinutes: 12,
    chauffeurAction: 'Chauffeurs bypassing via Hardy Toll Road or Beltway 8 JFK Blvd approach to avoid the interchange.',
    recommendedDepartureBuffer: '+15 minutes extra departure buffer if departing from Humble/Kingwood',
    timestamp: 'Live TranStar Sensor',
    isLive: true
  },
  {
    id: 'hou-hobby-i45-broadway',
    corridor: 'HOU Hobby',
    title: 'I-45 South Gulf Fwy @ Airport Blvd: Bridge Maintenance',
    summary: 'Right shoulder work near Broadway St exit. +10 min minor delay during peak hours.',
    details: 'TxDOT bridge maintenance project on I-45 Southbound at Airport Blvd exit ramp. Traffic is moving at 35-40 mph.',
    severity: 'advisory',
    affectedRoads: ['I-45 Gulf Freeway', 'Airport Blvd', 'Telephone Rd'],
    delayEstimateMinutes: 10,
    chauffeurAction: 'Drivers using Telephone Road or MLK Blvd express bypass to access Hobby main terminal gates directly.',
    recommendedDepartureBuffer: '+10 minutes buffer for Hobby departures',
    timestamp: 'Updated 8 mins ago',
    isLive: true
  },
  {
    id: 'galveston-causeway-clear',
    corridor: 'Galveston / I-45',
    title: 'I-45 South Galveston Causeway: Clear Sailing to Port',
    summary: 'Causeway bridge and Harborside Dr cruise terminals running at full speed limit. No maritime delays.',
    details: 'Clear visibility across Galveston Bay bridge with all 4 lanes open in both directions. Cruise terminal drop-off staging lane operating smoothly.',
    severity: 'optimal',
    affectedRoads: ['I-45 South Causeway', 'Harborside Drive', 'Broadway St'],
    delayEstimateMinutes: 0,
    chauffeurAction: 'Chauffeurs have dedicated commercial port permits for priority terminal curbside baggage drop.',
    recommendedDepartureBuffer: 'Standard 1 hr 15 min transfer from Downtown / 1 hr 30 min from IAH',
    timestamp: 'Live Port of Galveston Feed',
    isLive: true
  },
  {
    id: 'galleria-loop610-post-oak',
    corridor: 'Galleria / Metro',
    title: 'West Loop 610 @ Westheimer / Post Oak: Normal Flow',
    summary: 'Post Oak Blvd and Westheimer commercial luxury zone flowing steadily with clear traffic signals.',
    details: 'Traffic signals synchronized throughout Uptown Houston and Post Oak Hotel / Galleria luxury corridors. Clear transit to I-10 and US-59.',
    severity: 'optimal',
    affectedRoads: ['West Loop 610', 'Post Oak Blvd', 'Westheimer Rd', 'I-69 / US-59'],
    delayEstimateMinutes: 0,
    chauffeurAction: 'Direct hotel and corporate executive pick-ups proceeding on standard schedule.',
    recommendedDepartureBuffer: 'Standard 45-min pre-call',
    timestamp: 'Updated 12 mins ago',
    isLive: true
  }
];

export const HOUSTON_CORRIDORS: HoustonCorridorStatus[] = [
  {
    id: 'iah-hardy',
    name: 'Hardy Toll Road North',
    destination: 'Bush Intercontinental (IAH)',
    status: 'Clear',
    currentSpeedMph: 68,
    typicalTimeMins: 25,
    currentTimeMins: 24,
    preferredRoute: 'Hardy Toll Road direct to Terminal Loops'
  },
  {
    id: 'iah-59',
    name: 'I-69 / Eastex Freeway',
    destination: 'Bush Intercontinental (IAH)',
    status: 'Moderate',
    currentSpeedMph: 48,
    typicalTimeMins: 28,
    currentTimeMins: 38,
    preferredRoute: 'Divert to Hardy Toll Road'
  },
  {
    id: 'hou-i45',
    name: 'I-45 Gulf Freeway South',
    destination: 'William P. Hobby (HOU)',
    status: 'Moderate',
    currentSpeedMph: 45,
    typicalTimeMins: 20,
    currentTimeMins: 27,
    preferredRoute: 'Telephone Rd or MLK Blvd Express'
  },
  {
    id: 'galveston-i45',
    name: 'I-45 Gulf Corridor South',
    destination: 'Galveston Cruise Terminal',
    status: 'Clear',
    currentSpeedMph: 67,
    typicalTimeMins: 55,
    currentTimeMins: 52,
    preferredRoute: 'I-45 South to Harborside Dr'
  },
  {
    id: 'katy-i10',
    name: 'I-10 Katy Freeway Managed',
    destination: 'Energy Corridor & Downtown',
    status: 'Clear',
    currentSpeedMph: 70,
    typicalTimeMins: 22,
    currentTimeMins: 20,
    preferredRoute: 'Katy Managed Express Lanes'
  }
];
