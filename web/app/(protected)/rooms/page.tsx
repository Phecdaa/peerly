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
