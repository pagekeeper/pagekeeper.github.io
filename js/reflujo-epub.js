// Qué posición vale después de que epub.js vuelva a componer el capítulo.
//
// Al cambiar el tamaño de la ventana (a mano o con F11) las páginas se cortan
// por sitios nuevos, contados desde el principio del capítulo, así que la
// página que contiene el punto por el que se iba leyendo casi siempre empieza
// un poco antes que él. epub.js da por posición ese inicio, y aceptarlo
// retrasaba la lectura media página en cada reajuste: entrar y salir de
// pantalla completa, o arrastrar el borde de la ventana (que son muchos
// reajustes seguidos), dejaba el libro páginas atrás.
//
// Mientras dura el reajuste manda el punto de lectura de antes —el ancla— si
// la página nueva se lo ha comido por delante pero sigue enseñándolo. Fuera de
// un reajuste no hay ancla y vale siempre lo que diga epub.js.
//
// `comparar` es el comparador de CFI de epub.js (devuelve <0, 0 o >0); se pasa
// como parámetro porque vive en la librería y aquí no se la quiere. Puede
// lanzar con CFI de capítulos distintos o mal formados: entonces no hay nada
// que decidir y manda la posición que trae la vista.
export function posicionTrasReflujo(inicio, fin, ancla, comparar) {
  if (!inicio || !ancla || ancla === inicio) return inicio;
  try {
    const hasta = fin ?? inicio;
    if (comparar(inicio, ancla) < 0 && comparar(hasta, ancla) >= 0) return ancla;
  } catch { /* CFI de otro capítulo o ilegible */ }
  return inicio;
}
