// static/js/offline-sync.js
class OfflineSync {
  constructor(scanner) {
    this.scanner = scanner;
    this.db = scanner.db;
    this.eventId = scanner.eventId;
    this.csrfToken = scanner.csrfToken;
    this.isSyncing = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }
  
  async addPendingScan(scanData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pending_scans'], 'readwrite');
      const store = transaction.objectStore('pending_scans');
      
      const request = store.add({
        ...scanData,
        status: 'pending',
        timestamp: scanData.timestamp || new Date().toISOString(),
        retry_count: 0
      });
      
      request.onsuccess = () => {
        console.log('Scan added to queue:', scanData.ticket_id);
        resolve(request.result);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  async getPendingScans() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pending_scans']);
      const store = transaction.objectStore('pending_scans');
      const index = store.index('status');
      
      const request = index.getAll('pending');
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async markScanSynced(scanId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pending_scans'], 'readwrite');
      const store = transaction.objectStore('pending_scans');
      
      const request = store.get(scanId);
      
      request.onsuccess = () => {
        const scan = request.result;
        scan.status = 'synced';
        const updateRequest = store.put(scan);
        
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  async sync() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }
    
    this.isSyncing = true;
    
    try {
      const pendingScans = await this.getPendingScans();
      
      if (pendingScans.length === 0) {
        console.log('No pending scans to sync');
        this.isSyncing = false;
        return;
      }
      
      console.log(`Syncing ${pendingScans.length} scans...`);
      
      // Préparer les données pour l'API
      const scansToSync = pendingScans.map(scan => ({
        ticket_id: scan.ticket_id,
        qr_data: scan.qr_data,
        timestamp: scan.timestamp
      }));
      
      // Appeler l'API de sync
      const response = await fetch('/scanner/api/sync/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          event_id: this.eventId,
          scans: scansToSync
        })
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Marquer les scans comme synchronisés
      for (const scan of pendingScans) {
        if (!result.failed_scans.some(f => f.ticket_id === scan.ticket_id)) {
          await this.markScanSynced(scan.id);
        }
      }
      
      console.log(`Sync complete: ${result.synced} synced, ${result.failed} failed`);
      this.showSyncNotification(result);
      this.retryCount = 0;
      
    } catch (error) {
      console.error('Sync error:', error);
      this.handleSyncError(error);
    } finally {
      this.isSyncing = false;
    }
  }
  
  async handleSyncError(error) {
    this.retryCount++;
    
    if (this.retryCount < this.maxRetries) {
      // Attendre avant de réessayer (exponential backoff)
      const delay = Math.pow(2, this.retryCount) * 1000;
      console.log(`Retrying sync in ${delay}ms...`);
      
      setTimeout(() => this.sync(), delay);
    } else {
      console.error('Max retries reached');
      this.showSyncNotification({
        synced: 0,
        failed: 1,
        error: 'Impossible de synchroniser - connexion perdue'
      });
    }
  }
  
  showSyncNotification(result) {
    const notification = document.getElementById('sync-notification');
    const notificationText = notification.querySelector('[id^="sync-text"]');
    
    if (result.error) {
      notificationText.textContent = result.error;
      notification.classList.add('bg-red-100');
      notification.classList.remove('bg-green-100');
    } else {
      notificationText.textContent = `Synchronisé: ${result.synced} tickets`;
      notification.classList.add('bg-green-100');
      notification.classList.remove('bg-red-100');
    }
    
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
  }
  
  // Bouton de sync manuel dans l'interface
  setupSyncButton() {
    const syncButton = document.getElementById('sync-btn');
    if (syncButton) {
      syncButton.addEventListener('click', async () => {
        syncButton.disabled = true;
        syncButton.textContent = 'Synchronisation...';
        
        await this.sync();
        
        syncButton.disabled = false;
        syncButton.textContent = 'Synchroniser';
      });
    }
  }
}

// Détection de l'état de la connexion
class NetworkStatusMonitor {
  constructor(scanner) {
    this.scanner = scanner;
    this.setupListeners();
  }
  
  setupListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Checker la connexion en arrière-plan
    setInterval(() => this.checkConnection(), 30000);
  }
  
  handleOnline() {
    console.log('Device is online');
    this.scanner.updateStatusBar('En ligne', true);
    
    // Sync immédiatement
    if (this.scanner.offlineSync) {
      this.scanner.offlineSync.sync();
    }
  }
  
  handleOffline() {
    console.log('Device is offline');
    this.scanner.updateStatusBar('Hors-ligne', false);
  }
  
  async checkConnection() {
    try {
      const response = await fetch('/scanner/api/status/', {
        method: 'GET',
        cache: 'no-store'
      });
      
      if (response.ok) {
        this.handleOnline();
      } else {
        this.handleOffline();
      }
    } catch (error) {
      this.handleOffline();
    }
  }
}

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  const eventId = document.querySelector('[data-event-id]')?.getAttribute('data-event-id');
  const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]')?.value || 
                   document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  if (eventId && csrfToken) {
    window.scanner = new EventFlowScanner(eventId, csrfToken);
    window.networkMonitor = new NetworkStatusMonitor(window.scanner);
    
    // Setup le bouton de sync
    if (window.scanner.offlineSync) {
      window.scanner.offlineSync.setupSyncButton();
    }
  }
});
