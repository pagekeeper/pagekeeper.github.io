# 7. PageKeeper no lleva analítica ni contadores de visitas

Fecha: 2026-09-28 · Estado: aceptado

## Contexto

Desde el 2026-07-26, PageKeeper registraba las visitas en un contador propio
alojado en bilateria.org (`js/analytics.js`), sin guardar direcciones IP ni
usar cookies. La evaluación VCER de la versión 1.6.0 lo puntuó con un 0 en
datos personales, porque la rúbrica de la guía «Vibe coding responsable» no
admite ninguna analítica. Al revisarlo apareció además que la petición
enviaba la dirección completa de la página: al abrir un libro con
`#libro=<dirección>`, la dirección del libro llegaba al contador antes de que
la aplicación la borrase de la barra.

## Decisión

Se retira el contador entero: `js/analytics.js`, los metadatos `analytics-*`
de `index.html`, el dominio bilateria.org de `script-src` y el archivo de la
lista de caché de `sw.js`. El aviso de privacidad del pie pasa a decir que no
hay analítica ni servidor propio, y dónde se guardan los datos.

## Alternativas descartadas

- **Mantenerlo y enviar solo el dominio, sin la dirección completa**: seguiría
  siendo analítica, y la aplicación incumpliría lo que la guía pide a los
  materiales educativos.

## Consecuencias

Ya no se sabe cuánta gente usa PageKeeper. La aplicación no se comunica con
ningún servidor que no sea el propio sitio, la nube de cada persona y la web
de un libro que se abre por enlace. El panel de estadísticas de bilateria.org
deja de recibir datos, pero no se ha tocado desde aquí.

## Evidencia

Prueba con Playwright sobre la 1.6.0, interceptando y abortando la petición a
bilateria.org: con `#libro=https%3A%2F%2Fejemplo.org%2Fprivado%2Flibro.epub`,
el parámetro `page_url` contenía esa dirección. Con `#cfg=` no la contenía,
porque la aplicación borra antes ese fragmento (ADR 4).

## Validación

Tras el cambio, al cargar la aplicación no sale ninguna petición a
bilateria.org y la política de seguridad no admite scripts de ese dominio.
