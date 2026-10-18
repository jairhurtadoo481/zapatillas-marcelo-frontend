// Service worker de La Casa de Marcelo.
// Regla principal: las paginas NUNCA se guardan (precios, stock, facturacion y
// el admin cambian todo el tiempo). Solo se guardan archivos que no cambian:
// logos, estilos y scripts con hash de Next. Sin internet, se muestra /offline.html.
const VERSION = "v1";
const CACHE = `marcelo-estatico-${VERSION}`;
const OFFLINE = "/offline.html";
const PRECARGA = [OFFLINE, "/icons/icon-192.png", "/icons/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECARGA))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n.startsWith("marcelo-") && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;

  const url = new URL(pedido.url);
  // Backend, Cloudinary, Google Maps, etc.: no se tocan.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Paginas: siempre de la red. Si no hay internet, pantalla de "sin conexion".
  if (pedido.mode === "navigate") {
    evento.respondWith(fetch(pedido).catch(() => caches.match(OFFLINE)));
    return;
  }

  // Archivos de Next con hash en el nombre (nunca cambian): primero el cache.
  if (url.pathname.startsWith("/_next/static/")) {
    evento.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const guardado = await cache.match(pedido);
        if (guardado) return guardado;
        const respuesta = await fetch(pedido);
        if (respuesta.ok) cache.put(pedido, respuesta.clone());
        return respuesta;
      })
    );
    return;
  }

  // Logos e imagenes propias: se sirven del cache y se refrescan en segundo plano.
  if (/\.(png|jpg|jpeg|svg|webp|ico|woff2)$/i.test(url.pathname)) {
    evento.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const guardado = await cache.match(pedido);
        const red = fetch(pedido)
          .then((respuesta) => {
            if (respuesta.ok) cache.put(pedido, respuesta.clone());
            return respuesta;
          })
          .catch(() => guardado);
        return guardado || red;
      })
    );
  }
});
