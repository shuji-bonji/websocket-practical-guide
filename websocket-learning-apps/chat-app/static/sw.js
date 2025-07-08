// Service Worker for WebSocket Chat App PWA
const STATIC_CACHE_NAME = 'chat-app-static-v1';
const DYNAMIC_CACHE_NAME = 'chat-app-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/_app/immutable/entry/start.js',
  '/_app/immutable/entry/app.js',
  '/_app/immutable/assets/_layout.css',
  '/_app/immutable/assets/_page.css'
];

// API endpoints that should be cached
const CACHE_API_ROUTES = ['/api/auth/refresh'];

// Maximum number of items in dynamic cache
const DYNAMIC_CACHE_LIMIT = 50;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);

  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful responses for specific routes
    if (response.ok && CACHE_API_ROUTES.some((route) => url.pathname.includes(route))) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache');

    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for specific endpoints
    if (url.pathname.includes('/auth/refresh')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Offline - please check your connection'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    throw error;
  }
}

// Handle navigation requests with cache-first for app shell
async function handleNavigationRequest(request) {
  try {
    // Try cache first for app shell
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fall back to network
    const response = await fetch(request);

    // Cache the response
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    await cache.put(request, response.clone());

    return response;
  } catch {
    console.log('[SW] Navigation request failed');

    // Return offline page
    return new Response(
      `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Chat App - Offline</title>
				<style>
					body { 
						font-family: system-ui, sans-serif; 
						text-align: center; 
						padding: 2rem;
						background: #f3f4f6;
					}
					.offline-container {
						max-width: 400px;
						margin: 2rem auto;
						padding: 2rem;
						background: white;
						border-radius: 8px;
						box-shadow: 0 4px 6px rgba(0,0,0,0.1);
					}
					.icon { font-size: 3rem; margin-bottom: 1rem; }
					.title { font-size: 1.5rem; margin-bottom: 1rem; color: #374151; }
					.message { color: #6b7280; margin-bottom: 2rem; }
					.retry-btn {
						background: #3b82f6;
						color: white;
						border: none;
						padding: 0.75rem 1.5rem;
						border-radius: 6px;
						cursor: pointer;
					}
					.retry-btn:hover { background: #2563eb; }
				</style>
			</head>
			<body>
				<div class="offline-container">
					<div class="icon">📡</div>
					<h1 class="title">You're Offline</h1>
					<p class="message">
						Check your internet connection and try again.
						Your messages will sync when you're back online.
					</p>
					<button class="retry-btn" onclick="location.reload()">
						Try Again
					</button>
				</div>
			</body>
			</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fall back to network
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);

      // Limit cache size
      await limitCacheSize(DYNAMIC_CACHE_NAME, DYNAMIC_CACHE_LIMIT);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Static request failed:', request.url);
    throw error;
  }
}

// Utility function to limit cache size
async function limitCacheSize(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > limit) {
    // Remove oldest entries
    const itemsToDelete = keys.slice(0, keys.length - limit);
    await Promise.all(itemsToDelete.map((key) => cache.delete(key)));
  }
}

// Handle background sync for offline messages
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'chat-messages-sync') {
    event.waitUntil(syncOfflineMessages());
  }
});

// Sync offline messages when connection is restored
async function syncOfflineMessages() {
  console.log('[SW] Syncing offline messages');

  try {
    // Get offline messages from IndexedDB (if implemented)
    // This would integrate with your chat store
    const messages = await getOfflineMessages();

    for (const message of messages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        });

        if (response.ok) {
          await removeOfflineMessage(message.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Placeholder functions for offline message management
async function getOfflineMessages() {
  // This would retrieve messages from IndexedDB
  // For now, return empty array
  return [];
}

async function removeOfflineMessage(messageId) {
  // This would remove the synced message from IndexedDB
  console.log('[SW] Message synced:', messageId);
}

// Handle push notifications (optional feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: 'You have a new message!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'chat-notification',
    renotify: true,
    requireInteraction: false,
    data: {
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Chat',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.message || options.body;
      options.data = { ...options.data, ...payload };
    } catch (error) {
      console.error('[SW] Failed to parse push payload:', error);
    }
  }

  event.waitUntil(self.registration.showNotification('Chat App', options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If chat app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(location.origin) && 'focus' in client) {
            return client.focus();
          }
        }

        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');
