import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("course_id");
  const q = searchParams.get("q") ?? "";

  let query = supabase
    .from("profiles")
    .select("id, full_name, university, bio, hourly_rate, created_at")
    .eq("is_mentor", true)
    .eq("mentor_status", "approved");

  if (courseId) {
    const { data: mentorIds } = await supabase
      .from("mentor_courses")
      .select("mentor_id")
      .eq("course_id", parseInt(courseId, 10));
    const ids = (mentorIds ?? []).map((m) => m.mentor_id);
    if (ids.length > 0) {
      query = query.in("id", ids);
    } else {
      return NextResponse.json([]);
    }
  }

  const { data: mentors, error } = await query.order("full_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let list = mentors ?? [];

  if (q.trim()) {
    const lower = q.trim().toLowerCase();
    list = list.filter(
      (m) =>
        (m.full_name?.toLowerCase().includes(lower)) ||
        (m.bio?.toLowerCase().includes(lower)) ||
        (m.university?.toLowerCase().includes(lower))
    );
  }

  const withCourses = await Promise.all(
    list.map(async (m) => {
      const { data: mc } = await supabase
        .from("mentor_courses")
        .select("course_id")
        .eq("mentor_id", m.id);
      const cids = (mc ?? []).map((x) => x.course_id);
      const { data: courses } = await supabase
        .from("courses")
        .select("id, name, slug")
        .in("id", cids.length ? cids : [0]);
      return { ...m, courses: courses ?? [] };
    })
  );

  const withRating = await Promise.all(
    withCourses.map(async (m) => {
      const { data: mentorBookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("mentor_id", m.id);
      const bookingIds = (mentorBookings ?? []).map((b) => b.id);
      if (bookingIds.length === 0) {
        return { ...m, average_rating: null as number | null, review_count: 0 };
      }
      const { data: rev } = await supabase
        .from("reviews")
        .select("rating")
        .in("booking_id", bookingIds);
      const ratings = (rev ?? []).map((r) => r.rating);
      const avg =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;
      return { ...m, average_rating: avg, review_count: ratings.length };
    })
  );

  return NextResponse.json(withRating);
}
