import { FleetItem, VehicleType, Service, ServiceArea, FAQItem, Testimonial } from '../types';

export const COMPANY_INFO = {
  name: 'AvaLimo Houston',
  legalName: 'Ava Limo Luxury Transportation LLC',
  establishedYear: 2008,
  tagline: 'Houston’s Premier Chauffeur & Limousine Service',
  domains: ['avalimo.net', 'www.avalimohouston.com'],
  phone: '(832) 567-8050',
  phoneRaw: '+18325678050',
  aiConciergePhone: '(832) 917-6331',
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
    alt: 'Mercedes-Benz S-Class black executive sedan — AvaLimo Houston luxury airport transfer car',
    type: VehicleType.SEDAN,
    passengers: 3,
    luggage: 3,
    pricePerHour: 85,
    flatRateIAH: 125,
    flatRateHobby: 110,
    flatRateGalveston: 220,
    minHours: 3,
    image: 'https://avalimo.net/static/mercedes_sclass.png',
    images: [
      'https://avalimo.net/static/mercedes_sclass.png',
      'https://upload.wikimedia.org/wikipedia/commons/6/6b/Mercedes-Benz_S-Class_W223_black.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Mercedes-Benz_S-Class%2C_Mayfair%2C_London_02.jpg/1920px-Mercedes-Benz_S-Class%2C_Mayfair%2C_London_02.jpg'
    ],
    description: 'The pinnacle of German luxury and executive refinement. The Mercedes S-Class provides an ultra-smooth, whisper-quiet cabin engineered for business executives, airport arrivals, and distinguished couples.',
    features: [
      'Hand-stitched Nappa leather reclining rear seats',
      'Burmester® 3D High-End Surround Sound',
      'Dual rear passenger climate control & heated/ventilated seating',
      'Complimentary ultra-fast 5G Wi-Fi & device charging cables',
      'Acoustic noise-insulating privacy glass with power sunshades',
      'Chilled premium bottled water & daily newspapers upon request'
    ],
    idealFor: [
      'Corporate roadshows & business meetings',
      'IAH & Hobby airport transfers for VIPs',
      'Executive dining & evening theater in Downtown Houston',
      'Diplomatic & confidential private transit'
    ]
  },
  {
    id: 'cadillac-escalade-esv',
    name: 'Cadillac Escalade ESV',
    category: 'Flagship Luxury SUV',
    alt: 'Cadillac Escalade ESV black luxury SUV — AvaLimo Houston airport & cruise group transfer',
    type: VehicleType.SUV,
    passengers: 6,
    luggage: 6,
    pricePerHour: 115,
    flatRateIAH: 165,
    flatRateHobby: 145,
    flatRateGalveston: 260,
    minHours: 3,
    image: 'https://avalimo.net/static/cadillac_escalade.png',
    images: [
      'https://avalimo.net/static/cadillac_escalade.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Cadillac_Escalade_ESV_GMTK2YL_Black_Raven_%281%29.jpg/1920px-Cadillac_Escalade_ESV_GMTK2YL_Black_Raven_%281%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Cadillac_Escalade_ESV_Sport_Platinum_GMTT1YL_FL_Black_Raven_%281%29.jpg/1920px-Cadillac_Escalade_ESV_Sport_Platinum_GMTT1YL_FL_Black_Raven_%281%29.jpg'
    ],
    description: 'Imposing, spacious, and undeniably prestigious. The extended wheelbase (ESV) Escalade guarantees abundant legroom for up to 6 passengers alongside exceptional luggage capacity for airport or cruise departures.',
    features: [
      'Extended wheelbase (ESV) offering maximum cargo capacity',
      'Ultra-luxury captain chairs with independent armrests',
      'AKG™ Studio 36-Speaker Reference Sound System',
      'Rear Seat 12.6" OLED dual touchscreens with streaming support',
      'Magnetic Ride Control for an effortless, glass-smooth ride',
      'Tri-zone automatic climate control & USB-C ports for all seats'
    ],
    idealFor: [
      'Family airport transfers with extensive luggage',
      'Galveston cruise terminal transfers',
      'Houston Texans, Rockets & Astros sporting games (NRG/Toyota Center)',
      'Executive board member delegations & corporate site visits'
    ]
  },
  {
    id: 'chevrolet-suburban-ltz',
    name: 'GMC Yukon XL / Chevy Suburban',
    category: 'Executive Black SUV',
    alt: 'GMC Yukon XL black executive SUV — AvaLimo Houston corporate & airport chauffeur service',
    type: VehicleType.SUV,
    passengers: 7,
    luggage: 6,
    pricePerHour: 105,
    flatRateIAH: 155,
    flatRateHobby: 135,
    flatRateGalveston: 245,
    minHours: 3,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/13/GMC_Yukon_XL_GMTT1YG_Denali_Onyx_Black_01.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/1/13/GMC_Yukon_XL_GMTT1YG_Denali_Onyx_Black_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/a3/GMC_Yukon_XL_GMTT1YG_Denali_Onyx_Black_02.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/42/GMC_Yukon_XL_GMTK2YG_Denali_Onyx_Black_01.jpg'
    ],
    description: 'The definitive standard for corporate livery and comfortable group travel across Texas highways. Combining vast cargo space, sleek all-black exterior, and plush leather comfort.',
    features: [
      'Black leather 7-passenger executive seating configuration',
      'High luggage capacity for golf bags, cruise luggage & strollers',
      'Heavy-duty dual rear A/C designed for Texas summer heat',
      'Bluetooth audio streaming & multiple 110V power outlets',
      'Tinted privacy windows & smooth highway suspension'
    ],
    idealFor: [
      'Energy Corridor & The Woodlands business commuting',
      'Airport family transfers (IAH/Hobby)',
      'Golf outings & concert shuttles',
      'Reliable all-weather point-to-point Texas transit'
    ]
  },
  {
    id: 'mercedes-sprinter-van',
    name: 'Mercedes-Benz Sprinter Executive',
    category: 'VIP Luxury Jet Sprinter',
    alt: 'Mercedes-Benz Sprinter executive van interior — AvaLimo Houston group & wedding transportation',
    type: VehicleType.SPRINTER,
    passengers: 14,
    luggage: 14,
    pricePerHour: 165,
    flatRateIAH: 260,
    flatRateHobby: 240,
    flatRateGalveston: 390,
    minHours: 4,
    image: 'https://avalimo.net/static/mercedes_sprinter.png',
    images: [
      'https://avalimo.net/static/mercedes_sprinter.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Mercedes-Benz_VS30_Sprinter_Tourer_319_CDI_Jet_Black_%281%29.jpg/1920px-Mercedes-Benz_VS30_Sprinter_Tourer_319_CDI_Jet_Black_%281%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Mercedes-Benz_VS30_Sprinter_Tourer_319_CDI_Jet_Black_%282%29.jpg/1920px-Mercedes-Benz_VS30_Sprinter_Tourer_319_CDI_Jet_Black_%282%29.jpg'
    ],
    description: 'The ultimate mobile boardroom and luxury group transporter. Features full stand-up 6’4” headroom, custom diamond-stitched leather captains chairs, HDMI smart TV, ambient LED mood lighting, and separate rear luggage partition.',
    features: [
      'High-roof walk-in design with 6’4” standing clearance',
      '14 forward-facing premium diamond-stitched leather recliners',
      '43” 4K Smart TV with Apple TV / HDMI / streaming integration',
      'Custom color-selectable fiber optic & ambient ceiling lighting',
      'Dedicated rear luggage hold storing up to 14 large travel bags',
      'Dual heavy-duty commercial air conditioning systems & mini-bar'
    ],
    idealFor: [
      'Wedding bridal parties & guest shuttles',
      'Galveston cruise group embarkation/disembarkation',
      'Corporate roadshows, summits & corporate dinner transfers',
      'Houston Rodeo VIP groups, brewery tours & private charters'
    ]
  },
  {
    id: 'lincoln-stretch-limo',
    name: 'Lincoln MKT Stretch Limousine',
    category: 'Ultra Stretch Limousine',
    alt: 'Lincoln MKT black stretch limousine — AvaLimo Houston wedding & night-out party transport',
    type: VehicleType.LIMO,
    passengers: 10,
    luggage: 6,
    pricePerHour: 150,
    flatRateIAH: 240,
    flatRateHobby: 220,
    flatRateGalveston: 360,
    minHours: 4,
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Lincoln_MKT_limo.JPG',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/9/97/Lincoln_MKT_limo.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/9/9b/98-02_Lincoln_Town_Car_limousine.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/62/Lincoln_Town_Car_limousine_in_Ukraine_01.jpg'
    ],
    description: 'The iconic symbol of celebratory glamour and red-carpet elegance. Equipped with a custom wrap-around J-lounge leather sofa, stainless steel mirrored bar, optical starlight ceiling, and surround sound.',
    features: [
      'Wrap-around two-tone leather J-seating for up to 10 guests',
      'Integrated acrylic bar with crystal glassware & ice coolers',
      'Fiber optic Starlight headliner & strobe party illumination',
      'Premium Bluetooth audio system with subwoofer integration',
      'Privacy divider with direct chauffeur intercom system',
      'Complimentary celebratory ice & glassware package'
    ],
    idealFor: [
      'Weddings, bride & groom grand send-offs',
      'High school Proms, Homecomings & Quinceañeras',
      'Milestone birthdays, bachelor/bachelorette celebrations',
      'VIP Houston nightlife & romantic date nights'
    ]
  },
  {
    id: 'executive-mini-coach',
    name: 'Executive Mini Coach & Party Bus',
    category: 'Group Luxury Charter',
    alt: 'Executive mini coach party bus — AvaLimo Houston group event & bachelorette transportation',
    type: VehicleType.PARTY_BUS,
    passengers: 24,
    luggage: 20,
    pricePerHour: 220,
    flatRateIAH: 350,
    flatRateHobby: 320,
    flatRateGalveston: 550,
    minHours: 5,
    image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?q=80&w=2070&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1557223562-6c77ef16210f?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2070&auto=format&fit=crop'
    ],
    description: 'Engineered for large parties, corporate delegations, and major Houston galas. Offers plush high-back reclining seats, panoramic windows, high-fidelity sound, and spacious underneath luggage storage.',
    features: [
      '24 high-back ergonomic leather passenger seats with seatbelts',
      'Expansive panoramic tinted touring windows',
      'PA microphone system for corporate guides & event coordinators',
      'Overhead parcel racks & massive underfloor cargo luggage bays',
      'Dual video monitors & USB charging ports at each seat row'
    ],
    idealFor: [
      'Major corporate conferences & conventions (George R. Brown)',
      'Large wedding guest shuttles & church-to-reception transit',
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
    description: 'We monitor your commercial or private flight in real time. Whether landing at George Bush Intercontinental Airport (IAH), William P. Hobby (HOU), or private FBO terminals (Million Air, Signature Aviation, Wilson Air), your chauffeur greets you seamlessly.',
    iconName: 'Plane',
    features: [
      'Real-time automated flight status tracking (early/delayed flights covered)',
      'Complimentary 45-min domestic & 60-min international airport wait time',
      'Baggage claim Inside Meet & Greet with personalized name sign or VIP curbside',
      'Luggage handling and direct escort to your waiting climate-controlled vehicle',
      'Flat-rate pricing with all tolls and airport fees clearly included'
    ],
    recommendedVehicle: 'Mercedes-Benz S-Class or Cadillac Escalade ESV',
    popularRoutes: [
      'IAH Airport ⇄ Downtown Houston ($125 flat Sedan / $165 SUV)',
      'IAH Airport ⇄ Galleria / Uptown ($130 flat Sedan / $170 SUV)',
      'IAH Airport ⇄ The Woodlands ($115 flat Sedan / $155 SUV)',
      'Hobby Airport ⇄ Downtown / Medical Center ($110 flat Sedan / $145 SUV)'
    ]
  },
  {
    id: 'galveston-cruise-transfers',
    title: 'Galveston Cruise Port Transfers',
    tagline: 'Direct, Stress-Free Luxury Shuttles from Houston to Galveston Terminals',
    description: 'Start your vacation the moment you step off your plane. We provide direct non-stop luxury transfers between IAH Airport, Hobby Airport, Houston hotels, and all Port of Galveston cruise ship terminals (Royal Caribbean, Carnival, Disney, Princess, NCL).',
    iconName: 'Anchor',
    features: [
      'Direct pier drop-off & scheduled return pickup at disembarkation',
      'Extra-large luggage capacity for multi-week cruise suitcases',
      'Child safety car seats provided on request for traveling families',
      'Sprinter vans available for large multi-family cruise travel parties',
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
    description: 'Houston’s top energy executives, law partners, and medical professionals trust AvaLimo for business roadshows, financial district meetings, and Texas Medical Center appointments. Discrete, licensed chauffeurs and silent, Wi-Fi equipped cabins.',
    iconName: 'Building2',
    features: [
      'Corporate accounts with simplified monthly itemized billing & receipts',
      'Strict non-disclosure confidentiality and professionalism',
      'Multi-stop roadshows with dedicated driver on continuous standby',
      'High-speed 5G Wi-Fi, 110V power outlets, and laptop work desks'
    ],
    recommendedVehicle: 'Mercedes-Benz S-Class or Cadillac Escalade ESV'
  },
  {
    id: 'weddings-events',
    title: 'Weddings & Red-Carpet Occasions',
    tagline: 'Add Unforgettable Luxury & Flawless Timing to Your Big Day',
    description: 'From pristine bridal party Sprinter vans to classic getaway limousines and luxury Sedans, we ensure every moment of your wedding transportation is pure perfection. Red-carpet rollout and chilled champagne service available upon request.',
    iconName: 'Wine',
    features: [
      'White-glove chauffeur dressed in formal black suit and tie',
      'Complimentary chilled champagne & sparkling cider package',
      'Red carpet rollout for bridal arrival and church departure',
      'Custom coordination with your wedding planner or venue team'
    ],
    recommendedVehicle: 'Lincoln Stretch Limousine & Mercedes Sprinter Van'
  },
  {
    id: 'night-out-events',
    title: 'Concerts, Sporting Events & Houston Nightlife',
    tagline: 'Skip Traffic & Parking at NRG Stadium, Toyota Center & Minute Maid',
    description: 'Experience game day and world-class concerts without the frustration of parking garages or rideshare surge pricing. Enjoy pre-event drinks safely while your personal chauffeur drops you off at the VIP stadium gates and waits for the final encore.',
    iconName: 'Sparkles',
    features: [
      'Direct VIP gate drop-off and priority stadium pickup lanes',
      'Houston Rodeo, Texans, Astros, Rockets, and Dynamo game service',
      'Cynthia Woods Mitchell Pavilion, 713 Music Hall, and Theater District trips',
      'Enjoy dinner in River Oaks or Montrose with driver standing by'
    ],
    recommendedVehicle: 'Cadillac Escalade ESV or 14-Pax Jet Sprinter'
  },
  {
    id: 'hourly-charter',
    title: 'Hourly / As-Directed Charters',
    tagline: 'Total Flexibility with Your Dedicated Chauffeur On Demand',
    description: 'Need to make multiple stops around Houston or keep your schedule fluid? Our hourly charter gives you complete freedom. Your vehicle and chauffeur stay with you as long as needed, waiting curbside ready to depart whenever you are.',
    iconName: 'Clock',
    features: [
      'Unlimited stops within the booked charter duration',
      'Vehicle stays exclusively assigned to you throughout the day',
      'Transparent flat hourly rate with zero surprise surcharges',
      'Available for 3-hour minimums up to full multi-day corporate itineraries'
    ],
    recommendedVehicle: 'Any vehicle in our luxury fleet'
  },
  {
    id: 'intercity-texas',
    title: 'City-to-City Texas Long Distance',
    tagline: 'First-Class Private Ground Travel to Austin, Dallas & San Antonio',
    description: 'Avoid airport security queues, crowded terminals, and regional flight delays. Relax or work in an executive Mercedes or Escalade for direct door-to-door transit between Houston and Austin, Dallas, San Antonio, or College Station.',
    iconName: 'Compass',
    features: [
      'Direct door-to-door private transport from Houston to any Texas city',
      'Comfortable highway cruising with high-speed Wi-Fi and power outlets',
      'Rest stop flexibility at your preferred dining or coffee locations',
      'Fixed flat rates for Austin, Dallas, San Antonio, and Texas A&M'
    ],
    recommendedVehicle: 'Mercedes-Benz S-Class or Cadillac Escalade ESV'
  }
];

