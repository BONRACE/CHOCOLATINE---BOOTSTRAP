// static/js/scanner.js
class EventFlowScanner {
  constructor(eventId, csrfToken) {
    this.eventId = eventId;
    this.csrfToken = csrfToken;
    this.isOnline = navigator.onLine;
    this.db = null;
    this.currentSession = null;
    this.soundManager = new SoundManager();
    this.offlineSync = new OfflineSync(this);
    
    this.init();
  }
  
  async init() {
    // Enregistrer Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/static/js/service-worker.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    
    // Initialiser IndexedDB
    await this.initIndexedDB();
    
    // Charger le manifest des billets en offline
    if (this.isOnline) {
      await this.downloadManifest();
    } else {
      await this.loadManifestFromCache();
    }
    
    // Écouter les changements de connexion
    window.addEventListener('online', () => this.onOnline());
    window.addEventListener('offline', () => this.onOffline());
    
    // Initialiser l'interface de scan
    this.initScanInterface();
  }
  
  initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EventFlowScanner', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store pour le manifest des billets
        if (!db.objectStoreNames.contains('tickets')) {
          const ticketStore = db.createObjectStore('tickets', { keyPath: 'tid' });
          ticketStore.createIndex('event_id', 'e_id', { unique: false });
          ticketStore.createIndex('status', 'status', { unique: false });
        }
        
