"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  MessageSquare,
  Search,
  Menu,
  X,
  Lock,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

interface NavbarProps {
  onOpenTracker?: () => void;
}

const NAV_LINKS = [
  { id: "hero", label: "Home" },
  { id: "specialists", label: "Specialists" },
  { id: "booking-section", label: "Book Appointment" },
  { id: "about-facilities", label: "Facilities" },
  { id: "reviews", label: "Reviews" },
  { id: "location-contact", label: "Location" },
];

export default function Navbar({ onOpenTracker }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const sectionIds = [
      "hero",
      "specialists",
      "booking-section",
      "about-facilities",
      "reviews",
      "location-contact",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    if (
      typeof window !== "undefined" &&
      (window.location.pathname === "/" || window.location.pathname === "")
    ) {
      e.preventDefault();
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${targetId}`);
        setActiveSection(targetId);
      }
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum,\nI would like to inquire about consultation timings and doctor availability at Al Rauf Health Care (Prof. Dr. Muhammad Kamran Rauf, 347- Riwaz Garden, Lahore).`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}&text=${whatsappMessage}`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/90 py-2.5"
          : "bg-white border-b border-slate-200/70 py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo & Brand Identity */}
        <Link
          href="/#hero"
          onClick={(e) => handleNavClick(e, "hero")}
          className="flex items-center gap-3 group shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform shrink-0">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors leading-tight truncate max-w-[190px] xs:max-w-[260px] sm:max-w-none">
              Al Rauf Health Care
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-teal-700 tracking-wide uppercase leading-tight truncate max-w-[190px] xs:max-w-[260px] sm:max-w-none">
              Prof. Dr. Muhammad Kamran Rauf
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-teal-50 text-teal-800 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-teal-700 hover:bg-slate-100/70"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* Track Token button */}
          <button
            suppressHydrationWarning
            onClick={onOpenTracker}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="Track Token Status"
          >
            <Search className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden xl:inline">Track Token</span>
          </button>

          {/* Staff Desk Option */}
          <Link
            href="/reception"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-300/80 transition-all shadow-2xs whitespace-nowrap"
            title="Staff Desk / Reception Portal"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Staff Desk</span>
          </Link>

          {/* WhatsApp Inquiry Pill */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 transition-colors shadow-2xs whitespace-nowrap"
            title="Chat with Receptionist on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
            <span className="hidden xl:inline">WhatsApp</span>
          </a>

          {/* Primary Booking CTA */}
          <a
            href="#booking-section"
            onClick={(e) => handleNavClick(e, "booking-section")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 shadow-sm shadow-teal-700/25 hover:shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-100" />
            <span>Book Appointment</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-800" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2.5 px-4 pt-2 pb-4 bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top duration-150">
          <div className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-800 font-bold"
                      : "text-slate-800 hover:bg-slate-50 hover:text-teal-700"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTracker?.();
              }}
              className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-600" />
                <span>Track Token Status</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <Link
              href="/reception"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Staff Desk</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </Link>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="#booking-section"
                onClick={(e) => handleNavClick(e, "booking-section")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 shadow-md transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-teal-100" />
                <span>Book 20-Minute Consultation</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Inquiry ({CLINIC_INFO.whatsappNumber})</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
