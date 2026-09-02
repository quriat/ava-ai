import { GoogleReview } from '../types';

export const INITIAL_GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 'rev-google-1',
    author: 'Marcus Vance',
    role: 'VP of Global Operations, Energy Sector',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    date: '2 weeks ago',
    tripType: 'Executive Airport & Corporate',
    vehicleExperienced: 'Cadillac Escalade ESV',
    chauffeurName: 'Adam K.',
    routeOrArea: 'Bush Intercontinental Airport (IAH) ⇄ Downtown Houston',
    comment: 'AvaLimo is hands-down the premier chauffeur service in Houston. Adam and his team have handled all incoming international board members and VIP partners from IAH for over 4 years. Never a minute late, pristine Escalades stocked with Fiji waters, flawless flight tracking even when planes land 40 minutes early, and effortless corporate Net-30 billing.',
    tags: ['⭐ Always On-Time', '✈️ Flawless Flight Tracking', '🧼 Immaculate Escalade', '💼 Corporate Billing'],
    confirmationCode: 'AVA-88421',
    verifiedTrip: true,
    helpfulCount: 24,
    hasLeftOnGoogle: true,
    ownerResponse: {
      date: '1 week ago',
      responder: 'Adam K. (Owner & Fleet Operations, AvaLimo Houston)',
      text: 'Thank you Marcus! It is always an honor to provide executive transportation for your global leadership team. We look forward to your next arrival at IAH!'
    }
  },
  {
    id: 'rev-google-2',
    author: 'Elena & David Rodriguez',
    role: 'Bride & Groom, The Post Oak Hotel',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    date: '1 month ago',
    tripType: 'Wedding Chauffeur Package',
    vehicleExperienced: 'Mercedes-Benz Sprinter & Lincoln Stretch',
    chauffeurName: 'David M.',
    routeOrArea: 'River Oaks Country Club ⇄ The Post Oak Hotel Uptown',
    comment: 'We booked the Mercedes Sprinter for our wedding party and the Lincoln stretch for our midnight grand exit. Our chauffeur arrived 20 minutes early in a crisp black suit, rolled out a red carpet, and had chilled champagne waiting. It made our wedding night in Houston truly unforgettable! Highest recommendation!',
    tags: ['🍾 Champagne & Red Carpet', '🤵 Suit & Tie Chauffeur', '⏰ 20 Min Early', '✨ Pristine Sprinter'],
    confirmationCode: 'AVA-91204',
    verifiedTrip: true,
    helpfulCount: 38,
    hasLeftOnGoogle: true,
    ownerResponse: {
      date: '3 weeks ago',
      responder: 'Adam K. (Owner, AvaLimo Houston)',
      text: 'Congratulations Elena and David! We were thrilled to be a part of your magnificent wedding celebration at River Oaks and The Post Oak Hotel. Wishing you a lifetime of happiness!'
    }
  },
  {
    id: 'rev-google-3',
    author: 'Jonathan Sterling, Esq.',
    role: 'Managing Partner, Sterling & Croft Law',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    date: '1 month ago',
    tripType: 'Executive Sedan Charter',
    vehicleExperienced: 'Mercedes-Benz S580',
    chauffeurName: 'Tariq S.',
    routeOrArea: 'Harris County Civil Courthouse ⇄ Hobby Airport (HOU)',
    comment: 'Between back-to-back trial dates in Downtown Houston and quick flights out of Hobby, having AvaLimo on speed dial provides total reliability. The Mercedes S-Class is whisper quiet, equipped with high-speed Wi-Fi allowing me to prep arguments on the go. Chauffeur Tariq is courteous, discreet, and knows every shortcut to bypass I-45 traffic.',
    tags: ['💻 Fast Mobile Wi-Fi', '🛡️ Smooth & Quiet Ride', '🚦 Houston Traffic Expert', '⚖️ Professional & Discreet'],
    confirmationCode: 'AVA-76391',
    verifiedTrip: true,
    helpfulCount: 19,
    hasLeftOnGoogle: true
  },
  {
    id: 'rev-google-4',
    author: 'Sarah & Keith Jenkins',
    role: 'Family Cruise Travelers (Chicago, IL)',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    date: '2 months ago',
    tripType: 'Galveston Cruise Port Transfer',
    vehicleExperienced: 'Suburban / Escalade Luxury SUV',
    chauffeurName: 'Michael B.',
    routeOrArea: 'IAH Airport ⇄ Port of Galveston Cruise Terminal 10',
    comment: 'Traveling from Chicago with 3 kids and 7 heavy suitcases for a Royal Caribbean cruise was intimidating, but AvaLimo made it stress-free. Our driver met us right inside IAH baggage claim with a customized digital iPad sign, assisted with all the bags, and had two clean forward-facing child car seats already installed safely. Dropped us directly at the ship porters station in Galveston!',
    tags: ['🧳 Baggage Claim Meet & Greet', '👶 Sanitized Car Seats Installed', '🚢 Port of Galveston Direct', '👨‍👩‍👧‍👦 Family Friendly'],
    confirmationCode: 'AVA-82054',
    verifiedTrip: true,
    helpfulCount: 42,
    hasLeftOnGoogle: true,
    ownerResponse: {
      date: '2 months ago',
      responder: 'Adam K. (AvaLimo Houston)',
      text: 'Thank you Sarah! We know family travel can be hectic, and we take great pride in providing safe child seats and smooth cruise transfers to Galveston!'
    }
  },
  {
    id: 'rev-google-5',
    author: 'Dr. Kimberly Adams, MD',
    role: 'Chief of Oncology Research',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    date: '3 months ago',
    tripType: 'Early Morning Airport Transfer',
    vehicleExperienced: 'Cadillac Escalade ESV',
    chauffeurName: 'Adam K.',
    routeOrArea: 'Texas Medical Center (MD Anderson) ⇄ IAH Airport Terminal E',
    comment: 'Impeccable punctuality. When you have a 5:30 AM international flight out of Bush Airport for a medical symposium, you cannot gamble on rideshare cancellations. AvaLimo arrived at 3:45 AM sharp, sent an SMS notification, and delivered a peaceful ride in a heated leather SUV.',
    tags: ['⏰ 3:45 AM Guaranteed Pickup', '📱 Instant SMS Status Alerts', '🏥 Texas Medical Center VIP'],
    confirmationCode: 'AVA-69312',
    verifiedTrip: true,
    helpfulCount: 16,
    hasLeftOnGoogle: true
  },
  {
    id: 'rev-google-6',
    author: 'Harrison Reed',
    role: 'Director of Investor Relations, CERAWeek 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    date: '3 months ago',
    tripType: 'Corporate Roadshow & Hourly Charter',
    vehicleExperienced: 'Mercedes-Benz Sprinter Executive Jet Van',
    chauffeurName: 'Tariq S. & David M.',
    routeOrArea: 'George R. Brown Convention Center ⇄ Galleria & The Woodlands',
    comment: 'We reserved two luxury Sprinter Jet Vans for high-level delegates during Houston Energy Week. The vehicle interiors with captain chairs, conference tables, and Apple TV monitors allowed our executives to conduct meetings between venues without skipping a beat. Unmatched professionalism and fleet condition.',
    tags: ['🏢 Executive Roadshow', '🛋️ Sprinter Captain Chairs', '⚡ Seamless Group Logistics'],
    confirmationCode: 'AVA-90412',
    verifiedTrip: true,
    helpfulCount: 29,
    hasLeftOnGoogle: true
  }
];

const LOCAL_STORAGE_KEY = 'avalimo_google_reviews_v1';

export function getStoredGoogleReviews(): GoogleReview[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load reviews from localStorage', e);
  }
  return INITIAL_GOOGLE_REVIEWS;
}

export function saveGoogleReview(newReview: GoogleReview): GoogleReview[] {
  try {
    const current = getStoredGoogleReviews();
    const updated = [newReview, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save review to localStorage', e);
    return [newReview, ...INITIAL_GOOGLE_REVIEWS];
  }
}

export function voteHelpfulReview(reviewId: string): GoogleReview[] {
  try {
    const current = getStoredGoogleReviews();
    const updated = current.map(r => {
      if (r.id === reviewId) {
        const isVoted = r.userVotedHelpful;
        return {
          ...r,
          userVotedHelpful: !isVoted,
          helpfulCount: isVoted ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1
        };
      }
      return r;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to update vote in localStorage', e);
    return INITIAL_GOOGLE_REVIEWS;
  }
}
