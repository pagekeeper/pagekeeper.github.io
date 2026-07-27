// Gestión del progreso de lectura.
//
// El progreso vive en dos sitios:
//  - localStorage: siempre, para acceso inmediato y modo sin conexión.
//  - lector-progreso.json en el servidor WebDAV: para sincronizar entre
//    dispositivos. La posición y los marcadores se fusionan por separado.

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
  return resultado;
}

function normalizarDatos(datos) {
  const normalizados = { ...datos, version: VERSION_DATOS, libros: {} };
  for (const [id, entrada] of Object.entries(datos?.libros ?? {})) {
    normalizados.libros[id] = normalizarEntrada(entrada);
  }
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
    // El plazo de borrado es de la biblioteca, no de cada libro: se resuelve
    // aparte y queda igual en los dos lados.
    const ajustes = fusionarAjustes(local.ajustes, remoto.ajustes);
    if (ajustes) {
      local.ajustes = ajustes;
      remoto.ajustes = ajustes;
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
