import test from 'node:test';
import assert from 'node:assert/strict';

import { imagenAmpliable, descripcionImagen } from '../js/imagen-ampliada.js';

const vista = { ancho: 800, alto: 1000 };
const foto = { fuente: 'blob:foto', ancho: 300, alto: 200 };

test('una ilustración normal se puede ampliar', () => {
  assert.equal(imagenAmpliable(foto, vista), true);
  assert.equal(imagenAmpliable(foto, vista, { desdeZona: true }), true);
});

test('sin fuente o sin medidas no hay nada que ampliar', () => {
  assert.equal(imagenAmpliable({ ancho: 300, alto: 200 }, vista), false);
  assert.equal(imagenAmpliable({ fuente: 'blob:x', ancho: 0, alto: 200 }, vista), false);
  assert.equal(imagenAmpliable(null, vista), false);
});

// Viñetas, iconos de nota al pie y adornos: pulsarlos es querer pasar página.
test('lo más pequeño que una viñeta no cuenta como ilustración', () => {
  assert.equal(imagenAmpliable({ fuente: 'blob:x', ancho: 16, alto: 16 }, vista), false);
  assert.equal(imagenAmpliable({ fuente: 'blob:x', ancho: 400, alto: 20 }, vista), false);
});

// Una lámina a página entera no gana con el visor y sí dejaría las cuatro
// bandas sin efecto en toda esa página.
test('desde la banda, una imagen que llena la pantalla pasa página', () => {
  const lamina = { fuente: 'blob:x', ancho: 780, alto: 980 };
  assert.equal(imagenAmpliable(lamina, vista, { desdeZona: true }), false);
  assert.equal(imagenAmpliable(lamina, vista), true);
});

test('sin medidas de la vista, la banda no descarta nada por tamaño', () => {
  const lamina = { fuente: 'blob:x', ancho: 780, alto: 980 };
  assert.equal(imagenAmpliable(lamina, { ancho: 0, alto: 0 }, { desdeZona: true }), true);
});

test('la descripción sale del alt, del título o del respaldo', () => {
  assert.equal(descripcionImagen('  Tejados\n nevados ', '', 'Imagen'), 'Tejados nevados');
  assert.equal(descripcionImagen('   ', 'Portada', 'Imagen'), 'Portada');
  assert.equal(descripcionImagen('', '', 'Imagen'), 'Imagen');
  assert.equal(descripcionImagen(null, undefined, 'Imagen'), 'Imagen');
});

test('una descripción larguísima se recorta', () => {
  const larga = descripcionImagen('a'.repeat(300), '', 'Imagen');
  assert.equal(larga.length, 120);
  assert.ok(larga.endsWith('…'));
});
