import test from 'node:test';
import assert from 'node:assert/strict';

import {
  bibliotecaLocal, normalizarCarpeta, nombreCarpetaValido, movimientoDeCarpetaValido,
} from '../js/almacen.js';

const libro = (id, carpeta = '') => ({ id, nombre: `${id}.pdf`, tamano: 1, carpeta });

test('normaliza rutas con barras y espacios sobrantes', () => {
  assert.equal(normalizarCarpeta('/Novela//Negra/'), 'Novela/Negra');
  assert.equal(normalizarCarpeta('  Ensayo  '), 'Ensayo');
  assert.equal(normalizarCarpeta(undefined), '');
  assert.equal(normalizarCarpeta(''), '');
});

test('rechaza nombres de carpeta con barras, vacíos o que empiezan por punto', () => {
  assert.equal(nombreCarpetaValido('Novela'), true);
  assert.equal(nombreCarpetaValido('Ciencia ficción'), true);
  assert.equal(nombreCarpetaValido('a/b'), false);
  assert.equal(nombreCarpetaValido('a\\b'), false);
  assert.equal(nombreCarpetaValido('   '), false);
  assert.equal(nombreCarpetaValido('.oculta'), false);
  assert.equal(nombreCarpetaValido('x'.repeat(121)), false);
});

test('en la raíz muestra los libros sueltos y las carpetas de primer nivel', () => {
  const { carpetas, libros } = bibliotecaLocal([
    libro('suelto'),
    libro('novela', 'Novela'),
    libro('negra', 'Novela/Negra'),
    libro('ensayo', 'Ensayo'),
  ], [], '');
  assert.deepEqual(carpetas.map((c) => c.nombre), ['Ensayo', 'Novela']);
  assert.deepEqual(libros.map((l) => l.id), ['suelto']);
});

test('dentro de una carpeta muestra solo su contenido directo', () => {
  const { carpetas, libros } = bibliotecaLocal([
    libro('suelto'),
    libro('novela', 'Novela'),
    libro('negra', 'Novela/Negra'),
    libro('otra', 'Novelas'), // prefijo parecido: no debe colarse
  ], [], 'Novela');
  assert.deepEqual(carpetas.map((c) => c.nombre), ['Negra']);
  assert.deepEqual(libros.map((l) => l.id), ['novela']);
});

test('las carpetas registradas aparecen aunque estén vacías', () => {
  const { carpetas, libros } = bibliotecaLocal([], ['Pendientes', 'Novela/Negra'], '');
  assert.deepEqual(carpetas.map((c) => c.nombre), ['Novela', 'Pendientes']);
  assert.deepEqual(libros, []);
});

test('deduce la carpeta de un libro aunque no esté registrada', () => {
  const { carpetas } = bibliotecaLocal([libro('x', 'Huérfana')], [], '');
  assert.deepEqual(carpetas.map((c) => c.nombre), ['Huérfana']);
});

test('no repite una carpeta que está registrada y además tiene libros', () => {
  const { carpetas } = bibliotecaLocal([libro('x', 'Novela')], ['Novela'], '');
  assert.deepEqual(carpetas.map((c) => c.nombre), ['Novela']);
});

test('tolera rutas sin normalizar en los registros', () => {
  const { carpetas, libros } = bibliotecaLocal(
    [libro('x', '/Novela/'), libro('y', 'Novela//Negra')], ['/Ensayo/'], '',
  );
  assert.deepEqual(carpetas.map((c) => c.nombre), ['Ensayo', 'Novela']);
  assert.deepEqual(libros, []);
});

test('un libro sin carpeta se queda en la raíz', () => {
  const { libros } = bibliotecaLocal([{ id: 'x', nombre: 'x.pdf' }], [], '');
  assert.deepEqual(libros.map((l) => l.id), ['x']);
});

test('ordena las carpetas alfabéticamente respetando los acentos', () => {
  const { carpetas } = bibliotecaLocal([], ['Zoología', 'Álgebra', 'biología'], '');
  assert.deepEqual(carpetas.map((c) => c.nombre), ['Álgebra', 'biología', 'Zoología']);
});

test('una carpeta no se puede mover dentro de sí misma ni de sus hijas', () => {
  assert.equal(movimientoDeCarpetaValido('Novela', 'Novela'), false);
  assert.equal(movimientoDeCarpetaValido('Novela', 'Novela/Negra'), false);
  assert.equal(movimientoDeCarpetaValido('Novela', 'Novela/Negra/Nórdica'), false);
});

test('una carpeta no se mueve a donde ya está', () => {
  assert.equal(movimientoDeCarpetaValido('Novela', ''), false);
  assert.equal(movimientoDeCarpetaValido('Novela/Negra', 'Novela'), false);
});

test('acepta llevar una carpeta a otra rama o sacarla a la raíz', () => {
  assert.equal(movimientoDeCarpetaValido('Novela/Negra', ''), true);
  assert.equal(movimientoDeCarpetaValido('Novela/Negra', 'Ensayo'), true);
  assert.equal(movimientoDeCarpetaValido('Novela', 'Ensayo/Historia'), true);
});

test('un prefijo parecido no cuenta como descendiente', () => {
  assert.equal(movimientoDeCarpetaValido('Novela', 'Novelas'), true);
});

test('sin carpeta de origen no hay movimiento posible', () => {
  assert.equal(movimientoDeCarpetaValido('', 'Ensayo'), false);
});
