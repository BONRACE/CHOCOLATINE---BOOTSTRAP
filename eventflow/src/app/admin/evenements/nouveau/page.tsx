"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TicketTypeDraft {
  name: string;
  priceXof: number;
  quota: number;
}

// Page 2.2 — Formulaire multi-étapes : Création / Édition d'Événement & Billets
export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [general, setGeneral] = useState({
    title: "",
    description: "",
    category: "Concert",
    city: "",
    venue: "",
    address: "",
    startsAt: "",
    endsAt: "",
    coverImageUrl: ""
  });

  const [ticketTypes, setTicketTypes] = useState<TicketTypeDraft[]>([
    { name: "Standard", priceXof: 0, quota: 100 }
  ]);

  function addTicketType() {
    setTicketTypes((prev) => [...prev, { name: "", priceXof: 0, quota: 50 }]);
  }

  function updateTicketType(index: number, patch: Partial<TicketTypeDraft>) {
    setTicketTypes((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTicketType(index: number) {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...general, ticketTypes })
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("Vérifiez les champs du formulaire.");
      return;
    }
    router.push(`/admin/evenements/${data.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-primary">Créer un événement</h1>

      {/* Indicateur d'étapes */}
      <div className="flex gap-2 text-sm">
        {["Infos générales", "Billetterie"].map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-lg px-3 py-2 text-center ${
              step === i + 1 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <input
            placeholder="Titre de l'événement"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={general.title}
            onChange={(e) => setGeneral({ ...general, title: e.target.value })}
          />
          <textarea
            placeholder="Description complète"
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={general.description}
            onChange={(e) => setGeneral({ ...general, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={general.category}
              onChange={(e) => setGeneral({ ...general, category: e.target.value })}
            >
              {["Concert", "Conférence", "Festival", "Sport", "Formation", "Autre"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="Ville"
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={general.city}
              onChange={(e) => setGeneral({ ...general, city: e.target.value })}
            />
          </div>
          <input
            placeholder="Lieu (nom de la salle)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={general.venue}
            onChange={(e) => setGeneral({ ...general, venue: e.target.value })}
          />
          <input
            placeholder="Adresse complète"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={general.address}
            onChange={(e) => setGeneral({ ...general, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Début</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                value={general.startsAt}
                onChange={(e) => setGeneral({ ...general, startsAt: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Fin</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                value={general.endsAt}
                onChange={(e) => setGeneral({ ...general, endsAt: e.target.value })}
              />
            </div>
          </div>
          <input
            placeholder="URL de l'image de couverture"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={general.coverImageUrl}
            onChange={(e) => setGeneral({ ...general, coverImageUrl: e.target.value })}
          />

          <button
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary-light"
          >
            Suivant : billetterie
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          {ticketTypes.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 border-b border-gray-50 pb-3">
              <div>
                <label className="text-xs text-gray-500">Nom</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5"
                  value={t.name}
                  onChange={(e) => updateTicketType(i, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Prix (FCFA)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5"
                  value={t.priceXof}
                  onChange={(e) => updateTicketType(i, { priceXof: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Jauge max</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5"
                  value={t.quota}
                  onChange={(e) => updateTicketType(i, { quota: Number(e.target.value) })}
                />
              </div>
              <button
                onClick={() => removeTicketType(i)}
                className="rounded-lg border border-red-200 px-2 py-1.5 text-red-600"
              >
                ✕
              </button>
            </div>
          ))}

          <button onClick={addTicketType} className="text-sm font-medium text-primary underline">
            + Ajouter une catégorie de billet
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="flex-1 rounded-lg border border-gray-200 py-3">
              Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-lg bg-gold py-3 font-semibold text-primary-dark hover:bg-gold-light disabled:opacity-40"
            >
              {loading ? "Création..." : "Créer l'événement"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
