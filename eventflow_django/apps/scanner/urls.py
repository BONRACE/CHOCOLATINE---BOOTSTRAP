from django.urls import path

from . import views

app_name = "scanner"

urlpatterns = [
    path("login/", views.agent_login, name="login"),
    path("view/<uuid:event_id>/", views.scan_view, name="scan"),
    path("api/manifest/<uuid:event_id>/", views.offline_manifest, name="offline_manifest"),
    path("api/verify/", views.verify_scan, name="verify_scan"),
    path("api/sync/", views.sync_scans, name="sync_scans"),
]
