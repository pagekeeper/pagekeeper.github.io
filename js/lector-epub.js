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

// Pilas de fuentes de los ajustes tipográficos ('libro' = sin forzar nada).
const FUENTES = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

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

export function cargarLibrerias() {
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
    this.fuente = 'libro';     // 'libro' | 'serif' | 'sans'
    this.interlineado = null;  // null = el del libro; número = factor (1.5…)
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
    const continuo = this.modo === 'continuo';
    this.vista = this.libro.renderTo(this.contenedor, {
      width: '100%',
      height: '100%',
      flow: continuo ? 'scrolled' : 'paginated',
      // En continuo, el gestor 'continuous' hace el scroll dentro del
      // contenedor (fullsize:false); el gestor por defecto delega en el
      // scroll de la página, que aquí no existe porque el contenedor es fijo.
      ...(continuo ? { manager: 'continuous', fullsize: false } : {}),
      spread: 'none',
      allowScriptedContent: true,
    });
    this.vista.hooks.content.register(inyectarMathJax);
    this.vista.hooks.content.register((contents) => this.inyectarTipografia(contents));
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
    // Nota: register()/select() de epub.js inyecta los temas como hojas de
    // estilo acumulativas y volver del tema oscuro al claro no funciona.
    // override() aplica estilos en línea que sí se reemplazan al alternar.
    this.vista.themes.default({ 'a, a:visited': { color: '#0ea5e9' } });
    this.aplicarNoche(this.noche);
    this.vista.themes.fontSize(this.tamano + '%');
  }

  aplicarNoche(activo) {
    this.noche = activo;
    if (!this.vista) return;
    this.vista.themes.override('color', activo ? '#e2e8f0' : '#1f2937');
    this.vista.themes.override('background', activo ? '#171f2e' : '#ffffff');
  }

  cambiarTamano(delta) {
    this.tamano = Math.min(300, Math.max(60, this.tamano + delta));
    this.vista?.themes.fontSize(this.tamano + '%');
  }

  // ───────────── Ajustes tipográficos (fuente e interlineado) ─────────────

  // Inserta (o actualiza) en el capítulo una hoja de estilos con la fuente y
  // el interlineado elegidos. Se usa una hoja con !important en lugar de los
  // overrides de epub.js porque el CSS del libro suele fijar la fuente en
  // p/div y ganaría a un estilo en línea del body.
  inyectarTipografia(contents) {
    const doc = contents?.document;
    if (!doc?.head) return;
    let estilo = doc.getElementById('pagekeeper-tipografia');
    if (!estilo) {
      estilo = doc.createElement('style');
      estilo.id = 'pagekeeper-tipografia';
      doc.head.append(estilo);
    }
    const reglas = [];
    const fuente = FUENTES[this.fuente];
    if (fuente) {
      // Se respeta la fuente del código (pre, code…) y la de las fórmulas.
      reglas.push(`html, body { font-family: ${fuente} !important; }`);
      reglas.push(`body :not(pre, pre *, code, code *, kbd, samp, var, tt, math, math *) { font-family: ${fuente} !important; }`);
    }
    if (this.interlineado) {
      reglas.push(`body, p, li, blockquote, dd, dt { line-height: ${this.interlineado} !important; }`);
    }
    estilo.textContent = reglas.join('\n');
  }

  aplicarTipografia() {
    for (const contents of this.vista?.getContents() ?? []) {
      this.inyectarTipografia(contents);
    }
  }

  cambiarFuente(fuente) {
    this.fuente = fuente in FUENTES ? fuente : 'libro';
    this.aplicarTipografia();
  }

  cambiarInterlineado(valor) {
    const numero = Number(valor);
    this.interlineado = Number.isFinite(numero) && numero >= 1 && numero <= 3 ? numero : null;
    this.aplicarTipografia();
  }

  async cambiarModo(modo) {
    if (modo === this.modo || !this.libro) return;
    this.modo = modo;
    this.desmontarVista();
    await this.montar(this.cfi);
  }

  // Separa la vista del lector antes de destruirla: las cargas de capítulos
  // que queden en vuelo terminan sobre una vista ya desreferenciada y sus
  // errores internos no afectan a la vista nueva.
  desmontarVista() {
    const vista = this.vista;
    this.vista = null;
    try { vista?.destroy(); } catch { /* restos de la vista anterior */ }
  }

  destinoPorcentaje(porcentaje) {
    if (!this.conLocalizaciones) return;
    const fraccion = Math.min(100, Math.max(0, porcentaje)) / 100;
    return this.libro.locations.cfiFromPercentage(fraccion) || null;
  }

  irAPorcentaje(porcentaje) {
    const cfi = this.destinoPorcentaje(porcentaje);
    if (cfi) return this.vista?.display(cfi);
  }

  siguiente() { this.vista?.next(); }
  anterior() { this.vista?.prev(); }

  irA(destino) { return this.vista?.display(destino); }

  indice() {
    const entradas = [];
    const recorrer = (elementos, nivel = 0) => {
      for (const elemento of elementos ?? []) {
        const titulo = String(elemento.label ?? '').replace(/\s+/g, ' ').trim();
        if (titulo && elemento.href) entradas.push({ titulo, destino: elemento.href, nivel });
        recorrer(elemento.subitems, nivel + 1);
      }
    };
    recorrer(this.libro?.navigation?.toc);
    if (!entradas.length) return entradas;

    const primeraSeccion = this.libro?.spine?.spineItems
      ?.find((seccion) => seccion.linear !== 'no' && seccion.href);
    if (primeraSeccion) {
      const sinFragmento = (href) => String(href ?? '').split('#')[0];
      const hayEnlaceAlInicio = entradas.some((entrada) =>
        sinFragmento(entrada.destino) === sinFragmento(primeraSeccion.href));
      if (!hayEnlaceAlInicio) {
        entradas.unshift({ esInicio: true, destino: primeraSeccion.href, nivel: 0 });
      }
    }
    return entradas;
  }

  async buscar(consulta) {
    if (!this.libro) return [];
    const buscado = normalizarBusqueda(consulta.trim());
    if (!buscado) return [];
    const resultados = [];
    for (const seccion of this.libro.spine.spineItems) {
      if (seccion.linear === 'no' || resultados.length >= 200) continue;
      try {
        await seccion.load(this.libro.load.bind(this.libro));
        const texto = (seccion.document?.body?.textContent ?? '').replace(/\s+/g, ' ').trim();
        const minusculas = normalizarBusqueda(texto);
        let posicion = 0;
        while ((posicion = minusculas.indexOf(buscado, posicion)) !== -1 && resultados.length < 200) {
          resultados.push({
            destino: seccion.href,
            numero: seccion.index + 1,
            fragmento: fragmentoBusqueda(texto, posicion, buscado.length),
          });
          posicion += Math.max(1, buscado.length);
        }
      } finally {
        seccion.unload();
      }
    }
    return resultados;
  }

  cerrar() {
    this.desmontarVista();
    try { this.libro?.destroy(); } catch { /* ya destruido */ }
    this.libro = null;
    this.contenedor.replaceChildren();
  }
}

function fragmentoBusqueda(texto, posicion, longitud) {
  const inicio = Math.max(0, posicion - 55);
  const fin = Math.min(texto.length, posicion + longitud + 75);
  return `${inicio ? '…' : ''}${texto.slice(inicio, fin)}${fin < texto.length ? '…' : ''}`;
}

function normalizarBusqueda(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}
