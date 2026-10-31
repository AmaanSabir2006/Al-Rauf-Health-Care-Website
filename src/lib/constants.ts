import { Doctor } from "./types";

export const CLINIC_INFO = {
  name: "Al Rauf Health Care",
  shortName: "Al Rauf Health Care",
  tagline: "Expert Clinical Care & Seamless Digital Appointment Scheduling",
  leadPhysician: "Prof. Dr. Muhammad Kamran Rauf",
  leadPhysicianDegrees: "M.B.B.S (K.E), FCPS (Medicine), MRCP-SCE (UK), EBEEDM (RCP-Ireland)",
  leadPhysicianSpecialty: "Consultant Physician & Endocrinologist",
  leadPhysicianSubSpecialty: "Endocrinology, Diabetes & Metabolism",
  leadPhysicianDesignation: "Professor of Medicine, Fatima Memorial Hospital",
  address: "347- Riwaz Garden, Lahore, Pakistan",
  addressFull: "347- Riwaz Garden, Lahore, Pakistan (Near Chauburji)",
  whatsappNumber: "+92 320 8119978",
  whatsappRaw: "923208119978",
  whatsappNumberAlt: "+92 320 8119978",
  whatsappRawAlt: "923208119978",
  appointmentCall: "0315-8119978",
  appointmentCallRaw: "03158119978",
  doctorContact: "0315-8119978",
  receptionPhone: "0320-8119978",
  landlinePhone: "042 37171347",
  helplinePhone: "042 37171347",
  emergencyPhone: "0327-9446441",
  email: "drkamranrauf173@yahoo.com",
  timings: "Mon–Fri: 04:00 PM – 09:00 PM · Sat: 01:00 PM – 06:00 PM (Sunday Off)",
  drKamranTimings: "Mon–Fri: 04:00 PM – 09:00 PM | Sat: 01:00 PM – 06:00 PM (Sun: Off)",
  generalTimings: "12:00 PM – 09:00 PM (Consultant Specialists)",
  sundayTimings: "Prof. Dr. Muhammad Kamran Rauf: Off · Emergency Triage On-call",
  googleRating: "5.0 ★ (15 Google reviews)",
  googlePlaceId: "ChIJNcXsN1MDGTkRLvHiUVcndjs",
  googleReviewsUrl: "https://search.google.com/local/reviews?placeid=ChIJNcXsN1MDGTkRLvHiUVcndjs&authuser=0&hl=en",
  googleWriteReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJNcXsN1MDGTkRLvHiUVcndjs",
  bankName: "Meezan Bank",
  bankAccountNumber: "02600102986161",
  bankAccountTitle: "M Asif",
  jazzCashNumber: "02600102986161",
  jazzCashTitle: "M Asif (Meezan Bank)",
  easyPaisaNumber: "02600102986161",
  easyPaisaTitle: "M Asif (Meezan Bank)",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=347+Riwaz+Garden+Lahore+Pakistan",
};

