import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatEventDate, formatXof } from "@/lib/utils";
import { buildQrPayload } from "@/lib/ticket-qr";
import QRCode from "qrcode";

// Page 1.4 — Confirmation / Téléchargement Billet
export default async function ConfirmationPage({ params }: { params: { orderId: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { event: true, tickets: { include: { ticketType: true } } }
  });

  if (!order) notFound();

  // Paiement pas encore confirmé côté webhook — on affiche un état d'attente.
  if (order.status !== "PAID") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-700">Paiement en cours de confirmation…</h1>
        <p className="mt-2 text-sm text-gray-500">
          Rafraîchissez cette page dans quelques instants. Un email vous sera envoyé automatiquement dès
          confirmation.
        </p>
      </main>
    );
  }

  const ticketsWithQr = await Promise.all(
    order.tickets.map(async (t) => ({
      ...t,
      qrDataUrl: await QRCode.toDataURL(buildQrPayload(t.code), { margin: 1, width: 220 })
    }))
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 rounded-xl bg-primary p-6 text-center text-white">
        <p className="text-4xl">✓</p>
        <h1 className="mt-2 text-xl font-bold">Commande confirmée</h1>
        <p className="text-sm opacity-90">
          Un récapitulatif a été envoyé à {order.buyerEmail}.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-semibold">{order.event.title}</h2>
        <p className="text-sm text-gray-500">{formatEventDate(order.event.startsAt)}</p>
        <p className="text-sm text-gray-500">{order.event.venue}, {order.event.city}</p>
        <p className="mt-3 border-t border-gray-50 pt-3 font-medium">
          Total payé : {formatXof(order.totalXof)}
        </p>
      </div>

      <div className="space-y-4">
        {ticketsWithQr.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="font-semibold text-gray-900">{t.holderName}</p>
              <p className="text-sm text-gray-500">{t.ticketType.name}</p>
              <a
                href={t.qrDataUrl}
                download={`billet-${t.code}.png`}
                className="mt-2 inline-block text-sm font-medium text-primary underline"
              >
                Télécharger le billet
              </a>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.qrDataUrl} alt="QR code du billet" className="h-24 w-24" />
          </div>
        ))}
      </div>
    </main>
  );
}
