# EventFlow — monolithe Django

Plateforme de billetterie et de contrôle d'accès hybride en ligne/hors-ligne,
développée à 100 % en Django : templates Django + HTMX pour toute
l'interactivité, PWA servie par Django pour le scanner. Aucun frontend
séparé (pas de React/Vue/Angular), aucune app mobile native.

## 1. Stack technique

| Couche | Choix |
|---|---|
| Backend | Python 3.12 + Django 5.1 |
| Interface | Django Templates + **HTMX** (recherche, filtres, recalcul de panier, table participants) + Tailwind CSS (CDN) |
| Base de données | **PostgreSQL** via l'ORM Django |
| App scanner | **PWA** servie par Django (Service Worker + Web App Manifest), caméra via `html5-qrcode`, cache hors-ligne en **IndexedDB** |
| Sécurité QR | HMAC-SHA256 (`apps/tickets/services.py`), clé = `settings.SECRET_KEY` |
| QR & PDF | `qrcode` + `reportlab` |
| Email | `django.core.mail` (backend console en développement) |

## 2. Structure du projet

```
eventflow_django/
├── eventflow_core/          # settings, urls, wsgi/asgi
├── apps/
│   ├── accounts/            # User (rôles organisateur/agent), Organization, login organisateur
│   ├── core/                 # Vues publiques : catalogue, détail événement, checkout, confirmation
│   ├── events/               # Event, TicketCategory ; dashboard organisateur, création/gestion d'événement
│   ├── tickets/               # Order, OrderItem, Ticket ; HMAC + génération QR/PDF
│   └── scanner/               # ScanLog ; PWA (login agent, scan, API manifeste/verify/sync)
├── templates/                 # base.html + gabarits par app + composants réutilisables
├── static/
│   ├── css/styles.css         # encoches de billet, focus states
│   ├── js/scanner.js          # caméra, IndexedDB, vérification hors-ligne, sync
│   ├── js/service-worker.js
│   └── manifest.json          # manifeste PWA du scanner
└── requirements.txt
```

## 3. Modèles ORM (résumé — voir chaque `models.py` pour le détail commenté)

- **`accounts.Organization` / `accounts.User`** — `User` étend `AbstractUser` avec un champ `role` (`ORGANIZER` / `AGENT` / `SUPERADMIN`)
- **`events.Event`** — statut (brouillon/publié/annulé/archivé), propriétés `min_price` et `fill_rate` calculées
- **`events.TicketCategory`** — prix, jauge, `quantity_sold`, propriétés `remaining` / `sold_out`
- **`events.EventAgent`** — affectation d'un agent à un événement
- **`tickets.Order` / `tickets.OrderItem`** — commande "invité" (aucun compte requis) et ses lignes
- **`tickets.Ticket`** — un billet nominatif individuel, un statut (`VALID`/`SCANNED`/`CANCELLED`)
- **`scanner.ScanLog`** — traçabilité de chaque scan, y compris hors-ligne (`offline_id` unique pour dédupliquer à la synchronisation)

## 4. Sécurité des QR codes (HMAC-SHA256)

Voir `apps/tickets/services.py`. Payload du QR code :
```json
{"t_id": "<uuid billet>", "e_id": "<uuid événement>", "sig": "<hmac-sha256>"}
```
`sig = HMAC-SHA256(SECRET_KEY, "<t_id>:<e_id>")`. Le scanner ne connaît jamais
`SECRET_KEY` : à la connexion de l'agent, `build_offline_manifest(event)`
distribue la liste des billets payés avec leur `sig` **déjà calculée**. Le
scanner (JS, `verifyOffline()` dans `scanner.js`) compare simplement la
signature du QR code à celle du manifeste local — la validation fonctionne
donc **entièrement hors-ligne**. En ligne, `POST /scanner/api/verify/`
revérifie côté serveur et fait autorité sur les doublons entre agents.

## 5. Parcours couverts (testés de bout en bout dans cet environnement)

