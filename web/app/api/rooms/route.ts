import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type CreateRoomBody = {
  availability_id: number;
  title?: string;
  description?: string;
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
    title,
    description,
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

  // Use service client to perform a transactional check + insert
  const service = getSupabaseServiceClient();

  // We approximate transactional capacity check by counting existing participants
  const { data: existingParticipants, error: existingErr } = await service
    .from("room_participants")
    .select("id, room_id")
    .in(
      "room_id",
      (await service
        .from("rooms")
        .select("id")
        .eq("availability_id", availability.id))?.data?.map((r) => r.id) ?? []
    );

  if (existingErr) {
    return NextResponse.json(
      { error: existingErr.message },
      { status: 500 }
    );
  }

  const currentCount = existingParticipants?.length ?? 0;
  const requestedCount = uniqueParticipantIds.length;

  if (currentCount + requestedCount > availability.max_students) {
    return NextResponse.json(
      { error: "Slot capacity exceeded" },
      { status: 409 }
    );
  }

  // Create room + participants
  const { data: room, error: roomErr } = await service
    .from("rooms")
    .insert({
      mentor_id: availability.mentor_id,
      host_id: user.id,
      availability_id: availability.id,
      title: title ?? null,
      description: description ?? null,
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

  const { error: participantsErr } = await service
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

