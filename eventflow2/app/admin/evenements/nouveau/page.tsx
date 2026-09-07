"use client";

import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

type TicketRow = { id: string; name: string; price: string; quota: string };

const steps = ["Informations générales", "Billetterie", "Vérification"] as const;

export default function NewEventPage() {
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");

  const [rows, setRows] = useState<TicketRow[]>([
    { id: crypto.randomUUID(), name: "Standard", price: "", quota: "" },
  ]);

  const addRow = () =>
    setRows((r) => [...r, { id: crypto.randomUUID(), name: "", price: "", quota: "" }]);
  const removeRow = (id: string) => setRows((r) => r.filter((row) => row.id !== id));
  const updateRow = (id: string, field: keyof TicketRow, value: string) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  return (
    <main className="min-h-screen bg-ivory">
      <header className="border-b border-line bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/40">
            Espace organisateur
          </p>
          <h1 className="font-display text-xl text-ink">Créer un événement</h1>
        </div>
      </header>

      {/* Fil d'étapes */}
      <div className="mx-auto max-w-3xl px-6 pt-6">
        <div className="flex items-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                  i <= step ? "bg-forest text-ivory" : "bg-line text-ink/40"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${i === step ? "text-ink font-medium" : "text-ink/40"}`}
              >
                {label}
              </span>
              {i < steps.length - 1 && <div className="mx-2 h-px flex-1 bg-line" />}
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-8">
        {step === 0 && (
          <div className="space-y-4 rounded-stub border border-line bg-white p-6">
            <div>
              <label className="text-sm font-medium text-ink">Titre de l'événement</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="Ex. Nuit Afrobeat"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="Décrivez l'ambiance, le programme, les artistes…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-ink">Début</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Fin</label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-ink">Lieu</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="Nom de la salle / du lieu"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Ville</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="Cotonou"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">
                Image de couverture
              </label>
              <div className="mt-1.5 flex h-32 items-center justify-center rounded-lg border border-dashed border-line text-sm text-ink/40">
                <Upload size={16} className="mr-2" />
                Glissez une image ou cliquez pour importer
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-stub border border-line bg-white p-6">
              <h2 className="font-display text-lg text-ink">
                Catégories de billets
              </h2>
              <div className="mt-4 space-y-3">
                {rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-end gap-3">
                    <div>
                      <label className="text-xs text-ink/50">Nom</label>
                      <input
                        value={row.name}
                        onChange={(e) => updateRow(row.id, "name", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                        placeholder="VIP"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink/50">Prix (FCFA)</label>
                      <input
                        value={row.price}
                        onChange={(e) => updateRow(row.id, "price", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                        placeholder="10000"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink/50">Jauge</label>
                      <input
                        value={row.quota}
                        onChange={(e) => updateRow(row.id, "quota", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                        placeholder="200"
                        inputMode="numeric"
                      />
                    </div>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink/40 hover:bg-coral/5 hover:text-coral"
                      aria-label="Supprimer cette catégorie"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addRow}
                className="mt-4 flex items-center gap-1.5 text-sm font-medium text-forest hover:text-forest-light"
              >
                <Plus size={15} />
                Ajouter une catégorie
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-stub border border-line bg-white p-6">
            <h2 className="font-display text-lg text-ink">Vérification</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-line py-2">
                <dt className="text-ink/50">Titre</dt>
                <dd className="text-ink">{title || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-line py-2">
                <dt className="text-ink/50">Lieu</dt>
                <dd className="text-ink">{venue ? `${venue}, ${city}` : "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-line py-2">
                <dt className="text-ink/50">Dates</dt>
                <dd className="text-ink">
                  {startsAt || "—"} → {endsAt || "—"}
                </dd>
              </div>
              <div className="py-2">
                <dt className="mb-2 text-ink/50">Billetterie</dt>
                <dd>
                  {rows.map((r) => (
                    <p key={r.id} className="text-ink">
                      {r.name || "—"} · {r.price || "0"} FCFA · jauge {r.quota || "0"}
                    </p>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-ink/60 disabled:opacity-30"
          >
            Précédent
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-ivory hover:bg-forest-light"
            >
              Suivant
            </button>
          ) : (
            <button className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-forest-dark hover:bg-gold-pale">
              Publier l'événement
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
