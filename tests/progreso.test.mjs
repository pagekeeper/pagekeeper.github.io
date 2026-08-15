import test from 'node:test';
import assert from 'node:assert/strict';

import {
  anotarPagina,
  anotarTiempoLectura,
  borrarEstadisticas,
  apagarEstadisticas,
  estadisticasApagadas,
  fusionarSinEstadisticas,
  migrarEstadisticasAntiguas,
  acatarRevocacion,
  anotarDispositivo,
  ausentes,
  cargarLocal,
  conciliarLocales,
  conciliarPresencia,
  diasDeGracia,
  DIAS_GRACIA_AUSENCIA,
  dispositivos,
  guardarDiasDeGracia,
  guardarLocal,
  revocacionPendiente,
  revocarDispositivo,
  guardarMarcadores,
  guardarNota,
  guardarCalificacion,
  fusionarEntradas,
  guardarTitulo,
  librosRecientes,
  marcarTerminado,
  progresoDe,
  renombrarPorPrefijo,
  sincronizar,
  tituloDe,
  ultimoLibroLeido,
  olvidar,
  olvidarPorPrefijo,
} from '../js/progreso.js';
import { resumen } from '../js/estadisticas.js';

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

test('la calificación gana la más reciente y no arrastra la nota del otro', () => {
  const local = entrada({ pagina: 20, posicionActualizada: '2026-01-03T10:00:00.000Z' });
  local.calificacion = 3;
  local.calificacionActualizada = '2026-01-01T10:00:00.000Z';
  local.nota = 'Lo dejé a medias';
  local.notaActualizada = '2026-01-06T10:00:00.000Z';
  const remoto = entrada({ pagina: 10, posicionActualizada: '2026-01-02T10:00:00.000Z' });
  remoto.calificacion = 5;
  remoto.calificacionActualizada = '2026-01-04T10:00:00.000Z';
  remoto.nota = 'Nota vieja';
  remoto.notaActualizada = '2026-01-02T10:00:00.000Z';
  const resultado = fusionarEntradas(local, remoto);
  assert.equal(resultado.calificacion, 5);
  assert.equal(resultado.nota, 'Lo dejé a medias');
  assert.equal(resultado.pagina, 20);
});

test('quitar la calificación en un dispositivo se propaga al fusionar', () => {
  const local = entrada({ pagina: 5, posicionActualizada: '2026-01-05T10:00:00.000Z' });
  local.calificacionActualizada = '2026-01-05T10:00:00.000Z'; // borrado más reciente
  const remoto = entrada({ pagina: 5, posicionActualizada: '2026-01-02T10:00:00.000Z' });
  remoto.calificacion = 4;
  remoto.calificacionActualizada = '2026-01-02T10:00:00.000Z';
  assert.equal(fusionarEntradas(local, remoto).calificacion, undefined);
});

test('un libro que solo se calificó se guarda igualmente', async () => {
  const { cliente, nube } = conNube();
  anotarPagina('solo-calificado.pdf', 0, 100);
  guardarCalificacion('solo-calificado.pdf', 4);

  await sincronizar(cliente);

  assert.equal(nube.libros['solo-calificado.pdf'].calificacion, 4);
});

test('calificar no mete el libro en «Continuar leyendo»', () => {
  conAlmacenamiento();
  guardarCalificacion('nunca-abierto.pdf', 5);
  assert.deepEqual(librosRecientes(Infinity).map((libro) => libro.id), []);
});

// ── Quién movió la posición desde la última vez que se vieron ──

function conVisto(entrada, posicionVista) {
  return { ...entrada, visto: entrada.posicionActualizada, vistoPosicion: posicionVista };
}

test('un retroceso hecho en otro dispositivo se propaga', () => {
  // Aquí está lo que antes no funcionaba: la regla de «gana el más avanzado»
  // impedía para siempre volver atrás desde otro aparato.
  const local = conVisto(
    entrada({ pagina: 40, posicionActualizada: '2026-01-05T10:00:00.000Z' }), 'p40',
  );
  const remoto = entrada({ pagina: 20, posicionActualizada: '2026-01-06T10:00:00.000Z' });
  assert.equal(fusionarEntradas(local, remoto).pagina, 20);
});

