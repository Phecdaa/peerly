import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(
  _request: NextRequest,
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

  const roomId = parseInt(id, 10);
  if (Number.isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  }

  const service = getSupabaseServiceClient();

  type RoomRow = {
    id: number;
    mentor_id: string;
    host_id: string;
    course_id: number | null;
    status: string;
    scheduled_start: string;
    scheduled_end: string;
    room_participants?: { user_id: string; has_paid: boolean }[];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roomRaw, error: roomErr } = await (service as any)
    .from("rooms")
    .select("id, mentor_id, host_id, course_id, status, scheduled_start, scheduled_end, room_participants( user_id, has_paid )")
    .eq("id", roomId)
    .single();

  const room = roomRaw as RoomRow | null;

  if (roomErr || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.mentor_id !== user.id) {
    return NextResponse.json({ error: "Only mentor can accept" }, { status: 403 });
  }

  if (room.status !== "waiting_mentor_approval") {
    return NextResponse.json(
      { error: "Room is not waiting for mentor approval" },
      { status: 400 }
    );
  }

  const participants = room.room_participants ?? [];
  const paidParticipants = participants.filter((p) => p.has_paid);
  if (paidParticipants.length === 0) {
    return NextResponse.json(
      { error: "Minimal satu peserta harus sudah bayar" },
      { status: 400 }
    );
  }

  const durationMinutes = Math.round(
    (new Date(room.scheduled_end).getTime() - new Date(room.scheduled_start).getTime()) / 60000
  );

  let courseId = room.course_id;
  if (!courseId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mc } = await (service as any)
      .from("mentor_courses")
      .select("course_id")
      .eq("mentor_id", room.mentor_id)
      .limit(1)
      .maybeSingle();
    courseId = mc?.course_id ?? null;
  }
  if (!courseId) {
    return NextResponse.json(
      { error: "Room atau mentor belum punya mata kuliah" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (service as any).from("rooms").update({ status: "scheduled", updated_at: new Date().toISOString() }).eq("id", roomId);

  for (const p of paidParticipants) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (service as any).from("bookings").insert({
      learner_id: p.user_id,
      mentor_id: room.mentor_id,
      course_id: courseId,
      room_id: roomId,
      start_ts: room.scheduled_start,
      end_ts: room.scheduled_end,
      duration_minutes: durationMinutes,
      status: "paid",
      meeting_link: "https://meet.google.com/new",
    });
  }

  return NextResponse.json({ ok: true, status: "scheduled" });
}
