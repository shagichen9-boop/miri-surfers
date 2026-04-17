// Local dev + GitHub Pages: asset URLs follow this script's path (website is unchanged; this file is disk-only).
const BASE = self.location.pathname.replace(/\/service-worker\.js$/i, '');
const full = (suffix) => {
  if (!suffix.startsWith('/')) suffix = '/' + suffix;
  return BASE + suffix;
};

const CACHE = 'miri-surfers-v6';
const ASSETS = [
  full('/'),
  full('/index.html'),
  full('/icon-192.png'),
  full('/icon-512.png'),
  full('/manifest.json')
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      });
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
