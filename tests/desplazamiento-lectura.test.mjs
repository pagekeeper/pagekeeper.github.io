import test from 'node:test';
import assert from 'node:assert/strict';

import { decidirEspacio, saltoDePantalla } from '../js/desplazamiento-lectura.js';

test('la página cabe entera: el espacio pasa de página', () => {
  const decision = decidirEspacio({ scrollTop: 0, scrollHeight: 800, clientHeight: 800 });
  assert.deepEqual(decision, { accion: 'pagina' });
});

test('con la página más alta que la ventana, el espacio baja una pantalla', () => {
  const decision = decidirEspacio({ scrollTop: 0, scrollHeight: 3000, clientHeight: 1000 });
  assert.equal(decision.accion, 'desplazar');
  assert.equal(decision.destino, saltoDePantalla(1000));
});

test('el salto deja arriba un poco de lo ya leído', () => {
  assert.ok(saltoDePantalla(1000) < 1000);
  assert.equal(saltoDePantalla(1000), 920);
  // En ventanas bajas el solape se queda en su tope y no se come el salto.
  assert.equal(saltoDePantalla(300), 264);
});

test('el último salto no se pasa del final del contenido', () => {
  const decision = decidirEspacio({ scrollTop: 1900, scrollHeight: 3000, clientHeight: 1000 });
  assert.deepEqual(decision, { accion: 'desplazar', destino: 2000 });
});

test('ya al fondo, el espacio pasa de página', () => {
  const decision = decidirEspacio({ scrollTop: 2000, scrollHeight: 3000, clientHeight: 1000 });
  assert.deepEqual(decision, { accion: 'pagina' });
});

test('un píxel de sobra por los decimales cuenta como estar al fondo', () => {
  const decision = decidirEspacio({ scrollTop: 1999, scrollHeight: 3000, clientHeight: 1000 });
  assert.deepEqual(decision, { accion: 'pagina' });
});

test('hacia atrás sube una pantalla mientras quede recorrido', () => {
  const decision = decidirEspacio({ scrollTop: 2000, scrollHeight: 3000, clientHeight: 1000, haciaAtras: true });
  assert.deepEqual(decision, { accion: 'desplazar', destino: 2000 - saltoDePantalla(1000) });
});

test('hacia atrás, el primer salto no se pasa del principio', () => {
  const decision = decidirEspacio({ scrollTop: 100, scrollHeight: 3000, clientHeight: 1000, haciaAtras: true });
  assert.deepEqual(decision, { accion: 'desplazar', destino: 0 });
});

test('ya arriba del todo, hacia atrás se pasa a la página anterior', () => {
  const decision = decidirEspacio({ scrollTop: 0, scrollHeight: 3000, clientHeight: 1000, haciaAtras: true });
  assert.deepEqual(decision, { accion: 'pagina' });
});
