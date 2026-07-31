// Cuántas columnas de texto se reparten en la pantalla.
//
// Un EPUB no tiene páginas: el capítulo se compone en columnas del ancho de la
// pantalla y pasar página es correr la tira. Cuántas columnas caben a la vez
// era hasta ahora una elección de dos valores (una o dos); aquí se generaliza,
// y se añade la opción de que lo decida la aplicación.
//
// El automático mide en cuerpos de letra, no en píxeles, que es lo que importa
// para leer: una columna cómoda tiene entre 45 y 75 caracteres por línea pase
// lo que pase con el tamaño de la letra o la resolución de la pantalla. Así, al
// agrandar la letra las columnas se reducen solas en vez de quedarse en dos
// columnas estrechísimas.
//
// Cuántos em son esos caracteres depende de la tipografía. Medido con letras
// de libro, un carácter ocupa unos 0,41 em, así que 28 em salen a unas 68
// letras por línea, que cae en mitad de la horquilla. Calibre usa 35 em para
// esto mismo, pero eso da líneas de 85 caracteres: columnas más anchas de lo
// que hace falta, y entonces las dos columnas no aparecen más que en pantallas
// enormes o con la letra muy pequeña.
export const ANCHO_COLUMNA_EM = 28;
// Más de cuatro columnas solo caben en pantallas muy grandes o con letra muy
// pequeña, y para entonces cada una tiene tan pocas palabras por línea que se
// lee peor. El automático nunca pasa de aquí; a mano tampoco se ofrece más.
export const COLUMNAS_MAXIMAS = 4;

// Los valores que puede tomar el ajuste: 'auto' o un número de columnas.
export const VALORES = ['auto', 1, 2, 3, 4];

// Deja el valor guardado en algo utilizable. Lo que no se reconoce vuelve a
// 'auto', que es con lo que se estrena un libro.
export function normalizarColumnas(valor) {
  if (valor === 'auto') return 'auto';
  // Se comprueba la forma antes de convertir: Number(null) y Number('') dan
  // cero, y un ajuste que falta acabaría convertido en un número de columnas.
  const esNumero = typeof valor === 'number';
  const esCifra = typeof valor === 'string' && /^-?\d+$/.test(valor.trim());
  if (!esNumero && !esCifra) return 'auto';
  const numero = Number(valor);
  if (!Number.isInteger(numero)) return 'auto';
  return Math.min(COLUMNAS_MAXIMAS, Math.max(1, numero));
}

// Cuántas columnas caben en 'ancho' píxeles con una letra de 'letraPx'.
export function columnasAutomaticas(ancho, letraPx) {
  const anchoColumna = ANCHO_COLUMNA_EM * (letraPx > 0 ? letraPx : 16);
  const caben = Math.floor((ancho > 0 ? ancho : 0) / anchoColumna);
  return Math.min(COLUMNAS_MAXIMAS, Math.max(1, caben));
}

// Las columnas que toca pintar ahora mismo: el número elegido, o el que salga
// de la pantalla si se dejó en automático.
export function columnasEfectivas(valor, ancho, letraPx) {
  const elegido = normalizarColumnas(valor);
  return elegido === 'auto' ? columnasAutomaticas(ancho, letraPx) : elegido;
}

// El PDF llega ya maquetado: sus páginas son las que son y solo caben de una en
// una o de dos en dos, como hasta ahora. El menú se recorta para no ofrecer lo
// que ese lector no puede hacer.
export function valoresDisponibles(esPdf) {
  return esPdf ? [1, 2] : VALORES;
}

// Nombre de la clave de traducción y del icono de cada opción, para que el menú
// se pinte sin repartir estos nombres por la aplicación. En el PDF no son
// columnas de texto sino páginas enteras, y así se llaman.
export function aspectoDeLaOpcion(valor, esPdf = false) {
  if (valor === 'auto') return { clave: 'columnsAuto', icono: 'sparkles' };
  const icono = valor === 1 ? 'square' : `columns-${valor}`;
  if (esPdf) return { clave: valor === 1 ? 'onePage' : 'twoPages', icono };
  return { clave: `columns${['One', 'Two', 'Three', 'Four'][valor - 1]}`, icono };
}
