import { NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { CLINIC_DOCTORS, OPERATING_SLOTS } from "@/lib/constants";
import {
  checkRateLimit,
  verifyReceptionToken,
  extractAuthToken,
  sanitizeInput,
  validateAndNormalizePhone,
  validateBookingDate,
  savePaymentReceipt,
  savePaymentReceiptAsync,
} from "@/lib/security";
import { logSystemError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // 1. PUBLIC TOKEN LOOKUP (Protected Privacy View)
    if (token) {
      const cleanToken = token.trim();
      if (!cleanToken) {
        return NextResponse.json(
          { success: false, message: "Invalid token parameter." },
          { status: 400 }
        );
      }

      const publicApt = await DataStore.getPublicTracking(cleanToken);
      if (!publicApt) {
        return NextResponse.json(
          { success: false, message: "Appointment token not found or expired." },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, appointment: publicApt });
    }

    // 2. RECEPTION STAFF QUEUE (Strict Authentication Required)
    const authToken = extractAuthToken(request);
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieMatch = cookieHeader.match(/reception_token=([^;]+)/);
    const cookieToken = cookieMatch ? cookieMatch[1] : null;

    const isAuthenticated = verifyReceptionToken(authToken || cookieToken);
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Staff authentication required to access clinical appointment queue.",
        },
        { status: 401 }
      );
    }

    const doctorId = searchParams.get("doctorId") || undefined;
    const date = searchParams.get("date") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const appointments = await DataStore.getAllAppointments({ doctorId, date, status, search });
    return NextResponse.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    const logged = logSystemError(error, {
      source: "api",
      url: "/api/appointments",
      context: { method: "GET" },
    });
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error retrieving clinical queue.",
        errorId: logged.id,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "booking-client";

    const authToken = extractAuthToken(request);
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieMatch = cookieHeader.match(/reception_token=([^;]+)/);
    const cookieToken = cookieMatch ? cookieMatch[1] : null;
    const isStaff = verifyReceptionToken(authToken || cookieToken);

    // Rate limit public appointment submissions (authenticated staff exempt): max 20 requests per 5 minutes
    if (!isStaff) {
      const rateCheck = checkRateLimit(clientIp, "booking", 20, 5 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            message: `Booking rate limit exceeded. Please wait ${rateCheck.retryAfterSec} seconds before submitting again.`,
          },
          { status: 429 }
        );
      }
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request payload format." },
        { status: 400 }
      );
    }

    // 1. Sanitize & Validate Patient Name
    const patientName = sanitizeInput(body.patientName, 80);
    if (!patientName || patientName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid patient full name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    // 2. Validate & Normalize Phone Number
    const phoneResult = validateAndNormalizePhone(body.patientPhone);
    if (!phoneResult.valid) {
      return NextResponse.json(
        { success: false, message: phoneResult.error },
        { status: 400 }
      );
    }
    const patientPhone = phoneResult.normalized;

    // 3. Validate Patient Age & Gender
    const rawAge = Number(body.patientAge);
    const patientAge = isNaN(rawAge) || rawAge < 0 || rawAge > 120 ? 30 : Math.floor(rawAge);
    const patientGender =
      body.patientGender === "Female" || body.patientGender === "Child" ? body.patientGender : "Male";

    // 4. Sanitize Reason for Visit
    const reasonForVisit = sanitizeInput(body.reasonForVisit || "Outpatient Clinical Consultation", 300);

    // 5. Validate Doctor Selection
    const doctor = CLINIC_DOCTORS.find((d) => d.id === body.doctorId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "The selected doctor does not exist in clinic records." },
        { status: 404 }
      );
    }

    // 6. Validate Booking Date
    const dateResult = validateBookingDate(body.date);
    if (!dateResult.valid) {
      return NextResponse.json(
        { success: false, message: dateResult.error },
        { status: 400 }
      );
    }
    const date = body.date;

    // 7. Validate Time Slot Format & Range
    const timeSlot = typeof body.timeSlot === "string" ? body.timeSlot.trim() : "";
    if (!OPERATING_SLOTS.includes(timeSlot)) {
      return NextResponse.json(
        { success: false, message: "Selected time slot is not within valid clinical consultation hours." },
        { status: 400 }
      );
    }

    // 8. Validate Payment Method & Sender Name
    const paymentMethod = typeof body.paymentMethod === "string" && body.paymentMethod.trim()
      ? sanitizeInput(body.paymentMethod, 40)
      : "Meezan Bank";
    const senderName = sanitizeInput(body.senderName, 80);
    if (!senderName || senderName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Please provide the sender account title as shown on your payment app." },
        { status: 400 }
      );
    }
    const trxId = sanitizeInput(body.trxId || "N/A", 50);

    // 9. Validate & Securely Persist Payment Screenshot
    const receiptResult = await savePaymentReceiptAsync(body.receiptUrl);
    if (!receiptResult.success || !receiptResult.filePath) {
      return NextResponse.json(
        {
          success: false,
          message:
            receiptResult.error ||
            "A genuine payment transaction screenshot is strictly required to reserve a consultation slot.",
        },
        { status: 400 }
      );
    }

    // 10. Atomic Slot Reservation & Token Generation
    const result = await DataStore.createAppointment({
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      reasonForVisit,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorFee: doctor.fee,
      doctorRoom: doctor.roomNumber,
      date,
      timeSlot,
      paymentMethod,
      senderName,
      trxId,
      receiptUrl: receiptResult.filePath,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appointment successfully placed and sent to verification desk.",
        appointment: result.appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    const logged = logSystemError(error, {
      source: "api",
      url: "/api/appointments",
      context: { method: "POST" },
    });
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error creating appointment.",
        errorId: logged.id,
      },
      { status: 500 }
    );
  }
}
