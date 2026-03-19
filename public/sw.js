const CACHE_NAME = 'subway-schedule-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.error('Cache addAll failed:', err);
      });
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
