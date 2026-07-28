// Gestión del progreso de lectura.
//
// El progreso vive en dos sitios:
//  - localStorage: siempre, para acceso inmediato y modo sin conexión.
//  - lector-progreso.json en el servidor WebDAV: para sincronizar entre
//    dispositivos. La posición y los marcadores se fusionan por separado.

import {
  apuntarTiempo, apuntarDia, fusionarTiempos, fusionarEstadisticas,
  normalizarTiempos, normalizarEstadisticas,
} from './estadisticas.js';

const CLAVE_LOCAL = 'lector.progreso';
const CLAVE_BORRADOS_PENDIENTES = 'lector.progreso.borradosPendientes';
const CLAVE_CAMBIOS_PENDIENTES = 'lector.progreso.cambiosPendientes';
const VERSION_DATOS = 2;
const FECHA_CERO = '1970-01-01T00:00:00.000Z';
const MS_DIA = 24 * 60 * 60 * 1000;
// Cuánto se sostiene la ausencia de un libro antes de tirar su entrada
// (ver conciliarPresencia). Lo elige el usuario y se comparte entre sus
// dispositivos; 0 significa no borrar nunca.
export const DIAS_GRACIA_AUSENCIA = 30;
export const DIAS_GRACIA_POSIBLES = [0, 7, 15, 30, 60, 90];
// Cada cuánto se vuelve a anotar que un libro sigue estando.
const MS_REFRESCO_PRESENCIA = 7 * MS_DIA;

function fechaMaxima(...fechas) {
  return fechas.filter((fecha) => typeof fecha === 'string').sort().at(-1) ?? FECHA_CERO;
}

function fechaPosterior(...fechas) {
  const maxima = fechaMaxima(...fechas);
  const milisegundos = Date.parse(maxima);
  return Number.isFinite(milisegundos)
    ? new Date(milisegundos + 1).toISOString()
    : new Date().toISOString();
}

function nuevoToken() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function cargarCambiosPendientes() {
  try {
    const cambios = JSON.parse(localStorage.getItem(CLAVE_CAMBIOS_PENDIENTES));
    if (cambios && typeof cambios === 'object' && !Array.isArray(cambios)) return cambios;
  } catch { /* registro corrupto: se descarta */ }
  return {};
}

function guardarCambiosPendientes(cambios) {
  for (const id of Object.keys(cambios)) {
    const cambio = cambios[id];
    if (!cambio?.posicion && !Object.keys(cambio?.marcadores ?? {}).length) delete cambios[id];
  }
  if (Object.keys(cambios).length) localStorage.setItem(CLAVE_CAMBIOS_PENDIENTES, JSON.stringify(cambios));
  else localStorage.removeItem(CLAVE_CAMBIOS_PENDIENTES);
}

function marcarPosicionPendiente(idLibro) {
  if (idLibro.startsWith('local:')) return;
  const cambios = cargarCambiosPendientes();
  cambios[idLibro] ??= { marcadores: {} };
  cambios[idLibro].posicion = nuevoToken();
  guardarCambiosPendientes(cambios);
}

function marcarMarcadoresPendientes(idLibro, ids) {
  if (idLibro.startsWith('local:') || !ids.length) return;
  const cambios = cargarCambiosPendientes();
  cambios[idLibro] ??= { marcadores: {} };
  cambios[idLibro].marcadores ??= {};
  for (const id of ids) cambios[idLibro].marcadores[id] = nuevoToken();
  guardarCambiosPendientes(cambios);
}

function limpiarCambiosConfirmados(confirmados) {
  const actuales = cargarCambiosPendientes();
  for (const [idLibro, cambio] of Object.entries(confirmados)) {
    const actual = actuales[idLibro];
    if (!actual) continue;
    if (actual.posicion === cambio.posicion) delete actual.posicion;
    for (const [id, token] of Object.entries(cambio.marcadores ?? {})) {
      if (actual.marcadores?.[id] === token) delete actual.marcadores[id];
    }
  }
  guardarCambiosPendientes(actuales);
}

function descartarCambiosPendientes(idLibro) {
  const cambios = cargarCambiosPendientes();
  delete cambios[idLibro];
  guardarCambiosPendientes(cambios);
}

function hashTexto(texto) {
  let hash = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function idMarcador(marcador) {
  if (marcador.id) return marcador.id;
  const posicion = marcador.cfi ?? marcador.pagina ?? marcador.porcentaje ?? '';
  return `legacy-${hashTexto(`${posicion}|${marcador.creado ?? ''}`)}`;
}

function fechaColeccion(entrada) {
  return entrada?.marcadoresActualizados ?? entrada?.actualizado ?? FECHA_CERO;
}

function normalizarMarcador(marcador, fechaPredeterminada) {
  return {
    ...marcador,
    id: idMarcador(marcador),
    actualizado: marcador.actualizado ?? marcador.creado ?? fechaPredeterminada,
  };
}

function normalizarEntrada(entrada = {}) {
  const posicionActualizada = entrada.posicionActualizada ?? entrada.actualizado ?? FECHA_CERO;
  const marcadoresActualizados = fechaColeccion(entrada);
  const terminadoActualizado = entrada.terminadoActualizado ?? FECHA_CERO;
  const tituloActualizado = entrada.tituloActualizado ?? FECHA_CERO;
  const notaActualizada = entrada.notaActualizada ?? FECHA_CERO;
  const marcadores = Array.isArray(entrada.marcadores)
    ? entrada.marcadores.map((marcador) => normalizarMarcador(marcador, marcadoresActualizados))
    : [];
  const tiempos = normalizarTiempos(entrada.tiempos);
  const resultado = {
    ...entrada,
    posicionActualizada,
    marcadoresActualizados,
    terminadoActualizado,
    tituloActualizado,
    notaActualizada,
    marcadoresVersion: 2,
    actualizado: fechaMaxima(
      entrada.actualizado,
      posicionActualizada,
      marcadoresActualizados,
      terminadoActualizado,
      tituloActualizado,
      notaActualizada,
      ...marcadores.map((marcador) => marcador.actualizado),
    ),
  };
  if (marcadores.length) resultado.marcadores = marcadores;
  else delete resultado.marcadores;
  // El tiempo de lectura no lleva fecha propia: cada dispositivo tiene su
  // casilla y solo la suya crece, así que no hay nada que datar.
  if (Object.keys(tiempos).length) resultado.tiempos = tiempos;
  else delete resultado.tiempos;
  return resultado;
}

function normalizarDatos(datos) {
  const normalizados = { ...datos, version: VERSION_DATOS, libros: {} };
  for (const [id, entrada] of Object.entries(datos?.libros ?? {})) {
    normalizados.libros[id] = normalizarEntrada(entrada);
  }
  const estadisticas = normalizarEstadisticas(datos?.estadisticas);
  if (Object.keys(estadisticas).length) normalizados.estadisticas = estadisticas;
  else delete normalizados.estadisticas;
  return normalizados;
}

function cargarRegistroBorrados() {
  try {
    const registro = JSON.parse(localStorage.getItem(CLAVE_BORRADOS_PENDIENTES));
    if (registro && typeof registro === 'object' && !Array.isArray(registro)) return registro;
  } catch { /* lista corrupta: se descarta */ }
  return {};
}

function guardarRegistroBorrados(registro) {
  for (const servidor of Object.keys(registro)) {
    if (!Array.isArray(registro[servidor]) || !registro[servidor].length) delete registro[servidor];
  }
  if (Object.keys(registro).length) localStorage.setItem(CLAVE_BORRADOS_PENDIENTES, JSON.stringify(registro));
  else localStorage.removeItem(CLAVE_BORRADOS_PENDIENTES);
}

function claveServidor(cliente) {
  return cliente?.base ?? 'servidor';
}

function cargarBorradosPendientes(cliente) {
  return new Set(cargarRegistroBorrados()[claveServidor(cliente)] ?? []);
}

function marcarBorradoPendiente(idLibro, cliente) {
  const registro = cargarRegistroBorrados();
  const servidor = claveServidor(cliente);
  registro[servidor] = [...new Set([...(registro[servidor] ?? []), idLibro])];
  guardarRegistroBorrados(registro);
}

function completarBorradoPendiente(idLibro, cliente = null) {
  const registro = cargarRegistroBorrados();
  const servidores = cliente ? [claveServidor(cliente)] : Object.keys(registro);
  for (const servidor of servidores) {
    registro[servidor] = (registro[servidor] ?? []).filter((id) => id !== idLibro);
  }
  guardarRegistroBorrados(registro);
}

export function cargarLocal() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_LOCAL));
    if (datos && typeof datos.libros === 'object') return datos;
  } catch { /* datos corruptos: se empieza de cero */ }
  return { version: 1, libros: {} };
}

