// Dummy service worker to prevent 404 errors during development
// This file is requested due to a previous Firebase setup or extension, but is not needed for this app.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
