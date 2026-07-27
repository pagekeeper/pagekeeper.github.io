import test from 'node:test';
import assert from 'node:assert/strict';

import { buscarFrase, iniciosDeFrase } from '../js/seguimiento-voz.js';

test('encuentra la frase aunque en el documento los espacios sean saltos de línea', () => {
  const texto = 'En un lugar\n  de la Mancha,\nde cuyo nombre no quiero acordarme.';
  const tramo = buscarFrase(texto, 'de la Mancha, de cuyo nombre');
  assert.equal(texto.slice(tramo.inicio, tramo.fin), 'de la Mancha,\nde cuyo nombre');
});

test('encuentra la frase cuando el PDF separó palabras que en la capa de texto van pegadas', () => {
  // getTextContent() une los tramos con un espacio que en el DOM no existe.
  const tramo = buscarFrase('Holamundo cruel', 'Hola mundo');
  assert.deepEqual(tramo, { inicio: 0, fin: 9 });
});

test('sigue hacia delante en las frases repetidas', () => {
  const texto = '—Sí —dijo. Y calló. —Sí —dijo. Y se fue.';
  const primera = buscarFrase(texto, '—Sí —dijo.');
  const segunda = buscarFrase(texto, '—Sí —dijo.', primera.fin);
  assert.equal(primera.inicio, 0);
  assert.equal(segunda.inicio, texto.lastIndexOf('—Sí —dijo.'));
});

test('vuelve al principio si la frase ya no aparece más adelante', () => {
  const texto = 'Primero esto. Después aquello.';
  const tramo = buscarFrase(texto, 'Primero esto.', 20);
  assert.equal(tramo.inicio, 0);
});

test('no confunde los signos de puntuación con comodines de expresión regular', () => {
  const texto = 'Coste: 3 € (más IVA). Fin.';
  const tramo = buscarFrase(texto, '3 € (más IVA).');
  assert.equal(texto.slice(tramo.inicio, tramo.fin), '3 € (más IVA).');
});

test('devuelve null cuando la frase no está', () => {
  assert.equal(buscarFrase('Un texto cualquiera', 'otra cosa'), null);
  assert.equal(buscarFrase('', 'algo'), null);
  assert.equal(buscarFrase('Un texto', '   '), null);
});

test('marca el principio de cada frase, con el cierre de las comillas incluido', () => {
  const texto = '«Ya voy.» Dijo que sí. ¿Y luego? Nada más';
  const inicios = iniciosDeFrase(texto);
  assert.deepEqual(inicios.map((i) => texto.slice(i, i + 4)),
    ['«Ya ', 'Dijo', '¿Y l', 'Nada']);
});

test('no cuenta como frase el hueco que queda tras el último punto', () => {
  assert.deepEqual(iniciosDeFrase('Una sola frase.  '), [0]);
  assert.deepEqual(iniciosDeFrase(''), [0]);
});

test('los puntos de las abreviaturas y las cifras no abren frase sin espacio detrás', () => {
  const texto = 'Costó 3.500 euros.\nY se acabó.';
  assert.deepEqual(iniciosDeFrase(texto), [0, texto.indexOf('Y se')]);
});