export function guardarLocal(datos) {
  localStorage.setItem(CLAVE_LOCAL, JSON.stringify(datos));
}

// `extra` admite campos adicionales según el formato (p. ej. el CFI de un
// EPUB); en los PDF pagina/paginas son páginas reales, en los EPUB son el
// porcentaje leído sobre 100.
export function anotarPagina(idLibro, pagina, totalPaginas, extra = {}) {
  // Si el usuario vuelve a añadir un libro con el mismo nombre, la nueva
  // lectura cancela cualquier limpieza pendiente de la copia anterior.
  completarBorradoPendiente(idLibro);
  const datos = cargarLocal();
  const anterior = normalizarEntrada(datos.libros[idLibro]);
  // Los marcadores conviven con la posición en la misma entrada: al anotar
  // una página nueva se conservan los que ya hubiera.
  const { marcadores: marcadoresExtra, ...resto } = extra;
  const marcadores = marcadoresExtra ?? anterior.marcadores;
  const ahora = new Date().toISOString();
  datos.libros[idLibro] = {
    ...anterior,
    ...resto,
    ...(Array.isArray(marcadores) && marcadores.length ? { marcadores } : {}),
    pagina,
    paginas: totalPaginas,
    posicionActualizada: ahora,
    actualizado: ahora,
    dispositivo: nombreDispositivo(),
  };
  datos.version = VERSION_DATOS;
  guardarLocal(datos);
  marcarPosicionPendiente(idLibro);
  if (marcadoresExtra?.length) {
    marcarMarcadoresPendientes(idLibro, marcadoresExtra.map(idMarcador));
  }
  return datos.libros[idLibro];
}

// ───────────── Tiempo de lectura ─────────────
//
// Se apunta en dos sitios a la vez, porque responden a preguntas distintas:
// en la entrada del libro («¿cuánto he tardado en leer esto?», sumando todos
// los aparatos) y en el registro de días («¿cuántos días seguidos llevo?»).
// Los dos van desglosados por dispositivo, que es lo que permite sumarlos sin
// que dos aparatos leyendo a la vez se pisen la cuenta.
//
// Al ir dentro de la entrada del libro, el tiempo hereda gratis todo lo demás:
// mover el libro de carpeta se lo lleva consigo y borrarlo se lo lleva por
// delante, igual que a los marcadores.
export function anotarTiempoLectura(idLibro, segundos, paginas = 0, ahora = Date.now()) {
  const dispositivo = idDispositivo();
  const datos = cargarLocal();
  const entrada = normalizarEntrada(datos.libros[idLibro] ?? {});
  const tiempos = apuntarTiempo(entrada.tiempos, dispositivo, { segundos, paginas });
  if (!Object.keys(tiempos).length) return null;
  entrada.tiempos = tiempos;
  datos.libros[idLibro] = entrada;
  datos.estadisticas = apuntarDia(datos.estadisticas, dispositivo, { segundos, paginas, ahora });
  datos.version = VERSION_DATOS;
  guardarLocal(datos);
  // Sin token de cambio pendiente: el tiempo no compite con nadie, se fusiona
  // por suma y la casilla propia siempre gana por ser la mayor.
  return entrada.tiempos;
}

// ───────────── Borrar las estadísticas ─────────────
//
// Vaciar las casillas y subirlas no basta: cada dispositivo conserva las
// suyas y la fusión (que se queda la cifra mayor) las repondría en cuanto
// volviera a conectarse. Hace falta decir «esto se borró y cuándo», que es lo
// que hace el sello: viaja en el archivo compartido y gana el más reciente.
//
// El sello es además su propia marca de «ya aplicado»: quien lo lleva guardado
// es que ya vació lo suyo, y quien trae uno anterior (o ninguno) arrastra
// cuentas de antes del borrado, así que le toca. Vale para los dos lados, y
// por eso el que acaba de borrar limpia también lo que le devuelve el
// servidor, que aún no se ha enterado.
function vaciarEstadisticas(datos) {
  delete datos.estadisticas;
  for (const entrada of Object.values(datos.libros ?? {})) delete entrada?.tiempos;
}

export function borrarEstadisticas() {
  const datos = cargarLocal();
  vaciarEstadisticas(datos);
  datos.estadisticasBorradas = new Date().toISOString();
  datos.version = VERSION_DATOS;
  guardarLocal(datos);
}

// Trae al registro las estadísticas de la primera versión, que vivían aparte
// y solo en este navegador. Se vuelcan bajo el identificador de este
// dispositivo, que es justo lo que les faltaba para poder sumarse con las de
// los demás.
const CLAVE_ESTADISTICAS_ANTIGUAS = 'lector.estadisticas';

