import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CreateRoomForm } from "./CreateRoomForm";
import { ReportButton } from "@/components/ReportButton";
import { MentorTabs } from "./MentorTabs";

type Params = { params: Promise<{ id: string }> };

export default async function MentorDetailPage({ params }: Params) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    average_rating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
  }

  // Fetch profiles for the reviewers to get their names
  const reviewerIds = [...new Set(reviewsList.map(r => r.reviewer_id))];
  const { data: reviewersData } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", reviewerIds.length ? reviewerIds : ["00000000-0000-0000-0000-000000000000"]);
    
  const reviewerMap: Record<string, string> = {};
  (reviewersData ?? []).forEach(p => {
    reviewerMap[p.id] = p.full_name || "User";
  });

  return (
    <div className="bg-zinc-50 min-h-screen md:pb-8 pb-20">
      {/* Blue Header */}
      <header className="bg-blue-600 px-6 pt-10 pb-6 rounded-b-3xl text-white shadow-sm relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/mentors" className="p-1 -ml-1 hover:bg-white/20 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-xl font-bold tracking-wide">Detail Mentor</h1>
        </div>
      </header>

      {/* WhatsApp style Avatar Overlapping Card */}
      <div className="px-4 -mt-4 relative z-20 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 flex gap-4 items-center">
           <div 
              className="w-20 h-20 rounded-xl bg-slate-200 border-[3px] border-white shadow-sm flex-shrink-0 bg-cover bg-center" 
              style={{backgroundImage: `url(${profile.avatar_url || "https://api.dicebear.com/7.x/initials/svg?seed="+encodeURIComponent(profile.full_name || "M")})`}}
           ></div>
           <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-zinc-900 leading-tight truncate">{profile.full_name || "Mentor"}</h2>
              <div className="flex items-center gap-1 mt-1">
                 <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                 <span className="text-amber-500 text-xs font-semibold">{average_rating ? average_rating.toFixed(1) : "Baru"}</span>
                 {review_count > 0 && <span className="text-zinc-400 text-[10px] ml-0.5">({review_count})</span>}
              </div>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{profile.university || "Universitas"} {profile.major && `• ${profile.major}`}</p>
           </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-2">
        <MentorTabs 
           mentorId={id}
           jadwalComponent={
              <div className="space-y-4">
                 <section className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    <h3 className="text-sm font-bold text-zinc-900 mb-2">Informasi</h3>
                    <p className="text-xs text-zinc-600 mb-4 whitespace-pre-wrap leading-relaxed">{profile.bio || "Belum ada informasi biografi."}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                       <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium inline-flex items-center gap-1">
                          📋 {courses.map((c: { name: string }) => c.name).join(", ")}
                       </span>
                       {profile.gender && (
                         <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded font-medium inline-flex items-center gap-1">
                            👤 {profile.gender === 'male' ? 'Laki-laki' : profile.gender === 'female' ? 'Perempuan' : 'Lainnya'}
                         </span>
                       )}
                       {profile.region && (
                         <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded font-medium inline-flex items-center gap-1">
                            📍 {profile.region}
                         </span>
                       )}
                       {profile.semester && (
                         <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded font-medium inline-flex items-center gap-1">
                            🎓 Semester {profile.semester}
                         </span>
                       )}
                       {profile.hourly_rate != null && (
                         <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium inline-flex items-center gap-1">
                            💵 Rp {Number(profile.hourly_rate).toLocaleString()}/jam
                         </span>
                       )}
                    </div>
                 </section>

                 <section id="booking-form" className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm scroll-mt-24">
                    <h3 className="text-sm font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100">
                       Pilih slot & booking sesi
                    </h3>
                    <CreateRoomForm
                       mentorId={id}
                       mentorName={profile.full_name ?? "Mentor"}
                       mentorHourlyRate={profile.hourly_rate ?? 0}
                       courses={courses}
                       slots={slots}
                    />
                 </section>
              </div>
           }
           ulasanComponent={
              <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                 <h3 className="text-sm font-bold text-zinc-900 mb-4">Ulasan & Rating</h3>
                 {reviewsList.length === 0 ? (
                    <div className="text-center py-8">
                       <p className="text-xs text-zinc-500">Belum ada ulasan untuk mentor ini.</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {reviewsList.map((rev) => (
                          <div key={rev.id} className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                             <div className="flex items-center justify-between mb-1.5">
                                <span className="font-semibold text-xs text-zinc-900">{reviewerMap[rev.reviewer_id] ?? "User"}</span>
                                <span className="text-[10px] text-amber-500 flex tracking-widest">
                                   {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                                </span>
                             </div>
                             <p className="text-[11px] text-zinc-600 leading-relaxed italic">"{rev.comment}"</p>
                             <p className="text-[9px] text-zinc-400 mt-1.5">
                                {new Date(rev.created_at).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}
                             </p>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           }
        />
      </div>
    </div>
  );
}
