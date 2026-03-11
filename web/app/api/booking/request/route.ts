import { NextRequest, NextResponse } from "next/server";

/** All sessions go through room flow. This endpoint is disabled. */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Booking 1-on-1 dinonaktifkan. Gunakan \"Buat room\" untuk sesi (termasuk private = 1 peserta).",
    },
    { status: 410 }
  );
}
