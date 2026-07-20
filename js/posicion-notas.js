const MARGEN_ICONO = 4;
const SEPARACION_ICONOS = 34;

export function posicionVerticalLibre(posicionDeseada, posicionesOcupadas, altoDisponible) {
  const maximo = Math.max(MARGEN_ICONO, altoDisponible - SEPARACION_ICONOS);
  const preferida = Math.min(maximo, Math.max(MARGEN_ICONO, posicionDeseada));
  const estaLibre = (posicion) => posicionesOcupadas.every(
    (ocupada) => Math.abs(ocupada - posicion) >= SEPARACION_ICONOS,
  );

  if (estaLibre(preferida)) return preferida;

  const recorrido = maximo - MARGEN_ICONO;
  for (let desplazamiento = 1; desplazamiento <= recorrido; desplazamiento += 1) {
    const debajo = preferida + desplazamiento;
    if (debajo <= maximo && estaLibre(debajo)) return debajo;

    const encima = preferida - desplazamiento;
    if (encima >= MARGEN_ICONO && estaLibre(encima)) return encima;
  }

  return preferida;
}
