// Cómo se presentan las estadísticas de lectura: tiempos en palabras, fechas
// en corto, alturas de las barras y con qué nombre aparece cada libro.
// Calcular el resumen es cosa de estadisticas.js; pintarlo, de la aplicación.

// Cuántos libros caben en el desglose. Más abajo la lista deja de decir nada:
// son los ratos sueltos de libros que apenas se abrieron.
export const LIBROS_EN_LISTA = 10;

// Y por debajo de este rato tampoco entran, aunque sobre sitio: un libro que se
// abrió para mirar de qué iba no es «en qué se va el tiempo», y con tres o
// cuatro así la lista contaba más de lo que se hojeó que de lo que se leyó. El
// tiempo de esos libros no se pierde: sigue en su ficha y en los totales.
export const SEGUNDOS_MINIMOS_EN_LISTA = 5 * 60;

// Por qué se ordena la lista. El tiempo es lo de siempre —«en qué se va el
// tiempo» es la pregunta de la tarjeta—, pero para volver sobre lo que se está
// leyendo estos días hace falta la fecha, y para buscar un libro concreto en
// una lista larga, el título.
export const ORDENES_LIBROS = ['tiempo', 'reciente', 'titulo'];

export function ordenLibrosValido(orden) {
  return ORDENES_LIBROS.includes(orden) ? orden : 'tiempo';
}

// El filtro y el recorte van antes de ordenar y después, en este orden:
// primero se quitan los libros que solo se hojearon, luego se ordena y al
// final se corta. Cortar antes de ordenar dejaría «por última lectura»
// enseñando los diez de más tiempo puestos por fecha, que no es lo que se pide.
export function librosParaLaLista(libros, {
  orden = 'tiempo',
  nombreDe = (libro) => libro.id,
  compararTextos = (uno, otro) => uno.localeCompare(otro),
  minimo = SEGUNDOS_MINIMOS_EN_LISTA,
} = {}) {
  const porTiempo = (uno, otro) => otro.segundos - uno.segundos;
  const criterios = {
    // Sin fecha, al final: es un libro del que no se sabe cuándo se leyó, y
    // colarlo entre los recientes sería inventárselo.
    reciente: (uno, otro) =>
      (otro.ultimaLectura || '').localeCompare(uno.ultimaLectura || '') || porTiempo(uno, otro),
    titulo: (uno, otro) =>
      compararTextos(nombreDe(uno), nombreDe(otro)) || porTiempo(uno, otro),
    tiempo: porTiempo,
  };
  return (libros ?? [])
    // Los ocultos no cuentan ni para el recorte: si ocuparan sitio entre los
    // diez, ocultar uno dejaría la lista más corta en vez de dar paso al
    // siguiente, que es justo lo que se está pidiendo al ocultarlo.
    .filter((libro) => !libro.oculto && libro.segundos > minimo)
    .sort(criterios[ordenLibrosValido(orden)])
    .slice(0, LIBROS_EN_LISTA);
}

// Duración en palabras, con las mismas fórmulas que el tiempo restante.
// Devuelve la clave de traducción y sus valores, que es lo que decide de
// verdad: por debajo del minuto no se dan cifras, y las horas redondas se
// dicen «4 h» y no «4 h 0 min» —aquí los totales caen en horas redondas a
// menudo, al contrario que el tiempo restante, que casi nunca lo hace—.
export function duracionEnPalabras(segundos) {
  const minutos = Math.round(segundos / 60);
  if (minutos < 1) return { clave: 'timeLessMinute', valores: {} };
  if (minutos < 60) return { clave: 'timeMinutes', valores: { m: minutos } };
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m
    ? { clave: 'timeHoursMinutes', valores: { h, m } }
    : { clave: 'statsHours', valores: { h } };
}

// Un día del registro ('AAAA-MM-DD') como fecha del calendario de quien lee.
// Se arma a mano en vez de con `new Date(clave)`, que lo interpretaría en UTC
// y correría el día entero según el huso.
export function fechaDeClave(clave) {
  const [anno, mes, dia] = clave.split('-').map(Number);
  return new Date(anno, mes - 1, dia);
}

// Altura de una barra, en porcentaje del día (o del libro) que más se leyó.
// El mínimo deja una raya tenue donde no se leyó nada: el hueco es justamente
// lo que hay que ver.
export function alturaBarra(valor, maximo, minimo = 2) {
  if (!maximo) return minimo;
  return Math.max(minimo, (valor / maximo) * 100);
}

export function mayorDeLaSerie(serie) {
  return serie.reduce((mayor, punto) => Math.max(mayor, punto.segundos), 0);
}

// Lo que resume el gráfico: cuántos días se leyó y cuánto en total.
export function totalesDeSerie(serie) {
  return {
    diasLeidos: serie.filter((punto) => punto.segundos > 0).length,
    segundos: serie.reduce((suma, punto) => suma + punto.segundos, 0),
  };
}

// El nombre visible de un libro que quizá ya no esté en la biblioteca: el que
// le puso quien lee y, si no, el del archivo. Los libros del dispositivo se
// identifican como 'local:<nombre>:<algo>' y los de la nube por su ruta.
export function nombreVisibleDeId(id, tituloPropio = '') {
  if (tituloPropio) return tituloPropio;
  if (id.startsWith('local:')) return id.split(':').slice(1, -1).join(':') || id;
  return id.split('/').pop() || id;
}
