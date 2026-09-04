import { NextRequest, NextResponse } from "next/server";
import { verifyStripeWebhookSignature } from "@/lib/payments";
import { fulfillOrder } from "@/lib/fulfill-order";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = verifyStripeWebhookSignature(payload, signature);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string }; id: string };
    const orderId = session.metadata?.orderId;
    if (orderId) await fulfillOrder(orderId, session.id);
  }

  return NextResponse.json({ received: true });
}
