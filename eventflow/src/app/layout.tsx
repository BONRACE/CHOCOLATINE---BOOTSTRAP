import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventFlow — Billetterie & Contrôle d'accès",
  description: "Plateforme de billetterie et de contrôle d'accès hybride en ligne/hors-ligne.",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
