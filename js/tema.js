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

// Los tres estados en rueda: seguir al sistema → claro → oscuro → seguir al
// sistema. Que «automático» esté a un toque es la razón de que el botón cicle
// en vez de alternar: si no, volver a él exigiría entrar en los ajustes.
const RUEDA = { auto: 'claro', claro: 'oscuro', oscuro: 'auto' };

export function siguienteTema(desde = temaElegido()) {
  return RUEDA[desde] ?? 'auto';
}

export function pasarAlSiguienteTema() {
  const nuevo = siguienteTema();
  guardarTema(nuevo);
  return nuevo;
}

export function iniciarTema() {
  pintarTema();
  // En automático se sigue al sistema también mientras la app está abierta.
  oscuroDelSistema()?.addEventListener('change', () => {
    if (temaElegido() === 'auto') pintarTema();
  });
}
