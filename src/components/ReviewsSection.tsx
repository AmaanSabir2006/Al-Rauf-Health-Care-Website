"use client";

import { Star, CheckCircle2, ExternalLink } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

export default function ReviewsSection() {
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
        <div className="text-center max-w-3xl mx-auto">
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
          <div className="mt-8 p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto text-left">
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
      </div>
    </section>
  );
}
