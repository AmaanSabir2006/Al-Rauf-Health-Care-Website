"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  X,
  Send,
  User,
  Phone,
  FileText,
  CreditCard,
  Printer,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Loader2,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CLINIC_DOCTORS, CLINIC_INFO, getAvailableDates } from "@/lib/constants";
import { Appointment, Doctor, SlotStatus } from "@/lib/types";
import WhatsAppAvatar from "@/components/WhatsAppAvatar";
import { reportClientError } from "@/lib/clientLogger";

interface BookingWizardProps {
  initialDoctor?: Doctor | null;
}

export default function BookingWizard({ initialDoctor }: BookingWizardProps) {
  // Wizard state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(
    initialDoctor || CLINIC_DOCTORS[0]
  );

  useEffect(() => {
    if (initialDoctor) {
      setSelectedDoctor(initialDoctor);
      setSelectedSlot(null);
    }
  }, [initialDoctor]);

  const [availableDates, setAvailableDates] = useState<ReturnType<typeof getAvailableDates>>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    const dates = getAvailableDates(14);
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].dateStr);
    }
  }, []);
  const [slots, setSlots] = useState<SlotStatus[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [doctorOffDayMessage, setDoctorOffDayMessage] = useState<string | null>(null);
  const [timingsLabel, setTimingsLabel] = useState<string>("");

  // Patient Info Form
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState<number | "">(32);
  const [patientGender, setPatientGender] = useState<"Male" | "Female" | "Child" | "Other">("Male");
  const [reasonForVisit, setReasonForVisit] = useState("");

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState<string>("Meezan Bank");
  const [senderName, setSenderName] = useState("");
  const [trxId, setTrxId] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptRawFile, setReceiptRawFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>("");

  // Feedback states
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  // Multi-step progress (1: Selection & Slot, 2: Patient Info & Payment, 3: Success Confirmation)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialDoctor when prop changes
  useEffect(() => {
    if (initialDoctor) {
      setSelectedDoctor(initialDoctor);
      setSelectedSlot(null);
      setWizardStep(1);
    }
  }, [initialDoctor]);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDoctor || !selectedDate) return;
      setIsLoadingSlots(true);
      setDoctorOffDayMessage(null);
      setSelectedSlot(null);

      try {
        const res = await fetch(
          `/api/slots?doctorId=${selectedDoctor.id}&date=${selectedDate}`
        );
        const data = await res.json();

        if (data.success) {
          setSlots(data.slots || []);
          if (data.timingsLabel) {
            setTimingsLabel(data.timingsLabel);
          }
          if (!data.isDoctorActiveOnDay) {
            if (selectedDoctor.id === "doc-kamran-rauf" && data.dayName === "Sun") {
              setDoctorOffDayMessage(
                "Prof. Dr. Kamran Rauf is off on Sundays. Consultation hours are Monday to Friday: 4:00 PM – 9:00 PM, and Saturday: 1:00 PM – 6:00 PM."
              );
            } else {
              setDoctorOffDayMessage(
                `${selectedDoctor.name} does not have clinic hours on ${data.dayName}s. Available days: ${selectedDoctor.activeDays.join(", ")}.`
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
        reportClientError(err, { component: "BookingWizard", action: "fetchSlots" });
        setDoctorOffDayMessage("Unable to load live consultation slots. Please check your network or proceed via WhatsApp.");
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // Copy to clipboard helper with mobile fallback
  const copyToClipboard = (text: string, type: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    } catch {
      fallbackCopyText(text);
    }
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (err) {
      console.warn("Fallback copy failed:", err);
    }
  };

  // Image Upload handler
  const handleImageFile = (file: File) => {
    if (!file) return;

    if (file.size > 3.5 * 1024 * 1024) {
      setErrorMessage("Image file exceeds the 3.5MB size limit. Please upload a smaller screenshot.");
      return;
    }

    setReceiptRawFile(file);
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Quick Demo: Load sample receipt
  const loadSampleReceipt = async () => {
    setReceiptImage("/images/sample-receipt.jpg");
    setReceiptFileName("meezan_bank_receipt.jpg");
    setSenderName("Muhammad Zubair");
    setTrxId("TRX-98314207");
    setErrorMessage(null);

    try {
      const res = await fetch("/images/sample-receipt.jpg");
      const blob = await res.blob();
      const file = new File([blob], "meezan_bank_receipt.jpg", {
        type: blob.type || "image/jpeg",
      });
      setReceiptRawFile(file);
    } catch {
      setReceiptRawFile(null);
    }
  };

  // Proceed from Step 1 to Step 2
  const handleProceedToPayment = () => {
    if (!selectedSlot) {
      setErrorMessage("Please select a 20-minute consultation slot to continue.");
      return;
    }
    setErrorMessage(null);
    setWizardStep(2);
    // Smooth scroll to top of booking section
    const el = document.getElementById("booking-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Submit Final Booking
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate phone number format (03XX-XXXXXXX or 03XXXXXXXXX)
    const cleanPhone = patientPhone.replace(/[\s-]/g, "");
    if (!/^03\d{9}$/.test(cleanPhone)) {
      setErrorMessage("Please enter a valid 11-digit Pakistani mobile number (e.g., 0300-1234567).");
      return;
    }

    if (!patientName.trim()) {
      setErrorMessage("Please provide the patient's full name.");
      return;
    }

    if (!senderName.trim()) {
      setErrorMessage("Please enter the sender's account title as shown on your bank/transfer app.");
      return;
    }

    if (!receiptImage || !receiptImage.trim()) {
      setErrorMessage("Please upload your payment transaction screenshot before submitting. Slots are reserved ONLY when payment proof is uploaded.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientPhone,
          patientAge,
          patientGender,
          reasonForVisit,
          doctorId: selectedDoctor.id,
          date: selectedDate,
          timeSlot: selectedSlot,
          paymentMethod,
          senderName,
          trxId: trxId || "N/A",
          receiptUrl: receiptImage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to confirm appointment. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setBookedAppointment(data.appointment);
      setWizardStep(3);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }
    } catch (err) {
      console.error("Booking error:", err);
      reportClientError(err, {
        component: "BookingWizard",
        action: "handleFinalSubmit",
        additional: { doctorId: selectedDoctor.id, date: selectedDate, slot: selectedSlot },
      });
      setErrorMessage("Connection error submitting appointment. Your request was logged for technical review, and you can also send confirmation directly on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to book another appointment
  const handleReset = () => {
    setWizardStep(1);
    setSelectedSlot(null);
    setBookedAppointment(null);
    setReceiptImage(null);
    setReceiptRawFile(null);
    setReceiptFileName("");
    setSenderName("");
    setTrxId("");
    setErrorMessage(null);
  };

  // Helper to get absolute online URL for payment receipt screenshot
  const getReceiptScreenshotUrl = () => {
    if (!bookedAppointment?.receiptUrl) return "";
    const url = bookedAppointment.receiptUrl;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}${url}`;
    }
    return url;
  };

  // WhatsApp Dispatch URL builder (includes direct screenshot cloud link)
  const getWhatsAppDispatchUrl = () => {
    if (!bookedAppointment) return "#";

    const screenshotUrl = getReceiptScreenshotUrl();

    const msg = [
      `*Assalam-o-Alaikum Al Rauf Health Care Desk,*`,
      `I have booked a consultation slot. Here are my details:`,
      `• *Patient Name:* ${bookedAppointment.patientName}`,
      `• *Phone:* ${bookedAppointment.patientPhone}`,
      `• *Doctor:* ${bookedAppointment.doctorName}`,
      `• *Date & Time:* ${bookedAppointment.date} at ${bookedAppointment.timeSlot}`,
      `• *Token #:* ${bookedAppointment.tokenNumber}`,
      `• *Payment Method:* ${bookedAppointment.paymentMethod}`,
      `• *Sender Account:* ${bookedAppointment.senderName}`,
      `• *TRX ID / Last 4:* ${bookedAppointment.trxId || "Attached"}`,
      screenshotUrl ? `• *Payment Proof Screenshot:* ${screenshotUrl}` : "",
      `\n*(Please verify my payment screenshot link above & confirm my token for Dr. Kamran Rauf's clinic)*`,
    ].filter(Boolean).join("\n");

    return `https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}&text=${encodeURIComponent(msg)}`;
  };

  // WhatsApp Direct Dispatch (opens directly to clinic reception WhatsApp: 0320 8119978)
  const handleShareToWhatsApp = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!bookedAppointment) return;

    const screenshotUrl = getReceiptScreenshotUrl();
    const msg = [
      `*Assalam-o-Alaikum Al Rauf Health Care Reception (03208119978),*`,
      `I have booked a consultation slot. Here are my details:`,
      `• *Patient Name:* ${bookedAppointment.patientName}`,
      `• *Phone:* ${bookedAppointment.patientPhone}`,
      `• *Doctor:* ${bookedAppointment.doctorName}`,
      `• *Date & Time:* ${bookedAppointment.date} at ${bookedAppointment.timeSlot}`,
      `• *Token #:* ${bookedAppointment.tokenNumber}`,
      `• *Payment Method:* ${bookedAppointment.paymentMethod}`,
      `• *Sender Account:* ${bookedAppointment.senderName}`,
      `• *TRX ID / Last 4:* ${bookedAppointment.trxId || "Attached"}`,
      screenshotUrl ? `• *Payment Proof Screenshot:* ${screenshotUrl}` : "",
      `\n*(Please verify my payment screenshot link above & confirm my token for Dr. Kamran Rauf's clinic)*`,
    ].filter(Boolean).join("\n");

    const targetUrl = `https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}&text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  // Step 2 preview dispatch (direct to clinic reception WhatsApp: 0320 8119978)
  const handleShareStep2Preview = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const msg = [
      `*Assalam-o-Alaikum Al Rauf Health Care Reception (03208119978),*`,
      `I am sharing my payment screenshot for consultation booking.`,
      `• *Patient:* ${patientName || "Consultation"}`,
      `• *Doctor:* ${selectedDoctor.name}`,
      `• *Date & Time:* ${selectedDate} at ${selectedSlot || "Pending Slot"}`,
      `• *Payment Method:* ${paymentMethod}`,
      `• *Sender Account:* ${senderName || "Patient"}`,
      `• *TRX ID:* ${trxId || "Attached"}`,
      `\n*(Sending payment screenshot for pre-booking verification to WhatsApp 03208119978)*`,
    ].join("\n");

    const targetUrl = `https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}&text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  // Download screenshot locally
  const handleDownloadScreenshot = () => {
    const src = bookedAppointment?.receiptUrl || receiptImage;
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `Payment-Proof-${bookedAppointment?.tokenNumber || "receipt"}.jpg`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section id="booking-section" className="py-16 sm:py-20 bg-white relative scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wizard Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Digital Appointment Portal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Book Your 20-Minute Consultation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Real-time doctor slot isolation. Dedicated 20-minute interval per patient to eliminate waiting room congestion.
          </p>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-1.5 xs:gap-3 sm:gap-6 mt-6 max-w-md mx-auto">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold ${wizardStep >= 1 ? "text-teal-700" : "text-slate-400"
                }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0 ${wizardStep >= 1 ? "bg-teal-700" : "bg-slate-300"
                  }`}
              >
                1
              </span>
              <span><span className="hidden xs:inline">Doctor & </span>Slot</span>
            </div>
            <div className={`h-0.5 w-3 xs:w-8 sm:w-12 ${wizardStep >= 2 ? "bg-teal-600" : "bg-slate-200"}`}></div>
            <div
              className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold ${wizardStep >= 2 ? "text-teal-700" : "text-slate-400"
                }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0 ${wizardStep >= 2 ? "bg-teal-700" : "bg-slate-300"
                  }`}
              >
                2
              </span>
              <span><span className="hidden xs:inline">Patient & </span>Payment</span>
            </div>

            <div className={`h-0.5 w-3 xs:w-8 sm:w-12 ${wizardStep === 3 ? "bg-emerald-600" : "bg-slate-200"}`}></div>
            <div
              className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold ${wizardStep === 3 ? "text-emerald-700" : "text-slate-400"
                }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0 ${wizardStep === 3 ? "bg-emerald-600" : "bg-slate-300"
                  }`}
              >
                3
              </span>
              <span>Pass</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Action Required</p>
              <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700 text-xs font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= STEP 1: DOCTOR & 20-MIN SLOT SELECTION ================= */}
        {wizardStep === 1 && (
          <div className="max-w-4xl mx-auto bg-slate-50/70 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            {/* 1. Choose Doctor Visual Dropdown / Grid */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                1. Select Specialist Physician:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CLINIC_DOCTORS.map((doc) => {
                  const isSelected = selectedDoctor.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setSelectedDoctor(doc)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${isSelected
                          ? "bg-white border-teal-600 ring-2 ring-teal-600/30 shadow-md"
                          : "bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300"
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative bg-[#DFE5E7] border border-slate-200 flex items-center justify-center">
                        {doc.id === "doc-kamran-rauf" ? (
                          <Image
                            src="/images/dr-kamran-rauf.jpg"
                            alt={doc.name}
                            fill
                            className="object-cover object-top"
                          />
                        ) : (
                          <WhatsAppAvatar />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-teal-700 font-semibold truncate">
                          {doc.specialty}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span className="text-emerald-700 font-semibold">{doc.pmcRegistration}</span>
                          <span className="font-bold text-slate-900">PKR {doc.fee.toLocaleString()}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Choose Date (14-day strip) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-800">
                  2. Select Consultation Date:
                </label>
                <span className="text-xs text-slate-500">
                  Active Days: {selectedDoctor.activeDays.join(", ")}
                </span>
              </div>

              {/* Horizontal Date Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {availableDates.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  const isDoctorActive = selectedDoctor.activeDays.includes(d.dayNameShort);

                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`min-w-[80px] p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${isSelected
                          ? "bg-teal-700 text-white border-teal-700 shadow-md scale-102"
                          : isDoctorActive
                            ? "bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50"
                            : "bg-slate-100 text-slate-400 border-slate-200/60 opacity-60"
                        }`}
                    >
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-teal-200" : "text-slate-400"}`}>
                        {d.isToday ? "Today" : d.isTomorrow ? "Tomorrow" : d.dayNameShort}
                      </p>
                      <p className="text-sm font-extrabold mt-0.5">
                        {d.formatted.split(" ")[0]} {d.formatted.split(" ")[1]?.replace(",", "")}
                      </p>
                      {!isDoctorActive && (
                        <span className="text-[9px] block text-rose-500 font-semibold mt-0.5">Off Day</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {doctorOffDayMessage && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{doctorOffDayMessage} You may still book in advance for open days.</span>
                </div>
              )}
            </div>

            {/* Slot Reservation Policy Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-teal-50/90 border border-teal-200/90 flex items-start sm:items-center gap-3 text-xs text-teal-950 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-teal-900 text-xs sm:text-sm">
                  Reservation & Slot Lock Policy:
                </p>
                <p className="text-teal-800 text-[11px] sm:text-xs mt-0.5">
                  Selecting a time slot here does <strong>not</strong> hold or lock it. The slot is officially reserved and locked in the clinic system <strong>only after your payment screenshot is uploaded and submitted</strong> in Step 2.
                </p>
              </div>
            </div>

            {/* 3. Dynamic 20-Minute Slots Grid */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <label className="text-sm font-bold text-slate-800 block">
                    3. Choose 20-Minute Slot ({timingsLabel || "Hours: 12:00 PM – 09:00 PM"}):
                  </label>
                  <span className="text-xs text-slate-500">
                    {slots.length > 0
                      ? `${slots.length} Dedicated 20-minute slots. Real-time isolation active.`
                      : "Doctor is off / Closed on this date."}
                  </span>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600">Under Review</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span className="text-slate-400">Booked</span>
                  </div>
                </div>
              </div>

              {isLoadingSlots ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="w-7 h-7 text-teal-600 animate-spin" />
                  <span className="text-xs font-semibold">Checking live slot availability...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-10 px-6 rounded-2xl bg-white border border-amber-200 text-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    No Consultation Slots Available on this Date
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                    {selectedDoctor.id === "doc-kamran-rauf"
                      ? "Prof. Dr. Kamran Rauf is off on Sundays. Consultation hours are Monday to Friday (4:00 PM – 9:00 PM) and Saturday (1:00 PM – 6:00 PM)."
                      : `${selectedDoctor.name} does not have clinic consultation hours on this day. Available days: ${selectedDoctor.activeDays.join(", ")}.`}
                  </p>
                  {selectedDoctor.id === "doc-kamran-rauf" && (
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => {
                          const nextMon = availableDates.find((d) => d.dayNameShort === "Mon");
                          if (nextMon) setSelectedDate(nextMon.dateStr);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold text-teal-800 bg-teal-50 border border-teal-300 hover:bg-teal-100 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>Switch to Monday (4:00 PM – 9:00 PM)</span>
                      </button>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => {
                          const nextSat = availableDates.find((d) => d.dayNameShort === "Sat");
                          if (nextSat) setSelectedDate(nextSat.dateStr);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold text-teal-800 bg-teal-50 border border-teal-300 hover:bg-teal-100 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>Switch to Saturday (1:00 PM – 6:00 PM)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                (() => {
                  const isAfternoon = (time: string) => {
                    const parts = time.split(":");
                    const h = parseInt(parts[0], 10);
                    return time.includes("PM") && (h === 12 || (h >= 1 && h <= 5));
                  };
                  const afternoonSlots = slots.filter((s) => isAfternoon(s.time));
                  const eveningSlots = slots.filter((s) => !isAfternoon(s.time));

                  const renderSlotBtn = (slot: SlotStatus) => {
                    const isSelected = selectedSlot === slot.time;
                    const isAvailable = slot.status === "AVAILABLE";
                    const isPending = slot.status === "PENDING";
                    const isBooked = slot.status === "CONFIRMED" || slot.status === "CHECKED_IN";

                    if (isAvailable) {
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          suppressHydrationWarning
                          onClick={() => {
                            setSelectedSlot(slot.time);
                            setErrorMessage(null);
                          }}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer relative ${isSelected
                              ? "bg-teal-700 text-white border-teal-700 shadow-md ring-4 ring-teal-500/30 scale-103 font-extrabold"
                              : "bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50"
                            }`}
                        >
                          {isSelected && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping mr-1"></span>
                          )}
                          <span>{slot.time}</span>
                        </button>
                      );
                    }

                    if (isPending) {
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          suppressHydrationWarning
                          disabled
                          title="Locked / Under Verification by Reception Desk"
                          className="py-2 px-1 rounded-xl text-[10px] font-bold text-center border bg-amber-50/90 border-amber-200 text-amber-700 opacity-80 cursor-not-allowed flex flex-col items-center justify-center"
                        >
                          <span>{slot.time}</span>
                          <span className="text-[8px] font-medium text-amber-600">Under Review</span>
                        </button>
                      );
                    }

                    // Booked
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        suppressHydrationWarning
                        disabled
                        title="Already Booked and Confirmed"
                        className="py-2.5 px-1 rounded-xl text-xs font-semibold text-center border bg-slate-100 border-slate-200/80 text-slate-400 cursor-not-allowed line-through"
                      >
                        {slot.time}
                      </button>
                    );
                  };

                  return (
                    <div className="space-y-4">
                      {afternoonSlots.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                            <span>☀️ Afternoon Consultation ({afternoonSlots.length} Slots):</span>
                          </span>
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-1.5 sm:gap-2">
                            {afternoonSlots.map(renderSlotBtn)}
                          </div>
                        </div>
                      )}

                      {eveningSlots.length > 0 && (
                        <div className="pt-2">
                          <span className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                            <span>🌙 Evening Consultation ({eveningSlots.length} Slots):</span>
                          </span>
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-1.5 sm:gap-2">
                            {eveningSlots.map(renderSlotBtn)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Bottom Step 1 Action Bar */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left w-full sm:w-auto">
                <span className="text-xs text-slate-500 block">Consultation Fee:</span>
                <p className="text-xl font-extrabold text-slate-900">
                  PKR {selectedDoctor.fee.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    (Zero Gateway Surcharges)
                  </span>
                </p>
                {selectedSlot && (
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">
                    Selected: {selectedDate} at {selectedSlot} with {selectedDoctor.name}
                  </p>
                )}
              </div>

              <button
                type="button"
                suppressHydrationWarning
                onClick={handleProceedToPayment}
                disabled={!selectedSlot}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedSlot
                    ? "bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20 cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <span>Continue to Patient Info & Payment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PATIENT INFO & MEEZAN BANK TRANSFER ================= */}
        {wizardStep === 2 && (
          <form
            onSubmit={handleFinalSubmit}
            className="max-w-4xl mx-auto bg-slate-50/70 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm"
          >
            {/* Top Appointment Recap Banner */}
            <div className="mb-8 p-4 rounded-2xl bg-white border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 border border-slate-200 bg-[#DFE5E7] flex items-center justify-center">
                  {selectedDoctor.id === "doc-kamran-rauf" ? (
                    <Image
                      src="/images/dr-kamran-rauf.jpg"
                      alt={selectedDoctor.name}
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <WhatsAppAvatar />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700">{selectedDoctor.specialty}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-emerald-700">{selectedDoctor.pmcRegistration}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {selectedDoctor.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    📅 {selectedDate} &nbsp;|&nbsp; ⏰ {selectedSlot} (20-Minute Slot)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Due:</span>
                  <span className="text-lg font-extrabold text-emerald-700">
                    PKR {selectedDoctor.fee.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                >
                  Change Slot
                </button>
              </div>
            </div>

            {/* Step 2 Reservation Notice */}
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-amber-900 text-xs">
                  Upload Payment Screenshot to Reserve & Lock Slot:
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Your selected slot (<strong>{selectedSlot}</strong> on <strong>{selectedDate}</strong>) is not locked yet. Uploading your payment screenshot below will immediately lock and reserve it for you.
                </p>
              </div>
            </div>

            {/* PART 1: PATIENT INFORMATION */}
            <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <span>Step 1: Patient Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Muhammad Zubair Khan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    WhatsApp / Contact Number (03XX-XXXXXXX) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pre-filled WhatsApp booking confirmation will be addressed to this number.
                  </span>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Age (Years) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="115"
                      required
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 35"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Gender *
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Child">Child (Under 12)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reason for Visit / Chief Complaint
                  </label>
                  <input
                    type="text"
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    placeholder="e.g. High fever, hypertension check, knee pain"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* PART 2: MANUAL MEEZAN BANK TRANSFER CARD */}
            <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Fee Transfer (Meezan Bank)</span>
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Fee: PKR {selectedDoctor.fee.toLocaleString()}
                </span>
              </div>

              {/* Instructions banner */}
              <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">How to transfer your consultation fee:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  <li>Open any banking application (<strong>Meezan Bank, HBL, UBL, EasyPaisa, JazzCash, SadaPay, NayaPay</strong>, etc.).</li>
                  <li>Select <strong>Meezan Bank</strong> as the destination bank and transfer <strong>PKR {selectedDoctor.fee.toLocaleString()}</strong> to the official account below.</li>
                  <li>Take a screenshot of the completed transfer confirmation and upload it in Step 3.</li>
                </ol>
              </div>

              {/* Official Meezan Bank Card */}
              <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50/50 via-teal-50/20 to-white shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200/60 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                      MB
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        {CLINIC_INFO.bankName}
                      </span>
                      <p className="text-[10px] text-emerald-700 font-semibold">Official Clinic Account</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Direct Account Transfer
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Account Title / Beneficiary:</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {CLINIC_INFO.bankAccountTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Please verify name displays as M Asif</p>
                  </div>

                  <div className="w-full">
                    <p className="text-xs text-slate-500 font-medium mb-1.5 flex items-center justify-between">
                      <span>Meezan Bank Account Number:</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">14-Digit</span>
                    </p>
                    <div
                      onClick={() => copyToClipboard(CLINIC_INFO.bankAccountNumber, "meezan")}
                      className="p-3 rounded-xl bg-white border-2 border-emerald-300 hover:border-emerald-500 shadow-2xs transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-wider select-all break-all">
                            {CLINIC_INFO.bankAccountNumber}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(CLINIC_INFO.bankAccountNumber, "meezan");
                          }}
                          className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 ${copiedAccount === "meezan"
                              ? "bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-400"
                              : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm"
                            }`}
                        >
                          {copiedAccount === "meezan" ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                              <span className="font-extrabold tracking-wide">Account Number Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-white shrink-0" />
                              <span>Copy Account Number</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right sm:text-left">Tap box or button to copy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PART 3: RECEIPT UPLOAD & SENDER DETAILS */}
            <div className="mb-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Step 3: Verification & Receipt Screenshot Upload</span>
                </h3>

                {/* Instant Demo Helper Button */}
                <button
                  type="button"
                  onClick={loadSampleReceipt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 cursor-pointer self-start sm:self-auto"
                  title="Quickly fill verified demo receipt for immediate testing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Load Sample Receipt Demo</span>
                </button>
              </div>

              {/* Sender Name & TRX ID inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sender Account Title (as shown on your Banking App) *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Muhammad Zubair"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Transaction ID / Last 4 Digits *
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. TRX-98314207 or last 4 digits (8492)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${receiptImage
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-slate-300 hover:border-teal-500 hover:bg-teal-50/30 bg-slate-50/50"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />

                {receiptImage ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={handleShareStep2Preview}
                      title="Click payment screenshot to send to WhatsApp: 03208119978"
                      className="group/img relative block cursor-pointer"
                    >
                      <div className="w-24 h-32 rounded-xl overflow-hidden relative border-2 border-emerald-500 shadow-sm shrink-0 group-hover/img:ring-4 group-hover/img:ring-emerald-400 transition-all cursor-pointer">
                        <Image
                          src={receiptImage}
                          alt="Uploaded Transaction Screenshot"
                          fill
                          unoptimized
                          className="object-cover group-hover/img:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-emerald-950/60 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center text-white transition-opacity p-1 text-center">
                          <Send className="w-5 h-5 text-emerald-300 mb-1" />
                          <span className="text-[10px] font-bold">Click to Send to 03208119978</span>
                        </div>
                      </div>
                    </button>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Receipt Attached Successfully</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-xs">
                        {receiptFileName || "screenshot.jpg"}
                      </p>
                      <button
                        type="button"
                        onClick={handleShareStep2Preview}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 mt-1 cursor-pointer transition-colors"
                      >
                        <Send className="w-3 h-3 text-emerald-600" />
                        <span>Send on WhatsApp: <strong>0320 8119978</strong></span>
                      </button>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptImage(null);
                            setReceiptRawFile(null);
                            setReceiptFileName("");
                          }}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Drag & Drop transaction screenshot here, or{" "}
                      <span className="text-teal-700 underline">Browse</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports JPG, PNG, WEBP (Max 5MB). Screenshot from your banking app showing transfer to Meezan Bank.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Back to Slots
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !receiptImage}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${!receiptImage
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300 shadow-none"
                    : "text-white bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 shadow-lg shadow-teal-700/25"
                  }`}
                title={
                  !receiptImage
                    ? "Please upload payment transaction screenshot above to book your appointment"
                    : "Confirm and officially book your consultation appointment"
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Booking Appointment...</span>
                  </>
                ) : !receiptImage ? (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Screenshot to Book Appointment</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Book Appointment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: SUCCESS & WHATSAPP DISPATCH ================= */}
        {wizardStep === 3 && bookedAppointment && (
          <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            {/* Success Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl text-center relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-100/60 rounded-full blur-2xl"></div>

              {/* Review Badge */}
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4 shadow-sm border border-amber-200">
                <Clock className="w-9 h-9 animate-pulse" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>STATUS: PENDING RECEPTION REVIEW</span>
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Booking Placed — Under Staff Review
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 mb-5">
                Your 20-minute slot is temporarily held. The clinic reception desk is verifying your payment screenshot before officially marking your consultation slot as <strong>CONFIRMED</strong>.
              </p>

              {/* Informative Workflow Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left mb-6 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-amber-900 mb-0.5">Verification Desk Notice</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Your appointment is currently in <strong>PENDING</strong> status. The reception desk at <strong>347- Riwaz Garden, Lahore</strong> must verify your Meezan Bank transfer screenshot. Please click below to send your confirmation to WhatsApp <strong>0320 8119978</strong> for instant staff approval.
                  </p>
                </div>
              </div>

              {/* Digital Medical Boarding Pass Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-left mb-6 relative shadow-sm overflow-hidden ticket-notch-left ticket-notch-right">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Medical Record / Token #
                    </span>
                    <p className="text-2xl font-mono font-black text-teal-800 tracking-wider">
                      {bookedAppointment.tokenNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Consultation Status
                    </span>
                    <p className="text-xs sm:text-sm font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                      ⏳ Pending Staff Approval
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Patient Name:</span>
                    <strong className="text-slate-800 text-sm">{bookedAppointment.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Doctor / Specialist:</span>
                    <strong className="text-slate-800 text-sm">{bookedAppointment.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date & Time:</span>
                    <strong className="text-slate-800">
                      {bookedAppointment.date} at {bookedAppointment.timeSlot}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payment Proof:</span>
                    <strong className="text-slate-800">
                      {bookedAppointment.paymentMethod} • {bookedAppointment.trxId}
                    </strong>
                  </div>
                </div>

                {/* Clickable Payment Screenshot Preview to WhatsApp 0320 8119978 */}
                {(bookedAppointment.receiptUrl || receiptImage) && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Payment Screenshot Proof:
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        📱 Send to: 0320 8119978
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleShareToWhatsApp}
                      title="Click payment screenshot to send via WhatsApp to 03208119978"
                      className="w-full text-left group flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100/50 transition-all cursor-pointer shadow-xs"
                    >
                      <div className="w-14 h-20 rounded-xl overflow-hidden relative border border-emerald-400 shrink-0 bg-white shadow-2xs">
                        <img
                          src={bookedAppointment.receiptUrl || receiptImage || ""}
                          alt="Transaction Screenshot"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                          <Send className="w-3 h-3 text-emerald-700" />
                          <span>Click Screenshot to Send on WhatsApp</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                          Recipient: 0320 8119978 (Al Rauf Clinic Reception)
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {receiptRawFile
                            ? "Tapping attaches actual image file on mobile + cloud link"
                            : "Includes direct cloud screenshot link in WhatsApp message"}
                        </p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Digital Barcode Aesthetic */}
                <div className="flex items-center justify-between border-t border-dashed border-slate-300 pt-3 my-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-mono">TOKEN BARCODE RECORD</span>
                    <div className="flex items-center gap-0.5 mt-1 h-5">
                      {[2, 4, 1, 3, 2, 5, 1, 3, 4, 2, 1, 4, 3, 2, 5, 2, 1, 3, 2, 4, 1, 3].map((w, idx) => (
                        <span key={idx} className="bg-slate-800 h-full rounded-xs" style={{ width: `${w * 1.5}px` }}></span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      🔒 Slot Held · Pending Review
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Venue: {CLINIC_INFO.addressFull}</span>
                  <span className="font-extrabold text-emerald-700">Fee: PKR {bookedAppointment.doctorFee}</span>
                </div>
              </div>

              {/* PROMINENT WHATSAPP DISPATCH BUTTON */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all group glow-emerald cursor-pointer"
                >
                  <Send className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
                  <span>Send Confirmation & Screenshot to WhatsApp</span>
                </button>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>
                    Direct dispatch to official clinic desk at <strong>{CLINIC_INFO.whatsappNumber}</strong>.
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadScreenshot}
                    className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Download Screenshot Image</span>
                  </button>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-teal-800 bg-teal-50 hover:bg-teal-100 font-bold border border-teal-200 cursor-pointer"
                >
                  <span>Book Another Slot</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
