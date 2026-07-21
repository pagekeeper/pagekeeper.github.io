import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FORMATO_COPIA_LOCAL, crearManifiestoCopia, validarManifiestoCopia,
  fusionarProgresoRestaurado, carpetasRemotasDeLibros,
  FORMATO_CONFIG_NUBE, crearCopiaConfigNube, validarCopiaConfigNube,
} from '../js/copia-local.js';

test('exporta y valida la configuración WebDAV incluida la contraseña', () => {
  const copia = crearCopiaConfigNube({
    url: ' https://nube.example/dav/Libros ', usuario: ' juanjo ', clave: 'secreta',
  }, '2026-07-21T00:00:00.000Z');
  assert.equal(copia.formato, FORMATO_CONFIG_NUBE);
  assert.deepEqual(validarCopiaConfigNube(copia), {
    url: 'https://nube.example/dav/Libros', usuario: 'juanjo', clave: 'secreta',
  });
});

test('rechaza archivos de configuración ajenos o incompletos', () => {
  assert.throws(() => validarCopiaConfigNube({ formato: 'otro', version: 1, config: {} }));
  assert.throws(() => validarCopiaConfigNube({
    formato: FORMATO_CONFIG_NUBE, version: 1, config: { url: 'https://nube.example' },
  }));
});

test('crea un manifiesto con rutas internas estables para PDF y EPUB', () => {
  const manifiesto = crearManifiestoCopia({
    creado: '2026-07-21T00:00:00.000Z',
    libros: [
      { id: 'local:uno.pdf:3', nombre: 'uno.pdf', tamano: 3 },
      { id: 'local:dos.epub:4', nombre: 'dos.epub', tamano: 4 },
    ],
    progreso: { version: 2, libros: {} }, anotaciones: [], preferencias: {},
  });
  assert.equal(manifiesto.formato, FORMATO_COPIA_LOCAL);
  assert.equal(manifiesto.origen, 'local');
  assert.deepEqual(manifiesto.libros.map((libro) => libro.archivo), [
    'libros/0.pdf', 'libros/1.epub',
  ]);
  assert.doesNotThrow(() => validarManifiestoCopia(manifiesto));
});

test('ordena las subcarpetas WebDAV de padres a hijos sin duplicarlas', () => {
  assert.deepEqual(carpetasRemotasDeLibros([
    { id: 'Curso/Tema 2/libro.pdf' },
    { id: 'Curso/Tema 1/otro.epub' },
    { id: 'Curso/Tema 2/segundo.pdf' },
    { id: 'raiz.pdf' },
  ]), ['Curso', 'Curso/Tema 1', 'Curso/Tema 2']);
});

test('admite copias WebDAV con subcarpetas y rechaza rutas inseguras', () => {
  const manifiesto = crearManifiestoCopia({
    origen: 'webdav',
    libros: [{ id: 'Novelas/uno.pdf', nombre: 'uno.pdf', tamano: 3 }],
    progreso: { version: 2, libros: {} }, anotaciones: [], preferencias: {},
  });
  assert.equal(validarManifiestoCopia(manifiesto).origen, 'webdav');
  manifiesto.libros[0].id = '../uno.pdf';
  assert.throws(() => validarManifiestoCopia(manifiesto));
});

test('rechaza manifiestos ajenos, duplicados o con rutas peligrosas', () => {
  const base = {
    formato: FORMATO_COPIA_LOCAL, version: 1, progreso: {}, anotaciones: [], preferencias: {},
  };
  assert.throws(() => validarManifiestoCopia({ ...base, formato: 'otro', libros: [] }));
  assert.throws(() => validarManifiestoCopia({
    ...base,
    libros: [
      { id: 'local:a.pdf:1', nombre: 'a.pdf', tamano: 1, archivo: '../a.pdf' },
    ],
  }));
  assert.throws(() => validarManifiestoCopia({
    ...base,
    libros: [
      { id: 'local:a.pdf:1', nombre: 'a.pdf', tamano: 1, archivo: 'libros/0.pdf' },
      { id: 'local:a.pdf:1', nombre: 'a.pdf', tamano: 1, archivo: 'libros/1.pdf' },
    ],
  }));
  assert.throws(() => validarManifiestoCopia({
    ...base,
    libros: [
      { id: 'local:a.pdf:1', nombre: 'a.pdf', tamano: 1, archivo: 'libros/0.pdf' },
      { id: 'local:b.pdf:1', nombre: 'b.pdf', tamano: 1, archivo: 'libros/0.pdf' },
    ],
  }));
});

test('la restauración reemplaza solo el progreso de los libros incluidos', () => {
  const actual = {
    version: 2,
    libros: {
      'local:a.pdf:1': { pagina: 8 },
      'local:conservar.pdf:2': { pagina: 3 },
      'remoto.pdf': { pagina: 10 },
    },
  };
  const copia = {
    version: 2,
    libros: {
      'local:a.pdf:1': { pagina: 2 },
      'local:no-incluido.pdf:9': { pagina: 7 },
    },
  };
  const resultado = fusionarProgresoRestaurado(actual, copia, new Set(['local:a.pdf:1']));
  assert.equal(resultado.libros['local:a.pdf:1'].pagina, 2);
  assert.equal(resultado.libros['local:conservar.pdf:2'].pagina, 3);
  assert.equal(resultado.libros['remoto.pdf'].pagina, 10);
  assert.equal(resultado.libros['local:no-incluido.pdf:9'], undefined);
});
