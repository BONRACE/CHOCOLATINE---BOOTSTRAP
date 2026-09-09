from django.contrib.auth import authenticate, login
from django.shortcuts import redirect, render


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
