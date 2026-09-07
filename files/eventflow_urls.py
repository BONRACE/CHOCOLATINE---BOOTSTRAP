# eventflow_core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Public
    path('', include('apps.core.urls', namespace='core')),
    
    # Tickets
    path('tickets/', include('apps.tickets.urls', namespace='tickets')),
    
    # Scanner
    path('scanner/', include('apps.scanner.urls', namespace='scanner')),
    
    # Dashboard
    path('dashboard/', include('apps.events.urls', namespace='dashboard')),
    
    # PWA manifest
    path('manifest.json', TemplateView.as_view(
        template_name='manifest.json',
        content_type='application/manifest+json'
    )),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# apps/core/urls.py
from django.urls import path
from apps.core import views

app_name = 'core'

urlpatterns = [
    path('', views.HomePageView.as_view(), name='home'),
    path('search/', views.EventSearchView.as_view(), name='search'),
    path('events/<slug>/', views.EventDetailView.as_view(), name='event_detail'),
    path('events/<uuid:event_id>/selector/', views.TicketSelectorView.as_view(), name='ticket_selector'),
    path('cart/add/', views.CartView.as_view(), name='add_to_cart'),
    path('cart/remove/', views.CartView.as_view(), name='remove_from_cart'),
]


# apps/tickets/urls.py
from django.urls import path
from apps.tickets import views as ticket_views

app_name = 'tickets'

urlpatterns = [
    path('checkout/<uuid:cart_id>/', ticket_views.CheckoutView.as_view(), name='checkout'),
    path('confirmation/<uuid:order_uuid>/', ticket_views.ConfirmationView.as_view(), name='confirmation'),
    path('order/<uuid:order_id>/pdf/', ticket_views.OrderPDFView.as_view(), name='order_pdf'),
    path('ticket/<uuid:ticket_id>/pdf/', ticket_views.TicketPDFView.as_view(), name='ticket_pdf'),
]


# apps/events/urls.py (Dashboard)
from django.urls import path
from django.contrib.auth.decorators import login_required
from apps.events import views as event_views

app_name = 'dashboard'

urlpatterns = [
    path('', login_required(event_views.DashboardView.as_view()), name='index'),
    path('events/new/', login_required(event_views.EventCreateView.as_view()), name='event_create'),
    path('events/<uuid:event_id>/manage/', login_required(event_views.EventManageView.as_view()), name='event_manage'),
    path('events/<uuid:event_id>/participants/', login_required(event_views.ParticipantsTabView.as_view()), name='participants'),
    path('events/<uuid:event_id>/export/', login_required(event_views.ExportTabView.as_view()), name='export'),
    path('events/<uuid:event_id>/stats/', login_required(event_views.StatsChartDataView.as_view()), name='stats_data'),
]


# apps/scanner/urls.py
from django.urls import path
from apps.scanner import views as scanner_views

app_name = 'scanner'

urlpatterns = [
    # PWA Interface
    path('login/', scanner_views.ScannerLoginView.as_view(), name='login'),
    path('view/<uuid:event_id>/', scanner_views.ScanInterfaceView.as_view(), name='scan_interface'),
    
    # API Endpoints
    path('api/scan/', scanner_views.ScanTicketAPIView.as_view(), name='scan_api'),
    path('api/manifest/<uuid:event_id>/', scanner_views.OfflineManifestAPIView.as_view(), name='manifest'),
    path('api/sync/', scanner_views.OfflineSyncAPIView.as_view(), name='sync'),
    path('api/status/<uuid:event_id>/', scanner_views.ScannerStatusAPIView.as_view(), name='status'),
]
