import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const service = getSupabaseServiceClient();

  // 1. Cancel unaccepted rooms past their start time
  const { error: err1 } = await service
    .from("rooms")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("status", "pending_mentor_accept")
    .lt("scheduled_start", new Date().toISOString());

  if (err1) console.error("Cron err1:", err1.message);

  // 2. Cancel accepted rooms that haven't been paid within 30 minutes
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { error: err2 } = await service
    .from("rooms")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("status", "waiting_payment")
    .lt("updated_at", thirtyMinsAgo);

  if (err2) console.error("Cron err2:", err2.message);

  // 3. Auto-finish rooms that are past their scheduled end time + 15 mins
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  // using 'in' for status instead of multiple queries
  const { error: err3 } = await service
    .from("rooms")
    .update({ status: "finished", updated_at: new Date().toISOString() })
    .in("status", ["scheduled", "ongoing"])
    .lt("scheduled_end", fifteenMinsAgo);

  if (err3) console.error("Cron err3:", err3.message);

  return NextResponse.json({ success: true, message: "Cron executed successfully." });
}