test('el dispositivo quieto acepta lo que traiga el otro, aunque su reloj vaya adelantado', () => {
  // El local no se ha movido desde lo que vio (p10); el remoto sí, y encima
  // con una fecha anterior porque su reloj va atrasado.
  const local = conVisto(
    entrada({ pagina: 10, posicionActualizada: '2026-01-09T10:00:00.000Z' }), 'p10',
  );
  const remoto = entrada({ pagina: 55, posicionActualizada: '2026-01-02T10:00:00.000Z' });
  assert.equal(fusionarEntradas(local, remoto).pagina, 55);
});

test('lo leído aquí no lo borra un servidor que no se ha movido', () => {
  const local = conVisto(
    entrada({ pagina: 80, posicionActualizada: '2026-01-01T10:00:00.000Z' }), 'p30',
  );
  const remoto = entrada({ pagina: 30, posicionActualizada: '2026-01-09T10:00:00.000Z' });
  assert.equal(fusionarEntradas(local, remoto).pagina, 80);
});

test('si los dos se movieron sin verse, se conserva lo más avanzado', () => {
  const local = conVisto(
    entrada({ pagina: 70, posicionActualizada: '2026-01-01T10:00:00.000Z' }), 'p10',
  );
  const remoto = entrada({ pagina: 45, posicionActualizada: '2026-01-09T10:00:00.000Z' });
  assert.equal(fusionarEntradas(local, remoto).pagina, 70);
});

test('un porcentaje aproximado no decide un conflicto', () => {
  // El local dice 70 pero es el porcentaje del punto anterior, anotado antes
  // de que el libro estuviera repartido en localizaciones: no vale para decir
  // quién va más adelantado.
  const local = {
    ...conVisto(entrada({ pagina: 70, posicionActualizada: '2026-01-01T10:00:00.000Z' }), 'p10'),
    porcentajeAproximado: true,
  };
  const remoto = entrada({ pagina: 45, posicionActualizada: '2026-01-09T10:00:00.000Z' });
  assert.equal(fusionarEntradas(local, remoto).pagina, 45);
});

test('la marca de porcentaje aproximado no sobrevive a la anotación siguiente', () => {
  conAlmacenamiento();
  // Mientras el EPUB no está repartido en localizaciones se anota el
  // porcentaje del punto anterior, marcado como dudoso…
  anotarPagina('libro.epub', 12, 100, { cfi: 'epubcfi(/6/8!/4/2)', porcentajeAproximado: true });
  assert.equal(progresoDe('libro.epub').porcentajeAproximado, true);
  // …y en cuanto llega uno bueno la marca tiene que irse, o el porcentaje
  // seguiría sin valer para decidir un conflicto ni para enseñarlo.
  anotarPagina('libro.epub', 18.4, 100, { cfi: 'epubcfi(/6/8!/4/6)' });
  assert.equal('porcentajeAproximado' in progresoDe('libro.epub'), false);
});

test('sin memoria de lo visto, sigue mandando la fecha', () => {
  const local = entrada({ pagina: 10, posicionActualizada: '2026-01-09T10:00:00.000Z' });
  const remoto = entrada({ pagina: 55, posicionActualizada: '2026-01-02T10:00:00.000Z' });
  assert.equal(fusionarEntradas(local, remoto).pagina, 10);
});

test('la posición de un EPUB se compara por su CFI, no por el porcentaje', () => {
  const cfi = 'epubcfi(/6/18!/4/64/1:1541)';
  const local = conVisto(
    { ...entrada({ pagina: 24.4, posicionActualizada: '2026-01-05T10:00:00.000Z' }),
      cfi: 'epubcfi(/6/18!/4/54/1:245)' },
    'epubcfi(/6/18!/4/54/1:245)',
  );
  const remoto = {
    ...entrada({ pagina: 26.1, posicionActualizada: '2026-01-04T10:00:00.000Z' }), cfi,
  };
  assert.equal(fusionarEntradas(local, remoto).cfi, cfi);
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
      // Como un servidor de verdad: se queda exactamente lo que se sube.
      const copia = structuredClone(datos);
      for (const clave of Object.keys(nube)) if (!(clave in copia)) delete nube[clave];
      Object.assign(nube, copia);
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

// ── Dispositivos conectados ──

function conNavegador(uuid = 'aparato-1') {
  const { cliente, nube } = conNube();
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => uuid }, configurable: true,
  });
  return { cliente, nube };
}

