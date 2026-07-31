import test from 'node:test';
import assert from 'node:assert/strict';
import {
  columnasAutomaticas, columnasEfectivas, normalizarColumnas,
  valoresDisponibles, aspectoDeLaOpcion, COLUMNAS_MAXIMAS,
} from '../js/columnas.js';

test('el automático reparte la pantalla en columnas de unos 28 em', () => {
  // Con letra de 16 px una columna cómoda ocupa 448 px.
  assert.equal(columnasAutomaticas(390, 16), 1);    // móvil
  assert.equal(columnasAutomaticas(800, 16), 1);    // tableta vertical
  assert.equal(columnasAutomaticas(1200, 16), 2);   // portátil
  assert.equal(columnasAutomaticas(1400, 16), 3);   // pantalla ancha
  assert.equal(columnasAutomaticas(2400, 16), 4);
});

test('al agrandar la letra caben menos columnas', () => {
  assert.equal(columnasAutomaticas(1200, 16), 2);
  assert.equal(columnasAutomaticas(1200, 24), 1);
});

test('el automático nunca baja de una ni pasa del máximo', () => {
  assert.equal(columnasAutomaticas(0, 16), 1);
  assert.equal(columnasAutomaticas(100, 16), 1);
  assert.equal(columnasAutomaticas(99999, 16), COLUMNAS_MAXIMAS);
  assert.equal(columnasAutomaticas(1200, 0), 2); // sin letra medida, se supone 16 px
});

test('un valor a mano manda sobre el tamaño de la pantalla', () => {
  assert.equal(columnasEfectivas(3, 390, 16), 3);   // aunque sea un móvil
  assert.equal(columnasEfectivas(1, 2400, 16), 1);
  assert.equal(columnasEfectivas('auto', 1200, 16), 2);
});

test('lo que no se reconoce vuelve a automático', () => {
  for (const valor of [null, undefined, '', 'dos', 2.5, NaN, {}]) {
    assert.equal(normalizarColumnas(valor), 'auto');
  }
});

test('los números fuera de rango se acotan', () => {
  assert.equal(normalizarColumnas(0), 1);
  assert.equal(normalizarColumnas(-3), 1);
  assert.equal(normalizarColumnas(9), COLUMNAS_MAXIMAS);
  assert.equal(normalizarColumnas('3'), 3);
});

test('el PDF solo ofrece una o dos páginas', () => {
  assert.deepEqual(valoresDisponibles(true), [1, 2]);
  assert.deepEqual(valoresDisponibles(false), ['auto', 1, 2, 3, 4]);
});

test('cada opción sabe con qué texto e icono se pinta', () => {
  assert.deepEqual(aspectoDeLaOpcion('auto'), { clave: 'columnsAuto', icono: 'sparkles' });
  assert.deepEqual(aspectoDeLaOpcion(1), { clave: 'columnsOne', icono: 'square' });
  assert.deepEqual(aspectoDeLaOpcion(2), { clave: 'columnsTwo', icono: 'columns-2' });
  assert.deepEqual(aspectoDeLaOpcion(4), { clave: 'columnsFour', icono: 'columns-4' });
});

test('en el PDF las opciones se llaman páginas, no columnas', () => {
  assert.deepEqual(aspectoDeLaOpcion(1, true), { clave: 'onePage', icono: 'square' });
  assert.deepEqual(aspectoDeLaOpcion(2, true), { clave: 'twoPages', icono: 'columns-2' });
});
