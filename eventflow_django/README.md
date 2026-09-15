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

## Le billet comme "visa d'événement"

Chaque billet porte l'identité de la personne qui y assiste (et non plus
seulement celle de l'acheteur) :

- **Nom, prénom, profession, ville, pays, photo** — collectés à l'étape de
  checkout via `apps/tickets/forms.py::ParticipantForm`. La liste de
  professions (`apps/tickets/choices.py::PROFESSION_CHOICES`) couvre les
  catégories courantes, dont "Fonctionnaire d'État" ; la liste des pays
  reconnus par l'ONU est fournie pour le champ pays, tandis que la ville
  reste en texte libre — la plateforme fonctionne donc pour n'importe quel
  pays, pas seulement le Bénin. La devise de chaque événement est également
  libre (`Event.currency`, ex. XOF, EUR, USD, NGN…), réglée par
  l'organisateur à la création.
- **Option personnelle ou groupe de 4** — une catégorie de billet a un
  `group_size` (1 ou 4, voir `TicketCategory.GroupSize`). Acheter une unité
  d'une catégorie "groupe" fait apparaître 4 blocs participants au
  checkout, chacun avec sa propre photo/identité, et génère 4 billets
  individuels scannables séparément.
- **PDF "visa"** (`apps/tickets/services.py::generate_ticket_pdf`) — photo,
  identité, profession, ville/pays, type de billet et QR code sur un même
  document, au format A6.
- **Contrôle d'accès visuel** — `POST /scanner/api/verify/` renvoie la
  photo, la profession et le type de billet du porteur : l'agent peut
  comparer visuellement la personne devant lui à la photo du visa, comme un
  vrai contrôle d'identité. Le manifeste hors-ligne (IndexedDB) ne contient
  que les signatures — pas les photos — pour rester léger ; un scan
  hors-ligne affiche donc un statut valide/invalide mais sans photo tant
  que l'agent n'est pas repassé en ligne.

## Comptes : spectateur, organisateur, agent

Trois types de compte, tous distincts de la connexion Django admin :

- **Spectateur** (`/accounts/inscription/`) — nom, prénoms, sexe,
  profession, photo, identifiants. Donne accès à `/accounts/mes-billets/`
  (historique des commandes payées, avec bouton PDF et lien vers la version
  numérique de chaque billet) et pré-remplit automatiquement le
  participant lors de l'achat d'un billet personnel unique.
- **Organisateur** (`/accounts/inscription/organisateur/`) — mêmes champs
  d'identité + nom et logo de sa structure (`Organization.logo`, réutilisé
  comme "logo de l'organisateur" sur chaque billet PDF). Un compte
  organisateur est **obligatoire** pour publier un événement :
  `event_create_step1` (et toutes les vues du dashboard) sont protégées par
  le décorateur `apps/events/views.py::organizer_required`, qui redirige un
  visiteur non connecté vers la connexion et un spectateur connecté vers
  l'inscription organisateur (jamais l'inverse — un compte existant ne
  peut pas se re-inscrire par-dessus lui-même).
- **Agent** — pas d'auto-inscription : créé par un organisateur (ou via
  `/admin/`) et affecté à un événement via `EventAgent`, voir
  `/scanner/login/`.

La connexion `/accounts/login/` est commune aux spectateurs et
organisateurs et redirige selon le rôle (`accounts:my_tickets` ou
`events:dashboard`).

## 5. Parcours couverts (testés de bout en bout dans cet environnement)

- **Public** : catalogue avec recherche/filtres HTMX (`/`) → détail événement
  avec widget d'achat recalculé en HTMX (`/events/<slug>/`, fermé
  automatiquement après `Event.ticket_sales_deadline` si renseignée) →
  checkout invité ou spectateur connecté (pré-rempli), avec informations
  "visa" par participant, photo comprise (`/checkout/<cart_id>/`) →
  confirmation avec QR + PDF téléchargeable, un billet par personne
  (`/tickets/confirmation/<uuid>/`)
- **Spectateur** : inscription/connexion → achat (voir ci-dessus) →
  historique avec téléchargement PDF et version numérique
  (`/accounts/mes-billets/`)
- **Organisateur** : inscription/connexion (`/accounts/login/`) → dashboard
  KPIs (`/dashboard/`) → création d'événement en 2 étapes avec devise, date
  limite d'achat et formset dynamique de catégories (`/dashboard/new/`) →
  gestion d'un événement : participants (table HTMX filtrable),
  statistiques en direct, export CSV (`/dashboard/<id>/manage/`)
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
- Spectateur : `spectateur` / `eventflow123` → `/accounts/login/` puis `/accounts/mes-billets/`
- Agent : `agent` / `eventflow123` → `/scanner/login/` (affecté à l'événement de démo via `EventAgent`)
- L'événement de démo inclut une catégorie "Pack Famille" (`group_size=4`) pour tester le parcours groupe

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

