import test from 'node:test';
import assert from 'node:assert/strict';

import {
  apuntarTiempo, fusionarTiempos, totalTiempo, normalizarTiempos,
  apuntarDia, fusionarEstadisticas, diasCombinados, normalizarEstadisticas,
  racha, rachaMaxima, serie, librosLeidos, resumen, estadisticasDeLibro,
  mesesCombinados,
  claveDia, DIAS_GUARDADOS,
  apartarLibro, restoDeLibro, fusionarLeidos, podarLeidos,
} from '../js/estadisticas.js';

// Una fecha local concreta, para no depender del huso de quien ejecute.
function dia(anno, mes, d, hora = 12) {
  return new Date(anno, mes - 1, d, hora).getTime();
}

test('la clave del día es la fecha local, no UTC', () => {
  assert.equal(claveDia(dia(2026, 3, 7, 1)), '2026-03-07');
  assert.equal(claveDia(dia(2026, 3, 7, 23)), '2026-03-07');
});

// ───────────── Tiempo por libro ─────────────

test('cada dispositivo suma en su propia casilla', () => {
  let tiempos = apuntarTiempo(undefined, 'movil', { segundos: 60, paginas: 2 });
  tiempos = apuntarTiempo(tiempos, 'movil', { segundos: 30, paginas: 1 });
  tiempos = apuntarTiempo(tiempos, 'portatil', { segundos: 90, paginas: 4 });
  assert.deepEqual(tiempos, { movil: { s: 90, p: 3 }, portatil: { s: 90, p: 4 } });
  assert.deepEqual(totalTiempo(tiempos), { s: 180, p: 7 });
});

test('los segundos se guardan redondeados', () => {
  const tiempos = apuntarTiempo(undefined, 'a', { segundos: 19.641000000000002 });
  assert.equal(tiempos.a.s, 20);
});

test('descarta las muestras imposibles y las que no dicen de quién son', () => {
  for (const malo of [0, -30, NaN, Infinity, 'diez', null, 5000]) {
    assert.deepEqual(apuntarTiempo(undefined, 'a', { segundos: malo }), {});
  }
  assert.deepEqual(apuntarTiempo(undefined, '', { segundos: 60 }), {});
});

test('fusionar se queda la casilla mayor de cada dispositivo, sin mirar el reloj', () => {
  const mio = { movil: { s: 300, p: 10 }, portatil: { s: 60, p: 1 } };
  const suyo = { movil: { s: 120, p: 4 }, tablet: { s: 90, p: 3 } };
  assert.deepEqual(fusionarTiempos(mio, suyo), {
    movil: { s: 300, p: 10 },   // la mía va por delante
    portatil: { s: 60, p: 1 },  // solo la tengo yo
    tablet: { s: 90, p: 3 },    // solo la tiene el otro
  });
});

test('fusionar es conmutativo: da igual quién sincronice primero', () => {
  const uno = { a: { s: 300, p: 2 }, b: { s: 50, p: 1 } };
  const otro = { a: { s: 120, p: 1 }, c: { s: 90, p: 0 } };
  assert.deepEqual(fusionarTiempos(uno, otro), fusionarTiempos(otro, uno));
});

test('dos dispositivos leyendo a la vez no se pisan el rato', () => {
  // Parten del mismo estado sincronizado y cada uno lee por su cuenta.
  const comun = { movil: { s: 600, p: 20 }, portatil: { s: 600, p: 20 } };
  const enElMovil = apuntarTiempo(comun, 'movil', { segundos: 300, paginas: 10 });
  const enElPortatil = apuntarTiempo(comun, 'portatil', { segundos: 120, paginas: 5 });
  const fusionado = fusionarTiempos(enElMovil, enElPortatil);
  assert.deepEqual(totalTiempo(fusionado), { s: 1620, p: 55 }); // 900 + 720
});

test('normalizar tira lo que no es tiempo', () => {
  assert.deepEqual(normalizarTiempos(null), {});
  assert.deepEqual(normalizarTiempos('roto'), {});
  assert.deepEqual(normalizarTiempos({ a: { s: 0 }, b: { s: -5 }, c: { s: 60 } }), { c: { s: 60, p: 0 } });
});

// ───────────── Días de lectura ─────────────

