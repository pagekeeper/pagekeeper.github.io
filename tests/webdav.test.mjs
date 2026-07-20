import test from 'node:test';
import assert from 'node:assert/strict';

import { ClienteWebDav } from '../js/webdav.js';

const cliente = () => new ClienteWebDav({
  url: 'https://nube.test/libros',
  usuario: 'usuario',
  clave: 'clave',
});

test('guarda el progreso con un PUT compatible sin cabeceras condicionales', async () => {
  let peticion;
  globalThis.fetch = async (_url, opciones) => {
    peticion = opciones;
    return new Response(null, { status: 204 });
  };

  await cliente().escribirProgreso({ version: 2, libros: {} }, '"etag-1"');
  assert.equal(peticion.method, 'PUT');
  assert.equal(peticion.headers['Content-Type'], 'application/json');
  assert.equal('If-Match' in peticion.headers, false);
  assert.equal('If-None-Match' in peticion.headers, false);
});

test('guarda las anotaciones en un JSON lateral usando el ETag', async () => {
  let url;
  let peticion;
  globalThis.fetch = async (destino, opciones) => {
    url = destino;
    peticion = opciones;
    return new Response(null, { status: 204 });
  };

  await cliente().escribirAnotaciones('Curso/tema.pdf', { version: 1, anotaciones: [] }, '"v2"');
  assert.equal(url, 'https://nube.test/libros/Curso/tema.pdf.pagekeeper.json');
  assert.equal(peticion.headers['If-Match'], '"v2"');
});

test('detecta un conflicto al crear simultáneamente un archivo de anotaciones', async () => {
  globalThis.fetch = async () => new Response(null, { status: 412 });
  await assert.rejects(
    cliente().escribirAnotaciones('libro.epub', { version: 1, anotaciones: [] }),
    (error) => error.conflictoSincronizacion === true,
  );
});

test('actualiza un JSON existente aunque WebDAV no exponga su ETag por CORS', async () => {
  let peticion;
  globalThis.fetch = async (_url, opciones) => {
    peticion = opciones;
    return new Response(null, { status: 204 });
  };

  await cliente().escribirAnotaciones(
    'libro.epub', { version: 1, anotaciones: [] }, null, true,
  );
  assert.equal('If-Match' in peticion.headers, false);
  assert.equal('If-None-Match' in peticion.headers, false);
});

test('no usa un ETag débil en If-Match', async () => {
  let peticion;
  globalThis.fetch = async (_url, opciones) => {
    peticion = opciones;
    return new Response(null, { status: 204 });
  };

  await cliente().escribirAnotaciones(
    'libro.pdf', { version: 1, anotaciones: [] }, 'W/"v2"', true,
  );
  assert.equal('If-Match' in peticion.headers, false);
  assert.equal('If-None-Match' in peticion.headers, false);
});

test('permite omitir If-Match si el servidor rechaza una condición sin cambios', async () => {
  let peticion;
  globalThis.fetch = async (_url, opciones) => {
    peticion = opciones;
    return new Response(null, { status: 204 });
  };

  await cliente().escribirAnotaciones(
    'libro.pdf', { version: 1, anotaciones: [] }, '"v2"', true, false,
  );
  assert.equal('If-Match' in peticion.headers, false);
  assert.equal('If-None-Match' in peticion.headers, false);
});

test('mueve el JSON lateral junto al libro y conserva las subcarpetas', async () => {
  const peticiones = [];
  globalThis.fetch = async (url, opciones) => {
    peticiones.push({ url, opciones });
    return new Response(null, { status: opciones.method === 'PROPFIND' ? 207 : 204 });
  };

  const movido = await cliente().moverAnotaciones(
    'Curso/tema.pdf', 'Archivo/tema.pdf', true,
  );
  assert.equal(movido, true);
  assert.equal(peticiones[0].url, 'https://nube.test/libros/Curso/tema.pdf.pagekeeper.json');
  assert.equal(peticiones[1].opciones.method, 'MOVE');
  assert.equal(
    peticiones[1].opciones.headers.Destination,
    'https://nube.test/libros/Archivo/tema.pdf.pagekeeper.json',
  );
  assert.equal(peticiones[1].opciones.headers.Overwrite, 'T');
});
