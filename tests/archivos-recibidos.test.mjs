import test from 'node:test';
import assert from 'node:assert/strict';

import { nombreDeLibroRecibido, librosRecibidos } from '../js/archivos-recibidos.js';

test('un libro con su extensión entra con el mismo nombre', () => {
  assert.equal(nombreDeLibroRecibido('Lazarillo.epub', 'application/epub+zip'), 'Lazarillo.epub');
  assert.equal(nombreDeLibroRecibido('apuntes.PDF', ''), 'apuntes.PDF');
});

test('la extensión manda aunque el tipo no la conozca', () => {
  // Muchos gestores de archivos no saben qué es un EPUB.
  assert.equal(nombreDeLibroRecibido('novela.epub', 'application/octet-stream'), 'novela.epub');
  assert.equal(nombreDeLibroRecibido('novela.epub', 'application/zip'), 'novela.epub');
});

test('sin extensión, se le pone la de su tipo', () => {
  assert.equal(nombreDeLibroRecibido('document', 'application/pdf'), 'document.pdf');
  assert.equal(nombreDeLibroRecibido('12345', 'application/epub+zip'), '12345.epub');
  assert.equal(nombreDeLibroRecibido('informe', 'application/pdf; charset=binary'), 'informe.pdf');
  assert.equal(nombreDeLibroRecibido('', 'application/pdf'), 'libro.pdf');
});

test('lo que no es un PDF ni un EPUB se descarta', () => {
  assert.equal(nombreDeLibroRecibido('foto.jpg', 'image/jpeg'), null);
  assert.equal(nombreDeLibroRecibido('sin-nada', ''), null);
  assert.equal(nombreDeLibroRecibido(undefined, undefined), null);
});

test('se queda solo con el nombre, sin la ruta', () => {
  assert.equal(nombreDeLibroRecibido('/storage/emulated/0/Download/libro.pdf', ''), 'libro.pdf');
  assert.equal(nombreDeLibroRecibido('C:\\Libros\\libro.epub', ''), 'libro.epub');
});

test('los libros recibidos salen renombrados y sin lo que no es libro', () => {
  const crear = (archivo, nombre) => ({ ...archivo, name: nombre, renombrado: true });
  const lazarillo = { name: 'Lazarillo.epub', type: 'application/epub+zip' };
  const resultado = librosRecibidos([
    lazarillo,
    { name: 'document', type: 'application/pdf' },
    { name: 'foto.jpg', type: 'image/jpeg' },
  ], crear);
  assert.equal(resultado.length, 2);
  // El que ya tenía buen nombre es el mismo objeto, sin copiarlo.
  assert.equal(resultado[0], lazarillo);
  assert.deepEqual(resultado[1], { name: 'document.pdf', type: 'application/pdf', renombrado: true });
  assert.deepEqual(librosRecibidos(null, crear), []);
});
