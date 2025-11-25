const CACHE_VERSION = 'v4';
const CACHE_NAME = `led-vocab-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'app.css',
  'manifest.webmanifest',
  'favicon.ico',
  '3rd-party/bootstrap/bootstrap.bundle.min.js',
  '3rd-party/bootstrap/bootstrap.bundle.min.js.map',
  '3rd-party/bootstrap/bootstrap.min.css',
  '3rd-party/bootstrap-icons/bootstrap-icons.css',
  '3rd-party/bootstrap-icons/bootstrap-icons.min.css',
  '3rd-party/bootstrap-icons/fonts/bootstrap-icons.woff',
  '3rd-party/bootstrap-icons/fonts/bootstrap-icons.woff2',
  'fonts/JF-Dot-jiskan16-1990.woff2',
  'js/app.js',
  'js/data-sources.js',
  'js/DisplayBuffer.js',
  'js/DisplayBufferPair.js',
  'js/effects.js',
  'js/hardware.js',
  'js/MarqueeText.js',
  'js/util.js',
  'js/usb-serial/SerialControllerFactory.js',
  'js/usb-serial/environments/web/PortMutex.js',
  'js/usb-serial/environments/web/PortOperations.js',
  'js/usb-serial/environments/web/ports.js',
  'js/usb-serial/firmware/framework-official/CommandAbstractionLayer.js',
  'js/usb-serial/firmware/framework-official/commands.js',
  'js/usb-serial/firmware/sigroot/CommandAbstractionLayer.js',
  'js/usb-serial/firmware/sigroot/commands.js',
  'datasets/jlpt-words-by-level.json',
  'datasets/jawiki-2022-08-29.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
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
 
  // Avoid the gnarly `then` chain
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
      console.log('[ServiceWorker] Fetch failed:', req.url);
    }
  })();

  event.respondWith(res);
});
