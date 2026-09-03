/* Service worker do Mangora — cache de estáticos + rede para o resto. */
const CACHE = "mangora-v1";
const STATIC = ["/_next/static", "/icons/", "/favicon.png", "/mangora-logo.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isStatic = STATIC.some((prefix) => url.pathname.startsWith(prefix));
  if (isStatic) {
    // Cache-first para estáticos (assets, ícones)
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          void cache.put(request, response.clone());
        }
        return response;
      })(),
    );
    return;
  }

  // Network-first para navegação/API (sempre atualizado, com fallback de cache)
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          void cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error("offline");
      }
    })(),
  );
});
