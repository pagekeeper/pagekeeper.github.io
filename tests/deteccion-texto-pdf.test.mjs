import test from 'node:test';
import assert from 'node:assert/strict';

import { contieneTextoUtil } from '../js/deteccion-texto-pdf.js';

function documento(paginas) {
  return {
    numPages: paginas.length,
    async getPage(numero) {
      return { async getTextContent() { return { items: paginas[numero - 1] }; } };
    },
  };
}

test('detecta un PDF sin texto seleccionable', async () => {
  assert.equal(await contieneTextoUtil(documento([[], [{ str: '   ' }]])), false);
});

test('considera útil el texto repartido entre varias páginas', async () => {
  const paginas = [
    [{ str: 'Texto breve' }],
    [{ str: 'que continúa en otra página y supera el umbral.' }],
  ];
  assert.equal(await contieneTextoUtil(documento(paginas), { ceder: async () => {} }), true);
});

test('no recorre el resto del documento cuando ya encontró texto suficiente', async () => {
  let paginasLeidas = 0;
  const pdf = {
    numPages: 3,
    async getPage() {
      paginasLeidas++;
      return { async getTextContent() { return { items: [{ str: 'Texto seleccionable suficiente para este PDF.' }] }; } };
    },
  };
  assert.equal(await contieneTextoUtil(pdf), true);
  assert.equal(paginasLeidas, 1);
});
