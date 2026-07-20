// Cliente WebDAV mínimo para el navegador.
// Funciona con Nextcloud, ownCloud y cualquier servidor WebDAV que permita
// CORS desde el dominio donde esté alojado el lector.

const ARCHIVO_PROGRESO = 'lector-progreso.json';

function archivoAnotaciones(libro) {
  return `${libro}.pagekeeper.json`;
}

// Basic Auth admite bytes UTF-8; btoa solo acepta latin1, así que
// convertimos primero la cadena a bytes.
function base64Utf8(texto) {
  const bytes = new TextEncoder().encode(texto);
  let binario = '';
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario);
}

export class ClienteWebDav {
  constructor({ url, usuario, clave }) {
    this.base = url.replace(/\/+$/, '');
    this.cabeceras = { Authorization: 'Basic ' + base64Utf8(`${usuario}:${clave}`) };
  }

  // `ruta` es una ruta relativa a la carpeta base ('' para la propia base,
  // 'Novelas/Fantasía' para una subcarpeta). Cada segmento se codifica por
  // separado para conservar las barras.
  urlDe(ruta) {
    return this.base + '/' + String(ruta).split('/').map(encodeURIComponent).join('/');
  }

  // Lista una carpeta: devuelve sus subcarpetas y sus libros (PDF/EPUB).
  async listar(ruta = '') {
    const url = (ruta ? this.urlDe(ruta) : this.base) + '/';
    const respuesta = await fetch(url, {
      method: 'PROPFIND',
      headers: {
        ...this.cabeceras,
        Depth: '1',
        'Content-Type': 'application/xml; charset=utf-8',
      },
      body: `<?xml version="1.0"?>
        <d:propfind xmlns:d="DAV:">
          <d:prop><d:resourcetype/><d:getcontentlength/><d:getetag/><d:getlastmodified/></d:prop>
        </d:propfind>`,
    });
    if (!respuesta.ok) throw await this.errorDe(respuesta, 'listar la carpeta');

    const xml = new DOMParser().parseFromString(await respuesta.text(), 'application/xml');
    // El PROPFIND incluye la propia carpeta consultada: se identifica por su
    // ruta normalizada para no listarla como subcarpeta de sí misma.
    const rutaPedida = decodeURIComponent(new URL(url).pathname).replace(/\/+$/, '');
    const carpetas = [];
    const libros = [];
    for (const nodo of xml.getElementsByTagNameNS('DAV:', 'response')) {
      const href = nodo.getElementsByTagNameNS('DAV:', 'href')[0]?.textContent ?? '';
      const rutaHref = decodeURIComponent(new URL(href, this.base).pathname).replace(/\/+$/, '');
      if (!rutaHref || rutaHref === rutaPedida) continue;
      const nombre = rutaHref.split('/').pop();
      const esCarpeta = nodo.getElementsByTagNameNS('DAV:', 'collection').length > 0;
      if (esCarpeta) {
        if (!nombre.startsWith('.')) carpetas.push({ nombre });
        continue;
      }
      if (!/\.(pdf|epub)$/i.test(nombre)) continue;
      const tamano = Number(nodo.getElementsByTagNameNS('DAV:', 'getcontentlength')[0]?.textContent ?? 0);
      const etag = nodo.getElementsByTagNameNS('DAV:', 'getetag')[0]?.textContent ?? '';
      const modificado = nodo.getElementsByTagNameNS('DAV:', 'getlastmodified')[0]?.textContent ?? '';
      libros.push({ nombre, tamano, ...(etag ? { etag } : {}), ...(modificado ? { modificado } : {}) });
    }
    carpetas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    libros.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return { carpetas, libros };
  }

  async crearCarpeta(ruta) {
    const respuesta = await fetch(this.urlDe(ruta), {
      method: 'MKCOL',
      headers: this.cabeceras,
    });
    if (respuesta.status === 405) {
      throw new Error('No se pudo crear la carpeta: ya existe un elemento con ese nombre (405)');
    }
    if (!respuesta.ok) throw await this.errorDe(respuesta, 'crear la carpeta');
  }

  // Mueve (o renombra) un archivo dentro del mismo servidor.
  async mover(origen, destino, sobrescribir = false) {
    const respuesta = await fetch(this.urlDe(origen), {
      method: 'MOVE',
      headers: {
        ...this.cabeceras,
        Destination: this.urlDe(destino),
        Overwrite: sobrescribir ? 'T' : 'F',
      },
    });
    if (!respuesta.ok) throw await this.errorDe(respuesta, `mover «${origen}»`);
  }

  async descargar(nombre, alProgresar) {
    const respuesta = await fetch(this.urlDe(nombre), { headers: this.cabeceras });
    if (!respuesta.ok) throw await this.errorDe(respuesta, `descargar «${nombre}»`);

    const total = Number(respuesta.headers.get('Content-Length') ?? 0);
    if (!respuesta.body || !total || !alProgresar) {
      return new Uint8Array(await respuesta.arrayBuffer());
    }
    const lector = respuesta.body.getReader();
    const trozos = [];
    let recibido = 0;
    for (;;) {
      const { done, value } = await lector.read();
      if (done) break;
      trozos.push(value);
      recibido += value.length;
      alProgresar(recibido, total);
    }
    const datos = new Uint8Array(recibido);
    let posicion = 0;
    for (const trozo of trozos) { datos.set(trozo, posicion); posicion += trozo.length; }
    return datos;
  }

  async existe(nombre) {
    const respuesta = await fetch(this.urlDe(nombre), {
      method: 'PROPFIND',
      headers: { ...this.cabeceras, Depth: '0' },
    });
    if (respuesta.status === 404) return false;
    if (respuesta.ok || respuesta.status === 207) return true;
    throw await this.errorDe(respuesta, `comprobar si existe «${nombre}»`);
  }

