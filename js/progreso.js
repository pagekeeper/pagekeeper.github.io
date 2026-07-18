// Gestión del progreso de lectura.
//
// El progreso vive en dos sitios:
//  - localStorage: siempre, para acceso inmediato y modo sin conexión.
//  - lector-progreso.json en el servidor WebDAV: para sincronizar entre
//    dispositivos. En cada libro gana la entrada con fecha más reciente.

const CLAVE_LOCAL = 'lector.progreso';

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

export function anotarPagina(idLibro, pagina, totalPaginas) {
  const datos = cargarLocal();
  datos.libros[idLibro] = {
    pagina,
    paginas: totalPaginas,
    actualizado: new Date().toISOString(),
    dispositivo: nombreDispositivo(),
  };
  guardarLocal(datos);
  return datos.libros[idLibro];
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
  return local;
}

// Elimina el progreso de un libro borrado, en local y, si hay cliente,
// también en el archivo remoto (para que no reaparezca al sincronizar).
export async function olvidar(idLibro, cliente = null) {
  const local = cargarLocal();
  delete local.libros[idLibro];
  guardarLocal(local);

  if (!cliente) return;
  const remoto = await cliente.leerProgreso();
  if (remoto?.libros && idLibro in remoto.libros) {
    delete remoto.libros[idLibro];
    await cliente.escribirProgreso(remoto);
  }
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