        // Store pour les scans en attente de sync
        if (!db.objectStoreNames.contains('pending_scans')) {
          const scanStore = db.createObjectStore('pending_scans', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          scanStore.createIndex('status', 'status', { unique: false });
          scanStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Store pour le manifest (metadata)
        if (!db.objectStoreNames.contains('manifest_meta')) {
          db.createObjectStore('manifest_meta', { keyPath: 'event_id' });
        }
      };
    });
  }
  
  async downloadManifest() {
    try {
      const response = await fetch(`/scanner/api/manifest/${this.eventId}/`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error('Failed to download manifest');
      
      const manifest = await response.json();
      const manifestHash = response.headers.get('X-Manifest-Hash');
      
      // Sauvegarder en IndexedDB
      await this.saveManifestToCache(manifest, manifestHash);
      
      this.updateStatusBar('En ligne', true);
    } catch (error) {
      console.error('Failed to download manifest:', error);
      this.updateStatusBar('Erreur de téléchargement', false);
    }
  }
  
  async saveManifestToCache(manifest, hash) {
    const transaction = this.db.transaction(['tickets', 'manifest_meta'], 'readwrite');
    
    // Sauvegarder les billets
    const ticketStore = transaction.objectStore('tickets');
    for (const ticket of manifest.tickets) {
      await new Promise((resolve, reject) => {
        const request = ticketStore.put(ticket);
        request.onsuccess = resolve;
        request.onerror = reject;
      });
    }
    
    // Sauvegarder les métadonnées
    const metaStore = transaction.objectStore('manifest_meta');
    await new Promise((resolve, reject) => {
      const request = metaStore.put({
        event_id: this.eventId,
        hash: hash,
        timestamp: new Date().toISOString(),
        total_tickets: manifest.total_tickets
      });
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }
  
  async loadManifestFromCache() {
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['manifest_meta']);
      const store = transaction.objectStore('manifest_meta');
      const request = store.get(this.eventId);
      
      request.onsuccess = () => {
        if (request.result) {
          console.log('Manifest loaded from cache');
          resolve(request.result);
        } else {
          console.warn('No cached manifest found');
          resolve(null);
        }
      };
    });
  }
  
  initScanInterface() {
    // Initialiser le lecteur QR
    const videoElement = document.getElementById('qr-video');
    const canvasElement = document.getElementById('qr-canvas');
    
    if (videoElement) {
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
          const cameraId = devices[0].id;
          
          const html5QrCode = new Html5Qrcode(videoElement.id);
          
          html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            qrCodeMessage => this.onQRCodeDetected(qrCodeMessage, html5QrCode),
            errorMessage => console.log(errorMessage)
          ).catch(err => console.error('Failed to start camera:', err));
        }
      }).catch(err => console.error('Failed to get cameras:', err));
    }
  }
  
  async onQRCodeDetected(qrData, html5QrCode) {
    // Pause le scan temporairement
    await html5QrCode.pause(true);
    
    const result = await this.processQRCode(qrData);
    
    // Afficher le feedback
    this.showFeedback(result);
    
    // Reprendre après 2 secondes
    setTimeout(() => html5QrCode.resume(), 2000);
  }
  
  async processQRCode(qrData) {
    if (!this.isOnline) {
      return this.validateOffline(qrData);
    }
    
    return this.validateOnline(qrData);
  }
  
  validateOffline(qrData) {
    return new Promise((resolve) => {
      // Valider en offline - vérifié par IndexedDB
      const transaction = this.db.transaction(['tickets']);
      const store = transaction.objectStore('tickets');
      
      // Le QR code contient le JWT signé
      // Extraire le ticket_id du JWT (simplifié)
      try {
        const parts = qrData.split('.');
        if (parts.length !== 3) {
          resolve({
            success: false,
            status: 'invalid',
            reason: 'Format QR invalide',
            sound: 'error'
          });
          return;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const ticketId = payload.t_id;
        
        const request = store.get(ticketId);
        
        request.onsuccess = () => {
          const ticket = request.result;
          
          if (!ticket) {
            resolve({
              success: false,
              status: 'unknown',
              reason: 'Billet inconnu',
              sound: 'error'
            });
            return;
          }
          
          if (ticket.status === 'scanned') {
            resolve({
              success: false,
              status: 'already_scanned',
              reason: 'Déjà scanné (mode offline)',
              sound: 'error'
            });
            return;
          }
          
          // Marquer comme scanné localement
          this.markTicketScanned(ticketId);
          
          // Ajouter à la queue de sync
          this.offlineSync.addPendingScan({
            ticket_id: ticketId,
            qr_data: qrData,
            timestamp: new Date().toISOString()
          });
          
          resolve({
            success: true,
            status: 'valid',
            participant_name: ticket.name || 'Participant',
            category: ticket.cat,
            sound: 'success'
          });
        };
        
        request.onerror = () => {
          resolve({
            success: false,
            status: 'error',
            reason: 'Erreur de base de données',
            sound: 'error'
          });
        };
      } catch (e) {
        resolve({
          success: false,
          status: 'invalid',
          reason: 'Impossible de décoder le QR code',
          sound: 'error'
        });
      }
    });
  }
  
  async validateOnline(qrData) {
    try {
      const response = await fetch('/scanner/api/scan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          qr_data: qrData,
          event_id: this.eventId,
          offline: false
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to validate ticket:', error);
      return {
        success: false,
        status: 'error',
        reason: 'Erreur de connexion',
        sound: 'error'
      };
    }
  }
  
  markTicketScanned(ticketId) {
    const transaction = this.db.transaction(['tickets'], 'readwrite');
    const store = transaction.objectStore('tickets');
    const request = store.get(ticketId);
    
    request.onsuccess = () => {
      const ticket = request.result;
      if (ticket) {
        ticket.status = 'scanned';
        store.put(ticket);
      }
    };
  }
  
  showFeedback(result) {
    const modal = document.getElementById('feedback-modal');
    const icon = modal.querySelector('[id^="feedback-icon"]');
    const title = modal.querySelector('[id^="feedback-title"]');
    const message = modal.querySelector('[id^="feedback-message"]');
    
    if (result.success) {
      modal.classList.add('bg-green-50');
      modal.classList.remove('bg-red-50');
      icon.innerHTML = '✓';
      icon.className = 'text-4xl text-green-600';
      title.textContent = result.participant_name;
      message.textContent = `${result.category}`;
    } else {
      modal.classList.add('bg-red-50');
      modal.classList.remove('bg-green-50');
      icon.innerHTML = '✗';
      icon.className = 'text-4xl text-red-600';
      title.textContent = 'Invalide';
      message.textContent = result.reason;
    }
    
    // Jouer le son
    this.soundManager.play(result.sound);
    
    // Mettre à jour le compteur
    this.updateCounter();
    
    // Afficher le modal
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('hidden'), 2000);
  }
  
  updateCounter() {
    const transaction = this.db.transaction(['tickets']);
    const store = transaction.objectStore('tickets');
    const index = store.index('status');
    const request = index.count('scanned');
    
    request.onsuccess = () => {
      const counter = document.getElementById('scanned-count');
      if (counter) {
        counter.textContent = request.result;
      }
    };
  }
  
  updateStatusBar(status, isOnline) {
    const statusBar = document.getElementById('status-bar');
    const statusText = statusBar.querySelector('[id^="status-text"]');
    const statusBadge = statusBar.querySelector('[id^="status-badge"]');
    
    statusText.textContent = status;
    
    if (isOnline) {
      statusBadge.className = 'inline-block w-3 h-3 bg-green-500 rounded-full';
    } else {
      statusBadge.className = 'inline-block w-3 h-3 bg-red-500 rounded-full';
    }
  }
  
  onOnline() {
    this.isOnline = true;
    this.updateStatusBar('En ligne', true);
    this.downloadManifest();
    this.offlineSync.sync();
  }
  
  onOffline() {
    this.isOnline = false;
    this.updateStatusBar('Hors-ligne', false);
  }
}

// Gestionnaire de sons
class SoundManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {
      success: this.createSuccessSound.bind(this),
      error: this.createErrorSound.bind(this)
    };
  }
  
  play(soundType) {
    if (this.sounds[soundType]) {
      this.sounds[soundType]();
    }
  }
  
  createSuccessSound() {
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.frequency.value = 800;
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  }
  
  createErrorSound() {
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.frequency.value = 400;
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  }
}
