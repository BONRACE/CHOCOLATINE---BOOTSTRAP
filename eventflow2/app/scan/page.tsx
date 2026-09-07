"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { events } from "@/lib/mock-data";

type ScanFeedback =
  | { kind: "valid"; name: string; category: string }
  | { kind: "invalid"; reason: string }
  | null;

// Démo de billets déjà "scannés" localement, pour illustrer le cas
// "Billet déjà scanné à HH:MM". En production ce set vient de SQLite/IndexedDB.
const demoScannedAt: Record<string, string> = {
  DEMO_ALREADY: "19:42",
};

export default function ScanScreen() {
  return (
    <Suspense fallback={null}>
      <ScanScreenInner />
    </Suspense>
  );
}

function ScanScreenInner() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? events[0].id;
  const event = events.find((e) => e.id === eventId) ?? events[0];
  const total = event.ticketCategories.reduce((s, tc) => s + tc.quantitySold, 0);

  const [scannedCount, setScannedCount] = useState(0);
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [feedback, setFeedback] = useState<ScanFeedback>(null);

  // Le badge reflète l'état réel du navigateur (utile en PWA sur le terrain)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Simule la lecture d'un QR code. En production, un lecteur caméra (ex. html5-qrcode)
  // décode le payload, vérifie la signature localement (clé publique embarquée) contre
  // le cache SQLite/IndexedDB des billets de l'événement — donc valide même hors-ligne —
  // puis écrit un ScanLog local à synchroniser dès que le réseau revient.
  // Signal sonore : aigu pour un billet valide, grave pour une erreur —
  // conforme à la spec (cahier des charges C.3).
  const playTone = (frequency: number) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  };

  const simulateScan = (result: "valid" | "already" | "unknown" | "wrong_event") => {
    playTone(result === "valid" ? 1046 : 220);
    if (result === "valid") {
      setFeedback({ kind: "valid", name: "Aïcha Zannou", category: "Standard" });
      setScannedCount((c) => c + 1);
    } else if (result === "already") {
      setFeedback({
        kind: "invalid",
        reason: `Billet déjà scanné à ${demoScannedAt.DEMO_ALREADY}`,
      });
    } else if (result === "unknown") {
      setFeedback({ kind: "invalid", reason: "Billet inexistant" });
    } else {
      setFeedback({ kind: "invalid", reason: "Mauvais événement" });
    }
    if (!online) setPendingSync((p) => p + 1);
    window.setTimeout(() => setFeedback(null), 1800);
  };

  const handleSync = () => {
    // POST /api/scan-logs/sync avec le lot de ScanLog en attente (offlineId pour dédupliquer)
    setPendingSync(0);
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-forest-dark text-ivory">
      {/* Barre de statut */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-xs text-ivory/50">{event.title}</p>
          <p className="font-mono text-sm">
            {scannedCount} / {total} scannés
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingSync > 0 && (
            <button
              onClick={handleSync}
              className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs text-gold"
            >
              <RefreshCw size={13} />
              {pendingSync} en attente
            </button>
          )}
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              online ? "bg-forest text-ivory/80" : "bg-coral/20 text-coral"
            }`}
          >
            {online ? <Wifi size={13} /> : <WifiOff size={13} />}
            {online ? "En ligne" : "Hors-ligne"}
          </span>
        </div>
      </div>

      {/* Viseur caméra */}
      <div className="relative mx-6 mt-2 flex flex-1 items-center justify-center overflow-hidden rounded-stub border border-ivory/10 bg-black/40">
        <div className="relative h-56 w-56">
          <div className="absolute inset-0 rounded-2xl border-2 border-gold/60" />
          <div className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-gold" />
          <div className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-gold" />
          <div className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-gold" />
          <div className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-gold" />
        </div>
        <p className="absolute bottom-5 text-xs text-ivory/40">
          Caméra — intégration html5-qrcode / MLKit
        </p>
      </div>

      {/* Commandes de démonstration — remplacées par la détection caméra en production */}
      <div className="grid grid-cols-2 gap-2 px-6 py-6">
        <button
          onClick={() => simulateScan("valid")}
          className="rounded-lg bg-forest py-2.5 text-xs text-ivory/70 hover:bg-forest-light"
        >
          Simuler billet valide
        </button>
        <button
          onClick={() => simulateScan("already")}
          className="rounded-lg bg-forest py-2.5 text-xs text-ivory/70 hover:bg-forest-light"
        >
          Simuler déjà scanné
        </button>
        <button
          onClick={() => simulateScan("unknown")}
          className="rounded-lg bg-forest py-2.5 text-xs text-ivory/70 hover:bg-forest-light"
        >
          Simuler billet inexistant
        </button>
        <button
          onClick={() => simulateScan("wrong_event")}
          className="rounded-lg bg-forest py-2.5 text-xs text-ivory/70 hover:bg-forest-light"
        >
          Simuler mauvais événement
        </button>
      </div>

      {/* Modales de feedback plein écran */}
      {feedback && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-4 ${
            feedback.kind === "valid" ? "bg-forest" : "bg-coral"
          }`}
        >
          {feedback.kind === "valid" ? (
            <>
              <CheckCircle2 size={72} className="text-ivory" />
              <p className="font-display text-2xl italic text-ivory">
                {feedback.name}
              </p>
              <p className="text-sm text-ivory/70">{feedback.category}</p>
            </>
          ) : (
            <>
              <XCircle size={72} className="text-ivory" />
              <p className="max-w-[220px] text-center font-display text-xl text-ivory">
                {feedback.reason}
              </p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
