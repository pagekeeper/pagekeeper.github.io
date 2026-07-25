import test from 'node:test';
import assert from 'node:assert/strict';

import { estimarPantallas } from '../js/lector-epub.js';

test('sin muestras o sin libro no hay estimación', () => {
  assert.equal(estimarPantallas([], 400_000), 0);
  assert.equal(estimarPantallas([{ caracteres: 2000, pantallas: 2 }], 0), 0);
});

test('estima las pantallas del libro con lo medido en un capítulo', () => {
  // 1000 caracteres por pantalla → un libro de 300.000 son 300.
  const muestras = [{ caracteres: 10_000, pantallas: 10 }];
  assert.equal(estimarPantallas(muestras, 300_000), 300);
});

test('los capítulos largos pesan más que los cortos en la media', () => {
  // Un capítulo de prosa (1000 car./pantalla) y uno ilustrado (250). La media
  // ponderada por texto sale en 932, cerca del primero: si contaran igual los
  // dos capítulos serían 625 y el libro se iría a 160 pantallas.
  const muestras = [
    { caracteres: 40_000, pantallas: 40 },
    { caracteres: 1000, pantallas: 4 },
  ];
  assert.equal(estimarPantallas(muestras, 100_000), 107);
});

test('subir la letra sube el número de pantallas', () => {
  const normal = estimarPantallas([{ caracteres: 10_000, pantallas: 10 }], 200_000);
  const grande = estimarPantallas([{ caracteres: 10_000, pantallas: 20 }], 200_000);
  assert.equal(normal, 200);
  assert.equal(grande, 400);
});

test('un libro más corto que una pantalla cuenta como una', () => {
  assert.equal(estimarPantallas([{ caracteres: 10_000, pantallas: 1 }], 300), 1);
});
