import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Slot = { start_ts: string; end_ts: string; max_students?: number };
type Body = { slots: Slot[] };

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, mentor_status")
    .eq("id", user.id)
    .single();

  if (profile?.mentor_status !== "approved") {
    return NextResponse.json(
      { error: "Only approved mentors can set availability" },
      { status: 403 }
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slots = Array.isArray(body.slots) ? body.slots : [];
  if (slots.length === 0) {
    return NextResponse.json(
      { error: "At least one slot required" },
      { status: 400 }
    );
  }

  const rows = slots
    .map((s) => {
      const start = new Date(s.start_ts);
      const end = new Date(s.end_ts);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return null;
      return {
        mentor_id: user.id,
        start_ts: start.toISOString(),
        end_ts: end.toISOString(),
        max_students: typeof s.max_students === "number" ? s.max_students : 1,
      };
    })
    .filter(Boolean);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid slots" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("availabilities")
    .insert(rows)
    .select("id, start_ts, end_ts");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ created: data });
}
