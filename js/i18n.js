// Internacionalización de la interfaz. La preferencia es local a este
// dispositivo; si no existe se usa el idioma preferido del navegador.

const CLAVE_IDIOMA = 'lector.idioma';
const IDIOMAS = ['es', 'ca', 'en'];

const textos = {
  es: {
    language: 'Idioma', help: 'Ayuda', settings: 'Ajustes', back: 'Volver', cloud: 'En la nube',
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
    loadingLibrary: 'Cargando biblioteca…', noCloudBooks: 'Todavía no hay libros sincronizados. Usa el botón de subir para añadir el primero.',
    notStarted: 'sin empezar', read: 'leído', page: 'Página', of: 'de',
    uploadBook: 'Subir «{title}» a la nube', downloadBook: 'Descargar «{title}»', deleteBook: 'Borrar «{title}»',
    fillUrlUser: 'Rellena al menos la URL y el usuario.', configSaved: 'Configuración guardada.', connecting: 'Conectando…',
    connectionOk: '✓ Conexión correcta: {count} libros encontrados.', configDeleted: 'Configuración borrada.',
    invalidConfigLink: 'El enlace de configuración no es válido.', cloudConfigImported: 'Configuración de la nube importada.',
    copyLinkFirst: 'Rellena (o guarda) antes la URL y el usuario.', linkCopied: '✓ Enlace copiado. Ábrelo en el otro dispositivo.',
    copyLinkPrompt: 'Copia el enlace y ábrelo en el otro dispositivo:',
    downloading: 'Descargando «{title}»…', opening: 'Abriendo «{title}»…', adding: 'Añadiendo «{title}»…', uploading: 'Subiendo «{title}» a tu nube…', deleting: 'Borrando «{title}»…',
    cloudBookDeleted: 'Libro borrado de la nube.', localBookDeleted: 'Libro borrado de este dispositivo.',
    cloudBookDeletedPending: 'Libro borrado. La limpieza del progreso se reintentará cuando vuelva la conexión.',
    cloudUploaded: '«{title}» subido a tu nube.', cloudSaved: 'Guardado en tu nube. Ya se sincroniza entre dispositivos.',
    continuing: 'Continuando donde lo dejaste', continuingPage: 'Continuando en la página {page}',
    overwrite: 'Ya existe «{title}» en tu nube. ¿Quieres sobrescribirlo?',
    deleteCloudConfirm: '¿Borrar «{title}» de tu nube? Se eliminará el archivo del servidor.',
    deleteLocalConfirm: '¿Borrar «{title}» de este dispositivo?',
    deleteConfigConfirm: '¿Borrar la configuración del servidor? El progreso guardado en la nube no se toca.',
    replaceConfigConfirm: 'Este enlace trae una configuración de nube. ¿Reemplazar la actual?',
    epubMargin: '{value} % por lado', pageMode: 'Ver página a página (como un libro)', scrollMode: 'Ver páginas continuas (scroll)',
    dayMode: 'Modo día', nightMode: 'Modo noche', goPercent: 'Ir al porcentaje del libro (0–100):', goToPage: 'Ir a la página (1–{total}):',
    noConfigHtml: '<span>No hay ningún servidor configurado. Puedes abrir un libro (PDF o EPUB) de este dispositivo, o <a href="#" id="enlace-configurar">configurar tu nube (Nextcloud u otro WebDAV)</a> para sincronizar la posición de lectura entre dispositivos.</span><p class="ayuda">¿No sabes qué es esto o qué necesitas? <a href="#" id="enlace-ayuda-aviso">Lee la ayuda</a>.</p>',
    syncYes: 'Se sincronizan', syncNo: 'No se sincronizan',
    cloudScope: 'Libros y progreso disponibles en todos tus dispositivos',
    localScope: 'Libros guardados únicamente en este dispositivo',
    emptyLocalAction: 'Añadir libros solo a este dispositivo',
    emptyLocalHelp: 'No se sincronizarán. Selecciona archivos PDF o EPUB, o arrástralos aquí.',
    webdavHelpHtml: 'Compatible con Nextcloud, ownCloud y cualquier servidor WebDAV. Los PDF de la carpeta indicada aparecerán en tu biblioteca y la posición de lectura se sincronizará entre todos tus dispositivos. ¿No sabes qué poner aquí? <a href="#" id="enlace-ayuda-ajustes">Lee la ayuda</a>.',
    passwordHelpHtml: '⚠️ En Nextcloud crea una <strong>contraseña de aplicación</strong> (Ajustes → Seguridad), no uses tu contraseña principal. Además, para que el navegador pueda conectar, el servidor debe permitir CORS: en Nextcloud instala la app <strong>WebAppPassword</strong> y añade el dominio de este lector. Los datos se guardan únicamente en este navegador.',
    transferHelp: 'Copia un enlace que contiene la URL, el usuario y la contraseña de aplicación. Ábrelo en el otro dispositivo (mándatelo por un canal privado, por ejemplo una nota o un mensaje a ti mismo) y el lector quedará configurado automáticamente. ⚠️ Cualquiera con el enlace tendrá acceso a tu nube: no lo publiques y bórralo del canal después de usarlo.',
    creditsHtml: 'Construido con <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) e iconos <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC).',
    dropLocal: 'Suelta aquí para guardar en este dispositivo', dropCloud: 'Suelta aquí para subir a la nube',
    unsupportedFiles: 'Solo se pueden añadir archivos PDF o EPUB.', localAddedOne: 'Libro guardado en este dispositivo.', localAddedMany: '{count} libros guardados en este dispositivo.',
    saveFailed: 'No se pudo guardar «{title}»: {error}',
    searchLibrary: 'Buscar en la biblioteca', searchLibraryPlaceholder: 'Buscar por título, autor…',
    searchBook: 'Buscar dentro del libro', showBookIndex: 'Mostrar el índice', bookIndex: 'Índice del libro', wordOrPhrase: 'Palabra o frase', search: 'Buscar', close: 'Cerrar',
    searchingBook: 'Buscando en el libro…', noSearchResults: 'No se encontraron resultados.', searchResults: '{count} resultados.',
    chapter: 'Capítulo', noLibraryResults: 'No hay libros que coincidan con la búsqueda.',
  },
  ca: {
    language: 'Idioma', help: 'Ajuda', settings: 'Configuració', back: 'Torna', cloud: 'Al núvol',
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
    loadingLibrary: 'S’està carregant la biblioteca…', noCloudBooks: 'Encara no hi ha llibres sincronitzats. Fes servir el botó de pujar per afegir-ne el primer.',
    notStarted: 'sense començar', read: 'llegit', page: 'Pàgina', of: 'de',
    uploadBook: 'Puja «{title}» al núvol', downloadBook: 'Baixa «{title}»', deleteBook: 'Esborra «{title}»',
    fillUrlUser: 'Omple com a mínim l’URL i l’usuari.', configSaved: 'S’ha desat la configuració.', connecting: 'S’està connectant…',
    connectionOk: '✓ Connexió correcta: s’han trobat {count} llibres.', configDeleted: 'S’ha esborrat la configuració.',
    invalidConfigLink: 'L’enllaç de configuració no és vàlid.', cloudConfigImported: 'S’ha importat la configuració del núvol.',
    copyLinkFirst: 'Omple (o desa) abans l’URL i l’usuari.', linkCopied: '✓ Enllaç copiat. Obre’l a l’altre dispositiu.',
    copyLinkPrompt: 'Copia l’enllaç i obre’l a l’altre dispositiu:',
    downloading: 'S’està baixant «{title}»…', opening: 'S’està obrint «{title}»…', adding: 'S’està afegint «{title}»…', uploading: 'S’està pujant «{title}» al núvol…', deleting: 'S’està esborrant «{title}»…',
    cloudBookDeleted: 'S’ha esborrat el llibre del núvol.', localBookDeleted: 'S’ha esborrat el llibre del dispositiu.',
    cloudBookDeletedPending: 'Llibre esborrat. La neteja del progrés es tornarà a provar quan torni la connexió.',
    cloudUploaded: 'S’ha pujat «{title}» al núvol.', cloudSaved: 'S’ha desat al núvol. Ara se sincronitza entre dispositius.',
    continuing: 'Es continua des d’on ho vas deixar', continuingPage: 'Es continua a la pàgina {page}',
    overwrite: '«{title}» ja existeix al núvol. El vols sobreescriure?',
    deleteCloudConfirm: 'Vols esborrar «{title}» del núvol? Se n’eliminarà el fitxer del servidor.',
    deleteLocalConfirm: 'Vols esborrar «{title}» d’aquest dispositiu?',
    deleteConfigConfirm: 'Vols esborrar la configuració del servidor? No es tocarà el progrés desat al núvol.',
    replaceConfigConfirm: 'Aquest enllaç conté una configuració de núvol. Vols substituir l’actual?',
    epubMargin: '{value} % per costat', pageMode: 'Mostra pàgina a pàgina (com un llibre)', scrollMode: 'Mostra pàgines contínues (desplaçament)',
    dayMode: 'Mode dia', nightMode: 'Mode nit', goPercent: 'Ves al percentatge del llibre (0–100):', goToPage: 'Ves a la pàgina (1–{total}):',
    noConfigHtml: '<span>No hi ha cap servidor configurat. Pots obrir un llibre (PDF o EPUB) d’aquest dispositiu, o <a href="#" id="enlace-configurar">configurar el teu núvol (Nextcloud o un altre WebDAV)</a> per sincronitzar la posició de lectura entre dispositius.</span><p class="ayuda">No saps què és això o què necessites? <a href="#" id="enlace-ayuda-aviso">Llegeix l’ajuda</a>.</p>',
    syncYes: 'Se sincronitzen', syncNo: 'No se sincronitzen',
    cloudScope: 'Llibres i progrés disponibles en tots els teus dispositius',
    localScope: 'Llibres desats únicament en aquest dispositiu',
    emptyLocalAction: 'Afegeix llibres només a aquest dispositiu',
    emptyLocalHelp: 'No se sincronitzaran. Selecciona fitxers PDF o EPUB, o arrossega’ls aquí.',
    webdavHelpHtml: 'Compatible amb Nextcloud, ownCloud i qualsevol servidor WebDAV. Els PDF de la carpeta indicada apareixeran a la biblioteca i la posició de lectura se sincronitzarà entre tots els dispositius. No saps què hi has de posar? <a href="#" id="enlace-ayuda-ajustes">Llegeix l’ajuda</a>.',
    passwordHelpHtml: '⚠️ A Nextcloud crea una <strong>contrasenya d’aplicació</strong> (Configuració → Seguretat); no facis servir la contrasenya principal. Perquè el navegador es pugui connectar, el servidor ha de permetre CORS: a Nextcloud instal·la <strong>WebAppPassword</strong> i afegeix el domini d’aquest lector. Les dades només es desen en aquest navegador.',
    transferHelp: 'Copia un enllaç amb l’URL, l’usuari i la contrasenya d’aplicació. Obre’l a l’altre dispositiu, per un canal privat, i el lector quedarà configurat automàticament. ⚠️ Qui tingui l’enllaç podrà accedir al núvol: no el publiquis i esborra’l després d’usar-lo.',
    creditsHtml: 'Construït amb <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) i icones <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC).',
    dropLocal: 'Deixa anar aquí per desar en aquest dispositiu', dropCloud: 'Deixa anar aquí per pujar al núvol',
    unsupportedFiles: 'Només es poden afegir fitxers PDF o EPUB.', localAddedOne: 'Llibre desat en aquest dispositiu.', localAddedMany: 'S’han desat {count} llibres en aquest dispositiu.',
    saveFailed: 'No s’ha pogut desar «{title}»: {error}',
    searchLibrary: 'Cerca a la biblioteca', searchLibraryPlaceholder: 'Cerca per títol, autor…',
    searchBook: 'Cerca dins del llibre', showBookIndex: 'Mostra l’índex', bookIndex: 'Índex del llibre', wordOrPhrase: 'Paraula o frase', search: 'Cerca', close: 'Tanca',
    searchingBook: 'S’està cercant al llibre…', noSearchResults: 'No s’han trobat resultats.', searchResults: '{count} resultats.',
    chapter: 'Capítol', noLibraryResults: 'No hi ha llibres que coincideixin amb la cerca.',
  },
  en: {
    language: 'Language', help: 'Help', settings: 'Settings', back: 'Back', cloud: 'In the cloud',
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
    loadingLibrary: 'Loading library…', noCloudBooks: 'There are no synced books yet. Use the upload button to add the first one.',
    notStarted: 'not started', read: 'read', page: 'Page', of: 'of',
    uploadBook: 'Upload “{title}” to the cloud', downloadBook: 'Download “{title}”', deleteBook: 'Delete “{title}”',
    fillUrlUser: 'Enter at least the URL and username.', configSaved: 'Configuration saved.', connecting: 'Connecting…',
    connectionOk: '✓ Connection successful: {count} books found.', configDeleted: 'Configuration deleted.',
    invalidConfigLink: 'The configuration link is not valid.', cloudConfigImported: 'Cloud configuration imported.',
    copyLinkFirst: 'Enter (or save) the URL and username first.', linkCopied: '✓ Link copied. Open it on the other device.',
    copyLinkPrompt: 'Copy the link and open it on the other device:',
    downloading: 'Downloading “{title}”…', opening: 'Opening “{title}”…', adding: 'Adding “{title}”…', uploading: 'Uploading “{title}” to the cloud…', deleting: 'Deleting “{title}”…',
    cloudBookDeleted: 'Book deleted from the cloud.', localBookDeleted: 'Book deleted from this device.',
    cloudBookDeletedPending: 'Book deleted. Progress cleanup will be retried when the connection returns.',
    cloudUploaded: '“{title}” uploaded to the cloud.', cloudSaved: 'Saved to your cloud. It now syncs between devices.',
    continuing: 'Continuing where you left off', continuingPage: 'Continuing on page {page}',
    overwrite: '“{title}” already exists in your cloud. Do you want to overwrite it?',
    deleteCloudConfirm: 'Delete “{title}” from your cloud? The file will be removed from the server.',
    deleteLocalConfirm: 'Delete “{title}” from this device?',
    deleteConfigConfirm: 'Delete the server configuration? Saved cloud progress will not be affected.',
    replaceConfigConfirm: 'This link contains a cloud configuration. Replace the current one?',
    epubMargin: '{value} % on each side', pageMode: 'View one page at a time (like a book)', scrollMode: 'View continuous pages (scroll)',
    dayMode: 'Day mode', nightMode: 'Night mode', goPercent: 'Go to book percentage (0–100):', goToPage: 'Go to page (1–{total}):',
    noConfigHtml: '<span>No server is configured. You can open a book (PDF or EPUB) from this device, or <a href="#" id="enlace-configurar">set up your cloud (Nextcloud or another WebDAV server)</a> to sync your reading position between devices.</span><p class="ayuda">Not sure what this is or what you need? <a href="#" id="enlace-ayuda-aviso">Read the help</a>.</p>',
    syncYes: 'Synced', syncNo: 'Not synced',
    cloudScope: 'Books and reading progress available on all your devices',
    localScope: 'Books stored only on this device',
    emptyLocalAction: 'Add books only to this device',
    emptyLocalHelp: 'They will not sync. Select PDF or EPUB files, or drag them here.',
    webdavHelpHtml: 'Compatible with Nextcloud, ownCloud and any WebDAV server. PDFs in the chosen folder will appear in your library and reading position will sync across all your devices. Not sure what to enter? <a href="#" id="enlace-ayuda-ajustes">Read the help</a>.',
    passwordHelpHtml: '⚠️ In Nextcloud, create an <strong>app password</strong> (Settings → Security); do not use your main password. The server must also allow CORS so the browser can connect: in Nextcloud, install <strong>WebAppPassword</strong> and add this reader’s domain. Data is stored only in this browser.',
    transferHelp: 'Copy a link containing the URL, username and app password. Open it on the other device through a private channel and the reader will be configured automatically. ⚠️ Anyone with the link can access your cloud: do not publish it and delete it after use.',
    creditsHtml: 'Built with <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0), and <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> icons (ISC).',
    dropLocal: 'Drop here to save on this device', dropCloud: 'Drop here to upload to the cloud',
    unsupportedFiles: 'Only PDF or EPUB files can be added.', localAddedOne: 'Book saved on this device.', localAddedMany: '{count} books saved on this device.',
    saveFailed: 'Could not save “{title}”: {error}',
    searchLibrary: 'Search library', searchLibraryPlaceholder: 'Search by title, author…',
    searchBook: 'Search inside the book', showBookIndex: 'Show table of contents', bookIndex: 'Table of contents', wordOrPhrase: 'Word or phrase', search: 'Search', close: 'Close',
    searchingBook: 'Searching the book…', noSearchResults: 'No results found.', searchResults: '{count} results.',
    chapter: 'Chapter', noLibraryResults: 'No books match your search.',
  },
};

