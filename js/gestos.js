// Cuentas de los gestos táctiles del lector: el pellizco que amplía el PDF, el
// arrastre que pasa página y el pellizco que cambia el cuerpo de letra del EPUB.
//
// Aquí vive solo la aritmética —cuánto se ha separado el dedo, si el recorrido
// da para cambiar de página, qué tamaño de letra toca ahora—. Quién escucha los
// toques, qué elemento se mueve y cuándo se repinta es cosa del lector.

// ── Pellizco para el zoom del PDF ──

export const ZOOM_MINIMO = 0.1;
export const ZOOM_MAXIMO = 4;
// Por debajo de esto el pellizco no compensa remontar el PDF: son los dedos
// que tiemblan al posarse, no una intención de ampliar.
export const PELLIZCO_INSIGNIFICANTE = 0.03;

export function distanciaEntre(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Cuánto se amplía la página, sin dejar que el zoom resultante se salga de los
// límites del lector (de ahí que el tope dependa del zoom de partida).
export function factorDePellizco(distancia, inicial, zoom) {
  const bruto = distancia / (inicial || 1);
  return Math.min(ZOOM_MAXIMO / zoom, Math.max(ZOOM_MINIMO / zoom, bruto));
}

export function pellizcoAprovechable(factor) {
  return Math.abs(factor - 1) >= PELLIZCO_INSIGNIFICANTE;
}

// Dónde queda el scroll tras ampliar para que el punto que se pellizcó siga
// bajo los dedos. El centro va en coordenadas del área visible; el scroll, del
// contenido.
export function scrollTrasPellizco({ factor, centroX, centroY, scrollLeft, scrollTop }) {
  return {
    izquierda: (scrollLeft + centroX) * factor - centroX,
    arriba: (scrollTop + centroY) * factor - centroY,
  };
}

// ── Arrastre para pasar página ──

export const UMBRAL_PASO = 0.22;   // parte del ancho que hay que recorrer
export const HOLGURA_GESTO = 10;   // píxeles antes de decidir si el gesto es nuestro
// Sin página a la que ir el arrastre se queda corto: se nota el tope.
export const RESISTENCIA_TOPE = 0.25;

// Qué hacer con un recorrido que aún no ha arrancado: hasta que no se ve por
// dónde va no se toca nada, porque si no un desplazamiento de refilón
// arrastraría la página.
//
// El eje vertical solo cuenta si el lector lo permite (`vertical`), que es
// cuando la página cabe entera y no hay nada que desplazar hacia abajo. Si hay,
// el dedo está haciendo scroll y el gesto se abandona, como antes.
export function decidirArranque(dx, dy, { holgura = HOLGURA_GESTO, vertical = false } = {}) {
  if (Math.abs(dy) > holgura && Math.abs(dy) > Math.abs(dx)) {
    return vertical ? 'vertical' : 'abandonar';
  }
  if (Math.abs(dx) <= holgura) return 'esperar';
  return 'horizontal';
}

// ¿Hay página al otro lado? En EPUB no se puede saber contando páginas —el
// capítulo siguiente se monta cuando hace falta—, así que lo decide el lector
// y llega hecho en `hayVecinaEpub`. Se da por supuesto que sí: al no saberlo,
// más vale dejar pasar página que atrancar el libro.
export function hayPaginaDestino({
  haciaAtras, epub, hayVecinaEpub = true, pagina, totalPaginas, paso = 1,
}) {
  if (epub) return hayVecinaEpub;
  return haciaAtras ? pagina > 1 : pagina + paso <= totalPaginas;
}

// Lo que se desplaza la página, que no siempre es lo que se ha movido el dedo.
// Deslizando la tira de columnas, más allá de una página empezaría a asomar la
// siguiente a esa: el recorrido se queda en un paso.
export function recorridoDelGesto(dx, { hayDestino, enColumnas, paso }) {
  if (!hayDestino) return dx * RESISTENCIA_TOPE;
  if (enColumnas) return Math.max(-paso, Math.min(paso, dx));
  return dx;
}

// Al soltar, el recorrido decide: pasado el umbral la página termina de salir,
// y si no vuelve a su sitio. Así un roce no cambia de página y se puede echar
// un vistazo y arrepentirse.
export function pasaDePagina(dx, ancho, umbral = UMBRAL_PASO) {
  return Math.abs(dx) > (ancho || 1) * umbral;
}

// ── Deslizamiento vertical ──
//
// Arriba y abajo la página no sigue al dedo: las vecinas están puestas a los
// lados y la tira de columnas del EPUB también, así que un arrastre vertical
// solo enseñaría un hueco. Lo que hay es un deslizamiento que se decide al
// soltar, y entonces la página pasa con la misma animación que si se hubiera
// pulsado el margen.
//
// Sin nada que seguir con la vista, el umbral se mide de otra manera: una
// parte más corta del recorrido (la pantalla es más alta que ancha y el 22 %
// del alto sería un barrido incómodo), pero con un mínimo en píxeles para que
// en una pantalla apaisada un roce no cambie de página.
export const UMBRAL_PASO_VERTICAL = 0.12;
export const RECORRIDO_VERTICAL_MINIMO = 60;

export function pasaDePaginaVertical(dy, alto) {
  return Math.abs(dy) > Math.max(RECORRIDO_VERTICAL_MINIMO, (alto || 0) * UMBRAL_PASO_VERTICAL);
}

// ── Pellizco para el tamaño de letra del EPUB ──
//
// El PDF se amplía escalando el lienzo, pero un EPUB no tiene lienzo: lo que se
// cambia es el cuerpo del texto y el capítulo se recompone. Recomponerlo en
// cada movimiento del dedo sería lentísimo, así que el gesto se traduce a
// saltos de un 10 %, los mismos que dan los botones de zoom.
//
// El gesto va amortiguado. Llevar la letra al mismo ritmo que se separan los
// dedos la disparaba: en una pantalla de móvil un pellizco corriente dobla la
// distancia enseguida, y con ella el cuerpo del texto, sin que hubiera manera
// de pararse en un tamaño concreto. Con la raíz cuadrada hay que separar los
// dedos al cuádruple para doblar la letra, que es lo que deja afinarla.
//
// Y va de un salto en un salto, con una pausa entre ellos y una zona muerta
// antes del siguiente: cada cambio recompone el capítulo entero, así que el
// tamaño sube o baja al ritmo que el lector puede seguir, y no salta adelante
// y atrás por un temblor del dedo.

export const SALTO_LETRA = 10;
export const SUAVIZADO_PELLIZCO = 0.5;
export const ZONA_MUERTA = 0.75;
export const ESPERA_ENTRE_SALTOS = 180;
export const LETRA_MINIMA = 60;
export const LETRA_MAXIMA = 300;

// Tamaño de letra al que toca saltar, o null si todavía no toca ninguno: por
// dentro de la zona muerta, demasiado pronto tras el salto anterior o ya en el
// tope. El pellizco lleva la distancia y el tamaño de cuando empezó el gesto,
// más el instante del último salto.
export function saltoDeLetra(pellizco, distancia, tamanoActual, ahora) {
  const bruto = distancia / (pellizco.inicial || 1);
  const objetivo = pellizco.tamano * bruto ** SUAVIZADO_PELLIZCO;
  const diferencia = objetivo - tamanoActual;
  if (Math.abs(diferencia) < SALTO_LETRA * ZONA_MUERTA) return null;
  if (ahora - pellizco.ultimo < ESPERA_ENTRE_SALTOS) return null;
  const paso = Math.sign(diferencia) * SALTO_LETRA;
  const acotado = Math.min(LETRA_MAXIMA, Math.max(LETRA_MINIMA, tamanoActual + paso));
  return acotado === tamanoActual ? null : acotado;
}
