// Service Worker for Pearllink - Performance and Caching
const CACHE_NAME = 'pearllink-v1.0.0';
const STATIC_CACHE = 'pearllink-static-v1';
const DYNAMIC_CACHE = 'pearllink-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.min.css',
    '/styles-enhanced.css',
    '/script.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Serving from cache:', request.url);
                    return cachedResponse;
                }

                // Otherwise fetch from network
                console.log('Fetching from network:', request.url);
                return fetch(request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Return a generic offline response for other requests
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

// Push notifications (for future use)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View Details',
                    icon: '/icon-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icon-192x192.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function for background sync
async function doBackgroundSync() {
    try {
        // Get pending form submissions from IndexedDB
        const pendingSubmissions = await getPendingSubmissions();
        
        for (const submission of pendingSubmissions) {
            try {
                const response = await fetch(submission.url, {
                    method: submission.method,
                    headers: submission.headers,
                    body: submission.body
                });

                if (response.ok) {
                    // Remove from pending submissions
                    await removePendingSubmission(submission.id);
                    console.log('Background sync successful for:', submission.id);
                }
            } catch (error) {
                console.error('Background sync failed for:', submission.id, error);
            }
        }
    } catch (error) {
        console.error('Background sync error:', error);
    }
}

// IndexedDB helpers (simplified)
async function getPendingSubmissions() {
    // In a real implementation, you would use IndexedDB
    // For now, return empty array
    return [];
}

async function removePendingSubmission(id) {
    // In a real implementation, you would remove from IndexedDB
    console.log('Removing pending submission:', id);
}

// Performance monitoring
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'PERFORMANCE_METRIC') {
        console.log('Performance metric:', event.data.metric);
        
        // Send to analytics service
        if (event.data.metric.loadTime > 3000) {
            console.warn('Slow page load detected:', event.data.metric.loadTime);
        }
    }
});

// Cache size management
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

console.log('Service Worker loaded successfully');
