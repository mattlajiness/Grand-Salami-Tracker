// Service Worker for MLB & NHL Grand Salami Tracker
const CACHE_NAME = 'salami-tracker-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
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
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback or ignore for dynamic APIs
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
