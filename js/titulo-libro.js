// Con qué nombre se enseña un libro.
//
// Hay tres candidatos y no siempre coinciden: el que puso quien lee (que manda
// siempre), el que trae el libro en sus metadatos y el del archivo. El del
// archivo suele ser el peor —«Butlin_et_al_Indicadores_ES_con_figuras»— y es,
// sin embargo, el único que se conoce nada más abrir.
//
// La regla vive aquí porque se aplica en dos sitios que se veían distintos: la
// biblioteca enseñaba el título bueno y la cabecera del lector, el nombre del
// archivo, así que el mismo libro tenía dos nombres según dónde se mirara.

export function tituloMostrado({ personalizado, metadatos, archivo } = {}) {
  const candidatos = [personalizado, metadatos?.titulo, archivo];
  for (const candidato of candidatos) {
    const limpio = String(candidato ?? '').replace(/\s+/g, ' ').trim();
    if (limpio) return limpio;
  }
  return '';
}
