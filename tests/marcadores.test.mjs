import test from 'node:test';
import assert from 'node:assert/strict';

import {
  limpiarNombre, marcadorRepetido, ordenarMarcadores, anadirMarcador,
  renombrarMarcador, LARGO_NOMBRE,
} from '../js/marcadores.js';

const HOY = '2026-07-29T10:00:00.000Z';

test('el nombre se queda sin espacios de sobra', () => {
  assert.equal(limpiarNombre('  El escudero  '), 'El escudero');
  assert.equal(limpiarNombre('   '), '');
  assert.equal(limpiarNombre(null), '');
  assert.equal(limpiarNombre(undefined), '');
});

test('un nombre larguísimo se recorta', () => {
  const largo = 'a'.repeat(500);
  assert.equal(limpiarNombre(largo).length, LARGO_NOMBRE);
});

test('en PDF la misma página ya marcada es un repetido', () => {
  const marcadores = [{ pagina: 10 }, { pagina: 25 }];
  assert.equal(marcadorRepetido(marcadores, { pagina: 25 }), true);
  assert.equal(marcadorRepetido(marcadores, { pagina: 11 }), false);
});

test('en EPUB el repetido se mira por CFI, no por porcentaje', () => {
  const marcadores = [{ cfi: 'epubcfi(/6/4!/4/2)', porcentaje: 12 }];
  assert.equal(marcadorRepetido(marcadores, { cfi: 'epubcfi(/6/4!/4/2)' }), true);
  // Mismo porcentaje pero otro punto del libro: no es el mismo marcador.
  assert.equal(marcadorRepetido(marcadores, { cfi: 'epubcfi(/6/8!/4/2)', porcentaje: 12 }), false);
});

test('en una lista vacía nada está repetido', () => {
  assert.equal(marcadorRepetido([], { pagina: 1 }), false);
});

test('en PDF la lista se ordena por página', () => {
  const marcadores = [{ pagina: 30 }, { pagina: 5 }, { pagina: 12 }];
  assert.deepEqual(ordenarMarcadores(marcadores).map((m) => m.pagina), [5, 12, 30]);
});

test('en EPUB manda el comparador de CFI, no el orden de creación', () => {
  // Comparador de mentira: ordena por el número que lleva el CFI dentro.
  const porNumero = (a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]);
  const marcadores = [{ cfi: 'c30' }, { cfi: 'c5' }, { cfi: 'c12' }];
  assert.deepEqual(
    ordenarMarcadores(marcadores, porNumero).map((m) => m.cfi), ['c5', 'c12', 'c30'],
  );
});

test('un CFI ilegible no rompe la lista: se cae al orden por página', () => {
  const revienta = () => { throw new Error('CFI ilegible'); };
  const marcadores = [{ cfi: 'x', pagina: 9 }, { cfi: 'y', pagina: 2 }];
  assert.deepEqual(ordenarMarcadores(marcadores, revienta).map((m) => m.pagina), [2, 9]);
});

test('el marcador nuevo entra ya en su sitio de la lista', () => {
  const lista = anadirMarcador([{ pagina: 5 }, { pagina: 30 }], { pagina: 12 }, '', HOY);
  assert.deepEqual(lista.map((m) => m.pagina), [5, 12, 30]);
  assert.equal(lista[1].creado, HOY);
});

test('el marcador guarda el nombre que se le ponga, ya limpio', () => {
  const [marcador] = anadirMarcador([], { pagina: 1 }, '  El ciego  ', HOY);
  assert.equal(marcador.nombre, 'El ciego');
});

test('sin nombre el marcador no lleva el campo vacío a cuestas', () => {
  const [marcador] = anadirMarcador([], { pagina: 1 }, '   ', HOY);
  assert.equal('nombre' in marcador, false);
});

test('marcar dos veces la misma posición no añade nada', () => {
  assert.equal(anadirMarcador([{ pagina: 10 }], { pagina: 10 }, 'otra vez', HOY), null);
});

test('añadir no toca la lista de partida', () => {
  const original = [{ pagina: 5 }];
  anadirMarcador(original, { pagina: 1 }, '', HOY);
  assert.equal(original.length, 1);
});

test('en EPUB el marcador conserva el porcentaje si se conocía', () => {
  const [marcador] = anadirMarcador([], { cfi: 'epubcfi(/6/4)', porcentaje: 40 }, '', HOY);
  assert.equal(marcador.porcentaje, 40);
  assert.equal(marcador.cfi, 'epubcfi(/6/4)');
});

test('renombrar cambia el nombre', () => {
  assert.equal(renombrarMarcador({ pagina: 3 }, ' El buldero ').nombre, 'El buldero');
});

test('renombrar con el campo vacío quita el nombre en vez de dejarlo en blanco', () => {
  const marcador = renombrarMarcador({ pagina: 3, nombre: 'El ciego' }, '   ');
  assert.equal('nombre' in marcador, false);
  assert.equal(marcador.pagina, 3);   // lo demás se queda
});

test('renombrar no toca el marcador de partida', () => {
  const original = { pagina: 3, nombre: 'viejo' };
  renombrarMarcador(original, 'nuevo');
  assert.equal(original.nombre, 'viejo');
});
