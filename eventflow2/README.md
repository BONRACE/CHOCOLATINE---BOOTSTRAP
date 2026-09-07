# EventFlow

Plateforme de billetterie et de contrôle d'accès hybride en ligne/hors-ligne,
pensée pour le marché béninois et ouest-africain.

## 1. Architecture technique retenue

| Couche | Choix | Justification |
|---|---|---|
| Frontend web (public + admin) | **Next.js 14 (App Router)**, TypeScript, Tailwind CSS | Rendu serveur pour le catalogue (SEO, performance sur réseau mobile), un seul repo pour le public et le dashboard organisateur |
| Backend / API | **Next.js Route Handlers** (`app/api/**`) | Colocalisé avec le frontend pour ce MVP ; extractible vers un service séparé si la charge le justifie |
| Base de données | **PostgreSQL (Neon)** via **Prisma ORM** | Neon = Postgres serverless, adapté à un budget de démarrage ; Prisma donne des migrations typées et un schéma lisible (voir `prisma/schema.prisma`) |
| Authentification | JWT (organisateurs + agents de contrôle) | Le token d'un agent doit rester valide hors-ligne pendant tout l'événement |
| Paiement | **Stripe** (carte) + **CinetPay / FedaPay** (MTN, Moov, Orange Money) | Double couverture carte bancaire et mobile money, standard pour ce marché |
| Stockage fichiers | **Cloudflare R2** | Images d'événements et exports CSV, coût de sortie nul |
| App scanner (contrôle d'accès) | **PWA** (Next.js + Service Worker) plutôt qu'une app native | Un seul code pour web/mobile, installable via "Ajouter à l'écran d'accueil", accès caméra et stockage local (IndexedDB) suffisants pour ce cas d'usage |
| Stockage local du scanner | **IndexedDB** (web) — équivalent SQLite si portage React Native envisagé plus tard | Permet de vérifier un billet hors-ligne (signature cryptographique embarquée) et de journaliser les scans avant synchronisation |

### Logique de sécurité des billets

Chaque `Ticket` a un `qrSecret` unique. Le QR code encode un payload signé
(JWT ou HMAC) contenant `ticketId`, `eventId` et une expiration. La **clé
publique de vérification est embarquée dans l'app scanner** au moment de la
connexion de l'agent (téléchargée avec le manifeste de billets de
l'événement) : un scan peut donc être validé **entièrement hors-ligne**, sans
appel réseau. Le résultat (`ScanLog`) est écrit localement avec un
`offlineId` généré côté client, puis synchronisé dès que le réseau revient —
le `offlineId` unique permet de dédupliquer si la synchronisation est
rejouée.

## 2. Schéma de base de données

Voir `prisma/schema.prisma`, entièrement commenté. Résumé des entités :

- **User / Organization** — organisateurs et agents de contrôle, rattachés à une structure
- **Event** — un événement, avec statut (brouillon / publié / annulé / archivé)
- **TicketCategory** — une catégorie de billets (VIP, Standard…) avec jauge et prix figé
- **Order / OrderItem** — une commande "invité" (sans compte) et ses lignes
- **Ticket** — un billet nominatif individuel, un `qrSecret` unique par billet
- **ScanLog** — la traçabilité de chaque tentative de scan, y compris hors-ligne
- **EventAgent** — l'affectation d'un agent de contrôle à un événement

## 3. Structure du projet

```
eventflow/
├── app/
│   ├── page.tsx                        # 1.1 Accueil & catalogue
│   ├── evenements/[slug]/page.tsx      # 1.2 Détail événement
│   ├── checkout/[eventId]/page.tsx     # 1.3 Checkout & paiement
│   ├── confirmation/[orderId]/page.tsx # 1.4 Confirmation & billet (QR code)
│   ├── admin/
│   │   ├── dashboard/page.tsx          # 2.1 Dashboard analytique
│   │   ├── evenements/nouveau/page.tsx # 2.2 Création d'événement (multi-étapes)
│   │   └── evenements/[id]/page.tsx    # 2.3 Gestion d'événement (participants/stats/export)
│   ├── connexion/page.tsx              # 3.1 Connexion agent & sélection événement
│   └── scan/page.tsx                   # 3.2–3.3 Écran de scan + modales de feedback
├── components/                         # EventCard, TicketSelector, Header, Footer…
├── lib/
│   ├── mock-data.ts                    # Données de démonstration (à remplacer par Prisma)
│   └── db.ts                           # Client Prisma
├── prisma/schema.prisma                # Schéma de base de données complet
└── public/manifest.json                # Manifeste PWA du scanner
```

## 4. Identité visuelle

Palette reprise de vos autres projets — vert forêt `#0B4A32` et or `#D4A62F` —
déclinée ici avec un fond ivoire `#F6F2E7` et un rouge corail `#E2572B`
réservé aux états d'erreur/urgence. Typographies : **Fraunces** (display,
esprit "billet de collection") + **Inter** (interface) + **IBM Plex Mono**
(codes, dates, montants — lisibilité façon carte d'embarquement). Les cartes
d'événements et le billet final reprennent la forme d'un vrai ticket
déchirable (encoches + ligne perforée), pour ancrer le design dans le produit
plutôt que d'utiliser un habillage générique.

## 5. Lancer le projet

```bash
npm install
cp .env.example .env        # renseigner DATABASE_URL au minimum
npx prisma migrate dev      # crée les tables à partir du schéma
npm run dev
```

Le frontend fonctionne dès `npm run dev` avec les données de démonstration de
`lib/mock-data.ts`, sans base connectée — pratique pour itérer sur le design
avant de brancher Prisma.

## 6. Ce qui est livré vs. ce qui reste à faire

**Livré dans ce dossier :** l'architecture complète, le schéma de base de
données, et le code d'interface pour les 11 vues du cahier des charges
(catalogue, détail événement, checkout, confirmation avec QR code, dashboard,
création d'événement, gestion d'événement, connexion agent, écran de scan
avec badge en ligne/hors-ligne et modales vert/rouge).

**Roadmap pour la mise en production :**
1. **Route Handlers API** (`app/api/events`, `/api/orders`, `/api/scan-logs/sync`…) branchés sur Prisma, remplaçant `lib/mock-data.ts`.
2. **Intégration paiement réelle** : Stripe Elements pour la carte, redirection CinetPay/FedaPay pour le mobile money, webhooks pour confirmer la commande et déclencher la génération des billets.
3. **Lecture caméra réelle** dans `app/scan/page.tsx` via une librairie comme `html5-qrcode`, à la place des boutons de simulation actuels.
4. **Synchronisation offline réelle** : file d'attente IndexedDB pour les `ScanLog`, avec retry automatique au retour du réseau (les boutons de simulation posent déjà la structure de données).
5. **Authentification** organisateurs/agents (NextAuth ou JWT maison) et protection des routes `/admin` et `/scan`.
6. **Génération PDF** du billet téléchargeable (le QR code est déjà généré côté client) et envoi d'email transactionnel à la confirmation.
7. **Upload d'image** vers Cloudflare R2 pour le formulaire de création d'événement.
