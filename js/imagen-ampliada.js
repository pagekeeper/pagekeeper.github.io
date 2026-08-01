// Cuándo una ilustración del libro merece abrirse a pantalla completa.
//
// Subir el tamaño de la letra en un EPUB no toca las imágenes: epub.js cambia
// el `font-size` del cuerpo y el ancho de una foto está en píxeles o en un
// porcentaje de la columna. Con la letra grande, la ilustración se queda
// diminuta y no hay forma de mirarla de cerca. Se abre pulsándola.
//
// El problema es que las bandas invisibles de pasar página tapan buena parte
// del texto, imágenes incluidas, así que el clic llega primero a la banda —lo
// mismo que ya pasaba con los enlaces— y hay que decidir quién manda. Estas
// cuentas son las que no necesitan mirar el DOM.

// Por debajo de este lado, en píxeles de pantalla, casi nunca es una
// ilustración: son viñetas de lista, iconos de nota al pie, adornos de
// separación y letras capitulares. Ampliarlas no enseña nada y sí estorba a
// quien solo quería pasar de página.
export const LADO_MINIMO = 48;

// Y si la imagen ya ocupa casi toda la pantalla —una lámina a página entera,
// una página de cómic— ampliarla apenas gana tamaño, mientras que abrir el
// visor dejaría sin efecto las cuatro bandas en toda esa página. Solo se
// aplica cuando el clic viene de una banda: pulsando en el centro no hay nada
// que estorbar.
export const COBERTURA_MAXIMA = 0.85;

export function imagenAmpliable(imagen, vista, { desdeZona = false } = {}) {
  if (!imagen?.fuente) return false;
  const { ancho, alto } = imagen;
  if (!(ancho > 0) || !(alto > 0)) return false;
  if (Math.min(ancho, alto) < LADO_MINIMO) return false;
  if (!desdeZona) return true;
  const areaVista = Math.max(0, vista?.ancho ?? 0) * Math.max(0, vista?.alto ?? 0);
  if (!areaVista) return true;
  return ancho * alto < areaVista * COBERTURA_MAXIMA;
}

// Qué se anuncia al abrirla. El `alt` de un EPUB va desde una frase útil hasta
// el nombre del archivo repetido en cada capítulo; se limpia y se recorta, y
// si no dice nada se deja el respaldo genérico.
const LARGO_MAXIMO_DESCRIPCION = 120;

export function descripcionImagen(alt, titulo, respaldo = '') {
  const texto = [alt, titulo]
    .map((valor) => (typeof valor === 'string' ? valor.replace(/\s+/g, ' ').trim() : ''))
    .find((valor) => valor.length > 0);
  if (!texto) return respaldo;
  return texto.length > LARGO_MAXIMO_DESCRIPCION
    ? `${texto.slice(0, LARGO_MAXIMO_DESCRIPCION - 1).trimEnd()}…`
    : texto;
}
