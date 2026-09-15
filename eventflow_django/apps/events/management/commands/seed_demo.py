from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import Organization, User
from apps.events.models import Event, EventAgent, TicketCategory


class Command(BaseCommand):
    help = "Crée une organisation, un organisateur, un agent et un événement de démonstration."

    def handle(self, *args, **options):
        org, _ = Organization.objects.get_or_create(name="Vibra Events", city="Cotonou")

        organizer, created = User.objects.get_or_create(
            username="organisateur",
            defaults={"role": User.Role.ORGANIZER, "organization": org, "email": "orga@eventflow.bj"},
        )
        if created:
            organizer.set_password("eventflow123")
            organizer.save()

        agent, created = User.objects.get_or_create(
            username="agent",
            defaults={"role": User.Role.AGENT, "organization": org, "email": "agent@eventflow.bj"},
        )
        if created:
            agent.set_password("eventflow123")
            agent.save()

        spectator, created = User.objects.get_or_create(
            username="spectateur",
            defaults={
                "role": User.Role.SPECTATOR,
                "email": "spectateur@eventflow.bj",
                "first_name": "Aïcha",
                "last_name": "Zannou",
                "sexe": User.Sexe.FEMME,
                "profession": "FONCTIONNAIRE",
            },
        )
        if created:
            spectator.set_password("eventflow123")
            spectator.save()

        event, _ = Event.objects.get_or_create(
            slug="afro-nation-cotonou",
            defaults={
                "organization": org,
                "title": "Afro Nation Cotonou",
                "description": (
                    "Trois scènes, une nuit. Afro Nation pose ses valises à Cotonou pour "
                    "une édition spéciale avec les plus grands noms de l'afrobeats et de "
                    "l'amapiano, entre la plage et la ville."
                ),
                "category": "Festival",
                "city": "Cotonou",
                "venue_name": "Plage de Fidjrossè",
                "address": "Route des Pêches, Fidjrossè, Cotonou",
                "starts_at": timezone.now() + timedelta(days=45),
                "ends_at": timezone.now() + timedelta(days=45, hours=8),
                "status": Event.Status.PUBLISHED,
            },
        )

        if not event.ticket_categories.exists():
            TicketCategory.objects.bulk_create(
                [
                    TicketCategory(event=event, name="Early Bird", unit_price=15000, quantity=300, quantity_sold=287),
                    TicketCategory(event=event, name="Standard", unit_price=25000, quantity=1200, quantity_sold=640),
                    TicketCategory(
                        event=event, name="VIP", description="Accès lounge + boissons incluses",
                        unit_price=60000, quantity=150, quantity_sold=52,
                    ),
                    TicketCategory(
                        event=event, name="Pack Famille", description="4 entrées Standard au même prix",
                        unit_price=90000, quantity=100, quantity_sold=18,
                        group_size=TicketCategory.GroupSize.GROUP_4,
                    ),
                ]
            )

        EventAgent.objects.get_or_create(event=event, agent=agent)

        self.stdout.write(self.style.SUCCESS(
            "Données de démo créées : organisateur/eventflow123, agent/eventflow123, "
            f"spectateur/eventflow123, événement « {event.title} »."
        ))
