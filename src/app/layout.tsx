import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CLINIC_INFO } from "@/lib/constants";
import GlobalErrorProvider from "@/components/GlobalErrorProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Al Rauf Health Care | Prof. Dr. Muhammad Kamran Rauf | Consultant Physician & Endocrinologist, Lahore",
  description:
    "Official digital booking portal for Al Rauf Health Care - Prof. Dr. Muhammad Kamran Rauf, Professor of Medicine at AMDC, 347- Riwaz Garden, Lahore. 5.0 Star rated, streamlined consultation slots, direct Meezan Bank transfer verification, and expert clinical care.",
  keywords: [
    "Al Rauf Health Care",
    "Prof. Dr. Muhammad Kamran Rauf",
    "Prof. Dr. Kamran Rauf",
    "Dr. Muhammad Kamran Rauf",
    "Dr. Kamran Rauf",
    "Endocrinologist Lahore",
    "Diabetes Specialist Lahore",
    "Consultant Physician Lahore",
    "AMDC",
    "Clinic Riwaz Garden",
    "Doctor Lahore Riwaz Garden",
    "Doctor Appointment Lahore",
    "Meezan Bank clinic transfer",
    "PMDC registered doctor Lahore",
    "Al Rauf Clinic Lahore",
  ],
  authors: [{ name: "Al Rauf Health Care - Prof. Dr. Muhammad Kamran Rauf" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} scroll-smooth`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-100 selection:text-teal-900 flex flex-col"
        suppressHydrationWarning
      >
        <GlobalErrorProvider>{children}</GlobalErrorProvider>
      </body>
    </html>
  );
}
