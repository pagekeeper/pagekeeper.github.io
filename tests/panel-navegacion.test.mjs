import test from 'node:test';
import assert from 'node:assert/strict';

import {
  anchoIndiceMaximo, anchoIndiceLimitado, disposicionPanel, claveBotonIndice,
  pestanaDestino, entradaActiva, anchoDeMiniatura, tocaRehacerMiniaturas,
  distanciaFuera, estaALaVista, miniaturasQuePodar,
  ANCHO_INDICE_MINIMO, ANCHO_INDICE_POR_DEFECTO,
  ANCHO_MINIATURA_MINIMO, ANCHO_MINIATURA_MAXIMO, MAXIMO_MINIATURAS,
} from '../js/panel-navegacion.js';

// ── Ancho de la barra lateral ──

test('la barra no se queda con más de media pantalla', () => {
  assert.equal(anchoIndiceMaximo(1200), 600);
  assert.equal(anchoIndiceLimitado(900, 1200), 600);
});

test('en una ventana estrechísima la barra no baja del mínimo legible', () => {
  // La mitad de 300 son 150, por debajo del mínimo: manda el mínimo.
  assert.equal(anchoIndiceMaximo(300), ANCHO_INDICE_MINIMO);
  assert.equal(anchoIndiceLimitado(50, 300), ANCHO_INDICE_MINIMO);
});

test('un ancho normal se respeta tal cual, redondeado', () => {
  assert.equal(anchoIndiceLimitado(320.4, 1200), 320);
  assert.equal(anchoIndiceLimitado(ANCHO_INDICE_POR_DEFECTO, 1200), ANCHO_INDICE_POR_DEFECTO);
});

test('el ancho nunca baja del mínimo aunque se arrastre a la izquierda del todo', () => {
  assert.equal(anchoIndiceLimitado(-500, 1200), ANCHO_INDICE_MINIMO);
});

// ── Con qué cuenta el panel ──

test('un PDF con índice y miniaturas abre en el índice y enseña las pestañas', () => {
  assert.deepEqual(disposicionPanel(true, true), {
    hayBoton: true, hayPestanas: true, hayTitulo: false,
    hayPestanaIndice: true, pestanaInicial: 'indice',
  });
});

test('un PDF escaneado sin índice abre directamente en las miniaturas', () => {
  const solo = disposicionPanel(false, true);
  assert.equal(solo.pestanaInicial, 'miniaturas');
  assert.equal(solo.hayPestanas, false);   // una sola cosa no necesita pestañas
  assert.equal(solo.hayTitulo, true);      // el título dice qué se está viendo
  assert.equal(solo.hayPestanaIndice, false);
  assert.equal(solo.hayBoton, true);
});

test('un EPUB solo tiene índice', () => {
  const epub = disposicionPanel(true, false);
  assert.equal(epub.pestanaInicial, 'indice');
  assert.equal(epub.hayPestanas, false);
  assert.equal(epub.hayBoton, true);
});

test('sin índice ni miniaturas no hay botón que abrir', () => {
  assert.equal(disposicionPanel(false, false).hayBoton, false);
});

test('el botón nombra lo que va a abrir, que no siempre es lo mismo', () => {
  assert.equal(claveBotonIndice(false, true, true), 'showIndexThumbs');
  assert.equal(claveBotonIndice(false, true, false), 'showIndex');
  assert.equal(claveBotonIndice(false, false, true), 'showThumbs');
  assert.equal(claveBotonIndice(true, true, true), 'hideIndexThumbs');
  assert.equal(claveBotonIndice(true, false, true), 'hideThumbs');
});

// ── Pestañas con el teclado ──

test('las flechas recorren las pestañas y dan la vuelta', () => {
  assert.equal(pestanaDestino('ArrowRight', 0, 2), 1);
  assert.equal(pestanaDestino('ArrowRight', 1, 2), 0);
  assert.equal(pestanaDestino('ArrowLeft', 0, 2), 1);
  assert.equal(pestanaDestino('ArrowDown', 0, 2), 1);
  assert.equal(pestanaDestino('ArrowUp', 1, 2), 0);
});

test('Inicio y Fin van a los extremos', () => {
  assert.equal(pestanaDestino('Home', 2, 3), 0);
  assert.equal(pestanaDestino('End', 0, 3), 2);
});

test('las demás teclas no son para las pestañas', () => {
  assert.equal(pestanaDestino('a', 0, 2), null);
  assert.equal(pestanaDestino('Enter', 0, 2), null);
  assert.equal(pestanaDestino('Tab', 0, 2), null);
});

