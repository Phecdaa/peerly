import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
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

  // Explicit access check: only participants and mentor can read messages (RLS may hide rows)
  const { data: room } = await supabase
    .from("rooms")
    .select("id, mentor_id, host_id, scheduled_start, scheduled_end, status")
    .eq("id", roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const isMentor = room.mentor_id === user.id;
  const isHost = room.host_id === user.id;
  const { data: participant } = await supabase
    .from("room_participants")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isMentor && !isHost && !participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Chat only active during session window for accepted rooms
  if (!["waiting_payment", "scheduled", "ongoing", "finished"].includes(room.status)) {
    return NextResponse.json(
      { error: "Chat belum aktif, menunggu persetujuan mentor." },
      { status: 400 }
    );
  }
  const now = new Date();
  if (now > new Date(room.scheduled_end)) {
    return NextResponse.json(
      { error: "Chat sudah ditutup karena sesi telah berakhir." },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  const { data: messages, error } = await supabase
    .from("room_messages")
    .select("id, room_id, sender_id, content, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(messages ?? []);
}

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

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("id, mentor_id, host_id, scheduled_start, scheduled_end, status")
    .eq("id", roomId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const isMentor = room.mentor_id === user.id;
  const isHost = room.host_id === user.id;
  const { data: participant } = await supabase
    .from("room_participants")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isMentor && !isHost && !participant) {
    return NextResponse.json(
      { error: "Only participants and mentor can post" },
      { status: 403 }
    );
  }

  // Chat only active during session window for accepted rooms
  if (!["waiting_payment", "scheduled", "ongoing", "finished"].includes(room.status)) {
    return NextResponse.json(
      { error: "Chat belum aktif, menunggu persetujuan mentor." },
      { status: 400 }
    );
  }

  const now = new Date();
  const sessionEnd = new Date(room.scheduled_end);
  if (now > sessionEnd) {
    return NextResponse.json(
      { error: "Chat sudah ditutup karena sesi telah berakhir." },
      { status: 400 }
    );
  }

  const { data: msg, error } = await supabase
    .from("room_messages")
    .insert({ room_id: roomId, sender_id: user.id, content })
    .select("id, room_id, sender_id, content, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(msg);
}
