import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookingsList } from "./BookingsList";

export default async function BookingsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: learnerRows = [] } = await supabase
    .from("bookings")
    .select("id, start_ts, end_ts, duration_minutes, status, meeting_link, created_at, mentor_id, course_id")
    .eq("learner_id", user.id)
    .order("start_ts", { ascending: false });

  const { data: mentorRows = [] } = await supabase
    .from("bookings")
    .select("id, start_ts, end_ts, duration_minutes, status, meeting_link, created_at, learner_id, course_id")
    .eq("mentor_id", user.id)
    .order("start_ts", { ascending: false });

  const mentorIds = [...new Set([...(learnerRows as { mentor_id: string }[]).map((b) => b.mentor_id), ...(mentorRows as { learner_id: string }[]).map((b) => b.learner_id)])];
  const courseIds = [...new Set([...(learnerRows as { course_id: number }[]).map((b) => b.course_id), ...(mentorRows as { course_id: number }[]).map((b) => b.course_id)])];

  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", mentorIds.length ? mentorIds : ["00000000-0000-0000-0000-000000000000"]);
  const { data: courses } = await supabase.from("courses").select("id, name").in("id", courseIds.length ? courseIds : [0]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const courseMap = new Map((courses ?? []).map((c) => [c.id, c.name]));

  type LearnerRow = { id: number; mentor_id: string; course_id: number; start_ts: string; end_ts: string; duration_minutes: number; status: string; meeting_link: string | null; created_at: string };
  type MentorRow = { id: number; learner_id: string; course_id: number; start_ts: string; end_ts: string; duration_minutes: number; status: string; meeting_link: string | null; created_at: string };

  const myBookingsAsLearner = (learnerRows as LearnerRow[]).map((b) => ({
    ...b,
    mentor: { full_name: profileMap.get(b.mentor_id) ?? null },
    course: { name: courseMap.get(b.course_id) ?? null },
  }));

  const myBookingsAsMentor = (mentorRows as MentorRow[]).map((b) => ({
    ...b,
    learner: { full_name: profileMap.get(b.learner_id) ?? null },
    course: { name: courseMap.get(b.course_id) ?? null },
  }));

  const { data: reviewedBookingIds } = await supabase
    .from("reviews")
    .select("booking_id")
    .in("booking_id", myBookingsAsLearner.map((b) => b.id));
  const reviewedSet = new Set(
    (reviewedBookingIds ?? []).map((r) => r.booking_id)
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Bookings</h1>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
        >
          Dashboard
        </Link>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">
          Booking saya (sebagai learner)
        </h2>
        <BookingsList
          bookings={myBookingsAsLearner as unknown as BookingRow[]}
          role="learner"
          reviewedIds={reviewedSet}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">
          Booking masuk (sebagai mentor)
        </h2>
        <BookingsList
          bookings={myBookingsAsMentor as unknown as BookingRow[]}
          role="mentor"
          reviewedIds={new Set()}
        />
      </section>
    </div>
  );
}

type BookingRow = {
  id: number;
  start_ts: string;
  end_ts: string;
  duration_minutes: number;
  status: string;
  meeting_link: string | null;
  created_at: string;
  mentor?: { full_name: string | null };
  learner?: { full_name: string | null };
  course?: { name: string } | null;
};