export const SERVICE_AREAS: ServiceArea[] = [
  {
    name: 'Downtown Houston & Midtown',
    category: 'core',
    description: 'Heart of Houston business, Theater District, George R. Brown Convention Center, Minute Maid Park & Toyota Center.',
    typicalTransferTime: '30-40 min from IAH / 20-25 min from Hobby',
    popularDestinations: ['Four Seasons Houston', 'Marriott Marquis', 'George R. Brown Convention Center', 'Toyota Center']
  },
  {
    name: 'Uptown, Galleria & Post Oak',
    category: 'core',
    description: 'Premier shopping, international luxury hotels, luxury dining on Post Oak Blvd, and corporate headquarters.',
    typicalTransferTime: '35-45 min from IAH / 30-35 min from Hobby',
    popularDestinations: ['The Post Oak Hotel at Uptown', 'The Galleria Mall', 'The St. Regis Houston', 'Hotel Granduca']
  },
  {
    name: 'Texas Medical Center (TMC) & Museum District',
    category: 'core',
    description: 'World’s largest medical center complex, MD Anderson, Houston Methodist, Hermann Park, and Museum of Fine Arts.',
    typicalTransferTime: '35-45 min from IAH / 25-30 min from Hobby',
    popularDestinations: ['MD Anderson Cancer Center', 'Houston Methodist Hospital', 'Museum of Fine Arts', 'Rice University']
  },
  {
    name: 'The Woodlands & Spring',
    category: 'north',
    description: 'Corporate hubs (ExxonMobil campus), luxury residences, Cynthia Woods Mitchell Pavilion, and Woodlands Waterway.',
    typicalTransferTime: '25-35 min from IAH / 50-60 min from Hobby',
    popularDestinations: ['The Woodlands Resort', 'Cynthia Woods Pavilion', 'Hughes Landing', 'Woodlands Mall']
  },
  {
    name: 'Sugar Land & Missouri City',
    category: 'south',
    description: 'Our founding home base! Fort Bend County corporate centers, Smart Financial Centre, and upscale master communities.',
    typicalTransferTime: '45-55 min from IAH / 30-40 min from Hobby',
    popularDestinations: ['Smart Financial Centre', 'Sugar Land Town Square', 'First Colony', 'Sienna Plantation']
  },
  {
    name: 'Katy & Energy Corridor',
    category: 'west',
    description: 'Global energy headquarters along I-10 West, BP, Shell, ConocoPhillips, Katy Mills, and master-planned neighborhoods.',
    typicalTransferTime: '40-50 min from IAH / 45-55 min from Hobby',
    popularDestinations: ['Energy Corridor Business Parks', 'Omni Houston Hotel Westside', 'Cinco Ranch', 'Katy Mills']
  },
  {
    name: 'Galveston Island & Cruise Port',
    category: 'coastal',
    description: 'Historic strand district, Galveston Cruise Terminals 1, 2, 3 (Royal Caribbean), Moody Gardens, and beachfront resorts.',
    typicalTransferTime: '45-55 min from Hobby / 75-85 min from IAH',
    popularDestinations: ['Port of Galveston Cruise Terminals', 'The San Luis Resort', 'Moody Gardens', 'Historic Strand']
  },
  {
    name: 'Pearland, Friendswood & Clear Lake',
    category: 'south',
    description: 'NASA Johnson Space Center, Kemah Boardwalk, aerospace contractors, and affluent southern communities.',
    typicalTransferTime: '45-55 min from IAH / 15-25 min from Hobby',
    popularDestinations: ['Space Center Houston', 'Kemah Boardwalk', 'South Shore Harbour Resort', 'Pearland Town Center']
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
  },
  {
    id: 5,
    name: 'Dr. Kimberly Adams',
    role: 'Chief Medical Officer',
    company: 'Texas Medical Center',
    location: 'Houston, TX',
    text: 'Reliable, impeccably clean, and respectful. Whether I need an early 4:30 AM pickup for a medical symposium flight or evening gala transport, AvaLimo consistently delivers 5-star service.',
    stars: 5,
    date: 'November 2025',
    serviceType: 'Early Morning Airport Transfer'
  }
];

