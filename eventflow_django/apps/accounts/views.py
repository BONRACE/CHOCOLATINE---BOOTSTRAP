from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from apps.accounts.models import Organization, User

from .forms import OrganizerSignUpForm, SpectatorSignUpForm


def _create_user_from_form(form, role, organization=None):
    return User.objects.create_user(
        username=form.cleaned_data["username"],
        email=form.cleaned_data["email"],
        password=form.cleaned_data["password"],
        first_name=form.cleaned_data["first_name"],
        last_name=form.cleaned_data["last_name"],
        sexe=form.cleaned_data["sexe"],
        profession=form.cleaned_data["profession"],
        photo=form.cleaned_data.get("photo"),
        phone=form.cleaned_data["phone"],
        role=role,
        organization=organization,
    )


def spectator_signup(request):
    """Inscription spectateur — donne accès à l'historique des billets et
    permet de pré-remplir automatiquement les informations de "visa" lors
    d'un achat personnel (voir apps/core/views.py::checkout)."""
    if request.user.is_authenticated:
        return redirect("core:home")

    if request.method == "POST":
        form = SpectatorSignUpForm(request.POST, request.FILES)
        if form.is_valid():
            user = _create_user_from_form(form, User.Role.SPECTATOR)
            login(request, user)
            next_url = request.GET.get("next") or "core:home"
            return redirect(next_url)
    else:
        form = SpectatorSignUpForm()

    return render(request, "accounts/signup_spectator.html", {"form": form})


def organizer_signup(request):
    """Inscription organisateur — préalable obligatoire à la création d'un
    événement : `event_create_step1` est protégée par `@login_required`
    (voir apps/events/views.py), donc personne ne peut créer d'événement
    sans être passé par ici (ou par un compte créé via /admin/) et sans
    disposer de son propre identifiant."""
    if request.user.is_authenticated:
        if request.user.is_organizer() or request.user.is_superuser:
            return redirect("events:dashboard")
        # Un spectateur (ou agent) déjà connecté ne peut pas s'inscrire une
        # deuxième fois par-dessus son compte existant — le rediriger vers
        # dashboard bouclerait (organizer_required renvoie justement ici).
        messages.error(
            request,
            "Vous êtes déjà connecté avec un compte spectateur. "
            "Déconnectez-vous d'abord pour créer un compte organisateur.",
        )
        return redirect("core:home")

    if request.method == "POST":
        form = OrganizerSignUpForm(request.POST, request.FILES)
        if form.is_valid():
            organization = Organization.objects.create(
                name=form.cleaned_data["organization_name"],
                logo=form.cleaned_data.get("organization_logo"),
            )
            user = _create_user_from_form(form, User.Role.ORGANIZER, organization=organization)
            login(request, user)
            next_url = request.GET.get("next") or "events:event_create_step1"
            return redirect(next_url)
    else:
        form = OrganizerSignUpForm()

    return render(request, "accounts/signup_organizer.html", {"form": form})


def account_login(request):
    """Connexion spectateur ET organisateur (pas les agents, voir
    `/scanner/login/` — apps/scanner/views.py::agent_login — qui exige en
    plus une sélection d'événement). Redirige selon le rôle du compte."""
    error = None
    if request.user.is_authenticated:
        return redirect("events:dashboard" if request.user.is_organizer() else "accounts:my_tickets")

    if request.method == "POST":
        username = request.POST.get("username", "")
        password = request.POST.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is None:
            error = "Identifiants incorrects."
        elif user.is_agent():
            error = "Les agents d'accueil se connectent depuis /scanner/login/."
        else:
            login(request, user)
            default_next = "events:dashboard" if user.is_organizer() else "accounts:my_tickets"
            next_url = request.GET.get("next") or default_next
            return redirect(next_url)

    return render(request, "accounts/login.html", {"error": error})


@login_required
def my_tickets(request):
    """Historique du spectateur connecté : ses commandes payées, avec accès
    au PDF et à la version numérique (page de confirmation) de chaque
    billet."""
    orders = (
        request.user.orders.filter(status="PAID")
        .select_related("event")
        .prefetch_related("tickets", "tickets__ticket_category")
        .order_by("-paid_at")
    )
    return render(request, "accounts/my_tickets.html", {"orders": orders})
