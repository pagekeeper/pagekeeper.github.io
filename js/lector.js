// Renderizado y navegación del PDF con PDF.js.
//
// Dos modos de lectura:
//  - 'pagina': una página cada vez, como un libro (ideal en móvil/tablet).
//  - 'continuo': todas las páginas apiladas con scroll vertical (ideal en
//    ordenador). Las páginas se renderizan de forma perezosa según se acercan
//    a la vista, para que los PDF grandes no se atasquen.

import * as pdfjs from '../vendor/pdf.min.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.min.js', import.meta.url).href;

export class Lector {
  constructor({ area, contenedor, alCambiarPagina, alPulsarEnlaceInterno, alSeleccionarTexto }) {
    this.area = area;             // contenedor con scroll (#area-lectura)
    this.contenedor = contenedor; // donde se colocan las páginas (#contenedor-pagina)
    this.alCambiarPagina = alCambiarPagina;
    this.alPulsarEnlaceInterno = alPulsarEnlaceInterno;
    this.alSeleccionarTexto = alSeleccionarTexto;

    this.documento = null;
    this.pagina = 1;
    this.zoom = 1; // multiplicador sobre "ajustar al ancho"
    this.modo = 'pagina';

    this.lienzo = null;    // canvas único (modo página)
    this.envoltorio = null; // página única: canvas + capas de texto y enlaces
    this.paginas = [];     // envoltorios por número de página (modo continuo)
    this.observador = null;
    this.tareaRender = null;
    this.pendiente = null;
    this.anotaciones = [];

    let tempResize;
    window.addEventListener('resize', () => {
      clearTimeout(tempResize);
      tempResize = setTimeout(() => { if (this.documento) this.montar(); }, 200);
    });

    let esperandoFrame = false;
    this.area.addEventListener('scroll', () => {
      if (this.modo !== 'continuo' || esperandoFrame) return;
      esperandoFrame = true;
      requestAnimationFrame(() => { esperandoFrame = false; this.detectarPaginaVisible(); });
    }, { passive: true });

    const capturar = () => requestAnimationFrame(() => this.capturarSeleccion());
    this.area.addEventListener('mouseup', capturar);
    this.area.addEventListener('touchend', capturar, { passive: true });
  }

  get totalPaginas() {
    return this.documento?.numPages ?? 0;
  }

  async abrir(datos, paginaInicial = 1, modo = this.modo, zoom = 1) {
    if (this.documento) { try { await this.documento.destroy(); } catch { /* ignorar */ } }
    this.documento = await pdfjs.getDocument({ data: datos }).promise;
    this.modo = modo;
    this.zoom = Math.min(4, Math.max(0.5, zoom));
    this.pagina = Math.min(Math.max(1, paginaInicial), this.documento.numPages);
    await this.montar();
  }

  async cambiarModo(modo) {
    if (modo === this.modo) return;
    this.modo = modo;
    if (this.documento) await this.montar();
  }

  async cambiarZoom(factor) {
    this.zoom = Math.min(4, Math.max(0.5, this.zoom * factor));
    if (this.documento) await this.montar();
  }

  async irA(numero) {
    if (!this.documento) return;
    this.pagina = Math.min(Math.max(1, numero), this.totalPaginas);
    if (this.modo === 'continuo') {
      const envoltorio = this.paginas[this.pagina];
      if (envoltorio) {
        await this.renderContinuo(this.pagina);
        envoltorio.scrollIntoView({ block: 'start' });
      }
    } else {
      await this.renderUnica(this.pagina);
      this.area.scrollTop = 0;
    }
    this.alCambiarPagina?.(this.pagina, this.totalPaginas);
  }

  anterior() { return this.irA(this.pagina - 1); }
  siguiente() { return this.irA(this.pagina + 1); }

  async buscar(consulta) {
    if (!this.documento) return [];
    const buscado = normalizarBusqueda(consulta.trim());
    if (!buscado) return [];
    const resultados = [];
    for (let numero = 1; numero <= this.totalPaginas && resultados.length < 200; numero++) {
      const pagina = await this.documento.getPage(numero);
      const contenido = await pagina.getTextContent();
      const texto = contenido.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
      const minusculas = normalizarBusqueda(texto);
      let posicion = 0;
      while ((posicion = minusculas.indexOf(buscado, posicion)) !== -1 && resultados.length < 200) {
        resultados.push({ destino: numero, numero, fragmento: fragmentoBusqueda(texto, posicion, buscado.length) });
        posicion += Math.max(1, buscado.length);
      }
    }
    return resultados;
  }

