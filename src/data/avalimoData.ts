import { FleetItem, VehicleType, Service, Testimonial, FAQItem } from '../types';

export const COMPANY_INFO = {
  name: 'AvaLimo Houston',
  legalName: 'Ava Limo Luxury Transportation LLC',
  establishedYear: 2013,
  tagline: "Houston's Premier Chauffeur & Limousine Service",
  domains: ['avalimo.net', 'www.avalimohouston.com'],
  phone: '(832) 567-8050',
  phoneRaw: '+18325678050',
  aiConciergePhone: '(832) 917-6331',
  secondaryPhone: '(281) 777-2834',
  email: 'adam@avalimo.net',
  secondaryEmail: 'quriat@gmail.com',
  address: 'Missouri City, TX 77459',
  headquarters: 'Greater Houston Metropolitan Area, Texas',
  operatingHours: '24/7 Dispatch & Chauffeur Services (365 Days/Year)',
  guarantees: [
    '100% On-Time Chauffeur Guarantee',
    'Real-Time Commercial & Private Flight Tracking',
    'Transparent Flat-Rate Pricing — No Surge Charges',
    'Professionally Licensed, FBI Vetted & Insured Chauffeurs',
    'Impeccably Sanitized Late-Model Luxury Fleet',
    'Complimentary Chilled Artesian Bottled Water & High-Speed Wi-Fi'
  ]
};

