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

  type RoomRow = { id: number; mentor_id: string; scheduled_end: string; status: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roomRaw, error: roomErr } = await (service as any)
    .from("rooms")
    .select("id, mentor_id, scheduled_end, status")
    .eq("id", roomId)
    .single();

  const room = roomRaw as RoomRow | null;

  if (roomErr || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.mentor_id !== user.id) {
    return NextResponse.json(
      { error: "Only mentor can mark complete" },
      { status: 403 }
    );
  }

  if (room.status !== "scheduled") {
    return NextResponse.json(
      { error: "Room harus dalam status scheduled" },
      { status: 400 }
    );
  }

  const now = new Date();
  const sessionEnd = new Date(room.scheduled_end);
  if (now < sessionEnd) {
    return NextResponse.json(
      { error: "Sesi belum selesai (waktu belum lewat)" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (service as any).from("rooms")
    .update({ status: "finished", updated_at: now.toISOString() })
    .eq("id", roomId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (service as any).from("bookings")
    .update({ status: "completed" })
    .eq("room_id", roomId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payments } = await (service as any).from("payments")
    .select("mentor_amount")
    .eq("room_id", roomId)
    .eq("status", "escrow");

  const totalMentorAmount =
    (payments ?? []).reduce(
      (sum: number, p: { mentor_amount?: number | null }) =>
        sum + Number(p.mentor_amount ?? 0),
      0
    ) || 0;

  if (totalMentorAmount > 0) {
    // 1. Credit wallet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (service as any).from("wallet_entries").insert({
      mentor_id: room.mentor_id,
      room_id: roomId,
      entry_type: "credit",
      amount: totalMentorAmount,
      reason: "Payout sesi room selesai",
    });

    // 2. Update all escrow payments to released (as per the Payment Concept spec)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (service as any).from("payments")
      .update({
        status: "released",
        direction: "platform_to_mentor",
      })
      .eq("room_id", roomId)
      .eq("status", "escrow");
  }

  return NextResponse.json({ ok: true, status: "finished" });
}
