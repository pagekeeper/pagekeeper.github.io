import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PARAMETRO_COMPARTIR, PARAMETRO_COMPARTIDO } from '../js/archivos-recibidos.js';

// Lo que une la web con la app de Android (ADR 9) está repartido entre el
// manifiesto, sw.js, app.js y la propia app. Si una pieza cambia de nombre y
// las otras no, la app se queda con la barra de dirección o deja de recibir
// libros sin que falle nada a la vista.

const leer = (ruta) => readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');
const manifiesto = JSON.parse(leer('manifest.webmanifest'));
const sw = leer('sw.js');

test('la web declara la app de Android como suya', () => {
  const [vinculo] = JSON.parse(leer('.well-known/assetlinks.json'));
  assert.equal(vinculo.target.package_name, 'io.github.pagekeeper');
  assert.ok(vinculo.target.sha256_cert_fingerprints.length >= 1);
  const twa = JSON.parse(leer('android/twa-manifest.json'));
  assert.equal(twa.packageId, vinculo.target.package_name);
});

test('el manifiesto trae los iconos que pide Android', () => {
  const tipos = manifiesto.icons.map((icono) => `${icono.sizes} ${icono.purpose}`);
  assert.ok(tipos.includes('512x512 any'));
  assert.ok(tipos.includes('512x512 maskable'));
});

test('«Abrir con» acepta los PDF y los EPUB', () => {
  const [manejador] = manifiesto.file_handlers;
  assert.deepEqual(manejador.accept['application/pdf'], ['.pdf']);
  assert.deepEqual(manejador.accept['application/epub+zip'], ['.epub']);
});

test('«Compartir» llega a donde lo espera sw.js, y este manda a donde lo recoge app.js', () => {
  const destino = manifiesto.share_target;
  assert.equal(destino.method, 'POST');
  assert.equal(new URL(destino.action, 'https://x/').searchParams.has(PARAMETRO_COMPARTIR), true);
  const [archivos] = destino.params.files;
  assert.match(sw, new RegExp(`getAll\\('${archivos.name}'\\)`));
  assert.match(sw, new RegExp(`searchParams\\.has\\('${PARAMETRO_COMPARTIR}'\\)`));
  assert.match(sw, new RegExp(`\\?${PARAMETRO_COMPARTIDO}'`));
  assert.match(leer('js/app.js'), /CACHE_COMPARTIDOS = 'pagekeeper-compartidos'/);
  assert.match(sw, /CACHE_COMPARTIDOS = 'pagekeeper-compartidos'/);
});
