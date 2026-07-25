// Registro de actividad de la sincronización.
//
// Cuando la posición de un libro no llega al servidor, lo único que se veía
// era un aviso de siete segundos que quizá nadie estaba mirando. Después ya no
// quedaba rastro: ni cuándo se intentó, ni cuántas veces, ni con qué error.
// Este registro deja constancia para poder mirar hacia atrás y entender qué
// pasó, sobre todo cuando el fallo es intermitente (una wifi que no alcanza el
// servidor, un móvil que pierde la cobertura a ratos).
//
// Vive solo en este dispositivo y no se sincroniza: el registro de un aparato
// que no consigue hablar con la nube no puede depender de la nube.

const CLAVE_REGISTRO = 'lector.registro';
const MAXIMO = 300; // unas cuantas sesiones de lectura; el JSON ronda 40 KB

// Los eventos se guardan del más nuevo al más viejo: es el orden en que se
// leen y así recortar la cola es quitar del final.
function cargar() {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE_REGISTRO) ?? '[]');
    return Array.isArray(crudo) ? crudo : [];
  } catch {
    return []; // registro corrupto o almacenamiento bloqueado: se empieza de cero
  }
}

function guardar(eventos) {
  try {
    localStorage.setItem(CLAVE_REGISTRO, JSON.stringify(eventos.slice(0, MAXIMO)));
  } catch {
    // Sin sitio para el registro se sigue leyendo igual: esto es diagnóstico,
    // no una función de la que dependa nadie.
  }
}

// `nivel` distingue lo que hay que mirar (error) de lo que solo sirve para
// reconstruir la secuencia (ok, aviso). `detalle` es texto libre ya legible.
export function anotar(nivel, evento, detalle = '') {
  const eventos = cargar();
  const ultimo = eventos[0];
  // Un fallo que se repite igual mientras se reintenta no merece una línea
  // por intento: se cuenta en la que ya había.
  if (ultimo && ultimo.nivel === nivel && ultimo.evento === evento && ultimo.detalle === detalle) {
    ultimo.veces = (ultimo.veces ?? 1) + 1;
    ultimo.cuando = new Date().toISOString();
    guardar(eventos);
    return;
  }
  eventos.unshift({
    cuando: new Date().toISOString(),
    nivel,
    evento,
    detalle,
    conexion: navigator.onLine ? 'en línea' : 'sin conexión',
  });
  guardar(eventos);
}

export const listar = () => cargar();

export function hayErrores() {
  return cargar().some((evento) => evento.nivel === 'error');
}

export function limpiar() {
  try {
    localStorage.removeItem(CLAVE_REGISTRO);
  } catch { /* nada que limpiar si no se podía escribir */ }
}

// Texto plano para copiar o guardar en un archivo: es lo que se pega en un
// correo cuando hay que contarle a alguien qué está fallando.
export function comoTexto() {
  const cabecera = [
    `PageKeeper — registro de actividad`,
    `Generado: ${new Date().toISOString()}`,
    `Navegador: ${navigator.userAgent}`,
    '',
  ].join('\n');
  const lineas = cargar().map((evento) => {
    const veces = evento.veces > 1 ? ` (×${evento.veces})` : '';
    const detalle = evento.detalle ? ` — ${evento.detalle}` : '';
    return `${evento.cuando} [${evento.nivel}] ${evento.evento}${veces}${detalle} · ${evento.conexion}`;
  });
  return cabecera + (lineas.length ? lineas.join('\n') : 'Sin eventos registrados.') + '\n';
}
