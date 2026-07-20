// Resaltados y notas, con almacenamiento local y sincronización por libro.
// IndexedDB es siempre la copia de trabajo; los libros WebDAV tienen además
// un JSON lateral que se fusiona anotación a anotación.

import * as almacen from './almacen.js';

const VERSION = 1;
const AMBITO_LOCAL = 'local';
const FECHA_CERO = '1970-01-01T00:00:00.000Z';
const colas = new Map();

function uuid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ahoraPosterior(...fechas) {
  const maxima = fechas.filter(Boolean).sort().at(-1) ?? FECHA_CERO;
  const ms = Date.parse(maxima);
  return new Date(Math.max(Date.now(), Number.isFinite(ms) ? ms + 1 : 0)).toISOString();
}

function normalizar(documento, ambito, libro) {
  return {
    version: VERSION,
    ambito,
    libro,
    anotaciones: Array.isArray(documento?.anotaciones)
      ? documento.anotaciones.filter((a) => a?.id).map((a) => ({
        ...a,
        actualizado: a.actualizado ?? a.creado ?? FECHA_CERO,
      }))
      : [],
    pendientes: documento?.pendientes && typeof documento.pendientes === 'object'
      ? { ...documento.pendientes }
      : {},
  };
}

function remotoDe(documento) {
  const limpio = {
    version: VERSION,
    libro: documento.libro,
    anotaciones: documento.anotaciones,
  };
  return limpio;
}

function masReciente(una, otra) {
  if (una.actualizado !== otra.actualizado) {
    return una.actualizado > otra.actualizado ? una : otra;
  }
  return otra.borrado ? otra : una;
}

export function fusionarDocumentos(localOriginal, remotoOriginal, ambito, libro) {
  const local = normalizar(localOriginal, ambito, libro);
  const remoto = normalizar(remotoOriginal, ambito, libro);
  const locales = new Map(local.anotaciones.map((a) => [a.id, a]));
  const remotas = new Map(remoto.anotaciones.map((a) => [a.id, a]));
  const anotaciones = [];
  for (const id of new Set([...locales.keys(), ...remotas.keys()])) {
    const mia = locales.get(id);
    const suya = remotas.get(id);
    if (mia && suya && local.pendientes[id]) {
      anotaciones.push({ ...mia, actualizado: ahoraPosterior(mia.actualizado, suya.actualizado) });
    } else if (mia && suya) anotaciones.push(masReciente(mia, suya));
    else anotaciones.push(mia ?? suya);
  }
  return { ...local, anotaciones };
}

export function ambitoDe(libro, cliente) {
  return libro?.tipo === 'webdav' && cliente?.base ? cliente.base : AMBITO_LOCAL;
}

export async function listar(ambito, libro) {
  const documento = normalizar(await almacen.obtenerAnotaciones(ambito, libro), ambito, libro);
  return documento.anotaciones.filter((a) => !a.borrado).map((a) => ({ ...a }));
}

async function modificar(ambito, libro, transformacion) {
  const documento = normalizar(await almacen.obtenerAnotaciones(ambito, libro), ambito, libro);
  const siguientes = documento.anotaciones.map((a) => ({ ...a }));
  const modificadas = transformacion(siguientes);
  documento.anotaciones = siguientes;
  for (const anotacion of modificadas) documento.pendientes[anotacion.id] = uuid();
  await almacen.guardarAnotaciones(documento);
  return documento.anotaciones.filter((a) => !a.borrado).map((a) => ({ ...a }));
}

export function crear(ambito, libro, datos) {
  return modificar(ambito, libro, (anotaciones) => {
    const fecha = new Date().toISOString();
    const anotacion = { ...datos, id: uuid(), creado: fecha, actualizado: fecha };
    anotaciones.push(anotacion);
    return [anotacion];
  });
}

export function actualizar(ambito, libro, id, cambios) {
  return modificar(ambito, libro, (anotaciones) => {
    const indice = anotaciones.findIndex((a) => a.id === id && !a.borrado);
    if (indice < 0) return [];
    anotaciones[indice] = {
      ...anotaciones[indice],
      ...cambios,
      id,
      actualizado: ahoraPosterior(anotaciones[indice].actualizado),
    };
    return [anotaciones[indice]];
  });
}