test('los días se apuntan por dispositivo y se combinan sumando', () => {
  let est = apuntarDia(undefined, 'movil', { segundos: 600, paginas: 5, ahora: dia(2026, 5, 4) });
  est = apuntarDia(est, 'portatil', { segundos: 300, paginas: 2, ahora: dia(2026, 5, 4) });
  est = apuntarDia(est, 'movil', { segundos: 60, ahora: dia(2026, 5, 5) });
  assert.deepEqual(diasCombinados(est), {
    '2026-05-04': { s: 900, p: 7 },
    '2026-05-05': { s: 60, p: 0 },
  });
});

test('fusionar los días se queda la cifra mayor de cada día y dispositivo', () => {
  const mias = { movil: { dias: { '2026-05-04': { s: 600, p: 5 } } } };
  const suyas = {
    movil: { dias: { '2026-05-04': { s: 300, p: 2 }, '2026-05-05': { s: 60, p: 0 } } },
    tablet: { dias: { '2026-05-04': { s: 120, p: 1 } } },
  };
  const fusionadas = fusionarEstadisticas(mias, suyas);
  assert.deepEqual(fusionadas.movil.dias['2026-05-04'], { s: 600, p: 5 });
  assert.deepEqual(fusionadas.movil.dias['2026-05-05'], { s: 60, p: 0 });
  assert.deepEqual(fusionadas.tablet.dias['2026-05-04'], { s: 120, p: 1 });
  assert.deepEqual(fusionarEstadisticas(mias, suyas), fusionarEstadisticas(suyas, mias));
});

test('un día leído en dos dispositivos es un solo día para la racha', () => {
  let est = apuntarDia(undefined, 'movil', { segundos: 600, ahora: dia(2026, 5, 4) });
  est = apuntarDia(est, 'portatil', { segundos: 600, ahora: dia(2026, 5, 4) });
  assert.equal(racha(diasCombinados(est), '2026-05-04'), 1);
});

test('la racha cuenta días seguidos y sobrevive al día en blanco de hoy', () => {
  const dias = { '2026-05-02': { s: 60 }, '2026-05-03': { s: 60 }, '2026-05-04': { s: 60 } };
  assert.equal(racha(dias, '2026-05-04'), 3);
  assert.equal(racha(dias, '2026-05-05'), 3); // hoy aún no, pero sigue viva
  assert.equal(racha(dias, '2026-05-06'), 0); // dos días sin leer sí la rompen
});

test('la racha máxima encuentra el tramo más largo y cruza el fin de año', () => {
  assert.equal(rachaMaxima({
    '2026-04-01': { s: 60 }, '2026-04-02': { s: 60 },
    '2026-04-10': { s: 60 }, '2026-04-11': { s: 60 }, '2026-04-12': { s: 60 }, '2026-04-13': { s: 60 },
  }), 4);
  assert.equal(rachaMaxima({ '2025-12-31': { s: 60 }, '2026-01-01': { s: 60 } }), 2);
  assert.equal(rachaMaxima({}), 0);
});

test('la serie rellena con ceros los días sin lectura', () => {
  const dias = { '2026-05-04': { s: 300, p: 5 }, '2026-05-06': { s: 120, p: 2 } };
  const puntos = serie(dias, '2026-05-06', 4);
  assert.deepEqual(puntos.map((p) => p.dia), ['2026-05-03', '2026-05-04', '2026-05-05', '2026-05-06']);
  assert.deepEqual(puntos.map((p) => p.segundos), [0, 300, 0, 120]);
});

test('poda los días más viejos que el plazo', () => {
  const viejo = claveDia(new Date(2026, 4, 25 - DIAS_GUARDADOS - 5));
  const est = apuntarDia({ a: { dias: { [viejo]: { s: 60, p: 0 } } } }, 'a',
    { segundos: 60, ahora: dia(2026, 5, 25) });
  assert.equal(est.a.dias[viejo], undefined);
  assert.ok(est.a.dias['2026-05-25']);
});

test('normalizar las estadísticas aguanta lo que haya escrito otra versión', () => {
  assert.deepEqual(normalizarEstadisticas(null), {});
  assert.deepEqual(normalizarEstadisticas('roto'), {});
  const limpio = normalizarEstadisticas({
    a: { dias: { 'no-es-fecha': { s: 60 }, '2026-05-04': { s: 'x' }, '2026-05-05': { s: 60 } } },
    b: { dias: {} },
    c: 'basura',
  });
  assert.deepEqual(Object.keys(limpio), ['a']);
  assert.deepEqual(limpio.a.dias, { '2026-05-05': { s: 60, p: 0 } });
});

