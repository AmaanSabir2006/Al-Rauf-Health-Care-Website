import fs from "fs";
import path from "path";
import { Appointment, AppointmentStatus, ReceptionStats, SlotStatus } from "./types";
import { CLINIC_DOCTORS, getDoctorOperatingSlots, generateTokenNumber } from "./constants";
import { savePaymentReceipt } from "./security";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabaseClient";

const DATA_DIR = path.join(process.cwd(), "data");
const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");
const TMP_APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json.tmp");

// Simple in-process lock mechanism to eliminate race conditions
let isLockActive = false;
const lockWaitQueue: Array<() => void> = [];

async function acquireLock(): Promise<void> {
  if (!isLockActive) {
    isLockActive = true;
    return;
  }
  return new Promise((resolve) => {
    lockWaitQueue.push(resolve);
  });
}

function releaseLock(): void {
  if (lockWaitQueue.length > 0) {
    const next = lockWaitQueue.shift();
    if (next) next();
  } else {
    isLockActive = false;
  }
}

/**
 * Initializes and ensures the data directory and appointments file exist.
 * Seeds with authentic Al Rauf Health Care doctors.
 */
function ensureDirectoryAndFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let shouldInitialize = false;

  if (!fs.existsSync(APPOINTMENTS_FILE)) {
    shouldInitialize = true;
  } else {
    try {
      const raw = fs.readFileSync(APPOINTMENTS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        shouldInitialize = true;
      }
    } catch (e) {
      shouldInitialize = true;
    }
  }

  if (shouldInitialize) {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

/**
 * Safely reads the appointments list from disk.
 */
function readAppointments(): Appointment[] {
  ensureDirectoryAndFile();
  try {
    const raw = fs.readFileSync(APPOINTMENTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading appointments file:", error);
    return [];
  }
}

/**
 * Atomically writes appointments to disk via rename to prevent file corruption.
 */
function writeAppointmentsAtomic(appointments: Appointment[]): void {
  ensureDirectoryAndFile();
  try {
    const content = JSON.stringify(appointments, null, 2);
    fs.writeFileSync(TMP_APPOINTMENTS_FILE, content, "utf-8");
    fs.renameSync(TMP_APPOINTMENTS_FILE, APPOINTMENTS_FILE);
  } catch (error) {
    console.error("Error writing appointments file atomically:", error);
    // Fallback direct write
    try {
      fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), "utf-8");
    } catch (fallbackError) {
      console.error("Critical fallback write error:", fallbackError);
    }
  }
}

function toDbRow(apt: Appointment) {
  const dbStatus = apt.status === "PENDING" ? "PENDING_VERIFICATION" : (apt.status || "PENDING_VERIFICATION");
  return {
    id: apt.id,
    token_number: apt.tokenNumber,
    patient_name: apt.patientName,
    patient_phone: apt.patientPhone,
    patient_age: apt.patientAge || 30,
    patient_gender: apt.patientGender || "Other",
    reason_for_visit: apt.reasonForVisit || "Consultation",
    doctor_id: apt.doctorId,
    doctor_name: apt.doctorName,
    doctor_specialty: apt.doctorSpecialty,
    doctor_fee: apt.doctorFee || 4000,
    doctor_room: apt.doctorRoom || "01",
    date: apt.date,
    time_slot: apt.timeSlot,
    payment_method: apt.paymentMethod || "Meezan Bank",
    sender_name: apt.senderName || "Patient",
    trx_id: apt.trxId || "N/A",
    receipt_url: apt.receiptUrl || null,
    status: dbStatus,
    created_at: apt.createdAt || new Date().toISOString(),
    checked_in_at: apt.checkedInAt || null,
    rejection_reason: apt.rejectionReason || null,
  };
}

