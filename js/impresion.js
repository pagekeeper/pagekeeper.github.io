// Llevar un EPUB al papel (o a un PDF, que es lo que casi siempre se quiere).
//
// El PDF no lo generamos nosotros: se arma un documento con los capítulos
// elegidos, se le pone una hoja de estilo pensada para hojas de papel y se
// abre el diálogo de impresión del navegador, donde «Guardar como PDF» ya
// está. Así se aprovechan la maquetación del libro, sus imágenes y su
// tipografía sin traer ninguna librería nueva.
//
// Aquí vive lo que se puede decidir sin mirar la pantalla: qué capítulos hay y
// cómo se llaman, qué mide una página, qué dice la hoja de estilo y cómo se
// reparten las anotaciones por capítulo. Montar el documento y hablar con el
// navegador es cosa de app.js.

// Las medidas van en milímetros porque es lo que entiende el papel. Carta es
// la de Norteamérica; el resto del mundo imprime en A4.
export const TAMANOS = {
  a4: { ancho: 210, alto: 297 },
  carta: { ancho: 216, alto: 279 },
};

// Márgenes en milímetros. El estrecho ahorra hojas y el ancho deja sitio para
// escribir al lado, que es para lo que se imprime un libro que se estudia.
export const MARGENES = { estrecho: 12, normal: 20, ancho: 30 };

// El cuerpo de letra, en puntos: la unidad del papel, no de la pantalla.
export const LETRAS = { pequena: 9.5, normal: 11, grande: 13 };

// Los mismos colores de la paleta de resaltado, rebajados: en pantalla el
// subrayado va traslúcido sobre el texto y en el papel hay que pedirlo ya
// mezclado, porque no hay capas que fundir.
export const RELLENOS_PAPEL = {
  amarillo: '#fdf0a8',
  verde: '#c8f3d4',
  azul: '#c5e8fb',
  rosa: '#fbd4e6',
};

export function opcionValida(valor, opciones, porDefecto) {
  return Object.hasOwn(opciones, valor) ? valor : porDefecto;
}

// ── Qué capítulos hay ──