export function migrarEstadisticasAntiguas() {
  let antiguas = null;
  try {
    antiguas = JSON.parse(localStorage.getItem(CLAVE_ESTADISTICAS_ANTIGUAS));
  } catch { /* registro corrupto: no hay nada que rescatar */ }
  if (!antiguas || typeof antiguas !== 'object') {
    localStorage.removeItem(CLAVE_ESTADISTICAS_ANTIGUAS);
    return false;
  }
  const dispositivo = idDispositivo();
  const datos = cargarLocal();
  const dias = {};
  for (const [dia, valor] of Object.entries(antiguas.dias ?? {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dia)) dias[dia] = { s: Number(valor?.s) || 0, p: Number(valor?.p) || 0 };
  }
  datos.estadisticas = fusionarEstadisticas(datos.estadisticas, { [dispositivo]: { dias } });
  for (const [id, valor] of Object.entries(antiguas.libros ?? {})) {
    const segundos = Number(valor?.s) || 0;
    if (segundos <= 0) continue;
    const entrada = normalizarEntrada(datos.libros[id] ?? {});
    entrada.tiempos = fusionarTiempos(entrada.tiempos, {
      [dispositivo]: { s: segundos, p: Number(valor?.p) || 0 },
    });
    datos.libros[id] = entrada;
  }
  datos.version = VERSION_DATOS;
  guardarLocal(datos);
  localStorage.removeItem(CLAVE_ESTADISTICAS_ANTIGUAS);
  return true;
}

export function marcadoresDe(idLibro) {
  const marcadores = normalizarEntrada(progresoDe(idLibro)).marcadores;
  return Array.isArray(marcadores)
    ? marcadores.filter((marcador) => !marcador.borrado).map((marcador) => ({ ...marcador }))
    : [];
}

function contenidoMarcador(marcador) {
  const contenido = { ...marcador };
  delete contenido.id;
  delete contenido.actualizado;
  delete contenido.borrado;
  return JSON.stringify(contenido);
}

// Sustituye la lista visible de marcadores. Los eliminados se conservan como
// tombstones internos para que una copia antigua no los haga reaparecer.
export function guardarMarcadores(idLibro, marcadores) {
  const datos = cargarLocal();
  const entrada = normalizarEntrada(datos.libros[idLibro] ?? { pagina: 0, paginas: 0 });
  const anteriores = new Map((entrada.marcadores ?? []).map((marcador) => [marcador.id, marcador]));
  const ahora = new Date().toISOString();
  const idsVisibles = new Set();
  const modificados = [];
  const siguientes = marcadores.map((marcador) => {
    const id = idMarcador(marcador);
    idsVisibles.add(id);
    const anterior = anteriores.get(id);
    if (anterior && !anterior.borrado && contenidoMarcador(anterior) === contenidoMarcador(marcador)) {
      return anterior;
    }
    modificados.push(id);
    const siguiente = { ...marcador, id, actualizado: ahora };
    delete siguiente.borrado;
    return siguiente;
  });
  for (const anterior of anteriores.values()) {
    if (idsVisibles.has(anterior.id)) continue;
    if (anterior.borrado) siguientes.push(anterior);
    else {
      siguientes.push({ id: anterior.id, actualizado: ahora, borrado: true });
      modificados.push(anterior.id);
    }
  }
  if (siguientes.length) entrada.marcadores = siguientes;
  else delete entrada.marcadores;
  entrada.marcadoresVersion = 2;
  entrada.marcadoresActualizados = ahora;
  entrada.actualizado = ahora;
  entrada.dispositivo = nombreDispositivo();
  datos.libros[idLibro] = entrada;
  datos.version = VERSION_DATOS;
  guardarLocal(datos);
  marcarMarcadoresPendientes(idLibro, modificados);
}

export function progresoDe(idLibro) {
  return cargarLocal().libros[idLibro] ?? null;
}

// Nombre visible que el usuario ha puesto al libro, o null si no lo ha
// cambiado (entonces vale el del archivo o el de los metadatos).
export function tituloDe(idLibro) {
  const titulo = progresoDe(idLibro)?.titulo;
  return typeof titulo === 'string' && titulo.trim() ? titulo.trim() : null;
}

// Cambia (o borra, con cadena vacía) el nombre visible del libro. Se guarda en
// la entrada de progreso, así que en los libros de la nube viaja con la
// sincronización; en los locales se queda en el dispositivo, como su lectura.
export function guardarTitulo(idLibro, titulo) {
  const datos = cargarLocal();
  // Sin pagina/paginas: una entrada solo-título no cuenta como lectura y no
  // debe aparecer en «Continuar leyendo».
  const entrada = normalizarEntrada(datos.libros[idLibro] ?? {});
  const limpio = String(titulo ?? '').trim();
  const ahora = new Date().toISOString();
  if (limpio) entrada.titulo = limpio;
  else delete entrada.titulo;
  entrada.tituloActualizado = ahora;
  entrada.actualizado = fechaMaxima(entrada.actualizado, ahora);
  entrada.dispositivo = nombreDispositivo();
  datos.libros[idLibro] = entrada;
  datos.version = VERSION_DATOS;
  guardarLocal(datos);
  return entrada;
}

// Nota que el usuario escribe sobre el libro entero (no sobre un fragmento:
// eso son las anotaciones). Vive en la entrada de progreso, así que en los
// libros de la nube viaja con la sincronización y se lee desde cualquier
// dispositivo; en los locales se queda aquí, como su lectura.
export function notaDe(idLibro) {
  const nota = progresoDe(idLibro)?.nota;
  return typeof nota === 'string' && nota.trim() ? nota.trim() : null;
}

// Cambia (o borra, con cadena vacía) la nota del libro.
export function guardarNota(idLibro, nota) {
  const datos = cargarLocal();
  // Sin pagina/paginas, igual que el título: anotar un libro no es empezarlo,
  // así que no debe colarlo en «Continuar leyendo».
  const entrada = normalizarEntrada(datos.libros[idLibro] ?? {});
  const limpio = String(nota ?? '').trim();
  const ahora = new Date().toISOString();
  if (limpio) entrada.nota = limpio;
  else delete entrada.nota;
  entrada.notaActualizada = ahora;
  entrada.actualizado = fechaMaxima(entrada.actualizado, ahora);
  entrada.dispositivo = nombreDispositivo();
  datos.libros[idLibro] = entrada;
  datos.version = VERSION_DATOS;
  guardarLocal(datos);
  return entrada;
}

