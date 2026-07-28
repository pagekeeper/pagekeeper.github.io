// Estadísticas de lectura, medidas y guardadas solo en este dispositivo.
//
// Se apunta el tiempo realmente leído, no el que la aplicación ha estado
// abierta: las muestras llegan del mismo sitio que alimenta el ritmo (cambiar
// de página con el libro delante), así que las pausas largas y los saltos de
// posición no cuentan. De cada muestra se guardan dos cosas: el día en que
// ocurrió, para las rachas y el gráfico, y el libro, para saber en qué se va
// el tiempo. Nada de esto viaja a la nube.

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
  const d = new Date(anno, mes - 1, dia - atras);
  return claveDia(d);
}

export const DIAS_GUARDADOS = 400;   // algo más de un año, para comparar cursos
export const LIBROS_GUARDADOS = 200;
// Una muestra más larga que esto no es lectura seguida sino una pestaña
// olvidada. El emisor ya las descarta (muestraValida), pero el almacén no se
// fía de quien le escribe: una sola muestra falsa desviaría el total del año.
const SEGUNDOS_MAXIMOS = 3600;

export function vacio() {
  return { v: 1, dias: {}, libros: {} };
}

// Acepta lo que haya en localStorage, incluso escrito por una versión
// anterior o a medio corromper, y devuelve siempre una estructura utilizable.
export function normalizar(datos) {
  const base = vacio();
  if (!datos || typeof datos !== 'object') return base;
  if (datos.dias && typeof datos.dias === 'object') {
    for (const [dia, entrada] of Object.entries(datos.dias)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) continue;
      const s = Number(entrada?.s) || 0;
      if (s <= 0) continue;
      base.dias[dia] = { s, p: Number(entrada?.p) || 0 };
    }
  }
  if (datos.libros && typeof datos.libros === 'object') {
    for (const [id, entrada] of Object.entries(datos.libros)) {
      const s = Number(entrada?.s) || 0;
      if (s <= 0) continue;
      base.libros[id] = {
        s,
        p: Number(entrada?.p) || 0,
        t: Number(entrada?.t) || 0,
        n: typeof entrada?.n === 'string' ? entrada.n : '',
        f: entrada?.f === 'epub' ? 'epub' : 'pdf',
      };
    }
  }
  return base;
}

// Poda: se conservan los días recientes y los libros leídos más recientemente.
// Sin esto, el registro crecería sin fin en un almacén (localStorage) que se
// lee y se escribe entero en cada página pasada.
function podar(datos, hoy) {
  const limite = diaAnterior(hoy, DIAS_GUARDADOS);
  for (const dia of Object.keys(datos.dias)) {
    if (dia < limite) delete datos.dias[dia];
  }
  const ids = Object.keys(datos.libros);
  if (ids.length > LIBROS_GUARDADOS) {
    ids.sort((a, b) => (datos.libros[a].t ?? 0) - (datos.libros[b].t ?? 0));
    for (const id of ids.slice(0, ids.length - LIBROS_GUARDADOS)) delete datos.libros[id];
  }
  return datos;
}

// Suma una muestra de lectura. `paginas` solo tiene sentido en PDF: en EPUB no
// hay páginas fijas que contar, así que allí se queda en cero y el tiempo es
// la única medida comparable entre los dos formatos.
export function apuntar(datos, {
  segundos, paginas = 0, libro = null, titulo = '', formato = 'pdf', ahora = Date.now(),
} = {}) {
  const nuevos = normalizar(datos);
  const s = Number(segundos);
  if (!Number.isFinite(s) || s <= 0 || s > SEGUNDOS_MAXIMOS) return nuevos;
  const p = Number.isFinite(Number(paginas)) ? Math.max(0, Number(paginas)) : 0;

  const dia = claveDia(ahora);
  const anterior = nuevos.dias[dia] ?? { s: 0, p: 0 };
  nuevos.dias[dia] = { s: anterior.s + s, p: anterior.p + p };

  if (libro) {
    const previo = nuevos.libros[libro] ?? { s: 0, p: 0, t: 0, n: '', f: 'pdf' };
    nuevos.libros[libro] = {
      s: previo.s + s,
      p: previo.p + p,
      t: ahora,
      // El título puede cambiar (renombrar un libro): manda el último visto,
      // pero uno vacío no borra el que ya había.
      n: titulo || previo.n,
      f: formato === 'epub' ? 'epub' : 'pdf',
    };
  }
  return podar(nuevos, dia);
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
  const claves = Object.keys(dias).sort();
  let mejor = 0;
  let actual = 0;
  let previo = null;
  for (const dia of claves) {
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

export function resumen(datos, ahora = Date.now(), diasSerie = 30) {
  const { dias, libros } = normalizar(datos);
  const hoy = claveDia(ahora);
  const claves = Object.keys(dias);
  const totalSegundos = claves.reduce((suma, dia) => suma + dias[dia].s, 0);
  const totalPaginas = claves.reduce((suma, dia) => suma + dias[dia].p, 0);
  const mejorDia = claves.reduce(
    (mejor, dia) => (dias[dia].s > (mejor?.segundos ?? 0) ? { dia, segundos: dias[dia].s } : mejor),
    null,
  );
  const ordenados = Object.entries(libros)
    .map(([id, entrada]) => ({
      id, segundos: entrada.s, paginas: entrada.p, titulo: entrada.n, formato: entrada.f, ultima: entrada.t,
    }))
    .sort((a, b) => b.segundos - a.segundos);

  return {
    hay: claves.length > 0,
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
    libros: ordenados,
    serie: serie(dias, hoy, diasSerie),
  };
}
