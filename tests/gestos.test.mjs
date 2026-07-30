import test from 'node:test';
import assert from 'node:assert/strict';

import {
  distanciaEntre, factorDePellizco, pellizcoAprovechable, scrollTrasPellizco,
  decidirArranque, hayPaginaDestino, recorridoDelGesto, pasaDePagina,
  pasaDePaginaVertical, saltoDeLetra,
  ZOOM_MINIMO, ZOOM_MAXIMO, SALTO_LETRA, ESPERA_ENTRE_SALTOS,
  LETRA_MINIMA, LETRA_MAXIMA,
} from '../js/gestos.js';

// ── Pellizco del PDF ──

test('mide la distancia entre los dos dedos', () => {
  assert.equal(distanciaEntre({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});

test('separar los dedos al doble amplía al doble', () => {
  assert.equal(factorDePellizco(200, 100, 1), 2);
});

test('el pellizco no lleva el zoom más allá de los topes del lector', () => {
  // Desde el zoom máximo ya no se puede ampliar más.
  assert.equal(factorDePellizco(1000, 100, ZOOM_MAXIMO), 1);
  // Ni reducir por debajo del mínimo desde el mínimo.
  assert.equal(factorDePellizco(1, 100, ZOOM_MINIMO), 1);
  // Partiendo del 200 %, el tope deja llegar justo al 400 %.
  assert.equal(factorDePellizco(1000, 100, 2), ZOOM_MAXIMO / 2);
});

test('una distancia inicial de cero no rompe la cuenta', () => {
  assert.ok(Number.isFinite(factorDePellizco(50, 0, 1)));
});

test('el temblor de los dedos al posarse no cuenta como pellizco', () => {
  assert.equal(pellizcoAprovechable(1.01), false);
  assert.equal(pellizcoAprovechable(0.99), false);
  assert.equal(pellizcoAprovechable(1.2), true);
  assert.equal(pellizcoAprovechable(0.5), true);
});

test('tras ampliar, el punto pellizcado sigue bajo los dedos', () => {
  // Sin scroll previo y pellizcando a 100 px del borde: al doblar, ese punto
  // del contenido se va a 200 px, así que el scroll ha de valer 100.
  assert.deepEqual(
    scrollTrasPellizco({ factor: 2, centroX: 100, centroY: 50, scrollLeft: 0, scrollTop: 0 }),
    { izquierda: 100, arriba: 50 },
  );
});

test('el punto pellizcado se respeta también con la página ya desplazada', () => {
  const destino = scrollTrasPellizco({
    factor: 2, centroX: 100, centroY: 50, scrollLeft: 300, scrollTop: 200,
  });
  assert.deepEqual(destino, { izquierda: 700, arriba: 450 });
});

test('sin ampliar, el scroll se queda donde estaba', () => {
  const destino = scrollTrasPellizco({
    factor: 1, centroX: 100, centroY: 50, scrollLeft: 300, scrollTop: 200,
  });
  assert.deepEqual(destino, { izquierda: 300, arriba: 200 });
});

// ── Arrastre para pasar página ──

test('el gesto espera a saber si el recorrido es horizontal', () => {
  assert.equal(decidirArranque(0, 0), 'esperar');
  assert.equal(decidirArranque(5, 3), 'esperar');
});

test('un recorrido claramente horizontal arranca el gesto', () => {
  assert.equal(decidirArranque(30, 5), 'horizontal');
  assert.equal(decidirArranque(-30, 5), 'horizontal');
});

test('sin gesto vertical, un recorrido vertical abandona en vez de arrastrar de refilón', () => {
  assert.equal(decidirArranque(5, 40), 'abandonar');
  assert.equal(decidirArranque(5, -40), 'abandonar');
});

test('con la página entera a la vista, el recorrido vertical también es un gesto', () => {
  assert.equal(decidirArranque(5, 40, { vertical: true }), 'vertical');
  assert.equal(decidirArranque(5, -40, { vertical: true }), 'vertical');
});

test('en diagonal manda el eje que más se ha recorrido', () => {
  assert.equal(decidirArranque(50, 40), 'horizontal');
  assert.equal(decidirArranque(40, 50), 'abandonar');
  assert.equal(decidirArranque(50, 40, { vertical: true }), 'horizontal');
  assert.equal(decidirArranque(40, 50, { vertical: true }), 'vertical');
});

test('un deslizamiento vertical corto no pasa de página', () => {
  // Sin nada que siga al dedo, el roce tiene que quedarse en nada.
  assert.equal(pasaDePaginaVertical(30, 800), false);
  assert.equal(pasaDePaginaVertical(-30, 800), false);
});

test('un deslizamiento vertical largo pasa de página en los dos sentidos', () => {
  assert.equal(pasaDePaginaVertical(120, 800), true);
  assert.equal(pasaDePaginaVertical(-120, 800), true);
});

test('en una pantalla apaisada el umbral vertical no baja del mínimo en píxeles', () => {
  // El 12 % de 300 son 36 px: demasiado poco para no cambiar de página sin querer.
  assert.equal(pasaDePaginaVertical(50, 300), false);
  assert.equal(pasaDePaginaVertical(70, 300), true);
});

test('en EPUB siempre hay página al otro lado', () => {
  assert.equal(hayPaginaDestino({ haciaAtras: true, epub: true, pagina: 1, totalPaginas: 1 }), true);
});

test('en la primera página del PDF no se puede ir hacia atrás', () => {
  const pdf = { epub: false, pagina: 1, totalPaginas: 10 };
  assert.equal(hayPaginaDestino({ ...pdf, haciaAtras: true }), false);
  assert.equal(hayPaginaDestino({ ...pdf, haciaAtras: false }), true);
});

test('en la última página del PDF no se puede seguir', () => {
  assert.equal(
    hayPaginaDestino({ haciaAtras: false, epub: false, pagina: 10, totalPaginas: 10 }),
    false,
  );
});

test('en doble página hace falta que queden dos páginas por delante', () => {
  const doble = { haciaAtras: false, epub: false, totalPaginas: 10, paso: 2 };
  assert.equal(hayPaginaDestino({ ...doble, pagina: 8 }), true);
  assert.equal(hayPaginaDestino({ ...doble, pagina: 9 }), false);
});

test('la página acompaña al dedo cuando hay adónde ir', () => {
  assert.equal(recorridoDelGesto(120, { hayDestino: true, enColumnas: false, paso: 400 }), 120);
});

test('sin página a la que ir el arrastre se queda corto y se nota el tope', () => {
  assert.equal(recorridoDelGesto(120, { hayDestino: false, enColumnas: false, paso: 400 }), 30);
  assert.equal(recorridoDelGesto(-120, { hayDestino: false, enColumnas: false, paso: 400 }), -30);
});

test('deslizando columnas el recorrido no pasa de una página', () => {
  const columnas = { hayDestino: true, enColumnas: true, paso: 400 };
  assert.equal(recorridoDelGesto(600, columnas), 400);
  assert.equal(recorridoDelGesto(-600, columnas), -400);
  assert.equal(recorridoDelGesto(150, columnas), 150);
});

test('un roce no cambia de página', () => {
  assert.equal(pasaDePagina(50, 1000), false);
  assert.equal(pasaDePagina(-50, 1000), false);
});

test('pasado el umbral la página termina de salir', () => {
  assert.equal(pasaDePagina(300, 1000), true);
  assert.equal(pasaDePagina(-300, 1000), true);
});

test('un ancho de cero no hace que cualquier roce pase página', () => {
  assert.equal(pasaDePagina(0, 0), false);
});

// ── Pellizco del tamaño de letra del EPUB ──

// Pellizco recién empezado: nunca ha saltado y parte de 100.
const recien = { inicial: 100, tamano: 100, ultimo: 0 };
const ahora = 10_000;

test('el gesto va amortiguado: hay que separar mucho para que la letra suba', () => {
  // Al doble de distancia, la raíz cuadrada pide ~141: sube un salto, no 100.
  assert.equal(saltoDeLetra(recien, 200, 100, ahora), 100 + SALTO_LETRA);
});

test('la letra sube de un salto en un salto, no de golpe hasta el objetivo', () => {
  // Distancia enorme: el objetivo se dispara, pero solo se avanza un escalón.
  assert.equal(saltoDeLetra(recien, 10_000, 100, ahora), 100 + SALTO_LETRA);
});

test('juntar los dedos baja la letra', () => {
  assert.equal(saltoDeLetra(recien, 25, 100, ahora), 100 - SALTO_LETRA);
});

test('dentro de la zona muerta un temblor del dedo no mueve la letra', () => {
  // A 105 de distancia el objetivo queda en ~102: menos de los 7,5 que exige.
  assert.equal(saltoDeLetra(recien, 105, 100, ahora), null);
});

test('no encadena saltos más rápido de lo que se recompone el capítulo', () => {
  const acabaDeSaltar = { ...recien, ultimo: ahora - ESPERA_ENTRE_SALTOS + 1 };
  assert.equal(saltoDeLetra(acabaDeSaltar, 200, 100, ahora), null);
  const yaPuede = { ...recien, ultimo: ahora - ESPERA_ENTRE_SALTOS };
  assert.equal(saltoDeLetra(yaPuede, 200, 100, ahora), 100 + SALTO_LETRA);
});

test('la letra no se sale de los topes', () => {
  const desdeElTope = { inicial: 100, tamano: LETRA_MAXIMA, ultimo: 0 };
  assert.equal(saltoDeLetra(desdeElTope, 10_000, LETRA_MAXIMA, ahora), null);
  const desdeElSuelo = { inicial: 100, tamano: LETRA_MINIMA, ultimo: 0 };
  assert.equal(saltoDeLetra(desdeElSuelo, 1, LETRA_MINIMA, ahora), null);
});

test('el último salto se queda justo en el tope', () => {
  const casiArriba = LETRA_MAXIMA - SALTO_LETRA / 2;
  const pellizco = { inicial: 100, tamano: casiArriba, ultimo: 0 };
  assert.equal(saltoDeLetra(pellizco, 10_000, casiArriba, ahora), LETRA_MAXIMA);
});

test('una distancia inicial de cero no rompe la cuenta', () => {
  assert.ok(Number.isFinite(saltoDeLetra({ inicial: 0, tamano: 100, ultimo: 0 }, 50, 100, ahora)));
});
