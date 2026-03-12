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
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roomRaw, error: roomErr } = await (service as any)
    .from("rooms")
    .select("id, mentor_id, host_id, course_id, status, scheduled_start, scheduled_end")
    .eq("id", roomId)
    .single();

  const room = roomRaw as RoomRow | null;

  if (roomErr || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.mentor_id !== user.id) {
    return NextResponse.json({ error: "Only mentor can accept" }, { status: 403 });
  }

  if (room.status !== "pending_mentor_accept") {
    return NextResponse.json(
      { error: "Room is not pending mentor accept" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (service as any)
    .from("rooms")
    .update({ status: "waiting_payment", updated_at: new Date().toISOString() })
    .eq("id", roomId);

  return NextResponse.json({ ok: true, status: "waiting_payment" });
}
