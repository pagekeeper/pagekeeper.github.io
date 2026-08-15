// Añadir dos veces el mismo libro a la biblioteca del dispositivo.
//
// Un libro local se identifica por su nombre de archivo y su tamaño
// (`local:<nombre>:<tamaño>`), así que volver a añadir el mismo archivo cae en
// el mismo identificador y se limita a sustituirlo: la posición, los
// marcadores y el tiempo siguen ahí. Pero el mismo libro con otro nombre —una
// copia descargada dos veces, «(1)» al final, el ejemplo que la aplicación
// precarga con un nombre más presentable que el del archivo— entraba como un
// libro distinto, y la biblioteca acababa con dos fichas del mismo texto, cada
// una con su propia posición.
//
// Lo que decide es el contenido, no el nombre: si los bytes son los mismos, es
// el mismo libro. La huella se calcula fuera (el navegador tiene SHA-256 en
// `crypto.subtle`) y aquí solo se compara, que es lo que hay que poder probar.
//
// Comparar cuesta leer el archivo entero, así que primero se descarta por
// tamaño: dos archivos de distinto tamaño no pueden ser el mismo, y con eso la
// mayoría de las veces no hay ni un candidato al que mirar.

// Los libros que podrían ser el mismo y hay que comprobar de verdad. Se
// excluye el propio identificador: volver a añadir el mismo archivo con el
// mismo nombre no es un duplicado, es reemplazarlo.
export function candidatosPorTamano(libros, { id, tamano }) {
  return (libros ?? []).filter((libro) => libro.tamano === tamano && libro.id !== id);
}

// El libro que ya está y es este mismo, o null. `huellas` es lo que se sepa de
// cada candidato: el que no traiga huella no se puede comparar y se deja
// pasar, que es preferible a impedir añadir un libro por no haber podido
// leer el que ya estaba.
export function duplicadoDe(candidatos, huella, huellas = {}) {
  if (!huella) return null;
  return (candidatos ?? []).find((libro) => huellas[libro.id] === huella) ?? null;
}

// ¿Qué hacer con un archivo que llega? Tres respuestas, y las tres se deciden
// sin tocar el disco:
//
//  - 'nuevo': no está, se guarda.
//  - 'reemplaza': mismo nombre y mismo tamaño, o sea el mismo identificador;
//    se guarda encima y no hay nada que avisar.
//  - 'duplicado': el contenido ya está con otro nombre; no se guarda y se dice
//    con qué libro coincide, para poder abrir ese en su lugar.
export function decidirEntrante({ id, tamano, huella }, libros, huellas = {}) {
  if ((libros ?? []).some((libro) => libro.id === id)) return { accion: 'reemplaza', libro: null };
  const duplicado = duplicadoDe(candidatosPorTamano(libros, { id, tamano }), huella, huellas);
  return duplicado ? { accion: 'duplicado', libro: duplicado } : { accion: 'nuevo', libro: null };
}
