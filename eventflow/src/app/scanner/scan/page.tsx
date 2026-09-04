"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ScannerCamera from "@/components/ScannerCamera";
import FeedbackModal from "@/components/FeedbackModal";
import { parseQrPayload } from "@/lib/ticket-qr";
import {
  cacheEventTickets,
  getCachedTicket,
  markTicketScannedLocally,
  queuePendingScan,
  getUnsyncedScans,
  markScanSynced
} from "@/lib/offline-db";
import type { ScanFeedback } from "@/types";

/**
 * Écrans 3.2 (scan) + 3.3 (feedback) + 3.4 (sync) réunis :
 * - En ligne : vérifie chaque billet directement en base via /api/tickets/verify.
 * - Hors-ligne : valide contre le cache local IndexedDB, met en file d'attente
 *   le scan, et l'affiche comme réussi localement (résolution finale faite au
 *   retour du réseau via /api/sync).
 */
export default function ScanPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";

  const [isOnline, setIsOnline] = useState(true);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const paused = feedback !== null;
  const agentId = (session?.user as { id?: string } | undefined)?.id ?? "unknown";

  const syncPendingScans = useCallback(async () => {
    const pending = await getUnsyncedScans();
    if (pending.length === 0) return;

    setSyncing(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scans: pending.map((p) => ({
            ticketCode: p.ticketCode,
            eventId: p.eventId,
            scannedAt: p.scannedAt
          }))
        })
      });
      if (res.ok) {
        for (const p of pending) if (p.id) await markScanSynced(p.id);
      }
    } catch {
      // Réseau encore instable — on réessaiera au prochain déclenchement
    } finally {
      setSyncing(false);
    }
  }, []);

  // Charge le cache local des billets au montage + écoute l'état réseau
  useEffect(() => {
    if (!eventId) return;

    async function bootstrap() {
      setIsOnline(navigator.onLine);
      try {
        const res = await fetch(`/api/sync?eventId=${eventId}`);
        if (res.ok) {
          const tickets = await res.json();
          await cacheEventTickets(tickets);
          setTotalTickets(tickets.length);
          setScannedCount(tickets.filter((t: { status: string }) => t.status === "SCANNED").length);
        }
      } catch {
        // Pas de réseau au chargement : le cache précédemment stocké reste utilisable
      }
    }
    bootstrap();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingScans();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [eventId, syncPendingScans]);

  const lastPayloadRef = useRef<string>("");

  const handleDetected = useCallback(
    async (payload: string) => {
      if (payload === lastPayloadRef.current || paused) return;
      lastPayloadRef.current = payload;

      const parsed = parseQrPayload(payload);
      if (!parsed.valid || !parsed.code) {
        setFeedback({ status: "ERROR", errorReason: "Billet inexistant" });
        return;
      }

      if (navigator.onLine) {
        try {
          const res = await fetch("/api/tickets/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload, eventId })
          });
          const data = await res.json();
          if (data.ok) {
            setFeedback({ status: "SUCCESS", holderName: data.holderName, ticketTypeName: data.ticketTypeName });
            setScannedCount((c) => c + 1);
            await markTicketScannedLocally(parsed.code, new Date().toISOString());
          } else {
            setFeedback({ status: "ERROR", errorReason: data.reason });
          }
          return;
        } catch {
          // Le fetch a échoué malgré navigator.onLine=true → bascule en mode hors-ligne
        }
      }

      // --- Mode hors-ligne : validation contre le cache local ---
      const cached = await getCachedTicket(parsed.code);
      if (!cached) {
        setFeedback({ status: "ERROR", errorReason: "Billet inconnu (non synchronisé)" });
        return;
      }
      if (cached.eventId !== eventId) {
        setFeedback({ status: "ERROR", errorReason: "Mauvais événement" });
        return;
      }
      if (cached.status === "SCANNED") {
        setFeedback({ status: "ERROR", errorReason: "Billet déjà scanné" });
        return;
      }
      if (cached.status === "CANCELLED") {
        setFeedback({ status: "ERROR", errorReason: "Billet annulé" });
        return;
      }

      const scannedAt = new Date().toISOString();
      await markTicketScannedLocally(parsed.code, scannedAt);
      await queuePendingScan({
        ticketCode: parsed.code,
        eventId,
        scannedAt,
        scannedBy: agentId,
        result: "SUCCESS",
        synced: false
      });
      setFeedback({ status: "SUCCESS", holderName: cached.holderName, ticketTypeName: cached.ticketTypeName });
      setScannedCount((c) => c + 1);
    },
    [eventId, paused, agentId]
  );

  function closeFeedback() {
    setFeedback(null);
    lastPayloadRef.current = "";
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-900 px-4 py-4">
      {/* Barre de statut */}
      <div className="mb-4 flex items-center justify-between text-white">
        <span className="text-sm font-medium">
          {scannedCount} / {totalTickets || "?"} scannés
        </span>
        <div className="flex items-center gap-2">
          {syncing && <span className="text-xs text-gold">Synchronisation…</span>}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isOnline ? "bg-primary text-white" : "bg-red-600 text-white"
            }`}
          >
            {isOnline ? "En ligne" : "Hors-ligne"}
          </span>
        </div>
      </div>

      <ScannerCamera onDetected={handleDetected} paused={paused} />

      <button
        onClick={syncPendingScans}
        className="mt-4 rounded-lg border border-white/20 py-2 text-sm text-white"
      >
        Synchroniser manuellement
      </button>

      {feedback && <FeedbackModal feedback={feedback} onClose={closeFeedback} />}
    </main>
  );
}
