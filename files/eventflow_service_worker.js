// static/js/service-worker.js
const CACHE_NAME = 'eventflow-scanner-v1';
const URLS_TO_CACHE = [
  '/',
  '/scanner/',
  '/static/js/scanner.js',
  '/static/js/qrcode-scan.js',
  '/static/js/offline-sync.js',
  '/static/css/tailwind.css',
  '/static/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app shell');
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        console.warn('Failed to cache some resources:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie Network First, fallback to Cache
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // API calls - Network First
  if (request.url.includes('/api/') || request.url.includes('/scanner/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(request, response.clone());
              return response;
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || new Response('Offline - No cached response', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
  } else {
    // Static resources - Cache First
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        }).catch(() => {
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
    );
  }
});

// Message handling pour background sync
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
