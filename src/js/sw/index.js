/* globals SVGOMG_VERSION:false */

import {idbKeyval as storage} from '../utils/storage.js';

const version = SVGOMG_VERSION;
const cachePrefix = 'svgomg-';
const staticCacheName = `${cachePrefix}static-${version}`;

addEventListener('install', event => {
  event.waitUntil((async () => {
    const activeVersionPromise = storage.get('active-version');
    const cache = await caches.open(staticCacheName);

    await cache.addAll([
      './',
      'imgs/icon.png',
      'all.css',
      'js/gzip-worker.js',
      'js/page.js',
      'js/prism-worker.js',
      'js/svgo-worker.js',
      'changelog.json',
    ]);

    const activeVersion = await activeVersionPromise;

    // If it's a major version change, don't skip waiting
    if (!activeVersion || activeVersion.split('.')[0] === version.split('.')[0]) {
      self.skipWaiting();
    }
  })());
});

addEventListener('activate', event => {
  event.waitUntil((async () => {
    // remove caches beginning "svgomg-" that aren't `staticCacheName`
    for (const cacheName of await caches.keys()) {
      if (!cacheName.startsWith(cachePrefix)) continue;
      if (!cacheName === staticCacheName) await caches.delete(cacheName);
    }

    await storage.set('active-version', version);
  })());
});

addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});
