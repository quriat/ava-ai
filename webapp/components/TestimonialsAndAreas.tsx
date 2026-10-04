import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Star, Shield, Building, Phone, CheckCircle, Quote, Sparkles, MessageSquare, ThumbsUp, Search, Filter, ExternalLink, Check, Award, Car, UserCheck, ShieldCheck } from 'lucide-react';
import { SERVICE_AREAS, COMPANY_INFO } from '../data/avalimoData';
import { GoogleReview } from '../types';
import { getStoredGoogleReviews, voteHelpfulReview } from '../data/googleReviewsData';
import LeaveGoogleReviewModal from './LeaveGoogleReviewModal';

interface TestimonialsAndAreasProps {
  onBookNow: (areaName?: string) => void;
  onOpenReviewModal?: () => void;
}

const CATEGORY_TABS = [
  'All Reviews',
  'Airport Transfers',
  'Galveston Cruise',
  'Corporate & Roadshow',
  'Weddings & Celebrations'
];

const TestimonialsAndAreas: React.FC<TestimonialsAndAreasProps> = ({ onBookNow, onOpenReviewModal }) => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All Reviews');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [votedReviewIds, setVotedReviewIds] = useState<Set<string>>(new Set());

  // Load reviews from local storage / initial data, then overlay real Google reviews
  useEffect(() => {
    const loaded = getStoredGoogleReviews();
    setReviews(loaded);
    fetch('/api/reviews')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const real = (d?.reviews || []).map((r: any) => ({
          ...r,
          tags: r.tags || [],
        })) as GoogleReview[];
        if (real.length) {
          setReviews((prev) => {
            const seen = new Set(prev.map((p) => `${p.author}|${p.comment}`));
            const merged = real.filter((r) => !seen.has(`${r.author}|${r.comment}`));
            return [...merged, ...prev];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Handle helpful vote
  const handleVoteHelpful = (reviewId: string) => {
    const updated = voteHelpfulReview(reviewId);
    setReviews(updated);
    setVotedReviewIds(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  // Filtered & sorted reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      // Category filter
      if (activeCategory !== 'All Reviews') {
        const cat = activeCategory.toLowerCase();
        const type = (rev.tripType || '').toLowerCase();
        if (cat.includes('airport') && !type.includes('airport')) return false;
        if (cat.includes('cruise') && !type.includes('cruise') && !type.includes('galveston')) return false;
        if (cat.includes('corporate') && !type.includes('corporate') && !type.includes('charter') && !type.includes('sedan')) return false;
        if (cat.includes('wedding') && !type.includes('wedding') && !type.includes('limo')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          rev.author.toLowerCase().includes(q) ||
          rev.comment.toLowerCase().includes(q) ||
          (rev.routeOrArea && rev.routeOrArea.toLowerCase().includes(q)) ||
          (rev.vehicleExperienced && rev.vehicleExperienced.toLowerCase().includes(q)) ||
          (rev.chauffeurName && rev.chauffeurName.toLowerCase().includes(q)) ||
          (rev.tags && rev.tags.some(t => t.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
      return 0; // default order
    });
  }, [reviews, activeCategory, searchQuery, sortBy]);

  // Aggregate stats
  const totalReviewsCount = reviews.length;
  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (totalReviewsCount || 1)).toFixed(1);
  const fiveStarPercentage = Math.round((reviews.filter(r => r.rating === 5).length / (totalReviewsCount || 1)) * 100);

  const handleReviewCreated = (newReview: GoogleReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  return (
    <section className="py-24 bg-neutral-950 text-white relative" id="areas-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* SECTION 1: GOOGLE REVIEWS & CLIENT EXPERIENCES */}
        {/* ============================================================ */}
        <div className="mb-24" id="reviews-section">
          {/* Header Banner with Google Branding */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 rounded-3xl p-6 sm:p-10 mb-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Left Column: Google Rating Score */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white flex flex-col items-center justify-center p-3 shadow-xl flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 mb-1">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-tighter">Google Reviews</span>
                </div>

                <div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
                    <span className="text-3xl sm:text-4xl font-serif font-extrabold text-white">{averageRating}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className="fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-200">
                    Excellent Chauffeur Rating based on <strong className="text-amber-400">320+ Verified Client Reviews</strong>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                    <span className="flex items-center text-emerald-400">
                      <ShieldCheck size={13} className="mr-1" />
                      100% On-Time SLA
                    </span>
                    <span>•</span>
                    <span className="text-gray-300">{fiveStarPercentage}% 5-Star Ratings</span>
                    <span>•</span>
                    <span className="text-gray-300">Houston City Licensed & Insured</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Leave a Review Action Button */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-2 group hover:-translate-y-0.5"
                >
                  <Star size={16} className="fill-white group-hover:rotate-12 transition-transform" />
                  <span>Leave a Google Review</span>
                </button>
                
                <a
                  href="https://search.google.com/local/writereview?placeid=ChIJSZpoR7TvQIYRWBRoVXu3j7w"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-neutral-800 hover:bg-neutral-700 text-gray-200 font-semibold py-3.5 px-5 rounded-xl text-xs tracking-wider uppercase transition-colors border border-neutral-700 flex items-center justify-center space-x-1.5"
                >
                  <ExternalLink size={14} className="text-amber-400" />
                  <span>View on Google Maps</span>
                </a>
              </div>

            </div>
          </div>

          {/* Review Filter Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* Category Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCategory(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === tab
                      ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                      : 'bg-neutral-900/80 text-gray-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search reviews, driver, vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:border-amber-500 focus:outline-none placeholder:text-gray-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl py-2 px-3 text-xs text-gray-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.length === 0 ? (
              <div className="col-span-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center text-gray-400">
                <MessageSquare size={32} className="mx-auto text-amber-500/50 mb-3" />
                <p className="text-sm font-semibold text-white">No reviews found matching "{searchQuery}"</p>
                <p className="text-xs text-gray-500 mt-1">Try searching for "IAH", "Galveston", "Escalade", or "Chauffeur".</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveCategory('All Reviews'); }}
                  className="mt-4 text-xs text-amber-400 hover:underline"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-amber-950/20 group relative"
                >
                  <div>
                    {/* Top Row: Google Badge, Stars & Date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={15} className="fill-amber-400" />
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        {rev.verifiedTrip && (
                          <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                            <Check size={11} className="mr-0.5" />
                            Verified Trip
                          </span>
                        )}
                        <span className="text-[11px] text-gray-500 font-mono">{rev.date}</span>
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-4 italic">
                      "{rev.comment}"
                    </p>

                    {/* Praise Tags Chips */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {rev.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="bg-neutral-950 border border-neutral-800 text-[10px] text-amber-400/90 px-2 py-0.5 rounded-md font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Route & Vehicle Meta Badge */}
                    {(rev.vehicleExperienced || rev.routeOrArea) && (
                      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-2.5 mb-4 text-[11px] text-gray-400 space-y-1">
                        {rev.vehicleExperienced && (
                          <div className="flex items-center text-gray-300 font-medium truncate">
                            <Car size={12} className="text-amber-400 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{rev.vehicleExperienced}</span>
                            {rev.chauffeurName && (
                              <span className="text-gray-500 ml-1.5 text-[10px]">({rev.chauffeurName})</span>
                            )}
                          </div>
                        )}
                        {rev.routeOrArea && (
                          <div className="flex items-center text-gray-400 text-[10px] truncate">
                            <MapPin size={11} className="text-amber-500/70 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{rev.routeOrArea}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Owner Response Box (if present) */}
                    {rev.ownerResponse && (
                      <div className="bg-amber-950/15 border-l-2 border-amber-500/50 p-2.5 rounded-r-lg mb-4 text-[11px] text-gray-300">
                        <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold mb-0.5">
                          <span>AvaLimo Fleet Management Response</span>
                          <span className="text-gray-500 font-mono text-[9px]">{rev.ownerResponse.date}</span>
                        </div>
                        <p className="text-gray-400 text-[10px] italic leading-relaxed">
                          "{rev.ownerResponse.text}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer: Reviewer Info & Helpful Vote */}
                  <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {rev.avatarUrl ? (
                        <img 
                          src={rev.avatarUrl} 
                          alt={rev.author} 
                          className="w-9 h-9 rounded-full object-cover border border-neutral-700" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-800 to-amber-900 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-300">
                          {rev.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-serif font-bold text-white text-xs sm:text-sm flex items-center">
                          <span>{rev.author}</span>
                        </div>
                        <div className="text-[10px] text-amber-400/90 truncate max-w-[150px] sm:max-w-[180px]">
                          {rev.role || rev.tripType}
                        </div>
                      </div>
                    </div>

                    {/* Helpful Button */}
                    <button
                      type="button"
                      onClick={() => handleVoteHelpful(rev.id)}
                      className={`flex items-center space-x-1 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        rev.userVotedHelpful || votedReviewIds.has(rev.id)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-neutral-950 text-gray-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                      }`}
                      title="Mark review as helpful"
                    >
                      <ThumbsUp size={11} className={rev.userVotedHelpful ? 'fill-amber-400' : ''} />
                      <span>{rev.helpfulCount}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Post-Reviews CTA: Callout to Leave a Review */}
          <div className="mt-12 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-white">Recently Traveled with AvaLimo Houston?</h4>
                <p className="text-xs text-gray-400">Share your chauffeur review and receive a 10% promo code for your next trip!</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md whitespace-nowrap"
            >
              Write Your Google Review
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: SERVICE AREAS COVERAGE GRID */}
        {/* ============================================================ */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 sm:p-12 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 text-amber-500 text-xs font-bold tracking-widest uppercase mb-2">
              <MapPin size={14} />
              <span>Full Greater Houston Coverage</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-3">
              Serving Houston, Surrounding Counties & All Texas
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              We provide prompt, guaranteed dispatch across Harris, Fort Bend, Montgomery, Brazoria, and Galveston counties.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {SERVICE_AREAS.map((area, idx) => (
              <button
                key={idx}
                onClick={() => onBookNow(area.name)}
                className="group p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/50 text-left transition-all hover:bg-neutral-950 flex flex-col justify-between"
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-xs text-white group-hover:text-amber-400 transition-colors truncate">
                    {area.name}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1.5 line-clamp-1">
                  {area.popularDestinations?.[0] || area.description || ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: CORPORATE ACCOUNT & ROADSHOW CALLOUT */}
        {/* ============================================================ */}
        <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/50 border border-amber-500/30 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Building size={14} />
              <span>Corporate Accounts & Executive Roadshows</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Streamline Your Enterprise Travel Management
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Open a direct corporate billing account with AvaLimo Houston for monthly invoicing, consolidated executive travel reporting, priority dispatch during high-demand events (CERAWeek, OTC, Super Bowl), and dedicated account managers.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-300">
              <div className="flex items-center space-x-1.5">
                <CheckCircle size={14} className="text-amber-500" />
                <span>Monthly Itemized Invoicing</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle size={14} className="text-amber-500" />
                <span>Dedicated VIP Dispatcher</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle size={14} className="text-amber-500" />
                <span>Corporate Volume Discounts</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto flex-shrink-0">
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 px-8 rounded-xl text-xs tracking-widest uppercase transition-all text-center shadow-lg"
            >
              Call Corporate Desk: {COMPANY_INFO.phone}
            </a>
            <a
              href={`mailto:${COMPANY_INFO.email}?subject=Corporate%20Account%20Inquiry%20-%20AvaLimo`}
              className="bg-neutral-800 hover:bg-neutral-700 text-gray-200 font-semibold py-3.5 px-8 rounded-xl text-xs tracking-widest uppercase transition-all text-center border border-neutral-700"
            >
              Email Corporate Support
            </a>
          </div>
        </div>

      </div>

      {/* Leave Google Review Modal */}
      <LeaveGoogleReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={handleReviewCreated}
      />
    </section>
  );
};

export default TestimonialsAndAreas;
