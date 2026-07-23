import test from 'node:test';
import assert from 'node:assert/strict';

import { componerMatriz, soloIlustraciones } from '../js/imagenes-pdf.js';

// Página A4 a escala 1, como la que devuelve PDF.js.
const ANCHO = 595;
const ALTO = 842;
const region = (ancho, alto) => ({ x: 0, y: 0, ancho, alto });
// Una imagen que ocupe esta proporción del área de la página.
const porArea = (proporcion) => region(ANCHO * proporcion, ALTO);

test('compone matrices como PDF.js', () => {
  const identidad = [1, 0, 0, 1, 0, 0];
  assert.deepEqual(componerMatriz(identidad, [2, 0, 0, 3, 4, 5]), [2, 0, 0, 3, 4, 5]);
  // Escalar por dos y luego trasladar acumula ambas transformaciones.
  assert.deepEqual(componerMatriz([2, 0, 0, 2, 0, 0], [1, 0, 0, 1, 10, 20]), [2, 0, 0, 2, 20, 40]);
});

test('conserva las ilustraciones pequeñas', () => {
  const logos = [region(221, 48), region(252, 45), region(154, 191)];
  assert.deepEqual(soloIlustraciones(logos, ANCHO, ALTO), logos);
});

test('descarta la imagen que hace de página', () => {
  // Un escaneo: un solo bitmap que cubre la hoja entera.
  assert.deepEqual(soloIlustraciones([region(ANCHO, ALTO)], ANCHO, ALTO), []);
});

test('descarta también una foto de fondo a sangre', () => {
  // Cubre el 88 % de la página: no es el escaneo, pero hace de papel igual, y
  // devolverle su color dejaría la hoja clara justo en modo noche.
  const fondo = region(596, 744);
  const logos = [region(221, 48), region(252, 45)];
  assert.deepEqual(soloIlustraciones([...logos, fondo], ANCHO, ALTO), logos);
});

test('descarta un escaneo troceado en bandas', () => {
  // Ninguna banda llega al límite por separado, pero entre todas son la hoja.
  const bandas = Array.from({ length: 5 }, () => region(ANCHO, ALTO / 5));
  assert.deepEqual(soloIlustraciones(bandas, ANCHO, ALTO), []);
});

test('unas pocas ilustraciones repartidas sí sobreviven', () => {
  const fotos = Array.from({ length: 4 }, () => region(ANCHO / 2, ALTO / 5));
  assert.equal(soloIlustraciones(fotos, ANCHO, ALTO).length, 4);
});

test('el límite por imagen está en el 70 % del área', () => {
  assert.equal(soloIlustraciones([porArea(0.69)], ANCHO, ALTO).length, 1);
  assert.equal(soloIlustraciones([porArea(0.71)], ANCHO, ALTO).length, 0);
});

test('tolera entradas vacías o sin página medible', () => {
  assert.deepEqual(soloIlustraciones([], ANCHO, ALTO), []);
  assert.deepEqual(soloIlustraciones([region(10, 10)], 0, 0), []);
  assert.deepEqual(soloIlustraciones(null, ANCHO, ALTO), []);
});
