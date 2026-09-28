# 6. El despliegue lo hace un flujo de GitHub Actions

Fecha: 2026-08-15 · Estado: aceptado (registro retroactivo, redactado el 2026-09-28)

## Contexto

El sitio se publicaba con la compilación heredada de GitHub Pages, la que se
configura con una rama. Dejaba de dispararse a menudo: el commit llegaba a
GitHub y el sitio seguía sirviendo la versión anterior, sin ningún aviso. Pasó
en tres de cinco subidas seguidas, y había que pedir la reconstrucción a mano
por la API.

## Decisión

Empujar a `main` lanza `.github/workflows/desplegar.yml`, que pasa las pruebas
de lógica y publica el repositorio entero en Pages. Se ve en la pestaña
«Actions» y se puede relanzar desde ahí.

## Alternativas descartadas

- **Seguir con la compilación heredada**: el fallo silencioso era el problema.
- **Pasar también las pruebas de navegador en el flujo**: tardan varios minutos
  y necesitan Chromium y rclone; se lanzan en local antes de subir.

## Consecuencias

Si una prueba de lógica falla, no se publica. Para comprobar qué hay en
producción basta con leer `https://pagekeeper.github.io/js/version.js`.
