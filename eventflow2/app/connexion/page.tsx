"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";
import { events } from "@/lib/mock-data";

export default function AgentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eventId, setEventId] = useState(events[0]?.id ?? "");

  const canSubmit = email.length > 3 && password.length >= 4 && eventId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // En production : POST /api/auth/agent → JWT stocké en local (accès hors-ligne),
    // puis téléchargement du manifeste de billets de l'événement pour le cache SQLite/IndexedDB.
    router.push(`/scan?eventId=${eventId}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-dark px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
            <ScanLine className="text-gold" size={22} />
          </div>
          <h1 className="mt-4 font-display text-2xl italic text-ivory">
            Contrôle d'accès
          </h1>
          <p className="mt-1 text-sm text-ivory/50">
            Connexion agent — EventFlow Scan
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-stub border border-ivory/10 bg-forest p-5"
        >
          <div>
            <label className="text-xs font-medium text-ivory/60">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ivory/15 bg-forest-dark px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="agent@eventflow.bj"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ivory/60">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ivory/15 bg-forest-dark px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ivory/60">
              Événement à contrôler
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ivory/15 bg-forest-dark px-3.5 py-2.5 text-sm text-ivory focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} — {new Date(e.startsAt).toLocaleDateString("fr-FR")}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-full bg-gold py-3 text-sm font-medium text-forest-dark transition-colors hover:bg-gold-pale disabled:cursor-not-allowed disabled:opacity-40"
          >
            Démarrer le contrôle
          </button>
        </form>
      </div>
    </main>
  );
}
