import test from 'node:test';
import assert from 'node:assert/strict';
import {
  columnasAutomaticas, columnasEfectivas, normalizarColumnas,
  valoresDisponibles, aspectoDeLaOpcion, COLUMNAS_MAXIMAS,
} from '../js/columnas.js';

test('el automático reparte la pantalla en columnas de unos 18 em', () => {
  // Con letra de 16 px una columna ocupa 288 px.
  assert.equal(columnasAutomaticas(280, 16), 1);    // móvil
  assert.equal(columnasAutomaticas(560, 16), 1);    // tableta vertical
  assert.equal(columnasAutomaticas(600, 16), 2);
  assert.equal(columnasAutomaticas(900, 16), 3);
  assert.equal(columnasAutomaticas(1500, 16), 4);   // el tope
});

test('el hueco entre columnas se descuenta', () => {
  // 1536 px de texto con letra de 16 px darían cinco columnas de no ser por el
  // hueco de 128 px que epub.js deja entre ellas.
  assert.equal(columnasAutomaticas(1536, 16), 4);        // sin contarlo, el tope
  assert.equal(columnasAutomaticas(1536, 16, 128), 3);   // contándolo
});

test('con la letra grande, que es cuando hacen falta, siguen saliendo', () => {
  // El caso que motivó el ajuste: monitor ancho con el texto al 200 %.
  assert.equal(columnasAutomaticas(1235, 32), 2);
  assert.equal(columnasAutomaticas(1120, 24), 2);
  assert.equal(columnasAutomaticas(600, 32), 1);    // ahí ya no cabe la segunda
});

test('el automático nunca baja de una ni pasa del máximo', () => {
  assert.equal(columnasAutomaticas(0, 16), 1);
  assert.equal(columnasAutomaticas(100, 16), 1);
  assert.equal(columnasAutomaticas(99999, 16), COLUMNAS_MAXIMAS);
  assert.equal(columnasAutomaticas(600, 0), 2);  // sin letra medida, se supone 16 px
});

test('un valor a mano manda sobre el tamaño de la pantalla', () => {
  assert.equal(columnasEfectivas(3, 390, 16), 3);   // aunque sea un móvil
  assert.equal(columnasEfectivas(1, 2400, 16), 1);
  assert.equal(columnasEfectivas('auto', 600, 16), 2);
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
