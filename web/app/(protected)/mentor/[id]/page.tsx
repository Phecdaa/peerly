import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CreateRoomForm } from "./CreateRoomForm";

type Params = { params: Promise<{ id: string }> };

export default async function MentorDetailPage({ params }: Params) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, university, bio, hourly_rate")
    .eq("id", id)
    .eq("is_mentor", true)
    .eq("mentor_status", "approved")
    .single();

  if (error || !profile) notFound();

  const { data: mc } = await supabase
    .from("mentor_courses")
    .select("course_id")
    .eq("mentor_id", id);
  const cids = (mc ?? []).map((x) => x.course_id);
  const { data: coursesData } = await supabase
    .from("courses")
    .select("id, name, slug")
    .in("id", cids.length ? cids : [0]);
  const courses = coursesData ?? [];

  const { data: availabilities } = await supabase
    .from("availabilities")
    .select("id, start_ts, end_ts, max_students")
    .eq("mentor_id", id)
    .gte("end_ts", new Date().toISOString())
    .order("start_ts", { ascending: true })
    .limit(50);

  const availIds = (availabilities ?? []).map((a) => a.id);
  const { data: activeRooms } = await supabase
    .from("rooms")
    .select("availability_id")
    .in("availability_id", availIds.length ? availIds : [0])
    .in("status", ["pending_payment", "waiting_mentor_approval", "scheduled", "ongoing"]);
  const availWithRoom = new Set((activeRooms ?? []).map((r) => r.availability_id));

  const slots = (availabilities ?? []).map((a) => ({
    ...a,
    is_booked: false,
    has_room: availWithRoom.has(a.id),
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

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <Link
          href="/mentors"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
        >
          Kembali ke daftar mentor
        </Link>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">
          {profile.full_name ?? "Mentor"}
        </h1>
        {profile.university && (
          <p className="text-sm text-zinc-500">{profile.university}</p>
        )}
        <p className="mt-2 text-sm text-zinc-600">{profile.bio ?? "—"}</p>
        <div className="mt-2 flex gap-4 text-xs text-zinc-500">
          {average_rating != null && (
            <span>★ {average_rating.toFixed(1)}</span>
          )}
          {review_count > 0 && <span>{review_count} review</span>}
          {profile.hourly_rate != null && (
            <span>Rp {Number(profile.hourly_rate).toLocaleString()}/jam</span>
          )}
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Mata kuliah: {courses.map((c: { name: string }) => c.name).join(", ")}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-6">
        <div>
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            Pilih slot & buat sesi (room)
          </h2>
          <CreateRoomForm
            mentorId={id}
            mentorName={profile.full_name ?? "Mentor"}
            mentorHourlyRate={profile.hourly_rate ?? 0}
            courses={courses}
            slots={slots}
          />
        </div>
      </div>
    </div>
  );
}
