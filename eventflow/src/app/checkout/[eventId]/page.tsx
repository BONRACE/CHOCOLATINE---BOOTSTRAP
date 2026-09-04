"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { formatXof } from "@/lib/utils";

interface TicketTypeLite {
  id: string;
  name: string;
  priceXof: number;
}

// Page 1.3 — Checkout & Paiement (Guest Checkout)
export default function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const searchParams = useSearchParams();
  const [ticketTypes, setTicketTypes] = useState<TicketTypeLite[]>([]);
  const [form, setForm] = useState({
    buyerFirstName: "",
    buyerLastName: "",
    buyerEmail: "",
    buyerEmailConfirm: "",
    buyerPhone: "",
    paymentMethod: "CARD" as "CARD" | "MTN_MOMO" | "MOOV_MONEY" | "ORANGE_MONEY"
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const items = (searchParams.get("items") ?? "")
    .split(",")
    .filter(Boolean)
    .map((entry) => {
      const [ticketTypeId, quantity] = entry.split(":");
      return { ticketTypeId, quantity: Number(quantity) };
    });

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then((data) => setTicketTypes(data.ticketTypes ?? []));
  }, [eventId]);

  const total = items.reduce((sum, item) => {
    const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
    return sum + (tt ? tt.priceXof * item.quantity : 0);
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, items, ...form })
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Une erreur est survenue.");
      return;
    }
    window.location.href = data.redirectUrl;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-primary">Finaliser votre commande</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <section className="space-y-3">
          <h2 className="font-semibold">Vos informations</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Prénom"
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={form.buyerFirstName}
              onChange={(e) => setForm({ ...form, buyerFirstName: e.target.value })}
            />
            <input
              required
              placeholder="Nom"
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={form.buyerLastName}
              onChange={(e) => setForm({ ...form, buyerLastName: e.target.value })}
            />
          </div>
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={form.buyerEmail}
            onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Confirmer l'email"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={form.buyerEmailConfirm}
            onChange={(e) => setForm({ ...form, buyerEmailConfirm: e.target.value })}
          />
          <input
            required
            placeholder="Téléphone"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={form.buyerPhone}
            onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
          />
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Moyen de paiement</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "CARD", label: "Carte bancaire" },
              { value: "MTN_MOMO", label: "MTN Mobile Money" },
              { value: "MOOV_MONEY", label: "Moov Money" },
              { value: "ORANGE_MONEY", label: "Orange Money" }
            ].map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                  form.paymentMethod === opt.value ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={form.paymentMethod === opt.value}
                  onChange={() => setForm({ ...form, paymentMethod: opt.value as typeof form.paymentMethod })}
                  className="mr-2"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-gray-500">Total à payer</span>
          <span className="text-xl font-bold text-primary">{formatXof(total)}</span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full rounded-lg bg-gold py-3 font-semibold text-primary-dark hover:bg-gold-light disabled:opacity-40"
        >
          {loading ? "Redirection vers le paiement..." : "Payer maintenant"}
        </button>
      </form>
    </main>
  );
}
