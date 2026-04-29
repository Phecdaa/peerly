import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PaymentSuccessClient } from "./PaymentSuccessClient";

export default async function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roomId = parseInt(id, 10);
  if (Number.isNaN(roomId)) notFound();

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch room info
  const { data: room } = await supabase
    .from("rooms")
    .select("id, title, scheduled_start, mentor_id")
    .eq("id", roomId)
    .single();

  if (!room) notFound();

  // Fetch participant payment info
  const { data: participant } = await supabase
    .from("room_participants")
    .select("amount_paid, has_paid")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!participant?.has_paid) {
    redirect(`/checkout/${roomId}`);
  }

  // Fetch mentor name
  const { data: mentorProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", room.mentor_id)
    .single();

  return (
    <PaymentSuccessClient
      roomId={roomId}
      title={room.title || "Study Session"}
      mentorName={mentorProfile?.full_name || "Mentor"}
      amountPaid={Number(participant.amount_paid)}
      scheduledStart={room.scheduled_start}
    />
  );
}
