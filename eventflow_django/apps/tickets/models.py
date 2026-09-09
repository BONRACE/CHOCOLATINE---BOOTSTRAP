import uuid

from django.db import models

from apps.events.models import Event, TicketCategory


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "En attente de paiement"
        PAID = "PAID", "Payée"
        FAILED = "FAILED", "Échouée"
        REFUNDED = "REFUNDED", "Remboursée"
        CANCELLED = "CANCELLED", "Annulée"

    class PaymentMethod(models.TextChoices):
        CARD = "CARD", "Carte bancaire"
        MTN_MOMO = "MTN_MOMO", "MTN Mobile Money"
        MOOV_MONEY = "MOOV_MONEY", "Moov Money"
        ORANGE_MONEY = "ORANGE_MONEY", "Orange Money"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="orders")
    buyer_full_name = models.CharField(max_length=150)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=30)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, blank=True, null=True
    )
    payment_ref = models.CharField(max_length=120, blank=True)
    total_amount = models.PositiveIntegerField(help_text="Montant total en FCFA")
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=["event", "status"]),
            models.Index(fields=["buyer_email"]),
        ]

    def __str__(self):
        return f"Commande {self.id} — {self.buyer_full_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    ticket_category = models.ForeignKey(TicketCategory, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.PositiveIntegerField(help_text="Prix figé au moment de l'achat")

    def __str__(self):
        return f"{self.quantity} × {self.ticket_category.name}"


class Ticket(models.Model):
    """Un billet nominatif individuel, scannable via un unique QR code signé."""

    class Status(models.TextChoices):
        VALID = "VALID", "Valide"
        SCANNED = "SCANNED", "Scanné"
        CANCELLED = "CANCELLED", "Annulé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="tickets")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.VALID)
    holder_name = models.CharField(max_length=150, blank=True)
    scanned_at = models.DateTimeField(blank=True, null=True)
    scanned_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, blank=True, null=True, related_name="scans"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["status"])]

    def __str__(self):
        return f"Billet {self.id}"

    @property
    def event(self):
        return self.order.event
