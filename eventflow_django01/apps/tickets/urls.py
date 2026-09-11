from django.urls import path

from . import views

app_name = "tickets"

urlpatterns = [
    path("stripe/", views.stripe_webhook, name="stripe_webhook"),
    path("cinetpay/", views.cinetpay_webhook, name="cinetpay_webhook"),
    path("fedapay/", views.fedapay_webhook, name="fedapay_webhook"),
]
