const CACHE_NAME = 'websocket-guide-v1';
const MERMAID_CACHE_NAME = 'mermaid-svg-cache-v1';
const urlsToCache = ['/websocket-practical-guide/', '/websocket-practical-guide/favicon.png'];

// IndexedDB for Mermaid SVG cache
const DB_NAME = 'MermaidSVGCache';
const DB_VERSION = 1;
const STORE_NAME = 'svgs';

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Generate hash for Mermaid chart content
async function generateHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Store SVG in IndexedDB
async function storeSVG(id, svg, chartContent) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await store.put({
      id,
      svg,
      chartContent,
      timestamp: Date.now(),
      version: CACHE_NAME
    });

    return true;
  } catch (error) {
    console.error('Failed to store SVG:', error);
    return false;
  }
}

// Retrieve SVG from IndexedDB
async function getSVG(id) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to retrieve SVG:', error);
    return null;
  }
}

// Clean old cache entries (older than 30 days)
async function cleanOldCache() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const range = IDBKeyRange.upperBound(thirtyDaysAgo);

    const request = index.openCursor(range);
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  } catch (error) {
    console.error('Failed to clean old cache:', error);
  }
}

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Try to cache each URL individually to handle errors gracefully
        return Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url).catch((err) => {
              console.warn(`Failed to cache ${url}:`, err);
            });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== MERMAID_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clean old Mermaid SVG cache
      cleanOldCache()
    ]).then(() => self.clients.claim())
  );
});

// Message handler for Mermaid SVG cache operations
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  if (type === 'CACHE_MERMAID_SVG') {
    const { chartContent, svg } = data;
    const id = await generateHash(chartContent);
    const success = await storeSVG(id, svg, chartContent);

    event.ports[0].postMessage({
      type: 'CACHE_RESULT',
      success,
      id
    });
  } else if (type === 'GET_CACHED_SVG') {
    const { chartContent } = data;
    const id = await generateHash(chartContent);
    const cached = await getSVG(id);

    if (cached && cached.chartContent === chartContent) {
      event.ports[0].postMessage({
        type: 'CACHED_SVG',
        svg: cached.svg,
        fromCache: true
      });
    } else {
      event.ports[0].postMessage({
        type: 'CACHED_SVG',
        svg: null,
        fromCache: false
      });
    }
  } else if (type === 'CLEAR_MERMAID_CACHE') {
    try {
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      await store.clear();

      event.ports[0].postMessage({
        type: 'CACHE_CLEARED',
        success: true
      });
    } catch (error) {
      event.ports[0].postMessage({
        type: 'CACHE_CLEARED',
        success: false,
        error: error.message
      });
    }
  }
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip WebSocket requests
  if (event.request.url.startsWith('ws://') || event.request.url.startsWith('wss://')) {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        // Clone response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful responses
          if (response.status === 200) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/websocket-practical-guide/');
          }
        });
      })
  );
});
