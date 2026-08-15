// Lectura agrupada por semanas, meses y años, para poder comparar un periodo
// con el anterior.
//
// De dónde salen los datos no es lo mismo en todos los periodos, y esa es la
// decisión que gobierna este módulo:
//
//   días y semanas → de `dias`, que llega hasta 400 días atrás
//   meses y años   → de `meses`, que no se poda nunca
//
// Los meses podrían sumarse de los días, y para los últimos trece meses daría
// igual; pero en cuanto se mira más atrás los días ya no están y el año saldría
// medio vacío. Usar siempre el contador mensual evita tener dos verdades según
// lo lejos que se mire.
//
// Todo son funciones puras: se les pasa el «ahora» y los mapas ya combinados,
// y no saben nada del registro ni del idioma. Las etiquetas se arman fuera.

export const PERIODOS = ['dia', 'semana', 'mes', 'anno'];

// Cuántos tramos se enseñan de cada tipo. Los días son los 30 de siempre; las
// semanas, un trimestre; los meses, un año entero para que la comparación con
// «el mismo mes del año pasado» tenga con qué; los años, un lustro, que es
// todo lo que cabrá en bastante tiempo.
export const CUANTOS = { dia: 30, semana: 12, mes: 12, anno: 5 };

const dosCifras = (n) => String(n).padStart(2, '0');

export function fechaDeClaveDia(clave) {
  const [anno, mes, dia] = String(clave).split('-').map(Number);
  return new Date(anno, mes - 1, dia);
}

