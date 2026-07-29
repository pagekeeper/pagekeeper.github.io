import test from 'node:test';
import assert from 'node:assert/strict';

import { inyectarMathJax, mathmlSeVeBien } from '../js/lector-epub.js';

// DOM de mentira, lo justo para la decisión: qué trae el capítulo, qué sabe
// dibujar el navegador y qué alto miden las piezas de la fórmula de prueba.
function capituloFalso({ mathml = false, texto = '', alturas = null, entiendeMathML = false } = {}) {
  const creados = [];
  const insertados = [];
  const alto = (nombre) => (alturas?.[nombre] ?? 0);
  const crear = (nombre) => {
    const elemento = {
      nombre,
      atributos: {},
      estilo: '',
      hijos: [],
      textContent: '',
      dataset: {},
      setAttribute(clave, valor) { this.atributos[clave] = valor; },
      append(...nuevos) { this.hijos.push(...nuevos); },
      remove() { const i = insertados.indexOf(this); if (i >= 0) insertados.splice(i, 1); },
      getBoundingClientRect() { return { height: alto(nombre) }; },
    };
    creados.push(elemento);
    return elemento;
  };
  const raiz = { dataset: { pagekeeperScriptNonce: 'abc123' } };
  const contents = {
    creados,
    insertados,
    window: entiendeMathML ? { MathMLElement: function MathMLElement() {} } : {},
    document: {
      documentElement: raiz,
      head: { append: (...nuevos) => insertados.push(...nuevos) },
      body: { textContent: texto, append: (...nuevos) => insertados.push(...nuevos) },
      querySelector: (selector) => (selector === 'math' && mathml ? {} : null),
      createElement: crear,
      createElementNS: (_ns, nombre) => crear(nombre),
    },
  };
  return contents;
}

const scriptsDe = (contents) => contents.insertados.filter((e) => e.nombre === 'script').map((e) => e.src);

test('un capítulo sin fórmulas no carga nada', () => {
  const capitulo = capituloFalso({ texto: 'Un texto cualquiera.' });
  inyectarMathJax(capitulo);
  assert.deepEqual(scriptsDe(capitulo), []);
});

test('el LaTeX siempre necesita MathJax, aunque el navegador entienda MathML', () => {
  const capitulo = capituloFalso({
    texto: 'La solución es \\(x = 2\\).',
    entiendeMathML: true,
    alturas: { mo: 96, mspace: 96 },
  });
  inyectarMathJax(capitulo);
  assert.equal(scriptsDe(capitulo).length, 2);
  // Con LaTeX de por medio no se apaga la lectura de TeX.
  assert.equal(capitulo.document.documentElement.dataset.pagekeeperSoloMathml, undefined);
});

test('MathML bien dibujado por el navegador: MathJax no hace falta', () => {
  // El corchete estirable crece con el hueco: hay fuente matemática.
  const capitulo = capituloFalso({ mathml: true, entiendeMathML: true, alturas: { mo: 90, mspace: 96 } });
  assert.equal(mathmlSeVeBien(capitulo), true);
  inyectarMathJax(capitulo);
  assert.deepEqual(scriptsDe(capitulo), []);
});

test('MathML entendido pero sin fuente matemática (Android): entra MathJax', () => {
  // El corchete se queda del tamaño de una letra junto a un hueco de 96 px.
  const capitulo = capituloFalso({ mathml: true, entiendeMathML: true, alturas: { mo: 16, mspace: 96 } });
  assert.equal(mathmlSeVeBien(capitulo), false);
  inyectarMathJax(capitulo);
  assert.equal(scriptsDe(capitulo).length, 2);
});

test('navegador que ni entiende MathML: entra MathJax sin medir nada', () => {
  const capitulo = capituloFalso({ mathml: true });
  assert.equal(mathmlSeVeBien(capitulo), false);
  inyectarMathJax(capitulo);
  assert.equal(scriptsDe(capitulo).length, 2);
});

test('sin medidas (capítulo aún sin dibujar) se prefiere MathJax', () => {
  const capitulo = capituloFalso({ mathml: true, entiendeMathML: true, alturas: { mo: 0, mspace: 0 } });
  assert.equal(mathmlSeVeBien(capitulo), false);
});

test('en un capítulo de solo MathML se avisa para no convertir el TeX escrito', () => {
  const capitulo = capituloFalso({
    mathml: true,
    texto: 'Se escribe \\begin{bmatrix} a & b \\end{bmatrix}',
    alturas: { mo: 16, mspace: 96 },
  });
  inyectarMathJax(capitulo);
  assert.equal(capitulo.document.documentElement.dataset.pagekeeperSoloMathml, '1');
});
