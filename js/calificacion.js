// Qué le pareció el libro a quien lo leyó: cinco estrellas enteras.
//
// Cinco y enteras a propósito. Es la escala que ya traen aprendida quienes
// vienen de otros lectores, así que nadie tiene que averiguar qué significa un
// 7; y en la pantalla de un móvil, media estrella es un blanco al que hay que
// apuntar con el pulgar, mientras que una entera se pulsa sin mirar.
//
// «Sin calificar» no es un cero: es que no hay opinión. La mayoría de los
// libros nunca se califican, y tratarlos como ceros los hundiría al ordenar y
// les pondría una fila de estrellas vacías que no dice nada.
//
// Se guarda como número y no como entero cerrado: si algún día se quieren
// medias estrellas, los archivos ya sincronizados valen tal cual.

export const MAXIMO = 5;

// Lo que llega de fuera —un archivo escrito por otra versión, un JSON tocado a
// mano— puede ser cualquier cosa. Sin calificación se devuelve null, que es lo
// que el resto del código sabe leer como «no hay opinión».
export function calificacionValida(valor, maximo = MAXIMO) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return null;
  // A media estrella, que es lo más fino que se sabe pintar; el redondeo deja
  // pasar los decimales de una versión futura sin romper nada.
  return Math.min(maximo, Math.round(numero * 2) / 2);
}

// Pulsar la estrella que ya estaba marcada quita la calificación. Es la única
// forma de deshacerse de ella sin un botón aparte, y encaja con lo que espera
// la mano: se pulsa donde está para volver atrás.
export function alPulsarEstrella(actual, pulsada, maximo = MAXIMO) {
  const nueva = calificacionValida(pulsada, maximo);
  return nueva !== null && nueva === calificacionValida(actual, maximo) ? null : nueva;
}

// Cómo se pinta cada estrella: entera, media o vacía. Se devuelve la lista
// completa para que quien pinte no tenga que decidir nada.
export function estrellasDe(valor, maximo = MAXIMO) {
  const calificacion = calificacionValida(valor, maximo) ?? 0;
  return Array.from({ length: maximo }, (unused, indice) => {
    const posicion = indice + 1;
    if (calificacion >= posicion) return 'llena';
    return calificacion >= posicion - 0.5 ? 'media' : 'vacia';
  });
}

// ── Orden y filtro de la biblioteca ──

// De mejor a peor. Los libros sin calificar van al final y no al principio: no
// son malos, es que no se han juzgado, y mezclarlos con los de una estrella
// sería inventarse una opinión que nadie dio.
export function compararPorCalificacion(una, otra) {
  return (calificacionValida(otra) ?? -1) - (calificacionValida(una) ?? -1);
}

// Los filtros que se ofrecen en la biblioteca, además de los de estado de
// lectura. Dos preguntas reales: «¿qué me gustó de verdad?» y «¿qué he leído
// sin llegar a decir qué me pareció?».
export const FILTROS = {
  calificados4: (valor) => (calificacionValida(valor) ?? 0) >= 4,
  calificados3: (valor) => (calificacionValida(valor) ?? 0) >= 3,
  sinCalificar: (valor) => calificacionValida(valor) === null,
};

export function esFiltroDeCalificacion(filtro) {
  return Object.hasOwn(FILTROS, filtro);
}

export function pasaFiltro(filtro, valor) {
  return esFiltroDeCalificacion(filtro) ? FILTROS[filtro](valor) : true;
}

// El texto que acompaña a las estrellas para quien no las ve: lectores de
// pantalla y el título emergente de la ficha.
export function textoAccesible(valor, textos, maximo = MAXIMO) {
  const calificacion = calificacionValida(valor, maximo);
  return calificacion === null
    ? textos.sinCalificar
    : textos.deMaximo(calificacion, maximo);
}
