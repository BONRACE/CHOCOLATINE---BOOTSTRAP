# apps/core/forms.py
from django import forms
from django.core.exceptions import ValidationError
import re


class CheckoutForm(forms.Form):
    """Formulaire de paiement rapide"""
    PAYMENT_METHODS = [
        ('card', 'Carte Bancaire'),
        ('mtn', 'Mobile Money MTN'),
        ('moov', 'Mobile Money Moov'),
        ('orange', 'Mobile Money Orange'),
    ]
    
    first_name = forms.CharField(
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
            'placeholder': 'Prénom',
            'autocomplete': 'given-name'
        })
    )
    
    last_name = forms.CharField(
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
            'placeholder': 'Nom',
            'autocomplete': 'family-name'
        })
    )
    
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
            'placeholder': 'Email',
            'autocomplete': 'email'
        })
    )
    
    email_confirm = forms.EmailField(
        required=True,
        label='Confirmer Email',
        widget=forms.EmailInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
            'placeholder': 'Confirmer Email'
        })
    )
    
    phone = forms.CharField(
        max_length=20,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
            'placeholder': '+229 XXXXXXXX',
            'autocomplete': 'tel'
        })
    )
    
    payment_method = forms.ChoiceField(
        choices=PAYMENT_METHODS,
        required=True,
        widget=forms.RadioSelect(attrs={
            'class': 'form-radio'
        })
    )
    
    accept_terms = forms.BooleanField(
        required=True,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-checkbox'
        }),
        label="J'accepte les conditions d'utilisation"
    )
    
    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        email_confirm = cleaned_data.get('email_confirm')
        
        if email and email_confirm and email != email_confirm:
            raise ValidationError("Les emails ne correspondent pas.")
        
        return cleaned_data
    
    def clean_phone(self):
        phone = self.cleaned_data['phone']
        # Accepter les formats: +229XXXXXXXX, 0XXXXXXXX
        if not re.match(r'^(\+229|0)[0-9]{8}$', phone.replace(' ', '')):
            raise ValidationError("Numéro de téléphone invalide.")
        return phone


# apps/events/forms.py
from django import forms
from django.forms import inlineformset_factory, modelformset_factory
from apps.events.models import Event, TicketCategory


class EventForm(forms.ModelForm):
    """Formulaire de création/édition d'événement"""
    
    class Meta:
        model = Event
        fields = [
            'title', 'slug', 'description', 'short_description',
            'start_date', 'end_date', 'location', 'latitude', 'longitude',
            'image', 'banner_image', 'capacity', 'is_online', 'online_url',
            'terms_and_conditions'
        ]
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'placeholder': 'Titre de l\'événement'
            }),
            'slug': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'placeholder': 'slug-url-friendly'
            }),
            'description': forms.Textarea(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'rows': 8
            }),
            'short_description': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'placeholder': 'Résumé court (max 500 caractères)'
            }),
            'start_date': forms.DateTimeInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'type': 'datetime-local'
            }),
            'end_date': forms.DateTimeInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'type': 'datetime-local'
            }),
            'location': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'placeholder': 'Adresse ou lieu'
            }),
            'capacity': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'min': '1'
            }),
            'image': forms.FileInput(attrs={
                'class': 'w-full'
            }),
            'banner_image': forms.FileInput(attrs={
                'class': 'w-full'
            }),
            'terms_and_conditions': forms.Textarea(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'rows': 5
            })
        }


class TicketCategoryForm(forms.ModelForm):
    """Formulaire pour catégories de billets"""
    
    class Meta:
        model = TicketCategory
        fields = ['name', 'description', 'category_type', 'price', 'quota', 
                  'sale_start', 'sale_end', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'placeholder': 'VIP, Standard, Early Bird, etc.'
            }),
            'description': forms.Textarea(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'rows': 3
            }),
            'category_type': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md'
            }),
            'price': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'step': '0.01',
                'min': '0'
            }),
            'quota': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'min': '1'
            }),
            'sale_start': forms.DateTimeInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'type': 'datetime-local'
            }),
            'sale_end': forms.DateTimeInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
                'type': 'datetime-local'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'form-checkbox'
            })
        }


# Formset pour catégories multiples
TicketCategoryFormSet = inlineformset_factory(
    Event,
    TicketCategory,
    form=TicketCategoryForm,
    extra=3,
    can_delete=True
)


# apps/events/views.py (Dashboard)
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q, Sum, Count, Avg, F
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
import csv
import json
from datetime import timedelta

from apps.events.models import Event
from apps.tickets.models import Order, Ticket, ScanLog
from apps.events.forms import EventForm, TicketCategoryFormSet


class DashboardView(LoginRequiredMixin, TemplateView):
    """Dashboard principal de l'organisateur"""
    template_name = 'dashboard/dashboard.html'
    login_url = 'admin:login'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Récupérer les événements de l'utilisateur
        user_events = Event.objects.filter(organizer=self.request.user)
        
        # KPIs
        orders = Order.objects.filter(event__organizer=self.request.user, status='completed')
        
        context['total_revenue'] = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        context['total_orders'] = orders.count()
        context['total_tickets_sold'] = Ticket.objects.filter(
            order__event__organizer=self.request.user,
            order__status='completed'
        ).count()
        
        context['recent_events'] = user_events.order_by('-start_date')[:10]
        context['upcoming_events'] = user_events.filter(
            start_date__gte=timezone.now()
        ).order_by('start_date')[:5]
        
        # Graphique de revenus (derniers 30 jours)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        revenue_data = orders.filter(
            created_at__gte=thirty_days_ago
        ).extra(select={'date': 'DATE(created_at)'}).values('date').annotate(
            daily_revenue=Sum('total_amount')
        ).order_by('date')
        
        context['revenue_chart_data'] = list(revenue_data)
        
        return context


