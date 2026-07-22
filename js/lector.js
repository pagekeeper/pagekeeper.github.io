// Renderizado y navegación del PDF con PDF.js.
//
// Dos modos de lectura:
//  - 'pagina': una página cada vez, como un libro (ideal en móvil/tablet).
//  - 'continuo': todas las páginas apiladas con scroll vertical (ideal en
//    ordenador). Las páginas se renderizan de forma perezosa según se acercan
//    a la vista, para que los PDF grandes no se atasquen.

import * as pdfjs from '../vendor/pdf.min.js';
import { posicionVerticalLibre } from './posicion-notas.js';
import {
  cajaDeContenido, cajaRepresentativa, unir, conAire, ajustarRecorte, paginasAMuestrear,
} from './recorte.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.min.js', import.meta.url).href;

// Páginas renderizadas que se conservan a la vez en modo continuo. Cada una
// ocupa un canvas del tamaño de la pantalla (por el devicePixelRatio), así que
// un documento largo recorrido entero agotaría la memoria del dispositivo.
const MAXIMO_PAGINAS_MEMORIA = 20;
// Distancia mínima a la vista para poder soltar una página. Debe superar el
// rootMargin del observador: si no, se liberaría una página que este sigue
// considerando visible y no volvería a pintarse hasta salir y entrar de nuevo.
const MARGEN_LIBERACION = 1000;
// Páginas pintadas que se guardan en modo página: la actual (o las dos de la
// vista doble), las vecinas adelantadas y unas pocas recién visitadas, para
// que ir y volver no vuelva a pintar nada.
const MAXIMO_PAGINAS_PREPARADAS = 8;
// Ancho al que se dibuja cada página para buscarle los márgenes: basta con
// distinguir dónde hay tinta, y así analizar el documento cuesta muy poco.
const ANCHO_ANALISIS = 200;

export class Lector {
  constructor({ area, contenedor, alCambiarPagina, alPulsarEnlaceInterno, alSeleccionarTexto,
    alPulsarAnotacion, alGestionarAnotacion, alMostrarNota, alOcultarNota, etiquetaOpcionesNota,
    solicitarContrasena }) {
    this.area = area;             // contenedor con scroll (#area-lectura)
    this.contenedor = contenedor; // donde se colocan las páginas (#contenedor-pagina)
    this.alCambiarPagina = alCambiarPagina;
    this.alPulsarEnlaceInterno = alPulsarEnlaceInterno;
    this.alSeleccionarTexto = alSeleccionarTexto;
    this.alPulsarAnotacion = alPulsarAnotacion;
    this.alGestionarAnotacion = alGestionarAnotacion;
    this.alMostrarNota = alMostrarNota;
    this.alOcultarNota = alOcultarNota;
    this.etiquetaOpcionesNota = etiquetaOpcionesNota;
    this.solicitarContrasena = solicitarContrasena;

    this.documento = null;
    this.pagina = 1;
    this.zoom = 1; // multiplicador sobre "ajustar al ancho"
    this.ajuste = 'ancho'; // 'ancho', 'pagina' o 'personalizado'
    this.modo = 'pagina';
    this.rotacion = 0; // giro extra en grados (0, 90, 180, 270)
    this.doble = false; // dos páginas juntas (solo en modo página)
    this.recorte = false;         // recortar los márgenes en blanco
    this.recorteComun = null;     // caja típica del documento (fracciones de página)
    this.recortesPagina = new Map(); // número → su caja, unida con la común

    this.envoltorios = []; // página(s) visibles: canvas + capas (modo página)
    this.paginas = [];     // envoltorios por número de página (modo continuo)
    this.preparadas = new Map(); // número de página → promesa de canvas pintado
    this.observador = null;
    this.tareaRender = null;
    this.pendiente = null;
    this.anotaciones = [];
    this.notaBajoPuntero = null;

    // Se vigila el área, no la ventana: también cambia de tamaño al abrir o
    // cerrar la barra lateral del índice. Se compara con la medida del último
    // montaje para no repintar por avisos que no cambian nada.
    let tempResize;
    this.medidaMontada = '';
    new ResizeObserver(() => {
      clearTimeout(tempResize);
      tempResize = setTimeout(() => {
        if (this.documento && this.medidaArea() !== this.medidaMontada) this.montar();
      }, 200);
    }).observe(this.area);

    let esperandoFrame = false;
    this.area.addEventListener('scroll', () => {
      this.ocultarNotaHover();
      if (this.modo !== 'continuo' || esperandoFrame) return;
      esperandoFrame = true;
      requestAnimationFrame(() => { esperandoFrame = false; this.detectarPaginaVisible(); });
    }, { passive: true });

    const capturar = () => requestAnimationFrame(() => this.capturarSeleccion());
    this.area.addEventListener('mouseup', capturar);
    this.area.addEventListener('touchend', capturar, { passive: true });

    let frameHover = null;
    this.area.addEventListener('pointermove', (evento) => {
      if (evento.pointerType !== 'mouse') return;
      cancelAnimationFrame(frameHover);
      frameHover = requestAnimationFrame(() => {
        this.detectarNotaHover(evento.clientX, evento.clientY);
      });
    }, { passive: true });
    this.area.addEventListener('pointerleave', () => this.ocultarNotaHover());
  }

