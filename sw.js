// Service worker: guarda en caché la aplicación para que funcione sin
// conexión. Las peticiones al servidor WebDAV nunca se cachean.

const CACHE = 'pagekeeper-v273';

const RECURSOS = [
  '.',
  'index.html',
  'css/estilos.css',
  'js/app.js',
  'js/tema-inicial.js',
  'js/mathjax-config.js',
  'js/lector.js',
  'js/webdav.js',
  'js/progreso.js',
  'js/almacen.js',
  'js/anotaciones.js',
  'js/registro.js',
  'js/iconos.js',
  'js/i18n.js',
  'js/lector-epub.js',
  'js/posicion-notas.js',
  'js/menu-contextual.js',
  'js/resumen-libro.js',
  'js/calificacion.js',
  'js/apertura-inicial.js',
  'js/libro-por-url.js',
  'js/enlaces-externos.js',
  'js/portadas.js',
  'js/tts.js',
  'js/seguimiento-voz.js',
  'js/ritmo.js',
  'js/reflujo-epub.js',
  'js/idioma-texto.js',
  'js/columnas.js',
  'js/duplicados.js',
  'js/version.js',
  'js/estadisticas.js',
  'js/gestos.js',
  'js/zonas-toque.js',
  'js/imagen-ampliada.js',
  'js/panel-navegacion.js',
  'js/marcadores.js',
  'js/vista-anotaciones.js',
  'js/impresion.js',
  'js/titulo-libro.js',
  'js/vista-estadisticas.js',
  'js/periodos.js',
  'js/recorte.js',
  'js/deteccion-texto-pdf.js',
  'js/copia-local.js',
  'js/desplazamiento-lectura.js',
  'js/posicion-remota.js',
  'js/archivos-entrantes.js',
  'js/descarga-carpeta.js',
  'js/imagenes-pdf.js',
  'js/tema.js',
  'js/archivos-recibidos.js',
  'js/privacidad.js',
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
  'privacidad.html',
  'css/privacidad.css',
];

// Lo compartido desde otra aplicación se guarda aquí hasta que la página lo
// recoge (ver «Libros que llegan de otra aplicación» en app.js). Va aparte de
// la caché de la aplicación para que una versión nueva no lo borre al
// instalarse justo entonces.
const CACHE_COMPARTIDOS = 'pagekeeper-compartidos';

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(RECURSOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE && c !== CACHE_COMPARTIDOS).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

// «Compartir» desde otra aplicación manda los archivos por POST a
// `?compartir` (el `share_target` del manifiesto). GitHub Pages no admite
// POST, así que tienen que quedarse aquí: se guardan y se manda la página a
// `?compartido`, donde los recoge. El 303 hace que el navegador pida esa
// página con un GET y que recargar no vuelva a enviar nada.
async function recibirCompartidos(peticion) {
  const formulario = await peticion.formData();
  const archivos = formulario.getAll('libros').filter((valor) => valor instanceof File);
  const cache = await caches.open(CACHE_COMPARTIDOS);
  for (const anterior of await cache.keys()) await cache.delete(anterior);
  await Promise.all(archivos.map((archivo, indice) => cache.put(
    `compartidos/${indice}`,
    new Response(archivo, {
      headers: {
        'Content-Type': archivo.type || 'application/octet-stream',
        'X-Nombre': encodeURIComponent(archivo.name),
      },
    }),
  )));
  return Response.redirect('./?compartido', 303);
}

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url);
  if (evento.request.method === 'POST' && url.origin === location.origin &&
      url.searchParams.has('compartir')) {
    evento.respondWith(recibirCompartidos(evento.request));
    return;
  }
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
