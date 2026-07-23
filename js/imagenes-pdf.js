// Decide qué imágenes de una página de PDF son ilustraciones y cuáles son la
// página misma. Este módulo no toca el navegador para poder probarse aparte.
//
// Hace falta porque el modo noche invierte la página entera con un filtro: un
// PDF ya viene dibujado y no se puede oscurecer el papel sin oscurecer también
// la tinta. Esa inversión deja las fotos y los logotipos en negativo, y
// devolverles su color exige saber cuáles lo son.

// Composición de dos matrices afines, en el orden que usa PDF.js.
export function componerMatriz(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

// Proporción de la página que puede ocupar una imagen sin dejar de contar como
// ilustración. Un documento escaneado es un bitmap del papel a toda plana, y a
// veces trae encima una capa de texto de OCR: que el PDF tenga texto
// seleccionable no basta para reconocerlo, hay que mirar cuánto ocupa.
const MAXIMO_POR_IMAGEN = 0.7;
// Y si entre todas cubren casi la página, es un escaneo troceado en bandas,
// que una por una engañarían al límite anterior.
const MAXIMO_ENTRE_TODAS = 0.85;

export function soloIlustraciones(regiones, ancho, alto) {
  const areaPagina = ancho * alto;
  if (!areaPagina || !Array.isArray(regiones)) return [];
  const area = (region) => Math.max(0, region.ancho) * Math.max(0, region.alto);
  const ilustraciones = regiones.filter(
    (region) => area(region) < areaPagina * MAXIMO_POR_IMAGEN,
  );
  const ocupado = ilustraciones.reduce((suma, region) => suma + area(region), 0);
  return ocupado >= areaPagina * MAXIMO_ENTRE_TODAS ? [] : ilustraciones;
}
