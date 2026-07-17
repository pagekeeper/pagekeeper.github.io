import { ClienteWebDav, explicarError } from './webdav.js';
import { Lector } from './lector.js';
import * as progreso from './progreso.js';

const CLAVE_CONFIG = 'lector.config';
const CLAVE_NOCHE = 'lector.noche';

const $ = (id) => document.getElementById(id);

// ───────────────────────── Estado ─────────────────────────

let cliente = null;        // ClienteWebDav o null si no hay configuración
let libroActual = null;    // { id, titulo, tipo: 'webdav' | 'local' }
let temporizadorSync = null;

const lector = new Lector({
  lienzo: $('lienzo'),
  contenedor: $('area-lectura'),
  alCambiarPagina: cuandoCambiaPagina,
});

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
    const libros = await new ClienteWebDav(leerFormulario()).listarPdfs();
    resultado.className = 'estado exito';
    resultado.textContent = `✓ Conexión correcta: ${libros.length} PDF encontrados.`;
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
$('btn-cerrar-ajustes').addEventListener('click', () => {
  mostrarVista('biblioteca');
  cargarBiblioteca();
});

// ───────────────────────── Biblioteca ─────────────────────────

async function cargarBiblioteca() {
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
      cliente.listarPdfs(),
      progreso.sincronizar(cliente).catch(() => null),
    ]);
    estado.textContent = libros.length ? '' : 'No hay ningún PDF en la carpeta configurada.';
    pintarListaLibros(libros);
  } catch (error) {
    estado.className = 'estado error';
    estado.textContent = explicarError(error);
  }
}

function pintarListaLibros(libros) {
  const lista = $('lista-libros');
  lista.replaceChildren();
  for (const libro of libros) {
    const avance = progreso.progresoDe(libro.nombre);
    const porcentaje = avance?.paginas ? Math.round((avance.pagina / avance.paginas) * 100) : 0;

    const elemento = document.createElement('li');
    const boton = document.createElement('button');
    boton.className = 'libro';
    boton.innerHTML = `
      <span class="portada">📕</span>
      <span class="datos">
        <span class="nombre"></span>
        <span class="detalle"></span>
        <span class="barra-progreso"><div style="width:${porcentaje}%"></div></span>
      </span>`;
    boton.querySelector('.nombre').textContent = libro.nombre.replace(/\.pdf$/i, '');
    boton.querySelector('.detalle').textContent = avance
      ? `Página ${avance.pagina} de ${avance.paginas} · ${porcentaje}%`
      : `${(libro.tamano / 1024 / 1024).toFixed(1)} MB · sin empezar`;
    boton.addEventListener('click', () => abrirLibroRemoto(libro.nombre));
    elemento.append(boton);
    lista.append(elemento);
  }
}

$('btn-recargar').addEventListener('click', cargarBiblioteca);

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
    await abrirEnLector(datos, { id: nombre, titulo: nombre.replace(/\.pdf$/i, ''), tipo: 'webdav' });
  } catch (error) {
    avisar(explicarError(error), 6000);
  } finally {
    ocultarCarga();
  }
}

$('selector-archivo').addEventListener('change', async (evento) => {
  const archivo = evento.target.files[0];
  evento.target.value = '';
  if (!archivo) return;
  mostrarCarga(`Abriendo «${archivo.name}»…`);
  try {
    const datos = new Uint8Array(await archivo.arrayBuffer());
    await abrirEnLector(datos, {
      id: `local:${archivo.name}:${archivo.size}`,
      titulo: archivo.name.replace(/\.pdf$/i, ''),
      tipo: 'local',
    });
  } catch (error) {
    avisar(`No se pudo abrir el PDF: ${error.message}`, 6000);
  } finally {
    ocultarCarga();
  }
});

async function abrirEnLector(datos, libro) {
  libroActual = libro;
  $('titulo-libro').textContent = libro.titulo;
  const avance = progreso.progresoDe(libro.id);
  mostrarVista('lector');
  await lector.abrir(datos, avance?.pagina ?? 1);
  if (avance && avance.pagina > 1) {
    avisar(`Continuando en la página ${avance.pagina}`);
  }
}

// ───────────────────────── Progreso y sincronización ─────────────────────────

function cuandoCambiaPagina(pagina, total) {
  $('btn-indicador').textContent = `${pagina} / ${total}`;
  if (!libroActual) return;
  progreso.anotarPagina(libroActual.id, pagina, total);

  if (libroActual.tipo === 'webdav' && cliente) {
    clearTimeout(temporizadorSync);
    temporizadorSync = setTimeout(() => {
      progreso.sincronizar(cliente).catch(() => {
        // Sin conexión: el progreso queda en local y subirá la próxima vez.
      });
    }, 3000);
  }
}

// ───────────────────────── Controles del lector ─────────────────────────

$('btn-volver').addEventListener('click', () => {
  clearTimeout(temporizadorSync);
  if (libroActual?.tipo === 'webdav' && cliente) {
    progreso.sincronizar(cliente).catch(() => null);
  }
  libroActual = null;
  mostrarVista('biblioteca');
  cargarBiblioteca();
});

$('zona-anterior').addEventListener('click', () => lector.anterior());
$('zona-siguiente').addEventListener('click', () => lector.siguiente());
$('btn-zoom-menos').addEventListener('click', () => lector.cambiarZoom(1 / 1.2));
$('btn-zoom-mas').addEventListener('click', () => lector.cambiarZoom(1.2));

$('btn-indicador').addEventListener('click', () => {
  const respuesta = prompt(`Ir a la página (1–${lector.totalPaginas}):`, String(lector.pagina));
  const numero = parseInt(respuesta, 10);
  if (!Number.isNaN(numero)) lector.irA(numero);
});

$('btn-noche').addEventListener('click', () => {
  const activo = document.body.classList.toggle('modo-noche');
  localStorage.setItem(CLAVE_NOCHE, activo ? '1' : '0');
});

document.addEventListener('keydown', (evento) => {
  if ($('vista-lector').classList.contains('oculto')) return;
  if (evento.target.tagName === 'INPUT') return;
  switch (evento.key) {
    case 'ArrowLeft': case 'PageUp': lector.anterior(); break;
    case 'ArrowRight': case 'PageDown': case ' ': lector.siguiente(); break;
    case 'Home': lector.irA(1); break;
    case 'End': lector.irA(lector.totalPaginas); break;
  }
});

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
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
    if (dx < 0) lector.siguiente(); else lector.anterior();
  }
}, { passive: true });

// ───────────────────────── Arranque ─────────────────────────

if (localStorage.getItem(CLAVE_NOCHE) === '1') {
  document.body.classList.add('modo-noche');
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => null);
}

crearCliente();
mostrarVista('biblioteca');
cargarBiblioteca();
