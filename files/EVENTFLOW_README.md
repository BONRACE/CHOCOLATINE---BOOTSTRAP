# EventFlow - Documentation Complète

## Architecture 100% Django - Plateforme de Billetterie & Contrôle d'Accès Hybride

### 📋 Vue d'ensemble

EventFlow est une **plateforme de billetterie et de contrôle d'accès complète** construite entièrement avec Django, sans frameworks frontend séparés. L'application combine une interface web réactive utilisant **HTMX + Tailwind CSS** avec une **Progressive Web App (PWA)** pour le scan des billets en mode **online/offline**.

---

## 🏗️ Architecture Technique

### Stack Technique Unique
- **Backend** : Django 5.x + Python 3.12+
- **Base de données** : PostgreSQL avec ORM Django natif
- **Frontend** : Django Templates + HTMX + Tailwind CSS (CDN)
- **Mobile Scanner** : Progressive Web App (PWA) avec Service Worker
- **Sécurité** : JWT (HS256) + HMAC-SHA256 pour QR Codes
- **Async Tasks** : Celery + Redis
- **Génération PDF** : WeasyPrint
- **Email** : Django Mail
- **QR Codes** : `qrcode` + `html5-qrcode`
- **Offline Storage** : IndexedDB + Service Worker

---

## 📁 Fichiers Créés & Implémentation

### 1. **Structure du Projet**
```
eventflow/
├── eventflow_core/
│   ├── settings.py          ✅ Configuration Django complète
│   ├── urls.py              ✅ Routage global
│   ├── middleware.py        ✅ Security headers
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── core/
│   │   ├── views.py         ✅ Accueil, recherche, événements
│   │   ├── forms.py         ✅ Formulaires
│   │   ├── models.py        ✅ Event, TicketCategory, Cart
│   │   └── urls.py          ✅
│   ├── events/
│   │   ├── models.py        ✅ Event, TicketCategory
│   │   ├── views.py         ✅ Dashboard, gestion événements
│   │   ├── forms.py         ✅ EventForm, TicketCategoryForm
│   │   ├── urls.py          ✅
│   │   └── admin.py
│   ├── tickets/
│   │   ├── models.py        ✅ Order, Ticket, ScanLog
│   │   ├── views.py         ✅ Checkout, confirmation
│   │   ├── forms.py         ✅ CheckoutForm
│   │   ├── utils.py         ✅ QRCodeSignature, OfflineManifest
│   │   └── urls.py          ✅
│   └── scanner/
│       ├── models.py        ✅ ScannerSession, OfflineSyncQueue
│       ├── views.py         ✅ PWA scanner, APIs
│       ├── forms.py         ✅ ScannerLoginForm
│       ├── api.py
│       └── urls.py          ✅
├── templates/
│   ├── base.html            ✅ Template de base
│   ├── core/
│   │   ├── index.html
│   │   ├── event_detail.html ✅ Détail avec HTMX
│   │   └── components/
│   ├── tickets/
│   │   └── checkout.html    ✅ Paiement
│   ├── dashboard/
│   │   └── event_manage.html
│   └── scanner/
│       └── scan_interface.html ✅ PWA interface
├── static/
│   ├── js/
│   │   ├── service-worker.js   ✅ Service Worker
│   │   ├── scanner.js          ✅ Scanner principal
│   │   ├── offline-sync.js     ✅ Sync offline
│   │   └── qrcode-scan.js
│   ├── manifest.json           ✅ Web App Manifest
│   └── css/
│       └── tailwind.css
├── requirements.txt            ✅
├── manage.py
└── .env.example               ✅
```

---

## 🔐 Sécurité & Cryptographie

### Signature HMAC-SHA256 pour QR Codes
```python
# apps/tickets/utils.py - QRCodeSignature class

Payload JWT:
{
  "t_id": "ticket-uuid",      # ID unique du billet
  "e_id": "event-uuid",       # ID de l'événement
  "iat": "2026-09-07T...",   # Date d'émission
  "exp": "2026-09-08T..."    # Date d'expiration (24h)
}

Algorithme: HS256 (HMAC-SHA256)
Clé secrète: settings.HMAC_SECRET_KEY
```

### Validation
- **Online** : Vérification serveur via Django API
- **Offline** : Validation locale IndexedDB + Web Crypto API
- **Mode hybride** : Synchronisation asynchrone lors du retour en ligne

---

## 📱 PWA Scanner - Fonctionnalités

### 1. **Interface de Scan**
```
┌─────────────────────────────────┐
│  [●] En ligne  0 / 1250 billets │
└─────────────────────────────────┘
│                                 │
│     📱 Caméra QR (html5-qrcode)│
│                                 │
├─────────────────────────────────┤
│                                 │
│  ✓ Participant Name             │
│  → VIP (au clic du scan)        │
│                                 │
└─────────────────────────────────┘
```