test('cada dispositivo deja constancia de su paso al sincronizar', async () => {
  const { cliente, nube } = conNavegador('portatil');
  anotarPagina('libro.pdf', 3, 100);
  anotarDispositivo({ crear: true });

  await sincronizar(cliente);

  const [aparato] = dispositivos();
  assert.equal(aparato.id, 'portatil');
  assert.equal(aparato.esteMismo, true);
  assert.ok(aparato.ultimaVez);
  assert.ok(nube.dispositivos.portatil, 'el registro viaja al archivo compartido');
});

test('el registro no se reescribe en cada sincronización', async () => {
  const { cliente } = conNavegador('portatil');
  anotarPagina('libro.pdf', 3, 100);
  anotarDispositivo({ crear: true });
  await sincronizar(cliente);
  const primera = dispositivos()[0].ultimaVez;

  await sincronizar(cliente);
  assert.equal(dispositivos()[0].ultimaVez, primera);
});

test('desconectar un dispositivo deja la orden escrita hasta que se abra', async () => {
  const { cliente, nube } = conNavegador('portatil');
  anotarPagina('libro.pdf', 3, 100);
  anotarDispositivo({ crear: true });
  await sincronizar(cliente);
  // Otro aparato, que solo conocemos por el archivo compartido.
  nube.dispositivos = {
    ...nube.dispositivos,
    movil: { sistema: 'Android', alta: haceDias(90), ultimaVez: haceDias(2) },
  };
  await sincronizar(cliente);

  revocarDispositivo('movil');
  await sincronizar(cliente);

  assert.ok(nube.dispositivos.movil.revocado, 'la orden queda en el archivo');
  assert.equal(revocacionPendiente(), false, 'no es para este dispositivo');
  assert.equal(dispositivos().find((d) => d.id === 'movil').revocado !== undefined, true);
});

test('el dispositivo revocado lo detecta y al acatarlo se da de baja', async () => {
  const { cliente, nube } = conNavegador('movil');
  anotarPagina('libro.pdf', 3, 100);
  anotarDispositivo({ crear: true });
  await sincronizar(cliente);

  revocarDispositivo('movil');
  assert.equal(revocacionPendiente(), true);

  acatarRevocacion();
  assert.equal(revocacionPendiente(), false);
  const ficha = dispositivos().find((aparato) => aparato.id === 'movil');
  assert.equal(ficha.esteMismo, false);
  assert.ok(ficha.baja, 'la ficha dice que la orden llegó a su destino');

  // Y la sincronización que sube esa baja no lo da de alta otra vez.
  await sincronizar(cliente);
  assert.deepEqual(Object.keys(nube.dispositivos), ['movil']);
});

test('una conexión posterior a la orden la da por cumplida', () => {
  const local = { movil: { sistema: 'Android', ultimaVez: haceDias(1) } };
  const remoto = { movil: {
    sistema: 'Android', ultimaVez: haceDias(5), revocado: haceDias(3),
  } };
  const { cliente, nube } = conNavegador('otro');
  nube.dispositivos = remoto;
  guardarLocal({ ...cargarLocal(), dispositivos: local });

  return sincronizar(cliente).then(() => {
    assert.equal(nube.dispositivos.movil.revocado, undefined);
    assert.equal(nube.dispositivos.movil.ultimaVez, local.movil.ultimaVez);
  });
});

test('el nombre puesto a mano no lo pisa quien se conecte después', () => {
  const bautizado = { movil: {
    sistema: 'Android', ultimaVez: haceDias(8),
    nombre: 'Móvil de Juan', nombreActualizado: haceDias(7),
  } };
  const reciente = { movil: { sistema: 'Android', ultimaVez: haceDias(1) } };
  const { cliente, nube } = conNavegador('otro');
  nube.dispositivos = reciente;
  guardarLocal({ ...cargarLocal(), dispositivos: bautizado });

  return sincronizar(cliente).then(() => {
    assert.equal(nube.dispositivos.movil.nombre, 'Móvil de Juan');
    assert.equal(nube.dispositivos.movil.ultimaVez, reciente.movil.ultimaVez);
  });
});

