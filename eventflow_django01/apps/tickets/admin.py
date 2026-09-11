from django.contrib import admin

from .models import Order, OrderItem, Ticket


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class TicketInline(admin.TabularInline):
    model = Ticket
    extra = 0
    readonly_fields = ("id", "status", "scanned_at", "scanned_by")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "buyer_full_name", "status", "total_amount", "created_at")
    list_filter = ("status", "payment_method", "event")
    search_fields = ("buyer_full_name", "buyer_email", "id")
    inlines = [OrderItemInline, TicketInline]


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "ticket_category", "holder_first_name", "holder_last_name", "status", "scanned_at")
    list_filter = ("status", "ticket_category")
    search_fields = ("holder_first_name", "holder_last_name", "order__buyer_full_name")