export const FAQS_DATA: FAQItem[] = [
  {
    question: 'How do airport pickups work at IAH and Hobby Airport?',
    answer: 'We offer two pickup options: 1) Inside Meet & Greet where your chauffeur waits at baggage claim holding a personalized digital iPad nameboard, assists with your luggage, and guides you to the VIP vehicle; or 2) Curbside VIP where you contact your chauffeur when you collect your bags for immediate curbside arrival.',
    category: 'airport'
  },
  {
    question: 'What happens if my flight is delayed or arrives early?',
    answer: 'We track all commercial flights and private tail numbers in real time. We automatically adjust your chauffeur dispatch time to your actual landing time at no extra charge. We also include 45 minutes of complimentary wait time for domestic flights and 60 minutes for international arrivals.',
    category: 'airport'
  },
  {
    question: 'Are your rates flat rates or do they include surge pricing?',
    answer: 'All our quoted rates are fixed flat rates with zero surge pricing. Unlike rideshare apps that double rates during rain, rush hour, or Houston Rodeo events, your AvaLimo price remains strictly guaranteed as quoted.',
    category: 'booking'
  },
  {
    question: 'How far in advance should I book my limousine or black car?',
    answer: 'While we can accommodate last-minute 24/7 requests based on fleet availability, we recommend reserving at least 12 to 24 hours in advance for airport transfers, and 1 to 4 weeks in advance for weddings, Sprinter vans, and major event dates.',
    category: 'booking'
  },
  {
    question: 'Do you provide child safety car seats for families?',
    answer: 'Yes! We provide rear-facing infant seats, forward-facing toddler seats, and booster seats upon request for a small nominal sanitization fee. Just select the child seat option during booking.',
    category: 'fleet'
  },
  {
    question: 'What is your cancellation and modification policy?',
    answer: 'For sedans and SUVs, cancellations made 12+ hours prior to pickup receive a 100% full refund. For Sprinters, Limousines, and Mini Coaches, we require a 48-hour notice for full refund. Modifications to pickup times can be made anytime subject to vehicle availability.',
    category: 'policies'
  },
  {
    question: 'What amenities are included in the vehicles?',
    answer: 'Every AvaLimo ride includes complimentary high-speed 5G Wi-Fi, chilled artesian bottled water, phone charging cables (Lightning & USB-C), mints, sanitizing wipes, and climate control adjusted to your personal comfort.',
    category: 'fleet'
  },
  {
    question: 'What forms of payment do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), corporate invoicing accounts, and secure digital payment links with instant itemized email receipts.',
    category: 'booking'
  }
];

