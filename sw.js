// Kiwi Church Service Worker
const CACHE_NAME = 'kiwichurch-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './about.html',
    './communities.html',
    './calendar.html',
    './kete.html',
    './resources.html',
    './giving.html',
    './portal.html',
    './css/styles.css',
    './js/main.js',
    './js/portal.js',
    './manifest.json',
    './KiwiChurch_Old_White.png',
    './KiwiChurch_Old_White_Shadow.png',
    './HansonsLaneOpening-2131a.jpg',
    './icons/icon-144.png',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.log('[SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (url.origin !== location.origin) return;

    // Skip Firebase/API requests (will be added in Stage 2)
    if (url.pathname.includes('firestore') || url.pathname.includes('firebase')) return;

    event.respondWith(
        fetch(request)
            .then(response => {
                // Clone the response for caching
                const responseClone = response.clone();

                // Cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(request, responseClone);
                        });
                }

                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // For navigation requests, return appropriate page
                        if (request.mode === 'navigate') {
                            // Try to return the requested page or fallback to index
                            return caches.match('./index.html');
                        }

                        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                    });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
