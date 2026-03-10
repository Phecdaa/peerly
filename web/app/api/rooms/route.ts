import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type CreateRoomBody = {
  availability_id: number;
  course_id?: number;
  title?: string;
  description?: string;
  mode?: "online" | "offline" | "hybrid";
  is_public?: boolean;
  payment_mode?: "split_equal" | "split_custom";
  participant_ids?: string[];
};

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateRoomBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    availability_id,
    course_id,
    title,
    description,
    mode = "online",
    is_public = false,
    payment_mode = "split_equal",
    participant_ids = [],
  } = body;

  if (typeof availability_id !== "number") {
    return NextResponse.json(
      { error: "availability_id is required" },
      { status: 400 }
    );
  }

  // Fetch availability & mentor info
  const { data: availability, error: availabilityErr } = await supabase
    .from("availabilities")
    .select("id, mentor_id, start_ts, end_ts, max_students")
    .eq("id", availability_id)
    .single();

  if (availabilityErr || !availability) {
    return NextResponse.json(
      { error: "Availability not found" },
      { status: 404 }
    );
  }

  // Host is always included as participant
  const uniqueParticipantIds = Array.from(
    new Set([user.id, ...participant_ids])
  );

  const service = getSupabaseServiceClient();

  // One availability = one active room (not cancelled/finished)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingRoom } = (await (service as any)
    .from("rooms")
    .select("id")
    .eq("availability_id", availability.id)
    .in("status", ["pending_payment", "waiting_mentor_approval", "scheduled", "ongoing"])
    .maybeSingle()) as { data: { id: number } | null };

  if (existingRoom) {
    return NextResponse.json(
      { error: "Slot ini sudah dipakai untuk room lain" },
      { status: 409 }
    );
  }

  if (uniqueParticipantIds.length > availability.max_students) {
    return NextResponse.json(
      { error: "Jumlah peserta melebihi kapasitas slot" },
      { status: 409 }
    );
  }

  // Create room + participants
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: room, error: roomErr } = await (service as any)
    .from("rooms")
    .insert({
      mentor_id: availability.mentor_id,
      host_id: user.id,
      availability_id: availability.id,
      course_id: course_id ?? null,
      title: title ?? null,
      description: description ?? null,
      mode,
      is_public,
      payment_mode,
      scheduled_start: availability.start_ts,
      scheduled_end: availability.end_ts,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (roomErr || !room) {
    return NextResponse.json({ error: roomErr?.message }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: participantsErr } = await (service as any)
    .from("room_participants")
    .insert(
      uniqueParticipantIds.map((uid) => ({
        room_id: room.id,
        user_id: uid,
        role: uid === user.id ? "host" : "participant",
      }))
    );

  if (participantsErr) {
    return NextResponse.json(
      { error: participantsErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: room.id, status: "pending_payment" });
}

