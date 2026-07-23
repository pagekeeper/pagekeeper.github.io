// Tema claro u oscuro de la interfaz.
//
// De partida se sigue al sistema; en cuanto el usuario elige, su decisión manda
// y se recuerda en este navegador. Quien aplica el tema es el atributo
// data-tema de <html>: un script del <head> lo pone antes del primer pintado
// (ver index.html) y aquí solo se cambia cuando hace falta.
//
// No tiene nada que ver con el «modo noche» del lector, que oscurece la página
// del libro y se guarda aparte.

const CLAVE_TEMA = 'lector.tema';
const TEMAS = ['auto', 'claro', 'oscuro'];

// Color de la barra del navegador en cada tema (el --fondo de estilos.css).
const COLOR_BARRA = { claro: '#f8fafc', oscuro: '#0f172a' };

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

// Alterna entre claro y oscuro partiendo de lo que se está viendo: el primer
// toque desde «automático» fija el contrario de lo que hay en pantalla.
export function alternarTema() {
  guardarTema(temaEfectivo() === 'oscuro' ? 'claro' : 'oscuro');
  return temaEfectivo();
}

export function iniciarTema() {
  pintarTema();
  // En automático se sigue al sistema también mientras la app está abierta.
  oscuroDelSistema()?.addEventListener('change', () => {
    if (temaElegido() === 'auto') pintarTema();
  });
}
