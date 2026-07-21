# 📖 PageKeeper: lector de PDF y EPUB

Lector de libros **PDF y EPUB** pensado para leer desde varios dispositivos
**continuando siempre en la misma página**. Disponible en
https://pagekeeper.github.io/. Es una web estática (funciona en GitHub Pages,
sin servidor propio) y cada persona conecta **su propia nube** para guardar los
libros y sincronizar el progreso de lectura.

## Características

- 📚 **Biblioteca en tu nube**: lista los PDF y EPUB de una carpeta de tu
  Nextcloud, ownCloud o cualquier servidor **WebDAV**.
- 📐 **EPUB con fórmulas matemáticas**: los EPUB se leen con epub.js y las
  fórmulas (MathML o LaTeX) se dibujan con MathML nativo del navegador o
  MathJax incrustado, también sin conexión. En los EPUB el progreso se guarda
  como posición exacta (CFI) y porcentaje del libro, y los botones de zoom
  ajustan el tamaño de letra.
- 🔄 **Sincronización de posición**: la página por la que vas se guarda en un
  archivo `lector-progreso.json` en esa misma carpeta. Al abrir el libro en
  otro dispositivo, continúas donde lo dejaste (gana siempre la lectura más
  reciente).
- 📱 **Multidispositivo**: funciona en móvil, tablet y ordenador. Es una PWA:
  se puede instalar y la aplicación funciona sin conexión (el progreso se
  guarda en local y se sube al recuperar la red).
- ▶️ **Continuar leyendo**: al abrir la aplicación, el último libro aparece
  destacado. Los demás recientes se pueden desplegar y quitar individualmente;
  vuelven a aparecer al abrirlos de nuevo. Los terminados y los archivos que ya
  no están disponibles se excluyen automáticamente.
- 🗂️ **Biblioteca organizada**: permite ordenar por lectura reciente, título,
  autor o progreso; filtrar por pendientes, en lectura y terminados; y marcar
  manualmente cualquier libro como terminado o quitar la etiqueta pulsándola.
  Si se abre de nuevo un libro terminado, la etiqueta desaparece sin reiniciar
  su progreso. Los libros con 0 % leído se consideran pendientes aunque ya se
  hayan abierto.
- 📖 **Libro de ejemplo**: cuando la biblioteca está completamente vacía,
  ofrece añadir y abrir una obra incluida en español, catalán o inglés según
  el idioma de la interfaz. Los tres EPUB están disponibles también sin red.
- 📴 **Libros de la nube sin conexión**: cada PDF o EPUB remoto se puede fijar
  en el dispositivo. PageKeeper guarda una copia en IndexedDB, la actualiza
  cuando cambia en WebDAV y la abre automáticamente si falla la conexión, sin
  confundirla con un libro local ni borrar nunca el original de la nube.
- 📂 **Biblioteca local**: también puedes añadir PDF del propio dispositivo
  sin configurar nada. Quedan guardados en el navegador (IndexedDB), aparecen
  en la sección «En este dispositivo» y se reabren sin volver a elegir el
  archivo (la posición solo se recuerda en ese navegador).
- 💾 **Copias portables de la biblioteca**: la pantalla «Importar y exportar»
  descarga en ZIP tanto la biblioteca del dispositivo como, por separado,
  toda la biblioteca WebDAV con sus subcarpetas. Conserva progreso, marcadores
  y anotaciones, y permite restaurar cada copia en otro navegador o servidor.
  Las credenciales WebDAV no se incluyen.
- ☁️ **Subir a la nube**: con una nube configurada puedes subir un PDF
  directamente desde la biblioteca (botón ➕) o, si ya lo estás leyendo en
  local, copiarlo a la nube con un toque conservando la página actual.
- 🗑️ **Borrar documentos**: cada libro tiene una papelera para eliminarlo,
  tanto de la nube (se borra del servidor) como del dispositivo.
- 🖱️ **Arrastrar y soltar**: admite uno o varios PDF/EPUB sobre la sección
  local para guardarlos en el dispositivo o sobre la sección remota para
  subirlos directamente por WebDAV.
