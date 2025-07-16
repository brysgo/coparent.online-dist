// Service Worker for handling push notifications
// This file should be placed in the public directory

self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  // Force the service worker to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    console.error('Error parsing push data:', error);
    notificationData = {
      title: 'CoParent.Online Notification',
      body: event.data.text() || 'You have a new notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    };
  }

  const { title, body, icon, badge, tag, url, actions } = notificationData;

  const options = {
    body,
    icon: icon || '/favicon.ico',
    badge: badge || '/favicon.ico',
    tag: tag || 'coparent-notification',
    requireInteraction: true,
    actions: actions || [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: url || '/dashboard'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title || 'CoParent.Online', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // If not, open a new window/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // You could track notification dismissals here
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(
      // You could implement offline notification queue processing here
      console.log('Processing background sync for notifications')
    );
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service worker unhandled rejection:', event);
});