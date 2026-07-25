// Miniaturas de portada para la biblioteca.
//
// PDF: se dibuja la primera página. EPUB: se usa la imagen de cubierta
// declarada en el libro y, si no la declara, se dibuja una con su título.
// Las miniaturas se guardan en IndexedDB (almacén 'portadas'), también para
// los libros de la nube: se generan la primera vez que se abre o se sube el
// libro, que es cuando sus bytes están disponibles.

import * as pdfjs from '../vendor/pdf.min.js';
import { cargarLibrerias } from './lector-epub.js';
import { guardarPortada, obtenerPortada, guardarMetadatos, obtenerMetadatos } from './almacen.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.min.js', import.meta.url).href;

const ANCHO = 220; // px; se ve nítida también en pantallas de alta densidad

// Genera y guarda la miniatura si aún no existe. No lanza errores: una
// portada que falla se queda simplemente en el icono genérico.
// Copia los bytes de forma síncrona porque el lector de PDF transfiere el
// buffer original a su worker al abrir el libro.
export function asegurarMiniatura(id, formato, datos) {
  let copia;
  try {
    copia = datos.slice();
  } catch {
    return Promise.resolve(false);
  }
  return (async () => {
    const [portada, metadatos] = await Promise.all([obtenerPortada(id), obtenerMetadatos(id)]);
    if (portada && metadatos) return true;
    const resultado = formato === 'epub' ? await deEpub(copia) : await dePdf(copia);
    if (resultado.metadatos && !metadatos) await guardarMetadatos(id, resultado.metadatos);
    if (resultado.blob && !portada) await guardarPortada(id, resultado.blob);
    return !!(resultado.blob || resultado.metadatos);
  })().catch(() => false);
}

async function dePdf(datos) {
  const documento = await pdfjs.getDocument({ data: datos }).promise;
  try {
    const info = await documento.getMetadata().catch(() => ({ info: {}, metadata: null }));
    const obtener = (clave) => info.info?.[clave] ?? info.metadata?.get?.(`dc:${clave.toLowerCase()}`) ?? '';
    const metadatos = {
      titulo: obtener('Title'), autor: obtener('Author'),
      asunto: obtener('Subject'), palabras: obtener('Keywords'),
    };
    const pagina = await documento.getPage(1);
    const base = pagina.getViewport({ scale: 1 });
    const vista = pagina.getViewport({ scale: ANCHO / base.width });
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.ceil(vista.width);
    lienzo.height = Math.ceil(vista.height);
    const contexto = lienzo.getContext('2d');
    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, lienzo.width, lienzo.height);
    await pagina.render({ canvasContext: contexto, viewport: vista }).promise;
    return { blob: await aJpeg(lienzo), metadatos };
  } finally {
    documento.destroy().catch(() => null);
  }
}

async function deEpub(datos) {
  await cargarLibrerias();
  const libro = window.ePub(datos.buffer);
  try {
    await libro.ready;
    const metadata = await libro.loaded.metadata;
    const metadatos = {
      titulo: aTexto(metadata.title), autor: aTexto(metadata.creator),
      editorial: aTexto(metadata.publisher), idioma: aTexto(metadata.language),
      descripcion: aTexto(metadata.description),
    };
    const url = await libro.coverUrl();
    // Muchos EPUB no declaran cubierta (los de Calibre, por ejemplo, traen una
    // página de título con su propio logo, que no es la portada del libro).
    if (!url) return { blob: await portadaDeTitulo(metadatos.titulo, metadatos.autor), metadatos };
    const imagen = await new Promise((resolver, rechazar) => {
      const img = new Image();
      img.onload = () => resolver(img);
      img.onerror = () => rechazar(new Error('cubierta ilegible'));
      img.src = url;
    });
    const escala = Math.min(1, ANCHO / imagen.naturalWidth);
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.max(1, Math.round(imagen.naturalWidth * escala));
    lienzo.height = Math.max(1, Math.round(imagen.naturalHeight * escala));
    lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    URL.revokeObjectURL(url);
    return { blob: await aJpeg(lienzo), metadatos };
  } finally {
    try { libro.destroy(); } catch { /* ya destruido */ }
  }
}

function aJpeg(lienzo) {
  return new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', 0.82));
}

