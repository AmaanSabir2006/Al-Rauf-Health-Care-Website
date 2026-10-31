import { NextResponse } from "next/server";
import { CLINIC_DOCTORS } from "@/lib/constants";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (category && category !== "ALL") {
    const filtered = CLINIC_DOCTORS.filter((d) => d.category.toLowerCase() === category.toLowerCase());
    return NextResponse.json({ success: true, doctors: filtered });
  }

  return NextResponse.json({ success: true, doctors: CLINIC_DOCTORS });
}
