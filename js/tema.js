// Tema de la aplicación: claro, sepia, oscuro o negro.
//
// De partida se sigue al sistema; en cuanto el usuario elige, su decisión manda
// y se recuerda en este navegador. Quien aplica el tema es el atributo
// data-tema de <html>: un script del <head> lo pone antes del primer pintado
// (ver index.html) y aquí solo se cambia cuando hace falta.
//
// El tema no se queda en la interfaz: también es el papel con el que se lee.
// Claro es papel blanco, sepia el tostado de los lectores de tinta electrónica,
// oscuro el modo noche de la página y negro el mismo modo noche llevado al
// negro puro, que en las pantallas OLED apaga el píxel y gasta menos. Antes
// eran dos ajustes aparte, con un papel por libro encima; unificarlos deja una
// sola pregunta —«¿con qué luz leo?»— en vez de tres.
//
// El botón de la cabecera abre un menú con las opciones. Antes las recorría en
// rueda, que con cuatro estados ya obligaba a pasar por los que no querías y
// con cinco sería peor.

const CLAVE_TEMA = 'lector.tema';
export const TEMAS = ['auto', 'claro', 'sepia', 'oscuro', 'negro'];

// Qué tema usa «el del sistema» a cada lado. El sistema solo dice claro u
// oscuro, y a cada lado hay dos temas que valen: quien lee en sepia de día no
// quiere que seguir al sistema le devuelva el blanco, y quien tiene una
// pantalla OLED quiere que la noche sea negra. De fábrica van los dos temas
// que se llaman como el lado, que es lo que se esperaba antes de que esto
// pudiera elegirse.
const VARIANTES = {
  claro: { clave: 'lector.temaAutoClaro', opciones: ['claro', 'sepia'], inicial: 'claro' },
  oscuro: { clave: 'lector.temaAutoOscuro', opciones: ['oscuro', 'negro'], inicial: 'oscuro' },
};

export const LADOS_AUTO = Object.keys(VARIANTES);
export const opcionesDelLado = (lado) => VARIANTES[lado]?.opciones ?? [];

export function varianteAuto(lado) {
  const variante = VARIANTES[lado];
  if (!variante) return 'claro';
  try {
    const guardado = localStorage.getItem(variante.clave);
    return variante.opciones.includes(guardado) ? guardado : variante.inicial;
  } catch {
    return variante.inicial; // almacenamiento bloqueado: lo de fábrica
  }
}

export function guardarVarianteAuto(lado, tema) {
  const variante = VARIANTES[lado];
  if (!variante) return;
  const valor = variante.opciones.includes(tema) ? tema : variante.inicial;
  try {
    // Lo de fábrica no se guarda: así una versión futura puede cambiarlo sin
    // arrastrar el valor antiguo de quien nunca tocó el ajuste.
    if (valor === variante.inicial) localStorage.removeItem(variante.clave);
    else localStorage.setItem(variante.clave, valor);
  } catch { /* sin almacenamiento el cambio dura lo que la sesión */ }
  if (temaElegido() === 'auto') pintarTema();
}

// Color de la barra del navegador en cada tema (el --fondo de estilos.css).
const COLOR_BARRA = {
  claro: '#f8fafc', sepia: '#efe4cf', oscuro: '#0f172a', negro: '#000000',
};

const oscuroDelSistema = () => window.matchMedia?.('(prefers-color-scheme: dark)');

export function temaElegido() {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA);
    return TEMAS.includes(guardado) ? guardado : 'auto';
  } catch {
    return 'auto'; // almacenamiento bloqueado: se sigue al sistema
  }
}

// El tema que se ve, ya resuelto: «auto» se traduce al del lado que pida el
// sistema. Separado del almacenamiento y del navegador para poder probarlo:
// se le dan la elección, lo que dice el sistema y las dos variantes.
export function resolverTema(elegido, sistemaOscuro, variantes) {
  if (TEMAS.includes(elegido) && elegido !== 'auto') return elegido;
  const lado = sistemaOscuro ? 'oscuro' : 'claro';
  const pedido = variantes?.[lado];
  return VARIANTES[lado].opciones.includes(pedido) ? pedido : VARIANTES[lado].inicial;
}

export function temaEfectivo(elegido = temaElegido()) {
  return resolverTema(elegido, Boolean(oscuroDelSistema()?.matches), {
    claro: varianteAuto('claro'),
    oscuro: varianteAuto('oscuro'),
  });
}

// Los que leen sobre fondo oscuro. Lo preguntan el filtro de la página del PDF,
// el botón de imágenes en su color y los colores del texto del EPUB: son dos
// temas, pero para esas decisiones se comportan igual, y comparar contra la
// lista evita que cada sitio se acuerde a medias de que ahora hay dos.
export function esTemaOscuro(tema = temaEfectivo()) {
  return tema === 'oscuro' || tema === 'negro';
}

function pintarTema() {
  const efectivo = temaEfectivo();
  document.documentElement.dataset.tema = efectivo;
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', COLOR_BARRA[efectivo]);
  document.dispatchEvent(new CustomEvent('tema-cambiado', { detail: { tema: efectivo } }));
}

export function guardarTema(tema) {
  const valor = TEMAS.includes(tema) ? tema : 'auto';
  try {
    if (valor === 'auto') localStorage.removeItem(CLAVE_TEMA);
    else localStorage.setItem(CLAVE_TEMA, valor);
  } catch { /* sin almacenamiento el cambio dura lo que la sesión */ }
  pintarTema();
}

export function iniciarTema() {
  pintarTema();
  // En automático se sigue al sistema también mientras la app está abierta.
  oscuroDelSistema()?.addEventListener('change', () => {
    if (temaElegido() === 'auto') pintarTema();
  });
}
