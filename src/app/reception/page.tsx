"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Unlock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Phone,
  MessageSquare,
  DoorClosed,
  ChevronRight,
  TrendingUp,
  CreditCard,
  FileText,
  Calendar,
  X,
  Plus,
  Send,
  Printer,
  ShieldAlert,
  Activity,
  Trash2,
  Bug,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CLINIC_DOCTORS, CLINIC_INFO, OPERATING_SLOTS } from "@/lib/constants";
import { Appointment, AppointmentStatus, ReceptionStats } from "@/lib/types";
import { reportClientError } from "@/lib/clientLogger";

export default function ReceptionDesk() {
  // Authentication state (Security Password)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string>("");
  const [pinInput, setPinInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Appointments & stats
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<ReceptionStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [currentDateFilterStrs, setCurrentDateFilterStrs] = useState<{ today: string; tomorrow: string }>({
    today: "",
    tomorrow: "",
  });

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setCurrentDateFilterStrs({ today: todayStr, tomorrow: tomorrowStr });
  }, []);

  // Inspection modal
  const [previewAppointment, setPreviewAppointment] = useState<Appointment | null>(null);
  const [rejectionModalApt, setRejectionModalApt] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Walk-in modal
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);
  const [walkInDoctor, setWalkInDoctor] = useState(CLINIC_DOCTORS[0].id);
  const [walkInSlot, setWalkInSlot] = useState(OPERATING_SLOTS[0]);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInAge, setWalkInAge] = useState<number | "">(30);
  const [walkInGender, setWalkInGender] = useState<"Male" | "Female" | "Child">("Male");
  const [walkInPayment, setWalkInPayment] = useState<"JazzCash" | "EasyPaisa">("JazzCash");

  // System Diagnostics modal
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState<boolean>(false);
  const [systemErrors, setSystemErrors] = useState<any[]>([]);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState<boolean>(false);
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string; type: "success" | "error" } | null>(null);

  const showToast = (title: string, body: string, type: "success" | "error" = "success") => {
    setToastMessage({ title, body, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Always enforce staff security password prompt on fresh page load to protect patient records
  useEffect(() => {
    sessionStorage.removeItem("reception_token");
    setIsAuthenticated(false);
    setAuthToken("");
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken("");
    sessionStorage.removeItem("reception_token");
    setPinInput("");
    if (typeof document !== "undefined") {
      document.cookie = "reception_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  };

  // Auto-lock desk after 15 minutes of inactivity to protect patient records
  useEffect(() => {
    if (!isAuthenticated) return;

    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLogout();
        showToast("Desk Auto-Locked", "Reception station locked after 15 minutes of inactivity for security.", "error");
      }, 15 * 60 * 1000);
    };

    resetTimer();
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [isAuthenticated]);

  // Fetch appointments and stats with authentication
  const loadData = async () => {
    const token = authToken || sessionStorage.getItem("reception_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const [aptsRes, statsRes] = await Promise.all([
        fetch("/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (aptsRes.status === 401 || statsRes.status === 401) {
        handleLogout();
        showToast("Session Expired", "Please re-enter your Security PIN.", "error");
        return;
      }

      const aptsData = await aptsRes.json();
      const statsData = await statsRes.json();

      if (aptsData.success) {
        setAppointments(aptsData.appointments || []);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error("Failed to load reception data", err);
      reportClientError(err, { component: "ReceptionDesk", action: "loadData" });
      showToast("Sync Error", "Could not refresh queue data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiagnostics = async () => {
    const token = authToken || sessionStorage.getItem("reception_token");
    if (!token) return;
    setIsLoadingDiagnostics(true);
    try {
      const res = await fetch("/api/log-error", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSystemErrors(data.errors || []);
      }
    } catch (err) {
      console.error("Failed to load error logs", err);
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  const handleClearDiagnostics = async () => {
    const token = authToken || sessionStorage.getItem("reception_token");
    if (!token) return;
    try {
      const res = await fetch("/api/log-error", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSystemErrors([]);
        showToast("Diagnostics Cleared", "System error log was reset successfully.");
      }
    } catch {
      showToast("Error", "Could not clear logs.", "error");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, authToken]);

  // Handle Security Password authentication against secure API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/reception/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setAuthToken(data.token);
        sessionStorage.setItem("reception_token", data.token);
        setIsAuthenticated(true);
        setPinInput("");
      } else {
        setAuthError(data.message || "Invalid security password. Access denied.");
      }
    } catch (err) {
      setAuthError("Network error attempting to authenticate.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Approve / Confirm
  const handleApprove = async (appointment: Appointment) => {
    const token = authToken || sessionStorage.getItem("reception_token");
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Slot Approved & Confirmed", `Token ${appointment.tokenNumber} has been verified.`);
        loadData();
      } else {
        showToast("Error", data.message || "Failed to approve slot.", "error");
      }
    } catch (err) {
      showToast("Network Error", "Unable to approve.", "error");
    }
  };

  // Handle Reject / Fake Receipt (Immediately frees up the slot)
  const handleRejectConfirm = async () => {
    if (!rejectionModalApt) return;
    const token = authToken || sessionStorage.getItem("reception_token");

    try {
      const res = await fetch(`/api/appointments/${rejectionModalApt.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: rejectionReason.trim() || "Fake or invalid payment screenshot / TRX ID not found.",
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Slot Rejected & Re-opened", `Slot for ${rejectionModalApt.timeSlot} is now freed up for public booking.`);
        setRejectionModalApt(null);
        setRejectionReason("");
        loadData();
      } else {
        showToast("Error", data.message || "Failed to reject slot.", "error");
      }
    } catch (err) {
      showToast("Network Error", "Unable to update status.", "error");
    }
  };

  // Handle Patient Arrived / Check-in
  const handleCheckIn = async (appointment: Appointment) => {
    const token = authToken || sessionStorage.getItem("reception_token");

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CHECKED_IN" }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Patient Checked In", `${appointment.patientName} is now queued for doctor consultation.`);
        loadData();
      } else {
        showToast("Error", data.message || "Failed to check in patient.", "error");
      }
    } catch (err) {
      showToast("Network Error", "Unable to update status.", "error");
    }
  };

  // Handle Quick Walk-in Creation
  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInPhone) return;

    const doctor = CLINIC_DOCTORS.find((d) => d.id === walkInDoctor);
    if (!doctor) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const token = authToken || sessionStorage.getItem("reception_token");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientName: walkInName,
          patientPhone: walkInPhone,
          patientAge: Number(walkInAge) || 30,
          patientGender: walkInGender,
          reasonForVisit: "Walk-in Desk Consultation",
          doctorId: doctor.id,
          date: todayStr,
          timeSlot: walkInSlot,
          paymentMethod: walkInPayment,
          senderName: "Cash / Walk-in at Reception Desk",
          trxId: "CASH-" + Date.now().toString().slice(-6),
          receiptUrl: "/images/sample-receipt.jpg",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Auto confirm walk-in
        await fetch(`/api/appointments/${data.appointment.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "CONFIRMED" }),
        });

        showToast("Walk-in Booked", `Token ${data.appointment.tokenNumber} created & confirmed.`);
        setShowWalkInModal(false);
        setWalkInName("");
        setWalkInPhone("");
        loadData();
      } else {
        showToast("Slot Unavailable", data.message || "Could not reserve slot.", "error");
      }
    } catch (err) {
      showToast("Error", "Failed to create walk-in reservation.", "error");
    }
  };

  // WhatsApp patient quick message
  const getPatientWhatsAppUrl = (appointment: Appointment, type: "approval" | "reminder") => {
    const cleanPhone = appointment.patientPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("03")
      ? "92" + cleanPhone.substring(1)
      : cleanPhone.startsWith("92")
      ? cleanPhone
      : "92" + cleanPhone;

    let text = "";
    if (type === "approval") {
      text = encodeURIComponent(
        `Assalam-o-Alaikum ${appointment.patientName},\n\nYour appointment (Token: ${appointment.tokenNumber}) with ${appointment.doctorName} on ${appointment.date} at ${appointment.timeSlot} has been APPROVED & CONFIRMED.\n\nPlease arrive at Room ${appointment.doctorRoom} 10 minutes prior.\n\nAl Rauf Health Care (347- Riwaz Garden, Lahore)`
      );
    } else {
      text = encodeURIComponent(
        `Assalam-o-Alaikum ${appointment.patientName},\n\nThis is a prompt notification from the Clinic Reception. Your turn with ${appointment.doctorName} (Room ${appointment.doctorRoom}) is coming up. Please report to the triage desk.\n\nThank you.`
      );
    }

    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${text}`;
  };

  // Apply filters
  const filteredAppointments = appointments.filter((apt) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientPhone.includes(q) ||
        apt.tokenNumber.toLowerCase().includes(q) ||
        (apt.trxId && apt.trxId.toLowerCase().includes(q)) ||
        (apt.senderName && apt.senderName.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Status
    if (statusFilter !== "ALL" && apt.status !== statusFilter) return false;

    // Doctor
    if (doctorFilter !== "ALL" && apt.doctorId !== doctorFilter) return false;

    // Date
    if (dateFilter === "TODAY" && currentDateFilterStrs.today && apt.date !== currentDateFilterStrs.today) return false;
    if (dateFilter === "TOMORROW" && currentDateFilterStrs.tomorrow && apt.date !== currentDateFilterStrs.tomorrow) return false;

    return true;
  });

  // ================= LOGIN GATE VIEW =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Clinic Receptionist Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            Authorized clinic staff verification portal for Al Rauf Health Care (Prof. Dr. Muhammad Kamran Rauf, 347- Riwaz Garden, Lahore).
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Staff Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={64}
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter staff security password"
                  className="w-full px-4 py-3 pr-11 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
                />
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
                Confidential staff access. Enter clinic security password to manage appointments.
              </span>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-left">
                {authError}
              </div>
            )}

            <button
              type="submit"
              suppressHydrationWarning
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-teal-700 transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Unlock Reception Desk</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
            <Link href="/" className="hover:text-teal-700 font-semibold underline">
              ← Return to Public Booking Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN RECEPTION DESK DASHBOARD =================
  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === "success"
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-rose-900 text-white border-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold">{toastMessage.title}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">{toastMessage.body}</p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-slate-900 text-white py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-white shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Live Receptionist Verification Station
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h1 className="text-lg font-extrabold text-white">
                Al Rauf Health Care • Prof. Dr. Muhammad Kamran Rauf
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowWalkInModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span><span className="hidden sm:inline">New </span>Walk-in<span className="hidden md:inline"> / Phone</span></span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => {
                setShowDiagnosticsModal(true);
                loadDiagnostics();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="View error logs and system health diagnostics"
            >
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span><span className="hidden sm:inline">System </span>Logs</span>
            </button>

            <Link
              href="/"
              className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Public Site
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 transition-colors cursor-pointer shadow-xs"
              title="Lock desk station immediately to protect patient records"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Lock Desk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Real-time Stats Cards (Interactive Quick Filters) */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Pending Verification Card */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter("PENDING");
                setDateFilter("ALL");
                setSearchQuery("");
              }}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                statusFilter === "PENDING"
                  ? "bg-amber-100 border-amber-400 ring-2 ring-amber-500 shadow-md"
                  : "bg-amber-50 border-amber-200/80 hover:bg-amber-100/70 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-amber-950">{stats.pendingCount}</p>
                {stats.pendingCount > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase animate-pulse">
                    Action Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-800 mt-1">Receipts awaiting verification · Click to filter</p>
            </button>

            {/* Confirmed Today Card */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter("CONFIRMED");
                setDateFilter("TODAY");
                setSearchQuery("");
              }}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                statusFilter === "CONFIRMED" && dateFilter === "TODAY"
                  ? "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-500 shadow-md"
                  : "bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100/70 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Confirmed Today</span>
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-emerald-950">{stats.confirmedCount}</p>
              <p className="text-[11px] text-emerald-800 mt-1">Ready for consultation · Click to filter</p>
            </button>

            {/* In Waiting / Checked In Card */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter("CHECKED_IN");
                setDateFilter("TODAY");
                setSearchQuery("");
              }}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                statusFilter === "CHECKED_IN"
                  ? "bg-indigo-100 border-indigo-400 ring-2 ring-indigo-500 shadow-md"
                  : "bg-indigo-50 border-indigo-200/80 hover:bg-indigo-100/70 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between text-indigo-700 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Arrived Patients</span>
                <DoorClosed className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-indigo-950">{stats.checkedInCount}</p>
              <p className="text-[11px] text-indigo-800 mt-1">In waiting bay / consultation · Click to filter</p>
            </button>

            {/* Revenue Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-teal-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Revenue</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black">
                PKR {stats.todayRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Direct via JazzCash &amp; EasyPaisa</p>
            </div>
          </div>
        )}

        {/* Doctor Stations Quick Room Monitor */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <DoorClosed className="w-4 h-4 text-teal-600" />
              <span>Doctor Consultation Rooms Status</span>
            </span>
            <span className="text-xs text-slate-500">
              Prof. Dr. Kamran: Mon–Fri 4–9 PM, Sat 1–6 PM · Specialists: 12–9 PM
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CLINIC_DOCTORS.map((doc) => {
              // Count checked in or active
              const activeCount = appointments.filter(
                (a) => a.doctorId === doc.id && a.status === "CHECKED_IN"
              ).length;
              const pendingCount = appointments.filter(
                (a) => a.doctorId === doc.id && a.status === "PENDING"
              ).length;

              return (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                      Room {doc.roomNumber}
                    </span>
                    {activeCount > 0 ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 truncate">
                    {doc.name.replace("Dr. ", "")}
                  </p>
                  <p className="text-[10px] text-teal-700 truncate">{doc.category}</p>
                  <div className="mt-2 pt-1 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">In Room: <strong>{activeCount}</strong></span>
                    {pendingCount > 0 && (
                      <span className="text-amber-700 font-bold">Review: {pendingCount}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Review Alert Callout */}
        {stats && stats.pendingCount > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0"></span>
              <div>
                <p className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2">
                  <span>{stats.pendingCount} Patient Payment Receipt(s) Awaiting Review</span>
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">Action Needed</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Patients have submitted payment proof via JazzCash/EasyPaisa. Inspect screenshot proof and click &quot;Approve Slot&quot; to officially confirm.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("PENDING");
                setDateFilter("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Filter to {stats.pendingCount} Pending Review(s)
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mb-6 space-y-3">
          {/* Quick Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: "ALL", label: "All Bookings", count: appointments.length },
              { id: "PENDING", label: "Pending Review", count: stats?.pendingCount || 0, isAmber: true },
              { id: "CONFIRMED", label: "Confirmed", count: appointments.filter((a) => a.status === "CONFIRMED").length },
              { id: "CHECKED_IN", label: "In Waiting / Room", count: appointments.filter((a) => a.status === "CHECKED_IN").length },
              { id: "REJECTED", label: "Declined", count: appointments.filter((a) => a.status === "REJECTED").length },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    if (tab.id === "PENDING") setDateFilter("ALL");
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                    isActive
                      ? tab.isAmber
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-teal-700 text-white shadow-xs"
                      : tab.isAmber && tab.count > 0
                      ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-white text-slate-800"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, phone (03XX-XXXXXXX), Token #, or TRX ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Verification</option>
              <option value="CONFIRMED">Confirmed Slots</option>
              <option value="CHECKED_IN">Patient Arrived / Checked-In</option>
              <option value="REJECTED">Declined / Fake Receipt</option>
            </select>

            {/* Doctor Filter */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="ALL">All Doctors</option>
              {CLINIC_DOCTORS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Room {d.roomNumber})
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today Only</option>
              <option value="TOMORROW">Tomorrow Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Showing <strong>{filteredAppointments.length}</strong> patient bookings
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setDoctorFilter("ALL");
                setDateFilter("ALL");
              }}
              className="text-teal-700 hover:underline cursor-pointer font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Live Queue Container (Dual View: Desktop Table + Mobile Touch Cards) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* DESKTOP VIEW: High-density 7-column table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Token # & Status</th>
                  <th className="py-3.5 px-4">Patient Details</th>
                  <th className="py-3.5 px-4">Doctor & Room</th>
                  <th className="py-3.5 px-4">Slot Time</th>
                  <th className="py-3.5 px-4">Payment Proof</th>
                  <th className="py-3.5 px-4 text-center">Receipt Image</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <p className="text-sm font-semibold">No patient appointments match the selected filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("ALL");
                          setDoctorFilter("ALL");
                          setDateFilter("ALL");
                        }}
                        className="mt-2 text-xs text-teal-700 font-bold underline"
                      >
                        Reset filters to view all
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const isPending = apt.status === "PENDING";
                    const isConfirmed = apt.status === "CONFIRMED";
                    const isCheckedIn = apt.status === "CHECKED_IN";
                    const isRejected = apt.status === "REJECTED";

                    return (
                      <tr
                        key={apt.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isPending ? "bg-amber-50/30" : ""
                        }`}
                      >
                        {/* Token & Status */}
                        <td className="py-4 px-4 align-top">
                          <span className="font-mono font-extrabold text-xs text-slate-900 block">
                            {apt.tokenNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 block mb-1">
                            {new Date(apt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>

                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span>Review Required</span>
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Confirmed</span>
                            </span>
                          )}
                          {isCheckedIn && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                              <UserCheck className="w-3 h-3 text-indigo-600" />
                              <span>Arrived / In Room</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>

                        {/* Patient Details */}
                        <td className="py-4 px-4 align-top">
                          <p className="font-extrabold text-slate-900">{apt.patientName}</p>
                          <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{apt.patientPhone}</span>
                            <a
                              href={`https://api.whatsapp.com/send?phone=${apt.patientPhone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-800"
                              title="Message patient on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5 inline" />
                            </a>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Age: {apt.patientAge} • {apt.patientGender}
                          </p>
                          {apt.reasonForVisit && (
                            <p className="text-[11px] text-slate-600 mt-1 italic line-clamp-1">
                              "{apt.reasonForVisit}"
                            </p>
                          )}
                        </td>

                        {/* Doctor & Room */}
                        <td className="py-4 px-4 align-top">
                          <p className="font-bold text-slate-900">{apt.doctorName}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            Room {apt.doctorRoom}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Fee: PKR {apt.doctorFee}
                          </span>
                        </td>

                        {/* Slot Time */}
                        <td className="py-4 px-4 align-top">
                          <p className="font-extrabold text-teal-800">{apt.timeSlot}</p>
                          <p className="text-xs text-slate-600 font-medium">{apt.date}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            20-Minute Window
                          </span>
                        </td>

                        {/* Payment Details */}
                        <td className="py-4 px-4 align-top">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              apt.paymentMethod === "JazzCash"
                                ? "bg-red-100 text-red-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {apt.paymentMethod}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 mt-1">
                            {apt.senderName}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500">
                            TRX: {apt.trxId || "N/A"}
                          </p>
                        </td>

                        {/* Receipt Thumbnail */}
                        <td className="py-4 px-4 align-top text-center">
                          {apt.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewAppointment(apt)}
                              className="group relative inline-block rounded-xl overflow-hidden border-2 border-slate-200 hover:border-teal-600 transition-all cursor-pointer shadow-xs"
                            >
                              <div className="w-12 h-16 relative bg-slate-100">
                                <Image
                                  src={apt.receiptUrl}
                                  alt="Screenshot Thumbnail"
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </div>
                              <span className="text-[9px] font-bold block bg-slate-800 text-white py-0.5">
                                Preview
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No image</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 align-top text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            {/* APPROVE / CONFIRM BUTTON */}
                            {isPending && (
                              <button
                                onClick={() => handleApprove(apt)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve Slot</span>
                              </button>
                            )}

                            {/* REJECT / FAKE RECEIPT BUTTON (Re-opens slot) */}
                            {(isPending || isConfirmed) && (
                              <button
                                onClick={() => setRejectionModalApt(apt)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject / Fake</span>
                              </button>
                            )}

                            {/* PATIENT ARRIVED / CHECK-IN BUTTON */}
                            {isConfirmed && (
                              <button
                                onClick={() => handleCheckIn(apt)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                              >
                                <DoorClosed className="w-3.5 h-3.5" />
                                <span>Arrived / In Room</span>
                              </button>
                            )}

                            {/* WhatsApp Confirmation Dispatch Link */}
                            <a
                              href={getPatientWhatsAppUrl(apt, isCheckedIn ? "reminder" : "approval")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 mt-1"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp Patient</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW: Dedicated Touch-Friendly Cards (iPhone, Android & small screens) */}
          <div className="block lg:hidden divide-y divide-slate-200">
            {filteredAppointments.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400">
                <p className="text-sm font-semibold">No appointments match the selected filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setDoctorFilter("ALL");
                    setDateFilter("ALL");
                  }}
                  className="mt-2 text-xs text-teal-700 font-bold underline"
                >
                  Reset filters to view all
                </button>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const isPending = apt.status === "PENDING";
                const isConfirmed = apt.status === "CONFIRMED";
                const isCheckedIn = apt.status === "CHECKED_IN";
                const isRejected = apt.status === "REJECTED";

                return (
                  <div
                    key={apt.id}
                    className={`p-4 sm:p-5 transition-colors ${
                      isPending ? "bg-amber-50/35" : "bg-white"
                    }`}
                  >
                    {/* Card Top: Token & Status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="font-mono font-black text-sm text-slate-900 block tracking-tight">
                          {apt.tokenNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(apt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {apt.date}
                        </span>
                      </div>

                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                            <span>Review Required</span>
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Confirmed</span>
                          </span>
                        )}
                        {isCheckedIn && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>In Room</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Declined</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Patient Details & Quick Contact */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/90 mb-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">{apt.patientName}</span>
                        <span className="text-slate-500 text-[11px]">Age: {apt.patientAge} • {apt.patientGender}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-teal-600" />
                          <a
                            href={`tel:${apt.patientPhone.replace(/[^0-9]/g, "")}`}
                            className="font-mono font-bold text-slate-800 hover:text-teal-700"
                          >
                            {apt.patientPhone}
                          </a>
                        </div>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${apt.patientPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>Chat</span>
                        </a>
                      </div>

                      {apt.reasonForVisit && (
                        <p className="text-[11px] text-slate-600 italic pt-1">
                          "{apt.reasonForVisit}"
                        </p>
                      )}
                    </div>

                    {/* Doctor, Room & Time Slot */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/80">
                        <span className="text-[10px] text-teal-700 font-bold block uppercase tracking-wider">
                          Doctor & Room
                        </span>
                        <p className="font-extrabold text-slate-900 truncate mt-0.5">{apt.doctorName}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-200 text-teal-900 inline-block mt-0.5">
                          Room {apt.doctorRoom}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/80">
                        <span className="text-[10px] text-teal-700 font-bold block uppercase tracking-wider">
                          Slot Time
                        </span>
                        <p className="font-black text-teal-900 mt-0.5">{apt.timeSlot}</p>
                        <span className="text-[10px] text-slate-500 block">20-Min Window</span>
                      </div>
                    </div>

                    {/* Payment Proof & Screenshot Thumbnail */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 mb-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              apt.paymentMethod === "JazzCash"
                                ? "bg-red-100 text-red-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {apt.paymentMethod}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-bold text-slate-900">PKR {apt.doctorFee}</span>
                        </div>
                        <p className="text-slate-700 font-semibold truncate text-[11px]">
                          Sender: <strong>{apt.senderName}</strong>
                        </p>
                        <p className="text-slate-500 font-mono text-[10px] truncate">
                          TRX: {apt.trxId || "N/A"}
                        </p>
                      </div>

                      {/* Receipt thumbnail */}
                      {apt.receiptUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewAppointment(apt)}
                          className="group relative shrink-0 rounded-xl overflow-hidden border-2 border-slate-300 hover:border-teal-600 transition-all cursor-pointer shadow-xs"
                          title="Inspect payment screenshot"
                        >
                          <div className="w-14 h-18 relative bg-slate-900">
                            <Image
                              src={apt.receiptUrl}
                              alt="Screenshot"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                          <span className="text-[9px] font-bold block bg-slate-900 text-white text-center py-0.5">
                            Inspect
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Card Action Bar (Thumb-friendly touch targets) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {isPending && (
                        <button
                          onClick={() => handleApprove(apt)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs cursor-pointer min-h-[42px]"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve Slot</span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => handleCheckIn(apt)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs cursor-pointer min-h-[42px]"
                        >
                          <DoorClosed className="w-4 h-4" />
                          <span>Mark Arrived</span>
                        </button>
                      )}

                      {(isPending || isConfirmed) && (
                        <button
                          onClick={() => setRejectionModalApt(apt)}
                          className="inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 transition-colors cursor-pointer min-h-[42px]"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      )}

                      <a
                        href={getPatientWhatsAppUrl(apt, isCheckedIn ? "reminder" : "approval")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs min-h-[42px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: RECEIPT IMAGE INSPECTION ================= */}
      {previewAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setPreviewAppointment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                  Payment Verification Inspection
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {previewAppointment.tokenNumber} — {previewAppointment.patientName}
                </h3>
              </div>
              <span className="font-bold text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                Fee: PKR {previewAppointment.doctorFee}
              </span>
            </div>

            {/* Verification Metadata Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <span className="text-slate-400 block text-[10px]">Method:</span>
                <strong className="text-slate-900">{previewAppointment.paymentMethod}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sender Name:</span>
                <strong className="text-slate-900">{previewAppointment.senderName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TRX ID / Digits:</span>
                <strong className="text-slate-900 font-mono">{previewAppointment.trxId || "N/A"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Status:</span>
                <strong className="text-teal-700">{previewAppointment.status}</strong>
              </div>
            </div>

            {/* High-Res Receipt Screenshot Display */}
            <div className="relative w-full max-w-sm mx-auto aspect-9/16 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-900">
              <Image
                src={previewAppointment.receiptUrl}
                alt="Full Payment Screenshot"
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <a
                href={previewAppointment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 underline"
              >
                Open Original Image in New Tab
              </a>

              <div className="flex items-center gap-2">
                {previewAppointment.status === "PENDING" && (
                  <button
                    onClick={() => {
                      handleApprove(previewAppointment);
                      setPreviewAppointment(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Confirm & Approve Slot
                  </button>
                )}
                <button
                  onClick={() => setPreviewAppointment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: REJECT / FAKE RECEIPT REASON ================= */}
      {rejectionModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-rose-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setRejectionModalApt(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">
              Decline Slot & Re-open to Public Queue
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Rejecting Token <strong>{rejectionModalApt.tokenNumber}</strong> for {rejectionModalApt.doctorName} will immediately release the <strong>{rejectionModalApt.timeSlot}</strong> slot so another patient can book it.
            </p>

            <div className="mb-4 text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reason for Rejection:
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Transaction TRX-ID not found in JazzCash statement, blurry screenshot, duplicate submission."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectionModalApt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Confirm Rejection & Free Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: WALK-IN / PHONE RESERVATION ================= */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowWalkInModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              New Walk-in / Phone Consultation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add walk-in patients or patients calling the reception landline directly to today’s schedule.
            </p>

            <form onSubmit={handleCreateWalkIn} className="space-y-3.5 text-left text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Doctor *</label>
                <select
                  value={walkInDoctor}
                  onChange={(e) => setWalkInDoctor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-sm"
                >
                  {CLINIC_DOCTORS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Room {d.roomNumber}) — PKR {d.fee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Time Slot (Today) *</label>
                <select
                  value={walkInSlot}
                  onChange={(e) => setWalkInSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-sm"
                >
                  {OPERATING_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Full name"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={walkInAge}
                    onChange={(e) => setWalkInAge(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={walkInPayment}
                    onChange={(e) => setWalkInPayment(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="JazzCash">Cash / JazzCash at Desk</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-teal-700 hover:bg-teal-800 cursor-pointer"
                >
                  Create & Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SYSTEM HEALTH & DIAGNOSTICS LOGS MODAL ================= */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowDiagnosticsModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">System Diagnostics & Error Logs</h3>
                <p className="text-xs text-slate-400">
                  Real-time error interception and crash-prevention records
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">
                  Total Logged Incidents: <strong>{systemErrors.length}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadDiagnostics}
                  disabled={isLoadingDiagnostics}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDiagnostics ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                {systemErrors.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearDiagnostics}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {systemErrors.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-400">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Zero System Errors Recorded</p>
                  <p className="text-xs text-slate-500 mt-1">
                    All components, API routes, and booking flows are executing normally.
                  </p>
                </div>
              ) : (
                systemErrors.map((err) => {
                  const isExpanded = expandedErrorId === err.id;
                  return (
                    <div
                      key={err.id}
                      className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 text-left text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-bold text-teal-400">{err.id}</span>
                        <span>{new Date(err.timestamp).toLocaleTimeString()} · {err.source}</span>
                      </div>
                      <p className="text-rose-300 font-semibold break-words">{err.message}</p>
                      {err.cause && (
                        <p className="text-amber-300 text-[11px] mt-1">Cause: {err.cause}</p>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-900 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setExpandedErrorId(isExpanded ? null : err.id)}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide Details" : "Inspect Stack & Trace"}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {isExpanded && err.stack && (
                        <pre className="mt-2 p-2 bg-slate-900 text-[10px] text-slate-400 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-32">
                          {err.stack}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-3 text-right">
              <button
                type="button"
                onClick={() => setShowDiagnosticsModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
