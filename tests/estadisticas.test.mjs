import test from 'node:test';
import assert from 'node:assert/strict';

import {
  apuntar, resumen, racha, rachaMaxima, serie, normalizar, claveDia,
  DIAS_GUARDADOS, LIBROS_GUARDADOS,
} from '../js/estadisticas.js';

// Una fecha local concreta, para no depender del huso de quien ejecute.
function dia(anno, mes, d, hora = 12) {
  return new Date(anno, mes - 1, d, hora).getTime();
}

test('la clave del día es la fecha local, no UTC', () => {
  assert.equal(claveDia(dia(2026, 3, 7, 1)), '2026-03-07');
  assert.equal(claveDia(dia(2026, 3, 7, 23)), '2026-03-07');
});

test('acumula el tiempo del día y el del libro', () => {
  let datos = apuntar(undefined, { segundos: 60, paginas: 2, libro: 'a', titulo: 'Uno', ahora: dia(2026, 5, 4) });
  datos = apuntar(datos, { segundos: 30, paginas: 1, libro: 'a', ahora: dia(2026, 5, 4) });
  assert.deepEqual(datos.dias['2026-05-04'], { s: 90, p: 3 });
  assert.equal(datos.libros.a.s, 90);
  assert.equal(datos.libros.a.p, 3);
  assert.equal(datos.libros.a.n, 'Uno'); // un título vacío no borra el que había
});

test('descarta las muestras imposibles', () => {
  const datos = apuntar(undefined, { segundos: 5000, libro: 'a', ahora: dia(2026, 5, 4) });
  assert.deepEqual(datos.dias, {});
  for (const malo of [0, -30, NaN, Infinity, 'diez', null]) {
    assert.deepEqual(apuntar(undefined, { segundos: malo, ahora: dia(2026, 5, 4) }).dias, {});
  }
});

test('en EPUB no se cuentan páginas, pero sí el tiempo', () => {
  const datos = apuntar(undefined, {
    segundos: 120, libro: 'e', titulo: 'Novela', formato: 'epub', ahora: dia(2026, 5, 4),
  });
  assert.equal(datos.dias['2026-05-04'].s, 120);
  assert.equal(datos.dias['2026-05-04'].p, 0);
  assert.equal(datos.libros.e.f, 'epub');
});

test('la racha cuenta días seguidos y sobrevive al día en blanco de hoy', () => {
  const dias = { '2026-05-02': { s: 60, p: 0 }, '2026-05-03': { s: 60, p: 0 }, '2026-05-04': { s: 60, p: 0 } };
  assert.equal(racha(dias, '2026-05-04'), 3);
  // Aún no se ha leído hoy: la racha de ayer sigue viva.
  assert.equal(racha(dias, '2026-05-05'), 3);
  // Dos días sin leer sí la rompen.
  assert.equal(racha(dias, '2026-05-06'), 0);
});

test('la racha máxima encuentra el tramo más largo del historial', () => {
  const dias = {
    '2026-04-01': { s: 60, p: 0 }, '2026-04-02': { s: 60, p: 0 },
    '2026-04-10': { s: 60, p: 0 }, '2026-04-11': { s: 60, p: 0 },
    '2026-04-12': { s: 60, p: 0 }, '2026-04-13': { s: 60, p: 0 },
  };
  assert.equal(rachaMaxima(dias), 4);
  assert.equal(rachaMaxima({}), 0);
});

test('la racha cruza el cambio de mes y el de año', () => {
  const dias = { '2025-12-31': { s: 60, p: 0 }, '2026-01-01': { s: 60, p: 0 } };
  assert.equal(racha(dias, '2026-01-01'), 2);
  assert.equal(rachaMaxima(dias), 2);
});

test('la serie rellena con ceros los días sin lectura', () => {
  const dias = { '2026-05-04': { s: 300, p: 5 }, '2026-05-06': { s: 120, p: 2 } };
  const puntos = serie(dias, '2026-05-06', 4);
  assert.deepEqual(puntos.map((p) => p.dia), ['2026-05-03', '2026-05-04', '2026-05-05', '2026-05-06']);
  assert.deepEqual(puntos.map((p) => p.segundos), [0, 300, 0, 120]);
});

