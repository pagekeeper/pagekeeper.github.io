// Almacén de libros locales en IndexedDB.
//
// Los PDF abiertos desde el dispositivo se guardan aquí para que aparezcan
// en la biblioteca y puedan reabrirse sin volver a elegir el archivo.
// Se usan nueve almacenes: los cuatro originales, dos para las copias de
// libros WebDAV, uno para las anotaciones locales y su cola de sincronización,
// otro para las localizaciones ya calculadas de cada EPUB y otro para las
// carpetas de la biblioteca del dispositivo.

const NOMBRE_BD = 'lector-pdf';
const VERSION = 7;

function abrirBd() {
  return new Promise((resolver, rechazar) => {
    const solicitud = indexedDB.open(NOMBRE_BD, VERSION);
    solicitud.onupgradeneeded = () => {
      const bd = solicitud.result;
      if (!bd.objectStoreNames.contains('libros')) bd.createObjectStore('libros', { keyPath: 'id' });
      if (!bd.objectStoreNames.contains('datos')) bd.createObjectStore('datos');
      if (!bd.objectStoreNames.contains('portadas')) bd.createObjectStore('portadas');
      if (!bd.objectStoreNames.contains('metadatos')) bd.createObjectStore('metadatos');
      if (!bd.objectStoreNames.contains('copias-remotas')) {
        const copias = bd.createObjectStore('copias-remotas', { keyPath: ['servidor', 'id'] });
        copias.createIndex('servidor', 'servidor');
      }
      if (!bd.objectStoreNames.contains('datos-remotos')) bd.createObjectStore('datos-remotos');
      if (!bd.objectStoreNames.contains('anotaciones')) {
        const anotaciones = bd.createObjectStore('anotaciones', { keyPath: ['ambito', 'libro'] });
        anotaciones.createIndex('ambito', 'ambito');
      }
      if (!bd.objectStoreNames.contains('localizaciones')) bd.createObjectStore('localizaciones');
      // Las carpetas se registran aparte de los libros para que puedan estar
      // vacías: crear una y llenarla después es lo normal.
      if (!bd.objectStoreNames.contains('carpetas-locales')) {
        bd.createObjectStore('carpetas-locales', { keyPath: 'ruta' });
      }
    };
    solicitud.onsuccess = () => resolver(solicitud.result);
    solicitud.onerror = () => rechazar(solicitud.error);
  });
}

function esperar(solicitud) {
  return new Promise((resolver, rechazar) => {
    solicitud.onsuccess = () => resolver(solicitud.result);
    solicitud.onerror = () => rechazar(solicitud.error);
  });
}

function esperarTransaccion(tx) {
  return new Promise((resolver, rechazar) => {
    tx.oncomplete = resolver;
    tx.onerror = () => rechazar(tx.error);
    tx.onabort = () => rechazar(tx.error ?? new Error('Transacción cancelada'));
  });
}

function tipoLibro(nombre) {
  return /\.epub$/i.test(nombre) ? 'application/epub+zip' : 'application/pdf';
}

export function copiaRemotaDesactualizada(copia, libro) {
  if (!copia) return false;
  if (copia.etag && libro.etag) return copia.etag !== libro.etag;
  if (copia.modificado && libro.modificado) return copia.modificado !== libro.modificado;
  return Boolean(copia.tamano && libro.tamano && copia.tamano !== libro.tamano);
}

export function bibliotecaDeCopias(copias, ruta = '') {
  const prefijo = ruta ? `${ruta}/` : '';
  const carpetas = new Set();
  const libros = [];
  for (const copia of copias) {
    if (!copia.id.startsWith(prefijo)) continue;
    const resto = copia.id.slice(prefijo.length);
    if (!resto || resto.includes('/')) {
      if (resto.includes('/')) carpetas.add(resto.split('/')[0]);
      continue;
    }
    libros.push({
      nombre: resto,
      tamano: copia.tamano,
      etag: copia.etag,
      modificado: copia.modificado,
    });
  }
  return {
    carpetas: [...carpetas].sort((a, b) => a.localeCompare(b, 'es')).map((nombre) => ({ nombre })),
    libros,
  };
}

// ── Carpetas de la biblioteca del dispositivo ──
//
// A diferencia de la nube, aquí la carpeta es un campo del registro y no parte
// del identificador: el id de un libro local («local:nombre:tamaño») es la
// clave de su progreso, sus marcadores, sus anotaciones y su portada, así que
// mover un libro de carpeta no debe tocarlo. Mover es, literalmente, cambiar
// una cadena.

