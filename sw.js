// Mareas de Amigas: guarda la app en el celular para que abra al instante
const VERSION = 'mareas-v2';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Los datos (Apps Script) y las fotos (Drive) siempre van a internet
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleusercontent.com')) return;
  // Archivos de la app: responde al instante con lo guardado y actualiza por detrás
  e.respondWith(caches.open(VERSION).then(async cache => {
    const guardado = await cache.match(e.request, { ignoreSearch: true });
    const red = fetch(e.request).then(r => {
      if (r.ok && (url.origin === location.origin || url.hostname.includes('fonts.g'))) cache.put(e.request, r.clone());
      return r;
    }).catch(() => guardado);
    return guardado || red;
  }));
});
