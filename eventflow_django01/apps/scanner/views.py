import json

from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from apps.events.models import Event, EventAgent
from apps.tickets.models import Ticket
from apps.tickets.services import build_offline_manifest, verify_payload

from .models import ScanLog


def _agent_can_access(user, event_id):
    """Un agent ne peut contrôler que les événements qui lui sont affectés
    (voir events.EventAgent) ; un superutilisateur passe outre pour le
    support/debug."""
    if user.is_superuser:
        return True
    return EventAgent.objects.filter(event_id=event_id, agent=user).exists()


def agent_login(request):
    """3.1 — Connexion agent + sélection de l'événement à contrôler."""
    events = Event.objects.filter(status=Event.Status.PUBLISHED).order_by("starts_at")
    error = None

    if request.method == "POST":
        username = request.POST.get("username", "")
        password = request.POST.get("password", "")
        event_id = request.POST.get("event_id")
        user = authenticate(request, username=username, password=password)
        if user is None:
            error = "Identifiants incorrects."
        elif not (user.is_agent() or user.is_superuser):
            error = "Ce compte n'a pas le rôle agent d'accueil."
        elif not event_id:
            error = "Sélectionnez un événement."
        elif not _agent_can_access(user, event_id):
            error = "Vous n'êtes pas affecté à cet événement."
        else:
            login(request, user)
            return redirect("scanner:scan", event_id=event_id)

    return render(request, "scanner/login.html", {"events": events, "error": error})


@login_required
def scan_view(request, event_id):
    """3.2 — Interface principale de scan (caméra html5-qrcode, statut réseau,
    compteur). La logique offline (IndexedDB, Service Worker) est chargée par
    static/js/scanner.js et static/js/service-worker.js."""
    if not _agent_can_access(request.user, event_id):
        messages.error(request, "Vous n'êtes pas affecté à cet événement.")
        return redirect("scanner:login")
    event = get_object_or_404(Event, id=event_id)
    total = event.ticket_categories.aggregate(total=Sum("quantity_sold"))["total"] or 0
    scanned_count = event.scan_logs.filter(result=ScanLog.Result.VALID).count()
    return render(
        request,
        "scanner/scan.html",
        {"event": event, "total": total, "scanned_count": scanned_count},
    )


@login_required
def offline_manifest(request, event_id):
    """API consommée par le Service Worker au passage en ligne : télécharge
    la liste des billets valides + leur signature HMAC pré-calculée, stockée
    ensuite dans l'IndexedDB du navigateur pour la validation hors-ligne."""
    if not _agent_can_access(request.user, event_id):
        return JsonResponse({"detail": "Non autorisé pour cet événement."}, status=403)
    event = get_object_or_404(Event, id=event_id)
    return JsonResponse({"event_id": str(event.id), "tickets": build_offline_manifest(event)})


@login_required
@require_POST
def verify_scan(request):
    """API de vérification en ligne (mode connecté) : un seul point de vérité
    pour détecter les doublons entre agents/appareils. Reçoit le payload
    décodé du QR code et l'id de l'événement en cours de contrôle."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"result": "NOT_FOUND"}, status=400)

    payload = data.get("payload", {})
    event_id = data.get("event_id")
    if not event_id or not _agent_can_access(request.user, event_id):
        return JsonResponse({"result": "NOT_FOUND"}, status=403)
    valid, reason = verify_payload(payload, expected_event_id=event_id)

    ticket = None
    if valid:
        ticket = Ticket.objects.filter(id=payload["t_id"]).select_related(
            "order", "ticket_category"
        ).first()
        if ticket is None:
            reason = "NOT_FOUND"
        elif ticket.order.status != ticket.order.Status.PAID:
            reason = "NOT_FOUND"  # commande non payée — le billet n'a jamais été validé
        elif ticket.status == Ticket.Status.CANCELLED:
            reason = "CANCELLED_TICKET"
        elif ticket.status == Ticket.Status.SCANNED:
            reason = "ALREADY_SCANNED"
        else:
            ticket.status = Ticket.Status.SCANNED
            ticket.scanned_at = timezone.now()
            ticket.scanned_by = request.user
            ticket.save(update_fields=["status", "scanned_at", "scanned_by"])
            reason = "VALID"

    ScanLog.objects.create(
        ticket=ticket,
        event_id=event_id,
        agent=request.user,
        result=reason,
        scanned_at=timezone.now(),
        offline_id=data.get("offline_id") or None,
    )

    already_at = None
    if reason == "ALREADY_SCANNED" and ticket and ticket.scanned_at:
        already_at = timezone.localtime(ticket.scanned_at).strftime("%H:%M")

    # En contrôle d'accès, l'agent doit pouvoir vérifier visuellement
    # l'identité de la personne — le "visa" du billet (photo, profession,
    # type de billet) est donc renvoyé pour tout billet valide.
    holder = None
    if ticket and reason in ("VALID", "ALREADY_SCANNED"):
        holder = {
            "name": ticket.holder_full_name,
            "profession": ticket.get_holder_profession_display_label(),
            "category": ticket.ticket_category.name if ticket.ticket_category else "",
            "photo_url": ticket.holder_photo.url if ticket.holder_photo else None,
        }

    return JsonResponse({"result": reason, "holder": holder, "already_scanned_at": already_at})


@login_required
@require_POST
def sync_scans(request):
    """API de synchronisation par lot (`POST /scanner/api/sync/`), appelée
    par le bouton de synchronisation manuelle et par la synchronisation
    automatique en arrière-plan au retour du réseau (voir scanner.js)."""
    try:
        entries = json.loads(request.body).get("scans", [])
    except json.JSONDecodeError:
        return JsonResponse({"synced": 0}, status=400)

    synced = 0
    for entry in entries:
        offline_id = entry.get("offline_id")
        if not offline_id or ScanLog.objects.filter(offline_id=offline_id).exists():
            continue  # déjà synchronisé — on déduplique sur l'id local
        ticket = Ticket.objects.filter(id=entry.get("t_id")).first()
        result = entry.get("result", "NOT_FOUND")
        if ticket and result == "VALID" and ticket.status == Ticket.Status.VALID:
            ticket.status = Ticket.Status.SCANNED
            ticket.scanned_at = entry.get("scanned_at") or timezone.now()
            ticket.scanned_by = request.user
            ticket.save(update_fields=["status", "scanned_at", "scanned_by"])
        ScanLog.objects.create(
            ticket=ticket,
            event_id=entry.get("e_id"),
            agent=request.user,
            result=result,
            scanned_at=entry.get("scanned_at") or timezone.now(),
            offline_id=offline_id,
        )
        synced += 1

    return JsonResponse({"synced": synced})
