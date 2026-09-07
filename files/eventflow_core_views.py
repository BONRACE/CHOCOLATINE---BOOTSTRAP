# apps/core/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.views.generic import TemplateView, ListView
from django.db.models import Q, Count, Sum, F, DecimalField
from django.utils import timezone
from django.urls import reverse
from django.contrib.sessions.middleware import SessionMiddleware
from datetime import datetime, timedelta
import uuid

from apps.events.models import Event, TicketCategory
from apps.tickets.models import Order, Ticket, Cart, CartItem
from apps.core.forms import CheckoutForm, CartItemForm
from apps.tickets.utils import QRCodeSignature, OfflineTicketManifest


class HomePageView(TemplateView):
    """Page d'accueil avec catalogue d'événements"""
    template_name = 'core/index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Événements publiés et non terminés
        now = timezone.now()
        context['upcoming_events'] = Event.objects.filter(
            status='published',
            end_date__gte=now
        ).select_related('organizer').order_by('start_date')[:12]
        
        context['featured_events'] = Event.objects.filter(
            status='published',
            end_date__gte=now
        ).annotate(
            ticket_count=Count('categories__ticket')
        ).order_by('-ticket_count')[:6]
        
        # Villes pour les filtres
        context['cities'] = Event.objects.filter(
            status='published',
            end_date__gte=now
        ).values_list('location', flat=True).distinct()[:20]
        
        context['categories'] = TicketCategory.objects.filter(
            event__status='published',
            event__end_date__gte=now
        ).values_list('category_type', flat=True).distinct()
        
        return context


class EventSearchView(TemplateView):
    """Vue HTMX pour recherche et filtrage en direct"""
    template_name = 'core/components/event_list.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Récupérer les paramètres de filtre
        search_query = self.request.GET.get('q', '')
        city_filter = self.request.GET.get('city', '')
        category_filter = self.request.GET.get('category', '')
        
        now = timezone.now()
        events_qs = Event.objects.filter(
            status='published',
            end_date__gte=now
        )
        
        # Filtrer par recherche
        if search_query:
            events_qs = events_qs.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(location__icontains=search_query)
            )
        
        # Filtrer par ville
        if city_filter:
            events_qs = events_qs.filter(location__icontains=city_filter)
        
        # Filtrer par catégorie de billet
        if category_filter:
            events_qs = events_qs.filter(categories__category_type=category_filter).distinct()
        
        context['events'] = events_qs.select_related('organizer').order_by('start_date')
        context['search_query'] = search_query
        
        return context
    
    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        
        # Si c'est une requête HTMX, retourner juste les résultats
        if request.headers.get('HX-Request') == 'true':
            return render(request, 'core/components/event_results.html', context)
        
        return render(request, self.template_name, context)


class EventDetailView(TemplateView):
    """Détail d'un événement avec widget d'achat"""
    template_name = 'core/event_detail.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        event = get_object_or_404(Event, slug=kwargs.get('slug'))
        context['event'] = event
        
        # Catégories en vente
        now = timezone.now()
        context['ticket_categories'] = event.categories.filter(
            sale_start__lte=now,
            sale_end__gte=now,
            is_active=True
        ).order_by('price')
        
        # Infos d'occupation
        context['occupancy_rate'] = event.occupancy_rate
        context['tickets_available'] = event.capacity - event.tickets_sold
        
        return context
    
    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return render(request, self.template_name, context)


class TicketSelectorView(View):
    """Vue HTMX pour sélection des billets et calcul du total"""
    
    def get(self, request, event_id):
        """Retourne le widget interactif"""
        event = get_object_or_404(Event, id=event_id)
        
        now = timezone.now()
        categories = event.categories.filter(
            sale_start__lte=now,
            sale_end__gte=now,
            is_active=True
        ).order_by('price')
        
        context = {
            'event': event,
            'categories': categories
        }
        
        return render(request, 'core/components/ticket_selector.html', context)
    
    def post(self, request, event_id):
        """Recalcule le total lors de la modification"""
        event = get_object_or_404(Event, id=event_id)
        
        # Récupérer les quantités du formulaire HTMX
        quantities = {}
        for key, value in request.POST.items():
            if key.startswith('qty_'):
                category_id = key.replace('qty_', '')
                quantities[category_id] = int(value) if value else 0
        
        # Calculer le total
        total = 0
        items_summary = []
        
        for category_id, qty in quantities.items():
            if qty > 0:
                try:
                    category = event.categories.get(id=category_id)
                    item_total = category.price * qty
                    total += item_total
                    items_summary.append({
                        'name': category.name,
                        'qty': qty,
                        'price': float(category.price),
                        'subtotal': float(item_total)
                    })
                except TicketCategory.DoesNotExist:
                    pass
        
        context = {
            'total': float(total),
            'items': items_summary,
            'items_count': sum(quantities.values())
        }
        
        return JsonResponse(context)


