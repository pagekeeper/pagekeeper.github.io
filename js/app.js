import { ClienteWebDav, explicarError } from './webdav.js';
import { Lector } from './lector.js';
import { LectorEpub, cargarZip } from './lector-epub.js';
import * as progreso from './progreso.js';
import * as almacen from './almacen.js';
import * as anotaciones from './anotaciones.js';
import { asegurarMiniatura } from './portadas.js';
import { icono, pintarIconos } from './iconos.js';
import { t, iniciarIdioma, aplicarIdioma, idiomaActual } from './i18n.js';
import { LectorVoz } from './tts.js';
import {
  crearManifiestoCopia, validarManifiestoCopia, fusionarProgresoRestaurado,
  carpetasRemotasDeLibros, crearCopiaConfigNube, validarCopiaConfigNube,
  validarConfigNube,
} from './copia-local.js';

const CLAVE_CONFIG = 'lector.config';
const CLAVE_NOCHE = 'lector.noche';
const CLAVE_MODO = 'lector.modo';
const CLAVE_DOBLE = 'lector.doble';         // solo de este dispositivo
const CLAVE_ROTACION_PDF = 'lector.rotacionPdf'; // por libro, solo de este dispositivo
const CLAVE_RITMO = 'lector.ritmoLectura';  // por libro, solo de este dispositivo
const CLAVE_VOZ_TTS = 'lector.vozTts';      // por idioma, solo de este dispositivo
const CLAVE_VELOCIDAD_TTS = 'lector.velocidadTts'; // solo de este dispositivo
const CLAVE_COLOR_RESALTADO = 'lector.colorResaltado'; // solo de este dispositivo
const CLAVE_AVISO_INMERSIVO = 'lector.avisoInmersivo'; // solo de este dispositivo

const COLORES_RESALTADO = ['amarillo', 'verde', 'azul', 'rosa'];

function colorResaltadoGuardado() {
  const valor = localStorage.getItem(CLAVE_COLOR_RESALTADO);
  return COLORES_RESALTADO.includes(valor) ? valor : 'amarillo';
}

// Color efectivo de una anotación: las anteriores a la paleta no llevan el
// campo y conservan su aspecto histórico (amarillo, o azul si tienen nota).
function colorDeAnotacion(anotacion) {
  if (COLORES_RESALTADO.includes(anotacion?.color)) return anotacion.color;
  return anotacion?.nota ? 'azul' : 'amarillo';
}
const CLAVE_ZOOM_PDF = 'lector.zoomPdf';    // solo de este dispositivo
const CLAVE_AJUSTE_PDF = 'lector.ajustePdf'; // ancho, página o zoom personalizado
const CLAVE_LETRA_EPUB = 'lector.letraEpub'; // solo de este dispositivo
const CLAVE_MARGEN_EPUB = 'lector.margenEpub'; // solo de este dispositivo
const CLAVE_FUENTE_EPUB = 'lector.fuenteEpub'; // solo de este dispositivo
const CLAVE_INTERLINEADO_EPUB = 'lector.interlineadoEpub'; // solo de este dispositivo
const CLAVE_ALINEACION_EPUB = 'lector.alineacionEpub'; // solo de este dispositivo
const CLAVE_ORDEN_BIBLIOTECA = 'lector.ordenBiblioteca';
const CLAVE_FILTRO_BIBLIOTECA = 'lector.filtroBiblioteca';
const CLAVE_VISTA_BIBLIOTECA = 'lector.vistaBiblioteca'; // solo de este dispositivo
const CLAVE_PLEGADA_NUBE = 'lector.plegadaNube';   // solo de este dispositivo
const CLAVE_PLEGADA_LOCAL = 'lector.plegadaLocal'; // solo de este dispositivo
const CLAVE_AVISO_CONFIG_CERRADO = 'lector.avisoConfigCerrado'; // solo de este dispositivo
const CLAVE_EJEMPLOS_PRECARGADOS = 'lector.ejemplosPrecargados'; // solo de este dispositivo
const CLAVE_CONTINUAR_OCULTOS = 'lector.continuarOcultos';

// Preferencias inocuas que viajan con la copia. Se excluyen expresamente la
// configuración y la contraseña WebDAV, así como las colas de sincronización.
const CLAVES_PREFERENCIAS_COPIA = [
  'lector.idioma', CLAVE_NOCHE, CLAVE_MODO, CLAVE_DOBLE, CLAVE_ROTACION_PDF,
  CLAVE_RITMO, CLAVE_VOZ_TTS, CLAVE_VELOCIDAD_TTS, CLAVE_COLOR_RESALTADO,
  CLAVE_ZOOM_PDF, CLAVE_AJUSTE_PDF, CLAVE_LETRA_EPUB, CLAVE_MARGEN_EPUB, CLAVE_FUENTE_EPUB,
  CLAVE_INTERLINEADO_EPUB, CLAVE_ALINEACION_EPUB, CLAVE_ORDEN_BIBLIOTECA,
  CLAVE_FILTRO_BIBLIOTECA, CLAVE_VISTA_BIBLIOTECA, CLAVE_PLEGADA_LOCAL,
];

// Un libro de ejemplo por formato e idioma: así quedan representados
// tanto los EPUB como los PDF.
const LIBROS_EJEMPLO = {
  es: [
    { ruta: 'ejemplos/lazarillo-de-tormes-es.epub', nombre: 'Lazarillo de Tormes.epub' },
    { ruta: 'ejemplos/orientaciones-herramientas-digitales-es.pdf', nombre: 'Orientaciones sobre el uso de herramientas digitales.pdf' },
  ],
  ca: [
    { ruta: 'ejemplos/lauca-del-senyor-esteve-ca.epub', nombre: 'L’auca del senyor Esteve.epub' },
    { ruta: 'ejemplos/competencia-docent-ia-ca.pdf', nombre: 'Competència digital docent en intel·ligència artificial.pdf' },
  ],
  en: [
    { ruta: 'ejemplos/alice-in-wonderland-en.epub', nombre: 'Alice’s Adventures in Wonderland.epub' },
    { ruta: 'ejemplos/artificial-intelligence-science-education-en.pdf', nombre: 'Artificial Intelligence in Science Education.pdf' },
  ],
};

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

function alineacionEpubGuardada() {
  return localStorage.getItem(CLAVE_ALINEACION_EPUB) === 'izquierda' ? 'izquierda' : 'libro';
}

function zoomPdfGuardado() {
  const valor = parseFloat(localStorage.getItem(CLAVE_ZOOM_PDF));
  return valor >= 0.1 && valor <= 4 ? valor : 1;
}

function ajustePdfGuardado() {
  const valor = localStorage.getItem(CLAVE_AJUSTE_PDF);
  return ['ancho', 'pagina', 'personalizado'].includes(valor) ? valor : 'ancho';
}

function letraEpubGuardada() {
  const valor = parseInt(localStorage.getItem(CLAVE_LETRA_EPUB), 10);
  return valor >= 60 && valor <= 300 ? valor : 100;
}

function dobleGuardado() {
  return localStorage.getItem(CLAVE_DOBLE) === '1';
}

function leerMapaLocal(clave) {
  try {
    const mapa = JSON.parse(localStorage.getItem(clave));
    return mapa && typeof mapa === 'object' ? mapa : {};
  } catch {
    return {};
  }
}

function rotacionPdfDe(id) {
  const valor = leerMapaLocal(CLAVE_ROTACION_PDF)[id];
  return [90, 180, 270].includes(valor) ? valor : 0;
}

function guardarRotacionPdf(id, grados) {
  const mapa = leerMapaLocal(CLAVE_ROTACION_PDF);
  if (grados) mapa[id] = grados;
  else delete mapa[id];
  localStorage.setItem(CLAVE_ROTACION_PDF, JSON.stringify(mapa));
}

const $ = (id) => document.getElementById(id);

// ───────────────────────── Estado ─────────────────────────

let cliente = null;        // ClienteWebDav o null si no hay configuración
let rutaNube = '';         // subcarpeta abierta en la sección de la nube ('' = raíz)
let libroActual = null;    // { id, titulo, tipo: 'webdav'|'local', formato: 'pdf'|'epub' }
let temporizadorSync = null;
let temporizadorSyncAnotaciones = null;
let seleccionPendiente = null;
let anotacionesActuales = [];
let anotacionMenuId = null;
let anotacionEditandoId = null;
let resolverContrasenaPdf = null;

function solicitarContrasenaPdf(incorrecta = false) {
  $('error-contrasena-pdf').classList.toggle('oculto', !incorrecta);
  $('campo-contrasena-pdf').value = '';
  $('dialogo-contrasena-pdf').classList.remove('oculto');
  requestAnimationFrame(() => $('campo-contrasena-pdf').focus());
  return new Promise((resolver) => { resolverContrasenaPdf = resolver; });
}

function responderContrasenaPdf(clave) {
  if (!resolverContrasenaPdf) return;
  const resolver = resolverContrasenaPdf;
  resolverContrasenaPdf = null;
  $('dialogo-contrasena-pdf').classList.add('oculto');
  resolver(clave);
}

$('form-contrasena-pdf').addEventListener('submit', (evento) => {
  evento.preventDefault();
  responderContrasenaPdf($('campo-contrasena-pdf').value);
});
$('btn-cancelar-contrasena-pdf').addEventListener('click', () => responderContrasenaPdf(null));
$('dialogo-contrasena-pdf').addEventListener('click', (evento) => {
  if (evento.target === $('dialogo-contrasena-pdf')) responderContrasenaPdf(null);
});

const lector = new Lector({
  area: $('area-lectura'),
  contenedor: $('contenedor-pagina'),
  alCambiarPagina: cuandoCambiaPagina,
  // Enlaces internos del PDF: saltan a su página dejando rastro en el
  // historial para poder volver.
  alPulsarEnlaceInterno: (pagina) => {
    saltarConHistorial(pagina).catch((error) => avisar(error.message, 5000));
  },
  alSeleccionarTexto: manejarSeleccionTexto,
  alPulsarAnotacion: (id) => abrirPanelAnotaciones(id),
  alGestionarAnotacion: abrirMenuNota,
  alMostrarNota: mostrarNotaEmergente,
  alOcultarNota: ocultarNotaEmergente,
  etiquetaOpcionesNota: () => t('noteActions'),
  solicitarContrasena: solicitarContrasenaPdf,
});