export function marcarTerminado(idLibro, terminado) {
  const datos = cargarLocal();
  const entrada = normalizarEntrada(datos.libros[idLibro] ?? { pagina: 0, paginas: 0 });
  const ahora = new Date().toISOString();
  entrada.terminado = Boolean(terminado);
  entrada.terminadoActualizado = ahora;
  entrada.actualizado = fechaMaxima(entrada.actualizado, ahora);
  entrada.dispositivo = nombreDispositivo();
  datos.libros[idLibro] = entrada;
  datos.version = VERSION_DATOS;
  guardarLocal(datos);
  return entrada;
}

// El libro cuya posición cambió más recientemente es el candidato natural
// para «Continuar leyendo». Se usa la fecha de posición, no la de marcadores,
// para que editar una nota de un libro antiguo no lo convierta en el actual.
export function ultimoLibroLeido(datos = cargarLocal()) {
  return librosRecientes(1, datos)[0] ?? null;
}

export function librosRecientes(limite = 3, datos = cargarLocal()) {
  const libros = [];
  for (const [id, entrada] of Object.entries(datos?.libros ?? {})) {
    if (!entrada || (!Number.isFinite(entrada.pagina) && !entrada.cfi)) continue;
    const fecha = entrada.posicionActualizada ?? entrada.actualizado ?? FECHA_CERO;
    libros.push({ id, fecha, progreso: entrada });
  }
  return libros.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, limite);
}

function marcadorMasReciente(uno, otro) {
  if (uno.actualizado !== otro.actualizado) {
    return uno.actualizado > otro.actualizado ? uno : otro;
  }
  // En un empate, el borrado es la opción conservadora: evita resucitar un
  // marcador eliminado en otro dispositivo con la misma marca temporal.
  return otro.borrado ? otro : uno;
}

function fusionarMarcadores(localOriginal, remotoOriginal, cambioLocal) {
  const local = normalizarEntrada(localOriginal);
  const remoto = normalizarEntrada(remotoOriginal);
  const locales = new Map((local.marcadores ?? []).map((marcador) => [marcador.id, marcador]));
  const remotos = new Map((remoto.marcadores ?? []).map((marcador) => [marcador.id, marcador]));
  const resultado = [];
  const ids = new Set([...locales.keys(), ...remotos.keys()]);
  const localEraLegacy = localOriginal?.marcadoresVersion !== 2;
  const remotoEraLegacy = remotoOriginal?.marcadoresVersion !== 2;

  for (const id of ids) {
    const mio = locales.get(id);
    const suyo = remotos.get(id);
    if (mio && suyo) {
      resultado.push(cambioLocal?.marcadores?.[id]
        ? { ...mio, actualizado: fechaPosterior(mio.actualizado, suyo.actualizado) }
        : marcadorMasReciente(mio, suyo));
    } else if (mio) {
      if (cambioLocal?.marcadores?.[id]) {
        resultado.push({
          ...mio,
          actualizado: fechaPosterior(mio.actualizado, fechaColeccion(remotoOriginal)),
        });
      } else if (remotoEraLegacy && fechaColeccion(remotoOriginal) > mio.actualizado) {
        resultado.push({ id, actualizado: fechaColeccion(remotoOriginal), borrado: true });
      } else resultado.push(mio);
    } else if (suyo) {
      if (localEraLegacy && fechaColeccion(localOriginal) > suyo.actualizado) {
        resultado.push({ id, actualizado: fechaColeccion(localOriginal), borrado: true });
      } else resultado.push(suyo);
    }
  }
  return resultado;
}

// Fusiona por separado la posición y cada marcador. `cambioLocal` contiene
// tokens que solo viven en este navegador: mientras sigan pendientes, la
// edición local prevalece aunque el reloj del dispositivo esté desajustado.
// ¿Se escribió esta posición sabiendo lo que había en el servidor?
//
// `visto` guarda qué posición remota conocía este dispositivo la última vez que
// sincronizó. Si el servidor tiene una posterior, es que se leyó y se avanzó a
// ciegas —sin cobertura, o con el servidor caído— y entonces «gana la más
// reciente» es una mala regla: la posición local, por venir de una copia vieja,
// puede estar mucho más atrás y aun así ser la más nueva, borrando el avance
// real hecho en otro aparato.
//
// En ese caso concreto se conserva la más avanzada. Fuera de él manda la fecha,
// para que volver atrás a releer un capítulo siga funcionando entre dispositivos.
function escribioAciegas(local, remoto) {
  const visto = local.visto ?? FECHA_CERO;
  return remoto.posicionActualizada > visto;
}

function sinVisto(entrada) {
  const { visto, ...resto } = entrada;
  return resto;
}

function avance(entrada) {
  const pagina = Number(entrada?.pagina);
  return Number.isFinite(pagina) ? pagina : -1;
}

function escogerPosicion(local, remoto) {
  const localEsReciente = local.posicionActualizada > remoto.posicionActualizada;
  if (localEsReciente && escribioAciegas(local, remoto)) return avance(local) >= avance(remoto);
  return localEsReciente;
}

