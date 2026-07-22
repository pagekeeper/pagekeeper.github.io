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
// Muestras improbables: pausas, lecturas de un vistazo y saltos de posición.
const SEGUNDOS_MINIMOS = 3;
const SEGUNDOS_MAXIMOS = 300;
const AVANCE_MAXIMO = 4;
// Hasta reunir algo de lectura real la estimación no es fiable.
const UNIDADES_MINIMAS = 3;
const SEGUNDOS_ACUMULADOS_MINIMOS = 120;

export function muestraValida(segundos, avance) {
  return segundos >= SEGUNDOS_MINIMOS && segundos <= SEGUNDOS_MAXIMOS &&
    avance >= 0 && avance <= AVANCE_MAXIMO;
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
export function segundosPorUnidad(entrada) {
  const segundos = Number(entrada?.s) || 0;
  const unidades = Number(entrada?.u) || 0;
  if (unidades < UNIDADES_MINIMAS || segundos < SEGUNDOS_ACUMULADOS_MINIMOS) return null;
  return segundos / unidades;
}

export function minutosRestantes(entrada, unidadesRestantes) {
  const ritmo = segundosPorUnidad(entrada);
  if (ritmo === null || !Number.isFinite(unidadesRestantes) || unidadesRestantes < 0) return null;
  return Math.round((ritmo * unidadesRestantes) / 60);
}
