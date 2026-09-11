from django.contrib.auth import authenticate, login
from django.shortcuts import redirect, render

from apps.accounts.models import Organization, User

from .forms import OrganizerSignUpForm


def organizer_signup(request):
    """Inscription organisateur — préalable obligatoire à la création d'un
    événement : `event_create_step1` est protégée par `@login_required`
    (voir apps/events/views.py), donc personne ne peut créer d'événement
    sans être passé par ici (ou par un compte créé via /admin/) et sans
    disposer de son propre identifiant."""
    if request.user.is_authenticated:
        return redirect("events:dashboard")

    if request.method == "POST":
        form = OrganizerSignUpForm(request.POST)
        if form.is_valid():
            organization = Organization.objects.create(
                name=form.cleaned_data["organization_name"]
            )
            user = User.objects.create_user(
                username=form.cleaned_data["username"],
                email=form.cleaned_data["email"],
                password=form.cleaned_data["password"],
                first_name=form.cleaned_data["full_name"],
                phone=form.cleaned_data["phone"],
                role=User.Role.ORGANIZER,
                organization=organization,
            )
            login(request, user)
            next_url = request.GET.get("next") or "events:event_create_step1"
            return redirect(next_url)
    else:
        form = OrganizerSignUpForm()

    return render(request, "accounts/signup.html", {"form": form})


def organizer_login(request):
    """Connexion des organisateurs, distincte de `/scanner/login/` (agents) :
    un organisateur n'a pas d'événement à sélectionner pour accéder à son
    tableau de bord — voir apps/scanner/views.py::agent_login pour le flux agent."""
    error = None
    if request.user.is_authenticated:
        return redirect("events:dashboard")

    if request.method == "POST":
        username = request.POST.get("username", "")
        password = request.POST.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is None:
            error = "Identifiants incorrects."
        elif not (user.is_organizer() or user.is_superuser):
            error = "Ce compte n'a pas le rôle organisateur."
        else:
            login(request, user)
            next_url = request.GET.get("next") or "events:dashboard"
            return redirect(next_url)

    return render(request, "accounts/login.html", {"error": error})