// ───────────── Resumen ─────────────

function registro() {
  let estadisticas;
  estadisticas = apuntarDia(estadisticas, 'movil', { segundos: 600, paginas: 10, ahora: dia(2026, 5, 1) });
  estadisticas = apuntarDia(estadisticas, 'movil', { segundos: 300, paginas: 5, ahora: dia(2026, 5, 20) });
  estadisticas = apuntarDia(estadisticas, 'portatil', { segundos: 900, paginas: 9, ahora: dia(2026, 5, 25) });
  return {
    estadisticas,
    libros: {
      'Novelas/uno.epub': { titulo: 'El uno', tiempos: { movil: { s: 600, p: 0 }, portatil: { s: 900, p: 0 } } },
      'dos.pdf': { tiempos: { movil: { s: 300, p: 15 } } },
      'tres.pdf': { pagina: 4 },                       // abierto, pero sin tiempo
      'local:cuatro.pdf:99': { tiempos: { movil: { s: 60, p: 1 } } },
    },
  };
}

test('el resumen combina los días de todos los dispositivos', () => {
  const r = resumen(registro(), dia(2026, 5, 25));
  assert.equal(r.hay, true);
  assert.equal(r.totalSegundos, 1800);
  assert.equal(r.totalPaginas, 24);
  assert.equal(r.diasActivos, 3);
  assert.equal(r.mediaDiaria, 600);
  assert.equal(r.hoy, 900);
  assert.equal(r.semana.segundos, 1200);   // los días 20 y 25; el 1 queda fuera
  assert.equal(r.mes.segundos, 1800);
  assert.deepEqual(r.mejorDia, { dia: '2026-05-25', segundos: 900 });
  assert.equal(r.dispositivos, 2);
});

test('la ventana de siete días incluye hoy y los seis anteriores', () => {
  let est;
  est = apuntarDia(est, 'a', { segundos: 60, ahora: dia(2026, 5, 19) }); // justo dentro
  est = apuntarDia(est, 'a', { segundos: 60, ahora: dia(2026, 5, 18) }); // justo fuera
  assert.equal(resumen({ estadisticas: est }, dia(2026, 5, 25)).semana.segundos, 60);
});

test('los libros salen ordenados por tiempo total, con su desglose', () => {
  const { libros } = resumen(registro(), dia(2026, 5, 25));
  assert.deepEqual(libros.map((libro) => libro.id),
    ['Novelas/uno.epub', 'dos.pdf', 'local:cuatro.pdf:99']); // 'tres.pdf' no tiene tiempo
  assert.equal(libros[0].segundos, 1500);
  assert.equal(libros[0].formato, 'epub');
  assert.equal(libros[0].enLaNube, true);
  assert.deepEqual(libros[0].porDispositivo, [
    { dispositivo: 'portatil', segundos: 900, paginas: 0 },
    { dispositivo: 'movil', segundos: 600, paginas: 0 },
  ]);
  assert.equal(libros[2].enLaNube, false);
});

test('un libro leído solo en un aparato no trae desglose que enseñar', () => {
  const { libros } = resumen(registro(), dia(2026, 5, 25));
  assert.equal(libros[1].porDispositivo.length, 1);
});

test('el resumen de un registro vacío no inventa nada', () => {
  const r = resumen(undefined, dia(2026, 5, 25));
  assert.equal(r.hay, false);
  assert.equal(r.totalSegundos, 0);
  assert.equal(r.racha, 0);
  assert.equal(r.dispositivos, 0);
  assert.deepEqual(r.mejorDia, null);
  assert.deepEqual(r.libros, []);
  assert.equal(r.serie.length, 30);
});

test('un libro con tiempo cuenta aunque no haya días apuntados', () => {
  // Puede pasar tras podar los días viejos: el libro conserva su total.
  const r = resumen({ libros: { 'uno.pdf': { tiempos: { a: { s: 600, p: 0 } } } } }, dia(2026, 5, 25));
  assert.equal(r.hay, true);
  assert.equal(r.libros[0].segundos, 600);
});

