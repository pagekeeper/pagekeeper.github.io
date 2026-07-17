# 📖 Lector PDF

Lector de PDF pensado para leer libros desde varios dispositivos **continuando
siempre en la misma página**. Es una web estática (funciona en GitHub Pages,
sin servidor propio) y cada persona conecta **su propia nube** para guardar los
libros y sincronizar el progreso de lectura.

## Características

- 📚 **Biblioteca en tu nube**: lista los PDF de una carpeta de tu Nextcloud,
  ownCloud o cualquier servidor **WebDAV**.
- 🔄 **Sincronización de posición**: la página por la que vas se guarda en un
  archivo `lector-progreso.json` en esa misma carpeta. Al abrir el libro en
  otro dispositivo, continúas donde lo dejaste (gana siempre la lectura más
  reciente).
- 📱 **Multidispositivo**: funciona en móvil, tablet y ordenador. Es una PWA:
  se puede instalar y la aplicación funciona sin conexión (el progreso se
  guarda en local y se sube al recuperar la red).
- 📂 **Modo local**: también puedes abrir un PDF del propio dispositivo sin
  configurar nada (en ese caso la posición solo se recuerda en ese navegador).
- ☁️ **Subir a la nube**: si abres un PDF local teniendo una nube configurada,
  un botón te permite copiarlo a tu carpeta remota con un toque, para que pase
  a formar parte de la biblioteca sincronizada (conservando la página actual).
- 📄 **Dos modos de lectura** (botón 📜/📄 en la barra): *página a página*
  como un libro (cómodo en móvil/tablet) o *páginas continuas* con scroll
  vertical (mejor en ordenador). La elección se recuerda entre sesiones.
- 🌙 Modo noche, zoom, paso de página con botones, teclado (←/→, espacio,
  AvPág/RePág) o deslizando el dedo.
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
CORS que permitan el dominio del lector (métodos `GET`, `PUT`, `PROPFIND` y
cabeceras `Authorization`, `Content-Type`, `Depth`).

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

## Cómo funciona la sincronización

- Cada vez que pasas de página, el progreso se apunta en `localStorage` y, a
  los pocos segundos, se fusiona con el archivo `lector-progreso.json` de tu
  carpeta WebDAV.
- La fusión es por libro: se conserva la entrada con la fecha de actualización
  más reciente, de modo que varios dispositivos pueden alternarse sin pisarse.
- Si no hay conexión, se sigue leyendo con normalidad y el progreso se sube en
  la siguiente sincronización.

## Tecnología

- [PDF.js](https://mozilla.github.io/pdf.js/) (Mozilla) para renderizar los
  PDF, incluido en `vendor/`.
- JavaScript sin dependencias ni empaquetadores.
- Service worker + manifiesto PWA para instalación y uso sin conexión.

## Licencia

Código propio bajo licencia MIT. PDF.js es de Mozilla Foundation, bajo
licencia Apache 2.0.