export function fusionarEntradas(localOriginal, remotoOriginal, cambioLocal = {}) {
  const local = normalizarEntrada(localOriginal);
  const remoto = normalizarEntrada(remotoOriginal);
  // La posición más reciente debe ganar también cuando haya un cambio local
  // pendiente. Dar prioridad incondicional al pendiente hacía que dos
  // dispositivos conservaran posiciones distintas y se sobrescribieran por
  // turnos cada vez que sincronizaban.
  const posicionLocal = escogerPosicion(local, remoto);
  const posicion = posicionLocal ? { ...local } : remoto;
  const reciente = local.actualizado >= remoto.actualizado ? local : remoto;
  const anterior = reciente === local ? remoto : local;
  const resultado = { ...anterior, ...reciente };
  for (const campo of ['pagina', 'paginas', 'cfi']) delete resultado[campo];
  for (const campo of ['pagina', 'paginas', 'cfi']) {
    if (campo in posicion) resultado[campo] = posicion[campo];
  }
  const marcadores = fusionarMarcadores(localOriginal, remotoOriginal, cambioLocal);
  if (marcadores.length) resultado.marcadores = marcadores;
  else delete resultado.marcadores;
  // El tiempo se fusiona casilla a casilla, al margen de qué lado sea el más
  // reciente: leer en dos aparatos suma, no compite.
  const tiempos = fusionarTiempos(localOriginal?.tiempos, remotoOriginal?.tiempos);
  if (Object.keys(tiempos).length) resultado.tiempos = tiempos;
  else delete resultado.tiempos;
  resultado.posicionActualizada = posicion.posicionActualizada;
  resultado.marcadoresActualizados = fechaMaxima(fechaColeccion(local), fechaColeccion(remoto));
  resultado.marcadoresVersion = 2;
  const finalizacion = local.terminadoActualizado > remoto.terminadoActualizado ? local : remoto;
  resultado.terminadoActualizado = finalizacion.terminadoActualizado;
  if (typeof finalizacion.terminado === 'boolean') resultado.terminado = finalizacion.terminado;
  else delete resultado.terminado;
  // El nombre personalizado gana el último editado, con su propia fecha, para
  // que renombrar en un dispositivo no dependa de quién leyó después.
  const titulacion = local.tituloActualizado > remoto.tituloActualizado ? local : remoto;
  resultado.tituloActualizado = fechaMaxima(local.tituloActualizado, remoto.tituloActualizado);
  if (typeof titulacion.titulo === 'string' && titulacion.titulo.trim()) resultado.titulo = titulacion.titulo;
  else delete resultado.titulo;
  // La nota, con su propia fecha por lo mismo: la escribe quien la escribe,
  // no quien haya leído después.
  const anotacion = local.notaActualizada > remoto.notaActualizada ? local : remoto;
  resultado.notaActualizada = fechaMaxima(local.notaActualizada, remoto.notaActualizada);
  if (typeof anotacion.nota === 'string' && anotacion.nota.trim()) resultado.nota = anotacion.nota;
  else delete resultado.nota;
  // Ver el libro pesa más que no verlo, pero «no traigo marca de ausencia» no
  // es «lo he visto»: la mayoría de dispositivos no recorren el servidor y no
  // opinan. Por eso el avistamiento se apunta con su fecha (`presenteHasta`) y
  // solo esa fecha invalida una ausencia anterior. Si las dos siguen en pie,
  // el plazo corre desde la primera vez que se notó, no desde la última.
  const presenteHasta = fechaMaxima(local.presenteHasta, remoto.presenteHasta);
  if (presenteHasta > FECHA_CERO) resultado.presenteHasta = presenteHasta;
  const ausencias = [local.ausenteDesde, remoto.ausenteDesde]
    .filter((fecha) => fecha && fecha > presenteHasta)
    .sort();
  if (ausencias.length) [resultado.ausenteDesde] = ausencias;
  else delete resultado.ausenteDesde;
  resultado.actualizado = fechaMaxima(
    resultado.posicionActualizada,
    resultado.marcadoresActualizados,
    resultado.terminadoActualizado,
    resultado.tituloActualizado,
    resultado.notaActualizada,
    ...marcadores.map((marcador) => marcador.actualizado),
  );
  return resultado;
}

// ¿Guarda esta entrada algo que merezca la pena recordar? Abrir un libro y
// cerrarlo sin leer, o deshacer todo lo que tenía, deja una entrada que solo
// dice el nombre del archivo: no aporta nada y hace crecer el archivo
// compartido sin motivo. Los marcadores cuentan aunque estén borrados: son la
// prueba de que se borraron, y sin ella otro dispositivo los resucitaría.
function entradaAporta(entrada) {
  if (!entrada) return false;
  if (typeof entrada.cfi === 'string' && entrada.cfi) return true;
  if (Number(entrada.pagina) > 0) return true;
  if (typeof entrada.terminado === 'boolean') return true;
  if (typeof entrada.titulo === 'string' && entrada.titulo.trim()) return true;
  if (typeof entrada.nota === 'string' && entrada.nota.trim()) return true;
  // El tiempo dedicado también es memoria: un libro terminado y quitado de
  // «Continuar leyendo» sigue diciendo cuánto costó leerlo.
  if (Object.keys(entrada.tiempos ?? {}).length) return true;
  return Boolean(entrada.marcadores?.length);
}

// ───────────── Libros que ya no están en el servidor ─────────────
//
// Cuando un libro desaparece del servidor, su entrada se queda aquí para
// siempre y el archivo compartido crece sin parar. Pasa borrándolo desde fuera
// (otro cliente WebDAV, el gestor de archivos del móvil), y también borrándolo
// desde PageKeeper: el dispositivo que borra limpia su entrada, pero los demás
// guardan su copia y la reponen al sincronizar, porque nadie les contó que se
// había borrado.
//
// «No lo veo» no es «no está»: un listado a medias, una carpeta sin permisos
// o una ruta escrita con las tildes en otra forma Unicode harían desaparecer
// progreso vivo. Por eso la ausencia solo se apunta (`ausenteDesde`), hay que
// sostenerla el plazo elegido para que la entrada caiga, y basta con que un
// dispositivo vuelva a ver el libro —la fusión hace que ver gane a no ver—
// para que la marca se borre. Quien llama debe pasar un inventario completo:
// si algo falló al recorrer el servidor, no hay conciliación que valga.
//
// Devuelve los identificadores purgados, para que la aplicación tire también
// de lo que colgaba de ellos (anotaciones, copia sin conexión, portada).
// Con `ahora` se salta la espera: es el borrado inmediato del informe.
export async function conciliarPresencia(idsPresentes, cliente, { ahora: yaMismo = false } = {}) {
  const presentes = new Set([...idsPresentes].map((id) => id.normalize('NFC')));
  const datos = cargarLocal();
  const dias = diasDeGracia(datos);
  const ahora = Date.now();
  const purgados = [];
  let cambiado = false;
  for (const [id, entrada] of Object.entries(datos.libros)) {
    if (id.startsWith('local:')) continue;
    if (presentes.has(id.normalize('NFC'))) {
      const visto = Date.parse(entrada.presenteHasta ?? '');
      // El avistamiento se refresca con cuentagotas: si se anotara en cada
      // pasada, el archivo compartido se subiría entero todos los días para
      // no decir nada nuevo. Con una semana de holgura sigue sobrando margen
      // frente al plazo de gracia.
      if (!entrada.ausenteDesde
        && Number.isFinite(visto) && ahora - visto < MS_REFRESCO_PRESENCIA) continue;
      delete entrada.ausenteDesde;
      entrada.presenteHasta = new Date(ahora).toISOString();
      cambiado = true;
      continue;
    }
    const desde = Date.parse(entrada.ausenteDesde ?? '');
    if (!Number.isFinite(desde)) {
      entrada.ausenteDesde = new Date(ahora).toISOString();
      cambiado = true;
      continue;
    }
    // Sin plazo no se borra nada: la ausencia se sigue apuntando para poder
    // contarla en el informe, pero la entrada se queda.
    if (!yaMismo && (!dias || ahora - desde < dias * MS_DIA)) continue;
    delete datos.libros[id];
    descartarCambiosPendientes(id);
    purgados.push(id);
  }
  if (!cambiado && !purgados.length) return purgados;
  guardarLocal(datos);
  if (!cliente) return purgados;
  // Como en cualquier borrado: se registra antes de tocar la red para que la
  // entrada no vuelva del servidor mientras se reintenta.
  for (const id of purgados) marcarBorradoPendiente(id, cliente);
  await sincronizar(cliente);
  return purgados;
}

