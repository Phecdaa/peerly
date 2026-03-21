import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { MentorList } from "./MentorList";

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await getSupabaseServerClient();
  const { data: courses = [] } = await supabase
    .from("courses")
    .select("id, name, slug")
    .order("name");

  const { data: mentorsUnfiltered } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      avatar_url,
      university,
      bio,
      hourly_rate,
      courses ( id, name, slug ),
      availabilities ( id )
    `)
    .eq("is_mentor", true)
    .eq("mentor_status", "approved");

  // Require mentors to have at least one course matching the search, and at least one availability slot
  let mentors = (mentorsUnfiltered ?? []).filter((m: any) => {
    const hasCourses = m.courses && m.courses.length > 0;
    const hasAvailabilities = m.availabilities && m.availabilities.length > 0;
    
    // Check subject filter if present
    if (searchParams.subject) {
      if (!hasCourses) return false;
      const matchesSubject = m.courses.some((c: any) => c.slug === searchParams.subject);
      if (!matchesSubject) return false;
    }

    return hasCourses && hasAvailabilities;
  });

  const withCourses = await Promise.all(
    (mentors ?? []).map(async (m) => {
      // The courses are already fetched with the mentor profile, so this part can be simplified
      // to just return the mentor with their pre-fetched courses.
      // However, to maintain the original structure of `withCourses` if it's used elsewhere
      // for a specific format, we'll adapt it.
      // If `m.courses` already contains the full course objects, we can use them directly.
      // Otherwise, if `m.courses` only contains IDs, the original logic would be needed.
      // Assuming `m.courses` from the initial select is already the full course objects:
      return { ...m, courses: m.courses ?? [] };
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
