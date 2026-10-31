import { NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { extractAuthToken, verifyReceptionToken } from "@/lib/security";
import { logSystemError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const authToken = extractAuthToken(request);
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieMatch = cookieHeader.match(/reception_token=([^;]+)/);
    const cookieToken = cookieMatch ? cookieMatch[1] : null;

    const isAuthenticated = verifyReceptionToken(authToken || cookieToken);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Staff authentication required." },
        { status: 401 }
      );
    }

    const stats = await DataStore.getReceptionStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    const logged = logSystemError(error, {
      source: "api",
      url: "/api/stats",
    });
    return NextResponse.json(
      { success: false, message: "Internal server error fetching reception statistics.", errorId: logged.id },
      { status: 500 }
    );
  }
}
