"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Download, Mail } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { events } from "@/lib/mock-data";

export default function ConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  // Démo : l'id de commande encode l'id de l'événement (ord_demo_<eventId>).
  // En production, /api/orders/[orderId] renverrait la commande, ses tickets
  // et leurs qrSecret déjà persistés en base.
  const eventId = params.orderId.replace("ord_demo_", "");
  const event = events.find((e) => e.id === eventId) ?? events[0];

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const ticketCode = `EVF-${params.orderId.slice(-6).toUpperCase()}`;

  useEffect(() => {
    // Le payload réel serait un JWT signé côté serveur : { ticketId, eventId, exp }
    const payload = JSON.stringify({
      ticket: ticketCode,
      event: event.id,
      issued: Date.now(),
    });
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 240,
      color: { dark: "#12241C", light: "#F6F2E7" },
    }).then(setQrDataUrl);
  }, [ticketCode, event.id]);

  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader />

      <section className="mx-auto max-w-lg px-6 py-14 text-center">
        <CheckCircle2 className="mx-auto text-forest" size={40} />
        <h1 className="mt-4 font-display text-2xl text-ink">
          Commande confirmée
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Votre billet a été envoyé par email. Vous pouvez aussi le
          télécharger ci-dessous.
        </p>

        {/* Billet — même vocabulaire visuel que les cartes du catalogue */}
        <div className="ticket-notch relative mx-auto mt-8 max-w-sm overflow-hidden rounded-stub border border-line bg-white text-left shadow-lg">
          <div className="bg-forest px-6 py-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">
              {event.category}
            </p>
            <p className="mt-1 font-display text-xl italic text-ivory">
              {event.title}
            </p>
            <p className="mt-1 text-xs text-ivory/60">
              {new Date(event.startsAt).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              · {event.venueName}
            </p>
          </div>

          <div className="perforation" />

          <div className="flex flex-col items-center gap-3 px-6 py-6">
            {qrDataUrl ? (
              // Le QR code encode un payload signé, vérifié hors-ligne par le scanner
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR code du billet" className="h-40 w-40" />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded bg-ink/5 text-xs text-ink/40">
                Génération…
              </div>
            )}
            <p className="font-mono text-sm tracking-widest text-ink/70">
              {ticketCode}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button className="flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-forest-light">
            <Download size={16} />
            Télécharger le billet (PDF)
          </button>
          <button className="flex items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-white">
            <Mail size={16} />
            Renvoyer par email
          </button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
