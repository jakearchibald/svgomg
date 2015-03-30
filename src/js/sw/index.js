require("regenerator/runtime");
require("./cache-polyfill");

var storage = require('../utils/storage');

// TODO: use come kind of semver lib?
// Pattern here is 
// a.b.c
// a: version-isolated change, don't let both versions run together
// b: new feature
// c: bug fix
// TODO: find a way to do this without bringing the whole log in
var version = require('../../changelog.json')[0].version;
var cacheVerion = version.split('.')[0];

self.addEventListener('install', function(event) {
  event.waitUntil(async _ => {
    var activeVersionPromise = storage.get('active-version');
    var cache = await caches.open('svgomg-static-' + cacheVerion);
    await cache.addAll([
      './',
      'imgs/icon.png',
      'css/all.css',
      'js/gzip-worker.js',
      'js/page.js',
      'js/prism-worker.js',
      'js/svgo-worker.js',
      'changelog.json',
      new Request('https://fonts.googleapis.com/css?family=Roboto:400,700|Inconsolata', {mode: 'no-cors'})
    ]);

    var activeVersion = await activeVersionPromise;

    if (!activeVersion || activeVersion.split('.')[0] === version.split('.')[0]) {
      // wrapping in an if while Chrome 40 is still around.
      if (self.skipWaiting) self.skipWaiting();
    }
  }());
});

var expectedCaches = [
  'svgomg-static-' + cacheVerion,
];

self.addEventListener('activate', function(event) {
  event.waitUntil(async _ => {
    // remove caches beginning "svgomg-" that aren't in
    // expectedCaches
    var cacheNames = await caches.keys();
    for (var cacheName of cacheNames) {
      if (!/^svgomg-/.test(cacheName)) continue;
      if (expectedCaches.indexOf(cacheName) == -1) {
        await caches.delete(cacheName);
      }
    }

    await storage.set('active-version', version);
  });
});

async function handleFontRequest(request) {
  var match = await caches.match(request);
  if (match) return match;
  var response = await fetch(request.clone());
  var fontCache = await caches.open('svgomg-fonts');
  fontCache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  if (url.host == 'fonts.gstatic.com') {
    event.respondWith(handleFontRequest(event.request));
  }
  else {
    event.respondWith(
      caches.match(event.request).then(r => r || fetch(event.request))
    );
  }
});