// PNG y no JPEG: es texto plano sobre un color liso, donde el JPEG ensucia los
// bordes de las letras y encima ocupa más.
function aPng(lienzo) {
  return new Promise((resolver) => lienzo.toBlob(resolver, 'image/png'));
}

// ── Portada dibujada para los libros que no traen ninguna ──
// Con el icono genérico todos se veían iguales, y una cuadrícula de fichas
// idénticas no hay manera de recorrerla con la vista. Se dibuja el título, que
// es lo que distingue a un libro, sobre un color sacado de ese mismo título:
// el mismo libro cae siempre en el mismo tono, así que se reconoce por el
// color antes incluso de leerlo.
//
// Los colores son una lista corta y elegida, no un tono al azar: el azar da
// fucsias y amarillos ilegibles, y aquí encima hay texto encima.
const PALETA_PORTADAS = [
  ['#1e3a5f', '#dbeafe'], ['#3f2b56', '#ede9fe'], ['#14453d', '#d1fae5'],
  ['#5b2333', '#fee2e2'], ['#1f3a34', '#ccfbf1'], ['#4a3311', '#fef3c7'],
  ['#2c3e50', '#e2e8f0'], ['#402a2a', '#fde8e8'],
];

function colorDeTitulo(texto) {
  let suma = 0;
  for (const caracter of texto) suma = (Math.imul(suma, 31) + caracter.codePointAt(0)) >>> 0;
  return PALETA_PORTADAS[suma % PALETA_PORTADAS.length];
}

function repartirEnLineas(contexto, texto, ancho) {
  const lineas = [];
  let actual = '';
  for (const palabra of texto.split(/\s+/).filter(Boolean)) {
    const intento = actual ? `${actual} ${palabra}` : palabra;
    if (actual && contexto.measureText(intento).width > ancho) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = intento;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

const LINEAS_TITULO = 5;

async function portadaDeTitulo(titulo, autor) {
  const texto = (titulo || '').trim();
  if (!texto) return null; // sin título no hay nada que dibujar: queda el icono
  const alto = Math.round(ANCHO * 1.5);
  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO;
  lienzo.height = alto;
  const contexto = lienzo.getContext('2d');
  const [fondo, tinta] = colorDeTitulo(texto);
  contexto.fillStyle = fondo;
  contexto.fillRect(0, 0, ANCHO, alto);
  // Un filete por dentro, que es lo que hace que se lea como una tapa y no
  // como un rectángulo de color.
  contexto.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  contexto.lineWidth = 1;
  contexto.strokeRect(8.5, 8.5, ANCHO - 17, alto - 17);

  const margen = 22;
  const util = ANCHO - margen * 2;
  contexto.fillStyle = tinta;
  contexto.textBaseline = 'top';
  // El cuerpo baja hasta que el título quepa: un título largo en letra grande
  // se comería la tapa entera.
  let cuerpo = 24;
  let lineas = [];
  while (cuerpo > 12) {
    contexto.font = `600 ${cuerpo}px Georgia, "Times New Roman", serif`;
    lineas = repartirEnLineas(contexto, texto, util);
    if (lineas.length <= LINEAS_TITULO) break;
    cuerpo -= 2;
  }
  if (lineas.length > LINEAS_TITULO) {
    lineas = lineas.slice(0, LINEAS_TITULO);
    lineas[LINEAS_TITULO - 1] = `${lineas[LINEAS_TITULO - 1]}…`;
  }
  const interlineado = Math.round(cuerpo * 1.25);
  let y = Math.round(alto * 0.16);
  for (const linea of lineas) {
    contexto.fillText(linea, margen, y);
    y += interlineado;
  }

  const nombre = (autor || '').trim();
  if (nombre) {
    contexto.font = '500 13px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    const [autorRecortado] = repartirEnLineas(contexto, nombre, util);
    const base = alto - margen - 18;
    contexto.globalAlpha = 0.5;
    contexto.fillRect(margen, base - 14, Math.min(util, 48), 1);
    contexto.globalAlpha = 0.85;
    contexto.fillText(autorRecortado, margen, base);
    contexto.globalAlpha = 1;
  }
  return aPng(lienzo);
}

function aTexto(valor) {
  if (Array.isArray(valor)) return valor.map(aTexto).filter(Boolean).join(', ');
  if (valor && typeof valor === 'object') return aTexto(valor.name ?? valor.value ?? valor.label ?? '');
  return valor == null ? '' : String(valor);
}
