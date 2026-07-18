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
