from django import forms
from django.contrib.auth.password_validation import validate_password

from .models import User

INPUT = (
    "mt-1.5 w-full rounded-lg border border-ivory/15 bg-forest-dark px-3.5 py-2.5 text-sm "
    "text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
)


class OrganizerSignUpForm(forms.Form):
    """Inscription d'un organisateur : crée son compte (identifiant propre)
    ET sa structure organisatrice — un organisateur doit obligatoirement
    passer par cette étape avant de pouvoir créer un événement (voir
    LOGIN_URL / login_required sur apps/events/views.py::event_create_step1)."""

    organization_name = forms.CharField(
        label="Nom de votre structure",
        max_length=150,
        widget=forms.TextInput(attrs={"class": INPUT, "placeholder": "Ex. Vibra Events"}),
    )
    full_name = forms.CharField(
        label="Nom complet",
        max_length=150,
        widget=forms.TextInput(attrs={"class": INPUT, "placeholder": "Votre nom"}),
    )
    username = forms.CharField(
        label="Identifiant",
        max_length=150,
        widget=forms.TextInput(attrs={"class": INPUT, "placeholder": "Choisissez un identifiant"}),
    )
    email = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(attrs={"class": INPUT, "placeholder": "vous@structure.com"}),
    )
    phone = forms.CharField(
        label="Téléphone",
        max_length=30,
        required=False,
        widget=forms.TextInput(attrs={"class": INPUT, "placeholder": "+229 01 XX XX XX XX"}),
    )
    password = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(attrs={"class": INPUT, "placeholder": "••••••••"}),
    )
    password_confirm = forms.CharField(
        label="Confirmer le mot de passe",
        widget=forms.PasswordInput(attrs={"class": INPUT, "placeholder": "••••••••"}),
    )

    def clean_username(self):
        username = self.cleaned_data["username"].strip()
        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError("Cet identifiant est déjà pris.")
        return username

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("Un compte existe déjà avec cet email.")
        return email

    def clean(self):
        cleaned = super().clean()
        password = cleaned.get("password")
        confirm = cleaned.get("password_confirm")
        if password and confirm and password != confirm:
            self.add_error("password_confirm", "Les deux mots de passe ne correspondent pas.")
        if password:
            try:
                validate_password(password)
            except forms.ValidationError as exc:
                self.add_error("password", exc)
        return cleaned
