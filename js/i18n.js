// Internacionalización de la interfaz. La preferencia es local a este
// dispositivo; si no existe se usa el idioma preferido del navegador.

const CLAVE_IDIOMA = 'lector.idioma';
const IDIOMAS = ['es', 'ca', 'en'];

const textos = {
  es: {
    language: 'Idioma', help: 'Ayuda', settings: 'Ajustes', cloud: 'En la nube',
    device: 'En este dispositivo', addLocal: 'Añadir un libro (PDF o EPUB) de este dispositivo',
    addCloud: 'Subir un libro (PDF o EPUB) a la nube', reload: 'Recargar',
    backLibrary: 'Volver a la biblioteca', saveCloud: 'Guardar en mi nube',
    margins: 'Ajustar márgenes', zoomOut: 'Reducir', autoWidth: 'Ancho automático', zoomIn: 'Ampliar',
    previous: 'Página anterior', next: 'Página siguiente', goPage: 'Ir a una página',
    marginSide: 'Margen lateral', noMargin: 'Sin margen', moreMargin: 'Más margen',
    marginHelp: 'El texto se reajusta al mover el control.', reset: 'Restablecer',
    webdavFolder: 'URL de la carpeta WebDAV', user: 'Usuario', appPassword: 'Contraseña de aplicación',
    webdav: 'Nube (WebDAV)', transferConfig: 'Llevar la configuración a otro dispositivo',
    testConnection: 'Probar conexión', save: 'Guardar', deleteConfig: 'Borrar configuración',
    copyConfig: 'Copiar enlace de configuración', credits: 'Créditos', license: 'Licencia MIT', source: 'Código fuente',
    loadingLibrary: 'Cargando biblioteca…', noCloudBooks: 'No hay ningún libro en la nube. Usa el botón de subir para añadir el primero.',
    notStarted: 'sin empezar', read: 'leído', page: 'Página', of: 'de',
    uploadBook: 'Subir «{title}» a la nube', downloadBook: 'Descargar «{title}»', deleteBook: 'Borrar «{title}»',
    fillUrlUser: 'Rellena al menos la URL y el usuario.', configSaved: 'Configuración guardada.', connecting: 'Conectando…',
    connectionOk: '✓ Conexión correcta: {count} libros encontrados.', configDeleted: 'Configuración borrada.',
    invalidConfigLink: 'El enlace de configuración no es válido.', cloudConfigImported: 'Configuración de la nube importada.',
    copyLinkFirst: 'Rellena (o guarda) antes la URL y el usuario.', linkCopied: '✓ Enlace copiado. Ábrelo en el otro dispositivo.',
    copyLinkPrompt: 'Copia el enlace y ábrelo en el otro dispositivo:',
    downloading: 'Descargando «{title}»…', opening: 'Abriendo «{title}»…', adding: 'Añadiendo «{title}»…', uploading: 'Subiendo «{title}» a tu nube…', deleting: 'Borrando «{title}»…',
    cloudBookDeleted: 'Libro borrado de la nube.', localBookDeleted: 'Libro borrado de este dispositivo.',
    cloudUploaded: '«{title}» subido a tu nube.', cloudSaved: 'Guardado en tu nube. Ya se sincroniza entre dispositivos.',
    continuing: 'Continuando donde lo dejaste', continuingPage: 'Continuando en la página {page}',
    overwrite: 'Ya existe «{title}» en tu nube. ¿Quieres sobrescribirlo?',
    deleteCloudConfirm: '¿Borrar «{title}» de tu nube? Se eliminará el archivo del servidor.',
    deleteLocalConfirm: '¿Borrar «{title}» de este dispositivo?',
    deleteConfigConfirm: '¿Borrar la configuración del servidor? El progreso guardado en la nube no se toca.',
    replaceConfigConfirm: 'Este enlace trae una configuración de nube. ¿Reemplazar la actual?',
    epubMargin: '{value} % por lado', pageMode: 'Ver página a página (como un libro)', scrollMode: 'Ver páginas continuas (scroll)',
    dayMode: 'Modo día', nightMode: 'Modo noche', goPercent: 'Ir al porcentaje del libro (0–100):', goToPage: 'Ir a la página (1–{total}):',
    noConfigHtml: 'No hay ningún servidor configurado. Puedes abrir un libro (PDF o EPUB) de este dispositivo, o <a href="#" id="enlace-configurar">configurar tu nube (Nextcloud u otro WebDAV)</a> para sincronizar la posición de lectura entre dispositivos.<p class="ayuda">¿No sabes qué es esto o qué necesitas? <a href="#" id="enlace-ayuda-aviso">Lee la ayuda</a>.</p>',
    emptyLocal: 'No hay ningún libro guardado en este dispositivo. Pulsa «+» para añadir un PDF o EPUB: quedará en la biblioteca y se recordará por dónde vas (solo en este dispositivo).',
  },
  ca: {
    language: 'Idioma', help: 'Ajuda', settings: 'Configuració', cloud: 'Al núvol',
    device: 'En aquest dispositiu', addLocal: 'Afegeix un llibre (PDF o EPUB) d’aquest dispositiu',
    addCloud: 'Puja un llibre (PDF o EPUB) al núvol', reload: 'Recarrega',
    backLibrary: 'Torna a la biblioteca', saveCloud: 'Desa al meu núvol',
    margins: 'Ajusta els marges', zoomOut: 'Redueix', autoWidth: 'Amplada automàtica', zoomIn: 'Amplia',
    previous: 'Pàgina anterior', next: 'Pàgina següent', goPage: 'Ves a una pàgina',
    marginSide: 'Marge lateral', noMargin: 'Sense marge', moreMargin: 'Més marge',
    marginHelp: 'El text es reajusta en moure el control.', reset: 'Restableix',
    webdavFolder: 'URL de la carpeta WebDAV', user: 'Usuari', appPassword: 'Contrasenya d’aplicació',
    webdav: 'Núvol (WebDAV)', transferConfig: 'Porta la configuració a un altre dispositiu',
    testConnection: 'Prova la connexió', save: 'Desa', deleteConfig: 'Esborra la configuració',
    copyConfig: 'Copia l’enllaç de configuració', credits: 'Crèdits', license: 'Llicència MIT', source: 'Codi font',
    loadingLibrary: 'S’està carregant la biblioteca…', noCloudBooks: 'No hi ha cap llibre al núvol. Fes servir el botó de pujar per afegir-ne el primer.',
    notStarted: 'sense començar', read: 'llegit', page: 'Pàgina', of: 'de',
    uploadBook: 'Puja «{title}» al núvol', downloadBook: 'Baixa «{title}»', deleteBook: 'Esborra «{title}»',
    fillUrlUser: 'Omple com a mínim l’URL i l’usuari.', configSaved: 'S’ha desat la configuració.', connecting: 'S’està connectant…',
    connectionOk: '✓ Connexió correcta: s’han trobat {count} llibres.', configDeleted: 'S’ha esborrat la configuració.',
    invalidConfigLink: 'L’enllaç de configuració no és vàlid.', cloudConfigImported: 'S’ha importat la configuració del núvol.',
    copyLinkFirst: 'Omple (o desa) abans l’URL i l’usuari.', linkCopied: '✓ Enllaç copiat. Obre’l a l’altre dispositiu.',
    copyLinkPrompt: 'Copia l’enllaç i obre’l a l’altre dispositiu:',
    downloading: 'S’està baixant «{title}»…', opening: 'S’està obrint «{title}»…', adding: 'S’està afegint «{title}»…', uploading: 'S’està pujant «{title}» al núvol…', deleting: 'S’està esborrant «{title}»…',
    cloudBookDeleted: 'S’ha esborrat el llibre del núvol.', localBookDeleted: 'S’ha esborrat el llibre del dispositiu.',
    cloudUploaded: 'S’ha pujat «{title}» al núvol.', cloudSaved: 'S’ha desat al núvol. Ara se sincronitza entre dispositius.',
    continuing: 'Es continua des d’on ho vas deixar', continuingPage: 'Es continua a la pàgina {page}',
    overwrite: '«{title}» ja existeix al núvol. El vols sobreescriure?',
    deleteCloudConfirm: 'Vols esborrar «{title}» del núvol? Se n’eliminarà el fitxer del servidor.',
    deleteLocalConfirm: 'Vols esborrar «{title}» d’aquest dispositiu?',
    deleteConfigConfirm: 'Vols esborrar la configuració del servidor? No es tocarà el progrés desat al núvol.',
    replaceConfigConfirm: 'Aquest enllaç conté una configuració de núvol. Vols substituir l’actual?',
    epubMargin: '{value} % per costat', pageMode: 'Mostra pàgina a pàgina (com un llibre)', scrollMode: 'Mostra pàgines contínues (desplaçament)',
    dayMode: 'Mode dia', nightMode: 'Mode nit', goPercent: 'Ves al percentatge del llibre (0–100):', goToPage: 'Ves a la pàgina (1–{total}):',
    noConfigHtml: 'No hi ha cap servidor configurat. Pots obrir un llibre (PDF o EPUB) d’aquest dispositiu, o <a href="#" id="enlace-configurar">configurar el teu núvol (Nextcloud o un altre WebDAV)</a> per sincronitzar la posició de lectura entre dispositius.<p class="ayuda">No saps què és això o què necessites? <a href="#" id="enlace-ayuda-aviso">Llegeix l’ajuda</a>.</p>',
    emptyLocal: 'No hi ha cap llibre desat en aquest dispositiu. Prem «+» per afegir un PDF o EPUB: quedarà a la biblioteca i recordarà per on vas (només en aquest dispositiu).',
  },
  en: {
    language: 'Language', help: 'Help', settings: 'Settings', cloud: 'In the cloud',
    device: 'On this device', addLocal: 'Add a book (PDF or EPUB) from this device',
    addCloud: 'Upload a book (PDF or EPUB) to the cloud', reload: 'Reload',
    backLibrary: 'Back to library', saveCloud: 'Save to my cloud',
    margins: 'Adjust margins', zoomOut: 'Zoom out', autoWidth: 'Fit to width', zoomIn: 'Zoom in',
    previous: 'Previous page', next: 'Next page', goPage: 'Go to a page',
    marginSide: 'Side margin', noMargin: 'No margin', moreMargin: 'More margin',
    marginHelp: 'The text reflows as you move the control.', reset: 'Reset',
    webdavFolder: 'WebDAV folder URL', user: 'Username', appPassword: 'App password',
    webdav: 'Cloud (WebDAV)', transferConfig: 'Move configuration to another device',
    testConnection: 'Test connection', save: 'Save', deleteConfig: 'Delete configuration',
    copyConfig: 'Copy configuration link', credits: 'Credits', license: 'MIT License', source: 'Source code',
    loadingLibrary: 'Loading library…', noCloudBooks: 'There are no books in the cloud. Use the upload button to add the first one.',
    notStarted: 'not started', read: 'read', page: 'Page', of: 'of',
    uploadBook: 'Upload “{title}” to the cloud', downloadBook: 'Download “{title}”', deleteBook: 'Delete “{title}”',
    fillUrlUser: 'Enter at least the URL and username.', configSaved: 'Configuration saved.', connecting: 'Connecting…',
    connectionOk: '✓ Connection successful: {count} books found.', configDeleted: 'Configuration deleted.',
    invalidConfigLink: 'The configuration link is not valid.', cloudConfigImported: 'Cloud configuration imported.',
    copyLinkFirst: 'Enter (or save) the URL and username first.', linkCopied: '✓ Link copied. Open it on the other device.',
    copyLinkPrompt: 'Copy the link and open it on the other device:',
    downloading: 'Downloading “{title}”…', opening: 'Opening “{title}”…', adding: 'Adding “{title}”…', uploading: 'Uploading “{title}” to the cloud…', deleting: 'Deleting “{title}”…',
    cloudBookDeleted: 'Book deleted from the cloud.', localBookDeleted: 'Book deleted from this device.',
    cloudUploaded: '“{title}” uploaded to the cloud.', cloudSaved: 'Saved to your cloud. It now syncs between devices.',
    continuing: 'Continuing where you left off', continuingPage: 'Continuing on page {page}',
    overwrite: '“{title}” already exists in your cloud. Do you want to overwrite it?',
    deleteCloudConfirm: 'Delete “{title}” from your cloud? The file will be removed from the server.',
    deleteLocalConfirm: 'Delete “{title}” from this device?',
    deleteConfigConfirm: 'Delete the server configuration? Saved cloud progress will not be affected.',
    replaceConfigConfirm: 'This link contains a cloud configuration. Replace the current one?',
    epubMargin: '{value} % on each side', pageMode: 'View one page at a time (like a book)', scrollMode: 'View continuous pages (scroll)',
    dayMode: 'Day mode', nightMode: 'Night mode', goPercent: 'Go to book percentage (0–100):', goToPage: 'Go to page (1–{total}):',
    noConfigHtml: 'No server is configured. You can open a book (PDF or EPUB) from this device, or <a href="#" id="enlace-configurar">set up your cloud (Nextcloud or another WebDAV server)</a> to sync your reading position between devices.<p class="ayuda">Not sure what this is or what you need? <a href="#" id="enlace-ayuda-aviso">Read the help</a>.</p>',
    emptyLocal: 'There are no books saved on this device. Press “+” to add a PDF or EPUB: it will stay in the library and remember where you were (on this device only).',
  },
};

