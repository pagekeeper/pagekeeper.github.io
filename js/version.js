// La versión de PageKeeper que se está ejecutando.
//
// Se numera MAYOR.MENOR.PARCHE:
//   MAYOR  cambia si algo deja de funcionar como antes para quien ya lo usaba
//          (un dato que hay que migrar, una forma de trabajar distinta).
//   MENOR  para lo que se añade: una función nueva, una pantalla nueva.
//   PARCHE para arreglos y retoques que no añaden nada.
//
// Qué cambia en cada una está en CHANGELOG.md, y cada versión lleva su
// etiqueta en git. Esto no es lo mismo que el número de la caché del service
// worker (`pagekeeper-vNN`), que sube en cada despliegue aunque no cambie la
// versión: uno dice qué hay dentro y el otro obliga al navegador a volver a
// pedir los archivos.
export const VERSION = '1.0.3';
