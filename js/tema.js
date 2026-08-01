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

// El tema que se ve, ya resuelto: «auto» se traduce a lo que pida el sistema.
export function temaEfectivo(elegido = temaElegido()) {
  if (elegido !== 'auto') return elegido;
  return oscuroDelSistema()?.matches ? 'oscuro' : 'claro';
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
