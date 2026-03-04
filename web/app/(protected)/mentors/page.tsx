import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { MentorList } from "./MentorList";

export default async function MentorsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: courses = [] } = await supabase
    .from("courses")
    .select("id, name, slug")
    .order("name");

  const { data: mentors = [] } = await supabase
    .from("profiles")
    .select("id, full_name, university, bio, hourly_rate")
    .eq("is_mentor", true)
    .eq("mentor_status", "approved")
    .order("full_name");

  const withCourses = await Promise.all(
    (mentors ?? []).map(async (m) => {
      const { data: mc } = await supabase
        .from("mentor_courses")
        .select("course_id")
        .eq("mentor_id", m.id);
      const cids = (mc ?? []).map((x) => x.course_id);
      const { data: crs } = await supabase
        .from("courses")
        .select("id, name, slug")
        .in("id", cids.length ? cids : [0]);
      return { ...m, courses: crs ?? [] };
    })
  );

  const withRating = await Promise.all(
    withCourses.map(async (m) => {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("mentor_id", m.id);
      const bids = (bookings ?? []).map((b) => b.id);
      if (bids.length === 0) return { ...m, average_rating: null, review_count: 0 };
      const { data: rev } = await supabase
        .from("reviews")
        .select("rating")
        .in("booking_id", bids);
      const ratings = (rev ?? []).map((r) => r.rating);
      const avg =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;
      return { ...m, average_rating: avg, review_count: ratings.length };
    })
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Cari mentor</h1>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
        >
          Dashboard
        </Link>
      </header>

      <MentorList mentors={withRating} courses={courses ?? []} />
    </div>
  );
}
