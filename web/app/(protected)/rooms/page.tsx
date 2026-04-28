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

  const roomSelectQuery = "id, title, status, scheduled_start, scheduled_end, mode, mentor_id, host_id, room_participants(user_id)";

  const { data: asHost } = await supabase
    .from("rooms")
    .select(roomSelectQuery)
    .eq("host_id", user.id)
    .order("scheduled_start", { ascending: false })
    .limit(20);

  const { data: asParticipantRaw } = await supabase
    .from("room_participants")
    .select("room_id")
    .eq("user_id", user.id);
  
  const partRoomIds = [...new Set((asParticipantRaw ?? []).map((p) => p.room_id))];
  
  const { data: asParticipantRooms } =
    partRoomIds.length > 0
      ? await supabase
          .from("rooms")
          .select(roomSelectQuery)
          .in("id", partRoomIds)
          .neq("host_id", user.id)
          .order("scheduled_start", { ascending: false })
          .limit(20)
      : { data: [] };

  const { data: asMentor } = await supabase
    .from("rooms")
    .select(roomSelectQuery)
    .eq("mentor_id", user.id)
    .order("scheduled_start", { ascending: false })
    .limit(20);

  // Merge and deduplicate all rooms
  const allRoomsMap = new Map();
  [...(asHost ?? []), ...(asParticipantRooms ?? []), ...(asMentor ?? [])].forEach((r) => {
    if (!allRoomsMap.has(r.id)) {
      allRoomsMap.set(r.id, r);
    }
  });
  
  const allRooms = Array.from(allRoomsMap.values()).sort((a, b) => 
    new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime()
  );

  // Fetch all related profiles
  const userIdsToFetch = new Set<string>();
  allRooms.forEach(r => {
    if (r.mentor_id) userIdsToFetch.add(r.mentor_id);
    if (r.host_id) userIdsToFetch.add(r.host_id);
    if (r.room_participants) {
      r.room_participants.forEach((p: any) => userIdsToFetch.add(p.user_id));
    }
  });

  const { data: profiles } = userIdsToFetch.size > 0 
    ? await supabase.from("profiles").select("id, full_name, avatar_url, university, major").in("id", Array.from(userIdsToFetch))
    : { data: [] };

  const profileMap: Record<string, any> = {};
  (profiles ?? []).forEach(p => {
    profileMap[p.id] = p;
  });

  return (
    <div className="flex-1 max-w-[1280px] mx-auto w-full flex flex-col pt-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
        <div>
          <h1 className="font-h2 text-h2 text-on-surface mb-xs">My Rooms</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your study sessions and mentorship rooms.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <RoomsTabs
        allRooms={allRooms}
        profileMap={profileMap}
        currentUserId={user.id}
      />
    </div>
  );
}
