import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cajaDeContenido, cajaRepresentativa, unir, conAire, ajustarRecorte, paginasAMuestrear,
} from '../js/recorte.js';

// Los cálculos con fracciones arrastran el error habitual de los decimales.
function casiIgual(caja, esperada, mensaje) {
  for (const lado of ['x', 'y', 'ancho', 'alto']) {
    assert.ok(Math.abs(caja[lado] - esperada[lado]) < 1e-9,
      `${mensaje ?? 'caja'}: ${lado} vale ${caja[lado]} y se esperaba ${esperada[lado]}`);
  }
}

// Imagen RGBA blanca con un rectángulo de tinta (coordenadas en píxeles).
function pagina(ancho, alto, tinta = null, color = 0) {
  const pixeles = new Uint8ClampedArray(ancho * alto * 4).fill(255);
  if (!tinta) return pixeles;
  for (let y = tinta.y; y < tinta.y + tinta.alto; y++) {
    for (let x = tinta.x; x < tinta.x + tinta.ancho; x++) {
      const i = (y * ancho + x) * 4;
      pixeles[i] = pixeles[i + 1] = pixeles[i + 2] = color;
    }
  }
  return pixeles;
}

test('encuentra el rectángulo con contenido', () => {
  const caja = cajaDeContenido(pagina(100, 100, { x: 20, y: 10, ancho: 60, alto: 50 }), 100, 100);
  assert.deepEqual(caja, { x: 0.2, y: 0.1, ancho: 0.6, alto: 0.5 });
});

test('una página en blanco no da rectángulo', () => {
  assert.equal(cajaDeContenido(pagina(50, 50), 50, 50), null);
});

test('el gris muy claro del papel escaneado no cuenta como contenido', () => {
  const casi = cajaDeContenido(pagina(50, 50, { x: 5, y: 5, ancho: 10, alto: 10 }, 245), 50, 50);
  const tinta = cajaDeContenido(pagina(50, 50, { x: 5, y: 5, ancho: 10, alto: 10 }, 120), 50, 50);
  assert.equal(casi, null);
  assert.ok(tinta);
});

test('une los márgenes de varias páginas, quedándose con los mayores', () => {
  const union = unir([
    { x: 0.2, y: 0.2, ancho: 0.5, alto: 0.5 },
    { x: 0.1, y: 0.3, ancho: 0.5, alto: 0.6 },
    null,
  ]);
  assert.deepEqual(union, { x: 0.1, y: 0.2, ancho: 0.6, alto: 0.7 });
});

test('sin ninguna página legible no hay recorte', () => {
  assert.equal(unir([null, null]), null);
  assert.equal(unir([]), null);
  assert.equal(ajustarRecorte(null), null);
});

test('deja aire alrededor del contenido sin salirse de la página', () => {
  const recorte = ajustarRecorte({ x: 0.1, y: 0.1, ancho: 0.8, alto: 0.8 }, 0.02);
  assert.ok(Math.abs(recorte.x - 0.08) < 1e-9 && Math.abs(recorte.y - 0.08) < 1e-9);
  assert.ok(Math.abs(recorte.ancho - 0.84) < 1e-9 && Math.abs(recorte.alto - 0.84) < 1e-9);

  const pegado = ajustarRecorte({ x: 0, y: 0, ancho: 1, alto: 0.5 }, 0.02);
  assert.equal(pegado.x, 0);
  assert.equal(pegado.ancho, 1);
});

test('no recorta cuando no hay margen que ganar', () => {
  assert.equal(ajustarRecorte({ x: 0.005, y: 0.005, ancho: 0.99, alto: 0.99 }), null);
});

test('descarta un recorte disparatado', () => {
  // Una página casi vacía (un sello, un número suelto) no debe dejar el libro
  // reducido a ese trozo.
  assert.equal(ajustarRecorte({ x: 0.4, y: 0.4, ancho: 0.1, alto: 0.1 }), null);
});

test('una portada a sangre no anula el recorte de todo el libro', () => {
  // Once páginas de texto con los mismos márgenes y una portada a toda página.
  const texto = { x: 0.1, y: 0.06, ancho: 0.8, alto: 0.88 };
  const cajas = [{ x: 0, y: 0, ancho: 1, alto: 1 }, ...Array(11).fill(texto)];
  assert.deepEqual(unir(cajas), { x: 0, y: 0, ancho: 1, alto: 1 });
  casiIgual(cajaRepresentativa(cajas), texto);
});

test('la caja típica aguanta varias páginas raras', () => {
  const texto = { x: 0.1, y: 0.06, ancho: 0.8, alto: 0.88 };
  const cajas = [...Array(3).fill({ x: 0, y: 0, ancho: 1, alto: 1 }), ...Array(9).fill(texto)];
  casiIgual(cajaRepresentativa(cajas), texto);
});

test('con todas las páginas a sangre no hay nada que recortar', () => {
  const cajas = Array(8).fill({ x: 0, y: 0, ancho: 1, alto: 1 });
  assert.equal(ajustarRecorte(cajaRepresentativa(cajas)), null);
});

test('el aire no descarta cajas, solo las ensancha', () => {
  // La unión de la caja común con la de una página a sangre deja esa página
  // entera: es lo que evita cortarle nada.
  const comun = { x: 0.08, y: 0.04, ancho: 0.84, alto: 0.9 };
  const sangre = conAire({ x: 0, y: 0, ancho: 1, alto: 1 });
  assert.deepEqual(unir([comun, sangre]), { x: 0, y: 0, ancho: 1, alto: 1 });
});

test('reparte las páginas de muestra por todo el documento', () => {
  assert.deepEqual(paginasAMuestrear(5), [1, 2, 3, 4, 5]);
  const muestra = paginasAMuestrear(237, 12);
  assert.equal(muestra.length, 12);
  assert.equal(muestra[0], 1);
  assert.equal(muestra.at(-1), 237);
  assert.deepEqual(muestra, [...muestra].sort((a, b) => a - b));
});
