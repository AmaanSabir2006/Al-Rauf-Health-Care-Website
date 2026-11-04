"use client";

import Image from "next/image";
import {
  Calendar,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

interface HeroSectionProps {
  onBookClick?: () => void;
  onExploreDoctorsClick?: () => void;
}

export default function HeroSection({
  onBookClick,
  onExploreDoctorsClick,
}: HeroSectionProps) {
  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-medical-grid scroll-mt-24 lg:scroll-mt-28">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-teal-100/70 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-emerald-100/60 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-sky-100/60 rounded-full blur-2xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Expert Clinical Care &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600">
                Seamless Digital
              </span>{" "}
              Appointment Scheduling
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Led by <strong className="text-slate-900 font-extrabold">{CLINIC_INFO.leadPhysician}</strong>, {CLINIC_INFO.leadPhysicianDesignation}, our specialized medical center at {CLINIC_INFO.address} provides structured outpatient consultation appointments. Expert endocrinology, diabetes care, and internal medicine with instant verification on WhatsApp.
            </p>

            {/* Doctor Specific Consultation Hours Notice Card */}
            <div className="w-full max-w-xl p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start sm:items-center gap-3 text-xs text-teal-950 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-teal-900">
                  Prof. Dr. Muhammad Kamran Rauf Consultation Hours:
                </p>
                <p className="text-teal-800 mt-0.5">
                  <strong>Monday to Friday:</strong> 4:00 PM – 9:00 PM &nbsp;|&nbsp; <strong>Saturday:</strong> 1:00 PM – 6:00 PM &nbsp;|&nbsp; <strong>Sunday:</strong> OFF
                </p>
              </div>
            </div>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-sm text-slate-700 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Structured Consultation Slots</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct Meezan Bank Transfer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3 PMDC Verified Specialists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>WhatsApp Token Confirmation</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              <a
                href="#booking-section"
                onClick={(e) => {
                  e.preventDefault();
                  onBookClick ? onBookClick() : document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 shadow-lg shadow-teal-700/25 hover:shadow-xl hover:-translate-y-0.5 transition-all group cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-teal-100" />
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 text-teal-200 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#specialists"
                onClick={(e) => {
                  e.preventDefault();
                  onExploreDoctorsClick ? onExploreDoctorsClick() : document.getElementById("specialists")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-base text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Users className="w-5 h-5 text-teal-700" />
                <span>View All 3 Doctors</span>
              </a>
            </div>
          </div>

          {/* Right Image Column - Perfectly aligned clean 3:4 architectural photo without text overlays */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[390px] xl:max-w-[420px]">
              {/* Outer Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur-lg opacity-25"></div>

              {/* Main Clinic Facade Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-[3/4]">
                <Image
                  src="/images/clinic-facade-v3.jpg"
                  alt="Al Rauf Health Care Building Exterior - 347- Riwaz Garden Lahore (Prof. Dr. Muhammad Kamran Rauf)"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-center"
                  priority
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
