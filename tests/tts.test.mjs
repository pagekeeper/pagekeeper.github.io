import test from 'node:test';
import assert from 'node:assert/strict';

import { trocearTexto } from '../js/tts.js';

test('devuelve una lista vacía sin texto', () => {
  assert.deepEqual(trocearTexto(''), []);
  assert.deepEqual(trocearTexto('   '), []);
  assert.deepEqual(trocearTexto(null), []);
});

test('separa el texto en frases', () => {
  assert.deepEqual(
    trocearTexto('Primera frase. ¿Segunda frase? ¡Tercera!'),
    ['Primera frase.', '¿Segunda frase?', '¡Tercera!'],
  );
});

test('conserva las comillas y paréntesis de cierre con su frase', () => {
  assert.deepEqual(
    trocearTexto('Dijo «hola.» Y se fue.'),
    ['Dijo «hola.»', 'Y se fue.'],
  );
});

test('normaliza los espacios y saltos de línea', () => {
  assert.deepEqual(
    trocearTexto('Una  frase\ncon   saltos. Otra frase.'),
    ['Una frase con saltos.', 'Otra frase.'],
  );
});

test('parte las frases largas por las comas', () => {
  const larga = `${'palabra '.repeat(30)}uno, ${'palabra '.repeat(30)}dos.`;
  const trozos = trocearTexto(larga);
  assert.ok(trozos.length >= 2);
  assert.ok(trozos.every((trozo) => trozo.length <= 220));
});

test('parte por espacios cuando no hay comas', () => {
  const larga = 'palabra '.repeat(80).trim();
  const trozos = trocearTexto(larga);
  assert.ok(trozos.length >= 2);
  assert.ok(trozos.every((trozo) => trozo.length <= 220));
  assert.equal(trozos.join(' '), larga);
});

test('un texto sin puntuación final se conserva entero', () => {
  assert.deepEqual(trocearTexto('Título del capítulo'), ['Título del capítulo']);
});