const lectorEpub = new LectorEpub({
  contenedor: $('contenedor-epub'),
  alCambiarPosicion: cuandoCambiaPosicionEpub,
  alTeclear: manejarTecla,
  // Los enlaces internos del EPUB los salta epub.js por su cuenta: aquí solo
  // se apunta la posición de partida para poder volver con el historial.
  alPulsarEnlaceInterno: apuntarEnHistorial,
  // Los clics sobre el texto del libro ocurren dentro del iframe del
  // capítulo y no llegan al documento: cierran aquí los paneles flotantes
  // y alternan el modo inmersivo como un toque en el centro de la página.
  alPulsarContenido: (evento) => {
    cerrarPanelTexto();
    cerrarPanelTts();
    cerrarMenuLector();
    cerrarMenuNota();
    toqueCentroLector(evento?.target);
  },
  alSeleccionarTexto: manejarSeleccionTexto,
  alPulsarAnotacion: (id) => abrirPanelAnotaciones(id),
  alGestionarAnotacion: abrirMenuNota,
  alMostrarNota: mostrarNotaEmergente,
  alOcultarNota: ocultarNotaEmergente,
  etiquetaOpcionesNota: () => t('noteActions'),
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
  detenerLecturaVoz();
  cerrarPanelTts();
  salirModoInmersivo();
  cerrarMenuLector();
  cerrarMenuNota();
  cerrarEditorNota();
  ocultarNotaEmergente();
  cerrarPanelAnotaciones();
  cancelarSeleccion();
  cerrarBusquedaLibro();
  cerrarIndiceLibro();
  cerrarPanelMarcadores();
  clearTimeout(temporizadorSync);
  clearTimeout(temporizadorSyncAnotaciones);
  if (libroActual?.tipo === 'webdav' && cliente) {
    progreso.sincronizar(cliente).catch(() => null);
    anotaciones.sincronizar(libroActual.id, cliente).catch(() => null);
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
  actualizarAccionesArchivos();
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
// El aviso de «sin servidor» se puede cerrar: quien no usa nube no tiene por
// qué verlo siempre. La nube sigue accesible desde los ajustes.
$('btn-cerrar-aviso-config').addEventListener('click', () => {
  localStorage.setItem(CLAVE_AVISO_CONFIG_CERRADO, '1');
  $('aviso-sin-config').classList.add('oculto');
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
    const config = validarConfigNube(decodificarConfig(coincidencia[1]));
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

// ── Exportar / importar configuración por archivo ──
// El archivo contiene la contraseña de aplicación en texto legible. Se crea
// solo por una acción explícita y la interfaz advierte que debe guardarse en
// un lugar privado.

$('btn-descargar-config').addEventListener('click', () => {
  const resultado = $('resultado-copia');
  try {
    const copia = crearCopiaConfigNube(leerFormulario());
    const fecha = new Date().toISOString().slice(0, 10);
    entregarDescarga(
      `pagekeeper-configuracion-${fecha}.json`,
      JSON.stringify(copia, null, 2),
      'application/json',
    );
    resultado.className = 'estado exito';
    resultado.textContent = t('configFileSaved');
  } catch {
    resultado.className = 'estado error';
    resultado.textContent = t('copyLinkFirst');
  }
});

$('selector-importar-config').addEventListener('change', async (evento) => {
  const resultado = $('resultado-copia');
  const archivo = evento.target.files?.[0];
  evento.target.value = '';
  if (!archivo) return;
  try {
    const config = validarCopiaConfigNube(JSON.parse(await archivo.text()));
    const actual = cargarConfig();
    if (actual && JSON.stringify(actual) !== JSON.stringify(config) &&
        !confirm(t('replaceConfigConfirm'))) {
      return;
    }
    localStorage.setItem(CLAVE_CONFIG, JSON.stringify(config));
    $('campo-url').value = config.url;
    $('campo-usuario').value = config.usuario;
    $('campo-clave').value = config.clave;
    crearCliente();
    resultado.className = 'estado exito';
    resultado.textContent = t('cloudConfigImported');
  } catch {
    resultado.className = 'estado error';
    resultado.textContent = t('invalidConfigFile');
  }
});

// ───────────────────── Copia de la biblioteca local ─────────────────────

function actualizarAccionesArchivos() {
  const disponible = Boolean(cliente);
  $('btn-exportar-nube').disabled = !disponible;
  for (const id of ['accion-restaurar-nube', 'accion-subir-desde-archivos']) {
    $(id).classList.toggle('accion-deshabilitada', !disponible);
    $(id).setAttribute('aria-disabled', String(!disponible));
  }
}

function abrirArchivos() {
  actualizarAccionesArchivos();
  $('resultado-copia-biblioteca').textContent = '';
  $('resultado-copia-nube').textContent = cliente ? '' : t('cloudBackupNeedsConfig');
  $('resultado-copia-nube').className = `estado${cliente ? '' : ' error'}`;
  mostrarVista('archivos');
}

$('btn-archivos').addEventListener('click', abrirArchivos);
$('btn-cerrar-archivos').addEventListener('click', () => {
  mostrarVista('biblioteca');
  cargarBiblioteca();
});
for (const id of ['accion-restaurar-nube', 'accion-subir-desde-archivos']) {
  $(id).addEventListener('click', (evento) => {
    if (!cliente) evento.preventDefault();
  });
}

function preferenciasParaCopia(ids) {
  const preferencias = {};
  for (const clave of CLAVES_PREFERENCIAS_COPIA) {
    const valor = localStorage.getItem(clave);
    if (valor !== null) preferencias[clave] = valor;
  }
  // Estos dos mapas pueden contener también ids de la nube: la copia local
  // solo debe revelar y restaurar las entradas de los libros incluidos.
  for (const clave of [CLAVE_ROTACION_PDF, CLAVE_RITMO]) {
    try {
      const mapa = JSON.parse(preferencias[clave]);
      preferencias[clave] = JSON.stringify(Object.fromEntries(
        Object.entries(mapa).filter(([id]) => ids.has(id)),
      ));
    } catch { delete preferencias[clave]; }
  }
  return preferencias;
}

async function generarZipCopia(manifiesto, libros, nombre, textoCarga) {
  await cargarZip();
  const zip = new window.JSZip();
  zip.file('pagekeeper.json', JSON.stringify(manifiesto, null, 2));
  libros.forEach((libro, indice) => {
    zip.file(manifiesto.libros[indice].archivo, libro.datos, { compression: 'STORE' });
  });
  const archivo = await zip.generateAsync({ type: 'blob', compression: 'STORE' }, (avance) => {
    $('texto-cargando').textContent = `${textoCarga} ${Math.round(avance.percent)} %`;
  });
  entregarDescarga(nombre, archivo, 'application/zip');
}

async function leerZipCopia(archivo, origenEsperado) {
  await cargarZip();
  const zip = await window.JSZip.loadAsync(archivo);
  const entradaManifiesto = zip.file('pagekeeper.json');
  if (!entradaManifiesto) throw new Error('INVALID_BACKUP');
  const validada = validarManifiestoCopia(JSON.parse(await entradaManifiesto.async('string')));
  if (validada.origen !== origenEsperado) throw new Error('WRONG_BACKUP_TYPE');
  const libros = [];
  for (const info of validada.manifiesto.libros) {
    const entrada = zip.file(info.archivo);
    if (!entrada) throw new Error('INVALID_BACKUP');
    const datos = await entrada.async('uint8array');
    if (datos.byteLength !== info.tamano) throw new Error('INVALID_BACKUP');
    const { archivo: _archivo, ...resto } = info;
    libros.push({ ...resto, datos });
  }
  return { ...validada, libros };
}

function aplicarPreferenciasCopia(preferencias = {}) {
  for (const [clave, valor] of Object.entries(preferencias)) {
    if (CLAVES_PREFERENCIAS_COPIA.includes(clave) && typeof valor === 'string' && valor.length < 1000000) {
      localStorage.setItem(clave, valor);
    }
  }
  const idioma = localStorage.getItem('lector.idioma');
  if (idioma) aplicarIdioma(idioma);
  document.body.classList.toggle('modo-noche', localStorage.getItem(CLAVE_NOCHE) === '1');
  pintarIconoNoche();
  $('filtro-biblioteca').value = localStorage.getItem(CLAVE_FILTRO_BIBLIOTECA) ?? 'todos';
  $('orden-biblioteca').value = localStorage.getItem(CLAVE_ORDEN_BIBLIOTECA) ?? 'reciente';
  aplicarVistaBiblioteca(localStorage.getItem(CLAVE_VISTA_BIBLIOTECA) ?? 'lista');
}

async function exportarBibliotecaLocal() {
  const estado = $('resultado-copia-biblioteca');
  mostrarCarga(t('creatingBackup'));
  try {
    const { libros, anotaciones: documentos } = await almacen.exportarBibliotecaLocal();
    if (!libros.length) {
      estado.textContent = t('noLocalBooksBackup');
      estado.className = 'estado error';
      return;
    }
    const ids = new Set(libros.map((libro) => libro.id));
    const datosProgreso = progreso.cargarLocal();
    const progresoLocal = {
      version: datosProgreso.version,
      libros: Object.fromEntries(
        Object.entries(datosProgreso.libros ?? {}).filter(([id]) => ids.has(id)),
      ),
    };
    const preferencias = preferenciasParaCopia(ids);
    const manifiesto = crearManifiestoCopia({
      libros,
      progreso: progresoLocal,
      anotaciones: documentos.filter((documento) => ids.has(documento.libro)),
      preferencias,
    });
    const fecha = new Date().toISOString().slice(0, 10);
    await generarZipCopia(
      manifiesto, libros, `pagekeeper-dispositivo-${fecha}.zip`, t('creatingBackup'),
    );
    estado.textContent = t('backupCreated', { count: libros.length });
    estado.className = 'estado exito';
  } catch (error) {
    estado.textContent = t('backupFailed', { error: error.message });
    estado.className = 'estado error';
  } finally {
    ocultarCarga();
  }
}

async function restaurarBibliotecaLocal(archivo) {
  const estado = $('resultado-copia-biblioteca');
  if (!confirm(t('restoreBackupConfirm'))) return;
  mostrarCarga(t('restoringBackup'));
  try {
    const { manifiesto, ids, libros } = await leerZipCopia(archivo, 'local');
    const documentos = (manifiesto.anotaciones ?? [])
      .filter((documento) => documento && documento.ambito === 'local' && ids.has(documento.libro))
      .map((documento) => ({ ...documento, ambito: 'local' }));
    await almacen.restaurarBibliotecaLocal(libros, documentos);
    progreso.guardarLocal(fusionarProgresoRestaurado(
      progreso.cargarLocal(), manifiesto.progreso, ids,
    ));
    aplicarPreferenciasCopia(manifiesto.preferencias);
    await cargarLibrosLocales();
    await pintarContinuarLeyendo();
    aplicarOrganizacionBiblioteca();
    estado.textContent = t('backupRestored', { count: libros.length });
    estado.className = 'estado exito';
  } catch (error) {
    const detalle = error.message === 'INVALID_BACKUP' ? t('invalidBackup')
      : error.message === 'WRONG_BACKUP_TYPE' ? t('wrongLocalBackup') : error.message;
    estado.textContent = t('restoreFailed', { error: detalle });
    estado.className = 'estado error';
  } finally {
    ocultarCarga();
  }
}

$('btn-exportar-biblioteca').addEventListener('click', exportarBibliotecaLocal);
$('selector-restaurar-biblioteca').addEventListener('change', (evento) => {
  const archivo = evento.target.files?.[0];
  evento.target.value = '';
  if (archivo) restaurarBibliotecaLocal(archivo);
});

async function listarLibrosRemotosRecursivamente(ruta = '', resultado = []) {
  const { carpetas, libros } = await cliente.listar(ruta);
  for (const libro of libros) {
    resultado.push({
      ...libro,
      id: ruta ? `${ruta}/${libro.nombre}` : libro.nombre,
    });
  }
  for (const carpeta of carpetas) {
    const subruta = ruta ? `${ruta}/${carpeta.nombre}` : carpeta.nombre;
    await listarLibrosRemotosRecursivamente(subruta, resultado);
  }
  return resultado;
}

async function exportarBibliotecaNube() {
  if (!cliente) return;
  const estado = $('resultado-copia-nube');
  mostrarCarga(t('readingCloudLibrary'));
  try {
    await progreso.sincronizar(cliente);
    await anotaciones.sincronizarPendientes(cliente);
    const infoLibros = await listarLibrosRemotosRecursivamente();
    if (!infoLibros.length) {
      estado.textContent = t('noCloudBooksBackup');
      estado.className = 'estado error';
      return;
    }
    const libros = [];
    const documentos = [];
    for (let indice = 0; indice < infoLibros.length; indice++) {
      const info = infoLibros[indice];
      $('texto-cargando').textContent = t('backingUpCloudBook', {
        current: indice + 1, total: infoLibros.length, title: info.nombre,
      });
      const datos = await cliente.descargar(info.id);
      libros.push({ ...info, tamano: datos.byteLength, datos });
      const lateral = await cliente.leerAnotaciones(info.id);
      if (lateral?.datos) documentos.push({ ...lateral.datos, libro: info.id });
    }
    const ids = new Set(libros.map((libro) => libro.id));
    const remoto = await cliente.leerProgreso() ?? { version: 2, libros: {} };
    const progresoRemoto = {
      version: remoto.version ?? 2,
      libros: Object.fromEntries(
        Object.entries(remoto.libros ?? {}).filter(([id]) => ids.has(id)),
      ),
    };
    const manifiesto = crearManifiestoCopia({
      origen: 'webdav', libros, progreso: progresoRemoto, anotaciones: documentos,
      preferencias: preferenciasParaCopia(ids),
    });
    const fecha = new Date().toISOString().slice(0, 10);
    await generarZipCopia(
      manifiesto, libros, `pagekeeper-nube-${fecha}.zip`, t('creatingBackup'),
    );
    estado.textContent = t('cloudBackupCreated', { count: libros.length });
    estado.className = 'estado exito';
  } catch (error) {
    estado.textContent = t('backupFailed', { error: explicarError(error) });
    estado.className = 'estado error';
  } finally {
    ocultarCarga();
  }
}

async function restaurarBibliotecaNube(archivo) {
  const estado = $('resultado-copia-nube');
  if (!cliente || !confirm(t('restoreCloudConfirm'))) return;
  mostrarCarga(t('restoringCloudBackup'));
  try {
    const { manifiesto, ids, libros } = await leerZipCopia(archivo, 'webdav');
    for (const carpeta of carpetasRemotasDeLibros(libros)) {
      if (!await cliente.existe(carpeta)) await cliente.crearCarpeta(carpeta);
    }
    for (let indice = 0; indice < libros.length; indice++) {
      const libro = libros[indice];
      $('texto-cargando').textContent = t('restoringCloudBook', {
        current: indice + 1, total: libros.length, title: libro.nombre,
      });
      await cliente.subir(libro.id, libro.datos);
    }
    const remotoActual = await cliente.leerProgreso() ?? { version: 2, libros: {} };
    const progresoRestaurado = fusionarProgresoRestaurado(
      remotoActual, manifiesto.progreso, ids,
    );
    await cliente.escribirProgreso(progresoRestaurado);
    progreso.guardarLocal(fusionarProgresoRestaurado(
      progreso.cargarLocal(), manifiesto.progreso, ids,
    ));
    const documentos = (manifiesto.anotaciones ?? []).filter((documento) =>
      documento && ids.has(documento.libro) && Array.isArray(documento.anotaciones));
    for (const documento of documentos) {
      const actual = await cliente.leerAnotaciones(documento.libro);
      const remoto = {
        version: documento.version ?? 1,
        libro: documento.libro,
        anotaciones: documento.anotaciones,
      };
      await cliente.escribirAnotaciones(
        documento.libro, remoto, actual.etag, actual.datos !== null,
      );
      await almacen.guardarAnotaciones({
        ...remoto, ambito: cliente.base, pendientes: {},
      });
    }
    aplicarPreferenciasCopia(manifiesto.preferencias);
    rutaNube = '';
    await cargarBiblioteca();
    estado.textContent = t('cloudBackupRestored', { count: libros.length });
    estado.className = 'estado exito';
  } catch (error) {
    const detalle = error.message === 'INVALID_BACKUP' ? t('invalidBackup')
      : error.message === 'WRONG_BACKUP_TYPE' ? t('wrongCloudBackup') : explicarError(error);
    estado.textContent = t('restoreFailed', { error: detalle });
    estado.className = 'estado error';
  } finally {
    ocultarCarga();
  }
}

$('btn-exportar-nube').addEventListener('click', exportarBibliotecaNube);
$('selector-restaurar-nube').addEventListener('change', (evento) => {
  const archivo = evento.target.files?.[0];
  evento.target.value = '';
  if (archivo) restaurarBibliotecaNube(archivo);
});

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

function actualizarEstadoSincronizacion(error = null) {
  const estado = document.querySelector('#zona-remota .estado-sincronizacion');
  if (!estado) return;
  estado.classList.toggle('sincronizado', !error);
  estado.classList.toggle('error', Boolean(error));
  estado.textContent = t(error ? 'syncError' : 'syncYes');
  estado.title = error ? explicarError(error) : '';
}

// Primera visita: los ejemplos se cargan solos en la biblioteca. La marca
// evita resembrarlos cuando el usuario los borra, y también oculta la
// tarjeta de ejemplo, que queda solo como respaldo si la precarga falló
// (por ejemplo, un primer arranque sin conexión).
async function precargarLibrosEjemplo() {
  if (localStorage.getItem(CLAVE_EJEMPLOS_PRECARGADOS) === '1') return;
  if (cliente) {
    // Con nube propia configurada los ejemplos no pintan nada.
    localStorage.setItem(CLAVE_EJEMPLOS_PRECARGADOS, '1');
    return;
  }
  let locales = [];
  try {
    locales = await almacen.listarLibros();
  } catch {
    return; // IndexedDB no disponible: nada que precargar
  }
  if (locales.length) {
    // Biblioteca ya en uso: se respeta tal cual.
    localStorage.setItem(CLAVE_EJEMPLOS_PRECARGADOS, '1');
    return;
  }
  try {
    for (const ejemplo of LIBROS_EJEMPLO[idiomaActual()] ?? LIBROS_EJEMPLO.es) {
      const respuesta = await fetch(ejemplo.ruta);
      if (!respuesta.ok) throw new Error(`${respuesta.status} ${respuesta.statusText}`);
      const datos = new Uint8Array(await respuesta.arrayBuffer());
      const libro = {
        id: `local:${ejemplo.nombre}:${datos.byteLength}`,
        nombre: ejemplo.nombre,
        tamano: datos.byteLength,
      };
      await almacen.guardarLibro(libro, datos);
      asegurarMiniatura(libro.id, formatoDe(ejemplo.nombre), datos);
    }
    localStorage.setItem(CLAVE_EJEMPLOS_PRECARGADOS, '1');
  } catch { /* sin conexión: se reintentará en el próximo arranque */ }
}

function mostrarLibroEjemplo(mostrar) {
  if (localStorage.getItem(CLAVE_EJEMPLOS_PRECARGADOS) === '1') mostrar = false;
  const zona = $('botones-libro-ejemplo');
  zona.replaceChildren();
  for (const ejemplo of LIBROS_EJEMPLO[idiomaActual()] ?? LIBROS_EJEMPLO.es) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn-primario btn-libro-ejemplo';
    const titulo = ejemplo.nombre.replace(/\.(pdf|epub)$/i, '');
    boton.innerHTML = '<span class="titulo-ejemplo"></span><span class="formato-ejemplo"></span>';
    boton.querySelector('.titulo-ejemplo').textContent = titulo;
    boton.querySelector('.formato-ejemplo').textContent = formatoDe(ejemplo.nombre).toUpperCase();
    boton.title = titulo;
    boton.addEventListener('click', () => anadirLibroEjemplo(ejemplo, boton));
    zona.append(boton);
  }
  $('libro-ejemplo').classList.toggle('oculto', !mostrar);
}

async function anadirLibroEjemplo(ejemplo, boton) {
  boton.disabled = true;
  mostrarCarga(t('loadingSampleBook'));
  try {
    const respuesta = await fetch(ejemplo.ruta);
    if (!respuesta.ok) throw new Error(`${respuesta.status} ${respuesta.statusText}`);
    const tipo = formatoDe(ejemplo.nombre) === 'pdf' ? 'application/pdf' : 'application/epub+zip';
    const archivo = new File([await respuesta.blob()], ejemplo.nombre, { type: tipo });
    await guardarArchivosLocales([archivo], true);
  } catch (error) {
    avisar(t('saveFailed', { title: ejemplo.nombre, error: error.message }), 7000);
  } finally {
    boton.disabled = false;
    ocultarCarga();
  }
}

async function cargarBiblioteca() {
  mostrarLibroEjemplo(false);
  const promesaLocales = cargarLibrosLocales();
  versionContinuarLeyendo += 1; // cancela una comprobación remota anterior aún en curso
  $('continuar-leyendo').classList.add('oculto');

  const hayConfig = cliente !== null;
  $('aviso-sin-config').classList.toggle('oculto',
    hayConfig || localStorage.getItem(CLAVE_AVISO_CONFIG_CERRADO) === '1');
  $('zona-remota').classList.toggle('oculto', !hayConfig);
  // La sección local solo tiene sentido en la raíz: dentro de una subcarpeta
  // de la nube distraería y sus libros no pertenecen a esa carpeta.
  $('zona-local').classList.toggle('oculto', Boolean(hayConfig && rutaNube));
  if (!hayConfig) {
    $('lista-libros').replaceChildren();
    mostrarLibroEjemplo((await promesaLocales) === 0);
    await pintarContinuarLeyendo();
    actualizarVisibilidadBuscadorBiblioteca();
    return;
  }

  const estado = $('estado-remoto');
  estado.className = 'estado';
  estado.textContent = t('loadingLibrary');
  $('lista-libros').replaceChildren();
  const promesaCopias = almacen.listarCopiasRemotas(cliente.base).catch(() => []);

  try {
    const [{ carpetas, libros }, copias, errorSincronizacion] = await Promise.all([
      cliente.listar(rutaNube),
      promesaCopias,
      Promise.all([
        progreso.sincronizar(cliente),
        anotaciones.sincronizarPendientes(cliente),
      ]).then(() => null).catch((error) => error),
    ]);
    actualizarEstadoSincronizacion(errorSincronizacion);
    if (errorSincronizacion) {
      avisar(t('syncFailed', { error: explicarError(errorSincronizacion) }), 7000);
    }
    estado.textContent = carpetas.length || libros.length
      ? ''
      : t(rutaNube ? 'emptyFolder' : 'noCloudBooks');
    pintarListaRemota(carpetas, libros, copias);
    const cantidadLocales = await promesaLocales;
    mostrarLibroEjemplo(!rutaNube && cantidadLocales === 0 && carpetas.length === 0 && libros.length === 0);
    await pintarContinuarLeyendo({
      idsRemotosDisponibles: new Set(libros.map((libro) => idRemoto(libro.nombre))),
    });
    generarPortadasFaltantes(libros.map((libro) => ({ ...libro, nombre: idRemoto(libro.nombre) })));
  } catch (error) {
    const copias = await promesaCopias;
    await pintarContinuarLeyendo({
      idsRemotosDisponibles: new Set(copias.map((copia) => copia.id)),
      comprobarRemotos: false,
    });
    const bibliotecaOffline = almacen.bibliotecaDeCopias(copias, rutaNube);
    if (bibliotecaOffline.carpetas.length || bibliotecaOffline.libros.length) {
      mostrarLibroEjemplo(false);
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
    mostrarLibroEjemplo(false);
    estado.textContent = explicarError(error);
    pintarRutaNube();
  }
}

let versionContinuarLeyendo = 0;
let continuarExpandido = false;

function librosOcultosDeContinuar() {
  try {
    const ids = JSON.parse(localStorage.getItem(CLAVE_CONTINUAR_OCULTOS));
    if (Array.isArray(ids)) return new Set(ids.filter((id) => typeof id === 'string'));
  } catch { /* preferencia corrupta: se parte de una lista limpia */ }
  return new Set();
}

function guardarOcultosDeContinuar(ids) {
  if (ids.size) localStorage.setItem(CLAVE_CONTINUAR_OCULTOS, JSON.stringify([...ids]));
  else localStorage.removeItem(CLAVE_CONTINUAR_OCULTOS);
}

function quitarDeContinuar(id) {
  const ocultos = librosOcultosDeContinuar();
  ocultos.add(id);
  guardarOcultosDeContinuar(ocultos);
  pintarContinuarLeyendo();
}

function restaurarEnContinuar(id) {
  const ocultos = librosOcultosDeContinuar();
  if (!ocultos.delete(id)) return;
  guardarOcultosDeContinuar(ocultos);
}

function actualizarDesplegableContinuar() {
  const filas = [...$('libro-continuar').children];
  filas.forEach((fila, indice) => fila.classList.toggle('oculto', !continuarExpandido && indice > 0));
  const boton = $('btn-mas-recientes');
  boton.classList.toggle('oculto', filas.length <= 1);
  boton.setAttribute('aria-expanded', String(continuarExpandido));
  boton.textContent = continuarExpandido
    ? t('showFewerRecent')
    : t('showMoreRecent', { count: Math.max(0, filas.length - 1) });
}

function lecturaTerminada(avance, porcentaje = null) {
  const pct = porcentaje ?? (avance?.paginas
    ? Math.round((avance.pagina / avance.paginas) * 100)
    : 0);
  return avance?.terminado === true || (avance?.terminado !== false && pct >= 100);
}

function retirarFilaVisibleDeContinuar(id) {
  const fila = [...$('libro-continuar').children].find((elemento) => elemento.dataset.idLibro === id);
  if (!fila) return;
  fila.remove();
  if (!$('libro-continuar').children.length) {
    $('continuar-leyendo').classList.add('oculto');
    $('btn-mas-recientes').classList.add('oculto');
    return;
  }
  actualizarDesplegableContinuar();
}

$('btn-mas-recientes').addEventListener('click', () => {
  continuarExpandido = !continuarExpandido;
  actualizarDesplegableContinuar();
});

async function pintarContinuarLeyendo({
  idsRemotosDisponibles = new Set(),
  comprobarRemotos = Boolean(cliente),
} = {}) {
  const version = ++versionContinuarLeyendo;
  const seccion = $('continuar-leyendo');
  const lista = $('libro-continuar');
  const ocultos = librosOcultosDeContinuar();
  const recientes = progreso.librosRecientes(Infinity).filter((reciente) =>
    !ocultos.has(reciente.id) && !lecturaTerminada(reciente.progreso));
  lista.replaceChildren();
  seccion.classList.add('oculto');
  $('btn-mas-recientes').classList.add('oculto');
  if (!recientes.length) return;

  const locales = await almacen.listarLibros().catch(() => []);
  if (version !== versionContinuarLeyendo) return;
  const localesPorId = new Map(locales.map((libro) => [libro.id, libro]));
  for (const reciente of recientes) {
    if (lista.children.length >= 3) break;
    let nombre;
    let tamano = 0;
    let alAbrir;
    if (reciente.id.startsWith('local:')) {
      const libro = localesPorId.get(reciente.id);
      if (!libro) continue;
      nombre = libro.nombre;
      tamano = libro.tamano;
      alAbrir = () => abrirLibroLocal(libro);
    } else {
      if (!cliente) continue;
      if (!idsRemotosDisponibles.has(reciente.id)) {
        if (!comprobarRemotos) continue;
        const existe = await cliente.existe(reciente.id).catch(() => false);
        if (version !== versionContinuarLeyendo) return;
        if (!existe) continue;
      }
      nombre = nombreDeId(reciente.id);
      alAbrir = () => abrirLibroRemoto(reciente.id);
    }
    const fila = crearFilaLibro({
      id: reciente.id,
      titulo: nombre.replace(/\.(pdf|epub)$/i, ''),
      tamano,
      formato: formatoDe(nombre),
      alAbrir,
      mostrarTerminado: false,
    });
    fila.dataset.destacado = 'true';
    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.className = 'btn-quitar-continuar';
    quitar.title = t('removeFromContinue', { title: fila.querySelector('.nombre').textContent });
    quitar.setAttribute('aria-label', quitar.title);
    quitar.innerHTML = icono('x');
    quitar.addEventListener('click', (evento) => {
      evento.stopPropagation();
      quitarDeContinuar(reciente.id);
    });
    fila.append(quitar);
    lista.append(fila);
  }
  if (!lista.children.length) return;
  seccion.classList.remove('oculto');
  actualizarDesplegableContinuar();
  aplicarOrganizacionBiblioteca();
  actualizarVisibilidadBuscadorBiblioteca();
}

// Menú «⋯» compartido: se rellena al abrirse con las acciones del libro o
// carpeta pulsado, de modo que las fichas solo cargan con un botón.
function cerrarMenuAcciones() {
  $('menu-libro').classList.add('oculto');
}

function abrirMenuAcciones(titulo, acciones, ancla) {
  $('titulo-menu-libro').textContent = titulo;
  const lista = $('lista-menu-libro');
  lista.replaceChildren();
  for (const accion of acciones) {
    const elemento = document.createElement('li');
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = `item-menu-libro${accion.peligro ? ' item-menu-peligro' : ''}${accion.clase ? ` ${accion.clase}` : ''}`;
    boton.innerHTML = `${icono(accion.icono)}<span></span>`;
    boton.querySelector('span').textContent = accion.etiqueta;
    boton.addEventListener('click', (evento) => {
      cerrarMenuAcciones();
      accion.alPulsar(evento);
    });
    elemento.append(boton);
    lista.append(elemento);
  }
  $('menu-libro').classList.remove('oculto');

  // Despliega el menú junto al botón «⋯»: alineado a su borde derecho y por
  // debajo; si no cabe en la ventana, se ajusta o se abre hacia arriba.
  const menu = document.querySelector('.menu-libro');
  const caja = ancla.getBoundingClientRect();
  const margen = 8;
  let x = Math.min(caja.right - menu.offsetWidth, window.innerWidth - menu.offsetWidth - margen);
  x = Math.max(margen, x);
  let y = caja.bottom + 4;
  const abreArriba = y + menu.offsetHeight > window.innerHeight - margen
    && caja.top - menu.offsetHeight - 4 > margen;
  if (abreArriba) y = caja.top - menu.offsetHeight - 4;
  else y = Math.min(y, Math.max(margen, window.innerHeight - menu.offsetHeight - margen));
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.classList.toggle('abre-arriba', abreArriba);
  lista.querySelector('button')?.focus();
}

$('menu-libro').addEventListener('click', (evento) => {
  if (evento.target === $('menu-libro')) cerrarMenuAcciones();
});

// Botón «⋯» que abre el menú de acciones de una ficha. El título se lee al
// pulsarlo porque los metadatos pueden sustituir el nombre tras crear la fila.
function crearBotonMenu(ficha, obtenerAcciones) {
  const menu = document.createElement('button');
  menu.type = 'button';
  menu.className = 'btn-menu-libro';
  menu.setAttribute('aria-haspopup', 'menu');
  menu.innerHTML = icono('ellipsis-vertical');
  const actualizarEtiqueta = () => {
    const titulo = ficha.querySelector('.nombre').textContent;
    menu.title = t('bookActions', { title: titulo });
    menu.setAttribute('aria-label', menu.title);
  };
  actualizarEtiqueta();
  menu.addEventListener('click', (evento) => {
    evento.stopPropagation();
    actualizarEtiqueta();
    abrirMenuAcciones(ficha.querySelector('.nombre').textContent, obtenerAcciones(), menu);
  });
  return menu;
}

// Crea la fila de un libro: la ficha lo abre y el menú «⋯» agrupa el resto de acciones.
function crearFilaLibro({
  id, titulo, tamano, formato, alAbrir, alSubir, alMover, alDescargar, alBorrar,
  alSinConexion, sinConexion = false, copiaDesactualizada = false, mostrarTerminado = true,
}) {
  const avance = progreso.progresoDe(id);
  const porcentaje = avance?.paginas ? Math.round((avance.pagina / avance.paginas) * 100) : 0;
  const estadoLectura = lecturaTerminada(avance, porcentaje)
    ? 'terminados'
    : porcentaje > 0 ? 'leyendo' : 'pendientes';

  const elemento = document.createElement('li');
  elemento.dataset.idLibro = id;
  elemento.dataset.busqueda = normalizarBusqueda(`${titulo} ${formato}`);
  elemento.dataset.titulo = normalizarBusqueda(titulo);
  elemento.dataset.autor = '';
  elemento.dataset.progreso = String(porcentaje);
  elemento.dataset.fechaLectura = avance?.posicionActualizada ?? avance?.actualizado ?? '';
  elemento.dataset.estadoLectura = estadoLectura;
  elemento.classList.toggle('libro-terminado', estadoLectura === 'terminados');
  const boton = document.createElement('div');
  boton.className = 'libro';
  boton.setAttribute('role', 'button');
  boton.tabIndex = 0;
  boton.innerHTML = `
    <span class="portada">${icono(formato === 'epub' ? 'book-open' : 'book')}</span>
    <span class="datos">
      <span class="cabecera-libro">
        <span class="nombre"></span>
        <span class="formato formato-${formato}"></span>
        <span class="estado-sin-conexion oculto"></span>
      </span>
      <span class="autor oculto"></span>
      <span class="fila-detalle"><span class="detalle"></span></span>
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
  boton.addEventListener('keydown', (evento) => {
    if (evento.target !== boton) return;
    if (evento.key !== 'Enter' && evento.key !== ' ') return;
    evento.preventDefault();
    alAbrir(evento);
  });

  if (mostrarTerminado) {
    const terminado = document.createElement('button');
    terminado.type = 'button';
    terminado.className = 'btn-terminado-en-libro';
    terminado.classList.toggle('terminado', estadoLectura === 'terminados');
    terminado.title = t(estadoLectura === 'terminados' ? 'markUnfinished' : 'markFinished', { title: titulo });
    terminado.setAttribute('aria-label', terminado.title);
    terminado.setAttribute('aria-pressed', String(estadoLectura === 'terminados'));
    terminado.innerHTML = `${icono('circle-check')}<span${estadoLectura === 'terminados' ? '' : ' class="sr-solo"'}>${t('finished')}</span>` +
      (estadoLectura === 'terminados' ? icono('x', 'icono icono-quitar-terminado') : '');
    terminado.addEventListener('click', (evento) => {
      evento.stopPropagation();
      alternarTerminado(id, estadoLectura !== 'terminados');
    });
    boton.querySelector('.fila-detalle').append(terminado);
  }

  // Miniatura de la cubierta, si ya está generada.
  almacen.obtenerPortada(id).then((blob) => {
    if (blob) boton.querySelector('.portada').replaceChildren(crearImagenPortada(blob));
  }).catch(() => null);

  const acciones = [];
  if (alSubir) acciones.push({ icono: 'cloud-upload', etiqueta: t('actionUpload'), alPulsar: alSubir });
  if (alMover) acciones.push({ icono: 'folder-input', etiqueta: t('actionMove'), alPulsar: alMover });
  if (alDescargar) acciones.push({ icono: 'download', etiqueta: t('actionDownload'), alPulsar: alDescargar });
  if (alSinConexion) {
    acciones.push({
      icono: copiaDesactualizada ? 'refresh-cw' : sinConexion ? 'cloud-check' : 'cloud-download',
      etiqueta: t(copiaDesactualizada
        ? 'actionUpdateOffline'
        : sinConexion ? 'actionRemoveOffline' : 'actionOffline'),
      alPulsar: alSinConexion,
      clase: copiaDesactualizada
        ? 'item-sin-conexion-desactualizada'
        : sinConexion ? 'item-sin-conexion-disponible' : '',
    });
  }
  if (alBorrar) acciones.push({ icono: 'trash-2', etiqueta: t('actionDelete'), alPulsar: alBorrar, peligro: true });
  if (acciones.length) boton.append(crearBotonMenu(boton, () => acciones));

  elemento.append(boton);
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
    fila.dataset.titulo = normalizarBusqueda(metadatos.titulo.trim());
  }
  if (metadatos.autor?.trim()) {
    const autor = fila.querySelector('.autor');
    autor.textContent = metadatos.autor.trim();
    autor.classList.remove('oculto');
    fila.dataset.autor = normalizarBusqueda(metadatos.autor.trim());
  }
  aplicarOrganizacionBiblioteca();
}

function aplicarOrganizacionBiblioteca() {
  const consulta = normalizarBusqueda($('buscar-biblioteca').value.trim());
  const filtro = $('filtro-biblioteca').value;
  const orden = $('orden-biblioteca').value;
  // Con búsqueda o filtro activos las secciones plegadas se muestran
  // igualmente: si no, los resultados quedarían invisibles.
  document.body.classList.toggle('filtrado-biblioteca', Boolean(consulta) || filtro !== 'todos');
  const comparadorTexto = new Intl.Collator(idiomaActual(), { sensitivity: 'base', numeric: true });

  for (const lista of [$('lista-libros'), $('lista-locales')]) {
    const filas = [...lista.querySelectorAll(':scope > li[data-id-libro]')];
    filas.sort((a, b) => {
      if (orden === 'progreso') {
        const diferencia = Number(b.dataset.progreso) - Number(a.dataset.progreso);
        if (diferencia) return diferencia;
      } else if (orden === 'autor') {
        const diferencia = comparadorTexto.compare(a.dataset.autor || a.dataset.titulo, b.dataset.autor || b.dataset.titulo);
        if (diferencia) return diferencia;
      } else if (orden === 'reciente') {
        const diferencia = (b.dataset.fechaLectura || '').localeCompare(a.dataset.fechaLectura || '');
        if (diferencia) return diferencia;
      }
      return comparadorTexto.compare(a.dataset.titulo, b.dataset.titulo);
    });
    for (const fila of filas) lista.append(fila);
  }

  let visibles = 0;
  const filas = document.querySelectorAll('#lista-libros > li, #lista-locales > li');
  for (const fila of filas) {
    const coincideTexto = !consulta || fila.dataset.busqueda?.includes(consulta);
    const coincideEstado = !fila.dataset.idLibro || filtro === 'todos' || fila.dataset.estadoLectura === filtro;
    const coincide = coincideTexto && coincideEstado;
    fila.classList.toggle('oculto', !coincide);
    if (coincide && fila.dataset.idLibro) visibles += 1;
  }
  const estado = $('estado-filtro-biblioteca');
  estado.textContent = (consulta || filtro !== 'todos') && !visibles ? t('noLibraryResults') : '';
  estado.classList.toggle('oculto', !estado.textContent);
}

$('buscar-biblioteca').addEventListener('input', aplicarOrganizacionBiblioteca);
$('filtro-biblioteca').value = localStorage.getItem(CLAVE_FILTRO_BIBLIOTECA) ?? 'todos';
$('orden-biblioteca').value = localStorage.getItem(CLAVE_ORDEN_BIBLIOTECA) ?? 'reciente';
$('filtro-biblioteca').addEventListener('change', (evento) => {
  localStorage.setItem(CLAVE_FILTRO_BIBLIOTECA, evento.target.value);
  aplicarOrganizacionBiblioteca();
});
$('orden-biblioteca').addEventListener('change', (evento) => {
  localStorage.setItem(CLAVE_ORDEN_BIBLIOTECA, evento.target.value);
  aplicarOrganizacionBiblioteca();
});

// ── Vista de la biblioteca: lista o cuadrícula de portadas ──

function aplicarVistaBiblioteca(vista) {
  const cuadricula = vista === 'cuadricula';
  for (const lista of [$('lista-libros'), $('lista-locales')]) {
    lista.classList.toggle('vista-cuadricula', cuadricula);
  }
  $('btn-vista-lista').setAttribute('aria-pressed', String(!cuadricula));
  $('btn-vista-cuadricula').setAttribute('aria-pressed', String(cuadricula));
}

aplicarVistaBiblioteca(localStorage.getItem(CLAVE_VISTA_BIBLIOTECA) ?? 'lista');
for (const [id, vista] of [['btn-vista-lista', 'lista'], ['btn-vista-cuadricula', 'cuadricula']]) {
  $(id).addEventListener('click', () => {
    localStorage.setItem(CLAVE_VISTA_BIBLIOTECA, vista);
    aplicarVistaBiblioteca(vista);
  });
}

// ── Secciones plegables: la nube y este dispositivo recuerdan su estado ──

for (const [idZona, idBoton, clave] of [
  ['zona-remota', 'btn-plegar-nube', CLAVE_PLEGADA_NUBE],
  ['zona-local', 'btn-plegar-local', CLAVE_PLEGADA_LOCAL],
]) {
  const zona = $(idZona);
  const boton = $(idBoton);
  const aplicar = (plegada) => {
    zona.classList.toggle('seccion-plegada', plegada);
    boton.setAttribute('aria-expanded', String(!plegada));
  };
  aplicar(localStorage.getItem(clave) === '1');
  const alternar = () => {
    const plegada = !zona.classList.contains('seccion-plegada');
    if (plegada) localStorage.setItem(clave, '1');
    else localStorage.removeItem(clave);
    aplicar(plegada);
  };
  boton.addEventListener('click', alternar);
  zona.querySelector('.encabezado-seccion').addEventListener('click', alternar);
}

async function alternarTerminado(id, terminado) {
  progreso.marcarTerminado(id, terminado);
  if (terminado) retirarFilaVisibleDeContinuar(id);
  if (!id.startsWith('local:') && cliente) {
    try {
      await progreso.sincronizar(cliente);
      actualizarEstadoSincronizacion();
    } catch (error) {
      actualizarEstadoSincronizacion(error);
      avisar(t('syncFailed', { error: explicarError(error) }), 7000);
    }
  }
  cargarBiblioteca();
}

function actualizarVisibilidadBuscadorBiblioteca() {
  const hayLibros = document.querySelector('#lista-libros > li[data-id-libro], #lista-locales > li[data-id-libro]') !== null;
  document.querySelector('.buscador-biblioteca').classList.toggle('oculto', !hayLibros);
  $('organizacion-biblioteca').classList.toggle('oculto', !hayLibros);
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
  // Es un div con role="button" (no un <button>) para poder alojar dentro
  // el botón «⋯» del menú: un botón anidado en otro no es HTML válido.
  const boton = document.createElement('div');
  boton.className = 'libro carpeta';
  boton.setAttribute('role', 'button');
  boton.tabIndex = 0;
  boton.title = t('openFolder', { name: nombre });
  boton.innerHTML = `
    <span class="portada portada-carpeta">${icono('folder')}</span>
    <span class="datos"><span class="cabecera-libro"><span class="nombre"></span></span></span>`;
  boton.querySelector('.nombre').textContent = nombre;
  const abrir = () => {
    rutaNube = rutaNube ? `${rutaNube}/${nombre}` : nombre;
    cargarBiblioteca();
  };
  boton.addEventListener('click', abrir);
  boton.addEventListener('keydown', (evento) => {
    if (evento.target !== boton) return;
    if (evento.key !== 'Enter' && evento.key !== ' ') return;
    evento.preventDefault();
    abrir();
  });
  hacerDestinoDeLibro(boton, rutaNube ? `${rutaNube}/${nombre}` : nombre);

  if (!soloLectura) {
    boton.append(crearBotonMenu(boton, () => [{
      icono: 'trash-2',
      etiqueta: t('actionDeleteFolder'),
      alPulsar: () => borrarCarpetaRemota(nombre),
      peligro: true,
    }]));
  }
  elemento.append(boton);
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
  aplicarOrganizacionBiblioteca();
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
    await anotaciones.olvidarPorPrefijo(cliente.base, ruta + '/').catch(() => null);
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
    await anotaciones.sincronizar(id, cliente).catch(() => null);
    await cliente.mover(id, destino, sobrescribir);
    const anotacionesMovidas = await cliente.moverAnotaciones(id, destino, sobrescribir)
      .catch(() => false);
    // Si el origen no tenía JSON lateral y se reemplazó otro libro, se
    // elimina el lateral antiguo para que sus resaltados no reaparezcan.
    if (sobrescribir && !anotacionesMovidas) {
      await cliente.borrarAnotaciones(destino);
    }
    if (sobrescribir) await anotaciones.olvidar(cliente.base, destino).catch(() => null);
    await anotaciones.mover(cliente.base, id, destino).catch(() => null);
    if (!anotacionesMovidas) await anotaciones.sincronizar(destino, cliente).catch(() => null);
    await cliente.borrarAnotaciones(id).catch(() => null);
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
  aplicarOrganizacionBiblioteca();
  actualizarVisibilidadBuscadorBiblioteca();
  return libros.length;
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
function entregarDescarga(nombre, datos, tipo) {
  tipo ??= /\.epub$/i.test(nombre) ? 'application/epub+zip' : 'application/pdf';
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
    await anotaciones.transferir('local', libro.id, cliente.base, destino).catch(() => null);
    await anotaciones.sincronizar(destino, cliente).catch(() => null);
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
    await cliente.borrarAnotaciones(id).catch(() => null);
    await almacen.borrarCopiaRemota(cliente.base, id).catch(() => null);
    await anotaciones.olvidar(cliente.base, id).catch(() => null);
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
    await anotaciones.olvidar('local', libro.id).catch(() => null);
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
    if (error.code !== 'PDF_PASSWORD_CANCELLED') avisar(explicarError(error), 6000);
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
    if (error.code !== 'PDF_PASSWORD_CANCELLED') {
      avisar(t('openFailed', { error: error.message }), 6000);
    }
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
  const abiertoDirectamente = abrirSiEsUno && validos.length === 1;
  let guardados = 0;
  try {
    for (const archivo of validos) {
      try {
        await guardarArchivoLocal(archivo, abiertoDirectamente);
        guardados += 1;
      } catch (error) {
        avisar(t('saveFailed', { title: archivo.name, error: error.message }), 6000);
      }
    }
  } finally {
    ocultarCarga();
  }
  // Aunque un único archivo se abra inmediatamente, se repinta la lista que
  // queda detrás del lector. Así el libro ya está presente al volver incluso
  // si la navegación del historial no provoca una recarga completa.
  await cargarLibrosLocales();
  if (!abiertoDirectamente && guardados) {
    avisar(t(guardados === 1 ? 'localAddedOne' : 'localAddedMany', { count: guardados }));
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
  cerrarPanelAnotaciones();
  cancelarSeleccion();
  anotacionesActuales = [];
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
  $('btn-rotar').classList.toggle('oculto', esEpub);
  $('btn-pagina-completa').classList.toggle('oculto', esEpub);
  aplicarAparienciaDoble();
  reiniciarRitmo();
  detenerLecturaVoz();
  cerrarPanelTts();
  salirModoInmersivo();
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
      lectorEpub.alineacion = alineacionEpubGuardada();
      lectorEpub.doble = dobleGuardado();
      prepararSeguimientoEpub(avance?.cfi ?? null);
      try {
        await lectorEpub.abrir(datos, avance?.cfi ?? null, modoActual());
      } finally {
        restaurandoPosicionEpub = false;
      }
      lectorEpub.aplicarNoche(document.body.classList.contains('modo-noche'));
      if (avance?.cfi) avisar(t('continuing'));
    } else {
      lectorEpub.cerrar();
      lector.rotacion = rotacionPdfDe(libro.id);
      lector.doble = dobleGuardado();
      await lector.abrir(datos, avance?.pagina ?? 1, modoActual(), zoomPdfGuardado(), ajustePdfGuardado());
      aplicarAparienciaAjustePdf();
      if (avance && avance.pagina > 1) {
        avisar(t('continuingPage', { page: avance.pagina }));
      }
    }
    await cargarAnotacionesLibro();
    await cargarIndiceLibro(esEpub ? lectorEpub : lector, libro.id);
    pintarTiempoRestante();
    if (lecturaTerminada(avance)) progreso.marcarTerminado(libro.id, false);
    restaurarEnContinuar(libro.id);
    continuarExpandido = false;
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
    const idLocal = libroActual.id;
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
    await anotaciones.transferir('local', idLocal, cliente.base, destino).catch(() => null);

    libroActual = {
      id: destino,
      titulo: nombre.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'webdav',
      formato: formatoDe(nombre),
    };
    $('titulo-libro').textContent = libroActual.titulo;
    $('btn-subir').classList.add('oculto');
    await progreso.sincronizar(cliente).catch(() => null);
    await anotaciones.sincronizar(destino, cliente).catch(() => null);
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
  // La vista doble solo actúa pasando página: en continuo se oculta el botón.
  $('btn-doble').classList.toggle('oculto', modo === 'continuo');
  if (!$('fondo-menu-lector').classList.contains('oculto')) actualizarMenuLector();
}

function aplicarAparienciaDoble(activo = dobleGuardado()) {
  $('btn-doble').setAttribute('aria-pressed', String(activo));
  $('btn-doble').title = t(activo ? 'onePage' : 'twoPages');
}

$('btn-modo').addEventListener('click', async () => {
  const nuevo = modoActual() === 'continuo' ? 'pagina' : 'continuo';
  localStorage.setItem(CLAVE_MODO, nuevo);
  aplicarAparienciaModo(nuevo);
  if (epubAbierto()) await lectorEpub.cambiarModo(nuevo);
  else await lector.cambiarModo(nuevo);
});

$('btn-doble').addEventListener('click', async () => {
  const activo = !dobleGuardado();
  localStorage.setItem(CLAVE_DOBLE, activo ? '1' : '0');
  aplicarAparienciaDoble(activo);
  if (epubAbierto()) await lectorEpub.cambiarDoble(activo);
  else await lector.cambiarDoble(activo);
});

$('btn-rotar').addEventListener('click', async () => {
  if (epubAbierto() || !libroActual) return;
  await lector.rotar();
  guardarRotacionPdf(libroActual.id, lector.rotacion);
});

// ───────────────────────── Progreso y sincronización ─────────────────────────

let restaurandoPosicionEpub = false;
let cfiEpubGuardado = null;
let cfiEpubPendientePorcentaje = null;

function prepararSeguimientoEpub(cfiInicial) {
  cfiEpubGuardado = cfiInicial;
  cfiEpubPendientePorcentaje = null;
  // epub.js reubica el CFI recibido al inicio de la página visual. Ese punto
  // depende del ancho y la tipografía del dispositivo y no es un avance real.
  restaurandoPosicionEpub = Boolean(cfiInicial);
}

function planificarSincronizacion() {
  if (libroActual?.tipo !== 'webdav' || !cliente) return;
  clearTimeout(temporizadorSync);
  temporizadorSync = setTimeout(() => {
    progreso.sincronizar(cliente)
      .then(() => actualizarEstadoSincronizacion())
      .catch((error) => {
        actualizarEstadoSincronizacion(error);
        avisar(t('syncFailed', { error: explicarError(error) }), 7000);
      });
  }, 3000);
}

// ───────────── Tiempo de lectura restante estimado ─────────────
// Se mide el ritmo real de lectura en este dispositivo: segundos acumulados
// por unidad avanzada (páginas en PDF, puntos de porcentaje en EPUB). Las
// pausas largas y los saltos grandes no cuentan como lectura.
const ritmoSesion = { marca: null, unidad: null };

function reiniciarRitmo() {
  ritmoSesion.marca = null;
  ritmoSesion.unidad = null;
}

function anotarRitmo(unidad) {
  const ahora = Date.now();
  const { marca, unidad: anterior } = ritmoSesion;
  ritmoSesion.marca = ahora;
  ritmoSesion.unidad = unidad;
  if (marca === null || !libroActual) return;
  const segundos = (ahora - marca) / 1000;
  const avance = unidad - anterior;
  if (segundos < 3 || segundos > 300 || avance < 0 || avance > 4) return;
  const mapa = leerMapaLocal(CLAVE_RITMO);
  const entrada = mapa[libroActual.id] ?? { s: 0, u: 0 };
  entrada.s += segundos;
  entrada.u += avance;
  entrada.t = ahora;
  mapa[libroActual.id] = entrada;
  // Se conservan solo los 100 libros con lectura más reciente.
  const ids = Object.keys(mapa);
  if (ids.length > 100) {
    ids.sort((a, b) => (mapa[a].t ?? 0) - (mapa[b].t ?? 0));
    for (const id of ids.slice(0, ids.length - 100)) delete mapa[id];
  }
  localStorage.setItem(CLAVE_RITMO, JSON.stringify(mapa));
}

function tiempoRestanteEstimado() {
  if (!libroActual) return '';
  const entrada = leerMapaLocal(CLAVE_RITMO)[libroActual.id];
  // Hasta acumular unos minutos de lectura real la estimación no es fiable.
  if (!entrada || entrada.u < 3 || entrada.s < 120) return '';
  const restante = epubAbierto()
    ? (lectorEpub.conLocalizaciones ? Math.max(0, 100 - lectorEpub.porcentaje) : null)
    : Math.max(0, lector.totalPaginas - lector.pagina);
  if (restante === null) return '';
  const minutos = Math.round(((entrada.s / entrada.u) * restante) / 60);
  if (minutos < 1) return t('timeLessMinute');
  if (minutos >= 60) return t('timeHoursMinutes', { h: Math.floor(minutos / 60), m: minutos % 60 });
  return t('timeMinutes', { m: minutos });
}

function pintarTiempoRestante() {
  const texto = tiempoRestanteEstimado();
  $('tiempo-restante').textContent = texto ? `≈ ${texto}` : '';
  $('tiempo-restante').classList.toggle('oculto', !texto);
}

function cuandoCambiaPagina(pagina, total) {
  const visible = lector.enDoble() && pagina < total ? `${pagina}-${pagina + 1}` : String(pagina);
  $('btn-indicador').textContent = `${visible} / ${total}`;
  if (!libroActual) return;
  progreso.anotarPagina(libroActual.id, pagina, total);
  anotarRitmo(pagina);
  pintarTiempoRestante();
  // Navegar a mano mientras suena la lectura en voz alta la detiene; los
  // avances del propio TTS y los remontados (zoom, resize) no.
  if (ttsAvanzando) ttsUltimaPosicion = pagina;
  else if (vozLectura.estado !== 'parado' && pagina !== ttsUltimaPosicion) vozLectura.detener();
  planificarSincronizacion();
}

function cuandoCambiaPosicionEpub(cfi, porcentaje, conLocalizaciones) {
  $('btn-indicador').textContent = conLocalizaciones ? `${porcentaje}%` : '…';
  if (!libroActual || !cfi) return;
  if (restaurandoPosicionEpub) {
    cfiEpubGuardado = cfi;
    return;
  }
  if (ttsAvanzando) {
    // epub.js reubica varias veces tras mostrar un capítulo (afina el CFI):
    // mientras dura la ventana de avance se acepta cada reubicación como
    // parte del salto; la bandera la limpia el temporizador del avance.
    ttsUltimaPosicion = cfi;
  } else if (vozLectura.estado !== 'parado' && cfi !== ttsUltimaPosicion) {
    vozLectura.detener();
  }
  if (conLocalizaciones) {
    anotarRitmo(porcentaje);
    pintarTiempoRestante();
  }
  if (cfi === cfiEpubGuardado) {
    // Si el usuario se movió antes de que terminara el cálculo del porcentaje,
    // se completa ahora el mismo cambio. En una apertura normal no se escribe.
    if (!(conLocalizaciones && cfiEpubPendientePorcentaje === cfi)) return;
    cfiEpubPendientePorcentaje = null;
  } else {
    cfiEpubGuardado = cfi;
    cfiEpubPendientePorcentaje = conLocalizaciones ? null : cfi;
  }
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
let consultaBusquedaLibro = '';
let versionBusquedaLibro = 0;
const historialNavegacion = { atras: [], adelante: [] };

function posicionActualLibro() {
  return epubAbierto() ? lectorEpub.cfi : lector.pagina;
}

function actualizarHistorialNavegacion() {
  const hayAtras = historialNavegacion.atras.length > 0;
  const hayAdelante = historialNavegacion.adelante.length > 0;
  const hayHistorial = hayAtras || hayAdelante;
  for (const id of ['btn-posicion-anterior', 'btn-posicion-anterior-escritorio']) {
    $(id).disabled = !hayAtras;
  }
  for (const id of ['btn-posicion-siguiente', 'btn-posicion-siguiente-escritorio']) {
    $(id).disabled = !hayAdelante;
  }
  document.querySelector('.grupo-posicion').classList.toggle('tiene-historial', hayHistorial);
  $('historial-navegacion').classList.toggle('oculto', !hayHistorial);
  $('btn-indicador').classList.toggle('tiene-historial', hayHistorial);
  $('btn-indicador').title = hayHistorial ? t('pageAndHistory') : t('goPage');
}

function reiniciarHistorialNavegacion() {
  historialNavegacion.atras = [];
  historialNavegacion.adelante = [];
  actualizarHistorialNavegacion();
}

// En pantallas estrechas las acciones menos frecuentes viven en un menú
// compacto. Los botones del menú activan los mismos controles de escritorio,
// de modo que ambos diseños comparten exactamente el mismo comportamiento.
function actualizarMenuLector() {
  $('titulo-menu-lector').textContent = libroActual?.titulo ?? '';
  $('fila-menu-subir').classList.toggle('oculto', $('btn-subir').classList.contains('oculto'));
  $('fila-menu-indice').classList.toggle('oculto', $('btn-indice-libro').classList.contains('oculto'));
  $('fila-menu-texto').classList.toggle('oculto', $('control-texto').classList.contains('oculto'));
  $('fila-menu-rotar').classList.toggle('oculto', $('btn-rotar').classList.contains('oculto'));
  $('fila-menu-doble').classList.toggle('oculto', $('btn-doble').classList.contains('oculto'));
  $('menu-pagina-completa').classList.toggle('oculto', $('btn-pagina-completa').classList.contains('oculto'));

  const modo = modoActual();
  $('menu-modo').innerHTML = icono(modo === 'continuo' ? 'file-text' : 'scroll-text') +
    `<span>${t(modo === 'continuo' ? 'pageMode' : 'scrollMode')}</span>`;
  $('menu-doble').innerHTML = icono('columns-2') +
    `<span>${t(dobleGuardado() ? 'onePage' : 'twoPages')}</span>`;
  const noche = document.body.classList.contains('modo-noche');
  $('menu-noche').innerHTML = icono(noche ? 'sun' : 'moon') +
    `<span>${t(noche ? 'dayMode' : 'nightMode')}</span>`;
  const tiempo = tiempoRestanteEstimado();
  $('fila-menu-tiempo').classList.toggle('oculto', !tiempo);
  $('tiempo-restante-menu').textContent = tiempo ? t('timeLeftMenu', { time: tiempo }) : '';
}

function cerrarMenuLector() {
  $('fondo-menu-lector').classList.add('oculto');
  $('btn-menu-lector').setAttribute('aria-expanded', 'false');
}

function abrirMenuLector() {
  cerrarBusquedaLibro();
  cerrarIndiceLibro();
  cerrarPanelMarcadores();
  cerrarPanelAnotaciones();
  cerrarPanelTexto();
  cerrarPanelTts();
  actualizarMenuLector();
  $('fondo-menu-lector').classList.remove('oculto');
  $('btn-menu-lector').setAttribute('aria-expanded', 'true');
  $('menu-lector').querySelector('button:not([disabled])')?.focus();
}

$('btn-menu-lector').addEventListener('click', () => {
  if ($('fondo-menu-lector').classList.contains('oculto')) abrirMenuLector();
  else cerrarMenuLector();
});
$('fondo-menu-lector').addEventListener('click', (evento) => {
  if (evento.target === $('fondo-menu-lector')) cerrarMenuLector();
});

function enlazarAccionMenu(idMenu, idOriginal) {
  $(idMenu).addEventListener('click', (evento) => {
    evento.stopPropagation();
    cerrarMenuLector();
    // Se ejecuta tras terminar el clic actual para que los manejadores que
    // cierran paneles al tocar fuera no cierren también el que se va a abrir.
    queueMicrotask(() => $(idOriginal).click());
  });
}

for (const [idMenu, idOriginal] of [
  ['menu-subir', 'btn-subir'],
  ['menu-indice', 'btn-indice-libro'],
  ['menu-anotaciones', 'btn-anotaciones'],
  ['menu-tts', 'btn-tts'],
  ['menu-modo', 'btn-modo'],
  ['menu-doble', 'btn-doble'],
  ['menu-rotar', 'btn-rotar'],
  ['menu-texto', 'btn-texto'],
  ['menu-zoom-menos', 'btn-zoom-menos'],
  ['menu-ancho-auto', 'btn-ancho-auto'],
  ['menu-pagina-completa', 'btn-pagina-completa'],
  ['menu-zoom-mas', 'btn-zoom-mas'],
  ['menu-noche', 'btn-noche'],
]) enlazarAccionMenu(idMenu, idOriginal);

// Apunta una posición de partida en el historial sin navegar (el salto ya
// lo hace otro, como epub.js con los enlaces internos del libro).
function apuntarEnHistorial(posicion) {
  if (posicion === null || posicion === undefined) return;
  historialNavegacion.atras.push(posicion);
  if (historialNavegacion.atras.length > 50) historialNavegacion.atras.shift();
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

for (const id of ['btn-posicion-anterior', 'btn-posicion-anterior-escritorio']) {
  $(id).addEventListener('click', () => {
    moverPorHistorial(historialNavegacion.atras, historialNavegacion.adelante)
      .catch((error) => avisar(error.message, 5000));
  });
}
for (const id of ['btn-posicion-siguiente', 'btn-posicion-siguiente-escritorio']) {
  $(id).addEventListener('click', () => {
    moverPorHistorial(historialNavegacion.adelante, historialNavegacion.atras)
      .catch((error) => avisar(error.message, 5000));
  });
}

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
    if (!$('fondo-menu-lector').classList.contains('oculto')) actualizarMenuLector();
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
  cerrarPanelAnotaciones();
  const abrir = panel.classList.contains('oculto');
  panel.classList.toggle('oculto', !abrir);
  $('btn-marcadores').setAttribute('aria-expanded', String(abrir));
  if (abrir) pintarMarcadores();
});
$('cerrar-marcadores').addEventListener('click', cerrarPanelMarcadores);

// ────────────────── Anotaciones y resaltados ──────────────────

function mostrarNotaEmergente(anotacion, rectangulo) {
  if (!anotacion?.nota || !rectangulo) return;
  if (!$('menu-nota-contextual').classList.contains('oculto')) return;
  const ventana = $('ventana-nota');
  ventana.textContent = anotacion.nota;
  ventana.classList.remove('oculto');
  ventana.style.left = '0';
  ventana.style.top = '0';

  const margen = 8;
  const ancho = ventana.offsetWidth;
  const alto = ventana.offsetHeight;
  const izquierda = Math.min(
    window.innerWidth - ancho - margen,
    Math.max(margen, rectangulo.left),
  );
  let arriba = rectangulo.top - alto - margen;
  if (arriba < margen) arriba = rectangulo.bottom + margen;
  arriba = Math.min(window.innerHeight - alto - margen, Math.max(margen, arriba));
  ventana.style.left = `${izquierda}px`;
  ventana.style.top = `${arriba}px`;
}

function ocultarNotaEmergente() {
  $('ventana-nota').classList.add('oculto');
}

function cerrarMenuNota() {
  anotacionMenuId = null;
  $('menu-nota-contextual').classList.add('oculto');
}

function abrirMenuNota(id, rectangulo) {
  const anotacion = anotacionesActuales.find((entrada) => entrada.id === id && entrada.nota);
  if (!anotacion || !rectangulo) return;
  ocultarNotaEmergente();
  anotacionMenuId = id;
  const menu = $('menu-nota-contextual');
  menu.classList.remove('oculto');
  menu.style.left = '0';
  menu.style.top = '0';
  const margen = 8;
  const ancho = menu.offsetWidth;
  const alto = menu.offsetHeight;
  const izquierda = Math.min(
    window.innerWidth - ancho - margen,
    Math.max(margen, rectangulo.right - ancho),
  );
  let arriba = rectangulo.bottom + 6;
  if (arriba + alto > window.innerHeight - margen) arriba = rectangulo.top - alto - 6;
  menu.style.left = `${izquierda}px`;
  menu.style.top = `${Math.max(margen, arriba)}px`;
  $('accion-editar-nota').focus();
}

function ambitoAnotacionesActual() {
  return anotaciones.ambitoDe(libroActual, cliente);
}

function mostrarResaltados() {
  if (epubAbierto()) lectorEpub.mostrarAnotaciones(anotacionesActuales);
  else lector.mostrarAnotaciones(anotacionesActuales);
}

async function cargarAnotacionesLibro() {
  if (!libroActual) return;
  const id = libroActual.id;
  const ambito = ambitoAnotacionesActual();
  anotacionesActuales = await anotaciones.listar(ambito, id).catch(() => []);
  if (libroActual?.id !== id) return;
  mostrarResaltados();
  if (libroActual.tipo === 'webdav' && cliente) {
    await anotaciones.sincronizar(id, cliente).catch(() => null);
    if (libroActual?.id !== id) return;
    anotacionesActuales = await anotaciones.listar(ambito, id).catch(() => anotacionesActuales);
    mostrarResaltados();
  }
}

function planificarSyncAnotaciones() {
  if (libroActual?.tipo !== 'webdav' || !cliente) return;
  const id = libroActual.id;
  clearTimeout(temporizadorSyncAnotaciones);
  temporizadorSyncAnotaciones = setTimeout(() => {
    anotaciones.sincronizar(id, cliente).catch(() => null);
  }, 1200);
}

async function sincronizarAlRecuperarConexion() {
  if (!cliente) return;
  const clienteEnUso = cliente;
  const libroEnUso = libroActual?.tipo === 'webdav' ? libroActual.id : null;

  // Reintenta primero todos los cambios que quedaron pendientes sin conexión.
  await Promise.all([
    progreso.sincronizar(clienteEnUso),
    anotaciones.sincronizarPendientes(clienteEnUso),
  ]);
  if (cliente !== clienteEnUso || !libroEnUso || libroActual?.id !== libroEnUso) return;

  // El libro abierto también se consulta aunque no tenga cambios propios:
  // así aparecen las anotaciones creadas en otro dispositivo al volver la red.
  await anotaciones.sincronizar(libroEnUso, clienteEnUso);
  if (cliente !== clienteEnUso || libroActual?.id !== libroEnUso) return;
  anotacionesActuales = await anotaciones.listar(clienteEnUso.base, libroEnUso);
  mostrarResaltados();
  if (!$('panel-anotaciones').classList.contains('oculto')) pintarAnotaciones();
}

function manejarSeleccionTexto(seleccion) {
  if (!libroActual || !seleccion?.texto) return;
  seleccionPendiente = seleccion;
  $('barra-seleccion').classList.remove('oculto');
}

function limpiarSeleccionNativa() {
  window.getSelection()?.removeAllRanges();
  for (const contents of lectorEpub.vista?.getContents?.() ?? []) {
    contents.window?.getSelection?.().removeAllRanges();
  }
}

function cancelarSeleccion() {
  seleccionPendiente = null;
  $('barra-seleccion').classList.add('oculto');
  limpiarSeleccionNativa();
}

async function guardarSeleccionComoAnotacion(nota = '', color = colorResaltadoGuardado()) {
  if (!libroActual || !seleccionPendiente) return;
  const seleccion = seleccionPendiente;
  const ambito = ambitoAnotacionesActual();
  anotacionesActuales = await anotaciones.crear(ambito, libroActual.id, {
    ...seleccion,
    color: COLORES_RESALTADO.includes(color) ? color : 'amarillo',
    ...(nota.trim() ? { nota: nota.trim().slice(0, 4000) } : {}),
  });
  cancelarSeleccion();
  mostrarResaltados();
  pintarAnotaciones();
  planificarSyncAnotaciones();
  avisar(t('annotationAdded'));
}

for (const boton of document.querySelectorAll('#barra-seleccion .punto-color')) {
  boton.addEventListener('click', () => {
    localStorage.setItem(CLAVE_COLOR_RESALTADO, boton.dataset.color);
    guardarSeleccionComoAnotacion('', boton.dataset.color)
      .catch((error) => avisar(error.message, 5000));
  });
}
$('btn-nota-seleccion').addEventListener('click', () => {
  const nota = prompt(t('notePrompt'), '');
  if (nota === null) return;
  guardarSeleccionComoAnotacion(nota).catch((error) => avisar(error.message, 5000));
});
$('btn-cancelar-seleccion').addEventListener('click', cancelarSeleccion);

function cerrarPanelAnotaciones() {
  $('panel-anotaciones').classList.add('oculto');
  $('btn-anotaciones').setAttribute('aria-expanded', 'false');
}

function ubicacionAnotacion(anotacion) {
  const pagina = anotacion.paginas?.[0]?.pagina;
  if (pagina) return `${t('page')} ${pagina}`;
  if (anotacion.cfi) return t('chapter');
  return '';
}

function marcarColorEditor(color) {
  for (const boton of document.querySelectorAll('#colores-editar-nota .punto-color')) {
    boton.setAttribute('aria-pressed', String(boton.dataset.color === color));
  }
}

function colorElegidoEditor() {
  return document.querySelector('#colores-editar-nota .punto-color[aria-pressed="true"]')
    ?.dataset.color ?? 'amarillo';
}

for (const boton of document.querySelectorAll('#colores-editar-nota .punto-color')) {
  boton.addEventListener('click', () => marcarColorEditor(boton.dataset.color));
}

async function editarAnotacionPorId(id) {
  if (!libroActual) return;
  const anotacion = anotacionesActuales.find((entrada) => entrada.id === id);
  if (!anotacion) return;
  ocultarNotaEmergente();
  cerrarMenuNota();
  anotacionEditandoId = id;
  $('fragmento-editar-nota').textContent = anotacion.texto ?? '';
  $('texto-editar-nota').value = anotacion.nota ?? '';
  marcarColorEditor(colorDeAnotacion(anotacion));
  $('dialogo-editar-nota').classList.remove('oculto');
  $('texto-editar-nota').focus();
  $('texto-editar-nota').setSelectionRange(
    $('texto-editar-nota').value.length,
    $('texto-editar-nota').value.length,
  );
}

function cerrarEditorNota() {
  anotacionEditandoId = null;
  $('dialogo-editar-nota').classList.add('oculto');
}

$('form-editar-nota').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = anotacionEditandoId;
  if (!id || !libroActual) return;
  const nota = $('texto-editar-nota').value.trim().slice(0, 4000);
  try {
    anotacionesActuales = await anotaciones.actualizar(
      ambitoAnotacionesActual(), libroActual.id, id, { nota, color: colorElegidoEditor() },
    );
  } catch (error) {
    avisar(error.message, 5000);
    return;
  }
  cerrarEditorNota();
  mostrarResaltados();
  if (!$('panel-anotaciones').classList.contains('oculto')) pintarAnotaciones(id);
  planificarSyncAnotaciones();
});

$('btn-cancelar-editar-nota').addEventListener('click', cerrarEditorNota);
$('dialogo-editar-nota').addEventListener('click', (evento) => {
  if (evento.target === $('dialogo-editar-nota')) cerrarEditorNota();
});

async function eliminarAnotacionPorId(id) {
  if (!libroActual || !anotacionesActuales.some((entrada) => entrada.id === id)) return;
  if (!confirm(t('deleteAnnotationConfirm'))) return;
  anotacionesActuales = await anotaciones.eliminar(
    ambitoAnotacionesActual(), libroActual.id, id,
  );
  mostrarResaltados();
  if (!$('panel-anotaciones').classList.contains('oculto')) pintarAnotaciones();
  planificarSyncAnotaciones();
  avisar(t('annotationDeleted'));
}

$('accion-editar-nota').addEventListener('click', () => {
  const id = anotacionMenuId;
  cerrarMenuNota();
  if (id) editarAnotacionPorId(id).catch((error) => avisar(error.message, 5000));
});

$('accion-eliminar-nota').addEventListener('click', () => {
  const id = anotacionMenuId;
  cerrarMenuNota();
  if (id) eliminarAnotacionPorId(id).catch((error) => avisar(error.message, 5000));
});

document.addEventListener('pointerdown', (evento) => {
  const menu = $('menu-nota-contextual');
  if (menu.classList.contains('oculto') || menu.contains(evento.target) ||
      evento.target.closest?.('.boton-nota-margen')) return;
  cerrarMenuNota();
});

// Orden de lectura: por página en PDF y por fecha de creación en EPUB (los
// CFI no se pueden comparar como texto plano).
function anotacionesOrdenadas() {
  return [...anotacionesActuales].sort((a, b) =>
    (a.paginas?.[0]?.pagina ?? 0) - (b.paginas?.[0]?.pagina ?? 0) ||
    (a.creado ?? '').localeCompare(b.creado ?? ''));
}

function pintarAnotaciones(idEnfocado = null) {
  const lista = $('lista-anotaciones');
  lista.replaceChildren();
  const consulta = normalizarBusqueda($('buscar-anotaciones').value.trim());
  const ordenadas = anotacionesOrdenadas().filter((anotacion) =>
    !consulta || normalizarBusqueda(`${anotacion.texto ?? ''} ${anotacion.nota ?? ''}`).includes(consulta));
  $('btn-exportar-anotaciones').classList.toggle('oculto', !anotacionesActuales.length);
  const sinAnotaciones = $('sin-anotaciones');
  sinAnotaciones.textContent = t(anotacionesActuales.length ? 'noAnnotationResults' : 'noAnnotations');
  sinAnotaciones.classList.toggle('oculto', ordenadas.length > 0);
  for (const anotacion of ordenadas) {
    const li = document.createElement('li');
    li.className = 'fila-anotacion';
    li.dataset.id = anotacion.id;
    const ir = document.createElement('button');
    ir.type = 'button';
    ir.className = 'ir-anotacion';
    const texto = document.createElement('span');
    texto.className = 'texto-anotacion';
    texto.textContent = anotacion.texto;
    ir.append(texto);
    if (anotacion.nota) {
      const nota = document.createElement('span');
      nota.className = 'nota-anotacion';
      nota.textContent = anotacion.nota;
      ir.append(nota);
    }
    const ubicacion = document.createElement('span');
    ubicacion.className = 'ubicacion-anotacion';
    const punto = document.createElement('span');
    punto.className = 'punto-color-mini';
    punto.dataset.color = colorDeAnotacion(anotacion);
    ubicacion.append(punto, document.createTextNode(ubicacionAnotacion(anotacion)));
    ir.append(ubicacion);
    ir.addEventListener('click', async () => {
      const destino = anotacion.cfi ?? anotacion.paginas?.[0]?.pagina;
      if (destino !== undefined) await saltarConHistorial(destino).catch((error) => avisar(error.message, 5000));
      cerrarPanelAnotaciones();
    });

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'btn-icono';
    editar.title = t('editNote');
    editar.innerHTML = icono('pencil');
    editar.addEventListener('click', () => {
      editarAnotacionPorId(anotacion.id).catch((error) => avisar(error.message, 5000));
    });

    const borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.className = 'btn-icono';
    borrar.title = t('deleteAnnotation');
    borrar.innerHTML = icono('trash-2');
    borrar.addEventListener('click', () => {
      eliminarAnotacionPorId(anotacion.id).catch((error) => avisar(error.message, 5000));
    });
    li.append(ir, editar, borrar);
    lista.append(li);
  }
  if (idEnfocado) lista.querySelector(`[data-id="${CSS.escape(idEnfocado)}"] .ir-anotacion`)?.focus();
}

// Ubicación legible de una anotación en el archivo exportado: página en PDF
// y porcentaje aproximado del libro en EPUB (cuando hay localizaciones).
function ubicacionExportacion(anotacion) {
  const pagina = anotacion.paginas?.[0]?.pagina;
  if (pagina) return `${t('page')} ${pagina}`;
  if (anotacion.cfi && epubAbierto() && lectorEpub.conLocalizaciones) {
    try {
      const pct = Math.round(lectorEpub.libro.locations.percentageFromCfi(anotacion.cfi) * 100);
      if (Number.isFinite(pct)) return `≈ ${pct} %`;
    } catch { /* CFI fuera de las localizaciones: se omite la ubicación */ }
  }
  return '';
}

function markdownAnotaciones() {
  const fecha = new Date().toLocaleDateString(idiomaActual(),
    { year: 'numeric', month: 'long', day: 'numeric' });
  const lineas = [
    `# ${t('exportHeader', { title: libroActual.titulo })}`,
    '',
    `${t('exportSource')} · ${fecha}`,
    '',
  ];
  for (const anotacion of anotacionesOrdenadas()) {
    lineas.push('---', '');
    const cita = (anotacion.texto ?? '').trim();
    if (cita) {
      for (const linea of cita.split('\n')) lineas.push(`> ${linea}`);
      lineas.push('');
    }
    if (anotacion.nota) lineas.push(`**${t('note')}:** ${anotacion.nota.trim()}`, '');
    const ubicacion = ubicacionExportacion(anotacion);
    if (ubicacion) lineas.push(`*${ubicacion}*`, '');
  }
  return lineas.join('\n');
}

function exportarAnotaciones() {
  if (!libroActual || !anotacionesActuales.length) return;
  const titulo = libroActual.titulo.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
  const nombre = `${titulo || 'libro'} - ${t('annotations').toLowerCase()}.md`;
  entregarDescarga(nombre, markdownAnotaciones(), 'text/markdown');
  avisar(t('annotationsExported'));
}

$('btn-exportar-anotaciones').addEventListener('click', exportarAnotaciones);

function abrirPanelAnotaciones(id = null) {
  ocultarNotaEmergente();
  cerrarMenuNota();
  cerrarBusquedaLibro();
  cerrarIndiceLibro();
  cerrarPanelMarcadores();
  if (id) $('buscar-anotaciones').value = '';
  pintarAnotaciones(id);
  $('panel-anotaciones').classList.remove('oculto');
  $('btn-anotaciones').setAttribute('aria-expanded', 'true');
}

$('btn-anotaciones').addEventListener('click', () => {
  if ($('panel-anotaciones').classList.contains('oculto')) abrirPanelAnotaciones();
  else cerrarPanelAnotaciones();
});
$('cerrar-anotaciones').addEventListener('click', cerrarPanelAnotaciones);
$('buscar-anotaciones').addEventListener('input', () => pintarAnotaciones());

function cerrarBusquedaLibro() {
  versionBusquedaLibro += 1;
  $('panel-busqueda-libro').classList.add('oculto');
}

$('btn-buscar-libro').addEventListener('click', () => {
  const panel = $('panel-busqueda-libro');
  cerrarIndiceLibro();
  cerrarPanelMarcadores();
  cerrarPanelAnotaciones();
  panel.classList.toggle('oculto');
  if (!panel.classList.contains('oculto')) $('buscar-en-libro').focus();
});
$('cerrar-busqueda-libro').addEventListener('click', cerrarBusquedaLibro);

$('btn-indice-libro').addEventListener('click', () => {
  const panel = $('panel-indice-libro');
  cerrarBusquedaLibro();
  cerrarPanelMarcadores();
  cerrarPanelAnotaciones();
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
    consultaBusquedaLibro = consulta;
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
          // Marca unos segundos la aparición para localizarla de un vistazo.
          if (epubAbierto()) lectorEpub.destacarBusqueda(elegido.cfi);
          else lector.destacarBusqueda(consultaBusquedaLibro);
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
    localStorage.setItem(CLAVE_AJUSTE_PDF, lector.ajuste);
    aplicarAparienciaAjustePdf();
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
  $('alineacion-epub').value = alineacionEpubGuardada();
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

$('alineacion-epub').addEventListener('change', (evento) => {
  const valor = evento.target.value;
  if (valor === 'libro') localStorage.removeItem(CLAVE_ALINEACION_EPUB);
  else localStorage.setItem(CLAVE_ALINEACION_EPUB, valor);
  lectorEpub.cambiarAlineacion(valor);
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
  localStorage.removeItem(CLAVE_ALINEACION_EPUB);
  aplicarMargenEpub(MARGEN_EPUB_INICIAL);
  pintarAjustesTexto();
  lectorEpub.cambiarFuente('libro');
  lectorEpub.cambiarInterlineado(null);
  lectorEpub.cambiarAlineacion('libro');
  reflowEpub();
});

document.addEventListener('click', (evento) => {
  if (!$('control-texto').contains(evento.target)) cerrarPanelTexto();
});

// ───────────────────────── Lectura en voz alta ─────────────────────────

let ttsAvanzando = false;      // el propio TTS está pasando de página o capítulo
let ttsUltimaPosicion = null;  // posición que el TTS está leyendo

function velocidadTtsGuardada() {
  const valor = parseFloat(localStorage.getItem(CLAVE_VELOCIDAD_TTS));
  return valor >= 0.5 && valor <= 3 ? valor : 1;
}

function idiomaLibroActual() {
  if (epubAbierto()) {
    const lang = lectorEpub.libro?.packaging?.metadata?.language;
    if (lang) return String(lang).toLowerCase().split(/[-_]/)[0];
  }
  return idiomaActual();
}

async function textoPaginasPdf() {
  const numeros = [lector.pagina];
  if (lector.enDoble() && lector.pagina + 1 <= lector.totalPaginas) numeros.push(lector.pagina + 1);
  const partes = [];
  for (const numero of numeros) {
    const pagina = await lector.documento.getPage(numero);
    const contenido = await pagina.getTextContent();
    partes.push(contenido.items.map((item) => item.str).join(' '));
  }
  return partes.join(' ');
}

async function avanzarLecturaVoz() {
  ttsAvanzando = true;
  try {
    if (epubAbierto()) {
      const hay = await lectorEpub.avanzarCapitulo();
      // La bandera la limpia el evento relocated al llegar el CFI definitivo;
      // el temporizador es el respaldo por si ese evento no llega.
      setTimeout(() => { ttsAvanzando = false; }, 3000);
      return hay;
    }
    const paso = lector.enDoble() ? 2 : 1;
    if (lector.pagina + paso > lector.totalPaginas) return false;
    await lector.siguiente();
    return true;
  } finally {
    if (!epubAbierto()) ttsAvanzando = false;
  }
}

const vozLectura = new LectorVoz({
  obtenerTexto: () => (epubAbierto()
    ? Promise.resolve(lectorEpub.textoDesdePosicion())
    : textoPaginasPdf()),
  avanzar: avanzarLecturaVoz,
  alCambiarEstado: () => pintarEstadoVoz(),
  alFallo: (clave) => avisar(t(clave), 6000),
});

function detenerLecturaVoz() {
  if (vozLectura.estado !== 'parado') vozLectura.detener();
}

function pintarEstadoVoz() {
  const estado = vozLectura.estado;
  const activo = estado !== 'parado';
  $('btn-tts').setAttribute('aria-pressed', String(activo));
  const etiqueta = estado === 'leyendo' ? 'ttsPause' : (estado === 'pausado' ? 'ttsResume' : 'ttsPlay');
  $('btn-tts-leer').innerHTML =
    icono(estado === 'leyendo' ? 'pause' : 'play') + `<span>${t(etiqueta)}</span>`;
  $('btn-tts-detener').disabled = !activo;
  $('btn-tts-detener').innerHTML = icono('square') + `<span>${t('ttsStop')}</span>`;
}

function pintarVocesTts() {
  const selector = $('voz-tts');
  const idioma = idiomaLibroActual();
  const voces = [...vozLectura.voces()].sort((a, b) => {
    const aCoincide = a.lang?.toLowerCase().startsWith(idioma) ? 0 : 1;
    const bCoincide = b.lang?.toLowerCase().startsWith(idioma) ? 0 : 1;
    return aCoincide - bCoincide || (a.lang ?? '').localeCompare(b.lang ?? '') ||
      a.name.localeCompare(b.name);
  });
  selector.replaceChildren();
  const automatica = document.createElement('option');
  automatica.value = '';
  automatica.textContent = t('ttsAutoVoice');
  selector.append(automatica);
  for (const voz of voces) {
    const opcion = document.createElement('option');
    opcion.value = voz.voiceURI;
    opcion.textContent = `${voz.name} (${voz.lang})`;
    selector.append(opcion);
  }
  const guardada = leerMapaLocal(CLAVE_VOZ_TTS)[idioma] ?? '';
  selector.value = voces.some((voz) => voz.voiceURI === guardada) ? guardada : '';
}

function aplicarAjustesVoz() {
  const idioma = idiomaLibroActual();
  const uri = leerMapaLocal(CLAVE_VOZ_TTS)[idioma] ?? '';
  vozLectura.voz = vozLectura.voces().find((voz) => voz.voiceURI === uri) ?? null;
  vozLectura.idioma = idioma;
  vozLectura.velocidad = velocidadTtsGuardada();
}

function empezarLecturaVoz() {
  aplicarAjustesVoz();
  ttsUltimaPosicion = posicionActualLibro();
  vozLectura.iniciar().catch(() => vozLectura.detener());
}

function cerrarPanelTts() {
  $('panel-tts').hidden = true;
  $('btn-tts').setAttribute('aria-expanded', 'false');
}

$('btn-tts').addEventListener('click', () => {
  if (!vozLectura.disponible()) {
    avisar(t('ttsNoSupport'), 6000);
    return;
  }
  const abrir = $('panel-tts').hidden;
  cerrarPanelTexto();
  $('panel-tts').hidden = !abrir;
  $('btn-tts').setAttribute('aria-expanded', String(abrir));
  if (abrir) {
    pintarVocesTts();
    pintarEstadoVoz();
    $('velocidad-tts').value = String(velocidadTtsGuardada());
    $('btn-tts-leer').focus();
  }
});

// Algunos navegadores cargan la lista de voces en diferido.
window.speechSynthesis?.addEventListener?.('voiceschanged', () => {
  if (!$('panel-tts').hidden) pintarVocesTts();
});

$('btn-tts-leer').addEventListener('click', () => {
  if (vozLectura.estado === 'leyendo') vozLectura.pausar();
  else if (vozLectura.estado === 'pausado') vozLectura.reanudar();
  else empezarLecturaVoz();
});

$('btn-tts-detener').addEventListener('click', detenerLecturaVoz);

$('voz-tts').addEventListener('change', (evento) => {
  const mapa = leerMapaLocal(CLAVE_VOZ_TTS);
  if (evento.target.value) mapa[idiomaLibroActual()] = evento.target.value;
  else delete mapa[idiomaLibroActual()];
  localStorage.setItem(CLAVE_VOZ_TTS, JSON.stringify(mapa));
  // Si estaba leyendo, se reinicia desde la posición actual para escuchar
  // la voz nueva al momento.
  if (vozLectura.estado !== 'parado') empezarLecturaVoz();
  else aplicarAjustesVoz();
});

$('velocidad-tts').addEventListener('change', (evento) => {
  localStorage.setItem(CLAVE_VELOCIDAD_TTS, evento.target.value);
  if (vozLectura.estado !== 'parado') empezarLecturaVoz();
  else aplicarAjustesVoz();
});

document.addEventListener('click', (evento) => {
  // El botón de leer/pausar se repinta al cambiar de estado y su contenido
  // original queda desconectado antes de que el clic llegue aquí: se usa la
  // ruta del evento, fijada en el momento del despacho, y no el target.
  const ruta = evento.composedPath?.() ?? [];
  if (!ruta.includes($('control-tts')) && !$('control-tts').contains(evento.target)) {
    cerrarPanelTts();
  }
});

document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape') return;
  if (!$('menu-nota-contextual').classList.contains('oculto')) {
    cerrarMenuNota();
    return;
  }
  if (!$('dialogo-editar-nota').classList.contains('oculto')) {
    cerrarEditorNota();
    return;
  }
  if (!$('fondo-menu-lector').classList.contains('oculto')) {
    cerrarMenuLector();
    $('btn-menu-lector').focus();
    return;
  }
  if (!$('menu-libro').classList.contains('oculto')) {
    cerrarMenuAcciones();
    return;
  }
  if (!$('dialogo-mover').classList.contains('oculto')) {
    cerrarDialogoMover();
    return;
  }
  if (!$('panel-indice-libro').classList.contains('oculto')) {
    cerrarIndiceLibro();
    $('btn-indice-libro').focus();
  } else if (!$('panel-marcadores').classList.contains('oculto')) {
    cerrarPanelMarcadores();
    $('btn-marcadores').focus();
  } else if (!$('panel-anotaciones').classList.contains('oculto')) {
    cerrarPanelAnotaciones();
    $('btn-anotaciones').focus();
  } else if (!$('panel-busqueda-libro').classList.contains('oculto')) {
    cerrarBusquedaLibro();
    $('btn-buscar-libro').focus();
  } else if (!$('panel-texto').hidden) {
    cerrarPanelTexto();
    $('btn-texto').focus();
  } else if (!$('panel-tts').hidden) {
    cerrarPanelTts();
    $('btn-tts').focus();
  } else if (!$('vista-lector').classList.contains('oculto') &&
      $('vista-lector').classList.contains('inmersivo')) {
    alternarBarraLector();
  }
});

function aplicarAparienciaAjustePdf() {
  const esPdf = !epubAbierto();
  for (const id of ['btn-ancho-auto', 'menu-ancho-auto']) {
    $(id).setAttribute('aria-pressed', String(esPdf && lector.ajuste === 'ancho'));
  }
  for (const id of ['btn-pagina-completa', 'menu-pagina-completa']) {
    $(id).setAttribute('aria-pressed', String(esPdf && lector.ajuste === 'pagina'));
  }
}

// Ajustes automáticos del PDF. En EPUB el control de ancho conserva su
// función histórica de restablecer el tamaño de letra al 100 %.
$('btn-ancho-auto').addEventListener('click', async () => {
  if (epubAbierto()) {
    lectorEpub.cambiarTamano(100 - lectorEpub.tamano);
    localStorage.setItem(CLAVE_LETRA_EPUB, String(lectorEpub.tamano));
  } else {
    await lector.ajustar('ancho');
    localStorage.setItem(CLAVE_ZOOM_PDF, String(lector.zoom));
    localStorage.setItem(CLAVE_AJUSTE_PDF, lector.ajuste);
    aplicarAparienciaAjustePdf();
  }
});

$('btn-pagina-completa').addEventListener('click', async () => {
  if (epubAbierto()) return;
  await lector.ajustar('pagina');
  localStorage.setItem(CLAVE_ZOOM_PDF, String(lector.zoom));
  localStorage.setItem(CLAVE_AJUSTE_PDF, lector.ajuste);
  aplicarAparienciaAjustePdf();
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

$('btn-indicador').addEventListener('click', pedirPosicionLibro);

function pintarIconoNoche() {
  const activo = document.body.classList.contains('modo-noche');
  $('btn-noche').innerHTML = icono(activo ? 'sun' : 'moon');
  $('btn-noche').title = activo ? t('dayMode') : t('nightMode');
  if (!$('fondo-menu-lector').classList.contains('oculto')) actualizarMenuLector();
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

// ───────────────────────── Modo inmersivo ─────────────────────────
// Un toque en el centro de la página oculta la barra superior para leer a
// pantalla completa; otro toque la recupera.

let temporizadorToqueCentro = null;

function haySeleccionActiva() {
  const principal = window.getSelection();
  if (principal && !principal.isCollapsed) return true;
  for (const contents of lectorEpub.vista?.getContents?.() ?? []) {
    const seleccion = contents.window?.getSelection?.();
    if (seleccion && !seleccion.isCollapsed) return true;
  }
  return false;
}

function alternarBarraLector() {
  const inmersivo = $('vista-lector').classList.toggle('inmersivo');
  if (epubAbierto()) reflowEpub();
  else window.dispatchEvent(new Event('resize'));
  if (inmersivo && localStorage.getItem(CLAVE_AVISO_INMERSIVO) !== '1') {
    localStorage.setItem(CLAVE_AVISO_INMERSIVO, '1');
    avisar(t('immersiveHint'), 4000);
  }
}

function salirModoInmersivo() {
  $('vista-lector').classList.remove('inmersivo');
}

function toqueCentroLector(objetivo) {
  if (seleccionPendiente || haySeleccionActiva()) return;
  if (Date.now() - ultimoPellizco < 600) return;
  if (objetivo?.closest?.('a, button, input, select, textarea, .panel-flotante-lector, ' +
      '.barra-seleccion, .menu-nota-contextual, .barra-lector')) return;
  // Se espera un instante por si el toque forma parte de un doble clic de
  // selección de palabra: en ese caso no debe alternar la barra.
  clearTimeout(temporizadorToqueCentro);
  temporizadorToqueCentro = setTimeout(() => {
    if (seleccionPendiente || haySeleccionActiva()) return;
    alternarBarraLector();
  }, 280);
}

$('area-lectura').addEventListener('click', (evento) => {
  if (evento.detail > 1) {
    clearTimeout(temporizadorToqueCentro);
    return;
  }
  toqueCentroLector(evento.target);
});
$('area-lectura').addEventListener('dblclick', () => clearTimeout(temporizadorToqueCentro));

// ─────────────── Pellizco para el zoom del PDF (táctil) ───────────────
// Mientras dura el gesto se aplica una escala visual barata; al soltar se
// re-renderiza el PDF con el zoom definitivo y se recoloca el scroll para
// que el punto pellizcado siga bajo los dedos.

let pellizco = null;
let ultimoPellizco = 0;

function distanciaToques(toques) {
  return Math.hypot(
    toques[0].clientX - toques[1].clientX,
    toques[0].clientY - toques[1].clientY,
  );
}

$('area-lectura').addEventListener('touchstart', (evento) => {
  if (evento.touches.length !== 2 || epubAbierto() || !lector.documento) return;
  const area = $('area-lectura');
  const rect = area.getBoundingClientRect();
  pellizco = {
    inicial: distanciaToques(evento.touches),
    zoom: lector.zoom,
    factor: 1,
    centroX: (evento.touches[0].clientX + evento.touches[1].clientX) / 2 - rect.left,
    centroY: (evento.touches[0].clientY + evento.touches[1].clientY) / 2 - rect.top,
    scrollLeft: area.scrollLeft,
    scrollTop: area.scrollTop,
  };
  ultimoPellizco = Date.now();
}, { passive: true });

$('area-lectura').addEventListener('touchmove', (evento) => {
  if (!pellizco || evento.touches.length !== 2) return;
  evento.preventDefault(); // el gesto es nuestro: sin zoom nativo ni scroll
  const bruto = distanciaToques(evento.touches) / pellizco.inicial;
  pellizco.factor = Math.min(4 / pellizco.zoom, Math.max(0.1 / pellizco.zoom, bruto));
  const contenedor = $('contenedor-pagina');
  contenedor.style.transformOrigin =
    `${pellizco.scrollLeft + pellizco.centroX}px ${pellizco.scrollTop + pellizco.centroY}px`;
  contenedor.style.transform = `scale(${pellizco.factor})`;
}, { passive: false });

async function terminarPellizco() {
  if (!pellizco) return;
  const { factor, centroX, centroY, scrollLeft, scrollTop } = pellizco;
  pellizco = null;
  ultimoPellizco = Date.now();
  const contenedor = $('contenedor-pagina');
  contenedor.style.transform = '';
  contenedor.style.transformOrigin = '';
  if (Math.abs(factor - 1) < 0.03) return;
  await lector.cambiarZoom(factor);
  localStorage.setItem(CLAVE_ZOOM_PDF, String(lector.zoom));
  localStorage.setItem(CLAVE_AJUSTE_PDF, lector.ajuste);
  aplicarAparienciaAjustePdf();
  const area = $('area-lectura');
  area.scrollLeft = (scrollLeft + centroX) * factor - centroX;
  area.scrollTop = (scrollTop + centroY) * factor - centroY;
}

$('area-lectura').addEventListener('touchend', (evento) => {
  if (pellizco && evento.touches.length < 2) terminarPellizco().catch(() => null);
}, { passive: true });
$('area-lectura').addEventListener('touchcancel', () => {
  terminarPellizco().catch(() => null);
}, { passive: true });

// Deslizar el dedo para pasar página.
let toqueX = null, toqueY = null;
$('area-lectura').addEventListener('touchstart', (evento) => {
  toqueX = evento.touches[0].clientX;
  toqueY = evento.touches[0].clientY;
}, { passive: true });
$('area-lectura').addEventListener('touchend', (evento) => {
  if (toqueX === null) return;
  // Un pellizco (dos dedos) no debe rematar en un paso de página.
  if (pellizco || Date.now() - ultimoPellizco < 600) { toqueX = toqueY = null; return; }
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
  aplicarAparienciaDoble();
  pintarTiempoRestante();
  pintarEstadoVoz();
  pintarIconoNoche();
  if (!libroActual) cargarBiblioteca();
  else if (!$('panel-marcadores').classList.contains('oculto')) pintarMarcadores();
  else if (!$('panel-anotaciones').classList.contains('oculto')) pintarAnotaciones();
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

window.addEventListener('online', () => {
  sincronizarAlRecuperarConexion()
    .then(() => actualizarEstadoSincronizacion())
    .catch((error) => actualizarEstadoSincronizacion(error));
});

importarConfigDeUrl();
crearCliente();
history.replaceState({ [ESTADO_VISTA]: 'biblioteca' }, '');
mostrarVista('biblioteca');
precargarLibrosEjemplo().finally(() => cargarBiblioteca());
