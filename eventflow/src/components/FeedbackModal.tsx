"use client";

import { useEffect } from "react";
import type { ScanFeedback } from "@/types";

/**
 * Écrans plein écran 3.3 : vert (valide) / rouge (erreur), avec signal
 * sonore distinct (aigu = succès, grave = erreur) et fermeture automatique.
 */
export default function FeedbackModal({
  feedback,
  onClose
}: {
  feedback: ScanFeedback;
  onClose: () => void;
}) {
  useEffect(() => {
    playTone(feedback.status === "SUCCESS");
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [feedback, onClose]);

  const isSuccess = feedback.status === "SUCCESS";

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 text-center text-white ${
        isSuccess ? "bg-primary" : "bg-red-700"
      }`}
    >
      <div className="text-7xl">{isSuccess ? "✓" : "✕"}</div>
      {isSuccess ? (
        <>
          <p className="text-2xl font-bold">{feedback.holderName}</p>
          <p className="text-lg opacity-90">{feedback.ticketTypeName}</p>
        </>
      ) : (
        <p className="max-w-xs text-xl font-semibold">{feedback.errorReason}</p>
      )}
      <p className="mt-6 text-sm opacity-70">Touchez l&apos;écran pour continuer</p>
    </div>
  );
}

function playTone(success: boolean) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = success ? 1046 : 220; // aigu vs grave
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio non disponible (ex: navigateur sans interaction utilisateur préalable) — silencieux
  }
}