export const AIRPORT_GUIDES = [
  {
    code: 'IAH',
    name: 'George Bush Intercontinental Airport',
    description: 'Houston’s primary international gateway located 23 miles north of Downtown Houston. We service all terminals (A, B, C, D, E) and private FBOs with flight tracking.',
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
    fboLocations: 'Signature Flight Support HOU, Million Air Houston (Hobby 8501 Telephone Rd), Wilson Air Center.'
  }
];

export const GALVESTON_CRUISE_INFO = {
  title: 'Port of Galveston Cruise Terminal Chauffeur',
  description: 'Avoid crowded bus shuttles and expensive cruise parking lots. AvaLimo provides door-to-ship private black car service directly to your ship pier.',
  terminals: [
    'Terminal 25 (Carnival Cruise Line)',
    'Terminal 28 (Disney Cruise Line & Princess Cruises)',
    'Terminal 10 (Royal Caribbean International - Allure / Harmony of the Seas)',
    'Norwegian Cruise Line & MSC Cruises'
  ],
  features: [
    'Direct baggage unloading at porters station',
    'Custom disembarkation schedule pickup right as you clear customs',
    'Family child car seats (Infant, Toddler, Booster) ready in vehicle',
    'Accommodates 1 to 24 passengers with heavy multi-suitcase luggage'
  ]
};