test('los dispositivos que llevan más del plazo sin aparecer se caen de la lista', async () => {
  const { cliente, nube } = conNavegador('portatil');
  anotarPagina('libro.pdf', 3, 100);
  anotarDispositivo({ crear: true });
  guardarDiasDeGracia(30);
  await sincronizar(cliente);
  nube.dispositivos = {
    ...nube.dispositivos,
    olvidado: { sistema: 'Windows', alta: haceDias(400), ultimaVez: haceDias(200) },
  };

  await sincronizar(cliente);

  assert.deepEqual(Object.keys(nube.dispositivos), ['portatil']);
});

// ───────────── Tiempo de lectura entre dispositivos ─────────────

// Un servidor de mentira compartido por los dos dispositivos de la prueba.
function nubeCompartida() {
  let remoto = { version: 2, libros: {} };
  return {
    cliente: {
      base: 'https://nube.test/libros',
      async leerProgreso() { return structuredClone(remoto); },
      async escribirProgreso(datos) { remoto = structuredClone(datos); },
    },
    ver: () => structuredClone(remoto),
  };
}

// Cambia de dispositivo conservando la nube. Cada uno guarda su propio
// localStorage entre turnos: si se reiniciara al cambiar, el aparato olvidaría
// lo suyo y la prueba no comprobaría ninguna fusión de verdad.
function bancoDeDispositivos() {
  const memorias = new Map();
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node test' }, configurable: true,
  });
  return function comoDispositivo(id) {
    if (!memorias.has(id)) memorias.set(id, new Map());
    const memoria = memorias.get(id);
    globalThis.localStorage = {
      getItem: (clave) => memoria.get(clave) ?? null,
      setItem: (clave, valor) => memoria.set(clave, String(valor)),
      removeItem: (clave) => memoria.delete(clave),
    };
    localStorage.setItem('lector.idDispositivo', id);
  };
}

test('el tiempo de un libro suma lo leído en cada dispositivo', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();

  comoDispositivo('movil');
  anotarPagina('novela.epub', 10, 100);
  anotarTiempoLectura('novela.epub', 600, 0);
  await sincronizar(nube.cliente);

  comoDispositivo('portatil');
  await sincronizar(nube.cliente);            // se trae lo del móvil
  anotarTiempoLectura('novela.epub', 300, 0);
  await sincronizar(nube.cliente);

  const tiempos = nube.ver().libros['novela.epub'].tiempos;
  assert.deepEqual(tiempos, { movil: { s: 600, p: 0 }, portatil: { s: 300, p: 0 } });

  // Y el móvil ve el total en cuanto vuelve a sincronizar.
  comoDispositivo('movil');
  await sincronizar(nube.cliente);
  assert.deepEqual(progresoDe('novela.epub').tiempos,
    { movil: { s: 600, p: 0 }, portatil: { s: 300, p: 0 } });
});

test('dos dispositivos que leen sin verse no se borran el rato al reencontrarse', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();

  comoDispositivo('movil');
  anotarPagina('libro.pdf', 5, 100);
  anotarTiempoLectura('libro.pdf', 600, 20);
  await sincronizar(nube.cliente);

  comoDispositivo('portatil');
  await sincronizar(nube.cliente);
  // Los dos leen a la vez, cada uno sin noticias del otro.
  anotarTiempoLectura('libro.pdf', 120, 4);

  comoDispositivo('movil');
  anotarTiempoLectura('libro.pdf', 300, 10);
  await sincronizar(nube.cliente);

  comoDispositivo('portatil');
  await sincronizar(nube.cliente);

  const tiempos = progresoDe('libro.pdf').tiempos;
  assert.deepEqual(tiempos, { movil: { s: 900, p: 30 }, portatil: { s: 120, p: 4 } });
});

