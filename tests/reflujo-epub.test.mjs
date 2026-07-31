import test from 'node:test';
import assert from 'node:assert/strict';

import { posicionTrasReflujo } from '../js/reflujo-epub.js';

// Los CFI de verdad son cadenas largas; para comparar da igual su forma, así
// que aquí las posiciones son números en texto y el comparador, una resta.
const comparar = (a, b) => Number(a) - Number(b);

test('sin ancla manda la posición que trae la vista', () => {
  assert.equal(posicionTrasReflujo('20', '40', null, comparar), '20');
});

// El caso de siempre: la página nueva empieza antes del punto de lectura pero
// lo sigue enseñando. Antes de esto, cada reajuste retrasaba media página.
test('el punto de lectura gana al inicio de la página nueva', () => {
  assert.equal(posicionTrasReflujo('20', '60', '30', comparar), '30');
});

test('si la página ya no llega al punto de lectura, manda la vista', () => {
  assert.equal(posicionTrasReflujo('20', '25', '30', comparar), '20');
});

// Al pasar de página durante el reajuste (o al saltar a una nota) la vista se
// va por delante del ancla: ahí no hay nada que conservar.
test('avanzar más allá del ancla no retrocede', () => {
  assert.equal(posicionTrasReflujo('40', '60', '30', comparar), '40');
});

test('el ancla justo en el borde de la página cuenta como visible', () => {
  assert.equal(posicionTrasReflujo('20', '30', '30', comparar), '30');
});

test('sin fin de página se compara solo con el inicio', () => {
  assert.equal(posicionTrasReflujo('30', null, '30', comparar), '30');
  assert.equal(posicionTrasReflujo('20', null, '30', comparar), '20');
});

// epub.js lanza al comparar CFI de capítulos distintos o mal formados.
test('un comparador que falla no rompe la posición', () => {
  const roto = () => { throw new Error('CFI ilegible'); };
  assert.equal(posicionTrasReflujo('20', '60', '30', roto), '20');
});

test('sin posición no se inventa ninguna', () => {
  assert.equal(posicionTrasReflujo(null, '60', '30', comparar), null);
});
