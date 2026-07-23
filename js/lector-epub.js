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

import { posicionVerticalLibre } from './posicion-notas.js';

const RUTA_MATHJAX = new URL('../vendor/mathjax-tex-mml-svg.js', import.meta.url).href;

const ELEMENTOS_ACTIVOS = 'script, iframe, frame, object, embed, applet';
const ATRIBUTOS_URL = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'data']);

// Rellenos de la paleta de resaltado. Las anotaciones sin color (anteriores
// a la paleta) conservan su aspecto histórico: amarillo, o azul con nota.
const RELLENOS_RESALTADO = {
  amarillo: '#facc15',
  verde: '#4ade80',
  azul: '#38bdf8',
  rosa: '#f472b6',
};

// Pilas de fuentes de los ajustes tipográficos ('libro' = sin forzar nada).
const FUENTES = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

let promesaZip = null;
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

export function cargarZip() {
  promesaZip ??= window.JSZip ? Promise.resolve() : cargarScript('vendor/jszip.min.js');
  return promesaZip;
}

export function cargarLibrerias() {
  promesaLibrerias ??= cargarZip()
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

// Papel y tinta de cada tema de lectura. El sepia es el tostado clásico de
// los lectores de tinta electrónica; con esta pareja el texto queda en 8,7:1,
// de sobra por encima del mínimo.
const COLORES_PAGINA = {
  claro: { texto: '#1f2937', fondo: '#ffffff' },
  sepia: { texto: '#4b3a2a', fondo: '#f4ecd8' },
  noche: { texto: '#e2e8f0', fondo: '#171f2e' },
};

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
    this.doble = false;  // dos páginas juntas cuando la pantalla es ancha
    this.tamano = 100;   // tamaño de letra en %
    this.fuente = 'libro';     // 'libro' | 'serif' | 'sans'
    this.interlineado = null;  // null = el del libro; número = factor (1.5…)
    this.alineacion = 'libro'; // 'libro' | 'izquierda' (sin justificar)
    this.temaPagina = 'claro';
    this.cfi = null;
    this.porcentaje = 0;
    this.conLocalizaciones = false;
    this.anotaciones = [];
    this.cfiAplicados = [];
    this.rangosNotas = new WeakMap();
    this.notaBajoPuntero = null;

    // epub.js solo se entera de los cambios de tamaño de la ventana; al abrir
    // o cerrar la barra lateral cambia el contenedor, así que se le avisa.
    let tempResize;
    let medida = '';
    new ResizeObserver(() => {
      clearTimeout(tempResize);
      tempResize = setTimeout(() => {
        const nueva = `${this.contenedor.clientWidth}x${this.contenedor.clientHeight}`;
        if (!this.vista || nueva === medida) return;
        medida = nueva;
        try { this.vista.resize(); } catch { /* vista a medio montar */ }
        this.programarIconosNotas();
      }, 200);
    }).observe(this.contenedor);
  }

  // 'localizaciones' es el reparto del libro calculado en una sesión anterior
  // (lo que devolvió alGuardarLocalizaciones); reutilizarlo evita repetir un
  // cálculo de varios segundos cada vez que se abre el libro.
  async abrir(datos, cfiInicial = null, modo = 'pagina',
    { localizaciones = null, alGuardarLocalizaciones = null } = {}) {
    await cargarLibrerias();
    this.cerrar();
    this.modo = modo;
    this.cfi = cfiInicial;
    this.porcentaje = 0;
    this.conLocalizaciones = false;

    this.libro = window.ePub(datos.buffer ?? datos);
    await this.libro.ready;
    this.libro.spine.hooks.content.register(sanitizarDocumentoEpub);
    if (localizaciones) {
      try {
        const cargadas = this.libro.locations.load(localizaciones);
        this.conLocalizaciones = Array.isArray(cargadas) && cargadas.length > 1;
      } catch { /* caché ilegible: se recalcula abajo */ }
    }
    await this.montar(cfiInicial);

    // Las localizaciones permiten calcular el % del libro; se generan en
    // segundo plano porque en libros grandes tardan unos segundos.
    if (this.conLocalizaciones) {
      this.notificar();
      return;
    }
    this.libro.locations.generate(1000).then(() => {
      if (!this.libro) return;
      this.conLocalizaciones = true;
      this.notificar();
      try { alGuardarLocalizaciones?.(this.libro.locations.save()); } catch { /* sin caché */ }
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
      // 'auto' reparte el capítulo en dos columnas cuando el área es ancha;
      // en pantallas estrechas epub.js vuelve solo a una página.
      spread: this.doble && !continuo ? 'auto' : 'none',
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
    // Con los clics pasa lo mismo: se avisa (con el evento) para que la app
    // pueda cerrar sus paneles o alternar el modo inmersivo.
    this.vista.on('click', (evento) => this.alPulsarContenido?.(evento));
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
    this.aplicarTemaPagina(this.temaPagina);
    this.vista.themes.fontSize(this.tamano + '%');
  }

  // Papel del libro. En EPUB no se filtra nada: se cambian directamente el
  // color del texto y el del fondo, así que las ilustraciones se ven tal cual.
  aplicarTemaPagina(tema) {
    this.temaPagina = COLORES_PAGINA[tema] ? tema : 'claro';
    if (!this.vista) return;
    const { texto, fondo } = COLORES_PAGINA[this.temaPagina];
    this.vista.themes.override('color', texto);
    this.vista.themes.override('background', fondo);
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
        const relleno = RELLENOS_RESALTADO[anotacion.color] ??
          (esNota ? RELLENOS_RESALTADO.azul : RELLENOS_RESALTADO.amarillo);
        const argumentos = [
          anotacion.cfi,
          { id: anotacion.id },
          () => this.alPulsarAnotacion?.(anotacion.id),
          esNota ? 'pagekeeper-nota' : 'pagekeeper-resaltado',
          { fill: relleno, 'fill-opacity': esNota ? '0.4' : '0.42', 'mix-blend-mode': 'multiply' },
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
    const posicionesOcupadas = [];
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
        const posicionVertical = posicionVerticalLibre(
          marco.top + rectangulo.top - base.top,
          posicionesOcupadas,
          base.height,
        );
        posicionesOcupadas.push(posicionVertical);
        boton.style.top = `${posicionVertical}px`;
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

  async cambiarDoble(activo) {
    activo = Boolean(activo);
    if (activo === this.doble) return;
    this.doble = activo;
    if (!this.libro) return;
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

  // ───────────── Apoyo a la lectura en voz alta ─────────────

  // Texto desde la posición visible hasta el final del capítulo actual.
  // Con varios capítulos montados a la vez se busca el que corresponde a la
  // sección de la posición actual, no el primero de la lista.
  textoDesdePosicion() {
    const indice = this.vista?.currentLocation()?.start?.index;
    const contenidos = this.vista?.getContents?.() ?? [];
    const contents = contenidos.find((c) => c.sectionIndex === indice) ?? contenidos[0];
    const doc = contents?.document;
    if (!doc?.body) return '';
    const total = doc.createRange();
    total.selectNodeContents(doc.body);
    if (this.cfi) {
      try {
        const inicio = contents.range(this.cfi) ??
          new window.ePub.CFI(this.cfi).toRange(doc);
        if (inicio) total.setStart(inicio.startContainer, inicio.startOffset);
      } catch { /* CFI de otro capítulo: se lee el capítulo completo */ }
    }
    return total.toString().replace(/\s+/g, ' ').trim();
  }

  // Salta al principio del siguiente capítulo lineal; false si no hay más.
  async avanzarCapitulo() {
    const actual = this.vista?.currentLocation()?.start?.index ?? -1;
    const secciones = this.libro?.spine?.spineItems ?? [];
    for (let i = actual + 1; i < secciones.length; i++) {
      if (secciones[i].linear !== 'no' && secciones[i].href) {
        await this.vista.display(secciones[i].href);
        return true;
      }
    }
    return false;
  }

  irA(destino) { return this.vista?.display(destino); }

  // Sección del libro (índice del «spine») por la que se va ahora mismo.
  // Sirve para saber a qué capítulo del índice corresponde la lectura.
  get seccionActual() {
    const inicio = this.vista?.currentLocation()?.start;
    return Number.isInteger(inicio?.index) ? inicio.index : null;
  }

  // A qué sección del «spine» apunta un enlace del índice.
  seccionDe(href) {
    try {
      const seccion = this.libro?.spine?.get(href);
      return Number.isInteger(seccion?.index) ? seccion.index : null;
    } catch {
      return null; // enlace roto o externo
    }
  }

  indice() {
    const entradas = [];
    const recorrer = (elementos, nivel = 0) => {
      for (const elemento of elementos ?? []) {
        const titulo = String(elemento.label ?? '').replace(/\s+/g, ' ').trim();
        if (titulo && elemento.href) {
          entradas.push({ titulo, destino: elemento.href, nivel, seccion: this.seccionDe(elemento.href) });
        }
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
        entradas.unshift({
          esInicio: true, destino: primeraSeccion.href, nivel: 0,
          seccion: this.seccionDe(primeraSeccion.href),
        });
      }
    }
    return entradas;
  }

  // Recorre el libro capítulo a capítulo. La señal permite abandonar el
  // barrido a medias (cargar y descargar todas las secciones de un libro
  // grande no es gratis) y los avisos entregan lo encontrado sobre la marcha.
  async buscar(consulta, { senal, alProgreso, alEncontrar } = {}) {
    if (!this.libro) return [];
    const buscado = normalizarBusqueda(consulta.trim());
    if (!buscado) return [];
    const resultados = [];
    const secciones = this.libro.spine.spineItems;
    const total = secciones.filter((seccion) => seccion.linear !== 'no').length;
    let revisadas = 0;
    for (const seccion of secciones) {
      if (senal?.aborted) break;
      if (seccion.linear === 'no' || resultados.length >= 200) continue;
      try {
        await seccion.load(this.libro.load.bind(this.libro));
        const cuerpo = seccion.document?.body;
        if (!cuerpo) continue;
        const { visible, normal, origen } = plegarTexto(cuerpo);
        const nuevos = [];
        let posicion = 0;
        while ((posicion = normal.indexOf(buscado, posicion)) !== -1 && resultados.length + nuevos.length < 200) {
          // El CFI exacto de la aparición permite saltar a ella (y no solo
          // al capítulo) y resaltarla al llegar.
          let cfi = null;
          try {
            const inicio = origen[posicion];
            const fin = origen[posicion + buscado.length - 1];
            const rango = seccion.document.createRange();
            rango.setStart(inicio.nodo, inicio.indice);
            rango.setEnd(fin.nodo, Math.min(fin.indice + 1, fin.nodo.textContent.length));
            cfi = seccion.cfiFromRange(rango);
          } catch { /* sin CFI se salta al capítulo, como antes */ }
          nuevos.push({
            destino: cfi ?? seccion.href,
            cfi,
            numero: seccion.index + 1,
            fragmento: fragmentoBusqueda(visible, posicion, buscado.length),
          });
          posicion += Math.max(1, buscado.length);
        }
        resultados.push(...nuevos);
        if (nuevos.length) alEncontrar?.(nuevos);
      } finally {
        seccion.unload();
        alProgreso?.(++revisadas, total);
      }
    }
    return resultados;
  }

  // Resalta unos segundos la aparición encontrada por la búsqueda.
  destacarBusqueda(cfi) {
    if (!cfi || !this.vista?.annotations) return;
    try {
      this.vista.annotations.highlight(cfi, {}, null, 'pagekeeper-busqueda',
        { fill: '#0ea5e9', 'fill-opacity': '0.35', 'mix-blend-mode': 'multiply' });
    } catch {
      return; // un CFI que ya no casa con el capítulo no debe romper el salto
    }
    setTimeout(() => {
      try { this.vista?.annotations.remove(cfi, 'highlight'); } catch { /* ya no está */ }
    }, 2600);
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

// Pliega el texto del cap\u00edtulo (espacios colapsados, sin acentos) apuntando
// de qu\u00e9 nodo y posici\u00f3n sale cada car\u00e1cter: 'visible' conserva el texto
// original para los fragmentos y 'normal' es la versi\u00f3n donde se busca.
function plegarTexto(raiz) {
  const caminante = raiz.ownerDocument.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  let visible = '';
  let normal = '';
  const origen = [];
  let enEspacio = true;
  for (let nodo = caminante.nextNode(); nodo; nodo = caminante.nextNode()) {
    const texto = nodo.textContent;
    for (let indice = 0; indice < texto.length; indice++) {
      const caracter = texto[indice];
      if (/\s/.test(caracter)) {
        if (!enEspacio) {
          visible += ' ';
          normal += ' ';
          origen.push({ nodo, indice });
          enEspacio = true;
        }
        continue;
      }
      const plano = normalizarBusqueda(caracter);
      visible += caracter;
      normal += plano.length === 1 ? plano : caracter.toLocaleLowerCase()[0];
      origen.push({ nodo, indice });
      enEspacio = false;
    }
  }
  return { visible, normal, origen };
}
