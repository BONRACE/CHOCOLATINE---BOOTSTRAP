import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initPayment, PaymentMethod } from "@/lib/payments";
import { z } from "zod";

/**
 * POST /api/checkout — Point d'entrée du "Guest Checkout".
 * 1. Valide les infos acheteur + disponibilité des billets
 * 2. Crée la commande en statut PENDING
 * 3. Initialise le paiement (Stripe ou CinetPay) et retourne l'URL de redirection
 */

const checkoutSchema = z.object({
  eventId: z.string(),
  buyerFirstName: z.string().min(1),
  buyerLastName: z.string().min(1),
  buyerEmail: z.string().email(),
  buyerEmailConfirm: z.string().email(),
  buyerPhone: z.string().min(6),
  paymentMethod: z.enum(["CARD", "MTN_MOMO", "MOOV_MONEY", "ORANGE_MONEY"]),
  items: z.array(z.object({ ticketTypeId: z.string(), quantity: z.number().int().positive() })).min(1)
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.buyerEmail !== data.buyerEmailConfirm) {
    return NextResponse.json({ error: "Les emails ne correspondent pas" }, { status: 400 });
  }

  // Vérification stock disponible pour chaque catégorie demandée
  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: data.items.map((i) => i.ticketTypeId) }, eventId: data.eventId }
  });

  let totalXof = 0;
  for (const item of data.items) {
    const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
    if (!tt) return NextResponse.json({ error: "Catégorie de billet invalide" }, { status: 400 });
    if (tt.quantitySold + item.quantity > tt.quota) {
      return NextResponse.json({ error: `Plus assez de places pour "${tt.name}"` }, { status: 409 });
    }
    totalXof += tt.priceXof * item.quantity;
  }

  const order = await prisma.order.create({
    data: {
      eventId: data.eventId,
      buyerFirstName: data.buyerFirstName,
      buyerLastName: data.buyerLastName,
      buyerEmail: data.buyerEmail,
      buyerPhone: data.buyerPhone,
      totalXof,
      status: "PENDING",
      items: {
        create: data.items.map((i) => {
          const tt = ticketTypes.find((t) => t.id === i.ticketTypeId)!;
          return { ticketTypeId: i.ticketTypeId, quantity: i.quantity, unitPriceXof: tt.priceXof };
        })
      }
    }
  });

  const baseUrl = req.nextUrl.origin;

  try {
    const { redirectUrl } = await initPayment({
      orderId: order.id,
      amountXof: totalXof,
      method: data.paymentMethod as PaymentMethod,
      buyerEmail: data.buyerEmail,
      successUrl: `${baseUrl}/confirmation/${order.id}`,
      cancelUrl: `${baseUrl}/evenements/${data.eventId}`
    });

    await prisma.order.update({ where: { id: order.id }, data: { paymentMethod: data.paymentMethod } });

    return NextResponse.json({ orderId: order.id, redirectUrl });
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur d'initialisation du paiement" },
      { status: 502 }
    );
  }
}
