import test from 'node:test';
import assert from 'node:assert/strict';

import { tituloMostrado } from '../js/titulo-libro.js';

test('el nombre que puso quien lee manda sobre todo lo demás', () => {
  assert.equal(tituloMostrado({
    personalizado: 'Penrose, para el seminario',
    metadatos: { titulo: 'La nueva mente del emperador' },
    archivo: 'penrose_1989_emperors_new_mind',
  }), 'Penrose, para el seminario');
});

test('sin nombre puesto a mano, manda el de los metadatos', () => {
  assert.equal(tituloMostrado({
    metadatos: { titulo: 'Indicadores de consciencia en la IA' },
    archivo: 'Butlin_et_al_Indicadores_ES_con_figuras',
  }), 'Indicadores de consciencia en la IA');
});

test('sin metadatos queda el del archivo, que es lo que hay', () => {
  assert.equal(tituloMostrado({ archivo: 'lazarillo-de-tormes' }), 'lazarillo-de-tormes');
  assert.equal(tituloMostrado({ metadatos: {}, archivo: 'lazarillo' }), 'lazarillo');
});

test('un título en blanco no cuenta como título', () => {
  assert.equal(tituloMostrado({
    personalizado: '   ',
    metadatos: { titulo: '\n' },
    archivo: 'documento',
  }), 'documento');
});

test('los espacios de más se recogen: algunos metadatos traen saltos de línea', () => {
  assert.equal(
    tituloMostrado({ metadatos: { titulo: 'La nueva mente\n  del emperador ' } }),
    'La nueva mente del emperador',
  );
});

test('sin ningún candidato se devuelve cadena vacía, no «undefined»', () => {
  assert.equal(tituloMostrado(), '');
  assert.equal(tituloMostrado({}), '');
});
