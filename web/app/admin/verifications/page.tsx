import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminMentorList } from "./AdminMentorList";

export default async function AdminVerificationsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: applicationsRaw } = await supabase
    .from("profiles")
    .select("id, full_name, bio, university, hourly_rate, mentor_status, created_at")
    .eq("is_mentor", true)
    .eq("mentor_status", "pending")
    .order("created_at", { ascending: false });

  const applications = applicationsRaw ?? [];
  const withCourses = await Promise.all(
    applications.map(async (p) => {
      const { data: mc } = await supabase
        .from("mentor_courses")
        .select("course_id")
        .eq("mentor_id", p.id);
      const courseIds = (mc ?? []).map((m) => m.course_id);
      const { data: courses } = await supabase
        .from("courses")
        .select("id, name, slug")
        .in("id", courseIds.length ? courseIds : [0]);
      return { ...p, courses: courses ?? [] };
    })
  );

  return (
    <main className="flex-1 p-8 lg:p-10 max-w-[1280px] mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface mb-xs">Mentor Verifications</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Review and approve pending mentor applications.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface-container text-on-surface font-label-md text-label-md px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
            Filter by University
          </button>
        </div>
      </div>

      <AdminMentorList applications={withCourses} />
    </main>
  );
}
