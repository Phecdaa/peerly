import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ReportBody = {
  target_type: "mentor" | "student" | "room";
  target_id: string;
  reason: string;
};

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ReportBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { target_type, target_id, reason } = body;
  if (
    !target_type ||
    !["mentor", "student", "room"].includes(target_type) ||
    !target_id ||
    !reason?.trim()
  ) {
    return NextResponse.json(
      { error: "target_type, target_id, and reason are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type,
    target_id,
    reason: reason.trim(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

