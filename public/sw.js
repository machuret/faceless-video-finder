
// Service Worker for YTFaceless - Offline caching and performance boost
const CACHE_NAME = 'ytfaceless-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/og-image.png',
  '/placeholder.svg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service worker pre-caching assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Pre-caching failed:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service worker removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache, then network with cache update
self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension') ||
      event.request.url.includes('extension') ||
      // Skip supabase API requests - they're handled by React Query
      event.request.url.includes('supabase.co')) {
    return;
  }
  
  // For page navigations (HTML requests), use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // For static assets (JS, CSS, images), use cache-first strategy
  if (
    event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // Update cache in the background (cache-then-network)
          fetch(event.request).then(response => {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }).catch(() => {/* swallow error */});
          
          return cachedResponse;
        }
        
        // If not in cache, fetch from network and cache
        return fetch(event.request).then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // For all other requests, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('Cache cleared by application');
      event.ports[0].postMessage({ status: 'success' });
    }).catch(error => {
      console.error('Failed to clear cache:', error);
      event.ports[0].postMessage({ status: 'error', message: error.message });
    });
  }
});