test('los días de lectura se comparten y un mismo día en dos aparatos es uno solo', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();
  const hoy = new Date();
  const clave = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  comoDispositivo('movil');
  anotarTiempoLectura('libro.pdf', 600, 5);
  await sincronizar(nube.cliente);

  comoDispositivo('portatil');
  await sincronizar(nube.cliente);
  anotarTiempoLectura('libro.pdf', 300, 2);
  await sincronizar(nube.cliente);

  const estadisticas = nube.ver().estadisticas;
  assert.equal(estadisticas.movil.dias[clave].s, 600);
  assert.equal(estadisticas.portatil.dias[clave].s, 300);
});

test('el tiempo viaja con el libro al moverlo de carpeta', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();
  comoDispositivo('movil');
  anotarPagina('Curso/tema.pdf', 12, 100);
  anotarTiempoLectura('Curso/tema.pdf', 600, 20);
  await renombrarPorPrefijo('Curso/', 'Temario/', nube.cliente);
  assert.deepEqual(progresoDe('Temario/tema.pdf').tiempos, { movil: { s: 600, p: 20 } });
  assert.equal(progresoDe('Curso/tema.pdf'), null);
});

test('un libro que solo guarda tiempo se conserva; uno sin nada, no', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();
  comoDispositivo('movil');
  anotarTiempoLectura('solo-tiempo.pdf', 600, 20);
  guardarTitulo('vacio.pdf', '');
  await sincronizar(nube.cliente);
  assert.ok(nube.ver().libros['solo-tiempo.pdf']);
  assert.equal(nube.ver().libros['vacio.pdf'], undefined);
});

// ── No querer que se mida nada ──

test('con las estadísticas apagadas no se apunta ningún tiempo', () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  anotarPagina('libro.pdf', 5, 100);
  apagarEstadisticas(true);
  assert.equal(anotarTiempoLectura('libro.pdf', 600, 20), null);
  assert.equal(progresoDe('libro.pdf').tiempos, undefined);
  assert.equal(cargarLocal().estadisticas, undefined);
  // La página por la que se iba no tiene nada que ver con esto.
  assert.equal(progresoDe('libro.pdf').pagina, 5);
  // Y al volver a activarlo se cuenta otra vez, desde cero.
  apagarEstadisticas(false);
  assert.ok(anotarTiempoLectura('libro.pdf', 600, 20));
  assert.ok(cargarLocal().estadisticas);
});

// Quien dice que no quiere que se le mida no lo dice de un aparato, lo dice de
// su lectura: la decisión viaja con el registro.
test('no medir se transmite a los demás dispositivos', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();

  comoDispositivo('movil');
  anotarPagina('libro.pdf', 5, 100);
  anotarTiempoLectura('libro.pdf', 600, 20);
  await sincronizar(nube.cliente);

  // Desde el portátil se decide que no se mida, y se borra lo que había.
  comoDispositivo('portatil');
  await sincronizar(nube.cliente);
  apagarEstadisticas(true);
  borrarEstadisticas();
  await sincronizar(nube.cliente);
  assert.equal(nube.ver().sinEstadisticas.activo, true);

  // El móvil lo acata al sincronizar y deja de apuntar por su cuenta.
  comoDispositivo('movil');
  await sincronizar(nube.cliente);
  assert.equal(estadisticasApagadas(), true);
  assert.equal(anotarTiempoLectura('libro.pdf', 300, 10), null);
  assert.equal(cargarLocal().estadisticas, undefined);

  // Y volver a activarlo desde el móvil llega igualmente al portátil.
  apagarEstadisticas(false);
  await sincronizar(nube.cliente);
  comoDispositivo('portatil');
  await sincronizar(nube.cliente);
  assert.equal(estadisticasApagadas(), false);
  assert.ok(anotarTiempoLectura('libro.pdf', 120, 4));
});

