import test from 'node:test';
import assert from 'node:assert/strict';

import { puntoEnElMarco, clicConPunto } from '../js/zonas-toque.js';

const caja = { left: 100, top: 50, width: 400, height: 300 };

test('un punto dentro del marco se traslada a sus coordenadas', () => {
  assert.deepEqual(puntoEnElMarco(150, 100, caja), { x: 50, y: 50 });
});

test('los bordes del marco cuentan como dentro', () => {
  assert.deepEqual(puntoEnElMarco(100, 50, caja), { x: 0, y: 0 });
  assert.deepEqual(puntoEnElMarco(500, 350, caja), { x: 400, y: 300 });
});

// Con los capítulos vecinos montados hay varios marcos a la vez, así que hace
// falta descartar los que no están bajo el dedo.
test('un punto fuera del marco no es de ese marco', () => {
  assert.equal(puntoEnElMarco(99, 100, caja), null);
  assert.equal(puntoEnElMarco(150, 400, caja), null);
});

test('un marco sin medidas no atiende a nadie', () => {
  assert.equal(puntoEnElMarco(150, 100, { left: 0, top: 0, width: 0, height: 0 }), null);
  assert.equal(puntoEnElMarco(150, 100, null), null);
});

test('el clic del teclado no trae punto que mirar', () => {
  assert.equal(clicConPunto({ detail: 0 }), false);
  assert.equal(clicConPunto({}), false);
  assert.equal(clicConPunto({ detail: 1 }), true);
});
