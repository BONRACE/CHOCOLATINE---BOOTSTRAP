import uuid

from django.conf import settings
from django.db import models
from django.urls import reverse


class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Brouillon"
        PUBLISHED = "PUBLISHED", "Publié"
        CANCELLED = "CANCELLED", "Annulé"
        ARCHIVED = "ARCHIVED", "Archivé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="events"
    )
    slug = models.SlugField(max_length=180, unique=True)
    title = models.CharField(max_length=180)
    description = models.TextField()
    category = models.CharField(max_length=60)  # Concert, Festival, Conférence, Sport…
    city = models.CharField(max_length=100)
    venue_name = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    cover_image = models.ImageField(upload_to="events/covers/", blank=True, null=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at"]
        indexes = [
            models.Index(fields=["status", "starts_at"]),
            models.Index(fields=["city", "category"]),
        ]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("core:event_detail", kwargs={"slug": self.slug})

    @property
    def min_price(self):
        agg = self.ticket_categories.aggregate(models.Min("unit_price"))
        return agg["unit_price__min"] or 0

    @property
    def fill_rate(self):
        totals = self.ticket_categories.aggregate(
            quota=models.Sum("quantity"), sold=models.Sum("quantity_sold")
        )
        quota = totals["quota"] or 0
        sold = totals["sold"] or 0
        return round((sold / quota) * 100) if quota else 0


class TicketCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="ticket_categories")
    name = models.CharField(max_length=80)  # VIP, Standard, Early Bird…
    description = models.CharField(max_length=255, blank=True)
    unit_price = models.PositiveIntegerField(help_text="Prix unitaire en FCFA")
    quantity = models.PositiveIntegerField(help_text="Jauge maximale dédiée")
    quantity_sold = models.PositiveIntegerField(default=0)
    sales_start = models.DateTimeField(blank=True, null=True)
    sales_end = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Catégorie de billet"
        verbose_name_plural = "Catégories de billets"

    def __str__(self):
        return f"{self.name} — {self.event.title}"

    @property
    def remaining(self):
        return max(self.quantity - self.quantity_sold, 0)

    @property
    def sold_out(self):
        return self.remaining <= 0


class EventAgent(models.Model):
    """Affectation d'un agent de contrôle à un événement précis."""

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="agents")
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assigned_events"
    )

    class Meta:
        unique_together = ("event", "agent")