- 📁 **Subcarpetas en la nube**: la biblioteca muestra las carpetas de tu
  nube y permite navegar por ellas, crear carpetas nuevas, borrarlas y mover
  libros de una carpeta a otra (con el botón de mover o arrastrando el libro
  hasta la carpeta) conservando el progreso y los marcadores. Las subidas
  van a la carpeta que tengas abierta.
- 🔖 **Marcadores**: guarda las posiciones que quieras de cada libro y vuelve
  a ellas desde un panel. En los libros de la nube se sincronizan entre
  dispositivos junto con la posición de lectura.
- 📝 **Resaltados y notas**: selecciona texto en PDF o EPUB para resaltarlo
  en uno de los cuatro colores (amarillo, verde, azul o rosa) o añadir una
  nota; el color se puede cambiar después. Funcionan sin conexión; en los
  libros WebDAV se fusionan y sincronizan entre dispositivos mediante un
  JSON lateral por libro.
- 📤 **Exportar anotaciones**: descarga todos los resaltados y notas de un
  libro en un archivo Markdown, con la página o posición de cada uno, listo
  para llevar a tus apuntes u Obsidian.
- 🔊 **Lectura en voz alta**: lee el libro con la voz del navegador (sin
  servicios externos), empezando en la página actual y pasando de página o
  capítulo automáticamente, con pausa, elección de voz y velocidad.
- ✂️ **Texto y enlaces en PDF**: se puede seleccionar y copiar el texto del
  PDF, y sus enlaces funcionan: los internos (índice, referencias) saltan a
  su página y los externos se abren en otra pestaña.
- 🔑 **PDF protegidos**: solicita la contraseña al abrir un PDF cifrado y la
  utiliza solo durante esa apertura, sin guardarla.
- 🔎 **Dos buscadores**: filtra la biblioteca por título, autor, formato y
  metadatos, y encuentra palabras o frases dentro del PDF o EPUB con salto
  al punto exacto del resultado, que queda resaltado unos segundos.
- 🖥️ **Modo inmersivo**: un toque en el centro de la página oculta la barra
  para leer a pantalla completa; otro toque la recupera. En pantalla táctil
  el PDF también se amplía pellizcando con dos dedos.
- 📄 **Dos modos de lectura** (botón 📜/📄 en la barra): *página a página*
  como un libro (cómodo en móvil/tablet) o *páginas continuas* con scroll
  vertical (mejor en ordenador). La elección se recuerda entre sesiones.
- 📖 **Dos páginas juntas**: en modo página a página se pueden ver las
  páginas de dos en dos, como un libro abierto (ideal en pantallas anchas).
  En EPUB el texto se reparte en dos columnas cuando el área es ancha.
- 🔄 **Girar el PDF**: rota el documento 90° cada vez, para escaneos
  torcidos o apaisados. El giro se recuerda por libro en cada dispositivo.
- ⏱️ **Tiempo restante estimado**: tras unos minutos de lectura, la barra
  muestra cuánto falta para terminar el libro según tu ritmo real de
  lectura (medido y guardado solo en el dispositivo).
- 🌙 Modo noche, zoom, paso de página con botones, teclado (←/→, espacio,
  AvPág/RePág) o deslizando el dedo.
- 🔠 **Ajustes de texto en EPUB**: tipo de letra (la del libro, con serifa o
  sin serifa), interlineado y margen lateral, con las preferencias guardadas
  localmente en cada dispositivo.
- 🔗 **Configuración portátil**: desde Ajustes puedes copiar un enlace que
  lleva la configuración de la nube (URL, usuario y contraseña, codificados
  en el fragmento `#cfg=…`, que nunca se envía a ningún servidor). Al abrirlo
  en otro dispositivo, el lector queda configurado automáticamente.
- 🔒 **Privacidad**: no hay ningún servidor intermedio. El navegador habla
  directamente con tu nube y las credenciales se guardan solo en tu navegador
  (`localStorage`).

## Cómo usarlo

1. Abre la web del lector (o instálala como aplicación desde el navegador).
2. Pulsa ⚙️ **Ajustes** y rellena:
   - **URL de la carpeta WebDAV**, por ejemplo en Nextcloud:
     `https://tu-nube.com/remote.php/dav/files/TU_USUARIO/Libros`
   - **Usuario** y **contraseña de aplicación**.
