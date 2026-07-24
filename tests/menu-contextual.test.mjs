import test from 'node:test';
import assert from 'node:assert/strict';

import { abrePorRaton } from '../js/menu-contextual.js';

test('abre con el botón derecho del ratón', () => {
  assert.equal(abrePorRaton({ pointerType: 'mouse', button: 2 }), true);
});

test('no abre con la pulsación larga de un dedo', () => {
  assert.equal(abrePorRaton({ pointerType: 'touch', button: 0 }), false);
});

test('no abre con el lápiz', () => {
  assert.equal(abrePorRaton({ pointerType: 'pen', button: 0 }), false);
});

test('sin pointerType se guía por el botón derecho', () => {
  assert.equal(abrePorRaton({ button: 2 }), true);
  assert.equal(abrePorRaton({ button: 0 }), false);
});

test('un evento vacío no abre nada', () => {
  assert.equal(abrePorRaton(undefined), false);
  assert.equal(abrePorRaton({}), false);
});