export const CLINIC_DOCTORS: Doctor[] = [
  {
    id: "doc-kamran-rauf",
    name: "Prof. Dr. Muhammad Kamran Rauf",
    degrees: "M.B.B.S (K.E), FCPS (Medicine), MRCP-SCE (UK), EBEEDM (RCP-Ireland)",
    specialty: "Consultant Physician & Endocrinologist",
    subSpecialty: "Endocrinology, Diabetes & Metabolism",
    designation: "Professor of Medicine, Fatima Memorial Hospital",
    category: "Endocrinology & Diabetes",
    fee: 4000,
    roomNumber: "01",
    activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    timings: "Mon–Fri: 04:00 PM – 09:00 PM | Sat: 01:00 PM – 06:00 PM (Sun: Off)",
    experienceYears: 18,
    rating: 5.0,
    reviewCount: 15,
    bio: "Professor of Medicine at Fatima Memorial Hospital and Consultant Physician & Endocrinologist at Al Rauf Health Care. Specialist in Endocrinology, Diabetes & Metabolism, thyroid disorders, hormonal imbalances, metabolic syndrome, hypertension, and advanced internal medicine at 347- Riwaz Garden, Lahore.",
    image: "/images/dr-kamran-rauf.jpg",
    pmcRegistration: "PMDC # 42337-P",
    services: [
      "Diabetes Mellitus (Type 1 & 2)",
      "Thyroid Disorders",
      "Hormonal Imbalance",
      "Metabolic Syndromes",
      "Hypertension & BP",
      "Internal Medicine",
    ],
  },
  {
    id: "doc-asma-kamran",
    name: "Dr. Asma Kamran",
    degrees: "M.B.B.S (K.E), FCPS (Diagnostic Radiology)",
    specialty: "Consultant Radiologist",
    subSpecialty: "Ultrasound & Diagnostic Imaging",
    category: "Diagnostic Radiology",
    fee: 4000,
    roomNumber: "02",
    activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    timings: "Mon–Sat: 03:00 PM – 08:00 PM",
    experienceYears: 14,
    rating: 5.0,
    reviewCount: 38,
    bio: "Consultant Radiologist with FCPS in Diagnostic Radiology from King Edward Medical University. Providing high-resolution clinical ultrasound scans, Doppler studies, abdominal, pelvic, soft tissue, and specialized diagnostic imaging at Al Rauf Health Care.",
    image: "/images/dr-asma-kamran.jpg",
    pmcRegistration: "PMDC # 42897-P",
    services: [
      "Clinical Ultrasound & Doppler",
      "Abdominal & Pelvic Scans",
      "Thyroid & Soft Tissue Imaging",
      "KUB & Renal Doppler",
      "Diagnostic Scan Review",
      "Obstetric & Anomaly Scans",
    ],
  },
  {
    id: "doc-arslan-mir",
    name: "Dr. Arslan Mir",
    degrees: "MBBS (Gold Medalist), CRSM (Gold Medalist), MS (Urology)",
    specialty: "Consultant Urologist & Andrologist",
    subSpecialty: "Andrology & Sexual Medicine",
    designation: "Services Hospital Lahore | Member of Pakistan Society for Andrology & Sexual Medicine",
    category: "Urology & Andrology",
    fee: 4000,
    roomNumber: "03",
    activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    timings: "Mon–Sat: 04:00 PM – 09:00 PM",
    experienceYears: 12,
    rating: 5.0,
    reviewCount: 42,
    bio: "Gold Medalist Urologist and Andrology specialist affiliated with Services Hospital Lahore. Active member of the Pakistan Society for Andrology and Sexual Medicine, specializing in urinary disorders, kidney stone management, prostate health, male reproductive health, and sexual medicine at Al Rauf Health Care.",
    image: "/images/dr-arslan-mir.jpg",
    pmcRegistration: "PMDC Verified Specialist",
    services: [
      "Kidney & Bladder Disorders",
      "Prostate Health & Care",
      "Andrology & Men's Health",
      "Sexual Medicine & Infertility",
      "Urinary Tract Infections (UTI)",
      "Urological Consultations",
    ],
  },
];

// Standard 20-minute slot list from 12:00 PM to 09:00 PM (27 slots)
export const OPERATING_SLOTS: string[] = [
  "12:00 PM",
  "12:20 PM",
  "12:40 PM",
  "01:00 PM",
  "01:20 PM",
  "01:40 PM",
  "02:00 PM",
  "02:20 PM",
  "02:40 PM",
  "03:00 PM",
  "03:20 PM",
  "03:40 PM",
  "04:00 PM",
  "04:20 PM",
  "04:40 PM",
  "05:00 PM",
  "05:20 PM",
  "05:40 PM",
  "06:00 PM",
  "06:20 PM",
  "06:40 PM",
  "07:00 PM",
  "07:20 PM",
  "07:40 PM",
  "08:00 PM",
  "08:20 PM",
  "08:40 PM",
];

