import csv
from functools import wraps

from django.contrib import messages
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncHour
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from apps.scanner.models import ScanLog
from apps.tickets.models import Order, Ticket

from .forms import EventGeneralInfoForm, TicketCategoryFormSet
from .models import Event, TicketCategory


def organizer_required(view_func):
    """Comme @login_required, mais exige en plus le rôle organisateur — un
    compte spectateur authentifié ne doit pas pouvoir accéder au dashboard
    ni créer d'événement (il n'a pas d'Organization rattachée)."""

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(f"/accounts/login/?next={request.path}")
        if not (request.user.is_organizer() or request.user.is_superuser):
            messages.error(request, "Cette page est réservée aux comptes organisateur.")
            return redirect("accounts:signup_organizer")
        return view_func(request, *args, **kwargs)

    return wrapper


@organizer_required
def dashboard(request):
    """2.1 — Dashboard analytique : KPIs + tableau des événements."""
    events = Event.objects.filter(organization=request.user.organization).order_by("-starts_at")

    paid_orders = Order.objects.filter(event__in=events, status=Order.Status.PAID)
    total_revenue = paid_orders.aggregate(total=Sum("total_amount"))["total"] or 0
    total_sold = TicketCategory.objects.filter(event__in=events).aggregate(
        total=Sum("quantity_sold")
    )["total"] or 0

    fill_rates = [e.fill_rate for e in events] or [0]
    avg_fill_rate = round(sum(fill_rates) / len(fill_rates))

    context = {
        "events": events,
        "total_revenue": total_revenue,
        "total_sold": total_sold,
        "avg_fill_rate": avg_fill_rate,
    }
    return render(request, "events/dashboard.html", context)


@organizer_required
def event_create_step1(request):
    """2.2 — Étape 1/2 du formulaire multi-étapes : informations générales."""
    if request.method == "POST":
        form = EventGeneralInfoForm(request.POST, request.FILES)
        if form.is_valid():
            event = form.save(commit=False)
            event.organization = request.user.organization
            event.status = Event.Status.DRAFT
            event.slug = _unique_slug(event.title)
            event.save()
            return redirect("events:event_create_step2", event_id=event.id)
    else:
        form = EventGeneralInfoForm()
    return render(request, "events/event_form_step1.html", {"form": form})


def _unique_slug(title):
    from django.utils.text import slugify

    base = slugify(title)[:170]
    slug = base
    n = 1
    while Event.objects.filter(slug=slug).exists():
        n += 1
        slug = f"{base}-{n}"
    return slug


@organizer_required
def event_create_step2(request, event_id):
    """2.2 — Étape 2/2 : formset dynamique des catégories de billets."""
    event = get_object_or_404(Event, id=event_id, organization=request.user.organization)
    queryset = TicketCategory.objects.filter(event=event)

    if request.method == "POST":
        formset = TicketCategoryFormSet(request.POST, queryset=queryset, prefix="tc")
        if formset.is_valid():
            instances = formset.save(commit=False)
            for instance in instances:
                instance.event = event
                instance.save()
            for obj in formset.deleted_objects:
                obj.delete()
            if "publish" in request.POST:
                event.status = Event.Status.PUBLISHED
                event.save(update_fields=["status"])
                return redirect("events:dashboard")
            # "Enregistrer" seul : on reste sur l'étape 2 pour permettre
            # d'ajouter d'autres catégories (le formset se recharge avec
            # une nouvelle ligne vide grâce à `extra=1`).
            return redirect("events:event_create_step2", event_id=event.id)
    else:
        formset = TicketCategoryFormSet(queryset=queryset, prefix="tc")

    return render(request, "events/event_form_step2.html", {"event": event, "formset": formset})


@organizer_required
def event_manage(request, event_id):
    """2.3 — Gestion d'un événement : participants / statistiques / export."""
    event = get_object_or_404(Event, id=event_id, organization=request.user.organization)
    tab = request.GET.get("tab", "participants")
    context = {"event": event, "tab": tab}
    if tab == "stats":
        context["hourly"] = _hourly_scan_counts(event)
    return render(request, "events/event_manage.html", context)


def _participant_status(ticket):
    if ticket.status == Ticket.Status.SCANNED:
        return "Scanné"
    if ticket.status == Ticket.Status.CANCELLED:
        return "Annulé"
    return "Payé"


def _participants_queryset(event, request):
    tickets = (
        Ticket.objects.filter(order__event=event, order__status=Order.Status.PAID)
        .select_related("order", "ticket_category")
        .order_by("-created_at")
    )
    query = request.GET.get("q", "").strip()
    if query:
        tickets = tickets.filter(
            Q(holder_first_name__icontains=query)
            | Q(holder_last_name__icontains=query)
            | Q(order__buyer_full_name__icontains=query)
        )
    status = request.GET.get("status", "").strip()
    if status:
        mapping = {"Payé": Ticket.Status.VALID, "Scanné": Ticket.Status.SCANNED, "Annulé": Ticket.Status.CANCELLED}
        if status in mapping:
            tickets = tickets.filter(status=mapping[status])
    return tickets


@organizer_required
def participants_table(request, event_id):
    """Partiel HTMX : table des participants, filtrée par recherche/statut
    (voir templates/events/_participants_table.html)."""
    event = get_object_or_404(Event, id=event_id, organization=request.user.organization)
    tickets = _participants_queryset(event, request)
    rows = [
        {
            "ticket": t,
            "name": t.holder_full_name,
            "category": t.ticket_category.name if t.ticket_category else "—",
            "status": _participant_status(t),
        }
        for t in tickets
    ]
    return render(request, "events/_participants_table.html", {"rows": rows})


def _hourly_scan_counts(event):
    counts = (
        ScanLog.objects.filter(event=event, result=ScanLog.Result.VALID)
        .annotate(hour=TruncHour("scanned_at"))
        .values("hour")
        .annotate(total=Count("id"))
        .order_by("hour")
    )
    points = list(counts)
    max_total = max((p["total"] for p in points), default=0)
    for p in points:
        p["bar_height"] = round((p["total"] / max_total) * 100) if max_total else 0
    return points


@organizer_required
def export_participants_csv(request, event_id):
    """2.3, onglet Export — génère un CSV à la volée."""
    event = get_object_or_404(Event, id=event_id, organization=request.user.organization)
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="participants-{event.slug}.csv"'
    writer = csv.writer(response)
    writer.writerow([
        "Nom", "Profession", "Ville", "Pays", "Email acheteur", "Téléphone acheteur",
        "Catégorie", "Statut", "Billet ID",
    ])
    tickets = (
        Ticket.objects.filter(order__event=event, order__status=Order.Status.PAID)
        .select_related("order", "ticket_category")
    )
    for t in tickets:
        writer.writerow(
            [
                t.holder_full_name,
                t.get_holder_profession_display_label(),
                t.holder_city,
                t.holder_country,
                t.order.buyer_email,
                t.order.buyer_phone,
                t.ticket_category.name if t.ticket_category else "",
                _participant_status(t),
                str(t.id),
            ]
        )
    return response
