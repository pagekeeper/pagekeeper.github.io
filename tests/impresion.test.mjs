import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TAMANOS, MARGENES, LETRAS, RELLENOS_PAPEL, LIMITES,
  rutaSinAncla, titulosDelIndice, capitulosImprimibles,
  anotacionesPorCapitulo, rellenoDePapel, hojaDeImpresion,
  tituloDelDocumento, resumenSeleccion, opcionValida,
  numeroEnRango, medidasDelPapel, medidaDelMargen, medidaDeLaLetra,
} from '../js/impresion.js';

const numerar = (numero) => `Capítulo ${numero}`;

// ── Qué capítulos hay ──

test('la ruta del índice pierde el ancla y el «./» de delante', () => {
  assert.equal(rutaSinAncla('./texto/cap3.xhtml#seccion2'), 'texto/cap3.xhtml');
  assert.equal(rutaSinAncla(undefined), '');
});

test('el índice se aplana y cada archivo se queda con su primer título', () => {
  const titulos = titulosDelIndice([
    { href: 'c1.xhtml', label: '  Primero\n', subitems: [{ href: 'c1.xhtml#b', label: 'Un apartado' }] },
    { href: 'c2.xhtml', label: 'Segundo' },
  ]);
  assert.deepEqual(titulos.slice(0, 2), [
    { ruta: 'c1.xhtml', titulo: 'Primero' },
    { ruta: 'c1.xhtml', titulo: 'Un apartado' },
  ]);
  assert.equal(titulos.at(-1).titulo, 'Segundo');
});

test('cada sección coge su título del índice', () => {
  const capitulos = capitulosImprimibles(
    [{ href: 'OEBPS/c1.xhtml', index: 0 }, { href: 'OEBPS/c2.xhtml', index: 1 }],
    [{ href: 'OEBPS/c2.xhtml', label: 'Segundo' }, { href: 'OEBPS/c1.xhtml', label: 'Primero' }],
    numerar,
  );
  assert.deepEqual(capitulos.map((c) => c.titulo), ['Primero', 'Segundo']);
});

test('el índice que escribe la ruta de otra manera se sigue reconociendo', () => {
  const capitulos = capitulosImprimibles(
    [{ href: 'OEBPS/text/c1.xhtml', index: 0 }],
    [{ href: '../text/c1.xhtml#inicio', label: 'Primero' }],
    numerar,
  );
  assert.equal(capitulos[0].titulo, 'Primero');
});

test('el capítulo que no está en el índice se numera', () => {
  const capitulos = capitulosImprimibles(
    [{ href: 'c1.xhtml', index: 0 }, { href: 'c2.xhtml', index: 1 }], [], numerar,
  );
  assert.deepEqual(capitulos.map((c) => c.titulo), ['Capítulo 1', 'Capítulo 2']);
});

test('las secciones no lineales se quedan fuera y no gastan número', () => {
  const capitulos = capitulosImprimibles([
    { href: 'cubierta.xhtml', index: 0, linear: 'no' },
    { href: 'c1.xhtml', index: 1 },
  ], [], numerar);
  assert.equal(capitulos.length, 1);
  assert.equal(capitulos[0].numero, 1);
  assert.equal(capitulos[0].indice, 1); // el de la lomera, que es el que abre la sección
});

// ── Las anotaciones ──

test('las anotaciones se agrupan por el capítulo donde caen', () => {
  const donde = (cfi) => ({ a: 'c1.xhtml', b: 'c1.xhtml', c: 'c2.xhtml' }[cfi] ?? null);
  const grupos = anotacionesPorCapitulo(
    [{ cfi: 'a' }, { cfi: 'c' }, { cfi: 'b' }], donde,
  );
  assert.equal(grupos.get('c1.xhtml').length, 2);
  assert.equal(grupos.get('c2.xhtml').length, 1);
});

test('una anotación sin sitio en el libro de hoy no se imprime', () => {
  const grupos = anotacionesPorCapitulo(
    [{ cfi: 'perdida' }, { texto: 'sin cfi' }], () => null,
  );
  assert.equal(grupos.size, 0);
});

test('el color del papel sale de la paleta, y las anotaciones viejas conservan el suyo', () => {
  assert.equal(rellenoDePapel({ color: 'verde' }), RELLENOS_PAPEL.verde);
  assert.equal(rellenoDePapel({}), RELLENOS_PAPEL.amarillo);
  assert.equal(rellenoDePapel({ nota: 'algo' }), RELLENOS_PAPEL.azul);
  assert.equal(rellenoDePapel({ color: 'turquesa' }), RELLENOS_PAPEL.amarillo);
});

// ── La hoja de estilo ──

test('la hoja lleva el tamaño, el margen y la letra elegidos', () => {
  const hoja = hojaDeImpresion({ tamano: 'carta', margen: 'ancho', letra: 'grande' });
  assert.match(hoja, /@page \{ size: 216mm 279mm; margin: 30mm; \}/);
  assert.match(hoja, /font-size: 13pt/);
});

