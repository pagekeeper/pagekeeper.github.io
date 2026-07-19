// Iconos SVG incrustados (Lucide, https://lucide.dev — licencia ISC).
// Van incluidos en el código para que la aplicación funcione sin conexión.

const TRAZADOS = {
  'book-open': '<path d="M12 7v14"/> <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  'circle-help': '<circle cx="12" cy="12" r="10"/> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/> <path d="M12 17h.01"/>',
  'settings': '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/> <circle cx="12" cy="12" r="3"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/> <path d="M21 3v5h-5"/> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/> <path d="M8 16H3v5"/>',
  'plus': '<path d="M5 12h14"/> <path d="M12 5v14"/>',
  'cloud-upload': '<path d="M12 13v8"/> <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/> <path d="m8 17 4-4 4 4"/>',
  'cloud-download': '<path d="M12 13v8"/> <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 1 1 0 9"/> <path d="m8 17 4 4 4-4"/>',
  'cloud-check': '<path d="m17 15-5.5 5.5L9 18"/> <path d="M5 17.743A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 1.5 8.742"/>',
  'book': '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  'trash-2': '<path d="M10 11v6"/> <path d="M14 11v6"/> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/> <path d="M3 6h18"/> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/> <path d="M19 12H5"/>',
  'scroll-text': '<path d="M15 12h-5"/> <path d="M15 8h-5"/> <path d="M19 17V5a2 2 0 0 0-2-2H4"/> <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  'file-text': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/> <path d="M10 9H8"/> <path d="M16 13H8"/> <path d="M16 17H8"/>',
  'zoom-in': '<circle cx="11" cy="11" r="8"/> <line x1="21" x2="16.65" y1="21" y2="16.65"/> <line x1="11" x2="11" y1="8" y2="14"/> <line x1="8" x2="14" y1="11" y2="11"/>',
  'move-horizontal': '<path d="m18 8 4 4-4 4"/> <path d="M2 12h20"/> <path d="m6 8-4 4 4 4"/>',
  'fold-horizontal': '<path d="M2 12h6"/> <path d="M22 12h-6"/> <path d="M12 2v2"/> <path d="M12 8v2"/> <path d="M12 14v2"/> <path d="M12 20v2"/> <path d="m19 9-3 3 3 3"/> <path d="m5 15 3-3-3-3"/>',
  'type': '<polyline points="4 7 4 4 20 4 20 7"/> <line x1="9" x2="15" y1="20" y2="20"/> <line x1="12" x2="12" y1="4" y2="20"/>',
  'download': '<path d="M12 15V3"/> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/> <path d="m7 10 5 5 5-5"/>',
  'zoom-out': '<circle cx="11" cy="11" r="8"/> <line x1="21" x2="16.65" y1="21" y2="16.65"/> <line x1="8" x2="14" y1="11" y2="11"/>',
  'moon': '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  'sun': '<circle cx="12" cy="12" r="4"/> <path d="M12 2v2"/> <path d="M12 20v2"/> <path d="m4.93 4.93 1.41 1.41"/> <path d="m17.66 17.66 1.41 1.41"/> <path d="M2 12h2"/> <path d="M20 12h2"/> <path d="m6.34 17.66-1.41 1.41"/> <path d="m19.07 4.93-1.41 1.41"/>',
  'cloud': '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  'smartphone': '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/> <path d="M12 18h.01"/>',
  'search': '<circle cx="11" cy="11" r="8"/> <path d="m21 21-4.3-4.3"/>',
  'list-tree': '<path d="M21 12h-8"/> <path d="M21 6H8"/> <path d="M21 18h-8"/> <path d="M3 6h1v4h4"/> <path d="M3 10v4h5"/> <path d="M3 14v4h5"/>',
  'undo-2': '<path d="M9 14 4 9l5-5"/> <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5A5.5 5.5 0 0 1 14.5 20H11"/>',
  'redo-2': '<path d="m15 14 5-5-5-5"/> <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5 5.5 5.5 0 0 0 9.5 20H13"/>',
  'map-pin': '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/> <circle cx="12" cy="10" r="3"/>',
  'bookmark': '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  'folder': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  'folder-plus': '<path d="M12 10v6"/> <path d="M9 13h6"/> <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  'folder-input': '<path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/> <path d="M2 13h10"/> <path d="m9 16 3-3-3-3"/>',
  'bookmark-plus': '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/> <line x1="12" x2="12" y1="7" y2="13"/> <line x1="15" x2="9" y1="10" y2="10"/>',
  'pencil': '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/> <path d="m15 5 4 4"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/> <path d="m9 12 2 2 4-4"/>',
  'x': '<path d="M18 6 6 18"/> <path d="m6 6 12 12"/>',
  'ellipsis-vertical': '<circle cx="12" cy="12" r="1"/> <circle cx="12" cy="5" r="1"/> <circle cx="12" cy="19" r="1"/>',
  'list': '<path d="M3 12h.01"/> <path d="M3 18h.01"/> <path d="M3 6h.01"/> <path d="M8 12h13"/> <path d="M8 18h13"/> <path d="M8 6h13"/>',
  'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/> <rect width="7" height="7" x="14" y="3" rx="1"/> <rect width="7" height="7" x="14" y="14" rx="1"/> <rect width="7" height="7" x="3" y="14" rx="1"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
};

export function icono(nombre, clase = 'icono') {
  const trazado = TRAZADOS[nombre];
  if (!trazado) return '';
  return `<svg class="${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazado}</svg>`;
}

// Rellena todos los elementos con atributo data-icono, por ejemplo:
//   <button data-icono="settings"></button>
export function pintarIconos(raiz = document) {
  for (const elemento of raiz.querySelectorAll('[data-icono]')) {
    elemento.innerHTML = icono(elemento.dataset.icono);
  }
}
