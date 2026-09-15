from django.contrib.auth.views import LogoutView
from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("inscription/", views.spectator_signup, name="signup"),
    path("inscription/organisateur/", views.organizer_signup, name="signup_organizer"),
    path("login/", views.account_login, name="login"),
    path("logout/", LogoutView.as_view(next_page="core:home"), name="logout"),
    path("mes-billets/", views.my_tickets, name="my_tickets"),
]
