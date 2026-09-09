from django.contrib import admin

from .models import ScanLog


@admin.register(ScanLog)
class ScanLogAdmin(admin.ModelAdmin):
    list_display = ("event", "agent", "result", "scanned_at", "synced_at")
    list_filter = ("result", "event")
    search_fields = ("offline_id",)
