"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Stethoscope,
  Tag,
  ArrowRight,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CLINIC_DOCTORS } from "@/lib/constants";
import { Doctor } from "@/lib/types";
import WhatsAppAvatar from "@/components/WhatsAppAvatar";

interface DoctorShowcaseProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

const CATEGORIES = [
  "All Doctors",
  "Endocrinology & Diabetes",
  "General Medicine",
  "Diagnostic Radiology",
  "Urology & Andrology",
] as const;

export default function DoctorShowcase({ onSelectDoctor }: DoctorShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Doctors");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getCategoryCount = (cat: string) => {
    if (cat === "All Doctors") return CLINIC_DOCTORS.length;
    if (cat === "General Medicine") {
      return CLINIC_DOCTORS.filter((d) => d.category === cat || d.id === "doc-kamran-rauf").length;
    }
    return CLINIC_DOCTORS.filter((d) => d.category === cat).length;
  };

  const filteredDoctors = CLINIC_DOCTORS.filter((doc) => {
    const matchesCategory =
      selectedCategory === "All Doctors" ||
      doc.category === selectedCategory ||
      (selectedCategory === "General Medicine" && doc.id === "doc-kamran-rauf");
    const matchesSearch =
      searchQuery.trim() === "" ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.designation && doc.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.subSpecialty && doc.subSpecialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.bio.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="specialists" className="py-16 sm:py-20 bg-slate-100/70 border-y border-slate-200/80 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Consultant Medical Faculty & Disciplines</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Senior Medical Specialists & Services
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Senior hospital consultants covering specialized clinical disciplines at 347- Riwaz Garden, Lahore. Explore clinical services, consultation timings, and book your consultation appointment.
          </p>

          {/* Search bar */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              suppressHydrationWarning
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, or condition..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = getCategoryCount(cat);
            return (
              <button
                key={cat}
                type="button"
                suppressHydrationWarning
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-teal-800 text-teal-100" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDoctors.map((doc) => {
            const isKamran = doc.id === "doc-kamran-rauf";

            return (
              <div
                key={doc.id}
                className={`glass-card glass-card-hover rounded-2xl overflow-hidden border flex flex-col justify-between group relative transition-all ${
                  isKamran
                    ? "border-teal-500/60 ring-2 ring-teal-600/20 shadow-md"
                    : "border-slate-200"
                }`}
              >
                {/* Card Top: WhatsApp-style Default Avatar & Header */}
                <div>
                  <div className="relative w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 pt-12 pb-5 flex flex-col items-center text-center border-b border-slate-800">
                    {/* Fee Pill (Top Right) */}
                    <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600/95 backdrop-blur-md text-white text-xs font-extrabold shadow-md">
                      <span>PKR {doc.fee.toLocaleString()}</span>
                    </div>

                    {/* Lead Doctor Badge */}
                    {isKamran && (
                      <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2.5">
                        <span>Lead Physician & Endocrinologist</span>
                      </div>
                    )}

                    {/* Doctor Portrait / WhatsApp Avatar */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-lg ring-4 ring-white/10 group-hover:ring-teal-500/40 transition-all duration-300 overflow-hidden bg-[#DFE5E7] flex items-center justify-center shrink-0 mb-3.5">
                      {isKamran ? (
                        <Image
                          src="/images/dr-kamran-rauf.jpg"
                          alt={doc.name}
                          fill
                          sizes="(max-width: 640px) 96px, 112px"
                          className="object-cover object-top"
                          priority
                        />
                      ) : (
                        <WhatsAppAvatar />
                      )}
                    </div>

                    {/* Name & Credentials */}
                    <div className="text-white space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{doc.pmcRegistration}</span>
                        <span className="text-slate-500">•</span>
                        <span>{doc.experienceYears}+ Yrs Exp</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold leading-snug drop-shadow-sm text-white">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium line-clamp-2 max-w-xs mx-auto">
                        {doc.degrees}
                      </p>
                      {doc.designation && (
                        <p className="text-[11px] text-teal-300 font-semibold line-clamp-1 mt-0.5">
                          {doc.designation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3.5">
                    {/* Specialty */}
                    <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-bold self-start">
                        {doc.specialty}
                      </span>
                      {doc.subSpecialty && (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start">
                          {doc.subSpecialty}
                        </span>
                      )}
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {doc.bio}
                    </p>

                    {/* Specialized Clinical Services Badges */}
                    {doc.services && doc.services.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block mb-1.5">
                          Clinical Disciplines & Services:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {doc.services.map((serv, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold bg-teal-50 text-teal-900 border border-teal-200/80 px-2 py-0.5 rounded-md shadow-2xs"
                            >
                              {serv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Days */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Consultation Days:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                          const isActive = doc.activeDays.includes(day);
                          return (
                            <span
                              key={day}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-400 opacity-60"
                              }`}
                            >
                              {day}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Specific Consultation Hours */}
                    {doc.timings && (
                      <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-800">{doc.timings}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => onSelectDoctor(doc)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-teal-700 transition-colors shadow-xs group-hover:bg-teal-700 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">
                      Book with {isKamran ? "Prof. Dr. Kamran Rauf" : doc.name}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
