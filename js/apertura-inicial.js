// Qué libro se abre solo al arrancar PageKeeper.
//
// Quien lee un único libro a la vez no quiere pasar por la biblioteca cada vez
// que abre la aplicación, así que puede pedir que se le lleve directamente a su
// última lectura.
//
// El candidato es el mismo que la ficha destacada de «Continuar leyendo»: la
// lectura más reciente que ni se ha terminado ni se ha quitado de ese recuadro.
// El criterio se comparte a propósito —si el usuario apartó un libro de ahí,
// tampoco quiere que se le abra solo— y por eso la decisión vive aparte: es la
// única parte de esto que no necesita mirar la pantalla.

export function libroQueSeAbreAlArrancar({
  activado,
  recientes = [],
  ocultos = new Set(),
  estaTerminada = () => false,
} = {}) {
  if (!activado) return null;
  return recientes.find((reciente) => (
    !ocultos.has(reciente.id) && !estaTerminada(reciente.progreso)
  )) ?? null;
}
