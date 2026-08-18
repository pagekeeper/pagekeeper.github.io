import test from 'node:test';
import assert from 'node:assert/strict';

import {
  leerEnlaceDeLibro,
  nombreDesdeUrl,
  formatoDesdeNombre,
  validarUrlLibro,
  libroYaDescargado,
  tamanoAceptable,
  TAMANO_MAXIMO,
} from '../js/libro-por-url.js';

test('el enlace se saca del fragmento y llega descodificado', () => {
  assert.equal(
    leerEnlaceDeLibro('#libro=https%3A%2F%2Fejemplo.org%2Fapuntes.epub'),
    'https://ejemplo.org/apuntes.epub',
  );
  // Sin fragmento, o con otro, no hay libro que abrir.
  assert.equal(leerEnlaceDeLibro('#cfg=abc'), null);
  assert.equal(leerEnlaceDeLibro(''), null);
  // Un porcentaje suelto rompe la descodificación y se descarta.
  assert.equal(leerEnlaceDeLibro('#libro=%'), null);
});

test('el nombre sale del último tramo de la ruta, sin consulta ni fragmento', () => {
  assert.equal(
    nombreDesdeUrl(new URL('https://ejemplo.org/libros/Cap%C3%ADtulo%201.epub?v=2#p3')),
    'Capítulo 1.epub',
  );
  // Sin extensión conocida no hay nombre válido: no sabemos qué es.
  assert.equal(nombreDesdeUrl(new URL('https://ejemplo.org/libros/')), '');
  assert.equal(nombreDesdeUrl(new URL('https://ejemplo.org/descargar?id=7')), '');
});

test('un nombre larguísimo se recorta sin perder la extensión', () => {
  const largo = 'a'.repeat(300);
  const nombre = nombreDesdeUrl(new URL(`https://ejemplo.org/${largo}.epub`));
  assert.ok(nombre.length <= 120);
  assert.ok(nombre.endsWith('.epub'));
});

test('las barras del nombre no se cuelan como carpeta', () => {
  assert.equal(
    nombreDesdeUrl(new URL('https://ejemplo.org/a%2F..%2Fb.epub')),
    'a .. b.epub',
  );
});

test('el formato se deduce de la extensión', () => {
  assert.equal(formatoDesdeNombre('apuntes.epub'), 'epub');
  assert.equal(formatoDesdeNombre('apuntes.EPUB'), 'epub');
  assert.equal(formatoDesdeNombre('apuntes.pdf'), 'pdf');
});

test('una dirección válida devuelve el servidor y el nombre para confirmarla', () => {
  const libro = validarUrlLibro('https://ejemplo.org/libros/apuntes.epub');
  assert.deepEqual(libro, {
    url: 'https://ejemplo.org/libros/apuntes.epub',
    host: 'ejemplo.org',
    nombre: 'apuntes.epub',
    formato: 'epub',
  });
});

test('solo se acepta https y solo libros', () => {
  for (const malo of [
    'http://ejemplo.org/apuntes.epub',       // sin cifrar
    'file:///home/alguien/apuntes.epub',     // el disco de quien abre
    'data:application/epub+zip;base64,AAAA', // incrustado en el propio enlace
    'javascript:alert(1)',
    'https://ejemplo.org/programa.exe',      // no es un libro
    'https://ejemplo.org/',                  // no apunta a ningún archivo
    'no es una dirección',
    '',
    null,
  ]) {
    assert.throws(() => validarUrlLibro(malo), /INVALID_BOOK_URL/, `debería rechazar: ${malo}`);
  }
});

test('sin cifrar solo se acepta la propia máquina, que el navegador ya trata como segura', () => {
  assert.equal(
    validarUrlLibro('http://127.0.0.1:8080/apuntes.epub').host,
    '127.0.0.1:8080',
  );
  assert.equal(validarUrlLibro('http://localhost:3000/apuntes.epub').nombre, 'apuntes.epub');
  // Cualquier otro servidor sin cifrar sigue fuera.
  assert.throws(() => validarUrlLibro('http://ejemplo.org/apuntes.epub'), /INVALID_BOOK_URL/);
});

test('una dirección desmesurada se rechaza antes de mirarla', () => {
  assert.throws(
    () => validarUrlLibro(`https://ejemplo.org/${'a'.repeat(3000)}.epub`),
    /INVALID_BOOK_URL/,
  );
});

test('un libro que ya está en la biblioteca se reconoce por el nombre', () => {
  const biblioteca = [
    { id: 'local:apuntes.pdf:2048', nombre: 'apuntes.pdf' },
    { id: 'local:MIT8.04_LecNotes1_ES.epub:27436', nombre: 'MIT8.04_LecNotes1_ES.epub' },
  ];
  assert.equal(
    libroYaDescargado(biblioteca, 'MIT8.04_LecNotes1_ES.epub')?.id,
    'local:MIT8.04_LecNotes1_ES.epub:27436',
  );
  // Las mayúsculas y los espacios de más no deberían obligar a descargarlo otra vez.
  assert.equal(
    libroYaDescargado(biblioteca, '  mit8.04_lecnotes1_es.EPUB ')?.id,
    'local:MIT8.04_LecNotes1_ES.epub:27436',
  );
  assert.equal(libroYaDescargado(biblioteca, 'otro.epub'), null);
  assert.equal(libroYaDescargado([], 'apuntes.pdf'), null);
  assert.equal(libroYaDescargado(undefined, 'apuntes.pdf'), null);
  assert.equal(libroYaDescargado(biblioteca, ''), null);
});

test('el tamaño desconocido pasa, y solo se corta lo que excede el techo', () => {
  assert.equal(tamanoAceptable(1024), true);
  assert.equal(tamanoAceptable(TAMANO_MAXIMO), true);
  assert.equal(tamanoAceptable(TAMANO_MAXIMO + 1), false);
  // Sin cabecera `Content-Length` no se puede decidir todavía.
  assert.equal(tamanoAceptable(null), true);
  assert.equal(tamanoAceptable(0), true);
});
