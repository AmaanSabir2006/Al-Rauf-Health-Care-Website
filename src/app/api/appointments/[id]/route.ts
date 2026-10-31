import { NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { AppointmentStatus } from "@/lib/types";
import { extractAuthToken, verifyReceptionToken, sanitizeInput } from "@/lib/security";
import { logSystemError } from "@/lib/logger";

function checkAuth(request: Request): boolean {
  const authToken = extractAuthToken(request);
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(/reception_token=([^;]+)/);
  const cookieToken = cookieMatch ? cookieMatch[1] : null;

  return verifyReceptionToken(authToken || cookieToken);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Staff authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, rejectionReason, notes } = body;

    const validStatuses: AppointmentStatus[] = ["PENDING", "CONFIRMED", "REJECTED", "CHECKED_IN"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    const sanitizedRejection = rejectionReason ? sanitizeInput(rejectionReason, 200) : undefined;
    const sanitizedNotes = notes ? sanitizeInput(notes, 300) : undefined;

    const result = await DataStore.updateAppointmentStatus(id, status, {
      rejectionReason: sanitizedRejection,
      notes: sanitizedNotes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Appointment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Appointment updated to ${status}`,
      appointment: result.appointment,
    });
  } catch (error) {
    const logged = logSystemError(error, {
      source: "api",
      url: "/api/appointments/[id]",
      context: { method: "PATCH" },
    });
    return NextResponse.json(
      { success: false, message: "Internal server error.", errorId: logged.id },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Staff authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await DataStore.deleteAppointment(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Appointment not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Appointment deleted." });
  } catch (error) {
    const logged = logSystemError(error, {
      source: "api",
      url: "/api/appointments/[id]",
      context: { method: "DELETE" },
    });
    return NextResponse.json(
      { success: false, message: "Internal server error.", errorId: logged.id },
      { status: 500 }
    );
  }
}
