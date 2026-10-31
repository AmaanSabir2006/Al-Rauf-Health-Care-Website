"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LogOut, Phone, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { reportClientError } from "@/lib/clientLogger";

export default function ReceptionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState<string | null>(null);
  const [showStack, setShowStack] = useState(false);

  useEffect(() => {
    reportClientError(error, {
      component: "Reception_Desk_Boundary",
      action: "reception_ui_crash",
      additional: { digest: error.digest },
    }).then((id) => {
      if (id) setErrorId(id);
    });

    console.error("[ReceptionError] Reception Desk crashed:", error);
  }, [error]);

  const handleHardReset = () => {
    try {
      sessionStorage.removeItem("reception_token");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase mb-3">
          <span>Reception Desk Protected</span>
        </div>

        <h2 className="text-2xl font-black text-white">Reception Desk Interface Recovered</h2>
        <p className="text-sm text-slate-300 mt-2">
          An unexpected error interrupted the reception queue display. All appointments in the database are completely safe.
        </p>

        <div className="mt-4 p-2 bg-slate-950/60 rounded-xl border border-slate-700 text-xs font-mono text-teal-400 inline-block">
          Error Incident: <strong>{errorId || error.digest || "DESK_ERROR_RESCUED"}</strong>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Re-rendering Queue</span>
          </button>

          <button
            type="button"
            onClick={handleHardReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Clear Session & Re-Login</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Exit to Main Site</span>
          </Link>
        </div>

        <div className="mt-6 text-left border-t border-slate-700 pt-4">
          <button
            type="button"
            onClick={() => setShowStack(!showStack)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <span>Diagnostic Stack & Cause Details</span>
            {showStack ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showStack && (
            <div className="mt-2 p-3 bg-slate-950 rounded-xl font-mono text-xs text-rose-300 overflow-x-auto">
              <p className="font-bold">{error.name}: {error.message}</p>
              {error.stack && (
                <pre className="text-[10px] text-slate-500 whitespace-pre-wrap mt-2 max-h-36 overflow-y-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
