// Recoge los PDF y EPUB que entran en la biblioteca, tanto si se arrastran
// como si se eligen con un selector, y conserva la carpeta en la que estaban.
// Con eso quien los recibe puede rehacer la misma estructura dentro de la
// biblioteca en lugar de dejarlo todo suelto en un montón.

const ES_LIBRO = /\.(pdf|epub)$/i;

// Una carpeta con más niveles que estos casi siempre es un enlace circular; y
// un nombre larguísimo no cabe como carpeta de la biblioteca.
const PROFUNDIDAD_MAXIMA = 8;
const LARGO_MAXIMO = 120;

export function esLibro(nombre) {
  return ES_LIBRO.test(String(nombre ?? ''));
}

// Las carpetas ocultas se saltan enteras: ni el listado de la nube ni el de
// este dispositivo las muestran, así que copiarlas solo llenaría la biblioteca
// de restos (.git, .Trash y compañía).
function oculta(nombre) {
  return nombre.startsWith('.');
}

function unir(base, nombre) {
  const tramo = nombre.trim().slice(0, LARGO_MAXIMO).trim();
  if (!tramo) return base;
  return base ? `${base}/${tramo}` : tramo;
}

// La carpeta de un archivo elegido con un selector de carpetas: su ruta
// relativa sin el nombre del archivo. Devuelve null si cuelga de una carpeta
// oculta o baja más de lo razonable, para descartarlo.
function carpetaDeRuta(ruta) {
  const tramos = String(ruta ?? '').split('/').slice(0, -1).filter(Boolean);
  if (tramos.length > PROFUNDIDAD_MAXIMA || tramos.some(oculta)) return null;
  return tramos.reduce(unir, '');
}

function ordenar(entrantes) {
  return entrantes.sort((a, b) => a.carpeta.localeCompare(b.carpeta, 'es') ||
    a.archivo.name.localeCompare(b.archivo.name, 'es'));
}

// Lo que llega de un `<input type="file">`, con o sin `webkitdirectory`: los
// archivos sueltos se quedan en la carpeta abierta (carpeta vacía).
export function librosElegidos(archivos) {
  const entrantes = [];
  for (const archivo of archivos) {
    if (!esLibro(archivo.name)) continue;
    const carpeta = carpetaDeRuta(archivo.webkitRelativePath);
    if (carpeta === null) continue;
    entrantes.push({ archivo, carpeta });
  }
  return ordenar(entrantes);
}

// Hay que llamarla dentro del propio «drop» y sin ceder el turno: en cuanto
// termina el manejador, el `dataTransfer` ya no deja leer nada.
export function capturarArrastre(dataTransfer) {
  const entradas = [...(dataTransfer?.items ?? [])]
    .map((elemento) => elemento.webkitGetAsEntry?.())
    .filter(Boolean);
  // Sin la API de entradas queda la lista de archivos de siempre, que no ve el
  // contenido de las carpetas pero sirve para todo lo demás.
  return entradas.length ? entradas : [...(dataTransfer?.files ?? [])];
}

// Un directorio no entrega todo su contenido de una vez: hay que seguir
// pidiendo lotes hasta que llega uno vacío.
function leerLote(lector) {
  return new Promise((cumplir, fallar) => lector.readEntries(cumplir, fallar));
}

async function leerEntero(lector) {
  const entradas = [];
  for (;;) {
    const lote = await leerLote(lector);
    if (!lote.length) return entradas;
    entradas.push(...lote);
  }
}

function comoArchivo(entrada) {
  return new Promise((cumplir, fallar) => entrada.file(cumplir, fallar));
}

async function recorrer(entrada, base, encontrados, profundidad) {
  if (entrada.isDirectory) {
    if (profundidad >= PROFUNDIDAD_MAXIMA || oculta(entrada.name)) return;
    const ruta = unir(base, entrada.name);
    for (const hija of await leerEntero(entrada.createReader())) {
      await recorrer(hija, ruta, encontrados, profundidad + 1);
    }
    return;
  }
  if (!esLibro(entrada.name)) return;
  encontrados.push({ archivo: await comoArchivo(entrada), carpeta: base });
}

// Convierte lo capturado en el «drop» en libros con su carpeta. Una carpeta
// que no se puede leer no arrastra al resto: se ignora y sigue lo demás.
export async function librosArrastrados(capturado) {
  const encontrados = [];
  for (const elemento of capturado) {
    if (typeof elemento?.isDirectory !== 'boolean') { // es un File de toda la vida
      if (esLibro(elemento.name)) encontrados.push({ archivo: elemento, carpeta: '' });
      continue;
    }
    try {
      await recorrer(elemento, '', encontrados, 0);
    } catch { /* carpeta ilegible: se salta */ }
  }
  return ordenar(encontrados);
}
