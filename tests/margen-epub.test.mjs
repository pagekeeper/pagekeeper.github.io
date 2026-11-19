import { test } from 'node:test';
import assert from 'node:assert/strict';
import { margenInicial, esPantallaDeMovil, MARGEN_MOVIL, MARGEN_ESCRITORIO } from '../js/margen-epub.js';

test('un móvil empieza sin margen, en vertical y en horizontal', () => {
  assert.equal(margenInicial({ ancho: 390, alto: 844 }), MARGEN_MOVIL);
  assert.equal(margenInicial({ ancho: 844, alto: 390 }), MARGEN_MOVIL);
  assert.equal(MARGEN_MOVIL, 0);
});

test('tabletas y ordenadores conservan el 10 %', () => {
  assert.equal(margenInicial({ ancho: 768, alto: 1024 }), MARGEN_ESCRITORIO);
  assert.equal(margenInicial({ ancho: 1920, alto: 1080 }), MARGEN_ESCRITORIO);
  assert.equal(MARGEN_ESCRITORIO, 10);
});

test('el corte está en 600 de lado corto', () => {
  assert.equal(esPantallaDeMovil({ ancho: 599, alto: 1000 }), true);
  assert.equal(esPantallaDeMovil({ ancho: 600, alto: 1000 }), false);
});

test('sin medidas de pantalla se queda en el valor de siempre', () => {
  assert.equal(margenInicial(), MARGEN_ESCRITORIO);
  assert.equal(margenInicial({ ancho: 0, alto: undefined }), MARGEN_ESCRITORIO);
});