// Los libros locales viven dentro de este navegador: nadie puede borrarlos por
// fuera, así que aquí el inventario es la verdad y no hacen falta ni marcas ni
// esperas. Solo cabe encontrar restos de un borrado que se quedó a medias.
// `inventarioFiable` distingue «no hay libros» de «no se pudo mirar».
export function conciliarLocales(idsPresentes, inventarioFiable = true) {
  if (!inventarioFiable) return [];
  const presentes = new Set([...idsPresentes].map((id) => id.normalize('NFC')));
  const datos = cargarLocal();
  const purgados = [];
  for (const id of Object.keys(datos.libros)) {
    if (!id.startsWith('local:') || presentes.has(id.normalize('NFC'))) continue;
    delete datos.libros[id];
    descartarCambiosPendientes(id);
    purgados.push(id);
  }
  if (purgados.length) guardarLocal(datos);
  return purgados;
}

// ───────────── Plazo de borrado (compartido) ─────────────
//
// Vive en el archivo del servidor, junto a los libros, para que todos los
// dispositivos cuenten los mismos días y borren el mismo día. Gana el último
// que lo tocó, con su propia fecha, como el título o la nota de un libro.
export function diasDeGracia(datos = cargarLocal()) {
  const dias = Number(datos?.ajustes?.diasGracia);
  return DIAS_GRACIA_POSIBLES.includes(dias) ? dias : DIAS_GRACIA_AUSENCIA;
}

export function guardarDiasDeGracia(dias) {
  const datos = cargarLocal();
  datos.ajustes = {
    ...datos.ajustes,
    diasGracia: DIAS_GRACIA_POSIBLES.includes(Number(dias)) ? Number(dias) : DIAS_GRACIA_AUSENCIA,
    ajustesActualizados: new Date().toISOString(),
  };
  guardarLocal(datos);
  return diasDeGracia(datos);
}

function fusionarAjustes(local, remoto) {
  if (!local?.ajustesActualizados) return remoto ?? local;
  if (!remoto?.ajustesActualizados) return local;
  return local.ajustesActualizados >= remoto.ajustesActualizados ? local : remoto;
}

// Entradas que este dispositivo echa en falta, con el día en que caerán.
// Es lo que enseña el informe de los ajustes.
export function ausentes(datos = cargarLocal()) {
  const dias = diasDeGracia(datos);
  return Object.entries(datos.libros)
    .filter(([id, entrada]) => !id.startsWith('local:') && entrada.ausenteDesde)
    .map(([id, entrada]) => ({
      id,
      ausenteDesde: entrada.ausenteDesde,
      borradoEl: dias
        ? new Date(Date.parse(entrada.ausenteDesde) + dias * MS_DIA).toISOString()
        : null,
    }))
    .sort((uno, otro) => uno.ausenteDesde.localeCompare(otro.ausenteDesde));
}

let colaSincronizacion = Promise.resolve();

async function sincronizarAhora(cliente) {
  for (let intento = 0; intento < 4; intento++) {
    // La red se espera antes de leer localStorage para no sobrescribir una
    // página que haya cambiado mientras llegaba la respuesta del servidor.
    const respuestaRemota = await cliente.leerProgreso();
    const remotoLeido = respuestaRemota ?? { version: 1, libros: {} };
    const remotoOriginal = JSON.stringify(remotoLeido);
    const remoto = normalizarDatos(remotoLeido);
    // Cada paso por aquí deja constancia de que este dispositivo sigue vivo.
    anotarDispositivo();
    const local = normalizarDatos(cargarLocal());
    const cambios = cargarCambiosPendientes();
    const confirmables = {};
    const borradosPendientes = cargarBorradosPendientes(cliente);

    // Se aplican antes de fusionar para que una entrada remota obsoleta nunca
    // vuelva a aparecer mientras se reintenta su limpieza.
    for (const id of borradosPendientes) {
      delete local.libros[id];
      delete remoto.libros[id];
    }
    // El plazo de borrado y el registro de dispositivos son de la biblioteca,
    // no de cada libro: se resuelven aparte y quedan iguales en los dos lados.
    const ajustes = fusionarAjustes(local.ajustes, remoto.ajustes);
    if (ajustes) {
      local.ajustes = ajustes;
      remoto.ajustes = ajustes;
    }
    // Un borrado de estadísticas se obedece antes de fusionar nada: si se
    // dejara para después, el bucle de libros volvería a meter los tiempos
    // que acaba de traer el servidor.
    const selloLocal = local.estadisticasBorradas ?? FECHA_CERO;
    const selloRemoto = remoto.estadisticasBorradas ?? FECHA_CERO;
    const selloBorrado = fechaMaxima(selloLocal, selloRemoto);
    if (selloBorrado > FECHA_CERO) {
      local.estadisticasBorradas = selloBorrado;
      remoto.estadisticasBorradas = selloBorrado;
      // Solo se vacía el lado que venía por detrás: si los dos llevan el mismo
      // sello, el borrado ya está hecho y lo que haya es lectura posterior.
      if (selloLocal < selloBorrado) vaciarEstadisticas(local);
      if (selloRemoto < selloBorrado) vaciarEstadisticas(remoto);
    }
    // Los días de lectura son de la biblioteca entera, no de un libro: como
    // los ajustes y el registro de dispositivos, se resuelven aparte y quedan
    // iguales en los dos lados.
    const estadisticasFusionadas = fusionarEstadisticas(local.estadisticas, remoto.estadisticas);
    if (Object.keys(estadisticasFusionadas).length) {
      local.estadisticas = estadisticasFusionadas;
      remoto.estadisticas = estadisticasFusionadas;
    } else {
      delete local.estadisticas;
      delete remoto.estadisticas;
    }
    const dispositivosFusionados = fusionarDispositivos(local.dispositivos, remoto.dispositivos);
    caducarDispositivos({ dispositivos: dispositivosFusionados }, diasDeGracia(local));
    if (Object.keys(dispositivosFusionados).length) {
      local.dispositivos = dispositivosFusionados;
      remoto.dispositivos = dispositivosFusionados;
    } else {
      delete local.dispositivos;
      delete remoto.dispositivos;
    }
    const ids = new Set([...Object.keys(local.libros), ...Object.keys(remoto.libros)]);
    for (const id of ids) {
      if (id.startsWith('local:')) continue;
      const mio = local.libros[id];
      const suyo = remoto.libros[id];
      // `visto` es la memoria de este dispositivo —qué posición remota llegó a
      // conocer— y por eso se guarda solo en local: en el archivo compartido
      // cada aparato pisaría la del anterior y no significaría nada.
      if (mio && suyo) {
        const fusionado = fusionarEntradas(mio, suyo, cambios[id]);
        local.libros[id] = { ...fusionado, visto: fusionado.posicionActualizada };
        remoto.libros[id] = sinVisto(fusionado);
      } else if (mio) remoto.libros[id] = sinVisto(normalizarEntrada(mio));
      else if (suyo) {
        const entrada = normalizarEntrada(suyo);
        local.libros[id] = { ...entrada, visto: entrada.posicionActualizada };
      }
      // Lo que no recuerda nada no ocupa sitio en el archivo compartido.
      if (!entradaAporta(local.libros[id])) {
        delete local.libros[id];
        delete remoto.libros[id];
      }
      if (cambios[id]) confirmables[id] = structuredClone(cambios[id]);
    }

    guardarLocal(local);
    const haySubida = JSON.stringify(remoto) !== remotoOriginal;
    try {
      if (haySubida) await cliente.escribirProgreso(remoto);
    } catch (error) {
      if (error.conflictoSincronizacion && intento < 3) continue;
      throw error;
    }
    for (const id of borradosPendientes) completarBorradoPendiente(id, cliente);
    limpiarCambiosConfirmados(confirmables);
    return local;
  }
  throw new Error('No se pudo sincronizar el progreso tras varios cambios simultáneos.');
}

