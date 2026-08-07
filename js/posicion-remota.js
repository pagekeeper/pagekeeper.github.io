// Qué hacer cuando, con el libro ya abierto, la sincronización trae una
// posición distinta de la que se está viendo.
//
// Abrir un libro de la nube sincroniza antes de leer la posición, pero esa
// petición puede fallar o tardar: el libro se abre entonces por donde iba este
// aparato, y la lectura hecha en el otro llega después. Hay dos situaciones
// muy distintas y hasta ahora solo se atendía la primera:
//
//  - Aquí no se ha leído nada todavía (el lector sigue donde se abrió): se
//    salta sin preguntar, porque no hay nada que interrumpir.
//  - Aquí ya se ha avanzado: mover la página por sorpresa sería peor que el
//    problema que arregla. Pero callarse tampoco vale, porque la fusión ya ha
//    decidido quedarse con la posición ajena y quien lee no se entera. Se
//    pregunta, diciendo los dos puntos para que pueda valorar cuál quiere.
//
// Pintar el cartel es cosa de app.js; aquí solo se decide.

// Por debajo de esto no se pregunta: un punto de porcentaje o una página de
// diferencia es el propio afinado de epub.js o un retoque sin importancia, y
// un cartel por eso sería ruido.
export const DIFERENCIA_MINIMA = 1;

// El CFI identifica el punto exacto en un EPUB; en PDF, el número de página.
export function claveDePosicion(avance) {
  if (avance?.cfi) return avance.cfi;
  return Number.isFinite(Number(avance?.pagina)) ? `p${avance.pagina}` : null;
}

// Cuánto separa las dos posiciones: páginas en PDF, puntos de porcentaje en
// EPUB. Devuelve null cuando no hay forma de saberlo —un EPUB cuyo reparto en
// localizaciones aún no está hecho anota el porcentaje del punto anterior (ver
// `porcentajeAproximado` en progreso.js)—, y sin ese número no se pregunta:
// más vale callar que enseñar una cifra que no es.
export function distanciaPosiciones(remoto, local) {
  if (remoto?.porcentajeAproximado || local?.porcentajeAproximado) return null;
  const aqui = Number(local?.pagina);
  const alli = Number(remoto?.pagina);
  if (!Number.isFinite(aqui) || !Number.isFinite(alli)) return null;
  return Math.abs(alli - aqui);
}

// `claveApertura` es la posición por la que se abrió el libro (y, tras un
// salto o una respuesta, la última aceptada); `claveLector`, la que se está
// viendo. Que sigan siendo la misma es lo que dice que aquí no se ha leído.
// `claveDescartada` recuerda a qué posición se dijo que no, para no volver a
// preguntar lo mismo en cada sincronización.
export function decidirPosicionRemota({
  clave, claveApertura, claveLector, claveDescartada = null, distancia = null,
}) {
  if (!clave) return 'nada';
  if (clave === claveApertura || clave === claveLector) return 'nada';
  if (claveLector === claveApertura) return 'saltar';
  if (clave === claveDescartada) return 'nada';
  if (distancia === null || distancia < DIFERENCIA_MINIMA) return 'nada';
  return 'preguntar';
}

// Con qué texto se pregunta y qué números lleva. En EPUB `pagina` es el
// porcentaje leído; en PDF, el número de página.
export function avisoDePosicion(remoto, local) {
  const esEpub = Boolean(remoto?.cfi);
  return {
    clave: esEpub ? 'remotePositionAskEpub' : 'remotePositionAskPdf',
    remoto: Number(remoto?.pagina) || 0,
    local: Number(local?.pagina) || 0,
    paginas: esEpub ? null : (Number(remoto?.paginas) || Number(local?.paginas) || 0),
  };
}
