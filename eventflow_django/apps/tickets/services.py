"""
Sécurité des QR codes (signature HMAC-SHA256) + génération QR/PDF.

Payload du QR code : JSON {"t_id": "<uuid billet>", "e_id": "<uuid événement>", "sig": "<hmac>"}.
La signature couvre `t_id` et `e_id` avec `settings.SECRET_KEY` comme clé : un agent
peut donc vérifier un billet **hors-ligne**, sans appel réseau, du moment qu'il a
téléchargé le manifeste de billets (voir apps/scanner/views.py) — la même clé n'est
elle-même jamais envoyée à l'app scanner : c'est le manifeste de `sig` déjà calculés
côté serveur qui est distribué (voir `build_offline_manifest`).
"""

import hashlib
import hmac
import io
import json

import qrcode
from django.conf import settings
from reportlab.lib.pagesizes import A6
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def _signature(ticket_id: str, event_id: str) -> str:
    message = f"{ticket_id}:{event_id}".encode()
    return hmac.new(settings.SECRET_KEY.encode(), message, hashlib.sha256).hexdigest()


def sign_ticket(ticket) -> dict:
    """Construit le payload signé pour un billet donné."""
    t_id, e_id = str(ticket.id), str(ticket.event.id)
    return {"t_id": t_id, "e_id": e_id, "sig": _signature(t_id, e_id)}


def verify_payload(payload: dict, expected_event_id: str | None = None) -> tuple[bool, str]:
    """Vérifie la signature d'un payload décodé depuis un QR code.

    Retourne (valide, motif_erreur). Utilisable côté serveur (vue Django) et
    sert de référence pour l'équivalent JavaScript embarqué dans le scanner
    (static/js/scanner.js), qui reproduit le même calcul HMAC-SHA256 avec la
    liste de signatures pré-calculées du manifeste offline.
    """
    t_id = payload.get("t_id")
    e_id = payload.get("e_id")
    sig = payload.get("sig")
    if not (t_id and e_id and sig):
        return False, "NOT_FOUND"
    expected = _signature(t_id, e_id)
    if not hmac.compare_digest(expected, sig):
        return False, "NOT_FOUND"
    if expected_event_id and e_id != str(expected_event_id):
        return False, "WRONG_EVENT"
    return True, "VALID"


def build_offline_manifest(event) -> list[dict]:
    """Génère la liste des billets valides d'un événement, avec leur signature
    déjà calculée, pour téléchargement dans l'IndexedDB de l'app scanner —
    c'est ce manifeste qui permet la validation hors-ligne."""
    tickets = event.orders.filter(status="PAID").values_list("tickets__id", flat=True)
    manifest = []
    for ticket_id in tickets:
        if ticket_id is None:
            continue
        manifest.append(
            {
                "t_id": str(ticket_id),
                "e_id": str(event.id),
                "sig": _signature(str(ticket_id), str(event.id)),
            }
        )
    return manifest


def finalize_paid_order(order):
    """Point d'entrée unique appelé une fois le paiement confirmé — que ce
    soit immédiatement en mode démo (voir apps/core/views.py::checkout) ou
    depuis un webhook Stripe/CinetPay/FedaPay en production (voir
    apps/tickets/views.py). Crée les billets nominatifs, incrémente les
    compteurs de vente, puis envoie l'email de confirmation.

    Idempotent : si l'commande a déjà des billets (webhook rejoué), ne
    recrée rien.
    """
    from django.utils import timezone

    if order.status == order.Status.PAID and order.tickets.exists():
        return  # déjà finalisée — évite les doublons si le webhook est rejoué

    order.status = order.Status.PAID
    order.paid_at = timezone.now()
    order.save(update_fields=["status", "paid_at"])

    for item in order.items.select_related("ticket_category"):
        item.ticket_category.quantity_sold += item.quantity
        item.ticket_category.save(update_fields=["quantity_sold"])
        for _ in range(item.quantity):
            order.tickets.create(holder_name=order.buyer_full_name)

    send_order_confirmation_email(order)


def send_order_confirmation_email(order):
    """Envoie l'email de confirmation avec le lien vers les billets.
    `EMAIL_BACKEND` est en mode console par défaut en développement (voir
    .env.example) — les emails s'affichent alors dans les logs du serveur."""
    from django.conf import settings
    from django.core.mail import send_mail
    from django.urls import reverse

    try:
        confirmation_path = reverse("core:confirmation", kwargs={"order_uuid": order.id})
    except Exception:
        confirmation_path = f"/tickets/confirmation/{order.id}/"

    site_url = getattr(settings, "SITE_URL", "http://localhost:8000")
    send_mail(
        subject=f"Votre billet EventFlow — {order.event.title}",
        message=(
            f"Bonjour {order.buyer_full_name},\n\n"
            f"Votre commande pour « {order.event.title} » est confirmée.\n"
            f"Retrouvez vos billets ici : {site_url}{confirmation_path}\n\n"
            "À bientôt,\nL'équipe EventFlow"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.buyer_email],
        fail_silently=True,
    )


def generate_qr_png(payload: dict) -> bytes:
    """Génère l'image PNG du QR code encodant le payload signé."""
    img = qrcode.make(json.dumps(payload), border=1)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def generate_ticket_pdf(ticket) -> bytes:
    """Génère un billet PDF téléchargeable (format A6, un billet = une page)
    avec ReportLab, conformément à la stack déjà en place pour la génération
    de documents (cf. autres projets)."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A6)
    width, height = A6

    order = ticket.order
    event = order.event

    c.setFillColorRGB(0.043, 0.290, 0.196)  # #0B4A32
    c.rect(0, height - 40 * mm, width, 40 * mm, fill=True, stroke=False)
    c.setFillColorRGB(0.965, 0.949, 0.906)  # #F6F2E7
    c.setFont("Helvetica-Bold", 14)
    c.drawString(8 * mm, height - 14 * mm, event.title[:34])
    c.setFont("Helvetica", 9)
    c.drawString(8 * mm, height - 22 * mm, f"{event.venue_name}, {event.city}")
    c.drawString(8 * mm, height - 28 * mm, event.starts_at.strftime("%d %B %Y — %H:%M"))

    qr_bytes = generate_qr_png(sign_ticket(ticket))
    from reportlab.lib.utils import ImageReader

    qr_img = ImageReader(io.BytesIO(qr_bytes))
    qr_size = 45 * mm
    c.drawImage(
        qr_img,
        (width - qr_size) / 2,
        height - 40 * mm - qr_size - 8 * mm,
        qr_size,
        qr_size,
    )

    c.setFillColorRGB(0.07, 0.14, 0.11)
    c.setFont("Courier-Bold", 11)
    code = f"EVF-{str(ticket.id)[-6:].upper()}"
    c.drawCentredString(width / 2, 10 * mm, code)

    c.showPage()
    c.save()
    return buf.getvalue()
