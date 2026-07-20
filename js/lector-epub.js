// Lector de EPUB basado en epub.js.
//
// Las librerías (JSZip y epub.js, en vendor/) se cargan bajo demanda la
// primera vez que se abre un EPUB, para no penalizar la lectura de PDF.
// epub.js incluye las correcciones oficiales posteriores a 0.3.93 y conserva
// visibles los capítulos vecinos para evitar saltos o destellos al cruzarlos.
//
// Fórmulas matemáticas: si el capítulo trae MathML y el navegador lo dibuja
// de forma nativa, no se hace nada. Si trae LaTeX (\(...\), $$...$$) o el
// navegador no entiende MathML, se inyecta MathJax (salida SVG, sin red)
// dentro del capítulo.
//
// La posición de lectura se expresa con un CFI (identificador estándar de
// posición en EPUB) más un porcentaje aproximado del libro.

const RUTA_MATHJAX = new URL('../vendor/mathjax-tex-mml-svg.js', import.meta.url).href;

const ELEMENTOS_ACTIVOS = 'script, iframe, frame, object, embed, applet';
const ATRIBUTOS_URL = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'data']);

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

function bordeDerechoDelBloque(rango, rectangulo) {
  const nodo = rango?.commonAncestorContainer;
  const elemento = nodo?.nodeType === 1 ? nodo : nodo?.parentElement;
  const bloque = elemento?.closest(
    'p, li, blockquote, dd, dt, h1, h2, h3, h4, h5, h6, figcaption, td, th',
  ) ?? elemento;
  if (!bloque) return rectangulo.right;
  const centroY = rectangulo.top + rectangulo.height / 2;
  const fragmento = [...bloque.getClientRects()].find((rect) =>
    centroY >= rect.top && centroY <= rect.bottom &&
    rectangulo.left >= rect.left - 1 && rectangulo.right <= rect.right + 1);
  return fragmento?.right ?? rectangulo.right;
}

function crearNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Los capítulos se procesan como DOM antes de que epub.js los serialice en
// el iframe. Se elimina cualquier contenido ejecutable aportado por el libro
// y una CSP actúa como segunda barrera. Solo el MathJax incluido en
// PageKeeper recibe el nonce que permite ejecutar JavaScript.
export function sanitizarDocumentoEpub(doc) {
  if (!doc?.documentElement) return;

  doc.querySelectorAll(ELEMENTOS_ACTIVOS).forEach((elemento) => elemento.remove());
  for (const elemento of doc.querySelectorAll('*')) {
    for (const atributo of Array.from(elemento.attributes)) {
      const nombre = atributo.name.toLowerCase();
      if (nombre.startsWith('on') || nombre === 'srcdoc') {
        elemento.removeAttribute(atributo.name);
        continue;
      }
      if (ATRIBUTOS_URL.has(nombre)) {
        const url = atributo.value.replace(/[\u0000-\u0020]/g, '').toLowerCase();
        if (/^(javascript|vbscript|data:text\/html)/.test(url)) {
          elemento.removeAttribute(atributo.name);
        }
      }
    }
  }

  if (!doc.head) return;
  doc.head.querySelectorAll('meta[http-equiv]').forEach((meta) => {
    const directiva = meta.getAttribute('http-equiv')?.toLowerCase();
    if (directiva === 'content-security-policy' || directiva === 'refresh') meta.remove();
  });
  const nonce = crearNonce();
  doc.documentElement.dataset.pagekeeperScriptNonce = nonce;
  const politica = doc.createElement('meta');
  politica.setAttribute('http-equiv', 'Content-Security-Policy');
  politica.content = `default-src 'none'; script-src 'nonce-${nonce}'; ` +
    `style-src 'unsafe-inline' data: blob:; img-src data: blob:; ` +
    `font-src data: blob:; media-src data: blob:; object-src 'none'; ` +
    `frame-src 'none'; connect-src 'none'; form-action 'none'`;
  doc.head.prepend(politica);
}