export function eliminar(ambito, libro, id) {
  return modificar(ambito, libro, (anotaciones) => {
    const indice = anotaciones.findIndex((a) => a.id === id);
    if (indice < 0) return [];
    anotaciones[indice] = {
      id,
      borrado: true,
      actualizado: ahoraPosterior(anotaciones[indice].actualizado),
    };
    return [anotaciones[indice]];
  });
}

async function limpiarPendientesConfirmados(ambito, libro, confirmados) {
  const actual = normalizar(await almacen.obtenerAnotaciones(ambito, libro), ambito, libro);
  let cambio = false;
  for (const [id, token] of Object.entries(confirmados)) {
    if (actual.pendientes[id] === token) {
      delete actual.pendientes[id];
      cambio = true;
    }
  }
  if (cambio) await almacen.guardarAnotaciones(actual);
  return actual;
}

async function sincronizarAhora(libro, cliente) {
  const ambito = cliente.base;
  for (let intento = 0; intento < 4; intento++) {
    const respuesta = await cliente.leerAnotaciones(libro);
    // La red se espera antes de leer IndexedDB para no pisar una edición
    // hecha mientras llegaba la respuesta del servidor.
    const localLeido = normalizar(await almacen.obtenerAnotaciones(ambito, libro), ambito, libro);
    const remotoOriginal = respuesta?.datos ?? null;
    if (!remotoOriginal && !localLeido.anotaciones.length) return localLeido;
    const fusionado = fusionarDocumentos(localLeido, remotoOriginal, ambito, libro);
    await almacen.guardarAnotaciones(fusionado);
    const remotoNuevo = remotoDe(fusionado);
    if (JSON.stringify(remotoNuevo) === JSON.stringify(remotoOriginal)) {
      return limpiarPendientesConfirmados(ambito, libro, localLeido.pendientes);
    }
    try {
      await cliente.escribirAnotaciones(libro, remotoNuevo, respuesta?.etag ?? null);
    } catch (error) {
      if (error.conflictoSincronizacion && intento < 3) continue;
      throw error;
    }

    // No se limpian cambios realizados mientras la petición estaba en vuelo.
    return limpiarPendientesConfirmados(ambito, libro, localLeido.pendientes);
  }
  throw new Error('No se pudieron sincronizar las anotaciones tras varios cambios simultáneos.');
}

export function sincronizar(libro, cliente) {
  if (!cliente) return Promise.resolve(null);
  const clave = `${cliente.base}\n${libro}`;
  const anterior = colas.get(clave) ?? Promise.resolve();
  const tarea = anterior.catch(() => null).then(() => sincronizarAhora(libro, cliente));
  colas.set(clave, tarea);
  const limpiar = () => { if (colas.get(clave) === tarea) colas.delete(clave); };
  tarea.then(limpiar, limpiar);
  return tarea;
}

export async function sincronizarPendientes(cliente) {
  if (!cliente) return;
  const documentos = await almacen.listarDocumentosAnotaciones(cliente.base);
  const pendientes = documentos.filter((documento) => Object.keys(documento.pendientes ?? {}).length);
  const resultados = await Promise.allSettled(
    pendientes.map((documento) => sincronizar(documento.libro, cliente)),
  );
  const fallo = resultados.find((resultado) => resultado.status === 'rejected');
  if (fallo) throw fallo.reason;
}

export async function transferir(ambitoViejo, libroViejo, ambitoNuevo, libroNuevo) {
  const anterior = normalizar(
    await almacen.obtenerAnotaciones(ambitoViejo, libroViejo), ambitoViejo, libroViejo,
  );
  if (!anterior.anotaciones.length) return false;
  const destino = normalizar(
    await almacen.obtenerAnotaciones(ambitoNuevo, libroNuevo), ambitoNuevo, libroNuevo,
  );
  const fusionado = fusionarDocumentos(destino, anterior, ambitoNuevo, libroNuevo);
  for (const anotacion of fusionado.anotaciones) fusionado.pendientes[anotacion.id] = uuid();
  await almacen.guardarAnotaciones(fusionado);
  return true;
}

export function mover(ambito, libroViejo, libroNuevo) {
  return almacen.moverAnotaciones(ambito, libroViejo, libroNuevo);
}

export function olvidar(ambito, libro) {
  return almacen.borrarAnotaciones(ambito, libro);
}

export function olvidarPorPrefijo(ambito, prefijo) {
  return almacen.borrarAnotacionesPorPrefijo(ambito, prefijo);
}