// Sin esto la prueba de arriba fallaba una de cada tres veces: los dos
// cambios caían en el mismo milisegundo, los sellos empataban y mandaba la
// regla del empate en lugar de lo último que se pidió.
test('cambiar de idea dos veces seguidas respeta la última', () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  apagarEstadisticas(true);
  const primera = cargarLocal().sinEstadisticas;
  apagarEstadisticas(false);
  const segunda = cargarLocal().sinEstadisticas;
  assert.ok(segunda.sello > primera.sello, 'la segunda decisión no queda por delante');
  assert.deepEqual(fusionarSinEstadisticas(segunda, primera), segunda);
  assert.equal(estadisticasApagadas(), false);
});

test('entre dos decisiones manda la más reciente', () => {
  const antes = { activo: false, sello: '2026-07-01T10:00:00.000Z' };
  const despues = { activo: true, sello: '2026-08-01T10:00:00.000Z' };
  assert.deepEqual(fusionarSinEstadisticas(antes, despues), despues);
  assert.deepEqual(fusionarSinEstadisticas(despues, antes), despues);
  // Con un solo lado, ese manda; sin ninguno, no hay nada que guardar.
  assert.deepEqual(fusionarSinEstadisticas(null, antes), antes);
  assert.deepEqual(fusionarSinEstadisticas(antes, undefined), antes);
  assert.equal(fusionarSinEstadisticas(null, null), null);
  assert.equal(fusionarSinEstadisticas({ activo: true }, null), null); // sin sello no vale
});

// Lo que no se apuntó no se recupera; lo apuntado de más sí se borra.
test('en un empate exacto gana el no medir', () => {
  const sello = '2026-08-01T10:00:00.000Z';
  assert.equal(fusionarSinEstadisticas({ activo: false, sello }, { activo: true, sello }).activo, true);
  assert.equal(fusionarSinEstadisticas({ activo: true, sello }, { activo: false, sello }).activo, true);
});

test('borrar las estadísticas las borra también en los demás dispositivos', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();

  comoDispositivo('movil');
  anotarPagina('libro.pdf', 5, 100);
  anotarTiempoLectura('libro.pdf', 600, 20);
  await sincronizar(nube.cliente);

  comoDispositivo('portatil');
  await sincronizar(nube.cliente);
  anotarTiempoLectura('libro.pdf', 300, 10);
  await sincronizar(nube.cliente);
  assert.equal(Object.keys(progresoDe('libro.pdf').tiempos).length, 2);

  // Se borra desde el portátil...
  borrarEstadisticas();
  await sincronizar(nube.cliente);
  assert.equal(progresoDe('libro.pdf').tiempos, undefined);
  assert.equal(nube.ver().libros['libro.pdf'].tiempos, undefined);
  assert.equal(nube.ver().estadisticas, undefined);
  // ...y la página por la que iba no se toca.
  assert.equal(progresoDe('libro.pdf').pagina, 5);

  // ...y el móvil lo acata al sincronizar, sin reponer su casilla.
  comoDispositivo('movil');
  await sincronizar(nube.cliente);
  assert.equal(progresoDe('libro.pdf').tiempos, undefined);
  assert.equal(cargarLocal().estadisticas, undefined);

  // Lo que se lea después vuelve a contar con normalidad.
  anotarTiempoLectura('libro.pdf', 120, 4);
  await sincronizar(nube.cliente);
  assert.deepEqual(nube.ver().libros['libro.pdf'].tiempos, { movil: { s: 120, p: 4 } });
});

test('rescata las estadísticas de la primera versión, que no tenían dueño', () => {
  bancoDeDispositivos()('movil');
  localStorage.setItem('lector.estadisticas', JSON.stringify({
    v: 1,
    dias: { '2026-05-04': { s: 600, p: 5 }, 'no-es-fecha': { s: 60 } },
    libros: { 'novela.epub': { s: 900, p: 0, n: 'Novela' }, 'sin-tiempo.pdf': { s: 0 } },
  }));
  assert.equal(migrarEstadisticasAntiguas(), true);
  assert.deepEqual(cargarLocal().estadisticas.movil.dias, { '2026-05-04': { s: 600, p: 5 } });
  assert.deepEqual(progresoDe('novela.epub').tiempos, { movil: { s: 900, p: 0 } });
  assert.equal(progresoDe('sin-tiempo.pdf'), null);
  assert.equal(localStorage.getItem('lector.estadisticas'), null);
  // No se repite: la segunda pasada ya no encuentra nada.
  assert.equal(migrarEstadisticasAntiguas(), false);
});

