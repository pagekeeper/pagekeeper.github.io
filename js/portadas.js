// Miniaturas de portada para la biblioteca.
//
// PDF: se dibuja la primera página. EPUB: se usa la imagen de cubierta
// declarada en el libro (si no hay, se conserva el icono genérico).
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
    if (!url) return { blob: null, metadatos };
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

function aTexto(valor) {
  if (Array.isArray(valor)) return valor.map(aTexto).filter(Boolean).join(', ');
  if (valor && typeof valor === 'object') return aTexto(valor.name ?? valor.value ?? valor.label ?? '');
  return valor == null ? '' : String(valor);
}