test('una opción que no existe no rompe la hoja: se usa la de siempre', () => {
  const hoja = hojaDeImpresion({ tamano: 'pergamino', margen: null, letra: 'enorme' });
  assert.match(hoja, /size: 210mm 297mm; margin: 20mm/);
  assert.match(hoja, new RegExp(`font-size: ${LETRAS.normal}pt`));
});

test('sin decir nada, A4 con márgenes normales', () => {
  const hoja = hojaDeImpresion();
  assert.match(hoja, new RegExp(`size: ${TAMANOS.a4.ancho}mm ${TAMANOS.a4.alto}mm`));
  assert.match(hoja, new RegExp(`margin: ${MARGENES.normal}mm`));
});

// ── Medidas escritas a mano ──

test('un número escrito a mano se admite con coma decimal', () => {
  assert.equal(numeroEnRango('12,5', LIMITES.letra), 12.5);
  assert.equal(numeroEnRango('12.5', LIMITES.letra), 12.5);
  assert.equal(numeroEnRango(9, LIMITES.letra), 9);
});

test('lo que se pasa de los topes se recorta al más cercano', () => {
  assert.equal(numeroEnRango(400, LIMITES.letra), LIMITES.letra.maximo);
  assert.equal(numeroEnRango(-5, LIMITES.margen), LIMITES.margen.minimo);
});

test('lo que no es un número deja la medida de siempre', () => {
  assert.equal(numeroEnRango('', LIMITES.margen), LIMITES.margen.porDefecto);
  assert.equal(numeroEnRango('ancho', LIMITES.margen), LIMITES.margen.porDefecto);
  assert.equal(numeroEnRango(null, LIMITES.letra), LIMITES.letra.porDefecto);
  assert.equal(numeroEnRango(Infinity, LIMITES.letra), LIMITES.letra.porDefecto);
});

test('un papel a medida manda sobre los tamaños de la lista', () => {
  assert.deepEqual(
    medidasDelPapel({ tamano: 'personalizado', ancho: 148, alto: 210 }),
    { ancho: 148, alto: 210 },
  );
  // Y los de la lista no se dejan tocar por lo que haya escrito antes.
  assert.deepEqual(medidasDelPapel({ tamano: 'a4', ancho: 148, alto: 210 }), TAMANOS.a4);
});

test('el margen y la letra a medida también', () => {
  assert.equal(medidaDelMargen({ margen: 'personalizado', margenPersonal: '7,5' }), 7.5);
  assert.equal(medidaDelMargen({ margen: 'ancho', margenPersonal: 7.5 }), MARGENES.ancho);
  assert.equal(medidaDeLaLetra({ letra: 'personalizado', letraPersonal: 10.5 }), 10.5);
  assert.equal(medidaDeLaLetra({ letra: 'pequena', letraPersonal: 10.5 }), LETRAS.pequena);
});

test('un margen de cero es un margen, no un descuido', () => {
  assert.equal(medidaDelMargen({ margen: 'personalizado', margenPersonal: 0 }), 0);
});

test('la hoja recoge las medidas escritas a mano', () => {
  const hoja = hojaDeImpresion({
    tamano: 'personalizado', ancho: 148, alto: 210,
    margen: 'personalizado', margenPersonal: 8,
    letra: 'personalizado', letraPersonal: 10.5,
  });
  assert.match(hoja, /@page \{ size: 148mm 210mm; margin: 8mm; \}/);
  assert.match(hoja, /font-size: 10\.5pt/);
});

test('elegir «personalizado» sin escribir nada no rompe la hoja', () => {
  const hoja = hojaDeImpresion({ tamano: 'personalizado', margen: 'personalizado', letra: 'personalizado' });
  assert.match(hoja, /size: 210mm 297mm; margin: 20mm/);
  assert.match(hoja, /font-size: 11pt/);
});

test('los subrayados se piden en color: el navegador los quita al imprimir', () => {
  assert.match(hojaDeImpresion(), /print-color-adjust: exact/);
});

test('el primer capítulo no empieza con una hoja en blanco', () => {
  assert.match(hojaDeImpresion(), /\.pk-capitulo:first-of-type \{ break-before: auto; \}/);
});

test('opcionValida se queda con lo que existe', () => {
  assert.equal(opcionValida('carta', TAMANOS, 'a4'), 'carta');
  assert.equal(opcionValida('a3', TAMANOS, 'a4'), 'a4');
});

// ── El diálogo ──

test('el título del documento pierde lo que no admite un nombre de archivo', () => {
  assert.equal(tituloDelDocumento('El Lazarillo: vida y  hechos'), 'El Lazarillo vida y hechos');
  assert.equal(tituloDelDocumento('   ', 'libro'), 'libro');
});

test('el resumen dice cuántos capítulos van', () => {
  const textos = {
    ninguno: 'Ninguno',
    todos: 'Todo el libro',
    algunos: ({ elegidos, total }) => `${elegidos} de ${total}`,
  };
  assert.equal(resumenSeleccion(0, 10, textos), 'Ninguno');
  assert.equal(resumenSeleccion(10, 10, textos), 'Todo el libro');
  assert.equal(resumenSeleccion(3, 10, textos), '3 de 10');
});
