// Gestión del progreso de lectura.
//
// El progreso vive en dos sitios:
//  - localStorage: siempre, para acceso inmediato y modo sin conexión.
//  - lector-progreso.json en el servidor WebDAV: para sincronizar entre
//    dispositivos. En cada libro gana la entrada con fecha más reciente.

const CLAVE_LOCAL = 'lector.progreso';
const CLAVE_BORRADOS_PENDIENTES = 'lector.progreso.borradosPendientes';

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
  // Los marcadores conviven con la posición en la misma entrada: al anotar
  // una página nueva se conservan los que ya hubiera.
  const { marcadores: marcadoresExtra, ...resto } = extra;
  const marcadores = marcadoresExtra ?? datos.libros[idLibro]?.marcadores;
  datos.libros[idLibro] = {
    ...resto,
    ...(Array.isArray(marcadores) && marcadores.length ? { marcadores } : {}),
    pagina,
    paginas: totalPaginas,
    actualizado: new Date().toISOString(),
    dispositivo: nombreDispositivo(),
  };
  guardarLocal(datos);
  return datos.libros[idLibro];
}

export function marcadoresDe(idLibro) {
  const marcadores = progresoDe(idLibro)?.marcadores;
  return Array.isArray(marcadores) ? [...marcadores] : [];
}

// Sustituye la lista de marcadores de un libro. Actualiza la fecha de la
// entrada para que la fusión "gana la más reciente" propague el cambio.
export function guardarMarcadores(idLibro, marcadores) {
  const datos = cargarLocal();
  const entrada = datos.libros[idLibro] ?? { pagina: 0, paginas: 0 };
  if (marcadores.length) entrada.marcadores = marcadores;
  else delete entrada.marcadores;
  entrada.actualizado = new Date().toISOString();
  entrada.dispositivo = nombreDispositivo();
  datos.libros[idLibro] = entrada;
  guardarLocal(datos);
}

export function progresoDe(idLibro) {
  return cargarLocal().libros[idLibro] ?? null;
}

// Fusiona el progreso local con el remoto: para cada libro se queda la
// entrada más reciente. Devuelve el resultado y lo persiste en ambos lados
// (el PUT remoto solo si hubo cambios que subir).
export async function sincronizar(cliente) {
  const local = cargarLocal();
  const remoto = (await cliente.leerProgreso()) ?? { version: 1, libros: {} };
  if (typeof remoto.libros !== 'object' || !remoto.libros) remoto.libros = {};

  let haySubida = false;
  const borradosPendientes = cargarBorradosPendientes(cliente);
  // Se aplican antes de fusionar para que una entrada remota obsoleta nunca
  // vuelva a aparecer en localStorage mientras se reintenta su limpieza.
  for (const id of borradosPendientes) {
    delete local.libros[id];
    if (id in remoto.libros) {
      delete remoto.libros[id];
      haySubida = true;
    }
  }
  const ids = new Set([...Object.keys(local.libros), ...Object.keys(remoto.libros)]);
  for (const id of ids) {
    if (id.startsWith('local:')) continue; // libros locales: no se suben
    const mio = local.libros[id];
    const suyo = remoto.libros[id];
    if (mio && (!suyo || suyo.actualizado < mio.actualizado)) {
      remoto.libros[id] = mio;
      haySubida = true;
    } else if (suyo) {
      local.libros[id] = suyo;
    }
  }

  guardarLocal(local);
  if (haySubida) await cliente.escribirProgreso(remoto);
  // Llegar aquí confirma que el remoto ya no contiene esas entradas (o que
  // el PUT que las quitó terminó correctamente).
  if (borradosPendientes.size) {
    for (const id of borradosPendientes) completarBorradoPendiente(id, cliente);
  }
  return local;
}

// Elimina el progreso de un libro borrado, en local y, si hay cliente,
// también en el archivo remoto (para que no reaparezca al sincronizar).
export async function olvidar(idLibro, cliente = null) {
  const local = cargarLocal();
  delete local.libros[idLibro];
  guardarLocal(local);

  if (!cliente) return;
  // Se registra antes de tocar la red. Si falla, sincronizar() lo reintentará
  // y bloqueará mientras tanto la reimportación de la entrada obsoleta.
  marcarBorradoPendiente(idLibro, cliente);
  const remoto = await cliente.leerProgreso();
  if (remoto?.libros && idLibro in remoto.libros) {
    delete remoto.libros[idLibro];
    await cliente.escribirProgreso(remoto);
  }
  completarBorradoPendiente(idLibro, cliente);
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
