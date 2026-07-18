import { ClienteWebDav, explicarError } from './webdav.js';
import { Lector } from './lector.js';
import { LectorEpub } from './lector-epub.js';
import * as progreso from './progreso.js';
import * as almacen from './almacen.js';
import { icono, pintarIconos } from './iconos.js';

const CLAVE_CONFIG = 'lector.config';
const CLAVE_NOCHE = 'lector.noche';
const CLAVE_MODO = 'lector.modo';

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
    avisar('Rellena al menos la URL y el usuario.');
    return;
  }
  localStorage.setItem(CLAVE_CONFIG, JSON.stringify(config));
  crearCliente();
  avisar('Configuración guardada.');
  mostrarVista('biblioteca');
  cargarBiblioteca();
});

$('btn-probar').addEventListener('click', async () => {
  const resultado = $('resultado-prueba');
  resultado.className = 'estado';
  resultado.textContent = 'Conectando…';
  try {
    const libros = await new ClienteWebDav(leerFormulario()).listarLibros();
    resultado.className = 'estado exito';
    resultado.textContent = `✓ Conexión correcta: ${libros.length} libros encontrados.`;
  } catch (error) {
    resultado.className = 'estado error';
    resultado.textContent = explicarError(error);
  }
});

$('btn-borrar-config').addEventListener('click', () => {
  if (!confirm('¿Borrar la configuración del servidor? El progreso guardado en la nube no se toca.')) return;
  localStorage.removeItem(CLAVE_CONFIG);
  crearCliente();
  avisar('Configuración borrada.');
  mostrarVista('biblioteca');
  cargarBiblioteca();
});

$('btn-ajustes').addEventListener('click', abrirAjustes);
$('enlace-configurar').addEventListener('click', (evento) => {
  evento.preventDefault();
  abrirAjustes();
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
  estado.textContent = 'Cargando biblioteca…';
  $('lista-libros').replaceChildren();

  try {
    const [libros] = await Promise.all([
      cliente.listarLibros(),
      progreso.sincronizar(cliente).catch(() => null),
    ]);
    estado.textContent = libros.length
      ? ''
      : 'No hay ningún libro en la nube. Usa el botón de subir para añadir el primero.';
    pintarListaRemota(libros);
  } catch (error) {
    estado.className = 'estado error';
    estado.textContent = explicarError(error);
  }
}

// Crea la fila de un libro: botón principal para abrirlo y papelera para borrarlo.
function crearFilaLibro({ id, titulo, tamano, formato, alAbrir, alBorrar }) {
  const avance = progreso.progresoDe(id);
  const porcentaje = avance?.paginas ? Math.round((avance.pagina / avance.paginas) * 100) : 0;

  const elemento = document.createElement('li');
  const boton = document.createElement('button');
  boton.className = 'libro';
  boton.innerHTML = `
    <span class="portada">${icono(formato === 'epub' ? 'book-open' : 'book')}</span>
    <span class="datos">
      <span class="nombre"></span>
      <span class="detalle"></span>
      <span class="barra-progreso"><div style="width:${porcentaje}%"></div></span>
    </span>`;
  boton.querySelector('.nombre').textContent = titulo;
  boton.querySelector('.detalle').textContent = !avance
    ? `${(tamano / 1024 / 1024).toFixed(1)} MB · sin empezar`
    : avance.cfi
      ? `${porcentaje}% leído`
      : `Página ${avance.pagina} de ${avance.paginas} · ${porcentaje}%`;
  boton.addEventListener('click', alAbrir);

  const borrar = document.createElement('button');
  borrar.className = 'btn-borrar-libro';
  borrar.title = `Borrar «${titulo}»`;
  borrar.innerHTML = icono('trash-2');
  borrar.addEventListener('click', alBorrar);

  elemento.append(boton, borrar);
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
      alBorrar: () => borrarLibroLocal(libro),
    }));
  }
}

$('btn-recargar').addEventListener('click', cargarBiblioteca);

// ───────────────────────── Borrar libros ─────────────────────────