export const POPULAR_ROUTES = [
  { from: 'IAH Airport', to: 'Downtown Houston / Toyota Center', duration: '30-40 min', startingPrice: '$125 Sedan / $165 SUV' },
  { from: 'IAH Airport', to: 'The Galleria / Uptown Post Oak', duration: '35-45 min', startingPrice: '$130 Sedan / $170 SUV' },
  { from: 'IAH Airport', to: 'The Woodlands / Cynthia Woods', duration: '25-35 min', startingPrice: '$115 Sedan / $155 SUV' },
  { from: 'Hobby Airport (HOU)', to: 'Downtown / Medical Center', duration: '20-25 min', startingPrice: '$110 Sedan / $145 SUV' },
  { from: 'Hobby Airport (HOU)', to: 'Port of Galveston Cruise Pier', duration: '45-55 min', startingPrice: '$150 Sedan / $190 SUV' },
  { from: 'IAH Airport', to: 'Port of Galveston Cruise Pier', duration: '75-85 min', startingPrice: '$220 Sedan / $260 SUV' },
  { from: 'Houston Metro', to: 'Austin / San Antonio / College Station', duration: '2.5 - 3 hrs', startingPrice: '$495 Sedan / $595 SUV' }
];

export const FAQS = FAQS_DATA;
export const REVIEWS = [
  {
    id: 1,
    author: 'Marcus Vance',
    role: 'VP of Global Operations, Energy Sector',
    rating: 5,
    date: 'Feb 2026',
    comment: 'AvaLimo is the gold standard for executive transport in Houston. Adam and his team have handled all our board members and incoming international clients from IAH for over 4 years. Never a minute late, pristine Escalades, and effortless billing.',
    serviceType: 'Executive Airport & Corporate Service'
  },
  {
    id: 2,
    author: 'Elena & David Rodriguez',
    role: 'Bride & Groom, The Post Oak Hotel',
    rating: 5,
    date: 'Jan 2026',
    comment: 'We booked the Mercedes Sprinter for our bridal party and the Lincoln stretch for our midnight grand exit. The chauffeur arrived 20 minutes early, rolled out a red carpet, and had chilled champagne waiting. It made our wedding day truly unforgettable!',
    serviceType: 'Wedding Chauffeur Package'
  },
  {
    id: 3,
    author: 'Jonathan Sterling',
    role: 'Managing Partner, Law Firm',
    rating: 5,
    date: 'Dec 2025',
    comment: 'Between court dates in Downtown and quick trips to Hobby, having AvaLimo on speed dial gives me complete peace of mind. The S-Class allows me to review briefs with fast Wi-Fi and quiet privacy on the road.',
    serviceType: 'Executive Sedan Charter'
  }
];

