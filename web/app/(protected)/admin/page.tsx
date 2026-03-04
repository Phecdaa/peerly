import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminMentorList } from "./AdminMentorList";

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 py-10">
        <p className="text-red-600">Akses ditolak. Hanya admin.</p>
        <Link href="/dashboard" className="text-sm text-zinc-600 underline">
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

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
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">
          Admin – Pengajuan mentor
        </h1>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
        >
          Dashboard
        </Link>
      </header>

      <AdminMentorList applications={withCourses} />
    </div>
  );
}
