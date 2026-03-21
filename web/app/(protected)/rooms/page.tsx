import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoomTime } from "./[id]/RoomTime";

export default async function RoomsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

    const { data: asHost } = await supabase
      .from("rooms")
      .select("id, title, status, scheduled_start, scheduled_end")
      .eq("host_id", user.id)
      .order("scheduled_start", { ascending: false })
      .limit(20);

    const { data: asParticipant } = await supabase
      .from("room_participants")
      .select("room_id")
      .eq("user_id", user.id);
    const partRoomIds = [...new Set((asParticipant ?? []).map((p) => p.room_id))];
    const { data: asParticipantRooms } =
      partRoomIds.length > 0
        ? await supabase
            .from("rooms")
            .select("id, title, status, scheduled_start, scheduled_end")
            .in("id", partRoomIds)
            .neq("host_id", user.id)
            .order("scheduled_start", { ascending: false })
            .limit(20)
        : { data: [] };

    const { data: asMentor } = await supabase
      .from("rooms")
      .select("id, title, status, scheduled_start, scheduled_end")
      .eq("mentor_id", user.id)
      .order("scheduled_start", { ascending: false })
      .limit(20);

    const statusLabel: Record<string, string> = {
      pending_mentor_accept: "Menunggu mentor menerima",
      waiting_payment: "Menunggu pembayaran",
      scheduled: "Terjadwal",
      ongoing: "Berlangsung",
      finished: "Selesai",
      cancelled: "Dibatalkan",
    };

    return (
      <div className="page">
        <header className="bg-blue-600 px-6 pt-10 pb-6 rounded-b-3xl text-white shadow-sm relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1 -ml-1 hover:bg-white/20 rounded-full transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-xl font-bold tracking-wide">Room Saya</h1>

        </div>
      </header>

      <div className="px-4 py-6 space-y-8 pb-10">
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 px-2 border-l-4 border-blue-600">
            Sebagai Peserta (Learner)
          </h2>
          {!asParticipantRooms?.length ? (
            <p className="text-xs text-zinc-500 px-2">Belum ada room.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {(asParticipantRooms ?? []).map((r) => (
                <li key={r.id}>
                  <Link href={`/rooms/${r.id}`} className="flex gap-3 bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 hover:border-blue-200 transition">
                    <div className="w-24 h-28 bg-zinc-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                         <svg className="w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <p className="text-[10px] text-zinc-500 mb-1 font-medium"><RoomTime startTs={r.scheduled_start} shortDate /></p>
                      <p className="text-[10px] text-zinc-400 mb-1.5 truncate">ID Room: {String(r.id).split('-')[0].toUpperCase()}</p>
                      <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 mb-2">{r.title || "Sesi belajar"}</h3>
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${['finished', 'ongoing'].includes(r.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          Status: {statusLabel[r.status] ?? r.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 px-2 border-l-4 border-blue-600">
            Sebagai Host (Pembuat Room)
          </h2>
          {!asHost?.length ? (
            <p className="text-xs text-zinc-500 px-2">Belum ada room.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {(asHost ?? []).map((r) => (
                <li key={r.id}>
                  <Link href={`/rooms/${r.id}`} className="flex gap-3 bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 hover:border-blue-200 transition">
                    <div className="w-24 h-28 bg-zinc-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-zinc-100 flex items-center justify-center">
                         <svg className="w-8 h-8 text-zinc-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <p className="text-[10px] text-zinc-500 mb-1 font-medium"><RoomTime startTs={r.scheduled_start} shortDate /></p>
                      <p className="text-[10px] text-zinc-400 mb-1.5 truncate">ID Room: {String(r.id).split('-')[0].toUpperCase()}</p>
                      <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 mb-2">{r.title || "Sesi belajar"}</h3>
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${['finished', 'ongoing'].includes(r.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          Status: {statusLabel[r.status] ?? r.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 px-2 border-l-4 border-blue-600">
            Sebagai Mentor
          </h2>
          {!asMentor?.length ? (
            <p className="text-xs text-zinc-500 px-2">Belum ada room.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {(asMentor ?? []).map((r) => (
                <li key={r.id}>
                  <Link href={`/rooms/${r.id}`} className="flex gap-3 bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 hover:border-blue-200 transition">
                    <div className="w-24 h-28 bg-zinc-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                         <svg className="w-8 h-8 text-indigo-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <p className="text-[10px] text-zinc-500 mb-1 font-medium"><RoomTime startTs={r.scheduled_start} shortDate /></p>
                      <p className="text-[10px] text-zinc-400 mb-1.5 truncate">ID Room: {String(r.id).split('-')[0].toUpperCase()}</p>
                      <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 mb-2">{r.title || "Sesi belajar"}</h3>
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${['finished', 'ongoing'].includes(r.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          Status: {statusLabel[r.status] ?? r.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
