// Estadísticas de lectura, sumadas entre todos los dispositivos.
//
// Se apunta el tiempo realmente leído, no el que la aplicación ha estado
// abierta: las muestras llegan del mismo sitio que alimenta el ritmo (cambiar
// de página con el libro delante), así que ni el rato con la aplicación fuera
// de la vista ni los saltos de posición cuentan.
//
// Todo vive en el registro de progreso, que ya sabe sincronizarse, y siempre
// desglosado por dispositivo:
//
//   libros['Novelas/libro.pdf'].tiempos = { <idDispositivo>: { s, p } }
//   estadisticas = { <idDispositivo>: { dias: { 'AAAA-MM-DD': { s, p } } } }
//
// El desglose es lo que hace que fusionar sea trivial y no haga falta ninguna
// marca temporal: cada aparato solo escribe su casilla, nadie pisa la de otro
// y lo que se enseña es la suma. Sumar directamente un único contador
// compartido sería imposible de reconciliar: dos dispositivos leyendo a la vez
// se borrarían el rato el uno al otro.
//
// Los libros del propio dispositivo («local:…») guardan su tiempo igual, en su
// entrada, y como esas entradas no se suben nunca, se quedan donde están.

// El día es el local del lector, no UTC: leer a la una de la madrugada
// pertenece a la noche anterior tal como la vive quien lee, y una racha se
// rompería sola al cruzar el meridiano en según qué husos.
export function claveDia(fecha) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Un día es la unidad de las rachas, así que se cuentan días de calendario y
// no tramos de 24 horas: dos lecturas separadas por una noche corta siguen
// siendo dos días seguidos.
function diaAnterior(clave, atras = 1) {
  const [anno, mes, dia] = clave.split('-').map(Number);
  return claveDia(new Date(anno, mes - 1, dia - atras));
}

export const DIAS_GUARDADOS = 400; // algo más de un año, para comparar cursos
// Una muestra más larga que esto no es lectura seguida sino una pestaña
// olvidada. El emisor ya acota mucho antes (segundosDeLaMuestra), pero el
// almacén no se fía de quien le escribe: una sola muestra falsa desviaría el
// total del año.
const SEGUNDOS_MAXIMOS = 3600;

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Los segundos se guardan redondeados: viajan en el archivo compartido, y un
// «19.641000000000002» por muestra lo engorda sin decir nada más.
function par(entrada) {
  return { s: Math.round(numero(entrada?.s)), p: Math.round(numero(entrada?.p)) };
}

function suma(uno, otro) {
  return { s: (uno?.s ?? 0) + (otro?.s ?? 0), p: (uno?.p ?? 0) + (otro?.p ?? 0) };
}

// ───────────── Tiempo de un libro ─────────────

export function normalizarTiempos(tiempos) {
  const limpios = {};
  if (!tiempos || typeof tiempos !== 'object') return limpios;
  for (const [dispositivo, entrada] of Object.entries(tiempos)) {
    const valor = par(entrada);
    if (valor.s > 0) limpios[dispositivo] = valor;
  }
  return limpios;
}

export function apuntarTiempo(tiempos, dispositivo, { segundos, paginas = 0 } = {}) {
  const nuevos = normalizarTiempos(tiempos);
  const s = Number(segundos);
  if (!dispositivo || !Number.isFinite(s) || s <= 0 || s > SEGUNDOS_MAXIMOS) return nuevos;
  const anterior = nuevos[dispositivo] ?? { s: 0, p: 0 };
  nuevos[dispositivo] = par({ s: anterior.s + s, p: anterior.p + numero(paginas) });
  return nuevos;
}

// Cada casilla solo crece, así que gana la mayor sin mirar el reloj: es lo que
// permite fusionar sin fechas y sobrevivir a un dispositivo con la hora mal.
export function fusionarTiempos(local, remoto) {
  const mios = normalizarTiempos(local);
  const suyos = normalizarTiempos(remoto);
  const fusionados = {};
  for (const dispositivo of new Set([...Object.keys(mios), ...Object.keys(suyos)])) {
    const mio = mios[dispositivo];
    const suyo = suyos[dispositivo];
    if (!mio || !suyo) fusionados[dispositivo] = mio ?? suyo;
    else fusionados[dispositivo] = mio.s >= suyo.s ? mio : suyo;
  }
  return fusionados;
}

export function totalTiempo(tiempos) {
  return Object.values(normalizarTiempos(tiempos))
    .reduce((total, entrada) => suma(total, entrada), { s: 0, p: 0 });
}

// ───────────── Días de lectura ─────────────

