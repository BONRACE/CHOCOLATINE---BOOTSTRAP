"""
Webhooks de paiement — reçoivent la confirmation asynchrone des
fournisseurs (Stripe, CinetPay, FedaPay) et finalisent la commande
correspondante via `finalize_paid_order` (voir apps/tickets/services.py).

Ces vues sont volontairement minimales : chaque fournisseur a son propre
format de payload et son propre mécanisme de vérification de signature.
Le TODO de chaque fonction indique précisément quoi brancher.
"""
import json

from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import Order
from .services import finalize_paid_order


@csrf_exempt  # les webhooks sont appelés par le serveur du fournisseur, pas par un navigateur —
              # la protection vient de la vérification de signature ci-dessous, pas du CSRF Django
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.headers.get("Stripe-Signature", "")

    # TODO production : vérifier la signature avec `stripe.Webhook.construct_event`
    # et `settings.STRIPE_WEBHOOK_SECRET`, plutôt que de faire confiance au payload brut.
    try:
        event = json.loads(payload)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("payload invalide")

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = session.get("client_reference_id") or session.get("metadata", {}).get("order_id")
        order = Order.objects.filter(id=order_id).first()
        if order:
            order.payment_ref = session.get("payment_intent", "")
            order.save(update_fields=["payment_ref"])
            finalize_paid_order(order)

    return HttpResponse(status=200)


@csrf_exempt
@require_POST
def cinetpay_webhook(request):
    # TODO production : vérifier la notification via l'API "Check Payment Status"
    # de CinetPay (le webhook seul ne fait jamais foi — toujours revérifier
    # côté serveur avec CINETPAY_API_KEY + CINETPAY_SITE_ID avant de finaliser).
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("payload invalide")

    order = Order.objects.filter(id=data.get("cpm_custom")).first()
    if order and data.get("cpm_trans_status") == "ACCEPTED":
        order.payment_ref = data.get("cpm_trans_id", "")
        order.save(update_fields=["payment_ref"])
        finalize_paid_order(order)

    return HttpResponse(status=200)


@csrf_exempt
@require_POST
def fedapay_webhook(request):
    # TODO production : vérifier la signature `x-fedapay-signature` avec
    # le secret de webhook FedaPay avant de faire confiance au payload.
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("payload invalide")

    entity = data.get("entity", {})
    order = Order.objects.filter(id=entity.get("metadata", {}).get("order_id")).first()
    if order and data.get("name") == "transaction.approved":
        order.payment_ref = str(entity.get("id", ""))
        order.save(update_fields=["payment_ref"])
        finalize_paid_order(order)

    return HttpResponse(status=200)
