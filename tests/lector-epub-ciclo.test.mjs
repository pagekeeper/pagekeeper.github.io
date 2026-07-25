import test from 'node:test';
import assert from 'node:assert/strict';

import { LectorEpub } from '../js/lector-epub.js';

function diferida() {
  let resolver;
  const promesa = new Promise((resolve) => { resolver = resolve; });
  return { promesa, resolver };
}

function vistaFalsa() {
  const eventos = {};
  return {
    eventos,
    hooks: { content: { register() {} } },
    themes: {
      default() {},
      fontSize() {},
      override() {},
    },
    annotations: {
      remove() {},
      highlight() {},
    },
    on(nombre, manejador) { eventos[nombre] = manejador; },
    async display() {},
    getContents() { return []; },
    destroy() {},
  };
}

function libroFalso({ generacion = Promise.resolve() } = {}) {
  const vista = vistaFalsa();
  return {
    vista,
    ready: Promise.resolve(),
    spine: { hooks: { content: { register() {} } } },
    locations: {
      load() { return ['inicio', 'fin']; },
      generate() { return generacion; },
      percentageFromCfi(cfi) { return cfi === 'nuevo' ? 0.42 : 0.12; },
      save() { return 'localizaciones'; },
    },
    renderTo() { return vista; },
    destroy() {},
  };
}

function prepararEntorno(libros) {
  globalThis.window = {
    JSZip: {},
    ePub() { return libros.shift(); },
  };
  globalThis.document = {
    createElement() { return {}; },
    head: { append(script) { queueMicrotask(() => script.onload?.()); } },
  };
  globalThis.ResizeObserver = class {
    constructor() {}
    observe() {}
  };
  globalThis.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {};
}

function contenedorFalso() {
  return {
    replaceChildren() {},
    querySelectorAll() { return []; },
    getBoundingClientRect() {
      return { left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 };
    },
  };
}

test('una vista EPUB cerrada no puede restaurar su CFI sobre la reapertura', async () => {
  const anterior = libroFalso();
  const actual = libroFalso();
  prepararEntorno([anterior, actual]);
  const posiciones = [];
  const lector = new LectorEpub({
    contenedor: contenedorFalso(),
    alCambiarPosicion: (cfi) => posiciones.push(cfi),
  });

  await lector.abrir(new Uint8Array(), 'anterior', 'pagina', { localizaciones: 'cache' });
  lector.cerrar();
  await lector.abrir(new Uint8Array(), 'nuevo', 'pagina', { localizaciones: 'cache' });
  anterior.vista.eventos.relocated({ start: { cfi: 'anterior' } });

  assert.equal(lector.cfi, 'nuevo');
  assert.equal(posiciones.at(-1), 'nuevo');
});

test('el cálculo de localizaciones de un libro cerrado no se aplica al nuevo', async () => {
  const pendiente = diferida();
  const anterior = libroFalso({ generacion: pendiente.promesa });
  const actual = libroFalso();
  prepararEntorno([anterior, actual]);
  let cachesAntiguas = 0;
  const lector = new LectorEpub({
    contenedor: contenedorFalso(),
    alCambiarPosicion() {},
  });

  await lector.abrir(new Uint8Array(), 'anterior', 'pagina', {
    alGuardarLocalizaciones: () => { cachesAntiguas++; },
  });
  lector.cerrar();
  await lector.abrir(new Uint8Array(), 'nuevo', 'pagina', { localizaciones: 'cache' });
  pendiente.resolver();
  await pendiente.promesa;
  await Promise.resolve();

  assert.equal(lector.cfi, 'nuevo');
  assert.equal(cachesAntiguas, 0);
});
