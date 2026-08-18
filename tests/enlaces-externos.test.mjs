import test from 'node:test';
import assert from 'node:assert/strict';

import { esEnlaceExterno } from '../js/enlaces-externos.js';

const APP = 'https://pagekeeper.github.io';

test('un enlace a otro sitio sale fuera', () => {
  assert.equal(esEnlaceExterno('https://www.youtube.com/watch?v=abc', APP), true);
  assert.equal(esEnlaceExterno('http://ejemplo.org/pagina.html', APP), true);
});

test('el propio libro no sale fuera: epub.js ya lo resuelve dentro', () => {
  // Así llega un enlace a otro capítulo una vez resuelto por el navegador.
  assert.equal(
    esEnlaceExterno('https://pagekeeper.github.io/EPUB/text/ch002.xhtml#seccion', APP),
    false,
  );
  assert.equal(esEnlaceExterno('blob:https://pagekeeper.github.io/1234-5678', APP), false);
});

test('lo que no es web se deja al navegador', () => {
  for (const href of ['mailto:alguien@ejemplo.org', 'tel:+34600000000', 'javascript:void(0)']) {
    assert.equal(esEnlaceExterno(href, APP), false, href);
  }
});

test('una dirección que no se puede leer no rompe nada', () => {
  for (const href of ['', null, undefined, 'sin esquema', '#solo-fragmento']) {
    assert.equal(esEnlaceExterno(href, APP), false);
  }
});

test('funciona también con la aplicación servida en local', () => {
  assert.equal(esEnlaceExterno('https://www.youtube.com/watch?v=abc', 'http://127.0.0.1:8080'), true);
  assert.equal(esEnlaceExterno('http://127.0.0.1:8080/EPUB/ch1.xhtml', 'http://127.0.0.1:8080'), false);
});
