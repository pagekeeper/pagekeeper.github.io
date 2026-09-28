# 4. La configuración de la nube viaja en el fragmento de un enlace

Fecha: 2026-07-18 · Estado: aceptado (registro retroactivo, redactado el 2026-09-28)

## Contexto

Configurar la nube en cada dispositivo (dirección, usuario y contraseña de
aplicación) es tedioso, sobre todo en el móvil. Sin servidor propio (ADR 1) no
hay dónde guardar esa configuración para recuperarla.

## Decisión

Desde Ajustes se copia un enlace con la configuración codificada en el
fragmento (`#cfg=…`). Al abrirlo, la aplicación la lee, la guarda en
`localStorage` y borra el fragmento de la barra de direcciones con
`history.replaceState` antes de hacer nada más, para que la contraseña no
quede a la vista ni en el historial. También se puede guardar y restaurar en
un archivo.

## Alternativas descartadas

El historial no recoge una discusión de alternativas; estas son las que el
diseño evita, con el motivo que se desprende del código y la documentación.

- **Un parámetro de consulta (`?cfg=`)**: se envía al servidor en cada
  petición y queda en sus registros. El fragmento no sale del navegador.
- **Un código QR o un servicio de emparejamiento**: necesitaría un servidor
  intermedio.

## Consecuencias

El enlace da acceso a la nube: la interfaz avisa de que hay que guardarlo en
un lugar privado y borrar las copias que no hagan falta.

## Evidencia

Los navegadores no incluyen el fragmento ni en la petición ni en la cabecera
`Referer`. Con la versión 1.6.0, que aún llevaba un contador de visitas que
enviaba la dirección de la página (ADR 7), se interceptó esa petición al abrir
un enlace `#cfg=`: la dirección enviada ya no contenía el fragmento.

## Riesgos y limitaciones

La contraseña va codificada en base64, no cifrada. Quien vea el enlace puede
leerla.
