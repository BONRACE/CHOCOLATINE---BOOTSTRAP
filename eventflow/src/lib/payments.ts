import Stripe from "stripe";

/**
 * Abstraction des moyens de paiement : Carte bancaire (Stripe) et Mobile
 * Money (CinetPay, qui agrège MTN/Moov/Orange Money selon la région).
 * Chaque fonction retourne une URL de redirection vers la page de paiement.
 */

export type PaymentMethod = "CARD" | "MTN_MOMO" | "MOOV_MONEY" | "ORANGE_MONEY";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

interface InitPaymentParams {
  orderId: string;
  amountXof: number;
  method: PaymentMethod;
  buyerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function initPayment(params: InitPaymentParams): Promise<{ redirectUrl: string }> {
  if (params.method === "CARD") {
    return initStripePayment(params);
  }
  return initCinetPayPayment(params);
}

async function initStripePayment(params: InitPaymentParams): Promise<{ redirectUrl: string }> {
  if (!stripe) throw new Error("Stripe non configuré (STRIPE_SECRET_KEY manquant)");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.buyerEmail,
    line_items: [
      {
        price_data: {
          currency: "xof",
          unit_amount: params.amountXof, // XOF n'a pas de décimales, pas de x100
          product_data: { name: `Commande EventFlow #${params.orderId}` }
        },
        quantity: 1
      }
    ],
    metadata: { orderId: params.orderId },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl
  });

  return { redirectUrl: session.url! };
}

async function initCinetPayPayment(params: InitPaymentParams): Promise<{ redirectUrl: string }> {
  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  if (!apiKey || !siteId) throw new Error("CinetPay non configuré");

  const channelMap: Record<PaymentMethod, string> = {
    CARD: "ALL",
    MTN_MOMO: "MOBILE_MONEY",
    MOOV_MONEY: "MOBILE_MONEY",
    ORANGE_MONEY: "MOBILE_MONEY"
  };

  const res = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: apiKey,
      site_id: siteId,
      transaction_id: params.orderId,
      amount: params.amountXof,
      currency: "XOF",
      channels: channelMap[params.method],
      customer_email: params.buyerEmail,
      notify_url: `${params.successUrl.split("/confirmation")[0]}/api/checkout/cinetpay-webhook`,
      return_url: params.successUrl
    })
  });

  const data = await res.json();
  if (data.code !== "201") throw new Error(`Erreur CinetPay: ${data.message ?? "inconnue"}`);

  return { redirectUrl: data.data.payment_url };
}

export function verifyStripeWebhookSignature(payload: string, signature: string): Stripe.Event {
  if (!stripe) throw new Error("Stripe non configuré");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