3. Pulsa **Probar conexión** y después **Guardar**.
4. Tus PDF aparecerán en la biblioteca. Abre uno y lee: la posición se guarda
   sola.

### Configuración necesaria en Nextcloud

1. **Contraseña de aplicación**: en Nextcloud ve a *Ajustes → Seguridad →
   Dispositivos y sesiones* y crea una contraseña de aplicación para el
   lector. No uses nunca tu contraseña principal.
2. **Permitir CORS**: los navegadores bloquean por defecto que una web acceda
   a otro dominio. Instala en Nextcloud la app
   [**WebAppPassword**](https://apps.nextcloud.com/apps/webapppassword) y, en
   *Ajustes de administración → WebAppPassword*, añade el dominio donde esté
   publicado el lector (por ejemplo `https://tu-usuario.github.io`).

Con otros servidores WebDAV el requisito es el mismo: deben enviar cabeceras
CORS que permitan el dominio del lector (métodos `GET`, `PUT`, `DELETE`,
`PROPFIND`, `MKCOL` y `MOVE`, y cabeceras `Authorization`, `Content-Type`,
`Depth`, `Destination` y `Overwrite`; las carpetas y el mover libros
  necesitan estos dos últimos métodos). Para detectar escrituras simultáneas,
  conviene además permitir las cabeceras `If-Match` e `If-None-Match`, y
  exponer `ETag` mediante `Access-Control-Expose-Headers`.

## Publicar tu propia copia

1. Haz un *fork* de este repositorio (o súbelo a tu cuenta).
2. En GitHub: *Settings → Pages → Source: Deploy from a branch*, rama `main`,
   carpeta `/ (root)`.
3. Tu lector quedará en `https://tu-usuario.github.io/lector-pdf/`.

No hay proceso de compilación: es HTML, CSS y JavaScript planos.

### Probarlo en local

```bash
npx serve .
# o bien
python3 -m http.server 8000
```

Y abre `http://localhost:8000`. (Hace falta un servidor; abrir `index.html`
con doble clic no funciona porque la app usa módulos ES.)

Las pruebas automatizadas de sincronización y WebDAV se ejecutan con:

```bash
node --test
```

## Cómo funciona la sincronización

- Cada vez que pasas de página, el progreso se apunta en `localStorage` y, a
  los pocos segundos, se fusiona con el archivo `lector-progreso.json` de tu
  carpeta WebDAV.
- La posición y cada marcador se fusionan por separado. Los marcadores tienen
  identificadores estables y los borrados dejan una marca interna para que una
  copia antigua no los haga reaparecer.
- Los resaltados y las notas se guardan primero en IndexedDB. Cada libro de la
  nube usa un archivo lateral `<nombre>.pagekeeper.json`; cada anotación se
  fusiona por separado y los borrados también dejan una marca interna.
- Los cambios pendientes de este navegador prevalecen durante la siguiente
  sincronización aunque su reloj esté desajustado. Cuando WebDAV expone un
  `ETag`, el guardado usa `If-Match` y vuelve a leer y fusionar si otro
  dispositivo ha escrito al mismo tiempo.
- Si no hay conexión, se sigue leyendo con normalidad y el progreso se sube en
  la siguiente sincronización.

## Tecnología

- [PDF.js](https://mozilla.github.io/pdf.js/) (Mozilla) para renderizar los
  PDF, incluido en `vendor/`.
- [epub.js](https://github.com/futurepress/epub.js) + JSZip para los EPUB y
  [MathJax](https://www.mathjax.org/) para las fórmulas, también en `vendor/`
  (se cargan solo al abrir un EPUB).
- JavaScript sin dependencias externas en tiempo de ejecución ni
  empaquetadores.
- Service worker + manifiesto PWA para instalación y uso sin conexión.

## Licencia

© 2026 Juan José de Haro. Código propio bajo licencia MIT.

Componentes de terceros incluidos en `vendor/`: PDF.js (Mozilla Foundation,
Apache 2.0), epub.js (FuturePress, BSD), JSZip (MIT), MathJax (Apache 2.0)
e iconos Lucide (ISC).
