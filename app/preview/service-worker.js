const CACHE_VERSION = 'v9';
const CACHE_NAME = `led-vocab-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'app.css',
  'manifest.webmanifest',
  'favicon.ico',
  'fonts/JF-Dot-jiskan16-inverted-bitdepth1-spritesheet.png',
  'fonts/JF-Dot-jiskan16.fnt.json',
  'datasets/jlpt-words-by-level.json',
  'datasets/jawiki-2022-08-29.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const isSameOrigin = new URL(event.request.url).origin === location.origin;
  const isGetRequest = event.request.method === 'GET';

  // Assume cross-origin requests aren't cacheable (no CDNs!)
  if (!isGetRequest || !isSameOrigin) return;

  const req = event.request;
  const res = (async () => {
    try {
      let response = await caches.match(req);
      if (!response) {
        response = await fetch(req);
        if (response && response.status == 200) {
          console.log('[ServiceWorker] Cache miss:', req.url);
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
      }
      return response;
    } catch {
      throw new Error('[ServiceWorker] Fetch failed:', req.url);
    }
  })();

  event.respondWith(res);
});
