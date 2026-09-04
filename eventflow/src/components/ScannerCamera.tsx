"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";

/**
 * Viseur caméra pour la lecture continue de QR codes (écran 3.2).
 * Utilise getUserMedia + un canvas caché pour décoder chaque frame via jsQR
 * (fonctionne aussi bien en ligne qu'hors-ligne, car le décodage est local).
 */
export default function ScannerCamera({
  onDetected,
  paused
}: {
  onDetected: (payload: string) => void;
  paused: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const [error, setError] = useState<string | null>(null);
  const lastScanRef = useRef<string>("");

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && !paused) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data !== lastScanRef.current) {
          lastScanRef.current = code.data;
          onDetected(code.data);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onDetected, paused]);

  useEffect(() => {
    let stream: MediaStream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
      }
    }

    startCamera();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Réinitialise le dernier scan quand on ressort de pause, pour permettre
  // de re-scanner rapidement un nouveau billet.
  useEffect(() => {
    if (!paused) lastScanRef.current = "";
  }, [paused]);

  if (error) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video ref={videoRef} className="h-72 w-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      <div className="pointer-events-none absolute inset-8 rounded-2xl border-4 border-gold" />
    </div>
  );
}