test('librosLeidos deja fuera lo que no se ha leído', () => {
  assert.deepEqual(librosLeidos({ 'a.pdf': { pagina: 3 }, 'b.pdf': { tiempos: {} } }), []);
  assert.deepEqual(librosLeidos(undefined), []);
});

// ───────────── Ficha de un libro ─────────────

test('la ficha reúne el tiempo, el avance y el ritmo de un libro', () => {
  const datos = {
    libros: {
      'manual.pdf': {
        pagina: 60, paginas: 120,
        tiempos: { movil: { s: 3600, p: 40 }, portatil: { s: 1800, p: 20 } },
      },
    },
  };
  const ficha = estadisticasDeLibro(datos, 'manual.pdf');
  assert.equal(ficha.hay, true);
  assert.equal(ficha.segundos, 5400);
  assert.equal(ficha.paginas, 60);
  assert.equal(ficha.porcentaje, 50);
  assert.equal(ficha.ritmo, 90);           // 5400 s / 60 páginas
  assert.equal(ficha.formato, 'pdf');
  assert.deepEqual(ficha.porDispositivo.map((p) => p.dispositivo), ['movil', 'portatil']);
});

// El id de un libro del dispositivo lleva el tamaño detrás del nombre, así que
// la extensión no está al final: mirando el id entero, un EPUB del dispositivo
// pasaba por PDF y su ficha se inventaba un ritmo por página.
test('un EPUB del dispositivo no pasa por PDF', () => {
  const datos = { libros: { 'local:novela.epub:12345': { tiempos: { a: { s: 600, p: 4 } } } } };
  assert.equal(estadisticasDeLibro(datos, 'local:novela.epub:12345').formato, 'epub');
  assert.equal(estadisticasDeLibro(datos, 'local:novela.epub:12345').ritmo, null);
  assert.equal(librosLeidos(datos.libros)[0].formato, 'epub');
  // Y un PDF del dispositivo sigue siendo un PDF.
  const pdf = { libros: { 'local:apuntes.pdf:99': { tiempos: { a: { s: 600, p: 4 } } } } };
  assert.equal(librosLeidos(pdf.libros)[0].formato, 'pdf');
});

test('en EPUB no se calcula ritmo por página, porque no hay páginas fijas', () => {
  const ficha = estadisticasDeLibro(
    { libros: { 'novela.epub': { tiempos: { a: { s: 3600, p: 0 } } } } }, 'novela.epub');
  assert.equal(ficha.ritmo, null);
  assert.equal(ficha.formato, 'epub');
});

test('la ficha de un libro sin leer no inventa cifras', () => {
  const ficha = estadisticasDeLibro({ libros: {} }, 'nuevo.pdf');
  assert.equal(ficha.hay, false);
  assert.equal(ficha.segundos, 0);
  assert.equal(ficha.porcentaje, null);
  assert.equal(ficha.ritmo, null);
  assert.deepEqual(ficha.porDispositivo, []);
  assert.deepEqual(estadisticasDeLibro(undefined, 'x.pdf').hay, false);
});

test('el porcentaje se queda dentro de sus límites aunque el registro venga raro', () => {
  const pasado = estadisticasDeLibro(
    { libros: { 'a.pdf': { pagina: 300, paginas: 120, tiempos: { d: { s: 60, p: 1 } } } } }, 'a.pdf');
  assert.equal(pasado.porcentaje, 100);
  const sinTotal = estadisticasDeLibro(
    { libros: { 'b.pdf': { pagina: 5, paginas: 0, tiempos: { d: { s: 60, p: 1 } } } } }, 'b.pdf');
  assert.equal(sinTotal.porcentaje, null);
});


// ── El contador mensual, que no se poda ──

test('apuntar un rato lo suma al día y a su mes', () => {
  let est;
  est = apuntarDia(est, 'a', { segundos: 600, paginas: 5, ahora: dia(2026, 7, 30) });
  est = apuntarDia(est, 'a', { segundos: 300, paginas: 2, ahora: dia(2026, 8, 1) });
  assert.deepEqual(est.a.meses, { '2026-07': { s: 600, p: 5 }, '2026-08': { s: 300, p: 2 } });
  assert.deepEqual(mesesCombinados(est), { '2026-07': { s: 600, p: 5 }, '2026-08': { s: 300, p: 2 } });
});

