const CACHE_NAME = 'fleet-monitor-cache-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/login',
  // Add other critical assets like JS bundles, images, etc.
  // You might need to inspect your Next.js build output to get accurate paths
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Prevent caching of chrome-extension:// URLs
  if (!event.request.url.startsWith('http:') && !event.request.url.startsWith('https:')) {
    return;
  }

  // Check if the request is for an API endpoint
  const apiBaseUrl = self.location.origin; // Assuming API is on the same origin
  if (event.request.url.startsWith(apiBaseUrl + '/api/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          // Fallback to network
          return fetch(event.request).then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We consume it once to cache it,
            // and once the browser consumes it.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }).catch(() => {
            // If both cache and network fail, you might want to return a fallback response
            // or an offline page for API requests.
            return new Response('<h1>Offline</h1><p>No internet connection and no cached data available.</p>', { headers: { 'Content-Type': 'text/html' } });
          });
        })
    );
  } else {
    // For other assets, use the existing cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request).then(
            (response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // IMPORTANT: Clone the response. A response is a stream
              // and can only be consumed once. We consume it once to cache it,
              // and once the browser consumes it.
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            }
          );
        })
      );
  }
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
