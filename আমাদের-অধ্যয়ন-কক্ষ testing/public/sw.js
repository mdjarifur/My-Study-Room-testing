// Service Worker for আমার অধ্যয়ন কক্ষ (PWA & Android TWA)
const CACHE_NAME = 'amar-odhyoyon-kokkho-v101';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/admin.html',
  '/privacy.html',
  '/terms.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/css/app.css',
  '/css/room.css',
  '/css/exam.css',
  '/css/admin.css',
  '/js/config.js',
  '/js/app.js',
  '/js/entry.js',
  '/js/points.js',
  '/js/exam.js',
  '/js/study.js',
  '/img/aquarium.webp',
  '/img/login_logo.png'
];

function isFirebaseOrRealtimeRequest(url) {
  const host = url.hostname;
  return (
    host.includes('firebaseio.com') ||
    host.includes('firebasedatabase.app') ||
    host.includes('firestore.googleapis.com') ||
    host.includes('identitytoolkit.googleapis.com') ||
    host.includes('securetoken.googleapis.com') ||
    host.includes('firebase.googleapis.com') ||
    host.includes('firebasestorage.googleapis.com') ||
    url.pathname.startsWith('/__/') ||
    url.pathname.startsWith('/api/')
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) => cache.add(asset))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (isFirebaseOrRealtimeRequest(url)) return;
  if (url.origin !== self.location.origin) return;

  // Navigation requests: Network-first, automatically serving offline.html when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(async () => {
          const offlinePage =
            (await caches.match(OFFLINE_URL)) ||
            (await caches.match(OFFLINE_URL, { ignoreSearch: true }));
          if (offlinePage) return offlinePage;
          return new Response(
            '<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>সংযোগ বিচ্ছিন্ন — আমার অধ্যয়ন কক্ষ</title></head><body style="margin:0;background:#0f172a;color:#f8fafc;font-family:sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px"><div style="max-width:380px;background:#1e293b;border-radius:20px;padding:28px 22px"><h2 style="margin:0 0 12px;font-size:19px">ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে, পুনরায় চেষ্টা করুন</h2><button type="button" onclick="location.reload()" style="margin-top:10px;padding:12px 22px;border:0;border-radius:12px;background:#10b981;color:#fff;font-weight:700;font-size:15px;cursor:pointer">আবার চেষ্টা করুন</button></div></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // HTML fragments, manifest, JS, and CSS: Network-first with cache fallback
  if (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true }));
          if (cached) return cached;
          return new Response('', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Static media & icons: Cache-first with background network fallback
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return caches.match(req, { ignoreSearch: true }).then((looseCached) => {
        if (looseCached) return looseCached;
        return fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return networkResponse;
          })
          .catch(() => new Response('', { status: 503, statusText: 'Offline' }));
      });
    })
  );
});
