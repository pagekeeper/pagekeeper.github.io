import test from 'node:test';
import assert from 'node:assert/strict';

// El módulo del tema mira el almacenamiento y la preferencia del sistema en
// cuanto se le pregunta algo, así que se le montan los dos antes de cargarlo.
// No se toca el DOM: aquí solo se comprueba qué tema sale, no cómo se pinta.
const almacen = new Map();
let sistemaOscuro = false;

// El tema elegido, que es la clave que más se toca en estas pruebas.
const guardar = (valor) => {
  if (valor === null) almacen.delete('lector.tema');
  else almacen.set('lector.tema', valor);
};

globalThis.localStorage = {
  getItem: (clave) => (almacen.has(clave) ? almacen.get(clave) : null),
  setItem: (clave, valor) => almacen.set(clave, String(valor)),
  removeItem: (clave) => almacen.delete(clave),
};
globalThis.window = { matchMedia: () => ({ matches: sistemaOscuro }) };
globalThis.document = {
  documentElement: { dataset: {} },
  querySelector: () => null,
  dispatchEvent: () => true,
};
globalThis.CustomEvent = class { constructor(tipo) { this.type = tipo; } };

const {
  temaElegido, temaEfectivo, esTemaOscuro, resolverTema,
  varianteAuto, guardarVarianteAuto, opcionesDelLado, LADOS_AUTO, TEMAS,
} = await import('../js/tema.js');

test('sin nada guardado se sigue al sistema', () => {
  almacen.clear();
  assert.equal(temaElegido(), 'auto');
  sistemaOscuro = false;
  assert.equal(temaEfectivo(), 'claro');
  sistemaOscuro = true;
  assert.equal(temaEfectivo(), 'oscuro');
});

test('un tema guardado manda sobre el del sistema', () => {
  guardar('sepia');
  sistemaOscuro = true;
  assert.equal(temaElegido(), 'sepia');
  assert.equal(temaEfectivo(), 'sepia');
});

// Un valor de otra versión de la aplicación, o escrito a mano en el navegador,
// no puede dejar la página con un data-tema que no existe en la hoja de estilos.
test('un valor desconocido cae en el del sistema', () => {
  guardar('fucsia');
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

// ── Qué tema usa «el del sistema» a cada lado ──

test('de fábrica cada lado va al tema que se llama como él', () => {
  almacen.clear();
  assert.equal(varianteAuto('claro'), 'claro');
  assert.equal(varianteAuto('oscuro'), 'oscuro');
  assert.deepEqual(LADOS_AUTO, ['claro', 'oscuro']);
  assert.deepEqual(opcionesDelLado('claro'), ['claro', 'sepia']);
  assert.deepEqual(opcionesDelLado('oscuro'), ['oscuro', 'negro']);
});

test('el sistema lleva a la variante elegida en cada lado', () => {
  almacen.clear();
  guardarVarianteAuto('claro', 'sepia');
  guardarVarianteAuto('oscuro', 'negro');
  sistemaOscuro = false;
  assert.equal(temaEfectivo(), 'sepia');
  sistemaOscuro = true;
  assert.equal(temaEfectivo(), 'negro');
});

// Elegir un tema a mano sigue mandando: las variantes solo hablan del automático.
test('las variantes no tocan el tema puesto a mano', () => {
  almacen.clear();
  guardarVarianteAuto('oscuro', 'negro');
  guardar('oscuro');
  sistemaOscuro = true;
  assert.equal(temaEfectivo(), 'oscuro');
});

// Lo de fábrica no se escribe, para que una versión futura pueda cambiarlo sin
// arrastrar el valor viejo de quien nunca tocó el ajuste.
test('volver a lo de fábrica borra la clave en vez de guardarla', () => {
  almacen.clear();
  guardarVarianteAuto('claro', 'sepia');
  assert.equal(almacen.get('lector.temaAutoClaro'), 'sepia');
  guardarVarianteAuto('claro', 'claro');
  assert.ok(!almacen.has('lector.temaAutoClaro'));
});

test('una variante que no vale para ese lado no se acepta', () => {
  almacen.clear();
  guardarVarianteAuto('claro', 'negro');   // el negro es del lado oscuro
  assert.equal(varianteAuto('claro'), 'claro');
  almacen.set('lector.temaAutoOscuro', 'sepia'); // escrito a mano en el navegador
  assert.equal(varianteAuto('oscuro'), 'oscuro');
});

// La función que decide, sin almacenamiento ni navegador de por medio.
test('resolverTema traduce el automático y respeta lo elegido', () => {
  const variantes = { claro: 'sepia', oscuro: 'negro' };
  assert.equal(resolverTema('auto', false, variantes), 'sepia');
  assert.equal(resolverTema('auto', true, variantes), 'negro');
  assert.equal(resolverTema('claro', true, variantes), 'claro');
  // Sin variantes, o con una que no vale, cada lado cae en lo de fábrica.
  assert.equal(resolverTema('auto', false, {}), 'claro');
  assert.equal(resolverTema('auto', true, { oscuro: 'fucsia' }), 'oscuro');
});
