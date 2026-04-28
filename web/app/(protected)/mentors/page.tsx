import { getSupabaseServerClient } from "@/lib/supabase/server";
import { MentorList } from "./MentorList";

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

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

  let mentors = (mentorsUnfiltered ?? []).filter((m: any) => {
    const hasCourses = m.courses && m.courses.length > 0;
    const hasAvailabilities = m.availabilities && m.availabilities.length > 0;
    
    if (searchParams.subject) {
      if (!hasCourses) return false;
      const matchesSubject = m.courses.some((c: any) => c.slug === searchParams.subject);
      if (!matchesSubject) return false;
    }

    if (isAdmin) return true;
    return hasCourses && hasAvailabilities;
  });

  const withCourses = await Promise.all(
    (mentors ?? []).map(async (m) => {
      return { ...m, courses: m.courses ?? [] };
    })
  );

  const withRating = await Promise.all(
    withCourses.map(async (m) => {
      const { data: mentorRooms } = await supabase
        .from("rooms")
        .select("id")
        .eq("mentor_id", m.id);
      const roomIds = (mentorRooms ?? []).map((r) => r.id);
      if (roomIds.length === 0) return { ...m, average_rating: null, review_count: 0 };
      
      const { data: rev } = await supabase
        .from("reviews")
        .select("rating")
        .in("room_id", roomIds);
        
      const ratings = (rev ?? []).map((r) => r.rating);
      const avg =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;
      return { ...m, average_rating: avg, review_count: ratings.length };
    })
  );

  return <MentorList mentors={withRating} courses={courses ?? []} />;
}
