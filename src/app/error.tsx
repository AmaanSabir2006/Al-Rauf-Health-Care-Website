"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Send,
  Phone,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";
import { reportClientError } from "@/lib/clientLogger";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    // Dispatch telemetry report to backend logger
    reportClientError(error, {
      component: "RouteError_Boundary",
      action: "page_render_crash",
      additional: { digest: error.digest },
    }).then((id) => {
      if (id) setErrorId(id);
    });

    console.error("[RouteError] Unhandled route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-teal-50/20 to-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans">
      {/* Clinic Header Brand */}
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

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600">Reception Desk Online</span>
        </div>
      </header>

      {/* Main Error Recovery Card */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-slate-200 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

          {/* Icon badge */}
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 text-teal-800 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 text-teal-900 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Clinic Self-Healing Protection</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            We Encountered a Temporary Hiccup
          </h2>

          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            The page encountered an unexpected condition. Don&apos;t worry—our automated error monitor has
            logged the details and our clinical booking servers remain securely active.
          </p>

          {/* Diagnostic Trace Badge */}
          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl inline-flex flex-col sm:flex-row items-center gap-2 text-xs font-mono text-slate-700">
            <span>Diagnostic ID:</span>
            <strong className="text-teal-800">{errorId || error.digest || "RECORDED_LIVE"}</strong>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-[11px] text-slate-500">{new Date().toLocaleTimeString()}</span>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry / Recover Page</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-300 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-600" />
              <span>Go to Homepage</span>
            </Link>

            <a
              href={`https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}&text=${encodeURIComponent(
                `Assalam-o-Alaikum Al Rauf Health Care Desk, I faced a browser display issue on the website (Trace ID: ${
                  errorId || "Direct"
                }). I would like to book my consultation directly.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp Desk ({CLINIC_INFO.whatsappNumber})</span>
            </a>
          </div>

          {/* Emergency Telephone Numbers */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Appointment Helpline</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-teal-700" />
                <a href={`tel:${CLINIC_INFO.appointmentCallRaw}`} className="text-xs font-bold text-slate-800 hover:underline">
                  {CLINIC_INFO.appointmentCall}
                </a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Clinic Address (Lahore)</span>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {CLINIC_INFO.address}
              </p>
            </div>
          </div>

          {/* Diagnostic Error Details Accordion */}
          <div className="mt-6 text-left">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span>View Technical Diagnostic Cause</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto text-left">
                <p className="text-rose-400 font-bold mb-1">
                  {error.name}: {error.message}
                </p>
                {error.digest && (
                  <p className="text-teal-300 text-[11px] mb-1">Next.js Digest: {error.digest}</p>
                )}
                {Boolean(error.cause) && (
                  <p className="text-amber-300 text-[11px] mb-1">Cause: {String(error.cause)}</p>
                )}
                {error.stack && (
                  <pre className="text-[10px] text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto mt-2">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pt-4">
        &copy; 2026 {CLINIC_INFO.name}. All patient records securely monitored.
      </footer>
    </div>
  );
}