// Deja una ruta en su forma canónica: sin barras sobrantes ni tramos vacíos.
export function normalizarCarpeta(ruta) {
  return String(ruta ?? '').split('/').map((tramo) => tramo.trim()).filter(Boolean).join('/');
}

export function nombreCarpetaValido(nombre) {
  const limpio = String(nombre ?? '').trim();
  return Boolean(limpio) && limpio.length <= 120 &&
    !/[/\\]/.test(limpio) && !limpio.startsWith('.');
}

// Un nivel de la biblioteca local: las subcarpetas que cuelgan directamente de
// `ruta` y los libros que están justo ahí. Las carpetas salen tanto del
// registro propio (pueden estar vacías) como de los libros, por si un registro
// se perdiera. Función pura: se prueba sin IndexedDB.
export function bibliotecaLocal(libros, carpetas = [], ruta = '') {
  const base = normalizarCarpeta(ruta);
  const prefijo = base ? `${base}/` : '';
  const nombres = new Set();
  const dentro = [];
  const anotarCarpeta = (carpeta) => {
    const valor = normalizarCarpeta(carpeta);
    if (base ? !valor.startsWith(prefijo) : !valor) return;
    const resto = valor.slice(prefijo.length);
    if (resto) nombres.add(resto.split('/')[0]);
  };
  for (const carpeta of carpetas) anotarCarpeta(typeof carpeta === 'string' ? carpeta : carpeta.ruta);
  for (const libro of libros) {
    const carpeta = normalizarCarpeta(libro.carpeta);
    if (carpeta === base) dentro.push(libro);
    else anotarCarpeta(carpeta);
  }
  return {
    carpetas: [...nombres].sort((a, b) => a.localeCompare(b, 'es')).map((nombre) => ({ nombre })),
    libros: dentro,
  };
}

export async function listarCarpetasLocales() {
  const bd = await abrirBd();
  try {
    const carpetas = await esperar(
      bd.transaction('carpetas-locales').objectStore('carpetas-locales').getAll(),
    );
    return carpetas.map((carpeta) => carpeta.ruta)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'es'));
  } finally {
    bd.close();
  }
}

export async function crearCarpetaLocal(ruta) {
  const destino = normalizarCarpeta(ruta);
  if (!destino) return;
  const bd = await abrirBd();
  try {
    const tx = bd.transaction('carpetas-locales', 'readwrite');
    // También las intermedias: una subcarpeta creada de golpe no debe dejar
    // huecos en el camino.
    const tramos = destino.split('/');
    for (let i = 1; i <= tramos.length; i++) {
      tx.objectStore('carpetas-locales').put({ ruta: tramos.slice(0, i).join('/') });
    }
    await esperarTransaccion(tx);
  } finally {
    bd.close();
  }
}

// Borra la carpeta, sus subcarpetas y todo lo que contienen. Devuelve los ids
// de los libros eliminados para que quien llama limpie progreso y anotaciones.
export async function borrarCarpetaLocal(ruta) {
  const destino = normalizarCarpeta(ruta);
  if (!destino) return [];
  const prefijo = `${destino}/`;
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(
      ['libros', 'datos', 'portadas', 'metadatos', 'localizaciones', 'carpetas-locales'],
      'readwrite',
    );
    const libros = await esperar(tx.objectStore('libros').getAll());
    const borrados = [];
    for (const libro of libros) {
      const carpeta = normalizarCarpeta(libro.carpeta);
      if (carpeta !== destino && !carpeta.startsWith(prefijo)) continue;
      borrados.push(libro.id);
      tx.objectStore('libros').delete(libro.id);
      tx.objectStore('datos').delete(libro.id);
      tx.objectStore('portadas').delete(libro.id);
      tx.objectStore('metadatos').delete(libro.id);
      tx.objectStore('localizaciones').delete(`local|${libro.id}`);
    }
    const carpetas = await esperar(tx.objectStore('carpetas-locales').getAll());
    for (const carpeta of carpetas) {
      if (carpeta.ruta === destino || carpeta.ruta.startsWith(prefijo)) {
        tx.objectStore('carpetas-locales').delete(carpeta.ruta);
      }
    }
    await esperarTransaccion(tx);
    return borrados;
  } finally {
    bd.close();
  }
}