// Los días viejos se caen a los 400; el mes al que pertenecían se queda, que
// es lo que permite comparar un año con el anterior.
test('el mes sobrevive a la poda de sus días', () => {
  let est;
  est = apuntarDia(est, 'a', { segundos: 900, ahora: dia(2025, 1, 15) });
  est = apuntarDia(est, 'a', { segundos: 600, ahora: dia(2026, 8, 1) });
  assert.ok(!est.a.dias['2025-01-15'], 'el día de hace año y medio ya no está');
  assert.equal(est.a.meses['2025-01'].s, 900);
});

test('los meses de cada aparato se suman, como los días', () => {
  let est;
  est = apuntarDia(est, 'movil', { segundos: 600, ahora: dia(2026, 8, 1) });
  est = apuntarDia(est, 'portatil', { segundos: 900, ahora: dia(2026, 8, 1) });
  assert.deepEqual(mesesCombinados(est), { '2026-08': { s: 1500, p: 0 } });
});

// Al fusionar, cada aparato solo escribe su casilla y dentro de un mes el
// contador solo crece: gana el mayor, nunca se suman dos versiones del mismo.
test('fusionar meses del mismo aparato se queda con la cifra mayor', () => {
  const local = { a: { dias: {}, meses: { '2026-08': { s: 600, p: 0 } } } };
  const remoto = { a: { dias: {}, meses: { '2026-08': { s: 900, p: 0 } } } };
  assert.equal(fusionarEstadisticas(local, remoto).a.meses['2026-08'].s, 900);
});

// Un aparato al que ya se le podaron los días conserva sus meses, y traerlos
// no puede rehacerlos a partir de los días que hayan sobrevivido.
test('fusionar respeta los meses que llegan más atrás que los días', () => {
  const remoto = { a: { dias: {}, meses: { '2024-03': { s: 7200, p: 0 } } } };
  const fusion = fusionarEstadisticas({}, remoto);
  assert.equal(fusion.a.meses['2024-03'].s, 7200);
});

// Quien ya venía usando la aplicación tiene días pero ningún mes: se rehacen
// una vez a partir de lo que hay.
test('a quien no tenía meses se le reconstruyen desde sus días', () => {
  const viejo = { a: { dias: {
    '2026-07-01': { s: 600, p: 0 },
    '2026-07-15': { s: 300, p: 0 },
    '2026-08-01': { s: 120, p: 0 },
  } } };
  assert.deepEqual(mesesCombinados(viejo), { '2026-07': { s: 900, p: 0 }, '2026-08': { s: 120, p: 0 } });
});

// El caso que rompía las cuentas: quien lleva unos días leyendo empieza a
// mitad de mes sin que se le haya podado nada, y su primer mes se descartaba
// entero. El total por meses no cuadraba con el de por semanas.
test('un historial que empieza a mitad de mes cuenta ese mes entero', () => {
  const recien = { a: { dias: {
    '2026-07-28': { s: 3600, p: 0 },
    '2026-07-31': { s: 3600, p: 0 },
    '2026-08-01': { s: 4560, p: 0 },
  } } };
  assert.deepEqual(mesesCombinados(recien),
    { '2026-07': { s: 7200, p: 0 }, '2026-08': { s: 4560, p: 0 } });
});

// El contador mensual manda mientras diga más que los días: un mes cortado por
// la poda ya solo conserva un trozo de sus días, y rehacerlo con ellos lo
// dejaría por debajo de lo que de verdad se leyó.
test('los días no rebajan un mes que ya contaba más', () => {
  const podado = { a: {
    dias: { '2025-06-27': { s: 600, p: 0 } },
    meses: { '2025-06': { s: 36000, p: 0 } },
  } };
  assert.deepEqual(mesesCombinados(podado), { '2025-06': { s: 36000, p: 0 } });
});

// Y al revés: un mes que se quedó corto se repara solo con lo que se sabe de
// sus días, sin esperar a que nadie lo arregle a mano.
test('un mes que se quedó corto se completa con sus días', () => {
  const corto = { a: {
    dias: { '2026-07-28': { s: 3600, p: 2 }, '2026-07-31': { s: 3600, p: 3 } },
    meses: { '2026-07': { s: 1200, p: 1 } },
  } };
  assert.deepEqual(mesesCombinados(corto), { '2026-07': { s: 7200, p: 5 } });
});