export const FLEET_DATA: FleetItem[] = [
  {
    id: 'mercedes-s-class',
    name: 'Mercedes-Benz S-Class',
    category: 'Executive Luxury Sedan',
    type: VehicleType.SEDAN,
    passengers: 3,
    luggage: 3,
    pricePerHour: 85,
    flatRateIAH: 125,
    flatRateHobby: 110,
    flatRateGalveston: 220,
    minHours: 3,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
    description: 'The pinnacle of German luxury. Ultra-smooth, whisper-quiet cabin for executives, airport arrivals, and distinguished couples.',
    features: [
      'Hand-stitched Nappa leather reclining rear seats',
      'Burmester 3D High-End Surround Sound',
      'Dual rear passenger climate control',
      'Complimentary 5G Wi-Fi & device charging',
      'Acoustic noise-insulating privacy glass'
    ],
    idealFor: [
      'Corporate roadshows & business meetings',
      'IAH & Hobby airport transfers for VIPs',
      'Executive dining & theater in Downtown Houston',
      'Diplomatic & confidential private transit'
    ]
  },
  {
    id: 'cadillac-escalade-esv',
    name: 'Cadillac Escalade ESV',
    category: 'Flagship Luxury SUV',
    type: VehicleType.SUV,
    passengers: 6,
    luggage: 6,
    pricePerHour: 115,
    flatRateIAH: 165,
    flatRateHobby: 145,
    flatRateGalveston: 260,
    minHours: 3,
    image: 'https://images.unsplash.com/photo-1570303667526-52979c868659?auto=format&fit=crop&q=80&w=800',
    description: 'Imposing, spacious, and prestigious. Extended wheelbase guarantees abundant legroom and cargo capacity for airport or cruise departures.',
    features: [
      'Extended wheelbase (ESV) maximum cargo capacity',
      'Ultra-luxury captain chairs',
      'AKG Studio 36-Speaker Reference Sound',
      'Rear Seat 12.6" OLED dual touchscreens',
      'Magnetic Ride Control for a glass-smooth ride'
    ],
    idealFor: [
      'Family airport transfers with extensive luggage',
      'Galveston cruise terminal transfers',
      'Houston sporting events (NRG/Toyota Center)',
      'Executive board member delegations'
    ]
  },
  {
    id: 'gmc-yukon-suburban',
    name: 'GMC Yukon XL / Chevy Suburban',
    category: 'Executive Black SUV',
    type: VehicleType.SUV,
    passengers: 7,
    luggage: 6,
    pricePerHour: 105,
    flatRateIAH: 155,
    flatRateHobby: 135,
    flatRateGalveston: 245,
    minHours: 3,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    description: 'The definitive standard for corporate livery and comfortable group travel across Texas highways.',
    features: [
      'Black leather 7-passenger executive seating',
      'High luggage capacity for golf bags & cruise luggage',
      'Heavy-duty dual rear A/C for Texas summer heat',
      'Bluetooth audio & multiple 110V power outlets',
      'Tinted privacy windows & smooth highway suspension'
    ],
    idealFor: [
      'Energy Corridor & The Woodlands business commuting',
      'Airport family transfers (IAH/Hobby)',
      'Golf outings & concert shuttles',
      'Reliable all-weather Texas transit'
    ]
  },
  {
    id: 'mercedes-sprinter-van',
    name: 'Mercedes-Benz Sprinter Executive',
    category: 'VIP Luxury Jet Sprinter',
    type: VehicleType.SPRINTER,
    passengers: 14,
    luggage: 14,
    pricePerHour: 165,
    flatRateIAH: 260,
    flatRateHobby: 240,
    flatRateGalveston: 390,
    minHours: 4,
    image: 'https://images.unsplash.com/photo-1566008885218-404547d1a940?auto=format&fit=crop&q=80&w=800',
    description: 'The ultimate mobile boardroom and luxury group transporter. Full stand-up headroom, custom leather chairs, smart TV, and ambient lighting.',
    features: [
      'High-roof walk-in design with 6\'4" standing clearance',
      '14 forward-facing premium diamond-stitched leather recliners',
      '43" 4K Smart TV with streaming integration',
      'Custom fiber optic & ambient ceiling lighting',
      'Dedicated rear luggage hold storing up to 14 large bags'
    ],
    idealFor: [
      'Wedding bridal parties & guest shuttles',
      'Galveston cruise group embarkation/disembarkation',
      'Corporate roadshows & summits',
      'Houston Rodeo VIP groups & private charters'
    ]
  },
  {
    id: 'lincoln-stretch-limo',
    name: 'Lincoln MKT Stretch Limousine',
    category: 'Ultra Stretch Limousine',
    type: VehicleType.LIMO,
    passengers: 10,
    luggage: 6,
    pricePerHour: 150,
    flatRateIAH: 240,
    flatRateHobby: 220,
    flatRateGalveston: 360,
    minHours: 4,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    description: 'The iconic symbol of celebratory glamour. Wrap-around J-lounge sofa, mirrored bar, starlight ceiling, and surround sound.',
    features: [
      'Wrap-around two-tone leather J-seating for 10 guests',
      'Integrated acrylic bar with crystal glassware',
      'Fiber optic Starlight headliner',
      'Premium Bluetooth audio with subwoofer',
      'Privacy divider with direct chauffeur intercom'
    ],
    idealFor: [
      'Weddings, bride & groom grand send-offs',
      'Proms, Homecomings & Quinceañeras',
      'Milestone birthdays & bachelor/bachelorette parties',
      'VIP Houston nightlife & romantic date nights'
    ]
  },
  {
    id: 'executive-mini-coach',
    name: 'Executive Mini Coach & Party Bus',
    category: 'Group Luxury Charter',
    type: VehicleType.PARTY_BUS,
    passengers: 24,
    luggage: 20,
    pricePerHour: 220,
    flatRateIAH: 350,
    flatRateHobby: 320,
    flatRateGalveston: 550,
    minHours: 5,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    description: 'Engineered for large parties, corporate delegations, and major Houston galas.',
    features: [
      '24 high-back ergonomic leather passenger seats',
      'Expansive panoramic tinted touring windows',
      'PA microphone system for event coordinators',
      'Overhead parcel racks & massive underfloor cargo bays',
      'Dual video monitors & USB charging ports'
    ],
    idealFor: [
      'Major corporate conferences & conventions',
      'Large wedding guest shuttles',
      'University athletic teams & alumni tour groups',
      'Port of Galveston cruise groups'
    ]
  }
];

