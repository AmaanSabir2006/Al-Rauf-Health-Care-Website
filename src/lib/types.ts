export interface Doctor {
  id: string;
  name: string;
  degrees: string;
  specialty: string;
  subSpecialty?: string;
  designation?: string;
  category: "Endocrinology & Diabetes" | "General Medicine" | "Diagnostic Radiology" | "Urology & Andrology" | "Pediatrics" | "Cardiology" | string;
  fee: number; // in PKR
  roomNumber: string;
  activeDays: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  timings?: string; // custom consultation hours string
  experienceYears: number;
  rating: number;
  reviewCount: number;
  bio: string;
  image: string;
  pmcRegistration: string;
  services?: string[];
}

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CHECKED_IN";

export interface Appointment {
  id: string;
  tokenNumber: string; // e.g. "CLN-2026-0841"
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: "Male" | "Female" | "Child" | "Other";
  reasonForVisit: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorFee: number;
  doctorRoom: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "02:20 PM"
  paymentMethod: "JazzCash" | "EasyPaisa";
  senderName: string;
  trxId: string;
  receiptUrl: string; // URL or base64 data URI
  status: AppointmentStatus;
  rejectionReason?: string;
  createdAt: string;
  checkedInAt?: string;
  receptionNotes?: string;
}

export interface SlotStatus {
  time: string;
  status: "AVAILABLE" | "PENDING" | "CONFIRMED" | "CHECKED_IN";
  appointmentId?: string;
  tokenNumber?: string;
  patientName?: string;
}

export interface ReceptionStats {
  totalToday: number;
  pendingCount: number;
  confirmedCount: number;
  checkedInCount: number;
  rejectedCount: number;
  todayRevenue: number;
}
