from django.urls import path

from . import views

app_name = "events"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("new/", views.event_create_step1, name="event_create_step1"),
    path("new/<uuid:event_id>/billetterie/", views.event_create_step2, name="event_create_step2"),
    path("<uuid:event_id>/manage/", views.event_manage, name="event_manage"),
    path("<uuid:event_id>/manage/participants/", views.participants_table, name="participants_table"),
    path("<uuid:event_id>/manage/export/", views.export_participants_csv, name="export_participants_csv"),
]
