// Lector de EPUB basado en epub.js.
//
// Las librerías (JSZip y epub.js, en vendor/) se cargan bajo demanda la
// primera vez que se abre un EPUB, para no penalizar la lectura de PDF.
//
// Fórmulas matemáticas: si el capítulo trae MathML y el navegador lo dibuja
// de forma nativa, no se hace nada. Si trae LaTeX (\(...\), $$...$$) o el
// navegador no entiende MathML, se inyecta MathJax (salida SVG, sin red)
// dentro del capítulo.
//
// La posición de lectura se expresa con un CFI (identificador estándar de
// posición en EPUB) más un porcentaje aproximado del libro.

const RUTA_MATHJAX = new URL('../vendor/mathjax-tex-mml-svg.js', import.meta.url).href;

let promesaLibrerias = null;

function cargarScript(ruta) {
  return new Promise((resolver, rechazar) => {
    const script = document.createElement('script');
    script.src = ruta;
    script.onload = resolver;
    script.onerror = () => rechazar(new Error(`No se pudo cargar ${ruta}`));
    document.head.append(script);
  });
}

function cargarLibrerias() {
  promesaLibrerias ??= cargarScript('vendor/jszip.min.js')
    .then(() => cargarScript('vendor/epub.min.js'));
  return promesaLibrerias;
}

function inyectarMathJax(contents) {
  const doc = contents.document;
  const hayMathML = !!doc.querySelector('math');
  const texto = doc.body?.textContent ?? '';
  const hayLatex = /\\\(|\\\[|\$\$/.test(texto);
  if (!hayMathML && !hayLatex) return;
  // MathML puro con soporte nativo del navegador: no hace falta MathJax.
  if (!hayLatex && typeof contents.window.MathMLElement === 'function') return;

  const config = doc.createElement('script');
  config.textContent = `window.MathJax = {
    tex: { inlineMath: [['\\\\(', '\\\\)']], displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']] },
    options: { enableMenu: false },
    startup: { typeset: true },
  };`;
  doc.head.append(config);
  const script = doc.createElement('script');
  script.src = RUTA_MATHJAX;
  doc.head.append(script);
}

export class LectorEpub {
  constructor({ contenedor, alCambiarPosicion, alTeclear }) {
    this.contenedor = contenedor;
    this.alCambiarPosicion = alCambiarPosicion;
    this.alTeclear = alTeclear;

    this.libro = null;   // objeto Book de epub.js
    this.vista = null;   // objeto Rendition de epub.js
    this.modo = 'pagina';
    this.tamano = 100;   // tamaño de letra en %
    this.noche = false;
    this.cfi = null;
    this.porcentaje = 0;
    this.conLocalizaciones = false;
  }

  async abrir(datos, cfiInicial = null, modo = 'pagina') {
    await cargarLibrerias();
    this.cerrar();
    this.modo = modo;
    this.cfi = cfiInicial;
    this.porcentaje = 0;
    this.conLocalizaciones = false;

    this.libro = window.ePub(datos.buffer ?? datos);
    await this.libro.ready;
    await this.montar(cfiInicial);

    // Las localizaciones permiten calcular el % del libro; se generan en
    // segundo plano porque en libros grandes tardan unos segundos.
    this.libro.locations.generate(1000).then(() => {
      if (!this.libro) return;
      this.conLocalizaciones = true;
      this.notificar();
    }).catch(() => null);
  }

  montar(posicion) {
    this.contenedor.replaceChildren();
    this.vista = this.libro.renderTo(this.contenedor, {
      width: '100%',
      height: '100%',
      flow: this.modo === 'continuo' ? 'scrolled' : 'paginated',
      spread: 'none',
      allowScriptedContent: true,
    });
    this.vista.hooks.content.register(inyectarMathJax);
    this.aplicarTemas();
    this.vista.on('relocated', (lugar) => {
      if (lugar?.start?.cfi) this.cfi = lugar.start.cfi;
      this.notificar();
    });
    // Las teclas pulsadas dentro del capítulo (iframe) no llegan al
    // documento principal: se reenvían para mantener los atajos.
    this.vista.on('keydown', (evento) => this.alTeclear?.(evento));
    return this.vista.display(posicion ?? undefined);
  }

  notificar() {
    if (this.conLocalizaciones && this.cfi) {
      try {
        this.porcentaje = Math.round(this.libro.locations.percentageFromCfi(this.cfi) * 100);
      } catch { /* CFI fuera de las localizaciones: se conserva el anterior */ }
    }
    this.alCambiarPosicion?.(this.cfi, this.porcentaje, this.conLocalizaciones);
  }

  aplicarTemas() {
    const temas = this.vista.themes;
    temas.register('dia', {
      body: { color: '#1f2937', background: '#ffffff' },
    });
    temas.register('noche', {
      body: { color: '#e2e8f0', background: '#171f2e' },
      'a, a:visited': { color: '#7dd3fc' },
      'img, svg': { filter: 'brightness(0.85)' },
    });
    temas.select(this.noche ? 'noche' : 'dia');
    temas.fontSize(this.tamano + '%');
  }

  aplicarNoche(activo) {
    this.noche = activo;
    this.vista?.themes.select(activo ? 'noche' : 'dia');
  }

  cambiarTamano(delta) {
    this.tamano = Math.min(300, Math.max(60, this.tamano + delta));
    this.vista?.themes.fontSize(this.tamano + '%');
  }

  async cambiarModo(modo) {
    if (modo === this.modo || !this.libro) return;
    this.modo = modo;
    this.vista?.destroy();
    await this.montar(this.cfi);
  }

  irAPorcentaje(porcentaje) {
    if (!this.conLocalizaciones) return;
    const fraccion = Math.min(100, Math.max(0, porcentaje)) / 100;
    const cfi = this.libro.locations.cfiFromPercentage(fraccion);
    if (cfi) this.vista?.display(cfi);
  }

  siguiente() { this.vista?.next(); }
  anterior() { this.vista?.prev(); }

  cerrar() {
    try { this.vista?.destroy(); } catch { /* ya destruida */ }
    try { this.libro?.destroy(); } catch { /* ya destruido */ }
    this.vista = null;
    this.libro = null;
    this.contenedor.replaceChildren();
  }
}
