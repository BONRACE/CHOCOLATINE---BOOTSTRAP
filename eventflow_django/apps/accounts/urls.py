from django.contrib.auth.views import LogoutView
from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("login/", views.organizer_login, name="login"),
    path("logout/", LogoutView.as_view(next_page="core:home"), name="logout"),
]
