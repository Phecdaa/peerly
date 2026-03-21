import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

type Profile = {
  full_name: string | null;
  role: string;
  is_mentor: boolean;
  mentor_status: string;
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_mentor, mentor_status")
    .eq("id", user.id)
    .single<Profile>();

  const isAdmin = profile?.role === "admin";
  const isMentor = profile?.is_mentor;
  const isApprovedMentor = profile?.mentor_status === "approved";

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="bg-white min-h-screen md:rounded-3xl md:shadow-sm md:overflow-hidden md:border border-zinc-100">
      {/* Blue Header Area */}
      <div className="bg-blue-600 px-6 pt-10 pb-16 relative">
        <div className="flex justify-between items-start text-white">
          <div>
            <h1 className="text-2xl font-bold">Hi, {profile?.full_name ?? user.email?.split("@")[0]}</h1>
            <p className="text-blue-100 mt-1">Mau belajar materi apa hari ini?</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            {/* The LogoutButton or Profile icon can go here, but since Akun is in the bottom nav, we just leave notification */}
          </div>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="px-6 -mt-7 relative z-10 text-zinc-900">
        <form action="/mentors" method="GET" className="bg-white rounded-xl shadow-md border border-zinc-100 flex items-center px-4 py-3 gap-3">
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" name="q" placeholder="Cari materi atau mentor?" className="flex-1 bg-transparent text-sm outline-none w-full" />
        </form>
      </div>

      {/* Promo Banner */}
      <div className="px-6 mt-6">
        <div className="bg-slate-900 rounded-2xl overflow-hidden relative h-36 flex items-center px-6 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-900 opacity-90"></div>
          <div className="relative z-10 text-white">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1.5">New Feature</p>
              <h2 className="text-xl md:text-2xl font-black italic tracking-wide leading-tight mb-2">NEW SUBJECT<br/>JAVASCRIPT</h2>
              <Link href="/mentors?subject=javascript" className="inline-block text-[10px] font-semibold bg-white text-blue-900 px-4 py-1.5 rounded-full shadow-sm hover:opacity-90 transition">Cari Mentor</Link>
          </div>
        </div>
      </div>

      {/* Pilihan Mapel Grid */}
      <div className="px-6 mt-8">
        <h3 className="text-zinc-900 font-bold mb-4 text-lg">Pilihan Mapel</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(courses ?? []).map((course) => (
             <Link key={course.id} href={`/mentors?subject=${course.slug}`} className="relative h-32 md:h-40 rounded-2xl overflow-hidden group block shadow-sm border border-zinc-100">
                <div className="absolute inset-0 bg-zinc-200 group-hover:scale-110 transition-transform duration-500">
                   <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-300 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                   </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white text-sm font-semibold tracking-wide drop-shadow-md">{course.name}</div>
             </Link>
          ))}
        </div>
      </div>

      {/* Legacy Mentoring UI (dipertahankan agar fitur tidak hilang) */}
      <div className="px-6 mt-10 mb-8 pt-8 border-t border-zinc-100">
        <h3 className="text-zinc-900 font-bold mb-4 text-sm">Shortcut / Menu Lainnya</h3>
        <div className="space-y-3">
          {(!isMentor || isApprovedMentor) && (
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 text-sm">
              <h4 className="font-medium text-zinc-900 mb-2">Untuk Mahasiswa</h4>
              <div className="flex flex-wrap gap-2">
                <Link href="/mentors" className="text-xs bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:border-blue-300">Semua Mentor</Link>
                <Link href="/rooms" className="text-xs bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:border-blue-300">Room Saya</Link>
              </div>
            </div>
          )}

          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Area Mentor</h4>
            <div className="flex flex-wrap gap-2">
              <Link href="/apply" className="text-xs bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                {isApprovedMentor ? "Kelola Profil Mentor" : isMentor ? "Status Pengajuan" : "Karier Mentor"}
              </Link>
              {isApprovedMentor && (
                <>
                  <Link href="/mentor/availability" className="text-xs bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">Atur Availability</Link>
                </>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-sm">
              <h4 className="font-medium text-amber-900 mb-2">Admin Dashboard</h4>
              <Link href="/admin" className="text-xs bg-white text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100">Buka Panel Admin</Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

