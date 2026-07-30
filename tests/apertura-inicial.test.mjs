import test from 'node:test';
import assert from 'node:assert/strict';

import { libroQueSeAbreAlArrancar } from '../js/apertura-inicial.js';

const RECIENTES = [
  { id: 'local:1', progreso: { pagina: 40, paginas: 200 } },
  { id: 'Novelas/otro.epub', progreso: { pagina: 5, paginas: 300 } },
];

const terminada = (avance) => avance?.terminado === true;

test('apagado no abre nada, aunque haya lecturas', () => {
  assert.equal(
    libroQueSeAbreAlArrancar({ activado: false, recientes: RECIENTES }),
    null,
  );
});

test('encendido abre la lectura más reciente', () => {
  assert.equal(
    libroQueSeAbreAlArrancar({ activado: true, recientes: RECIENTES })?.id,
    'local:1',
  );
});

test('sin lecturas no hay nada que abrir', () => {
  assert.equal(libroQueSeAbreAlArrancar({ activado: true }), null);
  assert.equal(libroQueSeAbreAlArrancar(), null);
});

test('un libro quitado de «Continuar leyendo» tampoco se abre solo', () => {
  const elegido = libroQueSeAbreAlArrancar({
    activado: true,
    recientes: RECIENTES,
    ocultos: new Set(['local:1']),
  });
  assert.equal(elegido?.id, 'Novelas/otro.epub');
});

test('un libro terminado se salta y se abre el siguiente', () => {
  const recientes = [
    { id: 'local:1', progreso: { terminado: true } },
    ...RECIENTES.slice(1),
  ];
  const elegido = libroQueSeAbreAlArrancar({
    activado: true, recientes, estaTerminada: terminada,
  });
  assert.equal(elegido?.id, 'Novelas/otro.epub');
});

test('si todas están terminadas u ocultas no se abre nada', () => {
  const elegido = libroQueSeAbreAlArrancar({
    activado: true,
    recientes: [{ id: 'local:1', progreso: { terminado: true } }],
    ocultos: new Set(['Novelas/otro.epub']),
    estaTerminada: terminada,
  });
  assert.equal(elegido, null);
});
