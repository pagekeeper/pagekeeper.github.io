// Volver a encontrar en la página la frase que la voz está leyendo, para
// resaltarla y traerla a la vista.
//
// La voz habla frases sacadas del texto de la página o del capítulo, ya
// normalizadas: los espacios colapsados y los saltos de línea fuera. En el DOM
// ese mismo texto llega partido en nodos y con los saltos del archivo, y en el
// PDF la extracción añade espacios entre tramos que en la capa de texto no
// existen. Así que la frase se busca por sus palabras, admitiendo cualquier
// separación entre ellas (o ninguna), sobre el texto tal cual está en el DOM:
// sus posiciones son las que se pueden convertir en un rango.

const SEPARADORES = '[\\s\\u00ad\\u200b\\u200c]*';

function escaparRegExp(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Posición de una frase dentro de un texto. `desde` es donde acabó la frase
// anterior: la lectura solo avanza, y sin ese punto de partida una frase
// repetida («—Sí —dijo.») volvería siempre a su primera aparición.
export function buscarFrase(texto, frase, desde = 0) {
  const palabras = String(frase ?? '').trim().split(/\s+/).filter(Boolean);
  if (!palabras.length || !texto) return null;
  const patron = new RegExp(palabras.map(escaparRegExp).join(SEPARADORES), 'g');
  patron.lastIndex = Math.max(0, Math.min(desde, texto.length));
  let encontrado = patron.exec(texto);
  // Si no aparece más adelante, puede que la frase anterior se localizara mal;
  // se reintenta desde el principio antes de darla por perdida.
  if (!encontrado && desde > 0) {
    patron.lastIndex = 0;
    encontrado = patron.exec(texto);
  }
  if (!encontrado) return null;
  return { inicio: encontrado.index, fin: encontrado.index + encontrado[0].length };
}

// Recorre los nodos de texto de un elemento y devuelve su texto concatenado
// junto con la posición de cada nodo, que es lo que permite volver de una
// posición del texto a un punto del documento.
export function indexarTexto(raiz) {
  const doc = raiz?.ownerDocument ?? raiz;
  if (!doc?.createTreeWalker || !raiz) return { texto: '', piezas: [] };
  const recorrido = doc.createTreeWalker(raiz, 4 /* NodeFilter.SHOW_TEXT */, {
    acceptNode: (nodo) => (
      // Lo que no se lee tampoco se resalta.
      nodo.parentElement?.closest('script, style, template, noscript') ? 2 : 1
    ),
  });
  const piezas = [];
  let texto = '';
  for (let nodo = recorrido.nextNode(); nodo; nodo = recorrido.nextNode()) {
    const valor = nodo.nodeValue ?? '';
    if (!valor) continue;
    piezas.push({ nodo, inicio: texto.length, fin: texto.length + valor.length });
    texto += valor;
  }
  return { texto, piezas };
}

// El nodo y el desplazamiento a los que corresponde una posición del texto
// indexado. `final` distingue el cierre de un tramo, que sí puede caer justo en
// el borde de un nodo.
function puntoDe(piezas, posicion, final = false) {
  for (const pieza of piezas) {
    if (final ? posicion <= pieza.fin : posicion < pieza.fin) {
      return { nodo: pieza.nodo, desplazamiento: Math.max(0, posicion - pieza.inicio) };
    }
  }
  const ultima = piezas.at(-1);
  return ultima ? { nodo: ultima.nodo, desplazamiento: ultima.fin - ultima.inicio } : null;
}

// Convierte un tramo del texto indexado en un rango del documento.
export function rangoDe(indice, inicio, fin) {
  const desde = puntoDe(indice.piezas, inicio);
  const hasta = puntoDe(indice.piezas, fin, true);
  if (!desde || !hasta) return null;
  const doc = desde.nodo.ownerDocument;
  const rango = doc.createRange();
  rango.setStart(desde.nodo, desde.desplazamiento);
  rango.setEnd(hasta.nodo, hasta.desplazamiento);
  return rango;
}

// Localiza una frase en un elemento y devuelve su rango y el punto donde
// acaba, que es el que sigue la lectura.
export function rangoDeFrase(raiz, frase, desde = 0) {
  const indice = indexarTexto(raiz);
  const tramo = buscarFrase(indice.texto, frase, desde);
  if (!tramo) return null;
  const rango = rangoDe(indice, tramo.inicio, tramo.fin);
  return rango ? { rango, fin: tramo.fin } : null;
}

// Dónde empieza cada frase del texto. El corte es el mismo que usa la voz
// para trocear (trocearTexto), así que las posiciones que salen de aquí
// coinciden con el principio de una locución.
export function iniciosDeFrase(texto) {
  const inicios = [0];
  const patron = /[.!?…]["»”')\]]*\s+/g;
  for (let corte = patron.exec(texto); corte; corte = patron.exec(texto)) {
    const posicion = corte.index + corte[0].length;
    if (posicion < texto.length) inicios.push(posicion);
  }
  return inicios;
}

// Texto de un elemento a partir de la primera frase que empieza dentro de lo
// que se ve. `borde` es el borde superior del área visible, medido en las
// mismas coordenadas que devuelven los rectángulos de la raíz (dentro de un
// EPUB, las del propio capítulo). Devuelve '' si no queda ninguna frase por
// debajo del borde: entonces lo visible pertenece ya a la página siguiente.
//
// La lectura empieza así donde mira quien lee, en vez de por la frase cortada
// por arriba que la posición guardada señala en el modo continuo.
export function textoDesdeLaVista(raiz, borde, tolerancia = 4) {
  const indice = indexarTexto(raiz);
  if (!indice.texto.trim()) return '';
  const inicios = iniciosDeFrase(indice.texto);
  // Las frases van hacia abajo, así que basta con una búsqueda binaria: la
  // primera cuyo principio cae ya en el área visible.
  const seVe = (posicion) => {
    const rango = rangoDe(indice, posicion, Math.min(posicion + 1, indice.texto.length));
    const caja = rango?.getBoundingClientRect?.();
    if (!caja || (!caja.height && !caja.width)) return false;
    return caja.top >= borde - tolerancia;
  };
  let bajo = 0;
  let alto = inicios.length;
  while (bajo < alto) {
    const medio = (bajo + alto) >> 1;
    if (seVe(inicios[medio])) alto = medio;
    else bajo = medio + 1;
  }
  return bajo < inicios.length ? indice.texto.slice(inicios[bajo]) : '';
}
