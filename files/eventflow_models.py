# apps/events/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, URLValidator
from django.db.models import Q, Sum, Count
import uuid

class Event(models.Model):
    """Modèle principal Événement"""
    EVENT_STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publié'),
        ('ongoing', 'En cours'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500)
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    image = models.ImageField(upload_to='events/%Y/%m/', null=True, blank=True)
    banner_image = models.ImageField(upload_to='events/banners/%Y/%m/', null=True, blank=True)
    
    capacity = models.IntegerField(validators=[MinValueValidator(1)])
    status = models.CharField(max_length=20, choices=EVENT_STATUS_CHOICES, default='draft')
    
    terms_and_conditions = models.TextField(blank=True)
    is_online = models.BooleanField(default=False)
    online_url = models.URLField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['organizer', 'status']),
            models.Index(fields=['start_date']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_active(self):
        now = timezone.now()
        return self.start_date <= now <= self.end_date
    
    @property
    def tickets_sold(self):
        return self.ticket_set.filter(order__status='completed').count()
    
    @property
    def revenue(self):
        return self.order_set.filter(status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
    
    @property
    def occupancy_rate(self):
        if self.capacity == 0:
            return 0
        return (self.tickets_sold / self.capacity) * 100


class TicketCategory(models.Model):
    """Catégories de billets (VIP, Standard, Early Bird, etc.)"""
    CATEGORY_TYPES = [
        ('vip', 'VIP'),
        ('standard', 'Standard'),
        ('early_bird', 'Early Bird'),
        ('group', 'Groupe'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='categories')
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='standard')
    
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    quota = models.IntegerField(validators=[MinValueValidator(1)])
    
    sale_start = models.DateTimeField()
    sale_end = models.DateTimeField()
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('event', 'name')
        ordering = ['price']
    
    def __str__(self):
        return f"{self.event.title} - {self.name}"
    
    @property
    def tickets_sold(self):
        return self.ticket_set.filter(order__status='completed').count()
    
    @property
    def remaining_quota(self):
        return self.quota - self.tickets_sold
    
    @property
    def is_on_sale(self):
        now = timezone.now()
        return self.sale_start <= now <= self.sale_end and self.is_active


class Cart(models.Model):
    """Panier d'achat temporaire"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_key = models.CharField(max_length=40, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        indexes = [models.Index(fields=['session_key'])]
    
    def __str__(self):
        return f"Cart {self.id}"
    
    @property
    def total_amount(self):
        return self.cartitem_set.aggregate(
            total=Sum(models.F('quantity') * models.F('category__price'), 
                     output_field=models.DecimalField())
        )['total'] or 0


class CartItem(models.Model):
    """Élément du panier"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    category = models.ForeignKey(TicketCategory, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cart', 'category')


# apps/tickets/models.py

class Order(models.Model):
    """Commande d'achat"""
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('completed', 'Complétée'),
        ('failed', 'Échouée'),
        ('refunded', 'Remboursée'),
    ]
    
    PAYMENT_METHODS = [
        ('card', 'Carte Bancaire'),
        ('mtn', 'Mobile Money MTN'),
        ('moov', 'Mobile Money Moov'),
        ('orange', 'Mobile Money Orange'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='orders')
    
    # Client Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Payment Information
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Transaction Reference
    transaction_ref = models.CharField(max_length=100, unique=True, db_index=True)
    payment_processor = models.CharField(max_length=50, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event', 'status']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"Order {self.id} - {self.first_name} {self.last_name}"
    
    @property
    def is_completed(self):
        return self.status == 'completed'
    
    @property
    def ticket_count(self):
        return self.ticket_set.count()


class Ticket(models.Model):
    """Billet individuel"""
    TICKET_STATUS = [
        ('unused', 'Non utilisé'),
        ('scanned', 'Scanné'),
        ('validated', 'Validé'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    category = models.ForeignKey(TicketCategory, on_delete=models.PROTECT)
    
    # QR Code & Security
    qr_code_data = models.TextField()  # JSON encodé {t_id, e_id, sig}
    qr_code_image = models.ImageField(upload_to='qrcodes/%Y/%m/', null=True, blank=True)
    
    # Status & Scanning
    status = models.CharField(max_length=20, choices=TICKET_STATUS, default='unused')
    scanned_at = models.DateTimeField(null=True, blank=True)
    scanned_by = models.ForeignKey(User, on_delete=models.SET_NULL, 
                                   null=True, blank=True, related_name='scanned_tickets')
    
    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['qr_code_data']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Ticket {self.id} - {self.order.first_name}"
    
    @property
    def participant_name(self):
        return f"{self.order.first_name} {self.order.last_name}"


class ScanLog(models.Model):
    """Journal des scans"""
    SCAN_STATUS = [
        ('success', 'Succès'),
        ('already_scanned', 'Déjà scanné'),
        ('invalid', 'Invalide'),
        ('error', 'Erreur'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='scan_logs')
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    
    scanner_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=SCAN_STATUS)
    
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    
    scanned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-scanned_at']
        indexes = [models.Index(fields=['event', 'scanned_at'])]


# apps/scanner/models.py

class ScannerSession(models.Model):
    """Session scanner PWA"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scanner_sessions')
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    
    device_id = models.CharField(max_length=100)  # Identifiant du navigateur
    is_online = models.BooleanField(default=True)
    
    manifest_hash = models.CharField(max_length=64, blank=True)  # SHA256 du manifest
    last_sync = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'event', 'device_id')
        indexes = [models.Index(fields=['user', 'event'])]
    
    def __str__(self):
        return f"Session {self.user.username} - {self.event.title}"


class OfflineSyncQueue(models.Model):
    """Queue pour synchronisation offline"""
    SYNC_STATUS = [
        ('pending', 'En attente'),
        ('synced', 'Synchronisé'),
        ('failed', 'Échoué'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ScannerSession, on_delete=models.CASCADE)
    
    scan_data = models.JSONField()  # {ticket_id, status, timestamp, offline_signature}
    status = models.CharField(max_length=20, choices=SYNC_STATUS, default='pending')
    
    attempted_at = models.DateTimeField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [models.Index(fields=['session', 'status'])]