  // Convierte los marcadores jerárquicos del PDF en una lista navegable.
  async indice() {
    if (!this.documento) return [];
    const esquema = await this.documento.getOutline();
    if (!esquema?.length) return [];

    const plano = [];
    const recorrer = (elementos, nivel = 0) => {
      for (const elemento of elementos ?? []) {
        plano.push({ titulo: elemento.title?.trim() ?? '', referencia: elemento.dest, nivel });
        recorrer(elemento.items, nivel + 1);
      }
    };
    recorrer(esquema);

    const resueltos = await Promise.all(plano.map(async (entrada) => {
      try {
        const numero = await this.paginaDeDestino(entrada.referencia);
        if (numero === null || !entrada.titulo) return null;
        return { titulo: entrada.titulo, destino: numero, numero, nivel: entrada.nivel };
      } catch {
        return null; // algunos PDF contienen marcadores rotos o externos
      }
    }));
    const entradas = resueltos.filter(Boolean);
    if (!entradas.some((entrada) => entrada.destino === 1)) {
      entradas.unshift({ esInicio: true, destino: 1, numero: 1, nivel: 0 });
    }
    return entradas;
  }

  // Traduce un destino interno del PDF (referencia de esquema o de enlace)
  // al número de página, o null si no se puede resolver.
  async paginaDeDestino(referencia) {
    const destino = typeof referencia === 'string'
      ? await this.documento.getDestination(referencia)
      : referencia;
    const referenciaPagina = destino?.[0];
    const indicePagina = Number.isInteger(referenciaPagina)
      ? referenciaPagina
      : await this.documento.getPageIndex(referenciaPagina);
    return Number.isInteger(indicePagina) ? indicePagina + 1 : null;
  }

  // ───────────────────────── Montaje según el modo ─────────────────────────

  limpiar() {
    if (this.observador) { this.observador.disconnect(); this.observador = null; }
    this.contenedor.replaceChildren();
    this.contenedor.classList.remove('continuo');
    this.paginas = [];
    this.lienzo = null;
    this.envoltorio = null;
    this.pendiente = null;
  }

  async montar() {
    // Mientras se remonta (zoom, cambio de modo, resize), el scroll provocado
    // por vaciar el contenedor no debe redetectar la página: pisaría la
    // actual con la primera antes de que scrollIntoView la restaure.
    this.montando = true;
    try {
      this.limpiar();
      if (this.modo === 'continuo') await this.montarContinuo();
      else await this.montarPagina();
    } finally {
      this.montando = false;
    }
    this.alCambiarPagina?.(this.pagina, this.totalPaginas);
  }

  async montarPagina() {
    this.lienzo = document.createElement('canvas');
    this.envoltorio = document.createElement('div');
    this.envoltorio.className = 'pagina-pdf';
    this.envoltorio.dataset.num = String(this.pagina);
    this.envoltorio.append(this.lienzo);
    this.contenedor.append(this.envoltorio);
    await this.renderUnica(this.pagina);
    this.area.scrollTop = 0;
  }

