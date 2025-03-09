
// Service Worker for caching assets and enabling offline support

const CACHE_NAME = 'faceless-finder-cache-v1';
const RUNTIME = 'runtime';

// Resources to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/placeholder.svg',
  '/favicon.ico',
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// Activation event: clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache, falling back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    // Strategy for images: cache-first with stale-while-revalidate behavior
    if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
      return event.respondWith(
        caches.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();
            
            // Add response to cache
            caches.open(RUNTIME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          });
          
          // Return cached response immediately if available, while fetching in the background
          return cachedResponse || fetchPromise;
        })
      );
    }
    
    // Default network-first strategy for other requests
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // For API requests, use stale-while-revalidate
          if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
            fetch(event.request).then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(RUNTIME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }).catch(() => {
              // Network request failed, but we already have a cached response
            });
          }
          
          return cachedResponse;
        }
        
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(RUNTIME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
    );
  }
});
