from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Organization, User


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "created_at")
    search_fields = ("name", "city")


@admin.register(User)
class EventFlowUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "organization", "is_staff")
    list_filter = ("role", "is_staff")
    fieldsets = UserAdmin.fieldsets + (
        ("EventFlow", {"fields": ("role", "phone", "sexe", "profession", "photo", "organization")}),
    )