  async montarContinuo() {
    this.contenedor.classList.add('continuo');

    // Tamaño de referencia (a partir de la primera página) para los huecos
    // reservados de las páginas aún no renderizadas.
    const primera = await this.documento.getPage(1);
    const ancho = this.area.clientWidth - 16;
    const base = primera.getViewport({ scale: 1 });
    const escala = (ancho / base.width) * this.zoom;
    const vista = primera.getViewport({ scale: escala });

    for (let n = 1; n <= this.totalPaginas; n++) {
      const envoltorio = document.createElement('div');
      envoltorio.className = 'pagina-pdf pagina-continua';
      envoltorio.dataset.num = String(n);
      envoltorio.style.width = `${Math.floor(vista.width)}px`;
      envoltorio.style.height = `${Math.floor(vista.height)}px`;
      this.contenedor.append(envoltorio);
      this.paginas[n] = envoltorio;
    }

    this.observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) this.renderContinuo(Number(entrada.target.dataset.num));
      }
    }, { root: this.area, rootMargin: '800px 0px' });
    for (let n = 1; n <= this.totalPaginas; n++) this.observador.observe(this.paginas[n]);

    // Renderiza y desplaza a la página inicial antes de ceder el control.
    // Se captura en una constante: this.pagina podría cambiar durante el await.
    const destino = this.pagina;
    await this.renderContinuo(destino);
    this.paginas[destino].scrollIntoView({ block: 'start' });
    this.pagina = destino;
  }

  // ───────────────────────── Renderizado ─────────────────────────

  // Modo página: un único canvas; el último renderizado solicitado gana.
  async renderUnica(numero) {
    this.pendiente = numero;
    if (this.tareaRender) return;
    while (this.pendiente !== null) {
      const n = this.pendiente;
      this.pendiente = null;
      this.tareaRender = (async () => {
        const { pagina, vista } = await this.pintar(n, this.lienzo);
        // Las capas solo se montan para el último render solicitado.
        if (this.pendiente === null && this.envoltorio) {
          await this.montarCapas(this.envoltorio, pagina, vista);
        }
      })();
      await this.tareaRender.catch(() => {});
      this.tareaRender = null;
    }
  }

  // Modo continuo: renderiza la página en su envoltorio una sola vez.
  async renderContinuo(numero) {
    const envoltorio = this.paginas[numero];
    if (!envoltorio || envoltorio.dataset.estado) return; // en curso o ya listo
    envoltorio.dataset.estado = 'render';
    const lienzo = document.createElement('canvas');
    try {
      const { pagina, vista } = await this.pintar(numero, lienzo);
      envoltorio.style.height = ''; // ajusta al alto real de la página
      envoltorio.replaceChildren(lienzo);
      await this.montarCapas(envoltorio, pagina, vista);
      envoltorio.dataset.estado = 'listo';
    } catch {
      delete envoltorio.dataset.estado; // se reintentará al volver a entrar en vista
    }
  }

  async pintar(numero, lienzo) {
    const pagina = await this.documento.getPage(numero);
    const anchoDisponible = this.area.clientWidth - 16;
    const base = pagina.getViewport({ scale: 1 });
    const escala = (anchoDisponible / base.width) * this.zoom;
    const vista = pagina.getViewport({ scale: escala });

    const dpr = window.devicePixelRatio || 1;
    lienzo.width = Math.floor(vista.width * dpr);
    lienzo.height = Math.floor(vista.height * dpr);
    // Solo se fija el ancho: el alto sigue a la proporción intrínseca del
    // canvas, así ningún límite de CSS puede deformar la página.
    lienzo.style.width = `${Math.floor(vista.width)}px`;
    lienzo.style.height = 'auto';

    await pagina.render({
      canvasContext: lienzo.getContext('2d'),
      viewport: vista,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
    }).promise;
    return { pagina, vista };
  }

  // ─────────────── Capas de texto y enlaces sobre el canvas ───────────────

  // Superpone al canvas el texto seleccionable (TextLayer de PDF.js) y los
  // enlaces del PDF. Los tamaños de la capa de texto dependen de la variable
  // CSS --scale-factor, que debe reflejar la escala del viewport.
  async montarCapas(envoltorio, pagina, vista) {
    for (const capa of envoltorio.querySelectorAll('.capa-texto, .capa-enlaces, .capa-resaltados')) capa.remove();
    envoltorio.style.setProperty('--scale-factor', String(vista.scale));

    const capaTexto = document.createElement('div');
    capaTexto.className = 'capa-texto';
    envoltorio.append(capaTexto);
    try {
      await new pdfjs.TextLayer({
        textContentSource: pagina.streamTextContent(),
        container: capaTexto,
        viewport: vista,
      }).render();
    } catch {
      capaTexto.remove(); // sin capa de texto la página sigue siendo legible
    }
    this.montarResaltados(envoltorio, pagina.pageNumber);
    await this.montarEnlaces(envoltorio, pagina, vista);
  }

  mostrarAnotaciones(anotaciones) {
    this.anotaciones = Array.isArray(anotaciones) ? anotaciones : [];
    const envoltorios = this.modo === 'continuo'
      ? this.paginas.filter(Boolean)
      : (this.envoltorio ? [this.envoltorio] : []);
    for (const envoltorio of envoltorios) {
      if (envoltorio.dataset.estado && envoltorio.dataset.estado !== 'listo') continue;
      envoltorio.querySelector('.capa-resaltados')?.remove();
      this.montarResaltados(envoltorio, Number(envoltorio.dataset.num));
    }
  }

  montarResaltados(envoltorio, numero) {
    const entradas = this.anotaciones.flatMap((anotacion) =>
      (anotacion.paginas ?? []).filter((pagina) => pagina.pagina === numero)
        .map((pagina) => ({ anotacion, pagina })));
    if (!entradas.length) return;
    const capa = document.createElement('div');
    capa.className = 'capa-resaltados';
    for (const { anotacion, pagina } of entradas) {
      for (const rectangulo of pagina.rectangulos ?? []) {
        const marca = document.createElement('span');
        marca.dataset.anotacion = anotacion.id;
        marca.style.left = `${rectangulo.x * 100}%`;
        marca.style.top = `${rectangulo.y * 100}%`;
        marca.style.width = `${rectangulo.ancho * 100}%`;
        marca.style.height = `${rectangulo.alto * 100}%`;
        capa.append(marca);
      }
    }
    // Debajo de la capa de texto para no impedir nuevas selecciones.
    envoltorio.insertBefore(capa, envoltorio.querySelector('.capa-texto, .capa-enlaces'));
  }

  capturarSeleccion() {
    const seleccion = window.getSelection();
    if (!seleccion || seleccion.isCollapsed || !seleccion.rangeCount) return;
    const texto = seleccion.toString().replace(/\s+/g, ' ').trim();
    if (!texto) return;
    const rango = seleccion.getRangeAt(0);
    const nodo = rango.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? rango.commonAncestorContainer
      : rango.commonAncestorContainer.parentElement;
    if (!nodo || !this.contenedor.contains(nodo)) return;

    const rectangulos = [...rango.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
    const paginas = [];
    for (const envoltorio of this.contenedor.querySelectorAll('.pagina-pdf')) {
      const base = envoltorio.getBoundingClientRect();
      const enPagina = [];
      for (const rect of rectangulos) {
        const izquierda = Math.max(rect.left, base.left);
        const derecha = Math.min(rect.right, base.right);
        const arriba = Math.max(rect.top, base.top);
        const abajo = Math.min(rect.bottom, base.bottom);
        if (derecha <= izquierda || abajo <= arriba) continue;
        enPagina.push({
          x: (izquierda - base.left) / base.width,
          y: (arriba - base.top) / base.height,
          ancho: (derecha - izquierda) / base.width,
          alto: (abajo - arriba) / base.height,
        });
      }
      if (enPagina.length) paginas.push({
        pagina: Number(envoltorio.dataset.num) || this.pagina,
        rectangulos: enPagina,
      });
    }
    if (paginas.length) this.alSeleccionarTexto?.({ formato: 'pdf', texto, paginas });
  }

  // Vuelve clicables los enlaces del PDF: los externos abren en otra pestaña
  // y los internos saltan a su página a través de alPulsarEnlaceInterno.
  async montarEnlaces(envoltorio, pagina, vista) {
    let anotaciones = [];
    try {
      anotaciones = await pagina.getAnnotations({ intent: 'display' });
    } catch {
      return; // anotaciones ilegibles: la página queda sin enlaces
    }
    const enlaces = anotaciones.filter((anotacion) =>
      anotacion.subtype === 'Link' && (anotacion.url || anotacion.dest));
    if (!enlaces.length) return;

    const capa = document.createElement('div');
    capa.className = 'capa-enlaces';
    for (const anotacion of enlaces) {
      const [x1, y1, x2, y2] = pdfjs.Util.normalizeRect(
        vista.convertToViewportRectangle(anotacion.rect));
      const enlace = document.createElement('a');
      enlace.style.left = `${x1}px`;
      enlace.style.top = `${y1}px`;
      enlace.style.width = `${x2 - x1}px`;
      enlace.style.height = `${y2 - y1}px`;
      if (anotacion.url) {
        enlace.href = anotacion.url;
        enlace.target = '_blank';
        enlace.rel = 'noopener';
        enlace.title = anotacion.url;
      } else {
        enlace.href = '#';
        enlace.addEventListener('click', async (evento) => {
          evento.preventDefault();
          const destino = await this.paginaDeDestino(anotacion.dest).catch(() => null);
          if (destino !== null) this.alPulsarEnlaceInterno?.(destino);
        });
      }
      capa.append(enlace);
    }
    envoltorio.append(capa);
  }

  // Determina qué página ocupa la parte superior de la vista y avisa si cambia.
  detectarPaginaVisible() {
    if (!this.documento || this.modo !== 'continuo' || this.montando) return;
    const rectArea = this.area.getBoundingClientRect();
    const linea = this.area.clientHeight * 0.25;
    let visible = 1;
    for (let n = 1; n <= this.totalPaginas; n++) {
      const rect = this.paginas[n].getBoundingClientRect();
      if (rect.top - rectArea.top <= linea) visible = n;
      else break;
    }
    if (visible !== this.pagina) {
      this.pagina = visible;
      this.alCambiarPagina?.(this.pagina, this.totalPaginas);
    }
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
