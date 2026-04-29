import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roomId = parseInt(id, 10);
  if (Number.isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify this mentor owns this room
  const { data: room } = await supabase
    .from("rooms")
    .select("mentor_id")
    .eq("id", roomId)
    .single();

  if (!room || room.mentor_id !== user.id) {
    return NextResponse.json({ error: "Not authorized for this room" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { content } = body;

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
  }

  const service = getSupabaseServiceClient();

  // Upsert: update if exists, insert if not
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (service as any)
    .from("session_notes")
    .select("id")
    .eq("room_id", roomId)
    .eq("mentor_id", user.id)
    .maybeSingle();

  let error;
  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ error } = await (service as any)
      .from("session_notes")
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", existing.id));
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ error } = await (service as any)
      .from("session_notes")
      .insert({ room_id: roomId, mentor_id: user.id, content: content.trim() }));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
