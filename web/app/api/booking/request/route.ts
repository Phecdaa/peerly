import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Body = {
  mentor_id: string;
  course_id: number;
  start_ts: string;
  end_ts: string;
};

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

  const { mentor_id, course_id, start_ts, end_ts } = body;
  if (!mentor_id || typeof course_id !== "number" || !start_ts || !end_ts) {
    return NextResponse.json(
      { error: "mentor_id, course_id, start_ts, end_ts required" },
      { status: 400 }
    );
  }

  const start = new Date(start_ts);
  const end = new Date(end_ts);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return NextResponse.json(
      { error: "Invalid start_ts or end_ts" },
      { status: 400 }
    );
  }

  const duration_minutes = Math.round((end.getTime() - start.getTime()) / 60000);

  const { data: mentor } = await supabase
    .from("profiles")
    .select("id, hourly_rate")
    .eq("id", mentor_id)
    .eq("is_mentor", true)
    .eq("mentor_status", "approved")
    .single();

  if (!mentor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("mentor_id", mentor_id)
    .in("status", ["pending", "accepted", "paid"])
    .lte("start_ts", end_ts)
    .gte("end_ts", start_ts)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Slot already booked or requested" },
      { status: 409 }
    );
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      learner_id: user.id,
      mentor_id,
      course_id,
      start_ts: start.toISOString(),
      end_ts: end.toISOString(),
      duration_minutes,
      status: "pending",
    })
    .select("id, status, start_ts, end_ts")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(booking);
}