// Dr. Kamran Rauf Weekday Slots: Monday to Friday (4:00 PM to 9:00 PM — 15 slots of 20 mins)
export const DR_KAMRAN_WEEKDAY_SLOTS: string[] = [
  "04:00 PM",
  "04:20 PM",
  "04:40 PM",
  "05:00 PM",
  "05:20 PM",
  "05:40 PM",
  "06:00 PM",
  "06:20 PM",
  "06:40 PM",
  "07:00 PM",
  "07:20 PM",
  "07:40 PM",
  "08:00 PM",
  "08:20 PM",
  "08:40 PM",
];

// Dr. Kamran Rauf Saturday Slots: Saturday (1:00 PM to 6:00 PM — 15 slots of 20 mins)
export const DR_KAMRAN_SATURDAY_SLOTS: string[] = [
  "01:00 PM",
  "01:20 PM",
  "01:40 PM",
  "02:00 PM",
  "02:20 PM",
  "02:40 PM",
  "03:00 PM",
  "03:20 PM",
  "03:40 PM",
  "04:00 PM",
  "04:20 PM",
  "04:40 PM",
  "05:00 PM",
  "05:20 PM",
  "05:40 PM",
];

// Helper to get doctor-specific operating slots depending on the day of week
export function getDoctorOperatingSlots(doctorId: string, dayOfWeekShort: string): string[] {
  // Dr. Kamran Rauf schedule
  if (doctorId === "doc-kamran-rauf") {
    if (["Mon", "Tue", "Wed", "Thu", "Fri"].includes(dayOfWeekShort)) {
      return DR_KAMRAN_WEEKDAY_SLOTS;
    }
    if (dayOfWeekShort === "Sat") {
      return DR_KAMRAN_SATURDAY_SLOTS;
    }
    // Sunday is completely OFF for Dr. Kamran
    return [];
  }

  // Other doctors: check activeDays
  const doc = CLINIC_DOCTORS.find((d) => d.id === doctorId);
  if (doc && !doc.activeDays.includes(dayOfWeekShort)) {
    return [];
  }

  return OPERATING_SLOTS;
}

// Helper to get a human-readable consultation hours description for a doctor
export function getDoctorTimingsLabel(doctorId: string, dayOfWeekShort?: string): string {
  if (doctorId === "doc-kamran-rauf") {
    if (dayOfWeekShort) {
      if (["Mon", "Tue", "Wed", "Thu", "Fri"].includes(dayOfWeekShort)) {
        return "04:00 PM – 09:00 PM (15 Slots · 20-Min Intervals)";
      }
      if (dayOfWeekShort === "Sat") {
        return "01:00 PM – 06:00 PM (15 Slots · 20-Min Intervals)";
      }
      if (dayOfWeekShort === "Sun") {
        return "Closed / Off on Sundays";
      }
    }
    return "Mon–Fri: 04:00 PM – 09:00 PM | Sat: 01:00 PM – 06:00 PM (Sun: Off)";
  }

  const doc = CLINIC_DOCTORS.find((d) => d.id === doctorId);
  if (doc?.timings) {
    return doc.timings;
  }
  return "12:00 PM – 09:00 PM (27 Slots · 20-Min Intervals)";
}

// Helper to generate the next 14 dates starting today
export function getAvailableDates(numDays = 14) {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const isoString = `${year}-${month}-${day}`;
    
    const dayNameShort = d.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue, etc.
    const dayNameFull = d.toLocaleDateString("en-US", { weekday: "long" });
    const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    
    dates.push({
      dateStr: isoString,
      dayNameShort,
      dayNameFull,
      formatted,
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }
  
  return dates;
}

// Generate secure Token Number: CLN-2026-XXXX
export function generateTokenNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CLN-${year}-${randomNum}`;
}
