import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, university, bio, hourly_rate")
    .eq("id", id)
    .eq("is_mentor", true)
    .eq("mentor_status", "approved")
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  const { data: mc } = await supabase
    .from("mentor_courses")
    .select("course_id")
    .eq("mentor_id", id);
  const cids = (mc ?? []).map((m) => m.course_id);
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, slug")
    .in("id", cids.length ? cids : [0]);
  const coursesList = courses ?? [];

  const { data: availabilities } = await supabase
    .from("availabilities")
    .select("id, start_ts, end_ts, max_students")
    .eq("mentor_id", id)
    .gte("end_ts", new Date().toISOString())
    .order("start_ts", { ascending: true })
    .limit(50);

  const { data: bookingRanges } = await supabase
    .from("bookings")
    .select("start_ts, end_ts")
    .eq("mentor_id", id)
    .in("status", ["pending", "accepted", "paid"]);

  const bookedSet = new Set(
    (bookingRanges ?? []).map((b) => `${b.start_ts}/${b.end_ts}`)
  );

  const slots = (availabilities ?? []).map((a) => ({
    ...a,
    is_booked: bookedSet.has(`${a.start_ts}/${a.end_ts}`),
  }));

  const { data: mentorBookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("mentor_id", id);
  const mentorBookingIds = (mentorBookings ?? []).map((b) => b.id);
  let average_rating: number | null = null;
  let review_count = 0;
  if (mentorBookingIds.length > 0) {
    const { data: rev } = await supabase
      .from("reviews")
      .select("rating")
      .in("booking_id", mentorBookingIds);
    const ratings = (rev ?? []).map((r) => r.rating);
    review_count = ratings.length;
    average_rating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
  }

  return NextResponse.json({
    ...profile,
    courses: coursesList,
    availabilities: slots,
    average_rating,
    review_count,
  });
}
