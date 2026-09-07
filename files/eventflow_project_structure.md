# EventFlow - Structure Complète du Projet Django

## Arborescence du Projet

```
eventflow/
├── eventflow_core/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   └── middleware.py
├── apps/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   ├── urls.py
│   │   └── utils.py
│   ├── events/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── signals.py
│   ├── tickets/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   ├── tasks.py
│   │   └── signals.py
│   └── scanner/
│       ├── __init__.py
│       ├── models.py
│       ├── views.py
│       ├── forms.py
│       ├── urls.py
│       ├── api.py
│       └── utils.py
├── templates/
│   ├── base.html
│   ├── core/
│   │   ├── index.html
│   │   ├── event_detail.html
│   │   └── components/
│   │       ├── event_card.html
│   │       ├── search_bar.html
│   │       └── filters.html
│   ├── tickets/
│   │   ├── checkout.html
│   │   ├── confirmation.html
│   │   └── order_summary.html
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── event_form.html
│   │   ├── event_manage.html
│   │   ├── participants_tab.html
│   │   ├── stats_tab.html
│   │   └── export_tab.html
│   └── scanner/
│       ├── login.html
│       ├── scan_interface.html
│       └── components/
│           ├── status_bar.html
│           └── feedback_modal.html
├── static/
│   ├── js/
│   │   ├── htmx.min.js
│   │   ├── service-worker.js
│   │   ├── scanner.js
│   │   ├── qrcode-scan.js
│   │   └── offline-sync.js
│   ├── css/
│   │   └── tailwind.css
│   ├── audio/
│   │   ├── success.mp3
│   │   └── error.mp3
│   └── manifest.json
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_views.py
│   ├── test_security.py
│   └── test_scanner.py
├── requirements.txt
├── manage.py
└── .env.example
```

## Fichiers de Configuration

### requirements.txt
```
Django==5.0.1
psycopg2-binary==2.9.9
djangorestframework==3.14.0
django-filter==24.1
django-cors-headers==4.3.1
python-decouple==3.8
cryptography==41.0.7
PyJWT==2.8.1
qrcode==7.4.2
Pillow==10.1.0
WeasyPrint==59.3
celery==5.3.4
redis==5.0.1
requests==2.31.0
python-dateutil==2.8.2
openpyxl==3.11.0
```

### .env.example
```
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_NAME=eventflow_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432

CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password
EMAIL_USE_TLS=True

JWT_SECRET_KEY=your-jwt-secret
HMAC_SECRET_KEY=your-hmac-secret
```

### manage.py
```python
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eventflow_core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
```