export function inyectarMathJax(contents) {
  const doc = contents.document;
  const hayMathML = !!doc.querySelector('math');
  const texto = doc.body?.textContent ?? '';
  const hayLatex = /\\\(|\\\[|\$\$/.test(texto);
  if (!hayMathML && !hayLatex) return;
  // MathML puro con soporte nativo del navegador: no hace falta MathJax.
  if (!hayLatex && typeof contents.window.MathMLElement === 'function') return;

  const nonce = doc.documentElement.dataset.pagekeeperScriptNonce;
  if (!nonce) return;

  const config = doc.createElement('script');
  config.setAttribute('nonce', nonce);
  config.textContent = `window.MathJax = {
    tex: { inlineMath: [['\\\\(', '\\\\)']], displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']] },
    options: { enableMenu: false },
    startup: { typeset: true },
  };`;
  doc.head.append(config);
  const script = doc.createElement('script');
  script.setAttribute('nonce', nonce);
  script.src = RUTA_MATHJAX;
  doc.head.append(script);
}

export class LectorEpub {
  constructor({ contenedor, alCambiarPosicion, alTeclear, alPulsarEnlaceInterno, alPulsarContenido,
    alSeleccionarTexto, alPulsarAnotacion, alGestionarAnotacion, alMostrarNota, alOcultarNota,
    etiquetaOpcionesNota }) {
    this.contenedor = contenedor;
    this.alCambiarPosicion = alCambiarPosicion;
    this.alTeclear = alTeclear;
    this.alPulsarEnlaceInterno = alPulsarEnlaceInterno;
    this.alPulsarContenido = alPulsarContenido;
    this.alSeleccionarTexto = alSeleccionarTexto;
    this.alPulsarAnotacion = alPulsarAnotacion;
    this.alGestionarAnotacion = alGestionarAnotacion;
    this.alMostrarNota = alMostrarNota;
    this.alOcultarNota = alOcultarNota;
    this.etiquetaOpcionesNota = etiquetaOpcionesNota;

    this.libro = null;   // objeto Book de epub.js
    this.vista = null;   // objeto Rendition de epub.js
    this.modo = 'pagina';
    this.tamano = 100;   // tamaño de letra en %
    this.fuente = 'libro';     // 'libro' | 'serif' | 'sans'
    this.interlineado = null;  // null = el del libro; número = factor (1.5…)
    this.alineacion = 'libro'; // 'libro' | 'izquierda' (sin justificar)
    this.noche = false;
    this.cfi = null;
    this.porcentaje = 0;
    this.conLocalizaciones = false;
    this.anotaciones = [];
    this.cfiAplicados = [];
    this.rangosNotas = new WeakMap();
    this.notaBajoPuntero = null;
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
    this.libro.spine.hooks.content.register(sanitizarDocumentoEpub);
    await this.montar(cfiInicial);

    // Las localizaciones permiten calcular el % del libro; se generan en
    // segundo plano porque en libros grandes tardan unos segundos.
    this.libro.locations.generate(1000).then(() => {
      if (!this.libro) return;
      this.conLocalizaciones = true;
      this.notificar();
    }).catch(() => null);
  }

  async montar(posicion) {
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
    this.vista.hooks.content.register((contents) => this.registrarInteraccionesNotas(contents));
    // Los enlaces internos del libro (notas al pie, índice propio) los salta
    // epub.js por su cuenta; se avisa antes del salto con la posición actual
    // para que quede apuntada en el historial de navegación.
    this.vista.hooks.content.register((contents) => {
      contents.on('linkClicked', () => this.alPulsarEnlaceInterno?.(this.cfi));
    });
    this.aplicarTemas();
    this.vista.on('relocated', (lugar) => {
      if (lugar?.start?.cfi) this.cfi = lugar.start.cfi;
      this.notificar();
      this.ocultarNotaHover();
      this.programarIconosNotas();
    });
    this.vista.on('resized', () => this.programarIconosNotas());
    // Las teclas pulsadas dentro del capítulo (iframe) no llegan al
    // documento principal: se reenvían para mantener los atajos.
    this.vista.on('keydown', (evento) => this.alTeclear?.(evento));
    // Con los clics pasa lo mismo: se avisa para que la app pueda cerrar
    // sus paneles flotantes al pulsar sobre el texto del libro.
    this.vista.on('click', () => this.alPulsarContenido?.());
    this.vista.on('selected', (cfi, contents) => {
      const texto = contents?.window?.getSelection?.().toString().replace(/\s+/g, ' ').trim();
      if (cfi && texto) this.alSeleccionarTexto?.({ formato: 'epub', cfi, texto });
    });
    await this.vista.display(posicion ?? undefined);
    this.aplicarAnotaciones();
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

  mostrarAnotaciones(anotaciones) {
    this.ocultarNotaHover();
    this.anotaciones = Array.isArray(anotaciones) ? anotaciones : [];
    this.rangosNotas = new WeakMap();
    this.aplicarAnotaciones();
  }

  aplicarAnotaciones() {
    if (!this.vista?.annotations) return;
    for (const { cfi, tipo } of this.cfiAplicados) {
      try { this.vista.annotations.remove(cfi, tipo); } catch { /* ya no existe */ }
    }
    this.cfiAplicados = [];
    for (const anotacion of this.anotaciones) {
      if (!anotacion.cfi) continue;
      try {
        const esNota = Boolean(anotacion.nota);
        const argumentos = [
          anotacion.cfi,
          { id: anotacion.id },
          () => this.alPulsarAnotacion?.(anotacion.id),
          esNota ? 'pagekeeper-nota' : 'pagekeeper-resaltado',
          esNota
            ? { fill: '#38bdf8', 'fill-opacity': '0.4', 'mix-blend-mode': 'multiply' }
            : { fill: '#facc15', 'fill-opacity': '0.42', 'mix-blend-mode': 'multiply' },
        ];
        this.vista.annotations.highlight(...argumentos);
        this.cfiAplicados.push({ cfi: anotacion.cfi, tipo: 'highlight' });
      } catch { /* un CFI obsoleto no impide mostrar los demás */ }
    }
    this.programarIconosNotas();
  }

  registrarInteraccionesNotas(contents) {
    const doc = contents?.document;
    if (!doc) return;
    let frameHover = null;
    doc.addEventListener('mousemove', (evento) => {
      cancelAnimationFrame(frameHover);
      frameHover = requestAnimationFrame(() => this.detectarNotaHover(evento, contents));
    }, { passive: true });
    doc.addEventListener('mouseleave', () => this.ocultarNotaHover());
    contents.window?.addEventListener('scroll', () => {
      this.ocultarNotaHover();
      this.programarIconosNotas();
    }, { passive: true });
  }

  rangoNota(contents, anotacion) {
    let rangos = this.rangosNotas.get(contents);
    if (!rangos) {
      rangos = new Map();
      this.rangosNotas.set(contents, rangos);
    }
    if (rangos.has(anotacion.id)) return rangos.get(anotacion.id);
    let rango = null;
    try {
      rango = contents.range?.(anotacion.cfi) ??
        new window.ePub.CFI(anotacion.cfi).toRange(contents.document);
    } catch { /* el CFI pertenece a otro capítulo */ }
    rangos.set(anotacion.id, rango);
    return rango;
  }

  detectarNotaHover(evento, contents) {
    const marco = contents.document?.defaultView?.frameElement?.getBoundingClientRect();
    if (!marco) return this.ocultarNotaHover();
    for (const anotacion of this.anotaciones) {
      if (!anotacion.nota || !anotacion.cfi) continue;
      const rango = this.rangoNota(contents, anotacion);
      if (!rango) continue;
      for (const rectangulo of rango.getClientRects()) {
        if (evento.clientX < rectangulo.left || evento.clientX > rectangulo.right ||
            evento.clientY < rectangulo.top || evento.clientY > rectangulo.bottom) continue;
        if (this.notaBajoPuntero !== anotacion.id) {
          this.notaBajoPuntero = anotacion.id;
          this.alMostrarNota?.(anotacion, {
            left: marco.left + rectangulo.left,
            right: marco.left + rectangulo.right,
            top: marco.top + rectangulo.top,
            bottom: marco.top + rectangulo.bottom,
          });
        }
        return;
      }
    }
    this.ocultarNotaHover();
  }

  ocultarNotaHover() {
    if (this.notaBajoPuntero === null) return;
    this.notaBajoPuntero = null;
    this.alOcultarNota?.();
  }

  programarIconosNotas() {
    cancelAnimationFrame(this.frameIconosNotas);
    this.frameIconosNotas = requestAnimationFrame(() => this.pintarIconosNotas());
  }

  pintarIconosNotas() {
    for (const boton of this.contenedor.querySelectorAll('.boton-nota-epub')) boton.remove();
    if (!this.vista) return;
    const base = this.contenedor.getBoundingClientRect();
    const pintadas = new Set();
    for (const contents of this.vista.getContents?.() ?? []) {
      const iframe = contents.document?.defaultView?.frameElement;
      const marco = iframe?.getBoundingClientRect();
      if (!marco) continue;
      for (const anotacion of this.anotaciones) {
        if (!anotacion.nota || pintadas.has(anotacion.id)) continue;
        const rango = this.rangoNota(contents, anotacion);
        const rectangulo = rango && [...rango.getClientRects()].find((rect) =>
          marco.top + rect.bottom > base.top && marco.top + rect.top < base.bottom &&
          marco.left + rect.right > base.left && marco.left + rect.left < base.right);
        if (!rectangulo) continue;
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'boton-nota-margen boton-nota-epub';
        boton.textContent = '✎';
        boton.title = this.etiquetaOpcionesNota?.() ?? 'Opciones de la nota';
        boton.setAttribute('aria-label', boton.title);
        boton.style.top = `${marco.top + rectangulo.top - base.top}px`;
        const bordeTexto = bordeDerechoDelBloque(rango, rectangulo);
        boton.style.left = `${Math.min(
          base.width - 36,
          Math.max(4, marco.left + bordeTexto - base.left + 8),
        )}px`;
        boton.addEventListener('click', (evento) => {
          evento.stopPropagation();
          this.alGestionarAnotacion?.(anotacion.id, boton.getBoundingClientRect());
        });
        this.contenedor.append(boton);
        pintadas.add(anotacion.id);
      }
    }
  }

  cambiarTamano(delta) {
    this.tamano = Math.min(300, Math.max(60, this.tamano + delta));
    this.vista?.themes.fontSize(this.tamano + '%');
    this.programarIconosNotas();
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
    if (this.alineacion === 'izquierda') {
      // Quita el justificado (evita huecos grandes en pantallas estrechas).
      // 'start' respeta los idiomas RTL y se dejan en paz los elementos
      // centrados a propósito (títulos, versos, pies de imagen…).
      const centrado = ':not([style*="center"], [align="center"], .center, .centered)';
      reglas.push(`body, p${centrado}, li${centrado}, blockquote${centrado}, dd, dt { text-align: start !important; }`);
    }
    estilo.textContent = reglas.join('\n');
  }

  aplicarTipografia() {
    for (const contents of this.vista?.getContents() ?? []) {
      this.inyectarTipografia(contents);
    }
    this.programarIconosNotas();
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

  cambiarAlineacion(valor) {
    this.alineacion = valor === 'izquierda' ? 'izquierda' : 'libro';
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
    cancelAnimationFrame(this.frameIconosNotas);
    this.ocultarNotaHover();
    for (const boton of this.contenedor.querySelectorAll('.boton-nota-epub')) boton.remove();
    this.cfiAplicados = [];
    this.rangosNotas = new WeakMap();
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
    this.anotaciones = [];
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
