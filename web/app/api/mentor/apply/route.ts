import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Body = {
  bio: string;
  hourly_rate?: number;
  course_ids: number[];
  university?: string;
};

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

  const { bio, hourly_rate, course_ids } = body;
  if (!bio || typeof bio !== "string" || bio.trim().length === 0) {
    return NextResponse.json(
      { error: "bio is required and must be non-empty" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      is_mentor: true,
      mentor_status: "pending",
      bio: bio.trim(),
      ...(typeof body.university === "string" && body.university.trim()
        ? { university: body.university.trim() }
        : {}),
      ...(typeof hourly_rate === "number" && hourly_rate >= 0
        ? { hourly_rate }
        : {}),
    })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const ids = Array.isArray(course_ids)
    ? course_ids.filter((id) => typeof id === "number" && Number.isInteger(id))
    : [];

  if (ids.length > 0) {
    const { error: deleteErr } = await supabase
      .from("mentor_courses")
      .delete()
      .eq("mentor_id", user.id);

    if (!deleteErr) {
      const { error: insertErr } = await supabase.from("mentor_courses").insert(
        ids.map((course_id) => ({
          mentor_id: user.id,
          course_id,
        }))
      );
      if (insertErr) {
        return NextResponse.json(
          { error: insertErr.message },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
