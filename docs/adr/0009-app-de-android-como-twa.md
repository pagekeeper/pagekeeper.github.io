# 9. La app de Android es la web publicada dentro de una Trusted Web Activity

Fecha: 2026-10-26 · Estado: aceptado

## Contexto

PageKeeper ya se podía instalar desde el navegador como PWA, pero hay que
saber hacerlo; «búscala en Google Play» lo entiende todo el mundo. El
26-10-2026 Juanjo preguntó si se podía convertir en app de Android como se
hizo con «Montflorit al dia» (ADR 0082 de meteo-local) y, vista la propuesta,
lo encargó («sí, hazlo»). Pidió también que la app abriera los PDF y EPUB
del móvil («lo de abrir los pdf y epub, lo haces tambien?»): un lector de
Android que no sale en «Abrir con» se queda corto.

Lo que condicionaba la elección: la web no tiene servidor propio ni build
(ADR 1 y 2), Juanjo ya tiene cuenta de desarrollador de Play sin prueba
cerrada obligatoria, y no puede haber gastos nuevos.

## Decisión

- **Una Trusted Web Activity (TWA)** generada con
  [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) 1.27
  (Google Chrome Labs, Apache-2.0) en `android/`. La app abre
  https://pagekeeper.github.io/ a pantalla completa con Chrome por debajo; no
  lleva copia de la web, así que cada cambio de la web llega a la app sin
  tocarla. Identificador `io.github.pagekeeper`, nombre «PageKeeper»,
  Android 7 (API 24) como mínimo y Android 16 (API 36) como objetivo. Sin
  notificaciones: PageKeeper no envía ninguna.
- **La web dice que la app es suya** con `.well-known/assetlinks.json`, que
  lleva dos huellas SHA-256: la de la clave de firma de Google, con la que
  Play firma lo que instala la gente, y la de la clave de subida, con la que
  se firma el APK de pruebas que se instala a mano. Sin ese archivo, la app
  enseñaría la barra de dirección.
- **«Abrir con» y «Compartir» los hace la web**, no la app, y sirven también a
  la PWA instalada:
  - `file_handlers` en el manifiesto (PDF y EPUB). Chrome entrega los
    archivos por `launchQueue`; `app.js` los recoge cuando ha terminado el
    arranque y los guarda en este dispositivo como uno añadido con «+».
  - `share_target` en el manifiesto, por POST a `?compartir`. GitHub Pages no
    admite POST, así que lo atiende `sw.js`: guarda los archivos en la caché
    `pagekeeper-compartidos` y manda la página a `?compartido`, donde `app.js`
    los recoge y vacía la caché.
  - Un libro recibido así entra en el dispositivo y, si es uno, se abre, sin
    preguntar dónde guardarlo: a diferencia de un libro que llega por
    enlace, que lo pregunta desde la 1.5.1 porque viene de fuera, el archivo
    ya es de la persona. Pasa por la misma comprobación de duplicados. Lo que
    llega sin extensión entra con la de su tipo (`js/archivos-recibidos.js`).
- **Iconos PNG** en el manifiesto (192 y 512 px, y uno adaptable con el libro
  dentro de la zona segura), que Android y Play piden y el SVG no cubre.
- **Política de privacidad en `privacidad.html`**, en los ocho idiomas, porque
  Play la exige en una dirección pública. El aviso de privacidad del pie la
  enlaza.
- **Clave de subida fuera del repositorio**, que es público:
  `~/.config/pagekeeper/android/` (`upload.jks` y su contraseña en
  `clau.env`), con una copia en la carpeta de credenciales de Juanjo
  (`android-pagekeeper/`). Con la firma de apps de Play, si se
  pierde, Google deja cambiarla. `android/construeix.sh` la enlaza y compila.
- **La versión de la app va aparte de la de la web**: cambia solo con el
  envoltorio (icono, nombre, versión de Android que exige Play). Cada año,
  cuando Play suba la versión exigida: `bubblewrap update` en `android/`,
  subir `appVersionCode` y publicar el paquete nuevo.
- **Ficha de Play en cinco idiomas** (castellano, catalán, gallego, euskera e
  inglés) en `android/fitxa/`, con la cabecera y las capturas generadas por
  `cabecera.py` y `capturas.py` a partir de la app real.

## Alternativas descartadas

- **Seguir solo con la PWA**: ya se instala, pero hay que saber hacerlo, y en
  Android no aparecía en «Abrir con».
- **App nativa o con Capacitor**: serían dos programas que mantener; la TWA
  es la misma web.
