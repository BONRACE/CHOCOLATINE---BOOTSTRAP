# apps/tickets/utils.py
import hmac
import hashlib
import json
import base64
import uuid
from datetime import datetime, timedelta
from io import BytesIO

import qrcode
from qrcode.image.svg import SvgPathImage
import jwt
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image, ImageDraw, ImageFont
from cryptography.fernet import Fernet


class QRCodeSignature:
    """Gestionnaire de signatures HMAC pour QR Codes"""
    
    @staticmethod
    def get_hmac_key():
        """Récupère la clé HMAC depuis settings"""
        return settings.HMAC_SECRET_KEY.encode('utf-8')
    
    @staticmethod
    def sign_ticket_data(ticket_id: str, event_id: str) -> str:
        """
        Crée une signature HMAC-SHA256 pour un billet
        
        Payload: {
            "t_id": "ticket-uuid",
            "e_id": "event-uuid",
            "iat": timestamp,
            "exp": timestamp + 24h
        }
        
        Retourne: JSON encodé avec signature
        """
        payload = {
            't_id': str(ticket_id),
            'e_id': str(event_id),
            'iat': datetime.utcnow().isoformat(),
            'exp': (datetime.utcnow() + timedelta(days=1)).isoformat()
        }
        
        # Créer le token JWT signé avec HMAC-SHA256
        token = jwt.encode(
            payload,
            settings.HMAC_SECRET_KEY,
            algorithm='HS256'
        )
        
        return token
    
    @staticmethod
    def verify_ticket_signature(qr_data: str, event_id: str) -> dict:
        """
        Vérifie une signature de QR Code
        
        Retourne: dict avec {valid: bool, payload: dict, error: str}
        """
        try:
            # Décoder le JWT
            payload = jwt.decode(
                qr_data,
                settings.HMAC_SECRET_KEY,
                algorithms=['HS256']
            )
            
            # Vérifier que l'event_id correspond
            if payload.get('e_id') != str(event_id):
                return {
                    'valid': False,
                    'payload': None,
                    'error': 'Event ID mismatch'
                }
            
            # Vérifier l'expiration
            exp_time = datetime.fromisoformat(payload.get('exp'))
            if datetime.utcnow() > exp_time:
                return {
                    'valid': False,
                    'payload': None,
                    'error': 'Ticket expired'
                }
            
            return {
                'valid': True,
                'payload': payload,
                'error': None
            }
        
        except jwt.InvalidTokenError as e:
            return {
                'valid': False,
                'payload': None,
                'error': f'Invalid signature: {str(e)}'
            }
        except Exception as e:
            return {
                'valid': False,
                'payload': None,
                'error': f'Verification error: {str(e)}'
            }
    
    @staticmethod
    def generate_qr_code_image(ticket_id: str, event_id: str, 
                                size: int = 10, border: int = 4) -> Image:
        """
        Génère une image QR Code pour un billet
        
        Retourne: PIL Image object
        """
        # Signer les données du ticket
        qr_signature = QRCodeSignature.sign_ticket_data(ticket_id, event_id)
        
        # Créer le QR Code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=size,
            border=border,
        )
        qr.add_data(qr_signature)
        qr.make(fit=True)
        
        # Générer l'image
        img = qr.make_image(fill_color='black', back_color='white').convert('RGB')
        
        return img
    
    @staticmethod
    def save_qr_code_to_storage(ticket_obj) -> str:
        """
        Sauvegarde le QR Code d'un ticket en base
        
        Retourne: chemin du fichier
        """
        img = QRCodeSignature.generate_qr_code_image(
            str(ticket_obj.id),
            str(ticket_obj.order.event.id)
        )
        
        # Convertir en bytes
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Sauvegarder
        filename = f'qrcodes/{ticket_obj.order.event.id}/{ticket_obj.id}.png'
        path = default_storage.save(filename, ContentFile(buffer.read()))
        
        return path