// Serializa las sincronizaciones de esta pestaña para que dos acciones de la
// misma aplicación no escriban el archivo remoto a la vez.
export function sincronizar(cliente) {
  const tarea = colaSincronizacion.catch(() => null).then(() => sincronizarAhora(cliente));
  colaSincronizacion = tarea;
  return tarea;
}

// Traspasa la entrada local de un libro a otro identificador (p. ej. al
// moverlo de carpeta). La fecha se renueva para que la fusión "gana la más
// reciente" propague la entrada nueva; la limpieza del id antiguo corre a
// cargo de olvidar().
export function renombrar(idViejo, idNuevo) {
  const datos = cargarLocal();
  const entrada = datos.libros[idViejo];
  if (!entrada) return;
  datos.libros[idNuevo] = {
    ...entrada,
    actualizado: new Date().toISOString(),
    dispositivo: nombreDispositivo(),
  };
  delete datos.libros[idViejo];
  guardarLocal(datos);
  // Si el nuevo id tenía una limpieza pendiente (un libro anterior con el
  // mismo nombre), la entrada recién creada la cancela.
  completarBorradoPendiente(idNuevo);
}

// Traspasa a otra ruta todas las entradas que cuelgan de un prefijo: lo que
// hace falta al renombrar una carpeta de la nube, donde el id del libro es su
// ruta. Es renombrar() en bloque, más la limpieza de los ids viejos en el
// archivo remoto, donde esa carpeta ya no existe.
export async function renombrarPorPrefijo(prefijoViejo, prefijoNuevo, cliente = null) {
  // Primero se importa lo que solo estuviera en remoto: si no, el renombrado
  // dejaría atrás los libros que este dispositivo no había visto.
  if (cliente) await sincronizar(cliente).catch(() => null);
  const ids = Object.keys(cargarLocal().libros).filter((id) => id.startsWith(prefijoViejo));
  if (!ids.length) return;
  for (const id of ids) {
    renombrar(id, prefijoNuevo + id.slice(prefijoViejo.length));
    descartarCambiosPendientes(id);
  }
  if (!cliente) return;
  for (const id of ids) marcarBorradoPendiente(id, cliente);
  await sincronizar(cliente);
}

// Elimina el progreso de todos los libros bajo un prefijo de ruta (una
// carpeta borrada con su contenido), en local y en el archivo remoto.
export async function olvidarPorPrefijo(prefijo, cliente = null) {
  // Importa primero cualquier entrada que solo exista en remoto para que la
  // eliminación de una carpeta alcance también a esos libros.
  if (cliente) await sincronizar(cliente).catch(() => null);
  const local = cargarLocal();
  const ids = Object.keys(local.libros).filter((id) => id.startsWith(prefijo));
  for (const id of ids) {
    delete local.libros[id];
    descartarCambiosPendientes(id);
  }
  guardarLocal(local);

  if (!cliente) return;
  for (const id of ids) marcarBorradoPendiente(id, cliente);
  await sincronizar(cliente);
}

// Elimina el progreso de un libro borrado, en local y, si hay cliente,
// también en el archivo remoto (para que no reaparezca al sincronizar).
export async function olvidar(idLibro, cliente = null) {
  const local = cargarLocal();
  delete local.libros[idLibro];
  descartarCambiosPendientes(idLibro);
  guardarLocal(local);

  if (!cliente) return;
  // Se registra antes de tocar la red. Si falla, sincronizar() lo reintentará
  // y bloqueará mientras tanto la reimportación de la entrada obsoleta.
  marcarBorradoPendiente(idLibro, cliente);
  await sincronizar(cliente);
}

function nombreDispositivo() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad/i.test(ua)) return 'iOS';
  if (/linux/i.test(ua)) return 'Linux';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac/i.test(ua)) return 'Mac';
  return 'desconocido';
}

// ───────────────────── Dispositivos conectados ─────────────────────
//
// Quién está usando esta biblioteca. Cada navegador se pone un identificador
// al azar (solo suyo, nunca sale de su localStorage salvo como clave) y anota
// en el archivo compartido cuándo pasó por aquí por última vez.
//
// «Desconectar» no expulsa a nadie: no hay sesiones que cerrar, solo una
// contraseña de aplicación que el dispositivo ya tiene guardada. Lo que hace
// es pedirle que se dé de baja, y el dispositivo obedece al abrirse: borra su
// configuración de nube y pide volver a escribirla. Sirve para quitar de en
// medio un aparato viejo, no para echar a un intruso; para eso hay que borrar
// la contraseña de aplicación en el servidor, y así lo dice la pantalla.
const CLAVE_ID_DISPOSITIVO = 'lector.idDispositivo';
// Cada cuánto se vuelve a anotar el paso por aquí (como con la presencia de
// los libros: sin esto el archivo se subiría entero a cada sincronización).
const MS_REFRESCO_DISPOSITIVO = 12 * 60 * 60 * 1000;

// Qué navegador es. Junto al sistema da un nombre reconocible sin tener que
// bautizar nada: «Firefox en Linux» se distingue de «Chrome en Linux».
function nombreNavegador() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  // Chrome se declara Safari, así que Safari es lo que queda al descartarlo.
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return '';
}

// El modelo, cuando el navegador lo dice. Chrome lo oculta desde hace unas
// versiones (manda «K» en su lugar), así que la mayoría de las veces no habrá.
function modeloDispositivo() {
  const modelo = navigator.userAgent.match(/Android [\d.]+; ([^);]+?)(?: Build\/[^)]*)?\)/)?.[1];
  if (!modelo || modelo.length < 2 || modelo === 'K' || /^wv$/i.test(modelo)) return '';
  return modelo.trim().slice(0, 40);
}

