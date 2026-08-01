// Lector de EPUB basado en epub.js.
//
// Las librerías (JSZip y epub.js, en vendor/) se cargan bajo demanda la
// primera vez que se abre un EPUB, para no penalizar la lectura de PDF.
// epub.js incluye las correcciones oficiales posteriores a 0.3.93, conserva
// visibles los capítulos vecinos y tolera el píxel de redondeo con el que el
// navegador puede confundir la penúltima página con el final del capítulo.
//
// Fórmulas matemáticas: si el capítulo trae MathML y el navegador lo dibuja
// bien de forma nativa, no se hace nada. Si trae LaTeX (\(...\), $$...$$), o
// el navegador no entiende MathML, o lo entiende pero no tiene fuente
// matemática (el caso de Android), se inyecta MathJax (salida SVG, sin red)
// dentro del capítulo.
//
// La posición de lectura se expresa con un CFI (identificador estándar de
// posición en EPUB) más un porcentaje aproximado del libro.

import { posicionVerticalLibre } from './posicion-notas.js';
import { abrePorRaton } from './menu-contextual.js';
import { rangoDeFrase, textoDesdeLaVista } from './seguimiento-voz.js';
import { posicionTrasReflujo } from './reflujo-epub.js';
import { detectarIdioma, idiomaUtil } from './idioma-texto.js';
import {
  columnasEfectivas, normalizarColumnas, normalizarLetrasPorLinea, LETRAS_INICIALES,
} from './columnas.js';

const RUTA_MATHJAX = new URL('../vendor/mathjax-tex-mml-svg.js', import.meta.url).href;
const RUTA_CONFIG_MATHJAX = new URL('./mathjax-config.js', import.meta.url).href;

const ELEMENTOS_ACTIVOS = 'script, iframe, frame, object, embed, applet';
const ATRIBUTOS_URL = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'data']);

// Rellenos de la paleta de resaltado. Las anotaciones sin color (anteriores
// a la paleta) conservan su aspecto histórico: amarillo, o azul con nota.
// El resaltado de la frase que se está leyendo en voz alta: naranja, distinto
// de la paleta de resaltados para no confundirlo con uno guardado.
const RELLENO_VOZ = '#fb923c';

const RELLENOS_RESALTADO = {
  amarillo: '#facc15',
  verde: '#4ade80',
  azul: '#38bdf8',
  rosa: '#f472b6',
};

// Caracteres que se meten en cada localización al repartir el libro. Es lo
// que se le pasa a locations.generate(), y también lo que permite estimar el
// tamaño del libro en caracteres a partir del número de localizaciones.
const CARACTERES_POR_LOCALIZACION = 1000;

// Cuánto se defiende la posición recién restaurada de los reajustes de tamaño
// que llegan justo después de abrir (ver «Asentamiento tras abrir»).
const MS_ASENTAMIENTO = 2000;

// Cuánto manda el punto de lectura guardado antes de un cambio de tamaño
// sobre lo que diga epub.js (ver «Cambios de tamaño»). Da margen a que se
// encadenen varios reajustes, como al arrastrar el borde de la ventana.
const MS_ANCLA_REFLUJO = 1500;

// Los capítulos muy cortos (una portada, una dedicatoria, un título suelto)
// llenan una pantalla con cuatro palabras: como muestra para medir cuánto
// texto cabe en la pantalla mienten mucho, así que no cuentan.
const CARACTERES_MINIMOS_MUESTRA = 500;

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

// ¿Dibuja este navegador el MathML lo bastante bien como para dejárselo?
// Entenderlo no basta: Chrome en Android trae MathML Core, pero el sistema no
// incluye ninguna fuente con tablas MATH, así que los corchetes de las
// matrices no se estiran y las raíces salen sin trazo. Se comprueba midiendo:
// un corchete estirable junto a un hueco muy alto: si crece con él, hay fuente
// matemática; si se queda del tamaño de una letra, hace falta MathJax.
const NS_MATHML = 'http://www.w3.org/1998/Math/MathML';

export function mathmlSeVeBien(contents) {
  if (typeof contents.window?.MathMLElement !== 'function') return false;

  const doc = contents.document;
  if (!doc?.body) return false;
  const crear = (nombre) => doc.createElementNS(NS_MATHML, nombre);
  const formula = crear('math');
  const fila = crear('mrow');
  const corchete = crear('mo');
  corchete.setAttribute('stretchy', 'true');
  corchete.textContent = '[';
  const hueco = crear('mspace');
  hueco.setAttribute('height', '3em');
  hueco.setAttribute('depth', '3em');
  fila.append(corchete, hueco, crear('mo'));
  formula.append(fila);
  const caja = doc.createElement('div');
  caja.setAttribute('style', 'position:absolute;left:-9999px;top:0;visibility:hidden');
  caja.append(formula);
  doc.body.append(caja);
  const alto = corchete.getBoundingClientRect().height;
  const referencia = hueco.getBoundingClientRect().height;
  caja.remove();

  // Sin medidas (capítulo aún sin dibujar) se prefiere MathJax: se ve bien en
  // cualquier caso, y lo único que cuesta es cargarlo sin necesidad.
  if (!referencia) return false;
  return alto > referencia / 2;
}

