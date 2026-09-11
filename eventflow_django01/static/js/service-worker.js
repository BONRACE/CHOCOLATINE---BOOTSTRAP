/**
 * Service Worker — EventFlow Scan
 *
 * Rôle : mettre en cache le "shell" applicatif (HTML/CSS/JS du scanner) pour
 * que l'app s'ouvre même sans réseau. La validation des billets elle-même ne
 * dépend pas du Service Worker : elle repose sur le manifeste stocké dans
 * IndexedDB par scanner.js (voir downloadManifest()).
 */

const CACHE_NAME = "eventflow-scan-v1";
const SHELL_URLS = [
  "/static/js/scanner.js",
  "/static/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ne jamais mettre en cache les appels API (vérification, sync, manifeste
  // de billets) : ces requêtes doivent soit réussir en direct, soit échouer
  // proprement pour laisser scanner.js basculer sur la logique hors-ligne.
  if (url.pathname.startsWith("/scanner/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
