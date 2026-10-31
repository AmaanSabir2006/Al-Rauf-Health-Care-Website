import { NextResponse } from "next/server";
import { checkRateLimit, resetRateLimit, generateReceptionToken } from "@/lib/security";
import { logSystemError } from "@/lib/logger";

const RECEPTION_PIN = process.env.RECEPTION_PIN || "Adil001Bhai110Adil";

export async function POST(request: Request) {
  try {
    // Get client IP or fallback identifier for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "local-client";

    // Enforce brute-force rate limit: max 5 failed attempts per 15 minutes
    const rateCheck = checkRateLimit(clientIp, "login", 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed login attempts. Reception security lock active. Please retry in ${rateCheck.retryAfterSec} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSec || 300),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";

    if (pin === RECEPTION_PIN) {
      // Clear rate limit on successful authentication
      resetRateLimit(clientIp, "login");

      const token = generateReceptionToken();

      const response = NextResponse.json({
        success: true,
        message: "Reception staff authenticated successfully.",
        token,
      });

      // Also set secure session cookie
      response.cookies.set("reception_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: `Invalid Reception Security Password. (${rateCheck.remainingAttempts} attempts remaining before temporary lockout).`,
      },
      { status: 401 }
    );
  } catch (error) {
    const logged = logSystemError(error, {
      source: "api",
      url: "/api/reception/login",
    });
    return NextResponse.json(
      { success: false, message: "Internal authentication error.", errorId: logged.id },
      { status: 500 }
    );
  }
}
