// Recorte de los márgenes en blanco de un PDF.
//
// La página se dibuja muy pequeña sobre fondo blanco y se busca el rectángulo
// que contiene todo lo que no es fondo. Funciona igual con texto que con
// escaneados, porque mira píxeles y no la capa de texto.
//
// Todas las medidas son fracciones (0–1) de la página ya girada, para que no
// dependan del tamaño al que se dibuje.

// Distancia al blanco a partir de la cual un píxel cuenta como contenido. Deja
// pasar el gris muy claro del papel escaneado y las manchas de compresión.
const UMBRAL = 26;
// Aire que se deja alrededor de lo detectado, para no rozar las letras.
const AIRE = 0.012;
// Nunca se recorta por debajo de esto: un recorte extremo suele ser un error
// de detección (una página casi vacía, un sello suelto…).
const MINIMO = 0.25;

// Rectángulo que ocupa el contenido de una imagen RGBA dibujada sobre blanco.
// Devuelve null si la página está en blanco.
export function cajaDeContenido(pixeles, ancho, alto, umbral = UMBRAL) {
  let izquierda = ancho, derecha = -1, arriba = alto, abajo = -1;
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const i = (y * ancho + x) * 4;
      // Sobre fondo blanco opaco basta con mirar cuánto se aleja del blanco.
      const distancia = Math.max(
        255 - pixeles[i], 255 - pixeles[i + 1], 255 - pixeles[i + 2],
      );
      if (distancia < umbral) continue;
      if (x < izquierda) izquierda = x;
      if (x > derecha) derecha = x;
      if (y < arriba) arriba = y;
      if (y > abajo) abajo = y;
    }
  }
  if (derecha < 0) return null;
  return {
    x: izquierda / ancho,
    y: arriba / alto,
    ancho: (derecha + 1 - izquierda) / ancho,
    alto: (abajo + 1 - arriba) / alto,
  };
}

// Caja típica de un documento: por cada lado se descarta una parte de las
// páginas más extremas antes de quedarse con la más exigente. Sin ese descarte
// bastaría una portada a sangre o una lámina a toda página para dejar el libro
// entero sin recortar. Lo descartado no se pierde: al pintar cada página, su
// caja se une con esta, de modo que nunca se corta nada.
export function cajaRepresentativa(cajas, descarte = 0.25) {
  const validas = cajas.filter(Boolean);
  if (!validas.length) return null;
  const posicion = Math.floor(descarte * (validas.length - 1));
  const extremo = (valores, orden) => [...valores].sort(orden)[posicion];
  const x = extremo(validas.map((caja) => caja.x), (a, b) => b - a);
  const y = extremo(validas.map((caja) => caja.y), (a, b) => b - a);
  const derecha = extremo(validas.map((caja) => caja.x + caja.ancho), (a, b) => a - b);
  const abajo = extremo(validas.map((caja) => caja.y + caja.alto), (a, b) => a - b);
  if (derecha <= x || abajo <= y) return null;
  return { x, y, ancho: derecha - x, alto: abajo - y };
}

// Rectángulo que contiene a todos los de la lista (las páginas de un libro no
// tienen los mismos márgenes: números de página, cabeceras, láminas…).
export function unir(cajas) {
  const validas = cajas.filter(Boolean);
  if (!validas.length) return null;
  const x = Math.min(...validas.map((caja) => caja.x));
  const y = Math.min(...validas.map((caja) => caja.y));
  const derecha = Math.max(...validas.map((caja) => caja.x + caja.ancho));
  const abajo = Math.max(...validas.map((caja) => caja.y + caja.alto));
  return { x, y, ancho: derecha - x, alto: abajo - y };
}

// Deja aire alrededor de la caja sin salirse de la página.
export function conAire(caja, aire = AIRE) {
  if (!caja) return null;
  const x = Math.max(0, caja.x - aire);
  const y = Math.max(0, caja.y - aire);
  return {
    x,
    y,
    ancho: Math.min(1 - x, caja.ancho + 2 * aire),
    alto: Math.min(1 - y, caja.alto + 2 * aire),
  };
}

// Deja el recorte listo para usar: le añade aire, lo mantiene dentro de la
// página y descarta los que no valen la pena o son sospechosamente pequeños.
export function ajustarRecorte(caja, aire = AIRE) {
  const recorte = conAire(caja, aire);
  if (!recorte) return null;
  if (recorte.ancho < MINIMO || recorte.alto < MINIMO) return null;
  // Ganar menos de un 2 % no compensa remontar la página.
  if (recorte.ancho > 0.98 && recorte.alto > 0.98) return null;
  return recorte;
}

// Páginas que se examinan, repartidas por todo el documento. Las primeras
// (cubierta, portadilla) suelen tener márgenes distintos del resto, pero
// tampoco conviene saltárselas: también hay que poder verlas enteras.
export function paginasAMuestrear(total, maximo = 12) {
  if (total <= maximo) return Array.from({ length: total }, (unused, i) => i + 1);
  const paso = (total - 1) / (maximo - 1);
  const paginas = new Set();
  for (let i = 0; i < maximo; i++) paginas.add(Math.round(1 + i * paso));
  return [...paginas].sort((a, b) => a - b);
}
