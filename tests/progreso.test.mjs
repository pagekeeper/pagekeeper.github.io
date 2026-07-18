import test from 'node:test';
import assert from 'node:assert/strict';

import {
  anotarPagina,
  fusionarEntradas,
  sincronizar,
  ultimoLibroLeido,
} from '../js/progreso.js';

function entrada({ pagina, posicionActualizada, marcadores = [], actualizado = posicionActualizada }) {
  return {
    pagina,
    paginas: 100,
    posicionActualizada,
    marcadoresActualizados: actualizado,
    marcadoresVersion: 2,
    marcadores,
    actualizado,
  };
}

test('elige como lectura actual el libro cuya posición cambió más recientemente', () => {
  const resultado = ultimoLibroLeido({ libros: {
    'anterior.pdf': entrada({ pagina: 80, posicionActualizada: '2026-01-02T10:00:00.000Z' }),
    'actual.epub': entrada({ pagina: 25, posicionActualizada: '2026-01-03T10:00:00.000Z' }),
  } });
  assert.equal(resultado.id, 'actual.epub');
});

test('editar un marcador no desplaza al libro leído más recientemente', () => {
  const resultado = ultimoLibroLeido({ libros: {
    'marcador-editado.pdf': entrada({
      pagina: 10,
      posicionActualizada: '2026-01-01T10:00:00.000Z',
      actualizado: '2026-02-01T10:00:00.000Z',
    }),
    'lectura-actual.pdf': entrada({
      pagina: 40,
      posicionActualizada: '2026-01-05T10:00:00.000Z',
    }),
  } });
  assert.equal(resultado.id, 'lectura-actual.pdf');
});

test('editar un marcador desde una posición antigua no hace retroceder la lectura', () => {
  const local = entrada({
    pagina: 20,
    posicionActualizada: '2026-01-01T10:00:00.000Z',
    actualizado: '2026-01-03T10:00:00.000Z',
    marcadores: [{ id: 'm1', pagina: 20, nombre: 'Tema', actualizado: '2026-01-03T10:00:00.000Z' }],
  });
  const remoto = entrada({
    pagina: 80,
    posicionActualizada: '2026-01-02T10:00:00.000Z',
    marcadores: [{ id: 'm1', pagina: 20, actualizado: '2026-01-01T10:00:00.000Z' }],
  });

  const resultado = fusionarEntradas(local, remoto, { marcadores: { m1: 'pendiente' } });
  assert.equal(resultado.pagina, 80);
  assert.equal(resultado.marcadores.find((marcador) => marcador.id === 'm1').nombre, 'Tema');
});

test('conserva marcadores añadidos simultáneamente en dos dispositivos', () => {
  const local = entrada({
    pagina: 10,
    posicionActualizada: '2026-01-01T10:00:00.000Z',
    marcadores: [{ id: 'local', pagina: 10, actualizado: '2026-01-02T10:00:00.000Z' }],
  });
  const remoto = entrada({
    pagina: 15,
    posicionActualizada: '2026-01-01T11:00:00.000Z',
    marcadores: [{ id: 'remoto', pagina: 15, actualizado: '2026-01-02T11:00:00.000Z' }],
  });

  const resultado = fusionarEntradas(local, remoto);
  assert.deepEqual(new Set(resultado.marcadores.map((marcador) => marcador.id)), new Set(['local', 'remoto']));
});

test('un borrado sincronizado no resucita por una copia antigua', () => {
  const local = entrada({
    pagina: 10,
    posicionActualizada: '2026-01-01T10:00:00.000Z',
    marcadores: [{ id: 'm1', borrado: true, actualizado: '2026-01-03T10:00:00.000Z' }],
  });
  const remoto = entrada({
    pagina: 10,
    posicionActualizada: '2026-01-01T10:00:00.000Z',
    marcadores: [{ id: 'm1', pagina: 10, actualizado: '2026-01-02T10:00:00.000Z' }],
  });

  const resultado = fusionarEntradas(local, remoto);
  assert.equal(resultado.marcadores.find((marcador) => marcador.id === 'm1').borrado, true);
});

test('un cambio local pendiente prevalece aunque el reloj remoto esté adelantado', () => {
  const local = entrada({ pagina: 25, posicionActualizada: '2026-01-01T10:00:00.000Z' });
  const remoto = entrada({ pagina: 90, posicionActualizada: '2099-01-01T10:00:00.000Z' });
  const resultado = fusionarEntradas(local, remoto, { posicion: 'pendiente' });
  assert.equal(resultado.pagina, 25);
  assert.ok(resultado.posicionActualizada > remoto.posicionActualizada);
});

test('relee, fusiona y reintenta cuando falla un PUT por ETag', async () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node test' },
    configurable: true,
  });

  anotarPagina('libro.pdf', 25, 100);
  let remoto = { version: 2, libros: {
    'libro.pdf': entrada({ pagina: 80, posicionActualizada: '2099-01-01T10:00:00.000Z' }),
  } };
  let lecturas = 0;
  let escrituras = 0;
  const cliente = {
    base: 'https://nube.test/libros',
    async leerProgreso() {
      lecturas++;
      const copia = structuredClone(remoto);
      Object.defineProperty(copia, '_etag', { value: `"v${lecturas}"`, enumerable: false });
      return copia;
    },
    async escribirProgreso(datos) {
      escrituras++;
      if (escrituras === 1) {
        remoto.libros['libro.pdf'] = entrada({
          pagina: 90,
          posicionActualizada: '2099-02-01T10:00:00.000Z',
        });
        const error = new Error('conflicto');
        error.conflictoSincronizacion = true;
        throw error;
      }
      remoto = structuredClone(datos);
    },
  };

  const resultado = await sincronizar(cliente);
  assert.equal(lecturas, 2);
  assert.equal(escrituras, 2);
  assert.equal(resultado.libros['libro.pdf'].pagina, 25);
  assert.equal(remoto.libros['libro.pdf'].pagina, 25);
});

test('no sobrescribe una página cambiada mientras esperaba la respuesta remota', async () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  anotarPagina('otro.pdf', 5, 100);
  let guardado;
  const cliente = {
    base: 'https://nube.test/libros',
    async leerProgreso() {
      await Promise.resolve();
      anotarPagina('otro.pdf', 40, 100);
      return { version: 2, libros: {
        'otro.pdf': entrada({ pagina: 10, posicionActualizada: '2026-01-01T10:00:00.000Z' }),
      } };
    },
    async escribirProgreso(datos) { guardado = structuredClone(datos); },
  };

  const resultado = await sincronizar(cliente);
  assert.equal(resultado.libros['otro.pdf'].pagina, 40);
  assert.equal(guardado.libros['otro.pdf'].pagina, 40);
});
