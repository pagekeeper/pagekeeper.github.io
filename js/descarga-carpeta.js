// Descargar una carpeta entera de la biblioteca: qué libros entran, con qué
// ruta dentro del paquete y con qué nombre. Aquí solo se decide; quien escribe
// el ZIP o los archivos en el disco es la aplicación.

// Igual que al añadir carpetas: un árbol más hondo que esto es un error, no
// una biblioteca.
const PROFUNDIDAD_MAXIMA = 8;

// Caracteres que ningún sistema de archivos acepta (o que Windows rechaza), y
// nombres que en Windows están reservados pase lo que pase.
const PROHIBIDOS = /[<>:"/\\|?*\x00-\x1f]/g;
const RESERVADOS = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;

export function nombreSeguro(nombre) {
  const limpio = String(nombre ?? '').replace(PROHIBIDOS, '_').replace(/[. ]+$/, '').trim();
  if (!limpio || limpio === '.' || limpio === '..') return 'sin-nombre';
  return RESERVADOS.test(limpio) ? `_${limpio}` : limpio;
}

// Dos libros pueden llamarse igual dentro de la misma carpeta (el nombre no es
// su identificador), así que el segundo se numera en vez de pisar al primero.
export function rutaUnica(usadas, ruta) {
  if (!usadas.has(ruta)) {
    usadas.add(ruta);
    return ruta;
  }
  const punto = ruta.lastIndexOf('.');
  const base = punto > 0 ? ruta.slice(0, punto) : ruta;
  const extension = punto > 0 ? ruta.slice(punto) : '';
  for (let numero = 2; ; numero++) {
    const intento = `${base} (${numero})${extension}`;
    if (!usadas.has(intento)) {
      usadas.add(intento);
      return intento;
    }
  }
}

// Ruta dentro del paquete: la carpeta descargada es la raíz, así que se le
// quita el prefijo y cada tramo se sanea para poder escribirlo en el disco.
function rutaEnPaquete(usadas, subcarpeta, nombre) {
  const tramos = subcarpeta ? subcarpeta.split('/').map(nombreSeguro) : [];
  return rutaUnica(usadas, [...tramos, nombreSeguro(nombre)].join('/'));
}

// Los libros de la biblioteca del dispositivo que cuelgan de `ruta`, con sus
// subcarpetas. Función pura: recibe el listado entero y filtra.
export function librosDeCarpetaLocal(libros, ruta) {
  const prefijo = ruta ? `${ruta}/` : '';
  const dentro = libros
    .filter((libro) => {
      const carpeta = String(libro.carpeta ?? '');
      return carpeta === ruta || carpeta.startsWith(prefijo);
    })
    .map((libro) => ({ ...libro, subcarpeta: String(libro.carpeta ?? '').slice(prefijo.length) }))
    .sort((a, b) => a.subcarpeta.localeCompare(b.subcarpeta, 'es') ||
      a.nombre.localeCompare(b.nombre, 'es'));
  const usadas = new Set();
  return dentro.map(({ id, nombre, subcarpeta }) => ({
    id,
    nombre,
    ruta: rutaEnPaquete(usadas, subcarpeta, nombre),
  }));
}

// Lo mismo con una carpeta de la nube, que hay que ir pidiendo nivel a nivel.
// `listar` es el método del cliente WebDAV; se pasa para poder probarlo sin
// servidor.
export async function librosDeCarpetaRemota(listar, ruta) {
  const encontrados = [];
  const usadas = new Set();
  const pendientes = [{ ruta, subcarpeta: '', profundidad: 0 }];
  while (pendientes.length) {
    const actual = pendientes.shift();
    const { carpetas, libros } = await listar(actual.ruta);
    for (const libro of libros) {
      encontrados.push({
        id: `${actual.ruta}/${libro.nombre}`,
        nombre: libro.nombre,
        ruta: rutaEnPaquete(usadas, actual.subcarpeta, libro.nombre),
      });
    }
    if (actual.profundidad >= PROFUNDIDAD_MAXIMA) continue;
    for (const carpeta of carpetas) {
      pendientes.push({
        ruta: `${actual.ruta}/${carpeta.nombre}`,
        subcarpeta: actual.subcarpeta ? `${actual.subcarpeta}/${carpeta.nombre}` : carpeta.nombre,
        profundidad: actual.profundidad + 1,
      });
    }
  }
  return encontrados;
}

// ¿Puede este navegador escribir en una carpeta que elija el usuario? Solo los
// de escritorio basados en Chromium, de momento.
export function puedeGuardarEnDisco() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}
