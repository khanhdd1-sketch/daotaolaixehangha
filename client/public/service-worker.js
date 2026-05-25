const CACHE_NAME = "drive-school-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/login.html",
  "/exam.html",
  "/admin.html",
  "/manifest.webmanifest",
  "/src/css/main.css",
  "/src/js/common.js",
  "/src/js/auth.js",
  "/src/js/exam.js",
  "/src/js/admin.js",
  "/assets/bootstrap/css/bootstrap.min.css",
  "/assets/bootstrap/js/bootstrap.bundle.min.js",
  "/assets/vendor/chartjs/chart.umd.min.js",
  "/assets/vendor/fontawesome/css/all.min.css",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return networkResponse;
      });
    }).catch(() => caches.match("/exam.html"))
  );
});