test('sin el foco en una pestaña las flechas no la mueven', () => {
  assert.equal(pestanaDestino('ArrowRight', -1, 2), null);
});

// ── Por qué capítulo se va ──

test('el capítulo activo es el último que ya ha quedado atrás', () => {
  const inicios = [1, 10, 25, 40];
  assert.equal(entradaActiva(inicios, 1), 0);
  assert.equal(entradaActiva(inicios, 9), 0);
  assert.equal(entradaActiva(inicios, 10), 1);   // justo en el que empieza
  assert.equal(entradaActiva(inicios, 30), 2);
  assert.equal(entradaActiva(inicios, 100), 3);
});

test('antes del primer capítulo no hay ninguno activo', () => {
  assert.equal(entradaActiva([5, 10], 1), -1);
});

test('los capítulos que el libro no sitúa no compiten', () => {
  // El del medio no trae número: se mantiene el anterior con número.
  assert.equal(entradaActiva([1, NaN, 25], 10), 0);
  assert.equal(entradaActiva([1, NaN, 25], 30), 2);
});

test('sin posición conocida no se resalta nada', () => {
  assert.equal(entradaActiva([1, 10], null), -1);
  assert.equal(entradaActiva([1, 10], undefined), -1);
  assert.equal(entradaActiva([1, 10], 3.5), -1);
});

test('un índice vacío no tiene capítulo activo', () => {
  assert.equal(entradaActiva([], 5), -1);
});

// ── Miniaturas ──

test('las miniaturas siguen al ancho del panel, entre sus topes', () => {
  assert.equal(anchoDeMiniatura(220), 220);
  assert.equal(anchoDeMiniatura(100), ANCHO_MINIATURA_MINIMO);
  assert.equal(anchoDeMiniatura(900), ANCHO_MINIATURA_MAXIMO);
});

test('un panel aún sin medir cae en el ancho mínimo', () => {
  assert.equal(anchoDeMiniatura(0), ANCHO_MINIATURA_MINIMO);
});

test('solo se rehacen las miniaturas si el ancho ha cambiado de veras', () => {
  assert.equal(tocaRehacerMiniaturas(200, 190), false);
  assert.equal(tocaRehacerMiniaturas(200, 160), true);
  assert.equal(tocaRehacerMiniaturas(160, 200), true);
});

const marco = { top: 100, bottom: 500 };

test('lo que asoma en el panel no está fuera', () => {
  assert.equal(distanciaFuera({ top: 200, bottom: 300 }, marco), 0);
  assert.equal(distanciaFuera({ top: 450, bottom: 550 }, marco), 0);
});

test('mide cuánto se ha ido por arriba y por abajo', () => {
  assert.equal(distanciaFuera({ top: -100, bottom: 40 }, marco), 60);
  assert.equal(distanciaFuera({ top: 700, bottom: 800 }, marco), 200);
});

test('una entrada solo está a la vista si se ve entera', () => {
  assert.equal(estaALaVista({ top: 200, bottom: 300 }, marco), true);
  assert.equal(estaALaVista({ top: 450, bottom: 550 }, marco), false);
  assert.equal(estaALaVista({ top: 50, bottom: 150 }, marco), false);
});

test('por debajo del máximo no se suelta ninguna miniatura', () => {
  const dibujadas = [{ boton: 'a', distancia: 900 }];
  assert.deepEqual(miniaturasQuePodar(dibujadas, MAXIMO_MINIATURAS), []);
});

test('se sueltan las más lejanas, y solo las que sobran', () => {
  const dibujadas = [
    { boton: 'cerca', distancia: 10 },
    { boton: 'lejísimos', distancia: 900 },
    { boton: 'lejos', distancia: 400 },
  ];
  const podadas = miniaturasQuePodar(dibujadas, MAXIMO_MINIATURAS + 2);
  assert.deepEqual(podadas.map((e) => e.boton), ['lejísimos', 'lejos']);
});

test('las que asoman en pantalla no se sueltan aunque se pase del máximo', () => {
  const dibujadas = [
    { boton: 'a la vista', distancia: 0 },
    { boton: 'otra a la vista', distancia: 0 },
    { boton: 'lejos', distancia: 400 },
  ];
  const podadas = miniaturasQuePodar(dibujadas, MAXIMO_MINIATURAS + 3);
  assert.deepEqual(podadas.map((e) => e.boton), ['lejos']);
});
