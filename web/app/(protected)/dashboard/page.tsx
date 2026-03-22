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
    <div className="bg-zinc-50 min-h-screen md:pb-8 pb-20">
      <header className="bg-blue-600 px-6 pt-10 pb-12 rounded-b-3xl text-white shadow-sm relative z-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-row items-center gap-2 md:hidden shrink-0">
            <img src="/logo-putih.png" alt="Peerly Icon" className="w-8 h-8 object-contain shrink-0" />
            <img src="/nama-putih.png" alt="Peerly" className="h-[18px] w-auto object-contain shrink-0" />
          </div>
          <div className="flex items-center gap-3">
             <Link href="/notifications" className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {/* Red dot for unread can be added here dynamically later */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-blue-600 rounded-full"></span>
             </Link>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Hi, {profile?.full_name ?? user.email?.split("@")[0]}</h1>
          <p className="text-blue-100 mt-1">Mau belajar mata kuliah apa hari ini?</p>
        </div>
      </header>

      {/* Floating Search Bar */}
      <div className="px-6 -mt-7 relative z-10 text-zinc-900">
        <form action="/mentors" method="GET" className="bg-white rounded-xl shadow-md border border-zinc-100 flex items-center px-4 py-3 gap-3">
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" name="q" placeholder="Cari mata kuliah atau mentor?" className="flex-1 bg-transparent text-sm outline-none w-full" />
        </form>
      </div>

      {/* Promo Banner */}
      <div className="px-4 mt-8 relative z-10 w-full overflow-hidden">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
           {/* Slide 1 */}
           <div className="snap-center shrink-0 w-[85vw] max-w-sm rounded-2xl overflow-hidden relative shadow-sm border border-zinc-100 bg-white">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/promo1.jpg')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>
              <div className="relative z-10 text-white p-5 h-36 flex flex-col justify-end">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1.5">Event Spesial</p>
                  <h2 className="text-lg font-black tracking-wide leading-tight mb-2">DISKON MENTOR<br/>HINGGA 50%</h2>
              </div>
           </div>

           {/* Slide 2 */}
           <div className="snap-center shrink-0 w-[85vw] max-w-sm rounded-2xl overflow-hidden relative shadow-sm border border-zinc-100 bg-white">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/promo2.jpeg')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/40"></div>
              <div className="relative z-10 text-white p-5 h-36 flex flex-col justify-end">
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1.5">Open Recruitment</p>
                  <h2 className="text-lg font-black tracking-wide leading-tight mb-2">LOWONGAN MENTOR<br/>DAFTAR SEKARANG</h2>
                  <Link href="/apply" className="inline-block self-start text-[10px] font-bold bg-white text-indigo-900 px-4 py-1.5 rounded-full shadow-sm">Daftar</Link>
              </div>
           </div>
        </div>
      </div>

      {/* Pilihan Matkul Grid */}
      <div className="px-6 mt-8">
        <h3 className="text-zinc-900 font-bold mb-4 text-lg">Pilihan Mata Kuliah</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(courses ?? []).map((course) => (
             <Link key={course.id} href={`/mentors?subject=${course.slug}`} className="rounded-2xl overflow-hidden group block shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 bg-white h-full">
                <div className="bg-zinc-50 group-hover:bg-zinc-100 transition-colors duration-300 h-full">
                   <div className="flex flex-col items-center justify-start p-4 h-full gap-2">
                      <img src={`/${course.slug}.png`} alt={course.name} className="w-14 h-14 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-[11px] md:text-xs font-bold text-zinc-800 text-center leading-snug">{course.name}</span>
                   </div>
                </div>
             </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
