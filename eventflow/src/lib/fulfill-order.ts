import { prisma } from "@/lib/prisma";
import { generateTicketCode } from "@/lib/ticket-qr";

/**
 * Appelée par les webhooks de paiement (Stripe / CinetPay) une fois le
 * paiement confirmé : marque la commande PAID, génère un billet individuel
 * (avec QR unique) par unité achetée, et incrémente les compteurs de vente.
 */
export async function fulfillOrder(orderId: string, paymentRef: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { ticketType: true } } }
  });
  if (!order || order.status === "PAID") return; // idempotence

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID", paymentRef, paidAt: new Date() }
    });

    for (const item of order.items) {
      const ticketsData = Array.from({ length: item.quantity }, () => ({
        code: generateTicketCode(),
        orderId: order.id,
        eventId: order.eventId,
        ticketTypeId: item.ticketTypeId,
        holderName: `${order.buyerFirstName} ${order.buyerLastName}`
      }));
      await tx.ticket.createMany({ data: ticketsData });
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { quantitySold: { increment: item.quantity } }
      });
    }
  });

  // L'envoi d'email (Resend/SMTP) serait déclenché ici avec le PDF du billet.
}
