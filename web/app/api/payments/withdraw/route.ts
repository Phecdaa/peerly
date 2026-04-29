import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { amount, bank, account_number, account_name } = body;

  if (!amount || amount < 50000) {
    return NextResponse.json({ error: "Minimum penarikan Rp 50.000" }, { status: 400 });
  }
  if (!bank || !account_number || !account_name) {
    return NextResponse.json({ error: "Data rekening tidak lengkap" }, { status: 400 });
  }

  // Mock: In production, create a real withdrawal request
  // For now, just log it as a payment record
  const { error } = await supabase
    .from("payments")
    .insert({
      amount,
      platform_fee: 0,
      mentor_amount: amount,
      status: "escrow",
      direction: "platform_to_mentor",
      provider: bank,
      metadata: { account_number, account_name, bank },
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