let idioma = resolverIdioma();

function resolverIdioma() {
  const guardado = localStorage.getItem(CLAVE_IDIOMA);
  if (IDIOMAS.includes(guardado)) return guardado;
  const navegador = [...navigator.languages, navigator.language]
    .find((valor) => IDIOMAS.includes((valor || '').toLowerCase().split('-')[0]));
  return navegador ? navegador.toLowerCase().split('-')[0] : 'es';
}

export function t(clave, valores = {}) {
  const texto = textos[idioma]?.[clave] ?? textos.es[clave] ?? clave;
  return texto.replace(/\{(\w+)\}/g, (_, nombre) => valores[nombre] ?? '');
}

export function idiomaActual() { return idioma; }

export function aplicarIdioma(nuevo) {
  idioma = IDIOMAS.includes(nuevo) ? nuevo : 'es';
  localStorage.setItem(CLAVE_IDIOMA, idioma);
  document.documentElement.lang = idioma;
  document.querySelectorAll('[data-i18n]').forEach((elemento) => {
    elemento.textContent = t(elemento.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((elemento) => {
    elemento.innerHTML = t(elemento.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((elemento) => {
    elemento.title = t(elemento.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((elemento) => {
    elemento.setAttribute('aria-label', t(elemento.dataset.i18nAriaLabel));
  });
  const selector = document.getElementById('selector-idioma');
  if (selector) selector.value = idioma;
  document.dispatchEvent(new CustomEvent('idioma-cambiado'));
}

export function iniciarIdioma() {
  aplicarIdioma(idioma);
  document.getElementById('selector-idioma')?.addEventListener('change', (evento) => {
    aplicarIdioma(evento.target.value);
  });
}
