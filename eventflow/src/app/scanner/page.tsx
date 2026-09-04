"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface EventOption {
  id: string;
  title: string;
}

// Page 3.1 — Écran de Connexion & Sélection Événement
export default function ScannerLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/events?scope=active")
        .then((r) => r.json())
        .then(setEvents);
    }
  }, [status]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { ...credentials, redirect: false });
    if (res?.error) setError("Identifiants incorrects.");
  }

  function handleStartScan() {
    if (selectedEvent) router.push(`/scanner/scan?eventId=${selectedEvent}`);
  }

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-primary-dark px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-lg">
          <h1 className="text-center text-xl font-bold text-primary">EventFlow Scanner</h1>
          <input
            type="email"
            placeholder="Email agent"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-primary py-3 font-semibold text-white">
            Se connecter
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-primary-dark px-4">
      <h1 className="text-lg font-semibold text-white">Choisir un événement</h1>
      <select
        className="w-full max-w-sm rounded-lg px-3 py-3"
        value={selectedEvent}
        onChange={(e) => setSelectedEvent(e.target.value)}
      >
        <option value="">— Sélectionner —</option>
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>
            {ev.title}
          </option>
        ))}
      </select>
      <button
        onClick={handleStartScan}
        disabled={!selectedEvent}
        className="w-full max-w-sm rounded-lg bg-gold py-3 font-semibold text-primary-dark disabled:opacity-40"
      >
        Démarrer le scan
      </button>
    </main>
  );
}
