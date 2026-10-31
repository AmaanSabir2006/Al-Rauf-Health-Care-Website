import { NextResponse } from "next/server";
import { logSystemError, getSystemErrors, clearSystemErrors } from "@/lib/logger";
import { checkRateLimit, extractAuthToken, verifyReceptionToken } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "error-reporter";

    // Rate limit error reporting: max 30 error logs per 5 minutes per IP
    const rateCheck = checkRateLimit(clientIp, "error_log", 30, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: "Error reporting rate limit reached." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid error payload." },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || undefined;

    const logged = logSystemError(body.message || "Client Reported Crash", {
      source: body.source === "boundary" ? "boundary" : "client",
      level: body.level || "error",
      url: body.url || request.headers.get("referer") || undefined,
      componentStack: body.componentStack,
      context: body.context,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      errorId: logged.id,
      timestamp: logged.timestamp,
    });
  } catch (err) {
    console.error("Critical failure inside log-error route:", err);
    return NextResponse.json(
      { success: false, message: "Internal error logger failure." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Guard access: only authenticated reception staff / admin can inspect system diagnostic errors
  const authToken = extractAuthToken(request);
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(/reception_token=([^;]+)/);
  const cookieToken = cookieMatch ? cookieMatch[1] : null;

  if (!verifyReceptionToken(authToken || cookieToken)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Staff credentials required." },
      { status: 401 }
    );
  }

  const errors = getSystemErrors(50);
  return NextResponse.json({
    success: true,
    count: errors.length,
    errors,
  });
}

export async function DELETE(request: Request) {
  const authToken = extractAuthToken(request);
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(/reception_token=([^;]+)/);
  const cookieToken = cookieMatch ? cookieMatch[1] : null;

  if (!verifyReceptionToken(authToken || cookieToken)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Staff credentials required." },
      { status: 401 }
    );
  }

  clearSystemErrors();
  return NextResponse.json({ success: true, message: "Diagnostic logs cleared." });
}
