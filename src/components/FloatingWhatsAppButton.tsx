"use client";

import { MessageSquare } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

export default function FloatingWhatsAppButton() {
  const message = encodeURIComponent(
    `Assalam-o-Alaikum Al Rauf Health Care Reception (03208119978),\nI would like to inquire about doctor availability and appointment consultation at 347- Riwaz Garden, Lahore.`
  );

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}&text=${message}`;

  return (
    <aside aria-label="WhatsApp Clinic Reception" className="fixed bottom-6 right-6 z-40 print:hidden">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Clinic Reception on WhatsApp 0320 8119978"
        className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/80"
        title="Chat with Clinic Receptionist: 0320 8119978"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        <MessageSquare className="w-5 h-5 fill-white text-emerald-600 shrink-0" />

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[11px] font-extrabold uppercase tracking-wider leading-none text-emerald-100">
            Clinic Reception
          </span>
          <span className="text-xs font-black tracking-tight leading-tight">
            0320 8119978
          </span>
        </div>
      </a>
    </aside>
  );
}
