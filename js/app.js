import { ClienteWebDav, explicarError } from './webdav.js';
import { Lector } from './lector.js';
import { LectorEpub, cargarZip } from './lector-epub.js';
import * as progreso from './progreso.js';
import * as almacen from './almacen.js';
import * as anotaciones from './anotaciones.js';
import * as registro from './registro.js';
import { asegurarMiniatura } from './portadas.js';
import { icono, pintarIconos } from './iconos.js';
import { t, iniciarIdioma, aplicarIdioma, idiomaActual, etiquetarPorTitulo } from './i18n.js';
import { LectorVoz } from './tts.js';
import {
  iniciarTema, temaElegido, temaEfectivo, esTemaOscuro, guardarTema, TEMAS,
  LADOS_AUTO, varianteAuto, guardarVarianteAuto,
} from './tema.js';
import { contieneTextoUtil } from './deteccion-texto-pdf.js';
import { abrePorRaton } from './menu-contextual.js';
import { resumenDeMetadatos } from './resumen-libro.js';
import * as calificacion from './calificacion.js';
import { libroQueSeAbreAlArrancar } from './apertura-inicial.js';
import {
  normalizarColumnas, columnasAutomaticas, valoresDisponibles, aspectoDeLaOpcion,
  normalizarLetrasPorLinea, LETRAS_INICIALES,
} from './columnas.js';
import {
  segundosDeLaMuestra, acumularRitmo, minutosRestantes, reubicacionEsLectura,
  SEMIVIDA_PAGINAS, SEMIVIDA_PORCENTAJE, SEGUNDOS_TOPE,
  UNIDADES_MINIMAS_PAGINAS, UNIDADES_MINIMAS_PORCENTAJE,
} from './ritmo.js';
import {
  esLibro, librosElegidos, librosArrastrados, capturarArrastre,
} from './archivos-entrantes.js';
import * as estadisticas from './estadisticas.js';
import * as duplicados from './duplicados.js';
import { VERSION } from './version.js';
import * as gestos from './gestos.js';
import { puntoEnElMarco, clicConPunto } from './zonas-toque.js';
import { imagenAmpliable, descripcionImagen } from './imagen-ampliada.js';
import * as panelNav from './panel-navegacion.js';
import { anadirMarcador, renombrarMarcador } from './marcadores.js';
import * as vistaAnotaciones from './vista-anotaciones.js';
import * as impresion from './impresion.js';
import * as vistaEstadisticas from './vista-estadisticas.js';
import * as periodos from './periodos.js';
import {
  librosDeCarpetaLocal, librosDeCarpetaRemota, nombreSeguro, puedeGuardarEnDisco,
} from './descarga-carpeta.js';
import {
  crearManifiestoCopia, validarManifiestoCopia, fusionarProgresoRestaurado,
  carpetasRemotasDeLibros, crearCopiaConfigNube, validarCopiaConfigNube,
  validarConfigNube,
} from './copia-local.js';
import { decidirEspacio } from './desplazamiento-lectura.js';
import {
  claveDePosicion, distanciaPosiciones,
  decidirPosicionRemota, avisoDePosicion,
} from './posicion-remota.js';

const CLAVE_CONFIG = 'lector.config';
// Heredadas de cuando el papel del libro se elegía aparte del tema, y con un
// papel propio por libro encima. Solo se leen una vez, para migrar al tema.
const CLAVE_NOCHE_VIEJA = 'lector.noche';
const CLAVE_TEMA_PAGINA_VIEJA = 'lector.temaPagina';
const CLAVE_TEMA_PAGINA_LIBRO_VIEJA = 'lector.temaPaginaLibro';
const CLAVE_IMAGENES_NATURALES = 'lector.imagenesNaturales'; // solo de este dispositivo
const CLAVE_ROTACION_PDF = 'lector.rotacionPdf'; // por libro, solo de este dispositivo
const CLAVE_RITMO = 'lector.ritmoLectura';  // por libro, solo de este dispositivo
const CLAVE_VOZ_TTS = 'lector.vozTts';      // por idioma, solo de este dispositivo
const CLAVE_VELOCIDAD_TTS = 'lector.velocidadTts'; // solo de este dispositivo
const CLAVE_COLOR_RESALTADO = 'lector.colorResaltado'; // solo de este dispositivo
const CLAVE_PDF_SIN_TEXTO = 'lector.pdfSinTexto'; // por libro y dispositivo
const CLAVE_ULTIMA_CONCILIACION = 'lector.ultimaConciliacion'; // solo de este dispositivo

const COLORES_RESALTADO = ['amarillo', 'verde', 'azul', 'rosa'];

function colorResaltadoGuardado() {
  return vistaAnotaciones.colorValido(
    localStorage.getItem(CLAVE_COLOR_RESALTADO), COLORES_RESALTADO);
}

// Color efectivo de una anotación: las anteriores a la paleta no llevan el
// campo y conservan su aspecto histórico (amarillo, o azul si tienen nota).
function colorDeAnotacion(anotacion) {
  if (COLORES_RESALTADO.includes(anotacion?.color)) return anotacion.color;
  return anotacion?.nota ? 'azul' : 'amarillo';
}
// Ajustes que son de cada libro, no de la aplicación: el aumento que pide un
// facsímil escaneado no es el de una novela, y subir la letra de una no tiene
// por qué agrandar las demás. Son mapas id de libro → valor; el libro que
// nunca se ha tocado se abre con lo que venga de fábrica. Como los demás
// ajustes de aspecto, son de este dispositivo: dependen de su pantalla.
const CLAVE_ZOOM_LIBRO = 'lector.zoomLibro';   // { zoom, ajuste } de cada PDF
const CLAVE_LETRA_LIBRO = 'lector.letraLibro'; // cuerpo de letra de cada EPUB
const CLAVE_MARGEN_LIBRO = 'lector.margenLibro';
const CLAVE_ALINEACION_LIBRO = 'lector.alineacionLibro';
const CLAVE_MODO_LIBRO = 'lector.modoLibro';   // por páginas o continuo, de cada libro
const CLAVE_DOBLE_LIBRO = 'lector.dobleLibro'; // una o dos columnas: sustituida por la de abajo
const CLAVE_COLUMNAS_LIBRO = 'lector.columnasLibro'; // columnas de cada libro
const CLAVES_AJUSTES_POR_LIBRO = [
  CLAVE_ZOOM_LIBRO, CLAVE_LETRA_LIBRO, CLAVE_MARGEN_LIBRO, CLAVE_ALINEACION_LIBRO,
  CLAVE_MODO_LIBRO, CLAVE_DOBLE_LIBRO, CLAVE_COLUMNAS_LIBRO,
];
const CLAVE_RECORTE_PDF = 'lector.recortePdf'; // solo de este dispositivo
const CLAVE_INDICE_ABIERTO = 'lector.indiceAbierto'; // solo de este dispositivo
const CLAVE_ANCHO_INDICE = 'lector.anchoIndice'; // solo de este dispositivo
const CLAVE_MARGEN_EPUB = 'lector.margenEpub'; // solo de este dispositivo
const CLAVE_FUENTE_EPUB = 'lector.fuenteEpub'; // solo de este dispositivo
const CLAVE_INTERLINEADO_EPUB = 'lector.interlineadoEpub'; // solo de este dispositivo
const CLAVE_ALINEACION_EPUB = 'lector.alineacionEpub'; // solo de este dispositivo
const CLAVE_GUIONADO_EPUB = 'lector.guionadoEpub';     // solo de este dispositivo
// Las columnas dependen de la pantalla, así que ni el valor de partida ni el
// de cada libro salen de este aparato (ver CLAVES_PREFERENCIAS_COPIA).
const CLAVE_COLUMNAS_EPUB = 'lector.columnasEpub';     // solo de este dispositivo
const CLAVE_LETRAS_LINEA = 'lector.letrasPorLinea';    // solo de este dispositivo
const CLAVE_ORDEN_BIBLIOTECA = 'lector.ordenBiblioteca';
const CLAVE_FILTRO_BIBLIOTECA = 'lector.filtroBiblioteca';
const CLAVE_VISTA_BIBLIOTECA = 'lector.vistaBiblioteca'; // solo de este dispositivo
const CLAVE_PLEGADA_NUBE = 'lector.plegadaNube';   // solo de este dispositivo
const CLAVE_PLEGADA_LOCAL = 'lector.plegadaLocal'; // solo de este dispositivo
const CLAVE_AVISO_CONFIG_CERRADO = 'lector.avisoConfigCerrado'; // solo de este dispositivo
const CLAVE_EJEMPLOS_PRECARGADOS = 'lector.ejemplosPrecargados'; // solo de este dispositivo
// El aviso de los ejemplos precargados: '1' mientras siga teniendo sentido
// enseñarlo, y se borra en cuanto el usuario dice que no quiere verlo más o
// se queda sin ejemplos en la biblioteca.
const CLAVE_AVISO_EJEMPLOS = 'lector.avisoEjemplos'; // solo de este dispositivo
const CLAVE_CONTINUAR_OCULTOS = 'lector.continuarOcultos';
// Ausente o distinta de '1' significa visible: el bloque se enseña salvo que
// se pida lo contrario, así que no hay nada que guardar en el caso normal.
const CLAVE_CONTINUAR_OCULTO = 'lector.continuarOculto';
const CLAVE_CONTINUAR_PLEGADO = 'lector.continuarPlegado'; // solo de este dispositivo
// Igual que la de «Continuar leyendo»: ausente o distinta de '1' es visible.
const CLAVE_BARRA_ESTADO_OCULTA = 'lector.barraEstadoOculta';
// Cuántas lecturas se enseñan. Ausente significa «las que quepan», que depende
// del ancho, así que es cosa de cada dispositivo y no viaja con la copia.
const CLAVE_CONTINUAR_MAXIMO = 'lector.continuarMaximo';
// Ir directamente al libro al abrir la aplicación. Apagado salvo que diga '1',
// y de cada dispositivo a propósito: el móvil se abre para leer un rato y el
// ordenador, muchas veces, para ordenar la biblioteca.
const CLAVE_ABRIR_ULTIMO = 'lector.abrirUltimoAlArrancar'; // solo de este dispositivo

// Preferencias inocuas que viajan con la copia. Se excluyen expresamente la
// configuración y la contraseña WebDAV, así como las colas de sincronización.
//
// Y también todo lo que dependa del tamaño de la pantalla: el aumento del
// PDF, el cuerpo de letra, el margen, las columnas, el modo de lectura y el
// ancho del panel del índice. Restaurar en el móvil las dos columnas y el
// margen del ordenador no deja el libro como estaba, lo deja ilegible; cada
// aparato tiene que decidir eso por su cuenta. Lo que sí viaja del aspecto es
// lo que se elige por gusto y vale en cualquier pantalla: la letra, el
// interlineado, la justificación o el partido de palabras.
const CLAVES_PREFERENCIAS_COPIA = [
  // El tema queda fuera a propósito: es de cada navegador, porque depende de
  // su pantalla y de la luz que haya delante, no del libro.
  'lector.idioma', CLAVE_IMAGENES_NATURALES, CLAVE_ROTACION_PDF,
  CLAVE_RITMO, CLAVE_VOZ_TTS, CLAVE_VELOCIDAD_TTS, CLAVE_COLOR_RESALTADO,
  // La alineación de cada libro sí: que una edición se lea mejor sin
  // justificar es de la edición, no de la pantalla en la que se abra.
  CLAVE_ALINEACION_LIBRO,
  CLAVE_RECORTE_PDF, CLAVE_FUENTE_EPUB,
  CLAVE_INTERLINEADO_EPUB, CLAVE_ALINEACION_EPUB, CLAVE_GUIONADO_EPUB, CLAVE_ORDEN_BIBLIOTECA,
  CLAVE_FILTRO_BIBLIOTECA, CLAVE_VISTA_BIBLIOTECA,
  // Las dos secciones, no solo una: que la copia restaurara el pliegue del
  // dispositivo y se dejara el de la nube no lo entendía nadie.
  CLAVE_PLEGADA_LOCAL, CLAVE_PLEGADA_NUBE,
  CLAVE_CONTINUAR_OCULTO, CLAVE_BARRA_ESTADO_OCULTA,
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
  const propio = ajusteDelLibro(CLAVE_MARGEN_LIBRO);
  if (Number.isFinite(propio) && propio >= 0 && propio <= MARGEN_EPUB_MAXIMO) return propio;
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
  const etiqueta = t('epubMargin', { value: valor });
  for (const mando of mandosDe('margen-epub')) {
    mando.value = String(valor);
    mando.setAttribute('aria-valuetext', etiqueta);
  }
  for (const id of ['valor-margen', 'valor-margen-ajustes']) {
    const salida = $(id);
    if (salida) salida.textContent = etiqueta;
  }
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
  const valida = (valor) => ['libro', 'izquierda', 'justificada'].includes(valor);
  const propia = ajusteDelLibro(CLAVE_ALINEACION_LIBRO);
  if (valida(propia)) return propia;
  const general = localStorage.getItem(CLAVE_ALINEACION_EPUB);
  return valida(general) ? general : 'libro';
}

// Partir palabras viene puesto: en pantalla estrecha, y más con el texto
// justificado, es lo que evita los ríos de espacios. Quien prefiera lo que diga
// cada libro, o no partir nunca, lo cambia y se recuerda.
function guionadoEpubGuardado() {
  const valor = localStorage.getItem(CLAVE_GUIONADO_EPUB);
  return valor === 'libro' || valor === 'nunca' ? valor : 'auto';
}

// El aumento es de cada PDF: un libro sin ajuste propio se abre al 100 % y
// ajustado al ancho, que es lo que trae la aplicación de fábrica.
function zoomPdfGuardado() {
  const valor = ajusteDelLibro(CLAVE_ZOOM_LIBRO)?.zoom;
  return valor >= 0.1 && valor <= 4 ? valor : 1;
}

function ajustePdfGuardado() {
  const valor = ajusteDelLibro(CLAVE_ZOOM_LIBRO)?.ajuste;
  return ['ancho', 'pagina', 'personalizado'].includes(valor) ? valor : 'ancho';
}

// Se guardan juntos porque juntos describen el aumento: el zoom a secas, sin
// saber si es sobre el ancho o sobre la página, no dice nada.
function guardarZoomPdf() {
  guardarAjusteDelLibro(CLAVE_ZOOM_LIBRO, { zoom: lector.zoom, ajuste: lector.ajuste });
}

function letraEpubGuardada() {
  const valor = ajusteDelLibro(CLAVE_LETRA_LIBRO);
  return valor >= 60 && valor <= 300 ? valor : 100;
}

function guardarLetraEpub() {
  guardarAjusteDelLibro(CLAVE_LETRA_LIBRO, lectorEpub.tamano);
}

function recorteGuardado() {
  return localStorage.getItem(CLAVE_RECORTE_PDF) === '1';
}

// Las columnas son de cada libro, como el modo (ver modoActual()): una novela
// en columna ancha y un libro de texto en dos no es capricho, es que se leen
// distinto. Sin elección propia manda lo que diga Ajustes, que de fábrica es
// automático.
//
// El ajuste anterior solo distinguía una columna de dos y se guardaba aparte;
// mientras quede alguno por ahí se traduce al llegar, que es más barato que
// recorrer todos los libros al arrancar.
function columnasGuardadas() {
  const propias = ajusteDelLibro(CLAVE_COLUMNAS_LIBRO);
  if (propias !== undefined) return normalizarColumnas(propias);
  const antigua = ajusteDelLibro(CLAVE_DOBLE_LIBRO);
  if (antigua !== undefined) return antigua ? 2 : 1;
  return normalizarColumnas(localStorage.getItem(CLAVE_COLUMNAS_EPUB));
}

// Cuánto se deja crecer una línea antes de abrir otra columna. Es lo que hace
// entendible el automático: en vez de hablar de anchos de columna, se dice el
// largo de línea que se quiere leer. Vale para todos los libros de este
// dispositivo, porque es la pantalla la que manda en esto.
function letrasPorLineaGuardadas() {
  const guardado = localStorage.getItem(CLAVE_LETRAS_LINEA);
  return guardado === null ? LETRAS_INICIALES : normalizarLetrasPorLinea(guardado);
}

// El PDF llega maquetado y solo sabe poner sus páginas de una en una o de dos
// en dos: cualquier otra cosa (automático incluido) se resuelve en dos cuando
// la pantalla da de sí, que es lo que hacía el botón de antes.
function dobleGuardado() {
  const columnas = columnasGuardadas();
  if (columnas === 'auto') return columnasAutomaticas(window.innerWidth, 16) > 1;
  return columnas > 1;
}

function leerMapaLocal(clave) {
  try {
    const mapa = JSON.parse(localStorage.getItem(clave));
    return mapa && typeof mapa === 'object' ? mapa : {};
  } catch {
    return {};
  }
}

// Ajustes de cada libro: solo existen mientras hay uno abierto. Sin libro
// (Ajustes → Lector) no hay a quién aplicárselos, y quien pregunte recibe
// «nada guardado», que es lo que hace caer en el valor de partida.
function ajusteDelLibro(clave, id = libroActual?.id) {
  return id ? leerMapaLocal(clave)[id] : undefined;
}

function guardarAjusteDelLibro(clave, valor, id = libroActual?.id) {
  if (!id) return;
  const mapa = leerMapaLocal(clave);
  if (valor === undefined || valor === null) delete mapa[id];
  else mapa[id] = valor;
  localStorage.setItem(clave, JSON.stringify(mapa));
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
let rutaLocal = '';        // subcarpeta abierta en la sección del dispositivo ('' = raíz)
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

function cerrarAvisoPdfSinTexto() {
  $('dialogo-pdf-sin-texto').classList.add('oculto');
}

// Identifica un libro incluyendo de dónde viene: el mismo nombre puede existir
// en el dispositivo y en varias nubes.
function claveLibro(libro) {
  const ambito = libro.tipo === 'webdav' ? cliente?.base ?? 'webdav' : 'local';
  return `${ambito}|${libro.id}`;
}

function pdfSinTextoConocido(libro) {
  const estado = leerMapaLocal(CLAVE_PDF_SIN_TEXTO)[claveLibro(libro)];
  if (estado === true) return true; // compatibilidad con el primer formato interno
  if (!estado?.sinTexto) return false;
  return !libro.tamano || !estado.tamano || Number(libro.tamano) === Number(estado.tamano);
}

async function comprobarTextoPdf(libro, documento) {
  const avisos = leerMapaLocal(CLAVE_PDF_SIN_TEXTO);
  const clave = claveLibro(libro);
  const anterior = avisos[clave];
  if (anterior?.sinTexto && anterior.tamano && Number(anterior.tamano) === Number(libro.tamano)) return;

  const tieneTexto = await contieneTextoUtil(documento);
  // La comprobación continúa en segundo plano: no debe avisar si entretanto
  // se cerró el lector o se abrió otro libro.
  if (libroActual?.id !== libro.id || lector.documento !== documento) return;
  if (tieneTexto) {
    if (anterior) {
      delete avisos[clave];
      localStorage.setItem(CLAVE_PDF_SIN_TEXTO, JSON.stringify(avisos));
    }
    return;
  }
  avisos[clave] = { sinTexto: true, tamano: libro.tamano ?? null };
  localStorage.setItem(CLAVE_PDF_SIN_TEXTO, JSON.stringify(avisos));
  $('dialogo-pdf-sin-texto').classList.remove('oculto');
  requestAnimationFrame(() => $('btn-cerrar-pdf-sin-texto').focus());
}

$('btn-cerrar-pdf-sin-texto').addEventListener('click', cerrarAvisoPdfSinTexto);
$('enlace-scribe-ocr').addEventListener('click', cerrarAvisoPdfSinTexto);
$('dialogo-pdf-sin-texto').addEventListener('click', (evento) => {
  if (evento.target === $('dialogo-pdf-sin-texto')) cerrarAvisoPdfSinTexto();
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
  // Recuento de pantallas rehecho tras cambiar la letra o el ancho: no es un
  // cambio de posición, solo hay que repintar la barra del pie.
  alCambiarPantallas: () => pintarBarraEstado(),
  alTeclear: manejarTecla,
  // Los enlaces internos del EPUB los salta epub.js por su cuenta: aquí solo
  // se apunta la posición de partida para poder volver con el historial.
  alPulsarEnlaceInterno: apuntarEnHistorial,
  // Los clics sobre el texto del libro ocurren dentro del iframe del
  // capítulo y no llegan al documento: cierran aquí los paneles flotantes.
  alPulsarContenido: (evento) => {
    cerrarPanelTexto();
    cerrarPanelColumnas();
    cerrarPanelTts();
    cerrarMenuLector();
    cerrarMenuNota();
    // Fuera de las bandas no hay nada que estorbar, así que aquí se amplía
    // cualquier ilustración, incluidas las que ocupan la página entera.
    const imagen = imagenBajoElElemento(evento?.target, false);
    if (imagen) abrirVisorImagen(imagen);
  },
  alSeleccionarTexto: manejarSeleccionTexto,
  alCambiarSeleccion: () => revisarSeleccion(),
  alPulsarAnotacion: (id) => abrirPanelAnotaciones(id),
  alGestionarAnotacion: abrirMenuNota,
  alMostrarNota: mostrarNotaEmergente,
  alOcultarNota: ocultarNotaEmergente,
  // La frase que suena se parte entre esta página y la siguiente.
  alPartirFrase: (fraccion) => programarPasoDePaginaPorVoz(fraccion),
  etiquetaOpcionesNota: () => t('noteActions'),
  // El texto del libro va en un iframe que se queda los toques: los reenvía
  // para que funcionen igual el arrastre de página y el pellizco.
  alTocar: (toque) => tocarDesdeElLibro(toque),
  // Y también el botón derecho, que abre el menú de lectura.
  alMenuContextual: (punto) => menuLectorContextual(punto),
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

// Al cambiar de vista la anterior se oculta con display:none, así que el foco
// que hubiera dentro se pierde y el navegador lo devuelve a <body>: quien usa
// teclado o lector de pantalla acaba al principio del documento sin enterarse.
// Se lleva a la cabecera de la vista nueva, que además la anuncia. Si nadie
// tenía el foco dentro de una vista (la carga inicial) no se toca nada.
function mostrarVista(nombre) {
  const anterior = document.activeElement;
  const destino = $(`vista-${nombre}`);
  for (const vista of document.querySelectorAll('.vista')) {
    vista.classList.toggle('oculto', vista !== destino);
  }
  if (!destino || !anterior?.closest?.('.vista')) return;
  destino.querySelector('[data-foco-vista]')?.focus();
}

// Salta la cabecera y lleva el foco al contenido de la vista que esté abierta.
$('salto-contenido').addEventListener('click', () => {
  const vista = [...document.querySelectorAll('.vista')]
    .find((seccion) => !seccion.classList.contains('oculto'));
  vista?.querySelector('[data-contenido-vista]')?.focus();
});

const ESTADO_VISTA = 'pagekeeperVista';
const ESTADO_CARPETAS = 'pagekeeperCarpetas';

function registrarVista(nombre) {
  if (history.state?.[ESTADO_VISTA] === nombre) return;
  history.pushState({ [ESTADO_VISTA]: nombre }, '');
}

// Abrir una carpeta (o volver a la raíz por la ruta) es un paso más del
// historial: así el botón de retroceder del navegador sube un nivel en lugar
// de sacar de la aplicación. Se registra después de cambiar la ruta, para que
// la entrada anterior siga apuntando a la carpeta de la que se viene.
function estadoBiblioteca() {
  return {
    [ESTADO_VISTA]: 'biblioteca',
    [ESTADO_CARPETAS]: { local: rutaLocal, nube: rutaNube },
  };
}

function registrarCarpetas() {
  history.pushState(estadoBiblioteca(), '');
}

// Pone al día la entrada actual del historial cuando la carpeta abierta cambia
// sin que el usuario navegue (porque ha dejado de existir). Si en ese momento
// se está en otra vista, su entrada no se toca.
function actualizarCarpetasEnHistorial() {
  if (history.state?.[ESTADO_VISTA] !== 'biblioteca') return;
  history.replaceState(estadoBiblioteca(), '');
}

// Cierra una vista superpuesta (ajustes, importar y exportar) desde el propio
// código, sin que el usuario haya pulsado atrás: la entrada que ocupaba pasa a
// ser la de la biblioteca, así que retroceder después lleva a la carpeta en la
// que se estaba y no a una vista ya cerrada.
function volverALaBiblioteca() {
  if (history.state?.[ESTADO_VISTA] !== 'biblioteca') history.replaceState(estadoBiblioteca(), '');
  mostrarVista('biblioteca');
  cargarBiblioteca();
}

// Devuelve la biblioteca a las carpetas de una entrada del historial. Las
// entradas antiguas no las llevan: entonces toca la raíz.
function volverACarpetas(estado) {
  rutaLocal = estado?.local ?? '';
  rutaNube = estado?.nube ?? '';
}

function registrarVistaLector() {
  registrarVista('lector');
}

function cerrarVistaLector() {
  detenerLecturaVoz();
  cerrarPanelTts();
  salirModoInmersivo();
  cerrarMenuLector();
  cerrarMenuNota();
  cerrarEditorNota();
  cerrarAvisoPdfSinTexto();
  cerrarVisorImagen();
  ocultarNotaEmergente();
  cerrarPanelAnotaciones();
  cancelarSeleccion();
  cerrarBusquedaLibro();
  cerrarIndiceLibro();
  cerrarPanelMarcadores();
  cerrarAvisoPosicionRemota();
  // Antes de soltar el libro: la última página leída también cuenta, y con
  // «libroActual» ya vacío no habría a quién apuntársela.
  cerrarMuestraDeRitmo();
  subirPosicionAhora();
  lectorEpub.cerrar();
  libroActual = null;
  pintarBarraEstado();
  mostrarVista('biblioteca');
  cargarBiblioteca();
}

// Cada libro ocupa una entrada del historial del navegador. Al retroceder se
// vuelve a la biblioteca; una entrada antigua del lector no intenta reabrir
// datos que ya no están en memoria al avanzar de nuevo.
window.addEventListener('popstate', () => {
  const destino = history.state?.[ESTADO_VISTA] ?? 'biblioteca';
  if (libroActual || !$('vista-lector').classList.contains('oculto')) {
    cerrarVistaLector();
    return;
  }
  if (destino === 'lector') {
    history.replaceState(estadoBiblioteca(), '');
    mostrarVista('biblioteca');
    cargarBiblioteca();
  } else if (destino === 'ayuda') {
    abrirAyuda(false);
  } else if (destino === 'ajustes') {
    abrirAjustes(false);
  } else if (destino === 'archivos') {
    abrirArchivos(false);
  } else if (destino === 'estadisticas') {
    abrirEstadisticas(false);
  } else {
    // Retroceder desde dentro de una carpeta lleva a la anterior, no fuera.
    volverACarpetas(history.state?.[ESTADO_CARPETAS]);
    mostrarVista('biblioteca');
    pintarContinuarLeyendo();
    cargarBiblioteca();
  }
});

let temporizadorToast;
function avisar(mensaje, ms = 3500) {
  const toast = $('toast');
  // Primero visible y luego el texto: un cambio dentro de un elemento con
  // display:none no llega a anunciarse aunque sea una región «live».
  toast.classList.remove('oculto');
  toast.textContent = mensaje;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.add('oculto'), ms);
}

// El texto visible del indicador se refresca con cada porcentaje de descarga,
// así que la región que anuncia el lector de pantalla es otra (#anuncio-cargando)
// y solo recibe el texto estable: si no, cantaría el avance número a número.
function mostrarCarga(texto) {
  $('texto-cargando').textContent = texto;
  $('cargando').classList.remove('oculto');
  $('anuncio-cargando').textContent = texto;
}
function ocultarCarga() {
  $('cargando').classList.add('oculto');
  $('anuncio-cargando').textContent = '';
}

// ──────────────────── Diálogos y menús superpuestos ────────────────────
//
// Cada capa se abre y se cierra desde una docena de sitios distintos, siempre
// quitando o poniendo la clase «oculto». En lugar de tocarlos todos se vigila
// esa clase: mientras haya una capa abierta, el resto de la página queda
// inerte (fuera del tabulador y del árbol de accesibilidad, que es lo que
// aria-modal ya prometía) y al cerrarse el foco vuelve a donde estaba.

const CAPAS_MODALES = ['dialogo-mover', 'dialogo-editar-nota', 'dialogo-contrasena-pdf',
  'dialogo-pdf-sin-texto', 'menu-libro', 'fondo-menu-lector', 'menu-nota-contextual',
  'visor-imagen'];

// Los avisos y el indicador de carga viven fuera de las vistas y tienen que
// seguir anunciándose aunque haya un diálogo delante.
const NUNCA_INERTES = new Set(['toast', 'cargando', 'anuncio-cargando']);

const FOCALIZABLES = 'a[href], button:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const aislamientos = new Map();

// A dónde volver al cerrar. No sirve mirar el foco al abrir la capa: para
// entonces varias ya lo han movido a su primer botón, y ese botón desaparece
// con ella. Se recuerda el último control enfocado fuera de cualquier capa.
let ultimoFocoFuera = null;
document.addEventListener('focusin', (evento) => {
  if (CAPAS_MODALES.every((id) => !$(id).contains(evento.target))) {
    ultimoFocoFuera = evento.target;
  }
}, true);

// Deja inerte todo lo que no sea la capa ni sus ancestros, subiendo nivel a
// nivel. Devuelve solo lo que ha marcado esta llamada, para no despertar al
// cerrar lo que ya estaba inerte por una capa de debajo.
function aislarCapa(capa) {
  const inertes = [];
  for (let nodo = capa; nodo?.parentElement; nodo = nodo.parentElement) {
    for (const hermano of nodo.parentElement.children) {
      if (hermano === nodo || hermano.inert || NUNCA_INERTES.has(hermano.id)) continue;
      hermano.inert = true;
      inertes.push(hermano);
    }
  }
  return inertes;
}

function alAbrirCapa(capa) {
  aislamientos.set(capa, { inertes: aislarCapa(capa), previo: ultimoFocoFuera });
  // Varias capas ya colocan el foco donde mejor les viene; solo se interviene
  // si al pintarse no lo ha recogido nadie.
  requestAnimationFrame(() => {
    if (capa.classList.contains('oculto') || capa.contains(document.activeElement)) return;
    // El primero que además se vea: varios menús esconden opciones que no
    // vienen al caso, y enfocar una oculta no hace nada.
    [...capa.querySelectorAll(FOCALIZABLES)]
      .find((elemento) => elemento.checkVisibility?.() ?? true)?.focus();
  });
}

function alCerrarCapa(capa) {
  const guardado = aislamientos.get(capa);
  if (!guardado) return;
  aislamientos.delete(capa);
  for (const elemento of guardado.inertes) elemento.inert = false;
  // El foco se da por perdido si sigue dentro de la capa que se acaba de
  // ocultar (el navegador aún no lo ha soltado cuando llega este aviso) o si ya
  // ha caído en <body>. Si alguien lo ha recolocado en otra parte —Escape lo
  // hace en varios sitios— no se le lleva la contraria, y si queda una capa
  // debajo, la última palabra es suya.
  const previo = guardado.previo;
  const activo = document.activeElement;
  const perdido = !activo || activo === document.body || capa.contains(activo);
  if (aislamientos.size || !perdido) return;
  if (previo?.isConnected && (previo.checkVisibility?.() ?? true)) previo.focus();
}

for (const id of CAPAS_MODALES) {
  const capa = $(id);
  let abierta = !capa.classList.contains('oculto');
  new MutationObserver(() => {
    const ahora = !capa.classList.contains('oculto');
    if (ahora === abierta) return;
    abierta = ahora;
    if (ahora) alAbrirCapa(capa); else alCerrarCapa(capa);
  }).observe(capa, { attributes: true, attributeFilter: ['class'] });
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

// ── Pestañas de los ajustes ──
//
// La nube, la biblioteca, el lector y las copias no se parecen en nada y solo
// se toca una cosa cada vez: separarlas evita recorrer la lista entera. La
// ayuda va igual, que es todavía más larga. La última abierta de cada grupo se
// recuerda, que quien viene a cambiar el texto suele volver.
//
// Los mandos se buscan cada vez en lugar de guardarse: la ayuda se rehace
// entera al cambiar de idioma y los botones de entonces ya no existen. Por eso
// los eventos se escuchan en el documento, no en cada pestaña.
function pestanasDe(grupo) {
  return [...document.querySelectorAll(`.pestanas[data-grupo="${grupo}"] .pestana`)];
}

function mostrarPestana(grupo, nombre, mover = false) {
  const pestanas = pestanasDe(grupo);
  const elegida = pestanas.find((pestana) => pestana.dataset.panel === nombre) ?? pestanas[0];
  if (!elegida) return;
  for (const pestana of pestanas) {
    const activa = pestana === elegida;
    pestana.setAttribute('aria-selected', String(activa));
    pestana.tabIndex = activa ? 0 : -1;
    const panel = document.getElementById(pestana.getAttribute('aria-controls'));
    if (panel) panel.hidden = !activa;
  }
  localStorage.setItem(`lector.pestana.${grupo}`, elegida.dataset.panel);
  if (mover) elegida.focus();
}

function pestanaRecordada(grupo, inicial) {
  return localStorage.getItem(`lector.pestana.${grupo}`) ?? inicial;
}

document.addEventListener('click', (evento) => {
  const pestana = evento.target.closest('.pestana');
  if (!pestana) return;
  mostrarPestana(pestana.closest('.pestanas').dataset.grupo, pestana.dataset.panel);
});

document.addEventListener('keydown', (evento) => {
  const pestana = evento.target.closest?.('.pestana');
  if (!pestana) return;
  const grupo = pestana.closest('.pestanas').dataset.grupo;
  const pestanas = pestanasDe(grupo);
  const indice = pestanas.indexOf(pestana);
  const salto = { ArrowRight: 1, ArrowLeft: -1 }[evento.key];
  let destino = null;
  if (salto) destino = pestanas[(indice + salto + pestanas.length) % pestanas.length];
  else if (evento.key === 'Home') destino = pestanas[0];
  else if (evento.key === 'End') destino = pestanas.at(-1);
  if (!destino) return;
  evento.preventDefault();
  mostrarPestana(grupo, destino.dataset.panel, true);
});

function abrirAjustes(registrar = true, pestana = null) {
  const config = cargarConfig() ?? {};
  $('campo-url').value = config.url ?? '';
  $('campo-usuario').value = config.usuario ?? '';
  $('campo-clave').value = config.clave ?? '';
  $('resultado-prueba').textContent = '';
  $('resultado-prueba').className = 'estado';
  pintarResumenRegistro();
  pintarResumenEstadisticas();
  sincronizarSelectRecientes();
  pintarAjustesLimpieza();
  pintarDispositivos();
  pintarAjustesTexto();
  aplicarMargenEpub();
  mostrarPestana('ajustes', pestana ?? pestanaRecordada('ajustes', 'nube'));
  mostrarVista('ajustes');
  if (registrar) registrarVista('ajustes');
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
  volverALaBiblioteca();
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
  volverALaBiblioteca();
});

$('btn-ajustes').addEventListener('click', () => abrirAjustes());
// Quien viene de «configura tu nube» busca eso, no la pestaña donde lo dejó.
$('enlace-configurar').addEventListener('click', (evento) => {
  evento.preventDefault();
  abrirAjustes(true, 'nube');
});
// Los dos avisos funcionan igual: la «x» los aparta de la vista y la casilla,
// que viene marcada, decide si vuelven. Con leerlos basta, así que no hace
// falta cerrarlos para que no reaparezcan; quien quiera seguir viéndolos la
// desmarca. La nube sigue accesible desde los ajustes.
$('btn-cerrar-aviso-config').addEventListener('click', () => {
  avisoConfigALaVista = false;
  $('aviso-sin-config').classList.add('oculto');
});

$('no-mostrar-aviso-config').addEventListener('change', (evento) => {
  localStorage.setItem(CLAVE_AVISO_CONFIG_CERRADO, evento.target.checked ? '1' : AVISO_SIEMPRE);
});

$('btn-cerrar-aviso-ejemplos').addEventListener('click', () => {
  avisoEjemplosALaVista = false;
  $('aviso-ejemplos').classList.add('oculto');
});

$('no-mostrar-aviso-ejemplos').addEventListener('change', (evento) => {
  if (evento.target.checked) localStorage.removeItem(CLAVE_AVISO_EJEMPLOS);
  else localStorage.setItem(CLAVE_AVISO_EJEMPLOS, AVISO_SIEMPRE);
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

// ───────────── Registro de actividad ─────────────

// El resumen en Ajustes dice de un vistazo si hay algo que mirar, para no
// tener que abrir el registro cada vez por si acaso.
function pintarResumenRegistro() {
  const zona = $('resumen-registro');
  const eventos = registro.listar();
  const errores = eventos.filter((evento) => evento.nivel === 'error').length;
  zona.className = errores ? 'estado error' : 'estado';
  zona.textContent = !eventos.length ? t('logEmpty')
    : errores ? t('logWithErrors', { errores })
    : t('logNoErrors', { total: eventos.length });
}

function pintarListaRegistro() {
  const lista = $('lista-registro');
  const eventos = registro.listar();
  lista.replaceChildren();
  $('registro-vacio').classList.toggle('oculto', eventos.length > 0);
  for (const evento of eventos) {
    const elemento = document.createElement('li');
    elemento.className = `evento-registro nivel-${evento.nivel}`;
    const cuando = document.createElement('time');
    cuando.dateTime = evento.cuando;
    cuando.textContent = new Date(evento.cuando).toLocaleString(idiomaActual());
    const que = document.createElement('span');
    que.className = 'que-paso';
    que.textContent = evento.evento + (evento.veces > 1 ? ` ×${evento.veces}` : '');
    elemento.append(cuando, que);
    if (evento.detalle) {
      const detalle = document.createElement('p');
      detalle.className = 'detalle-registro';
      detalle.textContent = evento.detalle;
      elemento.append(detalle);
    }
    lista.append(elemento);
  }
}

function abrirRegistro() {
  pintarListaRegistro();
  $('dialogo-registro').classList.remove('oculto');
  $('btn-cerrar-registro').focus();
}

function cerrarRegistro() {
  $('dialogo-registro').classList.add('oculto');
  pintarResumenRegistro();
  $('btn-ver-registro').focus();
}

$('btn-ver-registro').addEventListener('click', abrirRegistro);
$('btn-cerrar-registro').addEventListener('click', cerrarRegistro);
$('dialogo-registro').addEventListener('click', (evento) => {
  if (evento.target === $('dialogo-registro')) cerrarRegistro();
});
$('btn-borrar-registro').addEventListener('click', () => {
  registro.limpiar();
  pintarListaRegistro();
  pintarResumenRegistro();
});
$('btn-copiar-registro').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(registro.comoTexto());
    avisar(t('logCopied'));
  } catch {
    // Sin permiso de portapapeles queda la descarga, que no lo necesita.
    avisar(t('logCopyFailed'), 5000);
  }
});
$('btn-descargar-registro').addEventListener('click', () => {
  const fecha = new Date().toISOString().slice(0, 10);
  entregarDescarga(`pagekeeper-registro-${fecha}.txt`,
    new TextEncoder().encode(registro.comoTexto()), 'text/plain');
});

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
  volverALaBiblioteca();
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

// Botones de «Importar y exportar» que no llevan a ninguna parte sin nube.
const ACCIONES_DE_NUBE = [
  'accion-restaurar-nube', 'accion-subir-desde-archivos', 'accion-subir-carpeta-desde-archivos',
];

function actualizarAccionesArchivos() {
  const disponible = Boolean(cliente);
  $('btn-exportar-nube').disabled = !disponible;
  for (const id of ACCIONES_DE_NUBE) {
    $(id).classList.toggle('accion-deshabilitada', !disponible);
    $(id).setAttribute('aria-disabled', String(!disponible));
  }
}

function abrirArchivos(registrar = true) {
  actualizarAccionesArchivos();
  $('resultado-copia-biblioteca').textContent = '';
  $('resultado-copia-nube').textContent = cliente ? '' : t('cloudBackupNeedsConfig');
  $('resultado-copia-nube').className = `estado${cliente ? '' : ' error'}`;
  mostrarVista('archivos');
  if (registrar) registrarVista('archivos');
}

$('btn-archivos').addEventListener('click', abrirArchivos);
$('btn-cerrar-archivos').addEventListener('click', () => {
  if (history.state?.[ESTADO_VISTA] === 'archivos') history.back();
  else {
    mostrarVista('biblioteca');
    cargarBiblioteca();
  }
});
for (const id of ACCIONES_DE_NUBE) {
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
  // Estos mapas pueden contener también ids de la nube: la copia local solo
  // debe revelar y restaurar las entradas de los libros incluidos.
  for (const clave of [CLAVE_ROTACION_PDF, CLAVE_RITMO, CLAVE_ALINEACION_LIBRO]) {
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
  aplicarPapel();
  $('filtro-biblioteca').value = localStorage.getItem(CLAVE_FILTRO_BIBLIOTECA) ?? 'todos';
  $('orden-biblioteca').value = localStorage.getItem(CLAVE_ORDEN_BIBLIOTECA) ?? 'reciente';
  aplicarVistaBiblioteca(localStorage.getItem(CLAVE_VISTA_BIBLIOTECA) ?? 'lista');
  sincronizarCasillaContinuar();
  aplicarPlegadoContinuar();
  sincronizarSelectRecientes();
}

async function exportarBibliotecaLocal() {
  const estado = $('resultado-copia-biblioteca');
  mostrarCarga(t('creatingBackup'));
  try {
    const { libros, anotaciones: documentos, carpetas } = await almacen.exportarBibliotecaLocal();
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
      carpetas, // incluidas las vacías, que no se deducen de ningún libro
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
    await almacen.restaurarBibliotecaLocal(libros, documentos, manifiesto.carpetas ?? []);
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

// El dominio de este lector, que la ayuda cita para configurar el servidor.
function ponerDominioEnAyuda() {
  for (const id of ['ayuda-dominio', 'ayuda-dominio-ia']) {
    const hueco = $(id);
    if (hueco) hueco.textContent = location.origin;
  }
}

function abrirAyuda(registrar = true, pestana = null) {
  ponerDominioEnAyuda();
  mostrarPestana('ayuda', pestana ?? pestanaRecordada('ayuda', 'empezar'));
  mostrarVista('ayuda');
  if (registrar) registrarVista('ayuda');
}

// La ayuda se rehace entera en el idioma nuevo, con su primera pestaña abierta
// y sin el dominio: se vuelve a la que se estaba leyendo y se rellena de nuevo.
document.addEventListener('idioma-cambiado', () => {
  mostrarPestana('ayuda', pestanaRecordada('ayuda', 'empezar'));
  ponerDominioEnAyuda();
});

$('btn-ayuda').addEventListener('click', () => abrirAyuda());
$('btn-cerrar-ayuda').addEventListener('click', () => {
  if (history.state?.[ESTADO_VISTA] === 'ayuda') history.back();
  else {
    mostrarVista('biblioteca');
    cargarBiblioteca();
  }
});
// Quien pregunta «¿qué pongo aquí?» desde la configuración va a la pestaña de
// la nube, que es donde está la respuesta.
for (const id of ['enlace-ayuda-aviso', 'enlace-ayuda-ajustes']) {
  $(id).addEventListener('click', (evento) => {
    evento.preventDefault();
    abrirAyuda(true, 'nube');
  });
}
// Los enlaces del aviso inicial se regeneran al cambiar de idioma.
document.addEventListener('click', (evento) => {
  const enlace = evento.target.closest('#enlace-configurar, #enlace-ayuda-aviso, #enlace-ayuda-ajustes');
  if (!enlace) return;
  evento.preventDefault();
  if (enlace.id === 'enlace-configurar') abrirAjustes(true, 'nube'); else abrirAyuda(true, 'nube');
});
$('btn-cerrar-ajustes').addEventListener('click', () => {
  if (history.state?.[ESTADO_VISTA] === 'ajustes') history.back();
  else {
    mostrarVista('biblioteca');
    cargarBiblioteca();
  }
});

// ───────────────────────── Biblioteca ─────────────────────────

function actualizarEstadoSincronizacion(error = null) {
  const estado = document.querySelector('#zona-remota .estado-sincronizacion');
  if (!estado) return;
  // La chapita solo habla cuando hay algo que decir: que la nube va bien es lo
  // que se espera de ella, y anunciarlo en cada carga era ruido.
  estado.classList.toggle('oculto', !error);
  estado.textContent = error ? t('syncError') : '';
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
    // Los ejemplos aparecen sin que nadie los haya pedido: conviene explicar
    // de dónde salen y que se pueden borrar.
    localStorage.setItem(CLAVE_AVISO_EJEMPLOS, '1');
  } catch { /* sin conexión: se reintentará en el próximo arranque */ }
}

// Un aviso sale una vez y con la casilla ya marcada: haberlo tenido delante
// cuenta como haberlo leído, así que se apunta en el acto que no vuelva. Lo
// que quede de visita se mantiene a la vista aunque la marca ya diga otra
// cosa, para que se pueda desmarcar o cerrar con calma.
let avisoEjemplosALaVista = null; // null mientras no se ha decidido en esta visita
let avisoConfigALaVista = null;
// Desmarcar la casilla es una decisión que también se recuerda: si no, el
// aviso volvería a darse por leído en el siguiente arranque y habría que
// desmarcarla una y otra vez.
const AVISO_SIEMPRE = 'siempre';

function nombresLibrosEjemplo() {
  return new Set(Object.values(LIBROS_EJEMPLO).flat().map((ejemplo) => ejemplo.nombre));
}

// El aviso acompaña a los ejemplos: si ya no queda ninguno en la biblioteca
// (los ha borrado, que es justo lo que el aviso explica cómo hacer) no hay
// nada que contar y no volverá a aparecer.
function actualizarAvisoEjemplos(librosLocales, inventarioFiable) {
  const aviso = $('aviso-ejemplos');
  const guardado = localStorage.getItem(CLAVE_AVISO_EJEMPLOS);
  // Nada apuntado: o no se precargó nada, o el aviso ya cumplió. La decisión
  // se deja sin tomar porque la biblioteca se pinta una primera vez antes de
  // que termine la precarga, y entonces todavía no hay nada que contar.
  if (guardado && inventarioFiable) {
    const ejemplos = nombresLibrosEjemplo();
    if (!librosLocales.some((libro) => ejemplos.has(libro.nombre))) {
      localStorage.removeItem(CLAVE_AVISO_EJEMPLOS);
      avisoEjemplosALaVista = false;
      aviso.classList.add('oculto');
      return;
    }
  }
  if (avisoEjemplosALaVista === null && guardado) {
    avisoEjemplosALaVista = true;
    // Enseñarlo ya cuenta como haberlo leído; a quien desmarcó la casilla se
    // la deja como la dejó, y el aviso le sigue saliendo.
    if (guardado === '1') localStorage.removeItem(CLAVE_AVISO_EJEMPLOS);
    $('no-mostrar-aviso-ejemplos').checked = guardado !== AVISO_SIEMPRE;
  }
  aviso.classList.toggle('oculto', !avisoEjemplosALaVista);
}

// El de «sin servidor», igual: quien no usa nube lo lee una vez y no vuelve a
// aparecer, salvo que desmarque la casilla.
function actualizarAvisoConfig(hayConfig) {
  const aviso = $('aviso-sin-config');
  if (hayConfig) {
    aviso.classList.add('oculto');
    return;
  }
  if (avisoConfigALaVista === null) {
    const guardado = localStorage.getItem(CLAVE_AVISO_CONFIG_CERRADO);
    avisoConfigALaVista = guardado !== '1';
    if (guardado === null) localStorage.setItem(CLAVE_AVISO_CONFIG_CERRADO, '1');
    $('no-mostrar-aviso-config').checked = guardado !== AVISO_SIEMPRE;
  }
  aviso.classList.toggle('oculto', !avisoConfigALaVista);
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
  olvidarIndiceNube(); // la nube puede haber cambiado: se recorrerá otra vez
  const promesaLocales = cargarLibrosLocales();
  versionContinuarLeyendo += 1; // cancela una comprobación remota anterior aún en curso
  $('continuar-leyendo').classList.add('oculto');

  const hayConfig = cliente !== null;
  actualizarAvisoConfig(hayConfig);
  $('zona-remota').classList.toggle('oculto', !hayConfig);
  // La sección local solo tiene sentido en la raíz: dentro de una subcarpeta
  // de la nube distraería y sus libros no pertenecen a esa carpeta.
  $('zona-local').classList.toggle('oculto', Boolean(hayConfig && rutaNube));
  if (!hayConfig) {
    $('lista-libros').replaceChildren();
    $('lista-carpetas').replaceChildren();
    mostrarLibroEjemplo((await promesaLocales) === 0);
    await pintarContinuarLeyendo();
    actualizarVisibilidadBuscadorBiblioteca();
    return;
  }

  const estado = $('estado-remoto');
  estado.className = 'estado';
  estado.textContent = t('loadingLibrary');
  $('lista-libros').replaceChildren();
  $('lista-carpetas').replaceChildren();
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
    // Si desde otro dispositivo pidieron desconectar este, se acata aquí: la
    // biblioteca que se acaba de pintar deja de tener nube detrás.
    if (await acatarDesconexionSiToca()) return;
    // Y si no, queda constancia de que este aparato sigue en uso.
    if (progreso.anotarDispositivo({ crear: true })) {
      progreso.sincronizar(cliente).catch(() => null);
    }
    if (errorSincronizacion) {
      avisar(t('syncFailed', { error: explicarError(errorSincronizacion) }), 7000);
    }
    estado.textContent = carpetas.length || libros.length
      ? ''
      : t(rutaNube ? 'emptyFolder' : 'noCloudBooks');
    pintarListaRemota(carpetas, libros, copias);
    // Puede haber llegado de otro dispositivo la decisión de no medir el
    // tiempo: las casillas la enseñan sin esperar a que se abra la pantalla.
    sincronizarCasillasEstadisticas();
    const cantidadLocales = await promesaLocales;
    mostrarLibroEjemplo(!rutaNube && cantidadLocales === 0 && carpetas.length === 0 && libros.length === 0);
    await pintarContinuarLeyendo({
      librosRemotosDisponibles: new Map(libros.map((libro) => [idRemoto(libro.nombre), libro])),
    });
    generarPortadasFaltantes(libros.map((libro) => ({ ...libro, nombre: idRemoto(libro.nombre) })));
    conciliarProgresoConLaNube(); // en segundo plano: la biblioteca ya está en pantalla
  } catch (error) {
    const copias = await promesaCopias;
    await pintarContinuarLeyendo({
      librosRemotosDisponibles: new Map(copias.map((copia) => [copia.id, copia])),
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
      // La entrada del historial apuntaba a esa carpeta: se corrige en el
      // sitio para que retroceder no intente volver a lo que ya no existe.
      actualizarCarpetasEnHistorial();
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

// A partir de este ancho las listas se reparten en columnas (ver estilos.css),
// así que las demás lecturas caben al lado de la destacada sin alargar nada:
// el desplegable deja de tener sentido y se muestran todas de una vez. En
// pantallas estrechas sigue plegándose, que es donde el espacio escasea.
const PANTALLA_ANCHA = window.matchMedia?.('(min-width: 64rem)');

// Cuántas lecturas recientes se enseñan: una más en cuanto hay cuadrícula,
// donde las cuatro fichas caben en una fila ya desde el ancho mínimo.
const RECIENTES_POSIBLES = [2, 3, 4, 6, 8];

function maximoRecientes() {
  const elegido = Number(localStorage.getItem(CLAVE_CONTINUAR_MAXIMO));
  if (RECIENTES_POSIBLES.includes(elegido)) return elegido;
  return PANTALLA_ANCHA?.matches ? 4 : 3;
}

function sincronizarSelectRecientes() {
  const elegido = Number(localStorage.getItem(CLAVE_CONTINUAR_MAXIMO));
  $('cuantas-recientes').value = RECIENTES_POSIBLES.includes(elegido) ? String(elegido) : 'auto';
  // «2» a secas no dice de qué habla.
  for (const opcion of $('cuantas-recientes').options) {
    if (opcion.value !== 'auto') opcion.textContent = t('recentN', { count: opcion.value });
  }
  // Sin el recuadro no hay lecturas que contar.
  $('cuantas-recientes').disabled = continuarDesactivado();
}
document.addEventListener('idioma-cambiado', sincronizarSelectRecientes);

// ───────────── Ajustes: dispositivos conectados ─────────────

// Hace cuánto pasó por aquí un dispositivo, en palabras. Las horas exactas no
// dicen nada; lo que se busca de un vistazo es «este lleva meses sin usarse».
function haceCuanto(iso) {
  const cuando = Date.parse(iso ?? '');
  if (!Number.isFinite(cuando)) return t('deviceNeverSeen');
  const dias = Math.floor((Date.now() - cuando) / (24 * 60 * 60 * 1000));
  if (dias <= 0) return t('deviceToday');
  if (dias === 1) return t('deviceYesterday');
  if (dias < 30) return t('deviceDaysAgo', { count: dias });
  return new Date(cuando).toLocaleDateString(idiomaActual(),
    { day: 'numeric', month: 'long', year: 'numeric' });
}

// Nombre reconocible sin que nadie tenga que ponerlo: el navegador y el
// aparato («Chrome en Pixel 7», «Firefox en Linux»). Cuando el navegador no
// suelta prenda, queda el sistema a secas y para distinguirlos está el código.
function nombreAutomatico(aparato) {
  const donde = aparato.modelo?.trim() || aparato.sistema;
  if (aparato.navegador && donde) return t('deviceAuto', { browser: aparato.navegador, system: donde });
  return aparato.navegador || donde || t('deviceUnknown');
}

function pintarDispositivos() {
  const lista = $('lista-dispositivos');
  if (!lista) return;
  const aparatos = progreso.dispositivos();
  $('tarjeta-dispositivos').classList.toggle('oculto', !cliente && aparatos.length <= 1);
  lista.replaceChildren();
  if (!aparatos.length) {
    const li = document.createElement('li');
    li.className = 'ayuda';
    li.textContent = t('devicesNone');
    lista.append(li);
    return;
  }
  for (const aparato of aparatos) {
    const li = document.createElement('li');
    li.className = 'dispositivo';
    const datos = document.createElement('div');
    datos.className = 'dispositivo-datos';
    const titulo = document.createElement('strong');
    const automatico = nombreAutomatico(aparato);
    titulo.textContent = aparato.nombre?.trim() || automatico;
    const detalle = document.createElement('span');
    detalle.className = 'ayuda';
    const partes = [];
    if (aparato.esteMismo) partes.push(t('deviceThisOne'));
    // Con nombre propio, debajo queda de qué aparato se trata.
    if (aparato.nombre?.trim()) partes.push(automatico);
    if (aparato.codigo) partes.push(t('deviceCode', { code: aparato.codigo }));
    partes.push(t('deviceLastSeen', { when: haceCuanto(aparato.ultimaVez) }));
    if (aparato.baja) partes.push(t('deviceRevoked'));
    else if (aparato.revocado) partes.push(t('deviceRevokedPending'));
    detalle.textContent = partes.join(' · ');
    datos.append(titulo, detalle);
    const acciones = document.createElement('div');
    acciones.className = 'fila-botones';
    const renombrar = document.createElement('button');
    renombrar.type = 'button';
    renombrar.className = 'btn-secundario';
    renombrar.textContent = t('deviceRename');
    renombrar.addEventListener('click', () => {
      const nombre = prompt(t('deviceRenamePrompt'), aparato.nombre ?? automatico);
      if (nombre === null) return;
      progreso.renombrarDispositivo(aparato.id, nombre);
      if (cliente) progreso.sincronizar(cliente).catch(() => null);
      pintarDispositivos();
    });
    acciones.append(renombrar);
    // Desconectarse a uno mismo ya tiene su botón arriba: «Borrar configuración».
    if (!aparato.esteMismo && !aparato.revocado && !aparato.baja) {
      const desconectar = document.createElement('button');
      desconectar.type = 'button';
      desconectar.className = 'btn-peligro';
      desconectar.textContent = t('deviceDisconnect');
      desconectar.addEventListener('click', async () => {
        if (!confirm(t('deviceDisconnectConfirm', { name: titulo.textContent }))) return;
        progreso.revocarDispositivo(aparato.id);
        if (cliente) await progreso.sincronizar(cliente).catch(() => null);
        pintarDispositivos();
        avisar(t('deviceDisconnected'), 6000);
      });
      acciones.append(desconectar);
    }
    li.append(datos, acciones);
    lista.append(li);
  }
}

// La orden de desconexión la ejecuta el propio dispositivo: no hay sesión que
// cerrar desde fuera, solo una configuración guardada aquí que se tira.
async function acatarDesconexionSiToca() {
  if (!progreso.revocacionPendiente()) return false;
  progreso.acatarRevocacion();
  // Con la nube todavía a mano: así los demás dispositivos ven que la orden
  // se cumplió, en vez de quedarse esperando para siempre.
  await progreso.sincronizar(cliente).catch(() => null);
  localStorage.removeItem(CLAVE_CONFIG);
  crearCliente();
  avisar(t('deviceWasDisconnected'), 8000);
  await cargarBiblioteca();
  abrirAjustes(true, 'nube');
  return true;
}

// ───────────── Ajustes: libros que ya no están ─────────────

// Último recorrido de la nube, para poder borrar sin repetirlo.
let inventarioReciente = null;

function nombreCorto(id) {
  return id.startsWith('carpeta:') ? id.slice('carpeta:'.length) : id;
}

function fechaLegible(iso) {
  return new Date(iso).toLocaleDateString(idiomaActual(), {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// «1 libros» chirría: el proyecto ya tiene el par clave/claveOne para esto.
function tContado(clave, count, extra = {}) {
  return t(count === 1 ? `${clave}One` : clave, { count, ...extra });
}

function pintarInformeLimpieza(estado = null) {
  const informe = $('informe-limpieza');
  const botonBorrar = $('btn-limpiar-ahora');
  const faltan = progreso.ausentes();
  botonBorrar.classList.toggle('oculto', !faltan.length);
  $('btn-comprobar-limpieza').disabled = !cliente || estado === 'comprobando';
  informe.replaceChildren();
  const linea = (texto, clase = '') => {
    const p = document.createElement('p');
    if (clase) p.className = clase;
    p.textContent = texto;
    informe.append(p);
  };
  if (estado === 'comprobando') return void linea(t('cleanupChecking'));
  if (!cliente) return void linea(t('cleanupNoCloud'));
  if (!faltan.length) {
    linea(inventarioReciente
      ? tContado('cleanupClean', inventarioReciente.ids.size)
      : t('cleanupUnchecked'));
  } else {
    linea(tContado('cleanupMissing', faltan.length), 'aviso-limpieza');
    const lista = document.createElement('ul');
    for (const ausente of faltan) {
      const li = document.createElement('li');
      li.textContent = ausente.borradoEl
        ? t('cleanupMissingOn', {
          name: nombreCorto(ausente.id), date: fechaLegible(ausente.borradoEl),
        })
        : t('cleanupMissingNever', { name: nombreCorto(ausente.id) });
      lista.append(li);
    }
    informe.append(lista);
  }
  const sueltos = inventarioReciente?.lateralesHuerfanos?.length ?? 0;
  if (sueltos) linea(tContado('cleanupSideFiles', sueltos));
}

function pintarAjustesLimpieza() {
  $('dias-limpieza').value = String(progreso.diasDeGracia());
  pintarInformeLimpieza();
}
document.addEventListener('idioma-cambiado', () => {
  if (!$('vista-ajustes').classList.contains('oculto')) pintarAjustesLimpieza();
});

$('dias-limpieza').addEventListener('change', (evento) => {
  progreso.guardarDiasDeGracia(evento.target.value);
  // El plazo es de la biblioteca, no de este aparato: viaja con el progreso.
  if (cliente) progreso.sincronizar(cliente).catch(() => null);
  pintarInformeLimpieza();
});

$('btn-comprobar-limpieza').addEventListener('click', async () => {
  if (!cliente) return;
  pintarInformeLimpieza('comprobando');
  const purgados = await conciliarProgresoConLaNube({ forzarComprobacion: true });
  pintarInformeLimpieza();
  if (purgados.length) avisar(tContado('cleanupDone', purgados.length));
});

$('btn-limpiar-ahora').addEventListener('click', async () => {
  const faltan = progreso.ausentes();
  if (!faltan.length) return;
  if (!confirm(tContado('cleanupConfirm', faltan.length))) return;
  pintarInformeLimpieza('comprobando');
  // Se vuelve a mirar el servidor antes de borrar: la lista puede ser de hace
  // días y el libro haber vuelto a su sitio entretanto.
  const purgados = await conciliarProgresoConLaNube({ forzarComprobacion: true, ahora: true });
  pintarInformeLimpieza();
  avisar(purgados.length ? tContado('cleanupDone', purgados.length) : t('cleanupNothing'));
});

$('cuantas-recientes').addEventListener('change', (evento) => {
  if (evento.target.value === 'auto') localStorage.removeItem(CLAVE_CONTINUAR_MAXIMO);
  else localStorage.setItem(CLAVE_CONTINUAR_MAXIMO, evento.target.value);
  pintarContinuarLeyendo();
});

// «Continuar leyendo» se puede apagar del todo desde los ajustes. A quien
// abre siempre el mismo libro, o lee de un tirón, el bloque no le aporta y le
// aparta la biblioteca hacia abajo.
//
// Tampoco pinta nada dentro de una carpeta: ahí se ha entrado a buscar algo
// concreto, y las últimas lecturas ni siquiera tienen por qué estar dentro.
function continuarDesactivado() {
  return localStorage.getItem(CLAVE_CONTINUAR_OCULTO) === '1' ||
    Boolean(rutaNube) || Boolean(rutaLocal);
}

function sincronizarCasillaContinuar() {
  $('casilla-continuar').checked = !continuarDesactivado();
}

$('casilla-continuar').addEventListener('change', (evento) => {
  if (evento.target.checked) localStorage.removeItem(CLAVE_CONTINUAR_OCULTO);
  else localStorage.setItem(CLAVE_CONTINUAR_OCULTO, '1');
  sincronizarSelectRecientes();
  pintarContinuarLeyendo();
});

// ── Ir directamente al libro al abrir la aplicación ──
// La casilla está en el propio recuadro, junto a la lectura que se abriría, y
// repetida en los ajustes para que siga alcanzable con el recuadro apagado.

function abrirUltimoAlArrancar() {
  return localStorage.getItem(CLAVE_ABRIR_ULTIMO) === '1';
}

function sincronizarCasillasAbrirUltimo() {
  const activado = abrirUltimoAlArrancar();
  $('casilla-abrir-ultimo').checked = activado;
  $('casilla-abrir-ultimo-ajustes').checked = activado;
}

for (const id of ['casilla-abrir-ultimo', 'casilla-abrir-ultimo-ajustes']) {
  $(id).addEventListener('change', (evento) => {
    if (evento.target.checked) localStorage.setItem(CLAVE_ABRIR_ULTIMO, '1');
    else localStorage.removeItem(CLAVE_ABRIR_ULTIMO);
    sincronizarCasillasAbrirUltimo();
  });
}

// ── Plegar o quitar «Continuar leyendo» desde la propia biblioteca ──
// Quitarlo ya se podía en los ajustes, pero es donde nadie lo busca teniendo
// el recuadro delante. Plegado deja solo su cabecera, que ocupa una línea:
// para quien quiere la biblioteca a la vista sin renunciar a la última
// lectura, que sigue a un toque.

function aplicarPlegadoContinuar() {
  const plegado = localStorage.getItem(CLAVE_CONTINUAR_PLEGADO) === '1';
  $('continuar-leyendo').classList.toggle('continuar-plegado', plegado);
  $('btn-plegar-continuar').setAttribute('aria-expanded', String(!plegado));
}

function alternarPlegadoContinuar() {
  const plegado = localStorage.getItem(CLAVE_CONTINUAR_PLEGADO) === '1';
  if (plegado) localStorage.removeItem(CLAVE_CONTINUAR_PLEGADO);
  else localStorage.setItem(CLAVE_CONTINUAR_PLEGADO, '1');
  aplicarPlegadoContinuar();
}

$('btn-plegar-continuar').addEventListener('click', alternarPlegadoContinuar);
// Toda la cabecera alterna, igual que en las secciones de la biblioteca.
$('continuar-leyendo').querySelector('.texto-continuar')
  .addEventListener('click', alternarPlegadoContinuar);

$('btn-quitar-continuar').addEventListener('click', () => {
  localStorage.setItem(CLAVE_CONTINUAR_OCULTO, '1');
  sincronizarCasillaContinuar();
  pintarContinuarLeyendo();
  // Desaparecer sin decir por dónde vuelve sería dejarlo perdido.
  avisar(t('continueRemoved'), 6000);
});

function actualizarDesplegableContinuar() {
  const filas = [...$('libro-continuar').children];
  const todas = continuarExpandido || Boolean(PANTALLA_ANCHA?.matches);
  filas.forEach((fila, indice) => fila.classList.toggle('oculto', !todas && indice > 0));
  const boton = $('btn-mas-recientes');
  boton.classList.toggle('oculto', filas.length <= 1 || Boolean(PANTALLA_ANCHA?.matches));
  boton.setAttribute('aria-expanded', String(continuarExpandido));
  boton.textContent = continuarExpandido
    ? t('showFewerRecent')
    : t('showMoreRecent', { count: Math.max(0, filas.length - 1) });
}

// Al cruzar el umbral cambia cuántas lecturas caben, así que se repinta.
PANTALLA_ANCHA?.addEventListener('change', () => {
  if (!$('vista-biblioteca').classList.contains('oculto')) pintarContinuarLeyendo();
});

function lecturaTerminada(avance, porcentaje = null) {
  // Se redondea antes de comparar: el porcentaje de los EPUB lleva decimales y
  // un 99,6 % es un libro terminado, no uno al que le falta algo.
  const pct = Math.round(porcentaje ?? (avance?.paginas
    ? (avance.pagina / avance.paginas) * 100
    : 0));
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
  librosRemotosDisponibles = new Map(),
  comprobarRemotos = Boolean(cliente),
} = {}) {
  const version = ++versionContinuarLeyendo;
  const seccion = $('continuar-leyendo');
  const lista = $('libro-continuar');
  if (continuarDesactivado()) {
    lista.replaceChildren();
    seccion.classList.add('oculto');
    $('btn-mas-recientes').classList.add('oculto');
    return;
  }
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
  // Los datos del libro en la nube (tamaño, ETag) hacen falta tanto para saber
  // si sigue ahí como para las acciones del menú. Los de la carpeta que está
  // abierta ya vienen dados; los demás salen del listado de su carpeta, que se
  // guarda por si varios recientes comparten sitio.
  const listadosNube = new Map();
  const libroRemotoDe = async (id) => {
    const conocido = librosRemotosDisponibles.get(id);
    if (conocido) return conocido;
    if (!comprobarRemotos) return null;
    const carpeta = carpetaDeId(id);
    if (!listadosNube.has(carpeta)) {
      listadosNube.set(carpeta, cliente.listar(carpeta)
        .then(({ libros }) => new Map(libros.map((libro) => [libro.nombre, libro])))
        .catch(() => new Map()));
    }
    return (await listadosNube.get(carpeta)).get(nombreDeId(id)) ?? null;
  };
  const maximo = maximoRecientes();
  for (const reciente of recientes) {
    if (lista.children.length >= maximo) break;
    let nombre;
    let tamano = 0;
    let alAbrir;
    let acciones;
    if (reciente.id.startsWith('local:')) {
      const libro = localesPorId.get(reciente.id);
      if (!libro) continue;
      nombre = libro.nombre;
      tamano = libro.tamano;
      alAbrir = () => abrirLibroLocal(libro);
      acciones = accionesLibroLocal(libro);
    } else {
      if (!cliente) continue;
      const libro = await libroRemotoDe(reciente.id);
      if (version !== versionContinuarLeyendo) return;
      if (!libro) continue;
      nombre = libro.nombre ?? nombreDeId(reciente.id);
      tamano = libro.tamano ?? 0;
      alAbrir = () => abrirLibroRemoto(reciente.id, libro);
      const copia = await almacen.obtenerInfoCopiaRemota(cliente.base, reciente.id)
        .catch(() => null);
      if (version !== versionContinuarLeyendo) return;
      acciones = accionesLibroRemoto(reciente.id, libro, copia, !comprobarRemotos);
    }
    const fila = crearFilaLibro({
      id: reciente.id,
      titulo: nombre.replace(/\.(pdf|epub)$/i, ''),
      tamano,
      formato: formatoDe(nombre),
      sinTexto: formatoDe(nombre) === 'pdf' && pdfSinTextoConocido({
        tipo: reciente.id.startsWith('local:') ? 'local' : 'webdav', id: reciente.id, tamano,
      }),
      alAbrir,
      ...acciones,
      // El círculo de «terminado» no cabe en la ficha destacada, que ya lleva la
      // «x» de quitar; la acción sigue estando en el menú.
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
let libroDelMenu = null;

function cerrarMenuAcciones() {
  $('menu-libro').classList.add('oculto');
}

function abrirMenuAcciones(titulo, acciones, ancla, resumen = '', nota = '', idLibro = '') {
  $('titulo-menu-libro').textContent = titulo;
  // Las estrellas del libro, calificables aquí mismo: este menú es el camino
  // táctil a todo lo del libro, y quien lo abre para dejar su opinión no
  // tiene por qué pasar por el diálogo de la nota.
  const estrellas = $('calificacion-menu-libro');
  libroDelMenu = idLibro || null;
  estrellas.classList.toggle('oculto', !libroDelMenu);
  if (libroDelMenu) pintarEstrellas(estrellas, progreso.calificacionDe(libroDelMenu), { editable: true });
  else estrellas.replaceChildren();
  // El resumen del libro, si sus metadatos traen uno: en pantalla táctil el
  // aviso al pasar el ratón no existe, y este menú es la otra forma de leerlo.
  // Con la nota propia pasa lo mismo, y va debajo para no mezclarse con él.
  const textoResumen = $('resumen-menu-libro');
  textoResumen.textContent = resumen;
  textoResumen.classList.toggle('oculto', !resumen);
  const textoNota = $('nota-menu-libro');
  textoNota.textContent = nota;
  textoNota.classList.toggle('oculto', !nota);
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

  colocarMenuFlotante(document.querySelector('.menu-libro'), ancla);
  lista.querySelector('button')?.focus();
}

// Despliega un menú junto a su ancla: alineado a su borde derecho y por
// debajo; si no cabe en la ventana, se ajusta o se abre hacia arriba. El ancla
// puede ser un elemento (el botón «⋯») o el punto donde se pulsó el botón
// derecho, y entonces el menú cuelga hacia la derecha en vez de acabar ahí.
function colocarMenuFlotante(menu, ancla) {
  const caja = ancla instanceof Element
    ? ancla.getBoundingClientRect()
    : { top: ancla.y, bottom: ancla.y, right: ancla.x + menu.offsetWidth };
  const margen = 8;
  let x = Math.min(caja.right - menu.offsetWidth, window.innerWidth - menu.offsetWidth - margen);
  x = Math.max(margen, x);
  let y = caja.bottom + 4;
  const abreArriba = y + menu.offsetHeight > window.innerHeight - margen
    && caja.top - menu.offsetHeight - 4 > margen;
  if (abreArriba) y = caja.top - menu.offsetHeight - 4;
  // Pase lo que pase, dentro de la ventana: el menú flota en una capa fija que
  // no se desplaza, así que si se fuera detrás del borde con su ancla no
  // habría manera de alcanzarlo.
  y = Math.min(Math.max(margen, y),
    Math.max(margen, window.innerHeight - menu.offsetHeight - margen));
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.classList.toggle('abre-arriba', abreArriba);
}

$('menu-libro').addEventListener('click', (evento) => {
  if (evento.target === $('menu-libro')) cerrarMenuAcciones();
});

// Con el menú abierto, su fondo tapa la página entera y el siguiente clic
// derecho ya no llega a las fichas. Se cierra el menú y se le repite el clic a
// la que quedaba debajo, de modo que el botón derecho salta de una ficha a
// otra sin dejar salir el menú del navegador. La ficha se busca por su sitio
// en la pantalla y no con elementFromPoint, porque mientras hay una capa
// abierta el resto de la página está inerte y no responde al puntero.
function fichaEnPunto(x, y) {
  return [...document.querySelectorAll('.libro')].find((ficha) => {
    const caja = ficha.getBoundingClientRect();
    return x >= caja.left && x <= caja.right && y >= caja.top && y <= caja.bottom;
  });
}

$('menu-libro').addEventListener('contextmenu', (evento) => {
  evento.preventDefault();
  if (evento.target !== $('menu-libro')) return;
  const ficha = fichaEnPunto(evento.clientX, evento.clientY);
  cerrarMenuAcciones();
  ficha?.dispatchEvent(new PointerEvent('contextmenu', {
    bubbles: true, clientX: evento.clientX, clientY: evento.clientY,
    pointerType: 'mouse', button: 2,
  }));
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
  const resumen = () => ficha.closest('li')?.dataset.resumen ?? '';
  const nota = () => ficha.closest('li')?.dataset.nota ?? '';
  // Solo los libros se califican; las carpetas usan este mismo menú y no
  // llevan `idLibro`, así que ahí no aparecen las estrellas.
  const idLibro = () => ficha.closest('li')?.dataset.idLibro ?? '';
  menu.addEventListener('click', (evento) => {
    evento.stopPropagation();
    actualizarEtiqueta();
    abrirMenuAcciones(
      ficha.querySelector('.nombre').textContent, obtenerAcciones(), menu,
      resumen(), nota(), idLibro(),
    );
  });
  // El botón derecho sobre la ficha abre el mismo menú donde está el puntero.
  // Sobre el nombre no, porque ahí la pulsación larga ya muestra el título
  // completo y en táctil las dos cosas se dispararían a la vez.
  ficha.addEventListener('contextmenu', (evento) => {
    if (evento.target.closest('.nombre')) return;
    evento.preventDefault();
    actualizarEtiqueta();
    abrirMenuAcciones(
      ficha.querySelector('.nombre').textContent, obtenerAcciones(),
      { x: evento.clientX, y: evento.clientY }, resumen(), nota(), idLibro(),
    );
  });
  return menu;
}

// La misma acción para las carpetas de las dos bibliotecas. El nombre cambia
// con lo que sepa hacer el navegador: guardarla en el equipo tal cual o,
// cuando eso no es posible, entregarla comprimida.
function accionDescargarCarpeta(alPulsar) {
  const enDisco = puedeGuardarEnDisco();
  return {
    icono: enDisco ? 'folder-down' : 'download',
    etiqueta: t(enDisco ? 'actionSaveFolderToDisk' : 'actionDownloadFolderZip'),
    alPulsar,
  };
}

// Las acciones del menú «⋯» de un libro, aparte de la fila que lo muestra: la
// biblioteca y «Continuar leyendo» pintan fichas distintas, pero el libro es el
// mismo y ofrece lo mismo en las dos.
function accionesLibroLocal(libro) {
  return {
    alRenombrar: () => renombrarLibro(libro.id),
    // Subir a la nube: solo si hay servidor configurado.
    alSubir: cliente ? () => subirLibroLocalANube(libro) : null,
    alMover: () => abrirDialogoMover({ id: libro.id, nombre: libro.nombre }, 'local'),
    alDescargar: () => descargarLibroLocal(libro),
    alBorrar: () => borrarLibroLocal(libro),
  };
}

// `soloCopias`: se está mirando la nube sin conexión, así que solo vale lo que
// no necesita servidor.
function accionesLibroRemoto(id, libro, copia, soloCopias = false) {
  const desactualizada = !soloCopias && almacen.copiaRemotaDesactualizada(copia, libro);
  return {
    alRenombrar: () => renombrarLibro(id),
    alMover: soloCopias ? null : () => abrirDialogoMover({ id, nombre: libro.nombre }),
    alGuardarEnDispositivo: soloCopias ? null : () => guardarLibroRemotoEnDispositivo(id),
    alDescargar: soloCopias ? () => descargarCopiaRemota(id) : () => descargarLibroRemoto(id),
    alBorrar: soloCopias ? null : () => borrarLibroRemoto(id),
    alSinConexion: copia && !desactualizada
      ? () => quitarCopiaSinConexion(id, libro.nombre)
      : () => guardarCopiaSinConexion(id, libro),
    sinConexion: Boolean(copia),
    copiaDesactualizada: desactualizada,
  };
}

// Crea la fila de un libro: la ficha lo abre y el menú «⋯» agrupa el resto de acciones.
function crearFilaLibro({
  id, titulo, tamano, formato, alAbrir, alSubir, alMover, alDescargar, alBorrar,
  alGuardarEnDispositivo, alSinConexion, alRenombrar, sinConexion = false, copiaDesactualizada = false,
  mostrarTerminado = true, sinTexto = false, carpeta = '',
}) {
  const avance = progreso.progresoDe(id);
  // El nombre que puso el usuario manda sobre el del archivo (y, más abajo,
  // sobre el de los metadatos). `titulo` sigue vivo para la búsqueda, para que
  // el nombre original todavía encuentre el libro.
  const personalizado = progreso.tituloDe(id);
  const tituloMostrado = personalizado || titulo;
  const porcentaje = avance?.paginas ? Math.round((avance.pagina / avance.paginas) * 100) : 0;
  const estadoLectura = lecturaTerminada(avance, porcentaje)
    ? 'terminados'
    : porcentaje > 0 ? 'leyendo' : 'pendientes';

  const elemento = document.createElement('li');
  elemento.dataset.idLibro = id;
  elemento.dataset.busqueda = normalizarBusqueda(
    `${tituloMostrado} ${titulo} ${formato} ${carpeta.replace(/\//g, ' ')}`);
  elemento.dataset.titulo = normalizarBusqueda(tituloMostrado);
  elemento.dataset.tituloPersonalizado = personalizado ? 'true' : '';
  elemento.dataset.autor = '';
  elemento.dataset.progreso = String(porcentaje);
  elemento.dataset.fechaLectura = avance?.posicionActualizada ?? avance?.actualizado ?? '';
  elemento.dataset.estadoLectura = estadoLectura;
  elemento.classList.toggle('libro-terminado', estadoLectura === 'terminados');
  // De dónde sale el libro, para marcarlo en la ficha: los identificadores
  // locales llevan el prefijo «local:» y los de la nube son su ruta.
  const enLaNube = !String(id).startsWith('local:');
  const boton = document.createElement('div');
  boton.className = 'libro';
  boton.setAttribute('role', 'button');
  boton.tabIndex = 0;
  boton.innerHTML = `
    <span class="portada">${icono(formato === 'epub' ? 'book-open' : 'book')}</span>
    <span class="marca-origen ${enLaNube ? 'origen-nube' : 'origen-dispositivo'}" title="${t(enLaNube ? 'cloud' : 'device')}">${icono(enLaNube ? 'cloud' : 'smartphone')}</span>
    <span class="datos">
      <span class="cabecera-libro">
        <span class="nombre"></span>
        <span class="formato formato-${formato}"></span>
        <span class="estado-sin-conexion oculto"></span>
        <span class="nota-libro oculto"></span>
        <span class="carpeta-libro oculto"></span>
      </span>
      <span class="autor oculto"></span>
      <span class="fila-detalle"><span class="calificacion-libro estrellas oculto"></span><span class="detalle"></span></span>
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
  nombreLibro.textContent = tituloMostrado;
  nombreLibro.title = tituloMostrado;
  const etiquetaFormato = boton.querySelector('.formato');
  etiquetaFormato.textContent = sinTexto
    ? `${formato.toUpperCase()} · ${t('pdfNoTextBadge')}`
    : formato.toUpperCase();
  etiquetaFormato.classList.toggle('sin-texto', sinTexto);
  if (sinTexto) etiquetaFormato.title = t('pdfNoTextTitle');
  // Un resultado que sale de otra carpeta lleva dicho de cuál: si no, en la
  // lista aparecen libros que no están donde se está mirando y no hay manera
  // de saber de dónde han salido.
  if (carpeta) {
    const etiqueta = boton.querySelector('.carpeta-libro');
    etiqueta.innerHTML = `${icono('folder')}<span></span>`;
    etiqueta.querySelector('span').textContent = carpeta.split('/').pop();
    etiqueta.title = t('inFolder', { name: carpeta });
    etiqueta.classList.remove('oculto');
  }
  const estadoSinConexion = boton.querySelector('.estado-sin-conexion');
  if (sinConexion) {
    estadoSinConexion.textContent = t(copiaDesactualizada ? 'offlineOutdated' : 'availableOffline');
    estadoSinConexion.classList.remove('oculto');
    estadoSinConexion.classList.toggle('desactualizada', copiaDesactualizada);
  }
  // Una entrada sin página ni CFI (p. ej. creada solo para guardar el nombre)
  // no es una lectura empezada: se muestra como pendiente.
  const empezado = avance && (avance.pagina != null || avance.cfi);
  boton.querySelector('.detalle').textContent = !empezado
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
    terminado.title = t(estadoLectura === 'terminados' ? 'markUnfinished' : 'markFinished', { title: tituloMostrado });
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
  // Marcar la lectura como terminada vive en el círculo de la ficha, pero ese
  // círculo solo aparece al pasar el ratón (y en «Continuar leyendo» ni eso):
  // en el menú está siempre a mano.
  acciones.push({
    icono: 'circle-check',
    etiqueta: t(estadoLectura === 'terminados' ? 'actionMarkUnfinished' : 'actionMarkFinished'),
    alPulsar: () => alternarTerminado(id, estadoLectura !== 'terminados'),
  });
  acciones.push({
    icono: 'notebook-pen',
    // Dice las dos cosas que abre: la nota es lo que había, la calificación
    // es lo nuevo, y quien busca calificar no adivinaría que está ahí dentro.
    etiqueta: t('bookNoteRating'),
    alPulsar: () => abrirNotaLibro(id, elemento.querySelector('.nombre')?.textContent ?? tituloMostrado),
  });
  // El otro camino a la ficha, además del tiempo de la barra del pie: esa se
  // puede apagar y en el modo inmersivo no está.
  acciones.push({
    icono: 'chart-column',
    etiqueta: t('actionBookStats'),
    alPulsar: () => abrirFichaLibro(id, elemento.querySelector('.nombre')?.textContent ?? tituloMostrado),
  });
  if (alRenombrar) acciones.push({ icono: 'pencil', etiqueta: t('actionRename'), alPulsar: alRenombrar });
  if (alSubir) acciones.push({ icono: 'cloud-upload', etiqueta: t('actionUpload'), alPulsar: alSubir });
  if (alMover) acciones.push({ icono: 'folder-input', etiqueta: t('actionMove'), alPulsar: alMover });
  if (alGuardarEnDispositivo) {
    acciones.push({
      icono: 'smartphone',
      etiqueta: t('actionSaveToDevice'),
      alPulsar: alGuardarEnDispositivo,
    });
  }
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
  aplicarNotaEnFila(elemento, id);
  aplicarCalificacionEnFila(elemento, id);
  cargarMetadatosEnFila(elemento, id, titulo);
  return elemento;
}

// ── Nota sobre el libro entero ──
// Distinta de las anotaciones, que van pegadas a un fragmento del texto y solo
// existen dentro del lector. Esta se escribe y se lee desde la biblioteca, sin
// abrir el libro: de qué va, por dónde ibas, a quién se lo prestaste.

// Deja la nota en la ficha: la chapita que avisa de que la hay, el texto para
// el aviso emergente y su contenido como texto buscable, que buscar por lo que
// uno mismo anotó es media gracia de tener notas.
function aplicarNotaEnFila(fila, id) {
  const nota = progreso.notaDe(id);
  const chapita = fila.querySelector('.nota-libro');
  if (!chapita) return;
  if (nota) {
    fila.dataset.nota = nota;
    // Va aparte de `busqueda` y no concatenada: la nota se reescribe, y al
    // rehacer la ficha se arrastrarían también las versiones viejas.
    fila.dataset.notaBusqueda = normalizarBusqueda(nota);
    chapita.innerHTML = icono('notebook-pen');
    chapita.title = nota;
    chapita.classList.remove('oculto');
  } else {
    delete fila.dataset.nota;
    delete fila.dataset.notaBusqueda;
    chapita.replaceChildren();
    chapita.removeAttribute('title');
    chapita.classList.add('oculto');
  }
}

// ── Calificación en estrellas ──

function textoCalificacion(valor) {
  return calificacion.textoAccesible(valor, {
    sinCalificar: t('ratingNone'),
    deMaximo: (n, max) => t('ratingOf', { n, max }),
  });
}

// Las estrellas, del mismo modo en el diálogo y en la ficha. Editables son
// botones —hay que poder llegar con el teclado y saber a qué se apunta—; de
// solo lectura, un texto con estrellas dibujadas.
function pintarEstrellas(contenedor, valor, { editable = false } = {}) {
  const estados = calificacion.estrellasDe(valor);
  contenedor.replaceChildren();
  contenedor.classList.toggle('editable', editable);
  contenedor.title = editable ? t('ratingHint') : textoCalificacion(valor);
  if (!editable) contenedor.setAttribute('aria-label', textoCalificacion(valor));
  for (const [indice, estado] of estados.entries()) {
    const posicion = indice + 1;
    const estrella = document.createElement(editable ? 'button' : 'span');
    estrella.className = `estrella ${estado}`;
    // La media estrella se compone: la vacía debajo y la llena recortada
    // encima. Un trazado partido por la mitad no existe en el juego de iconos
    // y así se pinta con el mismo dibujo que las demás.
    estrella.innerHTML = estado === 'media'
      ? `${icono('star')}<span class="mitad">${icono('star')}</span>`
      : icono('star');
    if (editable) {
      estrella.type = 'button';
      estrella.dataset.valor = String(posicion);
      estrella.setAttribute('aria-label', t('ratingOf', { n: posicion, max: calificacion.MAXIMO }));
      estrella.setAttribute('aria-pressed', String(estado !== 'vacia'));
    }
    contenedor.append(estrella);
  }
}

// Las estrellas en la ficha de la biblioteca: solo si hay calificación. Una
// fila de estrellas vacías en cada libro sería ruido en toda la lista, y para
// estrenar la calificación ya está el diálogo de la nota.
function aplicarCalificacionEnFila(fila, id) {
  const valor = progreso.calificacionDe(id);
  const hueco = fila.querySelector('.calificacion-libro');
  if (!hueco) return;
  fila.dataset.calificacion = valor === null ? '' : String(valor);
  hueco.classList.toggle('oculto', valor === null);
  if (valor === null) return hueco.replaceChildren();
  pintarEstrellas(hueco, valor, { editable: true });
}

function refrescarCalificacionEnFichas(id) {
  for (const fila of document.querySelectorAll(`li[data-id-libro="${CSS.escape(id)}"]`)) {
    aplicarCalificacionEnFila(fila, id);
  }
}

function guardarCalificacionLibro(id, valor) {
  progreso.guardarCalificacion(id, valor);
  refrescarCalificacionEnFichas(id);
  aplicarOrganizacionBiblioteca();
  if (libroActual?.id === id) pintarNotaLibroLector();
  if (cliente && !id.startsWith('local:')) progreso.sincronizar(cliente).catch(() => null);
}

// Las estrellas ya pintadas guardan su explicación («4 de 5 estrellas») en un
// atributo que el recorrido de data-i18n no alcanza: se rehacen.
document.addEventListener('idioma-cambiado', () => {
  for (const fila of document.querySelectorAll('li[data-id-libro]')) {
    aplicarCalificacionEnFila(fila, fila.dataset.idLibro);
  }
  if (libroActual) pintarNotaLibroLector();
});

// Calificar desde la ficha no debe abrir el libro: el toque se queda aquí.
document.addEventListener('click', (evento) => {
  const estrella = evento.target.closest?.('li[data-id-libro] .calificacion-libro .estrella');
  if (!estrella) return;
  evento.stopPropagation();
  evento.preventDefault();
  const { idLibro } = estrella.closest('li[data-id-libro]').dataset;
  guardarCalificacionLibro(
    idLibro,
    calificacion.alPulsarEstrella(progreso.calificacionDe(idLibro), Number(estrella.dataset.valor)),
  );
}, { capture: true });

// El mismo libro puede estar en varias listas a la vez (la nube, «Continuar
// leyendo»…): se refrescan todas sus fichas, no solo desde la que se abrió.
function refrescarNotaEnFichas(id) {
  const escapado = CSS.escape(id);
  for (const fila of document.querySelectorAll(
    `li[data-id-libro="${escapado}"], li[data-id-nota="${escapado}"]`)) {
    aplicarNotaEnFila(fila, id);
  }
}

// Las carpetas también tienen nota, guardada en el mismo sitio que la de los
// libros. Su identificador lleva delante lo que es y, en las del dispositivo,
// el «local:» que la sincronización ya sabe que no debe subir a la nube.
function idNotaCarpeta(ruta, ambito) {
  return ambito === 'local' ? `local:carpeta:${ruta}` : `carpeta:${ruta}`;
}

let libroDeLaNota = null;
// La calificación del diálogo no se guarda al pulsar la estrella, sino al
// aceptar: si no, «Cancelar» dejaría a medias un cambio ya hecho.
let calificacionDeLaNota = null;

function abrirNotaLibro(id, titulo, esCarpeta = false) {
  libroDeLaNota = id;
  $('titulo-nota-libro').textContent = t(esCarpeta ? 'folderNote' : 'bookNoteRating');
  $('texto-nota-libro').placeholder = t(esCarpeta ? 'folderNotePlaceholder' : 'bookNotePlaceholder');
  $('libro-de-la-nota').textContent = titulo;
  $('texto-nota-libro').value = progreso.notaDe(id) ?? '';
  $('btn-borrar-nota-libro').classList.toggle('oculto', !progreso.notaDe(id));
  // Una carpeta no se califica: lo que se califica es lo que se lee.
  $('calificacion-nota-libro').classList.toggle('oculto', esCarpeta);
  calificacionDeLaNota = esCarpeta ? null : progreso.calificacionDe(id);
  pintarEstrellas($('estrellas-nota-libro'), calificacionDeLaNota, { editable: true });
  $('dialogo-nota-libro').classList.remove('oculto');
  $('texto-nota-libro').focus();
}

// Calificar desde el menú «⋯». A diferencia del diálogo, aquí no hay
// «Aceptar»: el menú no confirma nada, así que la estrella se guarda al
// pulsarla, igual que en la ficha. El menú se queda abierto, que quien
// rectifica suele hacerlo en el acto.
$('calificacion-menu-libro').addEventListener('click', (evento) => {
  const estrella = evento.target.closest('.estrella');
  if (!estrella || !libroDelMenu) return;
  guardarCalificacionLibro(
    libroDelMenu,
    calificacion.alPulsarEstrella(progreso.calificacionDe(libroDelMenu), Number(estrella.dataset.valor)),
  );
  pintarEstrellas($('calificacion-menu-libro'), progreso.calificacionDe(libroDelMenu), { editable: true });
});

$('estrellas-nota-libro').addEventListener('click', (evento) => {
  const estrella = evento.target.closest('.estrella');
  if (!estrella) return;
  calificacionDeLaNota = calificacion.alPulsarEstrella(
    calificacionDeLaNota, Number(estrella.dataset.valor),
  );
  pintarEstrellas($('estrellas-nota-libro'), calificacionDeLaNota, { editable: true });
});

function cerrarNotaLibro() {
  libroDeLaNota = null;
  $('dialogo-nota-libro').classList.add('oculto');
}

// La nota tal como se ve dentro del lector, en el panel de anotaciones. Sin
// nota escrita se dice que no la hay: el botón de al lado es el que invita a
// escribirla, y un hueco vacío no se entiende.
function pintarNotaLibroLector() {
  const seccion = $('nota-libro-lector');
  if (!libroActual) return seccion.classList.add('oculto');
  seccion.classList.remove('oculto');
  const nota = progreso.notaDe(libroActual.id);
  const texto = $('texto-nota-lector');
  texto.textContent = nota ?? t('noBookNote');
  texto.classList.toggle('sin-nota', !nota);
  // Aquí las estrellas solo se enseñan: se cambian en el diálogo, que es donde
  // el botón de al lado lleva. Sin calificación no se pinta nada, igual que
  // en la ficha.
  const estrellas = $('estrellas-nota-lector');
  const valor = progreso.calificacionDe(libroActual.id);
  estrellas.classList.toggle('oculto', valor === null);
  if (valor !== null) pintarEstrellas(estrellas, valor);
  else estrellas.replaceChildren();
}

$('btn-editar-nota-lector').addEventListener('click', () => {
  if (libroActual) abrirNotaLibro(libroActual.id, libroActual.titulo ?? '');
});

function guardarNotaLibro(texto) {
  const id = libroDeLaNota;
  if (!id) return;
  progreso.guardarNota(id, texto);
  if (calificacionDeLaNota !== progreso.calificacionDe(id)) {
    progreso.guardarCalificacion(id, calificacionDeLaNota);
    refrescarCalificacionEnFichas(id);
    aplicarOrganizacionBiblioteca();
  }
  refrescarNotaEnFichas(id);
  pintarNotaCarpetaAbierta('nube');
  pintarNotaCarpetaAbierta('local');
  // Repintar el panel entero, y no solo la nota, porque el botón de exportar
  // aparece o desaparece con ella.
  if (!$('panel-anotaciones').classList.contains('oculto')) pintarAnotaciones();
  else pintarNotaLibroLector();
  cerrarNotaLibro();
  // En los libros de la nube la nota viaja a los demás dispositivos; si la red
  // falla, queda pendiente para la próxima sincronización, como el progreso.
  if (cliente && !id.startsWith('local:')) progreso.sincronizar(cliente).catch(() => null);
}

$('form-nota-libro').addEventListener('submit', (evento) => {
  evento.preventDefault();
  guardarNotaLibro($('texto-nota-libro').value);
});
$('btn-borrar-nota-libro').addEventListener('click', () => guardarNotaLibro(''));
$('btn-cancelar-nota-libro').addEventListener('click', cerrarNotaLibro);
$('dialogo-nota-libro').addEventListener('click', (evento) => {
  if (evento.target === $('dialogo-nota-libro')) cerrarNotaLibro();
});

function normalizarBusqueda(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

// \u2500\u2500 Aviso emergente con el resumen del libro \u2500\u2500
// Muchos libros traen una sinopsis en sus metadatos que no cabe en la ficha:
// se ense\u00f1a al dejar el rat\u00f3n encima (o al llegar con el teclado), tanto en
// \u00abContinuar leyendo\u00bb como en las dos bibliotecas. En pantalla t\u00e1ctil no hay
// \u00abencima\u00bb, as\u00ed que all\u00ed no aparece y no roba el toque que abre el libro.
const RETRASO_TIP = 400; // ms; lo justo para no dispararlo de paso
let tipResumen = null;
let temporizadorTip = null;
let fichaConTip = null;

function ocultarTipResumen() {
  clearTimeout(temporizadorTip);
  fichaConTip = null;
  tipResumen?.classList.add('oculto');
}

function pintarTipResumen(ficha) {
  if (!tipResumen) {
    tipResumen = document.createElement('div');
    tipResumen.className = 'tip-resumen oculto';
    tipResumen.setAttribute('role', 'tooltip');
    tipResumen.innerHTML = '<strong class="titulo-tip"></strong><span class="texto-tip"></span>' +
      '<span class="nota-tip"><span class="etiqueta-nota-tip"></span><span class="texto-nota-tip"></span></span>';
    document.body.append(tipResumen);
  }
  tipResumen.querySelector('.titulo-tip').textContent = ficha.querySelector('.nombre')?.textContent ?? '';
  const texto = tipResumen.querySelector('.texto-tip');
  texto.textContent = ficha.dataset.resumen ?? '';
  texto.classList.toggle('oculto', !ficha.dataset.resumen);
  // La nota propia va debajo del resumen del editor y se distingue de él: son
  // dos voces distintas y conviene no confundirlas.
  const nota = tipResumen.querySelector('.nota-tip');
  // Solo las carpetas llevan `idNota`: los libros se identifican por el suyo.
  nota.querySelector('.etiqueta-nota-tip').textContent =
    t(ficha.dataset.idNota ? 'folderNote' : 'bookNote');
  nota.querySelector('.texto-nota-tip').textContent = ficha.dataset.nota ?? '';
  nota.classList.toggle('oculto', !ficha.dataset.nota);
  tipResumen.classList.remove('oculto');

  // Al lado de la ficha, del lado donde quepa, y siempre dentro de la ventana.
  const margen = 8;
  const hueco = ficha.getBoundingClientRect();
  const { offsetWidth: ancho, offsetHeight: alto } = tipResumen;
  let izquierda = hueco.right + margen;
  if (izquierda + ancho > window.innerWidth - margen) izquierda = hueco.left - margen - ancho;
  if (izquierda < margen) {
    izquierda = Math.min(Math.max(margen, hueco.left), window.innerWidth - ancho - margen);
  }
  const arriba = Math.min(hueco.top, window.innerHeight - alto - margen);
  tipResumen.style.left = `${Math.round(Math.max(margen, izquierda))}px`;
  tipResumen.style.top = `${Math.round(Math.max(margen, arriba))}px`;
}

function prepararTipResumen() {
  const fichaBajo = (destino) => destino
    ?.closest?.('li[data-id-libro][data-resumen] .libro, li[data-nota] .libro')
    ?.parentElement;
  const atender = (ficha) => {
    if (ficha === fichaConTip) return;
    clearTimeout(temporizadorTip);
    if (!ficha) return ocultarTipResumen();
    fichaConTip = ficha;
    tipResumen?.classList.add('oculto');
    temporizadorTip = setTimeout(() => pintarTipResumen(ficha), RETRASO_TIP);
  };

  document.addEventListener('pointerover', (evento) => {
    if (evento.pointerType && evento.pointerType !== 'mouse') return;
    atender(fichaBajo(evento.target));
  });
  document.addEventListener('focusin', (evento) => atender(fichaBajo(evento.target)));
  document.addEventListener('focusout', ocultarTipResumen);
  // Cualquier cosa que mueva la ficha de sitio o abra otra vista lo retira.
  document.addEventListener('pointerdown', ocultarTipResumen);
  document.addEventListener('keydown', ocultarTipResumen);
  window.addEventListener('resize', ocultarTipResumen);
  // Al desplazar la página el aviso acompaña a su ficha; si la lista se ha
  // repintado entretanto y la ficha ya no existe, se retira.
  window.addEventListener('scroll', () => {
    if (!fichaConTip || tipResumen?.classList.contains('oculto')) return;
    if (fichaConTip.isConnected) pintarTipResumen(fichaConTip);
    else ocultarTipResumen();
  }, { capture: true, passive: true });
}
prepararTipResumen();

async function cargarMetadatosEnFila(fila, id, tituloArchivo = '') {
  const metadatos = await almacen.obtenerMetadatos(id).catch(() => null);
  if (!metadatos) return;
  const valores = Object.values(metadatos).filter(Boolean);
  fila.dataset.busqueda = normalizarBusqueda(`${tituloArchivo} ${fila.dataset.busqueda} ${valores.join(' ')}`);
  // El nombre que puso el usuario manda: los metadatos solo rellenan el título
  // cuando no hay uno personalizado (aunque su autor y su texto sí se indexan).
  if (metadatos.titulo?.trim() && fila.dataset.tituloPersonalizado !== 'true') {
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
  // El resumen no cabe en la ficha: se guarda aquí y sale al pasar el ratón.
  const resumen = resumenDeMetadatos(metadatos);
  if (resumen) {
    fila.dataset.resumen = resumen;
    // El aviso ya enseña el título entero: dejar además el «title» del nombre
    // sacaría dos globos, el del navegador encima del nuestro.
    fila.querySelector('.nombre')?.removeAttribute('title');
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
      } else if (orden === 'calificacion') {
        const diferencia = calificacion.compararPorCalificacion(
          a.dataset.calificacion, b.dataset.calificacion,
        );
        if (diferencia) return diferencia;
      }
      return comparadorTexto.compare(a.dataset.titulo, b.dataset.titulo);
    });
    for (const fila of filas) lista.append(fila);
  }

  let visibles = 0;
  const filas = document.querySelectorAll(
    '#lista-libros > li, #lista-locales > li, #lista-carpetas > li, #lista-carpetas-locales > li');
  for (const fila of filas) {
    const coincideTexto = !consulta || fila.dataset.busqueda?.includes(consulta) ||
      fila.dataset.notaBusqueda?.includes(consulta);
    const coincideEstado = !fila.dataset.idLibro || filtro === 'todos' ||
      (calificacion.esFiltroDeCalificacion(filtro)
        ? calificacion.pasaFiltro(filtro, fila.dataset.calificacion)
        : fila.dataset.estadoLectura === filtro);
    const coincide = coincideTexto && coincideEstado;
    fila.classList.toggle('oculto', !coincide);
    if (coincide && fila.dataset.idLibro) visibles += 1;
  }
  const estado = $('estado-filtro-biblioteca');
  estado.textContent = (consulta || filtro !== 'todos') && !visibles
    // Sin nada a la vista, decir «no hay resultados» mientras aún se están
    // recorriendo las carpetas de la nube sería adelantarse.
    ? t(promesaIndiceNube ? 'searchingFolders' : 'noLibraryResults')
    : '';
  estado.classList.toggle('oculto', !estado.textContent);
  actualizarConteosSeccion();
}

// Lo que hay a la vista en cada sección, contado sobre la propia lista para que
// siga a la búsqueda y al filtro. Va en la cabecera porque es lo único que se
// ve de una sección plegada. Sin nada que contar no se escribe «vacía»: la
// nube empieza vacía mientras carga y sería una respuesta falsa.
function actualizarConteosSeccion() {
  for (const [destino, carpetas, libros] of [
    ['conteo-nube', 'lista-carpetas', 'lista-libros'],
    ['conteo-local', 'lista-carpetas-locales', 'lista-locales'],
  ]) {
    const partes = [];
    for (const [lista, unaClave, variasClave] of [
      [carpetas, 'sectionFoldersOne', 'sectionFolders'],
      [libros, 'sectionBooksOne', 'sectionBooks'],
    ]) {
      const n = $(lista).querySelectorAll(':scope > li:not(.oculto)').length;
      if (n) partes.push(n === 1 ? t(unaClave) : t(variasClave, { count: n }));
    }
    $(destino).textContent = partes.join(' · ');
  }
}

let buscandoEnBiblioteca = false;
$('buscar-biblioteca').addEventListener('input', () => {
  const hayConsulta = Boolean($('buscar-biblioteca').value.trim());
  if (hayConsulta !== buscandoEnBiblioteca) {
    buscandoEnBiblioteca = hayConsulta;
    // Entrar o salir de una búsqueda cambia el alcance de las dos listas: la
    // local pasa a mirar toda la biblioteca y la de la nube, a recorrer sus
    // carpetas.
    cargarLibrosLocales();
    pintarResultadosEnCarpetasNube();
  }
  actualizarBotonLimpiarBusqueda();
  aplicarOrganizacionBiblioteca();
});

// La «x» solo tiene sentido con algo escrito; en un campo vacío sería un
// botón que no hace nada.
function actualizarBotonLimpiarBusqueda() {
  $('btn-limpiar-busqueda').classList.toggle('oculto', !$('buscar-biblioteca').value);
}

$('btn-limpiar-busqueda').addEventListener('click', () => {
  $('buscar-biblioteca').value = '';
  // El mismo camino que al teclear, para no repetir aquí lo que ya hace el
  // buscador al quedarse vacío.
  $('buscar-biblioteca').dispatchEvent(new Event('input'));
  $('buscar-biblioteca').focus();
});
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
  for (const lista of [$('lista-libros'), $('lista-locales'),
    $('lista-carpetas'), $('lista-carpetas-locales')]) {
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

// Cambia el nombre visible del libro (no el archivo: así conserva su posición
// de lectura). Vacío restablece el nombre del archivo o de los metadatos.
async function renombrarLibro(id) {
  const fila = document.querySelector(`[data-id-libro="${CSS.escape(id)}"]`);
  const actual = fila?.querySelector('.nombre')?.textContent?.trim() ?? '';
  const respuesta = prompt(t('renameBookPrompt'), actual);
  if (respuesta === null) return;
  const nuevo = respuesta.trim();
  if (nuevo === actual) return;
  progreso.guardarTitulo(id, nuevo);
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
  actualizarBotonLimpiarBusqueda();
}

// ── Arrastrar un libro de la nube hasta una carpeta para moverlo ──

const TIPO_ARRASTRE_LIBRO = 'application/x-pagekeeper-libro';       // libro de la nube: mover
const TIPO_ARRASTRE_LOCAL = 'application/x-pagekeeper-libro-local'; // libro local: subir (copia)
const TIPO_ARRASTRE_CARPETA = 'application/x-pagekeeper-carpeta-local'; // carpeta local: mover
const TIPO_ARRASTRE_CARPETA_NUBE = 'application/x-pagekeeper-carpeta-nube'; // carpeta de la nube: mover

function tiposArrastreLibro(evento) {
  const tipos = Array.from(evento.dataTransfer?.types ?? []);
  return {
    nube: tipos.includes(TIPO_ARRASTRE_LIBRO),
    local: tipos.includes(TIPO_ARRASTRE_LOCAL),
    carpeta: tipos.includes(TIPO_ARRASTRE_CARPETA),
    carpetaNube: tipos.includes(TIPO_ARRASTRE_CARPETA_NUBE),
  };
}

// Ruta de la carpeta de la nube que se está arrastrando. Va aparte del
// dataTransfer porque durante el «dragover» los datos no se pueden leer y aquí
// hacen falta para saber si el destino es válido.
let carpetaNubeArrastrada = '';

// Lee el libro local serializado en un arrastre ({ id, nombre }).
function libroLocalArrastrado(evento) {
  try {
    const libro = JSON.parse(evento.dataTransfer.getData(TIPO_ARRASTRE_LOCAL));
    return libro?.id && libro?.nombre ? libro : null;
  } catch {
    return null;
  }
}

// Convierte un elemento en destino donde soltar algo arrastrado: un libro de la
// nube o una de sus carpetas se mueven a la carpeta indicada; un libro local se
// sube (copia).
function hacerDestinoDeLibro(elemento, rutaDestino) {
  // Una carpeta no se puede soltar sobre sí misma ni sobre lo que contiene:
  // ahí ni se resalta el destino ni se acepta la caída.
  const admiteCarpeta = (evento) => tiposArrastreLibro(evento).carpetaNube &&
    almacen.movimientoDeCarpetaValido(carpetaNubeArrastrada, rutaDestino);
  elemento.addEventListener('dragover', (evento) => {
    const { nube, local } = tiposArrastreLibro(evento);
    if (!nube && !local && !admiteCarpeta(evento)) return;
    evento.preventDefault();
    evento.stopPropagation();
    evento.dataTransfer.dropEffect = local ? 'copy' : 'move';
    elemento.classList.add('destino-mover');
  });
  elemento.addEventListener('dragleave', () => elemento.classList.remove('destino-mover'));
  elemento.addEventListener('drop', (evento) => {
    const { nube, local } = tiposArrastreLibro(evento);
    if (!nube && !local && !admiteCarpeta(evento)) return;
    evento.preventDefault();
    evento.stopPropagation();
    elemento.classList.remove('destino-mover');
    if (nube) {
      const id = evento.dataTransfer.getData(TIPO_ARRASTRE_LIBRO);
      if (id) moverLibroA(id, rutaDestino);
    } else if (local) {
      const libro = libroLocalArrastrado(evento);
      if (libro) subirLibroLocalANube(libro, rutaDestino);
    } else {
      moverCarpetaRemotaA(carpetaNubeArrastrada, rutaDestino);
    }
  });
}

// Pinta una ruta como migas: la raíz y cada carpeta intermedia son botones
// que navegan al pulsar; la carpeta actual se muestra sin enlace. Con
// `admiteLibros`, cada tramo acepta también libros arrastrados para moverlos.
function pintarMigas(nav, ruta, alNavegar, admiteLibros = false, raiz = t('cloudRoot')) {
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
      boton.dataset.rutaMiga = destino;
      boton.addEventListener('click', () => alNavegar(destino));
      if (admiteLibros) hacerDestinoDeLibro(boton, destino);
      nav.append(boton);
    }
  };
  anadir(raiz, '', segmentos.length === 0);
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
    if (destino === rutaNube) return;
    rutaNube = destino;
    registrarCarpetas();
    cargarBiblioteca();
  }, true);
  pintarNotaCarpetaAbierta('nube');
}

// La nota de la carpeta en la que se acaba de entrar. Describe lo que guarda,
// así que dentro es donde más falta hace: en la raíz no hay carpeta que
// describir y el bloque no sale. Sin nota escrita se dice, para que el botón
// de al lado se entienda como la invitación a escribirla.
function pintarNotaCarpetaAbierta(ambito) {
  const ruta = ambito === 'nube' ? rutaNube : rutaLocal;
  const seccion = $(ambito === 'nube' ? 'nota-carpeta-nube' : 'nota-carpeta-local');
  seccion.classList.toggle('oculto', !ruta);
  if (!ruta) return;
  const id = idNotaCarpeta(ruta, ambito);
  const nota = progreso.notaDe(id);
  const texto = seccion.querySelector('.texto-nota-carpeta');
  texto.textContent = nota ?? t('noFolderNote');
  texto.classList.toggle('sin-nota', !nota);
  seccion.querySelector('.btn-editar-nota-carpeta').onclick =
    () => abrirNotaLibro(id, ruta.split('/').pop(), true);
}

// Texto del contador de una carpeta según cuántos elementos contiene.
function textoConteoCarpeta(n) {
  if (n === 0) return t('folderEmpty');
  if (n === 1) return t('folderItemsOne');
  return t('folderItems', { count: n });
}

// Rellena (o vacía) el contador de una fila de carpeta. Con `n` nulo lo deja
// en blanco, para cuando aún no se sabe el número.
function ponerConteoCarpeta(fila, n) {
  const conteo = fila.querySelector('.conteo-carpeta');
  if (!conteo) return;
  conteo.textContent = Number.isFinite(n) ? textoConteoCarpeta(n) : '';
}

function crearFilaCarpeta(nombre, soloLectura = false, conteo = null) {
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
    <span class="datos"><span class="cabecera-libro"><span class="nombre"></span><span class="nota-libro oculto"></span></span><span class="conteo-carpeta"></span></span>`;
  boton.querySelector('.nombre').textContent = nombre;
  ponerConteoCarpeta(boton, conteo);
  const ruta = rutaNubeDe(nombre);
  const idNota = idNotaCarpeta(ruta, 'nube');
  elemento.dataset.idNota = idNota;
  const abrir = () => {
    rutaNube = ruta;
    registrarCarpetas();
    cargarBiblioteca();
  };
  boton.addEventListener('click', abrir);
  boton.addEventListener('keydown', (evento) => {
    if (evento.target !== boton) return;
    if (evento.key !== 'Enter' && evento.key !== ' ') return;
    evento.preventDefault();
    abrir();
  });
  hacerDestinoDeLibro(boton, ruta);

  if (!soloLectura) {
    boton.draggable = true;
    boton.addEventListener('dragstart', (evento) => {
      carpetaNubeArrastrada = ruta;
      evento.dataTransfer.setData(TIPO_ARRASTRE_CARPETA_NUBE, ruta);
      evento.dataTransfer.effectAllowed = 'move';
    });
    boton.addEventListener('dragend', () => { carpetaNubeArrastrada = ''; });
    boton.append(crearBotonMenu(boton, () => [
      {
        icono: 'notebook-pen',
        etiqueta: t('actionFolderNote'),
        alPulsar: () => abrirNotaLibro(idNota, nombre, true),
      },
      {
        icono: 'folder-input',
        etiqueta: t('actionMoveFolder'),
        alPulsar: () => abrirDialogoMover({ id: ruta, nombre }, 'carpeta-nube'),
      },
      {
        icono: 'pencil',
        etiqueta: t('actionRenameFolder'),
        alPulsar: () => renombrarCarpetaRemota(nombre),
      },
      accionDescargarCarpeta(() => descargarCarpetaRemota(nombre)),
      {
        icono: 'trash-2',
        etiqueta: t('actionDeleteFolder'),
        alPulsar: () => borrarCarpetaRemota(nombre),
        peligro: true,
      },
    ]));
  }
  elemento.append(boton);
  aplicarNotaEnFila(elemento, idNota);
  return elemento;
}

function pintarListaRemota(carpetas, libros, copias = [], { soloCopias = false } = {}) {
  nubeSoloCopias = soloCopias;
  pintarRutaNube();
  const version = ++versionConteosNube; // cancela conteos de una lista anterior
  const lista = $('lista-libros');
  // Las carpetas van en su propia lista, encima de la de libros: en la
  // cuadrícula sus fichas son bajas y, mezcladas con los libros, la fila
  // acababa midiendo lo que la portada más alta y dejando el hueco debajo.
  const listaCarpetas = $('lista-carpetas');
  lista.replaceChildren();
  listaCarpetas.replaceChildren();
  const copiasPorId = new Map(copias.map((copia) => [copia.id, copia]));
  const filasPendientes = [];
  for (const carpeta of carpetas) {
    // Sin conexión el número sale de las copias que ya tenemos; con conexión
    // hay que preguntarle al servidor, así que se rellena después sin bloquear.
    const conteo = soloCopias
      ? contarCopiasEn(copias, rutaNube ? `${rutaNube}/${carpeta.nombre}` : carpeta.nombre)
      : null;
    const fila = crearFilaCarpeta(carpeta.nombre, soloCopias, conteo);
    listaCarpetas.append(fila);
    if (!soloCopias) filasPendientes.push({ fila, nombre: carpeta.nombre });
  }
  if (filasPendientes.length && cliente) rellenarConteosNube(rutaNube, filasPendientes, version);
  for (const libro of libros) {
    lista.append(crearFilaLibroRemoto(libro, copiasPorId.get(idRemoto(libro.nombre)), soloCopias));
  }
  aplicarOrganizacionBiblioteca();
  actualizarVisibilidadBuscadorBiblioteca();
  pintarResultadosEnCarpetasNube();
}

// La fila de un libro de la nube. `libro.carpeta` solo viene en los resultados
// que la búsqueda saca de una subcarpeta; en la carpeta abierta la ruta la
// pone `idRemoto`.
function crearFilaLibroRemoto(libro, copia, soloCopias = false) {
  const carpeta = libro.carpeta ?? '';
  const id = carpeta ? `${carpeta}/${libro.nombre}` : idRemoto(libro.nombre);
  return crearFilaLibro({
    id,
    carpeta,
    titulo: libro.nombre.replace(/\.(pdf|epub)$/i, ''),
    tamano: libro.tamano,
    formato: formatoDe(libro.nombre),
    sinTexto: formatoDe(libro.nombre) === 'pdf' && pdfSinTextoConocido({
      tipo: 'webdav', id, tamano: libro.tamano,
    }),
    alAbrir: () => abrirLibroRemoto(id, libro),
    ...accionesLibroRemoto(id, libro, copia, soloCopias),
  });
}

// ── Buscar dentro de las carpetas de la nube ──
// La sección local ya busca en toda la biblioteca; la de la nube solo veía la
// carpeta abierta, así que meter un libro en una carpeta equivalía a
// esconderlo del buscador. Aquí se recorren las subcarpetas y sus libros se
// añaden a la lista mientras dure la búsqueda.
//
// El recorrido cuesta una petición por carpeta, así que se hace una sola vez y
// se guarda: no se puede repetir a cada tecla. `olvidarIndiceNube()` lo tira
// cuando la biblioteca cambia.
let indiceNube = null;        // { ruta, libros } ya recorrido
let promesaIndiceNube = null; // recorrido en curso, para no lanzar dos
let versionBusquedaNube = 0;
let nubeSoloCopias = false;   // la sección se está pintando sin conexión

// Sin conexión no hay carpetas que recorrer, pero sí lo que se guardó para
// leer sin red: su identificador es la ruta completa dentro de la nube, así
// que las copias que cuelgan de una subcarpeta se reconocen por ahí. Buscar
// desde la raíz sigue encontrándolas, que es de lo que se trata.
function librosDeCopiasEnSubcarpetas(copias) {
  const prefijo = rutaNube ? `${rutaNube}/` : '';
  const encontrados = [];
  for (const copia of copias) {
    if (!copia.id.startsWith(prefijo)) continue;
    const resto = copia.id.slice(prefijo.length);
    if (!resto.includes('/')) continue; // está en la carpeta abierta, ya pintado
    const corte = resto.lastIndexOf('/');
    encontrados.push({
      nombre: resto.slice(corte + 1),
      carpeta: prefijo + resto.slice(0, corte),
      tamano: copia.tamano,
      etag: copia.etag,
      modificado: copia.modificado,
    });
  }
  return encontrados;
}

function olvidarIndiceNube() {
  indiceNube = null;
  promesaIndiceNube = null;
}

async function recorrerCarpetasNube(rutaBase) {
  const encontrados = [];
  const pendientes = [];
  const { carpetas } = await cliente.listar(rutaBase);
  for (const carpeta of carpetas) {
    pendientes.push(rutaBase ? `${rutaBase}/${carpeta.nombre}` : carpeta.nombre);
  }
  while (pendientes.length) {
    const ruta = pendientes.shift();
    // Una carpeta que falle (permisos, borrada a media búsqueda) no puede
    // tumbar el resto del recorrido.
    let contenido;
    try { contenido = await cliente.listar(ruta); } catch { continue; }
    for (const carpeta of contenido.carpetas) pendientes.push(`${ruta}/${carpeta.nombre}`);
    for (const libro of contenido.libros) encontrados.push({ ...libro, carpeta: ruta });
  }
  return encontrados;
}

function librosEnCarpetasNube() {
  if (indiceNube && indiceNube.ruta === rutaNube) return Promise.resolve(indiceNube.libros);
  if (!promesaIndiceNube) {
    const ruta = rutaNube;
    promesaIndiceNube = recorrerCarpetasNube(ruta)
      .then((libros) => { indiceNube = { ruta, libros }; return libros; })
      .catch(() => [])   // sin conexión no hay nada que recorrer
      .finally(() => { promesaIndiceNube = null; });
  }
  return promesaIndiceNube;
}

async function pintarResultadosEnCarpetasNube() {
  const lista = $('lista-libros');
  for (const fila of lista.querySelectorAll('li[data-en-carpeta]')) fila.remove();
  const version = ++versionBusquedaNube;
  if (!cliente || !buscandoEnBiblioteca || $('zona-remota').classList.contains('oculto')) {
    actualizarConteosSeccion();
    return;
  }
  const copias = await almacen.listarCopiasRemotas(cliente.base).catch(() => []);
  const libros = nubeSoloCopias
    ? librosDeCopiasEnSubcarpetas(copias)
    : await librosEnCarpetasNube();
  // Mientras se recorría la nube pueden haber cambiado la consulta o la
  // carpeta: lo que llega tarde ya no vale.
  if (version !== versionBusquedaNube) return;
  const copiasPorId = new Map(copias.map((copia) => [copia.id, copia]));
  for (const libro of libros) {
    const fila = crearFilaLibroRemoto(
      libro, copiasPorId.get(`${libro.carpeta}/${libro.nombre}`), nubeSoloCopias);
    fila.dataset.enCarpeta = libro.carpeta;
    lista.append(fila);
  }
  aplicarOrganizacionBiblioteca();
}

// Cuántos elementos (subcarpetas + libros) cuelgan directamente de `ruta`
// según las copias sin conexión disponibles.
let versionConteosNube = 0;
function contarCopiasEn(copias, ruta) {
  const { carpetas, libros } = almacen.bibliotecaDeCopias(copias, ruta);
  return carpetas.length + libros.length;
}

// Pregunta al servidor cuántos elementos tiene cada carpeta y actualiza su
// contador. Va de una en una para no saturar la nube; si la lista se vuelve a
// pintar o la fila desaparece, se abandona sin tocar nada.
async function rellenarConteosNube(rutaBase, filas, version) {
  for (const { fila, nombre } of filas) {
    if (version !== versionConteosNube) return;
    let conteo = null;
    try {
      const subruta = rutaBase ? `${rutaBase}/${nombre}` : nombre;
      const { carpetas, libros } = await cliente.listar(subruta);
      conteo = carpetas.length + libros.length;
    } catch { /* si no se puede listar, la carpeta se queda sin contador */ }
    if (version !== versionConteosNube || !fila.isConnected) return;
    ponerConteoCarpeta(fila, conteo);
  }
}

// ───────────────────────── Gestión de carpetas ─────────────────────────

// Ruta completa de una carpeta que cuelga de la que está abierta en la nube.
function rutaNubeDe(nombre) {
  return rutaNube ? `${rutaNube}/${nombre}` : nombre;
}

function pedirNombreCarpeta() {
  const respuesta = prompt(t('folderNamePrompt'));
  if (respuesta === null) return null;
  const nombre = respuesta.trim();
  if (!almacen.nombreCarpetaValido(nombre)) {
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
    await cliente.crearCarpeta(rutaNubeDe(nombre));
    avisar(t('folderCreated', { name: nombre }));
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
}

$('btn-carpeta-nueva').addEventListener('click', crearCarpetaRemota);

// Renombrar y mover son la misma operación en la nube: cambiar la ruta de la
// carpeta. Y como allí el id de cada libro es su ruta, eso cambia también la de
// todo lo que contiene: en el servidor basta un MOVE (que se lleva las
// subcarpetas y los JSON laterales de anotaciones), pero en este dispositivo hay
// que reetiquetar el progreso, las notas, las anotaciones y la caché.
async function trasladarCarpetaRemota(origen, destino) {
  if (await cliente.existe(destino)) {
    avisar(t('folderExists'));
    return false;
  }
  // Con el progreso y las anotaciones al día, el traslado de los ids es un
  // renombrado local: lo que quede sin subir se perdería al cambiar la ruta.
  await progreso.sincronizar(cliente).catch(() => null);
  await anotaciones.sincronizarPendientes(cliente).catch(() => null);
  await cliente.mover(origen, destino);
  await progreso.renombrarPorPrefijo(`${origen}/`, `${destino}/`, cliente).catch(() => null);
  // Las notas de la carpeta y de sus subcarpetas describen lo que guardan, así
  // que viajan con ellas.
  progreso.renombrar(idNotaCarpeta(origen, 'nube'), idNotaCarpeta(destino, 'nube'));
  await progreso.olvidar(idNotaCarpeta(origen, 'nube'), cliente).catch(() => null);
  await progreso.renombrarPorPrefijo(
    `${idNotaCarpeta(origen, 'nube')}/`, `${idNotaCarpeta(destino, 'nube')}/`, cliente,
  ).catch(() => null);
  await anotaciones.moverPorPrefijo(cliente.base, `${origen}/`, `${destino}/`).catch(() => null);
  await almacen.moverCacheRemotaPorPrefijo(cliente.base, `${origen}/`, `${destino}/`)
    .catch(() => null);
  return true;
}

async function renombrarCarpetaRemota(nombre) {
  if (!cliente) return;
  const respuesta = prompt(t('folderRenamePrompt'), nombre);
  if (respuesta === null) return;
  const nuevo = respuesta.trim();
  if (nuevo === nombre) return;
  if (!almacen.nombreCarpetaValido(nuevo)) {
    avisar(t('invalidFolderName'));
    return;
  }
  mostrarCarga(t('renamingFolder', { name: nombre }));
  try {
    const hecho = await trasladarCarpetaRemota(rutaNubeDe(nombre), rutaNubeDe(nuevo));
    if (hecho) avisar(t('folderRenamed'));
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
    pintarContinuarLeyendo();
  }
}

// Lleva una carpeta de la nube (con todo lo que contiene) dentro de otra.
async function moverCarpetaRemotaA(origen, rutaDestino) {
  if (!cliente || !origen) return;
  if (!almacen.movimientoDeCarpetaValido(origen, rutaDestino)) return;
  const nombre = origen.split('/').pop();
  const destino = rutaDestino ? `${rutaDestino}/${nombre}` : nombre;
  mostrarCarga(t('moving', { title: nombre }));
  try {
    if (await trasladarCarpetaRemota(origen, destino)) {
      avisar(t('folderMoved', { name: nombre }));
      // Si estábamos dentro de la carpeta movida, se sigue donde estaba.
      if (rutaNube === origen || rutaNube.startsWith(`${origen}/`)) {
        rutaNube = destino + rutaNube.slice(origen.length);
        registrarCarpetas();
      }
    }
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
    pintarContinuarLeyendo();
  }
}

async function borrarCarpetaRemota(nombre) {
  if (!cliente) return;
  if (!confirm(t('deleteFolderConfirm', { name: nombre }))) return;
  const ruta = rutaNubeDe(nombre);
  mostrarCarga(t('deleting', { title: nombre }));
  try {
    await cliente.borrar(ruta);
    // Limpia el progreso de todos los libros que colgaban de la carpeta, y la
    // nota de la propia carpeta, que ya no describe nada.
    await progreso.olvidarPorPrefijo(ruta + '/', cliente).catch(() => null);
    await progreso.olvidar(idNotaCarpeta(ruta, 'nube'), cliente).catch(() => null);
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

// ────────────── Carpetas de la biblioteca del dispositivo ──────────────
//
// Mismo comportamiento que en la nube, pero mucho más barato: aquí la carpeta
// es un campo del registro, no parte del id, así que mover un libro no arrastra
// su progreso, sus marcadores ni sus anotaciones.

function rutaLocalDe(nombre) {
  return rutaLocal ? `${rutaLocal}/${nombre}` : nombre;
}

// Igual, pero admitiendo que no haya subcarpeta: entonces el destino es la
// carpeta abierta, sin barra suelta al final.
function destinoLocal(subcarpeta) {
  return almacen.normalizarCarpeta(rutaLocalDe(subcarpeta));
}

function pintarRutaLocal() {
  const nav = $('ruta-carpeta-local');
  nav.classList.toggle('oculto', !rutaLocal);
  pintarMigas(nav, rutaLocal, navegarCarpetaLocal, false, t('deviceRoot'));
  // Cada tramo de la ruta acepta libros locales: soltarlos ahí los mueve.
  for (const boton of nav.querySelectorAll('.miga')) {
    hacerDestinoDeLibroLocal(boton, boton.dataset.rutaMiga ?? '');
  }
  pintarNotaCarpetaAbierta('local');
}

// Convierte un elemento en destino de la biblioteca del dispositivo: un libro
// local se mueve a `rutaDestino`, uno de la nube se descarga ahí y una carpeta
// local se lleva dentro con todo su contenido.
function hacerDestinoDeLibroLocal(elemento, rutaDestino) {
  // Una carpeta no se puede soltar sobre sí misma ni sobre lo que contiene:
  // ahí ni se resalta el destino ni se acepta la caída.
  const admiteCarpeta = (evento) => tiposArrastreLibro(evento).carpeta &&
    almacen.movimientoDeCarpetaValido(carpetaArrastrada, rutaDestino);
  elemento.addEventListener('dragover', (evento) => {
    const { nube, local } = tiposArrastreLibro(evento);
    if (!nube && !local && !admiteCarpeta(evento)) return;
    evento.preventDefault();
    evento.stopPropagation();
    evento.dataTransfer.dropEffect = nube ? 'copy' : 'move';
    elemento.classList.add('destino-mover');
  });
  elemento.addEventListener('dragleave', () => elemento.classList.remove('destino-mover'));
  elemento.addEventListener('drop', (evento) => {
    const { nube, local } = tiposArrastreLibro(evento);
    if (!nube && !local && !admiteCarpeta(evento)) return;
    evento.preventDefault();
    evento.stopPropagation();
    elemento.classList.remove('destino-mover');
    if (nube) {
      const id = evento.dataTransfer.getData(TIPO_ARRASTRE_LIBRO);
      if (id) guardarLibroRemotoEnDispositivo(id, rutaDestino);
    } else if (local) {
      const libro = libroLocalArrastrado(evento);
      if (libro) moverLibroLocalA(libro, rutaDestino);
    } else {
      moverCarpetaLocalA(carpetaArrastrada, rutaDestino);
    }
  });
}

// Ruta de la carpeta que se está arrastrando. Va aparte del dataTransfer
// porque durante el «dragover» los datos no se pueden leer y aquí hacen falta
// para saber si el destino es válido.
let carpetaArrastrada = '';

function crearFilaCarpetaLocal(nombre, conteo = null) {
  const elemento = document.createElement('li');
  elemento.dataset.busqueda = normalizarBusqueda(nombre);
  // Un div con role="button" y no un <button>, para poder alojar dentro el
  // botón «⋯» del menú: un botón anidado en otro no es HTML válido.
  const boton = document.createElement('div');
  boton.className = 'libro carpeta';
  boton.setAttribute('role', 'button');
  boton.tabIndex = 0;
  boton.title = t('openFolder', { name: nombre });
  etiquetarPorTitulo(boton);
  boton.innerHTML = `
    <span class="portada portada-carpeta">${icono('folder')}</span>
    <span class="datos"><span class="cabecera-libro"><span class="nombre"></span><span class="nota-libro oculto"></span></span><span class="conteo-carpeta"></span></span>`;
  boton.querySelector('.nombre').textContent = nombre;
  ponerConteoCarpeta(boton, conteo);
  const idNota = idNotaCarpeta(rutaLocalDe(nombre), 'local');
  elemento.dataset.idNota = idNota;
  const abrir = () => navegarCarpetaLocal(rutaLocalDe(nombre));
  boton.addEventListener('click', abrir);
  boton.addEventListener('keydown', (evento) => {
    if (evento.target !== boton) return;
    if (evento.key !== 'Enter' && evento.key !== ' ') return;
    evento.preventDefault();
    abrir();
  });
  hacerDestinoDeLibroLocal(boton, rutaLocalDe(nombre));
  boton.draggable = true;
  boton.addEventListener('dragstart', (evento) => {
    carpetaArrastrada = rutaLocalDe(nombre);
    evento.dataTransfer.setData(TIPO_ARRASTRE_CARPETA, carpetaArrastrada);
    evento.dataTransfer.effectAllowed = 'move';
  });
  boton.addEventListener('dragend', () => { carpetaArrastrada = ''; });
  boton.append(crearBotonMenu(boton, () => [
    {
      icono: 'notebook-pen',
      etiqueta: t('actionFolderNote'),
      alPulsar: () => abrirNotaLibro(idNota, nombre, true),
    },
    {
      icono: 'folder-input',
      etiqueta: t('actionMoveFolder'),
      alPulsar: () => abrirDialogoMover(
        { id: rutaLocalDe(nombre), nombre }, 'carpeta-local',
      ),
    },
    {
      icono: 'pencil',
      etiqueta: t('actionRenameFolder'),
      alPulsar: () => renombrarCarpetaLocal(nombre),
    },
    accionDescargarCarpeta(() => descargarCarpetaLocal(nombre)),
    {
      icono: 'trash-2',
      etiqueta: t('actionDeleteFolder'),
      alPulsar: () => borrarCarpetaLocal(nombre),
      peligro: true,
    },
  ]));
  elemento.append(boton);
  aplicarNotaEnFila(elemento, idNota);
  return elemento;
}

// Comprueba que no haya ya una carpeta con ese nombre en el mismo sitio.
async function carpetaLocalOcupada(ruta) {
  const carpetas = await almacen.listarCarpetasLocales().catch(() => []);
  return carpetas.includes(ruta);
}

async function crearCarpetaLocalNueva() {
  const nombre = pedirNombreCarpeta();
  if (!nombre) return;
  const ruta = rutaLocalDe(nombre);
  if (await carpetaLocalOcupada(ruta)) {
    avisar(t('folderExists'));
    return;
  }
  try {
    await almacen.crearCarpetaLocal(ruta);
    avisar(t('folderCreated', { name: nombre }));
  } catch (error) {
    avisar(explicarError(error), 6000);
  }
  await cargarLibrosLocales();
}

$('btn-carpeta-nueva-local').addEventListener('click', crearCarpetaLocalNueva);

async function renombrarCarpetaLocal(nombre) {
  const respuesta = prompt(t('folderRenamePrompt'), nombre);
  if (respuesta === null) return;
  const nuevo = respuesta.trim();
  if (nuevo === nombre) return;
  if (!almacen.nombreCarpetaValido(nuevo)) {
    avisar(t('invalidFolderName'));
    return;
  }
  const destino = rutaLocalDe(nuevo);
  if (await carpetaLocalOcupada(destino)) {
    avisar(t('folderExists'));
    return;
  }
  try {
    await almacen.renombrarCarpetaLocal(rutaLocalDe(nombre), destino);
    // La nota describe la carpeta, así que viaja con ella; las de sus
    // subcarpetas, igual. El progreso de los libros no se toca: aquí el id no
    // es la ruta.
    progreso.renombrar(idNotaCarpeta(rutaLocalDe(nombre), 'local'), idNotaCarpeta(destino, 'local'));
    await progreso.renombrarPorPrefijo(
      `${idNotaCarpeta(rutaLocalDe(nombre), 'local')}/`, `${idNotaCarpeta(destino, 'local')}/`,
    ).catch(() => null);
    avisar(t('folderRenamed'));
  } catch (error) {
    avisar(explicarError(error), 6000);
  }
  await cargarLibrosLocales();
}

async function borrarCarpetaLocal(nombre) {
  if (!confirm(t('deleteLocalFolderConfirm', { name: nombre }))) return;
  mostrarCarga(t('deleting', { title: nombre }));
  try {
    const borrados = await almacen.borrarCarpetaLocal(rutaLocalDe(nombre));
    await progreso.olvidar(idNotaCarpeta(rutaLocalDe(nombre), 'local')).catch(() => null);
    // El progreso y las anotaciones se guardan por id de libro, así que hay
    // que limpiarlos uno a uno: no cuelgan de la carpeta.
    for (const id of borrados) {
      await progreso.olvidar(id).catch(() => null);
      await anotaciones.olvidar('local', id).catch(() => null);
    }
    avisar(t('localFolderDeleted'));
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    await cargarLibrosLocales();
    pintarContinuarLeyendo();
  }
}

async function moverCarpetaLocalA(origen, rutaDestino) {
  if (!origen) return;
  const nombre = origen.split('/').pop();
  try {
    if (!await almacen.moverCarpetaLocal(origen, rutaDestino)) return;
    // La nota describe la carpeta, así que viaja con ella; las de sus
    // subcarpetas, igual.
    const llegada = rutaDestino ? `${rutaDestino}/${nombre}` : nombre;
    progreso.renombrar(idNotaCarpeta(origen, 'local'), idNotaCarpeta(llegada, 'local'));
    await progreso.renombrarPorPrefijo(
      `${idNotaCarpeta(origen, 'local')}/`, `${idNotaCarpeta(llegada, 'local')}/`,
    ).catch(() => null);
    avisar(t('folderMoved', { name: nombre }));
    // Si estábamos dentro de la carpeta movida, se sigue donde estaba.
    if (rutaLocal === origen || rutaLocal.startsWith(`${origen}/`)) {
      rutaLocal = llegada + rutaLocal.slice(origen.length);
    }
    pintarContinuarLeyendo();
  } catch (error) {
    avisar(explicarError(error), 6000);
  }
  await cargarLibrosLocales();
}

async function moverLibroLocalA(libro, rutaDestino) {
  try {
    if (!await almacen.moverLibroACarpeta(libro.id, rutaDestino)) return;
    avisar(t('bookMoved', { title: libro.nombre }));
  } catch (error) {
    avisar(explicarError(error), 6000);
  }
  await cargarLibrosLocales();
}

// ───────────────────────── Mover libros entre carpetas ─────────────────────────

let movimiento = null; // { id, nombre, ruta: carpeta de destino, ambito: 'nube'|'local' }

function cerrarDialogoMover() {
  movimiento = null;
  $('dialogo-mover').classList.add('oculto');
}

// ¿El movimiento ocurre en la nube, sea de un libro o de una carpeta?
function movimientoEnNube() {
  return movimiento.ambito === 'nube' || movimiento.ambito === 'carpeta-nube';
}

function movimientoDeCarpeta() {
  return movimiento.ambito === 'carpeta-local' || movimiento.ambito === 'carpeta-nube';
}

// Carpeta donde está ahora el libro que se va a mover. En la nube va dentro
// del id; en el dispositivo es un campo del registro.
async function carpetaActualDelMovimiento() {
  if (movimientoEnNube()) return carpetaDeId(movimiento.id);
  // Una carpeta: su sitio actual es el de su padre.
  if (movimientoDeCarpeta()) return carpetaDeId(movimiento.id);
  const libros = await almacen.listarLibros().catch(() => []);
  const libro = libros.find((registro) => registro.id === movimiento.id);
  return almacen.normalizarCarpeta(libro?.carpeta);
}

const TITULOS_MOVER = {
  nube: 'moveBook', local: 'moveToDeviceFolder',
  'carpeta-local': 'moveFolderTo', 'carpeta-nube': 'moveFolderTo',
};

async function abrirDialogoMover(libro, ambito = 'nube') {
  if ((ambito === 'nube' || ambito === 'carpeta-nube') && !cliente) return;
  movimiento = { id: libro.id, nombre: libro.nombre, ambito, ruta: '' };
  movimiento.ruta = await carpetaActualDelMovimiento();
  $('titulo-mover').textContent = t(TITULOS_MOVER[ambito], { title: libro.nombre, name: libro.nombre });
  $('dialogo-mover').classList.remove('oculto');
  await pintarDialogoMover();
}

// Subcarpetas de una ruta, vengan de la nube o del dispositivo. Al mover una
// carpeta se esconde ella misma: entrar ahí sería meterla dentro de sí misma.
async function subcarpetasDe(ruta) {
  const propia = (hijas) => {
    if (!movimientoDeCarpeta()) return hijas;
    const prefijo = ruta ? `${ruta}/` : '';
    return hijas.filter((carpeta) => prefijo + carpeta.nombre !== movimiento.id);
  };
  if (movimientoEnNube()) return propia((await cliente.listar(ruta)).carpetas);
  const [libros, carpetas] = await Promise.all([
    almacen.listarLibros(), almacen.listarCarpetasLocales(),
  ]);
  const { carpetas: hijas } = almacen.bibliotecaLocal(libros, carpetas, ruta);
  return propia(hijas);
}

// Explorador de carpetas del diálogo: migas + subcarpetas de la ruta actual.
async function pintarDialogoMover() {
  if (!movimiento) return;
  const estado = $('estado-mover');
  const lista = $('lista-carpetas-mover');
  pintarMigas($('ruta-mover'), movimiento.ruta, (destino) => {
    movimiento.ruta = destino;
    pintarDialogoMover();
  }, false, t(movimientoEnNube() ? 'cloudRoot' : 'deviceRoot'));
  lista.replaceChildren();
  estado.textContent = t('loadingFolders');
  $('btn-confirmar-mover').disabled = true;
  try {
    const ruta = movimiento.ruta;
    const carpetas = await subcarpetasDe(ruta);
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
    // Mover a donde ya está (o meter una carpeta dentro de sí misma) no vale.
    $('btn-confirmar-mover').disabled = movimientoDeCarpeta()
      ? !almacen.movimientoDeCarpetaValido(movimiento.id, movimiento.ruta)
      : movimiento.ruta === await carpetaActualDelMovimiento();
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
  if (!movimiento) return;
  const { id, nombre, ruta, ambito } = movimiento;
  if (movimientoEnNube() && !cliente) return;
  cerrarDialogoMover();
  if (ambito === 'nube') await moverLibroA(id, ruta);
  else if (ambito === 'carpeta-nube') await moverCarpetaRemotaA(id, ruta);
  else if (ambito === 'carpeta-local') await moverCarpetaLocalA(id, ruta);
  else await moverLibroLocalA({ id, nombre }, ruta);
});

$('btn-cancelar-mover').addEventListener('click', cerrarDialogoMover);
$('dialogo-mover').addEventListener('click', (evento) => {
  if (evento.target === $('dialogo-mover')) cerrarDialogoMover();
});

$('btn-carpeta-nueva-mover').addEventListener('click', async () => {
  if (!movimiento) return;
  if (movimientoEnNube() && !cliente) return;
  const nombre = pedirNombreCarpeta();
  if (!nombre) return;
  const destino = movimiento.ruta ? `${movimiento.ruta}/${nombre}` : nombre;
  try {
    if (movimientoEnNube()) await cliente.crearCarpeta(destino);
    else await almacen.crearCarpetaLocal(destino);
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
  let todos = [];
  let carpetasRegistradas = [];
  let inventarioFiable = false;
  try {
    [todos, carpetasRegistradas] = await Promise.all([
      almacen.listarLibros(), almacen.listarCarpetasLocales(),
    ]);
    inventarioFiable = true;
  } catch { /* IndexedDB no disponible (p. ej. navegación privada) */ }
  actualizarAvisoEjemplos(todos, inventarioFiable);
  // Restos de un borrado que se quedó a medias: aquí el inventario manda y no
  // hay que esperar a nada (ver progreso.conciliarLocales).
  progreso.conciliarLocales(
    [...todos.map((libro) => libro.id),
      ...carpetasRegistradas.map((ruta) => idNotaCarpeta(ruta, 'local'))],
    inventarioFiable,
  );

  // Si la carpeta abierta ha dejado de existir (se borró, o la copia
  // restaurada no la traía), se vuelve a la raíz en lugar de quedarse en una
  // vista vacía sin salida.
  if (rutaLocal && !carpetasRegistradas.includes(rutaLocal)) {
    rutaLocal = '';
    actualizarCarpetasEnHistorial();
    pintarContinuarLeyendo();
  }
  const { carpetas, libros } = almacen.bibliotecaLocal(todos, carpetasRegistradas, rutaLocal);
  // Buscando se mira en toda la biblioteca, no solo en la carpeta abierta: si
  // no, guardar un libro en una carpeta equivaldría a esconderlo del buscador.
  const buscando = Boolean($('buscar-biblioteca').value.trim());
  const aPintar = buscando ? todos : libros;

  pintarRutaLocal();
  // El cartel de bienvenida solo cabe cuando no hay absolutamente nada; dentro
  // de una carpeta vacía el mensaje es otro.
  $('aviso-local-vacio').classList.toggle('oculto',
    todos.length > 0 || carpetasRegistradas.length > 0);
  const estado = $('estado-local');
  estado.textContent = !buscando && rutaLocal && !carpetas.length && !libros.length
    ? t('emptyLocalFolder') : '';
  estado.classList.toggle('oculto', !estado.textContent);

  lista.replaceChildren();
  // Las carpetas, en su lista aparte (ver pintarListaRemota).
  const listaCarpetas = $('lista-carpetas-locales');
  listaCarpetas.replaceChildren();
  if (!buscando) {
    for (const carpeta of carpetas) {
      const dentro = almacen.bibliotecaLocal(todos, carpetasRegistradas, rutaLocalDe(carpeta.nombre));
      const conteo = dentro.carpetas.length + dentro.libros.length;
      listaCarpetas.append(crearFilaCarpetaLocal(carpeta.nombre, conteo));
    }
  }
  for (const libro of aPintar) {
    const fila = crearFilaLibro({
      id: libro.id,
      // Solo se dice la carpeta de lo que no está en la que se está mirando,
      // que es lo que saca a la vista la búsqueda.
      carpeta: libro.carpeta && libro.carpeta !== rutaLocal ? libro.carpeta : '',
      titulo: libro.nombre.replace(/\.(pdf|epub)$/i, ''),
      tamano: libro.tamano,
      formato: formatoDe(libro.nombre),
      sinTexto: formatoDe(libro.nombre) === 'pdf' && pdfSinTextoConocido({
        tipo: 'local', id: libro.id, tamano: libro.tamano,
      }),
      alAbrir: () => abrirLibroLocal(libro),
      ...accionesLibroLocal(libro),
    });
    // El nombre de la carpeta cuenta como texto buscable: «novela negra»
    // encuentra lo que hay dentro de esa carpeta.
    if (libro.carpeta) {
      fila.dataset.busqueda = `${fila.dataset.busqueda} ${normalizarBusqueda(libro.carpeta.replace(/\//g, ' '))}`;
    }
    // Arrastrar un libro local sirve para dos cosas: soltarlo en una carpeta
    // del dispositivo (lo mueve) o en la sección de la nube (lo sube).
    const boton = fila.querySelector('.libro');
    boton.draggable = true;
    boton.addEventListener('dragstart', (evento) => {
      evento.dataTransfer.setData(TIPO_ARRASTRE_LOCAL,
        JSON.stringify({ id: libro.id, nombre: libro.nombre }));
      evento.dataTransfer.effectAllowed = cliente ? 'copyMove' : 'move';
    });
    lista.append(fila);
  }
  aplicarOrganizacionBiblioteca();
  actualizarVisibilidadBuscadorBiblioteca();
  return todos.length;
}

// Entrar o salir de una carpeta del dispositivo. Va aparte de recargar la
// lista porque además hay que revisar «Continuar leyendo», que solo sale en la
// raíz; se hace solo aquí y no en cada recarga para no repetir las
// comprobaciones de los libros remotos contra el servidor.
function navegarCarpetaLocal(destino) {
  if (destino === rutaLocal) return;
  rutaLocal = destino;
  registrarCarpetas();
  cargarLibrosLocales();
  pintarContinuarLeyendo();
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

// Trae un libro de la nube a la biblioteca del dispositivo. Es una copia: el
// original sigue en el servidor y el progreso de cada uno va por su lado,
// porque cada biblioteca identifica los libros a su manera.
async function guardarLibroRemotoEnDispositivo(id, carpeta = rutaLocal) {
  if (!cliente) return;
  const nombre = nombreDeId(id);
  mostrarCarga(t('downloading', { title: nombre }));
  try {
    const datos = await cliente.descargar(id, (recibido, total) => {
      const pct = Math.round((recibido / total) * 100);
      $('texto-cargando').textContent = `${t('downloading', { title: nombre })} ${pct}%`;
    });
    const libro = {
      id: `local:${nombre}:${datos.byteLength}`,
      nombre,
      tamano: datos.byteLength,
      carpeta,
    };
    await almacen.guardarLibro(libro, datos);
    asegurarMiniatura(libro.id, formatoDe(nombre), datos);
    avisar(t('savedToDevice', { title: nombre }));
    await cargarLibrosLocales();
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

// ─────────────── Descargar una carpeta con todo su contenido ───────────────

// Donde se puede escribir en el disco (Chrome, Edge y Opera de escritorio) la
// carpeta se guarda tal cual, con sus subcarpetas; en el resto de navegadores
// no queda más remedio que entregar un ZIP.

// Escribe las entradas dentro de una carpeta elegida por el usuario, creando
// las subcarpetas que hagan falta.
async function volcarEnDisco(nombreCarpeta, entradas, traer, informe) {
  const elegida = await window.showDirectoryPicker({ mode: 'readwrite', id: 'pagekeeper-carpetas' });
  const raiz = await elegida.getDirectoryHandle(nombreSeguro(nombreCarpeta), { create: true });
  for (const entrada of entradas) {
    const datos = await traer(entrada, informe);
    if (!datos) continue;
    const tramos = entrada.ruta.split('/');
    let destino = raiz;
    for (const tramo of tramos.slice(0, -1)) {
      destino = await destino.getDirectoryHandle(tramo, { create: true });
    }
    const archivo = await destino.getFileHandle(tramos.at(-1), { create: true });
    const escritura = await archivo.createWritable();
    try {
      await escritura.write(datos);
    } finally {
      await escritura.close();
    }
  }
  if (!informe.hechos) throw new Error(t('folderDownloadFailed'));
}

// Los PDF y los EPUB ya vienen comprimidos: el ZIP solo los empaqueta.
async function empaquetarEnZip(nombreCarpeta, entradas, traer, informe) {
  await cargarZip();
  const zip = new window.JSZip();
  for (const entrada of entradas) {
    const datos = await traer(entrada, informe);
    if (datos) zip.file(entrada.ruta, datos, { compression: 'STORE' });
  }
  if (!informe.hechos) throw new Error(t('folderDownloadFailed'));
  const archivo = await zip.generateAsync({ type: 'blob', compression: 'STORE' }, (avance) => {
    $('texto-cargando').textContent = `${t('packingFolder')} ${Math.round(avance.percent)} %`;
  });
  entregarDescarga(`${nombreSeguro(nombreCarpeta)}.zip`, archivo, 'application/zip');
}

async function entregarCarpeta(nombreCarpeta, entradas, leerDatos) {
  if (!entradas.length) {
    avisar(t('folderHasNoBooks'));
    return;
  }
  const informe = { hechos: 0, fallidos: 0 };
  // Un libro que ya no se puede leer no debe llevarse por delante los demás:
  // se cuenta aparte y la carpeta llega con el resto.
  const traer = async (entrada) => {
    $('texto-cargando').textContent = t('packingFolderItem', {
      current: informe.hechos + informe.fallidos + 1,
      total: entradas.length,
      title: entrada.nombre,
    });
    try {
      const datos = await leerDatos(entrada);
      informe.hechos += 1;
      return datos;
    } catch {
      informe.fallidos += 1;
      return null;
    }
  };
  mostrarCarga(t('packingFolder'));
  try {
    if (puedeGuardarEnDisco()) await volcarEnDisco(nombreCarpeta, entradas, traer, informe);
    else await empaquetarEnZip(nombreCarpeta, entradas, traer, informe);
    avisar(informe.fallidos
      ? t('folderDownloadedPartial', {
        name: nombreCarpeta, failed: informe.fallidos, total: entradas.length,
      })
      : t(informe.hechos === 1 ? 'folderDownloadedOne' : 'folderDownloadedMany', {
        name: nombreCarpeta, count: informe.hechos,
      }), 6000);
  } catch (error) {
    // Cerrar el selector de carpeta sin elegir ninguna no es un fallo.
    if (error.name !== 'AbortError') avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
  }
}

async function descargarCarpetaLocal(nombre) {
  const ruta = rutaLocalDe(nombre);
  const libros = await almacen.listarLibros().catch(() => []);
  await entregarCarpeta(nombre, librosDeCarpetaLocal(libros, ruta), async ({ id }) => {
    const datos = await almacen.obtenerDatos(id);
    if (!datos) throw new Error(t('bookGone'));
    return datos;
  });
}

async function descargarCarpetaRemota(nombre) {
  if (!cliente) return;
  const ruta = rutaNubeDe(nombre);
  mostrarCarga(t('packingFolder'));
  let entradas = [];
  try {
    entradas = await librosDeCarpetaRemota((sitio) => cliente.listar(sitio), ruta);
  } catch (error) {
    avisar(explicarError(error), 6000);
    return;
  } finally {
    ocultarCarga();
  }
  await entregarCarpeta(nombre, entradas, ({ id }) => cliente.descargar(id));
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

// ───────────── Limpieza de lo que ya no está en la nube ─────────────
//
// Los libros que desaparecen de la nube dejan atrás su progreso y su JSON
// lateral de anotaciones. Cada tanto se recorre el servidor entero y se le
// pasa el inventario a `progreso.conciliarPresencia`, que apunta las ausencias
// y solo tira lo que lleve sin aparecer el plazo elegido (allí está explicado
// por qué con tanto miramiento).

// Recorre el árbol completo. Devuelve null si alguna carpeta no se pudo
// listar: con un inventario a medias no se puede afirmar que nada falte.
async function inventarioNube() {
  const ids = new Set();
  const lateralesHuerfanos = [];
  const pendientes = [''];
  while (pendientes.length) {
    const ruta = pendientes.shift();
    let contenido;
    try { contenido = await cliente.listar(ruta); } catch { return null; }
    const enRuta = (nombre) => (ruta ? `${ruta}/${nombre}` : nombre);
    for (const carpeta of contenido.carpetas) {
      ids.add(`carpeta:${enRuta(carpeta.nombre)}`);
      pendientes.push(enRuta(carpeta.nombre));
    }
    const nombres = new Set(contenido.libros.map((libro) => libro.nombre));
    for (const libro of contenido.libros) ids.add(enRuta(libro.nombre));
    for (const lateral of contenido.laterales ?? []) {
      const libro = lateral.nombre.replace(/\.pagekeeper\.json$/, '');
      if (nombres.has(libro)) continue;
      lateralesHuerfanos.push({ ...lateral, id: enRuta(libro) });
    }
  }
  return { ids, lateralesHuerfanos };
}

// Un lateral suelto se tira con el mismo plazo que la entrada de progreso,
// contado sobre la fecha del propio archivo: sin libro al lado, nada va a
// volver a escribirlo. Sin plazo (el usuario ha elegido no borrar) se queda.
function lateralCaducado(lateral, ahora = false) {
  const dias = progreso.diasDeGracia();
  if (!dias) return false;
  if (ahora) return true;
  const modificado = Date.parse(lateral.modificado ?? '');
  if (!Number.isFinite(modificado)) return false;
  return Date.now() - modificado > dias * 24 * 60 * 60 * 1000;
}

async function conciliarProgresoConLaNube({ forzarComprobacion = false, ahora = false } = {}) {
  if (!cliente) return [];
  const ultima = Number(localStorage.getItem(CLAVE_ULTIMA_CONCILIACION)) || 0;
  if (!forzarComprobacion && Date.now() - ultima < 24 * 60 * 60 * 1000) return [];
  const inventario = await inventarioNube().catch(() => null);
  if (!inventario) return [];
  inventarioReciente = inventario;
  localStorage.setItem(CLAVE_ULTIMA_CONCILIACION, String(Date.now()));
  const purgados = await progreso.conciliarPresencia(inventario.ids, cliente, { ahora })
    .catch(() => []);
  for (const id of purgados) {
    await cliente.borrarAnotaciones(id).catch(() => null);
    await anotaciones.olvidar(cliente.base, id).catch(() => null);
    await almacen.borrarCopiaRemota(cliente.base, id).catch(() => null);
    almacen.borrarPortada(id).catch(() => null);
  }
  const borrados = [];
  for (const lateral of inventario.lateralesHuerfanos) {
    if (!lateralCaducado(lateral, ahora)) continue;
    await cliente.borrarAnotaciones(lateral.id).catch(() => null);
    await anotaciones.olvidar(cliente.base, lateral.id).catch(() => null);
    borrados.push(lateral.id);
  }
  inventario.lateralesHuerfanos = inventario.lateralesHuerfanos
    .filter((lateral) => !borrados.includes(lateral.id));
  if (purgados.length) {
    registro.anotar('ok', 'limpieza', `${purgados.length} libros que ya no están`);
    pintarContinuarLeyendo();
  }
  return purgados;
}

// ───────────────────────── Abrir libros ─────────────────────────

async function abrirLibroRemoto(id, infoRemota = {}) {
  const nombre = nombreDeId(id);
  mostrarCarga(t('downloading', { title: nombre }));
  try {
    // Antes de abrir, trae el progreso más reciente de otros dispositivos. Si
    // no se consigue, el libro se abre igual —por donde iba este aparato—,
    // pero callarlo era el peor de los males: quien lo había dejado más
    // adelante en otro dispositivo veía su lectura perdida sin explicación, y
    // al pasar de página la sobrescribía. Se avisa y se vuelve a intentar.
    let errorProgreso = null;
    try {
      await progreso.sincronizar(cliente);
    } catch (error) {
      errorProgreso = error;
    }
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
      titulo: progreso.tituloDe(id) || nombre.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'webdav',
      formato: formatoDe(nombre),
      tamano: datos.byteLength,
    });
    if (desdeCopia) avisar(t('openedOfflineCopy'), 5000);
    else if (falloActualizacion) avisar(t('offlineUpdateFailed'), 5000);
    if (errorProgreso) {
      avisar(t('openedWithoutSync'), 6000);
      // Se deja apuntado como pendiente en vez de reintentarlo aquí a mano:
      // así lo recoge la tanda de reintentos con esperas crecientes, y cuando
      // uno salga bien, si aquí todavía no se ha leído nada, el libro saltará
      // solo a donde tocaba (ver `atenderPosicionRemota`).
      apuntarSubidaPendiente(errorProgreso, id);
    }
  } catch (error) {
    if (error.code !== 'PDF_PASSWORD_CANCELLED') avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
  }
}

// Al arrancar, si se ha pedido, se va derecho al libro en vez de quedarse en la
// biblioteca. Se espera a que esta se haya cargado, y no por las prisas: hasta
// que el progreso no se ha sincronizado, la lectura «más reciente» es la de este
// dispositivo, no la de verdad. De paso, si el libro no se puede abrir —lo
// borraron, o no hay conexión ni copia—, lo que queda a la vista es la
// biblioteca, con el aviso encima.
async function abrirUltimaLecturaSiSePidio() {
  const elegido = libroQueSeAbreAlArrancar({
    activado: abrirUltimoAlArrancar(),
    recientes: progreso.librosRecientes(Infinity),
    ocultos: librosOcultosDeContinuar(),
    estaTerminada: lecturaTerminada,
  });
  if (!elegido) return;
  if (elegido.id.startsWith('local:')) {
    const libros = await almacen.listarLibros().catch(() => []);
    const libro = libros.find((candidato) => candidato.id === elegido.id);
    if (libro) await abrirLibroLocal(libro);
    return;
  }
  // Sin nube configurada no hay de dónde traerlo. Con ella, «abrirLibroRemoto»
  // ya se ocupa de la copia sin conexión y de avisar si el archivo no está.
  if (cliente) await abrirLibroRemoto(elegido.id);
}

async function abrirLibroLocal(libro) {
  mostrarCarga(t('opening', { title: libro.nombre }));
  try {
    const datos = await almacen.obtenerDatos(libro.id);
    if (!datos) throw new Error('el libro ya no está en el almacén de este dispositivo');
    asegurarMiniatura(libro.id, formatoDe(libro.nombre), datos);
    await abrirEnLector(datos, {
      id: libro.id,
      titulo: progreso.tituloDe(libro.id) || libro.nombre.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'local',
      nombre: libro.nombre,
      formato: formatoDe(libro.nombre),
      tamano: datos.byteLength,
    });
  } catch (error) {
    if (error.code !== 'PDF_PASSWORD_CANCELLED') {
      avisar(t('openFailed', { error: error.message }), 6000);
    }
  } finally {
    ocultarCarga();
  }
}

// Los libros llegan emparejados con la carpeta de la que vienen (lo que
// devuelve «archivos-entrantes»), pero también se admite un archivo suelto:
// entonces se queda en la carpeta que esté abierta.
function entrantesCompatibles(archivos) {
  return Array.from(archivos)
    .map((elemento) => (elemento?.archivo ? elemento : { archivo: elemento, carpeta: '' }))
    .filter(({ archivo }) => esLibro(archivo.name));
}

// Las carpetas que hay que preparar antes de copiar nada, de fuera adentro:
// así una subcarpeta nunca se crea antes que la que la contiene.
function carpetasDe(entrantes) {
  return [...new Set(entrantes.map(({ carpeta }) => carpeta).filter(Boolean))]
    .sort((a, b) => a.split('/').length - b.split('/').length);
}

// El resumen del contenido de un libro, con el que se reconoce el mismo texto
// aunque el archivo llegue con otro nombre. SHA-256 porque es lo que trae el
// navegador; de un libro de 13 MB sale en unas décimas y solo se calcula al
// añadirlo o al comparar con un candidato del mismo tamaño.
async function huellaDe(datos) {
  try {
    const resumen = await crypto.subtle.digest('SHA-256', datos);
    return [...new Uint8Array(resumen)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Sin `crypto.subtle` (contexto no seguro) no hay huella: se sigue sin
    // comprobar duplicados antes que impedir añadir el libro.
    return '';
  }
}

// Las huellas de los candidatos, calculándolas la primera vez y guardándolas
// para la próxima: los libros añadidos antes de que esto existiera no la
// tienen, y releerlos en cada comparación sería tirar el trabajo.
async function huellasDe(candidatos) {
  const huellas = {};
  for (const libro of candidatos) {
    if (libro.huella) {
      huellas[libro.id] = libro.huella;
      continue;
    }
    try {
      const datos = await almacen.obtenerDatos(libro.id);
      if (!datos) continue;
      const huella = await huellaDe(datos);
      if (!huella) continue;
      huellas[libro.id] = huella;
      await almacen.guardarHuella(libro.id, huella).catch(() => null);
    } catch { /* no se pudo leer: ese candidato no se puede descartar ni confirmar */ }
  }
  return huellas;
}

// Lanza si el libro ya está en la biblioteca con otro nombre. Devuelve el que
// ya estaba, para poder abrirlo en su lugar.
async function libroYaEnLaBiblioteca({ id, tamano }, datos) {
  const huella = await huellaDe(datos);
  const libros = await almacen.listarLibros().catch(() => []);
  const candidatos = duplicados.candidatosPorTamano(libros, { id, tamano });
  const huellas = candidatos.length ? await huellasDe(candidatos) : {};
  const decision = duplicados.decidirEntrante({ id, tamano, huella }, libros, huellas);
  return { huella, repetido: decision.accion === 'duplicado' ? decision.libro : null };
}

async function guardarArchivoLocal(archivo, abrirDespues = false, carpeta = rutaLocal) {
  mostrarCarga(t('adding', { title: archivo.name }));
  const datos = new Uint8Array(await archivo.arrayBuffer());
  const libro = {
    id: `local:${archivo.name}:${archivo.size}`,
    nombre: archivo.name,
    tamano: archivo.size,
    carpeta,
  };
  // El mismo libro con otro nombre no entra dos veces: la biblioteca acababa
  // con dos fichas del mismo texto, cada una con su posición y su tiempo. Se
  // abre el que ya estaba, que es lo que se quería leer.
  const { huella, repetido } = await libroYaEnLaBiblioteca(libro, datos);
  if (repetido) {
    avisar(t('localDuplicate', { title: repetido.nombre }), 6000);
    if (abrirDespues) await abrirLibroLocal(repetido);
    return false;
  }
  libro.huella = huella;
  await almacen.guardarLibro(libro, datos);
  asegurarMiniatura(libro.id, formatoDe(archivo.name), datos);
  if (abrirDespues) {
    await abrirEnLector(datos, {
      id: libro.id,
      titulo: archivo.name.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'local',
      nombre: archivo.name,
      formato: formatoDe(archivo.name),
      tamano: datos.byteLength,
    });
  }
  return true;
}

async function guardarArchivosLocales(archivos, abrirSiEsUno = false) {
  const validos = entrantesCompatibles(archivos);
  if (!validos.length) {
    avisar(t('unsupportedFiles'));
    return;
  }
  // Abrir de golpe solo tiene sentido con un archivo suelto: quien añade una
  // carpeta entera quiere verla en la lista, no que se le abra un libro.
  const abiertoDirectamente = abrirSiEsUno && validos.length === 1 && !validos[0].carpeta;
  let guardados = 0;
  try {
    for (const carpeta of carpetasDe(validos)) {
      try {
        await almacen.crearCarpetaLocal(destinoLocal(carpeta));
      } catch (error) {
        avisar(explicarError(error), 6000);
      }
    }
    for (const { archivo, carpeta } of validos) {
      try {
        // Un duplicado no cuenta como añadido: ya avisó él por su cuenta.
        if (await guardarArchivoLocal(archivo, abiertoDirectamente, destinoLocal(carpeta))) {
          guardados += 1;
        }
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

async function subirArchivoANube(archivo, subcarpeta = '') {
  if (!cliente) return false;
  const nombre = archivo.name;
  // Se sube a la carpeta abierta, o a la subcarpeta de la que venga el libro.
  const destino = idRemoto(subcarpeta ? `${subcarpeta}/${nombre}` : nombre);
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

// MKCOL no crea las carpetas intermedias, así que hay que ir tramo a tramo
// creando las que falten.
async function asegurarCarpetaRemota(ruta) {
  let acumulada = '';
  for (const tramo of ruta.split('/')) {
    acumulada = acumulada ? `${acumulada}/${tramo}` : tramo;
    if (!await cliente.existe(acumulada)) await cliente.crearCarpeta(acumulada);
  }
}

async function subirArchivosANube(archivos) {
  const validos = entrantesCompatibles(archivos);
  if (!validos.length) {
    avisar(t('unsupportedFiles'));
    return;
  }
  if (!cliente) return;
  try {
    for (const carpeta of carpetasDe(validos)) {
      mostrarCarga(t('creatingFolder', { name: carpeta }));
      await asegurarCarpetaRemota(idRemoto(carpeta));
    }
  } catch (error) {
    avisar(explicarError(error), 6000);
    return;
  } finally {
    ocultarCarga();
  }
  for (const { archivo, carpeta } of validos) await subirArchivoANube(archivo, carpeta);
  cargarBiblioteca();
}

// Los selectores y el arrastre comparten el mismo procesamiento; el selector
// local conserva el comportamiento anterior de abrir un único libro. Los
// selectores de carpeta traen además la ruta de cada archivo, que es lo que
// permite rehacer la estructura dentro de la biblioteca.
for (const [id, procesar] of [
  ['selector-archivo', (libros) => guardarArchivosLocales(libros, true)],
  ['selector-carpeta', (libros) => guardarArchivosLocales(libros)],
  ['selector-subir-nube', (libros) => subirArchivosANube(libros)],
  ['selector-subir-carpeta-nube', (libros) => subirArchivosANube(libros)],
]) {
  $(id).addEventListener('change', (evento) => {
    const { files, webkitdirectory } = evento.target;
    const libros = librosElegidos(files);
    const carpetaVacia = webkitdirectory && files.length > 0 && libros.length === 0;
    evento.target.value = '';
    if (carpetaVacia) avisar(t('noBooksInFolder'));
    else procesar(libros);
  });
}

// Sin soporte de selección de carpetas (Firefox en Android, por ejemplo) los
// botones no llevarían a ninguna parte, así que ni se muestran.
if (!('webkitdirectory' in HTMLInputElement.prototype)) {
  document.querySelectorAll('.accion-carpeta').forEach((boton) => boton.classList.add('oculto'));
}

$('aviso-local-vacio').addEventListener('click', () => $('selector-archivo').click());

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
  zona.addEventListener('drop', async (evento) => {
    if (!contieneArchivos(evento)) return;
    evento.preventDefault();
    evento.stopPropagation();
    // La captura tiene que ser aquí mismo: leer las carpetas es asíncrono y
    // para entonces el «dataTransfer» ya está vacío.
    const capturado = capturarArrastre(evento.dataTransfer);
    terminarArrastre();
    const libros = await librosArrastrados(capturado);
    if (!libros.length && capturado.some((elemento) => elemento.isDirectory)) {
      avisar(t('noBooksInFolder'));
      return;
    }
    alSoltar(libros);
  });
}

// Soltar un libro local sobre la sección de la nube lo sube a la carpeta
// abierta (las carpetas de la lista tienen su propio destino más específico).
// Las carpetas de la nube no entran aquí: la lista solo muestra las hijas de la
// carpeta abierta, así que soltarlas en la sección sería dejarlas donde ya están.
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

// La sección del dispositivo acepta las dos direcciones: un libro local vuelve
// a la carpeta que esté abierta y uno de la nube se descarga aquí. Las carpetas
// de la lista tienen su propio destino, más específico.
{
  const zona = $('zona-local');
  // Soltar en la sección (y no en una carpeta concreta) lleva a la carpeta
  // que esté abierta, que es donde el usuario está mirando.
  const admitido = (evento) => {
    const { nube, local, carpeta } = tiposArrastreLibro(evento);
    return nube || local ||
      (carpeta && almacen.movimientoDeCarpetaValido(carpetaArrastrada, rutaLocal));
  };
  zona.addEventListener('dragover', (evento) => {
    if (!admitido(evento)) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = tiposArrastreLibro(evento).nube ? 'copy' : 'move';
    zona.classList.add('sobre-destino');
  });
  zona.addEventListener('dragleave', (evento) => {
    if (!zona.contains(evento.relatedTarget)) zona.classList.remove('sobre-destino');
  });
  zona.addEventListener('drop', (evento) => {
    if (!admitido(evento)) return;
    const { nube, local } = tiposArrastreLibro(evento);
    evento.preventDefault();
    zona.classList.remove('sobre-destino');
    if (nube) {
      const id = evento.dataTransfer.getData(TIPO_ARRASTRE_LIBRO);
      if (id) guardarLibroRemotoEnDispositivo(id, rutaLocal);
    } else if (local) {
      const libro = libroLocalArrastrado(evento);
      if (libro) moverLibroLocalA(libro, rutaLocal);
    } else {
      moverCarpetaLocalA(carpetaArrastrada, rutaLocal);
    }
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
  // Solo el PDF se queda el pellizco de dos dedos: tiene zoom propio. En EPUB
  // se le devuelve al navegador para no dejar sin ampliación a quien la use.
  $('vista-lector').classList.toggle('leyendo-pdf', !esEpub);
  $('contenedor-pagina').classList.toggle('oculto', esEpub);
  $('contenedor-epub').classList.toggle('oculto', !esEpub);
  $('control-texto').classList.toggle('oculto', !esEpub);
  $('btn-rotar').classList.toggle('oculto', esEpub);
  $('btn-pagina-completa').classList.toggle('oculto', esEpub);
  $('btn-recorte').classList.toggle('oculto', esEpub);
  $('btn-imprimir').classList.toggle('oculto', !esEpub);
  aplicarAparienciaModo(modoActual());
  aplicarAparienciaDoble();
  reiniciarRitmo();
  detenerLecturaVoz();
  cerrarPanelTts();
  salirModoInmersivo();
  cerrarPanelTexto();
  // El papel antes de dibujar la primera página, para que salga ya con su
  // color y su capa de imágenes.
  aplicarPapel();
  const avance = progreso.progresoDe(libro.id);
  // Con qué posición se abrió y si desde entonces se ha leído algo. Sirve para
  // saber si una posición que llegue tarde de otro dispositivo se puede aplicar
  // sin quitarle la página de las manos a nadie (ver `atenderPosicionRemota`).
  posicionAlAbrir = claveDePosicion(avance);
  // Lo rechazado en el libro anterior no dice nada de este, y un cartel a
  // medio responder no debe sobrevivir al cambio de libro.
  posicionRemotaDescartada = null;
  cerrarAvisoPosicionRemota();
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
      lectorEpub.guionado = guionadoEpubGuardado();
      lectorEpub.columnas = columnasGuardadas();
      lectorEpub.letrasPorLinea = letrasPorLineaGuardadas();
      prepararSeguimientoEpub(avance?.cfi ?? null);
      // El reparto del libro en localizaciones se reaprovecha entre sesiones:
      // sin él no hay porcentaje ni salto por porcentaje hasta que termina de
      // calcularse, y en libros grandes eso son varios segundos cada vez.
      const clave = claveLibro(libro);
      const guardadas = await almacen.obtenerLocalizaciones(clave, datos.byteLength)
        .catch(() => null);
      try {
        await lectorEpub.abrir(datos, avance?.cfi ?? null, modoActual(), {
          localizaciones: guardadas,
          temaPagina: temaEfectivo(),
          alGuardarLocalizaciones: (json) => {
            almacen.guardarLocalizaciones(clave, datos.byteLength, json).catch(() => null);
          },
        });
      } finally {
        restaurandoPosicionEpub = false;
      }
      if (avance?.cfi) avisar(t('continuing'));
    } else {
      lectorEpub.cerrar();
      lector.rotacion = rotacionPdfDe(libro.id);
      lector.doble = dobleGuardado();
      await lector.abrir(datos, avance?.pagina ?? 1, modoActual(), zoomPdfGuardado(),
        ajustePdfGuardado(), recorteGuardado());
      aplicarAparienciaAjustePdf();
      setTimeout(() => comprobarTextoPdf(libro, lector.documento).catch(() => null), 800);
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
    // El aumento y el aspecto que se le habían dado al libro viajan con él:
    // subirlo a la nube no debería devolverlo al tamaño de fábrica.
    for (const clave of CLAVES_AJUSTES_POR_LIBRO) {
      const valor = ajusteDelLibro(clave, idLocal);
      if (valor !== undefined) {
        guardarAjusteDelLibro(clave, valor, destino);
        guardarAjusteDelLibro(clave, null, idLocal);
      }
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

// Pasar página o seguir en continuo es de cada libro: un facsímil escaneado
// se recorre mejor de corrido y una novela por páginas, y no hay razón para
// que elegirlo en uno se lo lleve por delante a los demás. El que se abre por
// primera vez empieza como viene de fábrica, por páginas y a una columna.
function modoActual() {
  return ajusteDelLibro(CLAVE_MODO_LIBRO) === 'continuo' ? 'continuo' : 'pagina';
}

function aplicarAparienciaModo(modo) {
  $('vista-lector').classList.toggle('modo-continuo', modo === 'continuo');
  $('btn-modo').innerHTML = icono(modo === 'continuo' ? 'file-text' : 'scroll-text');
  $('btn-modo').title = modo === 'continuo'
    ? t('pageMode')
    : t('scrollMode');
  etiquetarPorTitulo($('btn-modo'));
  // Las columnas solo existen pasando página: en continuo el texto va en una
  // tira y el botón no tiene nada que ofrecer.
  $('control-columnas').classList.toggle('oculto', modo === 'continuo');
  if (modo === 'continuo') cerrarPanelColumnas();
  if (!$('fondo-menu-lector').classList.contains('oculto')) actualizarMenuLector();
}

// El botón enseña la opción elegida, con el mismo icono con el que aparece en
// el menú: así se reconoce de un vistazo en cuál está, y automáticas se ve como
// automáticas en lugar de disfrazarse del número de columnas que haya salido.
// En el PDF, que no tiene automático, se enseña lo que va a hacer.
function aplicarAparienciaDoble(valor = columnasGuardadas()) {
  const boton = $('btn-columnas');
  const esPdf = !epubAbierto();
  const { clave, icono: nombreIcono } = aspectoDeLaOpcion(opcionEnUso(valor), esPdf);
  boton.innerHTML = icono(nombreIcono);
  boton.title = `${t('columnsSettings')}: ${t(clave)}`;
  etiquetarPorTitulo(boton);
  boton.removeAttribute('aria-pressed');
  if (!$('panel-columnas').hidden) pintarMenuColumnas();
}

// La opción del menú en la que está el libro abierto. El PDF no tiene
// automáticas, así que un libro que nunca lo ha tocado —y por tanto lo tiene
// en automático— se enseña en la que le corresponde por el tamaño de la
// pantalla, que es lo que va a hacer. Si no, ni el botón ni el menú tendrían
// nada que señalar.
function opcionEnUso(valor = columnasGuardadas()) {
  if (valor !== 'auto' || epubAbierto()) return valor;
  return dobleGuardado() ? 2 : 1;
}

// El menú de columnas: una opción por reparto posible, con su icono, y una
// marca en el que está puesto.
function pintarMenuColumnas() {
  const panel = $('panel-columnas');
  const puesto = opcionEnUso();
  panel.replaceChildren();
  const esPdf = !epubAbierto();
  for (const valor of valoresDisponibles(esPdf)) {
    const { clave, icono: nombreIcono } = aspectoDeLaOpcion(valor, esPdf);
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'item-menu-lector';
    boton.setAttribute('role', 'menuitemradio');
    boton.setAttribute('aria-checked', String(valor === puesto));
    boton.innerHTML = `${icono(nombreIcono)}<span>${t(clave)}</span>` +
      (valor === puesto ? icono('circle-check', 'icono marca-opcion') : '');
    boton.addEventListener('click', () => elegirColumnas(valor));
    panel.append(boton);
  }
}

function cerrarPanelColumnas() {
  $('panel-columnas').hidden = true;
  $('btn-columnas').setAttribute('aria-expanded', 'false');
}

// Elegir en el menú es lo mismo que elegir en Ajustes con el libro delante:
// se guarda para este libro y se aplica al lector que esté abierto.
async function elegirColumnas(valor) {
  cerrarPanelColumnas();
  if (libroActual) guardarAjusteDelLibro(CLAVE_COLUMNAS_LIBRO, valor);
  else if (valor === 'auto') localStorage.removeItem(CLAVE_COLUMNAS_EPUB);
  else localStorage.setItem(CLAVE_COLUMNAS_EPUB, String(valor));
  pintarAjustesTexto();
  await aplicarColumnas(valor);
}

async function aplicarColumnas(valor) {
  const columnas = normalizarColumnas(valor);
  aplicarAparienciaDoble(columnas);
  if (epubAbierto()) await lectorEpub.cambiarColumnas(columnas);
  else if (libroActual) await lector.cambiarDoble(dobleGuardado());
}

$('btn-modo').addEventListener('click', async () => {
  const nuevo = modoActual() === 'continuo' ? 'pagina' : 'continuo';
  guardarAjusteDelLibro(CLAVE_MODO_LIBRO, nuevo);
  aplicarAparienciaModo(nuevo);
  if (epubAbierto()) await lectorEpub.cambiarModo(nuevo);
  else await lector.cambiarModo(nuevo);
});

$('btn-columnas').addEventListener('click', () => {
  const panel = $('panel-columnas');
  if (!panel.hidden) return cerrarPanelColumnas();
  cerrarPanelTexto();
  cerrarPanelTts();
  pintarMenuColumnas();
  panel.hidden = false;
  $('btn-columnas').setAttribute('aria-expanded', 'true');
  panel.querySelector('button')?.focus();
});

$('btn-rotar').addEventListener('click', async () => {
  if (epubAbierto() || !libroActual) return;
  await lector.rotar();
  guardarRotacionPdf(libroActual.id, lector.rotacion);
  reiniciarMiniaturas(); // las miniaturas también van giradas
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

// Lo último que se llegó a subir, para no repetir la misma posición. Lleva el
// libro dentro, así que cambiar de libro nunca se confunde con no haber
// avanzado.
let ultimaPosicionSubida = '';

function firmaPosicionActual() {
  if (!libroActual) return '';
  const avance = progreso.progresoDe(libroActual.id);
  return `${libroActual.id}|${avance?.cfi ?? ''}|${avance?.pagina ?? ''}`;
}

// Sube ya lo que hubiera esperando, sin el respiro de los tres segundos. Con
// `soloSiCambio` no se molesta al servidor cuando no hay nada nuevo que
// contarle: salir y entrar de la ventana no debe costar una petición cada vez.
function subirPosicionAhora({ soloSiCambio = false } = {}) {
  clearTimeout(temporizadorSync);
  clearTimeout(temporizadorSyncAnotaciones);
  if (libroActual?.tipo !== 'webdav' || !cliente) return;
  const firma = firmaPosicionActual();
  if (soloSiCambio && firma === ultimaPosicionSubida) return;
  ultimaPosicionSubida = firma;
  const donde = libroActual.id;
  progreso.sincronizar(cliente).then(subidaConseguida).catch((error) => {
    // Sin aviso: aquí la aplicación ya se está yendo a segundo plano y nadie
    // vería el cartel. Lo que importa es que quede apuntado y se reintente.
    apuntarSubidaPendiente(error, donde);
  });
  anotaciones.sincronizar(donde, cliente).catch(() => null);
}

// ───────────── Subidas pendientes ─────────────
//
// Antes, una subida que fallaba se quedaba en un aviso de siete segundos y
// nada más: la siguiente oportunidad era pasar de página otra vez. Leyendo
// media hora sin cobertura, eso significaba media hora de avance que no salía
// nunca del dispositivo. Ahora el fallo se recuerda y se reintenta solo, con
// esperas cada vez más largas para no castigar a un servidor caído.
const ESPERAS_REINTENTO = [5000, 15000, 45000, 120000, 300000];
let temporizadorReintento = null;
let intentosFallidos = 0;
let libroPendiente = null;

function apuntarSubidaPendiente(error, idLibro = null) {
  libroPendiente = idLibro ?? libroPendiente;
  actualizarEstadoSincronizacion(error);
  registro.anotar('error', 'subida', explicarError(error));
  const espera = ESPERAS_REINTENTO[Math.min(intentosFallidos, ESPERAS_REINTENTO.length - 1)];
  intentosFallidos += 1;
  clearTimeout(temporizadorReintento);
  temporizadorReintento = setTimeout(reintentarSubida, espera);
}

// ───────── La posición que llega tarde de otro dispositivo ─────────
//
// Al abrir un libro de la nube se sincroniza antes de leer la posición, pero
// esa petición puede fallar o llegar tarde: entonces el libro se abre por
// donde iba este aparato y la lectura hecha en el otro parecía perdida. Como
// la sincronización se reintenta sola, aquí se recoge lo que llegue después.
//
// Solo se salta sin avisar si desde que se abrió no se ha leído nada: mover la
// página a quien está leyendo sería peor que el fallo que esto arregla. Si ya
// se está leyendo, se pregunta con las dos posiciones delante (ver
// «posicion-remota.js»), porque la fusión ya se ha quedado con la ajena y sin
// cartel nadie se enteraría de que la posición buena era otra.
let posicionAlAbrir = null;
let posicionRemotaDescartada = null;

function claveActualDelLector() {
  const posicion = posicionActualLibro();
  if (typeof posicion === 'string') return posicion;
  return Number.isFinite(Number(posicion)) ? `p${posicion}` : null;
}

// Por dónde va el lector ahora mismo, en la misma forma que lo guardado: en
// EPUB el porcentaje (solo cuando el reparto en localizaciones está hecho y el
// número significa algo), en PDF la página y el total.
function avanceEnPantalla() {
  if (epubAbierto()) {
    return {
      cfi: lectorEpub.cfi, pagina: lectorEpub.porcentaje, paginas: 100,
      ...(lectorEpub.conLocalizaciones ? {} : { porcentajeAproximado: true }),
    };
  }
  return { pagina: lector.pagina, paginas: lector.totalPaginas };
}

async function saltarAPosicion(avance) {
  try {
    await (epubAbierto() ? lectorEpub : lector).irA(avance.cfi ?? avance.pagina);
    avisar(t('positionFromOtherDevice'), 5000);
  } catch {
    // Un CFI que este dispositivo no sabe resolver no debe romper la lectura:
    // se queda donde está, que es lo que ya se veía.
  }
}

async function atenderPosicionRemota() {
  if (!libroActual || libroActual.tipo !== 'webdav') return;
  const avance = progreso.progresoDe(libroActual.id);
  const destino = claveDePosicion(avance);
  const enPantalla = avanceEnPantalla();
  const decision = decidirPosicionRemota({
    clave: destino,
    claveApertura: posicionAlAbrir,
    claveLector: claveActualDelLector(),
    claveDescartada: posicionRemotaDescartada,
    distancia: distanciaPosiciones(avance, enPantalla),
    mismoDispositivo: Boolean(avance?.posicionDispositivo)
      && avance.posicionDispositivo === progreso.idDispositivo(),
  });
  if (decision === 'nada') return;
  if (decision === 'saltar') {
    posicionAlAbrir = destino;
    cerrarAvisoPosicionRemota();
    await saltarAPosicion(avance);
    return;
  }
  if (decision === 'reafirmar') {
    cerrarAvisoPosicionRemota();
    quedarseDondeSeEsta();
    return;
  }
  preguntarPosicionRemota(avance, enPantalla, destino);
}

// Deja escrito que la posición buena es la que se está viendo. Hace falta
// siempre que la fusión se haya quedado con otra: si no se reafirmara, la
// biblioteca —y el resto de aparatos en cuanto sincronicen— seguirían diciendo
// que la lectura va por donde no va.
function quedarseDondeSeEsta() {
  if (!libroActual) return;
  const enPantalla = avanceEnPantalla();
  // Sin el reparto del EPUB hecho, el porcentaje de pantalla no vale; se deja
  // que lo escriba el seguimiento normal en cuanto se pase de página.
  if (!enPantalla.porcentajeAproximado) {
    progreso.anotarPagina(libroActual.id, enPantalla.pagina, enPantalla.paginas,
      enPantalla.cfi ? { cfi: enPantalla.cfi } : {});
    planificarSincronizacion();
  }
  posicionAlAbrir = claveActualDelLector();
}

// El cartel se queda hasta que se responde: es una decisión, no una noticia.
// Mientras está abierto se sigue leyendo con normalidad; si de tanto leer se
// llega justo a esa posición, ya no hay nada que preguntar y se retira solo.
function preguntarPosicionRemota(avance, enPantalla, destino) {
  const aviso = avisoDePosicion(avance, enPantalla);
  $('texto-posicion-remota').textContent = t(aviso.clave, {
    remoto: formatearPorcentaje(aviso.remoto, aviso.paginas === null ? 1 : 0),
    local: formatearPorcentaje(aviso.local, aviso.paginas === null ? 1 : 0),
    paginas: aviso.paginas ?? '',
  });
  const panel = $('aviso-posicion-remota');
  panel.dataset.destino = destino;
  // Sin robar el foco: quien está leyendo pasa páginas con la barra o las
  // flechas, y un botón enfocado se las quedaría (y saltaría sin querer).
  panel.classList.remove('oculto');
}

function cerrarAvisoPosicionRemota() {
  const panel = $('aviso-posicion-remota');
  panel.classList.add('oculto');
  delete panel.dataset.destino;
}

// Leyendo se puede llegar justo al punto por el que preguntaba el cartel: ya
// no hay nada que decidir y se retira sin obligar a responder.
function revisarAvisoPosicionRemota() {
  const panel = $('aviso-posicion-remota');
  if (panel.classList.contains('oculto')) return;
  if (panel.dataset.destino === claveActualDelLector()) cerrarAvisoPosicionRemota();
}

$('btn-ir-posicion-remota').addEventListener('click', async () => {
  if (!libroActual) return cerrarAvisoPosicionRemota();
  const avance = progreso.progresoDe(libroActual.id);
  posicionAlAbrir = claveDePosicion(avance);
  cerrarAvisoPosicionRemota();
  await saltarAPosicion(avance);
});

// Quedarse no es solo cerrar el cartel: hay que dejar escrito lo que se ha
// elegido, que es lo que hace quedarseDondeSeEsta().
$('btn-quedarse-posicion').addEventListener('click', () => {
  posicionRemotaDescartada = $('aviso-posicion-remota').dataset.destino ?? null;
  cerrarAvisoPosicionRemota();
  if (!libroActual) return;
  quedarseDondeSeEsta();
  avisar(t('remotePositionStayed'), 4000);
});

function subidaConseguida() {
  if (intentosFallidos > 0) {
    registro.anotar('ok', 'recuperada', t('logRecovered', { intentos: intentosFallidos }));
    avisar(t('syncRecovered'), 4000);
  } else {
    // Sin detalle a propósito: así las subidas seguidas se agrupan en una sola
    // línea con su cuenta y su hora, y el registro no se llena de rutina. Sin
    // esto, un registro vacío no distinguiría «subió bien» de «no se intentó».
    registro.anotar('ok', 'subida');
  }
  clearTimeout(temporizadorReintento);
  intentosFallidos = 0;
  libroPendiente = null;
  actualizarEstadoSincronizacion();
  // Toda sincronización que sale bien puede traer la posición de otro
  // dispositivo, no solo la del reintento tras un fallo al abrir.
  atenderPosicionRemota();
}

// El reintento no depende de que siga habiendo un libro abierto: lo que quedó
// sin subir es el archivo de progreso entero, y sigue haciendo falta subirlo
// aunque ya estés en la biblioteca o en otro libro.
function reintentarSubida() {
  clearTimeout(temporizadorReintento);
  if (!intentosFallidos || !cliente) return;
  if (!navigator.onLine) {
    // Sin red no se gasta un intento: ya volverá el evento «online».
    registro.anotar('aviso', 'reintento', t('logOffline'));
    return;
  }
  registro.anotar('aviso', 'reintento', t('logRetrying', { intentos: intentosFallidos }));
  progreso.sincronizar(cliente).then(() => {
    subidaConseguida();
    if (libroPendiente) anotaciones.sincronizar(libroPendiente, cliente).catch(() => null);
  }).catch((error) => apuntarSubidaPendiente(error));
}

// Recuperar la red o volver a la aplicación son los dos momentos en que un
// reintento tiene más posibilidades de salir bien que el temporizador.
window.addEventListener('online', () => {
  registro.anotar('aviso', 'conexión', t('logBackOnline'));
  if (intentosFallidos) reintentarSubida();
});
window.addEventListener('offline', () => registro.anotar('aviso', 'conexión', t('logWentOffline')));

// Cerrar la pestaña, cambiar de aplicación o bloquear el móvil no avisa de
// ninguna otra forma: «beforeunload» no llega en Android y la página puede
// descartarse sin más. Pasar a oculta es el último momento fiable para subir
// la posición; sin esto, terminar de leer y cerrar sin volver a la biblioteca
// dejaba la última página en este dispositivo hasta la siguiente apertura, y
// el otro aparato seguía en la página de antes.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') subirPosicionAhora({ soloSiCambio: true });
  else if (intentosFallidos) reintentarSubida();
});
// Irse a otra ventana no oculta la pestaña, así que aquello no basta en un
// ordenador: se aprovecha también la pérdida de foco.
window.addEventListener('blur', () => subirPosicionAhora({ soloSiCambio: true }));

function planificarSincronizacion() {
  if (libroActual?.tipo !== 'webdav' || !cliente) return;
  clearTimeout(temporizadorSync);
  temporizadorSync = setTimeout(() => {
    ultimaPosicionSubida = firmaPosicionActual();
    const donde = libroActual?.id ?? null;
    progreso.sincronizar(cliente)
      .then(subidaConseguida)
      .catch((error) => {
        // El cartel solo la primera vez: reintentando cada pocos segundos,
        // repetirlo sería un martilleo. El estado y el registro se mantienen.
        if (!intentosFallidos) avisar(t('syncFailed', { error: explicarError(error) }), 7000);
        apuntarSubidaPendiente(error, donde);
      });
  }, 3000);
}

// ───────────── Tiempo de lectura restante estimado ─────────────
// Se mide el ritmo real de lectura en este dispositivo: segundos acumulados
// por unidad avanzada (páginas en PDF, puntos de porcentaje en EPUB). Los
// saltos de posición no cuentan como lectura, y de un tramo entre dos cambios
// de posición se cuenta como mucho el tope (ver «ritmo.js»).
//
// El reloj solo corre con el libro a la vista: al perderse de vista (cambiar de
// pestaña o de aplicación, bloquear el móvil) se cierra el tramo abierto y la
// marca se retira, y al volver empieza uno nuevo. Así el rato de ausencia no se
// cuenta sin necesidad de adivinarlo por su duración, que es lo que antes
// castigaba a quien lee despacio.
const ritmoSesion = { marca: null, unidad: null };

function reiniciarRitmo() {
  ritmoSesion.marca = null;
  ritmoSesion.unidad = null;
  vigilarPausaDelRitmo();
}

function anotarRitmo(unidad) {
  const ahora = Date.now();
  const { marca, unidad: anterior } = ritmoSesion;
  ritmoSesion.marca = ahora;
  ritmoSesion.unidad = unidad;
  vigilarPausaDelRitmo();
  if (marca === null || !libroActual) return;
  const avance = unidad - anterior;
  const segundos = segundosDeLaMuestra((ahora - marca) / 1000, avance);
  if (segundos === null) return;
  apuntarEstadistica(segundos, avance);
  const mapa = leerMapaLocal(CLAVE_RITMO);
  const semivida = epubAbierto() ? SEMIVIDA_PORCENTAJE : SEMIVIDA_PAGINAS;
  const entrada = acumularRitmo(mapa[libroActual.id], segundos, avance, semivida);
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

// La puerta por la que entran todas las reubicaciones de la vista: apunta la
// lectura, o se limita a poner al día la referencia cuando lo que ha pasado es
// un repaginado (ver «reubicacionEsLectura» en ritmo.js). Reencuadrar no toca
// la marca: el tramo abierto sigue corriendo, y con él la cuenta que enciende
// el aviso de «En pausa».
function anotarReubicacion(unidad, porReflujo = false) {
  // Sin tramo todavía —la primera reubicación tras abrir— hay que abrirlo aunque
  // venga de un reajuste: sin marca, el aviso de pausa daría por parado un
  // reloj que nunca ha echado a andar.
  const empezando = ritmoSesion.unidad === null;
  if (empezando || reubicacionEsLectura(porReflujo, unidad, ritmoSesion.unidad)) {
    anotarRitmo(unidad);
  } else {
    ritmoSesion.unidad = unidad;
  }
}

// Cierra el tramo abierto sin esperar a que cambie la posición, dándolo por
// tiempo en la página actual (avance cero, que el ritmo suma sin olvidar nada).
// Lo que se lee en la última página de una sesión también es lectura, y antes
// se perdía entero: al cerrar el libro o al irse de la aplicación, el tramo en
// curso no llegaba a apuntarse nunca.
function cerrarMuestraDeRitmo() {
  if (ritmoSesion.marca === null || !libroActual) return;
  anotarRitmo(ritmoSesion.unidad);
  ritmoSesion.marca = null; // el reloj se reanuda cuando el libro vuelva a la vista
  vigilarPausaDelRitmo();
}

// Perder de vista la página es lo único que de verdad significa «aquí no se
// está leyendo». No se usa el foco de la ventana: en un escritorio con dos
// pantallas se lee de sobra sin foco, y el salto al iframe del EPUB ya lo
// quitaba solo.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    cerrarMuestraDeRitmo();
  } else if (libroActual && ritmoSesion.marca === null && ritmoSesion.unidad !== null) {
    ritmoSesion.marca = Date.now();
    vigilarPausaDelRitmo();
    pintarBarraEstado(); // retira el aviso de pausa y refresca el tiempo dedicado
  }
});

// ── El aviso de que el tiempo no está contando ──
// Sin esto, la única forma de saber si el rato cuenta era esperar a ver si la
// cifra subía. Se enseña en la barra del pie mientras el tramo abierto ya ha
// pasado del tope: a partir de ahí, seguir quieto en la misma página no suma
// nada, y basta con pasar de página para que vuelva a contar.
let temporizadorPausaRitmo;

function ritmoEnPausa() {
  if (!libroActual) return false;
  if (ritmoSesion.marca === null) return ritmoSesion.unidad !== null;
  return (Date.now() - ritmoSesion.marca) / 1000 >= SEGUNDOS_TOPE;
}

function vigilarPausaDelRitmo() {
  clearTimeout(temporizadorPausaRitmo);
  if (ritmoSesion.marca === null || !libroActual) return;
  const falta = SEGUNDOS_TOPE * 1000 - (Date.now() - ritmoSesion.marca);
  // Al llegar al tope no pasa nada que repinte por sí solo, así que se avisa
  // en el momento justo en que el aviso se vuelve verdad.
  if (falta > 0) temporizadorPausaRitmo = setTimeout(pintarBarraEstado, falta);
}

function tiempoRestanteEstimado() {
  if (!libroActual) return '';
  const entrada = leerMapaLocal(CLAVE_RITMO)[libroActual.id];
  const restante = epubAbierto()
    ? (lectorEpub.conLocalizaciones ? Math.max(0, 100 - lectorEpub.porcentaje) : null)
    : Math.max(0, lector.totalPaginas - lector.pagina);
  if (restante === null) return '';
  // Hasta acumular unos minutos de lectura real la estimación no es fiable.
  const minutos = minutosRestantes(entrada, restante,
    epubAbierto() ? UNIDADES_MINIMAS_PORCENTAJE : UNIDADES_MINIMAS_PAGINAS);
  if (minutos === null) return '';
  if (minutos < 1) return t('timeLessMinute');
  if (minutos >= 60) return t('timeHoursMinutes', { h: Math.floor(minutos / 60), m: minutos % 60 });
  return t('timeMinutes', { m: minutos });
}

function pintarTiempoRestante() {
  const texto = tiempoRestanteEstimado();
  $('tiempo-restante').textContent = texto ? `≈ ${texto}` : '';
  // Con la barra del pie encendida el tiempo vive allí: repetido arriba solo
  // gastaba sitio de la barra de herramientas. Si se apaga, vuelve aquí.
  $('tiempo-restante').classList.toggle('oculto', !texto || !barraEstadoOculta());
  pintarBarraEstado();
}

// ───────────── Estadísticas de lectura ─────────────
//
// Se alimentan de las mismas muestras que el ritmo: tiempo con el libro
// delante y pasando páginas. Así lo que se enseña es lectura de verdad y no
// pestañas abiertas, que es lo único que hace útil una racha.

function apuntarEstadistica(segundos, avance) {
  if (!libroActual) return;
  try {
    progreso.anotarTiempoLectura(libroActual.id, segundos,
      // En EPUB el avance son puntos de porcentaje, no páginas: allí no hay
      // nada que contar, y sumarlo daría una cifra de «páginas» inventada.
      epubAbierto() ? 0 : Math.round(avance));
  } catch {
    // Sin sitio en localStorage se deja de apuntar, pero leer no se interrumpe.
  }
}

function duracionLegible(segundos) {
  const { clave, valores } = vistaEstadisticas.duracionEnPalabras(segundos);
  return t(clave, valores);
}

function diasEnPalabras(n) {
  return tContado('statsDays', n);
}

// La fecha de un día del registro ('AAAA-MM-DD'), en corto para las barras.
function fechaCorta(clave, conAnno = false) {
  return vistaEstadisticas.fechaDeClave(clave).toLocaleDateString(idiomaActual(), {
    day: 'numeric', month: 'short', ...(conAnno ? { year: 'numeric' } : {}),
  });
}

function pintarCifras(resumen) {
  const cifras = [
    { etiqueta: t('statsTotal'), valor: duracionLegible(resumen.totalSegundos),
      pie: diasEnPalabras(resumen.diasActivos) },
    { etiqueta: t('statsStreak'), valor: diasEnPalabras(resumen.racha),
      pie: resumen.racha ? t('statsBestStreak', { streak: diasEnPalabras(resumen.rachaMaxima) })
        : t('statsNoStreak') },
    { etiqueta: t('statsToday'), valor: duracionLegible(resumen.hoy) },
    { etiqueta: t('statsWeek'), valor: duracionLegible(resumen.semana.segundos) },
    { etiqueta: t('statsAverage'), valor: duracionLegible(resumen.mediaDiaria) },
    resumen.mejorDia && { etiqueta: t('statsBestDay'),
      valor: duracionLegible(resumen.mejorDia.segundos), pie: fechaCorta(resumen.mejorDia.dia, true) },
    // Las páginas solo salen si se ha leído algún PDF: en una biblioteca de
    // EPUB un «0 páginas» permanente parecería una cuenta estropeada.
    resumen.totalPaginas > 0 && { etiqueta: t('statsPdfPages'),
      valor: String(resumen.totalPaginas) },
  ].filter(Boolean);

  const lista = $('cifras-estadisticas');
  lista.replaceChildren();
  for (const cifra of cifras) {
    const elemento = document.createElement('li');
    elemento.className = 'cifra-estadistica';
    const valor = document.createElement('strong');
    valor.className = 'cifra-valor';
    valor.textContent = cifra.valor;
    const etiqueta = document.createElement('span');
    etiqueta.className = 'cifra-etiqueta';
    etiqueta.textContent = cifra.etiqueta;
    elemento.append(valor, etiqueta);
    if (cifra.pie) {
      const pie = document.createElement('span');
      pie.className = 'cifra-pie';
      pie.textContent = cifra.pie;
      elemento.append(pie);
    }
    lista.append(elemento);
  }
}

// «Has leído X días, en total Y», o nada si no se ha leído ningún día.
// ── El gráfico: por días, semanas, meses o años ──
//
// Los días y las semanas salen de los días guardados; los meses y los años,
// del contador mensual, que no se poda (ver periodos.js). El periodo elegido
// se recuerda en este aparato: quien mira su año no quiere volver a los días
// cada vez que entra.

const CLAVE_PERIODO = 'lector.periodoEstadisticas';

function periodoElegido() {
  const guardado = localStorage.getItem(CLAVE_PERIODO);
  return periodos.PERIODOS.includes(guardado) ? guardado : 'dia';
}

const TITULO_PERIODO = {
  dia: 'statsLastDays', semana: 'statsLastWeeks',
  mes: 'statsLastMonths', anno: 'statsLastYears',
};
const NOMBRE_TRAMO = {
  dia: 'statsThisDay', semana: 'statsThisWeek',
  mes: 'statsThisMonth', anno: 'statsThisYear',
};
const NOMBRE_TRAMO_ANTERIOR = {
  dia: 'statsPrevDay', semana: 'statsPrevWeek',
  mes: 'statsPrevMonth', anno: 'statsPrevYear',
};

// Cómo se llama un tramo en la etiqueta de su barra. La semana se nombra por
// el lunes en que empieza porque decir «semana 31» no le dice nada a nadie.
function nombreDelTramo(punto) {
  const idioma = idiomaActual();
  if (punto.periodo === 'anno') return String(punto.inicio.getFullYear());
  if (punto.periodo === 'mes') {
    return punto.inicio.toLocaleDateString(idioma, { month: 'long', year: 'numeric' });
  }
  if (punto.periodo === 'semana') {
    return t('statsWeekOf', { date: fechaCorta(periodos.claveDeFecha(punto.inicio)) });
  }
  return fechaCorta(punto.clave);
}

// El nombre del mes (1 = enero) en el idioma en uso, para decir hasta dónde
// llega la comparación anual.
function nombreDeMes(numero) {
  return new Date(2026, Math.max(0, numero - 1), 1)
    .toLocaleDateString(idiomaActual(), { month: 'long' });
}

function resumenDeLaSerie(serie, periodo) {
  const { tramosConLectura, segundos } = periodos.totalesDePeriodos(serie);
  if (!tramosConLectura) return null;
  if (periodo === 'dia') {
    return t('statsChartSummary', {
      days: diasEnPalabras(tramosConLectura), total: duracionLegible(segundos),
    });
  }
  return t('statsChartSummaryPeriod', {
    count: tContado(`statsCount_${periodo}`, tramosConLectura),
    total: duracionLegible(segundos),
  });
}

// Barras de altura proporcional al tramo que más se leyó. Los tramos en blanco
// dejan una raya tenue: el hueco es justamente lo que hay que ver.
function pintarGrafico(datos) {
  const periodo = periodoElegido();
  const grafico = $('grafico-estadisticas');
  const serie = periodos.seriePeriodos(datos, periodo);
  grafico.replaceChildren();
  const maximo = serie.reduce((mayor, punto) => Math.max(mayor, punto.segundos), 0);
  for (const punto of serie) {
    const columna = document.createElement('div');
    columna.className = 'columna-dia';
    columna.setAttribute('aria-hidden', 'true');
    const barra = document.createElement('div');
    // El último tramo va a medias todavía: se raya para que su barra corta no
    // se lea como un bajón de lectura.
    const enCurso = punto === serie[serie.length - 1] && periodo !== 'dia';
    barra.className = 'barra-dia';
    if (!punto.segundos) barra.classList.add('sin-lectura');
    else if (enCurso) barra.classList.add('en-curso');
    barra.style.height = `${vistaEstadisticas.alturaBarra(punto.segundos, maximo)}%`;
    const nombre = nombreDelTramo(punto);
    columna.title = punto.segundos
      ? t('statsChartDay', { date: nombre, time: duracionLegible(punto.segundos) })
      : t('statsChartDayNone', { date: nombre });
    columna.append(barra);
    grafico.append(columna);
  }

  const detalle = resumenDeLaSerie(serie, periodo) ?? t('statsChartEmpty');
  // El gráfico se anuncia como una sola imagen con su resumen: treinta barras
  // leídas una a una no dicen nada y se tardan siglos en pasar.
  grafico.setAttribute('aria-label', `${t(TITULO_PERIODO[periodo])}. ${detalle}`);
  $('pie-grafico').textContent = detalle;
  $('titulo-grafico').textContent = t(TITULO_PERIODO[periodo]);
  pintarComparacion(serie, periodo, datos);
}

// El tramo en curso frente al anterior. Con los días no se enseña: comparar
// hoy con ayer no dice nada de cómo va la lectura, y encima hoy casi siempre
// va por la mitad.
function pintarComparacion(serie, periodo, datos) {
  const caja = $('comparacion-periodos');
  const { actual, anterior, variacion, sentido, altura } =
    periodos.compararALaMismaAltura(datos, periodo, Date.now());
  const procede = periodo !== 'dia' && actual && (actual.segundos > 0 || anterior?.segundos > 0);
  caja.classList.toggle('oculto', !procede);
  if (!procede) return;

  // Un tramo a cero se dice «Nada» y no «< 1 m»: al lado de un «100 % menos»,
  // el «menos de un minuto» se lee como que algo se leyó.
  const cifra = (segundos) => (segundos > 0 ? duracionLegible(segundos) : t('statsNoTime'));
  $('etiqueta-periodo-actual').textContent = t(NOMBRE_TRAMO[periodo])
    + (altura?.unidad === 'mes' ? ` ${t('statsUpToMonth', { month: nombreDeMes(altura.hasta) })}` : '');
  $('valor-periodo-actual').textContent = cifra(actual.segundos);
  // Se dice con qué se está comparando de verdad: no con el tramo anterior
  // entero, sino con lo que llevaba a estas alturas. Si no, un «72 % menos»
  // el martes solo contaba que la semana acaba de empezar.
  $('etiqueta-periodo-anterior').textContent = t(NOMBRE_TRAMO_ANTERIOR[periodo])
    + (altura?.unidad === 'mes'
      ? ` ${t('statsUpToMonth', { month: nombreDeMes(altura.hasta) })}`
      : `, ${t('statsSoFar')}`);
  $('valor-periodo-anterior').textContent = cifra(anterior?.segundos ?? 0);

  const marca = $('variacion-periodos');
  marca.classList.remove('mas', 'menos');
  if (sentido !== 'igual') marca.classList.add(sentido);
  // Sin nada en el tramo anterior no hay porcentaje que dar: se dice que se
  // empieza, en vez de un «+∞ %» que no significa nada.
  if (variacion === null) marca.textContent = sentido === 'mas' ? t('statsFirstTime') : '';
  else if (variacion === 0) marca.textContent = t('statsSame');
  else {
    marca.textContent = t(variacion > 0 ? 'statsMoreThanBefore' : 'statsLessThanBefore',
      { percent: Math.abs(variacion) });
  }

  // Los días se podan a los 400: en semanas, las barras más viejas pueden
  // estar vacías porque ya no se guarda ese día, no porque no se leyera.
  const desde = periodos.desdeCuandoHayDatos(datos, periodo);
  const primera = serie[0];
  const recortado = periodo === 'semana' && desde
    && desde > periodos.claveDeFecha(primera.inicio);
  $('pie-grafico').textContent += recortado
    ? ` ${t('statsHistoryFrom', { date: fechaCorta(desde, true) })}` : '';
}

// Los cuatro botones de agrupar. Cambiar de periodo no vuelve a leer el
// registro entero: se repinta solo el gráfico, que es lo único que cambia.
for (const boton of document.querySelectorAll('#grupo-periodos button')) {
  boton.addEventListener('click', () => {
    localStorage.setItem(CLAVE_PERIODO, boton.dataset.periodo);
    pintarBotonesPeriodo();
    const datos = progreso.cargarLocal();
    pintarGrafico({
      dias: estadisticas.diasCombinados(datos.estadisticas),
      meses: estadisticas.mesesCombinados(datos.estadisticas),
    });
  });
}

function pintarBotonesPeriodo() {
  const puesto = periodoElegido();
  for (const boton of document.querySelectorAll('#grupo-periodos button')) {
    boton.setAttribute('aria-pressed', String(boton.dataset.periodo === puesto));
  }
}

// Nombre con el que llamar a cada dispositivo en el desglose. Es el mismo que
// enseña la lista de «Dispositivos conectados», para que se reconozcan sin
// tener que compararlos a mano.
function nombresDeDispositivos() {
  const nombres = new Map();
  for (const aparato of progreso.dispositivos()) {
    const auto = aparato.navegador && aparato.sistema
      ? t('deviceAuto', { browser: aparato.navegador, system: aparato.sistema })
      : (aparato.modelo || aparato.sistema || '');
    nombres.set(aparato.id, {
      nombre: aparato.nombre || auto || t('deviceUnknown'),
      esteMismo: aparato.esteMismo,
    });
  }
  return nombres;
}

function nombreVisibleDeId(id) {
  return vistaEstadisticas.nombreVisibleDeId(id, progreso.tituloDe(id));
}

const CLAVE_ORDEN_LIBROS = 'lector.ordenLibrosEstadisticas';

function ordenLibrosElegido() {
  return vistaEstadisticas.ordenLibrosValido(localStorage.getItem(CLAVE_ORDEN_LIBROS));
}

function pintarLibrosLeidos(resumen) {
  const lista = $('libros-estadisticas');
  lista.replaceChildren();
  const orden = ordenLibrosElegido();
  $('orden-libros-estadisticas').value = orden;
  const libros = vistaEstadisticas.librosParaLaLista(resumen.libros, {
    orden,
    nombreDe: (libro) => nombreVisibleDeId(libro.id),
    // El orden alfabético es el del idioma en uso: en español la eñe va entre
    // la n y la o, y ordenar por código de carácter la mandaría al final.
    compararTextos: (uno, otro) => uno.localeCompare(otro, idiomaActual()),
  });
  $('tarjeta-libros-estadisticas').classList.toggle('oculto', !libros.length);
  // El mayor de todos, no el primero: ordenados por título o por fecha, el de
  // arriba no tiene por qué ser el de más tiempo, y tomándolo como referencia
  // las barras salían todas llenas y dejaban de comparar nada.
  const mayor = vistaEstadisticas.mayorDeLaSerie(libros);
  const nombres = nombresDeDispositivos();
  for (const libro of libros) {
    const fila = document.createElement('li');
    // La fila entera abre la ficha de ese libro, que es donde están su reparto
    // por aparato, su ritmo y lo que lleva leído. Es un botón de verdad, y no
    // un oyente sobre el <li>, para que también se llegue con el tabulador.
    const elemento = document.createElement('button');
    elemento.type = 'button';
    elemento.className = 'libro-estadistica';
    const nombreLibro = nombreVisibleDeId(libro.id);
    elemento.title = t('statsBookCard', { title: nombreLibro });
    elemento.setAttribute('aria-label', elemento.title);
    elemento.addEventListener('click', () => abrirFichaLibro(libro.id, nombreLibro));

    const titulo = document.createElement('span');
    titulo.className = 'titulo-estadistica';
    titulo.textContent = nombreLibro;

    const formato = document.createElement('span');
    formato.className = 'formato-estadistica';
    formato.textContent = libro.formato === 'epub' ? 'EPUB' : 'PDF';

    const tiempo = document.createElement('span');
    tiempo.className = 'tiempo-estadistica';
    tiempo.textContent = duracionLegible(libro.segundos);

    const barra = document.createElement('div');
    barra.className = 'barra-libro';
    const relleno = document.createElement('div');
    // Sin nada leído la barra no se dibuja, al revés que en el gráfico de días,
    // donde el hueco es lo que hay que ver.
    relleno.style.width = mayor ? `${vistaEstadisticas.alturaBarra(libro.segundos, mayor)}%` : '0';
    barra.append(relleno);

    elemento.append(titulo, formato, tiempo, barra);

    // Debajo, lo que no cabe en la línea: el reparto por aparato —solo si hay
    // más de uno, que con uno repetiría la cifra de al lado— y cuándo se leyó
    // por última vez, que es lo que justifica el orden por fecha.
    const partes = [];
    if (libro.porDispositivo.length > 1) {
      partes.push(libro.porDispositivo
        .map((parte) => {
          const conocido = nombres.get(parte.dispositivo);
          const nombre = conocido?.esteMismo ? t('deviceThisOne')
            : conocido?.nombre ?? t('deviceUnknown');
          return `${nombre} ${duracionLegible(parte.segundos)}`;
        })
        .join(' · '));
    }
    const cuando = fechaDeLaUltimaLectura(libro.ultimaLectura);
    if (cuando) partes.push(t('statsLastRead', { date: cuando }));
    // Un libro borrado sigue contando aquí, pero conviene decir que ya no está
    // para que nadie lo busque en la biblioteca.
    if (libro.borrado) partes.push(t('statsBookGone'));
    if (partes.length) {
      const reparto = document.createElement('span');
      reparto.className = 'reparto-estadistica';
      reparto.textContent = partes.join(' · ');
      elemento.append(reparto);
    }
    fila.append(elemento);
    lista.append(fila);
  }
}

// La fecha de la última lectura, en corto y sin la hora: para ordenar por ella
// basta el día, y la hora sobra en una lista que ya va apretada.
function fechaDeLaUltimaLectura(marca) {
  const milisegundos = Date.parse(marca ?? '');
  if (!Number.isFinite(milisegundos)) return '';
  const fecha = new Date(milisegundos);
  const esteAnno = fecha.getFullYear() === new Date().getFullYear();
  return fecha.toLocaleDateString(idiomaActual(), {
    day: 'numeric', month: 'short', ...(esteAnno ? {} : { year: 'numeric' }),
  });
}

$('orden-libros-estadisticas').addEventListener('change', (evento) => {
  const orden = vistaEstadisticas.ordenLibrosValido(evento.target.value);
  if (orden === 'tiempo') localStorage.removeItem(CLAVE_ORDEN_LIBROS);
  else localStorage.setItem(CLAVE_ORDEN_LIBROS, orden);
  pintarLibrosLeidos(estadisticas.resumen(progreso.cargarLocal()));
});

function pintarEstadisticas() {
  const datos = progreso.cargarLocal();
  const resumen = estadisticas.resumen(datos);
  sincronizarCasillasEstadisticas();
  const apagadas = progreso.estadisticasApagadas();
  $('estadisticas-apagadas').classList.toggle('oculto', !apagadas);
  $('estadisticas-vacio').classList.toggle('oculto', resumen.hay || apagadas);
  // Con varios aparatos, lo que se enseña es la suma de todos: conviene
  // decirlo, porque las cifras no cuadran con las de ninguno por separado.
  $('nota-varios-dispositivos').classList.toggle('oculto', resumen.dispositivos < 2);
  $('estadisticas-contenido').classList.toggle('oculto', !resumen.hay || apagadas);
  if (!resumen.hay || apagadas) return;
  pintarCifras(resumen);
  pintarBotonesPeriodo();
  pintarGrafico({
    dias: estadisticas.diasCombinados(datos.estadisticas),
    meses: estadisticas.mesesCombinados(datos.estadisticas),
  });
  pintarLibrosLeidos(resumen);
}

// Línea de la pestaña «Datos» de los ajustes, para no obligar a entrar en la
// pantalla entera solo por ver si hay algo apuntado.
function pintarResumenEstadisticas() {
  if (progreso.estadisticasApagadas()) {
    $('resumen-estadisticas').textContent = t('statsOffTitle');
    return;
  }
  const resumen = estadisticas.resumen(progreso.cargarLocal());
  $('resumen-estadisticas').textContent =
    // Siempre en días: es una línea suelta en los ajustes, sin sitio para
    // elegir periodo ni para explicar cuál se está enseñando.
    (resumen.hay && resumenDeLaSerie(resumen.serie, 'dia')) || t('statsEmptyTitle');
}

// ───────────── Ficha de un libro ─────────────
//
// «¿Cuánto he tardado en leer esto?», que es la pregunta que no responde la
// pantalla general: allí solo caben los más leídos. Se abre desde la barra del
// pie del lector y desde el menú «⋯» de la biblioteca, porque la barra se
// puede apagar y en el modo inmersivo no está.

function tituloDelLibroActual() {
  return libroActual ? nombreVisibleDeId(libroActual.id) : '';
}

// Lo que se enseña en la barra del pie. Vacío si aún no hay nada apuntado: un
// «0 min» permanente ocuparía sitio sin decir nada.
function tiempoDedicadoAlLibro() {
  if (!libroActual) return '';
  const ficha = estadisticas.estadisticasDeLibro(progreso.cargarLocal(), libroActual.id);
  return ficha.hay ? duracionLegible(ficha.segundos) : '';
}

function cifraFicha(etiqueta, valor, pie = '') {
  const elemento = document.createElement('li');
  elemento.className = 'cifra-estadistica';
  const numero = document.createElement('strong');
  numero.className = 'cifra-valor';
  numero.textContent = valor;
  const nombre = document.createElement('span');
  nombre.className = 'cifra-etiqueta';
  nombre.textContent = etiqueta;
  elemento.append(numero, nombre);
  if (pie) {
    const detalle = document.createElement('span');
    detalle.className = 'cifra-pie';
    detalle.textContent = pie;
    elemento.append(detalle);
  }
  return elemento;
}

function pintarFichaLibro(id) {
  const ficha = estadisticas.estadisticasDeLibro(progreso.cargarLocal(), id);
  $('ficha-libro-vacia').classList.toggle('oculto', ficha.hay);
  $('cifras-ficha-libro').classList.toggle('oculto', !ficha.hay);

  const cifras = [];
  if (ficha.hay) {
    cifras.push([t('statsBookTime'), duracionLegible(ficha.segundos),
      ficha.borrado ? t('statsBookGone') : '']);
    if (ficha.porcentaje !== null) {
      cifras.push([t('statsBookRead'), `${ficha.porcentaje} %`,
        ficha.terminado ? t('finished') : '']);
    }
    if (ficha.formato === 'pdf' && ficha.paginas > 0) {
      cifras.push([t('statsPdfPages'), String(ficha.paginas)]);
    }
    // El ritmo se dice en minutos por página cuando pasa del minuto, y en
    // segundos cuando no: «0 min por página» no informa de nada.
    if (ficha.ritmo !== null) {
      cifras.push([t('statsBookPace'), ficha.ritmo >= 60
        ? t('statsPacePerPage', { time: duracionLegible(ficha.ritmo) })
        : t('statsPaceSeconds', { s: Math.round(ficha.ritmo) })]);
    }
    // El tiempo que falta solo tiene sentido con el libro delante: fuera del
    // lector no se sabe por dónde va la lectura de esta sesión.
    const restante = libroActual?.id === id ? tiempoRestanteEstimado() : '';
    if (restante) cifras.push([t('timeLeft'), restante]);
  }
  $('cifras-ficha-libro').replaceChildren(
    ...cifras.map(([etiqueta, valor, pie]) => cifraFicha(etiqueta, valor, pie)),
  );

  // Sacarlo de «En qué se va el tiempo», o devolverlo. Solo con tiempo
  // apuntado: sin nada que enseñar no hay nada que esconder.
  $('ocultar-ficha-libro').classList.toggle('oculto', !ficha.hay);
  if (ficha.hay) {
    $('btn-ocultar-libro').textContent = t(ficha.oculto ? 'statsShowInList' : 'statsHideFromList');
    $('pie-ocultar-libro').textContent = t(ficha.oculto ? 'statsHiddenNote' : 'statsHideNote');
  }

  // El reparto, solo si de verdad hay varios aparatos: con uno repetiría la
  // cifra de arriba.
  const varios = ficha.porDispositivo.length > 1;
  $('reparto-ficha-libro').classList.toggle('oculto', !varios);
  if (!varios) return;
  const nombres = nombresDeDispositivos();
  const mayor = ficha.porDispositivo[0].segundos;
  $('lista-reparto-ficha').replaceChildren(...ficha.porDispositivo.map((parte) => {
    const elemento = document.createElement('li');
    elemento.className = 'libro-estadistica';
    const conocido = nombres.get(parte.dispositivo);
    const nombre = document.createElement('span');
    nombre.className = 'titulo-estadistica';
    nombre.textContent = conocido?.esteMismo ? t('deviceThisOne')
      : conocido?.nombre ?? t('deviceUnknown');
    const tiempo = document.createElement('span');
    tiempo.className = 'tiempo-estadistica';
    tiempo.textContent = duracionLegible(parte.segundos);
    const barra = document.createElement('div');
    barra.className = 'barra-libro';
    const relleno = document.createElement('div');
    relleno.style.width = `${Math.max(2, (parte.segundos / mayor) * 100)}%`;
    barra.append(relleno);
    elemento.append(nombre, tiempo, barra);
    return elemento;
  }));
}

let fichaAbiertaDe = null;
// Quién la abrió, para devolverle el foco al cerrar: desde la lista de
// estadísticas se van mirando varios libros seguidos, y sin esto el tabulador
// volvía a empezar por la cabecera cada vez.
let abrioLaFicha = null;

function abrirFichaLibro(id, titulo) {
  if (!id) return;
  abrioLaFicha = document.activeElement;
  fichaAbiertaDe = id;
  $('titulo-ficha-libro').textContent = titulo || nombreVisibleDeId(id);
  pintarFichaLibro(id);
  $('ficha-libro').classList.remove('oculto');
  $('titulo-ficha-libro').focus();
}

function cerrarFichaLibro() {
  if (!fichaAbiertaDe) return;
  fichaAbiertaDe = null;
  $('ficha-libro').classList.add('oculto');
  if (abrioLaFicha?.isConnected) abrioLaFicha.focus();
  abrioLaFicha = null;
}

// Ocultar (o devolver) desde la ficha. La lista de detrás se repinta sin
// cerrar la ficha: se ve marchar el libro, que es la confirmación de que ha
// pasado algo. El aviso se queda en el pie del propio botón, que ya cambia.
$('btn-ocultar-libro').addEventListener('click', () => {
  const id = fichaAbiertaDe;
  if (!id) return;
  const oculto = estadisticas.estadisticasDeLibro(progreso.cargarLocal(), id).oculto;
  if (!progreso.ocultarDeEstadisticas(id, !oculto)) return;
  pintarFichaLibro(id);
  if (!$('vista-estadisticas').classList.contains('oculto')) pintarEstadisticas();
  pintarResumenEstadisticas();
  // Ocultar es una preferencia de la lectura, no de este aparato: viaja con
  // el resto del registro.
  if (cliente) progreso.sincronizar(cliente).catch(() => null);
});

$('cerrar-ficha-libro').addEventListener('click', cerrarFichaLibro);
// Pulsar fuera cierra, como en el menú «⋯»: el velo es el propio contenedor.
$('ficha-libro').addEventListener('click', (evento) => {
  if (evento.target === $('ficha-libro')) cerrarFichaLibro();
});

function abrirEstadisticas(registrar = true) {
  $('resultado-estadisticas').textContent = '';
  pintarEstadisticas();
  mostrarVista('estadisticas');
  if (registrar) registrarVista('estadisticas');
}

$('btn-estadisticas').addEventListener('click', () => abrirEstadisticas());
$('btn-ver-estadisticas').addEventListener('click', () => abrirEstadisticas());
$('btn-cerrar-estadisticas').addEventListener('click', () => {
  if (history.state?.[ESTADO_VISTA] === 'estadisticas') history.back();
  else volverALaBiblioteca();
});

function borrarEstadisticasYAvisar(mensaje) {
  progreso.borrarEstadisticas();
  pintarEstadisticas();
  pintarResumenEstadisticas();
  $('resultado-estadisticas').textContent = mensaje;
  // El borrado viaja con la sincronización: los demás dispositivos lo acatan
  // la próxima vez que se conecten.
  if (cliente) progreso.sincronizar(cliente).catch(() => null);
}

$('btn-borrar-estadisticas').addEventListener('click', () => {
  if (!confirm(t('statsDeleteConfirm'))) return;
  borrarEstadisticasYAvisar(t('statsDeleted'));
});

// ── No medir nada ──
//
// Apagarlo se lleva por delante lo apuntado hasta ahora: dejar las cifras
// viejas a la vista de quien acaba de decir que no quiere que se le mida sería
// justo lo contrario de lo que ha pedido. Por eso se avisa antes, con el mismo
// aviso del borrado, y se puede echar atrás sin que se borre nada.

function sincronizarCasillasEstadisticas() {
  const apagadas = progreso.estadisticasApagadas();
  for (const casilla of ['casilla-sin-estadisticas', 'casilla-sin-estadisticas-ajustes']) {
    $(casilla).checked = apagadas;
  }
  $('btn-borrar-estadisticas').disabled = apagadas;
}

for (const casilla of ['casilla-sin-estadisticas', 'casilla-sin-estadisticas-ajustes']) {
  $(casilla).addEventListener('change', (evento) => {
    const apagar = evento.target.checked;
    if (apagar && !confirm(t('statsOptOutConfirm'))) {
      evento.target.checked = false; // se echó atrás: no se toca nada
      return;
    }
    progreso.apagarEstadisticas(apagar);
    sincronizarCasillasEstadisticas();
    if (apagar) borrarEstadisticasYAvisar(t('statsOffDone'));
    else {
      pintarEstadisticas();
      pintarResumenEstadisticas();
      $('resultado-estadisticas').textContent = t('statsOnAgain');
    }
  });
}

// Al cambiar de idioma se rehacen las cifras: llevan fechas y palabras
// («2 días», «1 h 20 min») que el recorrido de data-i18n no alcanza.
document.addEventListener('idioma-cambiado', () => {
  if (!$('vista-estadisticas').classList.contains('oculto')) pintarEstadisticas();
  if (!$('vista-ajustes').classList.contains('oculto')) pintarResumenEstadisticas();
  if (fichaAbiertaDe) pintarFichaLibro(fichaAbiertaDe);
});

// ───────────── Barra de datos al pie ─────────────
//
// En el móvil la barra de arriba va llena de botones y no admite un dato más;
// abajo queda una línea libre donde caben los que no son de mando, sino de
// lectura. Se enseña también en pantalla grande: teniendo sitio, mejor un
// único lugar donde mirar en todos los aparatos que dos costumbres distintas.

function barraEstadoOculta() {
  return localStorage.getItem(CLAVE_BARRA_ESTADO_OCULTA) === '1';
}

// La barra del pie es de datos, no de mando, así que casi todo va en un
// <span>. El tiempo dedicado es la excepción: abre la ficha del libro, y para
// eso tiene que ser un botón de verdad (teclado, lector de pantalla) y
// parecerlo.
function datoEstado(texto, titulo, alPulsar = null, nombreIcono = '') {
  const elemento = document.createElement(alPulsar ? 'button' : 'span');
  elemento.className = alPulsar ? 'dato-estado dato-estado-pulsable' : 'dato-estado';
  elemento.textContent = texto;
  // El icono va delante del texto, no en su lugar: un símbolo solo no se
  // entiende, y aquí lo que se anuncia es justo lo que no se ve pasar.
  if (nombreIcono) {
    elemento.classList.add('dato-estado-aviso');
    elemento.insertAdjacentHTML('afterbegin', icono(nombreIcono));
  }
  if (titulo) elemento.title = titulo;
  if (alPulsar) {
    elemento.type = 'button';
    elemento.addEventListener('click', alPulsar);
  }
  return elemento;
}

// Qué se cuenta según el formato: del EPUB, la pantalla dentro del capítulo y
// la del libro entero, porque el porcentaje ya está arriba en el indicador;
// del PDF, la página y el porcentaje, que arriba solo se ve la página. En
// ambos, el tiempo que queda.
function datosBarraEstado() {
  const datos = [];
  // El primero de la fila: en el móvil la barra se desplaza a lo ancho y con
  // la barra de desplazamiento oculta, así que lo que va al final no se
  // encuentra. Y este dato, además, se pulsa.
  const dedicado = tiempoDedicadoAlLibro();
  if (dedicado) {
    datos.push([dedicado, t('statusTimeSpentTitle'),
      () => abrirFichaLibro(libroActual.id, tituloDelLibroActual())]);
  }
  // Pegado al tiempo dedicado, que es el dato que ha dejado de moverse.
  if (ritmoEnPausa()) {
    datos.push([t('statusPaused'), t('statusPausedTitle'), null, 'pause']);
  }
  if (epubAbierto()) {
    // Un capítulo de una sola pantalla (una portadilla, una dedicatoria) no
    // tiene nada que contar: «1 / 1» solo ocupa sitio.
    if (lectorEpub.pantallasCapitulo > 1) {
      datos.push([t('statusChapter', {
        page: lectorEpub.pantallaCapitulo, total: lectorEpub.pantallasCapitulo,
      }), t('statusChapterTitle')]);
    }
    const pantallas = lectorEpub.pantallasLibro;
    if (pantallas) {
      datos.push([t('statusScreens', { page: lectorEpub.pantallaLibro, total: pantallas }),
        t('statusScreensTitle')]);
    } else if (lectorEpub.conLocalizaciones) {
      // En páginas continuas el texto no se reparte en columnas, así que no hay
      // pantallas que contar y la línea se quedaba casi vacía. El porcentaje es
      // lo que sí significa algo con scroll, y es el mismo dato que enseña el
      // PDF. Con pantallas no se pone: sería repetir la posición y gastar sitio.
      datos.push([t('statusRead', { percent: formatearPorcentaje(lectorEpub.porcentaje, 0) }),
        t('statusReadTitle')]);
    }
  } else if (lector.totalPaginas) {
    datos.push([t('statusPage', { page: lector.pagina, total: lector.totalPaginas }),
      t('statusPageTitle')]);
    const porcentaje = Math.round((lector.pagina / lector.totalPaginas) * 100);
    datos.push([t('statusRead', { percent: formatearPorcentaje(porcentaje, 0) }),
      t('statusReadTitle')]);
  }
  const tiempo = tiempoRestanteEstimado();
  if (tiempo) datos.push([`≈ ${tiempo}`, t('timeLeft')]);
  return datos;
}

function pintarBarraEstado() {
  const barra = $('barra-estado-lector');
  const visible = Boolean(libroActual) && !barraEstadoOculta();
  // Visible aunque no haya nada que contar (la portada de un EPUB, por
  // ejemplo): si apareciera y desapareciera sola, el área de lectura cambiaría
  // de alto a mitad del libro y epub.js repaginaría el capítulo.
  barra.classList.toggle('oculto', !visible);
  const datos = visible ? datosBarraEstado() : [];
  barra.replaceChildren(...datos.map(
    ([texto, titulo, alPulsar, nombreIcono]) => datoEstado(texto, titulo, alPulsar, nombreIcono)));
}

function sincronizarCasillaBarraEstado() {
  $('casilla-barra-estado').checked = !barraEstadoOculta();
}

$('casilla-barra-estado').addEventListener('change', (evento) => {
  if (evento.target.checked) localStorage.removeItem(CLAVE_BARRA_ESTADO_OCULTA);
  else localStorage.setItem(CLAVE_BARRA_ESTADO_OCULTA, '1');
  // Repinta las dos: el tiempo restante cambia de sitio según esta casilla.
  pintarTiempoRestante();
});

function cuandoCambiaPagina(pagina, total) {
  colocarPaginaSiVeniaDelEspacio();
  const visible = lector.enDoble() && pagina < total ? `${pagina}-${pagina + 1}` : String(pagina);
  $('btn-indicador').textContent = `${visible} / ${total}`;
  if (!libroActual) return;
  progreso.anotarPagina(libroActual.id, pagina, total);
  revisarAvisoPosicionRemota();
  marcarMiniaturaActual();
  marcarEntradaIndiceActual();
  // Remontar avisa igual que pasar de página; si es la misma, no hay lectura
  // nueva que apuntar, solo el mismo tramo siguiendo abierto.
  anotarReubicacion(pagina, pagina === ritmoSesion.unidad);
  pintarTiempoRestante();
  // Remontar la página (zoom, giro, otro ancho de ventana) cambia el aumento.
  pintarZoom();
  // Navegar a mano mientras suena la lectura en voz alta la detiene; los
  // avances del propio TTS y los remontados (zoom, resize) no.
  if (vistaMovidaPorLaVoz()) ttsUltimaPosicion = pagina;
  else if (vozLectura.estado !== 'parado' && pagina !== ttsUltimaPosicion) vozLectura.detener();
  planificarSincronizacion();
}

// ¿El porcentaje anotado dice otra cosa que la posición anotada? Se compara
// contra la misma posición, no contra cualquiera: un progreso de otro punto
// del libro no es un desfase, es una lectura más reciente de otro sitio.
// Un porcentaje con decimales para la lectura, redondeado para la biblioteca:
// en la ficha de un libro las décimas no dicen nada y solo estorban.
function formatearPorcentaje(valor, decimales = 1) {
  return Number(valor ?? 0).toLocaleString(idiomaActual(), {
    maximumFractionDigits: decimales,
  });
}

function porcentajeDesfasado(cfi, porcentaje) {
  const avance = progreso.progresoDe(libroActual.id);
  return Boolean(avance) && avance.cfi === cfi && avance.pagina !== porcentaje;
}

function cuandoCambiaPosicionEpub(cfi, porcentaje, conLocalizaciones, porReflujo = false) {
  $('btn-indicador').textContent = conLocalizaciones ? `${formatearPorcentaje(porcentaje)}%` : '…';
  marcarEntradaIndiceActual();
  // Antes de cualquier vuelta atrás: la pantalla del capítulo cambia en todas
  // ellas, también mientras se recupera la posición o falta el porcentaje.
  pintarBarraEstado();
  pintarZoom();
  if (!libroActual || !cfi) return;
  if (restaurandoPosicionEpub) {
    cfiEpubGuardado = cfi;
    // epub.js afina el CFI al recuperar la posición: ese afinado es la
    // apertura misma, no una lectura, y si no se apuntara aquí parecería que
    // ya se ha leído algo y no se aceptaría la posición que llegue de otro
    // dispositivo.
    posicionAlAbrir = cfi;
    return;
  }
  if (vistaMovidaPorLaVoz()) {
    // epub.js reubica varias veces tras mostrar un capítulo o una página
    // (afina el CFI): mientras dura la ventana del avance o del seguimiento se
    // acepta cada reubicación como parte del mismo movimiento.
    ttsUltimaPosicion = cfi;
  } else if (vozLectura.estado !== 'parado' && cfi !== ttsUltimaPosicion) {
    vozLectura.detener();
  }
  if (conLocalizaciones) {
    anotarReubicacion(porcentaje, porReflujo);
    pintarTiempoRestante();
  }
  if (cfi === cfiEpubGuardado) {
    // Si el usuario se movió antes de que terminara el cálculo del porcentaje,
    // se completa ahora el mismo cambio. En una apertura normal no se escribe.
    //
    // Salvo que el porcentaje guardado no case con la posición guardada, que
    // es lo que pasa cuando una sesión anterior se cerró con el reparto del
    // libro a medio calcular: allí se anotó la posición nueva con el
    // porcentaje viejo, y sin esta corrección el número se quedaba clavado
    // para siempre, diciendo un 6 % con el libro abierto por el 4 %.
    if (!(conLocalizaciones && cfiEpubPendientePorcentaje === cfi) &&
        !(conLocalizaciones && porcentajeDesfasado(cfi, porcentaje))) return;
    cfiEpubPendientePorcentaje = null;
  } else {
    cfiEpubGuardado = cfi;
    cfiEpubPendientePorcentaje = conLocalizaciones ? null : cfi;
  }
  // Mientras no hay localizaciones se conserva el % anterior para no
  // machacar la barra de progreso de la biblioteca con un cero. Ese número es
  // del punto donde se estaba antes, no de este: va marcado como aproximado
  // para que nadie lo tome por bueno. Sin la marca, al fusionar parecía que la
  // posición vieja iba más adelantada que la recién leída en otro dispositivo,
  // y la resucitaba.
  const pct = conLocalizaciones
    ? porcentaje
    : (progreso.progresoDe(libroActual.id)?.pagina ?? 0);
  progreso.anotarPagina(libroActual.id, pct, 100, {
    cfi, ...(conLocalizaciones ? {} : { porcentajeAproximado: true }),
  });
  revisarAvisoPosicionRemota();
  planificarSincronizacion();
}

// ───────────────────────── Controles del lector ─────────────────────────

let resultadosBusquedaLibro = [];
let consultaBusquedaLibro = '';
let versionBusquedaLibro = 0;
let corteBusquedaLibro = null; // AbortController del barrido en curso
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
  $('fila-menu-columnas').classList.toggle('oculto', $('control-columnas').classList.contains('oculto'));
  $('menu-pagina-completa').classList.toggle('oculto', $('btn-pagina-completa').classList.contains('oculto'));
  $('fila-menu-recorte').classList.toggle('oculto', $('btn-recorte').classList.contains('oculto'));
  // Un PDF ya se imprime descargándolo; lo que aquí se compone es el texto que
  // fluye de un EPUB, que en la pantalla no tiene páginas que llevar al papel.
  $('fila-menu-imprimir').classList.toggle('oculto', $('btn-imprimir').classList.contains('oculto'));

  const modo = modoActual();
  $('menu-modo').innerHTML = icono(modo === 'continuo' ? 'file-text' : 'scroll-text') +
    `<span>${t(modo === 'continuo' ? 'pageMode' : 'scrollMode')}</span>`;
  const columnas = columnasGuardadas();
  $('menu-columnas').innerHTML = icono(aspectoDeLaOpcion(columnas).icono) +
    `<span>${t('columnsSettings')}</span>`;
  const tiempo = tiempoRestanteEstimado();
  $('fila-menu-tiempo').classList.toggle('oculto', !tiempo);
  $('tiempo-restante-menu').textContent = tiempo ? t('timeLeftMenu', { time: tiempo }) : '';
}

function cerrarMenuLector() {
  $('fondo-menu-lector').classList.add('oculto');
  $('btn-menu-lector').setAttribute('aria-expanded', 'false');
}

// Sin punto, el menú se queda donde lo pone el CSS: colgando de su botón «⋯»
// en la esquina de la barra. Con él —el botón derecho sobre la página— se
// despliega ahí mismo.
function abrirMenuLector(punto = null) {
  cerrarBusquedaLibro();
  cerrarIndiceSiFlota();
  cerrarPanelMarcadores();
  cerrarPanelAnotaciones();
  cerrarPanelTexto();
  cerrarPanelTts();
  actualizarMenuLector();
  $('fondo-menu-lector').classList.remove('oculto');
  const menu = $('menu-lector');
  menu.classList.toggle('menu-en-punto', Boolean(punto));
  if (punto) {
    colocarMenuFlotante(menu, punto);
  } else {
    menu.removeAttribute('style');
    menu.classList.remove('abre-arriba');
  }
  $('btn-menu-lector').setAttribute('aria-expanded', 'true');
  // La primera opción que se vea: las que no vienen al caso para este libro
  // están ocultas, y enfocar una oculta deja el foco en el limbo.
  [...$('menu-lector').querySelectorAll('button:not([disabled])')]
    .find((boton) => boton.checkVisibility?.() ?? true)?.focus();
}

$('btn-menu-lector').addEventListener('click', () => {
  if ($('fondo-menu-lector').classList.contains('oculto')) abrirMenuLector();
  else cerrarMenuLector();
});
$('fondo-menu-lector').addEventListener('click', (evento) => {
  if (evento.target === $('fondo-menu-lector')) cerrarMenuLector();
});

// El botón derecho sobre la página abre ahí mismo el menú con las acciones de
// lectura. Con texto seleccionado se deja pasar el menú del navegador, que es
// el que sirve para copiar; el de resaltar y anotar ya sale con la selección.
function menuLectorContextual({ x, y }) {
  cerrarMenuNota();
  abrirMenuLector({ x, y });
}

$('area-lectura').addEventListener('contextmenu', (evento) => {
  if (!abrePorRaton(evento) || window.getSelection()?.toString().trim()) return;
  evento.preventDefault();
  menuLectorContextual({ x: evento.clientX, y: evento.clientY });
});

// Igual que en la biblioteca: el fondo del menú abierto se come el siguiente
// clic derecho, así que aquí se atiende y el menú se muda al nuevo punto.
$('fondo-menu-lector').addEventListener('contextmenu', (evento) => {
  if (!abrePorRaton(evento)) return;
  evento.preventDefault();
  if (evento.target !== $('fondo-menu-lector')) return;
  menuLectorContextual({ x: evento.clientX, y: evento.clientY });
});

// El altavoz de la barra pausa mientras se lee, así que el menú no puede
// delegar en él: desde aquí siempre se abre el panel.
$('menu-tts').addEventListener('click', (evento) => {
  evento.stopPropagation();
  cerrarMenuLector();
  queueMicrotask(() => {
    if (!vozLectura.disponible()) {
      avisar(t('ttsNoSupport'), 6000);
      return;
    }
    abrirPanelTts();
  });
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
  ['menu-modo', 'btn-modo'],
  ['menu-columnas', 'btn-columnas'],
  ['menu-rotar', 'btn-rotar'],
  ['menu-texto', 'btn-texto'],
  ['menu-zoom-menos', 'btn-zoom-menos'],
  ['menu-ancho-auto', 'btn-ancho-auto'],
  ['menu-pagina-completa', 'btn-pagina-completa'],
  ['menu-recorte', 'btn-recorte'],
  ['menu-imprimir', 'btn-imprimir'],
  ['menu-zoom-mas', 'btn-zoom-mas'],
  ['menu-inmersivo', 'btn-inmersivo'],
]) enlazarAccionMenu(idMenu, idOriginal);

// ───────────── Imprimir el EPUB (o guardarlo en PDF) ─────────────
//
// El PDF no se genera aquí: se compone un documento con los capítulos
// elegidos —el contenido tal cual lo trae el libro, con sus hojas de estilo y
// sus imágenes— y se le pasa al navegador, que ya sabe paginar en A4 y ofrece
// «Guardar como PDF» en su propio diálogo. Las cuentas del papel (tamaños,
// márgenes, la hoja de estilo, qué capítulos hay) están en impresion.js.
//
// El documento se monta en un marco aparte y no en esta página: así el libro
// no se mezcla con la interfaz de la aplicación ni hereda su CSS, y lo que se
// imprime es solo el libro.

const CLAVE_IMPRESION = 'lector.impresion'; // solo de este dispositivo

let capitulosImpresion = [];
let componiendoImpresion = false;
// El documento impreso se suelta con retraso (ver imprimirLibro), y quien
// imprime dos veces seguidas se encontraba con que el plazo del primero
// vaciaba el marco del segundo. Se guarda para poder cancelarlo.
let documentoImpreso = null;

function soltarDocumentoImpreso(vaciarElMarco) {
  if (!documentoImpreso) return;
  clearTimeout(documentoImpreso.plazo);
  URL.revokeObjectURL(documentoImpreso.url);
  documentoImpreso = null;
  if (vaciarElMarco) $('marco-impresion').src = 'about:blank';
}

// Las medidas a mano: qué lista las pide, dónde se escriben y con qué topes.
const MEDIDAS_A_MANO = [
  {
    opcion: 'impresion-tamano',
    fila: 'medida-papel',
    campos: [['impresion-ancho', 'ancho'], ['impresion-alto', 'alto']],
  },
  { opcion: 'impresion-margen', fila: 'medida-margen', campos: [['impresion-margen-mm', 'margen']] },
  { opcion: 'impresion-letra', fila: 'medida-letra', campos: [['impresion-letra-pt', 'letra']] },
];

function opcionesImpresionGuardadas() {
  let guardado = {};
  try {
    guardado = JSON.parse(localStorage.getItem(CLAVE_IMPRESION) ?? '{}') ?? {};
  } catch { /* lo guardado no se entiende: se empieza de cero */ }
  const { LIMITES } = impresion;
  return {
    tamano: impresion.opcionValida(guardado.tamano, impresion.TAMANOS, 'a4'),
    margen: impresion.opcionValida(guardado.margen, impresion.MARGENES, 'normal'),
    letra: impresion.opcionValida(guardado.letra, impresion.LETRAS, 'normal'),
    // Las medidas a mano se guardan aunque esté elegido A4: quien vuelve a
    // «personalizado» se encuentra lo que escribió la última vez.
    ancho: impresion.numeroEnRango(guardado.ancho, LIMITES.ancho),
    alto: impresion.numeroEnRango(guardado.alto, LIMITES.alto),
    margenPersonal: impresion.numeroEnRango(guardado.margenPersonal, LIMITES.margen),
    letraPersonal: impresion.numeroEnRango(guardado.letraPersonal, LIMITES.letra),
    anotaciones: guardado.anotaciones !== false,
  };
}

function opcionesImpresionElegidas() {
  const { LIMITES } = impresion;
  return {
    tamano: $('impresion-tamano').value,
    margen: $('impresion-margen').value,
    letra: $('impresion-letra').value,
    ancho: impresion.numeroEnRango($('impresion-ancho').value, LIMITES.ancho),
    alto: impresion.numeroEnRango($('impresion-alto').value, LIMITES.alto),
    margenPersonal: impresion.numeroEnRango($('impresion-margen-mm').value, LIMITES.margen),
    letraPersonal: impresion.numeroEnRango($('impresion-letra-pt').value, LIMITES.letra),
    anotaciones: $('impresion-anotaciones').checked,
  };
}

// Los campos a mano solo salen cuando su lista está en «personalizado»: verlos
// siempre, apagados, es ruido en un diálogo que ya tiene bastante.
function sincronizarMedidasPersonales() {
  for (const { opcion, fila } of MEDIDAS_A_MANO) {
    $(fila).classList.toggle('oculto', $(opcion).value !== 'personalizado');
  }
}

function guardarOpcionesImpresion() {
  try {
    localStorage.setItem(CLAVE_IMPRESION, JSON.stringify(opcionesImpresionElegidas()));
  } catch { /* sin sitio en el almacén: se imprime igual */ }
}

function abrirDialogoImprimir() {
  const libro = lectorEpub.libro;
  if (!epubAbierto() || !libro) return;
  const opciones = opcionesImpresionGuardadas();
  $('impresion-tamano').value = opciones.tamano;
  $('impresion-margen').value = opciones.margen;
  $('impresion-letra').value = opciones.letra;
  $('impresion-ancho').value = opciones.ancho;
  $('impresion-alto').value = opciones.alto;
  $('impresion-margen-mm').value = opciones.margenPersonal;
  $('impresion-letra-pt').value = opciones.letraPersonal;
  $('impresion-anotaciones').checked = opciones.anotaciones;
  sincronizarMedidasPersonales();
  // Sin nada subrayado, la casilla no tiene de qué hablar.
  const hayAnotaciones = anotacionesActuales.some((anotacion) => anotacion.cfi);
  $('impresion-anotaciones').closest('label').classList.toggle('oculto', !hayAnotaciones);
  capitulosImpresion = impresion.capitulosImprimibles(
    libro.spine?.spineItems ?? [],
    libro.navigation?.toc,
    (numero) => t('printChapterNumber', { number: numero }),
  ).map((capitulo) => ({ ...capitulo, elegido: true }));
  $('estado-imprimir').textContent = '';
  pintarCapitulosImpresion();
  $('dialogo-imprimir').classList.remove('oculto');
  $('btn-confirmar-imprimir').focus();
}

function cerrarDialogoImprimir() {
  if (componiendoImpresion) return; // a medio componer, cancelar es cosa del botón
  $('dialogo-imprimir').classList.add('oculto');
  capitulosImpresion = [];
}

function pintarCapitulosImpresion() {
  const lista = $('lista-capitulos-impresion');
  lista.replaceChildren();
  for (const capitulo of capitulosImpresion) {
    const li = document.createElement('li');
    const etiqueta = document.createElement('label');
    etiqueta.className = 'casilla';
    const casilla = document.createElement('input');
    casilla.type = 'checkbox';
    casilla.checked = capitulo.elegido;
    casilla.addEventListener('change', () => {
      capitulo.elegido = casilla.checked;
      pintarResumenImpresion();
    });
    const texto = document.createElement('span');
    texto.textContent = capitulo.titulo;
    etiqueta.append(casilla, texto);
    li.append(etiqueta);
    lista.append(li);
  }
  pintarResumenImpresion();
}

function pintarResumenImpresion() {
  const elegidos = capitulosImpresion.filter((capitulo) => capitulo.elegido).length;
  $('resumen-impresion').textContent = impresion.resumenSeleccion(
    elegidos, capitulosImpresion.length, {
      ninguno: t('printNoChapters'),
      todos: t('printWholeBook'),
      algunos: ({ elegidos: cuantos, total }) => t('printSomeChapters', { count: cuantos, total }),
    },
  );
  $('btn-confirmar-imprimir').disabled = elegidos === 0 || componiendoImpresion;
}

function elegirTodosLosCapitulos(elegido) {
  for (const capitulo of capitulosImpresion) capitulo.elegido = elegido;
  for (const casilla of $('lista-capitulos-impresion').querySelectorAll('input')) {
    casilla.checked = elegido;
  }
  pintarResumenImpresion();
}

// El HTML que devuelve epub.js es XHTML; algún libro viejo trae HTML suelto y
// entonces el analizador estricto se queja en vez de devolver el documento.
function analizarCapitulo(html) {
  const comoXhtml = new DOMParser().parseFromString(html, 'application/xhtml+xml');
  if (!comoXhtml.querySelector('parsererror')) return comoXhtml;
  return new DOMParser().parseFromString(html, 'text/html');
}

// Los trozos de texto que toca un rango. Un pasaje subrayado cruza a menudo
// varias etiquetas —empieza en un párrafo y acaba en el siguiente—, y entonces
// no se puede envolver de una vez: hay que ir nodo a nodo.
function trozosDeTexto(doc, rango) {
  if (rango.startContainer === rango.endContainer && rango.startContainer.nodeType === 3) {
    return [{ nodo: rango.startContainer, desde: rango.startOffset, hasta: rango.endOffset }];
  }
  const trozos = [];
  const recorrido = doc.createTreeWalker(rango.commonAncestorContainer, NodeFilter.SHOW_TEXT);
  for (let nodo = recorrido.nextNode(); nodo; nodo = recorrido.nextNode()) {
    if (!rango.intersectsNode(nodo)) continue;
    const desde = nodo === rango.startContainer ? rango.startOffset : 0;
    const hasta = nodo === rango.endContainer ? rango.endOffset : nodo.data.length;
    if (hasta > desde) trozos.push({ nodo, desde, hasta });
  }
  return trozos;
}

// Marca en el papel un pasaje subrayado y, si lleva nota, le pone la llamada
// al final. Devuelve si se ha podido marcar algo.
function subrayarEnElPapel(doc, rango, relleno, numeroNota) {
  const trozos = trozosDeTexto(doc, rango);
  if (!trozos.length) return false;
  let ultima = null;
  for (const { nodo, desde, hasta } of trozos) {
    const marca = doc.createElement('mark');
    marca.className = 'pk-subrayado';
    marca.setAttribute('style', `background: ${relleno}`);
    const trozo = doc.createRange();
    trozo.setStart(nodo, desde);
    trozo.setEnd(nodo, hasta);
    trozo.surroundContents(marca); // dentro de un solo nodo de texto, siempre cabe
    ultima = ultima ?? marca;
  }
  if (numeroNota) {
    const llamada = doc.createElement('sup');
    llamada.className = 'pk-llamada';
    llamada.textContent = String(numeroNota);
    ultima.after(llamada);
  }
  return true;
}

// Los subrayados y las notas de un capítulo, ya puestos en su documento. Se
// numeran en el orden en que aparecen, y se pintan del final hacia el
// principio: envolver un pasaje parte el texto en varios nodos, y hacerlo al
// revés dejaría sin sitio a los que vinieran después.
function anotarCapituloParaPapel(doc, anotaciones) {
  const situadas = [];
  for (const anotacion of anotaciones) {
    try {
      const rango = new window.ePub.CFI(anotacion.cfi).toRange(doc);
      if (rango) situadas.push({ anotacion, rango });
    } catch { /* un CFI de otra edición del libro no se puede situar */ }
  }
  situadas.sort((una, otra) =>
    una.rango.compareBoundaryPoints(window.Range.START_TO_START, otra.rango));
  let numero = 0;
  const notas = [];
  for (const situada of situadas) {
    situada.numero = situada.anotacion.nota ? ++numero : 0;
  }
  for (const { anotacion, rango, numero: suyo } of [...situadas].reverse()) {
    const puesta = subrayarEnElPapel(doc, rango, impresion.rellenoDePapel(anotacion), suyo);
    if (puesta && suyo) notas.unshift(anotacion);
  }
  return notas;
}

// La lista de notas que cierra el capítulo: cada una con el pasaje al que
// acompaña, que en el papel no se puede pulsar para ir a verlo.
function listaDeNotasParaPapel(doc, notas) {
  if (!notas.length) return null;
  const bloque = doc.createElement('aside');
  bloque.className = 'pk-notas';
  const titulo = doc.createElement('h2');
  titulo.textContent = t('printNotesHeading');
  const lista = doc.createElement('ol');
  for (const nota of notas) {
    const elemento = doc.createElement('li');
    const cita = (nota.texto ?? '').trim();
    if (cita) {
      const bloqueCita = doc.createElement('blockquote');
      bloqueCita.textContent = cita;
      elemento.append(bloqueCita);
    }
    const texto = doc.createElement('div');
    texto.className = 'pk-nota-texto';
    texto.textContent = nota.nota ?? '';
    elemento.append(texto);
    lista.append(elemento);
  }
  bloque.append(titulo, lista);
  return bloque;
}

// La ruta de un recurso dentro del libro, resolviendo el «../» que suelen
// llevar los enlaces del capítulo a la carpeta de estilos. Se parte de la ruta
// canónica del capítulo (`url`) y no de su `href`, que va sin la carpeta del
// paquete y dejaría la hoja de estilo en la raíz, donde no está.
function rutaEnElLibro(href, seccion) {
  const base = seccion.url ?? `/${seccion.href}`;
  try {
    return new URL(href, `http://libro${base.startsWith('/') ? base : `/${base}`}`).pathname;
  } catch {
    return null;
  }
}

// Las hojas de estilo del capítulo, leídas del archivo del libro y no de la
// red. La copia que epub.js deja preparada vive en una dirección «blob:», y
// la política de seguridad de la aplicación no deja pedir esas: se saca del
// comprimido, que además es más rápido y permite no repetir una hoja que
// comparten veinte capítulos. Las direcciones de dentro (letras, fondos) se
// sustituyen por las de esas copias, que es lo que hace epub.js al pintar.
async function recogerHojasDelLibro(libro, seccion, estilos) {
  const enlaces = seccion.document?.querySelectorAll('link[rel~="stylesheet"][href]') ?? [];
  for (const enlace of enlaces) {
    const ruta = rutaEnElLibro(enlace.getAttribute('href'), seccion);
    if (!ruta || estilos.has(ruta)) continue;
    try {
      const css = await libro.archive.getText(ruta);
      if (css) estilos.set(ruta, libro.resources.substitute(css, ruta));
    } catch { /* una hoja que no se puede leer no impide imprimir el texto */ }
  }
}

// Compone el documento entero. Va capítulo a capítulo porque cargarlos todos
// a la vez en un libro grande no cabe en la memoria de un móvil, y avisa del
// avance: en un libro de trescientas páginas esto tarda unos segundos.
async function componerDocumentoImpresion(opciones, alProgreso) {
  const libro = lectorEpub.libro;
  const elegidos = capitulosImpresion.filter((capitulo) => capitulo.elegido);
  const porCapitulo = opciones.anotaciones
    ? impresion.anotacionesPorCapitulo(anotacionesActuales, (cfi) => {
      try { return libro.spine.get(cfi)?.href ?? null; } catch { return null; }
    })
    : new Map();
  const estilos = new Map(); // el contenido de la hoja, para no repetirla por capítulo
  const cuerpos = [];
  for (const [hechos, capitulo] of elegidos.entries()) {
    alProgreso(hechos, elegidos.length);
    const seccion = libro.spine.get(capitulo.href);
    if (!seccion) continue;
    try {
      // `render` devuelve el capítulo con sus imágenes y sus hojas de estilo ya
      // apuntando a la copia que epub.js saca del archivo comprimido.
      const doc = analizarCapitulo(await seccion.render(libro.load.bind(libro)));
      await recogerHojasDelLibro(libro, seccion, estilos);
      for (const estilo of doc.querySelectorAll('style')) {
        estilos.set(estilo.textContent, estilo.textContent);
      }
      const notas = anotarCapituloParaPapel(doc, porCapitulo.get(capitulo.href) ?? []);
      const cuerpo = doc.body;
      if (!cuerpo) continue;
      const cierre = listaDeNotasParaPapel(doc, notas);
      if (cierre) cuerpo.append(cierre);
      cuerpos.push(`<article class="pk-capitulo">${cuerpo.innerHTML}</article>`);
    } catch (error) {
      registro.anotar('aviso', 'impresión', t('printChapterFailed', { title: capitulo.titulo }));
      console.warn('No se pudo componer el capítulo', capitulo.href, error);
    } finally {
      seccion.unload();
    }
  }
  alProgreso(elegidos.length, elegidos.length);
  const titulo = impresion.tituloDelDocumento(libroActual?.titulo, t('printFallbackTitle'));
  const autor = libro.packaging?.metadata?.creator ?? '';
  const idioma = libro.packaging?.metadata?.language || document.documentElement.lang || 'es';
  return [
    '<!doctype html><html lang="', escaparAtributo(idioma), '"><head><meta charset="utf-8">',
    '<title>', escaparTexto(titulo), '</title>',
    // Las del libro primero: la nuestra tiene que poder desdecirlas.
    ...[...estilos.values()].map((css) => `<style>${css}</style>`),
    '<style>', impresion.hojaDeImpresion(opciones), '</style>',
    '</head><body>',
    '<section class="pk-portada"><h1>', escaparTexto(titulo), '</h1>',
    autor ? `<p>${escaparTexto(autor)}</p>` : '',
    '</section>',
    cuerpos.join('\n'),
    '</body></html>',
  ].join('');
}

function escaparTexto(texto) {
  const nodo = document.createElement('div');
  nodo.textContent = String(texto ?? '');
  return nodo.innerHTML;
}

function escaparAtributo(texto) {
  return escaparTexto(texto).replace(/"/g, '&quot;');
}

// Un documento recién puesto en el marco no está listo para imprimirse: las
// imágenes y las letras llegan después, y sin esperarlas el navegador imprime
// huecos en blanco.
async function esperarAlMarco(marco) {
  const doc = marco.contentDocument;
  await Promise.allSettled([
    ...[...doc.images].map((imagen) => imagen.decode().catch(() => null)),
    doc.fonts?.ready,
  ]);
}

async function imprimirLibro() {
  if (componiendoImpresion || !epubAbierto() || !lectorEpub.libro) return;
  const opciones = opcionesImpresionElegidas();
  guardarOpcionesImpresion();
  componiendoImpresion = true;
  $('btn-confirmar-imprimir').disabled = true;
  soltarDocumentoImpreso(false); // el marco se lleva el documento nuevo
  const marco = $('marco-impresion');
  let url = null;
  try {
    const documento = await componerDocumentoImpresion(opciones, (hechos, total) => {
      $('estado-imprimir').textContent = t('printPreparing', { done: hechos, total });
    });
    url = URL.createObjectURL(new Blob([documento], { type: 'text/html' }));
    await new Promise((listo, fallo) => {
      marco.onload = listo;
      marco.onerror = () => fallo(new Error('marco'));
      marco.src = url;
    });
    await esperarAlMarco(marco);
    $('estado-imprimir').textContent = '';
    componiendoImpresion = false;
    $('dialogo-imprimir').classList.add('oculto');
    // print() no vuelve hasta que se cierra el diálogo del navegador, así que
    // a partir de aquí ya se ha impreso (o se ha desistido): ni una cosa ni la
    // otra son un error, y en las dos hay que soltar el documento.
    marco.contentWindow.focus();
    marco.contentWindow.print();
  } catch (error) {
    $('estado-imprimir').textContent = t('printFailed');
    registro.anotar('error', 'impresión', explicarError(error));
  } finally {
    componiendoImpresion = false;
    $('btn-confirmar-imprimir').disabled = false;
    // El documento se suelta con calma: en algunos navegadores print() vuelve
    // antes de que se haya terminado de mandar a la impresora.
    if (url) {
      documentoImpreso = {
        url,
        plazo: setTimeout(() => {
          if (documentoImpreso?.url === url) soltarDocumentoImpreso(true);
        }, 20000),
      };
    }
  }
}

$('btn-imprimir').addEventListener('click', abrirDialogoImprimir);
for (const { opcion, campos } of MEDIDAS_A_MANO) {
  $(opcion).addEventListener('change', sincronizarMedidasPersonales);
  for (const [campo, tope] of campos) {
    // Lo escrito se recorta a lo que cabe en cuanto se suelta el campo: más
    // vale ver el número que se va a usar que descubrirlo en el papel.
    $(campo).addEventListener('change', () => {
      $(campo).value = impresion.numeroEnRango($(campo).value, impresion.LIMITES[tope]);
    });
  }
}
$('impresion-todos').addEventListener('click', () => elegirTodosLosCapitulos(true));
$('impresion-ninguno').addEventListener('click', () => elegirTodosLosCapitulos(false));
$('btn-cancelar-imprimir').addEventListener('click', cerrarDialogoImprimir);
$('btn-confirmar-imprimir').addEventListener('click', () => { imprimirLibro(); });
$('dialogo-imprimir').addEventListener('click', (evento) => {
  if (evento.target === $('dialogo-imprimir')) cerrarDialogoImprimir();
});

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

// Como barra lateral (pantallas anchas) el índice es un panel de navegación,
// no un diálogo: se queda abierto al saltar a un capítulo o al abrir otro
// panel. Flotando sobre la lectura, en cambio, estorba y se cierra.
function indiceFlotante() {
  return getComputedStyle($('panel-indice-libro')).position !== 'static';
}

function cerrarIndiceSiFlota() {
  if (indiceFlotante()) cerrarIndiceLibro();
}

// `recordar` distingue el cierre a mano (la ✕, que vale igual que apagar el
// botón: la barra no vuelve en el siguiente libro) del cierre automático al
// saltar a un capítulo en pantalla estrecha o al salir del libro.
function cerrarIndiceLibro({ recordar = false } = {}) {
  $('panel-indice-libro').classList.add('oculto');
  marcarBotonIndice(false);
  if (recordar) localStorage.setItem(CLAVE_INDICE_ABIERTO, '0');
}

// El botón se queda pulsado mientras el panel (o la barra lateral) está a la
// vista, para que se vea de un vistazo que la lectura está estrechada.
function marcarBotonIndice(abierto) {
  $('btn-indice-libro').setAttribute('aria-expanded', String(abierto));
  $('btn-indice-libro').setAttribute('aria-pressed', String(abierto));
  $('menu-indice').setAttribute('aria-pressed', String(abierto));
  // El tirador solo tiene sentido con la barra lateral desplegada.
  $('tirador-indice').classList.toggle('oculto', !abierto);
  $('vista-lector').classList.toggle('con-barra-lateral', abierto);
  etiquetarBotonIndice(abierto);
}

function etiquetarBotonIndice(abierto = $('btn-indice-libro').getAttribute('aria-pressed') === 'true') {
  const texto = t(panelNav.claveBotonIndice(abierto, hayIndiceLibro, conMiniaturas()));
  $('btn-indice-libro').title = texto;
  etiquetarPorTitulo($('btn-indice-libro'));
  $('menu-indice').innerHTML = icono('panel-left-text') + `<span>${texto}</span>`;
}

// Abrir la barra lateral es una preferencia de lectura, no algo de cada libro:
// si se deja abierta, sigue abierta con el siguiente. En pantalla estrecha no
// se restaura, porque ahí el panel flota encima de la página.
function indiceAbiertoGuardado() {
  return localStorage.getItem(CLAVE_INDICE_ABIERTO) === '1';
}

function restaurarPanelIndice() {
  const hayContenido = hayIndiceLibro || conMiniaturas();
  if (!hayContenido || !indiceAbiertoGuardado() || indiceFlotante()) return;
  $('panel-indice-libro').classList.remove('oculto');
  marcarBotonIndice(true);
  if (pestanaPanel === 'miniaturas') {
    prepararMiniaturas();
    marcarMiniaturaActual(true);
  } else {
    marcarEntradaIndiceActual(true);
  }
}

// ── Ancho de la barra lateral ── (los límites, en panel-navegacion.js)

function aplicarAnchoIndice(ancho) {
  const limitado = panelNav.anchoIndiceLimitado(ancho, window.innerWidth);
  document.documentElement.style.setProperty('--ancho-indice', `${limitado}px`);
  const tirador = $('tirador-indice');
  tirador.setAttribute('aria-valuenow', String(limitado));
  tirador.setAttribute('aria-valuemin', String(panelNav.ANCHO_INDICE_MINIMO));
  tirador.setAttribute('aria-valuemax', String(panelNav.anchoIndiceMaximo(window.innerWidth)));
  return limitado;
}

function guardarAnchoIndice(ancho) {
  localStorage.setItem(CLAVE_ANCHO_INDICE, String(aplicarAnchoIndice(ancho)));
  if (panelNav.tocaRehacerMiniaturas(medirAnchoMiniatura(), anchoMiniatura)) reiniciarMiniaturas();
}

function anchoIndiceGuardado() {
  const valor = parseInt(localStorage.getItem(CLAVE_ANCHO_INDICE), 10);
  return Number.isFinite(valor) ? valor : panelNav.ANCHO_INDICE_POR_DEFECTO;
}

aplicarAnchoIndice(anchoIndiceGuardado());

$('tirador-indice').addEventListener('pointerdown', (evento) => {
  evento.preventDefault();
  const tirador = $('tirador-indice');
  const izquierda = $('panel-indice-libro').getBoundingClientRect().left;
  tirador.setPointerCapture(evento.pointerId);
  tirador.classList.add('arrastrando');
  const mover = (mueve) => aplicarAnchoIndice(mueve.clientX - izquierda);
  const soltar = () => {
    tirador.classList.remove('arrastrando');
    tirador.removeEventListener('pointermove', mover);
    tirador.removeEventListener('pointerup', soltar);
    tirador.removeEventListener('pointercancel', soltar);
    guardarAnchoIndice(parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--ancho-indice')));
  };
  tirador.addEventListener('pointermove', mover);
  tirador.addEventListener('pointerup', soltar);
  tirador.addEventListener('pointercancel', soltar);
});

// Con el teclado: flechas para ajustar y doble clic (o Inicio) para volver al
// ancho de partida.
$('tirador-indice').addEventListener('keydown', (evento) => {
  const paso = evento.shiftKey ? 48 : 16;
  const actual = $('panel-indice-libro').getBoundingClientRect().width;
  if (evento.key === 'ArrowLeft') guardarAnchoIndice(actual - paso);
  else if (evento.key === 'ArrowRight') guardarAnchoIndice(actual + paso);
  else if (evento.key === 'Home') guardarAnchoIndice(panelNav.ANCHO_INDICE_POR_DEFECTO);
  else return;
  evento.preventDefault();
});

$('tirador-indice').addEventListener('dblclick', () => guardarAnchoIndice(panelNav.ANCHO_INDICE_POR_DEFECTO));

// Al estrechar la ventana, el panel no puede quedarse con más de media pantalla.
window.addEventListener('resize', () => aplicarAnchoIndice(
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ancho-indice'))));



// ── Panel de navegación: índice y miniaturas ──
//
// En PDF el panel tiene dos pestañas; en EPUB solo el índice. Cuando un PDF no
// trae índice (los escaneados casi nunca lo traen), el panel se abre
// directamente en las miniaturas, que es justo cuando más falta hacen.

let hayIndiceLibro = false;
let pestanaPanel = 'indice';

function conMiniaturas() {
  return !epubAbierto() && Boolean(lector.documento);
}

function mostrarPestanaPanel(cual) {
  pestanaPanel = cual === 'miniaturas' && conMiniaturas() ? 'miniaturas' : 'indice';
  const enMiniaturas = pestanaPanel === 'miniaturas';
  $('lista-indice-libro').classList.toggle('oculto', enMiniaturas);
  $('rejilla-miniaturas').classList.toggle('oculto', !enMiniaturas);
  // Un grupo de pestañas ocupa una sola parada del tabulador: se entra en la
  // activa y dentro se cambia con las flechas.
  for (const [pestana, activa] of [['pestana-indice', !enMiniaturas], ['pestana-miniaturas', enMiniaturas]]) {
    $(pestana).setAttribute('aria-selected', String(activa));
    $(pestana).tabIndex = activa ? 0 : -1;
  }
  $('titulo-panel-indice').textContent = t(enMiniaturas ? 'pageThumbnails' : 'bookIndex');
  if (enMiniaturas) prepararMiniaturas();
}

// Flechas, Inicio y Fin para moverse entre pestañas, como en cualquier otro
// grupo de pestañas: quien navega con teclado no espera tener que tabular.
$('pestanas-panel-indice').addEventListener('keydown', (evento) => {
  const pestanas = [...$('pestanas-panel-indice').querySelectorAll('.pestana-panel')]
    .filter((pestana) => !pestana.classList.contains('oculto'));
  const destino = panelNav.pestanaDestino(
    evento.key, pestanas.indexOf(document.activeElement), pestanas.length,
  );
  if (destino === null) return;
  evento.preventDefault();
  pestanas[destino].click();
  pestanas[destino].focus();
});

// Ajusta el panel al libro recién cargado: con qué pestañas cuenta y en cuál
// se abre. El botón aparece siempre que haya algo que enseñar.
function prepararPanelNavegacion() {
  reiniciarMiniaturas(); // pertenecían al libro anterior
  const disposicion = panelNav.disposicionPanel(hayIndiceLibro, conMiniaturas());
  $('btn-indice-libro').classList.toggle('oculto', !disposicion.hayBoton);
  $('pestanas-panel-indice').classList.toggle('oculto', !disposicion.hayPestanas);
  $('titulo-panel-indice').classList.toggle('oculto', !disposicion.hayTitulo);
  $('pestana-indice').classList.toggle('oculto', !disposicion.hayPestanaIndice);
  mostrarPestanaPanel(disposicion.pestanaInicial);
  etiquetarBotonIndice();
  restaurarPanelIndice();
  if (!$('fondo-menu-lector').classList.contains('oculto')) actualizarMenuLector();
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
      // Con qué comparar la posición de lectura para saber si es el capítulo
      // en curso: la página en PDF y la sección del «spine» en EPUB.
      if (Number.isInteger(entrada.numero)) boton.dataset.pagina = String(entrada.numero);
      if (Number.isInteger(entrada.seccion)) boton.dataset.seccion = String(entrada.seccion);
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
          cerrarIndiceSiFlota();
        } catch (error) {
          avisar(error.message, 5000);
        }
      });
      li.append(boton);
      lista.append(li);
    }
    hayIndiceLibro = entradas.length > 0;
    prepararPanelNavegacion();
    marcarEntradaIndiceActual();
  } catch {
    hayIndiceLibro = false;
    prepararPanelNavegacion();
  }
}

// ── Miniaturas de las páginas ──
//
// Se crean todos los huecos de golpe (son baratos) y solo se dibujan los que
// entran en la vista, soltando los que se alejan: un PDF largo no puede tener
// cientos de miniaturas en memoria. Los límites, en panel-navegacion.js.
let anchoMiniatura = panelNav.ANCHO_MINIATURA_MINIMO;

function medirAnchoMiniatura() {
  return panelNav.anchoDeMiniatura($('rejilla-miniaturas').clientWidth);
}
let observadorMiniaturas = null;
let miniaturasMontadas = 0;

function reiniciarMiniaturas() {
  observadorMiniaturas?.disconnect();
  observadorMiniaturas = null;
  $('rejilla-miniaturas').replaceChildren();
  miniaturasMontadas = 0;
  if (pestanaPanel === 'miniaturas' && !$('panel-indice-libro').classList.contains('oculto')) {
    prepararMiniaturas();
  }
}

function prepararMiniaturas() {
  const rejilla = $('rejilla-miniaturas');
  if (!conMiniaturas() || rejilla.childElementCount) return;
  anchoMiniatura = medirAnchoMiniatura();
  for (let numero = 1; numero <= lector.totalPaginas; numero++) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'miniatura-pagina';
    boton.dataset.pagina = String(numero);
    const hoja = document.createElement('span');
    hoja.className = 'hoja';
    const etiqueta = document.createElement('span');
    etiqueta.textContent = String(numero);
    boton.append(hoja, etiqueta);
    boton.addEventListener('click', async () => {
      try {
        await saltarConHistorial(numero);
        cerrarIndiceSiFlota();
      } catch (error) {
        avisar(error.message, 5000);
      }
    });
    rejilla.append(boton);
  }
  // El que se desplaza es el panel, no la rejilla: es él quien decide qué
  // miniaturas están a la vista y cuáles se pueden soltar.
  observadorMiniaturas = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (entrada.isIntersecting) pintarMiniatura(entrada.target);
    }
  }, { root: $('panel-indice-libro'), rootMargin: '300px 0px' });
  for (const boton of rejilla.children) observadorMiniaturas.observe(boton);
  marcarMiniaturaActual(true);
}

async function pintarMiniatura(boton) {
  if (boton.dataset.estado) return; // en curso o ya dibujada
  boton.dataset.estado = 'pintando';
  try {
    const lienzo = await lector.miniatura(Number(boton.dataset.pagina), anchoMiniatura);
    const hoja = boton.querySelector('.hoja');
    hoja.replaceChildren(lienzo);
    // La miniatura enseña lo mismo que la página, también sus imágenes.
    const datos = lienzo.datosRender;
    if (datos) {
      await lector.montarImagenesNaturales(
        hoja, datos.pagina, datos.vista, datos.desplazamiento, datos.dpr,
      );
    }
    boton.dataset.estado = 'lista';
    miniaturasMontadas += 1;
    podarMiniaturas();
  } catch {
    delete boton.dataset.estado; // se reintenta al volver a entrar en vista
  }
}

function podarMiniaturas() {
  // Se pregunta con cada miniatura que se dibuja, y medir cajas obliga al
  // navegador a recomponer: mientras quepan todas, ni se mira.
  if (miniaturasMontadas <= panelNav.MAXIMO_MINIATURAS) return;
  const marco = $('panel-indice-libro').getBoundingClientRect();
  const dibujadas = [...$('rejilla-miniaturas').children]
    .filter((boton) => boton.dataset.estado === 'lista')
    .map((boton) => ({
      boton,
      distancia: panelNav.distanciaFuera(boton.getBoundingClientRect(), marco),
    }));
  for (const { boton } of panelNav.miniaturasQuePodar(dibujadas, miniaturasMontadas)) {
    const lienzo = boton.querySelector('canvas');
    if (lienzo) { lienzo.width = 0; lienzo.height = 0; }
    boton.querySelector('.hoja').replaceChildren();
    delete boton.dataset.estado;
    miniaturasMontadas -= 1;
  }
}

// Resalta el capítulo por el que se va (cuál es, en panel-navegacion.js). Con
// `desplazar` se lleva además a la vista, que es lo que se espera al abrir el
// panel en mitad de un libro largo.
let entradaIndiceActiva = null;

// ¿Se ve entera dentro del panel?
function entradaALaVista(entrada) {
  return panelNav.estaALaVista(
    entrada.getBoundingClientRect(), $('panel-indice-libro').getBoundingClientRect(),
  );
}

function marcarEntradaIndiceActual(desplazar = false) {
  const lista = $('lista-indice-libro');
  const entradas = [...lista.querySelectorAll('.entrada-indice-libro')];
  if (!entradas.length) {
    entradaIndiceActiva = null;
    return;
  }
  const campo = epubAbierto() ? 'seccion' : 'pagina';
  const posicion = epubAbierto() ? lectorEpub.seccionActual : lector.pagina;
  const cual = panelNav.entradaActiva(
    entradas.map((entrada) => Number(entrada.dataset[campo])), posicion,
  );
  const activa = cual < 0 ? null : entradas[cual];
  for (const entrada of entradas) {
    entrada.toggleAttribute('aria-current', entrada === activa);
    if (entrada === activa) entrada.setAttribute('aria-current', 'true');
  }
  const cambioDeCapitulo = activa !== entradaIndiceActiva;
  entradaIndiceActiva = activa;
  if (!activa) return;
  // Al abrir el panel se lleva siempre a la vista. Con el panel ya abierto,
  // solo al cambiar de capítulo y si se ha quedado fuera: seguir la lectura
  // línea a línea le robaría el desplazamiento a quien está mirando el índice.
  if (desplazar || (cambioDeCapitulo && !entradaALaVista(activa))) {
    activa.scrollIntoView({ block: 'center' });
  }
}

function marcarMiniaturaActual(desplazar = false) {
  const rejilla = $('rejilla-miniaturas');
  if (!rejilla.childElementCount) return;
  const actual = String(lector.pagina);
  for (const boton of rejilla.children) {
    const esActual = boton.dataset.pagina === actual;
    if (esActual) boton.setAttribute('aria-current', 'true');
    else boton.removeAttribute('aria-current');
    if (esActual && desplazar) boton.scrollIntoView({ block: 'center' });
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
  if (Number.isFinite(marcador.porcentaje)) return `${formatearPorcentaje(marcador.porcentaje)} %`;
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

// El comparador de CFI de epub.js, que entiende su gramática (cargado siempre
// que hay un EPUB abierto). En PDF no hace falta: allí ordena la página.
function comparadorCfi() {
  if (!epubAbierto() || !window.ePub?.CFI) return null;
  const comparador = new window.ePub.CFI();
  return (a, b) => comparador.compare(a, b);
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
    etiquetarPorTitulo(editar);
    editar.innerHTML = icono('pencil');
    editar.addEventListener('click', () => {
      const respuesta = prompt(t('bookmarkNamePrompt'), marcador.nombre ?? '');
      if (respuesta === null) return;
      const actuales = progreso.marcadoresDe(libroActual.id);
      actuales[indice] = renombrarMarcador(actuales[indice], respuesta);
      progreso.guardarMarcadores(libroActual.id, actuales);
      planificarSincronizacion();
      pintarMarcadores();
      avisar(t('bookmarkRenamed'));
    });
    const borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.className = 'btn-icono btn-borrar-marcador';
    borrar.title = t('deleteBookmark');
    etiquetarPorTitulo(borrar);
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
  const marcadores = anadirMarcador(
    progreso.marcadoresDe(libroActual.id), posicion,
    $('nombre-marcador').value, new Date().toISOString(), comparadorCfi(),
  );
  if (!marcadores) {
    avisar(t('bookmarkExists'));
    return;
  }
  progreso.guardarMarcadores(libroActual.id, marcadores);
  planificarSincronizacion();
  pintarMarcadores();
  $('nombre-marcador').value = '';
  avisar(t('bookmarkAdded'));
});

$('btn-marcadores').addEventListener('click', () => {
  const panel = $('panel-marcadores');
  cerrarIndiceSiFlota();
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

  colocarJuntoAlTexto(ventana, rectangulo, { preferir: 'arriba' });
}

// Sitúa una ventana flotante junto al pasaje subrayado. Hay que medirla ya
// visible y en el origen, porque su tamaño depende del texto que lleve dentro.
function colocarJuntoAlTexto(elemento, rectangulo, opciones) {
  const { izquierda, arriba } = vistaAnotaciones.colocarFlotante({
    ancla: rectangulo,
    ancho: elemento.offsetWidth,
    alto: elemento.offsetHeight,
    ventana: { ancho: window.innerWidth, alto: window.innerHeight },
    ...opciones,
  });
  elemento.style.left = `${izquierda}px`;
  elemento.style.top = `${arriba}px`;
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
  // El menú cae debajo del subrayado y alineado por su derecha, donde está el
  // botón que lo abre.
  colocarJuntoAlTexto(menu, rectangulo, {
    preferir: 'abajo', alinear: 'derecha', separacion: 6,
  });
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

// Tanto el PDF como epub.js avisan de que se ha seleccionado texto, pero
// ninguno de los dos avisa de lo contrario: la barra se quedaba flotando sobre
// un texto que ya nadie tenía marcado. Se vigila la selección del documento (y
// la de los iframes de los capítulos, que llegan desde el lector de EPUB).
// Al pulsar un botón de la barra el navegador recoge la selección antes de que
// el clic llegue a su destino: sin una tregua la barra se escondía en el
// `pointerdown` y el resaltado no se llegaba a crear nunca. Se apunta el
// momento en vez de un interruptor porque un `pointerup` perdido —el dedo que
// sale de la pantalla, un menú del sistema— dejaría la barra clavada para
// siempre; así la tregua caduca sola.
let pulsadaBarraSeleccion = 0;
const TREGUA_BARRA = 500;

function ocultarBarraSiNoHaySeleccion() {
  if (!seleccionPendiente || haySeleccionActiva()) return;
  if (performance.now() - pulsadaBarraSeleccion < TREGUA_BARRA) return;
  seleccionPendiente = null;
  $('barra-seleccion').classList.add('oculto');
}

// El navegador no siempre avisa: al pulsar sobre las bandas de paso de página,
// que se quedan el evento, la selección se deshace sin `selectionchange`. Por
// eso se mira también al levantar el dedo, ya con el navegador al día.
function revisarSeleccion() {
  requestAnimationFrame(ocultarBarraSiNoHaySeleccion);
}

$('barra-seleccion').addEventListener('pointerdown', () => {
  pulsadaBarraSeleccion = performance.now();
});
for (const evento of ['pointerup', 'pointercancel']) {
  // El clic se despacha justo detrás del `pointerup`, así que el temporizador
  // levanta la tregua cuando el botón ya ha hecho su trabajo.
  document.addEventListener(evento, () => setTimeout(() => {
    pulsadaBarraSeleccion = 0;
    ocultarBarraSiNoHaySeleccion();
  }));
}
document.addEventListener('selectionchange', ocultarBarraSiNoHaySeleccion);

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
  const recortada = vistaAnotaciones.recortarNota(nota);
  anotacionesActuales = await anotaciones.crear(ambito, libroActual.id, {
    ...seleccion,
    color: vistaAnotaciones.colorValido(color, COLORES_RESALTADO),
    ...(recortada ? { nota: recortada } : {}),
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
  const nota = vistaAnotaciones.recortarNota($('texto-editar-nota').value);
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

function anotacionesOrdenadas() {
  return vistaAnotaciones.ordenarAnotaciones(anotacionesActuales);
}

function pintarAnotaciones(idEnfocado = null) {
  pintarNotaLibroLector();
  const lista = $('lista-anotaciones');
  lista.replaceChildren();
  const ordenadas = vistaAnotaciones.filtrarAnotaciones(
    anotacionesOrdenadas(),
    normalizarBusqueda($('buscar-anotaciones').value.trim()),
    normalizarBusqueda,
  );
  $('btn-exportar-anotaciones').classList.toggle('oculto',
    !anotacionesActuales.length && !(libroActual && progreso.notaDe(libroActual.id)));
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
      const destino = vistaAnotaciones.destinoDeAnotacion(anotacion);
      if (destino !== undefined) await saltarConHistorial(destino).catch((error) => avisar(error.message, 5000));
      cerrarPanelAnotaciones();
    });

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'btn-icono';
    editar.title = t('editNote');
    etiquetarPorTitulo(editar);
    editar.innerHTML = icono('pencil');
    editar.addEventListener('click', () => {
      editarAnotacionPorId(anotacion.id).catch((error) => avisar(error.message, 5000));
    });

    const borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.className = 'btn-icono';
    borrar.title = t('deleteAnnotation');
    etiquetarPorTitulo(borrar);
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
  return vistaAnotaciones.markdownDeAnotaciones({
    anotaciones: anotacionesOrdenadas(),
    notaLibro: progreso.notaDe(libroActual.id),
    ubicacionDe: ubicacionExportacion,
    textos: {
      cabecera: t('exportHeader', { title: libroActual.titulo }),
      origen: `${t('exportSource')} · ${fecha}`,
      notaDelLibro: t('bookNote'),
      nota: t('note'),
    },
  });
}

function exportarAnotaciones() {
  // Con nota y sin subrayados también hay algo que llevarse.
  if (!libroActual || !(anotacionesActuales.length || progreso.notaDe(libroActual.id))) return;
  const nombre = vistaAnotaciones.nombreDeArchivo(
    libroActual.titulo, t('annotations').toLowerCase(),
  );
  entregarDescarga(nombre, markdownAnotaciones(), 'text/markdown');
  avisar(t('annotationsExported'));
}

$('btn-exportar-anotaciones').addEventListener('click', exportarAnotaciones);

function abrirPanelAnotaciones(id = null) {
  ocultarNotaEmergente();
  cerrarMenuNota();
  cerrarBusquedaLibro();
  cerrarIndiceSiFlota();
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
  corteBusquedaLibro?.abort(); // no seguir recorriendo el libro a ciegas
  corteBusquedaLibro = null;
  $('panel-busqueda-libro').classList.add('oculto');
}

$('btn-buscar-libro').addEventListener('click', () => {
  const panel = $('panel-busqueda-libro');
  cerrarIndiceSiFlota();
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
  marcarBotonIndice(abrir);
  // Solo el gesto manual cambia la preferencia: el cierre automático al saltar
  // a un capítulo en pantalla estrecha no cuenta como «lo he cerrado yo».
  localStorage.setItem(CLAVE_INDICE_ABIERTO, abrir ? '1' : '0');
  if (!abrir) return;
  if (pestanaPanel === 'miniaturas') {
    prepararMiniaturas();
    marcarMiniaturaActual(true);
  } else {
    marcarEntradaIndiceActual(true);
  }
  // El foco va al capítulo en curso, no al primero de la lista: es el punto
  // desde el que se quiere navegar.
  const activa = panel.querySelector('.entrada-indice-libro[aria-current], .miniatura-pagina[aria-current]');
  (activa ?? panel.querySelector('.entrada-indice-libro, .miniatura-pagina'))?.focus();
});
$('cerrar-indice-libro').addEventListener('click', () => cerrarIndiceLibro({ recordar: true }));
$('pestana-indice').addEventListener('click', () => {
  mostrarPestanaPanel('indice');
  marcarEntradaIndiceActual(true);
});
$('pestana-miniaturas').addEventListener('click', () => {
  mostrarPestanaPanel('miniaturas');
  marcarMiniaturaActual(true);
});

$('form-busqueda-libro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const consulta = $('buscar-en-libro').value.trim();
  if (!consulta) return;
  const version = ++versionBusquedaLibro;
  corteBusquedaLibro?.abort(); // abandona el barrido anterior, no solo su resultado
  const corte = new AbortController();
  corteBusquedaLibro = corte;
  const estado = $('estado-busqueda-libro');
  const lista = $('resultados-busqueda-libro');
  estado.textContent = t('searchingBook');
  lista.replaceChildren();
  const esEpub = epubAbierto();
  const activo = esEpub ? lectorEpub : lector;
  consultaBusquedaLibro = consulta;
  resultadosBusquedaLibro = [];

  // Los resultados se van pintando según aparecen: en un libro largo se puede
  // saltar al primero sin esperar a que termine el recorrido.
  const pintarResultados = (nuevos) => {
    for (const resultado of nuevos) {
      const indice = resultadosBusquedaLibro.push(resultado) - 1;
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
    }
  };

  try {
    await activo.buscar(consulta, {
      senal: corte.signal,
      alEncontrar: (nuevos) => { if (version === versionBusquedaLibro) pintarResultados(nuevos); },
      alProgreso: (hechas, total) => {
        if (version !== versionBusquedaLibro || hechas >= total) return;
        estado.textContent = t('searchProgress', {
          done: hechas, total, count: resultadosBusquedaLibro.length,
        });
      },
    });
    if (version !== versionBusquedaLibro) return;
    estado.textContent = resultadosBusquedaLibro.length
      ? t('searchResults', { count: resultadosBusquedaLibro.length })
      : t('noSearchResults');
  } catch (error) {
    if (version === versionBusquedaLibro) estado.textContent = error.message;
  } finally {
    if (corteBusquedaLibro === corte) corteBusquedaLibro = null;
  }
});

$('btn-volver').addEventListener('click', () => {
  if (history.state?.[ESTADO_VISTA] === 'lector') history.back();
  else cerrarVistaLector();
});

// Los cuatro márgenes hacen lo mismo por dos caminos: izquierda y arriba
// atrás, derecha y abajo adelante. Muchos lectores pulsan abajo para seguir
// —es lo que hacen otras aplicaciones— y hasta ahora no pasaba nada.
$('zona-anterior').addEventListener('click', (evento) => pulsarZona(evento, true));
$('zona-siguiente').addEventListener('click', (evento) => pulsarZona(evento, false));
$('zona-arriba').addEventListener('click', (evento) => pulsarZona(evento, true));
$('zona-abajo').addEventListener('click', (evento) => pulsarZona(evento, false));

// Las zonas van por encima del libro, así que un enlace que caiga debajo
// —una nota al pie junto al margen, una entrada del índice del propio libro,
// una dirección web— se veía pero no se podía pulsar. Si hay uno bajo el
// punto que se ha tocado, manda él; el resto de la banda pasa página.
//
// Con las ilustraciones pasa lo mismo, y por eso se resuelven aquí: pulsarlas
// las abre ampliadas. El enlace va primero porque una imagen enlazada —una
// portada que lleva al índice— se pulsa para seguir el enlace, no para verla.
function pulsarZona(evento, atras) {
  // Las zonas son botones, y un botón pulsado con el ratón se queda con el
  // foco: a partir de ahí el espacio lo volvía a activar, así que después de
  // retroceder por el margen izquierdo el espacio retrocedía en vez de
  // avanzar. Se suelta el foco, y el espacio vuelve a ser de quien lee. Solo
  // cuando el clic viene de un puntero: llegando por teclado (Enter o Espacio
  // sobre la zona) el foco tiene que quedarse donde está.
  if (clicConPunto(evento)) evento.currentTarget?.blur();
  const objetivo = bajoElPunto(evento);
  if (objetivo?.enlace) objetivo.enlace.click();
  else if (objetivo?.imagen) abrirVisorImagen(objetivo.imagen);
  else pasarPagina(atras);
}

function bajoElPunto(evento) {
  if (!clicConPunto(evento)) return null;
  const { clientX: x, clientY: y } = evento;
  // En PDF los enlaces son de este mismo documento, tapados por la zona. Las
  // ilustraciones de un PDF no están aquí: la página es un lienzo dibujado.
  const enPagina = document.elementsFromPoint(x, y)
    .find((elemento) => elemento.matches?.('.capa-enlaces a'));
  if (enPagina) return { enlace: enPagina };
  // En EPUB el capítulo va en un iframe con sus propias coordenadas.
  for (const marco of $('contenedor-epub').querySelectorAll('iframe')) {
    const punto = puntoEnElMarco(x, y, marco.getBoundingClientRect());
    if (!punto) continue;
    try {
      const dentro = marco.contentDocument?.elementFromPoint(punto.x, punto.y);
      const enlace = dentro?.closest('a[href]');
      if (enlace) return { enlace };
      const imagen = imagenBajoElElemento(dentro, true);
      if (imagen) return { imagen };
    } catch { /* capítulo a medio montar: la banda pasa página y ya está */ }
  }
  return null;
}

// Muchos EPUB envuelven la ilustración en un <svg> con <image> dentro (es lo
// que genera Calibre para las páginas de portada), así que no basta con mirar
// las etiquetas <img>.
function imagenBajoElElemento(elemento, desdeZona) {
  const imagen = elemento?.closest?.('img, svg image, image');
  if (!imagen) return null;
  // El <img> ya resuelve su URL; el <image> del SVG da lo que ponga el
  // atributo, y ahí una ruta relativa al capítulo no significa nada fuera del
  // iframe: se resuelve contra la base del propio capítulo.
  const declarada = imagen.currentSrc || imagen.src
    || imagen.href?.baseVal || imagen.getAttribute('xlink:href') || '';
  let fuente = '';
  try {
    fuente = declarada ? new URL(declarada, imagen.ownerDocument?.baseURI).href : '';
  } catch { fuente = ''; }
  const caja = imagen.getBoundingClientRect();
  const datos = { fuente, ancho: caja.width, alto: caja.height };
  const vista = { ancho: window.innerWidth, alto: window.innerHeight };
  if (!imagenAmpliable(datos, vista, { desdeZona })) return null;
  return {
    fuente,
    descripcion: descripcionImagen(
      imagen.getAttribute('alt'), imagen.getAttribute('title'), t('zoomedImage'),
    ),
  };
}

// El visor tapa el libro entero: mientras está abierto no hay que pasar
// página ni cerrar paneles por debajo.
// Lo que tarda el visor en fundirse (css/estilos.css). Soltar la imagen antes
// de tiempo la borraría a mitad de la salida y se vería desaparecer de golpe.
const SALIDA_VISOR_IMAGEN = 200;
let sueltaImagenAmpliada = null;

function abrirVisorImagen({ fuente, descripcion }) {
  clearTimeout(sueltaImagenAmpliada);
  $('imagen-ampliada').src = fuente;
  $('imagen-ampliada').alt = descripcion;
  $('visor-imagen').classList.remove('oculto');
  $('btn-cerrar-imagen').focus();
}

function cerrarVisorImagen() {
  if ($('visor-imagen').classList.contains('oculto')) return;
  $('visor-imagen').classList.add('oculto');
  // La imagen se suelta al cerrar: en un libro con láminas grandes, dejarla
  // cargada mantiene viva su descodificación sin que nadie la mire.
  sueltaImagenAmpliada = setTimeout(() => {
    if (!visorImagenAbierto()) $('imagen-ampliada').removeAttribute('src');
  }, SALIDA_VISOR_IMAGEN);
}

function visorImagenAbierto() {
  return !$('visor-imagen').classList.contains('oculto');
}

// Tocar en cualquier parte cierra, que es lo que se espera de una imagen
// abierta a pantalla completa; el botón está para el teclado y para quien
// busque la salida a la vista.
$('visor-imagen').addEventListener('click', cerrarVisorImagen);


// Con cuánto aumento se está leyendo. En PDF es el de la página, ya resuelto
// (con «ajustar al ancho» no es el zoom pedido, sino el que sale del área); en
// EPUB, donde las lupas mueven la letra, es el tamaño de esta.
//
// El número ocupa el botón de en medio de las dos lupas, que sigue haciendo lo
// suyo: encajar la página al ancho, o devolver la letra al 100 % en EPUB. Así
// el hueco enseña algo en vez de repetir con un icono lo que dicen las lupas.
// Aumentos hechos que ofrece el panel. En PDF son escalas de la página; en
// EPUB, tamaños de letra, que no bajan de donde el texto deja de leerse.
const VALORES_ZOOM_PDF = [50, 75, 100, 125, 150, 200, 300, 400];
const VALORES_ZOOM_EPUB = [80, 90, 100, 120, 150, 200, 250, 300];

function zoomActual() {
  return epubAbierto() ? lectorEpub.tamano : lector.porcentajeZoom;
}

function pintarZoom() {
  const valor = zoomActual();
  const texto = Number.isFinite(valor) ? `${Math.round(valor)} %` : '';
  for (const id of ['btn-ancho-auto', 'menu-ancho-auto']) {
    $(id).textContent = texto;
    $(id).title = `${t('zoomLevel')} ${texto}. ${t('zoomChange')}`;
    // Con texto propio, el nombre accesible sería solo la cifra: se dice
    // también qué abre el botón, que es lo que se anuncia al enfocarlo.
    $(id).setAttribute('aria-label', `${t('zoomSettings')} (${texto})`);
  }
  if (!$('panel-zoom').hidden) pintarPanelZoom();
}

// El panel se rehace cada vez que se abre: sus valores dependen del formato
// (la página en PDF, la letra en EPUB) y de lo que haya puesto ahora mismo.
function pintarPanelZoom() {
  const enEpub = epubAbierto();
  const actual = Math.round(zoomActual());
  $('zoom-ancho').classList.toggle('oculto', enEpub);
  $('zoom-pagina').classList.toggle('oculto', enEpub);
  const valores = enEpub ? VALORES_ZOOM_EPUB : VALORES_ZOOM_PDF;
  $('valores-zoom').replaceChildren(...valores.map((valor) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = `${valor} %`;
    boton.setAttribute('aria-pressed', String(valor === actual));
    boton.addEventListener('click', () => aplicarZoom(valor));
    return boton;
  }));
  $('campo-zoom').min = enEpub ? 60 : 10;
  $('campo-zoom').max = enEpub ? 300 : 400;
  $('campo-zoom').value = String(actual);
}

// Deja el libro al aumento pedido: en PDF es la escala de la página y en
// EPUB, el tamaño de la letra. Lo que no se pueda dar (un PDF no se amplía
// sin fin) queda en lo más cercano, y el botón enseña lo que ha salido.
async function aplicarZoom(porcentaje) {
  cerrarPanelZoom();
  if (epubAbierto()) {
    const acotado = Math.min(300, Math.max(60, Math.round(porcentaje)));
    lectorEpub.cambiarTamano(acotado - lectorEpub.tamano);
    guardarLetraEpub();
  } else {
    await lector.fijarPorcentaje(porcentaje);
    guardarZoomPdf();
    aplicarAparienciaAjustePdf();
  }
  pintarZoom();
}

function cerrarPanelZoom() {
  $('panel-zoom').hidden = true;
  $('btn-ancho-auto').setAttribute('aria-expanded', 'false');
}

function alternarPanelZoom() {
  const abierto = !$('panel-zoom').hidden;
  cerrarPanelTexto();
  cerrarPanelTts();
  if (abierto) return cerrarPanelZoom();
  pintarPanelZoom();
  $('panel-zoom').hidden = false;
  $('btn-ancho-auto').setAttribute('aria-expanded', 'true');
  // En pantalla táctil no se enfoca el campo: saltaría el teclado y taparía
  // los valores hechos, que es lo que se suele venir a buscar.
  if (!window.matchMedia?.('(pointer: coarse)').matches) {
    $('campo-zoom').focus();
    $('campo-zoom').select();
  }
}

$('btn-ancho-auto').addEventListener('click', alternarPanelZoom);

$('zoom-ancho').addEventListener('click', async () => {
  cerrarPanelZoom();
  await lector.ajustar('ancho');
  guardarZoomPdf();
  aplicarAparienciaAjustePdf();
  pintarZoom();
});

$('zoom-pagina').addEventListener('click', () => {
  cerrarPanelZoom();
  $('btn-pagina-completa').click();
});

$('form-zoom').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const valor = Number($('campo-zoom').value);
  if (!Number.isFinite(valor) || valor <= 0) return;
  aplicarZoom(valor);
});

// Se cierra al tocar fuera, como los demás paneles de la barra.
document.addEventListener('click', (evento) => {
  if (!$('control-zoom').contains(evento.target)) cerrarPanelZoom();
});

async function ajustarZoom(direccion) {
  if (epubAbierto()) {
    lectorEpub.cambiarTamano(direccion * 10);
    guardarLetraEpub();
  } else {
    await lector.cambiarZoom(direccion > 0 ? 1.2 : 1 / 1.2);
    guardarZoomPdf();
    aplicarAparienciaAjustePdf();
  }
  pintarZoom();
}
$('btn-zoom-menos').addEventListener('click', () => ajustarZoom(-1));
$('btn-zoom-mas').addEventListener('click', () => ajustarZoom(1));

function cerrarPanelTexto() {
  $('panel-texto').hidden = true;
  $('btn-texto').setAttribute('aria-expanded', 'false');
}

// Los ajustes de texto de los EPUB se manejan desde dos sitios: el botón de la
// letra, para tocarlos mientras se lee, y Ajustes → Lector, para encontrarlos
// sin abrir un libro. Se describen una vez y se enlazan los dos mandos, que
// siempre enseñan lo mismo porque leen del mismo sitio.
const AJUSTES_TEXTO_EPUB = [
  {
    id: 'fuente-epub', clave: CLAVE_FUENTE_EPUB, inicial: 'libro',
    leer: () => fuenteEpubGuardada(),
    aplicar: (valor) => lectorEpub.cambiarFuente(valor),
  },
  {
    id: 'guionado-epub', clave: CLAVE_GUIONADO_EPUB, inicial: 'auto',
    leer: () => guionadoEpubGuardado(),
    aplicar: (valor) => lectorEpub.cambiarGuionado(valor),
  },
  {
    // La alineación es de cada libro: hay ediciones que solo se leen bien
    // justificadas y otras a las que la justificación les abre ríos.
    id: 'alineacion-epub', clave: CLAVE_ALINEACION_EPUB, inicial: 'libro',
    porLibro: CLAVE_ALINEACION_LIBRO,
    leer: () => alineacionEpubGuardada(),
    aplicar: (valor) => lectorEpub.cambiarAlineacion(valor),
  },
  {
    // Las columnas también son de cada libro, pero a diferencia de las demás
    // no salen de este aparato: lo que se lee en tres columnas en un monitor
    // ancho es ilegible en el móvil (ver CLAVES_PREFERENCIAS_COPIA).
    id: 'columnas-epub', clave: CLAVE_COLUMNAS_EPUB, inicial: 'auto',
    porLibro: CLAVE_COLUMNAS_LIBRO,
    leer: () => String(columnasGuardadas()),
    aplicar: (valor) => aplicarColumnas(valor),
  },
  {
    id: 'interlineado-epub', clave: CLAVE_INTERLINEADO_EPUB, inicial: 'libro',
    leer: () => {
      const valor = interlineadoEpubGuardado();
      return valor === null ? 'libro' : String(valor);
    },
    aplicar: (valor) => lectorEpub.cambiarInterlineado(valor === 'libro' ? null : valor),
  },
];

// Los dos mandos de un mismo ajuste: el del lector y el de Ajustes.
function mandosDe(id) {
  return [$(id), $(`${id}-ajustes`)].filter(Boolean);
}

// Refleja en los selectores los valores guardados en este dispositivo.
function pintarAjustesTexto() {
  for (const ajuste of AJUSTES_TEXTO_EPUB) {
    const valor = ajuste.leer();
    for (const mando of mandosDe(ajuste.id)) mando.value = valor;
  }
  pintarLetrasPorLinea();
}

for (const ajuste of AJUSTES_TEXTO_EPUB) {
  for (const mando of mandosDe(ajuste.id)) {
    mando.addEventListener('change', (evento) => {
      const valor = evento.target.value;
      // Con un libro delante, el cambio es suyo y de nadie más. Desde Ajustes,
      // sin libro abierto, lo que se toca es el valor de partida de los que
      // todavía no tienen el suyo, y ahí lo que viene de fábrica no se guarda:
      // así una versión futura puede cambiarlo sin arrastrar el antiguo.
      if (ajuste.porLibro && libroActual) guardarAjusteDelLibro(ajuste.porLibro, valor);
      else if (valor === ajuste.inicial) localStorage.removeItem(ajuste.clave);
      else localStorage.setItem(ajuste.clave, valor);
      ajuste.aplicar(valor);
      pintarAjustesTexto(); // el otro mando enseña lo mismo
      reflowEpub();
    });
  }
}

$('btn-texto').addEventListener('click', () => {
  const abrir = $('panel-texto').hidden;
  if (abrir) cerrarPanelZoom();
  $('panel-texto').hidden = !abrir;
  $('btn-texto').setAttribute('aria-expanded', String(abrir));
  if (abrir) {
    aplicarMargenEpub();
    pintarAjustesTexto();
    $('fuente-epub').focus();
  }
});

for (const mando of mandosDe('margen-epub')) {
  mando.addEventListener('input', (evento) => {
    const valor = Number(evento.target.value);
    if (libroActual) guardarAjusteDelLibro(CLAVE_MARGEN_LIBRO, valor);
    else localStorage.setItem(CLAVE_MARGEN_EPUB, String(valor));
    aplicarMargenEpub(valor);
  });
}

function restablecerAjustesTexto() {
  localStorage.setItem(CLAVE_MARGEN_EPUB, String(MARGEN_EPUB_INICIAL));
  // «Restablecer» devuelve todo a como viene de fábrica, así que el libro
  // abierto también suelta lo que hubiera decidido por su cuenta.
  guardarAjusteDelLibro(CLAVE_MARGEN_LIBRO, null);
  for (const ajuste of AJUSTES_TEXTO_EPUB) {
    localStorage.removeItem(ajuste.clave);
    if (ajuste.porLibro) guardarAjusteDelLibro(ajuste.porLibro, null);
    ajuste.aplicar(ajuste.leer());
  }
  aplicarMargenEpub(MARGEN_EPUB_INICIAL);
  localStorage.removeItem(CLAVE_LETRAS_LINEA);
  lectorEpub.cambiarLetrasPorLinea(LETRAS_INICIALES);
  pintarAjustesTexto();
  reflowEpub();
}

for (const id of ['btn-restablecer-texto', 'btn-restablecer-texto-ajustes']) {
  $(id)?.addEventListener('click', restablecerAjustesTexto);
}

// El largo de línea con el que el automático decide abrir otra columna. Se
// pinta mientras se arrastra, como el margen, para que se vea lo que se elige.
function pintarLetrasPorLinea(valor = letrasPorLineaGuardadas()) {
  const mando = $('letras-linea');
  if (!mando) return;
  mando.value = String(valor);
  const etiqueta = t('lineLengthValue', { value: valor });
  mando.setAttribute('aria-valuetext', etiqueta);
  $('valor-letras-linea').textContent = etiqueta;
}

$('letras-linea')?.addEventListener('input', (evento) => {
  const valor = normalizarLetrasPorLinea(evento.target.value);
  // Lo que viene de fábrica no se guarda, para que una versión futura pueda
  // cambiarlo sin arrastrar el número antiguo.
  if (valor === LETRAS_INICIALES) localStorage.removeItem(CLAVE_LETRAS_LINEA);
  else localStorage.setItem(CLAVE_LETRAS_LINEA, String(valor));
  pintarLetrasPorLinea(valor);
  lectorEpub.cambiarLetrasPorLinea(valor);
});

document.addEventListener('click', (evento) => {
  if (!$('control-texto').contains(evento.target)) cerrarPanelTexto();
  if (!$('control-columnas').contains(evento.target)) cerrarPanelColumnas();
});

// ───────────────────────── Lectura en voz alta ─────────────────────────

let ttsAvanzando = false;      // el propio TTS está pasando de página o capítulo
let ttsUltimaPosicion = null;  // posición que el TTS está leyendo
let cursorVoz = 0;             // dónde acabó la frase anterior en la página o capítulo
let cursorVozPrevio = 0;       // y dónde empezó a buscarse esa misma frase
let fraseVoz = '';             // la última frase anunciada por la voz

// El seguimiento mueve la vista solo, y esos movimientos no son «navegar a
// mano»: la voz no debe detenerse por ellos. Se mira cuándo movió de verdad
// —no cada frase—, con margen para el desplazamiento suave y para las
// reubicaciones con las que epub.js afina el CFI después.
function vistaMovidaPorLaVoz() {
  if (ttsAvanzando) return true;
  const movimiento = epubAbierto() ? lectorEpub?.movimientoVoz : lector?.movimientoVoz;
  return Boolean(movimiento) && Date.now() - movimiento < 1500;
}

// Resalta la frase que empieza a sonar y, si se ha salido de la vista, la trae:
// en un EPUB paginado eso pasa las páginas al ritmo de la voz.
async function seguirFraseConLaVista(frase, { nuevaPagina } = {}) {
  if (nuevaPagina) {
    cursorVoz = 0;
    cursorVozPrevio = 0;
  }
  // Al continuar tras una pausa se repite la frase interrumpida: hay que
  // buscarla donde ya estaba, no a partir de su propio final.
  const desde = frase === fraseVoz ? cursorVozPrevio : cursorVoz;
  fraseVoz = frase;
  // El paso de página que hubiera pendiente era de la frase anterior.
  cancelarPasoDePaginaPorVoz();
  try {
    const fin = epubAbierto()
      ? await lectorEpub.seguirVoz(frase, desde)
      : lector.seguirVoz(frase, desde);
    if (fin !== null && fin !== undefined) {
      cursorVozPrevio = desde;
      cursorVoz = fin;
    }
  } catch { /* no poder seguir el texto no debe cortar la lectura */ }
}

// Pasar de página a mitad de la frase que la parte en dos.
//
// En un EPUB paginado la voz lee el capítulo seguido, así que hay frases que
// empiezan al final de una página y acaban en la siguiente. Quedarse en la
// primera hasta que la frase termina rompe la lectura: se ve un trozo y se
// oye lo que no se ve. Se pasa de página cuando la voz llega al corte, que se
// sitúa por la parte de la frase que cabía en la página (la fracción que
// avisa el lector) y por lo que dura la frase al ritmo medido de esta voz.
//
// Es una estimación: no hay forma fiable de saber por qué palabra va el
// motor. Si se queda corta o larga, la página pasa un poco antes o después,
// que es lo mismo que hacía antes al terminar la frase, pero sin el parón.
let temporizadorPasoVoz = null;

function cancelarPasoDePaginaPorVoz() {
  clearTimeout(temporizadorPasoVoz);
  temporizadorPasoVoz = null;
}

function programarPasoDePaginaPorVoz(fraccion) {
  cancelarPasoDePaginaPorVoz();
  if (vozLectura.estado !== 'leyendo' || !fraseVoz) return;
  const espera = vozLectura.duracionEstimada(fraseVoz) * fraccion;
  temporizadorPasoVoz = setTimeout(() => {
    temporizadorPasoVoz = null;
    if (vozLectura.estado !== 'leyendo' || !epubAbierto()) return;
    lectorEpub.pasarPaginaPorVoz();
  }, Math.max(200, espera));
}

function limpiarSeguimientoVoz() {
  cancelarPasoDePaginaPorVoz();
  cursorVoz = 0;
  cursorVozPrevio = 0;
  fraseVoz = '';
  try { lector?.limpiarVoz?.(); } catch { /* sin PDF montado */ }
  try { lectorEpub?.limpiarVoz?.(); } catch { /* sin EPUB montado */ }
}

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

async function textoPaginasPdf({ desdeLaVista = false } = {}) {
  const numeros = [lector.pagina];
  if (lector.enDoble() && lector.pagina + 1 <= lector.totalPaginas) numeros.push(lector.pagina + 1);
  const partes = [];
  for (const numero of numeros) {
    const pagina = await lector.documento.getPage(numero);
    const contenido = await pagina.getTextContent();
    partes.push(contenido.items.map((item) => item.str).join(' '));
  }
  const texto = partes.join(' ');
  // Al arrancar la lectura se empieza por la primera frase que se ve, no por
  // el principio de la página, que en continuo asoma cortada por arriba.
  return desdeLaVista ? texto.slice(lector.recorteVisible(texto)) : texto;
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
    await lector.siguiente({ suave: true });
    return true;
  } finally {
    if (!epubAbierto()) ttsAvanzando = false;
  }
}

const vozLectura = new LectorVoz({
  obtenerTexto: ({ inicio = false } = {}) => (epubAbierto()
    ? Promise.resolve(lectorEpub.textoDesdePosicion({ desdeLaVista: inicio }))
    : textoPaginasPdf({ desdeLaVista: inicio })),
  avanzar: avanzarLecturaVoz,
  alCambiarEstado: () => pintarEstadoVoz(),
  alFallo: (clave) => avisar(t(clave), 6000),
  alLeerFrase: (frase, datos) => { seguirFraseConLaVista(frase, datos); },
});

function detenerLecturaVoz() {
  if (vozLectura.estado !== 'parado') vozLectura.detener();
}

function pintarEstadoVoz() {
  const estado = vozLectura.estado;
  const activo = estado !== 'parado';
  // Pausada se conserva la marca (dice por dónde iba); parada, se retira.
  if (!activo) limpiarSeguimientoVoz();
  // Al pausar, la página no debe pasar sola: la frase ya no está sonando.
  if (estado !== 'leyendo') cancelarPasoDePaginaPorVoz();
  const etiqueta = estado === 'leyendo' ? 'ttsPause' : (estado === 'pausado' ? 'ttsResume' : 'ttsPlay');
  $('btn-tts-leer').innerHTML =
    icono(estado === 'leyendo' ? 'pause' : 'play') + `<span>${t(etiqueta)}</span>`;
  $('btn-tts-detener').disabled = !activo;
  $('btn-tts-detener').innerHTML = icono('square') + `<span>${t('ttsStop')}</span>`;
  pintarBotonVoz();
  pintarControlVoz();
}

// El control flotante solo existe mientras la lectura está en marcha: es la
// pausa que se ve sin abrir nada, también en las pantallas donde el altavoz
// está guardado en el menú «⋯».
function pintarControlVoz() {
  const estado = vozLectura.estado;
  $('control-voz').hidden = estado === 'parado';
  if (estado === 'parado') return;
  const leyendo = estado === 'leyendo';
  const etiqueta = t(leyendo ? 'ttsPause' : 'ttsResume');
  const boton = $('btn-voz-pausa');
  boton.innerHTML = icono(leyendo ? 'pause' : 'play') + `<span>${etiqueta}</span>`;
  boton.title = etiqueta;
  boton.setAttribute('aria-label', etiqueta);
}

// Los toques en el control no son toques en la página: sin esto pasarían hoja.
for (const id of ['btn-voz-pausa', 'btn-voz-detener']) {
  $(id).addEventListener('pointerdown', (evento) => evento.stopPropagation());
}

$('btn-voz-pausa').addEventListener('click', (evento) => {
  evento.stopPropagation();
  if (vozLectura.estado === 'leyendo') vozLectura.pausar();
  else vozLectura.reanudar();
});

$('btn-voz-detener').addEventListener('click', (evento) => {
  evento.stopPropagation();
  detenerLecturaVoz();
});

document.addEventListener('idioma-cambiado', pintarControlVoz);

// Mientras suena la lectura, el altavoz de la barra pausa y reanuda: con el
// panel retirado para no tapar el texto, pausar tiene que estar a un toque. El
// icono y el título dicen en cada momento qué va a hacer, y los ajustes (voz,
// velocidad, detener) siguen en su panel, que abre el menú «⋯».
function pintarBotonVoz() {
  const estado = vozLectura.estado;
  const boton = $('btn-tts');
  const dibujo = boton.querySelector('[data-icono]') ?? boton;
  const nombre = estado === 'leyendo' ? 'pause' : estado === 'pausado' ? 'play' : 'volume-2';
  dibujo.dataset.icono = nombre;
  dibujo.innerHTML = icono(nombre);
  const titulo = estado === 'leyendo' ? t('ttsPause')
    : estado === 'pausado' ? t('ttsResume') : t('readAloud');
  boton.title = titulo;
  boton.setAttribute('aria-label', titulo);
  boton.setAttribute('aria-pressed', String(estado !== 'parado'));
}

document.addEventListener('idioma-cambiado', pintarBotonVoz);

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
  cursorVoz = 0;
  // El panel se retira: lo que hay debajo es justo el texto que se va a leer y
  // a seguir con la vista. El botón del altavoz lo vuelve a abrir.
  cerrarPanelTts();
  vozLectura.iniciar().catch(() => vozLectura.detener());
}

function cerrarPanelTts() {
  $('panel-tts').hidden = true;
  $('btn-tts').setAttribute('aria-expanded', 'false');
}

function abrirPanelTts(abrir = true) {
  cerrarPanelTexto();
  cerrarPanelZoom();
  $('panel-tts').hidden = !abrir;
  $('btn-tts').setAttribute('aria-expanded', String(abrir));
  if (!abrir) return;
  pintarVocesTts();
  pintarEstadoVoz();
  $('velocidad-tts').value = String(velocidadTtsGuardada());
  $('btn-tts-leer').focus();
}

$('btn-tts').addEventListener('click', () => {
  if (!vozLectura.disponible()) {
    avisar(t('ttsNoSupport'), 6000);
    return;
  }
  // Con la lectura en marcha el altavoz es el botón de pausa; parada, abre el
  // panel para empezar y elegir voz y velocidad.
  if (vozLectura.estado === 'leyendo') return void vozLectura.pausar();
  if (vozLectura.estado === 'pausado') return void vozLectura.reanudar();
  abrirPanelTts($('panel-tts').hidden);
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
  // La imagen ampliada tapa el libro entero: es siempre lo último que se ha
  // abierto y lo primero que se cierra.
  if (visorImagenAbierto()) {
    cerrarVisorImagen();
    return;
  }
  // El menú del tema va primero: es de la cabecera de la biblioteca, así que
  // se abre por encima de todo lo demás y nunca coincide con un diálogo.
  if (!$('panel-tema').hidden) {
    cerrarPanelTema();
    $('btn-tema').focus();
    return;
  }
  if (fichaAbiertaDe) {
    cerrarFichaLibro();
    return;
  }
  if (!$('dialogo-registro').classList.contains('oculto')) {
    cerrarRegistro();
    return;
  }
  if (!$('dialogo-nota-libro').classList.contains('oculto')) {
    cerrarNotaLibro();
    return;
  }
  if (!$('dialogo-pdf-sin-texto').classList.contains('oculto')) {
    cerrarAvisoPdfSinTexto();
    return;
  }
  if (!$('dialogo-imprimir').classList.contains('oculto')) {
    cerrarDialogoImprimir();
    return;
  }
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
  } else if (!$('panel-zoom').hidden) {
    cerrarPanelZoom();
    $('btn-ancho-auto').focus();
  } else if (!$('panel-columnas').hidden) {
    cerrarPanelColumnas();
    $('btn-columnas').focus();
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
  $('zoom-ancho').setAttribute('aria-pressed', String(esPdf && lector.ajuste === 'ancho'));
  $('zoom-pagina').setAttribute('aria-pressed', String(esPdf && lector.ajuste === 'pagina'));
  for (const id of ['btn-pagina-completa', 'menu-pagina-completa']) {
    $(id).setAttribute('aria-pressed', String(esPdf && lector.ajuste === 'pagina'));
  }
  $('btn-recorte').setAttribute('aria-pressed', String(esPdf && lector.recorte));
}

// Recorta los márgenes en blanco del PDF: analiza el documento la primera vez
// y avisa si no hay nada que recortar, para que el botón no parezca roto.
$('btn-recorte').addEventListener('click', async () => {
  if (epubAbierto()) return;
  const activar = !lector.recorte;
  $('btn-recorte').disabled = true;
  try {
    await lector.cambiarRecorte(activar);
  } finally {
    $('btn-recorte').disabled = false;
  }
  localStorage.setItem(CLAVE_RECORTE_PDF, lector.recorte ? '1' : '0');
  aplicarAparienciaAjustePdf();
  reiniciarMiniaturas(); // se dibujan recortadas, como la lectura
  if (activar && !lector.recorteComun) avisar(t('noMarginsToCrop'));
});

$('btn-pagina-completa').addEventListener('click', async () => {
  if (epubAbierto()) return;
  await lector.ajustar('pagina');
  guardarZoomPdf();
  aplicarAparienciaAjustePdf();
});

function pedirPosicionLibro() {
  if (epubAbierto()) {
    if (!lectorEpub.conLocalizaciones) return;
    const respuesta = prompt(t('goPercent'), formatearPorcentaje(lectorEpub.porcentaje));
    // Se admite la coma decimal: es lo que se ofrece de partida en español y
    // en catalán, y sería absurdo no aceptar de vuelta lo que se propone.
    const numero = parseFloat(String(respuesta ?? '').replace(',', '.'));
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

// ── Tema: el del sistema, claro, sepia, oscuro o negro ──
// Un botón en la cabecera de la biblioteca que abre un menú, como el de las
// columnas del lector. Antes recorría los estados en rueda, y con cinco había
// que pasar por los que no querías para llegar al que sí. El icono enseña el
// estado puesto —no a dónde lleva el botón— y el menú marca cuál es.

const ICONO_TEMA = {
  auto: 'contrast', claro: 'sun', sepia: 'coffee', oscuro: 'moon', negro: 'moon-star',
};
const NOMBRE_TEMA = {
  auto: 'themeAuto', claro: 'themeLight', sepia: 'themeSepia',
  oscuro: 'themeDark', negro: 'themeBlack',
};

function pintarControlesTema() {
  const elegido = temaElegido();
  $('btn-tema').innerHTML = icono(ICONO_TEMA[elegido]);
  $('btn-tema').title = `${t('theme')}: ${t(NOMBRE_TEMA[elegido])}`;
  etiquetarPorTitulo($('btn-tema'));
  if (!$('panel-tema').hidden) pintarMenuTema();
  pintarVariantesAuto();
}

// Una opción por tema, con su icono y una marca en el que está puesto. «El del
// sistema» va primero porque es de donde se parte y a donde se vuelve.
function pintarMenuTema() {
  const panel = $('panel-tema');
  const puesto = temaElegido();
  panel.replaceChildren();
  for (const tema of TEMAS) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'item-menu-lector';
    boton.setAttribute('role', 'menuitemradio');
    boton.setAttribute('aria-checked', String(tema === puesto));
    boton.innerHTML = `${icono(ICONO_TEMA[tema])}<span>${t(NOMBRE_TEMA[tema])}</span>` +
      (tema === puesto ? icono('circle-check', 'icono marca-opcion') : '');
    boton.addEventListener('click', () => elegirTema(tema));
    panel.append(boton);
  }
}

function cerrarPanelTema() {
  $('panel-tema').hidden = true;
  $('btn-tema').setAttribute('aria-expanded', 'false');
}

function elegirTema(tema) {
  cerrarPanelTema();
  $('btn-tema').focus();
  guardarTema(tema);
  // El aviso confirma el estado nuevo: entre «claro» y «el del sistema» en un
  // equipo con tema claro no hay diferencia visible, y sin él no se sabría.
  avisar(t(NOMBRE_TEMA[tema]), 1600);
}

// ── Qué tema usa «el del sistema» a cada lado (Ajustes → Biblioteca) ──
// Los dos selectores y sus muestras. La muestra lleva el data-tema de lo
// elegido, así que se pinta con esa paleta aunque la aplicación esté en otra:
// se ve el lado que el sistema no está pidiendo ahora sin tener que cambiar el
// tema del dispositivo para comprobarlo.

const MANDO_VARIANTE = { claro: 'tema-auto-claro', oscuro: 'tema-auto-oscuro' };
const MUESTRA_VARIANTE = { claro: 'muestra-tema-claro', oscuro: 'muestra-tema-oscuro' };

function pintarVariantesAuto() {
  for (const lado of LADOS_AUTO) {
    const tema = varianteAuto(lado);
    $(MANDO_VARIANTE[lado]).value = tema;
    const muestra = $(MUESTRA_VARIANTE[lado]);
    muestra.dataset.tema = tema;
    muestra.querySelector('.muestra-titulo').textContent = t(NOMBRE_TEMA[tema]);
  }
  // Con el tema puesto a mano, estos ajustes no cambian nada de lo que se ve:
  // decirlo evita que alguien toque los selectores esperando que la aplicación
  // se transforme y crea que están rotos.
  const enAuto = temaElegido() === 'auto';
  $('estado-tema-auto').textContent = enAuto
    ? t('autoThemeNow', { theme: t(NOMBRE_TEMA[temaEfectivo()]) })
    : t('autoThemeIdle', { theme: t(NOMBRE_TEMA[temaElegido()]) });
}

for (const lado of LADOS_AUTO) {
  $(MANDO_VARIANTE[lado]).addEventListener('change', (evento) => {
    guardarVarianteAuto(lado, evento.target.value);
    pintarVariantesAuto();
  });
}

document.addEventListener('idioma-cambiado', pintarVariantesAuto);

$('btn-tema').addEventListener('click', () => {
  const panel = $('panel-tema');
  if (!panel.hidden) return cerrarPanelTema();
  pintarMenuTema();
  panel.hidden = false;
  $('btn-tema').setAttribute('aria-expanded', 'true');
  panel.querySelector('button')?.focus();
});

document.addEventListener('click', (evento) => {
  if (!$('control-tema').contains(evento.target)) cerrarPanelTema();
});

document.addEventListener('tema-cambiado', pintarControlesTema);
document.addEventListener('idioma-cambiado', pintarControlesTema);
// Su texto depende de lo que traiga el libro, así que no lo cubre el paso
// automático de traducciones.
document.addEventListener('idioma-cambiado', () => etiquetarBotonIndice());
document.addEventListener('idioma-cambiado', pintarZoom);

// ── Del papel aparte al tema único ──
// Hasta ahora el papel del libro se elegía por su cuenta, y encima podía haber
// uno propio por libro. Quien leía en sepia o de noche se queda con ese tema
// en toda la aplicación, que es lo que ahora significa; las claves viejas se
// borran para no dejar preferencias huérfanas en el navegador.
function migrarPapelAlTema() {
  try {
    const papel = localStorage.getItem(CLAVE_TEMA_PAGINA_VIEJA)
      ?? (localStorage.getItem(CLAVE_NOCHE_VIEJA) === '1' ? 'noche' : null);
    const equivalente = { claro: 'claro', sepia: 'sepia', noche: 'oscuro' }[papel];
    // Un tema elegido a mano manda sobre el papel heredado.
    if (equivalente && temaElegido() === 'auto') guardarTema(equivalente);
    for (const clave of
      [CLAVE_NOCHE_VIEJA, CLAVE_TEMA_PAGINA_VIEJA, CLAVE_TEMA_PAGINA_LIBRO_VIEJA]) {
      localStorage.removeItem(clave);
    }
  } catch { /* sin almacenamiento no hay nada que migrar */ }
}

// El aumento del PDF y el cuerpo de letra del EPUB eran de la aplicación
// entera; ahora son de cada libro y arrancan al 100 %. Los valores sueltos que
// quedaran de antes ya no los lee nadie, así que se retiran.
function limpiarAjustesGlobalesViejos() {
  try {
    // 'lector.modo' y 'lector.doble' valían para toda la biblioteca; ahora
    // cada libro lleva el suyo y el que se abre por primera vez va de fábrica.
    for (const clave of ['lector.zoomPdf', 'lector.ajustePdf', 'lector.letraEpub',
      'lector.modo', 'lector.doble']) {
      localStorage.removeItem(clave);
    }
  } catch { /* sin almacenamiento no hay nada que limpiar */ }
}

// ── Imágenes en su color con el tema oscuro ──
//
// Invertir la página deja las fotos y los logotipos en negativo. Esto los
// devuelve a su color, y es cosa del usuario porque no hay una respuesta
// buena para todos los documentos: en uno escaneado la página entera es una
// imagen, y ahí lo que se quiere es justo lo contrario.

function imagenesNaturalesActivo() {
  return localStorage.getItem(CLAVE_IMAGENES_NATURALES) === '1';
}

// El botón solo sale cuando puede hacer algo: con un PDF abierto y la página
// invertida. En EPUB no hace falta (allí no se filtra nada) y con el tema
// claro o el sepia no hay negativo que deshacer.
function aplicarImagenesNaturales() {
  const procede = Boolean(libroActual) && !epubAbierto() && esTemaOscuro();
  const activo = procede && imagenesNaturalesActivo();
  $('btn-imagenes-noche').classList.toggle('oculto', !procede);
  $('btn-imagenes-noche').setAttribute('aria-pressed', String(activo));
  $('btn-imagenes-noche').title = t(activo ? 'imagesInvertedOn' : 'imagesInvertedOff');
  etiquetarPorTitulo($('btn-imagenes-noche'));
  if (lector.imagenesNaturales === activo) return;
  lector.imagenesNaturales = activo;
  lector.refrescarImagenesNaturales();
  if (pestanaPanel === 'miniaturas' && !$('panel-indice-libro').classList.contains('oculto')) {
    reiniciarMiniaturas();
    prepararMiniaturas();
    marcarMiniaturaActual();
  }
}

$('btn-imagenes-noche').addEventListener('click', () => {
  const activo = !imagenesNaturalesActivo();
  localStorage.setItem(CLAVE_IMAGENES_NATURALES, activo ? '1' : '0');
  aplicarImagenesNaturales();
});

// El tema es también el papel del libro: en EPUB se cambian los colores del
// texto, así que las ilustraciones se ven tal cual, y en PDF, que es una
// imagen ya dibujada, se tiñe la página entera con el filtro del tema.
function aplicarPapel() {
  lectorEpub.aplicarTemaPagina(temaEfectivo());
  aplicarImagenesNaturales();
}

document.addEventListener('tema-cambiado', aplicarPapel);

// Elementos que ya usan las flechas y el espacio para lo suyo: escribir, abrir
// un desplegable o moverse por sus opciones.
const ETIQUETAS_CON_TECLADO_PROPIO = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);

// Diálogos y menús que se superponen al libro: mientras alguno esté abierto,
// las teclas son suyas aunque el foco no haya llegado a caer dentro.
const CAPAS_SOBRE_EL_LIBRO = ['dialogo-mover', 'dialogo-editar-nota',
  'dialogo-contrasena-pdf', 'dialogo-pdf-sin-texto', 'dialogo-imprimir',
  'menu-libro', 'fondo-menu-lector', 'menu-nota-contextual', 'visor-imagen'];

// Decide si otra parte de la interfaz tiene preferencia sobre estas teclas.
// Sin esta comprobación, elegir el interlineado con las flechas o escribir un
// espacio en una nota pasaba de página además de hacer lo suyo.
function tecladoOcupado(evento) {
  if (evento.defaultPrevented) return true; // p. ej. el tirador del panel
  if (CAPAS_SOBRE_EL_LIBRO.some((id) => !$(id).classList.contains('oculto'))) return true;
  const destino = evento.target;
  if (!(destino instanceof HTMLElement)) return false;
  if (ETIQUETAS_CON_TECLADO_PROPIO.has(destino.tagName) || destino.isContentEditable) return true;
  // El espacio activa el botón o el enlace que tenga el foco; no debe además
  // pasar de página.
  if (evento.key === ' ' && destino.closest('button, a[href], summary, [role="menuitem"]')) return true;
  return Boolean(destino.closest('[role="dialog"]'));
}

// Al retroceder de página con el espacio se llega por abajo, así que la
// página anterior se abre por el final: empezarla por arriba obligaría a
// bajar toda ella para seguir leyendo hacia atrás.
let abrirPaginaPorElFinal = false;

function recorrerConEspacio(haciaAtras) {
  const area = $('area-lectura');
  const decision = decidirEspacio({
    scrollTop: area.scrollTop,
    scrollHeight: area.scrollHeight,
    clientHeight: area.clientHeight,
    haciaAtras,
  });
  if (decision.accion === 'desplazar') {
    area.scrollTo({ top: decision.destino, behavior: 'smooth' });
    return;
  }
  // Solo tiene sentido pasando página: en continuo el desplazamiento recorre
  // el documento entero y el «final» sería el del libro, no el de la página.
  abrirPaginaPorElFinal = haciaAtras && !epubAbierto() && lector.modo !== 'continuo'
    && hayPaginaDestino(true);
  pasarPagina(haciaAtras);
}

// El salto al final se hace después de que la página esté montada: antes no
// se sabe cuánto mide. Lo llama `cuandoCambiaPagina`, que es justo el momento.
function colocarPaginaSiVeniaDelEspacio() {
  if (!abrirPaginaPorElFinal) return;
  abrirPaginaPorElFinal = false;
  const area = $('area-lectura');
  area.scrollTop = area.scrollHeight - area.clientHeight;
}

function manejarTecla(evento) {
  if ($('vista-lector').classList.contains('oculto')) return;
  if (tecladoOcupado(evento)) return;
  switch (evento.key) {
    case 'ArrowLeft': case 'PageUp': pasarPagina(true); break;
    case 'ArrowRight': case 'PageDown': pasarPagina(false); break;
    // El espacio (y Mayúsculas+espacio hacia atrás) recorre primero lo que
    // queda de página y solo pasa de página al llegar al tope. Se le quita al
    // navegador su desplazamiento porque el salto lo damos aquí, con solape.
    case ' ': evento.preventDefault(); recorrerConEspacio(evento.shiftKey); break;
    // Arriba y abajo hacen lo mismo que el dedo, y con la misma condición: solo
    // cuando la página entera está a la vista. Si hay algo que desplazar —modo
    // continuo, zoom, una página más alta que la ventana—, las flechas son del
    // desplazamiento, que es lo que espera quien las pulsa.
    case 'ArrowUp': if (gestoVerticalPermitido()) pasarPagina(true); break;
    case 'ArrowDown': if (gestoVerticalPermitido()) pasarPagina(false); break;
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
// Oculta la barra superior para leer a pantalla completa. Se entra y se sale
// por su botón, y nada más: el toque en la página también lo hacía, pero es
// lo que uno hace para pasar página, para quitar una selección o sin más al
// posar el dedo, y la barra iba y venía sin que nadie se lo hubiera pedido.

function haySeleccionActiva() {
  const principal = window.getSelection();
  if (principal && !principal.isCollapsed) return true;
  for (const contents of lectorEpub.vista?.getContents?.() ?? []) {
    const seleccion = contents.window?.getSelection?.();
    if (seleccion && !seleccion.isCollapsed) return true;
  }
  return false;
}

// Alto de la barra medido justo antes de recogerla: la animación necesita un
// número de partida, porque de «auto» a cero el navegador no sabe interpolar.
let altoBarraLector = 0;
let finBarraLector = null;

function animarBarraLector(entrando) {
  const barra = document.querySelector('.barra-lector');
  if (!barra) return;
  clearTimeout(finBarraLector);
  if (entrando) altoBarraLector = barra.offsetHeight;
  barra.classList.add('barra-animando');
  barra.style.height = `${entrando ? altoBarraLector : 0}px`;
  void barra.offsetHeight; // un fotograma con la altura de partida ya aplicada
  $('vista-lector').classList.toggle('inmersivo', entrando);
  barra.style.height = `${entrando ? 0 : altoBarraLector}px`;
  finBarraLector = setTimeout(() => {
    barra.classList.remove('barra-animando');
    // Desplegada se le devuelve su altura natural, que la barra crece o
    // encoge según los botones que haga falta enseñar en cada libro.
    if (!entrando) barra.style.height = '';
    // El EPUB se repagina con la altura definitiva: hacerlo a media animación
    // deja el texto cortado donde estaba la barra.
    if (epubAbierto()) reflowEpub();
    else window.dispatchEvent(new Event('resize'));
  }, 240);
}

function alternarBarraLector() {
  const inmersivo = !$('vista-lector').classList.contains('inmersivo');
  // El repaginado lo hace `animarBarraLector` al acabar: repetirlo aquí, con
  // la barra a medio recoger, es justo lo que se veía brusco.
  animarBarraLector(inmersivo);
  pintarBotonInmersivo();
}

// El botón de la barra dice en qué estado está y cómo se sale: es la única
// entrada y salida del modo inmersivo, junto a la tecla Escape.
function pintarBotonInmersivo() {
  const inmersivo = $('vista-lector').classList.contains('inmersivo');
  for (const id of ['btn-inmersivo', 'menu-inmersivo']) {
    const boton = $(id);
    if (!boton) continue;
    const dibujo = boton.querySelector('[data-icono]') ?? boton;
    dibujo.dataset.icono = inmersivo ? 'shrink' : 'expand';
    dibujo.innerHTML = icono(inmersivo ? 'shrink' : 'expand');
    boton.setAttribute('aria-pressed', String(inmersivo));
    const etiqueta = t(inmersivo ? 'immersiveExit' : 'immersive');
    boton.title = etiqueta;
    boton.setAttribute('aria-label', etiqueta);
    boton.querySelector('span:last-child:not([data-icono])')?.replaceChildren(etiqueta);
  }
}

$('btn-inmersivo').addEventListener('click', () => alternarBarraLector());
$('btn-salir-inmersivo').addEventListener('click', () => alternarBarraLector());
document.addEventListener('idioma-cambiado', pintarBotonInmersivo);

// Al abrir o cerrar un libro no hay nada que animar: la vista entera cambia.
function salirModoInmersivo() {
  clearTimeout(finBarraLector);
  const barra = document.querySelector('.barra-lector');
  if (barra) {
    barra.classList.remove('barra-animando');
    barra.style.height = '';
  }
  $('vista-lector').classList.remove('inmersivo');
  pintarBotonInmersivo();
}

// ─────────────── Pellizco para el zoom del PDF (táctil) ───────────────
// Mientras dura el gesto se aplica una escala visual barata; al soltar se
// re-renderiza el PDF con el zoom definitivo y se recoloca el scroll para
// que el punto pellizcado siga bajo los dedos.

let pellizco = null;
let ultimoPellizco = 0;

function distanciaToques(toques) {
  return gestos.distanciaEntre(
    { x: toques[0].clientX, y: toques[0].clientY },
    { x: toques[1].clientX, y: toques[1].clientY },
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
  pellizco.factor = gestos.factorDePellizco(
    distanciaToques(evento.touches), pellizco.inicial, pellizco.zoom,
  );
  const contenedor = $('contenedor-pagina');
  contenedor.style.transformOrigin =
    `${pellizco.scrollLeft + pellizco.centroX}px ${pellizco.scrollTop + pellizco.centroY}px`;
  contenedor.style.transform = `scale(${pellizco.factor})`;
}, { passive: false });

async function terminarPellizco() {
  if (!pellizco) return;
  const medidas = pellizco;
  pellizco = null;
  ultimoPellizco = Date.now();
  const contenedor = $('contenedor-pagina');
  contenedor.style.transform = '';
  contenedor.style.transformOrigin = '';
  if (!gestos.pellizcoAprovechable(medidas.factor)) return;
  await lector.cambiarZoom(medidas.factor);
  guardarZoomPdf();
  aplicarAparienciaAjustePdf();
  const destino = gestos.scrollTrasPellizco(medidas);
  const area = $('area-lectura');
  area.scrollLeft = destino.izquierda;
  area.scrollTop = destino.arriba;
}

$('area-lectura').addEventListener('touchend', (evento) => {
  if (pellizco && evento.touches.length < 2) terminarPellizco().catch(() => null);
}, { passive: true });
$('area-lectura').addEventListener('touchcancel', () => {
  terminarPellizco().catch(() => null);
}, { passive: true });

// ─────────────── Pasar página arrastrando el dedo ───────────────
//
// La página acompaña al dedo y deja ver a dónde se va, en vez de saltar de
// golpe. En PDF asoma de verdad la página vecina, que ya está pintada de
// antemano (ver copiaDePagina). En EPUB asoma la columna de al lado: el
// capítulo entero está compuesto en una tira de columnas que se desliza
// dentro del marco que la recorta (ver tiraDeColumnas). Solo en los bordes
// del capítulo, donde la página siguiente es otro documento todavía sin
// montar, se arrastra el contenedor entero como único recurso.
//
// Al soltar, el recorrido decide: pasado el umbral la página termina de
// salir, y si no vuelve a su sitio. Así un roce no cambia de página y se
// puede echar un vistazo y arrepentirse. Las cuentas del recorrido —cuándo
// arranca, cuánto se desplaza, si llega al umbral— están en gestos.js.

let gesto = null;

function elementoQueSeMueve() {
  return epubAbierto() ? $('contenedor-epub') : $('contenedor-pagina').querySelector('.par-paginas');
}

// Qué sigue al dedo y cuánto mide un paso completo. En EPUB, cuando la página
// vecina ya está compuesta en la tira de columnas, se desliza la tira: entonces
// el paso es el ancho de una columna y no el del área, que puede ser más ancha
// (el marco del libro deja márgenes a los lados).
function piezasDelGesto(haciaAtras) {
  if (epubAbierto()) {
    const columnas = lectorEpub.tiraDeColumnas();
    if (columnas && (haciaAtras ? columnas.antes : columnas.despues)) {
      return { elemento: columnas.tira, paso: columnas.paso, enColumnas: true };
    }
  }
  return {
    elemento: elementoQueSeMueve(),
    paso: $('area-lectura').clientWidth || 1,
    enColumnas: false,
  };
}

// ¿Puede empezar aquí un arrastre de página?
function gestoDePaginaPermitido() {
  if (!libroActual || pellizco || Date.now() - ultimoPellizco < 600) return false;
  // Con texto seleccionado (o seleccionándose) el dedo está ajustando la
  // selección, no pasando página.
  if (seleccionPendiente || haySeleccionActiva()) return false;
  if (modoActual() === 'continuo') return false; // ahí manda el scroll vertical
  // Con zoom la página desborda a lo ancho y el dedo la desplaza: es scroll.
  const area = $('area-lectura');
  if (area.scrollWidth > area.clientWidth + 2) return false;
  return Boolean(elementoQueSeMueve());
}

// ¿Y un deslizamiento vertical? Solo cuando no hay nada que desplazar hacia
// abajo: con la página más alta que la vista (lo normal ajustando a lo ancho)
// el dedo está haciendo scroll, y quitárselo sería peor que no tener el gesto.
function gestoVerticalPermitido() {
  if (!gestoDePaginaPermitido()) return false;
  const area = $('area-lectura');
  return area.scrollHeight <= area.clientHeight + 2;
}

// ¿Queda página hacia ese lado?
function hayPaginaDestino(haciaAtras) {
  return gestos.hayPaginaDestino({
    haciaAtras,
    epub: epubAbierto(),
    hayVecinaEpub: epubAbierto() ? lectorEpub.hayVecina(haciaAtras) : true,
    pagina: lector.pagina,
    totalPaginas: lector.totalPaginas,
    paso: lector.enDoble() ? 2 : 1,
  });
}

// Lo mismo, pero durante un arrastre: se responde con lo apuntado al arrancar.
function hayDestinoDelGesto(haciaAtras) {
  if (!gesto?.destinos) return hayPaginaDestino(haciaAtras);
  return haciaAtras ? gesto.destinos.atras : gesto.destinos.adelante;
}

async function prepararVecinasDelGesto() {
  if (epubAbierto() || !gesto) return;
  const paso = lector.enDoble() ? 2 : 1;
  const contenedor = elementoQueSeMueve();
  for (const [signo, clase] of [[-paso, 'vecina-antes'], [paso, 'vecina-despues']]) {
    const copia = await lector.copiaDePagina(lector.pagina + signo);
    if (!gesto || gesto.terminado) return; // el dedo ya se ha levantado
    if (!copia) continue;                  // no hay página por ese lado
    const vecina = document.createElement('div');
    vecina.className = `pagina-pdf pagina-vecina ${clase}`;
    vecina.append(copia);
    contenedor.append(vecina);
    gesto.vecinas.push(vecina);
  }
}

function limpiarGesto() {
  const contenedor = gesto?.elemento;
  for (const vecina of gesto?.vecinas ?? []) vecina.remove();
  if (contenedor) {
    contenedor.style.transform = '';
    contenedor.classList.remove('arrastrando-pagina', 'soltando-pagina');
  }
  $('area-lectura').classList.remove('gesto-pagina');
  gesto = null;
}

// El gesto llega por dos caminos: el área de lectura en PDF y, en EPUB, el
// iframe del libro, que se queda los toques y los reenvía. De ahí que la
// lógica trabaje con coordenadas sueltas y no con el evento.

function iniciarGesto(x, y, toques) {
  if (gesto && toques > 1) limpiarGesto(); // llega un pellizco
  if (toques !== 1 || !gestoDePaginaPermitido()) return;
  gesto = {
    x, y, dx: 0, dy: 0, vertical: false,
    activo: false, terminado: false, vecinas: [], elemento: null,
    paso: 0, enColumnas: false, destinos: null,
  };
}

function moverGesto(x, y, toques, evitar) {
  // Con un segundo dedo el gesto pasa a ser un pellizco para el zoom: la
  // página vuelve a su sitio y deja de seguir al dedo.
  if (gesto && toques > 1) { limpiarGesto(); return; }
  if (!gesto || toques !== 1) return;
  const dx = x - gesto.x;
  const dy = y - gesto.y;
  if (!gesto.activo) {
    const arranque = gestos.decidirArranque(dx, dy, { vertical: gestoVerticalPermitido() });
    if (arranque === 'abandonar') { gesto = null; return; }
    if (arranque === 'esperar') return;
    gesto.activo = true;
    gesto.vertical = arranque === 'vertical';
    if (!gesto.vertical) {
      const piezas = piezasDelGesto(dx > 0);
      gesto.elemento = piezas.elemento;
      gesto.paso = piezas.paso;
      gesto.enColumnas = piezas.enColumnas;
      // Los dos lados se preguntan una sola vez, al arrancar: la respuesta no
      // cambia mientras dura el arrastre y en EPUB cuesta (hay que pedirle la
      // ubicación a epub.js), demasiado para hacerlo en cada movimiento.
      gesto.destinos = { atras: hayPaginaDestino(true), adelante: hayPaginaDestino(false) };
      gesto.elemento?.classList.add('arrastrando-pagina');
      $('area-lectura').classList.add('gesto-pagina');
      prepararVecinasDelGesto();
    }
  }
  // El deslizamiento vertical no mueve nada mientras dura: solo apunta el
  // recorrido y al soltar decide. Se queda el toque igualmente, que si no el
  // navegador lo trata como un rebote del scroll.
  if (gesto.vertical) {
    evitar?.();
    gesto.dy = dy;
    return;
  }
  if (!gesto.elemento) return;
  evitar?.(); // el gesto es nuestro: ni scroll ni selección
  gesto.dx = gestos.recorridoDelGesto(dx, {
    hayDestino: hayDestinoDelGesto(dx > 0),
    enColumnas: gesto.enColumnas,
    paso: gesto.paso,
  });
  gesto.elemento.style.transform = `translateX(${gesto.dx}px)`;
}

$('area-lectura').addEventListener('touchstart', (evento) => {
  iniciarGesto(evento.touches[0].clientX, evento.touches[0].clientY, evento.touches.length);
}, { passive: true });

$('area-lectura').addEventListener('touchmove', (evento) => {
  moverGesto(evento.touches[0]?.clientX ?? 0, evento.touches[0]?.clientY ?? 0,
    evento.touches.length, () => evento.preventDefault());
}, { passive: false });

function terminarGestoPagina() {
  if (!gesto) return;
  gesto.terminado = true;
  const { dx, dy, activo, elemento } = gesto;
  // Deslizamiento vertical: subir el dedo trae la página siguiente (el texto
  // se va hacia arriba, como al desplazar), bajarlo devuelve la anterior. La
  // página pasa con la misma animación que pulsando un margen.
  if (gesto.vertical) {
    const alto = $('area-lectura').clientHeight;
    limpiarGesto();
    if (gestos.pasaDePaginaVertical(dy, alto)) pasarPagina(dy > 0);
    return;
  }
  if (!activo || !elemento) { limpiarGesto(); return; }
  const ancho = gesto.paso || $('area-lectura').clientWidth || 1;
  // El tope frena el recorrido, pero un arrastre largo de verdad todavía lo
  // pasaría: sin página a la que ir, la vuelta a su sitio es la única salida.
  const pasa = hayDestinoDelGesto(dx > 0) && gestos.pasaDePagina(dx, ancho);
  const activoLector = epubAbierto() ? lectorEpub : lector;
  if (!pasa) {
    // Vuelta a su sitio, con la transición que da la clase.
    elemento.classList.add('soltando-pagina');
    elemento.style.transform = '';
    alAcabarElDeslizamiento(elemento, limpiarGesto);
    return;
  }
  // Termina de salir y, ya fuera de la vista, se cambia de página.
  elemento.classList.add('soltando-pagina');
  elemento.style.transform = `translateX(${dx < 0 ? -ancho : ancho}px)`;
  alAcabarElDeslizamiento(elemento, () => {
    limpiarGesto();
    if (dx < 0) activoLector.siguiente(); else activoLector.anterior();
  });
}

// Pasar página sin dedo: pulsando los márgenes o con las teclas, la página
// hace sola el mismo recorrido que haría arrastrándola. Es el mismo montaje
// del gesto (la vecina preparada detrás, la tira de columnas en EPUB), solo
// que el desplazamiento va de una vez y de principio a fin.
//
// Donde el gesto no cabe —modo continuo, con zoom— se cambia de página como
// siempre, sin animación.
async function pasarPagina(haciaAtras) {
  const activo = epubAbierto() ? lectorEpub : lector;
  const cambiar = () => (haciaAtras ? activo.anterior() : activo.siguiente());
  if (gesto || !gestoDePaginaPermitido()) return void cambiar();
  if (!hayPaginaDestino(haciaAtras)) return void toparConElBorde(haciaAtras);
  const piezas = piezasDelGesto(haciaAtras);
  if (!piezas.elemento) return void cambiar();
  const elemento = piezas.elemento;
  gesto = {
    x: 0, y: 0, dx: 0, dy: 0, vertical: false,
    activo: true, terminado: false, vecinas: [],
    elemento, paso: piezas.paso, enColumnas: piezas.enColumnas, destinos: null,
  };
  elemento.classList.add('arrastrando-pagina');
  $('area-lectura').classList.add('gesto-pagina');
  // La página vecina ya suele estar pintada (se adelanta al montar la actual),
  // así que la espera no se nota; si no lo estuviera, la copia no llega y el
  // hueco de al lado se ve vacío, como en el arrastre.
  await prepararVecinasDelGesto();
  if (!gesto || gesto.elemento !== elemento) return; // otro gesto lo relevó
  gesto.terminado = true;
  elemento.classList.add('soltando-pagina');
  // Un fotograma con la página quieta antes de moverla: puesto en el mismo, el
  // navegador junta las dos escrituras y no hay transición que ver.
  requestAnimationFrame(() => {
    if (gesto?.elemento !== elemento) return;
    elemento.style.transform = `translateX(${haciaAtras ? gesto.paso : -gesto.paso}px)`;
  });
  alAcabarElDeslizamiento(elemento, () => {
    limpiarGesto();
    cambiar();
  });
}

// Sin página a la que ir, la actual se asoma un poco y vuelve. Arrastrando ya
// se notaba el tope (la página se queda corta y regresa); pulsando el margen o
// con las teclas no pasaba nada de nada, y no moverse se confunde con que el
// toque no se ha registrado. El recorrido es corto a propósito: tiene que
// leerse como «hasta aquí», no como una página a medio pasar.
const RECORRIDO_TOPE = 0.07; // parte del ancho de la vista

function toparConElBorde(haciaAtras) {
  const elemento = piezasDelGesto(haciaAtras).elemento;
  if (!elemento || elemento.classList.contains('tope-pagina')) return;
  const asomo = ($('area-lectura').clientWidth || 0) * RECORRIDO_TOPE;
  if (!asomo) return;
  // Va como animación y no como transición porque son dos tramos —salir y
  // volver— y así no queda ningún transform puesto si algo la interrumpe.
  elemento.style.setProperty('--asomo-tope', `${haciaAtras ? asomo : -asomo}px`);
  elemento.classList.add('tope-pagina');
  $('area-lectura').classList.add('tope-en-curso');
  const limpiar = () => {
    elemento.classList.remove('tope-pagina');
    elemento.style.removeProperty('--asomo-tope');
    $('area-lectura').classList.remove('tope-en-curso');
  };
  elemento.addEventListener('animationend', limpiar, { once: true });
  setTimeout(limpiar, 400); // por si la animación no llega a emitir el aviso
}

// Espera a que acabe el deslizamiento en vez de contar un tiempo fijo: con
// «menos movimiento» la transición dura lo que nada, y un temporizador dejaría
// la pantalla vacía mientras tanto. El plazo es solo por si el aviso no llega.
function alAcabarElDeslizamiento(elemento, alFinal) {
  let hecho = false;
  const rematar = (evento) => {
    if (hecho || (evento && evento.propertyName !== 'transform')) return;
    hecho = true;
    elemento.removeEventListener('transitionend', rematar);
    alFinal();
  };
  elemento.addEventListener('transitionend', rematar);
  setTimeout(rematar, 260);
}

$('area-lectura').addEventListener('touchend', terminarGestoPagina, { passive: true });
$('area-lectura').addEventListener('touchcancel', () => { if (gesto) limpiarGesto(); }, { passive: true });

// ── Pellizco para el tamaño de letra del EPUB ──
// El gesto se traduce a saltos de un 10 %, amortiguado y con una pausa entre
// saltos; el porqué y las cuentas están en gestos.js.

let pellizcoEpub = null;

function pellizcarEpub(puntos) {
  const distancia = gestos.distanciaEntre(puntos[0], puntos[1]);
  if (!pellizcoEpub) {
    pellizcoEpub = { inicial: distancia, tamano: lectorEpub.tamano, ultimo: 0 };
    return;
  }
  const ahora = Date.now();
  const nuevo = gestos.saltoDeLetra(pellizcoEpub, distancia, lectorEpub.tamano, ahora);
  if (nuevo === null) return;
  pellizcoEpub.ultimo = ahora;
  lectorEpub.cambiarTamano(nuevo - lectorEpub.tamano);
}

function terminarPellizcoEpub() {
  if (!pellizcoEpub) return;
  pellizcoEpub = null;
  guardarLetraEpub();
  pintarZoom();
  ultimoPellizco = Date.now(); // que el gesto de página no remate el pellizco
}

// Toques reenviados desde el iframe del EPUB.
function tocarDesdeElLibro({ tipo, x, y, toques, puntos, evitar }) {
  // Dos dedos: el gesto es un pellizco para el tamaño de letra.
  if (toques > 1 && puntos?.length === 2) {
    if (gesto) limpiarGesto();
    evitar?.();
    pellizcarEpub(puntos);
    return;
  }
  if (tipo === 'inicio') iniciarGesto(x, y, toques);
  else if (tipo === 'mueve') moverGesto(x, y, toques, evitar);
  else if (tipo === 'fin') { terminarPellizcoEpub(); terminarGestoPagina(); }
  else { terminarPellizcoEpub(); if (gesto) limpiarGesto(); }
}

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

// Qué versión se está usando. Va al pie de los ajustes y también al de la
// biblioteca: es lo primero que hay que poder mirar cuando algo no va como se
// esperaba, y en el pie se ve sin abrir nada.
function pintarVersion() {
  const texto = t('appVersion', { version: VERSION });
  $('version-app').textContent = texto;
  $('version-pie').textContent = texto;
}

pintarIconos();
document.addEventListener('idioma-cambiado', () => {
  pintarVersion();
  aplicarMargenEpub();
  aplicarAparienciaModo(modoActual());
  aplicarAparienciaDoble();
  pintarTiempoRestante();
  pintarEstadoVoz();
  if (!libroActual) cargarBiblioteca();
  else if (!$('panel-marcadores').classList.contains('oculto')) pintarMarcadores();
  else if (!$('panel-anotaciones').classList.contains('oculto')) pintarAnotaciones();
});
iniciarIdioma();
pintarVersion();
migrarPapelAlTema();
limpiarAjustesGlobalesViejos();
// Las estadísticas de la primera versión vivían aparte y sin dueño: al
// registro, bajo el identificador de este dispositivo, para que sumen con las
// de los demás en lugar de perderse.
progreso.migrarEstadisticasAntiguas();
// El total de cada mes se deduce de los días que aún se guardan; dejarlo
// escrito es lo que hace que viaje a la nube y llegue a los demás aparatos.
progreso.completarMesesGuardados();
iniciarTema(); // deja pintados también los dos selectores del tema automático
sincronizarCasillaContinuar();
sincronizarCasillasEstadisticas();
sincronizarCasillasAbrirUltimo();
sincronizarCasillaBarraEstado();
aplicarPlegadoContinuar();
sincronizarSelectRecientes();
aplicarPapel();
aplicarAparienciaModo(modoActual());
pintarZoom();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => null);
}

window.addEventListener('online', () => {
  sincronizarAlRecuperarConexion()
    .then(() => actualizarEstadoSincronizacion())
    .catch((error) => actualizarEstadoSincronizacion(error));
});

// Un enlace de configuración se abre para conectar este dispositivo, no para
// leer: aunque esté pedida la apertura directa, esta vez se queda la biblioteca.
const llegaConfigEnLaUrl = location.hash.startsWith('#cfg=');
importarConfigDeUrl();
crearCliente();
history.replaceState(estadoBiblioteca(), '');
mostrarVista('biblioteca');
precargarLibrosEjemplo()
  .finally(() => cargarBiblioteca())
  .then(() => (llegaConfigEnLaUrl ? null : abrirUltimaLecturaSiSePidio()))
  .catch(() => null);

