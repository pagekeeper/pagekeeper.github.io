# 3. La política de seguridad va en un `<meta>` y deja abierto `connect-src`

Fecha: 2026-07-28 · Estado: aceptado (registro retroactivo, redactado el 2026-09-28)

## Contexto

PageKeeper abre EPUB de cualquier procedencia, y un EPUB es HTML que puede
traer scripts. Los capítulos ya se sanean y se abren con su propia política,
muy estricta (`default-src 'none'`, en `js/lector-epub.js`). Faltaba una red
de seguridad para la propia página. GitHub Pages no permite enviar cabeceras
propias.

## Decisión

La política va en un `<meta http-equiv="Content-Security-Policy">` de
`index.html`. `script-src` solo admite `'self'`, así que ningún script escrito
dentro del HTML ni de otro dominio puede ejecutarse. `connect-src` queda
abierto (`*`), porque la nube WebDAV la elige cada persona y puede estar en
cualquier dominio, incluso en `http` dentro de una red local.
`style-src` conserva `'unsafe-inline'`, porque el navegador cuenta como estilo
en línea lo que se escribe desde JavaScript (barras del gráfico, ancho del
panel lateral).

## Alternativas descartadas

- **Enviar la política como cabecera**: GitHub Pages no lo permite. Por eso
  quedan fuera `frame-ancestors` y `sandbox`.
- **Cerrar `connect-src` a una lista de dominios**: impediría usar una nube
  propia en un dominio que no esté en la lista.

## Consecuencias

Los dos scripts que había dentro del HTML se sacaron a su propio archivo
(`js/tema-inicial.js` y `js/mathjax-config.js`). Todo script nuevo tiene que
ir en un archivo del propio sitio.

## Evidencia

`tests/e2e/seguridad.py` abre PDF, miniaturas, EPUB con fórmulas, portadas,
ZIP y WebDAV en Chromium y falla ante cualquier violación de la política.

## Validación

La prueba pasa sin violaciones en la versión 1.6.0 (2026-09-28).
