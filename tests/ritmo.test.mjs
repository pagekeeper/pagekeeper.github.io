import test from 'node:test';
import assert from 'node:assert/strict';

import {
  muestraValida, acumularRitmo, segundosPorUnidad, minutosRestantes,
  SEMIVIDA_PAGINAS, SEMIVIDA_PORCENTAJE,
} from '../js/ritmo.js';

// Lee 'paginas' páginas seguidas a 'segundos' por página, de una en una.
function leer(entrada, paginas, segundos) {
  for (let i = 0; i < paginas; i++) entrada = acumularRitmo(entrada, segundos, 1);
  return entrada;
}

test('descarta las pausas largas y los vistazos de un segundo', () => {
  assert.equal(muestraValida(1, 1), false);
  assert.equal(muestraValida(600, 1), false);
  assert.equal(muestraValida(30, 1), true);
});

test('descarta los saltos de posición y el retroceso', () => {
  assert.equal(muestraValida(30, 12), false);
  assert.equal(muestraValida(30, -3), false);
  assert.equal(muestraValida(30, 0), true); // tiempo en la misma página
});

test('no estima nada hasta reunir lectura suficiente', () => {
  assert.equal(segundosPorUnidad(undefined), null);
  assert.equal(segundosPorUnidad(leer(null, 2, 40)), null); // pocas unidades
  assert.equal(segundosPorUnidad(leer(null, 3, 10)), null); // pocos segundos
  assert.ok(segundosPorUnidad(leer(null, 5, 60)) > 0);
});

test('estima el ritmo a partir de una lectura constante', () => {
  const entrada = leer(null, 30, 45);
  assert.ok(Math.abs(segundosPorUnidad(entrada) - 45) < 1);
  assert.equal(minutosRestantes(entrada, 100), 75);
});

test('el tiempo sin pasar de página cuenta como lectura de esa página', () => {
  let entrada = leer(null, 10, 30);
  const antes = segundosPorUnidad(entrada);
  entrada = acumularRitmo(entrada, 60, 0);
  assert.ok(segundosPorUnidad(entrada) > antes);
});

test('sigue el ritmo reciente en lugar de la media de todo el libro', () => {
  // 200 páginas a 100 s y luego un buen tramo a 20 s. La media de todo el
  // libro se quedaría cerca de 87 s; aquí la estimación baja hacia el ritmo
  // nuevo y sigue bajando cuanto más se lee así.
  const lento = leer(null, 200, 100);
  const ritmos = [40, 80, 120].map((paginas) => segundosPorUnidad(leer(lento, paginas, 20)));
  assert.deepEqual(ritmos, [...ritmos].sort((a, b) => b - a), 'debe ir bajando');
  assert.ok(ritmos[0] < 70, `tras 40 páginas rápidas esperaba < 70 s, obtuve ${ritmos[0]}`);
  assert.ok(ritmos[2] < 30, `tras 120 páginas rápidas esperaba < 30 s, obtuve ${ritmos[2]}`);
});

test('tras una semivida el tramo anterior pesa la mitad', () => {
  const entrada = leer(leer(null, 400, 20), SEMIVIDA_PAGINAS, 60);
  const ritmo = segundosPorUnidad(entrada);
  assert.ok(ritmo > 35 && ritmo < 45, `esperaba el punto medio (40 s), obtuve ${ritmo}`);
});

test('el EPUB olvida en puntos de porcentaje, no en páginas', () => {
  // Avanzar 8 unidades al doble de velocidad mueve mucho la estimación de un
  // EPUB (es un 8 % del libro) y apenas la de un PDF (son 8 páginas).
  const inicio = { s: 200 * 100, u: 200 };
  const epub = segundosPorUnidad(
    Array.from({ length: SEMIVIDA_PORCENTAJE })
      .reduce((entrada) => acumularRitmo(entrada, 50, 1, SEMIVIDA_PORCENTAJE), inicio));
  const pdf = segundosPorUnidad(leer(inicio, SEMIVIDA_PORCENTAJE, 50));
  assert.ok(pdf > 95, `el PDF debe moverse poco desde 100 s, obtuve ${pdf}`);
  assert.ok(epub < pdf - 10, `el EPUB debe moverse más: ${epub} frente a ${pdf}`);
});

test('lo acumulado no crece sin límite', () => {
  const corta = leer(null, 50, 30);
  const larga = leer(null, 5000, 30);
  assert.ok(larga.u < 60, `las unidades se estabilizan, obtuve ${larga.u}`);
  assert.ok(Math.abs(segundosPorUnidad(corta) - segundosPorUnidad(larga)) < 1);
});

test('asimila los acumulados antiguos sin olvido exponencial', () => {
  // Formato anterior: sumas de todo el libro (200 páginas a 100 s).
  const antiguo = { s: 20000, u: 200 };
  const entrada = leer(antiguo, 60, 20);
  const ritmo = segundosPorUnidad(entrada);
  assert.ok(ritmo < 60, `debe acercarse al ritmo nuevo, obtuve ${ritmo}`);
});

test('no estima con un número de unidades restantes inválido', () => {
  assert.equal(minutosRestantes(leer(null, 30, 45), null), null);
});