### 2. **Offline Capability**
- **Manifest** : Téléchargement des billets chiffrés (IndexedDB)
- **Validation locale** : HMAC-SHA256 en JavaScript
- **Queue de sync** : Enregistrement des scans offline
- **Auto-sync** : Synchronisation au retour en ligne

### 3. **Feedback Visuel & Auditif**
- **Écran vert** : Bip sonore haut (800 Hz, 0.2s) + nom du participant
- **Écran rouge** : Bip sonore grave (400 Hz, 0.3s) + raison du rejet
- **Web Audio API** : Synthèse vocale en temps réel

---

## 📊 Dashboard Organisateur

### 1. **Vue d'ensemble (Dashboard)**
- KPIs : Chiffre d'affaires total, nombre de commandes, taux d'occupation
- Graphique de revenus (30 derniers jours)
- Liste des événements récents et à venir

### 2. **Gestion d'Événement**
- **Onglet Participants** : Tableau filtrable (HTMX) par nom/email/statut
- **Onglet Statistiques** : Graphique d'affluence par heure (Chart.js)
- **Onglet Export** : CSV des participants avec catégorie de billet

### 3. **Création/Édition**
- Formulaire multi-étapes
- Formsets dynamiques pour catégories (VIP, Standard, Early Bird)
- Upload d'images (bannière, poster)

---

## 🛒 Flux d'Achat (Public)

### 1. **Accueil & Catalogue**
```
GET /
├─ Recherche HTMX (hx-trigger="keyup changed delay:300ms")
├─ Filtres : Ville, Catégorie de billet
└─ Grid d'événements responsive
```

### 2. **Détail Événement**
```
GET /events/<slug>/
├─ Banner héro avec visuel
├─ Infos clés (date, lieu, disponibilité)
├─ Description riche
└─ Widget d'achat interactif (sélecteur HTMX)
    ├─ POST /events/<id>/selector/ → recalc total
    └─ POST /cart/add/ → ajouter au panier
```

### 3. **Panier & Checkout**
```
GET /checkout/<cart_id>/
├─ Récapitulatif des articles
├─ Formulaire : Nom, Email (double validation), Tél
├─ Sélection moyen de paiement
│  ├─ Carte bancaire
│  ├─ Mobile Money MTN
│  ├─ Mobile Money Moov
│  └─ Mobile Money Orange
└─ POST → Créer Order + Billets + Email confirmation
```

### 4. **Confirmation & PDF**
```
GET /tickets/confirmation/<order_uuid>/
├─ Récapitulatif de commande
├─ Liste des billets avec QR Codes
├─ Lien téléchargement PDF
└─ Email envoyé (signal async)
```

---

## 🔧 Installation & Configuration

### Prérequis
- Python 3.12+
- PostgreSQL 13+
- Redis 6+ (Celery)
- Node.js (optionnel, pour Tailwind CLI)

### 1. **Clone & Setup**
```bash
# Clone le repo
git clone <repository>
cd eventflow

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### 2. **Configuration Django**
```bash
# Copier .env.example en .env
cp .env.example .env

# Remplir les variables :
# - SECRET_KEY (openssl rand -hex 32)
# - DATABASE_* (PostgreSQL)
# - EMAIL_* (SMTP)
# - HMAC_SECRET_KEY
# - ENCRYPTION_KEY (Fernet key)
```

### 3. **Base de Données**
```bash
# Migrations
python manage.py migrate

# Créer le superuser
python manage.py createsuperuser

# Charger les fixtures (optionnel)
python manage.py loaddata initial_data.json
```

### 4. **Serveur de Développement**
```bash
# Lancer Django
python manage.py runserver

# Dans un autre terminal : Celery
celery -A eventflow_core worker -l info

# Dans un 3e terminal : Beat (tasks périodiques)
celery -A eventflow_core beat -l info
```

### 5. **Accès**
- Public : http://localhost:8000/
- Dashboard : http://localhost:8000/dashboard/
- Scanner PWA : http://localhost:8000/scanner/
- Admin : http://localhost:8000/admin/

---

## 📡 APIs Endpoints

### Scanner (PWA)

#### Scan Ticket
```
POST /scanner/api/scan/
Content-Type: application/json

{
  "qr_data": "eyJ...",      // JWT signé
  "event_id": "uuid",       // ID événement
  "offline": false          // Mode offline?
}

Response:
{
  "success": true,
  "status": "valid" | "already_scanned" | "invalid",
  "participant_name": "John Doe",
  "category": "VIP",
  "sound": "success" | "error"
}
```

#### Télécharger Manifest
```
GET /scanner/api/manifest/<event_id>/

Response:
{
  "event_id": "uuid",
  "event_name": "Event Title",
  "total_tickets": 1250,
  "tickets": [
    {
      "tid": "uuid",
      "sig": "eyJ...",       // QR signature
      "enc": "base64(...)",  // Données chiffrées
      "cat": "VIP",
      "status": "unused"
    }
  ]
}

Header:
X-Manifest-Hash: sha256hash
```

#### Synchroniser Offline
```
POST /scanner/api/sync/
Content-Type: application/json

