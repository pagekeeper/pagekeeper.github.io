// Formato portable de copia de la biblioteca local. Este módulo no accede al
// navegador para que la validación y la fusión puedan probarse por separado.

export const FORMATO_COPIA_LOCAL = 'pagekeeper-local-backup';
export const VERSION_COPIA_LOCAL = 3;
export const FORMATO_CONFIG_NUBE = 'pagekeeper-cloud-config';
export const VERSION_CONFIG_NUBE = 1;

export function validarConfigNube(config) {
  if (!objeto(config) || typeof config.url !== 'string' || !config.url.trim() ||
      config.url.length > 10000 || typeof config.usuario !== 'string' ||
      !config.usuario.trim() || config.usuario.length > 1000 ||
      (config.clave !== undefined &&
       (typeof config.clave !== 'string' || config.clave.length > 10000))) {
    throw new Error('INVALID_CLOUD_CONFIG');
  }
  return {
    url: config.url.trim(),
    usuario: config.usuario.trim(),
    clave: config.clave ?? '',
  };
}

export function crearCopiaConfigNube(config, creado) {
  return {
    formato: FORMATO_CONFIG_NUBE,
    version: VERSION_CONFIG_NUBE,
    creado: creado ?? new Date().toISOString(),
    config: validarConfigNube(config),
  };
}

export function validarCopiaConfigNube(copia) {
  if (!objeto(copia) || copia.formato !== FORMATO_CONFIG_NUBE ||
      copia.version !== VERSION_CONFIG_NUBE) {
    throw new Error('INVALID_CLOUD_CONFIG');
  }
  return validarConfigNube(copia.config);
}

export function crearManifiestoCopia({
  libros, progreso, anotaciones, preferencias, creado, origen = 'local', carpetas = [],
}) {
  return {
    formato: FORMATO_COPIA_LOCAL,
    version: VERSION_COPIA_LOCAL,
    origen,
    creado: creado ?? new Date().toISOString(),
    // En las copias de la nube la carpeta ya va dentro del id; en las del
    // dispositivo es un campo aparte y hay que llevarlo, junto con la lista de
    // carpetas, para que las vacías sobrevivan al viaje.
    libros: libros.map(({ id, nombre, tamano, anadido, carpeta }, indice) => ({
      id, nombre, tamano, anadido,
      ...(origen === 'local' && carpeta ? { carpeta } : {}),
      archivo: `libros/${indice}.${/\.epub$/i.test(nombre) ? 'epub' : 'pdf'}`,
    })),
    ...(origen === 'local' && carpetas.length ? { carpetas } : {}),
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
      ![1, 2, VERSION_COPIA_LOCAL].includes(manifiesto.version) || !Array.isArray(manifiesto.libros)) {
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
    if (!idValido || !carpetaCopiaValida(libro.carpeta) ||
        typeof libro.nombre !== 'string' || !/\.(pdf|epub)$/i.test(libro.nombre) ||
        !Number.isSafeInteger(libro.tamano) || libro.tamano < 0 ||
        typeof libro.archivo !== 'string' || !/^libros\/\d+\.(pdf|epub)$/i.test(libro.archivo) ||
        ids.has(libro.id) || archivos.has(libro.archivo)) {
      throw new Error('INVALID_BACKUP');
    }
    ids.add(libro.id);
    archivos.add(libro.archivo);
  }
  if (manifiesto.carpetas !== undefined &&
      (!Array.isArray(manifiesto.carpetas) || manifiesto.carpetas.length > 10000 ||
       !manifiesto.carpetas.every((ruta) => carpetaCopiaValida(ruta) && ruta))) {
    throw new Error('INVALID_BACKUP');
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

// La carpeta de un libro del dispositivo: ausente, vacía o una ruta relativa
// con tramos limpios. Las mismas reglas que una ruta remota, pero opcional.
function carpetaCopiaValida(carpeta) {
  if (carpeta === undefined || carpeta === '') return true;
  return rutaRemotaValida(carpeta);
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
