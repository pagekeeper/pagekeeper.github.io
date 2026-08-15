import test from 'node:test';
import assert from 'node:assert/strict';

import { candidatosPorTamano, duplicadoDe, decidirEntrante } from '../js/duplicados.js';

const biblioteca = [
  { id: 'local:Lazarillo de Tormes.epub:149391', nombre: 'Lazarillo de Tormes.epub', tamano: 149391 },
  { id: 'local:apuntes.pdf:2048', nombre: 'apuntes.pdf', tamano: 2048 },
  { id: 'local:otro.pdf:99', nombre: 'otro.pdf', tamano: 99 },
];
const huellas = {
  'local:Lazarillo de Tormes.epub:149391': 'aaa',
  'local:apuntes.pdf:2048': 'bbb',
  'local:otro.pdf:99': 'ccc',
};

test('solo se comparan los libros del mismo tamaño', () => {
  const candidatos = candidatosPorTamano(biblioteca, {
    id: 'local:lazarillo-de-tormes-es.epub:149391', tamano: 149391,
  });
  assert.deepEqual(candidatos.map((libro) => libro.nombre), ['Lazarillo de Tormes.epub']);
  // Y el propio libro nunca es candidato a duplicarse a sí mismo.
  assert.deepEqual(
    candidatosPorTamano(biblioteca, { id: 'local:apuntes.pdf:2048', tamano: 2048 }), [],
  );
});

test('el mismo contenido con otro nombre es un duplicado', () => {
  const decision = decidirEntrante(
    { id: 'local:lazarillo-de-tormes-es.epub:149391', tamano: 149391, huella: 'aaa' },
    biblioteca, huellas,
  );
  assert.equal(decision.accion, 'duplicado');
  assert.equal(decision.libro.nombre, 'Lazarillo de Tormes.epub');
});

test('el mismo archivo con el mismo nombre solo se reemplaza', () => {
  const decision = decidirEntrante(
    { id: 'local:apuntes.pdf:2048', tamano: 2048, huella: 'bbb' }, biblioteca, huellas,
  );
  assert.equal(decision.accion, 'reemplaza');
});

test('mismo tamaño pero distinto contenido no es duplicado', () => {
  const decision = decidirEntrante(
    { id: 'local:copia.pdf:2048', tamano: 2048, huella: 'zzz' }, biblioteca, huellas,
  );
  assert.equal(decision.accion, 'nuevo');
});

test('un libro nuevo entra sin más', () => {
  assert.equal(decidirEntrante(
    { id: 'local:nuevo.pdf:10', tamano: 10, huella: 'ddd' }, biblioteca, huellas,
  ).accion, 'nuevo');
  assert.equal(decidirEntrante({ id: 'local:x.pdf:1', tamano: 1, huella: 'e' }, []).accion, 'nuevo');
  assert.equal(decidirEntrante({ id: 'local:x.pdf:1', tamano: 1, huella: 'e' }).accion, 'nuevo');
});

// Si no se pudo leer lo que ya estaba guardado, no se sabe si coincide. Antes
// que dejar a nadie sin poder añadir su libro, se deja pasar.
test('sin huella del candidato no se impide nada', () => {
  assert.equal(duplicadoDe(biblioteca, 'aaa', {}), null);
  assert.equal(duplicadoDe(biblioteca, '', huellas), null);
  assert.equal(decidirEntrante(
    { id: 'local:copia.epub:149391', tamano: 149391, huella: 'aaa' }, biblioteca, {},
  ).accion, 'nuevo');
});