// El índice del libro trae los títulos; la lomera (el «spine»), el orden real
// de lectura. Se cruzan por la ruta del archivo, que es lo único que
// comparten, y sin olvidar que la del índice suele llevar un ancla detrás.
export function rutaSinAncla(href) {
  return String(href ?? '').split('#')[0].replace(/^\.?\//, '');
}

// Un mismo capítulo aparece en el índice con la ruta escrita de varias
// maneras según quién haya hecho el libro. Si no coinciden enteras se compara
// el nombre del archivo, que es lo que de verdad lo identifica.
function mismaRuta(una, otra) {
  const a = rutaSinAncla(una);
  const b = rutaSinAncla(otra);
  if (!a || !b) return false;
  return a === b || a.split('/').pop() === b.split('/').pop();
}

// Aplana el índice: sus entradas pueden colgar unas de otras y aquí solo
// interesa qué título le toca a cada archivo. Gana la primera, que es la
// entrada del capítulo; las de dentro son sus apartados.
export function titulosDelIndice(entradas) {
  const titulos = [];
  const recorrer = (lista) => {
    for (const entrada of lista ?? []) {
      const ruta = rutaSinAncla(entrada?.href);
      const titulo = String(entrada?.label ?? '').replace(/\s+/g, ' ').trim();
      if (ruta && titulo) titulos.push({ ruta, titulo });
      recorrer(entrada?.subitems);
    }
  };
  recorrer(entradas);
  return titulos;
}

// La lista que se enseña para elegir. Se dejan fuera las secciones que el
// propio libro marca como no lineales (cubiertas, páginas de créditos que se
// alcanzan solo por enlace): no se leen en orden y casi nunca se imprimen.
//
// Sin título en el índice se numera. Es mejor «Capítulo 7» que un nombre de
// archivo, que no le dice nada a quien está eligiendo qué imprimir.
export function capitulosImprimibles(secciones, entradasIndice, nombrarSinTitulo) {
  const titulos = titulosDelIndice(entradasIndice);
  let numero = 0;
  return (secciones ?? [])
    .filter((seccion) => seccion?.linear !== 'no' && seccion?.href)
    .map((seccion) => {
      numero += 1;
      const encontrado = titulos.find((entrada) => mismaRuta(entrada.ruta, seccion.href));
      return {
        href: seccion.href,
        indice: seccion.index,
        numero,
        titulo: encontrado?.titulo || nombrarSinTitulo(numero),
      };
    });
}

// ── Las anotaciones ──

// A qué capítulo pertenece cada anotación. `capituloDe` lo resuelve quien
// llama (es epub.js quien sabe leer un CFI), y aquí se agrupan y se dejan
// listas para numerar. Las que no se pueden situar se descartan: son de una
// versión del libro que ya no está.
export function anotacionesPorCapitulo(anotaciones, capituloDe) {
  const porCapitulo = new Map();
  for (const anotacion of anotaciones ?? []) {
    if (!anotacion?.cfi) continue;
    const href = capituloDe(anotacion.cfi);
    if (!href) continue;
    if (!porCapitulo.has(href)) porCapitulo.set(href, []);
    porCapitulo.get(href).push(anotacion);
  }
  return porCapitulo;
}

// El color con el que sale un subrayado en el papel. Las anotaciones de antes
// de la paleta no traen color: se les respeta el aspecto que han tenido
// siempre, amarillo, o azul cuando llevan nota.
export function rellenoDePapel(anotacion) {
  const color = anotacion?.color;
  if (color && Object.hasOwn(RELLENOS_PAPEL, color)) return RELLENOS_PAPEL[color];
  return anotacion?.nota ? RELLENOS_PAPEL.azul : RELLENOS_PAPEL.amarillo;
}

// ── La hoja de estilo ──

// Lo que se le pide al papel, y que el libro no puede saber: el tamaño de la
// hoja, dónde empieza cada capítulo y que una ilustración no se salga por el
// borde. Va después de las hojas del propio libro, así que gana en lo que
// discutan; lo marcado con `!important` es lo que el libro suele fijar para
// la pantalla y en el papel estorba (anchos en píxeles, márgenes del cuerpo).
export function hojaDeImpresion({ tamano = 'a4', margen = 'normal', letra = 'normal' } = {}) {
  const hoja = TAMANOS[opcionValida(tamano, TAMANOS, 'a4')];
  const blanco = MARGENES[opcionValida(margen, MARGENES, 'normal')];
  const cuerpo = LETRAS[opcionValida(letra, LETRAS, 'normal')];
  return `
@page { size: ${hoja.ancho}mm ${hoja.alto}mm; margin: ${blanco}mm; }
html, body {
  margin: 0 !important; padding: 0 !important;
  width: auto !important; max-width: none !important;
  font-size: ${cuerpo}pt !important; line-height: 1.45;
  color: #000; background: #fff;
}
body { hyphens: auto; text-align: justify; }
/* Cada capítulo empieza en hoja nueva, menos el primero: una hoja en blanco
   al principio es papel tirado. */
.pk-capitulo { break-before: page; }
.pk-capitulo:first-of-type { break-before: auto; }
/* Un título al pie de la hoja, con su texto en la siguiente, se lee fatal. */
h1, h2, h3, h4, h5, h6 { break-after: avoid; text-align: left; hyphens: none; }
p { orphans: 2; widows: 2; }
img, svg, image { max-width: 100% !important; height: auto !important; break-inside: avoid; }
table, figure, blockquote { break-inside: avoid; }
/* Los enlaces del libro no llevan a ninguna parte en el papel: se quedan como
   texto normal para no confundir con un subrayado. */
a { color: inherit; text-decoration: none; }
/* La portadilla que abre el documento: el título y el autor, y nada más. */
.pk-portada { text-align: center; break-after: page; padding-top: 30mm; }
.pk-portada h1 { font-size: 2em; text-align: center; margin: 0 0 0.6em; }
.pk-portada p { text-align: center; margin: 0; }
/* Los subrayados. Sin esto el navegador quita los fondos al imprimir y el
   papel saldría sin ninguna marca. */
.pk-subrayado { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.pk-llamada { font-size: 0.75em; vertical-align: super; line-height: 0; }
/* Las notas, al final de su capítulo: cerca de lo que comentan, y sin
   partirse de una hoja a otra si caben juntas. */
.pk-notas { break-inside: avoid; margin-top: 2em; padding-top: 0.6em;
  border-top: 1px solid #999; font-size: 0.85em; text-align: left; }
.pk-notas h2 { font-size: 1em; margin: 0 0 0.4em; }
.pk-notas ol { margin: 0; padding-left: 1.4em; }
.pk-notas li { margin-bottom: 0.4em; }
.pk-notas blockquote { margin: 0 0 0.2em; font-style: italic; }
.pk-nota-texto { margin: 0; }
`.trim();
}

// ── Estado del diálogo ──

// El nombre que el navegador propone al guardar el PDF sale del título del
// documento, así que se cuida: sin los caracteres que ningún sistema de
// archivos admite y sin quedarse vacío.
export function tituloDelDocumento(titulo, respaldo = 'libro') {
  const limpio = String(titulo ?? '').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
  return limpio || respaldo;
}

// Cuántos capítulos se llevan de cuántos, para el pie del diálogo.
export function resumenSeleccion(elegidos, total, textos) {
  if (!elegidos) return textos.ninguno;
  if (elegidos >= total) return textos.todos;
  return textos.algunos({ elegidos, total });
}
