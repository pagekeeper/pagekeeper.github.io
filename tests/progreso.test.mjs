import test from 'node:test';
import assert from 'node:assert/strict';

import {
  anotarPagina,
  ausentes,
  conciliarLocales,
  conciliarPresencia,
  diasDeGracia,
  DIAS_GRACIA_AUSENCIA,
  guardarDiasDeGracia,
  guardarMarcadores,
  guardarNota,
  fusionarEntradas,
  guardarTitulo,
  librosRecientes,
  marcarTerminado,
  progresoDe,
  renombrarPorPrefijo,
  sincronizar,
  tituloDe,
  ultimoLibroLeido,
} from '../js/progreso.js';

function conAlmacenamiento() {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node test' }, configurable: true,
  });
}

function entrada({ pagina, posicionActualizada, marcadores = [], actualizado = posicionActualizada }) {
  return {
    pagina,
    paginas: 100,
    posicionActualizada,
    marcadoresActualizados: actualizado,
    marcadoresVersion: 2,
    marcadores,
    actualizado,
  };
}

test('elige como lectura actual el libro cuya posición cambió más recientemente', () => {
  const resultado = ultimoLibroLeido({ libros: {
    'anterior.pdf': entrada({ pagina: 80, posicionActualizada: '2026-01-02T10:00:00.000Z' }),
    'actual.epub': entrada({ pagina: 25, posicionActualizada: '2026-01-03T10:00:00.000Z' }),
  } });
  assert.equal(resultado.id, 'actual.epub');
});

test('devuelve los tres libros recientes en orden de lectura', () => {
  const libros = Object.fromEntries([1, 4, 2, 3].map((dia) => [
    `libro-${dia}.pdf`,
    entrada({ pagina: dia, posicionActualizada: `2026-01-0${dia}T10:00:00.000Z` }),
  ]));
  assert.deepEqual(
    librosRecientes(3, { libros }).map((libro) => libro.id),
    ['libro-4.pdf', 'libro-3.pdf', 'libro-2.pdf'],
  );
});

test('permite marcar y desmarcar manualmente un libro como terminado', () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node test' }, configurable: true,
  });
  marcarTerminado('libro.pdf', true);
  assert.equal(progresoDe('libro.pdf').terminado, true);
  marcarTerminado('libro.pdf', false);
  assert.equal(progresoDe('libro.pdf').terminado, false);
});

test('guarda y borra el nombre visible del libro', () => {
  conAlmacenamiento();
  guardarTitulo('libro.pdf', '  Mi novela favorita  ');
  assert.equal(tituloDe('libro.pdf'), 'Mi novela favorita');
  guardarTitulo('libro.pdf', '');
  assert.equal(tituloDe('libro.pdf'), null);
});

test('un libro solo con nombre personalizado no aparece en «Continuar leyendo»', () => {
  conAlmacenamiento();
  guardarTitulo('nunca-abierto.pdf', 'Nombre a mano');
  assert.deepEqual(librosRecientes(Infinity).map((libro) => libro.id), []);
});

test('el nombre personalizado gana el más reciente sin tocar la posición', () => {
  const local = entrada({ pagina: 20, posicionActualizada: '2026-01-03T10:00:00.000Z' });
  local.titulo = 'Nombre viejo';
  local.tituloActualizado = '2026-01-01T10:00:00.000Z';
  const remoto = entrada({ pagina: 10, posicionActualizada: '2026-01-02T10:00:00.000Z' });
  remoto.titulo = 'Nombre nuevo';
  remoto.tituloActualizado = '2026-01-04T10:00:00.000Z';
  const resultado = fusionarEntradas(local, remoto);
  assert.equal(resultado.pagina, 20);
  assert.equal(resultado.titulo, 'Nombre nuevo');
});

test('borrar el nombre en un dispositivo se propaga al fusionar', () => {
  const local = entrada({ pagina: 5, posicionActualizada: '2026-01-05T10:00:00.000Z' });
  local.tituloActualizado = '2026-01-05T10:00:00.000Z'; // borrado más reciente, sin titulo
  const remoto = entrada({ pagina: 5, posicionActualizada: '2026-01-02T10:00:00.000Z' });
  remoto.titulo = 'Nombre antiguo';
  remoto.tituloActualizado = '2026-01-02T10:00:00.000Z';
  const resultado = fusionarEntradas(local, remoto);
  assert.equal(resultado.titulo, undefined);
});

