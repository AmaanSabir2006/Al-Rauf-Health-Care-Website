"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SymptomTriage from "@/components/SymptomTriage";
import DoctorShowcase from "@/components/DoctorShowcase";
import BookingWizard from "@/components/BookingWizard";
import ReviewsSection from "@/components/ReviewsSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import LocationContactSection from "@/components/LocationContactSection";
import Footer from "@/components/Footer";
import TrackAppointmentModal from "@/components/TrackAppointmentModal";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import { Doctor } from "@/lib/types";

export default function HomePage() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", "#booking-section");
    }
  };

  const handleBookHeroClick = () => {
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", "#booking-section");
    }
  };

  const handleExploreDoctorsClick = () => {
    const docSection = document.getElementById("specialists");
    if (docSection) {
      docSection.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", "#specialists");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header with Triage Bar */}
      <SectionErrorBoundary sectionName="Navigation Bar">
        <Navbar onOpenTracker={() => setIsTrackerOpen(true)} />
      </SectionErrorBoundary>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <SectionErrorBoundary sectionName="Clinic Overview & Hero">
          <HeroSection
            onBookClick={handleBookHeroClick}
            onExploreDoctorsClick={handleExploreDoctorsClick}
          />
        </SectionErrorBoundary>

        {/* Instant Clinical Symptom Triage */}
        <SectionErrorBoundary sectionName="Symptom Triage Assistant">
          <SymptomTriage onSelectDoctor={handleSelectDoctor} />
        </SectionErrorBoundary>

        {/* Multi-Doctor Showcase with Filter Tabs & Search */}
        <SectionErrorBoundary sectionName="Doctor Specialists Directory">
          <DoctorShowcase onSelectDoctor={handleSelectDoctor} />
        </SectionErrorBoundary>

        {/* 20-Minute Dynamic Slot Booking Wizard & Manual Payment Flow */}
        <SectionErrorBoundary sectionName="Appointment Booking Wizard">
          <BookingWizard initialDoctor={selectedDoctor} />
        </SectionErrorBoundary>

        {/* About Us & Facilities Section */}
        <SectionErrorBoundary sectionName="Clinic Facilities & Services">
          <FacilitiesSection />
        </SectionErrorBoundary>

        {/* Google 5.0 Star Patient Reviews & Testimonials */}
        <SectionErrorBoundary sectionName="Patient Reviews & Ratings">
          <ReviewsSection />
        </SectionErrorBoundary>

        {/* Location, Embedded Google Map & Contact Section */}
        <SectionErrorBoundary sectionName="Location & Clinic Contact">
          <LocationContactSection />
        </SectionErrorBoundary>
      </main>

      {/* Footer */}
      <SectionErrorBoundary sectionName="Clinic Footer">
        <Footer />
      </SectionErrorBoundary>

      {/* Track Appointment Token Modal */}
      <SectionErrorBoundary sectionName="Appointment Tracking">
        <TrackAppointmentModal
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
        />
      </SectionErrorBoundary>

      {/* Floating Clinic Reception WhatsApp Button */}
      <FloatingWhatsAppButton />
    </div>
  );
}
