from django.contrib import admin

from .models import Event, EventAgent, TicketCategory


class TicketCategoryInline(admin.TabularInline):
    model = TicketCategory
    extra = 1


class EventAgentInline(admin.TabularInline):
    model = EventAgent
    extra = 1


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "city", "category", "status", "starts_at", "fill_rate")
    list_filter = ("status", "category", "city")
    search_fields = ("title", "venue_name", "city")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [TicketCategoryInline, EventAgentInline]

    @admin.display(description="Remplissage")
    def fill_rate(self, obj):
        return f"{obj.fill_rate}%"


@admin.register(TicketCategory)
class TicketCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "event", "unit_price", "quantity", "quantity_sold")
    list_filter = ("event",)