test('fusiona el estado terminado sin alterar la posición de lectura', () => {
  const local = entrada({ pagina: 20, posicionActualizada: '2026-01-03T10:00:00.000Z' });
  local.terminado = false;
  local.terminadoActualizado = '2026-01-01T10:00:00.000Z';
  const remoto = entrada({ pagina: 10, posicionActualizada: '2026-01-02T10:00:00.000Z' });
  remoto.terminado = true;
  remoto.terminadoActualizado = '2026-01-04T10:00:00.000Z';
  const resultado = fusionarEntradas(local, remoto);
  assert.equal(resultado.pagina, 20);
  assert.equal(resultado.terminado, true);
});

test('editar un marcador no desplaza al libro leído más recientemente', () => {
  const resultado = ultimoLibroLeido({ libros: {
    'marcador-editado.pdf': entrada({
      pagina: 10,
      posicionActualizada: '2026-01-01T10:00:00.000Z',
      actualizado: '2026-02-01T10:00:00.000Z',
    }),
    'lectura-actual.pdf': entrada({
      pagina: 40,
      posicionActualizada: '2026-01-05T10:00:00.000Z',
    }),
  } });
  assert.equal(resultado.id, 'lectura-actual.pdf');
});

test('editar un marcador desde una posición antigua no hace retroceder la lectura', () => {
  const local = entrada({
    pagina: 20,
    posicionActualizada: '2026-01-01T10:00:00.000Z',
    actualizado: '2026-01-03T10:00:00.000Z',
    marcadores: [{ id: 'm1', pagina: 20, nombre: 'Tema', actualizado: '2026-01-03T10:00:00.000Z' }],
  });
  const remoto = entrada({
    pagina: 80,
    posicionActualizada: '2026-01-02T10:00:00.000Z',
    marcadores: [{ id: 'm1', pagina: 20, actualizado: '2026-01-01T10:00:00.000Z' }],
  });

  const resultado = fusionarEntradas(local, remoto, { marcadores: { m1: 'pendiente' } });
  assert.equal(resultado.pagina, 80);
  assert.equal(resultado.marcadores.find((marcador) => marcador.id === 'm1').nombre, 'Tema');
});

test('conserva marcadores añadidos simultáneamente en dos dispositivos', () => {
  const local = entrada({
    pagina: 10,
    posicionActualizada: '2026-01-01T10:00:00.000Z',
    marcadores: [{ id: 'local', pagina: 10, actualizado: '2026-01-02T10:00:00.000Z' }],
  });
  const remoto = entrada({
    pagina: 15,
    posicionActualizada: '2026-01-01T11:00:00.000Z',
    marcadores: [{ id: 'remoto', pagina: 15, actualizado: '2026-01-02T11:00:00.000Z' }],
  });

  const resultado = fusionarEntradas(local, remoto);
  assert.deepEqual(new Set(resultado.marcadores.map((marcador) => marcador.id)), new Set(['local', 'remoto']));
});

test('un borrado sincronizado no resucita por una copia antigua', () => {
  const local = entrada({
    pagina: 10,
    posicionActualizada: '2026-01-01T10:00:00.000Z',
    marcadores: [{ id: 'm1', borrado: true, actualizado: '2026-01-03T10:00:00.000Z' }],
  });
  const remoto = entrada({
    pagina: 10,
    posicionActualizada: '2026-01-01T10:00:00.000Z',
    marcadores: [{ id: 'm1', pagina: 10, actualizado: '2026-01-02T10:00:00.000Z' }],
  });

  const resultado = fusionarEntradas(local, remoto);
  assert.equal(resultado.marcadores.find((marcador) => marcador.id === 'm1').borrado, true);
});

test('una posición remota más reciente prevalece aunque haya un cambio local pendiente', () => {
  const local = entrada({ pagina: 25, posicionActualizada: '2026-01-01T10:00:00.000Z' });
  const remoto = entrada({ pagina: 90, posicionActualizada: '2099-01-01T10:00:00.000Z' });
  const resultado = fusionarEntradas(local, remoto, { posicion: 'pendiente' });
  assert.equal(resultado.pagina, 90);
  assert.equal(resultado.posicionActualizada, remoto.posicionActualizada);
});

