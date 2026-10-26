// La página de la política de privacidad trae los ocho idiomas y enseña uno.
// Parte del que se eligió en la aplicación (la misma clave de localStorage que
// i18n.js), o del navegador, y el selector cambia de uno a otro sin recordar
// nada: el idioma de la aplicación se elige en la aplicación.

const articulos = [...document.querySelectorAll('article[data-idioma]')];
const disponibles = articulos.map((articulo) => articulo.dataset.idioma);
const selector = document.getElementById('selector-idioma');

function idiomaInicial() {
  let guardado = null;
  try { guardado = localStorage.getItem('lector.idioma'); } catch { /* sin almacenamiento */ }
  if (disponibles.includes(guardado)) return guardado;
  const navegador = [...navigator.languages, navigator.language]
    .map((valor) => (valor || '').toLowerCase().split('-')[0])
    .find((valor) => disponibles.includes(valor));
  return navegador ?? 'es';
}

function mostrar(idioma) {
  articulos.forEach((articulo) => { articulo.hidden = articulo.dataset.idioma !== idioma; });
  document.documentElement.lang = idioma;
  document.title = `${articulos.find((a) => a.dataset.idioma === idioma).querySelector('h1').textContent} · PageKeeper`;
  selector.value = idioma;
}

selector.hidden = false;
selector.addEventListener('change', () => mostrar(selector.value));
mostrar(idiomaInicial());
