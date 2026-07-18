import test from 'node:test';
import assert from 'node:assert/strict';

import { bibliotecaDeCopias, copiaRemotaDesactualizada } from '../js/almacen.js';

test('detecta una copia remota desactualizada por ETag', () => {
  assert.equal(copiaRemotaDesactualizada(
    { etag: '"v1"', tamano: 100 },
    { etag: '"v2"', tamano: 100 },
  ), true);
});

test('usa la fecha o el tamaño cuando WebDAV no proporciona ETag', () => {
  assert.equal(copiaRemotaDesactualizada(
    { modificado: 'sábado', tamano: 100 },
    { modificado: 'domingo', tamano: 100 },
  ), true);
  assert.equal(copiaRemotaDesactualizada(
    { tamano: 100 },
    { tamano: 120 },
  ), true);
});

test('mantiene como vigente una copia con la misma versión', () => {
  assert.equal(copiaRemotaDesactualizada(
    { etag: '"v2"', tamano: 100 },
    { etag: '"v2"', tamano: 100 },
  ), false);
});

test('reconstruye carpetas y libros navegables solo con las copias locales', () => {
  const copias = [
    { id: 'raiz.pdf', tamano: 10 },
    { id: 'Curso/tema.pdf', tamano: 20 },
    { id: 'Curso/Bloque/anexo.epub', tamano: 30 },
  ];
  const raiz = bibliotecaDeCopias(copias);
  assert.deepEqual(raiz.carpetas, [{ nombre: 'Curso' }]);
  assert.deepEqual(raiz.libros.map((libro) => libro.nombre), ['raiz.pdf']);
  const curso = bibliotecaDeCopias(copias, 'Curso');
  assert.deepEqual(curso.carpetas, [{ nombre: 'Bloque' }]);
  assert.deepEqual(curso.libros.map((libro) => libro.nombre), ['tema.pdf']);
});
