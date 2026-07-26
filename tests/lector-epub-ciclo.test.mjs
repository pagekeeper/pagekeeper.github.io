import test from 'node:test';
import assert from 'node:assert/strict';

import { LectorEpub } from '../js/lector-epub.js';

function diferida() {
  let resolver;
  const promesa = new Promise((resolve) => { resolver = resolve; });
  return { promesa, resolver };
}

function vistaFalsa({
  alAplicarTema = null,
  alMostrar = null,
  reubicacion = Promise.resolve(),
} = {}) {
  const eventos = {};
  return {
    eventos,
    hooks: { content: { register() {} } },
    themes: {
      default() {},
      fontSize() {},
      override(propiedad, valor) { alAplicarTema?.(propiedad, valor); },
    },
    annotations: {
      remove() {},
      highlight() {},
    },
    on(nombre, manejador) { eventos[nombre] = manejador; },
    async display(destino) {
      alMostrar?.();
      reubicacion.then((cfi) => {
        eventos.relocated?.({ start: { cfi: cfi ?? destino } });
      });
    },
    getContents() { return []; },
    destroy() {},
  };
}

function libroFalso({ generacion = Promise.resolve(), vista = vistaFalsa() } = {}) {
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

test('el tema del EPUB se aplica antes de restaurar el CFI guardado', async () => {
  const orden = [];
  const vista = vistaFalsa({
    alAplicarTema: () => orden.push('tema'),
    alMostrar: () => orden.push('cfi'),
  });
  prepararEntorno([libroFalso({ vista })]);
  const lector = new LectorEpub({
    contenedor: contenedorFalso(),
    alCambiarPosicion() {},
  });

  await lector.abrir(new Uint8Array(), 'guardado', 'pagina', {
    localizaciones: 'cache',
    temaPagina: 'sepia',
  });

  assert.equal(lector.temaPagina, 'sepia');
  assert.ok(orden.indexOf('tema') >= 0);
  assert.ok(orden.indexOf('tema') < orden.indexOf('cfi'));
});

test('abrir espera la reubicación tardía del CFI antes de terminar la restauración', async () => {
  const pendiente = diferida();
  const vista = vistaFalsa({ reubicacion: pendiente.promesa });
  prepararEntorno([libroFalso({ vista })]);
  const lector = new LectorEpub({
    contenedor: contenedorFalso(),
    alCambiarPosicion() {},
  });
  let abierta = false;

  const apertura = lector.abrir(new Uint8Array(), 'guardado', 'pagina', {
    localizaciones: 'cache',
  }).then(() => { abierta = true; });
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(abierta, false);
  pendiente.resolver('normalizado');
  await apertura;
  assert.equal(abierta, true);
  assert.equal(lector.cfi, 'normalizado');
});

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
