// Ritmo real de lectura, medido en el propio dispositivo.
//
// Se acumulan los segundos empleados y las unidades avanzadas (páginas en PDF,
// puntos de porcentaje en EPUB) para estimar cuánto falta para terminar. La
// media es exponencial: cada tramo nuevo hace olvidar parte de lo anterior, de
// modo que la estimación sigue el ritmo reciente en lugar de quedarse anclada
// a cómo se leyeron los primeros capítulos.

// Unidades tras las cuales lo medido antes pesa la mitad. Las unidades del
// PDF (páginas) y del EPUB (puntos de porcentaje) no son comparables: 40
// páginas son un tramo normal de lectura, pero 40 puntos son medio libro.
export const SEMIVIDA_PAGINAS = 40;
export const SEMIVIDA_PORCENTAJE = 8;
// Muestras improbables: lecturas de un vistazo y saltos de posición.
const SEGUNDOS_MINIMOS = 3;
const AVANCE_MAXIMO = 4;
// Lo que como máximo se cuenta de un tramo entre dos cambios de posición.
//
// Antes este número descartaba la muestra entera, y con ella el rato de lectura
// legítimo que llevara dentro: quien se detiene en una página densa, en un
// poema o en un libro de estudio perdía el tramo completo por pasarse del
// límite. Ahora acota: cuenta hasta aquí y lo que sobre se da por perdido, que
// es lo que hace falta para que una aplicación olvidada abierta no invente
// horas de lectura.
//
// El otro trabajo que hacía este número —descubrir que el lector se había ido—
// ya no le toca: el tiempo con la página fuera de la vista no llega hasta aquí,
// porque quien mide cierra el tramo al perderse de vista (ver «app.js»).
export const SEGUNDOS_TOPE = 300;
// Hasta reunir algo de lectura real la estimación no es fiable. El mínimo de
// unidades va con la unidad de cada formato, igual que la semivida: tres
// páginas de PDF son un rato de lectura, pero tres puntos de porcentaje de un
// libro largo son horas, y el tiempo restante no aparecía hasta entonces.
// Sirve solo para no dividir por casi nada; de la fiabilidad se encargan los
// segundos acumulados.
export const UNIDADES_MINIMAS_PAGINAS = 3;
export const UNIDADES_MINIMAS_PORCENTAJE = 0.25;
const SEGUNDOS_ACUMULADOS_MINIMOS = 120;

// Cuántos segundos de un tramo cuentan como lectura, o null si el tramo no
// cuenta: un vistazo (demasiado corto) o un salto de posición (ir al índice, a
// un marcador, o volver atrás), que no dicen nada del ritmo.
export function segundosDeLaMuestra(segundos, avance) {
  if (!(avance >= 0 && avance <= AVANCE_MAXIMO)) return null;
  if (!(segundos >= SEGUNDOS_MINIMOS)) return null;
  return Math.min(segundos, SEGUNDOS_TOPE);
}

// Suma la muestra a lo acumulado, olvidando de forma exponencial según lo
// avanzado: un tramo de 4 páginas hace olvidar cuatro veces más que uno de 1.
// El tiempo pasado sin cambiar de unidad se suma sin olvidar nada, porque
// forma parte de lo que se tarda en leer esa misma unidad.
export function acumularRitmo(entrada, segundos, avance, semivida = SEMIVIDA_PAGINAS) {
  const olvido = Math.pow(0.5, avance / semivida);
  let s = (Number(entrada?.s) || 0) * olvido + segundos;
  let u = (Number(entrada?.u) || 0) * olvido + avance;
  // Con el olvido, lo acumulado tiende por sí solo a semivida/ln2 unidades.
  // El techo recorta lo que venga por encima (los acumuladores sin olvido de
  // versiones anteriores) conservando el ritmo, para que no tarde de más en
  // ponerse al día.
  const techo = (semivida / Math.LN2) * 1.5;
  if (u > techo) { s *= techo / u; u = techo; }
  return { ...entrada, s, u };
}

// Segundos por unidad según lo acumulado, o null si aún no hay bastante.
export function segundosPorUnidad(entrada, unidadesMinimas = UNIDADES_MINIMAS_PAGINAS) {
  const segundos = Number(entrada?.s) || 0;
  const unidades = Number(entrada?.u) || 0;
  if (unidades < unidadesMinimas || segundos < SEGUNDOS_ACUMULADOS_MINIMOS) return null;
  return segundos / unidades;
}

export function minutosRestantes(entrada, unidadesRestantes,
  unidadesMinimas = UNIDADES_MINIMAS_PAGINAS) {
  const ritmo = segundosPorUnidad(entrada, unidadesMinimas);
  if (ritmo === null || !Number.isFinite(unidadesRestantes) || unidadesRestantes < 0) return null;
  return Math.round((ritmo * unidadesRestantes) / 60);
}
