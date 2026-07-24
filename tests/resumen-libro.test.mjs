import test from 'node:test';
import assert from 'node:assert/strict';

import { resumenDeMetadatos } from '../js/resumen-libro.js';

const LARGO = 'La historia de un muchacho que sirve a muchos amos y aprende de todos ellos.';

test('usa la descripción del EPUB', () => {
  assert.equal(resumenDeMetadatos({ descripcion: LARGO }), LARGO);
});

test('en un PDF vale el asunto', () => {
  assert.equal(resumenDeMetadatos({ asunto: LARGO }), LARGO);
});

test('la descripción manda sobre el asunto', () => {
  assert.equal(resumenDeMetadatos({ descripcion: LARGO, asunto: `Otro ${LARGO}` }), LARGO);
});

test('deja el HTML de la descripción en texto llano', () => {
  const bruto = `<p><b>Primera</b> frase de la sinopsis.</p><p>${LARGO}</p>`;
  assert.equal(
    resumenDeMetadatos(bruto ? { descripcion: bruto } : null),
    `Primera frase de la sinopsis. ${LARGO}`,
  );
});

test('resuelve las entidades y junta los espacios', () => {
  const bruto = 'Lazarillo   &amp;\n\ncompañía: un relato de amos, hambre &quot;y astucia&quot;.';
  assert.equal(
    resumenDeMetadatos({ descripcion: bruto }),
    'Lazarillo & compañía: un relato de amos, hambre "y astucia".',
  );
});

test('recorta los resúmenes larguísimos sin partir palabras', () => {
  const largo = `${'palabra '.repeat(200)}final`;
  const resumen = resumenDeMetadatos({ descripcion: largo });
  assert.ok(resumen.length <= 701, resumen.length);
  assert.ok(resumen.endsWith('…'));
  assert.ok(!resumen.includes('palabr…'));
});

test('un asunto de dos palabras no es un resumen', () => {
  assert.equal(resumenDeMetadatos({ asunto: 'Informe anual' }), '');
  assert.equal(resumenDeMetadatos({ asunto: 'Microsoft Word - documento.doc' }), '');
});

test('sin metadatos no hay resumen', () => {
  assert.equal(resumenDeMetadatos(null), '');
  assert.equal(resumenDeMetadatos({}), '');
  assert.equal(resumenDeMetadatos({ descripcion: '   <p></p>  ' }), '');
});
