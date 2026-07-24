// El resumen que traen los metadatos del libro: la descripción del EPUB o, en
// un PDF, el «asunto» (Subject), que es donde se suele guardar la sinopsis.
//
// Viene tal cual del archivo, así que puede llegar con etiquetas HTML, con
// entidades sin resolver o con miles de caracteres. Aquí se deja en texto
// llano y de un largo que quepa en un aviso emergente.

const LARGO_MAXIMO = 700;

export function resumenDeMetadatos(metadatos, largoMaximo = LARGO_MAXIMO) {
  const bruto = metadatos?.descripcion || metadatos?.asunto || '';
  const texto = recortar(aTextoLlano(bruto), largoMaximo);
  // Un asunto de una o dos palabras («Informe», el nombre del programa que
  // generó el PDF…) no es un resumen: no merece un aviso emergente.
  return texto.length >= 40 ? texto : '';
}

function aTextoLlano(bruto) {
  return String(bruto ?? '')
    // Los saltos de párrafo del HTML se conservan como espacio, que si no las
    // frases se quedan pegadas al quitar las etiquetas.
    .replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, '\'')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// Corta por el último espacio para no partir una palabra por la mitad.
function recortar(texto, largoMaximo) {
  if (texto.length <= largoMaximo) return texto;
  const trozo = texto.slice(0, largoMaximo);
  const espacio = trozo.lastIndexOf(' ');
  return `${(espacio > largoMaximo * 0.6 ? trozo.slice(0, espacio) : trozo).replace(/[\s,;:.]+$/, '')}…`;
}
