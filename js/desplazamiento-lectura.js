// Leer con la barra espaciadora: primero se recorre lo que queda de página
// hacia abajo y, solo cuando ya no queda nada, se pasa de página. Es lo que
// hace cualquier visor de PDF y lo que permite leer un libro entero sin más
// tecla que el espacio, aunque la página no quepa en la pantalla (zoom,
// ventana estrecha, modo continuo).
//
// Todo lo que se decide aquí sale de tres números del contenedor —cuánto se
// ha desplazado, cuánto mide su contenido y cuánto se ve—, así que se prueba
// sin navegador.

// Un poco de lo ya leído se queda arriba tras el salto: sin ese solape la
// vista corta justo por donde iba la lectura y hay que buscar el hilo.
const SOLAPE_MAXIMO = 80;
const SOLAPE_RELATIVO = 0.12;

// Margen de tolerancia: los tamaños llevan decimales y un contenedor «al
// tope» rara vez cuadra al píxel. Sin él, la última pulsación se comía un
// salto de dos píxeles en vez de pasar de página.
const MARGEN = 2;

export function saltoDePantalla(alto) {
  const solape = Math.min(alto * SOLAPE_RELATIVO, SOLAPE_MAXIMO);
  return Math.max(alto - solape, alto * 0.5);
}

// Devuelve `{ accion: 'desplazar', destino }` mientras quede recorrido en esa
// dirección, y `{ accion: 'pagina' }` cuando se ha llegado al tope.
export function decidirEspacio({ scrollTop, scrollHeight, clientHeight, haciaAtras = false }) {
  const maximo = scrollHeight - clientHeight;
  if (maximo <= MARGEN) return { accion: 'pagina' };
  const salto = saltoDePantalla(clientHeight);
  if (haciaAtras) {
    if (scrollTop <= MARGEN) return { accion: 'pagina' };
    return { accion: 'desplazar', destino: Math.max(0, scrollTop - salto) };
  }
  if (scrollTop >= maximo - MARGEN) return { accion: 'pagina' };
  return { accion: 'desplazar', destino: Math.min(maximo, scrollTop + salto) };
}
