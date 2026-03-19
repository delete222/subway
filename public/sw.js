const CACHE_NAME = 'subway-schedule-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/apple-touch-icon.jpg',
  '/favicon.png',
  '/apple-touch-icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use allSettled to ensure installation continues even if one asset fails
      return Promise.allSettled(
        ASSETS.map((asset) => cache.add(asset))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we have a cached response, return it. Otherwise fetch from network.
      if (response) {
        return response;
      }
      
      // For navigation requests, try to return index.html if possible
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html') || fetch(event.request);
      }
      
      return fetch(event.request);
    })
  );
});
