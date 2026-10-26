import test from 'node:test';
import assert from 'node:assert/strict';

import { escalaParaQueQuepa, tramosDePalabras, ESCALA_MINIMA } from '../js/titulos-anchos.js';

test('un título que cabe no se toca', () => {
  assert.equal(escalaParaQueQuepa(200, 288), 1);
  assert.equal(escalaParaQueQuepa(288, 288), 1);
});

test('una palabra más ancha que la columna encoge el título hasta caber', () => {
  // «ADVERSIDADES» del Lazarillo a 360 px: 437 px en una columna de 288.
  const escala = escalaParaQueQuepa(437, 288);
  assert.ok(escala < 1);
  assert.ok(437 * escala <= 288, 'tiene que caber entera');
  assert.ok(437 * escala > 288 * 0.9, 'sin encoger más de lo necesario');
});

test('no se encoge por debajo de la mitad', () => {
  assert.equal(escalaParaQueQuepa(2000, 288), ESCALA_MINIMA);
});

test('sin medidas no se toca nada', () => {
  assert.equal(escalaParaQueQuepa(0, 288), 1);
  assert.equal(escalaParaQueQuepa(437, 0), 1);
  assert.equal(escalaParaQueQuepa(NaN, 288), 1);
  assert.equal(escalaParaQueQuepa(undefined, undefined), 1);
});

test('las palabras se localizan por su posición en el texto', () => {
  assert.deepEqual(tramosDePalabras('LA VIDA  DE'), [[0, 2], [3, 7], [9, 11]]);
  assert.deepEqual(tramosDePalabras('\n  FORTUNAS\n'), [[3, 11]]);
  assert.deepEqual(tramosDePalabras(''), []);
  assert.deepEqual(tramosDePalabras(null), []);
});
