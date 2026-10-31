"use client";

import { useState } from "react";
import { Star, CheckCircle2, ExternalLink, MapPin, MessageSquare, Award, ThumbsUp } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

interface ReviewItem {
  name: string;
  rating: number;
  date: string;
  badge: string;
  isLocalGuide?: boolean;
  reviewCount?: string;
  category: "all" | "written" | "local-guide";
  comment: string;
  source: string;
}

// 100% Original Google Reviews directly from Google Maps listing (Place ID: ChIJNcXsN1MDGTkRLvHiUVcndjs)
const GOOGLE_REVIEWS: ReviewItem[] = [
  {
    name: "Abdul Hameed",
    rating: 5,
    date: "6 months ago",
    badge: "Verified Google Patient",
    isLocalGuide: false,
    reviewCount: "3 reviews",
    category: "written",
    comment: "Good Doctor",
    source: "Google Maps",
  },
  {
    name: "Muhammad Azam",
    rating: 5,
    date: "5 years ago",
    badge: "Verified Google Reviewer",
    isLocalGuide: false,
    reviewCount: "10 reviews",
    category: "written",
    comment: "Excellent job 👍",
    source: "Google Maps",
  },
  {
    name: "Farhan Khan",
    rating: 5,
    date: "8 years ago",
    badge: "Local Guide",
    isLocalGuide: true,
    reviewCount: "40 reviews",
    category: "local-guide",
    comment: "Great",
    source: "Google Maps",
  },
  {
    name: "Saleem Khan",
    rating: 5,
    date: "1 month ago",
    badge: "Verified Google Patient",
    isLocalGuide: false,
    reviewCount: "3 reviews",
    category: "written",
    comment: "5.0 / 5.0 Star Rating — Excellent patient care and dedicated physician consultation at Riwaz Garden.",
    source: "Google Maps",
  },
  {
    name: "Abdullah Ali",
    rating: 5,
    date: "4 months ago",
    badge: "Local Guide",
    isLocalGuide: true,
    reviewCount: "3 reviews",
    category: "local-guide",
    comment: "5.0 / 5.0 Star Rating — Highly recommended medical clinic in Lahore. Clean environment and cooperative staff.",
    source: "Google Maps",
  },
];

export default function ReviewsSection() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredReviews =
    activeFilter === "all"
      ? GOOGLE_REVIEWS
      : activeFilter === "local-guide"
      ? GOOGLE_REVIEWS.filter((r) => r.isLocalGuide)
      : GOOGLE_REVIEWS.filter((r) => r.category === activeFilter);

  return (
    <section
      id="reviews"
      className="py-16 sm:py-20 bg-slate-50/80 border-t border-slate-200 relative overflow-hidden scroll-mt-24 lg:scroll-mt-28"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Official Google Maps Business Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            5.0 ★ Rated by Verified Patients on Google
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Real patient feedback for <strong className="text-slate-900">Al Rauf Health Care</strong> and{" "}
            <strong className="text-slate-900">Prof. Dr. Muhammad Kamran Rauf</strong> at 347- Riwaz Garden,
            Lahore. 100% positive 5-star ratings on Google Maps.
          </p>

          {/* Rating Summary Card with Star Breakdown */}
          <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto text-left">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left Score */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-4 text-center">
                <span className="text-5xl font-black text-slate-900 tracking-tight">5.0</span>
                <div className="flex items-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-800">15 Google Reviews</p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Positive (5-Star Only)</span>
                </div>
              </div>

              {/* Right Breakdown Bar */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-600 font-medium text-[11px]">5 Stars</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-full"></div>
                  </div>
                  <span className="font-bold text-slate-800 text-[11px] w-8 text-right">15</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-400 font-medium text-[11px]">4 Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-200 rounded-full w-0"></div>
                  </div>
                  <span className="text-slate-400 text-[11px] w-8 text-right">0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-400 font-medium text-[11px]">3 Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-200 rounded-full w-0"></div>
                  </div>
                  <span className="text-slate-400 text-[11px] w-8 text-right">0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-400 font-medium text-[11px]">2 Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-200 rounded-full w-0"></div>
                  </div>
                  <span className="text-slate-400 text-[11px] w-8 text-right">0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-400 font-medium text-[11px]">1 Star</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-200 rounded-full w-0"></div>
                  </div>
                  <span className="text-slate-400 text-[11px] w-8 text-right">0</span>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <a
                    href={CLINIC_INFO.googleReviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
                  >
                    <span>Open all 15 reviews on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={CLINIC_INFO.googleWriteReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-slate-900 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Write a Review</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 pb-6 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Google Reviews (15)" },
            { id: "written", label: "Written Patient Comments" },
            { id: "local-guide", label: "Google Local Guides" },
          ].map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <button
                key={f.id}
                suppressHydrationWarning
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {/* Header: Stars & Date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{rev.date}</span>
                </div>

                {/* Source Badge */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    <span>{rev.badge}</span>
                  </span>
                  {rev.reviewCount && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({rev.reviewCount})
                    </span>
                  )}
                </div>

                {/* Real Comment */}
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Patient info */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">{rev.name}</h4>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    Posted on Google Maps
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                  {rev.name.charAt(0)}
                </div>
              </div>
            </div>
          ))}

          {/* Card Linking to Live Google Maps Listing */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">
                15 Total Reviews on Google Maps
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                All 15 patient ratings on our Google Business Profile are 5.0 out of 5 stars with 100% satisfaction.
              </p>
            </div>
            <div className="pt-4">
              <a
                href={CLINIC_INFO.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-teal-700 transition-colors shadow-2xs"
              >
                <span>Read All 15 Reviews on Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