export function inyectarMathJax(contents) {
  const doc = contents.document;
  const hayMathML = !!doc.querySelector('math');
  const texto = doc.body?.textContent ?? '';
  const hayLatex = /\\\(|\\\[|\$\$/.test(texto);
  if (!hayMathML && !hayLatex) return;
  // MathML puro que el navegador dibuja bien: no hace falta MathJax.
  if (!hayLatex && mathmlSeVeBien(contents)) return;

  const nonce = doc.documentElement.dataset.pagekeeperScriptNonce;
  if (!nonce) return;
  if (!hayLatex) doc.documentElement.dataset.pagekeeperSoloMathml = '1';

  // Una fórmula más ancha que la columna se cortaría por la mitad al paginar
  // (en el móvil eso deja las matrices grandes a medias). El dibujo de MathJax
  // es un SVG con proporciones propias, así que basta con dejarle encoger.
  // El contenedor de MathJax pide tanto ancho como la fórmula, y una que no
  // cabe en la columna se cortaría al paginar. Ajustarle el ancho al hueco
  // disponible es cosa del propio MathJax, que mide el dibujo ya hecho; aquí
  // solo se quita el suelo que impediría encogerlo.
  const estilo = doc.createElement('style');
  estilo.textContent = 'mjx-container { max-width: 100% !important; min-width: 0 !important; }';
  doc.head.append(estilo);

  // Los dos por src y en orden: el capítulo va en un iframe «srcdoc», que
  // hereda también la política de la página, y esa no conoce el nonce de aquí,
  // así que un script escrito dentro quedaría bloqueado. Ambos son del mismo
  // origen, que las dos políticas admiten.
  //
  // async = false porque un script insertado a mano se carga asíncrono por
  // omisión, y entonces MathJax podría arrancar antes que su configuración.
  const config = doc.createElement('script');
  config.setAttribute('nonce', nonce);
  config.async = false;
  config.src = RUTA_CONFIG_MATHJAX;
  doc.head.append(config);
  const script = doc.createElement('script');
  script.setAttribute('nonce', nonce);
  script.async = false;
  script.src = RUTA_MATHJAX;
  doc.head.append(script);
}

// Papel y tinta de cada tema, que son los mismos de la aplicación: el libro se
// lee con la luz que tiene puesta todo lo demás. Con la pareja del sepia el
// texto queda en 9,2:1, de sobra por encima del mínimo.
// El papel de cada tema. Los oscuros se marcan porque, además del fondo, hay
// que imponer el color del texto: el que trae el libro está pensado para papel
// blanco y sobre estos fondos no se lee.
const COLORES_PAGINA = {
  claro: { texto: '#1f2937', fondo: '#ffffff' },
  sepia: { texto: '#4b3a2a', fondo: '#f4ecd8' },
  oscuro: { texto: '#e2e8f0', fondo: '#171f2e', oscuro: true },
  negro: { texto: '#d6dbe3', fondo: '#000000', oscuro: true },
};

// Antes de imponer una alineación hay que saber qué partes del capítulo estaban
// alineadas a un lado a propósito (títulos, versos, pies de imagen, la firma de
// una carta): esas se dejan como están. No se puede distinguir en CSS, así que
// se pregunta al navegador por el estilo ya calculado y se marca con un
// atributo. Se hace una sola vez por capítulo, y antes de escribir nuestra hoja:
// una segunda pasada leería nuestro propio !important y lo marcaría todo.
function marcarAlineadosAMano(doc) {
  const ventana = doc?.defaultView;
  if (!ventana || !doc.body || doc.body.dataset.pkAlineadosMarcados) return;
  for (const elemento of doc.body.querySelectorAll('*')) {
    const alineacion = ventana.getComputedStyle(elemento).textAlign;
    if (alineacion === 'center' || alineacion === 'right' || alineacion === 'end') {
      elemento.dataset.pkAlineado = '';
    }
  }
  doc.body.dataset.pkAlineadosMarcados = '1';
}

export class LectorEpub {
  constructor({ contenedor, alCambiarPosicion, alTeclear, alPulsarEnlaceInterno, alPulsarContenido,
    alSeleccionarTexto, alCambiarSeleccion, alPulsarAnotacion, alGestionarAnotacion,
    alMostrarNota, alOcultarNota,
    alPartirFrase,
    etiquetaOpcionesNota, alTocar, alMenuContextual, alCambiarPantallas }) {
    this.contenedor = contenedor;
    this.alCambiarPosicion = alCambiarPosicion;
    this.alCambiarPantallas = alCambiarPantallas;
    this.alTeclear = alTeclear;
    this.alPulsarEnlaceInterno = alPulsarEnlaceInterno;
    this.alPulsarContenido = alPulsarContenido;
    this.alSeleccionarTexto = alSeleccionarTexto;
    this.alCambiarSeleccion = alCambiarSeleccion;
    this.alPulsarAnotacion = alPulsarAnotacion;
    this.alGestionarAnotacion = alGestionarAnotacion;
    this.alMostrarNota = alMostrarNota;
    this.alOcultarNota = alOcultarNota;
    this.alPartirFrase = alPartirFrase;
    this.etiquetaOpcionesNota = etiquetaOpcionesNota;
    this.alTocar = alTocar;
    this.alMenuContextual = alMenuContextual;

    this.libro = null;   // objeto Book de epub.js
    this.vista = null;   // objeto Rendition de epub.js
    this.modo = 'pagina';
    this.columnas = 'auto'; // 'auto' o el número elegido (ver columnas.js)
    this.letrasPorLinea = LETRAS_INICIALES; // largo máximo de línea en automático
    this.tamano = 100;   // tamaño de letra en %
    this.fuente = 'libro';     // 'libro' | 'serif' | 'sans'
    this.interlineado = null;  // null = el del libro; número = factor (1.5…)
    this.alineacion = 'libro'; // 'libro' | 'izquierda' | 'justificada'
    this.guionado = 'auto';    // 'auto' | 'libro' | 'nunca'
    this.idiomaDeducido = null; // solo si el libro no declara uno que sirva
    this.temaPagina = 'claro';
    this.cfi = null;
    this.porcentaje = 0;
    this.conLocalizaciones = false;
    // Pantallas de este dispositivo (ver «Pantallas del dispositivo»).
    this.pantallaCapitulo = 0;
    this.pantallasCapitulo = 0;
    this.muestrasPantalla = new Map(); // sección → { caracteres, pantallas }
    this.tempPantallas = null;
    this.anotaciones = [];
    this.cfiAplicados = [];
    this.cfiVoz = null; // frase que la voz está leyendo, resaltada aparte
    this.movimientoVoz = 0; // cuándo movió la página el seguimiento de la voz
    this.rangosNotas = new WeakMap();
    this.notaBajoPuntero = null;
    this.cancelarEsperaUbicacion = null;
    this.destinoProtegido = null; // ver protegerDestino()
    this.tempDestinoProtegido = null;
    this.anclaReflujo = null; // ver «Cambios de tamaño»
    this.tempAnclaReflujo = null;

    // epub.js solo se entera de los cambios de tamaño de la ventana; al abrir
    // o cerrar la barra lateral cambia el contenedor, así que se le avisa.
    let tempResize;
    let medida = '';
    new ResizeObserver(() => {
      // El punto de lectura se apunta en el primer aviso del cambio, no
      // cuando vence el retardo: epub.js también escucha el resize de la
      // ventana por su cuenta y para entonces ya ha repaginado, así que la
      // posición ya sería la de la paginación nueva (ver anclarReflujo).
      this.anclarReflujo();
      clearTimeout(tempResize);
      tempResize = setTimeout(() => {
        const nueva = `${this.contenedor.clientWidth}x${this.contenedor.clientHeight}`;
        if (!this.vista || nueva === medida) return;
        medida = nueva;
        try { this.vista.resize(); } catch { /* vista a medio montar */ }
        if (this.destinoProtegido) this.recuperarDestinoProtegido();
        else this.recolocarTrasReflujo();
        // Después de que esos dos hayan hecho lo suyo (van a 150 ms), por si
        // ninguno tuvo que mover nada y la tira quedó a mitad de paso.
        setTimeout(() => this.enderezarColumnas(), 400);
        this.programarIconosNotas();
        // Otro ancho (girar el móvil, abrir el índice) es otra paginación.
        this.remedirPantallas();
      }, 200);
    }).observe(this.contenedor);
  }

  // 'localizaciones' es el reparto del libro calculado en una sesión anterior
  // (lo que devolvió alGuardarLocalizaciones); reutilizarlo evita repetir un
  // cálculo de varios segundos cada vez que se abre el libro.
  async abrir(datos, cfiInicial = null, modo = 'pagina',
    { localizaciones = null, alGuardarLocalizaciones = null, temaPagina = this.temaPagina } = {}) {
    await cargarLibrerias();
    this.cerrar();
    this.modo = modo;
    // El papel y la tinta deben estar fijados antes de que epub.js muestre el
    // CFI guardado. Aplicarlos después remaqueta el capítulo y puede emitir
    // una reubicación tardía al inicio de la página visual; la aplicación la
    // confundiría con un avance real y sustituiría el progreso recién leído.
    this.aplicarTemaPagina(temaPagina);
    this.cfi = cfiInicial;
    this.porcentaje = 0;
    this.conLocalizaciones = false;
    this.idiomaDeducido = null;
    this.muestrasPantalla.clear();
    this.pantallaCapitulo = 0;
    this.pantallasCapitulo = 0;

    const libro = window.ePub(datos.buffer ?? datos);
    this.libro = libro;
    await libro.ready;
    // Una apertura puede haber sustituido a esta mientras el EPUB terminaba
    // de prepararse. Sus tareas atrasadas no deben montar nada sobre el libro
    // nuevo ni recuperar la posición de la sesión anterior.
    if (this.libro !== libro) return;
    libro.spine.hooks.content.register(sanitizarDocumentoEpub);
    if (localizaciones) {
      try {
        const cargadas = libro.locations.load(localizaciones);
        this.conLocalizaciones = Array.isArray(cargadas) && cargadas.length > 1;
      } catch { /* caché ilegible: se recalcula abajo */ }
    }
    await this.montar(cfiInicial);
    if (this.libro !== libro) return;

    // Las localizaciones permiten calcular el % del libro; se generan en
    // segundo plano porque en libros grandes tardan unos segundos.
    if (this.conLocalizaciones) {
      this.notificar();
      return;
    }
    libro.locations.generate(1000).then(() => {
      // `cerrar()` y una reapertura pueden ocurrir antes de que acabe este
      // cálculo. Comprobar solo que haya algún libro confundía el recién
      // abierto con el que inició la tarea.
      if (this.libro !== libro) return;
      this.conLocalizaciones = true;
      this.notificar();
      try { alGuardarLocalizaciones?.(libro.locations.save()); } catch { /* sin caché */ }
    }).catch(() => null);
  }

  async montar(posicion) {
    this.contenedor.replaceChildren();
    const continuo = this.modo === 'continuo';
    const libro = this.libro;
    const esperasUbicacion = [];
    const esperarUbicacion = () => new Promise((resolver) => esperasUbicacion.push(resolver));
    const completarUbicacion = () => esperasUbicacion.shift()?.();
    this.cancelarEsperaUbicacion = () => {
      while (esperasUbicacion.length) esperasUbicacion.shift()();
    };
    const vista = libro.renderTo(this.contenedor, {
      width: '100%',
      height: '100%',
      flow: continuo ? 'scrolled' : 'paginated',
      // En continuo, el gestor 'continuous' hace el scroll dentro del
      // contenedor (fullsize:false); el gestor por defecto delega en el
      // scroll de la página, que aquí no existe porque el contenedor es fijo.
      ...(continuo ? { manager: 'continuous', fullsize: false } : {}),
      // El reparto en columnas lo decide imponerColumnas(), no epub.js: su
      // 'auto' solo sabe de una o dos, y aquí puede haber más.
      spread: 'none',
      allowScriptedContent: true,
    });
    this.vista = vista;
    // El reparto en columnas no existe hasta que epub.js arranca su gestor de
    // vistas; hasta entonces `vista.layout` es todavía el método que lo crea.
    if (!continuo) vista.started?.then(() => this.imponerColumnas(vista), () => {});
    vista.hooks.content.register(inyectarMathJax);
    vista.hooks.content.register((contents) => this.inyectarTipografia(contents));
    vista.hooks.content.register((contents) => this.inyectarPapel(contents));
    vista.hooks.content.register((contents) => this.registrarInteraccionesNotas(contents));
    // Los enlaces internos del libro (notas al pie, índice propio) los salta
    // epub.js por su cuenta; se avisa antes del salto con la posición actual
    // para que quede apuntada en el historial de navegación.
    vista.hooks.content.register((contents) => {
      contents.on('linkClicked', () => this.alPulsarEnlaceInterno?.(this.cfi));
    });
    this.aplicarTemas();
    vista.on('relocated', (lugar) => {
      // destroy() no cancela necesariamente los eventos que epub.js ya dejó
      // en cola. Si entretanto se abrió otra vista, este CFI es obsoleto.
      if (this.vista !== vista || this.libro !== libro) {
        completarUbicacion();
        return;
      }
      if (lugar?.start?.cfi) this.cfi = this.posicionTrasElReflujo(lugar);
      this.notificar();
      completarUbicacion();
      this.ocultarNotaHover();
      this.programarIconosNotas();
    });
    vista.on('resized', () => {
      if (this.vista === vista) this.programarIconosNotas();
    });
    // Las teclas pulsadas dentro del capítulo (iframe) no llegan al
    // documento principal: se reenvían para mantener los atajos.
    vista.on('keydown', (evento) => {
      if (this.vista === vista) this.alTeclear?.(evento);
    });
    // Con los clics pasa lo mismo: se avisa (con el evento) para que la app
    // pueda cerrar sus paneles o alternar el modo inmersivo.
    vista.on('click', (evento) => {
      if (this.vista === vista) this.alPulsarContenido?.(evento);
    });
    vista.on('selected', (cfi, contents) => {
      if (this.vista !== vista) return;
      const texto = contents?.window?.getSelection?.().toString().replace(/\s+/g, ' ').trim();
      if (cfi && texto) this.alSeleccionarTexto?.({ formato: 'epub', cfi, texto });
    });
    const primeraUbicacion = posicion ? esperarUbicacion() : null;
    this.protegerDestino(posicion);
    await vista.display(posicion ?? undefined);
    if (this.vista !== vista || this.libro !== libro) return;
    // epub.js resuelve display(CFI) antes de emitir `relocated`. La aplicación
    // mantiene protegida la restauración mientras `abrir()` no haya terminado:
    // esperar aquí evita que ese evento tardío se guarde como una lectura nueva.
    if (primeraUbicacion) await primeraUbicacion;
    if (this.vista !== vista || this.libro !== libro) return;
    if (continuo && posicion) {
      // El gestor continuo rellena el espacio visible después de situar el
      // destino. Al añadir capítulos antes del actual puede desplazar el
      // contenedor y dejarlo en otra parte del capítulo. Con las vistas ya
      // estabilizadas, un segundo display recoloca exactamente el CFI.
      const ubicacionEstable = esperarUbicacion();
      await vista.display(posicion);
      if (this.vista !== vista || this.libro !== libro) return;
      await ubicacionEstable;
    }
    this.cancelarEsperaUbicacion = null;
    if (this.vista !== vista || this.libro !== libro) return;
    this.aplicarAnotaciones();
  }

  // ───────────── Asentamiento tras abrir ─────────────
  //
  // Nada más abrir un libro el contenedor todavía cambia de alto un par de
  // veces (se pinta la barra de estado, aparece el aviso de «continuando»…).
  // Cada cambio hace que epub.js repagine y vuelva a mostrar la pantalla por
  // el CFI que la encabeza, y ese CFI apunta al principio del párrafo, no al
  // punto por el que se partió: como el párrafo casi siempre viene cortado de
  // la pantalla anterior, el libro retrocede una página en cada reajuste. Se
  // recuerda el destino que se pidió restaurar y se vuelve a él mientras dura
  // ese asentamiento; después manda la posición real, que ya es la del lector.
  protegerDestino(cfi) {
    clearTimeout(this.tempDestinoProtegido);
    // Moverse por el libro (pasar página, saltar a una nota) deja sin sentido
    // el ancla del reajuste anterior: la posición nueva la manda quien lee.
    clearTimeout(this.tempAnclaReflujo);
    this.anclaReflujo = null;
    this.destinoProtegido = cfi ?? null;
    if (!cfi) return;
    this.tempDestinoProtegido = setTimeout(() => {
      this.destinoProtegido = null;
    }, MS_ASENTAMIENTO);
  }

  recuperarDestinoProtegido() {
    if (!this.destinoProtegido) return;
    const destino = this.destinoProtegido;
    // epub.js repagina y recoloca por su cuenta después del reajuste, así que
    // hay que dejarle terminar antes de mirar dónde ha quedado la página. Si
    // el destino sigue a la vista no se toca nada: volver a mostrarlo movería
    // la posición al principio de la pantalla sin necesidad.
    setTimeout(() => {
      if (this.destinoProtegido !== destino || this.cfiVisible(destino)) return;
      try { this.vista?.display(destino); } catch { /* destino ilegible */ }
    }, 150);
  }

  // ───────────── Cambios de tamaño ─────────────
  //
  // Repaginar corta las páginas por otros sitios y la lectura se iba hacia
  // atrás en cada reajuste; el porqué está en reflujo-epub.js. Aquí se guarda
  // el punto de lectura antes de tocar nada, para que mande él mientras dura
  // el cambio de tamaño: si el reflujo lo deja fuera de la página se vuelve a
  // él, y si sigue viéndose es él quien se apunta como posición.
  anclarReflujo() {
    clearTimeout(this.tempAnclaReflujo);
    this.anclaReflujo ??= this.destinoProtegido ?? this.cfi;
    // Pasado el reajuste vuelve a mandar la posición real: si no, un ancla
    // olvidada congelaría el progreso de la lectura que viene después.
    this.tempAnclaReflujo = setTimeout(() => {
      this.anclaReflujo = null;
    }, MS_ANCLA_REFLUJO);
  }

  // Repaginar deja a veces la tira de columnas a mitad de paso: se ve el final
  // de una columna por la izquierda y el principio de otra por la derecha, con
  // el texto cortado a los dos lados. Pasa cuando el ancho cambia sin que
  // cambie de columna la posición —abrir el índice con dos columnas y la letra
  // grande es el caso claro—: como el punto de lectura sigue a la vista, nadie
  // mueve el scroll, que se quedó cuadrado al paso de antes.
  //
  // Volver a mostrar la posición es lo que lo endereza: epub.js la deja al
  // principio de la pantalla y el scroll cae por fuerza en una columna entera.
  // Si no hubiera posición que mostrar, se recorta hacia atrás, que enseña algo
  // ya leído en vez de medio renglón.
  enderezarColumnas() {
    const marco = this.contenedor.querySelector('.epub-container');
    const paso = marco?.clientWidth;
    if (!paso) return;
    const sobra = Math.round(marco.scrollLeft) % paso;
    if (!sobra) return;
    const destino = this.anclaReflujo ?? this.destinoProtegido ?? this.cfi;
    if (destino) {
      try {
        this.vista?.display(destino);
        return;
      } catch { /* destino ilegible: se endereza a mano */ }
    }
    marco.scrollLeft -= sobra;
  }

  recolocarTrasReflujo() {
    const ancla = this.anclaReflujo;
    if (!ancla) return;
    const vista = this.vista;
    // epub.js recoloca por su cuenta después de repaginar; hay que dejarle
    // terminar, o esta corrección quedaría pisada por la suya.
    setTimeout(() => {
      if (this.vista !== vista || this.destinoProtegido) return;
      if (this.anclaReflujo !== ancla || this.cfiVisible(ancla)) return;
      try { vista.display(ancla); } catch { /* destino ilegible */ }
    }, 150);
  }

  // El comparador de CFI lo trae epub.js, así que la decisión vive en su
  // módulo (reflujo-epub.js) y aquí solo se le acerca la herramienta.
  posicionTrasElReflujo(lugar) {
    return posicionTrasReflujo(lugar?.start?.cfi, lugar?.end?.cfi,
      this.anclaReflujo, (a, b) => new window.ePub.CFI().compare(a, b));
  }

  // ───────────── Pantallas del dispositivo ─────────────
  //
  // Un EPUB no tiene páginas: las hace el aparato. epub.js reparte cada
  // capítulo en columnas del ancho de la pantalla, así que sabe en cuántas
  // cabe el capítulo abierto (displayed.total). Contando además sus
  // caracteres sale cuánto texto entra en una pantalla aquí, con esta letra y
  // este margen; aplicado al libro entero (que las localizaciones miden en
  // caracteres) da una estimación de cuántas pantallas tiene en este
  // dispositivo. Es aproximada a propósito: un capítulo con muchas imágenes o
  // versos ocupa más pantallas por carácter que uno de prosa, y la media se
  // afina sola según se van visitando capítulos.
  //
  // Todo esto cambia al tocar el tamaño de letra, el interlineado, el margen
  // o al girar el móvil, así que entonces las muestras se tiran y se remide.

  // Pantalla del libro por la que se va, contando desde 1. Sale del
  // porcentaje, que es la única posición comparable entre capítulos.
  get pantallaLibro() {
    const total = this.pantallasLibro;
    if (!total) return 0;
    return Math.min(total, Math.floor((this.porcentaje / 100) * total) + 1);
  }

  get pantallasLibro() {
    if (!this.conLocalizaciones || this.modo !== 'pagina') return 0;
    const localizaciones = this.libro?.locations?.total ?? 0;
    return estimarPantallas(this.muestrasPantalla.values(),
      localizaciones * CARACTERES_POR_LOCALIZACION);
  }

  // Mide el capítulo visible. Devuelve si había algo que medir: en modo
  // continuo no hay columnas y no se cuentan pantallas.
  medirPantallas() {
    if (this.modo !== 'pagina') {
      this.pantallaCapitulo = 0;
      this.pantallasCapitulo = 0;
      return false;
    }
    const lugar = this.vista?.currentLocation?.();
    const inicio = lugar?.start;
    const columnas = inicio?.displayed?.total;
    const columna = inicio?.displayed?.page;
    if (!Number.isFinite(columnas) || !Number.isFinite(columna) || columnas < 1) return false;
    // Cada pantalla enseña tantas columnas como diga el reparto en vigor; el
    // dato de epub.js solo distingue una de dos, y aquí puede haber más.
    const divisor = this.vista?.manager?.layout?.divisor;
    const porPantalla = Number.isFinite(divisor) && divisor >= 1
      ? divisor
      : (lugar.end?.displayed?.page > columna ? 2 : 1);
    this.pantallasCapitulo = Math.ceil(columnas / porPantalla);
    this.pantallaCapitulo = Math.min(this.pantallasCapitulo, Math.ceil(columna / porPantalla));
    if (this.muestrasPantalla.has(inicio.index)) return true;
    const contenidos = this.vista?.getContents?.() ?? [];
    const contents = contenidos.find((c) => c.sectionIndex === inicio.index);
    const caracteres = contents?.document?.body?.textContent?.length ?? 0;
    if (caracteres >= CARACTERES_MINIMOS_MUESTRA) {
      this.muestrasPantalla.set(inicio.index, { caracteres, pantallas: this.pantallasCapitulo });
    }
    return true;
  }

  // Tras cambiar la letra, el margen o el tamaño de la ventana, lo medido ya
  // no vale. La cuenta nueva espera a que epub.js termine de repaginar, que
  // no avisa de ello con ningún evento propio.
  remedirPantallas() {
    this.muestrasPantalla.clear();
    clearTimeout(this.tempPantallas);
    this.tempPantallas = setTimeout(() => {
      if (this.medirPantallas()) this.alCambiarPantallas?.();
    }, 350);
  }

  notificar() {
    this.medirPantallas();
    if (this.conLocalizaciones && this.cfi) {
      try {
        // Con un decimal: en un libro de 400 localizaciones, pasar varias
        // páginas mueve décimas, y redondeando a entero parecía que la lectura
        // se quedaba clavada en el mismo número durante minutos. Más de un
        // decimal no aporta nada legible ni medible.
        const fraccion = this.libro.locations.percentageFromCfi(this.cfi);
        this.porcentaje = Math.round(fraccion * 1000) / 10;
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
    for (const contents of this.vista.getContents?.() ?? []) this.inyectarPapel(contents);
  }

  // El override de epub.js llega al <body> y nada más, así que un libro que
  // fije los colores en sus propias reglas (p, div…) gana por especificidad:
  // el texto se quedaba negro sobre el fondo del tema oscuro, ilegible. Esta
  // hoja fuerza el papel en todo el capítulo. Los fondos propios se apagan
  // para que se vea el del papel; el color del texto solo se impone en los
  // temas oscuros, que es cuando el del libro no vale, y los enlaces se libran
  // porque tienen el suyo. Con el tema claro no se toca nada: allí los del libro se
  // ven como su autor los puso.
  inyectarPapel(contents) {
    const doc = contents?.document;
    if (!doc?.head) return;
    let estilo = doc.getElementById('pagekeeper-papel');
    if (!estilo) {
      estilo = doc.createElement('style');
      estilo.id = 'pagekeeper-papel';
      doc.head.append(estilo);
    }
    const { texto, fondo } = COLORES_PAGINA[this.temaPagina];
    const reglas = [];
    if (this.temaPagina !== 'claro') {
      reglas.push(`html, body { background: ${fondo} !important; }`);
      // Las imágenes y los dibujos (fórmulas incluidas) conservan el suyo.
      reglas.push('body :not(img, svg, svg *) { background-color: transparent !important; }');
    }
    if (COLORES_PAGINA[this.temaPagina].oscuro) {
      reglas.push(`body, body :not(a, a *) { color: ${texto} !important; }`);
    }
    estilo.textContent = reglas.join('\n');
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

  // El texto del libro vive dentro de un iframe, que se queda los toques: sin
  // esto, el gesto de pasar página arrastrando nunca llegaría a la aplicación.
  // Las coordenadas se pasan a las de la ventana de fuera, que es donde se
  // miden los recorridos.
  registrarToques(contents) {
    const doc = contents?.document;
    const marco = contents?.window?.frameElement;
    if (!doc || !this.alTocar) return;
    const reenviar = (tipo) => (evento) => {
      const caja = marco?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const fuera = (toque) => (toque ? {
        x: toque.clientX + caja.left, y: toque.clientY + caja.top,
      } : null);
      const lista = [...evento.touches].map(fuera);
      const principal = lista[0] ?? fuera(evento.changedTouches[0]) ?? { x: 0, y: 0 };
      this.alTocar({
        tipo,
        toques: evento.touches.length,
        x: principal.x,
        y: principal.y,
        // Los dos primeros dedos, que es lo que mide un pellizco.
        puntos: lista.slice(0, 2),
        evitar: () => { if (evento.cancelable) evento.preventDefault(); },
      });
    };
    doc.addEventListener('touchstart', reenviar('inicio'), { passive: true });
    doc.addEventListener('touchmove', reenviar('mueve'), { passive: false });
    doc.addEventListener('touchend', reenviar('fin'), { passive: true });
    doc.addEventListener('touchcancel', reenviar('cancela'), { passive: true });
  }

  registrarInteraccionesNotas(contents) {
    const doc = contents?.document;
    if (!doc) return;
    this.registrarToques(contents);
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
    // epub.js avisa de la selección con `selected`, pero no de que se deshaga,
    // y la selección vive dentro del iframe: el documento de fuera no se entera.
    doc.addEventListener('selectionchange', () => this.alCambiarSeleccion?.());
    // Y el `pointerup` porque hay toques que deshacen la selección sin que el
    // navegador llegue a emitir `selectionchange`.
    doc.addEventListener('pointerup', () => this.alCambiarSeleccion?.());
    // El botón derecho sobre el texto del capítulo se queda dentro del iframe:
    // se reenvía con las coordenadas ya trasladadas al documento de fuera.
    doc.addEventListener('contextmenu', (evento) => {
      if (!this.alMenuContextual || !abrePorRaton(evento)) return;
      if (doc.getSelection?.()?.toString().trim()) return;
      evento.preventDefault();
      const marco = doc.defaultView?.frameElement?.getBoundingClientRect();
      this.alMenuContextual({
        x: evento.clientX + (marco?.left ?? 0),
        y: evento.clientY + (marco?.top ?? 0),
      });
    });
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
    // Con las columnas en automático, la letra decide cuántas caben: al
    // agrandarla hay que rehacer el reparto, que epub.js no revisa por su
    // cuenta porque para él el ancho de la pantalla no ha cambiado.
    if (this.columnas === 'auto' && this.modo !== 'continuo') {
      try { this.vista?.manager?.updateLayout(); } catch { /* vista a medio montar */ }
    }
    this.reajustarFormulas();
    this.programarIconosNotas();
    this.remedirPantallas();
  }

  // Las fórmulas dibujadas por MathJax crecen con la letra, pero llevan puesto
  // un tope en píxeles para no salirse de la columna; con la letra nueva ese
  // tope sobra o se queda corto, así que se recalcula. Se espera al reparto en
  // columnas, que es lo que fija el ancho disponible.
  reajustarFormulas() {
    for (const contents of this.vista?.getContents?.() ?? []) {
      const ventana = contents.window;
      if (!ventana?.pagekeeperAjustarFormulas) continue;
      ventana.requestAnimationFrame?.(() => ventana.pagekeeperAjustarFormulas?.());
      // El repaginado de epub.js no es inmediato: una segunda pasada, ya con
      // las columnas rehechas, es la que deja el ancho definitivo.
      setTimeout(() => ventana.pagekeeperAjustarFormulas?.(), 300);
    }
  }

  // ───────────── Ajustes tipográficos (fuente e interlineado) ─────────────

  // Inserta (o actualiza) en el capítulo una hoja de estilos con la fuente y
  // el interlineado elegidos. Se usa una hoja con !important en lugar de los
  // overrides de epub.js porque el CSS del libro suele fijar la fuente en
  // p/div y ganaría a un estilo en línea del body.
  inyectarTipografia(contents) {
    const doc = contents?.document;
    if (!doc?.head) return;
    this.asegurarIdioma(doc);
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
    // Partir palabras es cosa del navegador, no del libro: con `hyphens: auto`
    // parte aunque su CSS no lo pidiera, y con `manual` deja de partir aunque
    // lo pida (los guiones suaves que traiga escritos siguen valiendo). Se
    // respetan el código y las fórmulas, como con la fuente.
    if (this.guionado !== 'libro') {
      const modo = this.guionado === 'nunca' ? 'manual' : 'auto';
      const salvados = 'pre, pre *, code, code *, kbd, samp, var, tt, math, math *';
      reglas.push(`body :not(${salvados}) { hyphens: ${modo} !important; -webkit-hyphens: ${modo} !important; }`);
    }
    if (this.alineacion !== 'libro') {
      // 'start' (en vez de 'left') respeta los idiomas RTL. No basta con p/li:
      // los EPUB convertidos con Calibre meten el texto en <div> con su
      // alineación puesta a mano, así que la regla tiene que alcanzar a
      // cualquier elemento. Lo que el libro alineó a un lado a propósito
      // —títulos, versos, pies de imagen— se marca antes y queda fuera.
      const alineado = this.alineacion === 'izquierda' ? 'start' : 'justify';
      marcarAlineadosAMano(doc);
      const salvados = '[data-pk-alineado], [data-pk-alineado] *, pre, pre *, code, code *, table, table *, math, math *';
      reglas.push(`body, body :not(${salvados}) { text-align: ${alineado} !important; }`);
    }
    estilo.textContent = reglas.join('\n');
  }

  // El guionado automático necesita saber en qué idioma está el texto: sin
  // `lang` el navegador no tiene diccionario y no parte nada. Muchos EPUB no lo
  // ponen en el capítulo, pero sí en sus metadatos, así que se copia de ahí.
  //
  // Y hay libros que declaran «UND» (indeterminado) o dejan el campo con
  // cualquier cosa: eso es peor que no declarar nada, porque el navegador se
  // queda igual de mudo pero ya no se ve por qué. En esos casos se deduce el
  // idioma del texto y se pone el que salga, en el capítulo y en los siguientes
  // —dentro de un libro no cambia, y así se mira una vez.
  asegurarIdioma(doc) {
    const raiz = doc?.documentElement;
    if (!raiz) return;
    const puesto = raiz.getAttribute('lang') || raiz.getAttribute('xml:lang');
    if (idiomaUtil(puesto)) return;

    const declarado = this.libro?.packaging?.metadata?.language;
    const idioma = idiomaUtil(declarado)
      ? declarado
      : (this.idiomaDeducido ??= detectarIdioma(doc.body?.textContent ?? ''));
    if (!idioma) return;
    raiz.setAttribute('lang', idioma);
  }

  cambiarGuionado(valor) {
    this.guionado = ['auto', 'libro', 'nunca'].includes(valor) ? valor : 'auto';
    this.aplicarTipografia();
  }

  aplicarTipografia() {
    for (const contents of this.vista?.getContents() ?? []) {
      this.inyectarTipografia(contents);
    }
    this.programarIconosNotas();
    this.remedirPantallas();
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
    this.alineacion = ['izquierda', 'justificada'].includes(valor) ? valor : 'libro';
    this.aplicarTipografia();
  }

  async cambiarModo(modo) {
    if (modo === this.modo || !this.libro) return;
    this.modo = modo;
    this.muestrasPantalla.clear();
    this.desmontarVista();
    await this.montar(this.cfi);
  }

  // El largo de línea solo cambia el reparto cuando las columnas van en
  // automático; con un número puesto a mano no pinta nada, y rehacer la
  // paginación para nada movería el punto de lectura.
  cambiarLetrasPorLinea(valor) {
    const nuevo = normalizarLetrasPorLinea(valor);
    if (nuevo === this.letrasPorLinea) return;
    this.letrasPorLinea = nuevo;
    if (this.columnas !== 'auto' || this.modo === 'continuo') return;
    try { this.vista?.manager?.updateLayout(); } catch { /* vista a medio montar */ }
    this.remedirPantallas();
  }

  async cambiarColumnas(valor) {
    valor = normalizarColumnas(valor);
    if (valor === this.columnas) return;
    this.columnas = valor;
    if (!this.libro) return;
    // Otro reparto es otra paginación: lo medido antes ya no vale.
    this.muestrasPantalla.clear();
    this.desmontarVista();
    await this.montar(this.cfi);
  }

  // Cuántas columnas caben ahora mismo. El tamaño de letra del capítulo no se
  // consulta al documento: epub.js lo aplica como porcentaje sobre los 16 px
  // de base del navegador, así que sale de la cuenta y evita depender de que
  // haya un capítulo montado.
  columnasAhora(ancho = this.contenedor.clientWidth, hueco = 0) {
    return columnasEfectivas(this.columnas, ancho, 16 * (this.tamano / 100),
      hueco, this.letrasPorLinea);
  }

  // epub.js solo sabe repartir el capítulo en una o dos columnas: su clase
  // Layout calcula un 'divisor' que vale 1, o 2 si la pantalla es ancha y se
  // pidió doble página. Todo lo demás —el ancho de columna, el paso al pasar
  // página, el mapa de posiciones— ya está escrito en función de ese divisor,
  // así que basta con rehacer la cuenta con el número que toque y avisar del
  // cambio como hace el original. Se envuelve el método en lugar de tocar la
  // librería para no salir de vendor/ con un parche que habría que reponer en
  // cada actualización.
  imponerColumnas(vista) {
    if (this.vista !== vista) return; // la vista ya no está en pantalla
    const reparto = vista?.manager?.layout;
    if (typeof reparto?.calculate !== 'function' || reparto.calculoOriginal) return;
    const original = reparto.calculate.bind(reparto);
    reparto.calculoOriginal = original;
    reparto.calculate = (ancho, alto, hueco) => {
      original(ancho, alto, hueco);
      const columnas = this.columnasAhora(ancho, reparto.gap);
      if (columnas < 2) return; // una columna es justo lo que ya calculó
      const gap = reparto.gap;
      const columnWidth = ancho / columnas - gap;
      const medidas = {
        width: ancho, height: alto, columnWidth, gap,
        pageWidth: columnWidth + gap,
        spreadWidth: columnWidth * columnas + gap,
        delta: ancho, divisor: columnas,
      };
      Object.assign(reparto, medidas);
      reparto.update(medidas);
    };
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
    if (cfi) return this.irA(cfi);
  }

  // Moverse a mano cancela la defensa del destino restaurado: a partir de
  // aquí la posición buena es la nueva, no la que se abrió.
  siguiente() { this.protegerDestino(null); this.vista?.next(); }
  anterior() { this.protegerDestino(null); this.vista?.prev(); }

  // Piezas para deslizar la página con el dedo. epub.js reparte el capítulo
  // entero en columnas dentro de una tira más ancha que la pantalla, y pasa
  // página moviendo el marco que la recorta: las páginas vecinas de ese
  // capítulo ya están dibujadas, así que el gesto puede descubrirlas de
  // verdad. Devuelve la tira y a qué lados hay vecina; en los bordes del
  // capítulo no hay ninguna, porque el siguiente vive en otro documento que
  // todavía no está montado.
  tiraDeColumnas() {
    if (this.modo === 'continuo') return null;
    const marco = this.contenedor.querySelector('.epub-container');
    const tira = this.contenedor.querySelector('.epub-view');
    if (!marco || !tira || !marco.clientWidth) return null;
    return {
      tira,
      paso: marco.clientWidth,
      antes: marco.scrollLeft > 1,
      despues: marco.scrollLeft + marco.clientWidth < marco.scrollWidth - 1,
    };
  }

  // ───────────── Apoyo a la lectura en voz alta ─────────────

  // Texto desde la posición visible hasta el final del capítulo actual.
  // Con varios capítulos montados a la vez se busca el que corresponde a la
  // sección de la posición actual, no el primero de la lista.
  //
  // `desdeLaVista` empieza por la primera frase que se ve entera. Se usa al
  // arrancar la lectura: en continuo, el CFI de la posición señala el nodo que
  // el borde superior corta, y sin esto la voz arrancaba por una frase que ya
  // había quedado por encima de la pantalla. Al encadenar capítulos no se
  // aplica: allí hay que leer desde el principio, y la vista puede estar
  // todavía desplazándose.
  textoDesdePosicion({ desdeLaVista = false } = {}) {
    const contents = this.contenidoActual();
    const doc = contents?.document;
    if (!doc?.body) return '';
    if (desdeLaVista && this.modo === 'continuo') {
      const borde = this.bordeVisible(doc);
      const texto = borde === null ? '' : textoDesdeLaVista(doc.body, borde);
      if (texto.trim()) return texto.replace(/\s+/g, ' ').trim();
    }
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

  // Resalta la frase que suena y, si ha quedado en otra página, pasa a ella:
  // así la vista acompaña a la voz en vez de esperar el salto de capítulo.
  // `desde` es donde acabó la frase anterior; devuelve ese punto para la
  // siguiente, o null si no se pudo localizar.
  async seguirVoz(frase, desde = 0) {
    const contents = this.contenidoActual();
    const doc = contents?.document;
    if (!doc?.body) return null;
    const encontrado = rangoDeFrase(doc.body, frase, desde);
    if (!encontrado) {
      this.limpiarVoz();
      return null;
    }
    let cfi = null;
    try { cfi = contents.cfiFromRange(encontrado.rango); } catch { /* sin CFI no hay marca */ }
    if (cfi) {
      this.marcarVoz(cfi);
      // En continuo la vista acompaña a la voz con un desplazamiento suave;
      // paginado no hay scroll que valga: hay que pasar de página.
      if (this.modo === 'continuo') this.acercarVoz(doc, encontrado.rango);
      else if (!this.cfiVisible(cfi)) await this.irAVoz(cfi);
      // La frase empieza aquí pero acaba en la página siguiente. Quien la
      // escucha se queda mirando un trozo hasta que termina, así que se avisa
      // de por dónde se parte para pasar de página mientras suena. Una
      // fracción de cero es que no se ve nada de la frase, y entonces el CFI
      // decía otra cosa: ahí no se toca la vista, como hasta ahora.
      else {
        const visible = this.fraccionVisible(encontrado.rango, doc);
        if (visible > 0.02 && visible < 0.98) this.alPartirFrase?.(visible);
      }
    }
    return encontrado.fin;
  }

  // Deja marcada esta frase y solo esta. Antes de pintar se retira también la
  // marca de la misma posición, si la hubiera: epub.js guarda las anotaciones
  // por CFI, así que dos «highlight» del mismo sitio dejan una que el «remove»
  // siguiente ya no alcanza, y esa se quedaba encendida para siempre.
  marcarVoz(cfi) {
    this.limpiarVoz();
    this.quitarMarcaVoz(cfi);
    try {
      this.vista.annotations.highlight(cfi, {}, null, 'pagekeeper-voz',
        { fill: RELLENO_VOZ, 'fill-opacity': '0.38', 'mix-blend-mode': 'multiply' });
      this.cfiVoz = cfi;
    } catch { /* un CFI que epub.js no acepta: se sigue leyendo sin marca */ }
  }

  quitarMarcaVoz(cfi) {
    if (!cfi) return;
    try { this.vista?.annotations?.remove(cfi, 'highlight'); } catch { /* ya no está */ }
  }

  // El capítulo por el que se va, que con varios montados a la vez no es
  // necesariamente el primero de la lista.
  contenidoActual() {
    const indice = this.vista?.currentLocation()?.start?.index;
    const contenidos = this.vista?.getContents?.() ?? [];
    return contenidos.find((c) => c.sectionIndex === indice) ?? contenidos[0] ?? null;
  }

  // ¿La posición cae dentro de lo que se ve ahora mismo? Se compara con los
  // CFI de la propia localización de epub.js, que sabe dónde empieza y acaba
  // la página, en vez de medir geometrías dentro del iframe.
  cfiVisible(cfi) {
    const localizacion = this.vista?.currentLocation();
    const inicio = localizacion?.start?.cfi;
    const fin = localizacion?.end?.cfi ?? inicio;
    if (!cfi || !inicio) return false;
    try {
      const comparador = new window.ePub.CFI();
      return comparador.compare(cfi, inicio) >= 0 && comparador.compare(cfi, fin) <= 0;
    } catch {
      return false;
    }
  }

  // Qué parte de un tramo de texto cabe en la página que se ve, de 0 a 1.
  //
  // El capítulo entero se compone en una tira de columnas dentro del iframe,
  // que es tan ancho como esa tira; lo que se ve es la ventana que el marco
  // recorta. Así que la ventana se traslada a las coordenadas del capítulo
  // (restando dónde ha quedado el marco del iframe) y se mira qué líneas del
  // tramo caen dentro. Las líneas reparten el texto casi como los caracteres,
  // que es lo que hace falta para saber por dónde se parte la frase.
  fraccionVisible(rango, doc) {
    const marco = doc?.defaultView?.frameElement;
    const area = (this.areaDesplazable() ?? this.contenedor)?.getBoundingClientRect();
    if (!marco || !area) return 1;
    const caja = marco.getBoundingClientRect();
    const izquierda = area.left - caja.left;
    const derecha = area.right - caja.left;
    let total = 0;
    let dentro = 0;
    for (const linea of rango.getClientRects()) {
      if (!linea.width) continue;
      total += linea.width;
      if (linea.left >= izquierda - 1 && linea.right <= derecha + 1) dentro += linea.width;
    }
    return total ? dentro / total : 1;
  }

  // Pasa de página sin que la lectura en voz alta lo tome por una navegación
  // a mano (que la detendría): el movimiento queda apuntado como suyo.
  async pasarPaginaPorVoz() {
    this.movimientoVoz = Date.now();
    const cfi = this.cfiVoz;
    try {
      await this.siguiente();
      // La página nueva puede llevarse por delante el resaltado de la frase,
      // que sigue sonando: se rehace sobre el trozo que ahora se ve.
      if (cfi && this.cfiVoz === cfi) this.marcarVoz(cfi);
    } finally {
      this.movimientoVoz = Date.now();
    }
  }

  // El elemento que desplaza el texto en modo continuo: el contenedor que
  // monta epub.js dentro del nuestro (con fullsize:false el scroll es suyo).
  areaDesplazable() {
    return this.vista?.manager?.container ?? null;
  }

  // Dónde cae el borde superior de lo que se ve dentro del capítulo, en las
  // coordenadas de sus propios rectángulos: el capítulo vive en un iframe que
  // no tiene scroll propio, así que basta con restar la posición del marco.
  bordeVisible(doc) {
    const marco = doc?.defaultView?.frameElement;
    const area = this.areaDesplazable() ?? this.contenedor;
    if (!marco || !area) return null;
    return area.getBoundingClientRect().top - marco.getBoundingClientRect().top;
  }

  // Trae la frase que suena si se ha salido por abajo, desplazando el texto
  // poco a poco en vez de saltar: mientras se vea entera no se toca nada.
  acercarVoz(doc, rango) {
    const marco = doc?.defaultView?.frameElement;
    const area = this.areaDesplazable();
    if (!marco || !area) return;
    const caja = rango.getBoundingClientRect();
    const vista = area.getBoundingClientRect();
    if (!caja.height || !vista.height) return;
    const arriba = marco.getBoundingClientRect().top + caja.top;
    const abajo = arriba + caja.height;
    if (arriba >= vista.top - 1 && abajo <= vista.bottom - 4) return;
    // La frase queda cerca del borde de arriba, con aire suficiente para no
    // pegarla al filo pero dejando a la vista lo que viene detrás.
    const margen = Math.min(vista.height * 0.2, 120);
    this.movimientoVoz = Date.now();
    area.scrollTo({
      top: area.scrollTop + (arriba - vista.top) - margen,
      behavior: 'smooth',
    });
  }

  async irAVoz(cfi) {
    this.movimientoVoz = Date.now();
    try {
      await this.vista.display(cfi);
      // Montar la página nueva puede llevarse el resaltado por delante, así que
      // se rehace; marcarVoz() se encarga de que siga habiendo uno solo.
      if (this.cfiVoz === cfi) this.marcarVoz(cfi);
    } catch { /* un CFI que no se puede mostrar no debe cortar la lectura */ } finally {
      // Se vuelve a marcar al terminar: entre medias epub.js sigue reubicando.
      this.movimientoVoz = Date.now();
    }
  }

  limpiarVoz() {
    this.quitarMarcaVoz(this.cfiVoz);
    this.cfiVoz = null;
    // Red de seguridad: si alguna marca se quedó suelta (una anotación que
    // epub.js ya no relaciona con su CFI), se retira del dibujo.
    for (const marca of this.contenedor?.querySelectorAll('.pagekeeper-voz') ?? []) {
      marca.remove();
    }
  }

  irA(destino) {
    this.protegerDestino(null);
    return this.vista?.display(destino);
  }

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
    clearTimeout(this.tempPantallas);
    // Un ancla del libro anterior no debe decidir nada en el que venga.
    clearTimeout(this.tempAnclaReflujo);
    this.anclaReflujo = null;
    this.cancelarEsperaUbicacion?.();
    this.cancelarEsperaUbicacion = null;
    this.pantallaCapitulo = 0;
    this.pantallasCapitulo = 0;
    this.muestrasPantalla.clear();
    this.desmontarVista();
    try { this.libro?.destroy(); } catch { /* ya destruido */ }
    this.libro = null;
    this.anotaciones = [];
    this.contenedor.replaceChildren();
  }
}

// Pantallas que ocuparía un libro de 'caracteresLibro' caracteres al ritmo de
// las muestras tomadas (capítulos ya vistos con esta letra y este ancho). Se
// suman los caracteres y las pantallas de todas ellas en lugar de promediar
// sus cocientes: así un capítulo largo pesa más que uno de dos párrafos, que
// es justo lo que se quiere.
export function estimarPantallas(muestras, caracteresLibro) {
  let caracteres = 0;
  let pantallas = 0;
  for (const muestra of muestras) {
    caracteres += muestra.caracteres;
    pantallas += muestra.pantallas;
  }
  if (!caracteres || !pantallas || !caracteresLibro) return 0;
  return Math.max(1, Math.round(caracteresLibro / (caracteres / pantallas)));
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
