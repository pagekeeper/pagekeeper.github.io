// Almacén de libros locales en IndexedDB.
//
// Los PDF abiertos desde el dispositivo se guardan aquí para que aparezcan
// en la biblioteca y puedan reabrirse sin volver a elegir el archivo.
// Se usan tres almacenes: 'libros' (solo metadatos, para listar rápido sin
// cargar los PDF en memoria), 'datos' (el contenido, como Blob) y
// 'portadas' (miniaturas de cubierta, también de los libros de la nube).

const NOMBRE_BD = 'lector-pdf';
const VERSION = 2;

function abrirBd() {
  return new Promise((resolver, rechazar) => {
    const solicitud = indexedDB.open(NOMBRE_BD, VERSION);
    solicitud.onupgradeneeded = () => {
      const bd = solicitud.result;
      if (!bd.objectStoreNames.contains('libros')) bd.createObjectStore('libros', { keyPath: 'id' });
      if (!bd.objectStoreNames.contains('datos')) bd.createObjectStore('datos');
      if (!bd.objectStoreNames.contains('portadas')) bd.createObjectStore('portadas');
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

export async function guardarLibro({ id, nombre, tamano }, datos) {
  const bd = await abrirBd();
  try {
    const tx = bd.transaction(['libros', 'datos'], 'readwrite');
    tx.objectStore('libros').put({ id, nombre, tamano, anadido: new Date().toISOString() });
    tx.objectStore('datos').put(new Blob([datos], { type: 'application/pdf' }), id);
    await new Promise((resolver, rechazar) => {
      tx.oncomplete = resolver;
      tx.onerror = () => rechazar(tx.error);
      tx.onabort = () => rechazar(tx.error ?? new Error('Transacción cancelada'));
    });
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
    const tx = bd.transaction(['libros', 'datos', 'portadas'], 'readwrite');
    tx.objectStore('libros').delete(id);
    tx.objectStore('datos').delete(id);
    tx.objectStore('portadas').delete(id);
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
    const tx = bd.transaction('portadas', 'readwrite');
    tx.objectStore('portadas').delete(id);
    await new Promise((resolver, rechazar) => {
      tx.oncomplete = resolver;
      tx.onerror = () => rechazar(tx.error);
    });
  } finally {
    bd.close();
  }
}
