/* Service worker: deja la app disponible sin conexion. Los DATOS no pasan por aqui
   (viven cifrados en IndexedDB); solo se guarda el codigo de la app. */
const V = "precios-v2";
const ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Con conexion intenta la red (para recibir versiones nuevas); sin conexion usa la copia guardada.
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match("./index.html"))));
});
