"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { TicketCategoryMock, formatFCFA } from "@/lib/mock-data";

export default function TicketSelector({
  eventId,
  eventSlug,
  ticketCategories,
}: {
  eventId: string;
  eventSlug: string;
  ticketCategories: TicketCategoryMock[];
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const setQty = (id: string, delta: number, max: number) => {
    setQuantities((prev) => {
      const next = Math.min(max, Math.max(0, (prev[id] ?? 0) + delta));
      return { ...prev, [id]: next };
    });
  };

  const subtotal = useMemo(
    () =>
      ticketCategories.reduce(
        (sum, tc) => sum + (quantities[tc.id] ?? 0) * tc.unitPrice,
        0
      ),
    [quantities, ticketCategories]
  );

  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);

  const goToCheckout = () => {
    const params = new URLSearchParams();
    Object.entries(quantities)
      .filter(([, q]) => q > 0)
      .forEach(([id, q]) => params.set(id, String(q)));
    router.push(`/checkout/${eventId}?${params.toString()}`);
  };

  return (
    <div className="rounded-stub border border-line bg-white p-5">
      <h3 className="font-display text-lg text-ink">Choisissez vos billets</h3>

      <div className="mt-4 divide-y divide-line">
        {ticketCategories.map((tc) => {
          const remaining = tc.quantity - tc.quantitySold;
          const soldOut = remaining <= 0;
          const qty = quantities[tc.id] ?? 0;

          return (
            <div key={tc.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-medium text-ink">{tc.name}</p>
                {tc.description && (
                  <p className="text-xs text-ink/50">{tc.description}</p>
                )}
                <p className="mt-1 font-mono text-sm text-forest">
                  {formatFCFA(tc.unitPrice)}
                </p>
                {!soldOut && remaining <= 30 && (
                  <p className="mt-0.5 text-xs text-coral">
                    Plus que {remaining} places
                  </p>
                )}
              </div>

              {soldOut ? (
                <span className="shrink-0 rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/40">
                  Épuisé
                </span>
              ) : (
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    aria-label={`Retirer un billet ${tc.name}`}
                    onClick={() => setQty(tc.id, -1, remaining)}
                    disabled={qty === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/60 transition-colors hover:bg-forest/5 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-mono text-sm">{qty}</span>
                  <button
                    aria-label={`Ajouter un billet ${tc.name}`}
                    onClick={() => setQty(tc.id, 1, remaining)}
                    disabled={qty >= remaining}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/60 transition-colors hover:bg-forest/5 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-ink/60">Sous-total</span>
        <span className="font-mono text-lg font-medium text-ink">
          {formatFCFA(subtotal)}
        </span>
      </div>

      <button
        onClick={goToCheckout}
        disabled={totalSelected === 0}
        className="mt-4 w-full rounded-full bg-forest py-3 text-sm font-medium text-ivory transition-colors hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-40"
      >
        {totalSelected === 0
          ? "Sélectionnez au moins un billet"
          : `Continuer · ${totalSelected} billet${totalSelected > 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
