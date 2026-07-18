import { ClienteWebDav, explicarError } from './webdav.js';
import { Lector } from './lector.js';
import { LectorEpub } from './lector-epub.js';
import * as progreso from './progreso.js';
import * as almacen from './almacen.js';
import { asegurarMiniatura } from './portadas.js';
import { icono, pintarIconos } from './iconos.js';
import { t, iniciarIdioma, idiomaActual } from './i18n.js';

const CLAVE_CONFIG = 'lector.config';
const CLAVE_NOCHE = 'lector.noche';
const CLAVE_MODO = 'lector.modo';
const CLAVE_ZOOM_PDF = 'lector.zoomPdf';    // solo de este dispositivo
const CLAVE_LETRA_EPUB = 'lector.letraEpub'; // solo de este dispositivo
const CLAVE_MARGEN_EPUB = 'lector.margenEpub'; // solo de este dispositivo
const CLAVE_FUENTE_EPUB = 'lector.fuenteEpub'; // solo de este dispositivo
const CLAVE_INTERLINEADO_EPUB = 'lector.interlineadoEpub'; // solo de este dispositivo

const MARGEN_EPUB_INICIAL = 10;
const MARGEN_EPUB_MAXIMO = 30;

function margenEpubActual() {
  const guardado = localStorage.getItem(CLAVE_MARGEN_EPUB);
  // Migra las tres opciones de versiones anteriores a valores aproximados.
  const anterior = { completo: 0, medio: 10, estrecho: 22 }[guardado];
  if (anterior !== undefined) return anterior;
  if (guardado === null) return MARGEN_EPUB_INICIAL;
  const valor = Number(guardado);
  return Number.isFinite(valor) && valor >= 0 && valor <= MARGEN_EPUB_MAXIMO
    ? valor
    : MARGEN_EPUB_INICIAL;
}

// epub.js escucha el resize de la ventana y recalcula el paginado; se agrupa
// en un frame para no relanzarlo en cada paso de un deslizador.
let frameReflowEpub = null;
function reflowEpub() {
  cancelAnimationFrame(frameReflowEpub);
  frameReflowEpub = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
}

function aplicarMargenEpub(valor = margenEpubActual()) {
  $('contenedor-epub').style.setProperty('--margen-texto', `${valor}%`);
  $('margen-epub').value = String(valor);
  $('margen-epub').setAttribute('aria-valuetext', t('epubMargin', { value: valor }));
  $('valor-margen').textContent = t('epubMargin', { value: valor });
  reflowEpub();
}

function fuenteEpubGuardada() {
  const valor = localStorage.getItem(CLAVE_FUENTE_EPUB);
  return ['serif', 'sans'].includes(valor) ? valor : 'libro';
}

function interlineadoEpubGuardado() {
  const valor = parseFloat(localStorage.getItem(CLAVE_INTERLINEADO_EPUB));
  return valor >= 1 && valor <= 3 ? valor : null;
}

function zoomPdfGuardado() {
  const valor = parseFloat(localStorage.getItem(CLAVE_ZOOM_PDF));
  return valor >= 0.5 && valor <= 4 ? valor : 1;
}

function letraEpubGuardada() {
  const valor = parseInt(localStorage.getItem(CLAVE_LETRA_EPUB), 10);
  return valor >= 60 && valor <= 300 ? valor : 100;
}

const $ = (id) => document.getElementById(id);

// ───────────────────────── Estado ─────────────────────────

let cliente = null;        // ClienteWebDav o null si no hay configuración
let rutaNube = '';         // subcarpeta abierta en la sección de la nube ('' = raíz)
let libroActual = null;    // { id, titulo, tipo: 'webdav'|'local', formato: 'pdf'|'epub' }
let temporizadorSync = null;

const lector = new Lector({
  area: $('area-lectura'),
  contenedor: $('contenedor-pagina'),
  alCambiarPagina: cuandoCambiaPagina,
  // Enlaces internos del PDF: saltan a su página dejando rastro en el
  // historial para poder volver.
  alPulsarEnlaceInterno: (pagina) => {
    saltarConHistorial(pagina).catch((error) => avisar(error.message, 5000));
  },
});

const lectorEpub = new LectorEpub({
  contenedor: $('contenedor-epub'),
  alCambiarPosicion: cuandoCambiaPosicionEpub,
  alTeclear: manejarTecla,
});

function formatoDe(nombre) {
  return /\.epub$/i.test(nombre) ? 'epub' : 'pdf';
}

// Los libros de la nube se identifican por su ruta relativa a la carpeta
// base ('Novelas/libro.pdf'); el progreso y las portadas usan ese mismo id.
function idRemoto(nombre) {
  return rutaNube ? `${rutaNube}/${nombre}` : nombre;
}

function nombreDeId(id) {
  return id.split('/').pop();
}

function carpetaDeId(id) {
  return id.includes('/') ? id.slice(0, id.lastIndexOf('/')) : '';
}

function epubAbierto() {
  return libroActual?.formato === 'epub';
}

// ───────────────────────── Utilidades de interfaz ─────────────────────────

function mostrarVista(nombre) {
  for (const vista of document.querySelectorAll('.vista')) {
    vista.classList.toggle('oculto', vista.id !== `vista-${nombre}`);
  }
}

const ESTADO_VISTA = 'pagekeeperVista';

function registrarVistaLector() {
  if (history.state?.[ESTADO_VISTA] === 'lector') return;
  history.pushState({ [ESTADO_VISTA]: 'lector' }, '');
}

function cerrarVistaLector() {
  cerrarBusquedaLibro();
  cerrarIndiceLibro();
  cerrarPanelMarcadores();
  clearTimeout(temporizadorSync);
  if (libroActual?.tipo === 'webdav' && cliente) {
    progreso.sincronizar(cliente).catch(() => null);
  }
  lectorEpub.cerrar();
  libroActual = null;
  mostrarVista('biblioteca');
  cargarBiblioteca();
}

// Cada libro ocupa una entrada del historial del navegador. Al retroceder se
// vuelve a la biblioteca; una entrada antigua del lector no intenta reabrir
// datos que ya no están en memoria al avanzar de nuevo.
window.addEventListener('popstate', () => {
  if (libroActual || !$('vista-lector').classList.contains('oculto')) {
    cerrarVistaLector();
  }
  if (history.state?.[ESTADO_VISTA] === 'lector') {
    history.replaceState({ [ESTADO_VISTA]: 'biblioteca' }, '');
  }
});

let temporizadorToast;
function avisar(mensaje, ms = 3500) {
  const toast = $('toast');
  toast.textContent = mensaje;
  toast.classList.remove('oculto');
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.add('oculto'), ms);
}

function mostrarCarga(texto) {
  $('texto-cargando').textContent = texto;
  $('cargando').classList.remove('oculto');
}
function ocultarCarga() {
  $('cargando').classList.add('oculto');
}

// ───────────────────────── Configuración ─────────────────────────

function cargarConfig() {
  try {
    const config = JSON.parse(localStorage.getItem(CLAVE_CONFIG));
    if (config?.url && config?.usuario) return config;
  } catch { /* sin configuración válida */ }
  return null;
}

function crearCliente() {
  const config = cargarConfig();
  cliente = config ? new ClienteWebDav(config) : null;
  rutaNube = '';
}

function abrirAjustes() {
  const config = cargarConfig() ?? {};
  $('campo-url').value = config.url ?? '';
  $('campo-usuario').value = config.usuario ?? '';
  $('campo-clave').value = config.clave ?? '';
  $('resultado-prueba').textContent = '';
  $('resultado-prueba').className = 'estado';
  mostrarVista('ajustes');
}

function leerFormulario() {
  return {
    url: $('campo-url').value.trim(),
    usuario: $('campo-usuario').value.trim(),
    clave: $('campo-clave').value,
  };
}

$('formulario-webdav').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const config = leerFormulario();
  if (!config.url || !config.usuario) {
    avisar(t('fillUrlUser'));
    return;
  }
  localStorage.setItem(CLAVE_CONFIG, JSON.stringify(config));
  crearCliente();
  avisar(t('configSaved'));
  mostrarVista('biblioteca');
  cargarBiblioteca();
});

$('btn-probar').addEventListener('click', async () => {
  const resultado = $('resultado-prueba');
  resultado.className = 'estado';
  resultado.textContent = t('connecting');
  try {
    const { libros } = await new ClienteWebDav(leerFormulario()).listar();
    resultado.className = 'estado exito';
    resultado.textContent = t('connectionOk', { count: libros.length });
  } catch (error) {
    resultado.className = 'estado error';
    resultado.textContent = explicarError(error);
  }
});

$('btn-borrar-config').addEventListener('click', () => {
  if (!confirm(t('deleteConfigConfirm'))) return;
  localStorage.removeItem(CLAVE_CONFIG);
  crearCliente();
  avisar(t('configDeleted'));
  mostrarVista('biblioteca');
  cargarBiblioteca();
});

$('btn-ajustes').addEventListener('click', abrirAjustes);
$('enlace-configurar').addEventListener('click', (evento) => {
  evento.preventDefault();
  abrirAjustes();
});

// ── Exportar / importar configuración por enlace ──
// El enlace lleva la configuración en el fragmento (#cfg=…), que nunca se
// envía al servidor: solo lo lee el lector al abrirse.

