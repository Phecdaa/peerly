import { NextRequest, NextResponse } from "next/server";

// Placeholder for a real Stripe webhook handler.
// In this MVP we use a mock checkout that directly creates escrow payments,
// so this route is mainly here to be wired when you integrate Stripe for real.

export async function POST(_request: NextRequest) {
  // For now, just acknowledge the webhook so Stripe (or any provider) doesn't retry.
  return NextResponse.json({ received: true });
}

