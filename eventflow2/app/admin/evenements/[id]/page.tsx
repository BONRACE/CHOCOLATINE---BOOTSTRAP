"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Download, Search } from "lucide-react";
import { events, formatFCFA } from "@/lib/mock-data";

type ParticipantStatus = "Payé" | "Annulé" | "Scanné";

// Démo : liste de participants générée à partir des catégories de l'événement.
// En production : GET /api/events/[id]/participants (jointure Order + Ticket).
function mockParticipants(eventId: string) {
  const names = [
    "Aïcha Zannou", "Kevin Houngbédji", "Sandra Adjovi", "Rufin Dossou",
    "Marlène Agossou", "Éric Sagbo", "Nadège Tossou", "Wilfried Amoussou",
  ];
  const statuses: ParticipantStatus[] = ["Payé", "Payé", "Scanné", "Payé", "Annulé", "Scanné", "Payé", "Payé"];
  return names.map((name, i) => ({
    id: `${eventId}_p${i}`,
    name,
    email: name.toLowerCase().replace(" ", ".") + "@mail.com",
    category: i % 3 === 0 ? "VIP" : "Standard",
    status: statuses[i],
  }));
}

const tabs = ["Participants", "Statistiques en direct", "Export"] as const;

export default function EventManagePage({ params }: { params: { id: string } }) {
  const event = events.find((e) => e.id === params.id);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Participants");
  const [statusFilter, setStatusFilter] = useState<ParticipantStatus | "Tous">("Tous");
  const [query, setQuery] = useState("");

  if (!event) notFound();

  const participants = mockParticipants(event.id).filter(
    (p) =>
      (statusFilter === "Tous" || p.status === statusFilter) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  );

  // Affluence par heure — données de démo pour la vue statistiques
  const hourly = [12, 28, 54, 90, 130, 160, 95, 40];

  return (
    <main className="min-h-screen bg-ivory">
      <header className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/40">
            {event.city} · {new Date(event.startsAt).toLocaleDateString("fr-FR")}
          </p>
          <h1 className="font-display text-xl text-ink">{event.title}</h1>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 px-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-3 py-2.5 text-sm transition-colors ${
                tab === t
                  ? "border-forest text-forest font-medium"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {tab === "Participants" && (
          <div className="rounded-stub border border-line bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
              <div className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
                <Search size={14} className="text-ink/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un participant…"
                  className="w-48 bg-transparent text-sm focus:outline-none"
                />
              </div>
              <div className="flex gap-1.5">
                {(["Tous", "Payé", "Scanné", "Annulé"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                      statusFilter === s
                        ? "bg-forest text-ivory"
                        : "bg-forest/5 text-ink/60 hover:bg-forest/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-forest/5 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Participant</th>
                  <th className="px-5 py-3 font-medium">Catégorie</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-forest/5">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-ink/40">{p.email}</p>
                    </td>
                    <td className="px-5 py-3 text-ink/60">{p.category}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          p.status === "Payé"
                            ? "bg-forest/10 text-forest"
                            : p.status === "Scanné"
                            ? "bg-gold/20 text-gold-dim"
                            : "bg-coral/10 text-coral"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Statistiques en direct" && (
          <div className="rounded-stub border border-line bg-white p-6">
            <h2 className="font-display text-lg text-ink">
              Entrées par heure — jour J
            </h2>
            <div className="mt-6 flex h-48 items-end gap-3">
              {hourly.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-forest"
                    style={{ height: `${(v / Math.max(...hourly)) * 100}%` }}
                  />
                  <span className="font-mono text-[10px] text-ink/40">
                    {17 + i}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Export" && (
          <div className="rounded-stub border border-line bg-white p-6">
            <h2 className="font-display text-lg text-ink">
              Exporter la liste des participants
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              Génère un fichier avec noms, emails, catégories de billets et
              statuts de scan.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-medium text-ivory hover:bg-forest-light">
                <Download size={15} />
                Exporter en CSV
              </button>
              <button className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink/70 hover:bg-ivory">
                <Download size={15} />
                Exporter en Excel
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
