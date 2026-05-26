/* eslint-disable no-restricted-globals */
importScripts("/src/js/constants/swBundle.js");

const SW_MODULE_MANIFEST_URL = "/sw-module-manifest.json";

/**
 * Precache danh sách module ES từ manifest build.
 * @param {Cache} cache
 * @returns {Promise<void>}
 */
async function precacheModuleManifest(cache) {
  try {
    const response = await fetch(SW_MODULE_MANIFEST_URL);
    if (!response.ok) return;
    const manifest = await response.json();
    const modules = Array.isArray(manifest.modules) ? manifest.modules : [];
    if (modules.length) {
      await cache.addAll(modules);
    }
  } catch {
    // Offline install vẫn dùng app shell nếu manifest chưa có
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SW_CACHE_NAME).then(async (cache) => {
      await cache.addAll(SW_APP_SHELL).catch(() => undefined);
      await precacheModuleManifest(cache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== SW_CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== "GET") {
    return;
  }

  if (!["http:", "https:"].includes(requestUrl.protocol)) {
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          !(networkResponse.type === "basic" || networkResponse.type === "default")
        ) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(SW_CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return networkResponse;
      });
    }).catch(() => {
      if (event.request.mode === "navigate") {
        return caches.match(SW_OFFLINE_FALLBACK);
      }

      return Response.error();
    })
  );
});
