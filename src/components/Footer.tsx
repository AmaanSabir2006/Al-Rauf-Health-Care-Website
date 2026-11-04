"use client";

import Link from "next/link";
import { Stethoscope, Phone, Mail, MapPin, ShieldCheck, Heart } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

export default function Footer() {
  const handleFooterNav = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "")) {
      e.preventDefault();
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${targetId}`);
      }
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">
                Al Rauf Health Care
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Al Rauf Health Care (Prof. Dr. Muhammad Kamran Rauf). Consultant Physician & Endocrinologist, Professor of Medicine at AMDC. Structured outpatient consultation slots, diabetes, and metabolic care at 347- Riwaz Garden, Lahore.
            </p>
            <div className="flex items-center gap-1.5 text-teal-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>PMDC Registered • 5.0 Star Google Rated</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => handleFooterNav(e, "hero")}
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#specialists"
                  onClick={(e) => handleFooterNav(e, "specialists")}
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Our Specialists & Services
                </a>
              </li>
              <li>
                <a
                  href="#booking-section"
                  onClick={(e) => handleFooterNav(e, "booking-section")}
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Book Appointment
                </a>
              </li>
              <li>
                <a
                  href="#about-facilities"
                  onClick={(e) => handleFooterNav(e, "about-facilities")}
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Clinic Facilities Tour
                </a>
              </li>
              <li>
                <a
                  href="#reviews"
                  onClick={(e) => handleFooterNav(e, "reviews")}
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Google Reviews (5.0 ★)
                </a>
              </li>
              <li>
                <a
                  href="#location-contact"
                  onClick={(e) => handleFooterNav(e, "location-contact")}
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Location & Directions
                </a>
              </li>
              <li>
                <Link href="/reception" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Staff Verification Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Clinical Services</h4>
            <ul className="space-y-1.5">
              <li>Endocrinology, Diabetes & Metabolism</li>
              <li>General Medicine & Primary Care</li>
              <li>Diagnostic Radiology & Ultrasound</li>
              <li>Urology, Andrology & Men's Health</li>
              <li>Hypertension & Metabolic Health</li>
              <li>Renal & Prostate Care</li>
              <li>Soft Tissue & Doppler Scans</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Contact Details</h4>
            <p className="text-slate-300">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-teal-400" />
              {CLINIC_INFO.address}
            </p>
            <p className="text-slate-300">
              <Phone className="w-3.5 h-3.5 inline mr-1 text-teal-400" />
              Appt (Call): 0315 8119978
            </p>
            <p className="text-slate-300">
              <Phone className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
              Appt (WhatsApp):{" "}
              <a
                href={`https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline font-mono"
              >
                0320 8119978
              </a>
            </p>
            <p className="text-slate-300">
              <Phone className="w-3.5 h-3.5 inline mr-1 text-teal-400" />
              Landline: 042 37171347
            </p>
            <p className="text-slate-300">
              <Mail className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
              {CLINIC_INFO.email}
            </p>
            <p className="text-teal-400 font-semibold text-[11px] pt-1">
              Prof. Dr. Muhammad Kamran Rauf: Mon–Fri 4–9 PM · Sat 1–6 PM (Sun: Off)
            </p>
            <p className="text-slate-400 text-[11px]">
              Specialist Hours: 12:00 PM – 09:00 PM
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 Al Rauf Health Care (Prof. Dr. Muhammad Kamran Rauf). All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Direct Meezan Bank Transfer verification • Zero gateway commission</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
