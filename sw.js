/* Bump CACHE when any app file changes: the page then offers "Update now" (js/pwa.js),
   and the new worker takes over only when the user accepts. */
const CACHE = 'origami-v2';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/notify.css',
  './js/notify.js',
  './js/diagrams.js',
  './js/app.js',
  './js/pwa.js',
  './images/texture.png',
  './images/icon.svg',
  './images/icon-maskable.svg',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
  './images/icons/maskable-192.png',
  './images/icons/maskable-512.png',
  './images/icons/apple-touch-icon.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

/* the page's "Update now" button */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first for the app shell (so a new version arrives only through an update); network for the rest.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.ok && !url.pathname.includes('/screens/')) cache.put(req, res.clone());
        return res;
      } catch (e) {
        if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
        return Response.error();
      }
    })
  );
});