async function borrarLibroRemoto(nombre) {
  if (!cliente) return;
  if (!confirm(`¿Borrar «${nombre}» de tu nube? Se eliminará el archivo del servidor.`)) return;
  mostrarCarga(`Borrando «${nombre}»…`);
  try {
    await cliente.borrar(nombre);
    await progreso.olvidar(nombre, cliente).catch(() => null);
    avisar('Libro borrado de la nube.');
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
}

async function borrarLibroLocal(libro) {
  if (!confirm(`¿Borrar «${libro.nombre}» de este dispositivo?`)) return;
  try {
    await almacen.borrarLibro(libro.id);
    await progreso.olvidar(libro.id).catch(() => null);
    avisar('Libro borrado de este dispositivo.');
  } catch (error) {
    avisar(`No se pudo borrar: ${error.message}`, 6000);
  }
  cargarLibrosLocales();
}

// ───────────────────────── Abrir libros ─────────────────────────

async function abrirLibroRemoto(nombre) {
  mostrarCarga(`Descargando «${nombre}»…`);
  try {
    // Antes de abrir, trae el progreso más reciente de otros dispositivos.
    await progreso.sincronizar(cliente).catch(() => null);
    const datos = await cliente.descargar(nombre, (recibido, total) => {
      const pct = Math.round((recibido / total) * 100);
      $('texto-cargando').textContent = `Descargando «${nombre}»… ${pct}%`;
    });
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
  mostrarCarga(`Abriendo «${libro.nombre}»…`);
  try {
    const datos = await almacen.obtenerDatos(libro.id);
    if (!datos) throw new Error('el libro ya no está en el almacén de este dispositivo');
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

// Añadir un PDF a la biblioteca de este dispositivo: se guarda en el
// navegador (IndexedDB) y se abre para leer.
$('selector-archivo').addEventListener('change', async (evento) => {
  const archivo = evento.target.files[0];
  evento.target.value = '';
  if (!archivo) return;
  mostrarCarga(`Añadiendo «${archivo.name}»…`);
  try {
    const datos = new Uint8Array(await archivo.arrayBuffer());
    const libro = {
      id: `local:${archivo.name}:${archivo.size}`,
      nombre: archivo.name,
      tamano: archivo.size,
    };
    try {
      await almacen.guardarLibro(libro, datos);
    } catch {
      avisar('No se pudo guardar en la biblioteca (¿espacio o navegación privada?). Se abre sin guardar.', 5000);
    }
    await abrirEnLector(datos, {
      id: libro.id,
      titulo: archivo.name.replace(/\.(pdf|epub)$/i, ''),
      tipo: 'local',
      nombre: archivo.name,
      formato: formatoDe(archivo.name),
    });
  } catch (error) {
    avisar(`No se pudo abrir el libro: ${error.message}`, 6000);
  } finally {
    ocultarCarga();
  }
});

// Subir un libro del dispositivo directamente a la carpeta de la nube.
$('selector-subir-nube').addEventListener('change', async (evento) => {
  const archivo = evento.target.files[0];
  evento.target.value = '';
  if (!archivo || !cliente) return;

  let nombre = archivo.name;
  if (!/\.(pdf|epub)$/i.test(nombre)) nombre += '.pdf';

  try {
    if (await cliente.existe(nombre) &&
        !confirm(`Ya existe «${nombre}» en tu nube. ¿Quieres sobrescribirlo?`)) {
      return;
    }
  } catch (error) {
    avisar(explicarError(error), 6000);
    return;
  }

  mostrarCarga(`Subiendo «${nombre}» a tu nube…`);
  try {
    const datos = new Uint8Array(await archivo.arrayBuffer());
    await cliente.subir(nombre, datos);
    avisar(`«${nombre}» subido a tu nube.`);
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
    cargarBiblioteca();
  }
});

async function abrirEnLector(datos, libro) {
  libroActual = libro;
  $('titulo-libro').textContent = libro.titulo;
  // El botón de subir solo tiene sentido con un libro local y una nube configurada.
  $('btn-subir').classList.toggle('oculto', !(libro.tipo === 'local' && cliente));
  const esEpub = libro.formato === 'epub';
  $('contenedor-pagina').classList.toggle('oculto', esEpub);
  $('contenedor-epub').classList.toggle('oculto', !esEpub);
  const avance = progreso.progresoDe(libro.id);
  mostrarVista('lector');

  if (esEpub) {
    $('btn-indicador').textContent = '…';
    await lectorEpub.abrir(datos, avance?.cfi ?? null, modoActual());
    lectorEpub.aplicarNoche(document.body.classList.contains('modo-noche'));
    if (avance?.cfi) avisar('Continuando donde lo dejaste');
  } else {
    lectorEpub.cerrar();
    await lector.abrir(datos, avance?.pagina ?? 1, modoActual());
    if (avance && avance.pagina > 1) {
      avisar(`Continuando en la página ${avance.pagina}`);
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
        !confirm(`Ya existe «${nombre}» en tu nube. ¿Quieres sobrescribirlo?`)) {
      return;
    }
  } catch (error) {
    avisar(explicarError(error), 6000);
    return;
  }

  mostrarCarga(`Subiendo «${nombre}» a tu nube…`);
  try {
    const datos = await almacen.obtenerDatos(libroActual.id);
    if (!datos) throw new Error('no se encontró el libro en el almacén de este dispositivo');
    await cliente.subir(nombre, datos);

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
    avisar('Guardado en tu nube. Ya se sincroniza entre dispositivos.');
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
    ? 'Ver página a página (como un libro)'
    : 'Ver páginas continuas (scroll)';
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
$('btn-zoom-menos').addEventListener('click', () => {
  if (epubAbierto()) lectorEpub.cambiarTamano(-10);
  else lector.cambiarZoom(1 / 1.2);
});
$('btn-zoom-mas').addEventListener('click', () => {
  if (epubAbierto()) lectorEpub.cambiarTamano(10);
  else lector.cambiarZoom(1.2);
});

$('btn-indicador').addEventListener('click', () => {
  if (epubAbierto()) {
    if (!lectorEpub.conLocalizaciones) return;
    const respuesta = prompt('Ir al porcentaje del libro (0–100):', String(lectorEpub.porcentaje));
    const numero = parseInt(respuesta, 10);
    if (!Number.isNaN(numero)) lectorEpub.irAPorcentaje(numero);
    return;
  }
  const respuesta = prompt(`Ir a la página (1–${lector.totalPaginas}):`, String(lector.pagina));
  const numero = parseInt(respuesta, 10);
  if (!Number.isNaN(numero)) lector.irA(numero);
});

function pintarIconoNoche() {
  const activo = document.body.classList.contains('modo-noche');
  $('btn-noche').innerHTML = icono(activo ? 'sun' : 'moon');
  $('btn-noche').title = activo ? 'Modo día' : 'Modo noche';
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
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
    const activo = epubAbierto() ? lectorEpub : lector;
    if (dx < 0) activo.siguiente(); else activo.anterior();
  }
}, { passive: true });

// ───────────────────────── Arranque ─────────────────────────

pintarIconos();
if (localStorage.getItem(CLAVE_NOCHE) === '1') {
  document.body.classList.add('modo-noche');
}
pintarIconoNoche();
aplicarAparienciaModo(modoActual());

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => null);
}

crearCliente();
mostrarVista('biblioteca');
cargarBiblioteca();