class OfflineTicketManifest:
    """Génère le manifest chiffré des billets pour le mode offline"""
    
    @staticmethod
    def get_encryption_key():
        """Récupère la clé Fernet depuis settings"""
        # Doit être une clé Fernet valide de 32 bytes en base64
        key = settings.ENCRYPTION_KEY if hasattr(settings, 'ENCRYPTION_KEY') \
            else Fernet.generate_key()
        return key
    
    @staticmethod
    def encrypt_ticket_data(ticket_id: str, event_id: str, 
                           participant_name: str, category_name: str) -> str:
        """
        Chiffre les données d'un billet pour stockage offline
        """
        data = {
            't_id': str(ticket_id),
            'e_id': str(event_id),
            'name': participant_name,
            'cat': category_name,
            'ts': datetime.utcnow().isoformat()
        }
        
        f = Fernet(OfflineTicketManifest.get_encryption_key())
        encrypted = f.encrypt(json.dumps(data).encode())
        
        return base64.b64encode(encrypted).decode('utf-8')
    
    @staticmethod
    def decrypt_ticket_data(encrypted_data: str) -> dict:
        """
        Déchiffre les données d'un billet
        """
        try:
            f = Fernet(OfflineTicketManifest.get_encryption_key())
            decrypted = f.decrypt(base64.b64decode(encrypted_data))
            return json.loads(decrypted.decode('utf-8'))
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def generate_manifest(event_obj, include_scanned: bool = False) -> dict:
        """
        Génère un manifest des billets pour une event
        
        Utilisé par le scanner PWA lors du téléchargement du manifest
        """
        from apps.tickets.models import Ticket
        
        # Filtrer les tickets
        if include_scanned:
            tickets_qs = Ticket.objects.filter(
                order__event=event_obj,
                order__status='completed'
            )
        else:
            tickets_qs = Ticket.objects.filter(
                order__event=event_obj,
                order__status='completed',
                status='unused'
            )
        
        manifest = {
            'event_id': str(event_obj.id),
            'event_name': event_obj.title,
            'generated_at': datetime.utcnow().isoformat(),
            'total_tickets': tickets_qs.count(),
            'tickets': []
        }
        
        for ticket in tickets_qs:
            encrypted_data = OfflineTicketManifest.encrypt_ticket_data(
                ticket.id,
                event_obj.id,
                f"{ticket.order.first_name} {ticket.order.last_name}",
                ticket.category.name
            )
            
            manifest['tickets'].append({
                'tid': str(ticket.id),
                'sig': ticket.qr_code_data,  # JWT signature
                'enc': encrypted_data,  # Chiffré pour offline
                'cat': ticket.category.name,
                'status': ticket.status
            })
        
        return manifest
    
    @staticmethod
    def get_manifest_hash(manifest: dict) -> str:
        """Génère un hash SHA256 du manifest pour la synchronisation"""
        manifest_str = json.dumps(manifest, sort_keys=True)
        return hashlib.sha256(manifest_str.encode()).hexdigest()


class OfflineSignatureValidator:
    """
    Valide les signatures en mode offline (JavaScript exécute la même logique)
    
    Utilisée par le scanner PWA pour la validation locale HMAC
    """
    
    @staticmethod
    def validate_offline_scan(qr_signature: str, ticket_id: str, 
                             event_id: str) -> dict:
        """
        Valide une signature de scan en mode offline
        
        Retourne: {valid: bool, reason: str}
        """
        # Vérifier la signature JWT même en offline
        result = QRCodeSignature.verify_ticket_signature(qr_signature, event_id)
        
        if not result['valid']:
            return {
                'valid': False,
                'reason': result['error']
            }
        
        payload = result['payload']
        if payload.get('t_id') != str(ticket_id):
            return {
                'valid': False,
                'reason': 'Ticket ID mismatch'
            }
        
        return {
            'valid': True,
            'reason': 'Valid ticket'
        }


# Security Middleware
class SecurityHeadersMiddleware:
    """Ajoute les headers de sécurité"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Headers CORS
        response['Access-Control-Allow-Origin'] = settings.ALLOWED_HOSTS[0]
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'SAMEORIGIN'
        response['X-XSS-Protection'] = '1; mode=block'
        
        # CSP pour les ressources CDN (HTMX, Tailwind)
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; "
            "img-src 'self' data:; "
            "font-src 'self' cdn.jsdelivr.net; "
            "connect-src 'self'; "
            "media-src 'self';"
        )
        
        return response
