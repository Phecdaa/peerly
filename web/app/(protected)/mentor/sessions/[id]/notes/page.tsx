import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { SessionNotesClient } from "./SessionNotesClient";

export default async function SessionNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roomId = parseInt(id, 10);
  if (Number.isNaN(roomId)) notFound();

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify mentor status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_mentor, mentor_status")
    .eq("id", user.id)
    .single();

  if (!profile?.is_mentor || profile?.mentor_status !== "approved") {
    redirect("/dashboard");
  }

  // Fetch room
  const { data: room } = await supabase
    .from("rooms")
    .select("id, title, status, scheduled_start, scheduled_end, mentor_id")
    .eq("id", roomId)
    .eq("mentor_id", user.id)
    .single();

  if (!room) notFound();

  // Fetch participants
  const { data: participants } = await supabase
    .from("room_participants")
    .select("user_id")
    .eq("room_id", roomId);

  const userIds = (participants || []).map((p) => p.user_id);
  const { data: participantProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  // Fetch existing notes
  const { data: existingNote } = await supabase
    .from("session_notes")
    .select("content")
    .eq("room_id", roomId)
    .eq("mentor_id", user.id)
    .maybeSingle();

  return (
    <SessionNotesClient
      roomId={roomId}
      title={room.title || "Study Session"}
      status={room.status}
      scheduledStart={room.scheduled_start}
      scheduledEnd={room.scheduled_end}
      participants={participantProfiles || []}
      existingContent={existingNote?.content || ""}
      mentorId={user.id}
    />
  );
}
