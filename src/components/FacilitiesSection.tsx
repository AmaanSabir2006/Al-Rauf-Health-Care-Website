"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  HeartPulse,
  Pill,
  Sparkles,
  CheckCircle2,
  Building2,
  Stethoscope,
  Clock,
  Activity,
  Maximize2,
  X,
  ChevronRight,
  Eye,
  Check,
} from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";
import WhatsAppAvatar from "@/components/WhatsAppAvatar";

interface FacilityItem {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  aspectRatio: string;
  description: string;
  specs: {
    label: string;
    value: string;
  }[];
  highlights: string[];
}

const FACILITIES_DATA: FacilityItem[] = [
  {
    id: "short-stay",
    tabLabel: "Short Stay Ward",
    badge: "Clinical Observation Bay",
    title: "Short Stay Center & Observation Ward",
    subtitle: "Sterile medical observation beds for acute stabilization and therapy",
    image: "/images/clinic-ward-v2.jpg",
    aspectRatio: "aspect-4/3",
    description:
      "A dedicated clinical observation bay equipped with adjustable hospital beds, mobile electronic vital-sign monitoring, IV fluid infusion poles, and dedicated clinical attendance. Ideal for patients requiring short-term recovery, glucose stabilization, intravenous medications, or post-procedure monitoring.",
    specs: [
      { label: "Beds", value: "Adjustable Hospital Recovery Beds" },
      { label: "Infusion", value: "Dual IV Fluid & Medication Stands" },
      { label: "Monitoring", value: "Pulse Oximetry & Digital Vitals" },
      { label: "Sanitization", value: "Strict Sterility Protocols" },
    ],
    highlights: [
      "Immediate clinical stabilization for acute diabetes or hypertension episodes",
      "Clean clinical bed linen with sterile procedure steps",
      "Dedicated nursing and medical assistant oversight during stay",
      "Quiet, secluded room environment away from reception traffic",
    ],
  },
  {
    id: "facade",
    tabLabel: "Clinic Exterior",
    badge: "347- Riwaz Garden, Lahore",
    title: "Clinic Building Exterior & Easy Access",
    subtitle: "Neoclassical white facade with illuminated entrance and convenient parking",
    image: "/images/clinic-facade-v2.jpg",
    aspectRatio: "aspect-4/3",
    description:
      "Centrally situated at 347- Riwaz Garden, Lahore (near Chauburji Chowk). The clinic features a distinctive neoclassical white architectural facade with the official AHC emblem, wide access steps with sturdy handrails, evening illumination, and dedicated motorcycle and vehicle parking right at the entrance.",
    specs: [
      { label: "Landmark", value: "347- Riwaz Garden (Near Chauburji)" },
      { label: "Architecture", value: "Neoclassical White Facade (AHC)" },
      { label: "Accessibility", value: "Handrail Steps & Drop-off Area" },
      { label: "Parking", value: "Front Motorcycle & Car Parking" },
    ],
    highlights: [
      "Instantly recognizable building with prominent illuminated signage",
      "Safe and well-lit exterior for evening consultations (4:00 PM – 9:00 PM)",
      "Minutes away from Chauburji Metro Bus Station and Lower Mall",
      "Dedicated reception staff to assist elderly patients from vehicles",
    ],
  },
  {
    id: "pharmacy",
    tabLabel: "In-House Pharmacy",
    badge: "Accredited Dispensary",
    title: "Accredited In-House Pharmacy Station",
    subtitle: "Genuine, temperature-controlled medicines and certified dispensing",
    image: "/images/clinic-pharmacy-v2.jpg",
    aspectRatio: "aspect-4/3",
    description:
      "A fully licensed on-site pharmacy counter managed by qualified staff. Stocked with genuine, temperature-regulated endocrine therapies, insulin formulations, chronic disease medications, and acute prescriptions so patients can collect their verified medicines immediately following their doctor consultation.",
    specs: [
      { label: "Authenticity", value: "100% Genuine Certified Stocks" },
      { label: "Storage", value: "Temperature-Controlled Refrigeration" },
      { label: "Specialty", value: "Endocrine & Diabetes Supplies" },
      { label: "Safety", value: "Protective Glass Counter & Sanitizer" },
    ],
    highlights: [
      "Immediate dispensing right after Prof. Dr. Muhammad Kamran Rauf's consultation",
      "Full inventory of insulin pens, glucometer strips, and thyroid therapies",
      "Transparent pricing with genuine manufacturer batch verification",
      "Patient medication counseling on dosages and storage instructions",
    ],
  },
  {
    id: "waiting-area",
    tabLabel: "Waiting Lounge",
    badge: "Patient Comfort & Dignity",
    title: "Air-Conditioned Patient Waiting Lounge",
    subtitle: "Calm, uncrowded family reception hall with individual leather seating",
    image: "/images/clinic-waiting-area-v2.jpg",
    aspectRatio: "aspect-4/3",
    description:
      "A serene and spacious outpatient waiting area designed to eliminate clinical anxiety. Furnished with comfortable individual leather armchairs, quiet ambient lighting, and topiary plants, ensuring patients and their families wait in a clean, air-conditioned, and dignified environment without crowded corridors.",
    specs: [
      { label: "Environment", value: "Fully Air Conditioned" },
      { label: "Seating", value: "Plush Leather Armchairs" },
      { label: "Capacity", value: "Dedicated Family Seating" },
      { label: "Hygiene", value: "Daily Sanitized Tiled Floors" },
    ],
    highlights: [
      "Zero-wait scheduling prevents crowded reception congestion",
      "Comfortable separate seating for women, elderly, and family members",
      "Dedicated reception desk with rapid token verification",
      "Calm, respectful atmosphere with gentle decor and cooling",
    ],
  },
  {
    id: "endoscopy",
    tabLabel: "Endoscopy Suite",
    badge: "Specialized Diagnostics",
    title: "Endoscopy & Diagnostic Procedure Room",
    subtitle: "High-definition video endoscopy tower and procedural examination bed",
    image: "/images/clinic-endoscopy-v2.jpg",
    aspectRatio: "aspect-4/3",
    description:
      "A specialized procedure suite outfitted with a high-definition medical endoscopy video processor and monitor tower, specialized procedural stretcher with adjustable incline, emergency oxygen cylinders, and sterile instrument reprocessing station for comprehensive gastrointestinal diagnostic care.",
    specs: [
      { label: "Equipment", value: "High-Definition Video Endoscopy Tower" },
      { label: "Stretcher", value: "Multi-Position Procedural Examination Bed" },
      { label: "Safety", value: "Continuous Oxygen & Suction Facilities" },
      { label: "Quality", value: "International Reprocessing Standards" },
    ],
    highlights: [
      "Advanced diagnostic evaluation of gastrointestinal and abdominal symptoms",
      "High-resolution imaging display for clinical precision",
      "Dedicated procedure bed with patient safety rails and positioning",
      "Hospital-grade sterilization of scopes and diagnostic accessories",
    ],
  },
];

