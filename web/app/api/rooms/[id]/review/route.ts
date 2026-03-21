import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

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

  const body = await request.json().catch(() => ({}));
  const rating = parseInt(body.rating, 10);
  const comment = body.comment?.trim() || null;

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus 1-5" }, { status: 400 });
  }

  // Verify user is host or participant
  const { data: participant } = await supabase
    .from("room_participants")
    .select("role")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!participant) {
    return NextResponse.json({ error: "Kamu bukan peserta room ini" }, { status: 403 });
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("status")
    .eq("id", roomId)
    .single();

  if (room?.status !== "finished") {
    return NextResponse.json({ error: "Ulasan hanya bisa diberikan jika sesi sudah selesai" }, { status: 400 });
  }

  const service = getSupabaseServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (service as any)
    .from("reviews")
    .insert({ room_id: roomId, reviewer_id: user.id, rating, comment });

  if (error) {
    if (error.code === "23505") { // unique violation
      return NextResponse.json({ error: "Kamu sudah memberikan ulasan untuk sesi ini." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
