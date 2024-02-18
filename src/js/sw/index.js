/* globals SVGOMG_VERSION:false */

import { idbKeyval as storage } from '../utils/storage.js';

const version = SVGOMG_VERSION;
const cachePrefix = 'svgomg-';
const staticCacheName = `${cachePrefix}static-${version}`;
const fontCacheName = `${cachePrefix}fonts`;
const expectedCaches = new Set([staticCacheName, fontCacheName]);

addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const activeVersionPromise = storage.get('active-version');
      const cache = await caches.open(staticCacheName);

      await cache.addAll([
        './',
        'all.css',
        'changelog.json',
        'fonts/code-latin.woff2',
        'imgs/icon.png',
        'js/gzip-worker.js',
        'js/page.js',
        'js/prism-worker.js',
        'js/svgo-worker.js',
        'test-svgs/car-lite.svg',
      ]);

      const activeVersion = await activeVersionPromise;

      // If it's a major version change, don't skip waiting
      if (
        !activeVersion ||
        activeVersion.split('.')[0] === version.split('.')[0]
      ) {
        self.skipWaiting();
      }
    })(),
  );
});

addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // remove caches beginning "svgomg-" that aren't in expectedCaches
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith(cachePrefix) &&
              !expectedCaches.has(cacheName),
          )
          .map((cacheName) => caches.delete(cacheName)),
      );

      await storage.set('active-version', version);
    })(),
  );
});

async function handleFontRequest(request) {
  const match = await caches.match(request);
  if (match) return match;

  const [response, fontCache] = await Promise.all([
    fetch(request),
    caches.open(fontCacheName),
  ]);

  fontCache.put(request, response.clone());
  return response;
}

addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.woff2')) {
    event.respondWith(handleFontRequest(event.request));
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
