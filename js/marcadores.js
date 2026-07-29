// Marcadores de un libro: cómo se sitúan, cómo se ordenan y cómo se nombran.
// Guardarlos y sincronizarlos es cosa de progreso.js; pintarlos, del lector.
//
// Un marcador guarda la página (PDF) o el CFI (EPUB), y en EPUB también el
// porcentaje cuando ya se conoce. El nombre lo pone quien lee y es opcional.

// Los nombres largos rompen la lista y no se leen enteros en ningún sitio.
export const LARGO_NOMBRE = 120;

export function limpiarNombre(texto) {
  return (texto ?? '').trim().slice(0, LARGO_NOMBRE);
}

// Ya hay un marcador aquí. Se compara por CFI en EPUB y por página en PDF,
// que es como se identifica cada posición en su formato.
export function marcadorRepetido(marcadores, posicion) {
  return marcadores.some((marcador) => (posicion.cfi
    ? marcador.cfi === posicion.cfi
    : marcador.pagina === posicion.pagina));
}

// Mantiene la lista en el orden del libro. En EPUB compara los CFI con el
// comparador de epub.js, que entiende su gramática; si algún CFI es ilegible
// se cae al orden por página, que en EPUB deja la lista como estaba.
export function ordenarMarcadores(marcadores, comparadorCfi = null) {
  if (comparadorCfi) {
    try {
      marcadores.sort((a, b) => comparadorCfi(a.cfi, b.cfi));
      return marcadores;
    } catch { /* CFI ilegible: se ordena por página */ }
  }
  marcadores.sort((a, b) => (a.pagina ?? 0) - (b.pagina ?? 0));
  return marcadores;
}

// Añade el marcador con su nombre y la fecha de hoy, ya en su sitio de la
// lista. Devuelve null si esa posición ya estaba marcada.
export function anadirMarcador(marcadores, posicion, nombre, creado, comparadorCfi = null) {
  if (marcadorRepetido(marcadores, posicion)) return null;
  const limpio = limpiarNombre(nombre);
  const nuevos = [...marcadores,
    { ...posicion, ...(limpio ? { nombre: limpio } : {}), creado }];
  return ordenarMarcadores(nuevos, comparadorCfi);
}

// Renombrar con el campo vacío es quitar el nombre, no dejarlo en blanco: el
// marcador vuelve a mostrar su página o su porcentaje.
export function renombrarMarcador(marcador, nombre) {
  const limpio = limpiarNombre(nombre);
  const { nombre: viejo, ...resto } = marcador;
  return limpio ? { ...resto, nombre: limpio } : resto;
}
