# apps/scanner/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db.models import Q
from django.middleware.csrf import get_token
import json
from datetime import datetime

from apps.events.models import Event
from apps.tickets.models import Ticket, ScanLog, ScannerSession, OfflineSyncQueue
from apps.tickets.utils import QRCodeSignature, OfflineTicketManifest, OfflineSignatureValidator
from apps.scanner.forms import ScannerLoginForm


class ScannerLoginView(TemplateView):
    """Page de connexion du scanner"""
    template_name = 'scanner/login.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = ScannerLoginForm()
        return context
    
    def post(self, request):
        form = ScannerLoginForm(request.POST)
        
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            event_id = form.cleaned_data['event_id']
            
            from django.contrib.auth import authenticate, login
            user = authenticate(username=username, password=password)
            
            if user is not None and user.groups.filter(name='Scanner Agent').exists():
                login(request, user)
                
                # Créer une session scanner
                device_id = request.POST.get('device_id', request.session.session_key)
                session = ScannerSession.objects.create(
                    user=user,
                    event_id=event_id,
                    device_id=device_id
                )
                
                request.session['scanner_session_id'] = str(session.id)
                
                return redirect('scanner:scan_interface', event_id=event_id)
        
        context = {
            'form': form,
            'errors': form.errors
        }
        return render(request, self.template_name, context)


class ScanInterfaceView(LoginRequiredMixin, TemplateView):
    """Interface principale de scan"""
    template_name = 'scanner/scan_interface.html'
    login_url = 'scanner:login'
    
    def dispatch(self, request, *args, **kwargs):
        # Vérifier que l'utilisateur est agent scanner
        if not request.user.groups.filter(name='Scanner Agent').exists():
            return redirect('scanner:login')
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        event = get_object_or_404(Event, id=kwargs.get('event_id'))
        context['event'] = event
        
        # Récupérer ou créer la session scanner
        session = ScannerSession.objects.filter(
            user=self.request.user,
            event=event
        ).first()
        
        if not session:
            session = ScannerSession.objects.create(
                user=self.request.user,
                event=event,
                device_id=self.request.session.session_key
            )
        
        context['session'] = session
        
        # Statistiques en direct
        context['total_tickets'] = Ticket.objects.filter(
            order__event=event,
            order__status='completed'
        ).count()
        
        context['scanned_tickets'] = Ticket.objects.filter(
            order__event=event,
            order__status='completed',
            status='scanned'
        ).count()
        
        context['csrf_token'] = get_token(self.request)
        
        return context