class CartView(View):
    """Gestion du panier"""
    
    def get_or_create_cart(self, request):
        """Récupère ou crée le panier pour la session"""
        if 'cart_id' not in request.session:
            cart = Cart.objects.create(
                session_key=request.session.session_key or uuid.uuid4().hex,
                expires_at=timezone.now() + timedelta(days=7)
            )
            request.session['cart_id'] = str(cart.id)
            return cart
        else:
            try:
                return Cart.objects.get(id=request.session['cart_id'])
            except Cart.DoesNotExist:
                cart = Cart.objects.create(
                    session_key=request.session.session_key or uuid.uuid4().hex,
                    expires_at=timezone.now() + timedelta(days=7)
                )
                request.session['cart_id'] = str(cart.id)
                return cart
    
    def post(self, request):
        """Ajoute un élément au panier (HTMX POST)"""
        cart = self.get_or_create_cart(request)
        
        category_id = request.POST.get('category_id')
        quantity = int(request.POST.get('quantity', 1))
        event_id = request.POST.get('event_id')
        
        category = get_object_or_404(TicketCategory, id=category_id, event_id=event_id)
        
        # Ajouter ou mettre à jour
        item, created = CartItem.objects.update_or_create(
            cart=cart,
            category=category,
            defaults={'quantity': quantity}
        )
        
        context = {
            'cart_total': float(cart.total_amount),
            'item_count': cart.cartitem_set.aggregate(Sum('quantity'))['quantity__sum'] or 0
        }
        
        return JsonResponse(context)
    
    def delete(self, request):
        """Supprime un élément du panier"""
        cart = self.get_or_create_cart(request)
        
        item_id = request.POST.get('item_id')
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        
        context = {
            'cart_total': float(cart.total_amount),
            'item_count': cart.cartitem_set.aggregate(Sum('quantity'))['quantity__sum'] or 0
        }
        
        return JsonResponse(context)


class CheckoutView(TemplateView):
    """Page de paiement"""
    template_name = 'tickets/checkout.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        try:
            cart = Cart.objects.get(id=kwargs.get('cart_id'))
        except Cart.DoesNotExist:
            return context
        
        context['cart'] = cart
        context['cart_items'] = cart.cartitem_set.select_related('category__event')
        context['form'] = CheckoutForm()
        
        return context
    
    def post(self, request, cart_id):
        """Traite la soumission du formulaire de checkout"""
        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return redirect('core:home')
        
        form = CheckoutForm(request.POST)
        
        if form.is_valid():
            # Récupérer l'événement depuis le premier item du panier
            cart_item = cart.cartitem_set.first()
            if not cart_item:
                return redirect('core:home')
            
            event = cart_item.category.event
            
            # Créer la commande
            order = Order.objects.create(
                event=event,
                first_name=form.cleaned_data['first_name'],
                last_name=form.cleaned_data['last_name'],
                email=form.cleaned_data['email'],
                phone=form.cleaned_data['phone'],
                total_amount=cart.total_amount,
                payment_method=form.cleaned_data['payment_method'],
                transaction_ref=f"EVENTFLOW-{uuid.uuid4().hex[:16].upper()}",
                status='pending'
            )
            
            # Créer les billets (temporaires, status=pending)
            for cart_item in cart.cartitem_set.all():
                for _ in range(cart_item.quantity):
                    # Signer les données du billet
                    qr_signature = QRCodeSignature.sign_ticket_data(
                        uuid.uuid4(),
                        event.id
                    )
                    
                    ticket = Ticket.objects.create(
                        order=order,
                        category=cart_item.category,
                        qr_code_data=qr_signature,
                        status='unused'
                    )
                    
                    # Générer et sauvegarder le QR Code
                    path = QRCodeSignature.save_qr_code_to_storage(ticket)
                    ticket.qr_code_image = path
                    ticket.save()
            
            # Marquer la commande comme complétée (en production: intégration paiement)
            order.status = 'completed'
            order.paid_at = timezone.now()
            order.save()
            
            # Envoyer l'email de confirmation (signal)
            from django.db.models.signals import post_save
            post_save.send(sender=Order, instance=order, created=True)
            
            # Supprimer le panier
            cart.delete()
            
            return redirect('tickets:confirmation', order_uuid=order.id)
        
        context = {
            'form': form,
            'cart': cart,
            'cart_items': cart.cartitem_set.select_related('category__event')
        }
        
        return render(request, self.template_name, context)


class ConfirmationView(TemplateView):
    """Page de confirmation et téléchargement du billet"""
    template_name = 'tickets/confirmation.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        order = get_object_or_404(Order, id=kwargs.get('order_uuid'))
        context['order'] = order
        context['tickets'] = order.ticket_set.select_related('category')
        
        return context
