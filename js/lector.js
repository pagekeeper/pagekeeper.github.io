// Renderizado y navegación del PDF con PDF.js.

import * as pdfjs from '../vendor/pdf.min.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.min.js', import.meta.url).href;

export class Lector {
  constructor({ lienzo, contenedor, alCambiarPagina }) {
    this.lienzo = lienzo;
    this.contenedor = contenedor;
    this.alCambiarPagina = alCambiarPagina;
    this.documento = null;
    this.pagina = 1;
    this.zoom = 1; // multiplicador sobre "ajustar al ancho"
    this.renderizando = null;

    let temporizador;
    window.addEventListener('resize', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => this.renderizar(), 150);
    });
  }

  async abrir(datos, paginaInicial = 1) {
    if (this.documento) await this.documento.destroy();
    this.documento = await pdfjs.getDocument({ data: datos }).promise;
    this.zoom = 1;
    await this.irA(Math.min(Math.max(1, paginaInicial), this.documento.numPages));
  }

  get totalPaginas() {
    return this.documento?.numPages ?? 0;
  }

  async irA(numero) {
    if (!this.documento) return;
    this.pagina = Math.min(Math.max(1, numero), this.documento.numPages);
    await this.renderizar();
    this.contenedor.scrollTop = 0;
    this.alCambiarPagina?.(this.pagina, this.documento.numPages);
  }

  anterior() { return this.irA(this.pagina - 1); }
  siguiente() { return this.irA(this.pagina + 1); }

  async cambiarZoom(factor) {
    this.zoom = Math.min(4, Math.max(0.5, this.zoom * factor));
    await this.renderizar();
  }

  async renderizar() {
    if (!this.documento) return;
    // Evita renderizados simultáneos: el último gana.
    this.pendiente = this.pagina;
    if (this.renderizando) return;

    while (this.pendiente !== null) {
      const numero = this.pendiente;
      this.pendiente = null;
      this.renderizando = this.pintarPagina(numero);
      await this.renderizando.catch(() => {});
      this.renderizando = null;
    }
  }

  async pintarPagina(numero) {
    const paginaPdf = await this.documento.getPage(numero);
    const anchoDisponible = this.contenedor.clientWidth - 16; // padding
    const vistaBase = paginaPdf.getViewport({ scale: 1 });
    const escala = (anchoDisponible / vistaBase.width) * this.zoom;
    const vista = paginaPdf.getViewport({ scale: escala });

    const dpr = window.devicePixelRatio || 1;
    this.lienzo.width = Math.floor(vista.width * dpr);
    this.lienzo.height = Math.floor(vista.height * dpr);
    this.lienzo.style.width = `${Math.floor(vista.width)}px`;
    this.lienzo.style.height = `${Math.floor(vista.height)}px`;

    const contexto = this.lienzo.getContext('2d');
    await paginaPdf.render({
      canvasContext: contexto,
      viewport: vista,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
    }).promise;
  }
}
