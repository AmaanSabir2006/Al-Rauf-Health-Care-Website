"use client";

import Link from "next/link";
import { Home, Calendar, Phone, ArrowLeft, Stethoscope } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black shadow-md">
            <Stethoscope className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">
              {CLINIC_INFO.name}
            </h1>
            <p className="text-[11px] text-slate-500">{CLINIC_INFO.leadPhysician}</p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-teal-50 border-2 border-teal-200 text-teal-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span className="text-3xl font-black">404</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The clinic resource or page you requested could not be located. You can return to our main booking schedule below.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>

          <Link
            href="/#booking-section"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Consultation</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
          Need immediate assistance? Call clinic desk:{" "}
          <a href={`tel:${CLINIC_INFO.appointmentCallRaw}`} className="font-bold text-slate-800 hover:underline">
            {CLINIC_INFO.appointmentCall}
          </a>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 pt-4">
        &copy; 2026 {CLINIC_INFO.name}. 347- Riwaz Garden, Lahore.
      </footer>
    </div>
  );
}
