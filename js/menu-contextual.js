// Dentro del lector, el menú contextual solo se abre con el ratón: en táctil
// la pulsación larga ya sirve para seleccionar texto y resaltarlo, y robársela
// dejaría el libro sin anotaciones en el móvil.
//
// Los navegadores actuales mandan el «contextmenu» como PointerEvent y basta
// mirar de qué puntero viene; donde todavía llega como MouseEvent (sin
// pointerType) queda el botón: el derecho es 2 y el que sintetiza la pulsación
// larga es 0.
export function abrePorRaton(evento) {
  if (evento?.pointerType) return evento.pointerType === 'mouse';
  return evento?.button === 2;
}
