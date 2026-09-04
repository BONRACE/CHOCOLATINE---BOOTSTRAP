import { NextRequest, NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/fulfill-order";

// CinetPay envoie une notification serveur-à-serveur (notify_url) au paiement.
export async function POST(req: NextRequest) {
  const body = await req.formData();
  const transactionId = body.get("cpm_trans_id")?.toString();
  const status = body.get("cpm_result")?.toString(); // "00" = succès

  if (transactionId && status === "00") {
    await fulfillOrder(transactionId, transactionId);
  }

  return NextResponse.json({ received: true });
}