// ── Libros borrados ──
//
// Borrar un libro se lleva su entrada, pero no lo que se leyó: eso se aparta y
// sigue contando en las estadísticas hasta que se pode o se borren.

test('borrar un libro conserva lo que se leyó de él', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();
  comoDispositivo('movil');
  anotarPagina('Novelas/mia.epub', 40, 100);
  anotarTiempoLectura('Novelas/mia.epub', 1800, 0);
  guardarTitulo('Novelas/mia.epub', 'Mi novela');
  await sincronizar(nube.cliente);

  await olvidar('Novelas/mia.epub', nube.cliente);
  assert.equal(progresoDe('Novelas/mia.epub'), null);
  assert.equal(nube.ver().libros['Novelas/mia.epub'], undefined);

  const [libro] = resumen(cargarLocal()).libros;
  assert.equal(libro.id, 'Novelas/mia.epub');
  assert.equal(libro.segundos, 1800);
  assert.equal(libro.titulo, 'Mi novela');
  assert.ok(libro.borrado);
  // Y llega a los demás dispositivos como cualquier otra estadística.
  assert.ok(nube.ver().leidos['Novelas/mia.epub']);
  comoDispositivo('portatil');
  await sincronizar(nube.cliente);
  assert.equal(resumen(cargarLocal()).libros[0].segundos, 1800);
});

test('borrar una carpeta conserva lo leído de sus libros', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();
  comoDispositivo('movil');
  anotarPagina('Curso/tema.pdf', 12, 100);
  anotarTiempoLectura('Curso/tema.pdf', 900, 30);
  await olvidarPorPrefijo('Curso/', nube.cliente);
  assert.equal(progresoDe('Curso/tema.pdf'), null);
  assert.equal(resumen(cargarLocal()).libros[0].segundos, 900);
});

test('el libro que desaparece del servidor deja su tiempo apuntado', async () => {
  const nube = nubeCompartida();
  const comoDispositivo = bancoDeDispositivos();
  comoDispositivo('movil');
  anotarPagina('ido.pdf', 5, 100);
  anotarTiempoLectura('ido.pdf', 600, 20);
  await conciliarPresencia([], nube.cliente);          // primero solo se apunta la ausencia
  await conciliarPresencia([], nube.cliente, { ahora: true });
  assert.equal(progresoDe('ido.pdf'), null);
  assert.equal(resumen(cargarLocal()).libros[0].segundos, 600);
});

test('un libro borrado que vuelve recupera su tiempo en la entrada', () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node test' }, configurable: true,
  });
  anotarPagina('vuelve.pdf', 5, 100);
  anotarTiempoLectura('vuelve.pdf', 600, 20);
  const dispositivo = localStorage.getItem('lector.idDispositivo');
  olvidar('vuelve.pdf');
  anotarPagina('vuelve.pdf', 2, 100);
  anotarTiempoLectura('vuelve.pdf', 120, 4);
  assert.equal(progresoDe('vuelve.pdf').tiempos[dispositivo].s, 600);
  assert.equal(cargarLocal().leidos?.['vuelve.pdf'], undefined);
  // Y no se cuenta dos veces en la lista.
  assert.equal(resumen(cargarLocal()).libros.length, 1);
  assert.equal(resumen(cargarLocal()).libros[0].segundos, 600);
});

test('borrar las estadísticas se lleva también lo de los libros borrados', () => {
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (clave) => memoria.get(clave) ?? null,
    setItem: (clave, valor) => memoria.set(clave, String(valor)),
    removeItem: (clave) => memoria.delete(clave),
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node test' }, configurable: true,
  });
  anotarPagina('ido.pdf', 5, 100);
  anotarTiempoLectura('ido.pdf', 600, 20);
  olvidar('ido.pdf');
  assert.ok(cargarLocal().leidos['ido.pdf']);
  borrarEstadisticas();
  assert.equal(cargarLocal().leidos, undefined);
  assert.deepEqual(resumen(cargarLocal()).libros, []);
});
