require("regenerator/runtime");
require("./cache-polyfill");

// TODO - generate some kind of hash of to-cache content
// In the mean time:
var versionHash = "4";

self.addEventListener('install', function(event) {
  event.waitUntil(async _ => {
    if (self.skipWaiting) self.skipWaiting();
    var cache = await caches.open('svgomg-static-' + versionHash);
    return cache.addAll([
      './',
      'imgs/icon.png',
      'css/all.css',
      'js/gzip-worker.js',
      'js/page.js',
      'js/svgo-worker.js'
    ]);
  }());
});

var expectedCaches = [
  'svgomg-static-' + versionHash,
];

self.addEventListener('activate', function(event) {
  // remove caches beginning "svgomg-" that aren't in
  // expectedCaches
  event.waitUntil(async _ => {
    var cacheNames = await caches.keys();
    for (var cacheName of cacheNames) {
      if (!/^svgomg-/.test(cacheName)) continue;
      if (expectedCaches.indexOf(cacheName) == -1) {
        await caches.delete(cacheName);
      }
    }
  }());
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});