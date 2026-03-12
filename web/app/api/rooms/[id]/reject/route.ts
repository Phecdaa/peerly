import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type RejectBody = { reason?: string };

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

  const roomId = parseInt(id, 10);
  if (Number.isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  }

  let body: RejectBody = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    /* empty */
  }

  const service = getSupabaseServiceClient();

  type RoomRow = { id: number; mentor_id: string; status: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roomRaw, error: roomErr } = await (service as any)
    .from("rooms")
    .select("id, mentor_id, status")
    .eq("id", roomId)
    .single();

  const room = roomRaw as RoomRow | null;

  if (roomErr || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.mentor_id !== user.id) {
    return NextResponse.json({ error: "Only mentor can reject" }, { status: 403 });
  }

  if (!["pending_mentor_accept", "waiting_payment"].includes(room.status)) {
    return NextResponse.json(
      { error: "Room tidak bisa ditolak" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (service as any).from("rooms")
    .update({
      status: "cancelled",
      cancel_reason: body.reason ?? "Ditolak mentor",
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId);

  return NextResponse.json({ ok: true, status: "cancelled" });
}