  async subir(nombre, datos) {
    const tipo = /\.epub$/i.test(nombre) ? 'application/epub+zip' : 'application/pdf';
    const respuesta = await fetch(this.urlDe(nombre), {
      method: 'PUT',
      headers: { ...this.cabeceras, 'Content-Type': tipo },
      body: datos,
    });
    if (!respuesta.ok) throw await this.errorDe(respuesta, `subir «${nombre}»`);
  }

  async borrar(nombre) {
    const respuesta = await fetch(this.urlDe(nombre), {
      method: 'DELETE',
      headers: this.cabeceras,
    });
    if (!respuesta.ok) throw await this.errorDe(respuesta, `borrar «${nombre}»`);
  }

  async leerProgreso() {
    const respuesta = await fetch(this.urlDe(ARCHIVO_PROGRESO), {
      headers: { ...this.cabeceras, 'Cache-Control': 'no-cache' },
    });
    if (respuesta.status === 404) return null;
    if (!respuesta.ok) throw await this.errorDe(respuesta, 'leer el progreso');
    try {
      return await respuesta.json();
    } catch {
      // Devolver una estructura vacía permite regenerar un JSON corrupto.
      return { version: 1, libros: {} };
    }
  }

  async escribirProgreso(datos) {
    // Se usa un PUT WebDAV normal por compatibilidad. Algunos servidores y
    // proxies aceptan leer ETag pero rechazan If-Match en esta ruta, dejando
    // el progreso únicamente en el navegador sin actualizar el archivo.
    const respuesta = await fetch(this.urlDe(ARCHIVO_PROGRESO), {
      method: 'PUT',
      headers: { ...this.cabeceras, 'Content-Type': 'application/json' },
      body: JSON.stringify(datos, null, 2),
    });
    if (!respuesta.ok) throw await this.errorDe(respuesta, 'guardar el progreso');
  }

  async leerAnotaciones(libro) {
    const respuesta = await fetch(this.urlDe(archivoAnotaciones(libro)), {
      headers: { ...this.cabeceras, 'Cache-Control': 'no-cache' },
    });
    if (respuesta.status === 404) return { datos: null, etag: null };
    if (!respuesta.ok) throw await this.errorDe(respuesta, 'leer las anotaciones');
    try {
      return { datos: await respuesta.json(), etag: respuesta.headers.get('ETag') };
    } catch {
      return { datos: { version: 1, libro, anotaciones: [] }, etag: respuesta.headers.get('ETag') };
    }
  }

  async escribirAnotaciones(
    libro, datos, etag = null, yaExiste = Boolean(etag), usarCondicional = true,
  ) {
    const url = this.urlDe(archivoAnotaciones(libro));
    // If-Match exige un ETag fuerte. Si el servidor no lo expone por CORS o
    // solo entrega uno débil (W/...), se conserva la compatibilidad mediante
    // un PUT normal para archivos existentes. If-None-Match sigue protegiendo
    // la creación simultánea de un lateral que aún no existe.
    const etagFuerte = etag && !/^W\//i.test(etag) ? etag : null;
    const guardar = (condicional = true) => fetch(url, {
      method: 'PUT',
      headers: {
        ...this.cabeceras,
        'Content-Type': 'application/json',
        ...(condicional && etagFuerte ? { 'If-Match': etagFuerte } : {}),
        ...(condicional && !etagFuerte && !yaExiste ? { 'If-None-Match': '*' } : {}),
      },
      body: JSON.stringify(datos, null, 2),
    });

    let respuesta;
    try {
      respuesta = await guardar(usarCondicional);
    } catch (error) {
      // Algunos WebDAV no permiten las cabeceras condicionales mediante CORS.
      if (!(error instanceof TypeError)) throw error;
      respuesta = await guardar(false);
    }
    if ([400, 405, 501].includes(respuesta.status)) respuesta = await guardar(false);
    if (respuesta.status === 409 || respuesta.status === 412) {
      const error = new Error('Las anotaciones cambiaron en otro dispositivo.');
      error.conflictoSincronizacion = true;
      throw error;
    }
    if (!respuesta.ok) throw await this.errorDe(respuesta, 'guardar las anotaciones');
  }

  async moverAnotaciones(origen, destino, sobrescribir = false) {
    const archivoOrigen = archivoAnotaciones(origen);
    if (!await this.existe(archivoOrigen)) return false;
    await this.mover(archivoOrigen, archivoAnotaciones(destino), sobrescribir);
    return true;
  }

  async borrarAnotaciones(libro) {
    const respuesta = await fetch(this.urlDe(archivoAnotaciones(libro)), {
      method: 'DELETE', headers: this.cabeceras,
    });
    if (respuesta.status !== 404 && !respuesta.ok) {
      throw await this.errorDe(respuesta, 'borrar las anotaciones');
    }
  }

  async errorDe(respuesta, accion) {
    let motivo = `${respuesta.status} ${respuesta.statusText}`;
    if (respuesta.status === 401) motivo = 'usuario o contraseña incorrectos (401)';
    if (respuesta.status === 404) motivo = 'la carpeta o el archivo no existe (404)';
    return new Error(`No se pudo ${accion}: ${motivo}`);
  }
}

// Un fallo de red en un fetch cross-origin suele significar CORS bloqueado.
export function explicarError(error) {
  if (error instanceof TypeError) {
    return 'No se pudo conectar con el servidor. Posibles causas:\n' +
      '• El servidor no permite CORS desde este dominio (en Nextcloud, instala la app «WebAppPassword» y añade este dominio).\n' +
      '• La URL es incorrecta o no hay conexión.';
  }
  return error.message;
}
