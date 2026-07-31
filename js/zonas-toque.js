// Las bandas invisibles con las que se pasa de página tapan una buena parte
// del texto, y con él los enlaces que caen debajo: una nota al pie junto al
// margen, una entrada del índice del propio libro, una dirección web. El
// enlace se ve, se puede leer, pero no había forma de pulsarlo.
//
// Antes de pasar página se mira qué hay justo debajo del punto pulsado. Lo que
// no se puede resolver mirando el DOM son las cuentas de aquí: si el punto cae
// dentro del marco del capítulo (un EPUB se dibuja en un iframe, con sus
// propias coordenadas) y en qué punto de él.

// El punto del clic, que viene en coordenadas de la ventana, trasladado a las
// del marco. Devuelve null si cae fuera: entonces ese marco no tiene nada que
// decir. En EPUB puede haber varios a la vez, porque epub.js mantiene montados
// los capítulos vecinos.
export function puntoEnElMarco(x, y, caja) {
  if (!caja || caja.width <= 0 || caja.height <= 0) return null;
  const dentro = x >= caja.left && x <= caja.left + caja.width
    && y >= caja.top && y <= caja.top + caja.height;
  return dentro ? { x: x - caja.left, y: y - caja.top } : null;
}

// Un clic con el teclado (Enter o Espacio sobre la zona, que es un botón)
// llega sin coordenadas: Chrome manda ceros y Firefox el centro del botón. En
// ese caso no hay ningún punto que mirar y la zona hace lo suyo de siempre.
export function clicConPunto(evento) {
  return (evento?.detail ?? 0) > 0;
}
