const CACHE_NAME = 'p2p-video-call-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/theme.css',
  '/manifest.json',    
  '/js/app.js',  
  '/js/components/p2p-video-call.js',
  '/js/components/app-header.js',
  '/js/components/initiator-form.js',
  '/js/components/joiner-form.js',
  '/js/components/video-container.js',
  '/js/components/app-footer.js',
  '/js/modules/media-manager.js',
  '/js/modules/webrtc-handler.js',
  '/js/modules/mobile-optimizer.js',
  '/js/modules/utils.js'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});