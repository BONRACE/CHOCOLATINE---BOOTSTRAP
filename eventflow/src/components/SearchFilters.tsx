"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = ["Concert", "Conférence", "Festival", "Sport", "Formation", "Autre"];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function applyFilters(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-primary p-4 sm:flex-row sm:items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyFilters({ q })}
        placeholder="Rechercher un événement, un artiste, un lieu..."
        className="flex-1 rounded-lg border-0 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
      <select
        onChange={(e) => applyFilters({ category: e.target.value || null })}
        defaultValue={searchParams.get("category") ?? ""}
        className="rounded-lg px-3 py-2 text-sm"
      >
        <option value="">Toutes catégories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        placeholder="Ville"
        defaultValue={searchParams.get("city") ?? ""}
        onBlur={(e) => applyFilters({ city: e.target.value || null })}
        className="w-32 rounded-lg px-3 py-2 text-sm"
      />
      <button
        onClick={() => applyFilters({ q })}
        className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-primary-dark hover:bg-gold-light"
      >
        Rechercher
      </button>
    </div>
  );
}
