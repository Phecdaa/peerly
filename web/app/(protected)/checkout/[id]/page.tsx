import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roomId = parseInt(id, 10);
  
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (Number.isNaN(roomId)) {
    return <div className="p-8 text-red-500">Invalid Room ID</div>;
  }

  // Fetch Room Data
  const { data: room } = await supabase
    .from("rooms")
    .select(`
      id,
      title,
      mentor_id,
      host_id,
      scheduled_start,
      scheduled_end,
      payment_mode,
      intended_participant_count,
      status,
      room_participants (
        user_id,
        has_paid
      )
    `)
    .eq("id", roomId)
    .single();

  if (!room) {
    return <div className="p-8 text-red-500">Room not found</div>;
  }

  // Check if user is a participant and has already paid
  const isParticipant = room.room_participants?.some((p: any) => p.user_id === user.id);
  const participantData = room.room_participants?.find((p: any) => p.user_id === user.id);

  if (!isParticipant && room.host_id !== user.id && room.mentor_id !== user.id) {
    return <div className="p-8 text-red-500">You are not part of this room.</div>;
  }

  // If already paid, or if mentor, redirect back to room
  if (participantData?.has_paid || room.mentor_id === user.id) {
    redirect(`/rooms/${roomId}`);
  }

  // Fetch Mentor details
  const { data: mentorProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, hourly_rate")
    .eq("id", room.mentor_id)
    .single();

  const mentorName = mentorProfile?.full_name || "Unknown Mentor";
  const mentorAvatar = mentorProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mentorName)}`;
  
  // Calculate pricing
  const durationMin = (new Date(room.scheduled_end).getTime() - new Date(room.scheduled_start).getTime()) / 60000;
  const hourlyRate = Number(mentorProfile?.hourly_rate ?? 0);
  const baseRate = (hourlyRate * durationMin) / 60;
  
  const participantCount = room.room_participants?.length ?? 0;
  const intendedCount = Math.max(1, Number(room.intended_participant_count) ?? participantCount);
  
  let amountPerPerson = intendedCount > 0 ? baseRate / intendedCount : baseRate;

  // Host pays all logic
  if (room.payment_mode === "host_pays_all") {
    amountPerPerson = user.id === room.host_id ? baseRate : 0;
  }

  // If amount to pay is 0, they shouldn't be here
  if (amountPerPerson <= 0) {
    redirect(`/rooms/${roomId}`);
  }

  const platformFee = 2500; // Flat fee or calculate %
  const totalAmount = amountPerPerson + platformFee;

  return (
    <CheckoutClient
      roomId={roomId}
      title={room.title || "Study Session"}
      mentorName={mentorName}
      mentorAvatar={mentorAvatar}
      participantCount={intendedCount}
      baseRate={baseRate}
      amountPerPerson={amountPerPerson}
      platformFee={platformFee}
      totalAmount={totalAmount}
    />
  );
}
