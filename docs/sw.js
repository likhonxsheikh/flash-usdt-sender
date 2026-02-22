const CACHE_NAME = 'flash-usdt-docs-v1';
const ASSETS = [
  '/flash-usdt-sender/',
  '/flash-usdt-sender/index.html',
  '/flash-usdt-sender/assets/usdt-logo.png',
  '/flash-usdt-sender/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
