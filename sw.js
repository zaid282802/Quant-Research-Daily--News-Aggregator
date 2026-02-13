/**
 * Quant Research Daily (QRD)
 * Copyright (c) 2025-2026 Zaid Annigeri
 * Licensed under the MIT License
 * https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator
 */

/**
 * Service Worker for Quant Research Daily
 * Provides offline access to cached news and assets
 */

const CACHE_NAME = 'qrd-cache-v1';
const STATIC_CACHE = 'qrd-static-v1';
const DATA_CACHE = 'qrd-data-v1';

// Static assets to cache
const STATIC_ASSETS = [
    './',
    './index.html',
    './archive.html',
    './research-ideas.html',
    './dashboard.html',
    './calendar.html',
    './papers.html',
    './correlations.html',
    './cot.html',
    './styles.css',
    './app.js',
    './volatility.js',
    './factors.js',
    './charts.js',
    './storage.js',
    './calendar.js',
    './papers.js',
    './correlations.js',
    './cot.js',
    './backtest-templates.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
    'https://d3js.org/d3.v7.min.js'
];

// API endpoints to cache
const API_PATTERNS = [
    /api\.rss2json\.com/,
    /query1\.finance\.yahoo\.com/,
    /feeds\.wsj\.com/,
    /feeds\.reuters\.com/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) URLs
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Strategy based on request type
    if (isStaticAsset(url)) {
        // Static assets: Cache first, network fallback
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isAPIRequest(url)) {
        // API requests: Network first, cache fallback
        event.respondWith(networkFirst(request, DATA_CACHE));
    } else {
        // Other requests: Network first
        event.respondWith(networkFirst(request, DATA_CACHE));
    }
});

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
    const staticExtensions = ['.html', '.css', '.js', '.woff', '.woff2', '.ttf', '.png', '.jpg', '.svg', '.ico'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
           url.hostname === 'fonts.googleapis.com' ||
           url.hostname === 'fonts.gstatic.com' ||
           url.hostname === 'd3js.org';
}

/**
 * Check if URL is an API request
 */
function isAPIRequest(url) {
    return API_PATTERNS.some(pattern => pattern.test(url.href));
}

/**
 * Cache first strategy
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // Return cached response and update cache in background
        updateCache(request, cacheName);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache first failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network first strategy
 */
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
        }

        // No cache available
        console.error('[SW] Network and cache failed:', error);
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'This content is not available offline'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Update cache in background
 */
async function updateCache(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silent fail for background update
    }
}

// Message handler for manual cache operations
self.addEventListener('message', (event) => {
    const { action, data } = event.data;

    switch (action) {
        case 'skipWaiting':
            self.skipWaiting();
            break;

        case 'clearCache':
            event.waitUntil(
                caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    );
                }).then(() => {
                    event.ports[0].postMessage({ success: true });
                })
            );
            break;

        case 'getCacheStats':
            event.waitUntil(
                getCacheStats().then((stats) => {
                    event.ports[0].postMessage(stats);
                })
            );
            break;

        case 'cacheNews':
            event.waitUntil(
                cacheNewsData(data).then(() => {
                    event.ports[0].postMessage({ success: true });
                })
            );
            break;
    }
});

/**
 * Get cache statistics
 */
async function getCacheStats() {
    const stats = {
        caches: []
    };

    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats.caches.push({
            name: cacheName,
            entries: keys.length
        });
    }

    return stats;
}

/**
 * Cache news data manually
 */
async function cacheNewsData(newsItems) {
    const cache = await caches.open(DATA_CACHE);

    // Create a response with the news data
    const response = new Response(JSON.stringify(newsItems), {
        headers: {
            'Content-Type': 'application/json',
            'X-Cached-At': new Date().toISOString()
        }
    });

    await cache.put('/api/news-cache', response);
}

// Periodic sync for background updates (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'news-sync') {
        event.waitUntil(syncNews());
    }
});

/**
 * Background sync for news
 */
async function syncNews() {
    try {
        // Fetch fresh news
        const response = await fetch('/api/news'); // This would be your actual API endpoint
        const news = await response.json();

        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'NEWS_UPDATED',
                data: news
            });
        });
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New market update available',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'view', title: 'View News' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Quant Research Daily', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[SW] Service worker loaded');