class ScanTicketAPIView(LoginRequiredMixin, View):
    """API pour scanner un billet (AJAX)"""
    login_url = 'scanner:login'
    
    @method_decorator(require_http_methods(['POST']))
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        qr_data = data.get('qr_data')
        event_id = data.get('event_id')
        offline = data.get('offline', False)
        
        if not qr_data or not event_id:
            return JsonResponse({'error': 'Missing parameters'}, status=400)
        
        event = get_object_or_404(Event, id=event_id)
        
        # Vérifier la signature
        result = QRCodeSignature.verify_ticket_signature(qr_data, event_id)
        
        if not result['valid']:
            return JsonResponse({
                'success': False,
                'status': 'invalid',
                'reason': result['error'],
                'sound': 'error'
            }, status=200)
        
        payload = result['payload']
        ticket_id = payload.get('t_id')
        
        # Récupérer le billet
        try:
            ticket = Ticket.objects.get(id=ticket_id, order__event=event)
        except Ticket.DoesNotExist:
            return JsonResponse({
                'success': False,
                'status': 'unknown',
                'reason': 'Billet inconnu',
                'sound': 'error'
            }, status=200)
        
        # Vérifier si déjà scanné
        if ticket.status == 'scanned':
            last_scan = ScanLog.objects.filter(ticket=ticket).order_by('-scanned_at').first()
            scan_time = last_scan.scanned_at.strftime('%H:%M') if last_scan else 'N/A'
            
            return JsonResponse({
                'success': False,
                'status': 'already_scanned',
                'reason': f'Déjà scanné à {scan_time}',
                'sound': 'error'
            }, status=200)
        
        # Marquer comme scanné
        ticket.status = 'scanned'
        ticket.scanned_at = timezone.now()
        ticket.scanned_by = request.user
        ticket.save()
        
        # Créer un log de scan
        ScanLog.objects.create(
            ticket=ticket,
            event=event,
            scanner_user=request.user,
            status='success',
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Si offline, ajouter à la queue de sync
        if offline:
            session = ScannerSession.objects.filter(
                user=request.user,
                event=event
            ).first()
            
            if session:
                OfflineSyncQueue.objects.create(
                    session=session,
                    scan_data={
                        'ticket_id': str(ticket.id),
                        'qr_data': qr_data,
                        'status': 'success',
                        'timestamp': timezone.now().isoformat()
                    },
                    status='pending'
                )
        
        return JsonResponse({
            'success': True,
            'status': 'valid',
            'participant_name': ticket.participant_name,
            'category': ticket.category.name,
            'sound': 'success'
        }, status=200)
    
    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class OfflineManifestAPIView(LoginRequiredMixin, View):
    """API pour télécharger le manifest des billets (PWA Offline)"""
    login_url = 'scanner:login'
    
    @method_decorator(require_http_methods(['GET']))
    def get(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        
        # Générer le manifest
        manifest = OfflineTicketManifest.generate_manifest(event, include_scanned=False)
        manifest_hash = OfflineTicketManifest.get_manifest_hash(manifest)
        
        # Mettre à jour la session scanner
        session = ScannerSession.objects.filter(
            user=request.user,
            event=event
        ).first()
        
        if session:
            session.manifest_hash = manifest_hash
            session.last_sync = timezone.now()
            session.save()
        
        response = JsonResponse(manifest)
        response['X-Manifest-Hash'] = manifest_hash
        
        return response


class OfflineSyncAPIView(LoginRequiredMixin, View):
    """API pour synchroniser les scans offline"""
    login_url = 'scanner:login'
    
    @method_decorator(require_http_methods(['POST']))
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        event_id = data.get('event_id')
        scans = data.get('scans', [])  # List de {qr_data, ticket_id, timestamp}
        
        if not event_id:
            return JsonResponse({'error': 'Missing event_id'}, status=400)
        
        event = get_object_or_404(Event, id=event_id)
        
        synced_count = 0
        failed_scans = []
        
        for scan_item in scans:
            qr_data = scan_item.get('qr_data')
            ticket_id = scan_item.get('ticket_id')
            
            try:
                # Vérifier la signature
                result = QRCodeSignature.verify_ticket_signature(qr_data, str(event_id))
                
                if not result['valid']:
                    failed_scans.append({
                        'ticket_id': ticket_id,
                        'reason': result['error']
                    })
                    continue
                
                # Récupérer et marquer le billet
                ticket = Ticket.objects.get(id=ticket_id, order__event=event)
                
                if ticket.status == 'scanned':
                    continue  # Déjà scanné
                
                ticket.status = 'scanned'
                ticket.scanned_at = timezone.now()
                ticket.scanned_by = request.user
                ticket.save()
                
                # Log
                ScanLog.objects.create(
                    ticket=ticket,
                    event=event,
                    scanner_user=request.user,
                    status='success',
                    ip_address=ScanTicketAPIView.get_client_ip(request)
                )
                
                synced_count += 1
                
                # Marquer la queue comme synchronisée
                OfflineSyncQueue.objects.filter(
                    scan_data__contains={'ticket_id': str(ticket_id)}
                ).update(status='synced')
            
            except Ticket.DoesNotExist:
                failed_scans.append({
                    'ticket_id': ticket_id,
                    'reason': 'Ticket not found'
                })
            except Exception as e:
                failed_scans.append({
                    'ticket_id': ticket_id,
                    'reason': str(e)
                })
        
        return JsonResponse({
            'success': True,
            'synced': synced_count,
            'failed': len(failed_scans),
            'failed_scans': failed_scans
        })


class ScannerStatusAPIView(LoginRequiredMixin, View):
    """API pour statut du scanner (en ligne/offline)"""
    login_url = 'scanner:login'
    
    @method_decorator(require_http_methods(['GET', 'POST']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request):
        data = json.loads(request.body)
        is_online = data.get('is_online', True)
        event_id = data.get('event_id')
        
        session = ScannerSession.objects.filter(
            user=request.user,
            event_id=event_id
        ).first()
        
        if session:
            session.is_online = is_online
            session.save()
        
        return JsonResponse({'success': True})
    
    def get(self, request, event_id):
        session = ScannerSession.objects.filter(
            user=request.user,
            event_id=event_id
        ).first()
        
        if not session:
            return JsonResponse({'error': 'No session'}, status=404)
        
        # Compter les items en attente de sync
        pending_syncs = OfflineSyncQueue.objects.filter(
            session=session,
            status='pending'
        ).count()
        
        return JsonResponse({
            'is_online': session.is_online,
            'pending_syncs': pending_syncs,
            'last_sync': session.last_sync.isoformat() if session.last_sync else None
        })


# apps/scanner/forms.py
from django import forms
from django.contrib.auth.models import User
from apps.events.models import Event


class ScannerLoginForm(forms.Form):
    """Formulaire de connexion scanner"""
    
    username = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
            'placeholder': 'Identifiant',
            'autocomplete': 'username'
        })
    )
    
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md',
            'placeholder': 'Mot de passe',
            'autocomplete': 'current-password'
        })
    )
    
    event_id = forms.CharField(
        widget=forms.HiddenInput()
    )
