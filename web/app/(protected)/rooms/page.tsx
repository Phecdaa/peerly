import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoomsTabs } from "./RoomsTabs";

export default async function RoomsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_mentor")
    .eq("id", user.id)
    .single();

  const isMentorRole = profile?.is_mentor ?? false;

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
      <div className="bg-zinc-50 min-h-screen pb-24">
        <header className="bg-blue-600 px-6 pt-10 pb-10 text-white relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-putih.png" alt="Peerly Icon" className="w-8 h-8 object-contain" />
            <img src="/nama-putih.png" alt="Peerly" className="h-[18px] object-contain" />
          </div>
          <div className="flex items-center gap-3">
             <Link href="/notifications" className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
             </Link>
          </div>
        </header>

      <div className="px-4 -mt-6 relative z-20 space-y-8 pb-10">
        <RoomsTabs
        asParticipant={(asParticipantRooms as any[]) ?? []}
        asHost={(asHost as any[]) ?? []}
        asMentor={(asMentor as any[]) ?? []}
        isMentorRole={isMentorRole}
      />
    </div>
  </div>
  );
}