// Renombrar arrastra a las subcarpetas y a los libros: todo lo que colgaba de
// la ruta vieja pasa a colgar de la nueva.
export async function renombrarCarpetaLocal(rutaVieja, rutaNueva) {
  const vieja = normalizarCarpeta(rutaVieja);
  const nueva = normalizarCarpeta(rutaNueva);
  if (!vieja || !nueva || vieja === nueva) return;
  const prefijoViejo = `${vieja}/`;
  const recolocar = (carpeta) => (carpeta === vieja
    ? nueva
    : carpeta.startsWith(prefijoViejo) ? nueva + carpeta.slice(vieja.length) : null);
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['libros', 'carpetas-locales'], 'readwrite');
    const libros = await esperar(tx.objectStore('libros').getAll());
    for (const libro of libros) {
      const destino = recolocar(normalizarCarpeta(libro.carpeta));
      if (destino !== null) tx.objectStore('libros').put({ ...libro, carpeta: destino });
    }
    const carpetas = await esperar(tx.objectStore('carpetas-locales').getAll());
    for (const carpeta of carpetas) {
      const destino = recolocar(carpeta.ruta);
      if (destino === null) continue;
      tx.objectStore('carpetas-locales').delete(carpeta.ruta);
      tx.objectStore('carpetas-locales').put({ ruta: destino });
    }
    const tramos = nueva.split('/');
    for (let i = 1; i <= tramos.length; i++) {
      tx.objectStore('carpetas-locales').put({ ruta: tramos.slice(0, i).join('/') });
    }
    await esperarTransaccion(tx);
  } finally {
    bd.close();
  }
}

export async function moverLibroACarpeta(id, carpeta) {
  const destino = normalizarCarpeta(carpeta);
  const bd = await abrirBd();
  try {
    const tx = bd.transaction('libros', 'readwrite');
    const libro = await esperar(tx.objectStore('libros').get(id));
    if (!libro) return false;
    tx.objectStore('libros').put({ ...libro, carpeta: destino });
    await esperarTransaccion(tx);
    return true;
  } finally {
    bd.close();
  }
}

export async function guardarLibro({ id, nombre, tamano, anadido, carpeta = '' }, datos) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['libros', 'datos'], 'readwrite');
    tx.objectStore('libros').put({
      id, nombre, tamano, anadido: anadido ?? new Date().toISOString(),
      carpeta: normalizarCarpeta(carpeta),
    });
    tx.objectStore('datos').put(new Blob([datos], { type: tipoLibro(nombre) }), id);
    await esperarTransaccion(tx);
  } finally {
    bd.close();
  }
}

// Datos originales de la biblioteca local para crear una copia portable. Las
// portadas y los metadatos no se incluyen: son derivados y se regeneran al
// restaurar, evitando inflar innecesariamente el archivo.
export async function exportarBibliotecaLocal() {
  const [libros, anotaciones, carpetas] = await Promise.all([
    listarLibros(), listarDocumentosAnotaciones('local'), listarCarpetasLocales(),
  ]);
  const resultado = (await Promise.all(libros.map(async (libro) => {
    const datos = await obtenerDatos(libro.id);
    return datos ? { ...libro, datos } : null;
  }))).filter(Boolean);
  return { libros: resultado, anotaciones, carpetas };
}

// Restaura todos los registros de IndexedDB en una sola transacción. Los
// libros ajenos a la copia se conservan y los que tengan el mismo id se
// reemplazan, junto con sus anotaciones.
export async function restaurarBibliotecaLocal(libros, documentos = [], carpetas = []) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(
      ['libros', 'datos', 'portadas', 'metadatos', 'anotaciones', 'carpetas-locales'], 'readwrite',
    );
    // Se registran también las carpetas de cada libro: una copia antigua no
    // trae la lista, pero sus libros sí saben dónde estaban.
    const rutas = new Set(carpetas.map(normalizarCarpeta).filter(Boolean));
    for (const libro of libros) {
      const carpeta = normalizarCarpeta(libro.carpeta);
      if (carpeta) rutas.add(carpeta);
    }
    for (const ruta of rutas) {
      const tramos = ruta.split('/');
      for (let i = 1; i <= tramos.length; i++) {
        tx.objectStore('carpetas-locales').put({ ruta: tramos.slice(0, i).join('/') });
      }
    }
    for (const libro of libros) {
      const { datos, ...info } = libro;
      info.carpeta = normalizarCarpeta(info.carpeta);
      tx.objectStore('libros').put(info);
      tx.objectStore('datos').put(new Blob([datos], { type: tipoLibro(info.nombre) }), info.id);
      tx.objectStore('portadas').delete(info.id);
      tx.objectStore('metadatos').delete(info.id);
      tx.objectStore('anotaciones').delete(['local', info.id]);
    }
    for (const documento of documentos) tx.objectStore('anotaciones').put(documento);
    await esperarTransaccion(tx);
  } finally {
    bd.close();
  }
}

