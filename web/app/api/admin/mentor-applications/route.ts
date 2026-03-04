import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, bio, university, hourly_rate, mentor_status, created_at")
    .eq("is_mentor", true)
    .eq("mentor_status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const withCourses = await Promise.all(
    (data ?? []).map(async (p) => {
      const { data: mc } = await supabase
        .from("mentor_courses")
        .select("course_id")
        .eq("mentor_id", p.id);
      const cids = (mc ?? []).map((m) => m.course_id);
      const { data: courses } = await supabase
        .from("courses")
        .select("id, name, slug")
        .in("id", cids.length ? cids : [0]);
      return { ...p, courses: courses ?? [] };
    })
  );

  return NextResponse.json(withCourses);
}
