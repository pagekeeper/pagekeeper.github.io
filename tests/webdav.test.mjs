import test from 'node:test';
import assert from 'node:assert/strict';

import { ClienteWebDav } from '../js/webdav.js';

const cliente = () => new ClienteWebDav({
  url: 'https://nube.test/libros',
  usuario: 'usuario',
  clave: 'clave',
});

test('envía If-Match al actualizar y detecta un conflicto 412', async () => {
  let headers;
  globalThis.fetch = async (_url, opciones) => {
    headers = { ...opciones.headers };
    return new Response('', { status: 412, statusText: 'Precondition Failed' });
  };

  await assert.rejects(
    cliente().escribirProgreso({ version: 2, libros: {} }, '"etag-1"'),
    (error) => error.conflictoSincronizacion === true,
  );
  assert.equal(headers['If-Match'], '"etag-1"');
});

test('usa If-None-Match al crear el archivo de progreso', async () => {
  let headers;
  globalThis.fetch = async (_url, opciones) => {
    headers = { ...opciones.headers };
    return new Response('', { status: 201 });
  };

  await cliente().escribirProgreso({ version: 2, libros: {} }, null, true);
  assert.equal(headers['If-None-Match'], '*');
});

test('reintenta sin cabeceras condicionales si el CORS antiguo las bloquea', async () => {
  const peticiones = [];
  globalThis.fetch = async (_url, opciones) => {
    peticiones.push({ ...opciones.headers });
    if (peticiones.length === 1) throw new TypeError('Failed to fetch');
    return new Response(null, { status: 204 });
  };

  await cliente().escribirProgreso({ version: 2, libros: {} }, '"etag-1"');
  assert.equal(peticiones[0]['If-Match'], '"etag-1"');
  assert.equal('If-Match' in peticiones[1], false);
});