function fromDbRow(row: any): Appointment {
  const appStatus =
    row.status === "PENDING_VERIFICATION" ? "PENDING" : (row.status as AppointmentStatus) || "PENDING";
  return {
    id: row.id,
    tokenNumber: row.token_number,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientAge: Number(row.patient_age) || 30,
    patientGender: row.patient_gender || "Other",
    reasonForVisit: row.reason_for_visit || "Consultation",
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    doctorFee: Number(row.doctor_fee) || 4000,
    doctorRoom: row.doctor_room || "01",
    date: row.date,
    timeSlot: row.time_slot,
    paymentMethod: row.payment_method || "Meezan Bank",
    senderName: row.sender_name || "Patient",
    trxId: row.trx_id || "N/A",
    receiptUrl: row.receipt_url || undefined,
    status: appStatus,
    createdAt: row.created_at,
    checkedInAt: row.checked_in_at || undefined,
    rejectionReason: row.rejection_reason || undefined,
  };
}

export const DataStore = {
  /**
   * Retrieves all appointments for reception staff with optional filtering.
   * Pulls from Supabase PostgreSQL if configured, with automatic local fallback.
   */
  async getAllAppointments(filters?: {
    date?: string;
    doctorId?: string;
    status?: string;
    search?: string;
  }): Promise<Appointment[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          let query = supabase.from("appointments").select("*").order("created_at", { ascending: false });
          if (filters?.date) query = query.eq("date", filters.date);
          if (filters?.doctorId && filters.doctorId !== "ALL") query = query.eq("doctor_id", filters.doctorId);
          if (filters?.status && filters.status !== "ALL") {
            const dbStatus = filters.status === "PENDING" ? "PENDING_VERIFICATION" : filters.status;
            query = query.eq("status", dbStatus);
          }

          const { data, error } = await query;
          if (!error && data) {
            let list = data.map(fromDbRow);
            if (filters?.search) {
              const queryStr = filters.search.toLowerCase().trim();
              list = list.filter(
                (a) =>
                  a.patientName.toLowerCase().includes(queryStr) ||
                  a.patientPhone.includes(queryStr) ||
                  a.tokenNumber.toLowerCase().includes(queryStr) ||
                  (a.trxId && a.trxId.toLowerCase().includes(queryStr)) ||
                  (a.senderName && a.senderName.toLowerCase().includes(queryStr))
              );
            }
            return list;
          }
        } catch (err) {
          console.warn("Supabase fetch failed, falling back to local file:", err);
        }
      }
    }

    // Local JSON File Fallback
    let list = readAppointments();

    if (filters) {
      if (filters.date) {
        list = list.filter((a) => a.date === filters.date);
      }
      if (filters.doctorId && filters.doctorId !== "ALL") {
        list = list.filter((a) => a.doctorId === filters.doctorId);
      }
      if (filters.status && filters.status !== "ALL") {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        list = list.filter(
          (a) =>
            a.patientName.toLowerCase().includes(query) ||
            a.patientPhone.includes(query) ||
            a.tokenNumber.toLowerCase().includes(query) ||
            (a.trxId && a.trxId.toLowerCase().includes(query)) ||
            (a.senderName && a.senderName.toLowerCase().includes(query))
        );
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Internal staff lookup by internal ID
   */
  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          const { data, error } = await supabase.from("appointments").select("*").eq("id", id).maybeSingle();
          if (!error && data) return fromDbRow(data);
        } catch (err) {
          console.warn("Supabase getAppointmentById failed, fallback to local:", err);
        }
      }
    }

    const list = readAppointments();
    return list.find((a) => a.id === id);
  },

  /**
   * Public tracking lookup: Masks sensitive PII to prevent token enumeration leaks.
   */
  async getPublicTracking(tokenNumber: string): Promise<{
    tokenNumber: string;
    patientName: string;
    maskedPatientName: string;
    patientPhone: string;
    maskedPhone: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    doctorRoom: string;
    date: string;
    timeSlot: string;
    status: AppointmentStatus;
    paymentMethod: string;
    trxId: string;
    rejectionReason?: string;
    createdAt: string;
  } | null> {
    const cleanToken = tokenNumber.trim().toUpperCase();
    let apt: Appointment | undefined;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .ilike("token_number", cleanToken)
            .maybeSingle();
          if (!error && data) {
            apt = fromDbRow(data);
          }
        } catch (err) {
          console.warn("Supabase tracking lookup failed, fallback to local:", err);
        }
      }
    }

    if (!apt) {
      const list = readAppointments();
      apt = list.find((a) => a.tokenNumber.toUpperCase() === cleanToken);
    }

    if (!apt) return null;

    // Mask patient name: e.g. "Muhammad Zubair" -> "M******* Z*****"
    const nameParts = apt.patientName.split(" ");
    const maskedName = nameParts
      .map((part) => (part.length > 1 ? part[0] + "*".repeat(part.length - 1) : part))
      .join(" ");

    // Mask phone: "0301-8492019" -> "0301-***2019"
    let maskedPhone = apt.patientPhone;
    if (apt.patientPhone.length >= 8) {
      maskedPhone = apt.patientPhone.slice(0, 5) + "***" + apt.patientPhone.slice(-4);
    }

    // Mask transaction ID: e.g. "TRX-98314207" -> "***4207"
    const maskedTrx = apt.trxId && apt.trxId.length > 4
      ? "***" + apt.trxId.slice(-4)
      : (apt.trxId || "Attached");

    return {
      tokenNumber: apt.tokenNumber,
      patientName: maskedName,
      maskedPatientName: maskedName,
      patientPhone: maskedPhone,
      maskedPhone,
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      doctorSpecialty: apt.doctorSpecialty,
      doctorRoom: apt.doctorRoom || "01",
      date: apt.date,
      timeSlot: apt.timeSlot,
      status: apt.status,
      paymentMethod: apt.paymentMethod,
      trxId: maskedTrx,
      rejectionReason: apt.status === "REJECTED" ? apt.rejectionReason : undefined,
      createdAt: apt.createdAt,
    };
  },

  /**
   * Returns slot availability list for a doctor on a specific date.
   */
  async getSlotStatuses(doctorId: string, date: string): Promise<SlotStatus[]> {
    let bookedSlots: Array<{ timeSlot: string; status: AppointmentStatus }> = [];
    let fetchedFromSupabase = false;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("appointments")
            .select("time_slot, status")
            .eq("doctor_id", doctorId)
            .eq("date", date)
            .neq("status", "REJECTED");

          if (!error && data) {
            bookedSlots = data.map((d: any) => ({
              timeSlot: d.time_slot,
              status: (d.status === "PENDING_VERIFICATION" ? "PENDING" : d.status) as AppointmentStatus,
            }));
            fetchedFromSupabase = true;
          }
        } catch (err) {
          console.warn("Supabase slot check failed, fallback to local:", err);
        }
      }
    }

    if (!fetchedFromSupabase) {
      const list = readAppointments();
      const doctorApts = list.filter(
        (a) => a.doctorId === doctorId && a.date === date && a.status !== "REJECTED"
      );
      bookedSlots = doctorApts.map((a) => ({ timeSlot: a.timeSlot, status: a.status }));
    }

    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeekShort = dateObj.toLocaleDateString("en-US", { weekday: "short" });

    const operatingSlots = getDoctorOperatingSlots(doctorId, dayOfWeekShort);
    if (operatingSlots.length === 0) {
      return [];
    }

    return operatingSlots.map((slotTime) => {
      const match = bookedSlots.find((a) => a.timeSlot === slotTime);
      if (!match) {
        return {
          time: slotTime,
          status: "AVAILABLE",
        };
      }

      return {
        time: slotTime,
        status: match.status === "PENDING" ? "PENDING" : "CONFIRMED",
      };
    });
  },

  /**
   * Thread-safe, locked appointment creation to eliminate race conditions and double-bookings.
   */
  async createAppointment(
    payload: Omit<Appointment, "id" | "tokenNumber" | "status" | "createdAt">
  ): Promise<{ success: boolean; appointment?: Appointment; message?: string }> {
    await acquireLock();
    try {
      // Payment receipt is mandatory to reserve a slot
      if (!payload.receiptUrl || !payload.receiptUrl.trim() || payload.receiptUrl === "undefined") {
        return {
          success: false,
          message: "Payment transaction screenshot is strictly required to reserve a consultation slot.",
        };
      }

      const doctor = CLINIC_DOCTORS.find((d) => d.id === payload.doctorId);
      if (!doctor) {
        return {
          success: false,
          message: "Selected doctor does not exist.",
        };
      }

      // Validate operating day
      const [year, month, day] = payload.date.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeekShort = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      const allowedSlots = getDoctorOperatingSlots(payload.doctorId, dayOfWeekShort);

      if (allowedSlots.length === 0) {
        return {
          success: false,
          message:
            payload.doctorId === "doc-kamran-rauf" && dayOfWeekShort === "Sun"
              ? "Prof. Dr. Kamran Rauf is off on Sundays. Consultation hours are Monday to Friday: 4:00 PM – 9:00 PM, and Saturday: 1:00 PM – 6:00 PM."
              : `${doctor.name} does not have clinic consultation hours on ${dayOfWeekShort}s.`,
        };
      }

      if (!allowedSlots.includes(payload.timeSlot)) {
        return {
          success: false,
          message: `The selected time slot (${payload.timeSlot}) is not valid for ${doctor.name} on ${dayOfWeekShort}s.`,
        };
      }

      // 1. Contention check in Supabase (if configured)
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          try {
            const { data: existing } = await supabase
              .from("appointments")
              .select("id, status")
              .eq("doctor_id", payload.doctorId)
              .eq("date", payload.date)
              .eq("time_slot", payload.timeSlot)
              .neq("status", "REJECTED");

            if (existing && existing.length > 0) {
              const isPending = existing[0].status === "PENDING";
              return {
                success: false,
                message: isPending
                  ? "This slot has just been reserved under payment verification by another patient. Please choose another slot."
                  : "This time slot is already confirmed and booked for this specialist. Please select another slot.",
              };
            }
          } catch (err) {
            console.warn("Supabase contention check failed:", err);
          }
        }
      }

      // 2. Contention check in local memory/file
      const list = readAppointments();
      const existing = list.find(
        (a) =>
          a.doctorId === payload.doctorId &&
          a.date === payload.date &&
          a.timeSlot === payload.timeSlot &&
          a.status !== "REJECTED"
      );

      if (existing) {
        return {
          success: false,
          message:
            existing.status === "PENDING"
              ? "This slot has just been reserved under payment verification by another patient. Please choose another slot."
              : "This time slot is already confirmed and booked for this specialist. Please select another slot.",
        };
      }

      const tokenNumber = generateTokenNumber();
      const newAppointment: Appointment = {
        ...payload,
        doctorFee: doctor.fee, // Force canonical doctor fee (PKR 4,000)
        id: "apt-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        tokenNumber,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };

      // Insert to Supabase if configured
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          try {
            const { error: insErr } = await supabase.from("appointments").insert(toDbRow(newAppointment));
            if (insErr) {
              console.warn("Supabase appointment insertion warning:", insErr);
            }
          } catch (err) {
            console.warn("Supabase appointment insertion error:", err);
          }
        }
      }

      // Always write to local file as immediate local backup
      list.unshift(newAppointment);
      writeAppointmentsAtomic(list);

      return {
        success: true,
        appointment: newAppointment,
      };
    } finally {
      releaseLock();
    }
  },

  /**
   * Thread-safe update of appointment status with lock.
   */
  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    extra?: { rejectionReason?: string; notes?: string }
  ): Promise<{ success: boolean; appointment?: Appointment; message?: string }> {
    await acquireLock();
    try {
      const list = readAppointments();
      let index = list.findIndex((a) => a.id === id);

      if (index === -1 && isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          try {
            const { data } = await supabase.from("appointments").select("*").eq("id", id).maybeSingle();
            if (data) {
              const apt = fromDbRow(data);
              list.unshift(apt);
              index = 0;
            }
          } catch {
            // ignore
          }
        }
      }

      if (index === -1) {
        return { success: false, message: "Appointment not found." };
      }

      list[index].status = status;
      if (status === "REJECTED" && extra?.rejectionReason) {
        list[index].rejectionReason = extra.rejectionReason;
      }
      if (status === "CHECKED_IN") {
        list[index].checkedInAt = new Date().toISOString();
      }
      if (extra?.notes) {
        list[index].receptionNotes = extra.notes;
      }

      // Update in Supabase if configured
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          try {
            const dbStatus = status === "PENDING" ? "PENDING_VERIFICATION" : status;
            const updatePayload: any = { status: dbStatus };
            if (status === "REJECTED" && extra?.rejectionReason) {
              updatePayload.rejection_reason = extra.rejectionReason;
            }
            if (status === "CHECKED_IN") {
              updatePayload.checked_in_at = list[index].checkedInAt;
            }
            await supabase.from("appointments").update(updatePayload).eq("id", id);
          } catch (err) {
            console.warn("Supabase status update error:", err);
          }
        }
      }

      writeAppointmentsAtomic(list);
      return { success: true, appointment: list[index] };
    } finally {
      releaseLock();
    }
  },

  /**
   * Thread-safe deletion of appointment with lock.
   */
  async deleteAppointment(id: string): Promise<boolean> {
    await acquireLock();
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          try {
            await supabase.from("appointments").delete().eq("id", id);
          } catch (err) {
            console.warn("Supabase appointment delete error:", err);
          }
        }
      }

      let list = readAppointments();
      const initialLen = list.length;
      list = list.filter((a) => a.id !== id);
      if (list.length !== initialLen) {
        writeAppointmentsAtomic(list);
        return true;
      }
      return false;
    } finally {
      releaseLock();
    }
  },

  /**
   * Computes reception metrics.
   */
  async getReceptionStats(): Promise<ReceptionStats> {
    const todayStr = new Date().toISOString().split("T")[0];

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          const { data, error } = await supabase.from("appointments").select("date, status, doctor_fee");
          if (!error && data) {
            const todayApts = data.filter((a: any) => a.date === todayStr);
            const pending = data.filter((a: any) => a.status === "PENDING" || a.status === "PENDING_VERIFICATION").length;
            const confirmedToday = todayApts.filter((a: any) => a.status === "CONFIRMED").length;
            const checkedInToday = todayApts.filter((a: any) => a.status === "CHECKED_IN").length;
            const rejectedToday = todayApts.filter((a: any) => a.status === "REJECTED").length;
            const todayRevenue = todayApts
              .filter((a: any) => a.status === "CONFIRMED" || a.status === "CHECKED_IN")
              .reduce((sum: number, a: any) => sum + (Number(a.doctor_fee) || 0), 0);

            return {
              totalToday: todayApts.length,
              pendingCount: pending,
              confirmedCount: confirmedToday,
              checkedInCount: checkedInToday,
              rejectedCount: rejectedToday,
              todayRevenue,
            };
          }
        } catch (err) {
          console.warn("Supabase stats query warning:", err);
        }
      }
    }

    // Local JSON File Fallback
    const list = readAppointments();
    const todayApts = list.filter((a) => a.date === todayStr);

    const pending = list.filter((a) => a.status === "PENDING" || (a.status as any) === "PENDING_VERIFICATION").length;
    const confirmedToday = todayApts.filter((a) => a.status === "CONFIRMED").length;
    const checkedInToday = todayApts.filter((a) => a.status === "CHECKED_IN").length;
    const rejectedToday = todayApts.filter((a) => a.status === "REJECTED").length;

    const todayRevenue = todayApts
      .filter((a) => a.status === "CONFIRMED" || a.status === "CHECKED_IN")
      .reduce((sum, a) => sum + (a.doctorFee || 0), 0);

    return {
      totalToday: todayApts.length,
      pendingCount: pending,
      confirmedCount: confirmedToday,
      checkedInCount: checkedInToday,
      rejectedCount: rejectedToday,
      todayRevenue,
    };
  },
};

