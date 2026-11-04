"use client";

import { useState } from "react";
import Image from "next/image";
import WhatsAppAvatar from "@/components/WhatsAppAvatar";
import {
  Stethoscope,
  HeartPulse,
  Baby,
  Activity,
  Bone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkle,
  Compass,
} from "lucide-react";
import { CLINIC_DOCTORS } from "@/lib/constants";
import { Doctor } from "@/lib/types";

interface SymptomTriageProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

interface TriageOption {
  id: string;
  symptom: string;
  description: string;
  doctorId: string;
  category: string;
  icon: any;
}

const TRIAGE_OPTIONS: TriageOption[] = [
  {
    id: "diabetes-endocrinology",
    symptom: "Diabetes, Hormones, Metabolic & Internal Medicine",
    description: "Diabetes (HbA1c), thyroid, PCOS, obesity, pituitary & adrenal disorders, gastric issues, infections, tuberculosis, or hypertension.",
    doctorId: "doc-kamran-rauf",
    category: "Endocrinology & Diabetes",
    icon: Stethoscope,
  },
  {
    id: "radiology-ultrasound",
    symptom: "Ultrasound Scans & Diagnostic Radiology",
    description: "Clinical ultrasound, Carotid Doppler, abdominal & pelvic imaging, renal Doppler, and diagnostic radiology reviews.",
    doctorId: "doc-asma-kamran",
    category: "Diagnostic Radiology",
    icon: Activity,
  },
  {
    id: "urology-andrology",
    symptom: "Kidney, Prostate, Urinary & Men's Health",
    description: "Kidney stones, urinary symptoms, prostate care, andrology, male reproductive health, and sexual medicine.",
    doctorId: "doc-arslan-mir",
    category: "Urology & Andrology",
    icon: HeartPulse,
  },
];

export default function SymptomTriage({ onSelectDoctor }: SymptomTriageProps) {
  const [selectedTriageId, setSelectedTriageId] = useState<string>("diabetes-endocrinology");

  const currentOption = TRIAGE_OPTIONS.find((opt) => opt.id === selectedTriageId) || TRIAGE_OPTIONS[0];
  const matchedDoctor = CLINIC_DOCTORS.find((doc) => doc.id === currentOption.doctorId) || CLINIC_DOCTORS[0];

  const handleSelect = (doctor: Doctor) => {
    onSelectDoctor(doctor);
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", "#booking-section");
    }
  };

  return (
    <section id="triage" className="py-12 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/80 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                <span>Instant Clinical Triage Assistant</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Not sure which specialist to consult? Select your health condition:
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Our smart finder matches your symptoms directly with the right consultant at 347- Riwaz Garden, Lahore.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50/80 px-3.5 py-2 rounded-xl border border-teal-200">
              <Sparkle className="w-4 h-4 text-teal-600 animate-spin" style={{ animationDuration: "8s" }} />
              <span>Structured Consultation Slots</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
            {/* Left Symptom Selector Chips */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TRIAGE_OPTIONS.map((opt) => {
                const isSelected = opt.id === selectedTriageId;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setSelectedTriageId(opt.id)}
                    className={`p-3.5 rounded-2xl text-left transition-all border flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/30 shadow-xs"
                        : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-700"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-teal-700 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-extrabold truncate ${isSelected ? "text-teal-950" : "text-slate-900"}`}>
                          {opt.symptom}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Matched Specialist Preview Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-5 rounded-2xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/30 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-teal-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                    Recommended Specialist
                  </span>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-300">
                    PKR {matchedDoctor.fee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mt-3.5">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-teal-600 shadow-sm bg-[#DFE5E7] flex items-center justify-center">
                    {matchedDoctor.id === "doc-kamran-rauf" ? (
                      <Image
                        src="/images/dr-kamran-rauf.jpg"
                        alt={matchedDoctor.name}
                        fill
                        sizes="56px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <WhatsAppAvatar />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{matchedDoctor.pmcRegistration}</span>
                      <span className="text-slate-300">•</span>
                      <span>{matchedDoctor.experienceYears}+ Yrs Exp</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                      {matchedDoctor.name}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {matchedDoctor.specialty}
                    </p>
                  </div>
                </div>

                {/* Timings */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-white border border-teal-200/80 flex items-center gap-2 text-xs text-slate-700">
                  <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {matchedDoctor.timings}
                  </span>
                </div>

                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => handleSelect(matchedDoctor)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 shadow-md shadow-teal-700/20 hover:shadow-lg transition-all cursor-pointer"
                >
                  <span className="truncate">Select {matchedDoctor.name} & Book</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
