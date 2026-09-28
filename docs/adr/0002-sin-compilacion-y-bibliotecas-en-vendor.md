# 2. Sin compilación y con las bibliotecas de terceros en `vendor/`

Fecha: 2026-07-17 · Estado: aceptado (registro retroactivo, redactado el 2026-09-28)

## Contexto

La aplicación tiene que funcionar sin conexión, instalarse como PWA y llevar
una política de seguridad estricta (ADR 3). Además, el código se publica para
que otras personas puedan leerlo y adaptarlo.

## Decisión

Lo que está en el repositorio es lo que se sirve: HTML, CSS y JavaScript en
módulos ES, sin empaquetador, sin `package.json` y sin dependencias que se
instalen. PDF.js, epub.js, JSZip y MathJax se guardan en `vendor/` y se cargan
desde ahí; los iconos de Lucide van incrustados en `js/iconos.js`. No se usa
ningún CDN.

Las cuentas y decisiones que no necesitan la pantalla van en módulos de `js/`
con funciones puras, que se prueban con el `node --test` que trae Node. En
`js/app.js` se queda lo que monta y pinta la interfaz.

## Alternativas descartadas

El historial no recoge una discusión de alternativas; estas son las que el
diseño evita, con el motivo que se desprende del código y la documentación.

- **Un empaquetador (Vite, esbuild…)**: añade un paso de construcción y un
  código servido distinto del que se lee en el repositorio.
- **Cargar las bibliotecas de un CDN**: la aplicación dejaría de abrir libros
  sin conexión y la política de seguridad tendría que admitir otro dominio.

## Consecuencias

Cualquiera puede publicar su copia tal cual. Actualizar una biblioteca exige
sustituir a mano su archivo en `vendor/`. Como el navegador guarda la
aplicación en caché, cada despliegue que toque `css/`, `js/` o `index.html`
sube la versión de caché de `sw.js`, y cada archivo nuevo de `js/` se añade a
su lista `RECURSOS`.

## Riesgos y limitaciones

Abrir `index.html` con doble clic no funciona, porque los módulos ES no se
cargan desde `file://`: hace falta un servidor, aunque sea uno local.
