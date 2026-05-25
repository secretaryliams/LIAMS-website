/**
 * LIAMS Offline Service Worker
 * Path: public/sw.js
 * 
 * Provides production-grade offline shell caching and static asset persistence.
 * Designed to work seamlessly with hashed production bundles on Vercel.
 */

const CACHE_NAME = 'liams-cache-v1.0.0';

// Core static assets required to bootstrap the basic offline app shell
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/logos/liams-logo-symbol.png',
  '/logos/liams-logo-full.png',
];

// 1. Install Event: Cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell and core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      // Force the waiting service worker to become active immediately
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up outdated caches from previous deployments
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim clients immediately so they are controlled by this worker without a page reload
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: Intercept network requests and provide smart fallbacks
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests (such as POST APIs, Supabase calls, etc.)
  if (request.method !== 'GET') return;

  // Strategy A: Navigation Requests (Users reloading or typing direct page routes like /about, /research)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If successful network call, dynamically update index.html cache in background
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/index.html', responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed (Offline) -> Serve the cached offline App Shell (index.html)
          console.log('[Service Worker] Offline: Serving App Shell fallback for navigation:', url.pathname);
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Strategy B: Core Website Assets (Javascript, Stylesheets, Local Images, Web Fonts)
  // Check if it belongs to our site origin or Google Fonts
  const isLocalAsset = url.origin === self.location.origin;
  const isGoogleFont = url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com');

  if (isLocalAsset || isGoogleFont) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache immediately to optimize speed, but update in background (Stale-While-Revalidate)
          // Except for large images or static fonts which we just serve directly
          const isLargeAsset = url.pathname.includes('/images/') || url.pathname.includes('/logos/');
          if (isLargeAsset) {
            return cachedResponse;
          }

          // Fetch and update cache in background
          fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
          }).catch(() => {}); // Suppress background fetch errors when offline

          return cachedResponse;
        }

        // Cache miss -> Fetch from network and save to cache dynamically
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
            return networkResponse;
          }
          
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          
          return networkResponse;
        }).catch((err) => {
          // Network fail and not in cache
          console.warn('[Service Worker] Failed to fetch asset:', url.pathname, err);
        });
      })
    );
  }
});
