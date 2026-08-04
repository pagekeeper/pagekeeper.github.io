import test from 'node:test';
import assert from 'node:assert/strict';

import {
  alPulsarEstrella, calificacionValida, compararPorCalificacion, esFiltroDeCalificacion,
  estrellasDe, pasaFiltro, textoAccesible,
} from '../js/calificacion.js';

test('una calificación normal pasa tal cual', () => {
  assert.equal(calificacionValida(4), 4);
  assert.equal(calificacionValida('3'), 3);
});

test('sin calificación, ni cero ni negativos', () => {
  for (const valor of [null, undefined, '', 0, -2, NaN, Infinity, 'muy bueno', {}]) {
    assert.equal(calificacionValida(valor), null, `con ${JSON.stringify(valor)}`);
  }
});

test('nadie puede pasarse del máximo', () => {
  assert.equal(calificacionValida(9), 5);
});

test('los decimales se redondean a media estrella', () => {
  assert.equal(calificacionValida(3.4), 3.5);
  assert.equal(calificacionValida(3.2), 3);
});

test('pulsar una estrella la califica', () => {
  assert.equal(alPulsarEstrella(null, 4), 4);
  assert.equal(alPulsarEstrella(2, 5), 5);
});

test('pulsar la estrella que ya estaba quita la calificación', () => {
  assert.equal(alPulsarEstrella(3, 3), null);
});

test('bajar la calificación no la borra', () => {
  assert.equal(alPulsarEstrella(5, 2), 2);
});

test('las estrellas se pintan llenas hasta la calificación', () => {
  assert.deepEqual(estrellasDe(3), ['llena', 'llena', 'llena', 'vacia', 'vacia']);
});

test('sin calificar están todas vacías', () => {
  assert.deepEqual(estrellasDe(null), Array(5).fill('vacia'));
});

test('una media estrella se pinta a medias', () => {
  assert.deepEqual(estrellasDe(2.5), ['llena', 'llena', 'media', 'vacia', 'vacia']);
});

test('ordena de mejor a peor', () => {
  const libros = [{ c: 3 }, { c: 5 }, { c: 1 }];
  libros.sort((una, otra) => compararPorCalificacion(una.c, otra.c));
  assert.deepEqual(libros.map((libro) => libro.c), [5, 3, 1]);
});

test('los libros sin calificar van al final, no delante de los de una estrella', () => {
  const libros = [{ c: null }, { c: 1 }, { c: 4 }];
  libros.sort((una, otra) => compararPorCalificacion(una.c, otra.c));
  assert.deepEqual(libros.map((libro) => libro.c), [4, 1, null]);
});

test('el filtro de cuatro estrellas deja fuera las tres', () => {
  assert.equal(pasaFiltro('calificados4', 4), true);
  assert.equal(pasaFiltro('calificados4', 5), true);
  assert.equal(pasaFiltro('calificados4', 3), false);
  assert.equal(pasaFiltro('calificados4', null), false);
});

test('«sin calificar» solo deja pasar a los que no tienen opinión', () => {
  assert.equal(pasaFiltro('sinCalificar', null), true);
  assert.equal(pasaFiltro('sinCalificar', 1), false);
});

test('un filtro que no es de calificación no filtra por ella', () => {
  assert.equal(esFiltroDeCalificacion('terminados'), false);
  assert.equal(pasaFiltro('terminados', null), true);
});

test('el texto accesible distingue el sin calificar del calificado', () => {
  const textos = { sinCalificar: 'Sin calificar', deMaximo: (n, max) => `${n} de ${max}` };
  assert.equal(textoAccesible(null, textos), 'Sin calificar');
  assert.equal(textoAccesible(4, textos), '4 de 5');
});
