import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type InviteBody = { participant_id: string };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: InviteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { participant_id } = body;
  if (!participant_id) {
    return NextResponse.json(
      { error: "participant_id is required" },
      { status: 400 }
    );
  }

  const roomId = parseInt(id, 10);
  if (Number.isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  }

  const service = getSupabaseServiceClient();

  type RoomRow = {
    id: number;
    host_id: string;
    mentor_id: string;
    availability_id: number;
    status: string;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roomRaw, error: roomErr } = await (service as any)
    .from("rooms")
    .select("id, host_id, mentor_id, availability_id, status")
    .eq("id", roomId)
    .single();

  const room = roomRaw as RoomRow | null;

  if (roomErr || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Freeze participants after mentor accepts (waiting_payment) to keep split deterministic
  if (room.status !== "pending_mentor_accept") {
    return NextResponse.json(
      { error: "Room tidak bisa di-invite lagi" },
      { status: 400 }
    );
  }

  const isHost = room.host_id === user.id;
  const isMentor = room.mentor_id === user.id;
  if (!isHost && !isMentor) {
    return NextResponse.json({ error: "Only host or mentor can invite" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: availability } = await (service as any)
    .from("availabilities")
    .select("max_students")
    .eq("id", room.availability_id)
    .single();

  const maxStudents = availability?.max_students ?? 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: participants } = await (service as any)
    .from("room_participants")
    .select("id")
    .eq("room_id", roomId);

  const currentCount = participants?.length ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roomCap } = await (service as any)
    .from("rooms")
    .select("intended_participant_count")
    .eq("id", roomId)
    .single();
  const intendedCap = Number(roomCap?.intended_participant_count ?? 1);

  const effectiveCap = Math.min(maxStudents, intendedCap);
  if (currentCount >= effectiveCap) {
    return NextResponse.json(
      { error: "Kapasitas room sudah penuh" },
      { status: 409 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (service as any)
    .from("room_participants")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", participant_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "User sudah menjadi peserta" },
      { status: 409 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertErr } = await (service as any).from("room_participants").insert({
    room_id: roomId,
    user_id: participant_id,
    role: "participant",
  });

  if (insertErr) {
    return NextResponse.json(
      { error: insertErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
