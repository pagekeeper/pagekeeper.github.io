// Configuración de MathJax para los capítulos EPUB con fórmulas.
//
// Va en un archivo propio, y no escrita dentro del capítulo, por la política
// de seguridad: el capítulo se sirve en un iframe «srcdoc», que hereda la CSP
// de la página además de la suya, y aquella no reconoce el nonce interno. Un
// script escrito ahí dentro quedaba bloqueado y MathJax se quedaba con sus
// ajustes de fábrica; cargado por src, en cambio, es del mismo origen y las
// dos políticas lo admiten.
window.MathJax = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
  },
  options: { enableMenu: false },
  startup: { typeset: true },
};
