import test from 'node:test';
import assert from 'node:assert/strict';

// El módulo del tema mira el almacenamiento y la preferencia del sistema en
// cuanto se le pregunta algo, así que se le montan los dos antes de cargarlo.
// No se toca el DOM: aquí solo se comprueba qué tema sale, no cómo se pinta.
let guardado = null;
let sistemaOscuro = false;

globalThis.localStorage = {
  getItem: (clave) => (clave === 'lector.tema' ? guardado : null),
  setItem: (clave, valor) => { if (clave === 'lector.tema') guardado = valor; },
  removeItem: (clave) => { if (clave === 'lector.tema') guardado = null; },
};
globalThis.window = { matchMedia: () => ({ matches: sistemaOscuro }) };

const { temaElegido, temaEfectivo, esTemaOscuro, TEMAS } = await import('../js/tema.js');

test('sin nada guardado se sigue al sistema', () => {
  guardado = null;
  assert.equal(temaElegido(), 'auto');
  sistemaOscuro = false;
  assert.equal(temaEfectivo(), 'claro');
  sistemaOscuro = true;
  assert.equal(temaEfectivo(), 'oscuro');
});

test('un tema guardado manda sobre el del sistema', () => {
  guardado = 'sepia';
  sistemaOscuro = true;
  assert.equal(temaElegido(), 'sepia');
  assert.equal(temaEfectivo(), 'sepia');
});

// Un valor de otra versión de la aplicación, o escrito a mano en el navegador,
// no puede dejar la página con un data-tema que no existe en la hoja de estilos.
test('un valor desconocido cae en el del sistema', () => {
  guardado = 'fucsia';
  sistemaOscuro = false;
  assert.equal(temaElegido(), 'auto');
  assert.equal(temaEfectivo(), 'claro');
});

test('el negro cuenta como tema oscuro y el sepia no', () => {
  assert.ok(esTemaOscuro('oscuro'));
  assert.ok(esTemaOscuro('negro'));
  assert.ok(!esTemaOscuro('sepia'));
  assert.ok(!esTemaOscuro('claro'));
});

// El menú se pinta recorriendo esta lista, así que su orden es el que se ve:
// «el del sistema» primero, y los papeles de más claro a más oscuro.
test('los temas van del sistema al más oscuro', () => {
  assert.deepEqual(TEMAS, ['auto', 'claro', 'sepia', 'oscuro', 'negro']);
});
