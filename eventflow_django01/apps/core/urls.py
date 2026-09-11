from django.urls import path

from . import views

app_name = "core"

urlpatterns = [
    path("", views.home, name="home"),
    path("events/grid/", views.event_grid, name="event_grid"),
    path("events/<slug:slug>/", views.event_detail, name="event_detail"),
    path("events/<slug:slug>/recalculate/", views.recalculate_cart, name="recalculate_cart"),
    path("events/<slug:slug>/checkout/", views.start_checkout, name="start_checkout"),
    path("checkout/<str:cart_id>/", views.checkout, name="checkout"),
    path("tickets/confirmation/<uuid:order_uuid>/", views.confirmation, name="confirmation"),
    path("tickets/<uuid:ticket_id>/pdf/", views.ticket_pdf, name="ticket_pdf"),
    path("tickets/<uuid:ticket_id>/qr.png", views.ticket_qr_png, name="ticket_qr"),
]
