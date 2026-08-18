// Un capítulo puede enlazar a fuera: un vídeo, una fuente, una web. Aquí solo
// se decide si un enlace apunta fuera del libro; abrirlo es cosa de quien
// llama, que sí tiene ventana.
//
// Hace falta distinguirlo porque los enlaces internos (ir a otro capítulo, a
// una nota) los resuelve epub.js dentro del propio marco, y esos no deben
// salir a una pestaña nueva.

// `href` llega ya resuelto por el navegador (la propiedad `.href` del enlace,
// no el atributo), así que un enlace relativo del libro se compara contra el
// origen de la aplicación y se reconoce como interno.
export function esEnlaceExterno(href, origenApp) {
  let url;
  try {
    url = new URL(String(href ?? ''));
  } catch {
    return false; // no es una dirección utilizable
  }
  // Solo la web. `mailto:`, `tel:` o `blob:` los resuelve el navegador a su
  // manera y no se ganan nada abriéndolos a mano.
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
  // Mismo origen que la aplicación: es el propio libro, que epub.js sirve
  // desde ahí. Ir a otro capítulo no es salir fuera.
  return url.origin !== String(origenApp ?? '');
}
