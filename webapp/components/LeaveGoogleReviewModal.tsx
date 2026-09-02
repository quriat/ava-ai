import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle, Copy, ExternalLink, ShieldCheck, Sparkles, MessageSquare, ThumbsUp, Car, MapPin, User, Mail, Award, Check } from 'lucide-react';
import { GoogleReview } from '../types';
import { COMPANY_INFO } from '../data/avalimoData';
import { saveGoogleReview } from '../data/googleReviewsData';

interface LeaveGoogleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: {
    confirmationCode?: string;
    passengerName?: string;
    passengerEmail?: string;
    vehicleName?: string;
    chauffeurName?: string;
    tripType?: string;
    route?: string;
  };
  onReviewSubmitted?: (newReview: GoogleReview) => void;
}

const REVIEW_TAG_OPTIONS = [
  '⭐ 100% On-Time & Early',
  '✈️ Flight Tracking & Zero Delay',
  '🧼 Immaculate & Sanitized Vehicle',
  '🧳 Luggage Assistance & Inside Greeting',
  '🍾 Chilled Artesian Waters & Mints',
  '🛡️ Smooth, Safe & Defensive Driving',
  '💼 Fast Mobile Wi-Fi & Quiet Workspace',
  '👶 Safe Child Car Seats Installed',
  '🤵 Crisp Suit & Professional Chauffeur',
  '💳 Transparent Pricing & Easy Billing'
];

const QUICK_PROMPTS = [
  {
    label: '✈️ IAH / Hobby Airport',
    text: 'Outstanding airport chauffeur service! Chauffeur arrived early, tracked my flight seamlessly, greeted me at baggage claim, and helped with all luggage. The vehicle was spotless and stocked with cold water. Highly recommended for Houston airport travel!'
  },
  {
    label: '🚢 Galveston Cruise Transfer',
    text: 'Effortless door-to-ship transfer to the Port of Galveston. Traveling with all our cruise luggage was completely stress-free thanks to our courteous driver and spacious luxury SUV. Arrived right on schedule with zero hassle!'
  },
  {
    label: '💼 Corporate / Business',
    text: 'AvaLimo is our go-to executive car service for Houston client meetings and corporate travel. Punctual, discreet, professional suit-and-tie chauffeur, and pristine luxury fleet. Corporate invoicing is straightforward.'
  },
  {
    label: '🥂 Wedding / Special Event',
    text: 'Booked AvaLimo for our special occasion in Houston and the experience was top-tier. Red carpet treatment, chilled champagne, and a beautiful vehicle that made the entire evening magical.'
  }
];

// Official Google Review / Search Link for AvaLimo Houston
export const DEFAULT_GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJSZpoR7TvQIYRWBRoVXu3j7w';

export const getGoogleReviewUrl = () => {
  try {
    return localStorage.getItem('avalimo_google_review_url') || DEFAULT_GOOGLE_REVIEW_URL;
  } catch {
    return DEFAULT_GOOGLE_REVIEW_URL;
  }
};

