import test from 'node:test';
import assert from 'node:assert/strict';

import { esLibro, librosElegidos, librosArrastrados, capturarArrastre } from '../js/archivos-entrantes.js';

const archivo = (nombre, ruta = '') => ({ name: nombre, webkitRelativePath: ruta });

// Entradas del sistema de archivos como las que da «webkitGetAsEntry».
const entradaArchivo = (nombre) => ({
  name: nombre,
  isFile: true,
  isDirectory: false,
  file: (cumplir) => cumplir({ name: nombre }),
});

// Los directorios entregan su contenido por lotes, como en Chrome.
const entradaCarpeta = (nombre, hijas, porLote = 100) => ({
  name: nombre,
  isFile: false,
  isDirectory: true,
  createReader() {
    let leidas = 0;
    return {
      readEntries(cumplir) {
        const lote = hijas.slice(leidas, leidas + porLote);
        leidas += lote.length;
        cumplir(lote);
      },
    };
  },
});

const resumen = (libros) => libros.map(({ archivo: a, carpeta }) => `${carpeta}|${a.name}`);

test('reconoce solo los PDF y EPUB', () => {
  assert.equal(esLibro('libro.pdf'), true);
  assert.equal(esLibro('libro.EPUB'), true);
  assert.equal(esLibro('libro.txt'), false);
  assert.equal(esLibro('epub'), false);
  assert.equal(esLibro(undefined), false);
});

test('los archivos sueltos elegidos se quedan sin carpeta', () => {
  const libros = librosElegidos([archivo('a.pdf'), archivo('notas.txt'), archivo('b.epub')]);
  assert.deepEqual(resumen(libros), ['|a.pdf', '|b.epub']);
});

test('una carpeta elegida conserva su estructura', () => {
  const libros = librosElegidos([
    archivo('negra.pdf', 'Novela/Negra/negra.pdf'),
    archivo('portada.jpg', 'Novela/portada.jpg'),
    archivo('suelto.epub', 'Novela/suelto.epub'),
  ]);
  assert.deepEqual(resumen(libros), ['Novela|suelto.epub', 'Novela/Negra|negra.pdf']);
});

test('descarta lo que cuelga de carpetas ocultas', () => {
  const libros = librosElegidos([
    archivo('bueno.pdf', 'Novela/bueno.pdf'),
    archivo('malo.pdf', 'Novela/.oculta/malo.pdf'),
  ]);
  assert.deepEqual(resumen(libros), ['Novela|bueno.pdf']);
});

test('recorre las carpetas arrastradas, incluidas las subcarpetas', async () => {
  const libros = await librosArrastrados([
    entradaCarpeta('Novela', [
      entradaArchivo('uno.pdf'),
      entradaArchivo('leeme.txt'),
      entradaCarpeta('Negra', [entradaArchivo('dos.epub')]),
      entradaCarpeta('.git', [entradaArchivo('tres.pdf')]),
    ]),
    { name: 'suelto.pdf' },
  ]);
  assert.deepEqual(resumen(libros), ['|suelto.pdf', 'Novela|uno.pdf', 'Novela/Negra|dos.epub']);
});

test('lee las carpetas grandes por lotes hasta el final', async () => {
  const muchos = Array.from({ length: 250 }, (_, i) => entradaArchivo(`libro-${String(i).padStart(3, '0')}.pdf`));
  const libros = await librosArrastrados([entradaCarpeta('Muchos', muchos)]);
  assert.equal(libros.length, 250);
  assert.equal(libros[0].carpeta, 'Muchos');
});

test('no baja indefinidamente por carpetas anidadas', async () => {
  const circular = { name: 'bucle', isFile: false, isDirectory: true };
  circular.createReader = () => {
    let leidas = 0;
    return {
      readEntries(cumplir) {
        cumplir(leidas++ ? [] : [entradaArchivo('libro.pdf'), circular]);
      },
    };
  };
  const libros = await librosArrastrados([circular]);
  assert.equal(libros.length, 8);
});

test('una carpeta ilegible no impide traer el resto', async () => {
  const rota = {
    name: 'Rota',
    isFile: false,
    isDirectory: true,
    createReader: () => ({ readEntries: (_, fallar) => fallar(new Error('sin permiso')) }),
  };
  const libros = await librosArrastrados([rota, entradaCarpeta('Bien', [entradaArchivo('a.pdf')])]);
  assert.deepEqual(resumen(libros), ['Bien|a.pdf']);
});

test('captura las entradas del arrastre y, si no las hay, los archivos', () => {
  const entrada = entradaCarpeta('Novela', []);
  assert.deepEqual(
    capturarArrastre({ items: [{ webkitGetAsEntry: () => entrada }], files: [] }),
    [entrada],
  );
  const suelto = { name: 'a.pdf' };
  assert.deepEqual(capturarArrastre({ items: [{}], files: [suelto] }), [suelto]);
  assert.deepEqual(capturarArrastre(undefined), []);
});