export async function listarLibros() {
  const bd = await abrirBd();
  try {
    const libros = await esperar(bd.transaction('libros').objectStore('libros').getAll());
    libros.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return libros;
  } finally {
    bd.close();
  }
}

export async function obtenerDatos(id) {
  const bd = await abrirBd();
  try {
    const blob = await esperar(bd.transaction('datos').objectStore('datos').get(id));
    if (!blob) return null;
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    bd.close();
  }
}

export async function borrarLibro(id) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(
      ['libros', 'datos', 'portadas', 'metadatos', 'localizaciones'], 'readwrite',
    );
    tx.objectStore('libros').delete(id);
    tx.objectStore('datos').delete(id);
    tx.objectStore('portadas').delete(id);
    tx.objectStore('metadatos').delete(id);
    tx.objectStore('localizaciones').delete(`local|${id}`);
    await new Promise((resolver, rechazar) => {
      tx.oncomplete = resolver;
      tx.onerror = () => rechazar(tx.error);
    });
  } finally {
    bd.close();
  }
}

// ── Anotaciones y resaltados ──

export async function obtenerAnotaciones(ambito, libro) {
  const bd = await abrirBd();
  try {
    return await esperar(
      bd.transaction('anotaciones').objectStore('anotaciones').get([ambito, libro]),
    ) ?? null;
  } finally {
    bd.close();
  }
}

export async function guardarAnotaciones(documento) {
  const bd = await abrirBd();
  try {
    await esperar(
      bd.transaction('anotaciones', 'readwrite').objectStore('anotaciones').put(documento),
    );
  } finally {
    bd.close();
  }
}

export async function listarDocumentosAnotaciones(ambito) {
  const bd = await abrirBd();
  try {
    return await esperar(
      bd.transaction('anotaciones').objectStore('anotaciones').index('ambito').getAll(ambito),
    );
  } finally {
    bd.close();
  }
}

export async function borrarAnotaciones(ambito, libro) {
  const bd = await abrirBd();
  try {
    await esperar(
      bd.transaction('anotaciones', 'readwrite').objectStore('anotaciones').delete([ambito, libro]),
    );
  } finally {
    bd.close();
  }
}

export async function moverAnotaciones(ambito, libroViejo, libroNuevo) {
  const documento = await obtenerAnotaciones(ambito, libroViejo);
  if (!documento) return false;
  await guardarAnotaciones({ ...documento, libro: libroNuevo });
  await borrarAnotaciones(ambito, libroViejo);
  return true;
}

export async function borrarAnotacionesPorPrefijo(ambito, prefijo) {
  const bd = await abrirBd();
  try {
    const documentos = await esperar(
      bd.transaction('anotaciones').objectStore('anotaciones').index('ambito').getAll(ambito),
    );
    const tx = bd.transaction('anotaciones', 'readwrite');
    const destino = tx.objectStore('anotaciones');
    for (const documento of documentos) {
      if (documento.libro.startsWith(prefijo)) destino.delete([ambito, documento.libro]);
    }
    await esperarTransaccion(tx);
  } finally {
    bd.close();
  }
}

// ── Localizaciones de los EPUB ──
//
// Repartir un EPUB en 1000 puntos (lo que da el porcentaje del libro y el
// salto por porcentaje) cuesta segundos en libros grandes. El resultado se
// guarda por libro junto al tamaño del archivo: si el archivo cambia, el
// tamaño ya no coincide y se vuelve a calcular.

export async function guardarLocalizaciones(clave, tamano, datos) {
  const bd = await abrirBd();
  try {
    await esperar(bd.transaction('localizaciones', 'readwrite')
      .objectStore('localizaciones').put({ tamano, datos }, clave));
  } finally {
    bd.close();
  }
}

export async function obtenerLocalizaciones(clave, tamano) {
  const bd = await abrirBd();
  try {
    const registro = await esperar(
      bd.transaction('localizaciones').objectStore('localizaciones').get(clave),
    );
    if (!registro || (tamano && registro.tamano !== tamano)) return null;
    return registro.datos;
  } finally {
    bd.close();
  }
}

// ── Portadas (miniaturas) ──

export async function guardarPortada(id, blob) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction('portadas', 'readwrite');
    tx.objectStore('portadas').put(blob, id);
    await new Promise((resolver, rechazar) => {
      tx.oncomplete = resolver;
      tx.onerror = () => rechazar(tx.error);
    });
  } finally {
    bd.close();
  }
}