- **PWABuilder**: usa Bubblewrap por debajo, pero desde una web de Microsoft;
  con la herramienta en el equipo todo queda en el repositorio, como en
  meteo-local.
- **Preguntar dónde guardar el libro recibido** (nube o dispositivo), como con
  un enlace: añade un paso a quien solo quiere leer lo que acaba de pulsar, y
  el menú del libro ya lo lleva a la nube.

## Consecuencias

- Instalarla es tan fácil como cualquier app, y desde el gestor de archivos se
  abren los libros con PageKeeper.
- La app guarda sus datos en el almacenamiento de Chrome para
  pagekeeper.github.io: la biblioteca del dispositivo es la misma que en
  Chrome, y borrar los datos de ese sitio en Chrome la borra.
- Hay que mantener `assetlinks.json` y rehacer el paquete cuando Play suba la
  versión de Android exigida.
- `android/` se publica con el resto del repositorio en GitHub Pages; no lleva
  nada secreto (la clave y los paquetes compilados están en `.gitignore`).

## Evidencia

- Bubblewrap admite `fileHandlers` y `shareTarget` en `twa-manifest.json`
  ([referencia de la CLI](https://github.com/GoogleChromeLabs/bubblewrap/blob/main/packages/cli/README.md)),
  y los genera a partir de `file_handlers` y `share_target` del manifiesto
  (`@bubblewrap/core`, `TwaManifest.fromWebManifestJson`). El
  `AndroidManifest.xml` generado lleva un `VIEW` con `content:` para
  `application/pdf` y `application/epub+zip`, y `SEND` / `SEND_MULTIPLE` para
  los mismos tipos.
- Chromium entrega a la web los archivos de una TWA por su `launchQueue`,
  después de verificar el vínculo de Digital Asset Links y que la navegación
  queda dentro del ámbito
  ([Deep Dive: TWA Launch Parameters Handling](https://chromium.googlesource.com/chromium/src.git/+/main/components/webapps/docs/android_twa_launch_params.md)).

## Riesgos y limitaciones

- Algunos gestores de archivos no saben qué es un EPUB y lo pasan como
  `application/octet-stream`; entonces PageKeeper no sale en su «Abrir con»
  (Bubblewrap no admite filtros por extensión). Con el gestor de Juanjo sí sale.
- «Compartir» necesita el service worker ya instalado: si lo primero que se
  hace con la app recién instalada es compartirle un archivo, antes de
  abrirla nunca, el POST llega a GitHub Pages y falla. Basta con haberla
  abierto una vez.
- Sin Chrome (u otro navegador compatible con TWA) en el móvil, la app abre la
  web en una pestaña personalizada, con barra de dirección.
- Play rechaza a veces las apps que son solo una web («funcionalidad
  mínima»). Esta funciona sin conexión, guarda libros y anotaciones y
  sincroniza, pero no está garantizado.
- Solo Android; en iPhone y iPad, la PWA.

## Validación

- Pruebas de lógica: `tests/archivos-recibidos.test.mjs` (nombres y tipos de
  lo recibido) y `tests/app-android.test.mjs` (que el manifiesto, `sw.js`,
  `app.js`, `assetlinks.json` y `android/twa-manifest.json` usan los mismos
  nombres).
- Prueba de navegador `tests/e2e/libros_recibidos.py`: «Abrir con» con un
  `launchQueue` simulado y otro libro ya abierto (se abre el recibido, y el
  mismo archivo otra vez no entra repetido); «Compartir» con el POST real
  contra el service worker, también con un EPUB sin extensión; la política de
  privacidad en el idioma de la aplicación y sin desbordar a 360 px.
- Compilación (26-10-2026, `android/construeix.sh`): APK firmado de 1,1 MB y
  AAB de 1,2 MB; `aapt2` da `io.github.pagekeeper`, versión 1.0.0, objetivo
  API 36 y ningún permiso del sistema; `apksigner` da la misma huella que
  publica `assetlinks.json`, y la API de Digital Asset Links de Google ya
  devuelve el vínculo.
- En el móvil de Juanjo (26-10-2026), con el APK servido en la red de casa:
  se instala, abre sin barra de dirección, y «Abrir con» un PDF y un EPUB
  desde el gestor de archivos los abre, también con otro libro ya abierto, y
  «Compartir» un archivo desde otra aplicación lo abre también.
- Play Console (26-10-2026): la app se creó gratuita; el AAB 1.0.0 se aceptó
  en la prueba interna y la huella de la clave de firma de Google que da
  «Firma de aplicaciones» es la que se añadió a `assetlinks.json`.
