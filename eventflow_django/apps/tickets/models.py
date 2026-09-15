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
    # Rattache la commande au compte spectateur connecté au moment de l'achat
    # (facultatif — le checkout invité reste possible sans compte). Permet
    # l'historique "Mes billets" (voir apps/accounts/views.py::my_tickets).
    buyer_user = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
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
    """Un billet nominatif individuel, scannable via un unique QR code signé.

    Chaque billet fait office de "visa" d'événement : il porte les
    informations d'identité de la personne qui y assiste (et non plus
    seulement de l'acheteur), pour un contrôle d'accès visuel à l'entrée —
    voir apps/tickets/services.py::generate_ticket_pdf et
    apps/scanner/views.py pour l'affichage au contrôle."""

    class Status(models.TextChoices):
        VALID = "VALID", "Valide"
        SCANNED = "SCANNED", "Scanné"
        CANCELLED = "CANCELLED", "Annulé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="tickets")
    ticket_category = models.ForeignKey(
        TicketCategory, on_delete=models.PROTECT, related_name="tickets", null=True
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.VALID)

    # Informations du "visa" — propres à la personne qui assiste à
    # l'événement, distinctes de l'acheteur (order.buyer_*) dans le cas
    # d'un billet groupe acheté pour d'autres personnes.
    holder_first_name = models.CharField("Prénom", max_length=100, blank=True)
    holder_last_name = models.CharField("Nom", max_length=100, blank=True)
    holder_sexe = models.CharField("Sexe", max_length=10, blank=True)
    holder_profession = models.CharField("Profession", max_length=40, blank=True)
    holder_country = models.CharField("Pays", max_length=100, blank=True)
    holder_city = models.CharField("Ville", max_length=100, blank=True)
    holder_photo = models.ImageField("Photo", upload_to="tickets/holders/", blank=True, null=True)

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

    @property
    def holder_full_name(self):
        name = f"{self.holder_first_name} {self.holder_last_name}".strip()
        return name or self.order.buyer_full_name

    def get_holder_profession_display_label(self):
        from .choices import PROFESSION_CHOICES

        return dict(PROFESSION_CHOICES).get(self.holder_profession, self.holder_profession)

    def get_holder_sexe_display_label(self):
        from .choices import SEXE_CHOICES

        return dict(SEXE_CHOICES).get(self.holder_sexe, self.holder_sexe)
