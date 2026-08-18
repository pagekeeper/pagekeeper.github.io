// Un libro puede llegar por enlace: una página enlaza un EPUB o un PDF y
// PageKeeper lo descarga y lo guarda en la biblioteca. Aquí solo están las
// comprobaciones que deciden si esa dirección es aceptable; no se toca la red
// ni la pantalla, para poder probarlas por separado.
//
// La cautela viene de que el enlace lo escribe alguien de fuera: puede llegar
// por correo o por un mensaje, y quien lo abre no siempre mira a dónde apunta.
// Por eso la dirección se acota aquí y la descarga se confirma antes, con el
// servidor a la vista.

// Un EPUB de texto rara vez pasa de unas decenas de megas; los PDF con
// imágenes sí. Este techo deja pasar un manual escaneado y corta las
// descargas que llenarían el almacenamiento del navegador sin avisar.
export const TAMANO_MAXIMO = 200 * 1024 * 1024;

// Una dirección más larga que esto no es un enlace a un archivo, es otra cosa.
const LARGO_MAXIMO_URL = 2000;

// El mismo límite que usa la biblioteca para los nombres que entran por
// carpeta, para que un libro no se llame distinto según por dónde llegue.
const LARGO_MAXIMO_NOMBRE = 120;

const EXTENSION = /\.(pdf|epub)$/i;

// El fragmento que trae el enlace: `#libro=<dirección>`. Se devuelve tal cual
// llegó, sin validar; de eso se encarga `validarUrlLibro`.
export function leerEnlaceDeLibro(hash) {
  const coincidencia = String(hash ?? '').match(/^#libro=(.+)$/);
  if (!coincidencia) return null;
  try {
    return decodeURIComponent(coincidencia[1]);
  } catch {
    // Un `%` suelto rompe la descodificación; el enlace no sirve.
    return null;
  }
}

// El nombre con el que el libro entra en la biblioteca sale del último tramo
// de la ruta, que es lo que el servidor considera el archivo. Se descarta la
// consulta y el fragmento porque no forman parte del nombre.
export function nombreDesdeUrl(url) {
  const tramo = url.pathname.split('/').filter(Boolean).pop() ?? '';
  let nombre;
  try {
    nombre = decodeURIComponent(tramo);
  } catch {
    nombre = tramo;
  }
  // Una barra o una contrabarra dentro del nombre haría que pareciera una
  // carpeta al guardarlo; se quedan fuera.
  nombre = nombre.replace(/[\\/]/g, ' ').trim();
  if (!EXTENSION.test(nombre)) return '';
  const punto = nombre.lastIndexOf('.');
  const extension = nombre.slice(punto);
  const cuerpo = nombre.slice(0, punto).slice(0, LARGO_MAXIMO_NOMBRE - extension.length).trim();
  return cuerpo ? cuerpo + extension : '';
}

export function formatoDesdeNombre(nombre) {
  return /\.epub$/i.test(nombre) ? 'epub' : 'pdf';
}

// Devuelve los datos que hacen falta para pedir la confirmación y descargar, o
// lanza si la dirección no vale. Se prefiere lanzar a devolver null para que
// quien llama tenga que decir algo en pantalla y no se quede en silencio.
export function validarUrlLibro(texto) {
  const crudo = String(texto ?? '').trim();
  if (!crudo || crudo.length > LARGO_MAXIMO_URL) throw new Error('INVALID_BOOK_URL');

  let url;
  try {
    url = new URL(crudo);
  } catch {
    throw new Error('INVALID_BOOK_URL');
  }

  // Solo https. La aplicación se sirve cifrada, así que un enlace `http:` lo
  // bloquearía el navegador de todas formas por contenido mixto; y `blob:`,
  // `data:` o `file:` no son sitios de los que descargar un libro ajeno.
  // La excepción es la máquina de quien lee, que el propio navegador trata
  // como origen seguro: es lo que permite probar la aplicación en local.
  const enLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1' ||
    url.hostname === '[::1]' || url.hostname === '::1';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && enLocal)) {
    throw new Error('INVALID_BOOK_URL');
  }

  const nombre = nombreDesdeUrl(url);
  if (!nombre) throw new Error('INVALID_BOOK_URL');

  return { url: url.href, host: url.host, nombre, formato: formatoDesdeNombre(nombre) };
}

// Un libro que ya está en la biblioteca no se vuelve a traer: se abre el que
// hay. Se compara por nombre porque es lo único que se conoce del enlace sin
// haberlo descargado todavía, y evitar la descarga es justo lo que se busca.
// Del contenido repetido con otro nombre ya se encarga `duplicados` cuando el
// libro entra de verdad.
export function libroYaDescargado(libros, nombre) {
  const buscado = String(nombre ?? '').trim().toLowerCase();
  if (!buscado) return null;
  return (libros ?? []).find(
    (libro) => String(libro?.nombre ?? '').trim().toLowerCase() === buscado,
  ) ?? null;
}

// El tamaño se mira dos veces: con lo que anuncia la cabecera, para no empezar
// una descarga inútil, y con lo que de verdad llegó, porque la cabecera puede
// faltar o mentir.
export function tamanoAceptable(bytes) {
  const tamano = Number(bytes);
  if (!Number.isFinite(tamano) || tamano <= 0) return true; // desconocido: se mira al terminar
  return tamano <= TAMANO_MAXIMO;
}
