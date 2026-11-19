// Margen lateral de los EPUB que trae cada dispositivo de fábrica.
//
// En un móvil la columna ya es estrecha: un 10 % por lado se come una quinta
// parte de una pantalla que no sobra y deja renglones de pocas palabras, así
// que allí el texto llega de borde a borde. En tabletas y ordenadores se
// mantiene el 10 %, que es lo que había.

export const MARGEN_MAXIMO = 30;
export const MARGEN_ESCRITORIO = 10;
export const MARGEN_MOVIL = 0;

// Por debajo de este lado corto (en píxeles CSS) se considera un móvil. Es el
// mismo corte que usa Android para separar teléfonos de tabletas (600 dp). Se
// mira el lado corto de la pantalla y no el ancho de la ventana para que el
// valor no cambie al girar el móvil ni al estrechar una ventana en el
// ordenador.
export const LADO_CORTO_MOVIL = 600;

export function esPantallaDeMovil({ ancho, alto } = {}) {
  const lados = [ancho, alto].filter((lado) => Number.isFinite(lado) && lado > 0);
  if (!lados.length) return false;
  return Math.min(...lados) < LADO_CORTO_MOVIL;
}

export function margenInicial(pantalla) {
  return esPantallaDeMovil(pantalla) ? MARGEN_MOVIL : MARGEN_ESCRITORIO;
}
