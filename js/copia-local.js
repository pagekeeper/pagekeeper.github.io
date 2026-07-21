// Formato portable de copia de la biblioteca local. Este módulo no accede al
// navegador para que la validación y la fusión puedan probarse por separado.

export const FORMATO_COPIA_LOCAL = 'pagekeeper-local-backup';
export const VERSION_COPIA_LOCAL = 2;

export function crearManifiestoCopia({
  libros, progreso, anotaciones, preferencias, creado, origen = 'local',
}) {
  return {
    formato: FORMATO_COPIA_LOCAL,
    version: VERSION_COPIA_LOCAL,
    origen,
    creado: creado ?? new Date().toISOString(),
    libros: libros.map(({ id, nombre, tamano, anadido }, indice) => ({
      id, nombre, tamano, anadido,
      archivo: `libros/${indice}.${/\.epub$/i.test(nombre) ? 'epub' : 'pdf'}`,
    })),
    progreso,
    anotaciones,
    preferencias,
  };
}

function objeto(valor) {
  return valor && typeof valor === 'object' && !Array.isArray(valor);
}

export function validarManifiestoCopia(manifiesto) {
  if (!objeto(manifiesto) || manifiesto.formato !== FORMATO_COPIA_LOCAL ||
      ![1, VERSION_COPIA_LOCAL].includes(manifiesto.version) || !Array.isArray(manifiesto.libros)) {
    throw new Error('INVALID_BACKUP');
  }
  const origen = manifiesto.version === 1 ? 'local' : manifiesto.origen;
  if (!['local', 'webdav'].includes(origen)) throw new Error('INVALID_BACKUP');
  if (manifiesto.libros.length > 10000) throw new Error('INVALID_BACKUP');
  const ids = new Set();
  const archivos = new Set();
  for (const libro of manifiesto.libros) {
    if (!objeto(libro)) throw new Error('INVALID_BACKUP');
    const idValido = origen === 'local'
      ? typeof libro.id === 'string' && libro.id.startsWith('local:')
      : rutaRemotaValida(libro.id) && libro.id.split('/').at(-1) === libro.nombre;
    if (!idValido ||
        typeof libro.nombre !== 'string' || !/\.(pdf|epub)$/i.test(libro.nombre) ||
        !Number.isSafeInteger(libro.tamano) || libro.tamano < 0 ||
        typeof libro.archivo !== 'string' || !/^libros\/\d+\.(pdf|epub)$/i.test(libro.archivo) ||
        ids.has(libro.id) || archivos.has(libro.archivo)) {
      throw new Error('INVALID_BACKUP');
    }
    ids.add(libro.id);
    archivos.add(libro.archivo);
  }
  if (manifiesto.progreso !== undefined && !objeto(manifiesto.progreso)) {
    throw new Error('INVALID_BACKUP');
  }
  if (manifiesto.anotaciones !== undefined && !Array.isArray(manifiesto.anotaciones)) {
    throw new Error('INVALID_BACKUP');
  }
  if (manifiesto.preferencias !== undefined && !objeto(manifiesto.preferencias)) {
    throw new Error('INVALID_BACKUP');
  }
  return { manifiesto: { ...manifiesto, origen }, ids, origen };
}

function rutaRemotaValida(ruta) {
  return typeof ruta === 'string' && ruta.length > 0 && ruta.length < 2000 &&
    !ruta.startsWith('/') && !ruta.includes('\\') &&
    ruta.split('/').every((segmento) => segmento && segmento !== '.' && segmento !== '..');
}

export function fusionarProgresoRestaurado(actual, importado, ids) {
  const resultado = {
    ...(objeto(actual) ? actual : { version: 2, libros: {} }),
    libros: { ...(objeto(actual?.libros) ? actual.libros : {}) },
  };
  const librosImportados = objeto(importado?.libros) ? importado.libros : {};
  for (const id of ids) {
    if (objeto(librosImportados[id])) resultado.libros[id] = librosImportados[id];
  }
  resultado.version = Math.max(Number(resultado.version) || 1, Number(importado?.version) || 1);
  return resultado;
}

export function carpetasRemotasDeLibros(libros) {
  const carpetas = new Set();
  for (const libro of libros) {
    const segmentos = libro.id.split('/').slice(0, -1);
    for (let i = 1; i <= segmentos.length; i++) carpetas.add(segmentos.slice(0, i).join('/'));
  }
  return [...carpetas].sort((a, b) =>
    a.split('/').length - b.split('/').length || a.localeCompare(b, 'es'));
}
