// Service worker: guarda en caché la aplicación para que funcione sin
// conexión. Las peticiones al servidor WebDAV nunca se cachean.

const CACHE = 'pagekeeper-v49';

const RECURSOS = [
  '.',
  'index.html',
  'css/estilos.css',
  'js/app.js',
  'js/lector.js',
  'js/webdav.js',
  'js/progreso.js',
  'js/almacen.js',
  'js/iconos.js',
  'js/i18n.js',
  'js/lector-epub.js',
  'js/portadas.js',
  'vendor/pdf.min.js',
  'vendor/pdf.worker.min.js',
  'vendor/jszip.min.js',
  'vendor/epub.min.js',
  'vendor/mathjax-tex-mml-svg.js',
  'ejemplos/lazarillo-de-tormes-es.epub',
  'ejemplos/lauca-del-senyor-esteve-ca.epub',
  'ejemplos/alice-in-wonderland-en.epub',
  'manifest.webmanifest',
  'iconos/icono.svg',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(RECURSOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url);
  // Solo se gestionan peticiones GET a este mismo origen (la propia app).
  if (evento.request.method !== 'GET' || url.origin !== location.origin) return;

  // Red primero (para recibir actualizaciones), caché como respaldo offline.
  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE).then((cache) => cache.put(evento.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(evento.request, { ignoreSearch: true }))
  );
});