class EventCreateView(LoginRequiredMixin, TemplateView):
    """Création d'événement"""
    template_name = 'dashboard/event_form.html'
    login_url = 'admin:login'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = EventForm()
        context['formset'] = TicketCategoryFormSet(instance=None)
        context['is_create'] = True
        return context
    
    def post(self, request):
        form = EventForm(request.POST, request.FILES)
        formset = TicketCategoryFormSet(request.POST, instance=None)
        
        if form.is_valid() and formset.is_valid():
            event = form.save(commit=False)
            event.organizer = request.user
            event.status = 'draft'
            event.save()
            
            formset.instance = event
            formset.save()
            
            return redirect('dashboard:event_manage', event_id=event.id)
        
        context = {
            'form': form,
            'formset': formset,
            'is_create': True,
            'errors': form.errors
        }
        
        return render(request, self.template_name, context)


class EventManageView(LoginRequiredMixin, TemplateView):
    """Gestion d'un événement (onglets)"""
    template_name = 'dashboard/event_manage.html'
    login_url = 'admin:login'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        event = get_object_or_404(
            Event,
            id=kwargs.get('event_id'),
            organizer=self.request.user
        )
        context['event'] = event
        
        # Statistiques
        orders = event.orders.filter(status='completed')
        context['total_revenue'] = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        context['total_tickets_sold'] = event.tickets_sold
        context['occupancy_rate'] = event.occupancy_rate
        
        # Participants
        context['participants'] = orders.select_related().values(
            'first_name', 'last_name', 'email', 'phone', 'created_at'
        )
        
        # Données hourly pour graphique
        context['hourly_data'] = self.get_hourly_attendance(event)
        
        return context
    
    def get_hourly_attendance(self, event):
        """Génère les données d'affluence par heure"""
        scans = ScanLog.objects.filter(
            event=event,
            status='success'
        ).extra(
            select={'hour': 'DATE_TRUNC(\'hour\', scanned_at)'}
        ).values('hour').annotate(count=Count('id')).order_by('hour')
        
        return list(scans)


class ParticipantsTabView(LoginRequiredMixin, TemplateView):
    """Onglet Participants avec recherche HTMX"""
    template_name = 'dashboard/participants_tab.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        event = get_object_or_404(
            Event,
            id=kwargs.get('event_id'),
            organizer=self.request.user
        )
        
        search_query = self.request.GET.get('search', '')
        
        orders_qs = event.orders.filter(status='completed').select_related()
        
        if search_query:
            orders_qs = orders_qs.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(email__icontains=search_query)
            )
        
        context['orders'] = orders_qs
        context['event'] = event
        context['search_query'] = search_query
        
        return context


class ExportTabView(LoginRequiredMixin, TemplateView):
    """Export CSV des participants"""
    
    def get(self, request, event_id):
        event = get_object_or_404(
            Event,
            id=event_id,
            organizer=request.user
        )
        
        # Créer la réponse CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="participants_{event.slug}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Prénom', 'Nom', 'Email', 'Téléphone', 'Catégorie Billet', 'Date Commande'])
        
        # Récupérer les données
        for order in event.orders.filter(status='completed'):
            for ticket in order.ticket_set.all():
                writer.writerow([
                    order.first_name,
                    order.last_name,
                    order.email,
                    order.phone,
                    ticket.category.name,
                    order.created_at.strftime('%Y-%m-%d %H:%M')
                ])
        
        return response


class StatsChartDataView(LoginRequiredMixin, TemplateView):
    """API JSON pour graphiques Chart.js"""
    
    def get(self, request, event_id):
        event = get_object_or_404(
            Event,
            id=event_id,
            organizer=request.user
        )
        
        chart_type = request.GET.get('type', 'hourly')
        
        if chart_type == 'hourly':
            data = self.get_hourly_attendance_data(event)
        elif chart_type == 'category':
            data = self.get_category_breakdown(event)
        else:
            data = {'labels': [], 'data': []}
        
        return JsonResponse(data)
    
    def get_hourly_attendance_data(self, event):
        """Données d'affluence par heure (jour de l'événement)"""
        scans = ScanLog.objects.filter(
            event=event,
            status='success',
            scanned_at__date=event.start_date.date()
        ).extra(
            select={'hour': 'EXTRACT(HOUR FROM scanned_at)'}
        ).values('hour').annotate(count=Count('id')).order_by('hour')
        
        labels = [f"{int(s['hour']):02d}:00" for s in scans]
        data = [s['count'] for s in scans]
        
        return {
            'labels': labels,
            'datasets': [{
                'label': 'Entrées',
                'data': data,
                'borderColor': 'rgb(75, 192, 192)',
                'backgroundColor': 'rgba(75, 192, 192, 0.1)'
            }]
        }
    
    def get_category_breakdown(self, event):
        """Distribution par catégorie de billet"""
        categories = event.categories.annotate(
            sold=Count('ticket', filter=Q(ticket__order__status='completed'))
        )
        
        labels = [c.name for c in categories]
        data = [c.sold for c in categories]
        
        colors = [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
        ]
        
        return {
            'labels': labels,
            'datasets': [{
                'label': 'Billets vendus',
                'data': data,
                'backgroundColor': colors[:len(labels)]
            }]
        }
