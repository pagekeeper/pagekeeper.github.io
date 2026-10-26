// Los libros que llegan de otra aplicación del sistema: con «Abrir con» desde
// un gestor de archivos (el manifiesto los declara en `file_handlers` y el
// navegador los entrega por `launchQueue`) o con «Compartir» (`share_target`,
// que los envía por POST y recoge sw.js).
//
// Lo que llega así no siempre trae un nombre con su extensión: Android pasa
// muchas veces el archivo con el nombre que le da la aplicación de origen,
// a veces un número o «document», y lo que sí dice es el tipo. Como la
// biblioteca reconoce los libros por la extensión, se le añade la que falta.

// El parámetro de la dirección a la que sw.js manda después de recibir lo
// compartido, y el que marca la petición que trae los archivos.
export const PARAMETRO_COMPARTIR = 'compartir';
export const PARAMETRO_COMPARTIDO = 'compartido';

const EXTENSION_DE_TIPO = {
  'application/pdf': 'pdf',
  'application/x-pdf': 'pdf',
  'application/epub+zip': 'epub',
};

// El nombre con el que el libro entra en la biblioteca, o null si no es un
// PDF ni un EPUB. Manda la extensión si la trae: un gestor que no conoce el
// EPUB lo pasa como «application/octet-stream» o «application/zip».
export function nombreDeLibroRecibido(nombre, tipo) {
  const limpio = String(nombre ?? '').split(/[\\/]/).pop().trim();
  if (/\.(pdf|epub)$/i.test(limpio)) return limpio;
  const extension = EXTENSION_DE_TIPO[String(tipo ?? '').toLowerCase().split(';')[0].trim()];
  if (!extension) return null;
  return `${limpio || 'libro'}.${extension}`;
}

// Los archivos recibidos, ya con un nombre que la biblioteca reconoce. Los que
// no son libros se descartan aquí; quien llama avisa si no queda ninguno.
// `crearArchivo` hace falta para cambiar el nombre (un File no deja), y se
// pasa para poder probarlo sin navegador.
export function librosRecibidos(archivos, crearArchivo) {
  const libros = [];
  for (const archivo of archivos ?? []) {
    const nombre = nombreDeLibroRecibido(archivo?.name, archivo?.type);
    if (!nombre) continue;
    libros.push(nombre === archivo.name ? archivo : crearArchivo(archivo, nombre));
  }
  return libros;
}
