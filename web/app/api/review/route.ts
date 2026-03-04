import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Body = { booking_id: number; rating: number; comment?: string };

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { booking_id, rating, comment } = body;
  if (
    typeof booking_id !== "number" ||
    typeof rating !== "number" ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "booking_id and rating (1-5) required" },
      { status: 400 }
    );
  }

  const { data: booking, error: bookErr } = await supabase
    .from("bookings")
    .select("id, learner_id, status")
    .eq("id", booking_id)
    .single();

  if (bookErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.learner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "completed") {
    return NextResponse.json(
      { error: "Can only review completed bookings" },
      { status: 400 }
    );
  }

  const { error: insertErr } = await supabase.from("reviews").insert({
    booking_id,
    rating,
    comment: typeof comment === "string" ? comment.trim() : null,
  });

  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json(
        { error: "Review already submitted for this booking" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
