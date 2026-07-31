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
// El ajuste se le pide al lector en letras por línea, no en em, porque es lo
// que se ve y lo que se puede contar en la pantalla: «no quiero líneas de más
// de 50 letras» es una frase que significa algo, y «columnas de 20 em» no.
// La conversión sale de medir: con las tipografías de libro un carácter ocupa
// unos 0,41 em de media.
export const EM_POR_CARACTER = 0.41;

// De partida, 45 letras: el extremo bajo de la horquilla cómoda (45-75), a
// propósito. En pantalla, dos columnas de 45 letras se leen mejor que una sola
// línea de 90 cruzando el monitor, y con la letra grande —que es cuando de
// verdad hacen falta— dos columnas no caben si se les exige más. Quien lo
// prefiera al revés sube el número y las columnas tardan más en aparecer.
//
// Calibre resuelve esto con 35 em fijos, que con esta tipografía son 85 letras:
// columnas tan anchas que las dos columnas no salen más que en pantallas
// enormes o con el texto diminuto.
export const LETRAS_INICIALES = 45;
export const LETRAS_MINIMAS = 30;
export const LETRAS_MAXIMAS = 90;

// El ajuste, dejado en algo utilizable. Se redondea a múltiplos de cinco: son
// los pasos del deslizador, y una letra arriba o abajo no cambia nada.
export function normalizarLetrasPorLinea(valor) {
  // Como en normalizarColumnas(): primero la forma, porque Number(null) y
  // Number('') dan cero y un ajuste que falta acabaría valiendo el mínimo.
  const esNumero = typeof valor === 'number';
  const esCifra = typeof valor === 'string' && /^-?\d+$/.test(valor.trim());
  if (!esNumero && !esCifra) return LETRAS_INICIALES;
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return LETRAS_INICIALES;
  const redondeado = Math.round(numero / 5) * 5;
  return Math.min(LETRAS_MAXIMAS, Math.max(LETRAS_MINIMAS, redondeado));
}

// Lo que ocupa una columna de tantas letras, en cuerpos de letra.
export function emPorColumna(letrasPorLinea = LETRAS_INICIALES) {
  return normalizarLetrasPorLinea(letrasPorLinea) * EM_POR_CARACTER;
}
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
//
// El hueco entre columnas cuenta: no es adorno, es ancho que no es texto, y
// olvidarlo salía caro justo donde más columnas hay. Con cuatro columnas en un
// monitor ancho se comía casi un tercio del sitio, y las líneas quedaban en 38
// letras cuando la cuenta prometía 44.
export function columnasAutomaticas(ancho, letraPx, hueco = 0, letrasPorLinea = LETRAS_INICIALES) {
  const anchoColumna = emPorColumna(letrasPorLinea) * (letraPx > 0 ? letraPx : 16);
  const caben = Math.floor((ancho > 0 ? ancho : 0) / (anchoColumna + Math.max(0, hueco)));
  return Math.min(COLUMNAS_MAXIMAS, Math.max(1, caben));
}

// Las columnas que toca pintar ahora mismo: el número elegido, o el que salga
// de la pantalla si se dejó en automático.
export function columnasEfectivas(valor, ancho, letraPx, hueco = 0, letrasPorLinea = LETRAS_INICIALES) {
  const elegido = normalizarColumnas(valor);
  return elegido === 'auto'
    ? columnasAutomaticas(ancho, letraPx, hueco, letrasPorLinea)
    : elegido;
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
