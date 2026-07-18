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
  const marcadores = Array.isArray(entrada.marcadores)
    ? entrada.marcadores.map((marcador) => normalizarMarcador(marcador, marcadoresActualizados))
    : [];
  const resultado = {
    ...entrada,
    posicionActualizada,
    marcadoresActualizados,
    marcadoresVersion: 2,
    actualizado: fechaMaxima(
      entrada.actualizado,
      posicionActualizada,
      marcadoresActualizados,
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

// El libro cuya posición cambió más recientemente es el candidato natural
// para «Continuar leyendo». Se usa la fecha de posición, no la de marcadores,
// para que editar una nota de un libro antiguo no lo convierta en el actual.
export function ultimoLibroLeido(datos = cargarLocal()) {
  let ultimo = null;
  for (const [id, entrada] of Object.entries(datos?.libros ?? {})) {
    if (!entrada || (!Number.isFinite(entrada.pagina) && !entrada.cfi)) continue;
    const fecha = entrada.posicionActualizada ?? entrada.actualizado ?? FECHA_CERO;
    if (!ultimo || fecha > ultimo.fecha) ultimo = { id, fecha, progreso: entrada };
  }
  return ultimo;
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
export function fusionarEntradas(localOriginal, remotoOriginal, cambioLocal = {}) {
  const local = normalizarEntrada(localOriginal);
  const remoto = normalizarEntrada(remotoOriginal);
  // La posición más reciente debe ganar también cuando haya un cambio local
  // pendiente. Dar prioridad incondicional al pendiente hacía que dos
  // dispositivos conservaran posiciones distintas y se sobrescribieran por
  // turnos cada vez que sincronizaban.
  const posicionLocal = local.posicionActualizada > remoto.posicionActualizada;
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
  resultado.actualizado = fechaMaxima(
    resultado.posicionActualizada,
    resultado.marcadoresActualizados,
    ...marcadores.map((marcador) => marcador.actualizado),
  );
  return resultado;
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
    const ids = new Set([...Object.keys(local.libros), ...Object.keys(remoto.libros)]);
    for (const id of ids) {
      if (id.startsWith('local:')) continue;
      const mio = local.libros[id];
      const suyo = remoto.libros[id];
      if (mio && suyo) {
        const fusionado = fusionarEntradas(mio, suyo, cambios[id]);
        local.libros[id] = fusionado;
        remoto.libros[id] = fusionado;
      } else if (mio) remoto.libros[id] = normalizarEntrada(mio);
      else if (suyo) local.libros[id] = normalizarEntrada(suyo);
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