export const SERVICES_DATA: Service[] = [
  {
    id: 'airport-transfers',
    title: 'Houston Airport Transfers (IAH & HOU)',
    tagline: 'Reliable, Flight-Tracked Chauffeur Pickups with Zero Delay Stress',
    description: 'We monitor your commercial or private flight in real time. Whether landing at IAH, Hobby, or private FBO terminals, your chauffeur greets you seamlessly.',
    iconName: 'Plane',
    features: [
      'Real-time automated flight status tracking',
      'Complimentary 45-min domestic & 60-min international wait time',
      'Baggage claim Inside Meet & Greet with personalized name sign',
      'Luggage handling and direct escort to your vehicle',
      'Flat-rate pricing with all tolls and airport fees included'
    ],
    recommendedVehicle: 'Mercedes-Benz S-Class or Cadillac Escalade ESV',
    popularRoutes: [
      'IAH Airport ⇄ Downtown Houston ($125 Sedan / $165 SUV)',
      'IAH Airport ⇄ Galleria / Uptown ($130 Sedan / $170 SUV)',
      'Hobby Airport ⇄ Downtown / Medical Center ($110 Sedan / $145 SUV)'
    ]
  },
  {
    id: 'galveston-cruise-transfers',
    title: 'Galveston Cruise Port Transfers',
    tagline: 'Direct, Stress-Free Luxury Shuttles from Houston to Galveston Terminals',
    description: 'Direct non-stop luxury transfers between IAH, Hobby, Houston hotels, and all Port of Galveston cruise ship terminals.',
    iconName: 'Ship',
    features: [
      'Direct pier drop-off & scheduled return pickup at disembarkation',
      'Extra-large luggage capacity for multi-week cruise suitcases',
      'Child safety car seats provided on request',
      'Sprinter vans available for large multi-family parties',
      'Guaranteed on-time arrival before ship embarkation windows close'
    ],
    recommendedVehicle: 'Cadillac Escalade ESV or Mercedes Sprinter 14-Pax',
    popularRoutes: [
      'Hobby Airport (HOU) ⇄ Port of Galveston ($190 SUV / $290 Sprinter)',
      'Bush Airport (IAH) ⇄ Port of Galveston ($260 SUV / $390 Sprinter)',
      'Downtown / Galleria Hotels ⇄ Galveston Cruise Pier'
    ]
  },
  {
    id: 'corporate-travel',
    title: 'Corporate & Executive Chauffeur',
    tagline: 'Punctuality, Confidentiality & Mobile Boardroom Standards',
    description: "Houston's top energy executives, law partners, and medical professionals trust AvaLimo for business roadshows, meetings, and Texas Medical Center appointments.",
    iconName: 'Briefcase',
    features: [
      'Corporate accounts with simplified monthly itemized billing',
      'Strict non-disclosure confidentiality and professionalism',
      'Multi-stop roadshows with dedicated driver on standby',
      'High-speed 5G Wi-Fi, 110V power outlets, and laptop work desks'
    ],
    recommendedVehicle: 'Mercedes-Benz S-Class or Cadillac Escalade ESV'
  },
  {
    id: 'weddings-events',
    title: 'Weddings & Red-Carpet Occasions',
    tagline: 'Add Unforgettable Luxury & Flawless Timing to Your Big Day',
    description: 'From pristine bridal party Sprinter vans to classic getaway limousines and luxury sedans, we ensure every moment of your wedding transportation is pure perfection.',
    iconName: 'Heart',
    features: [
      'White-glove chauffeur dressed in formal black suit and tie',
      'Complimentary chilled champagne & sparkling cider package',
      'Red carpet rollout for bridal arrival and church departure',
      'Custom coordination with your wedding planner or venue team'
    ],
    recommendedVehicle: 'Lincoln Stretch Limousine & Mercedes Sprinter Van'
  },
  {
    id: 'hourly-charter',
    title: 'Hourly / As-Directed Charters',
    tagline: 'Total Flexibility with Your Dedicated Chauffeur On Demand',
    description: 'Need multiple stops around Houston or a fluid schedule? Your vehicle and chauffeur stay with you as long as needed, waiting curbside ready to depart whenever you are.',
    iconName: 'Clock',
    features: [
      'Unlimited stops within the booked charter duration',
      'Vehicle stays exclusively assigned to you throughout the day',
      'Transparent flat hourly rate with zero surprise surcharges',
      'Available for 3-hour minimums up to full multi-day itineraries'
    ],
    recommendedVehicle: 'Any vehicle in our luxury fleet'
  },
  {
    id: 'intercity-texas',
    title: 'City-to-City Texas Long Distance',
    tagline: 'First-Class Private Ground Travel to Austin, Dallas & San Antonio',
    description: 'Avoid airport security queues and regional flight delays. Relax or work in an executive Mercedes or Escalade for direct door-to-door transit between Houston and other Texas cities.',
    iconName: 'MapPin',
    features: [
      'Direct door-to-door private transport from Houston to any Texas city',
      'Comfortable highway cruising with high-speed Wi-Fi and power outlets',
      'Rest stop flexibility at your preferred dining or coffee locations',
      'Fixed flat rates for Austin, Dallas, San Antonio, and Texas A&M'
    ],
    recommendedVehicle: 'Mercedes-Benz S-Class or Cadillac Escalade ESV'
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 1,
    name: 'Marcus Vance',
    role: 'VP of Global Operations',
    company: 'Energy Sector Executive',
    location: 'Houston, TX',
    text: 'AvaLimo is the gold standard for executive transport in Houston. Adam and his team have handled all our board members and incoming international clients from IAH for over 4 years. Never a minute late, pristine Escalades, and effortless billing.',
    stars: 5,
    date: 'February 2026',
    serviceType: 'Corporate & Airport Service'
  },
  {
    id: 2,
    name: 'Elena & David Rodriguez',
    role: 'Bride & Groom',
    location: 'River Oaks / The Post Oak Hotel',
    text: 'We booked the Mercedes Sprinter for our bridal party and the Lincoln stretch for our midnight grand exit. The chauffeur arrived 20 minutes early, rolled out a red carpet, and had chilled champagne waiting. It made our wedding day truly unforgettable!',
    stars: 5,
    date: 'January 2026',
    serviceType: 'Wedding Chauffeur Package'
  },
  {
    id: 3,
    name: 'Jonathan Sterling',
    role: 'Managing Partner',
    company: 'Sterling & Croft Law',
    location: 'Downtown Houston',
    text: 'Between court dates in Downtown and quick trips to Hobby, having AvaLimo on speed dial gives me complete peace of mind. The S-Class allows me to review briefs with fast Wi-Fi and quiet privacy on the road.',
    stars: 5,
    date: 'December 2025',
    serviceType: 'Executive Sedan Charter'
  },
  {
    id: 4,
    name: 'Sarah Jenkins',
    role: 'Family Vacationer',
    location: 'Chicago, IL (Cruise to Galveston)',
    text: 'We were nervous about landing at Bush Airport (IAH) with 4 kids and 8 cruise bags. Our driver met us right at baggage claim, assisted with every suitcase, and got us to the Galveston Royal Caribbean terminal smoothly. Fantastic service!',
    stars: 5,
    date: 'January 2026',
    serviceType: 'Galveston Cruise Transfer'
  }
];