export default function FacilitiesSection() {
  const [activeFacilityId, setActiveFacilityId] = useState<string>("short-stay");
  const [modalImage, setModalImage] = useState<{ src: string; title: string; badge: string } | null>(null);

  const activeFacility =
    FACILITIES_DATA.find((f) => f.id === activeFacilityId) || FACILITIES_DATA[0];

  return (
    <section
      id="about-facilities"
      className="py-16 sm:py-20 bg-slate-50 relative overflow-hidden scroll-mt-24 lg:scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1: Lead Physician Spotlight */}
        <div className="glass-panel bg-white/95 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Physician Profile Card (WhatsApp Avatar) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl max-w-sm mx-auto border-4 border-white bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                {/* Lead Doctor Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                  <Award className="w-3.5 h-3.5 text-teal-400" />
                  <span>Lead Consultant & Founder</span>
                </div>

                {/* Physician Photo */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-2xl ring-4 ring-teal-400/40 overflow-hidden bg-slate-800 shrink-0 mb-4">
                  <Image
                    src="/images/dr-kamran-rauf.jpg"
                    alt="Prof. Dr. Muhammad Kamran Rauf"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>

                {/* Physician Details */}
                <div className="text-white space-y-1 w-full">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PMDC # 42337-P</span>
                    <span className="text-slate-500">•</span>
                    <span>18+ Yrs Exp</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {CLINIC_INFO.leadPhysician}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block pt-0.5">
                    Consultant Physician & Endocrinologist
                  </span>
                  <p className="text-xs text-slate-300 font-medium pt-1">
                    {CLINIC_INFO.leadPhysicianDegrees}
                  </p>
                  <p className="text-[11px] text-teal-300 font-semibold pt-0.5">
                    {CLINIC_INFO.leadPhysicianDesignation}
                  </p>
                </div>
              </div>
            </div>

            {/* Physician Narrative */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase">
                <Award className="w-3.5 h-3.5 text-teal-600" />
                <span>Physician Profile & Clinical Leadership</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Dedicated to Patient-First Healthcare & Modern Evidence-Based Practice
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                With more than 18 years of distinguished clinical experience,{" "}
                <strong>Prof. Dr. Muhammad Kamran Rauf</strong> (Professor of Medicine,
                Fatima Memorial Hospital) established <strong>Al Rauf Health Care</strong> at 347-
                Riwaz Garden, Lahore to provide compassionate outpatient consultations, specialized
                endocrinology & diabetes care, and structured 20-minute scheduling.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-700 pt-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Academic Faculty:</strong> Professor of Medicine at Fatima Memorial Hospital.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Specialist Credentials:</strong> FCPS (Medicine), MRCP-SCE (UK), EBEEDM (RCP-Ireland).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Endocrinology & Diabetes:</strong> Diabetes (Type 1 & 2), Thyroid disorders, Metabolic Care.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>PMDC Registered:</strong> License PMDC # 42337-P with full clinical accreditation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Real Clinic Facilities & Interactive Department Tour */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Clinic Facilities · 347- Riwaz Garden</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tour Our Clinical Infrastructure & Diagnostic Suites
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Explore authentic photographs of our sterile procedure rooms, air-conditioned waiting
              lounge, in-house pharmacy, and short-stay recovery beds.
            </p>
          </div>

          {/* Department Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {FACILITIES_DATA.map((fac) => {
              const isSelected = activeFacilityId === fac.id;
              return (
                <button
                  key={fac.id}
                  suppressHydrationWarning
                  onClick={() => setActiveFacilityId(fac.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border shadow-2xs ${
                    isSelected
                      ? "bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20 scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-teal-700"
                  }`}
                >
                  <span>{fac.tabLabel}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Display Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column: Real Facility Photograph */}
              <div className="lg:col-span-7">
                <div className="relative group rounded-2xl overflow-hidden border-4 border-slate-100 shadow-xl bg-slate-900 aspect-4/3 sm:aspect-16/10">
                  <Image
                    src={activeFacility.image}
                    alt={activeFacility.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-800/90 text-teal-100 backdrop-blur-md shadow-sm border border-teal-600/40">
                      {activeFacility.badge}
                    </span>
                  </div>

                  {/* Zoom Action Button */}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() =>
                      setModalImage({
                        src: activeFacility.image,
                        title: activeFacility.title,
                        badge: activeFacility.badge,
                      })
                    }
                    className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/80 hover:bg-teal-700 text-white backdrop-blur-md transition-all shadow-md cursor-pointer group/btn"
                    title="Click to view full photo"
                  >
                    <Maximize2 className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                  </button>

                  {/* Bottom Caption */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-lg font-black tracking-tight">{activeFacility.title}</p>
                    <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                      {activeFacility.subtitle}
                    </p>
                  </div>
                </div>

                {/* Thumbnail Strip for Fast Switching */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-4">
                  {FACILITIES_DATA.map((fac) => {
                    const isSelected = activeFacilityId === fac.id;
                    return (
                      <button
                        key={fac.id}
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setActiveFacilityId(fac.id)}
                        className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-teal-600 ring-2 ring-teal-500/40 scale-105 shadow-md"
                            : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                        }`}
                        title={fac.tabLabel}
                      >
                        <Image
                          src={fac.image}
                          alt={fac.tabLabel}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Facility Specifications & Capabilities */}
              <div className="lg:col-span-5 space-y-5 text-left">
                <div>
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    {activeFacility.badge}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {activeFacility.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                    {activeFacility.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeFacility.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  {activeFacility.specs.map((spec, i) => (
                    <div key={i} className="space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
                        {spec.label}
                      </span>
                      <span className="font-extrabold text-slate-800 block text-xs">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Highlights List */}
                <div className="space-y-2 pt-1">
                  {activeFacility.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <a
                    href="#booking-section"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    <span>Book In-Person Consultation</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Department Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4">
            {FACILITIES_DATA.map((fac) => (
              <div
                key={fac.id}
                onClick={() => setActiveFacilityId(fac.id)}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer group ${
                  activeFacilityId === fac.id
                    ? "border-teal-500 shadow-md ring-1 ring-teal-500/30"
                    : "border-slate-200 hover:border-teal-300 hover:shadow-sm"
                }`}
              >
                <div className="relative rounded-xl overflow-hidden aspect-16/10 mb-3 bg-slate-100">
                  <Image
                    src={fac.image}
                    alt={fac.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-900/80 text-white backdrop-blur-xs">
                      {fac.tabLabel}
                    </span>
                  </div>
                </div>
                <h5 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-teal-700 transition-colors line-clamp-1">
                  {fac.title}
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {fac.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox / High-Resolution Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 text-white">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                  {modalImage.badge}
                </span>
                <h4 className="text-base sm:text-lg font-extrabold">{modalImage.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-black">
              <Image
                src={modalImage.src}
                alt={modalImage.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Al Rauf Health Care · 347- Riwaz Garden, Lahore</span>
              <span className="text-teal-400 font-semibold">Verified Clinical Facility</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