  get totalPaginas() {
    return this.documento?.numPages ?? 0;
  }

  // La vista doble solo tiene sentido pasando página; en continuo las
  // páginas siguen apiladas de una en una.
  enDoble() {
    return this.doble && this.modo === 'pagina';
  }

  // En vista doble los pares son fijos (1-2, 3-4…): la página de la
  // izquierda es siempre impar.
  inicioPar(numero) {
    return this.enDoble() ? numero - ((numero - 1) % 2) : numero;
  }

  // Ancho disponible para una página, descontando el hueco entre las dos
  // de la vista doble.
  anchoPagina() {
    const total = this.area.clientWidth - 16;
    return this.enDoble() ? Math.floor((total - 12) / 2) : total;
  }

  // Escala base para encajar la página. En el ajuste completo se toma la
  // menor de las escalas disponibles en ambos ejes, de modo que nunca haga
  // falta desplazar la página para verla entera. Con los márgenes recortados
  // lo que tiene que encajar es la parte visible, no la página entera.
  escalaPara(pagina, recorte = this.recorteDe(pagina.pageNumber)) {
    const rotacion = this.rotacionDe(pagina);
    const base = pagina.getViewport({ scale: 1, rotation: rotacion });
    const visible = recorte ?? { ancho: 1, alto: 1 };
    const escalaAncho = this.anchoPagina() / (base.width * visible.ancho);
    if (this.ajuste !== 'pagina') return { base, escala: escalaAncho * this.zoom };
    const altoDisponible = Math.max(1, this.area.clientHeight - 16);
    const escalaPagina = Math.min(escalaAncho, altoDisponible / (base.height * visible.alto));
    return { base, escala: escalaPagina * this.zoom };
  }

  // Recorte ya conocido de una página, o null si se ve entera. Es lo que usan
  // las capas y las anotaciones, que se montan cuando la página ya está pintada.
  recorteDe(numero) {
    if (!this.recorte) return null;
    return this.recortesPagina.get(numero) ?? this.recorteComun ?? null;
  }

  // Recorte definitivo de una página: la caja típica del documento ampliada
  // con lo que esa página tenga fuera (una lámina a sangre, una tabla ancha),
  // de modo que el recorte nunca se come nada.
  async recorteDePagina(pagina) {
    if (!this.recorte) return null;
    const numero = pagina.pageNumber;
    if (this.recortesPagina.has(numero)) return this.recortesPagina.get(numero);
    const propia = await this.cajaDe(pagina).catch(() => null);
    // Aquí no se aplican las reglas de ajustarRecorte: si esta página ocupa
    // toda la hoja, lo correcto es no recortarla, no volver a la caja común.
    const recorte = unir([this.recorteComun, conAire(propia)]) ?? this.recorteComun;
    this.recortesPagina.set(numero, recorte);
    return recorte;
  }

