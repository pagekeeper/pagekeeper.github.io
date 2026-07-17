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
  constructor({ area, contenedor, alCambiarPagina }) {
    this.area = area;             // contenedor con scroll (#area-lectura)
    this.contenedor = contenedor; // donde se colocan las páginas (#contenedor-pagina)
    this.alCambiarPagina = alCambiarPagina;

    this.documento = null;
    this.pagina = 1;
    this.zoom = 1; // multiplicador sobre "ajustar al ancho"
    this.modo = 'pagina';

    this.lienzo = null;    // canvas único (modo página)
    this.paginas = [];     // envoltorios por número de página (modo continuo)
    this.observador = null;
    this.tareaRender = null;
    this.pendiente = null;

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
  }

  get totalPaginas() {
    return this.documento?.numPages ?? 0;
  }

  async abrir(datos, paginaInicial = 1, modo = this.modo) {
    if (this.documento) { try { await this.documento.destroy(); } catch { /* ignorar */ } }
    this.documento = await pdfjs.getDocument({ data: datos }).promise;
    this.modo = modo;
    this.zoom = 1;
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

  // ───────────────────────── Montaje según el modo ─────────────────────────

  limpiar() {
    if (this.observador) { this.observador.disconnect(); this.observador = null; }
    this.contenedor.replaceChildren();
    this.contenedor.classList.remove('continuo');
    this.paginas = [];
    this.lienzo = null;
    this.pendiente = null;
  }

  async montar() {
    this.limpiar();
    if (this.modo === 'continuo') await this.montarContinuo();
    else await this.montarPagina();
    this.alCambiarPagina?.(this.pagina, this.totalPaginas);
  }

  async montarPagina() {
    this.lienzo = document.createElement('canvas');
    this.contenedor.append(this.lienzo);
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
      envoltorio.className = 'pagina-continua';
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
    await this.renderContinuo(this.pagina);
    this.paginas[this.pagina].scrollIntoView({ block: 'start' });
  }

  // ───────────────────────── Renderizado ─────────────────────────

  // Modo página: un único canvas; el último renderizado solicitado gana.
  async renderUnica(numero) {
    this.pendiente = numero;
    if (this.tareaRender) return;
    while (this.pendiente !== null) {
      const n = this.pendiente;
      this.pendiente = null;
      this.tareaRender = this.pintar(n, this.lienzo);
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
      await this.pintar(numero, lienzo);
      envoltorio.style.height = ''; // ajusta al alto real de la página
      envoltorio.replaceChildren(lienzo);
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
    lienzo.style.width = `${Math.floor(vista.width)}px`;
    lienzo.style.height = `${Math.floor(vista.height)}px`;

    await pagina.render({
      canvasContext: lienzo.getContext('2d'),
      viewport: vista,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
    }).promise;
  }

  // Determina qué página ocupa la parte superior de la vista y avisa si cambia.
  detectarPaginaVisible() {
    if (!this.documento || this.modo !== 'continuo') return;
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
