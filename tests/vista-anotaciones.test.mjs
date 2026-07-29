import test from 'node:test';
import assert from 'node:assert/strict';

import {
  recortarNota, colorValido, colocarFlotante, ordenarAnotaciones,
  filtrarAnotaciones, destinoDeAnotacion, nombreDeArchivo, markdownDeAnotaciones,
  LARGO_NOTA,
} from '../js/vista-anotaciones.js';

const PALETA = ['amarillo', 'verde', 'azul', 'rosa'];

// ── Notas y colores ──

test('la nota se guarda sin espacios de sobra', () => {
  assert.equal(recortarNota('  una idea  '), 'una idea');
  assert.equal(recortarNota('   '), '');
  assert.equal(recortarNota(null), '');
});

test('una nota larguísima se recorta', () => {
  assert.equal(recortarNota('a'.repeat(9000)).length, LARGO_NOTA);
});

test('un color de la paleta se respeta', () => {
  assert.equal(colorValido('verde', PALETA), 'verde');
});

test('un color que no es de la paleta cae en el de siempre', () => {
  // Un ajuste viejo o un archivo sincronizado por otra versión.
  assert.equal(colorValido('turquesa', PALETA), 'amarillo');
  assert.equal(colorValido(null, PALETA), 'amarillo');
  assert.equal(colorValido(undefined, PALETA), 'amarillo');
});

// ── Ventanas flotantes ──

const VENTANA = { ancho: 1000, alto: 800 };
const medidas = { ancho: 200, alto: 100, ventana: VENTANA };

test('la nota emergente sale encima del subrayado', () => {
  const sitio = colocarFlotante({ ...medidas, ancla: { left: 300, right: 400, top: 500, bottom: 520 } });
  assert.equal(sitio.izquierda, 300);       // alineada con el principio del texto
  assert.equal(sitio.arriba, 500 - 100 - 8); // justo encima, con su margen
});

test('si arriba no cabe, la nota baja al otro lado del subrayado', () => {
  const sitio = colocarFlotante({ ...medidas, ancla: { left: 300, right: 400, top: 20, bottom: 40 } });
  assert.equal(sitio.arriba, 48);   // 40 + 8, por debajo
});

test('la nota no se sale por la derecha de la pantalla', () => {
  const sitio = colocarFlotante({ ...medidas, ancla: { left: 950, right: 990, top: 500, bottom: 520 } });
  assert.equal(sitio.izquierda, 1000 - 200 - 8);
});

test('la nota no se sale por la izquierda', () => {
  const sitio = colocarFlotante({ ...medidas, ancla: { left: -50, right: 10, top: 500, bottom: 520 } });
  assert.equal(sitio.izquierda, 8);
});

test('el menú de una nota cae debajo y alineado por la derecha', () => {
  const sitio = colocarFlotante({
    ...medidas, ancla: { left: 300, right: 400, top: 500, bottom: 520 },
    preferir: 'abajo', alinear: 'derecha', separacion: 6,
  });
  assert.equal(sitio.izquierda, 200);   // 400 - 200 de ancho
  assert.equal(sitio.arriba, 526);      // 520 + 6
});

test('si abajo no cabe, el menú sube por encima del subrayado', () => {
  const sitio = colocarFlotante({
    ...medidas, ancla: { left: 300, right: 400, top: 700, bottom: 780 },
    preferir: 'abajo', alinear: 'derecha', separacion: 6,
  });
  assert.equal(sitio.arriba, 700 - 100 - 6);
});

test('una ventana que no cabe por ningún lado se queda dentro de la pantalla', () => {
  // Pantalla muy baja: ni encima ni debajo hay hueco.
  const sitio = colocarFlotante({
    ancho: 200, alto: 300, ventana: { ancho: 1000, alto: 320 },
    ancla: { left: 100, right: 200, top: 150, bottom: 170 },
  });
  assert.ok(sitio.arriba >= 8, `se salió por arriba: ${sitio.arriba}`);
  assert.ok(sitio.arriba + 300 <= 320, `se salió por abajo: ${sitio.arriba}`);
});

// ── La lista ──

test('en PDF las anotaciones van en orden de página', () => {
  const lista = [
    { id: 'c', paginas: [{ pagina: 30 }] },
    { id: 'a', paginas: [{ pagina: 5 }] },
    { id: 'b', paginas: [{ pagina: 12 }] },
  ];
  assert.deepEqual(ordenarAnotaciones(lista).map((a) => a.id), ['a', 'b', 'c']);
});

test('en EPUB, sin páginas, mandan las fechas de creación', () => {
  const lista = [
    { id: 'tarde', cfi: 'x', creado: '2026-03-02T10:00:00Z' },
    { id: 'pronto', cfi: 'y', creado: '2026-01-05T10:00:00Z' },
  ];
  assert.deepEqual(ordenarAnotaciones(lista).map((a) => a.id), ['pronto', 'tarde']);
});

test('en la misma página desempata la fecha', () => {
  const lista = [
    { id: 'segunda', paginas: [{ pagina: 7 }], creado: '2026-03-02T10:00:00Z' },
    { id: 'primera', paginas: [{ pagina: 7 }], creado: '2026-01-05T10:00:00Z' },
  ];
  assert.deepEqual(ordenarAnotaciones(lista).map((a) => a.id), ['primera', 'segunda']);
});