test('relee y conserva el avance remoto al reintentar una escritura con conflicto', async () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node test' },
    configurable: true,
  });

  anotarPagina('libro.pdf', 25, 100);
  let remoto = { version: 2, libros: {
    'libro.pdf': entrada({ pagina: 80, posicionActualizada: '2000-01-01T10:00:00.000Z' }),
  } };
  let lecturas = 0;
  let escrituras = 0;
  const cliente = {
    base: 'https://nube.test/libros',
    async leerProgreso() {
      lecturas++;
      const copia = structuredClone(remoto);
      Object.defineProperty(copia, '_etag', { value: `"v${lecturas}"`, enumerable: false });
      return copia;
    },
    async escribirProgreso(datos) {
      escrituras++;
      if (escrituras === 1) {
        remoto.libros['libro.pdf'] = entrada({
          pagina: 90,
          posicionActualizada: '2000-02-01T10:00:00.000Z',
        });
        const error = new Error('conflicto');
        error.conflictoSincronizacion = true;
        throw error;
      }
      remoto = structuredClone(datos);
    },
  };

  const resultado = await sincronizar(cliente);
  assert.equal(lecturas, 2);
  assert.equal(escrituras, 2);
  // Este dispositivo no había llegado a ver la posición remota. Al aparecer
  // durante el conflicto un avance mayor, se conserva para no borrarlo con
  // una lectura local que partió a ciegas desde una copia anterior.
  assert.equal(resultado.libros['libro.pdf'].pagina, 90);
  assert.equal(remoto.libros['libro.pdf'].pagina, 90);
});

test('al renombrar una carpeta lleva el progreso a las rutas nuevas y limpia las viejas', async () => {
  conAlmacenamiento();
  anotarPagina('Curso/tema.pdf', 12, 100);
  anotarPagina('Curso/Bloque/anexo.epub', 7, 100);
  anotarPagina('Otra/aparte.pdf', 3, 100);
  let remoto = { version: 2, libros: {} };
  const cliente = {
    base: 'https://nube.test/libros',
    async leerProgreso() { return structuredClone(remoto); },
    async escribirProgreso(datos) { remoto = structuredClone(datos); },
  };

  await renombrarPorPrefijo('Curso/', 'Temario/', cliente);

  assert.equal(progresoDe('Temario/tema.pdf').pagina, 12);
  assert.equal(progresoDe('Temario/Bloque/anexo.epub').pagina, 7);
  assert.equal(progresoDe('Curso/tema.pdf'), null);
  assert.equal(progresoDe('Otra/aparte.pdf').pagina, 3);
  assert.deepEqual(Object.keys(remoto.libros).sort(), [
    'Otra/aparte.pdf', 'Temario/Bloque/anexo.epub', 'Temario/tema.pdf',
  ]);
});

test('no sobrescribe una página cambiada mientras esperaba la respuesta remota', async () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  anotarPagina('otro.pdf', 5, 100);
  let guardado;
  const cliente = {
    base: 'https://nube.test/libros',
    async leerProgreso() {
      await Promise.resolve();
      anotarPagina('otro.pdf', 40, 100);
      return { version: 2, libros: {
        'otro.pdf': entrada({ pagina: 10, posicionActualizada: '2026-01-01T10:00:00.000Z' }),
      } };
    },
    async escribirProgreso(datos) { guardado = structuredClone(datos); },
  };

  const resultado = await sincronizar(cliente);
  assert.equal(resultado.libros['otro.pdf'].pagina, 40);
  assert.equal(guardado.libros['otro.pdf'].pagina, 40);
});

// ── Limpieza de libros que ya no están en el servidor ──

function conNube(librosRemotos = {}) {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node test' }, configurable: true,
  });
  const nube = { version: 2, libros: structuredClone(librosRemotos) };
  const cliente = {
    base: 'https://nube.test/libros',
    async leerProgreso() { return structuredClone(nube); },
    async escribirProgreso(datos) {
      const copia = structuredClone(datos);
      nube.libros = copia.libros;
      if (copia.ajustes) nube.ajustes = copia.ajustes;
    },
  };
  return { cliente, nube };
}