export function normalizarEstadisticas(estadisticas) {
  const limpias = {};
  if (!estadisticas || typeof estadisticas !== 'object') return limpias;
  for (const [dispositivo, entrada] of Object.entries(estadisticas)) {
    const dias = {};
    for (const [dia, valor] of Object.entries(entrada?.dias ?? {})) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) continue;
      const limpio = par(valor);
      if (limpio.s > 0) dias[dia] = limpio;
    }
    if (Object.keys(dias).length) limpias[dispositivo] = { dias };
  }
  return limpias;
}

// Sin esto el registro crecería sin fin en un archivo que se sube entero cada
// vez que se pasa de página.
function podarDias(dias, hoy) {
  const limite = diaAnterior(hoy, DIAS_GUARDADOS);
  for (const dia of Object.keys(dias)) {
    if (dia < limite) delete dias[dia];
  }
  return dias;
}

export function apuntarDia(estadisticas, dispositivo, {
  segundos, paginas = 0, ahora = Date.now(),
} = {}) {
  const nuevas = normalizarEstadisticas(estadisticas);
  const s = Number(segundos);
  if (!dispositivo || !Number.isFinite(s) || s <= 0 || s > SEGUNDOS_MAXIMOS) return nuevas;
  const dia = claveDia(ahora);
  const dias = nuevas[dispositivo]?.dias ?? {};
  const anterior = dias[dia] ?? { s: 0, p: 0 };
  dias[dia] = par({ s: anterior.s + s, p: anterior.p + numero(paginas) });
  nuevas[dispositivo] = { dias: podarDias(dias, dia) };
  return nuevas;
}

// Como con los tiempos: dentro de un mismo día y dispositivo el contador solo
// crece, así que la cifra mayor es la buena.
export function fusionarEstadisticas(local, remoto) {
  const mias = normalizarEstadisticas(local);
  const suyas = normalizarEstadisticas(remoto);
  const fusionadas = {};
  for (const dispositivo of new Set([...Object.keys(mias), ...Object.keys(suyas)])) {
    const mios = mias[dispositivo]?.dias ?? {};
    const suyos = suyas[dispositivo]?.dias ?? {};
    const dias = {};
    for (const dia of new Set([...Object.keys(mios), ...Object.keys(suyos)])) {
      const mio = mios[dia];
      const suyo = suyos[dia];
      if (!mio || !suyo) dias[dia] = mio ?? suyo;
      else dias[dia] = mio.s >= suyo.s ? mio : suyo;
    }
    if (Object.keys(dias).length) fusionadas[dispositivo] = { dias };
  }
  return fusionadas;
}

// Los días de todos los dispositivos, sumados. Leer media hora en el móvil y
// otra media en el ordenador el mismo día es una hora de ese día, y un solo
// día para la racha.
export function diasCombinados(estadisticas) {
  const combinados = {};
  for (const { dias } of Object.values(normalizarEstadisticas(estadisticas))) {
    for (const [dia, valor] of Object.entries(dias)) {
      combinados[dia] = suma(combinados[dia], valor);
    }
  }
  return combinados;
}

// Días seguidos leyendo que terminan hoy. Si hoy todavía no se ha leído, la
// racha se cuenta hasta ayer y sigue viva: darla por rota a las 00:01 sería
// castigar a quien aún no ha abierto el libro.
export function racha(dias, hoy) {
  let cuenta = 0;
  let dia = dias[hoy] ? hoy : diaAnterior(hoy);
  while (dias[dia]) {
    cuenta += 1;
    dia = diaAnterior(dia);
  }
  return cuenta;
}

export function rachaMaxima(dias) {
  let mejor = 0;
  let actual = 0;
  let previo = null;
  for (const dia of Object.keys(dias).sort()) {
    actual = previo && diaAnterior(dia) === previo ? actual + 1 : 1;
    if (actual > mejor) mejor = actual;
    previo = dia;
  }
  return mejor;
}

function sumaDesde(dias, hoy, cuantos) {
  const limite = diaAnterior(hoy, cuantos - 1);
  let segundos = 0;
  let paginas = 0;
  for (const [dia, entrada] of Object.entries(dias)) {
    if (dia < limite || dia > hoy) continue;
    segundos += entrada.s;
    paginas += entrada.p;
  }
  return { segundos, paginas };
}

// Serie continua de los últimos `cuantos` días (los días sin lectura van a
// cero): el gráfico necesita los huecos para que se vean, y sin ellos las
// barras mentirían sobre la constancia.
export function serie(dias, hoy, cuantos = 30) {
  const puntos = [];
  for (let i = cuantos - 1; i >= 0; i -= 1) {
    const dia = diaAnterior(hoy, i);
    puntos.push({ dia, segundos: dias[dia]?.s ?? 0, paginas: dias[dia]?.p ?? 0 });
  }
  return puntos;
}

