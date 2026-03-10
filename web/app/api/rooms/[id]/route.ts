import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
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

  const { data: room, error } = await supabase
    .from("rooms")
    .select(
      `
      id,
      mentor_id,
      host_id,
      availability_id,
      title,
      description,
      is_public,
      payment_mode,
      scheduled_start,
      scheduled_end,
      status,
      room_participants (
        id,
        user_id,
        role,
        has_paid,
        amount_to_pay,
        amount_paid
      )
    `
    )
    .eq("id", roomId)
    .single();

  if (error || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // RLS already ensures that only participants/mentor/admin can read.
  return NextResponse.json(room);
}

