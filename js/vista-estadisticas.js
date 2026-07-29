// Cómo se presentan las estadísticas de lectura: tiempos en palabras, fechas
// en corto, alturas de las barras y con qué nombre aparece cada libro.
// Calcular el resumen es cosa de estadisticas.js; pintarlo, de la aplicación.

// Cuántos libros caben en el desglose. Más abajo la lista deja de decir nada:
// son los ratos sueltos de libros que apenas se abrieron.
export const LIBROS_EN_LISTA = 10;

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