- **Public** : catalogue avec recherche/filtres HTMX (`/`) → détail événement
  avec widget d'achat recalculé en HTMX (`/events/<slug>/`) → checkout invité
  (`/checkout/<cart_id>/`) → confirmation avec QR + PDF téléchargeable
  (`/tickets/confirmation/<uuid>/`)
- **Organisateur** : connexion (`/accounts/login/`) → dashboard KPIs
  (`/dashboard/`) → création d'événement en 2 étapes avec formset dynamique
  de catégories (`/dashboard/new/`) → gestion d'un événement : participants
  (table HTMX filtrable), statistiques en direct, export CSV
  (`/dashboard/<id>/manage/`)
- **Scanner** : connexion agent + sélection d'événement (`/scanner/login/`)
  → écran de scan caméra avec badge réseau et compteur
  (`/scanner/view/<id>/`) → vérification en ligne (`/scanner/api/verify/`)
  ou hors-ligne (IndexedDB) → synchronisation par lot
  (`/scanner/api/sync/`)

## 6. Lancer le projet

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

docker compose up -d          # PostgreSQL local
cp .env.example .env

python manage.py migrate
python manage.py seed_demo    # crée organisateur/agent/événement de démonstration
python manage.py createsuperuser   # optionnel, pour /admin/
python manage.py runserver
```

**Comptes créés par `seed_demo`** :
- Organisateur : `organisateur` / `eventflow123` → `/accounts/login/` puis `/dashboard/`
- Agent : `agent` / `eventflow123` → `/scanner/login/` (affecté à l'événement de démo via `EventAgent`)

L'accès caméra du scanner nécessite HTTPS ou `localhost` — fonctionne donc
directement en développement, mais demande un certificat TLS une fois
déployé.

## 7. Ce qui reste à faire pour la production

1. **Vérification des webhooks** : `apps/tickets/views.py` contient la
   structure des webhooks Stripe/CinetPay/FedaPay (routés sous
   `/payments/webhooks/`) mais accepte le payload sans vérifier sa
   signature — chaque `TODO` indique précisément quoi brancher
   (`stripe.Webhook.construct_event`, l'API "Check Payment Status" de
   CinetPay, l'en-tête `x-fedapay-signature`). Tant que ce n'est pas fait,
   ne pas déployer ces endpoints tels quels.
2. **Email transactionnel** : `EMAIL_BACKEND` est en mode console.
   Configurer un backend SMTP/API (ex. `django-anymail`) — `send_mail` est
   déjà appelé au bon endroit (`finalize_paid_order`).
3. **Icônes PWA** : `static/icons/icon-192.png` et `icon-512.png` sont des
   placeholders générés — à remplacer par de vraies icônes de marque.
4. **Tâches asynchrones** : la génération de PDF est synchrone à la
   demande ; passer par Celery/django-q si le volume le justifie.
5. **Carte interactive** : le bloc "Lieu" de la page détail événement est un
   placeholder — intégrer Mapbox ou Google Maps avec `event.latitude` /
   `event.longitude`.

## 8. Sécurité déjà en place

- **Paiement** : en démonstration, `apps/core/views.py::checkout` appelle
  directement `finalize_paid_order()` après la sélection du moyen de
  paiement (aucune passerelle réelle branchée). En production, retirer cet
  appel : la commande reste `PENDING`, la redirection pointe vers la page
  du fournisseur de paiement, et c'est le webhook correspondant qui appelle
  `finalize_paid_order()` — la fonction est idempotente (rejouer un webhook
  ne crée pas de billets en double).
- **Permissions scanner** : un agent ne peut se connecter et scanner que
  sur les événements qui lui sont affectés via `events.EventAgent` (voir
  `apps/scanner/views.py::_agent_can_access`), vérifié à la connexion, à
  l'ouverture de l'écran de scan et sur l'API de manifeste/vérification. Un
  superutilisateur passe outre pour le support.