export const FAQS_DATA: FAQItem[] = [
  {
    question: 'How do airport pickups work at IAH and Hobby Airport?',
    answer: 'We offer two pickup options: 1) Inside Meet & Greet where your chauffeur waits at baggage claim holding a personalized digital iPad nameboard; or 2) Curbside VIP where you contact your chauffeur when you collect your bags for immediate curbside arrival.',
    category: 'airport'
  },
  {
    question: 'What happens if my flight is delayed or arrives early?',
    answer: 'We track all commercial flights in real time. We automatically adjust your chauffeur dispatch time to your actual landing time at no extra charge. We also include 45 minutes complimentary wait time for domestic flights and 60 minutes for international arrivals.',
    category: 'airport'
  },
  {
    question: 'Are your rates flat rates or do they include surge pricing?',
    answer: 'All quoted rates are fixed flat rates with zero surge pricing. Unlike rideshare apps that double rates during rush hour or events, your AvaLimo price remains strictly guaranteed as quoted.',
    category: 'booking'
  },
  {
    question: 'How far in advance should I book?',
    answer: 'We accommodate last-minute 24/7 requests based on fleet availability. We recommend reserving at least 12-24 hours in advance for airport transfers, and 1-4 weeks in advance for weddings, Sprinter vans, and major event dates.',
    category: 'booking'
  },
  {
    question: 'Do you provide child safety car seats?',
    answer: 'Yes! We provide rear-facing infant seats, forward-facing toddler seats, and booster seats upon request for a small sanitization fee. Just select the child seat option during booking.',
    category: 'fleet'
  },
  {
    question: 'What is your cancellation and modification policy?',
    answer: 'For sedans and SUVs, cancellations made 12+ hours prior to pickup receive a 100% refund. For Sprinters, Limousines, and Mini Coaches, we require a 48-hour notice for full refund. Modifications to pickup times can be made anytime subject to vehicle availability.',
    category: 'policies'
  }
];

