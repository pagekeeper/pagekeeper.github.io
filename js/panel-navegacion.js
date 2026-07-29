// Cuentas del panel lateral con el que se navega el libro: el índice de
// capítulos, las miniaturas de las páginas y el ancho de la propia barra.
//
// Aquí está lo que se puede decidir sin mirar la pantalla: qué anchos son
// admisibles, con qué pestañas cuenta el panel, por qué capítulo se va, qué
// miniaturas ya se pueden soltar. Montarlas y pintarlas es cosa del lector.

// ── Ancho de la barra lateral ──
//
// Se guarda en píxeles porque lo que importa es cuánto sitio le queda a la
// lectura en esta pantalla, no cuánto mide en función del tamaño de letra.

export const ANCHO_INDICE_MINIMO = 200;
export const ANCHO_INDICE_POR_DEFECTO = 304; // los 19rem del diseño

// El panel nunca se queda con más de media pantalla, pero tampoco baja del
// mínimo aunque la ventana sea estrechísima: por debajo no se lee el índice.
export function anchoIndiceMaximo(anchoVentana) {
  return Math.max(ANCHO_INDICE_MINIMO, Math.round(anchoVentana * 0.5));
}

export function anchoIndiceLimitado(ancho, anchoVentana) {
  return Math.min(anchoIndiceMaximo(anchoVentana),
    Math.max(ANCHO_INDICE_MINIMO, Math.round(ancho)));
}

// ── Con qué cuenta el panel ──
//
// En PDF el panel tiene dos pestañas; en EPUB solo el índice. Cuando un PDF no
// trae índice (los escaneados casi nunca lo traen), el panel se abre
// directamente en las miniaturas, que es justo cuando más falta hacen.

export function disposicionPanel(conIndice, conMiniaturas) {
  return {
    hayBoton: conIndice || conMiniaturas,
    hayPestanas: conIndice && conMiniaturas,
    // El título nombra el contenido cuando no hay pestañas que ya lo digan.
    hayTitulo: !(conIndice && conMiniaturas),
    hayPestanaIndice: conIndice,
    pestanaInicial: conIndice ? 'indice' : 'miniaturas',
  };
}

// El botón no siempre abre lo mismo: hay libros con índice, PDF escaneados que
// solo traen miniaturas y PDF con las dos cosas. Decirlo evita que las
// miniaturas queden escondidas detrás de una etiqueta que no las nombra.
export function claveBotonIndice(abierto, conIndice, conMiniaturas) {
  const que = conIndice && conMiniaturas ? 'IndexThumbs' : conIndice ? 'Index' : 'Thumbs';
  return (abierto ? 'hide' : 'show') + que;
}

// Flechas, Inicio y Fin para moverse entre pestañas, como en cualquier otro
// grupo de pestañas: quien navega con teclado no espera tener que tabular.
// Devuelve la pestaña a la que ir, o null si la tecla no era para esto.
export function pestanaDestino(tecla, actual, total) {
  if (actual < 0 || total <= 0) return null;
  if (tecla === 'ArrowRight' || tecla === 'ArrowDown') return (actual + 1) % total;
  if (tecla === 'ArrowLeft' || tecla === 'ArrowUp') return (actual - 1 + total) % total;
  if (tecla === 'Home') return 0;
  if (tecla === 'End') return total - 1;
  return null;
}

// ── Por qué capítulo se va ──
//
// El índice da el punto donde empieza cada capítulo, así que el activo es el
// último que ya ha quedado atrás: en PDF, el de mayor página que no pase de la
// actual; en EPUB, lo mismo con la sección. Las entradas sin número (un
// capítulo que el libro no sitúa) no compiten.
export function entradaActiva(valores, posicion) {
  if (!Number.isInteger(posicion)) return -1;
  let activa = -1;
  for (const [i, valor] of valores.entries()) {
    if (Number.isFinite(valor) && valor <= posicion) activa = i;
  }
  return activa;
}

// ── Miniaturas ──

// Se dibujan solo las que entran en la vista y se sueltan las que se alejan: un
// PDF largo no puede tener cientos de miniaturas en memoria.
export const MAXIMO_MINIATURAS = 40;
// Las miniaturas siguen al ancho del panel, con un tope para no dibujar más
// píxeles de los que se van a ver.
export const ANCHO_MINIATURA_MINIMO = 140;
export const ANCHO_MINIATURA_MAXIMO = 320;

export function anchoDeMiniatura(disponible) {
  return Math.round(Math.min(ANCHO_MINIATURA_MAXIMO,
    Math.max(ANCHO_MINIATURA_MINIMO, disponible || ANCHO_MINIATURA_MINIMO)));
}

// Redibujar cuesta, pero una miniatura estirada se ve borrosa: se rehacen solo
// cuando el ancho ha cambiado de veras.
export const CAMBIO_ANCHO_MINIATURA = 24;

export function tocaRehacerMiniaturas(anchoNuevo, anchoViejo) {
  return Math.abs(anchoNuevo - anchoViejo) > CAMBIO_ANCHO_MINIATURA;
}

// Cuánto se ha ido una caja fuera del marco por arriba o por abajo. Cero si
// asoma aunque sea en parte.
export function distanciaFuera(caja, marco) {
  return Math.max(marco.top - caja.bottom, caja.top - marco.bottom, 0);
}

export function estaALaVista(caja, marco) {
  return caja.top >= marco.top && caja.bottom <= marco.bottom;
}

// De las miniaturas ya dibujadas, las que toca soltar: las que se han quedado
// más lejos de la vista, y solo tantas como sobren. Las que asoman en pantalla
// no se tocan aunque se pase del máximo.
export function miniaturasQuePodar(dibujadas, montadas, maximo = MAXIMO_MINIATURAS) {
  const sobran = montadas - maximo;
  if (sobran <= 0) return [];
  return dibujadas
    .filter((entrada) => entrada.distancia > 0)
    .sort((a, b) => b.distancia - a.distancia)
    .slice(0, sobran);
}
