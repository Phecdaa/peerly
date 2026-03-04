import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: booking, error: fetchErr } = await supabase
    .from("bookings")
    .select("id, learner_id, mentor_id, status, start_ts, end_ts, duration_minutes")
    .eq("id", parseInt(id, 10))
    .single();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isLearner = booking.learner_id === user.id;
  if (!isLearner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "accepted") {
    return NextResponse.json(
      { error: "Only accepted bookings can be confirmed for payment" },
      { status: 400 }
    );
  }

  const { data: mentor } = await supabase
    .from("profiles")
    .select("hourly_rate")
    .eq("id", booking.mentor_id)
    .single();

  const amount = Number(mentor?.hourly_rate ?? 0) * (booking.duration_minutes / 60);
  const platform_fee = amount * 0.1;
  const mentor_amount = amount - platform_fee;

  const serviceSupabase = getSupabaseServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: paymentErr } = await (serviceSupabase as any)
    .from("payments")
    .insert({
      booking_id: booking.id,
      amount,
      platform_fee,
      mentor_amount,
      status: "escrow",
    });

  if (paymentErr) {
    return NextResponse.json({ error: paymentErr.message }, { status: 500 });
  }

  const meetingLink = "https://meet.google.com/new";

  const { error: updateErr } = await supabase
    .from("bookings")
    .update({ status: "paid", meeting_link: meetingLink })
    .eq("id", booking.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, meeting_link: meetingLink });
}
