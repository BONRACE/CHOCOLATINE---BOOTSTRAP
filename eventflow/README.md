# EventFlow

Plateforme de billetterie et de contrôle d'accès hybride en ligne/hors-ligne.

## Stack technique retenue

| Couche | Choix | Justification |
|---|---|---|
| Frontend + Backend | **Next.js 14 (App Router)**, TypeScript | Un seul projet pour l'espace public, le dashboard admin et le scanner PWA. API Routes = backend intégré. |
| Base de données | **PostgreSQL (Neon)** + **Prisma ORM** | Cohérence transactionnelle forte, indispensable pour éviter le double-scan d'un billet. |
| Mobile / Scanner | **PWA** (pas d'app native) | `manifest.json` + Service Worker + **IndexedDB** (`idb`) pour le mode hors-ligne, caméra via `getUserMedia` + `jsQR`. |
| Auth | **NextAuth (Credentials)** | Sessions JWT pour organisateurs (`ADMIN`) et agents (`AGENT_SCAN`). |
| Paiement | **Stripe** (carte) + **CinetPay** (MTN/Moov/Orange Money) | Double couverture carte bancaire + Mobile Money local. |
| Style | **Tailwind CSS** | Palette EventFlow : vert `#0B4A32` / or `#D4A62F`. |

Voir `prisma/schema.prisma` pour le schéma complet de la base de données
(Users, Events, TicketTypes, Orders, OrderItems, Tickets, ScanAgents, ScanLogs).

## Démarrage

```bash
npm install
cp .env.example .env        # renseigner DATABASE_URL, TICKET_SECRET, clés de paiement
npx prisma migrate dev --name init
npm run seed                # crée un événement de démo + comptes de test
npm run dev
```

Comptes de démonstration créés par le seed :
- **Organisateur** : `admin@eventflow.app` / `password123` → `/admin`
- **Agent scanner** : `agent@eventflow.app` / `password123` → `/scanner`

## Arborescence

```
src/app/
  page.tsx                      # 1.1 Accueil & Catalogue
  evenements/[slug]/page.tsx    # 1.2 Détail Événement
  checkout/[eventId]/page.tsx   # 1.3 Checkout & Paiement (Guest Checkout)
  confirmation/[orderId]/page.tsx  # 1.4 Confirmation + billet QR téléchargeable

  admin/
    page.tsx                          # 2.1 Dashboard analytique
    evenements/nouveau/page.tsx       # 2.2 Création multi-étapes
    evenements/[id]/page.tsx          # 2.3 Gestion (participants, stats live, export CSV)

  scanner/
    page.tsx        # 3.1 Connexion agent + sélection événement
    scan/page.tsx    # 3.2 + 3.3 + 3.4 : scan caméra, feedback vert/rouge, sync offline

  api/
    events/, orders/, checkout/, tickets/verify/, sync/, export/  # backend

src/lib/
  ticket-qr.ts       # génération + signature HMAC des QR codes (anti-fraude)
  offline-db.ts       # IndexedDB : cache billets + file d'attente scans hors-ligne
  payments.ts          # abstraction Stripe / CinetPay
  fulfill-order.ts     # génération des billets après paiement confirmé
  auth.ts               # NextAuth (rôles ADMIN / AGENT_SCAN)
```

## Logique hors-ligne (partie la plus critique)

1. À la sélection d'un événement, `/api/sync` (GET) télécharge l'état de
   tous les billets vers IndexedDB (`cacheEventTickets`).
2. En scan, si `navigator.onLine` est vrai, on appelle `/api/tickets/verify`
   (transaction Prisma atomique — empêche deux agents de valider le même
   billet simultanément).
3. Si le réseau est indisponible, la validation se fait contre le cache
   local, et le scan est mis en file d'attente (`queuePendingScan`).
4. Au retour du réseau (événement `online` du navigateur, ou bouton
   "Synchroniser manuellement"), `/api/sync` (POST) rejoue les scans en
   attente **dans l'ordre chronologique** côté serveur : le premier gagne,
   les suivants deviennent `ALREADY_SCANNED`. Ceci résout proprement les
   conflits si plusieurs agents ont scanné hors-ligne le même billet.

## Sécurité des billets

Le QR code n'encode pas directement l'ID en base, mais
`<code>.<signature_HMAC>` (voir `ticket-qr.ts`). Sans `TICKET_SECRET`,
impossible de fabriquer un faux billet valide même en connaissant le format.

## À compléter avant mise en production

- Envoi d'email transactionnel (Resend/SMTP) — point d'ancrage dans `fulfill-order.ts`
- Intégration carte interactive réelle (Leaflet/Google Maps) sur la page détail événement
- Génération PDF du billet (actuellement PNG du QR code téléchargeable)
- Icônes PWA réelles dans `public/icons/` (192x192, 512x512)
- Rate limiting sur `/api/checkout` et `/api/tickets/verify`
