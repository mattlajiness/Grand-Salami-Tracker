// Service Worker for MLB & NHL Grand Salami Tracker
const CACHE_NAME = 'salami-tracker-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Assets caching skipped on install: ', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  const isDev = self.location.hostname === 'localhost' ||
                self.location.hostname === '127.0.0.1' ||
                self.location.hostname.includes('run.app');

  if (isDev) {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map(key => caches.delete(key)));
      }).then(() => {
        return self.registration.unregister();
      }).then(() => {
        console.log('SW successfully deactivated and unregistered in dev/preview.');
      })
    );
    return;
  }

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Let the browser handle standard requests unless cached
  if (event.request.method !== 'GET') return;
  
  const isDev = self.location.hostname === 'localhost' ||
                self.location.hostname === '127.0.0.1' ||
                self.location.hostname.includes('run.app');

  if (isDev) {
    // In dev/preview, completely bypass the Service Worker cache and fetch fresh from network
    return;
  }
  
  const url = new URL(event.request.url);
  const isHtmlRequest = url.pathname === '/' || url.pathname === '/index.html' || event.request.mode === 'navigate';

  if (isHtmlRequest) {
    // Network-First for index/navigation to prevent stale cached hashes from loading deleted scripts
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Safe fallback for offline static assets, return null for failed dynamic APIs
        return null;
      });
    })
  );
});

// Push Event - Displays incoming push notifications from remote servers
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  let data = { 
    title: 'Salami Tracker', 
    body: 'Live scoring or settlement update!' 
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { 
        title: 'Salami Tracker Notification', 
        body: event.data.text() 
      };
    }
  }

  const title = data.title || 'Salami Tracker';
  const options = {
    body: data.body,
    icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3515/3515320.png',
    badge: '/favicon.svg',
    data: data.data || {},
    tag: data.tag || 'salami-push-alert',
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event - Handles tapping the notification
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  if (event.action !== 'close') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});
