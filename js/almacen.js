// Almacén de libros locales en IndexedDB.
//
// Los PDF abiertos desde el dispositivo se guardan aquí para que aparezcan
// en la biblioteca y puedan reabrirse sin volver a elegir el archivo.
// Se usan seis almacenes: los cuatro originales y dos para las copias de
// libros WebDAV que el usuario marca como disponibles sin conexión.

const NOMBRE_BD = 'lector-pdf';
const VERSION = 4;

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

export async function guardarLibro({ id, nombre, tamano }, datos) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['libros', 'datos'], 'readwrite');
    tx.objectStore('libros').put({ id, nombre, tamano, anadido: new Date().toISOString() });
    tx.objectStore('datos').put(new Blob([datos], { type: tipoLibro(nombre) }), id);
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
    const tx = bd.transaction(['libros', 'datos', 'portadas', 'metadatos'], 'readwrite');
    tx.objectStore('libros').delete(id);
    tx.objectStore('datos').delete(id);
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
    const tx = bd.transaction(['copias-remotas', 'datos-remotos'], 'readwrite');
    tx.objectStore('copias-remotas').delete([servidor, id]);
    tx.objectStore('datos-remotos').delete([servidor, id]);
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
