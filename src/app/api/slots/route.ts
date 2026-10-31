import { NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { CLINIC_DOCTORS, getDoctorTimingsLabel } from "@/lib/constants";
import { logSystemError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json(
        { success: false, message: "Missing doctorId or date parameter." },
        { status: 400 }
      );
    }

    const doctor = CLINIC_DOCTORS.find((d) => d.id === doctorId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found." },
        { status: 404 }
      );
    }

    // Safely parse date
    const dateObj = new Date(date + "T00:00:00");
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const dayNameShort = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const isDoctorActiveOnDay = doctor.activeDays.includes(dayNameShort);

    const slots = await DataStore.getSlotStatuses(doctorId, date);
    const timingsLabel = getDoctorTimingsLabel(doctorId, dayNameShort);

    return NextResponse.json({
      success: true,
      doctorId,
      date,
      dayName: dayNameShort,
      isDoctorActiveOnDay,
      timingsLabel,
      slots,
    });
  } catch (error) {
    const logged = logSystemError(error, {
      source: "api",
      url: "/api/slots",
    });
    return NextResponse.json(
      { success: false, message: "Internal server error fetching slot statuses.", errorId: logged.id },
      { status: 500 }
    );
  }
}