export async function obtenerPortada(id) {
  const bd = await abrirBd();
  try {
    return await esperar(bd.transaction('portadas').objectStore('portadas').get(id)) ?? null;
  } finally {
    bd.close();
  }
}

export async function borrarPortada(id) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['portadas', 'metadatos'], 'readwrite');
    tx.objectStore('portadas').delete(id);
    tx.objectStore('metadatos').delete(id);
    await new Promise((resolver, rechazar) => {
      tx.oncomplete = resolver;
      tx.onerror = () => rechazar(tx.error);
    });
  } finally {
    bd.close();
  }
}

export async function guardarMetadatos(id, metadatos) {
  const bd = await abrirBd();
  try {
    await esperar(bd.transaction('metadatos', 'readwrite').objectStore('metadatos').put(metadatos, id));
  } finally {
    bd.close();
  }
}

export async function obtenerMetadatos(id) {
  const bd = await abrirBd();
  try {
    return await esperar(bd.transaction('metadatos').objectStore('metadatos').get(id)) ?? null;
  } finally {
    bd.close();
  }
}

// ── Copias de libros WebDAV disponibles sin conexión ──

export async function guardarCopiaRemota({ servidor, id, nombre, tamano, etag, modificado }, datos) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['copias-remotas', 'datos-remotos'], 'readwrite');
    tx.objectStore('copias-remotas').put({
      servidor,
      id,
      nombre,
      tamano: tamano || datos.byteLength,
      ...(etag ? { etag } : {}),
      ...(modificado ? { modificado } : {}),
      guardado: new Date().toISOString(),
    });
    tx.objectStore('datos-remotos').put(
      new Blob([datos], { type: tipoLibro(nombre) }),
      [servidor, id],
    );
    await esperarTransaccion(tx);
  } finally {
    bd.close();
  }
}

export async function obtenerInfoCopiaRemota(servidor, id) {
  const bd = await abrirBd();
  try {
    return await esperar(
      bd.transaction('copias-remotas').objectStore('copias-remotas').get([servidor, id]),
    ) ?? null;
  } finally {
    bd.close();
  }
}

export async function obtenerCopiaRemota(servidor, id) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['copias-remotas', 'datos-remotos']);
    const [info, blob] = await Promise.all([
      esperar(tx.objectStore('copias-remotas').get([servidor, id])),
      esperar(tx.objectStore('datos-remotos').get([servidor, id])),
    ]);
    if (!info || !blob) return null;
    return { ...info, datos: new Uint8Array(await blob.arrayBuffer()) };
  } finally {
    bd.close();
  }
}

export async function listarCopiasRemotas(servidor) {
  const bd = await abrirBd();
  try {
    const todas = await esperar(
      bd.transaction('copias-remotas').objectStore('copias-remotas').index('servidor').getAll(servidor),
    );
    return todas.sort((a, b) => a.id.localeCompare(b.id, 'es'));
  } finally {
    bd.close();
  }
}

export async function borrarCopiaRemota(servidor, id) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['copias-remotas', 'datos-remotos', 'localizaciones'], 'readwrite');
    tx.objectStore('copias-remotas').delete([servidor, id]);
    tx.objectStore('datos-remotos').delete([servidor, id]);
    tx.objectStore('localizaciones').delete(`${servidor}|${id}`);
    await esperarTransaccion(tx);
  } finally {
    bd.close();
  }
}

export async function moverCopiaRemota(servidor, idViejo, idNuevo) {
  const copia = await obtenerCopiaRemota(servidor, idViejo);
  if (!copia) return false;
  await guardarCopiaRemota({
    ...copia,
    id: idNuevo,
    nombre: idNuevo.split('/').pop(),
  }, copia.datos);
  await borrarCopiaRemota(servidor, idViejo);
  return true;
}

export async function borrarCopiasRemotasPorPrefijo(servidor, prefijo) {
  const copias = await listarCopiasRemotas(servidor);
  const ids = copias.filter((copia) => copia.id.startsWith(prefijo)).map((copia) => copia.id);
  if (!ids.length) return;
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['copias-remotas', 'datos-remotos'], 'readwrite');
    for (const id of ids) {
      tx.objectStore('copias-remotas').delete([servidor, id]);
      tx.objectStore('datos-remotos').delete([servidor, id]);
    }
    await esperarTransaccion(tx);
  } finally {
    bd.close();
  }
}

export async function solicitarPersistencia() {
  try {
    if (!navigator.storage?.persist) return false;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
