"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatXof } from "@/lib/utils";

interface TicketTypeOption {
  id: string;
  name: string;
  priceXof: number;
  quota: number;
  quantitySold: number;
}

export default function TicketSelector({
  eventId,
  ticketTypes
}: {
  eventId: string;
  ticketTypes: TicketTypeOption[];
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const subtotal = useMemo(
    () =>
      ticketTypes.reduce((sum, t) => sum + (quantities[t.id] ?? 0) * t.priceXof, 0),
    [quantities, ticketTypes]
  );

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  function updateQty(id: string, delta: number, max: number) {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.min(Math.max(current + delta, 0), max);
      return { ...prev, [id]: next };
    });
  }

  function goToCheckout() {
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => `${ticketTypeId}:${quantity}`)
      .join(",");
    router.push(`/checkout/${eventId}?items=${encodeURIComponent(items)}`);
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900">Choisir vos billets</h3>
      <div className="space-y-3">
        {ticketTypes.map((t) => {
          const remaining = t.quota - t.quantitySold;
          const qty = quantities[t.id] ?? 0;
          return (
            <div key={t.id} className="flex items-center justify-between border-b border-gray-50 pb-3">
              <div>
                <p className="font-medium text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {formatXof(t.priceXof)} · {remaining > 0 ? `${remaining} places restantes` : "Épuisé"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQty(t.id, -1, remaining)}
                  disabled={qty === 0}
                  className="h-8 w-8 rounded-full border border-gray-200 text-lg disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-5 text-center">{qty}</span>
                <button
                  onClick={() => updateQty(t.id, 1, remaining)}
                  disabled={qty >= remaining}
                  className="h-8 w-8 rounded-full border border-gray-200 text-lg disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-gray-500">Sous-total</span>
        <span className="text-lg font-semibold text-primary">{formatXof(subtotal)}</span>
      </div>

      <button
        onClick={goToCheckout}
        disabled={totalItems === 0}
        className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-light disabled:opacity-40"
      >
        Continuer vers le paiement
      </button>
    </div>
  );
}