export const POPULAR_ROUTES = [
  { from: 'IAH Airport', to: 'Downtown Houston / Toyota Center', duration: '30-40 min', startingPrice: '$125 Sedan / $165 SUV' },
  { from: 'IAH Airport', to: 'The Galleria / Uptown Post Oak', duration: '35-45 min', startingPrice: '$130 Sedan / $170 SUV' },
  { from: 'IAH Airport', to: 'The Woodlands / Cynthia Woods', duration: '25-35 min', startingPrice: '$115 Sedan / $155 SUV' },
  { from: 'Hobby Airport (HOU)', to: 'Downtown / Medical Center', duration: '20-25 min', startingPrice: '$110 Sedan / $145 SUV' },
  { from: 'Hobby Airport (HOU)', to: 'Port of Galveston Cruise Pier', duration: '45-55 min', startingPrice: '$150 Sedan / $190 SUV' },
  { from: 'IAH Airport', to: 'Port of Galveston Cruise Pier', duration: '75-85 min', startingPrice: '$220 Sedan / $260 SUV' },
  { from: 'Houston Metro', to: 'Austin / San Antonio / College Station', duration: '2.5 - 3 hrs', startingPrice: '$495 Sedan / $595 SUV' }
];

export const AIRPORT_GUIDES = [
  {
    code: 'IAH',
    name: 'George Bush Intercontinental Airport',
    description: "Houston's primary international gateway located 23 miles north of Downtown Houston. We service all terminals (A, B, C, D, E) and private FBOs with flight tracking.",
    curbsidePickup: 'Chauffeur waits in cell phone staging area and pulls to your terminal outer passenger pickup lane within 3-5 minutes of your baggage retrieval text.',
    insideMeetAndGreet: 'Chauffeur greets you in baggage claim holding an iPad name sign, assists with luggage transfer to VIP parking garage cart.',
    fboLocations: 'Signature Flight Support, Atlantic Aviation, Jet Aviation (North & South ramps).'
  },
  {
    code: 'HOU',
    name: 'William P. Hobby Airport',
    description: 'Located 7 miles south of Downtown Houston. The preferred airport for domestic flights, Southwest Airlines, and corporate private aviation.',
    curbsidePickup: 'Direct pickup at Zone 3 Chauffeur / Livery Lane directly outside Baggage Claim door 2.',
    insideMeetAndGreet: 'Chauffeur stands at baggage carousel greeting you with customized name board and baggage loading support.',
    fboLocations: 'Signature Flight Support HOU, Million Air Houston, Wilson Air Center.'
  }
];
