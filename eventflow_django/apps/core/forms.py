from django import forms

PAYMENT_CHOICES = [
    ("CARD", "Carte bancaire"),
    ("MTN_MOMO", "MTN Mobile Money"),
    ("MOOV_MONEY", "Moov Money"),
    ("ORANGE_MONEY", "Orange Money"),
]

INPUT_CLASSES = (
    "mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm "
    "focus:outline-none focus:ring-2 focus:ring-gold/50"
)


class GuestCheckoutForm(forms.Form):
    """Checkout invité : aucun compte requis, double validation de l'email."""

    full_name = forms.CharField(
        label="Nom complet",
        max_length=150,
        widget=forms.TextInput(attrs={"class": INPUT_CLASSES, "placeholder": "Ex. Aïcha Zannou"}),
    )
    email = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(attrs={"class": INPUT_CLASSES, "placeholder": "vous@exemple.com"}),
    )
    email_confirm = forms.EmailField(
        label="Confirmer l'email",
        widget=forms.EmailInput(attrs={"class": INPUT_CLASSES, "placeholder": "vous@exemple.com"}),
    )
    phone = forms.CharField(
        label="Téléphone",
        max_length=30,
        widget=forms.TextInput(attrs={"class": INPUT_CLASSES, "placeholder": "+229 01 XX XX XX XX"}),
    )
    payment_method = forms.ChoiceField(
        label="Moyen de paiement",
        choices=PAYMENT_CHOICES,
        widget=forms.RadioSelect,
    )

    def clean(self):
        cleaned = super().clean()
        email = cleaned.get("email")
        email_confirm = cleaned.get("email_confirm")
        if email and email_confirm and email != email_confirm:
            self.add_error("email_confirm", "Les deux adresses ne correspondent pas.")
        return cleaned