// Los libros de la nube se identifican por su ruta, que acaba en la extensión,
// pero los del dispositivo van como 'local:<nombre>:<tamaño>': mirar el id
// entero los daba a todos por PDF, y con eso la ficha de un EPUB del
// dispositivo enseñaba un ritmo en minutos por página que allí no existe.
function formatoDe(id) {
  const texto = String(id);
  const nombre = texto.startsWith('local:') ? texto.split(':').slice(1, -1).join(':') : texto;
  return /\.epub$/i.test(nombre) ? 'epub' : 'pdf';
}

// Libros con tiempo apuntado, del más leído al que menos, con el desglose por
// dispositivo: es lo que responde a «¿cuánto he tardado en leer esto?» cuando
// se ha leído a ratos en el móvil y a ratos en el ordenador.
export function librosLeidos(libros) {
  const lista = [];
  for (const [id, entrada] of Object.entries(libros ?? {})) {
    const tiempos = normalizarTiempos(entrada?.tiempos);
    const total = totalTiempo(tiempos);
    if (total.s <= 0) continue;
    lista.push({
      id,
      titulo: typeof entrada?.titulo === 'string' && entrada.titulo.trim() ? entrada.titulo.trim() : '',
      formato: formatoDe(id),
      enLaNube: !String(id).startsWith('local:'),
      segundos: total.s,
      paginas: total.p,
      porDispositivo: Object.entries(tiempos)
        .map(([dispositivo, valor]) => ({ dispositivo, segundos: valor.s, paginas: valor.p }))
        .sort((uno, otro) => otro.segundos - uno.segundos),
    });
  }
  return lista.sort((uno, otro) => otro.segundos - uno.segundos);
}

// Lo que se sabe de un libro suelto, para su ficha. Devuelve siempre algo
// (con el tiempo a cero si no se ha leído), porque la ficha se abre desde el
// propio libro y allí siempre hay algo que enseñar.
export function estadisticasDeLibro(datos, id) {
  const entrada = datos?.libros?.[id];
  const tiempos = normalizarTiempos(entrada?.tiempos);
  const total = totalTiempo(tiempos);
  const porDispositivo = Object.entries(tiempos)
    .map(([dispositivo, valor]) => ({ dispositivo, segundos: valor.s, paginas: valor.p }))
    .sort((uno, otro) => otro.segundos - uno.segundos);
  const paginas = Number(entrada?.paginas);
  const pagina = Number(entrada?.pagina);
  return {
    id,
    hay: total.s > 0,
    segundos: total.s,
    paginas: total.p,
    porDispositivo,
    formato: formatoDe(id),
    // Minutos por página, solo en PDF y con páginas de verdad contadas: en
    // EPUB no hay páginas fijas que promediar.
    ritmo: formatoDe(id) === 'pdf' && total.p > 0 ? total.s / total.p : null,
    // Cuánto se lleva leído, para acompañar al tiempo con el avance.
    porcentaje: Number.isFinite(paginas) && paginas > 0 && Number.isFinite(pagina)
      ? Math.min(100, Math.max(0, Math.round((pagina / paginas) * 100)))
      : null,
    terminado: entrada?.terminado === true,
  };
}

// `datos` es el registro de progreso entero: de ahí salen tanto los días
// (raíz) como el tiempo de cada libro (dentro de su entrada).
export function resumen(datos, ahora = Date.now(), diasSerie = 30) {
  const dias = diasCombinados(datos?.estadisticas);
  const hoy = claveDia(ahora);
  const claves = Object.keys(dias);
  const totalSegundos = claves.reduce((total, dia) => total + dias[dia].s, 0);
  const totalPaginas = claves.reduce((total, dia) => total + dias[dia].p, 0);
  const mejorDia = claves.reduce(
    (mejor, dia) => (dias[dia].s > (mejor?.segundos ?? 0) ? { dia, segundos: dias[dia].s } : mejor),
    null,
  );
  const libros = librosLeidos(datos?.libros);

  return {
    hay: claves.length > 0 || libros.length > 0,
    totalSegundos,
    totalPaginas,
    diasActivos: claves.length,
    // La media se reparte entre los días leídos, no entre los del calendario:
    // dice cuánto dura una sesión típica, que es lo que se reconoce.
    mediaDiaria: claves.length ? Math.round(totalSegundos / claves.length) : 0,
    hoy: dias[hoy]?.s ?? 0,
    semana: sumaDesde(dias, hoy, 7),
    mes: sumaDesde(dias, hoy, 30),
    racha: racha(dias, hoy),
    rachaMaxima: rachaMaxima(dias),
    mejorDia,
    libros,
    // Cuántos aparatos han aportado algo: con más de uno tiene sentido enseñar
    // el desglose, y con uno solo sobra.
    dispositivos: new Set([
      ...Object.keys(normalizarEstadisticas(datos?.estadisticas)),
      ...libros.flatMap((libro) => libro.porDispositivo.map((parte) => parte.dispositivo)),
    ]).size,
    serie: serie(dias, hoy, diasSerie),
  };
}
