import uuid

from django.contrib import messages
from django.http import FileResponse
from django.shortcuts import get_object_or_404, redirect, render

from apps.events.models import Event
from apps.tickets.forms import ParticipantFormSet
from apps.tickets.models import Order, OrderItem, Ticket
from apps.tickets.services import (
    finalize_paid_order,
    generate_qr_png,
    generate_ticket_pdf,
    sign_ticket,
)

from .forms import GuestCheckoutForm

CATEGORIES = ["Concert", "Festival", "Conférence", "Sport", "Théâtre", "Nightlife"]


def _published_events():
    return (
        Event.objects.filter(status=Event.Status.PUBLISHED)
        .select_related("organization")
        .prefetch_related("ticket_categories")
    )


def _filtered_events(request):
    qs = _published_events()
    query = request.GET.get("q", "").strip()
    category = request.GET.get("category", "").strip()
    city = request.GET.get("city", "").strip()
    if query:
        from django.db.models import Q

        qs = qs.filter(
            Q(title__icontains=query)
            | Q(venue_name__icontains=query)
            | Q(city__icontains=query)
        )
    if category:
        qs = qs.filter(category=category)
    if city:
        qs = qs.filter(city=city)
    return qs


def home(request):
    """1.1 — Accueil & catalogue. La grille est rechargée en HTMX (voir
    `event_grid`) sur la saisie de recherche et le changement de filtres."""
    events = _filtered_events(request)
    cities = _published_events().values_list("city", flat=True).distinct()
    context = {
        "events": events,
        "categories": CATEGORIES,
        "cities": sorted(set(cities)),
        "active_category": request.GET.get("category", ""),
        "active_city": request.GET.get("city", ""),
        "query": request.GET.get("q", ""),
    }
    return render(request, "core/home.html", context)


def event_grid(request):
    """Partiel HTMX renvoyé sur `hx-get` depuis la barre de recherche et les
    filtres de la page d'accueil (voir templates/core/home.html)."""
    events = _filtered_events(request)
    return render(request, "core/_event_grid.html", {"events": events})


def event_detail(request, slug):
    """1.2 — Détail événement, avec widget d'achat recalculé en HTMX."""
    event = get_object_or_404(
        Event.objects.prefetch_related("ticket_categories"), slug=slug, status=Event.Status.PUBLISHED
    )
    return render(request, "core/event_detail.html", {"event": event})


def _parse_quantities(request, event):
    """Lit les quantités `qty_<category_id>` postées par le widget d'achat."""
    quantities = {}
    for tc in event.ticket_categories.all():
        raw = request.POST.get(f"qty_{tc.id}") or request.GET.get(f"qty_{tc.id}", "0")
        try:
            qty = max(0, min(int(raw or 0), tc.remaining))
        except ValueError:
            qty = 0
        if qty > 0:
            quantities[str(tc.id)] = qty
    return quantities


def recalculate_cart(request, slug):
    """Partiel HTMX : recalcule le sous-total côté serveur sans rechargement
    complet, à chaque changement de quantité sur le widget d'achat."""
    event = get_object_or_404(Event, slug=slug, status=Event.Status.PUBLISHED)
    quantities = _parse_quantities(request, event)
    categories = list(event.ticket_categories.all())
    lines = [
        {"category": tc, "qty": quantities.get(str(tc.id), 0)}
        for tc in categories
    ]
    subtotal = sum(line["qty"] * line["category"].unit_price for line in lines)
    total_selected = sum(line["qty"] for line in lines)
    total_participants = sum(line["qty"] * line["category"].group_size for line in lines)
    return render(
        request,
        "core/_ticket_summary.html",
        {
            "event": event,
            "lines": lines,
            "subtotal": subtotal,
            "total_selected": total_selected,
            "total_participants": total_participants,
        },
    )


def start_checkout(request, slug):
    """Valide la sélection de billets et ouvre un panier éphémère en session,
    identifié par `cart_id` — conforme à la route `/checkout/<cart_id>/` du
    cahier des charges, sans persister de commande tant qu'elle n'est pas
    payée."""
    event = get_object_or_404(Event, slug=slug, status=Event.Status.PUBLISHED)
    if request.method != "POST":
        return redirect("core:event_detail", slug=slug)

    quantities = _parse_quantities(request, event)
    if not quantities:
        messages.error(request, "Sélectionnez au moins un billet avant de continuer.")
        return redirect("core:event_detail", slug=slug)

    cart_id = str(uuid.uuid4())
    carts = request.session.get("carts", {})
    carts[cart_id] = {"event_id": str(event.id), "quantities": quantities}
    request.session["carts"] = carts
    request.session.modified = True
    return redirect("core:checkout", cart_id=cart_id)