// Un código corto y estable con el que reconocer un dispositivo de un vistazo,
// sobre todo cuando hay dos iguales: dos móviles Android se ven distintos aquí
// aunque nadie les haya puesto nombre. Sale del identificador, así que cada
// aparato puede leer el suyo en su propia ficha y compararlo.
export function codigoDispositivo(id) {
  return String(id ?? '').replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
}

export function idDispositivo() {
  let id = localStorage.getItem(CLAVE_ID_DISPOSITIVO);
  if (!id) {
    id = crypto.randomUUID?.() ?? `d${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLAVE_ID_DISPOSITIVO, id);
  }
  return id;
}

// Deja constancia de que este dispositivo sigue en uso. Devuelve si hubo algo
// que apuntar, para no forzar una subida cuando no cambia nada.
//
// El alta hay que pedirla (`crear`): así una sincronización suelta no da de
// alta a quien acaba de darse de baja, que volvería a la lista como un
// dispositivo nuevo justo al desconectarlo.
export function anotarDispositivo({ crear = false } = {}) {
  const id = crear ? idDispositivo() : localStorage.getItem(CLAVE_ID_DISPOSITIVO);
  if (!id) return false;
  const datos = cargarLocal();
  const anterior = datos.dispositivos?.[id];
  const ahora = Date.now();
  const visto = Date.parse(anterior?.ultimaVez ?? '');
  if (anterior && !anterior.revocado
    && Number.isFinite(visto) && ahora - visto < MS_REFRESCO_DISPOSITIVO) return false;
  const { revocado, ...resto } = anterior ?? {};
  datos.dispositivos = {
    ...datos.dispositivos,
    [id]: {
      ...resto,
      sistema: nombreDispositivo(),
      navegador: nombreNavegador(),
      ...(modeloDispositivo() ? { modelo: modeloDispositivo() } : {}),
      alta: anterior?.alta ?? new Date(ahora).toISOString(),
      ultimaVez: new Date(ahora).toISOString(),
    },
  };
  guardarLocal(datos);
  return true;
}

export function dispositivos(datos = cargarLocal()) {
  const propio = localStorage.getItem(CLAVE_ID_DISPOSITIVO);
  return Object.entries(datos.dispositivos ?? {})
    .map(([id, dispositivo]) => ({
      ...dispositivo, id, codigo: codigoDispositivo(id), esteMismo: id === propio,
    }))
    .sort((uno, otro) => (otro.ultimaVez ?? '').localeCompare(uno.ultimaVez ?? ''));
}

export function renombrarDispositivo(id, nombre) {
  const datos = cargarLocal();
  const dispositivo = datos.dispositivos?.[id];
  if (!dispositivo) return;
  const limpio = String(nombre ?? '').trim().slice(0, 60);
  if (limpio) dispositivo.nombre = limpio;
  else delete dispositivo.nombre;
  dispositivo.nombreActualizado = new Date().toISOString();
  guardarLocal(datos);
}

// Le pide al dispositivo que se dé de baja la próxima vez que se abra.
export function revocarDispositivo(id) {
  const datos = cargarLocal();
  const dispositivo = datos.dispositivos?.[id];
  if (!dispositivo) return;
  dispositivo.revocado = new Date().toISOString();
  guardarLocal(datos);
}

// ¿Le han pedido a este dispositivo que se dé de baja? Al obedecer tira su
// identificador, así que volver a configurarlo lo da de alta como uno nuevo.
// Su ficha antigua se queda en la lista, marcada, hasta que caduque: mientras
// siga ahí es la prueba de que la orden aún no ha llegado a su destino.
export function revocacionPendiente(datos = cargarLocal()) {
  const id = localStorage.getItem(CLAVE_ID_DISPOSITIVO);
  return Boolean(id && datos.dispositivos?.[id]?.revocado);
}

export function acatarRevocacion() {
  const id = localStorage.getItem(CLAVE_ID_DISPOSITIVO);
  if (!id) return;
  // La ficha se queda, pero deja dicho que la orden llegó a su destino: si se
  // borrara sin más, volvería del archivo compartido en la siguiente
  // sincronización y parecería que el dispositivo sigue sin enterarse.
  const datos = cargarLocal();
  if (datos.dispositivos?.[id]) {
    datos.dispositivos[id].baja = new Date().toISOString();
    guardarLocal(datos);
  }
  localStorage.removeItem(CLAVE_ID_DISPOSITIVO);
}

// Los dispositivos que llevan sin aparecer más que el plazo de la limpieza se
// caen del registro: es la misma idea (y el mismo plazo elegido) que con los
// libros que ya no están.
function caducarDispositivos(datos, dias) {
  if (!dias || !datos.dispositivos) return false;
  const limite = Date.now() - dias * MS_DIA;
  let cambiado = false;
  for (const [id, dispositivo] of Object.entries(datos.dispositivos)) {
    const visto = Date.parse(dispositivo.ultimaVez ?? '');
    if (!Number.isFinite(visto) || visto >= limite) continue;
    delete datos.dispositivos[id];
    cambiado = true;
  }
  return cambiado;
}

// Al fusionar manda la anotación más reciente de cada dispositivo; el nombre
// va aparte, con su propia fecha, para que renombrarlo desde un aparato no lo
// pise el otro por el simple hecho de haberse conectado después.
function fusionarDispositivos(local = {}, remoto = {}) {
  const fusionados = {};
  for (const id of new Set([...Object.keys(local), ...Object.keys(remoto)])) {
    const mio = local[id];
    const suyo = remoto[id];
    if (!mio || !suyo) {
      fusionados[id] = mio ?? suyo;
      continue;
    }
    const reciente = (mio.ultimaVez ?? '') >= (suyo.ultimaVez ?? '') ? mio : suyo;
    const nombrado = (mio.nombreActualizado ?? '') >= (suyo.nombreActualizado ?? '') ? mio : suyo;
    const revocado = [mio.revocado, suyo.revocado].filter(Boolean).sort().at(-1);
    fusionados[id] = { ...reciente };
    if (nombrado.nombre) fusionados[id].nombre = nombrado.nombre;
    else delete fusionados[id].nombre;
    if (nombrado.nombreActualizado) fusionados[id].nombreActualizado = nombrado.nombreActualizado;
    // Una revocación posterior a la última conexión sigue en pie; si el
    // dispositivo se ha conectado después, es que ya la acató o volvió a
    // configurarse, y no hay nada que reclamar.
    if (revocado && revocado > (fusionados[id].ultimaVez ?? '')) fusionados[id].revocado = revocado;
    else delete fusionados[id].revocado;
  }
  return fusionados;
}