// ───────────── Libros borrados de la biblioteca ─────────────

test('lo leído de un libro borrado se aparta y sigue en la lista', () => {
  const entrada = {
    tiempos: { movil: { s: 3600, p: 40 } },
    titulo: 'Mi novela',
    posicionActualizada: '2026-05-01T10:00:00.000Z',
  };
  const leidos = apartarLibro(undefined, 'Novelas/mia.epub', entrada, dia(2026, 5, 20));
  assert.deepEqual(leidos['Novelas/mia.epub'].tiempos, { movil: { s: 3600, p: 40 } });

  const [libro] = librosLeidos({}, leidos);
  assert.equal(libro.id, 'Novelas/mia.epub');
  assert.equal(libro.segundos, 3600);
  assert.equal(libro.titulo, 'Mi novela');
  assert.equal(libro.ultimaLectura, '2026-05-01T10:00:00.000Z');
  assert.equal(libro.formato, 'epub');
  assert.ok(libro.borrado);
});

test('un libro que se borró sin leerse no deja resto', () => {
  assert.deepEqual(apartarLibro(undefined, 'ojeado.pdf', { pagina: 3 }), {});
  assert.equal(restoDeLibro({ tiempos: {} }), null);
});

// El caso de volver a añadir un libro borrado: los dos totales son el mismo
// rato leído contado dos veces, no dos ratos distintos.
test('un libro repuesto no cuenta su tiempo dos veces', () => {
  const leidos = { 'novela.epub': {
    tiempos: { movil: { s: 3600, p: 0 } }, borrado: '2026-05-20T10:00:00.000Z',
  } };
  const libros = { 'novela.epub': { tiempos: { movil: { s: 4200, p: 0 } } } };
  const [libro] = librosLeidos(libros, leidos);
  assert.equal(libro.segundos, 4200);
  // Y como el libro está, no se anuncia como borrado.
  assert.equal(libro.borrado, '');
  assert.equal(estadisticasDeLibro({ libros, leidos }, 'novela.epub').segundos, 4200);
});

test('la ficha de un libro borrado sigue enseñando su tiempo', () => {
  const ficha = estadisticasDeLibro({ leidos: { 'ida.pdf': {
    tiempos: { a: { s: 1800, p: 30 } }, borrado: '2026-05-20T10:00:00.000Z',
  } } }, 'ida.pdf');
  assert.equal(ficha.hay, true);
  assert.equal(ficha.segundos, 1800);
  assert.equal(ficha.ritmo, 60);
  assert.equal(ficha.borrado, '2026-05-20T10:00:00.000Z');
});

test('los restos se fusionan casilla a casilla, como los tiempos', () => {
  const mios = { 'ida.pdf': { tiempos: { movil: { s: 600, p: 2 } }, borrado: '2026-05-01T10:00:00.000Z' } };
  const suyos = {
    'ida.pdf': { tiempos: { movil: { s: 300, p: 1 }, portatil: { s: 900, p: 3 } }, borrado: '2026-05-10T10:00:00.000Z' },
    'otra.epub': { tiempos: { portatil: { s: 60, p: 0 } }, borrado: '2026-05-11T10:00:00.000Z' },
  };
  const fusionados = fusionarLeidos(mios, suyos);
  assert.deepEqual(fusionados['ida.pdf'].tiempos, { movil: { s: 600, p: 2 }, portatil: { s: 900, p: 3 } });
  assert.equal(fusionados['ida.pdf'].borrado, '2026-05-10T10:00:00.000Z');
  assert.ok(fusionados['otra.epub']);
});

test('un resto viejo se poda con el mismo plazo que los días', () => {
  const hoy = dia(2026, 5, 20);
  const viejo = claveDia(new Date(hoy - (DIAS_GUARDADOS + 5) * 86400000));
  const leidos = {
    'antigua.pdf': { tiempos: { a: { s: 600, p: 0 } }, borrado: `${viejo}T10:00:00.000Z` },
    'reciente.pdf': { tiempos: { a: { s: 600, p: 0 } }, borrado: '2026-05-19T10:00:00.000Z' },
  };
  assert.deepEqual(Object.keys(podarLeidos(leidos, hoy)), ['reciente.pdf']);
});
