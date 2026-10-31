"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Clock,
  MessageSquare,
  Navigation,
  Car,
  Mail,
  Star,
  CheckCircle2,
  Copy,
  Check,
  Compass,
  Accessibility,
} from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

export default function LocationContactSection() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chauburji" | "mall" | "accessibility">("chauburji");

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}&text=${encodeURIComponent(
    "Assalam-o-Alaikum Clinic Reception, I need directions / information regarding Al Rauf Health Care (Prof. Dr. Muhammad Kamran Rauf, 347- Riwaz Garden, Lahore)."
  )}`;

  return (
    <section id="location-contact" className="py-16 sm:py-20 bg-white border-t border-slate-200 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Al Rauf Health Care Location & Contacts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Visit Our Clinic in Riwaz Garden, Lahore
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Centrally situated medical center at 347- Riwaz Garden near Chauburji & Lower Mall. Dedicated patient care, 5.0-star verified Google rating, and direct consultant physician support.
          </p>

          {/* Google Review Pill */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span>5.0 (15 Google Reviews) • Doctor in Lahore</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Contact & Direction Info */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Address Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Physical Address
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 font-bold mt-1 leading-snug">
                      {CLINIC_INFO.address}
                    </p>
                    <span className="text-[11px] text-teal-700 font-semibold block mt-1">
                      Near Chauburji Monument & Riwaz Garden Main Road, Lahore
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => copyText(CLINIC_INFO.address, "address")}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                  title="Copy address"
                >
                  {copiedKey === "address" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Consultation Hours */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Consultation Hours & Timings
                  </h4>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-800">
                    <p className="font-bold text-teal-800">
                      Prof. Dr. Muhammad Kamran Rauf: Mon–Fri: 04:00 PM – 09:00 PM · Sat: 01:00 PM – 06:00 PM
                    </p>
                    <p className="text-slate-600 font-medium">
                      Other Specialists: 12:00 PM – 09:00 PM (Active Days)
                    </p>
                  </div>
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    Sunday: Prof. Dr. Muhammad Kamran Rauf is OFF (Closed). Emergency triage on-call only.
                  </p>
                </div>
              </div>

              {/* Official Appointments & Clinic Contacts */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Appointment & Clinic Contacts
                    </h4>
                    <p className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900">For Appointment (Call):</span>{" "}
                      <a
                        href="tel:03158119978"
                        className="font-extrabold text-teal-800 hover:text-teal-950 font-mono"
                      >
                        0315 8119978
                      </a>
                    </p>
                    <p className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900">For Appointment (WhatsApp):</span>{" "}
                      <a
                        href={`https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-extrabold text-emerald-700 hover:underline font-mono"
                      >
                        0320 8119978
                      </a>
                    </p>
                    <p className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900">WhatsApp (Alternate):</span>{" "}
                      <a
                        href="https://api.whatsapp.com/send?phone=923279446441"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-extrabold text-emerald-700 hover:underline font-mono"
                      >
                        0327 9446441
                      </a>
                    </p>
                    <p className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Clinic Landline:</span>{" "}
                      <a
                        href="tel:04237171347"
                        className="font-extrabold text-slate-900 hover:text-teal-700 font-mono"
                      >
                        042 37171347
                      </a>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => copyText("0315 8119978", "phone")}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                  title="Copy appointment contact"
                >
                  {copiedKey === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Email Address Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Official Email
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 font-bold mt-1">
                      <a
                        href={`mailto:${CLINIC_INFO.email}`}
                        className="text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        {CLINIC_INFO.email}
                      </a>
                    </p>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      For patient inquiries, digital medical reports, and specialist coordination.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => copyText(CLINIC_INFO.email, "email")}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                  title="Copy email"
                >
                  {copiedKey === "email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Transit & Accessibility Tabs */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs">
                <div className="flex items-center gap-1.5 border-b border-teal-200 pb-2 mb-2">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setActiveTab("chauburji")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${activeTab === "chauburji" ? "bg-teal-700 text-white" : "text-teal-900 hover:bg-teal-100"}`}
                  >
                    Via Chauburji
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setActiveTab("mall")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${activeTab === "mall" ? "bg-teal-700 text-white" : "text-teal-900 hover:bg-teal-100"}`}
                  >
                    Via Lower Mall
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setActiveTab("accessibility")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${activeTab === "accessibility" ? "bg-teal-700 text-white" : "text-teal-900 hover:bg-teal-100"}`}
                  >
                    Accessibility
                  </button>
                </div>
                {activeTab === "chauburji" && (
                  <p className="text-teal-950 leading-relaxed">
                    <strong>From Chauburji Chowk (3 mins):</strong> Head south onto Riwaz Garden Main Road. Pass the local market; clinic 347 is on the left with prominent signage.
                  </p>
                )}
                {activeTab === "mall" && (
                  <p className="text-teal-950 leading-relaxed">
                    <strong>From Lower Mall / Secretariat (6 mins):</strong> Take the Chauburji link turn. Metro Bus Station (MAO College / Chauburji) is within walking distance.
                  </p>
                )}
                {activeTab === "accessibility" && (
                  <p className="text-teal-950 leading-relaxed">
                    <strong>Accessibility & Parking:</strong> Ground-floor barrier-free wheelchair ramp, dedicated drop-off bay in front, and secure parking assistance on arrival.
                  </p>
                )}
              </div>
            </div>

            {/* Direct Directions Action */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={CLINIC_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-slate-900 hover:bg-teal-700 transition-colors shadow-sm"
              >
                <Navigation className="w-4 h-4 text-teal-400" />
                <span>Get Directions in Google Maps</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 hover:bg-emerald-200 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>

            {/* Right Embedded Interactive Map & Building Exterior Preview */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Landmark Identification Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5 shadow-2xs">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src="/images/clinic-facade-v2.jpg"
                    alt="Al Rauf Health Care Building Exterior - 347 Riwaz Garden Lahore"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1">
                    Visual Landmark
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    Look for the white neoclassical building with the &ldquo;AHC&rdquo; emblem
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    347- Riwaz Garden, Lahore (near Chauburji Chowk &amp; Lower Mall)
                  </p>
                </div>
              </div>

              {/* Map Container */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md min-h-[380px] flex-1 relative bg-slate-100">
                <iframe
                  src="https://maps.google.com/maps?q=347+Riwaz+Garden+Lahore+Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "380px" }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Al Rauf Health Care - 347- Riwaz Garden Lahore Coordinates"
                  className="w-full h-full min-h-[380px]"
                ></iframe>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