function codificarConfig(config) {
  const bytes = new TextEncoder().encode(JSON.stringify(config));
  let binario = '';
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function decodificarConfig(texto) {
  const b64 = texto.replaceAll('-', '+').replaceAll('_', '/');
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

$('btn-copiar-config').addEventListener('click', async () => {
  const resultado = $('resultado-copia');
  const config = leerFormulario();
  if (!config.url || !config.usuario) {
    resultado.className = 'estado error';
    resultado.textContent = t('copyLinkFirst');
    return;
  }
  const enlace = `${location.origin}${location.pathname}#cfg=${codificarConfig(config)}`;
  try {
    await navigator.clipboard.writeText(enlace);
    resultado.className = 'estado exito';
    resultado.textContent = t('linkCopied');
  } catch {
    // Sin permiso de portapapeles: se muestra para copiarlo a mano.
    prompt(t('copyLinkPrompt'), enlace);
    resultado.textContent = '';
  }
});

// Cubre también pegar el enlace en una pestaña donde el lector ya está
// abierto (la navegación no recarga la página, solo cambia el fragmento).
window.addEventListener('hashchange', () => {
  if (!location.hash.startsWith('#cfg=')) return;
  importarConfigDeUrl();
  crearCliente();
  mostrarVista('biblioteca');
  cargarBiblioteca();
});

function importarConfigDeUrl() {
  const coincidencia = location.hash.match(/^#cfg=([A-Za-z0-9_-]+)$/);
  if (!coincidencia) return;
  // Se limpia la dirección enseguida para que la contraseña no se quede a
  // la vista ni en el historial.
  history.replaceState(null, '', location.pathname + location.search);
  try {
    const config = decodificarConfig(coincidencia[1]);
    if (!config?.url || !config?.usuario) throw new Error('incompleta');
    const actual = cargarConfig();
    if (actual && JSON.stringify(actual) !== JSON.stringify(config) &&
        !confirm(t('replaceConfigConfirm'))) {
      return;
    }
    localStorage.setItem(CLAVE_CONFIG, JSON.stringify(config));
    avisar(t('cloudConfigImported'));
  } catch {
    avisar(t('invalidConfigLink'), 5000);
  }
}

// ───────────────────────── Ayuda ─────────────────────────

function abrirAyuda() {
  const dominio = location.origin;
  for (const id of ['ayuda-dominio', 'ayuda-dominio-ia']) $(id).textContent = dominio;
  mostrarVista('ayuda');
}

$('btn-ayuda').addEventListener('click', abrirAyuda);
$('btn-cerrar-ayuda').addEventListener('click', () => {
  mostrarVista('biblioteca');
  cargarBiblioteca();
});
for (const id of ['enlace-ayuda-aviso', 'enlace-ayuda-ajustes']) {
  $(id).addEventListener('click', (evento) => {
    evento.preventDefault();
    abrirAyuda();
  });
}
// Los enlaces del aviso inicial se regeneran al cambiar de idioma.
document.addEventListener('click', (evento) => {
  const enlace = evento.target.closest('#enlace-configurar, #enlace-ayuda-aviso, #enlace-ayuda-ajustes');
  if (!enlace) return;
  evento.preventDefault();
  if (enlace.id === 'enlace-configurar') abrirAjustes(); else abrirAyuda();
});
$('btn-cerrar-ajustes').addEventListener('click', () => {
  mostrarVista('biblioteca');
  cargarBiblioteca();
});

// ───────────────────────── Biblioteca ─────────────────────────

async function cargarBiblioteca() {
  cargarLibrosLocales();
  pintarContinuarLeyendo();

  const hayConfig = cliente !== null;
  $('aviso-sin-config').classList.toggle('oculto', hayConfig);
  $('zona-remota').classList.toggle('oculto', !hayConfig);
  // La sección local solo tiene sentido en la raíz: dentro de una subcarpeta
  // de la nube distraería y sus libros no pertenecen a esa carpeta.
  $('zona-local').classList.toggle('oculto', Boolean(hayConfig && rutaNube));
  if (!hayConfig) {
    $('lista-libros').replaceChildren();
    actualizarVisibilidadBuscadorBiblioteca();
    return;
  }

  const estado = $('estado-remoto');
  estado.className = 'estado';
  estado.textContent = t('loadingLibrary');
  $('lista-libros').replaceChildren();
  const promesaCopias = almacen.listarCopiasRemotas(cliente.base).catch(() => []);

  try {
    const [{ carpetas, libros }, copias] = await Promise.all([
      cliente.listar(rutaNube),
      promesaCopias,
      progreso.sincronizar(cliente).catch(() => null),
    ]);
    estado.textContent = carpetas.length || libros.length
      ? ''
      : t(rutaNube ? 'emptyFolder' : 'noCloudBooks');
    pintarListaRemota(carpetas, libros, copias);
    pintarContinuarLeyendo();
    generarPortadasFaltantes(libros.map((libro) => ({ ...libro, nombre: idRemoto(libro.nombre) })));
  } catch (error) {
    const copias = await promesaCopias;
    const bibliotecaOffline = almacen.bibliotecaDeCopias(copias, rutaNube);
    if (bibliotecaOffline.carpetas.length || bibliotecaOffline.libros.length) {
      estado.className = 'estado';
      estado.textContent = t('offlineLibrary');
      pintarListaRemota(
        bibliotecaOffline.carpetas,
        bibliotecaOffline.libros,
        copias,
        { soloCopias: true },
      );
      return;
    }
    // Si la subcarpeta abierta ya no existe (borrada desde otro sitio), se
    // vuelve a la raíz en lugar de dejar la sección bloqueada en un error.
    if (rutaNube) {
      rutaNube = '';
      return cargarBiblioteca();
    }
    estado.className = 'estado error';
    estado.textContent = explicarError(error);
    pintarRutaNube();
  }
}

let versionContinuarLeyendo = 0;

async function pintarContinuarLeyendo() {
  const version = ++versionContinuarLeyendo;
  const seccion = $('continuar-leyendo');
  const lista = $('libro-continuar');
  const ultimo = progreso.ultimoLibroLeido();
  lista.replaceChildren();
  seccion.classList.add('oculto');
  if (!ultimo) return;

  let nombre;
  let tamano = 0;
  let alAbrir;
  if (ultimo.id.startsWith('local:')) {
    const libros = await almacen.listarLibros().catch(() => []);
    if (version !== versionContinuarLeyendo) return;
    const libro = libros.find((candidato) => candidato.id === ultimo.id);
    if (!libro) return;
    nombre = libro.nombre;
    tamano = libro.tamano;
    alAbrir = () => abrirLibroLocal(libro);
  } else {
    if (!cliente) return;
    nombre = nombreDeId(ultimo.id);
    alAbrir = () => abrirLibroRemoto(ultimo.id);
  }

  const fila = crearFilaLibro({
    id: ultimo.id,
    titulo: nombre.replace(/\.(pdf|epub)$/i, ''),
    tamano,
    formato: formatoDe(nombre),
    alAbrir,
  });
  fila.dataset.destacado = 'true';
  lista.append(fila);
  seccion.classList.remove('oculto');
  aplicarFiltroBiblioteca();
  actualizarVisibilidadBuscadorBiblioteca();
}

// Crea la fila de un libro: botón principal para abrirlo y papelera para borrarlo.
function crearFilaLibro({
  id, titulo, tamano, formato, alAbrir, alSubir, alMover, alDescargar, alBorrar,
  alSinConexion, sinConexion = false, copiaDesactualizada = false,
}) {
  const avance = progreso.progresoDe(id);
  const porcentaje = avance?.paginas ? Math.round((avance.pagina / avance.paginas) * 100) : 0;

  const elemento = document.createElement('li');
  elemento.dataset.idLibro = id;
  elemento.dataset.busqueda = normalizarBusqueda(`${titulo} ${formato}`);
  const boton = document.createElement('button');
  boton.className = 'libro';
  boton.innerHTML = `
    <span class="portada">${icono(formato === 'epub' ? 'book-open' : 'book')}</span>
    <span class="datos">
      <span class="cabecera-libro">
        <span class="nombre"></span>
        <span class="formato formato-${formato}"></span>
        <span class="estado-sin-conexion oculto"></span>
      </span>
      <span class="autor oculto"></span>
      <span class="detalle"></span>
      <span class="barra-progreso"><div style="width:${porcentaje}%"></div></span>
    </span>`;
  // Los libros de la nube (los que se pueden mover) también admiten
  // arrastrarse hasta una carpeta de la lista o un tramo de la ruta.
  if (alMover) {
    boton.draggable = true;
    boton.addEventListener('dragstart', (evento) => {
      evento.dataTransfer.setData(TIPO_ARRASTRE_LIBRO, id);
      evento.dataTransfer.effectAllowed = 'move';
    });
  }

  const nombreLibro = boton.querySelector('.nombre');
  nombreLibro.textContent = titulo;
  nombreLibro.title = titulo;
  boton.querySelector('.formato').textContent = formato.toUpperCase();
  const estadoSinConexion = boton.querySelector('.estado-sin-conexion');
  if (sinConexion) {
    estadoSinConexion.textContent = t(copiaDesactualizada ? 'offlineOutdated' : 'availableOffline');
    estadoSinConexion.classList.remove('oculto');
    estadoSinConexion.classList.toggle('desactualizada', copiaDesactualizada);
  }
  boton.querySelector('.detalle').textContent = !avance
    ? `${(tamano / 1024 / 1024).toFixed(1)} MB · ${t('notStarted')}`
    : avance.cfi
      ? `${porcentaje}% ${t('read')}`
      : `${t('page')} ${avance.pagina} ${t('of')} ${avance.paginas} · ${porcentaje}%`;
  let pulsacionLarga = false;
  let temporizadorTitulo = null;
  let inicioPulsacion = null;
  nombreLibro.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType === 'mouse') return;
    pulsacionLarga = false;
    inicioPulsacion = { x: evento.clientX, y: evento.clientY };
    temporizadorTitulo = setTimeout(() => {
      pulsacionLarga = true;
      avisar(nombreLibro.textContent, 5000);
      navigator.vibrate?.(30);
    }, 550);
  });
  nombreLibro.addEventListener('pointermove', (evento) => {
    if (!inicioPulsacion) return;
    if (Math.hypot(evento.clientX - inicioPulsacion.x, evento.clientY - inicioPulsacion.y) > 8) {
      clearTimeout(temporizadorTitulo);
      inicioPulsacion = null;
    }
  });
  for (const tipo of ['pointerup', 'pointercancel', 'pointerleave']) {
    nombreLibro.addEventListener(tipo, () => {
      clearTimeout(temporizadorTitulo);
      inicioPulsacion = null;
    });
  }
  boton.addEventListener('click', (evento) => {
    if (pulsacionLarga) {
      evento.preventDefault();
      pulsacionLarga = false;
      return;
    }
    alAbrir(evento);
  });

  // Miniatura de la cubierta, si ya está generada.
  almacen.obtenerPortada(id).then((blob) => {
    if (blob) boton.querySelector('.portada').replaceChildren(crearImagenPortada(blob));
  }).catch(() => null);

  elemento.append(boton);

  if (alSubir) {
    const subir = document.createElement('button');
    subir.className = 'btn-fila-libro btn-subir-libro';
    subir.title = t('uploadBook', { title: titulo });
    subir.innerHTML = icono('cloud-upload');
    subir.addEventListener('click', alSubir);
    elemento.append(subir);
  }

  if (alMover) {
    const mover = document.createElement('button');
    mover.className = 'btn-fila-libro btn-mover-libro';
    mover.title = t('moveBook', { title: titulo });
    mover.innerHTML = icono('folder-input');
    mover.addEventListener('click', alMover);
    elemento.append(mover);
  }

  if (alDescargar) {
    const descargar = document.createElement('button');
    descargar.className = 'btn-fila-libro btn-descargar-libro';
    descargar.title = t('downloadBook', { title: titulo });
    descargar.innerHTML = icono('download');
    descargar.addEventListener('click', alDescargar);
    elemento.append(descargar);
  }

  if (alSinConexion) {
    const offline = document.createElement('button');
    offline.className = 'btn-fila-libro btn-sin-conexion';
    offline.classList.toggle('disponible', sinConexion && !copiaDesactualizada);
    offline.classList.toggle('desactualizada', copiaDesactualizada);
    offline.title = copiaDesactualizada
      ? t('updateOfflineCopy', { title: titulo })
      : sinConexion
        ? t('removeOfflineCopy', { title: titulo })
        : t('makeAvailableOffline', { title: titulo });
    offline.innerHTML = icono(copiaDesactualizada
      ? 'refresh-cw'
      : sinConexion ? 'cloud-check' : 'cloud-download');
    offline.addEventListener('click', alSinConexion);
    elemento.append(offline);
  }

  if (alBorrar) {
    const borrar = document.createElement('button');
    borrar.className = 'btn-fila-libro btn-borrar-libro';
    borrar.title = t('deleteBook', { title: titulo });
    borrar.innerHTML = icono('trash-2');
    borrar.addEventListener('click', alBorrar);
    elemento.append(borrar);
  }
  cargarMetadatosEnFila(elemento, id, titulo);
  return elemento;
}

