// Averiguar en qué idioma está escrito un texto.
//
// Es lo que hace falta para partir palabras: sin un `lang` que el navegador
// reconozca no hay diccionario y no parte nada. Muchos EPUB no lo declaran, y
// otros —los convertidos a la ligera— declaran cosas como «UND», que es peor,
// porque parece un idioma y no lo es. Cuando el libro no lo dice o dice algo
// que no sirve, se mira el texto.
//
// El método es el más simple que distingue lo que hay que distinguir: contar
// palabras corrientes propias de cada idioma. No pretende acertar con
// cualquier lengua del mundo, solo con las de la interfaz, y prefiere callarse
// (devolver null) antes que arriesgar: un idioma equivocado parte las palabras
// por donde no toca, que se ve peor que no partirlas.

// Etiquetas que ocupan el sitio de un idioma sin serlo: «indeterminado»,
// «varios», «sin contenido lingüístico».
const NO_SON_IDIOMAS = new Set(['und', 'mul', 'zxx', 'unknown', 'none']);

// Palabras frecuentes que separan unos idiomas de otros. Las comunes a varios
// (de, la, que, no…) no están: no aportan nada y solo desempatarían mal. Pesan
// más las que casi solo existen en un idioma.
const MARCADORES = {
  es: ['el', 'los', 'las', 'con', 'pero', 'como', 'muy', 'porque', 'cuando', 'esto', 'esta', 'sus', 'había', 'ella', 'desde', 'hacia', 'también', 'aquí', 'sólo', 'solo', 'mismo', 'usted'],
  ca: ['amb', 'què', 'això', 'aquest', 'aquesta', 'els', 'les', 'però', 'molt', 'també', 'perquè', 'seva', 'són', 'tot', 'fins', 'hi', 'ja', 'dels', 'nosaltres', 'vostè'],
  gl: ['unha', 'moito', 'moi', 'tamén', 'coa', 'polo', 'seus', 'aínda', 'onde', 'porén', 'iso', 'ela', 'dende', 'ren', 'algunha', 'facer'],
  pt: ['não', 'uma', 'com', 'mas', 'muito', 'também', 'quando', 'você', 'então', 'isso', 'ela', 'seu', 'até', 'já', 'depois', 'sobre'],
  en: ['the', 'and', 'was', 'with', 'that', 'this', 'they', 'their', 'have', 'from', 'were', 'been', 'would', 'about', 'there', 'which'],
  fr: ['les', 'des', 'une', 'dans', 'pour', 'mais', 'avec', 'était', 'qui', 'plus', 'sur', 'elle', 'nous', 'vous', 'tout', 'même'],
  de: ['der', 'die', 'das', 'und', 'nicht', 'ein', 'eine', 'mit', 'sich', 'auch', 'war', 'den', 'dem', 'für', 'ist', 'aber', 'noch', 'wie'],
  eu: ['eta', 'dira', 'zen', 'bat', 'baina', 'hori', 'dute', 'ere', 'egin', 'izan', 'bere', 'zuen', 'dela', 'baten', 'gehiago', 'orain'],
};

const INDICE = new Map();
for (const [idioma, palabras] of Object.entries(MARCADORES)) {
  for (const palabra of palabras) {
    if (!INDICE.has(palabra)) INDICE.set(palabra, []);
    INDICE.get(palabra).push(idioma);
  }
}

// Palabras que hay que ver antes de creerse el resultado, y ventaja mínima
// sobre el segundo. Con menos, una sola frase copiada de otra lengua —una cita,
// un título— podría decidir por el libro entero.
const MINIMO_ACIERTOS = 8;
const VENTAJA = 1.3;

// ¿Sirve esta etiqueta para pedirle al navegador que parta palabras? Vale
// cualquier código de idioma con su forma (es, ca-ES, pt-BR); no valen ni las
// etiquetas de relleno ni lo que no tenga pinta de idioma.
export function idiomaUtil(etiqueta) {
  if (typeof etiqueta !== 'string') return false;
  const limpia = etiqueta.trim().toLowerCase();
  if (!limpia || NO_SON_IDIOMAS.has(limpia.split('-')[0])) return false;
  return /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(limpia);
}

// Devuelve el idioma del texto, o null si la muestra es corta o dudosa.
export function detectarIdioma(texto) {
  if (typeof texto !== 'string') return null;
  const palabras = texto
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (palabras.length < 20) return null;

  const puntos = new Map();
  for (const palabra of palabras) {
    const idiomas = INDICE.get(palabra);
    if (!idiomas) continue;
    // Una palabra que comparten dos idiomas reparte su voto entre ellos.
    const parte = 1 / idiomas.length;
    for (const idioma of idiomas) puntos.set(idioma, (puntos.get(idioma) ?? 0) + parte);
  }

  const orden = [...puntos.entries()].sort((a, b) => b[1] - a[1]);
  if (!orden.length) return null;
  const [ganador, mejor] = orden[0];
  const segundo = orden[1]?.[1] ?? 0;
  if (mejor < MINIMO_ACIERTOS || mejor < segundo * VENTAJA) return null;
  return ganador;
}