function haceDias(dias) {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

test('apunta la ausencia de un libro pero no lo borra el primer día', async () => {
  const { cliente, nube } = conNube();
  anotarPagina('ido.pdf', 30, 100);
  const purgados = await conciliarPresencia(new Set(['sigue.pdf']), cliente);

  assert.deepEqual(purgados, []);
  assert.ok(progresoDe('ido.pdf').ausenteDesde);
  assert.ok(nube.libros['ido.pdf'].ausenteDesde, 'la marca viaja al archivo compartido');
});

test('borra la entrada de un libro que lleva más de un mes sin aparecer', async () => {
  const { cliente, nube } = conNube();
  anotarPagina('ido.pdf', 30, 100);
  anotarPagina('sigue.pdf', 10, 100);
  const datos = JSON.parse(localStorage.getItem('lector.progreso'));
  datos.libros['ido.pdf'].ausenteDesde = haceDias(DIAS_GRACIA_AUSENCIA + 1);
  localStorage.setItem('lector.progreso', JSON.stringify(datos));

  const purgados = await conciliarPresencia(new Set(['sigue.pdf']), cliente);

  assert.deepEqual(purgados, ['ido.pdf']);
  assert.ok(!progresoDe('ido.pdf'));
  assert.deepEqual(Object.keys(nube.libros), ['sigue.pdf']);
});

test('ver el libro otra vez retira la marca de ausencia', async () => {
  const { cliente } = conNube();
  anotarPagina('vuelve.pdf', 30, 100);
  await conciliarPresencia(new Set(), cliente);
  assert.ok(progresoDe('vuelve.pdf').ausenteDesde);

  await conciliarPresencia(new Set(['vuelve.pdf']), cliente);
  assert.equal(progresoDe('vuelve.pdf').ausenteDesde, undefined);
});

test('una entrada sin opinión sobre la presencia no borra la ausencia apuntada', () => {
  // La mayoría de dispositivos no recorren el servidor: que no traigan marca
  // no significa que hayan visto el libro.
  const ausente = { ...entrada({ pagina: 5, posicionActualizada: '2026-01-01T10:00:00.000Z' }),
    ausenteDesde: '2026-01-02T10:00:00.000Z' };
  const callado = entrada({ pagina: 5, posicionActualizada: '2026-01-03T10:00:00.000Z' });

  assert.equal(fusionarEntradas(ausente, callado).ausenteDesde, '2026-01-02T10:00:00.000Z');
  assert.equal(fusionarEntradas(callado, ausente).ausenteDesde, '2026-01-02T10:00:00.000Z');
});

test('con los dos dispositivos echándolo en falta, el plazo corre desde el primero', () => {
  const base = entrada({ pagina: 5, posicionActualizada: '2026-01-01T10:00:00.000Z' });
  const pronto = { ...base, ausenteDesde: '2026-01-02T10:00:00.000Z' };
  const tarde = { ...base, ausenteDesde: '2026-01-20T10:00:00.000Z' };

  assert.equal(fusionarEntradas(pronto, tarde).ausenteDesde, '2026-01-02T10:00:00.000Z');
});

test('las tildes escritas en otra forma Unicode no cuentan como ausencia', async () => {
  const { cliente } = conNube();
  anotarPagina('Educación/tema.pdf'.normalize('NFC'), 12, 100);

  await conciliarPresencia(new Set(['Educación/tema.pdf'.normalize('NFD')]), cliente);

  assert.equal(progresoDe('Educación/tema.pdf'.normalize('NFC')).ausenteDesde, undefined);
});

test('no guarda entradas que no recuerdan nada', async () => {
  const { cliente, nube } = conNube();
  anotarPagina('vacio.pdf', 0, 100);
  anotarPagina('leido.pdf', 4, 100);

  const resultado = await sincronizar(cliente);

  assert.deepEqual(Object.keys(resultado.libros), ['leido.pdf']);
  assert.deepEqual(Object.keys(nube.libros), ['leido.pdf']);
});

test('conserva una entrada sin posición si guarda marcadores, nota o título', async () => {
  const { cliente, nube } = conNube();
  anotarPagina('con-nota.pdf', 0, 100);
  guardarNota('con-nota.pdf', 'Para el club de lectura');
  anotarPagina('con-marcador.epub', 0, 100);
  guardarMarcadores('con-marcador.epub', [{ cfi: 'epubcfi(/6/2!/4/1:0)', nombre: 'Inicio' }]);

  await sincronizar(cliente);

  assert.deepEqual(Object.keys(nube.libros).sort(), ['con-marcador.epub', 'con-nota.pdf']);
});

test('la marca de ausencia sobrevive a la sincronización con el archivo compartido', async () => {
  const { cliente, nube } = conNube();
  anotarPagina('ido.pdf', 30, 100);
  await sincronizar(cliente); // el servidor ya tiene la entrada, sin marca

  await conciliarPresencia(new Set(), cliente);

  assert.ok(progresoDe('ido.pdf').ausenteDesde, 'la marca no puede perderse al fusionar');
  assert.ok(nube.libros['ido.pdf'].ausenteDesde);
});

test('un avistamiento posterior de otro dispositivo tumba la ausencia apuntada', () => {
  const base = entrada({ pagina: 5, posicionActualizada: '2026-01-01T10:00:00.000Z' });
  const ausente = { ...base, ausenteDesde: '2026-02-01T10:00:00.000Z' };
  const visto = { ...base, presenteHasta: '2026-02-05T10:00:00.000Z' };

  assert.equal(fusionarEntradas(ausente, visto).ausenteDesde, undefined);
  // Pero un avistamiento anterior no dice nada de lo que pasó después.
  const vistoAntes = { ...base, presenteHasta: '2026-01-15T10:00:00.000Z' };
  assert.equal(fusionarEntradas(ausente, vistoAntes).ausenteDesde, '2026-02-01T10:00:00.000Z');
});

// ── Plazo de borrado y limpieza local ──

test('el plazo de borrado se comparte con los demás dispositivos', async () => {
  const { cliente, nube } = conNube();
  anotarPagina('libro.pdf', 3, 100);
  assert.equal(diasDeGracia(), 30); // el de fábrica

  guardarDiasDeGracia(7);
  await sincronizar(cliente);

  assert.equal(diasDeGracia(), 7);
  assert.equal(nube.ajustes.diasGracia, 7, 'viaja en el archivo compartido');
});

test('entre dos plazos gana el último elegido, venga de donde venga', async () => {
  const { cliente, nube } = conNube();
  nube.ajustes = { diasGracia: 90, ajustesActualizados: '2026-03-01T10:00:00.000Z' };
  anotarPagina('libro.pdf', 3, 100);
  guardarDiasDeGracia(15); // ahora mismo: más reciente que el del servidor

  await sincronizar(cliente);
  assert.equal(diasDeGracia(), 15);
  assert.equal(nube.ajustes.diasGracia, 15);
});

test('respeta el plazo elegido al decidir si toca borrar', async () => {
  const { cliente } = conNube();
  anotarPagina('ido.pdf', 30, 100);
  guardarDiasDeGracia(7);
  const datos = JSON.parse(localStorage.getItem('lector.progreso'));
  datos.libros['ido.pdf'].ausenteDesde = haceDias(10);
  localStorage.setItem('lector.progreso', JSON.stringify(datos));

  const purgados = await conciliarPresencia(new Set(), cliente);
  assert.deepEqual(purgados, ['ido.pdf'], 'con 7 días de plazo, 10 de ausencia bastan');
});

test('con «no borrar nunca» la ausencia se apunta pero nada se borra', async () => {
  const { cliente } = conNube();
  anotarPagina('ido.pdf', 30, 100);
  guardarDiasDeGracia(0);
  const datos = JSON.parse(localStorage.getItem('lector.progreso'));
  datos.libros['ido.pdf'].ausenteDesde = haceDias(400);
  localStorage.setItem('lector.progreso', JSON.stringify(datos));

  const purgados = await conciliarPresencia(new Set(), cliente);
  assert.deepEqual(purgados, []);
  assert.ok(progresoDe('ido.pdf'));
  assert.equal(ausentes()[0].borradoEl, null, 'el informe no promete ninguna fecha');
});

test('el borrado inmediato no espera al plazo', async () => {
  const { cliente } = conNube();
  anotarPagina('ido.pdf', 30, 100);
  await conciliarPresencia(new Set(), cliente); // solo lo marca
  assert.ok(progresoDe('ido.pdf'));

  const purgados = await conciliarPresencia(new Set(), cliente, { ahora: true });
  assert.deepEqual(purgados, ['ido.pdf']);
});

test('el informe dice qué falta y qué día caerá', () => {
  conNube();
  anotarPagina('ido.pdf', 30, 100);
  guardarDiasDeGracia(30);
  const datos = JSON.parse(localStorage.getItem('lector.progreso'));
  datos.libros['ido.pdf'].ausenteDesde = '2026-03-01T10:00:00.000Z';
  localStorage.setItem('lector.progreso', JSON.stringify(datos));

  const [aviso] = ausentes();
  assert.equal(aviso.id, 'ido.pdf');
  assert.equal(aviso.borradoEl.slice(0, 10), '2026-03-31');
});

test('los libros locales que ya no están se limpian al momento', () => {
  conNube();
  anotarPagina('local:borrado.epub:100', 5, 100);
  anotarPagina('local:sigue.epub:200', 8, 100);
  anotarPagina('nube.epub', 8, 100);

  const purgados = conciliarLocales(['local:sigue.epub:200']);

  assert.deepEqual(purgados, ['local:borrado.epub:100']);
  assert.ok(progresoDe('local:sigue.epub:200'));
  assert.ok(progresoDe('nube.epub'), 'los de la nube no se tocan aquí');
});

test('sin poder mirar la base local no se borra nada', () => {
  conNube();
  anotarPagina('local:libro.epub:100', 5, 100);

  assert.deepEqual(conciliarLocales([], false), []);
  assert.ok(progresoDe('local:libro.epub:100'));
});
