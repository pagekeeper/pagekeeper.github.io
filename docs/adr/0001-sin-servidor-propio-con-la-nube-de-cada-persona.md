# 1. PageKeeper no tiene servidor propio: cada persona conecta su nube

Fecha: 2026-07-17 · Estado: aceptado (registro retroactivo, redactado el 2026-09-28)

## Contexto

La idea de partida es leer el mismo libro en varios dispositivos y continuar
siempre en la misma página. Para eso hace falta guardar en algún sitio común
la posición, los marcadores y las anotaciones. Un servidor propio resolvería
la sincronización, pero obligaría a mantenerlo, a guardar datos de lectura de
otras personas y a responder de ellos.

## Decisión

PageKeeper es un sitio estático servido desde GitHub Pages, sin servidor ni
base de datos propios. Cada persona conecta, si quiere, su propia nube por
WebDAV (Nextcloud, ownCloud u otro servidor), y el navegador habla
directamente con ella. Sin nube, los libros se guardan en el propio navegador
(IndexedDB) y la aplicación funciona igual, sin sincronizar.

En la nube, el progreso y los marcadores van en `lector-progreso.json`, en la
misma carpeta de los libros, y las anotaciones y el tiempo de lectura en un
archivo lateral por libro (`<nombre>.pagekeeper.json`).

## Alternativas descartadas

El historial no recoge una discusión de alternativas; estas son las que el
diseño evita, con el motivo que se desprende del código y la documentación.

- **Un servidor propio con cuentas**: añade mantenimiento, coste y la custodia
  de datos personales, que es justo lo que se quiere evitar.
- **Google Drive o Dropbox con sus API**: atan la aplicación a un proveedor
  concreto y exigen registrar la aplicación con él.

## Consecuencias

Los datos de lectura solo están en el dispositivo y en la nube que elige cada
persona. A cambio, la configuración es más exigente: hace falta una contraseña
de aplicación y que el servidor WebDAV permita CORS para el dominio del lector
(en Nextcloud, con la app WebAppPassword). El README lo explica paso a paso.

## Riesgos y limitaciones

Si el servidor no expone `ETag`, dos dispositivos que escriben a la vez pueden
pisarse. La fusión por elementos (cada marcador y cada anotación por separado,
con marcas de borrado) reduce ese riesgo, pero no lo elimina del todo.