export const claveDeFecha = (fecha) =>
  `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;

// El lunes de la semana de esa fecha. La semana empieza en lunes y no en
// domingo porque es lo que se espera en los idiomas de la aplicación, y porque
// así el fin de semana —donde más se lee— no queda partido en dos barras.
export function lunesDe(fecha) {
  const dia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const desplazamiento = (dia.getDay() + 6) % 7; // domingo (0) es el séptimo día
  dia.setDate(dia.getDate() - desplazamiento);
  return dia;
}

// Cada tramo se identifica por el día en que empieza ('AAAA-MM-DD' para el día
// y la semana, 'AAAA-MM' para el mes, 'AAAA' para el año): así ordenan solos y
// no hace falta el lío de la numeración ISO de semanas, que además cambia de
// año a mitad de diciembre.
export function claveDelPeriodo(periodo, fecha) {
  if (periodo === 'semana') return claveDeFecha(lunesDe(fecha));
  if (periodo === 'mes') return `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}`;
  if (periodo === 'anno') return String(fecha.getFullYear());
  return claveDeFecha(fecha);
}

// El tramo que empieza `atras` tramos antes del que contiene a `fecha`.
export function inicioDelPeriodo(periodo, fecha, atras = 0) {
  const anno = fecha.getFullYear();
  const mes = fecha.getMonth();
  const dia = fecha.getDate();
  if (periodo === 'semana') {
    const lunes = lunesDe(fecha);
    lunes.setDate(lunes.getDate() - atras * 7);
    return lunes;
  }
  if (periodo === 'mes') return new Date(anno, mes - atras, 1);
  if (periodo === 'anno') return new Date(anno - atras, 0, 1);
  return new Date(anno, mes, dia - atras);
}

// Suma de los días de un tramo. Solo para el día y la semana: el mes y el año
// se leen del contador mensual, que llega más atrás.
function sumaDeDias(dias, desde, hasta) {
  let segundos = 0;
  let paginas = 0;
  for (const [clave, valor] of Object.entries(dias)) {
    if (clave < desde || clave > hasta) continue;
    segundos += valor.s;
    paginas += valor.p;
  }
  return { segundos, paginas };
}

function sumaDeMeses(meses, prefijo) {
  let segundos = 0;
  let paginas = 0;
  for (const [clave, valor] of Object.entries(meses)) {
    if (!clave.startsWith(prefijo)) continue;
    segundos += valor.s;
    paginas += valor.p;
  }
  return { segundos, paginas };
}

// Un tramo con lo leído en él. `desde` y `hasta` van también fuera porque son
// los que ponen nombre a la barra («la semana del 27 de julio»).
function tramo(periodo, inicio, { dias, meses }) {
  const clave = claveDelPeriodo(periodo, inicio);
  if (periodo === 'mes' || periodo === 'anno') {
    const { segundos, paginas } = sumaDeMeses(meses, clave);
    const fin = periodo === 'mes'
      ? new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0)
      : new Date(inicio.getFullYear(), 11, 31);
    return { clave, periodo, inicio, fin, segundos, paginas };
  }
  const fin = periodo === 'semana'
    ? new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6)
    : inicio;
  const { segundos, paginas } = sumaDeDias(dias, claveDeFecha(inicio), claveDeFecha(fin));
  return { clave, periodo, inicio, fin, segundos, paginas };
}

// Los últimos `cuantos` tramos, del más antiguo al de ahora. Los tramos sin
// lectura van a cero y no se saltan: el hueco es justamente lo que enseña si
// se lee a diario o a rachas.
export function seriePeriodos(datos, periodo, ahora = Date.now(), cuantos = CUANTOS[periodo]) {
  const hoy = ahora instanceof Date ? ahora : new Date(ahora);
  const fuentes = { dias: datos?.dias ?? {}, meses: datos?.meses ?? {} };
  const puntos = [];
  for (let i = cuantos - 1; i >= 0; i -= 1) {
    puntos.push(tramo(periodo, inicioDelPeriodo(periodo, hoy, i), fuentes));
  }
  return puntos;
}

// El tramo en curso frente al anterior, que es la comparación que se busca al
// mirar estas cifras. La variación se da en porcentaje sobre el anterior;
// cuando el anterior está a cero no hay porcentaje que dar (dividir por cero
// no es «infinito por ciento», es que no había con qué comparar).
function variacionEntre(ahora, antes) {
  const variacion = antes > 0 ? Math.round(((ahora - antes) / antes) * 100) : null;
  let sentido = 'igual';
  if (ahora > antes) sentido = 'mas';
  else if (ahora < antes) sentido = 'menos';
  return { variacion, sentido };
}

// ───────────── Comparar sin que el periodo a medias pierda siempre ─────────────
//
// El tramo en curso nunca está terminado: el martes, «esta semana» son dos días
// y «la semana anterior» son siete. Comparar esas dos cifras daba un «72 %
// menos» que no decía nada de la lectura, solo de qué día era hoy; y hacia
// final de semana el mismo hábito iba pareciendo cada vez mejor. Por eso ahora
// el anterior se recorta a la misma altura: los mismos días transcurridos,
// contados desde su inicio.
//
// Queda un sesgo pequeño, el del día en curso: hoy compite con un día entero
// del tramo anterior. Se asume a propósito, porque la alternativa —comparar
// solo hasta ayer— dejaba sin comparación el primer día de cada tramo y hacía
// que la cifra grande («esta semana») no fuera la lectura real de la semana.
//
// El año va por meses y no por días: los días se podan a los 400, así que del
// año pasado no queda ninguno. Con meses la altura es más basta —solo cuenta
// hasta el último mes cerrado—, pero es la única que se puede sostener con lo
// que hay guardado, y en enero no hay nada que comparar todavía.

// Cuántos días lleva el tramo en curso, contando el de hoy.
export function diasTranscurridos(periodo, fecha) {
  const inicio = inicioDelPeriodo(periodo, fecha);
  const hoy = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  return Math.round((hoy - inicio) / 86400000) + 1;
}

function sumaDeMesesEntre(meses, desde, hasta) {
  let segundos = 0;
  let paginas = 0;
  for (const [clave, valor] of Object.entries(meses)) {
    if (clave < desde || clave > hasta) continue;
    segundos += valor.s;
    paginas += valor.p;
  }
  return { segundos, paginas };
}

// El trozo del año que se puede comparar: de enero al último mes cerrado. En
// enero devuelve null, que es «todavía no hay con qué comparar».
function trozosDelAnno(meses, fecha, atras = 0) {
  const anno = fecha.getFullYear() - atras;
  const ultimoMes = fecha.getMonth(); // 0-11; el mes en curso no cuenta
  if (ultimoMes === 0) return null;
  const hasta = `${anno}-${dosCifras(ultimoMes)}`;
  return { ...sumaDeMesesEntre(meses, `${anno}-01`, hasta), hasta: ultimoMes };
}

// Lo leído en el tramo en curso y lo leído en el anterior a la misma altura.
// `altura` es lo que hace falta para poder decirlo en la pantalla: en qué
// unidad se ha recortado y cuánto.
export function compararALaMismaAltura(datos, periodo, ahora = Date.now()) {
  const hoy = ahora instanceof Date ? ahora : new Date(ahora);
  const dias = datos?.dias ?? {};
  const meses = datos?.meses ?? {};
  const vacio = { actual: null, anterior: null, variacion: null, sentido: 'igual', altura: null };
  if (periodo === 'dia') return vacio;

  if (periodo === 'anno') {
    const actual = trozosDelAnno(meses, hoy);
    const anterior = trozosDelAnno(meses, hoy, 1);
    if (!actual) return vacio;
    return {
      actual, anterior,
      ...variacionEntre(actual.segundos, anterior?.segundos ?? 0),
      altura: { unidad: 'mes', hasta: actual.hasta },
    };
  }

  const transcurridos = diasTranscurridos(periodo, hoy);
  const inicioActual = inicioDelPeriodo(periodo, hoy);
  const inicioAnterior = inicioDelPeriodo(periodo, hoy, 1);
  const finAnterior = new Date(
    inicioAnterior.getFullYear(), inicioAnterior.getMonth(),
    inicioAnterior.getDate() + transcurridos - 1,
  );
  // Un mes más corto que el anterior no puede pasarse de su último día: el 31
  // de marzo no tiene equivalente en febrero, y sin este tope el tramo
  // «anterior» se comería los primeros días del mes en curso.
  const finPeriodoAnterior = periodo === 'mes'
    ? new Date(inicioAnterior.getFullYear(), inicioAnterior.getMonth() + 1, 0)
    : new Date(inicioAnterior.getFullYear(), inicioAnterior.getMonth(), inicioAnterior.getDate() + 6);
  const fin = finAnterior > finPeriodoAnterior ? finPeriodoAnterior : finAnterior;
  const actual = sumaDeDias(dias, claveDeFecha(inicioActual), claveDeFecha(hoy));
  const anterior = sumaDeDias(dias, claveDeFecha(inicioAnterior), claveDeFecha(fin));
  return {
    actual, anterior,
    ...variacionEntre(actual.segundos, anterior.segundos),
    altura: { unidad: 'dia', dias: transcurridos },
  };
}

// Lo que resume la serie entera, para la línea de debajo del gráfico.
export function totalesDePeriodos(serie) {
  return {
    tramosConLectura: serie.filter((punto) => punto.segundos > 0).length,
    segundos: serie.reduce((suma, punto) => suma + punto.segundos, 0),
  };
}

// Hasta dónde llega de verdad lo que se enseña. Los días se podan, así que en
// la vista por días y por semanas las barras más viejas pueden estar vacías no
// porque no se leyera, sino porque ya no se guarda: conviene poder decirlo en
// lugar de dibujar un cero que miente.
export function desdeCuandoHayDatos(datos, periodo) {
  const claves = periodo === 'mes' || periodo === 'anno'
    ? Object.keys(datos?.meses ?? {})
    : Object.keys(datos?.dias ?? {});
  if (!claves.length) return null;
  return claves.sort()[0];
}