function normalizarBusqueda(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

async function cargarMetadatosEnFila(fila, id, tituloArchivo = '') {
  const metadatos = await almacen.obtenerMetadatos(id).catch(() => null);
  if (!metadatos) return;
  const valores = Object.values(metadatos).filter(Boolean);
  fila.dataset.busqueda = normalizarBusqueda(`${tituloArchivo} ${fila.dataset.busqueda} ${valores.join(' ')}`);
  if (metadatos.titulo?.trim()) {
    const nombre = fila.querySelector('.nombre');
    nombre.textContent = metadatos.titulo.trim();
    nombre.title = metadatos.titulo.trim();
  }
  if (metadatos.autor?.trim()) {
    const autor = fila.querySelector('.autor');
    autor.textContent = metadatos.autor.trim();
    autor.classList.remove('oculto');
  }
  aplicarFiltroBiblioteca();
}

function aplicarFiltroBiblioteca() {
  const consulta = normalizarBusqueda($('buscar-biblioteca').value.trim());
  let visibles = 0;
  for (const fila of document.querySelectorAll('.lista-libros li')) {
    const coincide = !consulta || fila.dataset.busqueda?.includes(consulta);
    fila.classList.toggle('oculto', !coincide);
    if (coincide) visibles += 1;
  }
  const estado = $('estado-filtro-biblioteca');
  estado.textContent = consulta && !visibles ? t('noLibraryResults') : '';
  estado.classList.toggle('oculto', !estado.textContent);
  const filaContinuar = $('libro-continuar').firstElementChild;
  $('continuar-leyendo').classList.toggle(
    'oculto',
    !filaContinuar || filaContinuar.classList.contains('oculto'),
  );
}

$('buscar-biblioteca').addEventListener('input', aplicarFiltroBiblioteca);

function actualizarVisibilidadBuscadorBiblioteca() {
  const hayLibros = document.querySelector('.lista-libros li') !== null;
  document.querySelector('.buscador-biblioteca').classList.toggle('oculto', !hayLibros);
  if (!hayLibros) {
    $('buscar-biblioteca').value = '';
    $('estado-filtro-biblioteca').textContent = '';
    $('estado-filtro-biblioteca').classList.add('oculto');
  }
}

// ── Arrastrar un libro de la nube hasta una carpeta para moverlo ──

const TIPO_ARRASTRE_LIBRO = 'application/x-pagekeeper-libro';       // libro de la nube: mover
const TIPO_ARRASTRE_LOCAL = 'application/x-pagekeeper-libro-local'; // libro local: subir (copia)

function tiposArrastreLibro(evento) {
  const tipos = Array.from(evento.dataTransfer?.types ?? []);
  return {
    nube: tipos.includes(TIPO_ARRASTRE_LIBRO),
    local: tipos.includes(TIPO_ARRASTRE_LOCAL),
  };
}

// Lee el libro local serializado en un arrastre ({ id, nombre }).
function libroLocalArrastrado(evento) {
  try {
    const libro = JSON.parse(evento.dataTransfer.getData(TIPO_ARRASTRE_LOCAL));
    return libro?.id && libro?.nombre ? libro : null;
  } catch {
    return null;
  }
}

// Convierte un elemento en destino donde soltar un libro arrastrado: un
// libro de la nube se mueve a la carpeta indicada; uno local se sube (copia).
function hacerDestinoDeLibro(elemento, rutaDestino) {
  elemento.addEventListener('dragover', (evento) => {
    const { nube, local } = tiposArrastreLibro(evento);
    if (!nube && !local) return;
    evento.preventDefault();
    evento.stopPropagation();
    evento.dataTransfer.dropEffect = nube ? 'move' : 'copy';
    elemento.classList.add('destino-mover');
  });
  elemento.addEventListener('dragleave', () => elemento.classList.remove('destino-mover'));
  elemento.addEventListener('drop', (evento) => {
    const { nube, local } = tiposArrastreLibro(evento);
    if (!nube && !local) return;
    evento.preventDefault();
    evento.stopPropagation();
    elemento.classList.remove('destino-mover');
    if (nube) {
      const id = evento.dataTransfer.getData(TIPO_ARRASTRE_LIBRO);
      if (id) moverLibroA(id, rutaDestino);
    } else {
      const libro = libroLocalArrastrado(evento);
      if (libro) subirLibroLocalANube(libro, rutaDestino);
    }
  });
}

// Pinta una ruta como migas: la raíz y cada carpeta intermedia son botones
// que navegan al pulsar; la carpeta actual se muestra sin enlace. Con
// `admiteLibros`, cada tramo acepta también libros arrastrados para moverlos.
function pintarMigas(nav, ruta, alNavegar, admiteLibros = false) {
  nav.replaceChildren();
  const segmentos = ruta ? ruta.split('/') : [];
  const anadir = (texto, destino, esUltimo) => {
    if (esUltimo) {
      const actual = document.createElement('span');
      actual.className = 'miga-actual';
      actual.textContent = texto;
      nav.append(actual);
    } else {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'miga';
      boton.textContent = texto;
      boton.addEventListener('click', () => alNavegar(destino));
      if (admiteLibros) hacerDestinoDeLibro(boton, destino);
      nav.append(boton);
    }
  };
  anadir(t('cloudRoot'), '', segmentos.length === 0);
  segmentos.forEach((segmento, indice) => {
    const separador = document.createElement('span');
    separador.className = 'separador-miga';
    separador.textContent = '›';
    nav.append(separador);
    anadir(segmento, segmentos.slice(0, indice + 1).join('/'), indice === segmentos.length - 1);
  });
}

function pintarRutaNube() {
  const nav = $('ruta-carpeta');
  nav.classList.toggle('oculto', !rutaNube);
  pintarMigas(nav, rutaNube, (destino) => {
    rutaNube = destino;
    cargarBiblioteca();
  }, true);
}

function crearFilaCarpeta(nombre, soloLectura = false) {
  const elemento = document.createElement('li');
  elemento.dataset.busqueda = normalizarBusqueda(nombre);
  const boton = document.createElement('button');
  boton.className = 'libro carpeta';
  boton.title = t('openFolder', { name: nombre });
  boton.innerHTML = `
    <span class="portada portada-carpeta">${icono('folder')}</span>
    <span class="datos"><span class="cabecera-libro"><span class="nombre"></span></span></span>`;
  boton.querySelector('.nombre').textContent = nombre;
  boton.addEventListener('click', () => {
    rutaNube = rutaNube ? `${rutaNube}/${nombre}` : nombre;
    cargarBiblioteca();
  });
  hacerDestinoDeLibro(boton, rutaNube ? `${rutaNube}/${nombre}` : nombre);
  elemento.append(boton);

  if (!soloLectura) {
    const borrar = document.createElement('button');
    borrar.className = 'btn-fila-libro btn-borrar-libro';
    borrar.title = t('deleteFolder', { name: nombre });
    borrar.innerHTML = icono('trash-2');
    borrar.addEventListener('click', () => borrarCarpetaRemota(nombre));
    elemento.append(borrar);
  }
  return elemento;
}

function pintarListaRemota(carpetas, libros, copias = [], { soloCopias = false } = {}) {
  pintarRutaNube();
  const lista = $('lista-libros');
  lista.replaceChildren();
  const copiasPorId = new Map(copias.map((copia) => [copia.id, copia]));
  for (const carpeta of carpetas) lista.append(crearFilaCarpeta(carpeta.nombre, soloCopias));
  for (const libro of libros) {
    const id = idRemoto(libro.nombre);
    const copia = copiasPorId.get(id);
    const desactualizada = !soloCopias && almacen.copiaRemotaDesactualizada(copia, libro);
    lista.append(crearFilaLibro({
      id,
      titulo: libro.nombre.replace(/\.(pdf|epub)$/i, ''),
      tamano: libro.tamano,
      formato: formatoDe(libro.nombre),
      alAbrir: () => abrirLibroRemoto(id, libro),
      alMover: soloCopias ? null : () => abrirDialogoMover({ id, nombre: libro.nombre }),
      alDescargar: soloCopias ? () => descargarCopiaRemota(id) : () => descargarLibroRemoto(id),
      alBorrar: soloCopias ? null : () => borrarLibroRemoto(id),
      alSinConexion: copia && !desactualizada
        ? () => quitarCopiaSinConexion(id, libro.nombre)
        : () => guardarCopiaSinConexion(id, libro),
      sinConexion: Boolean(copia),
      copiaDesactualizada: desactualizada,
    }));
  }
  aplicarFiltroBiblioteca();
  actualizarVisibilidadBuscadorBiblioteca();
}

// ───────────────────────── Gestión de carpetas ─────────────────────────

function pedirNombreCarpeta() {
  const respuesta = prompt(t('folderNamePrompt'));
  if (respuesta === null) return null;
  const nombre = respuesta.trim();
  if (!nombre || /[/\\]/.test(nombre) || nombre.startsWith('.')) {
    avisar(t('invalidFolderName'));
    return null;
  }
  return nombre;
}

async function crearCarpetaRemota() {
  if (!cliente) return;
  const nombre = pedirNombreCarpeta();
  if (!nombre) return;
  mostrarCarga(t('creatingFolder', { name: nombre }));
  try {
    await cliente.crearCarpeta(rutaNube ? `${rutaNube}/${nombre}` : nombre);
    avisar(t('folderCreated', { name: nombre }));
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
}

$('btn-carpeta-nueva').addEventListener('click', crearCarpetaRemota);

async function borrarCarpetaRemota(nombre) {
  if (!cliente) return;
  if (!confirm(t('deleteFolderConfirm', { name: nombre }))) return;
  const ruta = rutaNube ? `${rutaNube}/${nombre}` : nombre;
  mostrarCarga(t('deleting', { title: nombre }));
  try {
    await cliente.borrar(ruta);
    // Limpia el progreso de todos los libros que colgaban de la carpeta.
    await progreso.olvidarPorPrefijo(ruta + '/', cliente).catch(() => null);
    await almacen.borrarCopiasRemotasPorPrefijo(cliente.base, ruta + '/').catch(() => null);
    avisar(t('folderDeleted'));
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
}

// ───────────────────────── Mover libros entre carpetas ─────────────────────────

let movimiento = null; // { id, nombre, ruta: carpeta de destino en exploración }

function cerrarDialogoMover() {
  movimiento = null;
  $('dialogo-mover').classList.add('oculto');
}

async function abrirDialogoMover(libro) {
  if (!cliente) return;
  movimiento = { id: libro.id, nombre: libro.nombre, ruta: carpetaDeId(libro.id) };
  $('titulo-mover').textContent = t('moveBook', { title: libro.nombre });
  $('dialogo-mover').classList.remove('oculto');
  await pintarDialogoMover();
}

// Explorador de carpetas del diálogo: migas + subcarpetas de la ruta actual.
async function pintarDialogoMover() {
  if (!movimiento) return;
  const estado = $('estado-mover');
  const lista = $('lista-carpetas-mover');
  pintarMigas($('ruta-mover'), movimiento.ruta, (destino) => {
    movimiento.ruta = destino;
    pintarDialogoMover();
  });
  lista.replaceChildren();
  estado.textContent = t('loadingFolders');
  $('btn-confirmar-mover').disabled = true;
  try {
    const ruta = movimiento.ruta;
    const { carpetas } = await cliente.listar(ruta);
    if (!movimiento || movimiento.ruta !== ruta) return; // navegación posterior
    estado.textContent = carpetas.length ? '' : t('noSubfolders');
    for (const carpeta of carpetas) {
      const li = document.createElement('li');
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'entrada-indice-libro entrada-carpeta-mover';
      boton.innerHTML = `${icono('folder')}<span class="titulo-entrada-indice"></span>`;
      boton.querySelector('.titulo-entrada-indice').textContent = carpeta.nombre;
      boton.addEventListener('click', () => {
        movimiento.ruta = movimiento.ruta ? `${movimiento.ruta}/${carpeta.nombre}` : carpeta.nombre;
        pintarDialogoMover();
      });
      li.append(boton);
      lista.append(li);
    }
    // Mover a la carpeta donde ya está no tiene sentido.
    $('btn-confirmar-mover').disabled = movimiento.ruta === carpetaDeId(movimiento.id);
  } catch (error) {
    if (movimiento) estado.textContent = explicarError(error);
  }
}

// Mueve un libro de la nube a otra carpeta (rutaDestino relativa a la base).
async function moverLibroA(id, rutaDestino) {
  if (!cliente) return;
  const nombre = nombreDeId(id);
  const destino = rutaDestino ? `${rutaDestino}/${nombre}` : nombre;
  if (destino === id) return;
  mostrarCarga(t('moving', { title: nombre }));
  try {
    let sobrescribir = false;
    if (await cliente.existe(destino)) {
      if (!confirm(t('overwrite', { title: destino }))) return;
      sobrescribir = true;
    }
    // Con el progreso al día, el traslado del id es un renombrado local
    // seguido de la limpieza del id antiguo y la subida del nuevo.
    await progreso.sincronizar(cliente).catch(() => null);
    await cliente.mover(id, destino, sobrescribir);
    progreso.renombrar(id, destino);
    await progreso.olvidar(id, cliente).catch(() => null);
    await progreso.sincronizar(cliente).catch(() => null);
    await trasladarCache(id, destino, sobrescribir);
    avisar(t('bookMoved', { title: nombre }));
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
}

$('btn-confirmar-mover').addEventListener('click', async () => {
  if (!movimiento || !cliente) return;
  const { id, ruta } = movimiento;
  cerrarDialogoMover();
  await moverLibroA(id, ruta);
});

$('btn-cancelar-mover').addEventListener('click', cerrarDialogoMover);
$('dialogo-mover').addEventListener('click', (evento) => {
  if (evento.target === $('dialogo-mover')) cerrarDialogoMover();
});

$('btn-carpeta-nueva-mover').addEventListener('click', async () => {
  if (!movimiento || !cliente) return;
  const nombre = pedirNombreCarpeta();
  if (!nombre) return;
  try {
    await cliente.crearCarpeta(movimiento.ruta ? `${movimiento.ruta}/${nombre}` : nombre);
    await pintarDialogoMover();
  } catch (error) {
    avisar(explicarError(error), 6000);
  }
});

// La miniatura y los metadatos ya generados se reutilizan bajo el id nuevo.
async function trasladarCache(idViejo, idNuevo, sobrescribir = false) {
  try {
    const [portada, metadatos] = await Promise.all([
      almacen.obtenerPortada(idViejo),
      almacen.obtenerMetadatos(idViejo),
    ]);
    if (portada) await almacen.guardarPortada(idNuevo, portada);
    if (metadatos) await almacen.guardarMetadatos(idNuevo, metadatos);
    await almacen.borrarPortada(idViejo);
  } catch { /* sin caché que trasladar: se regenerará sola */ }
  try {
    const movida = await almacen.moverCopiaRemota(cliente.base, idViejo, idNuevo);
    if (!movida && sobrescribir) await almacen.borrarCopiaRemota(cliente.base, idNuevo);
  } catch { /* la copia sin conexión se podrá volver a descargar */ }
}

async function cargarLibrosLocales() {
  const lista = $('lista-locales');
  let libros = [];
  try {
    libros = await almacen.listarLibros();
  } catch { /* IndexedDB no disponible (p. ej. navegación privada) */ }

  $('aviso-local-vacio').classList.toggle('oculto', libros.length > 0);
  lista.replaceChildren();
  for (const libro of libros) {
    const fila = crearFilaLibro({
      id: libro.id,
      titulo: libro.nombre.replace(/\.(pdf|epub)$/i, ''),
      tamano: libro.tamano,
      formato: formatoDe(libro.nombre),
      alAbrir: () => abrirLibroLocal(libro),
      // Subir a la nube: solo si hay servidor configurado.
      alSubir: cliente ? () => subirLibroLocalANube(libro) : null,
      alDescargar: () => descargarLibroLocal(libro),
      alBorrar: () => borrarLibroLocal(libro),
    });
    // Con nube configurada, el libro local también puede arrastrarse hasta
    // la sección remota o una de sus carpetas para subirlo.
    if (cliente) {
      const boton = fila.querySelector('.libro');
      boton.draggable = true;
      boton.addEventListener('dragstart', (evento) => {
        evento.dataTransfer.setData(TIPO_ARRASTRE_LOCAL,
          JSON.stringify({ id: libro.id, nombre: libro.nombre }));
        evento.dataTransfer.effectAllowed = 'copy';
      });
    }
    lista.append(fila);
  }
  aplicarFiltroBiblioteca();
  actualizarVisibilidadBuscadorBiblioteca();
}

$('btn-recargar').addEventListener('click', cargarBiblioteca);

// ───────────────────────── Portadas ─────────────────────────

function crearImagenPortada(blob) {
  const imagen = document.createElement('img');
  imagen.alt = '';
  imagen.onload = () => URL.revokeObjectURL(imagen.src);
  imagen.src = URL.createObjectURL(blob);
  return imagen;
}

async function ponerPortadaEnFila(id) {
  const blob = await almacen.obtenerPortada(id).catch(() => null);
  for (const fila of document.querySelectorAll('.lista-libros li')) {
    if (fila.dataset.idLibro === id) {
      if (blob) fila.querySelector('.portada')?.replaceChildren(crearImagenPortada(blob));
      cargarMetadatosEnFila(fila, id, fila.querySelector('.nombre')?.textContent ?? '');
    }
  }
}

// Genera en segundo plano las miniaturas de los libros de la nube que aún
// no la tienen (por ejemplo, subidos desde otro dispositivo). Descarga los
// libros de uno en uno y va actualizando las filas ya pintadas.
const LIMITE_PORTADA = 40 * 1024 * 1024; // no descargar automáticamente >40 MB
let generandoPortadas = false;

async function generarPortadasFaltantes(libros) {
  if (generandoPortadas) return;
  generandoPortadas = true;
  try {
    for (const libro of libros) {
      if (!cliente) break;
      if (libro.tamano > LIMITE_PORTADA) continue;
      try {
        const [portada, metadatos] = await Promise.all([
          almacen.obtenerPortada(libro.nombre),
          almacen.obtenerMetadatos(libro.nombre),
        ]);
        if (portada && metadatos) continue;
        const datos = await cliente.descargar(libro.nombre);
        if (await asegurarMiniatura(libro.nombre, formatoDe(libro.nombre), datos)) {
          await ponerPortadaEnFila(libro.nombre);
        }
      } catch {
        // Sin conexión o archivo problemático: se reintentará en otra carga.
      }
    }
  } finally {
    generandoPortadas = false;
  }
}

// ───────────────────────── Descargar libros ─────────────────────────

async function guardarCopiaSinConexion(id, libro) {
  if (!cliente) return;
  const nombre = libro.nombre ?? nombreDeId(id);
  mostrarCarga(t('savingOffline', { title: nombre }));
  try {
    await almacen.solicitarPersistencia();
    const datos = await cliente.descargar(id, (recibido, total) => {
      const pct = Math.round((recibido / total) * 100);
      $('texto-cargando').textContent = `${t('savingOffline', { title: nombre })} ${pct}%`;
    });
    await almacen.guardarCopiaRemota({
      servidor: cliente.base,
      id,
      nombre,
      tamano: libro.tamano || datos.byteLength,
      etag: libro.etag,
      modificado: libro.modificado,
    }, datos);
    asegurarMiniatura(id, formatoDe(nombre), datos);
    avisar(t('offlineSaved', {
      title: nombre,
      size: (datos.byteLength / 1024 / 1024).toFixed(1),
    }), 5000);
  } catch (error) {
    avisar(error?.name === 'QuotaExceededError'
      ? t('storageFull', { title: nombre })
      : explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
}

async function quitarCopiaSinConexion(id, nombre) {
  if (!cliente || !confirm(t('removeOfflineConfirm', { title: nombre }))) return;
  try {
    await almacen.borrarCopiaRemota(cliente.base, id);
    avisar(t('offlineRemoved'));
  } catch (error) {
    avisar(error.message, 6000);
  }
  cargarBiblioteca();
}

async function descargarCopiaRemota(id) {
  if (!cliente) return;
  try {
    const copia = await almacen.obtenerCopiaRemota(cliente.base, id);
    if (!copia) throw new Error(t('offlineFolderEmpty'));
    entregarDescarga(copia.nombre, copia.datos);
  } catch (error) {
    avisar(error.message, 6000);
  }
}

// Entrega los bytes al usuario como descarga del navegador.
function entregarDescarga(nombre, datos) {
  const tipo = /\.epub$/i.test(nombre) ? 'application/epub+zip' : 'application/pdf';
  const url = URL.createObjectURL(new Blob([datos], { type: tipo }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function descargarLibroRemoto(id) {
  if (!cliente) return;
  const nombre = nombreDeId(id);
  mostrarCarga(t('downloading', { title: nombre }));
  try {
    const datos = await cliente.descargar(id, (recibido, total) => {
      const pct = Math.round((recibido / total) * 100);
      $('texto-cargando').textContent = `${t('downloading', { title: nombre })} ${pct}%`;
    });
    entregarDescarga(nombre, datos);
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
  }
}

async function descargarLibroLocal(libro) {
  try {
    const datos = await almacen.obtenerDatos(libro.id);
    if (!datos) throw new Error('el libro ya no está en el almacén de este dispositivo');
    entregarDescarga(libro.nombre, datos);
  } catch (error) {
    avisar(`No se pudo descargar: ${error.message}`, 6000);
  }
}

// Si el destino ya estaba fijado para leer sin conexión, una sobrescritura
// hecha desde PageKeeper actualiza también esa copia en lugar de dejar bytes
// antiguos con metadatos aparentemente vigentes.
async function actualizarCopiaGuardada(id, nombre, datos) {
  if (!cliente) return;
  const existente = await almacen.obtenerInfoCopiaRemota(cliente.base, id).catch(() => null);
  if (!existente) return;
  try {
    await almacen.guardarCopiaRemota({
      servidor: cliente.base,
      id,
      nombre,
      tamano: datos.byteLength,
    }, datos);
  } catch { /* la subida ya terminó; la copia se actualizará al abrirla */ }
}

// Sube un libro de este dispositivo a una carpeta de la nube (por defecto,
// la abierta), conservando el progreso bajo el identificador de la nube.
async function subirLibroLocalANube(libro, rutaDestino = rutaNube) {
  if (!cliente) return;
  let nombre = libro.nombre;
  if (!/\.(pdf|epub)$/i.test(nombre)) nombre += '.pdf';
  const destino = rutaDestino ? `${rutaDestino}/${nombre}` : nombre;

  try {
    if (await cliente.existe(destino) &&
        !confirm(t('overwrite', { title: nombre }))) {
      return;
    }
  } catch (error) {
    avisar(explicarError(error), 6000);
    return;
  }

  mostrarCarga(t('uploading', { title: nombre }));
  try {
    const datos = await almacen.obtenerDatos(libro.id);
    if (!datos) throw new Error('no se encontró el libro en este dispositivo');
    await cliente.subir(destino, datos);
    await actualizarCopiaGuardada(destino, nombre, datos);
    asegurarMiniatura(destino, formatoDe(nombre), datos);

    const avance = progreso.progresoDe(libro.id);
    if (avance) {
      progreso.anotarPagina(destino, avance.pagina, avance.paginas, {
        ...(avance.cfi ? { cfi: avance.cfi } : {}),
        ...(avance.marcadores?.length ? { marcadores: avance.marcadores } : {}),
      });
    }
    await progreso.sincronizar(cliente).catch(() => null);
    avisar(t('cloudUploaded', { title: nombre }));
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
}

// ───────────────────────── Borrar libros ─────────────────────────

async function borrarLibroRemoto(id) {
  if (!cliente) return;
  const nombre = nombreDeId(id);
  if (!confirm(t('deleteCloudConfirm', { title: nombre }))) return;
  mostrarCarga(t('deleting', { title: nombre }));
  try {
    await cliente.borrar(id);
    await almacen.borrarCopiaRemota(cliente.base, id).catch(() => null);
    let limpiezaPendiente = false;
    try {
      await progreso.olvidar(id, cliente);
    } catch {
      limpiezaPendiente = true;
    }
    almacen.borrarPortada(id).catch(() => null);
    avisar(t(limpiezaPendiente ? 'cloudBookDeletedPending' : 'cloudBookDeleted'), limpiezaPendiente ? 6000 : 3500);
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
}

async function borrarLibroLocal(libro) {
  if (!confirm(t('deleteLocalConfirm', { title: libro.nombre }))) return;
  try {
    await almacen.borrarLibro(libro.id);
    await progreso.olvidar(libro.id).catch(() => null);
    avisar(t('localBookDeleted'));
  } catch (error) {
    avisar(`No se pudo borrar: ${error.message}`, 6000);
  }
  cargarLibrosLocales();
  pintarContinuarLeyendo();
}

// ───────────────────────── Abrir libros ─────────────────────────

async function abrirLibroRemoto(id, infoRemota = {}) {
  const nombre = nombreDeId(id);
  mostrarCarga(t('downloading', { title: nombre }));
  try {
    // Antes de abrir, trae el progreso más reciente de otros dispositivos.
    await progreso.sincronizar(cliente).catch(() => null);
    const infoCopia = await almacen.obtenerInfoCopiaRemota(cliente.base, id).catch(() => null);
    let datos = null;
    let desdeCopia = false;
    let falloActualizacion = false;
    let errorRed = null;
    if (navigator.onLine !== false) {
      try {
        datos = await cliente.descargar(id, (recibido, total) => {
          const pct = Math.round((recibido / total) * 100);
          $('texto-cargando').textContent = `${t('downloading', { title: nombre })} ${pct}%`;
        });
        if (infoCopia) {
          try {
            await almacen.guardarCopiaRemota({
              servidor: cliente.base,
              id,
              nombre,
              tamano: infoRemota.tamano || infoCopia.tamano || datos.byteLength,
              etag: infoRemota.etag ?? infoCopia.etag,
              modificado: infoRemota.modificado ?? infoCopia.modificado,
            }, datos);
          } catch {
            falloActualizacion = true;
          }
        }
      } catch (error) {
        errorRed = error;
      }
    }
    if (!datos && infoCopia) {
      const copia = await almacen.obtenerCopiaRemota(cliente.base, id);
      datos = copia?.datos ?? null;
      desdeCopia = Boolean(datos);
    }
    if (!datos) throw errorRed ?? new Error(t('offlineFolderEmpty'));
    asegurarMiniatura(id, formatoDe(nombre), datos);
    await abrirEnLector(datos, {
      id,
      titulo: nombre.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'webdav',
      formato: formatoDe(nombre),
    });
    if (desdeCopia) avisar(t('openedOfflineCopy'), 5000);
    else if (falloActualizacion) avisar(t('offlineUpdateFailed'), 5000);
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
  }
}

async function abrirLibroLocal(libro) {
  mostrarCarga(t('opening', { title: libro.nombre }));
  try {
    const datos = await almacen.obtenerDatos(libro.id);
    if (!datos) throw new Error('el libro ya no está en el almacén de este dispositivo');
    asegurarMiniatura(libro.id, formatoDe(libro.nombre), datos);
    await abrirEnLector(datos, {
      id: libro.id,
      titulo: libro.nombre.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'local',
      nombre: libro.nombre,
      formato: formatoDe(libro.nombre),
    });
  } catch (error) {
    avisar(`No se pudo abrir el libro: ${error.message}`, 6000);
  } finally {
    ocultarCarga();
  }
}

function archivosCompatibles(archivos) {
  return Array.from(archivos).filter((archivo) => /\.(pdf|epub)$/i.test(archivo.name));
}

async function guardarArchivoLocal(archivo, abrirDespues = false) {
  mostrarCarga(t('adding', { title: archivo.name }));
  const datos = new Uint8Array(await archivo.arrayBuffer());
  const libro = {
    id: `local:${archivo.name}:${archivo.size}`,
    nombre: archivo.name,
    tamano: archivo.size,
  };
  await almacen.guardarLibro(libro, datos);
  asegurarMiniatura(libro.id, formatoDe(archivo.name), datos);
  if (abrirDespues) {
    await abrirEnLector(datos, {
      id: libro.id,
      titulo: archivo.name.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'local',
      nombre: archivo.name,
      formato: formatoDe(archivo.name),
    });
  }
}

async function guardarArchivosLocales(archivos, abrirSiEsUno = false) {
  const validos = archivosCompatibles(archivos);
  if (!validos.length) {
    avisar(t('unsupportedFiles'));
    return;
  }
  let guardados = 0;
  try {
    for (const archivo of validos) {
      try {
        await guardarArchivoLocal(archivo, abrirSiEsUno && validos.length === 1);
        guardados += 1;
      } catch (error) {
        avisar(t('saveFailed', { title: archivo.name, error: error.message }), 6000);
      }
    }
  } finally {
    ocultarCarga();
  }
  if (!(abrirSiEsUno && validos.length === 1)) {
    await cargarLibrosLocales();
    if (guardados) avisar(t(guardados === 1 ? 'localAddedOne' : 'localAddedMany', { count: guardados }));
  }
}

async function subirArchivoANube(archivo) {
  if (!cliente) return false;
  const nombre = archivo.name;
  const destino = idRemoto(nombre); // se sube a la carpeta abierta
  try {
    if (await cliente.existe(destino) &&
        !confirm(t('overwrite', { title: nombre }))) {
      return false;
    }
    mostrarCarga(t('uploading', { title: nombre }));
    const datos = new Uint8Array(await archivo.arrayBuffer());
    await cliente.subir(destino, datos);
    await actualizarCopiaGuardada(destino, nombre, datos);
    await asegurarMiniatura(destino, formatoDe(nombre), datos);
    avisar(t('cloudUploaded', { title: nombre }));
    return true;
  } catch (error) {
    avisar(explicarError(error), 6000);
    return false;
  } finally {
    ocultarCarga();
  }
}

async function subirArchivosANube(archivos) {
  const validos = archivosCompatibles(archivos);
  if (!validos.length) {
    avisar(t('unsupportedFiles'));
    return;
  }
  for (const archivo of validos) await subirArchivoANube(archivo);
  cargarBiblioteca();
}

// Los selectores y el arrastre comparten el mismo procesamiento; el selector
// local conserva el comportamiento anterior de abrir un único libro.
$('selector-archivo').addEventListener('change', (evento) => {
  const archivos = [...evento.target.files];
  evento.target.value = '';
  guardarArchivosLocales(archivos, true);
});

$('aviso-local-vacio').addEventListener('click', () => $('selector-archivo').click());

$('selector-subir-nube').addEventListener('change', (evento) => {
  const archivos = [...evento.target.files];
  evento.target.value = '';
  subirArchivosANube(archivos);
});

// ───────────────────────── Arrastrar archivos ─────────────────────────

function contieneArchivos(evento) {
  return Array.from(evento.dataTransfer?.types ?? []).includes('Files');
}

function terminarArrastre() {
  document.body.classList.remove('arrastrando-archivos');
  document.querySelectorAll('.sobre-destino').forEach((zona) => zona.classList.remove('sobre-destino'));
}

document.addEventListener('dragover', (evento) => {
  if (!contieneArchivos(evento)) return;
  evento.preventDefault();
  document.body.classList.add('arrastrando-archivos');
});

document.addEventListener('drop', (evento) => {
  if (contieneArchivos(evento)) evento.preventDefault();
  terminarArrastre();
});

document.addEventListener('dragleave', (evento) => {
  if (!evento.relatedTarget) terminarArrastre();
});

for (const [id, alSoltar] of [
  ['zona-local', (archivos) => guardarArchivosLocales(archivos)],
  ['zona-remota', (archivos) => subirArchivosANube(archivos)],
]) {
  const zona = $(id);
  zona.addEventListener('dragenter', (evento) => {
    if (!contieneArchivos(evento)) return;
    evento.preventDefault();
    zona.classList.add('sobre-destino');
  });
  zona.addEventListener('dragleave', (evento) => {
    if (!zona.contains(evento.relatedTarget)) zona.classList.remove('sobre-destino');
  });
  zona.addEventListener('dragover', (evento) => {
    if (!contieneArchivos(evento)) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = 'copy';
  });
  zona.addEventListener('drop', (evento) => {
    if (!contieneArchivos(evento)) return;
    evento.preventDefault();
    evento.stopPropagation();
    const archivos = [...evento.dataTransfer.files];
    terminarArrastre();
    alSoltar(archivos);
  });
}

// Soltar un libro local sobre la sección de la nube lo sube a la carpeta
// abierta (las carpetas de la lista tienen su propio destino más específico).
{
  const zona = $('zona-remota');
  zona.addEventListener('dragover', (evento) => {
    if (!tiposArrastreLibro(evento).local) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = 'copy';
    zona.classList.add('sobre-destino');
  });
  zona.addEventListener('dragleave', (evento) => {
    if (!zona.contains(evento.relatedTarget)) zona.classList.remove('sobre-destino');
  });
  zona.addEventListener('drop', (evento) => {
    if (!tiposArrastreLibro(evento).local) return;
    evento.preventDefault();
    zona.classList.remove('sobre-destino');
    const libro = libroLocalArrastrado(evento);
    if (libro) subirLibroLocalANube(libro, rutaNube);
  });
}

async function abrirEnLector(datos, libro) {
  cerrarBusquedaLibro();
  cerrarIndiceLibro();
  cerrarPanelMarcadores();
  reiniciarHistorialNavegacion();
  $('lista-indice-libro').replaceChildren();
  $('btn-indice-libro').classList.add('oculto');
  $('buscar-en-libro').value = '';
  $('estado-busqueda-libro').textContent = '';
  $('resultados-busqueda-libro').replaceChildren();
  libroActual = libro;
  $('titulo-libro').textContent = libro.titulo;
  // El botón de subir solo tiene sentido con un libro local y una nube configurada.
  $('btn-subir').classList.toggle('oculto', !(libro.tipo === 'local' && cliente));
  const esEpub = libro.formato === 'epub';
  $('contenedor-pagina').classList.toggle('oculto', esEpub);
  $('contenedor-epub').classList.toggle('oculto', !esEpub);
  $('control-texto').classList.toggle('oculto', !esEpub);
  cerrarPanelTexto();
  const avance = progreso.progresoDe(libro.id);
  mostrarVista('lector');
  registrarVistaLector();

  try {
    if (esEpub) {
      $('btn-indicador').textContent = '…';
      aplicarMargenEpub();
      lectorEpub.tamano = letraEpubGuardada();
      lectorEpub.fuente = fuenteEpubGuardada();
      lectorEpub.interlineado = interlineadoEpubGuardado();
      await lectorEpub.abrir(datos, avance?.cfi ?? null, modoActual());
      lectorEpub.aplicarNoche(document.body.classList.contains('modo-noche'));
      if (avance?.cfi) avisar(t('continuing'));
    } else {
      lectorEpub.cerrar();
      await lector.abrir(datos, avance?.pagina ?? 1, modoActual(), zoomPdfGuardado());
      if (avance && avance.pagina > 1) {
        avisar(t('continuingPage', { page: avance.pagina }));
      }
    }
    await cargarIndiceLibro(esEpub ? lectorEpub : lector, libro.id);
  } catch (error) {
    cerrarVistaLector();
    if (history.state?.[ESTADO_VISTA] === 'lector') history.back();
    throw error;
  }
}

// Sube el libro local abierto a la carpeta de la nube y lo convierte en un
// libro sincronizado, conservando la posición actual.
async function subirLibroActual() {
  if (!libroActual || libroActual.tipo !== 'local' || !cliente) return;

  let nombre = libroActual.nombre ?? libroActual.titulo;
  if (!/\.(pdf|epub)$/i.test(nombre)) nombre += libroActual.formato === 'epub' ? '.epub' : '.pdf';
  const destino = idRemoto(nombre); // se sube a la carpeta abierta en la biblioteca

  try {
    if (await cliente.existe(destino) &&
        !confirm(t('overwrite', { title: nombre }))) {
      return;
    }
  } catch (error) {
    avisar(explicarError(error), 6000);
    return;
  }

  mostrarCarga(t('uploading', { title: nombre }));
  try {
    const datos = await almacen.obtenerDatos(libroActual.id);
    if (!datos) throw new Error('no se encontró el libro en el almacén de este dispositivo');
    await cliente.subir(destino, datos);
    await actualizarCopiaGuardada(destino, nombre, datos);
    asegurarMiniatura(destino, libroActual.formato, datos);

    // Traspasa la posición de lectura y los marcadores del identificador
    // local al de la nube (la ruta del archivo) para no empezar de cero.
    const marcadores = progreso.marcadoresDe(libroActual.id);
    const extra = marcadores.length ? { marcadores } : {};
    if (libroActual.formato === 'epub') {
      progreso.anotarPagina(destino, lectorEpub.porcentaje, 100, { cfi: lectorEpub.cfi, ...extra });
    } else {
      progreso.anotarPagina(destino, lector.pagina, lector.totalPaginas, extra);
    }

    libroActual = {
      id: destino,
      titulo: nombre.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'webdav',
      formato: formatoDe(nombre),
    };
    $('titulo-libro').textContent = libroActual.titulo;
    $('btn-subir').classList.add('oculto');
    await progreso.sincronizar(cliente).catch(() => null);
    avisar(t('cloudSaved'));
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
  }
}

$('btn-subir').addEventListener('click', subirLibroActual);

// ───────────────────────── Modo de lectura ─────────────────────────

function modoActual() {
  return localStorage.getItem(CLAVE_MODO) === 'continuo' ? 'continuo' : 'pagina';
}

function aplicarAparienciaModo(modo) {
  $('vista-lector').classList.toggle('modo-continuo', modo === 'continuo');
  $('btn-modo').innerHTML = icono(modo === 'continuo' ? 'file-text' : 'scroll-text');
  $('btn-modo').title = modo === 'continuo'
    ? t('pageMode')
    : t('scrollMode');
}

$('btn-modo').addEventListener('click', async () => {
  const nuevo = modoActual() === 'continuo' ? 'pagina' : 'continuo';
  localStorage.setItem(CLAVE_MODO, nuevo);
  aplicarAparienciaModo(nuevo);
  if (epubAbierto()) await lectorEpub.cambiarModo(nuevo);
  else await lector.cambiarModo(nuevo);
});

// ───────────────────────── Progreso y sincronización ─────────────────────────

function planificarSincronizacion() {
  if (libroActual?.tipo !== 'webdav' || !cliente) return;
  clearTimeout(temporizadorSync);
  temporizadorSync = setTimeout(() => {
    progreso.sincronizar(cliente).catch(() => {
      // Sin conexión: el progreso queda en local y subirá la próxima vez.
    });
  }, 3000);
}

function cuandoCambiaPagina(pagina, total) {
  $('btn-indicador').textContent = `${pagina} / ${total}`;
  if (!libroActual) return;
  progreso.anotarPagina(libroActual.id, pagina, total);
  planificarSincronizacion();
}

function cuandoCambiaPosicionEpub(cfi, porcentaje, conLocalizaciones) {
  $('btn-indicador').textContent = conLocalizaciones ? `${porcentaje}%` : '…';
  if (!libroActual || !cfi) return;
  // Mientras no hay localizaciones se conserva el % anterior para no
  // machacar la barra de progreso de la biblioteca con un cero.
  const pct = conLocalizaciones
    ? porcentaje
    : (progreso.progresoDe(libroActual.id)?.pagina ?? 0);
  progreso.anotarPagina(libroActual.id, pct, 100, { cfi });
  planificarSincronizacion();
}

// ───────────────────────── Controles del lector ─────────────────────────

let resultadosBusquedaLibro = [];
let versionBusquedaLibro = 0;
const historialNavegacion = { atras: [], adelante: [] };
const consultaMovil = window.matchMedia('(max-width: 700px), (pointer: coarse)');

function posicionActualLibro() {
  return epubAbierto() ? lectorEpub.cfi : lector.pagina;
}

function actualizarHistorialNavegacion() {
  const hayAtras = historialNavegacion.atras.length > 0;
  const hayAdelante = historialNavegacion.adelante.length > 0;
  const hayHistorial = hayAtras || hayAdelante;
  $('btn-posicion-anterior').disabled = !hayAtras;
  $('btn-posicion-siguiente').disabled = !hayAdelante;
  $('historial-navegacion').classList.toggle('oculto', !hayHistorial);
  $('btn-indicador').classList.toggle('tiene-historial', hayHistorial);
  $('btn-indicador').title = hayHistorial ? t('pageAndHistory') : t('goPage');
  if (!hayHistorial) cerrarHistorialMovil();
}

function cerrarHistorialMovil() {
  $('historial-navegacion').classList.remove('abierto-movil');
  $('btn-indicador').setAttribute('aria-expanded', 'false');
}

function abrirHistorialMovil() {
  if (!consultaMovil.matches || $('historial-navegacion').classList.contains('oculto')) return;
  $('historial-navegacion').classList.add('abierto-movil');
  $('btn-indicador').setAttribute('aria-expanded', 'true');
}

function reiniciarHistorialNavegacion() {
  historialNavegacion.atras = [];
  historialNavegacion.adelante = [];
  actualizarHistorialNavegacion();
}

async function saltarConHistorial(destino) {
  if (destino === null || destino === undefined) return;
  const activo = epubAbierto() ? lectorEpub : lector;
  const anterior = posicionActualLibro();
  if (anterior === destino) return;
  const atrasAnterior = [...historialNavegacion.atras];
  const adelanteAnterior = [...historialNavegacion.adelante];
  if (anterior !== null && anterior !== undefined && anterior !== destino) {
    historialNavegacion.atras.push(anterior);
    if (historialNavegacion.atras.length > 50) historialNavegacion.atras.shift();
  }
  historialNavegacion.adelante = [];
  try {
    await activo.irA(destino);
  } catch (error) {
    historialNavegacion.atras = atrasAnterior;
    historialNavegacion.adelante = adelanteAnterior;
    throw error;
  } finally {
    actualizarHistorialNavegacion();
  }
  abrirHistorialMovil();
}

async function moverPorHistorial(origen, destino) {
  if (!origen.length) return;
  const objetivo = origen.pop();
  const actual = posicionActualLibro();
  try {
    await (epubAbierto() ? lectorEpub : lector).irA(objetivo);
    if (actual !== null && actual !== undefined) destino.push(actual);
  } catch (error) {
    origen.push(objetivo);
    throw error;
  } finally {
    actualizarHistorialNavegacion();
  }
}

$('btn-posicion-anterior').addEventListener('click', () => {
  moverPorHistorial(historialNavegacion.atras, historialNavegacion.adelante)
    .catch((error) => avisar(error.message, 5000))
    .finally(cerrarHistorialMovil);
});
$('btn-posicion-siguiente').addEventListener('click', () => {
  moverPorHistorial(historialNavegacion.adelante, historialNavegacion.atras)
    .catch((error) => avisar(error.message, 5000))
    .finally(cerrarHistorialMovil);
});

function cerrarIndiceLibro() {
  $('panel-indice-libro').classList.add('oculto');
  $('btn-indice-libro').setAttribute('aria-expanded', 'false');
}

async function cargarIndiceLibro(lectorActivo, idLibro) {
  try {
    const entradas = await lectorActivo.indice();
    if (libroActual?.id !== idLibro) return;
    const lista = $('lista-indice-libro');
    lista.replaceChildren();
    for (const entrada of entradas) {
      const li = document.createElement('li');
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'entrada-indice-libro';
      boton.style.paddingLeft = `${0.65 + Math.min(entrada.nivel, 6) * 0.85}rem`;
      const titulo = document.createElement('span');
      titulo.className = 'titulo-entrada-indice';
      titulo.textContent = entrada.esInicio ? t('bookStart') : entrada.titulo;
      boton.append(titulo);
      if (entrada.numero) {
        const pagina = document.createElement('span');
        pagina.className = 'pagina-entrada-indice';
        pagina.textContent = `${t('page')} ${entrada.numero}`;
        boton.append(pagina);
      }
      boton.addEventListener('click', async () => {
        try {
          await saltarConHistorial(entrada.destino);
          cerrarIndiceLibro();
        } catch (error) {
          avisar(error.message, 5000);
        }
      });
      li.append(boton);
      lista.append(li);
    }
    $('btn-indice-libro').classList.toggle('oculto', entradas.length === 0);
  } catch {
    $('btn-indice-libro').classList.add('oculto');
  }
}

// ───────────────────────── Marcadores ─────────────────────────

function cerrarPanelMarcadores() {
  $('panel-marcadores').classList.add('oculto');
  $('btn-marcadores').setAttribute('aria-expanded', 'false');
}

// Posición que guardaría un marcador creado ahora mismo. En EPUB el
// porcentaje puede no conocerse aún (localizaciones en curso).
function posicionMarcadorActual() {
  if (epubAbierto()) {
    if (!lectorEpub.cfi) return null;
    return {
      cfi: lectorEpub.cfi,
      ...(lectorEpub.conLocalizaciones ? { porcentaje: lectorEpub.porcentaje } : {}),
    };
  }
  return { pagina: lector.pagina };
}

function etiquetaMarcador(marcador) {
  if (marcador.pagina) return `${t('page')} ${marcador.pagina}`;
  if (Number.isFinite(marcador.porcentaje)) return `${marcador.porcentaje} %`;
  return t('bookmark');
}

function tituloMarcador(marcador) {
  return marcador.nombre?.trim() || etiquetaMarcador(marcador);
}

function detalleMarcador(marcador) {
  const partes = [];
  if (marcador.nombre?.trim()) partes.push(etiquetaMarcador(marcador));
  if (marcador.creado) partes.push(new Date(marcador.creado).toLocaleDateString(idiomaActual()));
  return partes.join(' · ');
}

// Mantiene la lista en el orden del libro. En EPUB compara los CFI con el
// comparador de epub.js (cargado siempre que hay un EPUB abierto).
function ordenarMarcadores(marcadores) {
  if (epubAbierto() && window.ePub?.CFI) {
    try {
      const comparador = new window.ePub.CFI();
      marcadores.sort((a, b) => comparador.compare(a.cfi, b.cfi));
      return;
    } catch { /* CFI ilegible: se mantiene el orden por página/creación */ }
  }
  marcadores.sort((a, b) => (a.pagina ?? 0) - (b.pagina ?? 0));
}

function pintarMarcadores() {
  if (!libroActual) return;
  const marcadores = progreso.marcadoresDe(libroActual.id);
  const lista = $('lista-marcadores');
  lista.replaceChildren();
  $('sin-marcadores').classList.toggle('oculto', marcadores.length > 0);
  marcadores.forEach((marcador, indice) => {
    const li = document.createElement('li');
    li.className = 'fila-marcador';
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'entrada-indice-libro';
    const titulo = document.createElement('span');
    titulo.className = 'titulo-entrada-indice';
    titulo.textContent = tituloMarcador(marcador);
    boton.append(titulo);
    const detalle = detalleMarcador(marcador);
    if (detalle) {
      const fecha = document.createElement('span');
      fecha.className = 'pagina-entrada-indice';
      fecha.textContent = detalle;
      boton.append(fecha);
    }
    boton.addEventListener('click', async () => {
      try {
        await saltarConHistorial(marcador.cfi ?? marcador.pagina);
        cerrarPanelMarcadores();
      } catch (error) {
        avisar(error.message, 5000);
      }
    });
    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'btn-icono btn-editar-marcador';
    editar.title = t('editBookmark');
    editar.innerHTML = icono('pencil');
    editar.addEventListener('click', () => {
      const respuesta = prompt(t('bookmarkNamePrompt'), marcador.nombre ?? '');
      if (respuesta === null) return;
      const actuales = progreso.marcadoresDe(libroActual.id);
      const nombre = respuesta.trim().slice(0, 120);
      if (nombre) actuales[indice].nombre = nombre;
      else delete actuales[indice].nombre;
      progreso.guardarMarcadores(libroActual.id, actuales);
      planificarSincronizacion();
      pintarMarcadores();
      avisar(t('bookmarkRenamed'));
    });
    const borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.className = 'btn-icono btn-borrar-marcador';
    borrar.title = t('deleteBookmark');
    borrar.innerHTML = icono('trash-2');
    borrar.addEventListener('click', () => {
      const actuales = progreso.marcadoresDe(libroActual.id);
      actuales.splice(indice, 1);
      progreso.guardarMarcadores(libroActual.id, actuales);
      planificarSincronizacion();
      pintarMarcadores();
      avisar(t('bookmarkRemoved'));
    });
    li.append(boton, editar, borrar);
    lista.append(li);
  });
}

$('form-anadir-marcador').addEventListener('submit', (evento) => {
  evento.preventDefault();
  if (!libroActual) return;
  const posicion = posicionMarcadorActual();
  if (!posicion) return; // EPUB recién abierto, sin posición todavía
  const marcadores = progreso.marcadoresDe(libroActual.id);
  const repetido = marcadores.some((marcador) =>
    posicion.cfi ? marcador.cfi === posicion.cfi : marcador.pagina === posicion.pagina);
  if (repetido) {
    avisar(t('bookmarkExists'));
    return;
  }
  const nombre = $('nombre-marcador').value.trim().slice(0, 120);
  marcadores.push({ ...posicion, ...(nombre ? { nombre } : {}), creado: new Date().toISOString() });
  ordenarMarcadores(marcadores);
  progreso.guardarMarcadores(libroActual.id, marcadores);
  planificarSincronizacion();
  pintarMarcadores();
  $('nombre-marcador').value = '';
  avisar(t('bookmarkAdded'));
});

$('btn-marcadores').addEventListener('click', () => {
  const panel = $('panel-marcadores');
  cerrarIndiceLibro();
  cerrarBusquedaLibro();
  const abrir = panel.classList.contains('oculto');
  panel.classList.toggle('oculto', !abrir);
  $('btn-marcadores').setAttribute('aria-expanded', String(abrir));
  if (abrir) pintarMarcadores();
});
$('cerrar-marcadores').addEventListener('click', cerrarPanelMarcadores);

function cerrarBusquedaLibro() {
  versionBusquedaLibro += 1;
  $('panel-busqueda-libro').classList.add('oculto');
}

$('btn-buscar-libro').addEventListener('click', () => {
  const panel = $('panel-busqueda-libro');
  cerrarIndiceLibro();
  cerrarPanelMarcadores();
  panel.classList.toggle('oculto');
  if (!panel.classList.contains('oculto')) $('buscar-en-libro').focus();
});
$('cerrar-busqueda-libro').addEventListener('click', cerrarBusquedaLibro);

$('btn-indice-libro').addEventListener('click', () => {
  const panel = $('panel-indice-libro');
  cerrarBusquedaLibro();
  cerrarPanelMarcadores();
  const abrir = panel.classList.contains('oculto');
  panel.classList.toggle('oculto', !abrir);
  $('btn-indice-libro').setAttribute('aria-expanded', String(abrir));
  if (abrir) panel.querySelector('.entrada-indice-libro')?.focus();
});
$('cerrar-indice-libro').addEventListener('click', cerrarIndiceLibro);

$('form-busqueda-libro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const consulta = $('buscar-en-libro').value.trim();
  if (!consulta) return;
  const version = ++versionBusquedaLibro;
  const estado = $('estado-busqueda-libro');
  const lista = $('resultados-busqueda-libro');
  estado.textContent = t('searchingBook');
  lista.replaceChildren();
  try {
    const esEpub = epubAbierto();
    const activo = esEpub ? lectorEpub : lector;
    resultadosBusquedaLibro = await activo.buscar(consulta);
    if (version !== versionBusquedaLibro) return;
    estado.textContent = resultadosBusquedaLibro.length
      ? t('searchResults', { count: resultadosBusquedaLibro.length })
      : t('noSearchResults');
    resultadosBusquedaLibro.forEach((resultado, indice) => {
      const li = document.createElement('li');
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'resultado-busqueda';
      const ubicacion = document.createElement('strong');
      ubicacion.textContent = esEpub
        ? `${t('chapter')} ${resultado.numero}`
        : `${t('page')} ${resultado.numero}`;
      const fragmento = document.createElement('span');
      fragmento.textContent = resultado.fragmento;
      boton.append(ubicacion, fragmento);
      boton.addEventListener('click', async () => {
        const elegido = resultadosBusquedaLibro[indice];
        try {
          await saltarConHistorial(elegido.destino);
          cerrarBusquedaLibro();
        } catch (error) {
          avisar(error.message, 5000);
        }
      });
      li.append(boton);
      lista.append(li);
    });
  } catch (error) {
    if (version === versionBusquedaLibro) estado.textContent = error.message;
  }
});

$('btn-volver').addEventListener('click', () => {
  if (history.state?.[ESTADO_VISTA] === 'lector') history.back();
  else cerrarVistaLector();
});

$('zona-anterior').addEventListener('click', () => (epubAbierto() ? lectorEpub : lector).anterior());
$('zona-siguiente').addEventListener('click', () => (epubAbierto() ? lectorEpub : lector).siguiente());
async function ajustarZoom(direccion) {
  if (epubAbierto()) {
    lectorEpub.cambiarTamano(direccion * 10);
    localStorage.setItem(CLAVE_LETRA_EPUB, String(lectorEpub.tamano));
  } else {
    await lector.cambiarZoom(direccion > 0 ? 1.2 : 1 / 1.2);
    localStorage.setItem(CLAVE_ZOOM_PDF, String(lector.zoom));
  }
}
$('btn-zoom-menos').addEventListener('click', () => ajustarZoom(-1));
$('btn-zoom-mas').addEventListener('click', () => ajustarZoom(1));

function cerrarPanelTexto() {
  $('panel-texto').hidden = true;
  $('btn-texto').setAttribute('aria-expanded', 'false');
}

// Refleja en los selectores los valores guardados en este dispositivo.
function pintarAjustesTexto() {
  $('fuente-epub').value = fuenteEpubGuardada();
  const interlineado = interlineadoEpubGuardado();
  $('interlineado-epub').value = interlineado === null ? 'libro' : String(interlineado);
}

$('btn-texto').addEventListener('click', () => {
  const abrir = $('panel-texto').hidden;
  $('panel-texto').hidden = !abrir;
  $('btn-texto').setAttribute('aria-expanded', String(abrir));
  if (abrir) {
    aplicarMargenEpub();
    pintarAjustesTexto();
    $('fuente-epub').focus();
  }
});

$('fuente-epub').addEventListener('change', (evento) => {
  localStorage.setItem(CLAVE_FUENTE_EPUB, evento.target.value);
  lectorEpub.cambiarFuente(evento.target.value);
  reflowEpub();
});

$('interlineado-epub').addEventListener('change', (evento) => {
  const valor = evento.target.value;
  if (valor === 'libro') localStorage.removeItem(CLAVE_INTERLINEADO_EPUB);
  else localStorage.setItem(CLAVE_INTERLINEADO_EPUB, valor);
  lectorEpub.cambiarInterlineado(valor === 'libro' ? null : valor);
  reflowEpub();
});

$('margen-epub').addEventListener('input', (evento) => {
  const valor = Number(evento.target.value);
  localStorage.setItem(CLAVE_MARGEN_EPUB, String(valor));
  aplicarMargenEpub(valor);
});

$('btn-restablecer-texto').addEventListener('click', () => {
  localStorage.setItem(CLAVE_MARGEN_EPUB, String(MARGEN_EPUB_INICIAL));
  localStorage.removeItem(CLAVE_FUENTE_EPUB);
  localStorage.removeItem(CLAVE_INTERLINEADO_EPUB);
  aplicarMargenEpub(MARGEN_EPUB_INICIAL);
  pintarAjustesTexto();
  lectorEpub.cambiarFuente('libro');
  lectorEpub.cambiarInterlineado(null);
  reflowEpub();
});

document.addEventListener('click', (evento) => {
  if (!$('control-texto').contains(evento.target)) cerrarPanelTexto();
});

document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape') return;
  if (!$('dialogo-mover').classList.contains('oculto')) {
    cerrarDialogoMover();
    return;
  }
  if ($('historial-navegacion').classList.contains('abierto-movil')) {
    cerrarHistorialMovil();
    $('btn-indicador').focus();
  } else if (!$('panel-indice-libro').classList.contains('oculto')) {
    cerrarIndiceLibro();
    $('btn-indice-libro').focus();
  } else if (!$('panel-marcadores').classList.contains('oculto')) {
    cerrarPanelMarcadores();
    $('btn-marcadores').focus();
  } else if (!$('panel-busqueda-libro').classList.contains('oculto')) {
    cerrarBusquedaLibro();
    $('btn-buscar-libro').focus();
  } else if (!$('panel-texto').hidden) {
    cerrarPanelTexto();
    $('btn-texto').focus();
  }
});

// Ancho automático: la página vuelve a ajustarse al ancho de la pantalla
// (en EPUB, tamaño de letra al 100 %).
$('btn-ancho-auto').addEventListener('click', async () => {
  if (epubAbierto()) {
    lectorEpub.cambiarTamano(100 - lectorEpub.tamano);
    localStorage.setItem(CLAVE_LETRA_EPUB, String(lectorEpub.tamano));
  } else {
    await lector.cambiarZoom(1 / lector.zoom);
    localStorage.setItem(CLAVE_ZOOM_PDF, String(lector.zoom));
  }
});

function pedirPosicionLibro() {
  if (epubAbierto()) {
    if (!lectorEpub.conLocalizaciones) return;
    const respuesta = prompt(t('goPercent'), String(lectorEpub.porcentaje));
    const numero = parseInt(respuesta, 10);
    if (!Number.isNaN(numero)) {
      saltarConHistorial(lectorEpub.destinoPorcentaje(numero))
        .catch((error) => avisar(error.message, 5000));
    }
    return;
  }
  const respuesta = prompt(t('goToPage', { total: lector.totalPaginas }), String(lector.pagina));
  const numero = parseInt(respuesta, 10);
  if (!Number.isNaN(numero)) {
    saltarConHistorial(numero).catch((error) => avisar(error.message, 5000));
  }
}

$('btn-indicador').addEventListener('click', () => {
  const hayHistorial = historialNavegacion.atras.length || historialNavegacion.adelante.length;
  if (consultaMovil.matches && hayHistorial) {
    if ($('historial-navegacion').classList.contains('abierto-movil')) cerrarHistorialMovil();
    else abrirHistorialMovil();
    return;
  }
  pedirPosicionLibro();
});

$('btn-ir-posicion').addEventListener('click', () => {
  cerrarHistorialMovil();
  pedirPosicionLibro();
});

document.addEventListener('click', (evento) => {
  if (!$('historial-navegacion').contains(evento.target) && !$('btn-indicador').contains(evento.target)) {
    cerrarHistorialMovil();
  }
});

function pintarIconoNoche() {
  const activo = document.body.classList.contains('modo-noche');
  $('btn-noche').innerHTML = icono(activo ? 'sun' : 'moon');
  $('btn-noche').title = activo ? t('dayMode') : t('nightMode');
}

$('btn-noche').addEventListener('click', () => {
  const activo = document.body.classList.toggle('modo-noche');
  localStorage.setItem(CLAVE_NOCHE, activo ? '1' : '0');
  pintarIconoNoche();
  lectorEpub.aplicarNoche(activo);
});

function manejarTecla(evento) {
  if ($('vista-lector').classList.contains('oculto')) return;
  if (evento.target?.tagName === 'INPUT') return;
  const activo = epubAbierto() ? lectorEpub : lector;
  switch (evento.key) {
    case 'ArrowLeft': case 'PageUp': activo.anterior(); break;
    case 'ArrowRight': case 'PageDown': case ' ': activo.siguiente(); break;
    case 'Home':
      saltarConHistorial(epubAbierto() ? lectorEpub.destinoPorcentaje(0) : 1)
        .catch((error) => avisar(error.message, 5000));
      break;
    case 'End':
      saltarConHistorial(epubAbierto() ? lectorEpub.destinoPorcentaje(100) : lector.totalPaginas)
        .catch((error) => avisar(error.message, 5000));
      break;
  }
}
document.addEventListener('keydown', manejarTecla);

// Deslizar el dedo para pasar página.
let toqueX = null, toqueY = null;
$('area-lectura').addEventListener('touchstart', (evento) => {
  toqueX = evento.touches[0].clientX;
  toqueY = evento.touches[0].clientY;
}, { passive: true });
$('area-lectura').addEventListener('touchend', (evento) => {
  if (toqueX === null) return;
  const dx = evento.changedTouches[0].clientX - toqueX;
  const dy = evento.changedTouches[0].clientY - toqueY;
  toqueX = toqueY = null;
  if (modoActual() === 'continuo') return; // en continuo manda el scroll vertical
  // Con zoom (la página desborda a lo ancho), el dedo desplaza el lienzo
  // con el scroll nativo: no debe interpretarse como pasar página.
  const area = $('area-lectura');
  if (area.scrollWidth > area.clientWidth + 2) return;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
    const activo = epubAbierto() ? lectorEpub : lector;
    if (dx < 0) activo.siguiente(); else activo.anterior();
  }
}, { passive: true });

// Arrastrar con el ratón para desplazar la página cuando desborda (zoom o
// página más alta que la vista). En táctil ya lo hace el scroll nativo.
let arrastre = null;
let clicTrasArrastre = false;

$('area-lectura').addEventListener('pointerdown', (evento) => {
  if (evento.pointerType !== 'mouse' || evento.button !== 0) return;
  // Sobre el texto seleccionable o un enlace del PDF manda la selección o
  // el clic, no el arrastre de la página.
  if (evento.target.closest('.capa-texto span, .capa-enlaces a')) return;
  const area = $('area-lectura');
  if (area.scrollWidth <= area.clientWidth && area.scrollHeight <= area.clientHeight) return;
  arrastre = {
    x: evento.clientX, y: evento.clientY,
    izquierda: area.scrollLeft, arriba: area.scrollTop,
    movido: false,
  };
  area.classList.add('arrastrando');
});

window.addEventListener('pointermove', (evento) => {
  if (!arrastre) return;
  const dx = evento.clientX - arrastre.x;
  const dy = evento.clientY - arrastre.y;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) arrastre.movido = true;
  const area = $('area-lectura');
  area.scrollLeft = arrastre.izquierda - dx;
  area.scrollTop = arrastre.arriba - dy;
});

window.addEventListener('pointerup', () => {
  if (!arrastre) return;
  clicTrasArrastre = arrastre.movido;
  arrastre = null;
  $('area-lectura').classList.remove('arrastrando');
});

// Tras un arrastre, el clic que lo remata no debe pasar página (las zonas
// de toque laterales lo capturarían).
$('area-lectura').addEventListener('click', (evento) => {
  if (clicTrasArrastre) {
    clicTrasArrastre = false;
    evento.preventDefault();
    evento.stopPropagation();
  }
}, true);

// ───────────────────────── Arranque ─────────────────────────

pintarIconos();
document.addEventListener('idioma-cambiado', () => {
  aplicarMargenEpub();
  aplicarAparienciaModo(modoActual());
  pintarIconoNoche();
  if (!libroActual) cargarBiblioteca();
  else if (!$('panel-marcadores').classList.contains('oculto')) pintarMarcadores();
});
iniciarIdioma();
if (localStorage.getItem(CLAVE_NOCHE) === '1') {
  document.body.classList.add('modo-noche');
}
pintarIconoNoche();
aplicarAparienciaModo(modoActual());

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => null);
}

importarConfigDeUrl();
crearCliente();
history.replaceState({ [ESTADO_VISTA]: 'biblioteca' }, '');
mostrarVista('biblioteca');
cargarBiblioteca();