{
  "event_id": "uuid",
  "scans": [
    {
      "ticket_id": "uuid",
      "qr_data": "eyJ...",
      "timestamp": "2026-09-07T12:00:00Z"
    }
  ]
}

Response:
{
  "success": true,
  "synced": 150,
  "failed": 2,
  "failed_scans": [
    {
      "ticket_id": "uuid",
      "reason": "Already scanned"
    }
  ]
}
```

---

## 🗄️ Modèles ORM Principaux

### Event
```python
- id (UUID)
- organizer (FK User)
- title, slug, description
- start_date, end_date
- location, latitude, longitude
- image, banner_image
- capacity, status (draft/published/ongoing/completed)
- is_online, online_url
```

### TicketCategory
```python
- id (UUID)
- event (FK Event)
- name, category_type (vip/standard/early_bird/group)
- price, quota
- sale_start, sale_end
- is_active
```

### Order
```python
- id (UUID)
- event (FK Event)
- first_name, last_name, email, phone
- total_amount, payment_method (card/mtn/moov/orange)
- status (pending/completed/failed/refunded)
- transaction_ref (unique)
- created_at, paid_at
```

### Ticket
```python
- id (UUID)
- order (FK Order)
- category (FK TicketCategory)
- qr_code_data (JWT signé)
- qr_code_image (PNG)
- status (unused/scanned/validated)
- scanned_at, scanned_by (FK User)
```

### ScanLog
```python
- id (UUID)
- ticket (FK Ticket)
- event (FK Event)
- scanner_user (FK User)
- status (success/already_scanned/invalid/error)
- ip_address, user_agent
- scanned_at
```

### ScannerSession
```python
- id (UUID)
- user (FK User)
- event (FK Event)
- device_id (browser ID)
- is_online
- manifest_hash (SHA256)
- last_sync
```

### OfflineSyncQueue
```python
- id (UUID)
- session (FK ScannerSession)
- scan_data (JSON)
- status (pending/synced/failed)
- retry_count
```

---

## 🧪 Tests

### Test de Sécurité
```python
# apps/tickets/test_security.py
- test_qr_signature_generation()
- test_qr_signature_validation()
- test_qr_expiration()
- test_offline_manifest_encryption()
- test_hmac_tampering_detection()
```

### Test de Vues
```python
# Checkout flow
- test_guest_checkout()
- test_cart_operations()
- test_order_creation()

# Scanner
- test_scan_online()
- test_scan_offline()
- test_sync_offline_scans()
```

---

## 📊 Déploiement Production

### Nginx Config (Exemple)
```nginx
server {
    listen 443 ssl http2;
    server_name eventflow.com;
    
    ssl_certificate /etc/ssl/certs/eventflow.crt;
    ssl_certificate_key /etc/ssl/private/eventflow.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    client_max_body_size 10M;
    
    location /static/ {
        alias /home/eventflow/staticfiles/;
        expires 30d;
    }
    
    location /media/ {
        alias /home/eventflow/media/;
        expires 7d;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Systemd Service (Gunicorn)
```ini
[Unit]
Description=EventFlow Gunicorn
After=network.target

[Service]
Type=notify
User=eventflow
WorkingDirectory=/home/eventflow/eventflow
ExecStart=/home/eventflow/venv/bin/gunicorn \
    --workers 4 \
    --worker-class sync \
    --bind 127.0.0.1:8000 \
    eventflow_core.wsgi:application

Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

### Celery Service
```ini
[Unit]
Description=EventFlow Celery Worker
After=network.target

[Service]
Type=forking
User=eventflow
WorkingDirectory=/home/eventflow/eventflow
ExecStart=/home/eventflow/venv/bin/celery \
    -A eventflow_core worker \
    --loglevel=info \
    --concurrency=4

Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Intégration Paiement**
   - Stripe / Paytech (Sénégal)
   - Webhook handling

2. **Email Templates**
   - Confirmation de commande
   - Billets PDF en attachment
   - Rappels avant événement

3. **Analytics**
   - Dashboard de ventes en temps réel
   - Rapports PDF téléchargeables

4. **Améliorations PWA**
   - Notifications push
   - Cache adaptatif

5. **Accessibilité**
   - WCAG 2.1 AA compliance
   - Dark mode

---

## 📞 Support & Maintenance

### Logs
```bash
# Django
tail -f logs/eventflow.log

# Gunicorn
journalctl -u eventflow -f

# Celery
journalctl -u eventflow-celery -f
```

### Backup PostgreSQL
```bash
pg_dump -U postgres eventflow_db > backup_$(date +%Y%m%d).sql
```

---

## 📄 License & Attributions

EventFlow © 2026

- Django 5.x - Web Framework
- PostgreSQL - Database
- HTMX - Frontend Interactivity
- Tailwind CSS - Styling
- html5-qrcode - QR Scanning

---

**Dernière mise à jour** : 07 Septembre 2026
**Version** : 1.0.0 (Production Ready)
