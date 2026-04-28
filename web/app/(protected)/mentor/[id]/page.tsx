import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CreateRoomForm } from "./CreateRoomForm";
import { MentorTabs } from "./MentorTabs";

export default async function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, university, bio, hourly_rate, avatar_url, gender, region, major, semester")
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

  const { data: mentorRooms } = await supabase
    .from("rooms")
    .select("id")
    .eq("mentor_id", id);
  const roomIds = (mentorRooms ?? []).map((b) => b.id);
  
  let average_rating: number | null = null;
  let review_count = 0;
  let reviewsList: any[] = [];
  
  if (roomIds.length > 0) {
    const { data: rev } = await supabase
      .from("reviews")
      .select("rating, comment, created_at, reviewer_id")
      .in("room_id", roomIds)
      .order("created_at", { ascending: false });
      
    reviewsList = rev ?? [];
    const ratings = reviewsList.map((r) => r.rating);
    review_count = ratings.length;
    average_rating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  }

  const reviewerIds = [...new Set(reviewsList.map(r => r.reviewer_id))];
  const { data: reviewersData } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", reviewerIds.length ? reviewerIds : ["00000000-0000-0000-0000-000000000000"]);
    
  const reviewerMap: Record<string, string> = {};
  (reviewersData ?? []).forEach(p => {
    reviewerMap[p.id] = p.full_name || "User";
  });

  const aboutComponent = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
      <div className="lg:col-span-2 flex flex-col gap-lg">
        <section className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 p-8">
          <h2 className="font-h2 text-h2 text-on-surface mb-6">About Me</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6 whitespace-pre-wrap">
            {profile.bio || "No biography provided."}
          </p>
        </section>
        <section className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 p-8">
          <h2 className="font-h2 text-h2 text-on-surface mb-6">Course Expertise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map((c: any) => (
              <div key={c.id} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface">{c.name}</span>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p className="text-sm text-on-surface-variant">No courses assigned yet.</p>}
          </div>
        </section>
      </div>
      <div className="flex flex-col gap-lg">
        <section className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 p-6">
          <h2 className="font-h3 text-h3 text-on-surface mb-6">Quick Stats</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">schedule</span>
                Total Sessions
              </span>
              <span className="font-label-md text-label-md text-on-surface">{roomIds.length}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">groups</span>
                Students Helped
              </span>
              <span className="font-label-md text-label-md text-on-surface">{review_count}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const availabilityComponent = (
    <section className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 p-8">
      <h2 className="font-h2 text-h2 text-on-surface mb-6">Select a Slot</h2>
      <CreateRoomForm
        mentorId={id}
        mentorName={profile.full_name ?? "Mentor"}
        mentorHourlyRate={profile.hourly_rate ?? 0}
        courses={courses}
        slots={slots}
      />
    </section>
  );

  const reviewsComponent = (
    <section className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 p-8">
      <h2 className="font-h2 text-h2 text-on-surface mb-6">Reviews & Rating</h2>
      {reviewsList.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-on-surface-variant">No reviews yet for this mentor.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="border-b border-outline-variant/30 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md text-on-surface">{reviewerMap[rev.reviewer_id] ?? "User"}</span>
                <span className="text-amber-500 flex tracking-widest text-sm">
                  {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">"{rev.comment}"</p>
              <p className="text-xs text-outline mt-2">
                {new Date(rev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <MentorTabs 
      mentorId={id} 
      profile={profile}
      courses={courses}
      average_rating={average_rating}
      review_count={review_count}
      aboutComponent={aboutComponent} 
      availabilityComponent={availabilityComponent} 
      reviewsComponent={reviewsComponent} 
    />
  );
}