const ayudas = {
  ca: `
    <div class="tarjeta"><h2>Què fa PageKeeper?</h2><p>Llegeix llibres PDF i EPUB, incloses fórmules matemàtiques, des del mòbil, la tauleta o l’ordinador, i recorda el punt de lectura.</p><ul class="lista-ayuda"><li><strong>Afegeix un llibre del dispositiu (botó «+»):</strong> funciona de seguida, sense comptes. El llibre queda desat només en aquest navegador. També pots arrossegar un o diversos fitxers a la secció local.</li><li><strong>Connecta un núvol (WebDAV):</strong> els llibres i la posició de lectura se sincronitzen entre dispositius.</li></ul></div>
    <div class="tarjeta"><h2>La biblioteca</h2><ul class="lista-ayuda"><li><strong>Portades:</strong> es creen automàticament a partir de la coberta de l’EPUB o de la primera pàgina del PDF i mostren el progrés. El cercador filtra per nom, títol, autor, format i altres metadades. Al mòbil, mantén premut un títol tallat per veure’l complet.</li><li><strong>Pujar al núvol:</strong> el botó del núvol copia un llibre local a la carpeta remota sense perdre el punt de lectura; també pots arrossegar fitxers a «Al núvol».</li><li><strong>Baixar:</strong> desa una còpia del PDF o EPUB al dispositiu.</li><li><strong>Esborrar:</strong> la paperera l’elimina del servidor o d’aquest dispositiu, segons l’origen.</li></ul></div>
    <div class="tarjeta"><h2>Controls del lector</h2><ul class="lista-ayuda"><li><strong>Mode de lectura:</strong> pàgina a pàgina o pàgines contínues amb desplaçament vertical.</li><li><strong>Zoom:</strong> les lupes amplien el PDF o canvien la mida de lletra de l’EPUB; ↔ torna a l’amplada automàtica.</li><li><strong>Marges (només EPUB):</strong> el control lliscant tria el marge de tots dos costats entre 0 i 30 %.</li><li><strong>Mode nit:</strong> el botó de la lluna/sol enfosqueix la pàgina.</li><li><strong>Ves a un punt:</strong> toca l’indicador de pàgina o percentatge.</li><li><strong>Índex:</strong> si el PDF o EPUB n’inclou un, apareix un botó per obrir-lo i saltar directament a qualsevol apartat.</li><li><strong>Cerca dins del llibre:</strong> la lupa troba paraules o frases i porta a la pàgina o capítol.</li><li>El mode, el zoom, la lletra i els marges es recorden en cada dispositiu.</li></ul></div>
    <div class="tarjeta"><h2>Què és WebDAV?</h2><p>És una manera estàndard d’accedir per internet als fitxers d’un servidor com si fos una carpeta remota. PageKeeper el fa servir per llegir els llibres i desar el progrés al teu propi núvol.</p></div>
    <div class="tarjeta importante"><h2>⚠️ Important: no serveix qualsevol núvol</h2><p>El navegador només es pot connectar si el servidor ho autoritza explícitament amb <em>CORS</em>. Per això la majoria de serveis comercials no funcionen.</p><ul class="lista-ayuda"><li><strong>Google Drive, Dropbox i OneDrive:</strong> no ofereixen un WebDAV usable aquí.</li><li><strong>Koofr, pCloud, Yandex i semblants:</strong> tenen WebDAV però bloquegen l’accés des de pàgines web.</li><li><strong>Nextcloud o ownCloud amb el permís activat:</strong> és l’opció que funciona a la pràctica.</li></ul></div>
    <div class="tarjeta"><h2>No tinc servidor propi</h2><p>Pots demanar accés a un Nextcloud d’un familiar, centre o equip: necessites l’<em>URL de la carpeta WebDAV</em>, l’<em>usuari</em> i una <em>contrasenya d’aplicació</em>. Si no en tens, afegeix llibres a «En aquest dispositiu»: es llegeixen igual, però sense sincronització automàtica.</p></div>
    <div class="tarjeta"><h2>Tinc o administro un Nextcloud / ownCloud</h2><ul class="lista-ayuda"><li>Instal·la <strong>WebAppPassword</strong> i afegeix el domini d’aquest lector (<code id="ayuda-dominio">aquest lloc</code>) als orígens permesos.</li><li>Crea una <strong>contrasenya d’aplicació</strong> a Configuració → Seguretat; no facis servir la principal.</li><li>A <strong>⚙️ Configuració</strong>, indica l’URL de la carpeta, l’usuari i la contrasenya.</li></ul></div>
    <div class="tarjeta"><h2>Porta la configuració a un altre dispositiu</h2><p>A <strong>⚙️ Configuració → «Copia l’enllaç de configuració»</strong> obtens un enllaç amb l’URL, l’usuari i la contrasenya. Obre’l a l’altre dispositiu i comparteix-lo només per canals privats; esborra’l després.</p></div>
    <div class="tarjeta destacado"><h2>🤖 Tens dubtes? Pregunta a una IA</h2><p>ChatGPT, Claude o Gemini et poden guiar per configurar el servidor. Per exemple: «Tinc un servidor Nextcloud. Com instal·lo <em>WebAppPassword</em> i permeto l’accés WebDAV des d’una web allotjada a <code id="ayuda-dominio-ia">aquest lloc</code>?»</p></div>
    <div class="tarjeta"><h2>Privadesa</h2><p>No hi ha cap servidor intermediari: el navegador es connecta directament al teu núvol. L’URL, l’usuari i la contrasenya es desen només en aquest navegador.</p></div>`,
  en: `
    <div class="tarjeta"><h2>What does PageKeeper do?</h2><p>It reads PDF and EPUB books, including mathematical formulas, on a phone, tablet or computer and remembers your reading position.</p><ul class="lista-ayuda"><li><strong>Add a book from your device (“+” button):</strong> it works immediately without accounts. The book is stored only in that browser. You can also drag one or more files onto the local section.</li><li><strong>Connect cloud storage (WebDAV):</strong> books and reading position sync between your devices.</li></ul></div>
    <div class="tarjeta"><h2>The library</h2><ul class="lista-ayuda"><li><strong>Covers:</strong> are automatically created from the EPUB cover or first PDF page and show reading progress. The search box filters by filename, title, author, format and other metadata. On mobile, press and hold a truncated title to see it in full.</li><li><strong>Upload to the cloud:</strong> the cloud button copies a local book to the remote folder without losing your position; you can also drag files onto “In the cloud”.</li><li><strong>Download:</strong> saves a PDF or EPUB copy to the device.</li><li><strong>Delete:</strong> the bin removes it from the server or this device, depending on its origin.</li></ul></div>
    <div class="tarjeta"><h2>Reader controls</h2><ul class="lista-ayuda"><li><strong>Reading mode:</strong> one page at a time or continuous pages with vertical scrolling.</li><li><strong>Zoom:</strong> the magnifiers enlarge PDFs or change EPUB text size; ↔ returns to fit-to-width.</li><li><strong>Margins (EPUB only):</strong> use the slider to choose a margin on both sides from 0 to 30%.</li><li><strong>Night mode:</strong> the moon/sun button darkens the page.</li><li><strong>Go to a point:</strong> tap the page or percentage indicator.</li><li><strong>Table of contents:</strong> when a PDF or EPUB includes one, a button appears so you can open it and jump directly to any section.</li><li><strong>Search inside the book:</strong> the magnifier finds words or phrases and jumps to the matching page or chapter.</li><li>Mode, zoom, font size and margins are remembered on each device.</li></ul></div>
    <div class="tarjeta"><h2>What is WebDAV?</h2><p>It is a standard way to access files on an internet server as though it were a remote folder. PageKeeper uses it to read books and store progress in your own cloud.</p></div>
    <div class="tarjeta importante"><h2>⚠️ Important: not every cloud works</h2><p>The browser can connect only when a server explicitly permits it through <em>CORS</em>. This rules out most commercial services.</p><ul class="lista-ayuda"><li><strong>Google Drive, Dropbox and OneDrive:</strong> do not provide usable WebDAV here.</li><li><strong>Koofr, pCloud, Yandex and similar:</strong> have WebDAV but block access from web pages.</li><li><strong>Nextcloud or ownCloud with permission enabled:</strong> is the practical working option.</li></ul></div>
    <div class="tarjeta"><h2>I do not have my own server</h2><p>You can ask for access to a family, school or work Nextcloud. You need the <em>WebDAV folder URL</em>, <em>username</em> and an <em>app password</em>. Otherwise, add books under “On this device”: reading works the same, but without automatic sync.</p></div>
    <div class="tarjeta"><h2>I have or administer Nextcloud / ownCloud</h2><ul class="lista-ayuda"><li>Install <strong>WebAppPassword</strong> and add this reader’s domain (<code id="ayuda-dominio">this site</code>) to the allowed origins.</li><li>Create an <strong>app password</strong> in Settings → Security; do not use your main password.</li><li>Under this reader’s <strong>⚙️ Settings</strong>, enter the folder URL, username and password.</li></ul></div>
    <div class="tarjeta"><h2>Move configuration to another device</h2><p>Under <strong>⚙️ Settings → “Copy configuration link”</strong>, you get a link containing the URL, username and password. Open it on the other device, share it only through private channels and delete it afterwards.</p></div>
    <div class="tarjeta destacado"><h2>🤖 Need help? Ask an AI</h2><p>ChatGPT, Claude or Gemini can guide you through server setup. For example: “I have a Nextcloud server. How do I install <em>WebAppPassword</em> and allow WebDAV access from a website hosted at <code id="ayuda-dominio-ia">this site</code>?”</p></div>
    <div class="tarjeta"><h2>Privacy</h2><p>There is no intermediary server: your browser connects directly to your cloud. The URL, username and password are stored only in this browser.</p></div>`,
};

const originales = new WeakMap();

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
  document.querySelectorAll('[data-i18n-ayuda]').forEach((elemento) => {
    if (!originales.has(elemento)) originales.set(elemento, elemento.innerHTML);
    elemento.innerHTML = idioma === 'es' ? originales.get(elemento) : ayudas[idioma];
  });
  document.querySelectorAll('[data-i18n-title]').forEach((elemento) => {
    elemento.title = t(elemento.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((elemento) => {
    elemento.setAttribute('aria-label', t(elemento.dataset.i18nAriaLabel));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((elemento) => {
    elemento.placeholder = t(elemento.dataset.i18nPlaceholder);
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
