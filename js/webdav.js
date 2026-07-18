// Cliente WebDAV mínimo para el navegador.
// Funciona con Nextcloud, ownCloud y cualquier servidor WebDAV que permita
// CORS desde el dominio donde esté alojado el lector.

const ARCHIVO_PROGRESO = 'lector-progreso.json';

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

  urlDe(nombre) {
    return this.base + '/' + encodeURIComponent(nombre);
  }

  async listarPdfs() {
    const respuesta = await fetch(this.base + '/', {
      method: 'PROPFIND',
      headers: {
        ...this.cabeceras,
        Depth: '1',
        'Content-Type': 'application/xml; charset=utf-8',
      },
      body: `<?xml version="1.0"?>
        <d:propfind xmlns:d="DAV:">
          <d:prop><d:resourcetype/><d:getcontentlength/></d:prop>
        </d:propfind>`,
    });
    if (!respuesta.ok) throw await this.errorDe(respuesta, 'listar la carpeta');

    const xml = new DOMParser().parseFromString(await respuesta.text(), 'application/xml');
    const libros = [];
    for (const nodo of xml.getElementsByTagNameNS('DAV:', 'response')) {
      const href = nodo.getElementsByTagNameNS('DAV:', 'href')[0]?.textContent ?? '';
      const esCarpeta = nodo.getElementsByTagNameNS('DAV:', 'collection').length > 0;
      if (esCarpeta) continue;
      const nombre = decodeURIComponent(href.replace(/\/+$/, '').split('/').pop());
      if (!/\.pdf$/i.test(nombre)) continue;
      const tamano = Number(nodo.getElementsByTagNameNS('DAV:', 'getcontentlength')[0]?.textContent ?? 0);
      libros.push({ nombre, tamano });
    }
    libros.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return libros;
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
    const respuesta = await fetch(this.urlDe(nombre), {
      method: 'PUT',
      headers: { ...this.cabeceras, 'Content-Type': 'application/pdf' },
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
      return null; // archivo corrupto: se regenerará al guardar
    }
  }

  async escribirProgreso(datos) {
    const respuesta = await fetch(this.urlDe(ARCHIVO_PROGRESO), {
      method: 'PUT',
      headers: { ...this.cabeceras, 'Content-Type': 'application/json' },
      body: JSON.stringify(datos, null, 2),
    });
    if (!respuesta.ok) throw await this.errorDe(respuesta, 'guardar el progreso');
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