  // Miniatura de una página para el panel de navegación. Respeta el giro y el
  // recorte, para que se parezca a lo que se está leyendo.
  async miniatura(numero, ancho) {
    const pagina = await this.documento.getPage(numero);
    const recorte = await this.recorteDePagina(pagina);
    const rotacion = this.rotacionDe(pagina);
    const base = pagina.getViewport({ scale: 1, rotation: rotacion });
    const escala = ancho / (base.width * (recorte?.ancho ?? 1));
    const vista = pagina.getViewport({ scale: escala, rotation: rotacion });
    const desplazamiento = recorte
      ? { x: vista.width * recorte.x, y: vista.height * recorte.y }
      : { x: 0, y: 0 };
    // Con dos píxeles por punto basta para que se vea nítida sin gastar de más.
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.max(1, Math.floor(vista.width * (recorte?.ancho ?? 1) * dpr));
    lienzo.height = Math.max(1, Math.floor(vista.height * (recorte?.alto ?? 1) * dpr));
    const contexto = lienzo.getContext('2d');
    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, lienzo.width, lienzo.height);
    await pagina.render({
      canvasContext: contexto,
      viewport: vista,
      transform: [dpr, 0, 0, dpr, -desplazamiento.x * dpr, -desplazamiento.y * dpr],
    }).promise;
    return lienzo;
  }

  // Dibuja la página muy pequeña sobre blanco y devuelve dónde tiene contenido.
  async cajaDe(pagina) {
    const rotacion = this.rotacionDe(pagina);
    const base = pagina.getViewport({ scale: 1, rotation: rotacion });
    const vista = pagina.getViewport({ scale: ANCHO_ANALISIS / base.width, rotation: rotacion });
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.max(1, Math.floor(vista.width));
    lienzo.height = Math.max(1, Math.floor(vista.height));
    const contexto = lienzo.getContext('2d', { willReadFrequently: true });
    // El PDF puede no pintar fondo: el blanco lo pone el lector.
    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, lienzo.width, lienzo.height);
    await pagina.render({ canvasContext: contexto, viewport: vista }).promise;
    const imagen = contexto.getImageData(0, 0, lienzo.width, lienzo.height);
    const caja = cajaDeContenido(imagen.data, lienzo.width, lienzo.height);
    lienzo.width = 0;
    lienzo.height = 0;
    return caja;
  }

  // Analiza unas cuantas páginas repartidas por el documento y se queda con el
  // rectángulo que contiene el contenido de todas ellas: así todas las páginas
  // se recortan igual y la caja de lectura no baila de una a otra.
  async calcularRecorte() {
    if (!this.documento) return null;
    const cajas = [];
    for (const numero of paginasAMuestrear(this.totalPaginas)) {
      try {
        cajas.push(await this.cajaDe(await this.documento.getPage(numero)));
      } catch { /* una página ilegible no debe impedir el recorte */ }
    }
    return ajustarRecorte(cajaRepresentativa(cajas));
  }

  async cambiarRecorte(activo) {
    activo = Boolean(activo);
    if (activo === this.recorte) return;
    this.recorte = activo;
    if (!this.documento) return;
    if (activo && !this.recorteComun) this.recorteComun = await this.calcularRecorte();
    await this.montar();
  }

  // Giro total de una página: el que trae el propio PDF más el del usuario.
  rotacionDe(pagina) {
    return (pagina.rotate + this.rotacion) % 360;
  }

  async abrir(datos, paginaInicial = 1, modo = this.modo, zoom = 1, ajuste = 'ancho',
    recorte = false) {
    if (this.documento) { try { await this.documento.destroy(); } catch { /* ignorar */ } }
    const tarea = pdfjs.getDocument({ data: datos });
    let cancelada = false;
    tarea.onPassword = (actualizar, motivo) => {
      const incorrecta = motivo === pdfjs.PasswordResponses.INCORRECT_PASSWORD;
      Promise.resolve(this.solicitarContrasena?.(incorrecta)).then((clave) => {
        if (clave === null || clave === undefined) {
          cancelada = true;
          tarea.destroy();
        } else actualizar(clave);
      });
    };
    try {
      this.documento = await tarea.promise;
    } catch (error) {
      if (cancelada) {
        const cancelacion = new Error('PDF_PASSWORD_CANCELLED');
        cancelacion.code = 'PDF_PASSWORD_CANCELLED';
        throw cancelacion;
      }
      throw error;
    }
    this.modo = modo;
    this.zoom = Math.min(4, Math.max(0.1, zoom));
    this.ajuste = ['ancho', 'pagina', 'personalizado'].includes(ajuste) ? ajuste : 'ancho';
    this.pagina = Math.min(Math.max(1, paginaInicial), this.documento.numPages);
    this.recorte = Boolean(recorte);
    this.recorteComun = this.recorte ? await this.calcularRecorte() : null;
    this.recortesPagina.clear();
    await this.montar();
  }

  async cambiarModo(modo) {
    if (modo === this.modo) return;
    this.modo = modo;
    if (this.documento) await this.montar();
  }

  async cambiarZoom(factor) {
    // Al ampliar desde "página completa" se conserva el tamaño visible y se
    // convierte a un zoom personalizado relativo al ancho.
    if (this.ajuste === 'pagina' && this.documento) {
      const pagina = await this.documento.getPage(this.pagina);
      const rotacion = this.rotacionDe(pagina);
      const base = pagina.getViewport({ scale: 1, rotation: rotacion });
      const visible = this.recorteDe(this.pagina) ?? { ancho: 1, alto: 1 };
      const escalaAncho = this.anchoPagina() / (base.width * visible.ancho);
      const escalaPagina = Math.min(
        escalaAncho,
        Math.max(1, this.area.clientHeight - 16) / (base.height * visible.alto),
      );
      this.zoom *= escalaPagina / escalaAncho;
    }
    this.ajuste = 'personalizado';
    this.zoom = Math.min(4, Math.max(0.1, this.zoom * factor));
    if (this.documento) await this.montar();
  }

  async ajustar(tipo) {
    if (!['ancho', 'pagina'].includes(tipo)) return;
    this.ajuste = tipo;
    this.zoom = 1;
    if (this.documento) await this.montar();
  }

  async rotar() {
    this.rotacion = (this.rotacion + 90) % 360;
    if (!this.documento) return;
    // El recorte se mide sobre la página ya girada: hay que rehacerlo.
    this.recortesPagina.clear();
    if (this.recorte) this.recorteComun = await this.calcularRecorte();
    await this.montar();
  }

  async cambiarDoble(activo) {
    activo = Boolean(activo);
    if (activo === this.doble) return;
    this.doble = activo;
    if (this.documento) await this.montar();
  }

  async irA(numero) {
    if (!this.documento) return;
    this.pagina = this.inicioPar(Math.min(Math.max(1, numero), this.totalPaginas));
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

  // ¿Hay un canvas montado (o montándose) para esa página?
  enPantalla(numero) {
    if (this.modo === 'continuo') return Boolean(this.paginas[numero]?.dataset.estado);
    return this.envoltorios.some((envoltorio) => Number(envoltorio.dataset.num) === numero);
  }

  anterior() { return this.irA(this.pagina - (this.enDoble() ? 2 : 1)); }
  siguiente() { return this.irA(this.pagina + (this.enDoble() ? 2 : 1)); }

  // Recorre el documento página a página. La señal permite abandonar el
  // barrido (cerrar el panel o buscar otra cosa) sin seguir leyendo el resto
  // del PDF, y los avisos van entregando lo encontrado sin esperar al final.
  async buscar(consulta, { senal, alProgreso, alEncontrar } = {}) {
    if (!this.documento) return [];
    const buscado = normalizarBusqueda(consulta.trim());
    if (!buscado) return [];
    const resultados = [];
    for (let numero = 1; numero <= this.totalPaginas && resultados.length < 200; numero++) {
      if (senal?.aborted) break;
      const pagina = await this.documento.getPage(numero);
      const contenido = await pagina.getTextContent();
      // Las páginas que no están en pantalla se sueltan tras leerlas: si no,
      // buscar en un documento largo deja en memoria todo su contenido.
      if (!this.enPantalla(numero)) { try { pagina.cleanup(); } catch { /* en uso */ } }
      const texto = contenido.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
      const minusculas = normalizarBusqueda(texto);
      const nuevos = [];
      let posicion = 0;
      while ((posicion = minusculas.indexOf(buscado, posicion)) !== -1 && resultados.length + nuevos.length < 200) {
        nuevos.push({ destino: numero, numero, fragmento: fragmentoBusqueda(texto, posicion, buscado.length) });
        posicion += Math.max(1, buscado.length);
      }
      resultados.push(...nuevos);
      if (nuevos.length) alEncontrar?.(nuevos);
      alProgreso?.(numero, this.totalPaginas);
    }
    return resultados;
  }

  // Marca unos segundos las apariciones del término buscado sobre las
  // páginas visibles, para localizarlo de un vistazo tras el salto.
  destacarBusqueda(termino) {
    const buscado = normalizarBusqueda(String(termino ?? '').trim());
    if (!buscado) return;
    const envoltorios = this.modo === 'continuo'
      ? [this.paginas[this.pagina]].filter(Boolean)
      : this.envoltorios;
    for (const envoltorio of envoltorios) {
      envoltorio.querySelector('.capa-busqueda')?.remove();
      const capaTexto = envoltorio.querySelector('.capa-texto');
      if (!capaTexto) continue;
      const rangos = rangosDeTermino(capaTexto, buscado);
      if (!rangos.length) continue;
      const capa = document.createElement('div');
      capa.className = 'capa-busqueda';
      const base = envoltorio.getBoundingClientRect();
      for (const rango of rangos.slice(0, 40)) {
        for (const rect of rango.getClientRects()) {
          if (rect.width < 1 || rect.height < 1) continue;
          const marca = document.createElement('span');
          marca.style.left = `${((rect.left - base.left) / base.width) * 100}%`;
          marca.style.top = `${((rect.top - base.top) / base.height) * 100}%`;
          marca.style.width = `${(rect.width / base.width) * 100}%`;
          marca.style.height = `${(rect.height / base.height) * 100}%`;
          capa.append(marca);
        }
      }
      envoltorio.append(capa);
      setTimeout(() => capa.remove(), 2600);
    }
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
    this.envoltorios = [];
    // Las páginas preparadas lo están a la escala y el giro anteriores.
    this.preparadas.clear();
    this.pendiente = null;
  }

  medidaArea() {
    return `${this.area.clientWidth}x${this.area.clientHeight}`;
  }

  async montar() {
    this.medidaMontada = this.medidaArea();
    // Mientras se remonta (zoom, cambio de modo, resize), el scroll provocado
    // por vaciar el contenedor no debe redetectar la página: pisaría la
    // actual con la primera antes de que scrollIntoView la restaure.
    this.montando = true;
    try {
      this.limpiar();
      this.contenedor.classList.toggle('ajuste-pagina', this.ajuste === 'pagina' && this.modo === 'pagina');
      if (this.modo === 'continuo') await this.montarContinuo();
      else await this.montarPagina();
    } finally {
      this.montando = false;
    }
    this.alCambiarPagina?.(this.pagina, this.totalPaginas);
  }

  async montarPagina() {
    this.pagina = this.inicioPar(this.pagina);
    const par = document.createElement('div');
    par.className = 'par-paginas';
    for (let i = 0; i < (this.enDoble() ? 2 : 1); i++) {
      const envoltorio = document.createElement('div');
      envoltorio.className = 'pagina-pdf';
      envoltorio.append(document.createElement('canvas'));
      par.append(envoltorio);
      this.envoltorios.push(envoltorio);
    }
    this.contenedor.append(par);
    await this.renderUnica(this.pagina);
    this.area.scrollTop = 0;
  }

  async montarContinuo() {
    this.contenedor.classList.add('continuo');

    // Tamaño de referencia (a partir de la primera página) para los huecos
    // reservados de las páginas aún no renderizadas.
    const primera = await this.documento.getPage(1);
    const rotacion = this.rotacionDe(primera);
    const { escala } = this.escalaPara(primera);
    const vista = primera.getViewport({ scale: escala, rotation: rotacion });

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

  // Modo página: cada página se pinta en su propio canvas y se intercambia ya
  // terminado, en lugar de vaciarse y rellenarse a la vista. El último
  // renderizado solicitado gana.
  async renderUnica(numero) {
    this.pendiente = numero;
    if (this.tareaRender) return;
    while (this.pendiente !== null) {
      const n = this.inicioPar(this.pendiente);
      this.pendiente = null;
      this.tareaRender = (async () => {
        for (let i = 0; i < this.envoltorios.length; i++) {
          const envoltorio = this.envoltorios[i];
          // En vista doble la última página impar se muestra sola.
          if (n + i > this.totalPaginas) { envoltorio.classList.add('oculto'); continue; }
          envoltorio.classList.remove('oculto');
          envoltorio.dataset.num = String(n + i);
          const { pagina, vista, lienzo, desplazamiento } = await this.preparar(n + i);
          const anterior = envoltorio.querySelector('canvas');
          if (anterior !== lienzo) {
            // Las capas de la página que se va no deben quedar sobre la nueva.
            for (const capa of envoltorio.querySelectorAll('.capa-texto, .capa-enlaces, .capa-resaltados, .capa-busqueda')) capa.remove();
            if (anterior) anterior.replaceWith(lienzo);
            else envoltorio.prepend(lienzo);
          }
          // Las capas solo se montan para el último render solicitado.
          if (this.pendiente === null) await this.montarCapas(envoltorio, pagina, vista, desplazamiento);
        }
        if (this.pendiente === null) this.prepararVecinas(n);
      })();
      await this.tareaRender.catch(() => {});
      this.tareaRender = null;
    }
  }

  // Pinta una página en un canvas propio (o reaprovecha el que ya se pintó).
  // Devuelve siempre la misma promesa mientras la página siga preparada, así
  // que pedirla dos veces no la dibuja dos veces.
  preparar(numero) {
    let preparada = this.preparadas.get(numero);
    if (!preparada) {
      const lienzo = document.createElement('canvas');
      preparada = this.pintar(numero, lienzo)
        .then(({ pagina, vista, desplazamiento }) => ({ pagina, vista, lienzo, desplazamiento }));
      preparada.catch(() => this.preparadas.delete(numero));
      this.preparadas.set(numero, preparada);
    }
    return preparada;
  }

  // Adelanta el pintado de las páginas contiguas una vez montada la actual:
  // al pasar de página el canvas ya está listo y el cambio es inmediato.
  prepararVecinas(n) {
    const vecinas = this.enDoble() ? [n + 2, n + 3, n - 2, n - 1] : [n + 1, n - 1];
    for (const numero of vecinas) {
      if (numero >= 1 && numero <= this.totalPaginas) this.preparar(numero);
    }
    if (this.preparadas.size <= MAXIMO_PAGINAS_PREPARADAS) return;
    const sobran = [...this.preparadas.keys()]
      .sort((a, b) => Math.abs(b - n) - Math.abs(a - n))
      .slice(0, this.preparadas.size - MAXIMO_PAGINAS_PREPARADAS);
    for (const numero of sobran) {
      const preparada = this.preparadas.get(numero);
      this.preparadas.delete(numero);
      // Vaciar el canvas devuelve su memoria, salvo que siga a la vista.
      preparada?.then(({ lienzo }) => {
        if (!lienzo.isConnected) { lienzo.width = 0; lienzo.height = 0; }
      }).catch(() => {});
    }
  }

  // Modo continuo: renderiza la página en su envoltorio una sola vez.
  async renderContinuo(numero) {
    const envoltorio = this.paginas[numero];
    if (!envoltorio || envoltorio.dataset.estado) return; // en curso o ya listo
    envoltorio.dataset.estado = 'render';
    const lienzo = document.createElement('canvas');
    try {
      const { pagina, vista, desplazamiento } = await this.pintar(numero, lienzo);
      // El hueco reservado se estimó con la primera página: al pintar la real
      // manda su tamaño (importa con páginas desiguales y con el recorte).
      envoltorio.style.height = '';
      envoltorio.style.width = '';
      envoltorio.replaceChildren(lienzo);
      await this.montarCapas(envoltorio, pagina, vista, desplazamiento);
      envoltorio.dataset.estado = 'listo';
      this.podarPaginas();
    } catch {
      delete envoltorio.dataset.estado; // se reintentará al volver a entrar en vista
    }
  }

  // Suelta las páginas renderizadas más alejadas de la vista cuando hay
  // demasiadas en memoria. El envoltorio conserva su alto real, de modo que el
  // scroll no salta, y el observador las vuelve a pintar al acercarse.
  podarPaginas() {
    const listas = [];
    for (let n = 1; n <= this.totalPaginas; n++) {
      if (this.paginas[n]?.dataset.estado === 'listo') listas.push(n);
    }
    const sobran = listas.length - MAXIMO_PAGINAS_MEMORIA;
    if (sobran <= 0) return;

    const rectArea = this.area.getBoundingClientRect();
    const candidatos = [];
    for (const n of listas) {
      const rect = this.paginas[n].getBoundingClientRect();
      const distancia = Math.max(rectArea.top - rect.bottom, rect.top - rectArea.bottom, 0);
      if (distancia > MARGEN_LIBERACION) candidatos.push({ n, distancia });
    }
    candidatos.sort((a, b) => b.distancia - a.distancia);
    for (const { n } of candidatos.slice(0, sobran)) this.liberarPagina(n);
  }

  liberarPagina(numero) {
    const envoltorio = this.paginas[numero];
    if (envoltorio?.dataset.estado !== 'listo') return;
    envoltorio.style.width = `${envoltorio.offsetWidth}px`;
    envoltorio.style.height = `${envoltorio.offsetHeight}px`;
    // Vaciar el canvas antes de descartarlo libera su memoria de inmediato en
    // los navegadores que no la devuelven hasta pasar el recolector.
    const lienzo = envoltorio.querySelector('canvas');
    if (lienzo) { lienzo.width = 0; lienzo.height = 0; }
    envoltorio.replaceChildren();
    delete envoltorio.dataset.estado;
  }

  async pintar(numero, lienzo) {
    const pagina = await this.documento.getPage(numero);
    const rotacion = this.rotacionDe(pagina);
    const recorte = await this.recorteDePagina(pagina);
    const { escala } = this.escalaPara(pagina, recorte);
    const vista = pagina.getViewport({ scale: escala, rotation: rotacion });

    // Con los márgenes recortados el canvas es solo el trozo visible y la
    // página se dibuja desplazada, de modo que el sobrante queda fuera.
    const desplazamiento = recorte
      ? { x: vista.width * recorte.x, y: vista.height * recorte.y }
      : { x: 0, y: 0 };
    const ancho = recorte ? vista.width * recorte.ancho : vista.width;
    const alto = recorte ? vista.height * recorte.alto : vista.height;

    const dpr = window.devicePixelRatio || 1;
    lienzo.width = Math.floor(ancho * dpr);
    lienzo.height = Math.floor(alto * dpr);
    // Solo se fija el ancho: el alto sigue a la proporción intrínseca del
    // canvas, así ningún límite de CSS puede deformar la página.
    lienzo.style.width = `${Math.floor(ancho)}px`;
    lienzo.style.height = 'auto';

    await pagina.render({
      canvasContext: lienzo.getContext('2d'),
      viewport: vista,
      transform: [dpr, 0, 0, dpr, -desplazamiento.x * dpr, -desplazamiento.y * dpr],
    }).promise;
    return { pagina, vista, desplazamiento };
  }

  // ─────────────── Capas de texto y enlaces sobre el canvas ───────────────

  // Superpone al canvas el texto seleccionable (TextLayer de PDF.js) y los
  // enlaces del PDF. Los tamaños de la capa de texto dependen de la variable
  // CSS --scale-factor, que debe reflejar la escala del viewport.
  async montarCapas(envoltorio, pagina, vista, desplazamiento = { x: 0, y: 0 }) {
    for (const capa of envoltorio.querySelectorAll('.capa-texto, .capa-enlaces, .capa-resaltados')) capa.remove();
    envoltorio.style.setProperty('--scale-factor', String(vista.scale));

    const capaTexto = document.createElement('div');
    capaTexto.className = 'capa-texto';
    this.colocarCapa(capaTexto, vista, desplazamiento);
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
    await this.montarEnlaces(envoltorio, pagina, vista, desplazamiento);
  }

  // El texto y los enlaces vienen en coordenadas de la página entera. Cuando
  // está recortada, su capa se coloca donde caería la esquina de la página,
  // fuera del envoltorio, para que todo siga cuadrando con el canvas.
  colocarCapa(capa, vista, desplazamiento) {
    if (!desplazamiento.x && !desplazamiento.y) return;
    capa.style.left = `${-desplazamiento.x}px`;
    capa.style.top = `${-desplazamiento.y}px`;
    capa.style.width = `${vista.width}px`;
    capa.style.height = `${vista.height}px`;
  }

  mostrarAnotaciones(anotaciones) {
    this.ocultarNotaHover();
    this.anotaciones = Array.isArray(anotaciones) ? anotaciones : [];
    // En continuo solo se repintan las páginas ya renderizadas: las demás
    // (nunca pintadas o soltadas por memoria) montarán sus capas al pintarse.
    const envoltorios = this.modo === 'continuo'
      ? this.paginas.filter((envoltorio) => envoltorio?.dataset.estado === 'listo')
      : this.envoltorios.filter((envoltorio) => !envoltorio.classList.contains('oculto'));
    for (const envoltorio of envoltorios) {
      envoltorio.querySelector('.capa-resaltados')?.remove();
      this.montarResaltados(envoltorio, Number(envoltorio.dataset.num));
    }
  }

  montarResaltados(envoltorio, numero) {
    const recorte = this.recorteDe(numero);
    const entradas = this.anotaciones.flatMap((anotacion) =>
      (anotacion.paginas ?? []).filter((pagina) => pagina.pagina === numero)
        .map((pagina) => ({
          anotacion,
          pagina,
          rectangulos: (pagina.rectangulos ?? []).map((rect) => enElRecorte(rect, recorte)),
        })));
    if (!entradas.length) return;
    const capa = document.createElement('div');
    capa.className = 'capa-resaltados';
    const posicionesOcupadas = [];
    for (const { anotacion, rectangulos } of entradas) {
      for (const rectangulo of rectangulos) {
        const marca = document.createElement('span');
        marca.className = anotacion.nota ? 'nota' : 'resaltado';
        if (anotacion.color) marca.dataset.color = anotacion.color;
        marca.dataset.anotacion = anotacion.id;
        marca.style.left = `${rectangulo.x * 100}%`;
        marca.style.top = `${rectangulo.y * 100}%`;
        marca.style.width = `${rectangulo.ancho * 100}%`;
        marca.style.height = `${rectangulo.alto * 100}%`;
        capa.append(marca);
      }
      if (anotacion.nota && rectangulos.length) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'boton-nota-margen';
        boton.textContent = '✎';
        boton.title = this.etiquetaOpcionesNota?.() ?? 'Opciones de la nota';
        boton.setAttribute('aria-label', boton.title);
        const posicionVertical = posicionVerticalLibre(
          rectangulos[0].y * envoltorio.clientHeight,
          posicionesOcupadas,
          envoltorio.clientHeight,
        );
        posicionesOcupadas.push(posicionVertical);
        boton.style.top = `${posicionVertical}px`;
        boton.addEventListener('click', (evento) => {
          evento.stopPropagation();
          this.alGestionarAnotacion?.(anotacion.id, boton.getBoundingClientRect());
        });
        capa.append(boton);
      }
    }
    // Debajo de la capa de texto para no impedir nuevas selecciones.
    envoltorio.insertBefore(capa, envoltorio.querySelector('.capa-texto, .capa-enlaces'));
  }

  detectarNotaHover(x, y) {
    for (const marca of this.contenedor.querySelectorAll('.capa-resaltados span.nota')) {
      const rectangulo = marca.getBoundingClientRect();
      if (x < rectangulo.left || x > rectangulo.right || y < rectangulo.top || y > rectangulo.bottom) continue;
      const anotacion = this.anotaciones.find((entrada) => entrada.id === marca.dataset.anotacion);
      if (!anotacion?.nota) break;
      if (this.notaBajoPuntero !== anotacion.id) {
        this.notaBajoPuntero = anotacion.id;
        this.alMostrarNota?.(anotacion, rectangulo);
      }
      return;
    }
    this.ocultarNotaHover();
  }

  ocultarNotaHover() {
    if (this.notaBajoPuntero === null) return;
    this.notaBajoPuntero = null;
    this.alOcultarNota?.();
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
    // Los resaltados se guardan siempre respecto a la página entera, para que
    // sigan donde toca con los márgenes recortados o sin recortar (y en otro
    // dispositivo, donde puede estar al revés).
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
        enPagina.push(enLaPagina({
          x: (izquierda - base.left) / base.width,
          y: (arriba - base.top) / base.height,
          ancho: (derecha - izquierda) / base.width,
          alto: (abajo - arriba) / base.height,
        }, this.recorteDe(Number(envoltorio.dataset.num) || this.pagina)));
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
  async montarEnlaces(envoltorio, pagina, vista, desplazamiento = { x: 0, y: 0 }) {
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
    this.colocarCapa(capa, vista, desplazamiento);
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

// Un rectángulo guardado (fracciones de la página entera) pasa a fracciones
// de lo que se ve, que es lo que ocupa el envoltorio cuando hay recorte.
function enElRecorte(rectangulo, recorte) {
  if (!recorte) return rectangulo;
  return {
    x: (rectangulo.x - recorte.x) / recorte.ancho,
    y: (rectangulo.y - recorte.y) / recorte.alto,
    ancho: rectangulo.ancho / recorte.ancho,
    alto: rectangulo.alto / recorte.alto,
  };
}

// El camino inverso: de lo que se ve a la página entera.
function enLaPagina(rectangulo, recorte) {
  if (!recorte) return rectangulo;
  return {
    x: recorte.x + rectangulo.x * recorte.ancho,
    y: recorte.y + rectangulo.y * recorte.alto,
    ancho: rectangulo.ancho * recorte.ancho,
    alto: rectangulo.alto * recorte.alto,
  };
}

function fragmentoBusqueda(texto, posicion, longitud) {
  const inicio = Math.max(0, posicion - 55);
  const fin = Math.min(texto.length, posicion + longitud + 75);
  return `${inicio ? '…' : ''}${texto.slice(inicio, fin)}${fin < texto.length ? '…' : ''}`;
}

function normalizarBusqueda(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

// Recorre el texto de la capa y lo pliega igual que en buscar() (espacios
// colapsados, sin acentos), apuntando de qu\u00e9 nodo y posici\u00f3n sale cada
// car\u00e1cter. Devuelve un Range del documento por cada aparici\u00f3n del t\u00e9rmino.
function rangosDeTermino(raiz, buscado) {
  const caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  let plegado = '';
  const origen = []; // por car\u00e1cter plegado: nodo y posici\u00f3n de procedencia
  let enEspacio = true;
  for (let nodo = caminante.nextNode(); nodo; nodo = caminante.nextNode()) {
    const texto = nodo.textContent;
    for (let indice = 0; indice < texto.length; indice++) {
      const caracter = texto[indice];
      if (/\s/.test(caracter)) {
        if (!enEspacio) {
          plegado += ' ';
          origen.push({ nodo, indice });
          enEspacio = true;
        }
        continue;
      }
      const normal = normalizarBusqueda(caracter);
      plegado += normal.length === 1 ? normal : caracter.toLocaleLowerCase()[0];
      origen.push({ nodo, indice });
      enEspacio = false;
    }
    // Los tramos del PDF suelen cortar por l\u00edneas sin espacio final.
    if (!enEspacio) {
      plegado += ' ';
      origen.push({ nodo, indice: texto.length - 1 });
      enEspacio = true;
    }
  }
  const rangos = [];
  let posicion = 0;
  while ((posicion = plegado.indexOf(buscado, posicion)) !== -1) {
    const inicio = origen[posicion];
    const fin = origen[posicion + buscado.length - 1];
    try {
      const rango = document.createRange();
      rango.setStart(inicio.nodo, inicio.indice);
      rango.setEnd(fin.nodo, Math.min(fin.indice + 1, fin.nodo.textContent.length));
      rangos.push(rango);
    } catch { /* plegado desalineado por un car\u00e1cter ex\u00f3tico: se omite */ }
    posicion += Math.max(1, buscado.length);
  }
  return rangos;
}
