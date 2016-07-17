require('regenerator-runtime/runtime');

var storage = require('../utils/storage');

// remove caches, remove active-version
self.addEventListener('install', function(event) {
  event.waitUntil(async _ => {
    if (self.skipWaiting) {
      self.skipWaiting();
    }

    await storage.delete('active-version');

    // remove caches beginning "svgomg-" that aren't in
    // expectedCaches
    var cacheNames = await caches.keys();
    for (var cacheName of cacheNames) {
      if (!/^svgomg-/.test(cacheName)) continue;
      await caches.delete(cacheName);
    }
  }());
});
