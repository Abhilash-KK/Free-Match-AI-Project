import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  MessageCircle, 
  Code2, 
  Clock, 
  SlidersHorizontal, 
  ArrowUpDown, 
  FolderKanban,
  Award,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { getInitials } from '../utils/avatarUtils';

/**
 * ClientReviewsView Component
 * 
 * Dedicated Client Reviews & Ratings Dashboard for Freelancers.
 * Displays overall ratings, rating breakdown, filterable/sortable client feedback cards,
 * and project context for completed deliverables.
 */
export default function ClientReviewsView({
  userSession = null,
  freelancerData = {},
  reviews = [],
  isDark = false,
  onNavigateToProjects = () => {}
}) {
  const authUsername = userSession?.user_id || userSession?.username || freelancerData.user_id || freelancerData.username || 'alexmercer';
  const freelancerName = userSession?.name || freelancerData.name || authUsername;

  const [fetchedReviews, setFetchedReviews] = useState([]);
  const [filterStar, setFilterStar] = useState('all'); // 'all' | '5' | '4' | '3_below'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest' | 'lowest'

  // 1. Load reviews dynamically from API and LocalStorage
  const loadReviewsData = useCallback(async () => {
    let combined = Array.isArray(reviews) ? [...reviews] : [];

    // 1. Fetch from backend REST API with user ID query
    try {
      const resUser = await fetch(`http://localhost:8000/api/reviews/?freelancer=${encodeURIComponent(authUsername)}`);
      if (resUser.ok) {
        const apiData = await resUser.json();
        if (Array.isArray(apiData)) combined = [...combined, ...apiData];
      }
    } catch (e) {}

    // 2. Fetch from backend REST API with display name query
    if (freelancerName && freelancerName !== authUsername) {
      try {
        const resName = await fetch(`http://localhost:8000/api/reviews/?freelancer=${encodeURIComponent(freelancerName)}`);
        if (resName.ok) {
          const apiData = await resName.json();
          if (Array.isArray(apiData)) combined = [...combined, ...apiData];
        }
      } catch (e) {}
    }

    // 3. Fallback: Fetch all reviews endpoint
    try {
      const resAll = await fetch(`http://localhost:8000/api/reviews/`);
      if (resAll.ok) {
        const apiData = await resAll.json();
        if (Array.isArray(apiData)) combined = [...combined, ...apiData];
      }
    } catch (e) {}

    // 4. Scan LocalStorage for client-submitted reviews
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('reviews') || key.includes('freematch'))) {
          try {
            const parsed = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(parsed)) {
              parsed.forEach(item => {
                if (item && item.reviewee && (item.comment || item.rating)) {
                  combined.push(item);
                }
              });
            }
          } catch (err) {}
        }
      }
    } catch (e) {}

    // Deduplicate by unique key
    const uniqueMap = new Map();
    combined.forEach(r => {
      if (!r) return;
      const key = r.id || `${r.reviewer}_${r.reviewee}_${r.projectTitle || r.project_title}_${r.comment}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, r);
      }
    });

    setFetchedReviews(Array.from(uniqueMap.values()));
  }, [reviews, authUsername, freelancerName]);

  useEffect(() => {
    loadReviewsData();
    const handleSync = () => loadReviewsData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('freematch_review_submitted', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('freematch_review_submitted', handleSync);
    };
  }, [loadReviewsData]);

  // 2. Data Isolation Filter for current freelancer
  const liveReviews = fetchedReviews.filter(r => {
    if (!r || !r.reviewee) return false;
    const target = String(r.reviewee).toLowerCase().trim().replace(/\s+/g, '');
    const cleanName = String(freelancerName).toLowerCase().trim().replace(/\s+/g, '');
    const cleanUser = String(authUsername).toLowerCase().trim().replace(/\s+/g, '');

    if (!cleanName && !cleanUser) return false;

    const matchesName = cleanName && (target === cleanName || target.includes(cleanName) || cleanName.includes(target));
    const matchesUser = cleanUser && (target === cleanUser || target.includes(cleanUser) || cleanUser.includes(target));
    const firstName = cleanName.split(' ')[0];
    const firstUser = cleanUser.split('@')[0].split('.')[0];
    const matchesFirstName = firstName && firstName.length > 2 && target.includes(firstName.toLowerCase());
    const matchesFirstUser = firstUser && firstUser.length > 2 && target.includes(firstUser.toLowerCase());

    return matchesName || matchesUser || matchesFirstName || matchesFirstUser;
  });

  const totalReviews = liveReviews.length;
  const hasReviews = totalReviews > 0;

  // Calculate Average Rating
  const avgRatingNumber = hasReviews
    ? liveReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviews
    : 0;
  const avgRating = hasReviews ? avgRatingNumber.toFixed(1) : null;

  // Rating Distribution Counts
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  liveReviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  const getPercentage = (starCount) => {
    if (!totalReviews) return 0;
    return Math.round((starCount / totalReviews) * 100);
  };

  // Filter & Sort Processing
  let displayedReviews = [...liveReviews];

  if (filterStar === '5') {
    displayedReviews = displayedReviews.filter(r => Math.round(Number(r.rating || 5)) === 5);
  } else if (filterStar === '4') {
    displayedReviews = displayedReviews.filter(r => Math.round(Number(r.rating || 5)) === 4);
  } else if (filterStar === '3_below') {
    displayedReviews = displayedReviews.filter(r => Math.round(Number(r.rating || 5)) <= 3);
  }

  if (sortBy === 'highest') {
    displayedReviews.sort((a, b) => Number(b.rating || 5) - Number(a.rating || 5));
  } else if (sortBy === 'lowest') {
    displayedReviews.sort((a, b) => Number(a.rating || 5) - Number(b.rating || 5));
  } else {
    // Newest default
    displayedReviews.sort((a, b) => (new Date(b.date || b.created_at || 0)) - (new Date(a.date || a.created_at || 0)));
  }

  // Theme styling helpers
  const containerBg = isDark ? 'bg-[#040919] text-white' : 'bg-slate-50/60 text-slate-900';
  const cardBg = isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs';
  const subCardBg = isDark ? 'bg-[#040919] border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700';

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 transition-colors ${containerBg}`}>
      
      {/* --------------------------------------------------------------------------- */}
      {/* 1. DEDICATED PAGE HEADER */}
      {/* --------------------------------------------------------------------------- */}
      <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isDark ? 'bg-gradient-to-r from-amber-950/20 via-[#060e22] to-[#040919] border-amber-500/30' : 'bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-white border-amber-200 shadow-xs'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Client Reviews & Ratings</h1>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                View verified feedback from clients based on your completed projects and performance.
              </p>
            </div>
          </div>
        </div>

        {hasReviews && (
          <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl self-start md:self-auto shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xl">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-500">Overall Rating</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-amber-500">⭐ {avgRating}</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">/ 5.0</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">Based on {totalReviews} verified review{totalReviews > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* EMPTY STATE (IF NO REVIEWS EXIST) */}
      {/* --------------------------------------------------------------------------- */}
      {!hasReviews ? (
        <div className={`p-12 text-center rounded-3xl border space-y-4 ${cardBg}`}>
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">No client reviews yet.</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium max-w-md mx-auto">
              Complete projects and receive client feedback to build your reputation.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={onNavigateToProjects}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <FolderKanban className="w-4 h-4 mr-1" />
              <span>View Completed Projects</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* --------------------------------------------------------------------------- */}
          {/* 2. SUMMARY CARDS ROW */}
          {/* --------------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Overall Rating */}
            <div className={`p-5 rounded-2xl border flex items-start justify-between ${cardBg}`}>
              <div>
                <p className="text-xs font-extrabold text-amber-500 uppercase tracking-wider">OVERALL RATING</p>
                <p className="text-3xl font-black text-amber-500 mt-1">⭐ {avgRating} <span className={`text-xs font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>/ 5.0</span></p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-700 font-semibold'}`}>Average rating score</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 font-bold">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
            </div>

            {/* Card 2: Total Reviews */}
            <div className={`p-5 rounded-2xl border flex items-start justify-between ${cardBg}`}>
              <div>
                <p className="text-xs font-extrabold text-blue-500 uppercase tracking-wider">TOTAL REVIEWS</p>
                <p className="text-3xl font-black text-blue-500 mt-1">{totalReviews}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-700 font-semibold'}`}>Client reviews received</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Verified Reviews */}
            <div className={`p-5 rounded-2xl border flex items-start justify-between ${cardBg}`}>
              <div>
                <p className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">VERIFIED REVIEWS</p>
                <p className="text-3xl font-black text-emerald-500 mt-1">{totalReviews}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-700 font-semibold'}`}>Completed deliverables</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Job Success Rate */}
            <div className={`p-5 rounded-2xl border flex items-start justify-between ${cardBg}`}>
              <div>
                <p className="text-xs font-extrabold text-purple-500 uppercase tracking-wider">JOB SUCCESS RATE</p>
                <p className="text-3xl font-black text-purple-500 mt-1">100%</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-700 font-semibold'}`}>On-time client delivery</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0 font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------------- */}
          {/* 3. VISUAL RATING BREAKDOWN */}
          {/* --------------------------------------------------------------------------- */}
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
            <div className="border-b border-slate-200 dark:border-slate-800/60 pb-3">
              <h3 className="text-lg font-extrabold tracking-tight">Rating Breakdown</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Distribution of client ratings across all completed projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Overall Score Box */}
              <div className={`p-6 rounded-2xl border text-center space-y-2 ${subCardBg}`}>
                <span className="text-5xl font-black text-amber-500 block">⭐ {avgRating}</span>
                <div className="flex items-center justify-center space-x-1 text-amber-400 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.round(avgRatingNumber) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider">
                  Based on {totalReviews} Verified Client Review{totalReviews > 1 ? 's' : ''}
                </p>
              </div>

              {/* Star Bars Breakdown */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star] || 0;
                  const pct = getPercentage(count);
                  return (
                    <div key={star} className="flex items-center space-x-3 text-xs font-semibold">
                      <span className={`w-14 font-extrabold flex items-center ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                        {star} Stars
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className={`w-16 text-right font-extrabold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------------- */}
          {/* 4. FILTERS & SORTING TOOLBAR */}
          {/* --------------------------------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-extrabold uppercase tracking-wider mr-1 flex items-center ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1" /> Filter:
              </span>
              {[
                { key: 'all', label: `All Reviews (${totalReviews})` },
                { key: '5', label: `5 Stars (${ratingCounts[5]})` },
                { key: '4', label: `4 Stars (${ratingCounts[4]})` },
                { key: '3_below', label: `3 Stars & Below (${ratingCounts[3] + ratingCounts[2] + ratingCounts[1]})` }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterStar(f.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                    filterStar === f.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* --------------------------------------------------------------------------- */}
          {/* 5. CLIENT REVIEWS LIST */}
          {/* --------------------------------------------------------------------------- */}
          <div className="space-y-4">
            {displayedReviews.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border ${cardBg}`}>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No reviews found matching the selected filter.</p>
              </div>
            ) : (
              displayedReviews.map((rv, idx) => (
                <div key={rv.id || idx} className={`p-6 sm:p-7 rounded-3xl border space-y-4 transition-all hover:border-amber-500/40 ${cardBg}`}>
                  {/* Card Header: Client Info & Star Rating */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/60 pb-4">
                    <div className="flex items-center space-x-3.5">
                      {rv.reviewerAvatar ? (
                        <img src={rv.reviewerAvatar} alt={rv.reviewer} className="w-11 h-11 rounded-2xl object-cover border border-amber-500/30" />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-500 font-black text-sm flex items-center justify-center shrink-0">
                          {getInitials(rv.reviewer || 'Client')}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">{rv.reviewer || 'Verified Client'}</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 mr-0.5 text-emerald-500" />
                            <span>Verified Client Review</span>
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          Project: <span className="font-black text-blue-600 dark:text-blue-400">{rv.projectTitle || rv.project_title || 'Completed Deliverable'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <div className="flex items-center text-amber-400">
                        {[...Array(Math.min(5, Math.max(1, Math.round(Number(rv.rating || 5)))))].map((_, i) => (
                          <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-sm font-black text-amber-500">⭐ {Number(rv.rating || 5).toFixed(1)} / 5.0</span>
                      {rv.date && <span className={`text-xs font-black ml-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>({rv.date})</span>}
                    </div>
                  </div>

                  {/* Detailed Performance Metrics breakdown (high contrast text) */}
                  {(rv.comm || rv.code || rv.deadline) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 text-sm font-semibold">
                      {rv.comm && (
                        <div className="flex items-center space-x-1.5">
                          <MessageCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-slate-900 dark:text-slate-100 font-extrabold">Communication: <span className="text-amber-600 dark:text-amber-400 font-black">{rv.comm}/5 ★</span></span>
                        </div>
                      )}
                      {rv.code && (
                        <div className="flex items-center space-x-1.5">
                          <Code2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-slate-900 dark:text-slate-100 font-extrabold">Work Quality: <span className="text-amber-600 dark:text-amber-400 font-black">{rv.code}/5 ★</span></span>
                        </div>
                      )}
                      {rv.deadline && (
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-slate-900 dark:text-slate-100 font-extrabold">Deadline Adherence: <span className="text-amber-600 dark:text-amber-400 font-black">{rv.deadline}/5 ★</span></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Written Review Comment with crisp readable text */}
                  <p className={`text-sm sm:text-base italic p-4 rounded-2xl border font-semibold leading-relaxed ${
                    isDark 
                      ? 'border-amber-500/30 bg-amber-950/20 text-slate-100' 
                      : 'border-amber-300 bg-amber-50/90 text-slate-900 shadow-2xs'
                  }`}>
                    "{rv.comment}"
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}

    </div>
  );
}