def _participant_slots(lines):
    """Une "unité" achetée dans une catégorie groupe compte pour
    `group_size` participants : on construit ici une entrée de formset par
    participant réel, chacune rattachée à sa catégorie via un champ caché
    (voir apps/tickets/forms.py::ParticipantForm)."""
    slots = []
    for line in lines:
        category = line["category"]
        for _ in range(line["qty"]):
            for _ in range(category.group_size):
                slots.append({"ticket_category_id": str(category.id)})
    return slots


def checkout(request, cart_id):
    """1.3 — Checkout invité (aucun compte requis) : informations de "visa"
    de chaque participant (nom, profession, pays/ville, photo) + choix du
    moyen de paiement (carte, MTN/Moov/Orange Money)."""
    cart = request.session.get("carts", {}).get(cart_id)
    if not cart:
        messages.error(request, "Votre panier a expiré, merci de resélectionner vos billets.")
        return redirect("core:home")

    event = get_object_or_404(Event, id=cart["event_id"])
    categories = {str(tc.id): tc for tc in event.ticket_categories.all()}
    lines = [
        {"category": categories[cid], "qty": qty, "line_total": qty * categories[cid].unit_price}
        for cid, qty in cart["quantities"].items()
        if cid in categories
    ]
    total = sum(line["qty"] * line["category"].unit_price for line in lines)
    slots_initial = _participant_slots(lines)

    if request.method == "POST":
        form = GuestCheckoutForm(request.POST)
        formset = ParticipantFormSet(request.POST, request.FILES, initial=slots_initial, prefix="participant")
        if form.is_valid() and formset.is_valid():
            order = Order.objects.create(
                event=event,
                buyer_full_name=form.cleaned_data["full_name"],
                buyer_email=form.cleaned_data["email"],
                buyer_phone=form.cleaned_data["phone"],
                payment_method=form.cleaned_data["payment_method"],
                total_amount=total,
                status=Order.Status.PENDING,
            )
            for line in lines:
                OrderItem.objects.create(
                    order=order,
                    ticket_category=line["category"],
                    quantity=line["qty"],
                    unit_price=line["category"].unit_price,
                )
            for participant in formset.cleaned_data:
                category = categories.get(participant["ticket_category_id"])
                Ticket.objects.create(
                    order=order,
                    ticket_category=category,
                    holder_first_name=participant["first_name"],
                    holder_last_name=participant["last_name"],
                    holder_profession=participant["profession"],
                    holder_country=participant["country"],
                    holder_city=participant["city"],
                    holder_photo=participant.get("photo"),
                )

            # Démo : paiement confirmé immédiatement, sans passerelle réelle.
            # En production, l'appel ci-dessous serait déclenché par le
            # webhook Stripe/CinetPay/FedaPay (voir apps/tickets/views.py),
            # une fois le paiement effectivement confirmé par le fournisseur —
            # la commande resterait PENDING jusque-là, et cette redirection
            # pointerait vers la page du fournisseur de paiement plutôt que
            # vers la confirmation.
            finalize_paid_order(order)

            del request.session["carts"][cart_id]
            request.session.modified = True
            return redirect("core:confirmation", order_uuid=order.id)
    else:
        form = GuestCheckoutForm()
        formset = ParticipantFormSet(initial=slots_initial, prefix="participant")

    # Étiquette de catégorie pour chaque bloc participant du formset (affichage
    # uniquement — le rattachement réel se fait via le champ caché du formulaire).
    participants = [
        {"form": pform, "category": categories.get(pform["ticket_category_id"].value())}
        for pform in formset.forms
    ]

    return render(
        request,
        "core/checkout.html",
        {
            "form": form,
            "formset": formset,
            "participants": participants,
            "event": event,
            "lines": lines,
            "total": total,
            "cart_id": cart_id,
        },
    )


def confirmation(request, order_uuid):
    """1.4 — Confirmation de commande + génération du/des billet(s) QR."""
    order = get_object_or_404(
        Order.objects.select_related("event").prefetch_related("tickets"), id=order_uuid
    )
    tickets_with_qr = []
    for ticket in order.tickets.all():
        payload = sign_ticket(ticket)
        tickets_with_qr.append({"ticket": ticket, "payload": payload})
    return render(request, "core/confirmation.html", {"order": order, "tickets": tickets_with_qr})


def ticket_pdf(request, ticket_id):
    """Génère et sert le billet PDF (WeasyPrint/ReportLab) à la volée."""
    ticket = get_object_or_404(Ticket, id=ticket_id)
    pdf_bytes = generate_ticket_pdf(ticket)
    from io import BytesIO

    return FileResponse(
        BytesIO(pdf_bytes),
        as_attachment=True,
        filename=f"billet-{str(ticket.id)[:8]}.pdf",
        content_type="application/pdf",
    )


def ticket_qr_png(request, ticket_id):
    """Sert l'image PNG du QR code d'un billet (utilisée en <img> dans le
    template de confirmation, générée à la volée plutôt que stockée)."""
    ticket = get_object_or_404(Ticket, id=ticket_id)
    from django.http import HttpResponse

    return HttpResponse(generate_qr_png(sign_ticket(ticket)), content_type="image/png")