test('el resumen reparte los totales por ventanas y ordena los libros', () => {
  let datos;
  datos = apuntar(datos, { segundos: 600, paginas: 10, libro: 'a', titulo: 'A', ahora: dia(2026, 5, 1) });
  datos = apuntar(datos, { segundos: 300, paginas: 5, libro: 'b', titulo: 'B', ahora: dia(2026, 5, 20) });
  datos = apuntar(datos, { segundos: 900, paginas: 9, libro: 'a', titulo: 'A', ahora: dia(2026, 5, 25) });

  const r = resumen(datos, dia(2026, 5, 25));
  assert.equal(r.hay, true);
  assert.equal(r.totalSegundos, 1800);
  assert.equal(r.totalPaginas, 24);
  assert.equal(r.diasActivos, 3);
  assert.equal(r.mediaDiaria, 600);
  assert.equal(r.hoy, 900);
  assert.equal(r.semana.segundos, 1200);       // los días 20 y 25; el 1 queda fuera
  assert.equal(r.semana.paginas, 14);
  assert.equal(r.mes.segundos, 1800);          // los tres, dentro de 30 días
  assert.deepEqual(r.mejorDia, { dia: '2026-05-25', segundos: 900 });
  assert.deepEqual(r.libros.map((l) => l.id), ['a', 'b']);
  assert.equal(r.libros[0].segundos, 1500);
});

test('la ventana de siete días incluye hoy y los seis anteriores', () => {
  let datos;
  datos = apuntar(datos, { segundos: 60, ahora: dia(2026, 5, 19) }); // justo dentro
  datos = apuntar(datos, { segundos: 60, ahora: dia(2026, 5, 18) }); // justo fuera
  assert.equal(resumen(datos, dia(2026, 5, 25)).semana.segundos, 60);
});

test('el resumen de un registro vacío no inventa nada', () => {
  const r = resumen(undefined, dia(2026, 5, 25));
  assert.equal(r.hay, false);
  assert.equal(r.totalSegundos, 0);
  assert.equal(r.mediaDiaria, 0);
  assert.equal(r.racha, 0);
  assert.deepEqual(r.mejorDia, null);
  assert.deepEqual(r.libros, []);
  assert.equal(r.serie.length, 30);
});

test('normalizar aguanta lo que haya escrito otra versión', () => {
  assert.deepEqual(normalizar(null).dias, {});
  assert.deepEqual(normalizar('roto').libros, {});
  const sucio = {
    dias: { 'no-es-fecha': { s: 60 }, '2026-05-04': { s: 'x' }, '2026-05-05': { s: 60 } },
    libros: { a: { s: 0 }, b: { s: 60, n: 42, f: 'raro' } },
  };
  const limpio = normalizar(sucio);
  assert.deepEqual(Object.keys(limpio.dias), ['2026-05-05']);
  assert.deepEqual(Object.keys(limpio.libros), ['b']);
  assert.equal(limpio.libros.b.n, '');
  assert.equal(limpio.libros.b.f, 'pdf');
});

test('poda los días viejos y los libros que hace más que no se abren', () => {
  let datos = { v: 1, dias: {}, libros: {} };
  datos.dias['2024-01-01'] = { s: 60, p: 0 };
  datos = apuntar(datos, { segundos: 60, libro: 'nuevo', ahora: dia(2026, 5, 25) });
  assert.equal(datos.dias['2024-01-01'], undefined);
  assert.ok(datos.dias['2026-05-25']);

  let muchos = { v: 1, dias: {}, libros: {} };
  for (let i = 0; i < LIBROS_GUARDADOS + 20; i += 1) {
    muchos.libros[`libro-${i}`] = { s: 60, p: 0, t: i, n: '', f: 'pdf' };
  }
  muchos = apuntar(muchos, { segundos: 60, libro: 'ultimo', ahora: dia(2026, 5, 25) });
  assert.equal(Object.keys(muchos.libros).length, LIBROS_GUARDADOS);
  assert.ok(muchos.libros.ultimo);            // el que se acaba de leer se queda
  assert.equal(muchos.libros['libro-0'], undefined); // el más antiguo cae
});

test('conserva un año largo de días', () => {
  let datos = { v: 1, dias: {}, libros: {} };
  const hoy = new Date(2026, 4, 25);
  for (let i = 0; i < DIAS_GUARDADOS - 1; i += 1) {
    const d = new Date(2026, 4, 25 - i);
    datos.dias[claveDia(d)] = { s: 60, p: 0 };
  }
  datos = apuntar(datos, { segundos: 60, ahora: hoy.getTime() });
  assert.equal(Object.keys(datos.dias).length, DIAS_GUARDADOS - 1);
});
