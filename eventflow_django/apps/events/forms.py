from django import forms
from django.forms import modelformset_factory

from .models import Event, TicketCategory

INPUT = (
    "mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm "
    "focus:outline-none focus:ring-2 focus:ring-gold/50"
)

CATEGORY_CHOICES = [
    ("Concert", "Concert"),
    ("Festival", "Festival"),
    ("Conférence", "Conférence"),
    ("Sport", "Sport"),
    ("Théâtre", "Théâtre"),
    ("Nightlife", "Nightlife"),
]


class EventGeneralInfoForm(forms.ModelForm):
    """Étape 1 du formulaire multi-étapes : informations générales."""

    category = forms.ChoiceField(choices=CATEGORY_CHOICES, widget=forms.Select(attrs={"class": INPUT}))

    class Meta:
        model = Event
        fields = [
            "title", "description", "category", "city", "venue_name",
            "address", "cover_image", "starts_at", "ends_at",
        ]
        widgets = {
            "title": forms.TextInput(attrs={"class": INPUT, "placeholder": "Ex. Nuit Afrobeat"}),
            "description": forms.Textarea(attrs={"class": INPUT, "rows": 4}),
            "city": forms.TextInput(attrs={"class": INPUT}),
            "venue_name": forms.TextInput(attrs={"class": INPUT}),
            "address": forms.TextInput(attrs={"class": INPUT}),
            "cover_image": forms.ClearableFileInput(attrs={"class": "mt-1.5 text-sm"}),
            "starts_at": forms.DateTimeInput(attrs={"class": INPUT, "type": "datetime-local"}),
            "ends_at": forms.DateTimeInput(attrs={"class": INPUT, "type": "datetime-local"}),
        }


class TicketCategoryForm(forms.ModelForm):
    class Meta:
        model = TicketCategory
        fields = ["name", "description", "unit_price", "quantity"]
        widgets = {
            "name": forms.TextInput(attrs={"class": INPUT, "placeholder": "VIP"}),
            "description": forms.TextInput(attrs={"class": INPUT, "placeholder": "Optionnel"}),
            "unit_price": forms.NumberInput(attrs={"class": INPUT, "placeholder": "10000"}),
            "quantity": forms.NumberInput(attrs={"class": INPUT, "placeholder": "200"}),
        }


# Formset dynamique pour ajouter plusieurs catégories de billets à la volée
# (étape 2 du formulaire — voir cahier des charges §B.2).
TicketCategoryFormSet = modelformset_factory(
    TicketCategory,
    form=TicketCategoryForm,
    extra=1,
    can_delete=True,
)
