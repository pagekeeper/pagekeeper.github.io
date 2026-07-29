# PageKeeper

Lector de PDF y EPUB que funciona en el navegador y guarda la posición, las
notas y los subrayados en un servidor WebDAV propio. Se sirve como sitio
estático en GitHub Pages.

## Lo que no se toca

- **No hay build ni empaquetador.** Lo que está en el repositorio es lo que se
  sirve. Nada de compilar, transpilar ni minificar.
- **No hay dependencias que se instalen.** Las librerías de terceros viven en
  `vendor/` y se sirven desde ahí. No se añaden CDN: la aplicación tiene que
  funcionar sin conexión y con una política de seguridad estricta.
- **No hay `package.json`.** Las pruebas se lanzan con el `node --test` que
  trae Node, sin nada alrededor.

Si una tarea parece pedir cualquiera de esas tres cosas, casi siempre hay otro
camino. Antes de introducirlas, pregunta.

## Dónde va el código nuevo

`js/app.js` es el arranque de la aplicación: crea los oyentes, monta el DOM y
reparte el trabajo. Es grande por acumulación histórica, y la regla que evita
que siga creciendo es esta:

> **Lo que se puede decidir sin mirar la pantalla va a un módulo de `js/`, con
> su archivo de pruebas. En `app.js` solo se queda lo que necesita el DOM.**

En la práctica, al escribir algo nuevo, sepáralo en dos:

- **Las cuentas y las decisiones** —umbrales, orden de una lista, qué se
  muestra y qué se omite, cómo se arma un texto, qué límites tiene un valor—
  van a un módulo propio que exporta funciones puras. Se prueban con
  `node --test` y no tocan `document`, `window` ni `localStorage`.
- **Montar y pintar** —crear elementos, leer cajas, oír eventos— se queda en
  `app.js`, llamando a esas funciones.

Cuando una función necesita algo del navegador para decidir (el ancho de la
ventana, el comparador de CFI de epub.js), pásaselo como parámetro en vez de
que vaya a buscarlo. Es lo que la hace comprobable.

Módulos que ya siguen este reparto y sirven de ejemplo: `gestos.js`,
`panel-navegacion.js`, `marcadores.js`, `vista-anotaciones.js`,
`vista-estadisticas.js`, `ritmo.js`, `recorte.js`, `copia-local.js`.

Y al revés: no muevas código de `app.js` solo porque el archivo sea largo. Si
lo que hay es orquestación —encadenar peticiones al servidor, sincronizar,
tocar IndexedDB— mudarlo de archivo no añade ninguna prueba y sí arriesga una
regresión. Se trocea cuando hay decisiones atrapadas, no por tamaño.

## Estilo

- **Todo en español**: nombres de archivo, funciones, variables y comentarios.
- **Los comentarios explican el porqué**, no el qué. El código ya dice lo que
  hace; el comentario está para la decisión que no se ve: por qué ese umbral,
  qué pasaba antes de ponerlo, qué caso raro se está esquivando. Lee un módulo
  cualquiera antes de escribir para coger el tono.
- Los textos de la interfaz nunca van escritos en el código: se añaden a
  `js/i18n.js`, que lleva **tres idiomas (`es`, `ca`, `en`)**. Una clave nueva
  se añade a los tres.

## Pruebas

Dos niveles, y los dos importan:

```bash
node --test tests/*.test.mjs      # la lógica, sin navegador (rápido)
python3 tests/e2e/todas.py        # Chromium de verdad (tarda minutos)
python3 tests/e2e/todas.py ayuda  # solo una
```

Las de `tests/*.test.mjs` comprueban las cuentas. Las de `tests/e2e/` conducen
un navegador: abren libros, pulsan botones y miran lo que sale. Cada una
levanta su propio servidor; no hay que preparar nada. Hay más detalle en
`tests/e2e/README.md`.

Para probar a mano algo que las pruebas no cubren, la skill `verify` explica
cómo levantar la aplicación y conducirla con Playwright, incluidas las trampas
conocidas (paneles que se ocultan en vez de desmontarse, arrastres que
Playwright no dispara solos, el service worker cacheando).

## Antes de dar por terminado un cambio

1. `node --test tests/*.test.mjs` en verde.
2. Si tocaste el lector o la interfaz, compruébalo en un navegador de verdad.
   Que la lógica pase no demuestra que la página se pinte.
3. **Si tocaste `css/`, `js/` o `index.html`, sube la versión de `sw.js`**
   (`pagekeeper-vNN`). Si no, quien ya tenga la aplicación instalada seguirá
   viendo la anterior.
4. **Si añadiste un archivo a `js/`, añádelo a la lista `RECURSOS` de
   `sw.js`.** Si falta, la aplicación deja de arrancar sin conexión.
5. Al cambiar el comportamiento de algo que ya funcionaba —aunque sea para
   mejor— dilo explícitamente en el mensaje del commit y al usuario.

Una forma barata de comprobar que un refactor no ha cambiado nada: escribe el
guion de Playwright, ejecútalo, guarda la salida, haz `git stash` para volver
al código anterior, ejecútalo otra vez y compara. Si las dos salidas son
idénticas, el comportamiento se ha conservado.

## Git

El usuario prefiere que los cambios terminados se confirmen y se suban a
`main` sin preguntar. Los mensajes de commit van en español y en el mismo tono
que los comentarios: qué cambia y por qué, no un listado de archivos.
