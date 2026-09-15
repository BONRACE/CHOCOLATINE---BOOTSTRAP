from django import forms
from django.forms import formset_factory

from .choices import COUNTRY_CHOICES, PROFESSION_CHOICES, SEXE_CHOICES

INPUT = (
    "mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm "
    "focus:outline-none focus:ring-2 focus:ring-gold/50"
)


class ParticipantForm(forms.Form):
    """Informations du "visa" d'un participant — une par billet, y compris
    pour chaque personne d'un billet groupe (voir TicketCategory.group_size).
    Champ caché `ticket_category_id` pour rattacher le participant à la
    bonne catégorie de billet au moment de la création (voir
    apps/core/views.py::checkout)."""

    ticket_category_id = forms.CharField(widget=forms.HiddenInput)
    first_name = forms.CharField(
        label="Prénom", max_length=100,
        widget=forms.TextInput(attrs={"class": INPUT, "placeholder": "Prénom"}),
    )
    last_name = forms.CharField(
        label="Nom", max_length=100,
        widget=forms.TextInput(attrs={"class": INPUT, "placeholder": "Nom"}),
    )
    sexe = forms.ChoiceField(
        label="Sexe", choices=SEXE_CHOICES,
        widget=forms.Select(attrs={"class": INPUT}),
    )
    profession = forms.ChoiceField(
        label="Profession", choices=PROFESSION_CHOICES,
        widget=forms.Select(attrs={"class": INPUT}),
    )
    country = forms.ChoiceField(
        label="Pays", choices=COUNTRY_CHOICES,
        widget=forms.Select(attrs={"class": INPUT}),
    )
    city = forms.CharField(
        label="Ville", max_length=100,
        widget=forms.TextInput(attrs={"class": INPUT, "placeholder": "Ville de résidence"}),
    )
    photo = forms.ImageField(
        label="Photo", required=False,
        widget=forms.ClearableFileInput(attrs={"class": "mt-1.5 text-sm"}),
    )


ParticipantFormSet = formset_factory(ParticipantForm, extra=0)
