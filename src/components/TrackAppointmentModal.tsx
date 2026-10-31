"use client";

import { useState } from "react";
import {
  Search,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DoorClosed,
  Phone,
  User,
  Calendar,
  Loader2,
} from "lucide-react";
import { Appointment } from "@/lib/types";
import { reportClientError } from "@/lib/clientLogger";

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackAppointmentModal({ isOpen, onClose }: TrackModalProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setAppointment(null);

    try {
      const res = await fetch(`/api/appointments?token=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && data.appointment) {
        setAppointment(data.appointment);
      } else {
        setErrorMessage(data.message || "No appointment found matching this Token #. Please verify the code.");
      }
    } catch (err) {
      reportClientError(err, { component: "TrackAppointmentModal", action: "lookup", additional: { query } });
      setErrorMessage("Network issue looking up token. Please try again or verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Patient Self-Service</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Track Appointment Token</h3>
          <p className="text-xs text-slate-500 mt-1">
            Enter your secure Token Number (e.g. <code>CLN-2026-1042</code>) to check live verification status.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. CLN-2026-1042"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Lookup</span>
          </button>
        </form>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4">
            {errorMessage}
          </div>
        )}

        {/* Appointment Result Card */}
        {appointment && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-mono text-sm font-extrabold text-teal-800">
                {appointment.tokenNumber}
              </span>

              {/* Status Pills */}
              {appointment.status === "PENDING" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Pending Verification
                </span>
              )}
              {appointment.status === "CONFIRMED" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Confirmed Slot
                </span>
              )}
              {appointment.status === "CHECKED_IN" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  In Waiting / In Room
                </span>
              )}
              {appointment.status === "REJECTED" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  Verification Declined
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient:</span>
                <span className="font-semibold text-slate-800">{appointment.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Doctor & Room:</span>
                <span className="font-semibold text-slate-800">
                  {appointment.doctorName} (Room {appointment.doctorRoom})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date & Time:</span>
                <span className="font-semibold text-slate-800">
                  {appointment.date} at {appointment.timeSlot}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Payment Proof:</span>
                <span className="font-semibold text-slate-800">
                  {appointment.paymentMethod} • {appointment.trxId}
                </span>
              </div>
            </div>

            {appointment.rejectionReason && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <strong>Declined Note:</strong> {appointment.rejectionReason}
              </div>
            )}

            {appointment.status === "CONFIRMED" && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                ✓ Your appointment is confirmed! Please arrive at Room {appointment.doctorRoom} 10 minutes prior to {appointment.timeSlot}.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
