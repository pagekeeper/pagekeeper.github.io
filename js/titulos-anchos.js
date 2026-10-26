// Títulos con una palabra más ancha que la columna.
//
// Hay libros que ponen los títulos en letra enorme y espaciada, pensando en
// una pantalla ancha: el del Lazarillo de ejemplo va al 300 % con las letras
// separadas, y en un móvil de 360 px «FORTUNAS» o «ADVERSIDADES» no caben.
// Partirlas (que es lo que hace `overflow-wrap: break-word` con cualquier
// palabra) evita que se corten, pero deja «LAZARIL / LO»; en un título se
// prefiere encoger la letra hasta que la palabra quepa entera.
//
// Aquí solo está la cuenta. Medir las palabras necesita el capítulo ya
// repartido en columnas, y eso lo hace lector-epub.js.

export const SELECTOR_TITULOS = 'h1, h2, h3, h4, h5, h6';

// No se encoge por debajo de la mitad: una palabra que ni así cabe (un
// compuesto alemán larguísimo) se queda partida, que es mejor que ilegible.
export const ESCALA_MINIMA = 0.5;

// Un poco por debajo del hueco justo, para que el redondeo de los píxeles no
// la deje a una letra de no caber.
const HOLGURA = 0.97;

// Por cuánto multiplicar el cuerpo de letra del título para que su palabra
// más ancha quepa en el hueco. 1 si ya cabe o si faltan medidas.
export function escalaParaQueQuepa(anchoPalabra, hueco) {
  if (!(anchoPalabra > 0) || !(hueco > 0) || anchoPalabra <= hueco) return 1;
  return Math.max(ESCALA_MINIMA, (hueco * HOLGURA) / anchoPalabra);
}

// Dónde empieza y acaba cada palabra de un texto, para medirlas una a una.
export function tramosDePalabras(texto) {
  return [...String(texto ?? '').matchAll(/\S+/g)]
    .map((coincidencia) => [coincidencia.index, coincidencia.index + coincidencia[0].length]);
}
