import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type Body = { room_id: number; email: string };

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { room_id, email } = body;
  if (!room_id || !email?.trim()) {
    return NextResponse.json(
      { error: "room_id dan email wajib" },
      { status: 400 }
    );
  }

  const service = getSupabaseServiceClient();

  type RoomRow = { id: number; host_id: string; mentor_id: string; availability_id: number; status: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roomRaw, error: roomErr } = await (service as any)
    .from("rooms")
    .select("id, host_id, mentor_id, availability_id, status")
    .eq("id", room_id)
    .single();

  const room = roomRaw as RoomRow | null;

  if (roomErr || !room) {
    return NextResponse.json({ error: "Room tidak ditemukan" }, { status: 404 });
  }

  const isHost = room.host_id === user.id;
  const isMentor = room.mentor_id === user.id;
  if (!isHost && !isMentor) {
    return NextResponse.json(
      { error: "Hanya host atau mentor yang bisa mengundang" },
      { status: 403 }
    );
  }

  if (!["pending_payment", "waiting_mentor_approval"].includes(room.status)) {
    return NextResponse.json(
      { error: "Room tidak bisa di-invite lagi" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: availability } = await (service as any)
    .from("availabilities")
    .select("max_students")
    .eq("id", room.availability_id)
    .single();

  const maxStudents = availability?.max_students ?? 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: participants } = await (service as any)
    .from("room_participants")
    .select("id")
    .eq("room_id", room_id);

  if ((participants?.length ?? 0) >= maxStudents) {
    return NextResponse.json(
      { error: "Kapasitas room sudah penuh" },
      { status: 409 }
    );
  }

  const emailLower = email.trim().toLowerCase();
  if (emailLower === user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "Kamu sudah ada di room ini" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userList } = await (service as any).auth.admin.listUsers({ page: 1, perPage: 1000 });
  const users = userList?.users ?? [];
  const targetUser = users.find(
    (u: { email?: string }) => u.email?.toLowerCase() === emailLower
  );

  if (!targetUser) {
    return NextResponse.json(
      { error: "User dengan email tersebut tidak ditemukan. Pastikan sudah register." },
      { status: 404 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (service as any)
    .from("room_participants")
    .select("id")
    .eq("room_id", room_id)
    .eq("user_id", targetUser.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "User sudah menjadi peserta" },
      { status: 409 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertErr } = await (service as any).from("room_participants").insert({
    room_id,
    user_id: targetUser.id,
    role: "participant",
  });

  if (insertErr) {
    return NextResponse.json(
      { error: insertErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
