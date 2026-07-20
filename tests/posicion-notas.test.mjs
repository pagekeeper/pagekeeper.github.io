import test from 'node:test';
import assert from 'node:assert/strict';

import { posicionVerticalLibre } from '../js/posicion-notas.js';

test('mantiene la posición de un icono cuando está libre', () => {
  assert.equal(posicionVerticalLibre(80, [], 500), 80);
});

test('separa dos iconos de notas situadas en la misma línea', () => {
  const primera = posicionVerticalLibre(80, [], 500);
  const segunda = posicionVerticalLibre(80, [primera], 500);

  assert.equal(segunda, 114);
});

test('coloca el siguiente icono encima si no cabe debajo', () => {
  assert.equal(posicionVerticalLibre(470, [462], 500), 428);
});

test('mantiene todos los iconos accesibles cuando coinciden varias notas', () => {
  const posiciones = [];
  for (let indice = 0; indice < 5; indice += 1) {
    posiciones.push(posicionVerticalLibre(100, posiciones, 500));
  }

  assert.equal(new Set(posiciones).size, 5);
  assert.ok(posiciones.every((posicion) => posicion >= 4 && posicion <= 466));
});
