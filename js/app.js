import { ClienteWebDav, explicarError } from './webdav.js';
import { Lector } from './lector.js';
import { LectorEpub } from './lector-epub.js';
import * as progreso from './progreso.js';
import * as almacen from './almacen.js';
import { asegurarMiniatura } from './portadas.js';
import { icono, pintarIconos } from './iconos.js';
import { t, iniciarIdioma } from './i18n.js';

const CLAVE_CONFIG = 'lector.config';
const CLAVE_NOCHE = 'lector.noche';
const CLAVE_MODO = 'lector.modo';
const CLAVE_ZOOM_PDF = 'lector.zoomPdf';    // solo de este dispositivo
const CLAVE_LETRA_EPUB = 'lector.letraEpub'; // solo de este dispositivo
const CLAVE_MARGEN_EPUB = 'lector.margenEpub'; // solo de este dispositivo

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

let frameMargenEpub = null;
function aplicarMargenEpub(valor = margenEpubActual()) {
  $('contenedor-epub').style.setProperty('--margen-texto', `${valor}%`);
  $('margen-epub').value = String(valor);
  $('margen-epub').setAttribute('aria-valuetext', t('epubMargin', { value: valor }));
  $('valor-margen').textContent = t('epubMargin', { value: valor });
  // epub.js escucha el resize de la ventana y recalcula el paginado.
  cancelAnimationFrame(frameMargenEpub);
  frameMargenEpub = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
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
let libroActual = null;    // { id, titulo, tipo: 'webdav'|'local', formato: 'pdf'|'epub' }
let temporizadorSync = null;

const lector = new Lector({
  area: $('area-lectura'),
  contenedor: $('contenedor-pagina'),
  alCambiarPagina: cuandoCambiaPagina,
});

const lectorEpub = new LectorEpub({
  contenedor: $('contenedor-epub'),
  alCambiarPosicion: cuandoCambiaPosicionEpub,
  alTeclear: manejarTecla,
});

function formatoDe(nombre) {
  return /\.epub$/i.test(nombre) ? 'epub' : 'pdf';
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
    const libros = await new ClienteWebDav(leerFormulario()).listarLibros();
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

  const hayConfig = cliente !== null;
  $('aviso-sin-config').classList.toggle('oculto', hayConfig);
  $('zona-remota').classList.toggle('oculto', !hayConfig);
  if (!hayConfig) return;

  const estado = $('estado-remoto');
  estado.className = 'estado';
  estado.textContent = t('loadingLibrary');
  $('lista-libros').replaceChildren();

  try {
    const [libros] = await Promise.all([
      cliente.listarLibros(),
      progreso.sincronizar(cliente).catch(() => null),
    ]);
    estado.textContent = libros.length
      ? ''
      : t('noCloudBooks');
    pintarListaRemota(libros);
    generarPortadasFaltantes(libros);
  } catch (error) {
    estado.className = 'estado error';
    estado.textContent = explicarError(error);
  }
}

// Crea la fila de un libro: botón principal para abrirlo y papelera para borrarlo.
function crearFilaLibro({ id, titulo, tamano, formato, alAbrir, alSubir, alDescargar, alBorrar }) {
  const avance = progreso.progresoDe(id);
  const porcentaje = avance?.paginas ? Math.round((avance.pagina / avance.paginas) * 100) : 0;

  const elemento = document.createElement('li');
  elemento.dataset.idLibro = id;
  const boton = document.createElement('button');
  boton.className = 'libro';
  boton.innerHTML = `
    <span class="portada">${icono(formato === 'epub' ? 'book-open' : 'book')}</span>
    <span class="datos">
      <span class="cabecera-libro">
        <span class="nombre"></span>
        <span class="formato formato-${formato}"></span>
      </span>
      <span class="detalle"></span>
      <span class="barra-progreso"><div style="width:${porcentaje}%"></div></span>
    </span>`;
  boton.querySelector('.nombre').textContent = titulo;
  boton.querySelector('.formato').textContent = formato.toUpperCase();
  boton.querySelector('.detalle').textContent = !avance
    ? `${(tamano / 1024 / 1024).toFixed(1)} MB · ${t('notStarted')}`
    : avance.cfi
      ? `${porcentaje}% ${t('read')}`
      : `${t('page')} ${avance.pagina} ${t('of')} ${avance.paginas} · ${porcentaje}%`;
  boton.addEventListener('click', alAbrir);

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

  if (alDescargar) {
    const descargar = document.createElement('button');
    descargar.className = 'btn-fila-libro btn-descargar-libro';
    descargar.title = t('downloadBook', { title: titulo });
    descargar.innerHTML = icono('download');
    descargar.addEventListener('click', alDescargar);
    elemento.append(descargar);
  }

  const borrar = document.createElement('button');
  borrar.className = 'btn-fila-libro btn-borrar-libro';
  borrar.title = t('deleteBook', { title: titulo });
  borrar.innerHTML = icono('trash-2');
  borrar.addEventListener('click', alBorrar);
  elemento.append(borrar);
  return elemento;
}

function pintarListaRemota(libros) {
  const lista = $('lista-libros');
  lista.replaceChildren();
  for (const libro of libros) {
    lista.append(crearFilaLibro({
      id: libro.nombre,
      titulo: libro.nombre.replace(/\.(pdf|epub)$/i, ''),
      tamano: libro.tamano,
      formato: formatoDe(libro.nombre),
      alAbrir: () => abrirLibroRemoto(libro.nombre),
      alDescargar: () => descargarLibroRemoto(libro.nombre),
      alBorrar: () => borrarLibroRemoto(libro.nombre),
    }));
  }
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
    lista.append(crearFilaLibro({
      id: libro.id,
      titulo: libro.nombre.replace(/\.(pdf|epub)$/i, ''),
      tamano: libro.tamano,
      formato: formatoDe(libro.nombre),
      alAbrir: () => abrirLibroLocal(libro),
      // Subir a la nube: solo si hay servidor configurado.
      alSubir: cliente ? () => subirLibroLocalANube(libro) : null,
      alDescargar: () => descargarLibroLocal(libro),
      alBorrar: () => borrarLibroLocal(libro),
    }));
  }
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
  if (!blob) return;
  for (const fila of document.querySelectorAll('.lista-libros li')) {
    if (fila.dataset.idLibro === id) {
      fila.querySelector('.portada')?.replaceChildren(crearImagenPortada(blob));
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
        if (await almacen.obtenerPortada(libro.nombre)) continue;
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

async function descargarLibroRemoto(nombre) {
  if (!cliente) return;
  mostrarCarga(t('downloading', { title: nombre }));
  try {
    const datos = await cliente.descargar(nombre, (recibido, total) => {
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

// Sube un libro de este dispositivo a la carpeta de la nube, conservando
// el progreso de lectura bajo el identificador de la nube.
async function subirLibroLocalANube(libro) {
  if (!cliente) return;
  let nombre = libro.nombre;
  if (!/\.(pdf|epub)$/i.test(nombre)) nombre += '.pdf';

  try {
    if (await cliente.existe(nombre) &&
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
    await cliente.subir(nombre, datos);
    asegurarMiniatura(nombre, formatoDe(nombre), datos);

    const avance = progreso.progresoDe(libro.id);
    if (avance) {
      progreso.anotarPagina(nombre, avance.pagina, avance.paginas,
        avance.cfi ? { cfi: avance.cfi } : {});
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

async function borrarLibroRemoto(nombre) {
  if (!cliente) return;
  if (!confirm(t('deleteCloudConfirm', { title: nombre }))) return;
  mostrarCarga(t('deleting', { title: nombre }));
  try {
    await cliente.borrar(nombre);
    let limpiezaPendiente = false;
    try {
      await progreso.olvidar(nombre, cliente);
    } catch {
      limpiezaPendiente = true;
    }
    almacen.borrarPortada(nombre).catch(() => null);
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
}

// ───────────────────────── Abrir libros ─────────────────────────

async function abrirLibroRemoto(nombre) {
  mostrarCarga(t('downloading', { title: nombre }));
  try {
    // Antes de abrir, trae el progreso más reciente de otros dispositivos.
    await progreso.sincronizar(cliente).catch(() => null);
    const datos = await cliente.descargar(nombre, (recibido, total) => {
      const pct = Math.round((recibido / total) * 100);
      $('texto-cargando').textContent = `${t('downloading', { title: nombre })} ${pct}%`;
    });
    asegurarMiniatura(nombre, formatoDe(nombre), datos);
    await abrirEnLector(datos, {
      id: nombre,
      titulo: nombre.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'webdav',
      formato: formatoDe(nombre),
    });
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
  let nombre = archivo.name;
  try {
    if (await cliente.existe(nombre) &&
        !confirm(t('overwrite', { title: nombre }))) {
      return false;
    }
    mostrarCarga(t('uploading', { title: nombre }));
    const datos = new Uint8Array(await archivo.arrayBuffer());
    await cliente.subir(nombre, datos);
    await asegurarMiniatura(nombre, formatoDe(nombre), datos);
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

async function abrirEnLector(datos, libro) {
  libroActual = libro;
  $('titulo-libro').textContent = libro.titulo;
  // El botón de subir solo tiene sentido con un libro local y una nube configurada.
  $('btn-subir').classList.toggle('oculto', !(libro.tipo === 'local' && cliente));
  const esEpub = libro.formato === 'epub';
  $('contenedor-pagina').classList.toggle('oculto', esEpub);
  $('contenedor-epub').classList.toggle('oculto', !esEpub);
  $('control-margenes').classList.toggle('oculto', !esEpub);
  cerrarPanelMargenes();
  const avance = progreso.progresoDe(libro.id);
  mostrarVista('lector');

  if (esEpub) {
    $('btn-indicador').textContent = '…';
    aplicarMargenEpub();
    lectorEpub.tamano = letraEpubGuardada();
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
}

// Sube el libro local abierto a la carpeta de la nube y lo convierte en un
// libro sincronizado, conservando la posición actual.
async function subirLibroActual() {
  if (!libroActual || libroActual.tipo !== 'local' || !cliente) return;

  let nombre = libroActual.nombre ?? libroActual.titulo;
  if (!/\.(pdf|epub)$/i.test(nombre)) nombre += libroActual.formato === 'epub' ? '.epub' : '.pdf';

  try {
    if (await cliente.existe(nombre) &&
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
    await cliente.subir(nombre, datos);
    asegurarMiniatura(nombre, libroActual.formato, datos);

    // Traspasa la posición de lectura del identificador local al de la nube
    // (el nombre del archivo) para no empezar de cero al reabrirlo.
    if (libroActual.formato === 'epub') {
      progreso.anotarPagina(nombre, lectorEpub.porcentaje, 100, { cfi: lectorEpub.cfi });
    } else {
      progreso.anotarPagina(nombre, lector.pagina, lector.totalPaginas);
    }

    libroActual = {
      id: nombre,
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

$('btn-volver').addEventListener('click', () => {
  clearTimeout(temporizadorSync);
  if (libroActual?.tipo === 'webdav' && cliente) {
    progreso.sincronizar(cliente).catch(() => null);
  }
  lectorEpub.cerrar();
  libroActual = null;
  mostrarVista('biblioteca');
  cargarBiblioteca();
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

function cerrarPanelMargenes() {
  $('panel-margenes').hidden = true;
  $('btn-margenes').setAttribute('aria-expanded', 'false');
}

$('btn-margenes').addEventListener('click', () => {
  const abrir = $('panel-margenes').hidden;
  $('panel-margenes').hidden = !abrir;
  $('btn-margenes').setAttribute('aria-expanded', String(abrir));
  if (abrir) {
    aplicarMargenEpub();
    $('margen-epub').focus();
  }
});

$('margen-epub').addEventListener('input', (evento) => {
  const valor = Number(evento.target.value);
  localStorage.setItem(CLAVE_MARGEN_EPUB, String(valor));
  aplicarMargenEpub(valor);
});

$('btn-restablecer-margen').addEventListener('click', () => {
  localStorage.setItem(CLAVE_MARGEN_EPUB, String(MARGEN_EPUB_INICIAL));
  aplicarMargenEpub(MARGEN_EPUB_INICIAL);
});

document.addEventListener('click', (evento) => {
  if (!$('control-margenes').contains(evento.target)) cerrarPanelMargenes();
});

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && !$('panel-margenes').hidden) {
    cerrarPanelMargenes();
    $('btn-margenes').focus();
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

$('btn-indicador').addEventListener('click', () => {
  if (epubAbierto()) {
    if (!lectorEpub.conLocalizaciones) return;
    const respuesta = prompt(t('goPercent'), String(lectorEpub.porcentaje));
    const numero = parseInt(respuesta, 10);
    if (!Number.isNaN(numero)) lectorEpub.irAPorcentaje(numero);
    return;
  }
  const respuesta = prompt(t('goToPage', { total: lector.totalPaginas }), String(lector.pagina));
  const numero = parseInt(respuesta, 10);
  if (!Number.isNaN(numero)) lector.irA(numero);
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
      if (epubAbierto()) lectorEpub.irAPorcentaje(0); else lector.irA(1);
      break;
    case 'End':
      if (epubAbierto()) lectorEpub.irAPorcentaje(100); else lector.irA(lector.totalPaginas);
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
mostrarVista('biblioteca');
cargarBiblioteca();