test('ordenar no toca la lista de partida', () => {
  const original = [{ id: 'b', paginas: [{ pagina: 9 }] }, { id: 'a', paginas: [{ pagina: 1 }] }];
  ordenarAnotaciones(original);
  assert.equal(original[0].id, 'b');
});

const sencillo = (texto) => texto.toLowerCase();

test('sin nada escrito se ven todas', () => {
  const lista = [{ texto: 'uno' }, { texto: 'dos' }];
  assert.equal(filtrarAnotaciones(lista, '', sencillo).length, 2);
});

test('la búsqueda mira el pasaje y la nota', () => {
  const lista = [
    { id: 'en el texto', texto: 'la vida del Lazarillo', nota: '' },
    { id: 'en la nota', texto: 'otra cosa', nota: 'sobre el Lazarillo' },
    { id: 'ni una cosa ni otra', texto: 'nada', nota: 'nada' },
  ];
  const encontradas = filtrarAnotaciones(lista, 'lazarillo', sencillo);
  assert.deepEqual(encontradas.map((a) => a.id), ['en el texto', 'en la nota']);
});

test('una anotación sin nota no rompe la búsqueda', () => {
  const lista = [{ texto: 'algo' }];
  assert.equal(filtrarAnotaciones(lista, 'algo', sencillo).length, 1);
});

test('el destino es el CFI en EPUB y la página en PDF', () => {
  assert.equal(destinoDeAnotacion({ cfi: 'epubcfi(/6/4)' }), 'epubcfi(/6/4)');
  assert.equal(destinoDeAnotacion({ paginas: [{ pagina: 12 }] }), 12);
  assert.equal(destinoDeAnotacion({}), undefined);
});

// ── Exportación ──

test('el nombre del archivo pierde lo que ningún sistema admite', () => {
  assert.equal(nombreDeArchivo('El Lazarillo: vida y/o obra', 'anotaciones'),
    'El Lazarillo vida y o obra - anotaciones.md');
});

test('un título que se queda en nada tiene su respaldo', () => {
  assert.equal(nombreDeArchivo('///', 'anotaciones'), 'libro - anotaciones.md');
  assert.equal(nombreDeArchivo('', 'anotaciones'), 'libro - anotaciones.md');
});

const TEXTOS = {
  cabecera: 'Anotaciones de El Lazarillo',
  origen: 'PageKeeper · 29 de julio de 2026',
  notaDelLibro: 'Nota del libro',
  nota: 'Nota',
};

test('el archivo exportado lleva cabecera y origen', () => {
  const md = markdownDeAnotaciones({ anotaciones: [], textos: TEXTOS });
  assert.match(md, /^# Anotaciones de El Lazarillo\n/);
  assert.match(md, /PageKeeper · 29 de julio de 2026/);
});

test('la nota del libro va primero y entera, antes de los subrayados', () => {
  const md = markdownDeAnotaciones({
    anotaciones: [{ texto: 'un pasaje' }],
    notaLibro: 'Lo leí en verano.',
    textos: TEXTOS,
  });
  assert.ok(md.indexOf('Lo leí en verano.') < md.indexOf('un pasaje'));
  assert.match(md, /## Nota del libro/);
});

test('sin nota del libro no aparece su epígrafe vacío', () => {
  const md = markdownDeAnotaciones({ anotaciones: [], textos: TEXTOS });
  assert.equal(md.includes('## Nota del libro'), false);
});

test('cada subrayado se cita, con su nota y su ubicación', () => {
  const md = markdownDeAnotaciones({
    anotaciones: [{ texto: 'un pasaje', nota: 'qué bueno' }],
    ubicacionDe: () => 'Página 12',
    textos: TEXTOS,
  });
  assert.match(md, /> un pasaje/);
  assert.match(md, /\*\*Nota:\*\* qué bueno/);
  assert.match(md, /\*Página 12\*/);
});

test('un pasaje de varias líneas se cita entero, línea a línea', () => {
  const md = markdownDeAnotaciones({
    anotaciones: [{ texto: 'primera\nsegunda\ntercera' }],
    textos: TEXTOS,
  });
  // Sin el «>» en cada una, Markdown rompería la cita a la segunda línea.
  assert.match(md, /> primera\n> segunda\n> tercera/);
});

test('una anotación sin nota no arrastra un epígrafe vacío', () => {
  const md = markdownDeAnotaciones({ anotaciones: [{ texto: 'solo el pasaje' }], textos: TEXTOS });
  assert.equal(md.includes('**Nota:**'), false);
});

test('sin ubicación conocida no se inventa ninguna', () => {
  const md = markdownDeAnotaciones({
    anotaciones: [{ texto: 'un pasaje' }], ubicacionDe: () => '', textos: TEXTOS,
  });
  assert.equal(md.includes('**'), false);
});

test('cada anotación va separada de la anterior', () => {
  const md = markdownDeAnotaciones({
    anotaciones: [{ texto: 'uno' }, { texto: 'dos' }, { texto: 'tres' }],
    textos: TEXTOS,
  });
  assert.equal(md.split('---').length - 1, 3);
});
