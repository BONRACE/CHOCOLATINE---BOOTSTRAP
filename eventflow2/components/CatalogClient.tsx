"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EventMock, categories, cities } from "@/lib/mock-data";
import EventCard from "./EventCard";

export default function CatalogClient({ events }: { events: EventMock[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q);
      const matchesCategory = !category || e.category === category;
      const matchesCity = !city || e.city === city;
      return matchesQuery && matchesCategory && matchesCity;
    });
  }, [events, query, category, city]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-forest">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-20">
          <div className="animate-[fadeUp_0.7s_ease-out]">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold/80">
              Bénin · Billetterie en ligne
            </p>
            <h1 className="mt-4 max-w-lg font-display text-4xl italic leading-[1.1] text-ivory md:text-5xl">
              Votre prochaine sortie tient dans un billet.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ivory/70">
              Concerts, festivals, conférences et matchs — trouvez l'événement,
              réservez en Mobile Money ou carte, et présentez simplement votre
              QR code à l'entrée.
            </p>

            {/* Search field styled like a boarding-pass input */}
            <div className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-gold/30 bg-forest-dark/60 p-1.5 pl-4">
              <Search size={17} className="shrink-0 text-gold/70" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Un artiste, une salle, une ville…"
                className="w-full bg-transparent py-2 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              <button className="shrink-0 rounded-full bg-gold px-4 py-2 text-sm font-medium text-forest-dark transition-colors hover:bg-gold-pale">
                Chercher
              </button>
            </div>
          </div>

          {/* Abstract ticket-stub illustration, built in CSS — no stock imagery in the hero */}
          <div className="relative hidden items-center justify-center md:flex">
            <div className="relative w-64 rotate-[6deg] rounded-stub border border-gold/25 bg-forest-dark/70 p-5 shadow-2xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gold/60">
                Accès général
              </p>
              <p className="mt-2 font-display text-2xl italic text-ivory">
                Afro Nation
              </p>
              <p className="mt-1 text-xs text-ivory/50">Fidjrossè, Cotonou</p>
              <div className="my-4 h-px w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_5px,rgba(212,166,47,0.4)_5px,rgba(212,166,47,0.4)_9px)]" />
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-[10px] text-gold/60">PORTE</p>
                  <p className="font-display text-lg text-ivory">B</p>
                </div>
                <div className="h-12 w-12 rounded bg-ivory/90 p-1">
                  <div className="h-full w-full bg-[repeating-linear-gradient(90deg,#12241C,#12241C_2px,transparent_2px,transparent_4px)]" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-52 -rotate-[8deg] rounded-stub border border-gold/15 bg-forest-dark/40 p-5 opacity-70">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gold/40">
                Standard
              </p>
              <p className="mt-2 font-display text-lg italic text-ivory/70">
                Tech Summit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FILTRES ---------- */}
      <section className="border-b border-line bg-ivory">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-4">
          <button
            onClick={() => setCategory(null)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              category === null
                ? "bg-forest text-ivory"
                : "bg-white text-ink/70 hover:bg-forest/10"
            }`}
          >
            Tout
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c === category ? null : c)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                category === c
                  ? "bg-forest text-ivory"
                  : "bg-white text-ink/70 hover:bg-forest/10"
              }`}
            >
              {c}
            </button>
          ))}

          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

          <select
            value={city ?? ""}
            onChange={(e) => setCity(e.target.value || null)}
            className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink/70 focus:outline-none"
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ---------- GRILLE ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-ink">
            {filtered.length > 0
              ? `${filtered.length} événement${filtered.length > 1 ? "s" : ""} à découvrir`
              : "Aucun événement trouvé"}
          </h2>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-stub border border-dashed border-line bg-white/60 px-6 py-16 text-center">
            <p className="text-ink/60">
              Essayez un autre mot-clé, ou changez de ville et de catégorie.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
