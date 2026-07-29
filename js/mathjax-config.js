// Configuración de MathJax para los capítulos EPUB con fórmulas.
//
// Va en un archivo propio, y no escrita dentro del capítulo, por la política
// de seguridad: el capítulo se sirve en un iframe «srcdoc», que hereda la CSP
// de la página además de la suya, y aquella no reconoce el nonce interno. Un
// script escrito ahí dentro quedaba bloqueado y MathJax se quedaba con sus
// ajustes de fábrica; cargado por src, en cambio, es del mismo origen y las
// dos políticas lo admiten.
//
// En un capítulo sin LaTeX, MathJax entra solo para dibujar el MathML que el
// navegador no sabe pintar, y entonces se le apaga la lectura de TeX: si no,
// convertiría también los ejemplos escritos como texto (un libro que explica
// «\begin{bmatrix}…» quiere enseñar la orden, no su resultado).
const soloMathML = document.documentElement.dataset.pagekeeperSoloMathml === '1';

// Una fórmula más ancha que la columna se cortaría al paginar, y en un móvil
// eso deja media matriz fuera de la pantalla. MathJax dibuja un SVG con
// proporciones propias, así que basta con encogerlo hasta el ancho disponible;
// se hace con medidas en píxeles porque un max-width en porcentaje no llega a
// aplicarse sobre el SVG una vez repartido el capítulo en columnas.
function ajustarFormulasAnchas() {
  for (const dibujo of document.querySelectorAll('mjx-container > svg')) {
    // Una fórmula aparte ocupa una línea entera y su propio contenedor mide lo
    // que la columna; una fórmula en mitad de un párrafo va en línea y no mide
    // nada, así que ahí el hueco lo da el bloque que la contiene.
    const marco = dibujo.parentElement;
    const hueco = marco.clientWidth || marco.parentElement?.clientWidth || 0;
    if (!hueco) continue;
    // Con «important», que epub.js limita ya todos los SVG del capítulo al
    // ancho de la columna entera y esa regla ganaría a un estilo en línea.
    dibujo.style.removeProperty('max-width');
    if (dibujo.getBoundingClientRect().width <= hueco) continue;
    dibujo.style.setProperty('max-width', `${hueco}px`, 'important');
    dibujo.style.setProperty('height', 'auto', 'important');
  }
}

window.MathJax = {
  tex: soloMathML
    ? { inlineMath: [], displayMath: [], processEnvironments: false, processEscapes: false }
    : {
      inlineMath: [['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
    },
  options: { enableMenu: false },
  startup: {
    typeset: true,
    pageReady() {
      return window.MathJax.startup.defaultPageReady().then(() => {
        ajustarFormulasAnchas();
        // El reparto en columnas termina después del dibujo, y con el capítulo
        // ya paginado las medidas cambian; se repasa entonces y en cada cambio
        // de tamaño de la ventana.
        requestAnimationFrame(ajustarFormulasAnchas);
        window.addEventListener('resize', ajustarFormulasAnchas);
      });
    },
  },
};
