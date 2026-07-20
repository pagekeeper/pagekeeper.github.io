import test from 'node:test';
import assert from 'node:assert/strict';

import { fusionarDocumentos } from '../js/anotaciones.js';

const documento = (anotaciones, pendientes = {}) => ({ anotaciones, pendientes });

test('conserva anotaciones creadas simultáneamente en dos dispositivos', () => {
  const local = documento([{ id: 'local', texto: 'Uno', actualizado: '2026-01-01T10:00:00.000Z' }]);
  const remoto = documento([{ id: 'remota', texto: 'Dos', actualizado: '2026-01-01T10:01:00.000Z' }]);
  const fusionado = fusionarDocumentos(local, remoto, 'servidor', 'libro.pdf');
  assert.deepEqual(fusionado.anotaciones.map((a) => a.id).sort(), ['local', 'remota']);
});

test('produce el mismo orden aunque cada dispositivo las tenga ordenadas de forma distinta', () => {
  const una = { id: 'a', texto: 'Uno', creado: '2026-01-01T10:00:00.000Z', actualizado: '2026-01-01T10:00:00.000Z' };
  const otra = { id: 'b', texto: 'Dos', creado: '2026-01-01T10:01:00.000Z', actualizado: '2026-01-01T10:01:00.000Z' };
  const desdeA = fusionarDocumentos(documento([una, otra]), documento([otra, una]), 'servidor', 'libro.epub');
  const desdeB = fusionarDocumentos(documento([otra, una]), documento([una, otra]), 'servidor', 'libro.epub');
  assert.deepEqual(desdeA.anotaciones, desdeB.anotaciones);
  assert.deepEqual(desdeA.anotaciones.map((a) => a.id), ['a', 'b']);
});

test('un cambio local pendiente prevalece aunque el reloj remoto esté adelantado', () => {
  const local = documento(
    [{ id: 'a', texto: 'Local', actualizado: '2026-01-01T10:00:00.000Z' }],
    { a: 'token' },
  );
  const remoto = documento([{ id: 'a', texto: 'Remoto', actualizado: '2099-01-01T10:00:00.000Z' }]);
  const fusionado = fusionarDocumentos(local, remoto, 'servidor', 'libro.epub');
  assert.equal(fusionado.anotaciones[0].texto, 'Local');
  assert.ok(fusionado.anotaciones[0].actualizado > '2099-01-01T10:00:00.000Z');
});

test('una marca de borrado reciente impide resucitar una anotación', () => {
  const local = documento([{ id: 'a', borrado: true, actualizado: '2026-01-02T10:00:00.000Z' }]);
  const remoto = documento([{ id: 'a', texto: 'Antigua', actualizado: '2026-01-01T10:00:00.000Z' }]);
  const fusionado = fusionarDocumentos(local, remoto, 'servidor', 'libro.pdf');
  assert.equal(fusionado.anotaciones[0].borrado, true);
});
