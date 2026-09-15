import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class Organization(models.Model):
    """Structure organisatrice d'événements (ex. un collectif, une entreprise)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    city = models.CharField(max_length=100, blank=True)
    logo = models.ImageField(upload_to="organizations/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Organisation"
        verbose_name_plural = "Organisations"

    def __str__(self):
        return self.name


class User(AbstractUser):
    """Utilisateur étendu : un spectateur achète des billets et retrouve son
    historique, un organisateur gère ses événements, un agent scanne les
    billets à l'entrée. Le champ `role` pilote les permissions d'accès aux
    vues du dashboard et du scanner (voir apps/events/views.py, apps/scanner/views.py)."""

    class Role(models.TextChoices):
        SPECTATOR = "SPECTATOR", "Spectateur"
        ORGANIZER = "ORGANIZER", "Organisateur"
        AGENT = "AGENT", "Agent d'accueil"
        SUPERADMIN = "SUPERADMIN", "Super administrateur"

    class Sexe(models.TextChoices):
        FEMME = "F", "Femme"
        HOMME = "H", "Homme"
        AUTRE = "AUTRE", "Autre / préfère ne pas préciser"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SPECTATOR)
    phone = models.CharField(max_length=30, blank=True)
    sexe = models.CharField(max_length=10, choices=Sexe.choices, blank=True)
    # Profession partagée avec les billets (apps/tickets/choices.py) : un
    # spectateur connecté peut ainsi pré-remplir ses billets personnels avec
    # les mêmes informations que sur son compte.
    profession = models.CharField(max_length=40, blank=True)
    photo = models.ImageField(upload_to="accounts/photos/", blank=True, null=True)
    organization = models.ForeignKey(
        Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name="users"
    )

    def is_agent(self):
        return self.role == self.Role.AGENT

    def is_organizer(self):
        return self.role == self.Role.ORGANIZER

    def is_spectator(self):
        return self.role == self.Role.SPECTATOR

    def get_profession_display_label(self):
        from apps.tickets.choices import PROFESSION_CHOICES

        return dict(PROFESSION_CHOICES).get(self.profession, self.profession)