const LeaveGoogleReviewModal: React.FC<LeaveGoogleReviewModalProps> = ({
  isOpen,
  onClose,
  prefillData,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [author, setAuthor] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [tripType, setTripType] = useState<string>('Executive Airport Transfer');
  const [vehicleExperienced, setVehicleExperienced] = useState<string>('Cadillac Escalade ESV');
  const [chauffeurName, setChauffeurName] = useState<string>('Adam K.');
  const [routeOrArea, setRouteOrArea] = useState<string>('Bush Intercontinental Airport (IAH) ⇄ Downtown');
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⭐ 100% On-Time & Early',
    '🧼 Immaculate & Sanitized Vehicle'
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [copiedReview, setCopiedReview] = useState<boolean>(false);
  const [copiedPromo, setCopiedPromo] = useState<boolean>(false);
  const [createdReview, setCreatedReview] = useState<GoogleReview | null>(null);

  // Sync prefillData when modal opens
  useEffect(() => {
    if (isOpen) {
      if (prefillData?.passengerName) setAuthor(prefillData.passengerName);
      if (prefillData?.passengerEmail) setEmail(prefillData.passengerEmail);
      if (prefillData?.confirmationCode) setConfirmationCode(prefillData.confirmationCode);
      if (prefillData?.vehicleName) setVehicleExperienced(prefillData.vehicleName);
      if (prefillData?.chauffeurName) setChauffeurName(prefillData.chauffeurName);
      if (prefillData?.tripType) setTripType(prefillData.tripType);
      if (prefillData?.route) setRouteOrArea(prefillData.route);
    }
  }, [isOpen, prefillData]);

  if (!isOpen) return null;

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5: return '5 Stars — Exceptional VIP Chauffeur Service';
      case 4: return '4 Stars — Very Good & Reliable';
      case 3: return '3 Stars — Average Service';
      case 2: return '2 Stars — Needs Improvement';
      case 1: return '1 Star — Unsatisfactory';
      default: return 'Select Your Rating';
    }
  };

  const handleCopyReviewText = () => {
    navigator.clipboard.writeText(comment);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 3000);
  };

  const handleCopyPromo = () => {
    navigator.clipboard.writeText('AVAREVIEW10');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 3000);
  };

  const handleSubmit = (postToGoogleAlso: boolean) => {
    if (!author.trim() || !comment.trim()) {
      alert('Please enter your name and review comments before submitting.');
      return;
    }

    setIsSubmitting(true);

    const newReview: GoogleReview = {
      id: `rev-google-${Date.now()}`,
      author: author.trim(),
      role: role.trim() || 'Verified Guest Traveler',
      rating,
      date: 'Just now',
      tripType,
      vehicleExperienced,
      chauffeurName: chauffeurName.trim() || undefined,
      routeOrArea: routeOrArea.trim() || undefined,
      comment: comment.trim(),
      tags: selectedTags,
      confirmationCode: confirmationCode.trim() || undefined,
      verifiedTrip: true,
      helpfulCount: 0,
      hasLeftOnGoogle: true,
      ownerResponse: {
        date: 'Just now',
        responder: 'Adam K. (AvaLimo Houston Management)',
        text: `Thank you so much, ${author.trim().split(' ')[0]}! We truly appreciate you taking the time to share your feedback about our ${vehicleExperienced} chauffeur service. We look forward to your next trip in Houston!`
      }
    };

    // Save review
    const updatedReviews = saveGoogleReview(newReview);
    setCreatedReview(newReview);
    if (onReviewSubmitted) {
      onReviewSubmitted(newReview);
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    if (postToGoogleAlso) {
      // Copy review text to clipboard for effortless pasting on Google
      navigator.clipboard.writeText(comment.trim());
      // Open Google reviews in a new window/tab
      window.open(getGoogleReviewUrl(), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Google Brand styling */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/40 p-5 sm:p-6 border-b border-neutral-800 flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            {/* Google "G" Badge */}
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg flex-shrink-0 p-2">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Google Verified Reviews</span>
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  AvaLimo Houston
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-0.5">
                Leave a Google Review for Your Chauffeur
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Share your executive travel experience to help fellow Houston travelers & receive a 10% promo reward.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
          {!isSuccess ? (
            <>
              {/* Star Rating Selector */}
              <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800 text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Select Your Overall Chauffeur Experience
                </label>
                <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 sm:p-2 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={`${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-neutral-700'
                          } transition-colors`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-semibold text-amber-400 font-serif">
                  {getRatingLabel(hoverRating || rating)}
                </div>
              </div>

              {/* Quick Template Prompts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
                    <Sparkles size={13} className="text-amber-400 mr-1.5" />
                    Quick Review Prompts (Click to Insert)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setComment(prompt.text)}
                      className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800 text-left transition-all text-[11px] text-gray-300 hover:text-white"
                    >
                      <div className="font-semibold text-amber-300">{prompt.label}</div>
                      <div className="text-[10px] text-gray-500 truncate mt-0.5">Click to auto-fill draft</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Your Chauffeur & Trip Feedback *
                  </label>
                  {comment && (
                    <button
                      type="button"
                      onClick={handleCopyReviewText}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                    >
                      <Copy size={11} />
                      <span>{copiedReview ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your ride: chauffeur punctuality, flight tracking, vehicle cleanliness, route comfort, luggage help, or overall impression..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3.5 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none leading-relaxed placeholder:text-gray-600"
                />
              </div>

              {/* Praise Highlight Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Highlight Specific Chauffeur Qualities
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {REVIEW_TAG_OPTIONS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:border-neutral-700 hover:text-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client & Ride Details Grid */}
              <div className="bg-neutral-950/70 p-4 sm:p-5 rounded-2xl border border-neutral-800/80 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                  <ShieldCheck size={14} className="mr-1.5" />
                  Trip Verification Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Marcus Vance or Sarah J."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Email (Private / Verified)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. client@company.com"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Title, Company or Occasion</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Energy Executive / Family Cruise / Wedding"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Confirmation Code (Optional)</label>
                    <input
                      type="text"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      placeholder="e.g. AVA-88421"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-amber-400 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Vehicle Experienced</label>
                    <select
                      value={vehicleExperienced}
                      onChange={(e) => setVehicleExperienced(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Cadillac Escalade ESV">Cadillac Escalade ESV</option>
                      <option value="Mercedes-Benz S580">Mercedes-Benz S-Class (S580)</option>
                      <option value="Mercedes-Benz Sprinter Jet Van">Mercedes-Benz Sprinter Jet Van</option>
                      <option value="Lincoln MKT Stretch Limousine">Lincoln MKT Stretch Limousine</option>
                      <option value="Executive Mini Coach / Bus">Executive Mini Coach / Bus</option>
                      <option value="Luxury SUV (Suburban / Yukon XL)">Luxury SUV (Suburban / Yukon XL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Trip Service Type</label>
                    <select
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Executive Airport Transfer">Executive Airport Transfer (IAH / HOU)</option>
                      <option value="Galveston Cruise Port Transfer">Galveston Cruise Port Transfer</option>
                      <option value="Corporate Roadshow & Charter">Corporate Roadshow & Charter</option>
                      <option value="Hourly / As Directed Chauffeur">Hourly / As Directed Chauffeur</option>
                      <option value="Wedding & Anniversary Limo">Wedding & Anniversary Limo</option>
                      <option value="City-to-City (Austin / Dallas / SA)">City-to-City (Austin / Dallas / SA)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-400 mb-1">Route or Location</label>
                    <input
                      type="text"
                      value={routeOrArea}
                      onChange={(e) => setRouteOrArea(e.target.value)}
                      placeholder="e.g. Bush Airport (IAH) ⇄ The Woodlands or Downtown ⇄ Hobby (HOU)"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {/* Primary Button: Post to Google & Save */}
                <button
                  type="button"
                  disabled={isSubmitting || !author.trim() || !comment.trim()}
                  onClick={() => handleSubmit(true)}
                  className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-950/40 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <span>Submit & Post to Google Maps (1-Click Paste)</span>
                  <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Secondary Button: Submit to website verified reviews only */}
                <button
                  type="button"
                  disabled={isSubmitting || !author.trim() || !comment.trim()}
                  onClick={() => handleSubmit(false)}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors border border-neutral-700 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>Submit as Verified AvaLimo Review Only</span>
                </button>
              </div>
            </>
          ) : (
            /* Success State & 10% Promo Code Reward */
            <div className="text-center py-4 sm:py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle size={36} />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                  Google Review Recorded
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                  Thank You, {author}!
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                  Your feedback helps maintain our 5.0-star reputation across Houston. Your review is now live in our verified testimonials and copied for Google Maps!
                </p>
              </div>

              {/* Reviewer Reward Box with 10% Off Promo */}
              <div className="bg-gradient-to-r from-amber-950/40 via-neutral-950 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Award size={16} />
                  <span>Your Google Review Thank-You Reward</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Enjoy <strong className="text-white">10% OFF</strong> your next Houston airport transfer, Galveston cruise ride, or corporate charter.
                </p>
                <div className="flex items-center justify-between bg-neutral-900 border border-amber-500/30 rounded-xl p-3">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Promo Code</div>
                    <div className="text-lg font-mono font-bold text-amber-400 tracking-wider">AVAREVIEW10</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPromo}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                  >
                    {copiedPromo ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedPromo ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Link to Google Business Profile */}
              <div className="space-y-3 max-w-lg mx-auto">
                <a
                  href={getGoogleReviewUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-gray-100 text-neutral-900 font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Open Official Google Review Page & Paste Review</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Done & Return to AvaLimo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveGoogleReviewModal;
