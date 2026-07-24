import test from 'node:test';
import assert from 'node:assert/strict';

import {
  nombreSeguro, rutaUnica, librosDeCarpetaLocal, librosDeCarpetaRemota, puedeGuardarEnDisco,
} from '../js/descarga-carpeta.js';

const libro = (nombre, carpeta = '') => ({ id: `local:${nombre}:1`, nombre, carpeta });

test('sanea los nombres que el disco no admite', () => {
  assert.equal(nombreSeguro('Novela: la negra'), 'Novela_ la negra');
  assert.equal(nombreSeguro('a/b\\c*d?e.pdf'), 'a_b_c_d_e.pdf');
  assert.equal(nombreSeguro('Ciencia ficción.epub'), 'Ciencia ficción.epub');
  assert.equal(nombreSeguro('..'), 'sin-nombre');
  assert.equal(nombreSeguro('   '), 'sin-nombre');
  assert.equal(nombreSeguro('con.pdf'), '_con.pdf'); // reservado en Windows
});

test('numera las rutas repetidas en lugar de pisarlas', () => {
  const usadas = new Set();
  assert.equal(rutaUnica(usadas, 'Novela/a.pdf'), 'Novela/a.pdf');
  assert.equal(rutaUnica(usadas, 'Novela/a.pdf'), 'Novela/a (2).pdf');
  assert.equal(rutaUnica(usadas, 'Novela/a.pdf'), 'Novela/a (3).pdf');
  assert.equal(rutaUnica(usadas, 'Novela/b.pdf'), 'Novela/b.pdf');
});

test('recoge los libros de una carpeta local y sus subcarpetas', () => {
  const entradas = librosDeCarpetaLocal([
    libro('suelto.pdf'),
    libro('uno.epub', 'Novela'),
    libro('dos.pdf', 'Novela/Negra'),
    libro('otro.pdf', 'Ensayo'),
    libro('parecida.pdf', 'Novelas'), // no cuelga de «Novela»
  ], 'Novela');
  assert.deepEqual(entradas.map((e) => e.ruta), ['uno.epub', 'Negra/dos.pdf']);
});

test('desde la raíz se lleva la biblioteca entera', () => {
  const entradas = librosDeCarpetaLocal([libro('suelto.pdf'), libro('uno.epub', 'Novela')], '');
  assert.deepEqual(entradas.map((e) => e.ruta), ['suelto.pdf', 'Novela/uno.epub']);
});

test('recorre una carpeta de la nube nivel a nivel', async () => {
  const arbol = {
    'Libros/Novela': { carpetas: [{ nombre: 'Negra' }], libros: [{ nombre: 'uno.epub' }] },
    'Libros/Novela/Negra': { carpetas: [], libros: [{ nombre: 'dos.pdf' }] },
  };
  const entradas = await librosDeCarpetaRemota((ruta) => arbol[ruta], 'Libros/Novela');
  assert.deepEqual(entradas.map((e) => [e.id, e.ruta]), [
    ['Libros/Novela/uno.epub', 'uno.epub'],
    ['Libros/Novela/Negra/dos.pdf', 'Negra/dos.pdf'],
  ]);
});

test('no baja indefinidamente por las carpetas de la nube', async () => {
  const listar = (ruta) => ({
    carpetas: [{ nombre: 'hondo' }],
    libros: [{ nombre: `${ruta.split('/').length}.pdf` }],
  });
  const entradas = await librosDeCarpetaRemota(listar, 'raiz');
  assert.equal(entradas.length, 9); // la carpeta pedida y ocho niveles más
});

test('sin API de archivos no se ofrece guardar en el disco', () => {
  assert.equal(puedeGuardarEnDisco(), false);
});
