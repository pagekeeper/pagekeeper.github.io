import test from 'node:test';
import assert from 'node:assert/strict';

import {
  lunesDe, claveDelPeriodo, inicioDelPeriodo, seriePeriodos,
  compararALaMismaAltura, diasTranscurridos,
  totalesDePeriodos, desdeCuandoHayDatos, CUANTOS,
} from '../js/periodos.js';

const fecha = (anno, mes, dia) => new Date(anno, mes - 1, dia);

// 2026-08-01 es sábado; su semana empieza el lunes 27 de julio.
test('la semana empieza en lunes, también cruzando de mes', () => {
  assert.equal(lunesDe(fecha(2026, 8, 1)).getDate(), 27);
  assert.equal(lunesDe(fecha(2026, 8, 1)).getMonth(), 6); // julio
  assert.equal(lunesDe(fecha(2026, 7, 27)).getDate(), 27); // el propio lunes se queda
  assert.equal(lunesDe(fecha(2026, 8, 2)).getDate(), 27); // domingo, séptimo día
  assert.equal(lunesDe(fecha(2026, 8, 3)).getDate(), 3);  // el lunes siguiente ya es otra
});

test('cada tramo se nombra por el día en que empieza', () => {
  assert.equal(claveDelPeriodo('dia', fecha(2026, 8, 1)), '2026-08-01');
  assert.equal(claveDelPeriodo('semana', fecha(2026, 8, 1)), '2026-07-27');
  assert.equal(claveDelPeriodo('mes', fecha(2026, 8, 1)), '2026-08');
  assert.equal(claveDelPeriodo('anno', fecha(2026, 8, 1)), '2026');
});

test('retroceder tramos no se sale del calendario', () => {
  assert.equal(claveDelPeriodo('mes', inicioDelPeriodo('mes', fecha(2026, 2, 15), 3)), '2025-11');
  assert.equal(claveDelPeriodo('anno', inicioDelPeriodo('anno', fecha(2026, 2, 15), 2)), '2024');
  assert.equal(claveDelPeriodo('semana', inicioDelPeriodo('semana', fecha(2026, 8, 1), 2)), '2026-07-13');
  // El 1 de marzo menos un día es el 28 de febrero, y 2028 sí es bisiesto.
  assert.equal(claveDelPeriodo('dia', inicioDelPeriodo('dia', fecha(2027, 3, 1), 1)), '2027-02-28');
  assert.equal(claveDelPeriodo('dia', inicioDelPeriodo('dia', fecha(2028, 3, 1), 1)), '2028-02-29');
});

const DATOS = {
  dias: {
    '2026-07-27': { s: 600, p: 10 },  // lunes de la semana pasada
    '2026-07-30': { s: 1200, p: 20 },
    '2026-08-01': { s: 1800, p: 30 }, // sábado: semana del 27 de julio
  },
  meses: {
    '2024-05': { s: 3600, p: 0 },
    '2025-08': { s: 7200, p: 0 },
    '2026-07': { s: 5400, p: 0 },
    '2026-08': { s: 1800, p: 0 },
  },
};

test('la semana suma sus días, y la que no tiene nada sale a cero', () => {
  const serie = seriePeriodos(DATOS, 'semana', fecha(2026, 8, 1), 3);
  assert.deepEqual(serie.map((punto) => punto.clave),
    ['2026-07-13', '2026-07-20', '2026-07-27']);
  assert.equal(serie[0].segundos, 0);
  assert.equal(serie[2].segundos, 3600); // 600 + 1200 + 1800
  assert.equal(serie[2].paginas, 60);
});

// El mes y el año no se suman de los días a propósito: los días se podan a los
// 400 y entonces lo de más atrás desaparecería de la vista.
test('el mes y el año se leen del contador mensual, no de los días', () => {
  const meses = seriePeriodos(DATOS, 'mes', fecha(2026, 8, 1), 2);
  assert.deepEqual(meses.map((punto) => [punto.clave, punto.segundos]),
    [['2026-07', 5400], ['2026-08', 1800]]);
  const annos = seriePeriodos(DATOS, 'anno', fecha(2026, 8, 1), 3);
  assert.deepEqual(annos.map((punto) => [punto.clave, punto.segundos]),
    [['2024', 3600], ['2025', 7200], ['2026', 7200]]); // 5400 + 1800
});

test('un mes sin días guardados sigue contando en su año', () => {
  const solosMeses = { dias: {}, meses: { '2024-01': { s: 900, p: 0 } } };
  assert.equal(seriePeriodos(solosMeses, 'anno', fecha(2026, 8, 1), 3)[0].segundos, 900);
});

test('el tramo lleva sus fechas de inicio y fin, que es lo que le pone nombre', () => {
  const [semana] = seriePeriodos(DATOS, 'semana', fecha(2026, 8, 1), 1);
  assert.equal(semana.inicio.getDate(), 27);
  assert.equal(semana.fin.getDate(), 2);   // domingo 2 de agosto
  const [mes] = seriePeriodos(DATOS, 'mes', fecha(2026, 2, 10), 1);
  assert.equal(mes.fin.getDate(), 28);     // febrero de 2026 no es bisiesto
});

// ── Comparar con el periodo anterior a la misma altura ──
//
// Un tramo en curso nunca está terminado, así que enfrentarlo entero al
// anterior solo decía qué día de la semana era hoy.

