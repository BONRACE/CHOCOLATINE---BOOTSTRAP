import uuid

from django.db import models

from apps.events.models import Event
from apps.tickets.models import Ticket


class ScanLog(models.Model):
    """Traçabilité de chaque tentative de scan, y compris celles effectuées
    hors-ligne puis synchronisées (voir `offline_id` pour la déduplication)."""

    class Result(models.TextChoices):
        VALID = "VALID", "Valide"
        ALREADY_SCANNED = "ALREADY_SCANNED", "Déjà scanné"
        NOT_FOUND = "NOT_FOUND", "Billet inexistant"
        WRONG_EVENT = "WRONG_EVENT", "Mauvais événement"
        CANCELLED_TICKET = "CANCELLED_TICKET", "Billet annulé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(
        Ticket, on_delete=models.SET_NULL, blank=True, null=True, related_name="scan_logs"
    )
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="scan_logs")
    agent = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="scan_logs")
    result = models.CharField(max_length=20, choices=Result.choices)
    scanned_at = models.DateTimeField()
    # Id généré côté client (IndexedDB) lors d'un scan hors-ligne, pour dédupliquer
    # si le lot de synchronisation est rejoué (voir apps/scanner/views.py::sync_scans).
    offline_id = models.CharField(max_length=64, unique=True, blank=True, null=True)
    synced_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["event", "scanned_at"])]

    def __str__(self):
        return f"{self.result} — {self.event.title}"
