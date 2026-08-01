import test from 'node:test';
import assert from 'node:assert/strict';

import {
  duracionEnPalabras, fechaDeClave, alturaBarra, mayorDeLaSerie,
  totalesDeSerie, nombreVisibleDeId, librosParaLaLista, ordenLibrosValido,
  LIBROS_EN_LISTA, SEGUNDOS_MINIMOS_EN_LISTA, ORDENES_LIBROS,
} from '../js/vista-estadisticas.js';

// ── Tiempos en palabras ──

test('por debajo del minuto no se dan cifras', () => {
  assert.equal(duracionEnPalabras(0).clave, 'timeLessMinute');
  assert.equal(duracionEnPalabras(29).clave, 'timeLessMinute');
});

test('medio minuto largo ya redondea a un minuto', () => {
  assert.deepEqual(duracionEnPalabras(30), { clave: 'timeMinutes', valores: { m: 1 } });
});

test('los minutos se dicen en minutos hasta la hora', () => {
  assert.deepEqual(duracionEnPalabras(25 * 60), { clave: 'timeMinutes', valores: { m: 25 } });
  assert.deepEqual(duracionEnPalabras(59 * 60), { clave: 'timeMinutes', valores: { m: 59 } });
});

test('una hora redonda se dice «1 h», no «1 h 0 min»', () => {
  assert.deepEqual(duracionEnPalabras(3600), { clave: 'statsHours', valores: { h: 1 } });
  assert.deepEqual(duracionEnPalabras(4 * 3600), { clave: 'statsHours', valores: { h: 4 } });
});

test('las horas con minutos los llevan detrás', () => {
  assert.deepEqual(duracionEnPalabras(90 * 60), { clave: 'timeHoursMinutes', valores: { h: 1, m: 30 } });
});

test('los totales largos siguen contándose en horas', () => {
  assert.deepEqual(duracionEnPalabras(50 * 3600), { clave: 'statsHours', valores: { h: 50 } });
});

// ── Fechas ──

test('un día del registro es ese día del calendario, no el anterior', () => {
  // Con `new Date('2026-07-29')` el día se correría según el huso horario.
  const fecha = fechaDeClave('2026-07-29');
  assert.equal(fecha.getFullYear(), 2026);
  assert.equal(fecha.getMonth(), 6);   // julio
  assert.equal(fecha.getDate(), 29);
});

test('el primero de enero no se va al año anterior', () => {
  const fecha = fechaDeClave('2026-01-01');
  assert.equal(fecha.getFullYear(), 2026);
  assert.equal(fecha.getDate(), 1);
});

// ── Barras ──

test('el día que más se leyó llena la barra', () => {
  assert.equal(alturaBarra(600, 600), 100);
});

test('los demás días son proporcionales', () => {
  assert.equal(alturaBarra(300, 600), 50);
  assert.equal(alturaBarra(150, 600), 25);
});

test('un día en blanco deja una raya tenue, que es lo que hay que ver', () => {
  assert.equal(alturaBarra(0, 600), 2);
});

test('un rato mínimo tampoco desaparece del todo', () => {
  assert.equal(alturaBarra(1, 100000), 2);
});

test('sin ningún día leído todas las barras son la raya mínima', () => {
  assert.equal(alturaBarra(0, 0), 2);
});

test('el mayor de la serie es el día que más se leyó', () => {
  assert.equal(mayorDeLaSerie([{ segundos: 10 }, { segundos: 700 }, { segundos: 0 }]), 700);
  assert.equal(mayorDeLaSerie([]), 0);
  assert.equal(mayorDeLaSerie([{ segundos: 0 }, { segundos: 0 }]), 0);
});

test('el resumen cuenta los días leídos y el total', () => {
  const serie = [{ segundos: 600 }, { segundos: 0 }, { segundos: 300 }, { segundos: 0 }];
  assert.deepEqual(totalesDeSerie(serie), { diasLeidos: 2, segundos: 900 });
});

test('una serie entera en blanco no cuenta ningún día', () => {
  assert.deepEqual(totalesDeSerie([{ segundos: 0 }, { segundos: 0 }]),
    { diasLeidos: 0, segundos: 0 });
});

test('una serie vacía tampoco', () => {
  assert.deepEqual(totalesDeSerie([]), { diasLeidos: 0, segundos: 0 });
});

// ── Nombre de un libro ──

test('manda el título que le puso quien lee', () => {
  assert.equal(nombreVisibleDeId('Novelas/lazarillo.pdf', 'El Lazarillo'), 'El Lazarillo');
});

test('un libro de la nube se reconoce por el archivo, no por la ruta entera', () => {
  assert.equal(nombreVisibleDeId('Novelas/Clásicos/lazarillo.pdf'), 'lazarillo.pdf');
});