const SEMANAS = {
  dias: {
    // Semana del 20 de julio (la anterior): lunes, martes… y también el
    // viernes, que ya no cuenta si hoy es martes.
    '2026-07-20': { s: 600, p: 0 },
    '2026-07-21': { s: 600, p: 0 },
    '2026-07-24': { s: 5400, p: 0 },
    // Semana en curso: hoy es martes 28.
    '2026-07-27': { s: 300, p: 0 },
    '2026-07-28': { s: 300, p: 0 },
  },
  meses: {},
};

test('la semana en curso se compara con los mismos días de la anterior', () => {
  const r = compararALaMismaAltura(SEMANAS, 'semana', fecha(2026, 7, 28));
  assert.equal(r.actual.segundos, 600);      // lunes y martes de esta semana
  assert.equal(r.anterior.segundos, 1200);   // lunes y martes de la anterior, no el viernes
  assert.equal(r.variacion, -50);
  assert.equal(r.sentido, 'menos');
  assert.deepEqual(r.altura, { unidad: 'dia', dias: 2 });
});

test('el día en curso cuenta como un día más transcurrido', () => {
  assert.equal(diasTranscurridos('semana', fecha(2026, 7, 27)), 1); // lunes
  assert.equal(diasTranscurridos('semana', fecha(2026, 8, 2)), 7);  // domingo
  assert.equal(diasTranscurridos('mes', fecha(2026, 7, 28)), 28);
});

test('el mes en curso se compara con los mismos días del anterior', () => {
  const datos = { dias: {
    '2026-06-01': { s: 1200, p: 0 },
    '2026-06-02': { s: 1200, p: 0 },
    '2026-06-20': { s: 9000, p: 0 },  // lo de después del día 2 no entra
    '2026-07-01': { s: 1800, p: 0 },
    '2026-07-02': { s: 1800, p: 0 },
  }, meses: {} };
  const r = compararALaMismaAltura(datos, 'mes', fecha(2026, 7, 2));
  assert.equal(r.actual.segundos, 3600);
  assert.equal(r.anterior.segundos, 2400);
  assert.equal(r.variacion, 50);
  assert.equal(r.sentido, 'mas');
});

// El 31 de marzo no tiene equivalente en febrero: sin tope, el tramo anterior
// se habría comido los primeros días de marzo.
test('comparar un mes largo con uno corto no se sale del mes corto', () => {
  const datos = { dias: {
    '2026-02-28': { s: 600, p: 0 },
    '2026-03-01': { s: 3600, p: 0 },
    '2026-03-31': { s: 60, p: 0 },
  }, meses: {} };
  const r = compararALaMismaAltura(datos, 'mes', fecha(2026, 3, 31));
  assert.equal(r.anterior.segundos, 600);   // todo febrero, sin tocar marzo
  assert.equal(r.actual.segundos, 3660);
});

test('el año se compara por meses cerrados, que es lo que sobrevive a la poda', () => {
  const datos = { dias: {}, meses: {
    '2025-01': { s: 3600, p: 0 },
    '2025-02': { s: 3600, p: 0 },
    '2025-08': { s: 36000, p: 0 },  // agosto del año pasado no entra en junio
    '2026-01': { s: 1800, p: 0 },
    '2026-02': { s: 1800, p: 0 },
    '2026-03': { s: 600, p: 0 },    // marzo en curso: tampoco entra
  } };
  const r = compararALaMismaAltura(datos, 'anno', fecha(2026, 3, 15));
  assert.equal(r.actual.segundos, 3600);    // enero y febrero de este año
  assert.equal(r.anterior.segundos, 7200);  // enero y febrero del pasado
  assert.equal(r.variacion, -50);
  assert.deepEqual(r.altura, { unidad: 'mes', hasta: 2 });
});

// En enero no hay ningún mes cerrado de este año: no hay comparación honesta
// que hacer, y se prefiere no enseñar ninguna.
test('en enero el año todavía no se compara', () => {
  const r = compararALaMismaAltura({ dias: {}, meses: { '2026-01': { s: 600, p: 0 } } },
    'anno', fecha(2026, 1, 20));
  assert.equal(r.actual, null);
  assert.equal(r.altura, null);
});

test('sin lectura en el tramo anterior no se inventa un porcentaje', () => {
  const datos = { dias: { '2026-07-27': { s: 600, p: 0 } }, meses: {} };
  const r = compararALaMismaAltura(datos, 'semana', fecha(2026, 7, 27));
  assert.equal(r.anterior.segundos, 0);
  assert.equal(r.variacion, null);
  assert.equal(r.sentido, 'mas');
  // Y con los días no se compara nada: hoy contra ayer no dice cómo va la
  // lectura, y hoy casi siempre va por la mitad.
  assert.equal(compararALaMismaAltura(datos, 'dia', fecha(2026, 7, 27)).actual, null);
});

test('los totales cuentan solo los tramos con lectura', () => {
  const serie = seriePeriodos(DATOS, 'semana', fecha(2026, 8, 1), 3);
  assert.deepEqual(totalesDePeriodos(serie), { tramosConLectura: 1, segundos: 3600 });
});

test('se sabe desde cuándo hay datos, que no es lo mismo por días que por meses', () => {
  assert.equal(desdeCuandoHayDatos(DATOS, 'dia'), '2026-07-27');
  assert.equal(desdeCuandoHayDatos(DATOS, 'anno'), '2024-05');
  assert.equal(desdeCuandoHayDatos({}, 'mes'), null);
});

test('cada periodo enseña una cantidad de tramos pensada para él', () => {
  assert.deepEqual(CUANTOS, { dia: 30, semana: 12, mes: 12, anno: 5 });
});
