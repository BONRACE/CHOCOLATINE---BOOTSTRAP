"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { events, formatFCFA } from "@/lib/mock-data";

type PaymentMethod = "CARD" | "MTN_MOMO" | "MOOV_MONEY" | "ORANGE_MONEY";

const paymentOptions: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: "CARD", label: "Carte bancaire", hint: "Visa, Mastercard" },
  { id: "MTN_MOMO", label: "MTN Mobile Money", hint: "Paiement instantané" },
  { id: "MOOV_MONEY", label: "Moov Money", hint: "Paiement instantané" },
  { id: "ORANGE_MONEY", label: "Orange Money", hint: "Paiement instantané" },
];

export default function CheckoutPage({
  params,
  searchParams,
}: {
  params: { eventId: string };
  searchParams: Record<string, string>;
}) {
  const router = useRouter();
  const event = events.find((e) => e.id === params.eventId);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedLines = useMemo(() => {
    if (!event) return [];
    return event.ticketCategories
      .map((tc) => ({ tc, qty: Number(searchParams[tc.id] ?? 0) }))
      .filter((l) => l.qty > 0);
  }, [event, searchParams]);

  const total = selectedLines.reduce((s, l) => s + l.qty * l.tc.unitPrice, 0);
  const emailsMatch = email.length > 0 && email === emailConfirm;
  const canSubmit =
    fullName.trim().length > 1 &&
    emailsMatch &&
    phone.trim().length >= 8 &&
    method !== null &&
    !submitting;

  if (!event) {
    return (
      <main className="min-h-screen bg-ivory">
        <SiteHeader />
        <p className="mx-auto max-w-6xl px-6 py-16 text-center text-ink/60">
          Événement introuvable.
        </p>
        <SiteFooter />
      </main>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // En production : POST /api/orders → création Order (PENDING) → redirection
    // vers le SDK Stripe ou la page de paiement CinetPay/FedaPay selon `method`.
    // Le webhook de paiement confirme l'Order (PAID), génère les Tickets + QR codes,
    // puis déclenche l'email de confirmation.
    setTimeout(() => {
      router.push(`/confirmation/ord_demo_${event.id}`);
    }, 900);
  };

  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader />

      <section className="mx-auto grid max-w-4xl gap-10 px-6 py-12 md:grid-cols-[1.3fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-forest">
              Étape 1 / 1 — Aucun compte requis
            </p>
            <h1 className="mt-2 font-display text-2xl text-ink">
              Vos informations
            </h1>
          </div>

          <div className="space-y-4 rounded-stub border border-line bg-white p-5">
            <div>
              <label className="text-sm font-medium text-ink">
                Nom complet
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex. Kpangon Bonrace d'Olivier"
                className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-ink">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">
                  Confirmer l'email
                </label>
                <input
                  required
                  type="email"
                  value={emailConfirm}
                  onChange={(e) => setEmailConfirm(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                {emailConfirm.length > 0 && !emailsMatch && (
                  <p className="mt-1 text-xs text-coral">
                    Les deux adresses ne correspondent pas.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink">
                Téléphone
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+229 01 XX XX XX XX"
                className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Paiement</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {paymentOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setMethod(opt.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                    method === opt.id
                      ? "border-forest bg-forest/5"
                      : "border-line bg-white hover:border-forest/40"
                  }`}
                >
                  {opt.id === "CARD" ? (
                    <CreditCard size={18} className="text-forest" />
                  ) : (
                    <Smartphone size={18} className="text-forest" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink">{opt.label}</p>
                    <p className="text-xs text-ink/50">{opt.hint}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-full bg-forest py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Traitement du paiement…" : `Payer ${formatFCFA(total)}`}
          </button>
        </form>

        {/* Récapitulatif */}
        <aside className="h-fit rounded-stub border border-line bg-white p-5">
          <h2 className="font-display text-lg text-ink">{event.title}</h2>
          <p className="mt-1 text-xs text-ink/50">
            {event.venueName}, {event.city}
          </p>
          <div className="mt-4 divide-y divide-line">
            {selectedLines.map(({ tc, qty }) => (
              <div key={tc.id} className="flex justify-between py-2 text-sm">
                <span className="text-ink/70">
                  {qty} × {tc.name}
                </span>
                <span className="font-mono text-ink">
                  {formatFCFA(qty * tc.unitPrice)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3">
            <span className="text-sm font-medium text-ink">Total</span>
            <span className="font-mono text-base font-medium text-forest">
              {formatFCFA(total)}
            </span>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </main>
  );
}
