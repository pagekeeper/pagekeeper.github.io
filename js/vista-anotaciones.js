// Cómo se presentan las anotaciones: dónde cae una ventana flotante, en qué
// orden va la lista, qué deja pasar la búsqueda y cómo se exportan a Markdown.
// Crearlas y sincronizarlas es cosa de anotaciones.js; pintarlas, del lector.

// Una nota no es un ensayo: pasado esto, ni se lee en el panel ni cabe en la
// ventana emergente.
export const LARGO_NOTA = 4000;

export function recortarNota(texto) {
  return (texto ?? '').trim().slice(0, LARGO_NOTA);
}

// El color que llega de fuera (un ajuste viejo, un archivo sincronizado por
// otra versión) puede no ser de la paleta: entonces manda el de siempre.
export function colorValido(color, paleta, porDefecto = 'amarillo') {
  return paleta.includes(color) ? color : porDefecto;
}

// ── Ventanas flotantes ──
//
// La nota emergente y el menú de una nota se colocan junto al texto subrayado.
// La regla es la misma para las dos: se intenta el lado de siempre y, si ahí
// no cabe, se prueba el contrario; y en cualquier caso no se sale de la
// pantalla, que es lo que dejaría media ventana sin ver.
export function colocarFlotante({
  ancla, ancho, alto, ventana, margen = 8, separacion = margen,
  alinear = 'izquierda', preferir = 'arriba',
}) {
  const izquierda = Math.min(
    ventana.ancho - ancho - margen,
    Math.max(margen, alinear === 'derecha' ? ancla.right - ancho : ancla.left),
  );
  const arriba = preferir === 'arriba' ? ancla.top - alto - separacion : ancla.bottom + separacion;
  // Si por el lado preferido se sale, se prueba el otro.
  const cabe = preferir === 'arriba'
    ? arriba >= margen
    : arriba + alto <= ventana.alto - margen;
  const otro = preferir === 'arriba' ? ancla.bottom + separacion : ancla.top - alto - separacion;
  const elegido = cabe ? arriba : otro;
  return {
    izquierda,
    arriba: Math.min(ventana.alto - alto - margen, Math.max(margen, elegido)),
  };
}

// ── La lista ──

// Orden de lectura: por página en PDF y por fecha de creación en EPUB (los CFI
// no se pueden comparar como texto plano).
export function ordenarAnotaciones(anotaciones) {
  return [...anotaciones].sort((a, b) =>
    (a.paginas?.[0]?.pagina ?? 0) - (b.paginas?.[0]?.pagina ?? 0) ||
    (a.creado ?? '').localeCompare(b.creado ?? ''));
}

// La búsqueda mira el pasaje subrayado y la nota juntos: se busca lo que se
// recuerda, sin tener que acordarse de en cuál de los dos estaba.
export function filtrarAnotaciones(anotaciones, consulta, normalizar) {
  if (!consulta) return anotaciones;
  return anotaciones.filter((anotacion) =>
    normalizar(`${anotacion.texto ?? ''} ${anotacion.nota ?? ''}`).includes(consulta));
}

// A dónde lleva una anotación al pulsarla: el CFI en EPUB, la página en PDF.
export function destinoDeAnotacion(anotacion) {
  return anotacion.cfi ?? anotacion.paginas?.[0]?.pagina;
}

// ── Exportación ──

// Los caracteres que ningún sistema de archivos admite en un nombre.
export function nombreDeArchivo(titulo, sufijo, respaldo = 'libro') {
  const limpio = (titulo ?? '').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
  return `${limpio || respaldo} - ${sufijo}.md`;
}

// El archivo que se lleva quien exporta. La nota del libro va primero y
// entera: habla del libro, no de un pasaje, así que no encaja en la lista de
// subrayados que viene detrás. Cada anotación es una cita, su nota y dónde
// estaba, separadas por una raya.
export function markdownDeAnotaciones({
  anotaciones, textos, notaLibro = '', ubicacionDe = () => '',
}) {
  const lineas = [`# ${textos.cabecera}`, '', textos.origen, ''];
  if (notaLibro) lineas.push(`## ${textos.notaDelLibro}`, '', notaLibro, '');
  for (const anotacion of anotaciones) {
    lineas.push('---', '');
    const cita = (anotacion.texto ?? '').trim();
    if (cita) {
      // Cada línea con su «>»: si no, un pasaje de varias líneas rompe la cita.
      for (const linea of cita.split('\n')) lineas.push(`> ${linea}`);
      lineas.push('');
    }
    if (anotacion.nota) lineas.push(`**${textos.nota}:** ${anotacion.nota.trim()}`, '');
    const ubicacion = ubicacionDe(anotacion);
    if (ubicacion) lineas.push(`*${ubicacion}*`, '');
  }
  return lineas.join('\n');
}