test('un libro del dispositivo enseña su nombre, sin el «local:»', () => {
  assert.equal(nombreVisibleDeId('local:lazarillo.pdf:1234'), 'lazarillo.pdf');
});

test('un nombre con dos puntos dentro se conserva entero', () => {
  assert.equal(nombreVisibleDeId('local:Lazarillo: vida y obra.pdf:1234'),
    'Lazarillo: vida y obra.pdf');
});

test('un id que no se deja descomponer se enseña tal cual', () => {
  assert.equal(nombreVisibleDeId('local:'), 'local:');
  assert.equal(nombreVisibleDeId('suelto.pdf'), 'suelto.pdf');
});


// ── Qué libros entran en «En qué se va el tiempo» ──

const libro = (id, segundos, ultimaLectura = '') => ({ id, segundos, ultimaLectura });

test('los libros de menos de cinco minutos no entran en la lista', () => {
  const libros = [libro('novela.epub', 7200), libro('ojeado.pdf', 120), libro('otro.pdf', 299)];
  assert.deepEqual(librosParaLaLista(libros).map((l) => l.id), ['novela.epub']);
  assert.equal(SEGUNDOS_MINIMOS_EN_LISTA, 300);
});

// «Más de cinco minutos»: los cinco justos se quedan fuera, como el resto de
// los libros que solo se abrieron para mirar de qué iban.
test('cinco minutos clavados todavía no cuentan', () => {
  assert.deepEqual(librosParaLaLista([libro('justo.pdf', 300)]), []);
  assert.deepEqual(librosParaLaLista([libro('justo.pdf', 301)]).map((l) => l.id), ['justo.pdf']);
});

test('la lista sigue teniendo su tope de libros', () => {
  const muchos = Array.from({ length: 20 }, (_, i) => libro(`libro-${i}.pdf`, 3600));
  assert.equal(librosParaLaLista(muchos).length, LIBROS_EN_LISTA);
});

test('sin libros que enseñar la lista sale vacía, no rota', () => {
  assert.deepEqual(librosParaLaLista([]), []);
  assert.deepEqual(librosParaLaLista(undefined), []);
});


// ── Cómo se ordena la lista ──

const CATALOGO = [
  libro('mucho.epub', 36000, '2026-05-01T10:00:00.000Z'),
  libro('ayer.pdf', 1200, '2026-08-01T10:00:00.000Z'),
  libro('medio.epub', 7200, '2026-07-01T10:00:00.000Z'),
];

test('de partida manda el tiempo, que es lo que pregunta la tarjeta', () => {
  assert.deepEqual(librosParaLaLista(CATALOGO).map((l) => l.id),
    ['mucho.epub', 'medio.epub', 'ayer.pdf']);
});

test('por última lectura salen primero los de estos días', () => {
  assert.deepEqual(librosParaLaLista(CATALOGO, { orden: 'reciente' }).map((l) => l.id),
    ['ayer.pdf', 'medio.epub', 'mucho.epub']);
});

test('por título se ordena por el nombre que se ve, no por el id', () => {
  const nombreDe = (l) => ({ 'mucho.epub': 'Zorro', 'ayer.pdf': 'Alba', 'medio.epub': 'Mar' }[l.id]);
  assert.deepEqual(librosParaLaLista(CATALOGO, { orden: 'titulo', nombreDe }).map((l) => l.id),
    ['ayer.pdf', 'medio.epub', 'mucho.epub']);
});

// Un libro sin fecha no se cuela entre los recientes: no se sabe cuándo se
// leyó, y ponerlo el primero sería inventárselo.
test('los libros sin fecha se van al final del orden por lectura', () => {
  const conHuerfano = [...CATALOGO, libro('sinfecha.pdf', 5000)];
  assert.equal(librosParaLaLista(conHuerfano, { orden: 'reciente' }).at(-1).id, 'sinfecha.pdf');
});

// Cortar antes de ordenar enseñaría los diez de más tiempo puestos por fecha.
test('el recorte se aplica después de ordenar', () => {
  const muchos = Array.from({ length: 15 }, (_, i) =>
    libro(`libro-${i}.pdf`, 3600 + i, `2026-01-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`));
  const recientes = librosParaLaLista(muchos, { orden: 'reciente' });
  assert.equal(recientes.length, LIBROS_EN_LISTA);
  assert.equal(recientes[0].id, 'libro-14.pdf'); // el último leído, aunque no sea el de más tiempo
});

test('un orden que no existe cae en el del tiempo', () => {
  assert.equal(ordenLibrosValido('inventado'), 'tiempo');
  assert.equal(ordenLibrosValido('reciente'), 'reciente');
  assert.deepEqual(ORDENES_LIBROS, ['tiempo', 'reciente', 'titulo']);
});
