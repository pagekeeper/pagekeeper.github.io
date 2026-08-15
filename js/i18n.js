// Internacionalización de la interfaz. La preferencia es local a este
// dispositivo; si no existe se usa el idioma preferido del navegador.

const CLAVE_IDIOMA = 'lector.idioma';
const IDIOMAS = ['es', 'ca', 'gl', 'eu', 'en', 'fr', 'de', 'pt'];

const textos = {
  es: {
    appTagline: 'Lector de libros electrónicos',
    appVersion: 'PageKeeper {version}',
    // Imprimir el EPUB en papel o en PDF.
    printBook: 'Imprimir o guardar en PDF',
    printHelp: 'Se abrirá el diálogo de impresión del navegador, donde puedes elegir la impresora o «Guardar como PDF».',
    printPaper: 'Papel',
    printPaperLetter: 'Carta',
    printMargins: 'Márgenes',
    printMarginNarrow: 'Estrechos',
    printMarginNormal: 'Normales',
    printMarginWide: 'Anchos',
    printFont: 'Letra',
    printFontSmall: 'Pequeña',
    printFontNormal: 'Normal',
    printFontLarge: 'Grande',
    printAnnotations: 'Incluir los subrayados y las notas',
    selectAll: 'Todos',
    selectNone: 'Ninguno',
    print: 'Imprimir',
    printChapterNumber: 'Capítulo {number}',
    printNoChapters: 'Ningún capítulo',
    printWholeBook: 'Todo el libro',
    printSomeChapters: '{count} de {total} capítulos',
    printPreparing: 'Preparando el documento… {done} de {total}',
    printNotesHeading: 'Notas',
    printFallbackTitle: 'Libro',
    printChapterFailed: 'No se pudo componer el capítulo «{title}».',
    printFailed: 'No se ha podido preparar el documento para imprimir.',
    language: 'Idioma', help: 'Ayuda', settings: 'Ajustes', back: 'Volver', cloud: 'En la nube',
    device: 'En este dispositivo', addLocal: 'Añadir un libro (PDF o EPUB) de este dispositivo',
    addCloud: 'Subir un libro (PDF o EPUB) a la nube', reload: 'Recargar',
    addLocalFolder: 'Añadir una carpeta entera de este dispositivo',
    addCloudFolder: 'Subir una carpeta entera a la nube',
    backLibrary: 'Volver a la biblioteca', saveCloud: 'Guardar en mi nube', zoom: 'Zoom', zoomOut: 'Reducir', autoWidth: 'Ajustar al ancho', fitPage: 'Ajustar la página completa', cropMargins: 'Recortar los márgenes', skipToContent: 'Saltar al contenido', bookIndexShort: 'Índice', thumbnails: 'Miniaturas', resizePanel: 'Cambiar el ancho del panel', bookNavigation: 'Navegación del libro', pageThumbnails: 'Miniaturas de las páginas', noMarginsToCrop: 'Esta obra no tiene márgenes que recortar.', zoomIn: 'Ampliar',
    zoomLevel: 'Aumento:', zoomChange: 'Pulsa para cambiarlo',
    zoomSettings: 'Elegir el aumento', customZoom: 'Otro', apply: 'Aplicar',
    moreReaderActions: 'Más acciones', readerActions: 'Acciones de lectura',
    previous: 'Página anterior', next: 'Página siguiente', goPage: 'Ir a una página',
    marginSide: 'Margen lateral', noMargin: 'Sin margen', moreMargin: 'Más margen',
    zoomHelp: 'Se guarda solo para este libro.',
    marginHelp: 'El texto se reajusta al mover el control. El margen es de este libro.', reset: 'Restablecer',
    webdavFolder: 'URL de la carpeta WebDAV', user: 'Usuario', appPassword: 'Contraseña de aplicación',
    webdav: 'Nube (WebDAV)', transferConfig: 'Llevar la configuración a otro dispositivo',
    webdavShort: 'Nube', settingsData: 'Datos', settingsSections: 'Secciones de los ajustes',
    epubTextSettings: 'Texto de los EPUB',
    epubTextSettingsHelp: 'Cómo se compone el texto de los libros EPUB (los PDF llegan ya maquetados y no admiten estos cambios). Los mismos ajustes están a mano mientras lees, en el botón de la letra. Aquí decides con qué empieza cada libro nuevo: el margen y la alineación que cambies con un libro abierto son solo de ese libro.',
    resetTextSettings: 'Restablecer el texto',
    importExport: 'Importar y exportar', addBooks: 'Añadir libros',
    addBooksHelp: 'Añade PDF o EPUB al dispositivo o súbelos a la carpeta de la nube que tengas abierta.',
    addToDevice: 'Añadir al dispositivo', uploadToCloud: 'Subir a la nube',
    addFolderToDevice: 'Añadir una carpeta al dispositivo', uploadFolderToCloud: 'Subir una carpeta a la nube',
    localBackup: 'Biblioteca de este dispositivo',
    localBackupHelp: 'Guarda en un ZIP los libros de «En este dispositivo», su progreso, marcadores, anotaciones y preferencias. No incluye la configuración ni la contraseña de la nube; puedes guardarlas aparte desde Ajustes.',
    exportLocalBackup: 'Crear copia', restoreLocalBackup: 'Restaurar en el dispositivo',
    creatingBackup: 'Creando la copia…', restoringBackup: 'Restaurando la copia…',
    noLocalBooksBackup: 'No hay libros locales que copiar.',
    backupCreated: 'Copia creada correctamente ({count} libros).',
    backupRestored: 'Copia restaurada correctamente ({count} libros).',
    backupFailed: 'No se pudo crear la copia: {error}', restoreFailed: 'No se pudo restaurar: {error}',
    invalidBackup: 'El archivo no es una copia válida de PageKeeper.',
    wrongLocalBackup: 'Esta es una copia de la nube, no del dispositivo.',
    restoreBackupConfirm: '¿Restaurar esta copia? Los libros con el mismo identificador y sus datos locales serán reemplazados; los demás se conservarán.',
    pdfPasswordTitle: 'PDF protegido', pdfPasswordHelp: 'Introduce la contraseña para abrir este PDF. No se guardará.',
    pdfPassword: 'Contraseña del PDF', pdfPasswordIncorrect: 'La contraseña no es correcta.',
    pdfNoTextTitle: 'PDF sin texto seleccionable',
    pdfNoTextBadge: 'SIN TEXTO',
    pdfNoTextHelp: 'Este documento parece estar escaneado. La búsqueda, la selección y la lectura en voz alta no funcionarán correctamente.',
    pdfNoTextStep1: 'Descarga el PDF desde el menú del libro.',
    pdfNoTextStep2: 'Ábrelo en Scribe OCR y genera una copia PDF con texto.',
    pdfNoTextStep3: 'Descarga esa copia y vuelve a subirla a PageKeeper.',
    pdfNoTextPrivacy: 'PageKeeper no enviará el documento: tendrás que seleccionarlo tú en la herramienta externa.',
    openScribeOcr: 'Abrir Scribe OCR', understood: 'Entendido',
    open: 'Abrir', openFailed: 'No se pudo abrir el libro: {error}',
    cloudBackup: 'Biblioteca de la nube',
    cloudBackupHelp: 'Guarda en un ZIP todos los PDF y EPUB de la carpeta WebDAV y sus subcarpetas, junto con el progreso, los marcadores y las anotaciones.',
    exportCloudBackup: 'Crear copia de la nube', restoreCloudBackup: 'Restaurar en la nube',
    cloudBackupNeedsConfig: 'Configura primero una nube WebDAV en Ajustes.',
    readingCloudLibrary: 'Leyendo la biblioteca de la nube…',
    noCloudBooksBackup: 'No hay libros en la nube que copiar.',
    backingUpCloudBook: 'Copiando {current} de {total}: «{title}»…',
    cloudBackupCreated: 'Copia de la nube creada correctamente ({count} libros).',
    restoreCloudConfirm: '¿Restaurar esta copia en la nube configurada? Se crearán sus subcarpetas y se sobrescribirán los libros que tengan la misma ruta.',
    restoringCloudBackup: 'Preparando la restauración en la nube…',
    restoringCloudBook: 'Subiendo {current} de {total}: «{title}»…',
    cloudBackupRestored: 'Copia restaurada en la nube ({count} libros).',
    wrongCloudBackup: 'Esta es una copia del dispositivo, no de la nube.',
    testConnection: 'Probar conexión', save: 'Guardar', deleteConfig: 'Borrar configuración',
    copyConfig: 'Copiar enlace de configuración', exportConfigFile: 'Guardar configuración',
    importConfigFile: 'Restaurar configuración', configFileSaved: '✓ Configuración guardada en un archivo.',
    invalidConfigFile: 'El archivo no contiene una configuración válida de PageKeeper.',
    credits: 'Créditos', license: 'Licencia MIT', source: 'Código fuente',
    privacy: 'Privacidad',
    analyticsNotice: 'Esta aplicación recoge únicamente estadísticas de uso agregadas con un sistema propio para conocer su utilización y mejorar la herramienta. No se almacenan direcciones IP ni se usan cookies de analítica para los visitantes.',
    continueReading: 'Continuar leyendo', recentCount: 'Cuántas lecturas mostrar', recentAuto: 'Las que quepan', recentN: '{count} lecturas',
    recentCountHelp: '«Las que quepan» enseña tres o cuatro según el ancho de la pantalla. Las demás siguen a un toque, en «Ver más».', removeContinue: 'Quitar «Continuar leyendo» de la biblioteca', continueRemoved: 'Se ha quitado «Continuar leyendo». Puedes volver a mostrarlo en Ajustes → Biblioteca.', continueReadingHelp: 'Tu lectura más reciente, con las demás a un toque',
    devices: 'Dispositivos conectados',
    devicesHelp: 'Los navegadores que están usando esta biblioteca, con la última vez que sincronizaron. Si ves uno que no reconoces, cambia la contraseña de aplicación.',
    devicesRevokeHelp: '⚠️ «Desconectar» le pide al dispositivo que olvide la configuración de la nube y vuelva a pedírtela, y solo surte efecto la próxima vez que se abra allí. No retira el acceso al servidor: para eso hay que borrar la contraseña de aplicación en tu nube.',
    devicesNone: 'Todavía no se ha conectado ningún dispositivo.',
    deviceThisOne: 'este dispositivo', deviceUnknown: 'Dispositivo sin nombre',
    deviceAuto: '{browser} en {system}', deviceCode: 'código {code}',
    deviceLastSeen: 'última vez: {when}', deviceNeverSeen: 'sin datos',
    deviceToday: 'hoy', deviceYesterday: 'ayer', deviceDaysAgo: 'hace {count} días',
    deviceRevokedPending: 'desconectado, a la espera de que se abra',
    deviceRevoked: 'desconectado',
    deviceRename: 'Cambiar el nombre', deviceRenamePrompt: 'Nombre para este dispositivo',
    deviceDisconnect: 'Desconectar',
    deviceDisconnectConfirm: '¿Desconectar «{name}»? La próxima vez que se abra allí, PageKeeper olvidará la configuración de la nube y la pedirá de nuevo. El acceso al servidor no se retira: para eso, borra la contraseña de aplicación en tu nube.',
    deviceDisconnected: 'Se ha pedido la desconexión. Surtirá efecto la próxima vez que se abra PageKeeper en ese dispositivo.',
    deviceWasDisconnected: 'Este dispositivo se ha desconectado desde otro aparato: vuelve a escribir los datos de tu nube para seguir sincronizando.',
    cleanup: 'Libros que ya no están',
    cleanupHelp: 'Cuando un libro desaparece de la nube, su marca de lectura, sus marcadores y sus notas se quedan aquí. Primero se echa en falta y solo después se borran, por si el libro estaba fuera de alcance un rato.',
    cleanupDays: 'Cuánto se espera antes de borrarlos',
    cleanupNever: 'No borrarlos nunca',
    cleanupDays7: 'Una semana', cleanupDays15: 'Quince días', cleanupDays30: 'Un mes',
    cleanupDays60: 'Dos meses', cleanupDays90: 'Tres meses',
    cleanupDaysHelp: 'Este plazo se comparte con tus otros dispositivos, para que todos borren el mismo día.',
    cleanupCheck: 'Comprobar la nube', cleanupNow: 'Borrar ahora',
    cleanupChecking: 'Mirando qué hay en la nube…',
    cleanupNoCloud: 'Sin nube configurada. Los libros de este dispositivo se limpian solos al borrarlos, sin espera.',
    cleanupUnchecked: 'Todavía no se ha comprobado la nube en esta sesión.',
    cleanupClean: 'Todo en orden: {count} elementos en la nube y ninguna marca de lectura pendiente de borrar.',
    cleanupCleanOne: 'Todo en orden: 1 elemento en la nube y ninguna marca de lectura pendiente de borrar.',
    cleanupMissingOne: 'Se echa en falta 1 libro; su marca de lectura sigue guardada:',
    cleanupSideFilesOne: 'Hay además 1 archivo de anotaciones sin su libro.',
    cleanupConfirmOne: '¿Borrar ahora la marca de lectura, los marcadores y las notas de 1 libro que ya no está? No se puede deshacer.',
    cleanupDoneOne: 'Limpiado 1 libro que ya no estaba.',
    cleanupMissing: 'Se echan en falta {count} libros; su marca de lectura sigue guardada:',
    cleanupMissingOn: '{name} — se borrará el {date}',
    cleanupMissingNever: '{name} — no se borrará (has elegido no borrar nunca)',
    cleanupSideFiles: 'Hay además {count} archivos de anotaciones sin su libro.',
    cleanupConfirm: '¿Borrar ahora la marca de lectura, los marcadores y las notas de {count} libros que ya no están? No se puede deshacer.',
    cleanupDone: 'Limpiados {count} libros que ya no estaban.',
    cleanupNothing: 'No había nada que borrar: los libros han vuelto a aparecer.',
    showMoreRecent: 'Ver {count} más', showFewerRecent: 'Ver menos',
    removeFromContinue: 'Quitar «{title}» de Continuar leyendo',
    filterBy: 'Mostrar', filterAll: 'Todos', filterReading: 'Leyendo', filterPending: 'Pendientes', filterFinished: 'Terminados',
    sortBy: 'Ordenar por', sortRecent: 'Lectura reciente', sortTitle: 'Título', sortAuthor: 'Autor', sortProgress: 'Progreso',
    rating: 'Calificación', ratingNone: 'Sin calificar', ratingOf: '{n} de {max} estrellas',
    openedWithoutSync: 'No se ha podido comprobar si habías avanzado en otro dispositivo: se abre por donde ibas aquí.',
    positionFromOtherDevice: 'Se ha recuperado la posición que dejaste en otro dispositivo.',
    remotePositionAskEpub: 'En otro dispositivo la lectura llegó al {remoto} % y aquí vas por el {local} %. ¿Vas allí?',
    remotePositionAskPdf: 'En otro dispositivo la lectura llegó a la página {remoto} de {paginas} y aquí vas por la {local}. ¿Vas allí?',
    remotePositionGo: 'Ir allí',
    remotePositionStay: 'Quedarme aquí',
    remotePositionStayed: 'Se mantiene la posición de este dispositivo.',
    bookNoteRating: 'Nota y calificación',
    ratingHint: 'Pulsa la estrella marcada para quitar la calificación',
    sortRating: 'Calificación', filterRated4: '4 estrellas o más', filterRated3: '3 estrellas o más', filterUnrated: 'Sin calificar',
    filterGroupStatus: 'Lectura', filterGroupRating: 'Calificación',
    viewLabel: 'Vista', viewList: 'Vista de lista', viewGrid: 'Vista de cuadrícula',
    toggleSection: 'Plegar o desplegar la sección',
    markFinished: 'Marcar «{title}» como terminado', markUnfinished: 'Quitar la etiqueta «Terminado» de «{title}»', finished: 'Terminado',
    sampleBookHeading: 'Empieza con un libro de ejemplo', sampleBookHelp: 'Tu biblioteca está vacía. Añade uno de estos ejemplos para probar PageKeeper:',
    loadingSampleBook: 'Preparando el libro de ejemplo…',
    loadingLibrary: 'Cargando biblioteca…', noCloudBooks: 'Todavía no hay libros sincronizados. Usa el botón de subir para añadir el primero.',
    notStarted: 'sin empezar', read: 'leído', page: 'Página', of: 'de',
    bookActions: 'Acciones de «{title}»',
    actionUpload: 'Subir a la nube', actionMove: 'Mover a otra carpeta', actionDownload: 'Descargar',
    actionOffline: 'Disponible sin conexión', actionRemoveOffline: 'Quitar la copia sin conexión',
    actionUpdateOffline: 'Actualizar la copia sin conexión', actionDelete: 'Borrar',
    actionBookNote: 'Nota del libro', bookNote: 'Nota del libro', bookNoteLabel: 'Tu nota sobre este libro',
    bookNotePlaceholder: 'De qué va, por dónde lo dejaste, qué quieres recordar…',
    actionFolderNote: 'Nota de la carpeta', folderNote: 'Nota de la carpeta',
    folderNotePlaceholder: 'Qué guardas aquí y para qué…',
    noFolderNote: 'Todavía no hay ninguna nota sobre esta carpeta.',
    editBookNote: 'Escribir la nota del libro', noBookNote: 'Todavía no hay ninguna nota sobre este libro.',
    actionRename: 'Cambiar el nombre',
    actionMarkFinished: 'Marcar como terminado', actionMarkUnfinished: 'Quitar «Terminado»',
    renameBookPrompt: 'Nombre para mostrar en la biblioteca (déjalo vacío para usar el del archivo):',
    actionDeleteFolder: 'Borrar la carpeta',
    actionDownloadFolderZip: 'Descargar la carpeta (ZIP)',
    actionSaveFolderToDisk: 'Guardar la carpeta en el equipo',
    packingFolder: 'Preparando la carpeta…',
    packingFolderItem: '«{title}» ({current} de {total})',
    folderDownloadedOne: 'Carpeta «{name}» guardada: 1 libro.',
    folderDownloadedMany: 'Carpeta «{name}» guardada: {count} libros.',
    folderHasNoBooks: 'Esa carpeta no contiene ningún libro que descargar.',
    folderDownloadedPartial: 'Carpeta «{name}» guardada. Sin incluir: {failed} de {total}.',
    folderDownloadFailed: 'No se pudo obtener ningún libro de la carpeta.',
    bookGone: 'el libro ya no está en el almacén de este dispositivo',
    removeOfflineConfirm: '¿Quitar la copia sin conexión de «{title}»? El libro de la nube no se borrará.',
    savingOffline: 'Guardando «{title}» para leer sin conexión…', offlineSaved: '«{title}» ya está disponible sin conexión ({size} MB).',
    offlineRemoved: 'Copia sin conexión eliminada. El libro sigue en la nube.', availableOffline: 'SIN CONEXIÓN', offlineOutdated: 'ACTUALIZAR',
    offlineLibrary: 'Sin conexión: se muestran las copias guardadas en este dispositivo.',
    offlineFolderEmpty: 'No hay copias sin conexión en esta carpeta.', openedOfflineCopy: 'Abierto desde la copia sin conexión.',
    offlineUpdateFailed: 'El libro se abrió, pero no se pudo actualizar su copia sin conexión.',
    storageFull: 'No hay espacio suficiente para guardar «{title}» sin conexión.',
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
    replaceConfigConfirm: 'La configuración importada reemplazará la configuración de nube actual. ¿Continuar?',
    epubMargin: '{value} % por lado', pageMode: 'Ver página a página (como un libro)', scrollMode: 'Ver páginas continuas (scroll)',
    twoPages: 'Ver dos páginas juntas', onePage: 'Ver una sola página', rotatePage: 'Girar la página',
    readAloud: 'Lectura en voz alta', ttsPlay: 'Leer desde aquí', ttsPause: 'Pausar', ttsResume: 'Continuar',
    ttsStop: 'Detener', ttsVoice: 'Voz', ttsAutoVoice: 'Automática', ttsSpeed: 'Velocidad',
    ttsHelp: 'Empieza en la página actual, resalta la frase que suena y pasa de página sola.',
    ttsNoSupport: 'Este navegador no permite la lectura en voz alta.',
    ttsNoText: 'No se encontró texto para leer (puede ser un documento escaneado).',
    immersive: 'Leer a pantalla completa', immersiveExit: 'Salir de la pantalla completa',
    timeLeft: 'Tiempo de lectura restante estimado', timeLeftMenu: 'Tiempo restante: {time}',
    reader: 'Lector', readerScreen: 'En pantalla', showStatusBar: 'Mostrar la barra de datos al pie',
    showStatusBarHelp: 'La línea del final del lector con la página del capítulo, la pantalla del libro, el porcentaje leído y el tiempo que queda. Al ocultarla se gana ese poco de alto para el texto.',
    statusChapter: '{page} / {total} del cap.', statusChapterTitle: 'Pantalla dentro del capítulo',
    statusScreens: 'Pant. {page} de ~{total}',
    statusScreensTitle: 'Pantallas que ocupa el libro en este dispositivo, con la letra y el margen de ahora. Es una estimación y cambia al tocar esos ajustes.',
    statusPage: 'Página {page} de {total}', statusPageTitle: 'Página del documento',
    statusRead: '{percent} % leído', statusReadTitle: 'Parte del libro que llevas leída',
    timeLessMinute: '< 1 m', timeMinutes: '{m} m', timeHoursMinutes: '{h} h {m} m', goPercent: 'Ir al porcentaje del libro (0–100):', goToPage: 'Ir a la página (1–{total}):',
    sampleNoticeHtml: '<h2>Dos libros para empezar</h2><span>Tu biblioteca incluye dos libros de ejemplo para que puedas probar PageKeeper desde el primer momento. Son tuyos: puedes leerlos, conservarlos o borrarlos cuando quieras desde el menú de acciones de cada libro.</span>',
    dontShowAgain: 'No volver a mostrar',
    noConfigHtml: '<span>No hay ningún servidor configurado. Puedes abrir un libro (PDF o EPUB) de este dispositivo, o <a href="#" id="enlace-configurar">configurar tu nube (Nextcloud u otro WebDAV)</a> para sincronizar la posición de lectura entre dispositivos.</span><p class="ayuda">¿No sabes qué es esto o qué necesitas? <a href="#" id="enlace-ayuda-aviso">Lee la ayuda</a>.</p>',
    syncError: 'Error de sincronización', syncFailed: 'No se pudo sincronizar el progreso: {error}',
    syncRecovered: 'Ya se ha guardado tu posición en la nube',
    stats: 'Estadísticas de lectura', statsView: 'Ver las estadísticas',
    statsSettingsHelp: 'El tiempo que dedicas a leer, los días seguidos que llevas y los libros a los que más rato les echas, sumando todos tus dispositivos.',
    statsSummary: 'Tu lectura', statsLastDays: 'Los últimos 30 días',
    actionBookStats: 'Tiempo de lectura',
    statusTimeSpentTitle: 'Tiempo que llevas leyendo este libro. Pulsa para verlo en detalle.',
    statusPaused: 'En pausa',
    statusPausedTitle: 'El tiempo dedicado no está sumando: llevas más de cinco minutos en la misma página. Vuelve a contar en cuanto pases de página.',
    statsBookTime: 'Tiempo dedicado', statsBookRead: 'Leído', statsBookPace: 'Ritmo',
    statsPacePerPage: '{time} por página', statsPaceSeconds: '{s} s por página',
    statsBookByDevice: 'En cada dispositivo',
    statsHideFromList: 'Ocultar de la lista',
    statsShowInList: 'Volver a la lista',
    statsHideNote: 'Deja de salir en «En qué se va el tiempo». No se borra nada: volverá a la lista en cuanto lo leas otro rato.',
    statsHiddenNote: 'Ahora no sale en «En qué se va el tiempo». Volverá solo en cuanto lo leas otro rato.',
    statsBookEmpty: 'Todavía no hay tiempo apuntado de este libro. En cuanto leas unos minutos con él abierto, aquí aparecerá cuánto le has dedicado.',
    statsShared: 'Suma de todos tus dispositivos: lo leído en el móvil y en el ordenador cuenta junto, y un día en el que hayas leído en los dos es un solo día.',
    statsTopBooks: 'En qué se va el tiempo',
    statsSortBy: 'Ordenar por', statsSortTime: 'Tiempo dedicado',
    statsSortRecent: 'Última lectura', statsSortTitle: 'Título',
    statsLastRead: 'leído el {date}', statsBookGone: 'ya no está en la biblioteca', statsDataTitle: 'Estos datos',
    statsEmptyTitle: 'Todavía no hay nada que contar',
    statsEmpty: 'En cuanto leas unos minutos con un libro abierto, aquí aparecerán el tiempo dedicado, los días seguidos que llevas leyendo y en qué libros se te va el rato.',
    statsPrivacy: 'Con una nube configurada, el tiempo viaja con el progreso de lectura: cada dispositivo apunta el suyo y aquí se enseña la suma, así que sabes cuánto has tardado en leer un libro aunque lo hayas leído a ratos en cada aparato. Van en tu propio servidor WebDAV, con tus libros, y no se envían a ningún otro sitio. Sin nube configurada se quedan en este navegador. Solo cuenta el tiempo con el libro delante: mientras la aplicación no está a la vista el reloj se para, y los saltos de posición no se suman. De cada página se cuentan como mucho cinco minutos; pasado ese rato la barra del pie avisa de que está en pausa, y vuelve a contar al pasar de página.',
    statsDelete: 'Borrar las estadísticas',
    statsDeleteConfirm: '¿Borrar las estadísticas de lectura? Se borran en todos tus dispositivos: los que estén conectados lo harán en cuanto sincronicen. No afecta a tus libros, a la página por la que vas ni a tus anotaciones.',
    statsDeleted: '✓ Estadísticas borradas. Los demás dispositivos las borrarán al sincronizar.',
    statsOptOut: 'No medir el tiempo de lectura',
    statsOptOutHelp: 'Deja de contar el tiempo, los días seguidos y el rato dedicado a cada libro. Al activarlo se borra lo que haya apuntado hasta ahora, que no se puede recuperar. Con la nube configurada, la decisión llega también a tus otros dispositivos: dejan de medir en cuanto sincronizan.',
    statsOptOutConfirm: '¿Dejar de medir el tiempo de lectura?\n\nSe borrará todo lo apuntado hasta ahora —el tiempo, los días seguidos y el rato de cada libro— y no se podrá recuperar. Con la nube configurada, tanto el borrado como la decisión de no medir llegarán a tus otros dispositivos.',
    statsOffTitle: 'No se está midiendo nada',
    statsOff: 'Tienes desactivado el recuento del tiempo de lectura. Puedes volver a activarlo aquí abajo, en «Estos datos»; se empezará a contar de nuevo desde cero.',
    statsOffDone: '✓ Se ha dejado de medir y se ha borrado lo que había.',
    statsOnAgain: '✓ Se vuelve a medir, empezando desde cero.',
    statsTotal: 'Tiempo total', statsToday: 'Hoy', statsWeek: 'Últimos 7 días',
    statsStreak: 'Días seguidos', statsAverage: 'Media por día leído',
    statsActiveDays: 'Días con lectura', statsBestDay: 'Mejor día', statsPdfPages: 'Páginas de PDF',
    statsBestStreak: 'tu mejor racha: {streak}', statsStreakNow: 'racha en marcha',
    statsNoStreak: 'hoy o mañana empieza una',
    statsDays: '{count} días', statsDaysOne: '{count} día', statsHours: '{h} h',
    statsChartLabel: 'Gráfico del tiempo leído cada uno de los últimos {days} días.',
    statsChartSummary: 'Has leído {days} de los últimos 30, {total} en total.',
    statsGroupBy: 'Agrupar por',
    statsByDay: 'Días', statsByWeek: 'Semanas', statsByMonth: 'Meses', statsByYear: 'Años',
    statsLastWeeks: 'Las últimas 12 semanas', statsLastMonths: 'Los últimos 12 meses',
    statsLastYears: 'Los últimos 5 años',
    statsCount_semana: '{count} semanas', statsCount_semanaOne: '{count} semana',
    statsCount_mes: '{count} meses', statsCount_mesOne: '{count} mes',
    statsCount_anno: '{count} años', statsCount_annoOne: '{count} año',
    statsChartSummaryPeriod: 'Has leído en {count}, {total} en total.',
    statsWeekOf: 'Semana del {date}',
    statsThisWeek: 'Esta semana', statsThisMonth: 'Este mes', statsThisYear: 'Este año',
    statsThisDay: 'Hoy',
    statsPrevWeek: 'La semana anterior', statsPrevMonth: 'El mes anterior',
    statsPrevYear: 'El año anterior', statsPrevDay: 'Ayer',
    statsSoFar: 'a estas alturas', statsUpToMonth: 'hasta {month}',
    statsMoreThanBefore: '{percent} % más', statsLessThanBefore: '{percent} % menos',
    statsSame: 'Igual', statsFirstTime: 'Empiezas', statsNoTime: 'Nada',
    statsHistoryFrom: 'El detalle por días llega hasta el {date}.',
    statsChartEmpty: 'Aún no has leído nada en estos 30 días.',
    statsChartDay: '{date}: {time}', statsChartDayNone: '{date}: sin lectura',
    statsBooksTracked: 'De los {count} más recientes.',
    statsBookUntitled: 'Libro sin título',
    activityLog: 'Registro de actividad',
    activityLogHelp: 'Deja constancia de si la posición de lectura llega al servidor y de los errores que impiden que llegue. Sirve para averiguar por qué un libro se quedó atrás en otro dispositivo. Se guarda solo aquí, nunca sale de este aparato y se borra solo al cabo de una semana.',
    viewLog: 'Ver el registro', clearLog: 'Vaciar', copyLog: 'Copiar', downloadLog: 'Guardar',
    logEmpty: 'Todavía no hay nada registrado.',
    logWithErrors: '{errores} error(es) registrados',
    logNoErrors: '{total} eventos, ninguno con error',
    logCopied: 'Registro copiado', logCopyFailed: 'No se pudo copiar; usa «Guardar»',
    logRecovered: 'subió tras {intentos} intento(s) fallido(s)',
    logRetrying: 'reintentando (fallos seguidos: {intentos})',
    logOffline: 'sin conexión: se espera a recuperarla',
    logBackOnline: 'conexión recuperada', logWentOffline: 'conexión perdida',
    cloudScope: 'Libros y progreso disponibles en todos tus dispositivos',
    localScope: 'Libros guardados únicamente en este dispositivo',
    emptyLocalAction: 'Añadir libros solo a este dispositivo',
    emptyLocalHelp: 'No se sincronizarán. Selecciona archivos PDF o EPUB, o arrástralos aquí.',
    webdavHelpHtml: 'Compatible con Nextcloud, ownCloud y cualquier servidor WebDAV. Los PDF de la carpeta indicada aparecerán en tu biblioteca y la posición de lectura se sincronizará entre todos tus dispositivos. ¿No sabes qué poner aquí? <a href="#" id="enlace-ayuda-ajustes">Lee la ayuda</a>.',
    passwordHelpHtml: '⚠️ En Nextcloud crea una <strong>contraseña de aplicación</strong> (Ajustes → Seguridad), no uses tu contraseña principal. Además, para que el navegador pueda conectar, el servidor debe permitir CORS: en Nextcloud instala la app <strong>WebAppPassword</strong> y añade el dominio de este lector. Los datos se guardan únicamente en este navegador.',
    transferHelp: 'Puedes copiar un enlace o guardar un archivo con la URL, el usuario y la contraseña de aplicación, y abrirlo en otro dispositivo. ⚠️ El enlace y el archivo permiten acceder a tu nube: guárdalos en privado y elimina las copias que ya no necesites.',
    creditsHtml: 'Construido con <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) e iconos <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC).',
    dropLocal: 'Suelta aquí para guardar en este dispositivo', dropCloud: 'Suelta aquí para subir a la nube',
    unsupportedFiles: 'Solo se pueden añadir archivos PDF o EPUB.',
    localDuplicate: 'Ese libro ya está en este dispositivo, guardado como «{title}».',
    noBooksInFolder: 'Esa carpeta no contiene ningún PDF ni EPUB.', localAddedOne: 'Libro guardado en este dispositivo.', localAddedMany: '{count} libros guardados en este dispositivo.',
    saveFailed: 'No se pudo guardar «{title}»: {error}',
    searchLibrary: 'Buscar en la biblioteca', clearSearch: 'Borrar la búsqueda', searchLibraryPlaceholder: 'Buscar por título, autor…',
    showIndex: 'Mostrar el índice', hideIndex: 'Ocultar el índice',
    showThumbs: 'Mostrar las miniaturas', hideThumbs: 'Ocultar las miniaturas',
    showIndexThumbs: 'Mostrar el índice y las miniaturas',
    hideIndexThumbs: 'Ocultar el índice y las miniaturas',
    searchBook: 'Buscar dentro del libro', bookIndex: 'Índice del libro', bookStart: 'Inicio del libro', historyNavigation: 'Historial de navegación', backPosition: 'Volver a la posición anterior', forwardPosition: 'Avanzar a la posición siguiente', pageAndHistory: 'Página e historial de navegación', wordOrPhrase: 'Palabra o frase', search: 'Buscar', close: 'Cerrar', zoomedImage: 'Imagen ampliada',
    searchingBook: 'Buscando en el libro…', searchProgress: 'Buscando… {done}/{total} · {count} resultados.', noSearchResults: 'No se encontraron resultados.', searchResults: '{count} resultados.',
    chapter: 'Capítulo', noLibraryResults: 'No hay libros que coincidan con la búsqueda.',
    searchingFolders: 'Buscando también dentro de las carpetas…', inFolder: 'En la carpeta «{name}»',
    bookmarks: 'Marcadores', bookmark: 'Marcador', addBookmark: 'Añadir un marcador aquí',
    annotations: 'Anotaciones', noAnnotations: 'Todavía no hay anotaciones.',
    highlightColor: 'Color del resaltado', highlightYellow: 'Resaltar en amarillo',
    highlightGreen: 'Resaltar en verde', highlightBlue: 'Resaltar en azul', highlightPink: 'Resaltar en rosa',
    exportAnnotations: 'Exportar las anotaciones (Markdown)', exportHeader: 'Anotaciones de «{title}»',
    exportSource: 'Exportadas de PageKeeper', annotationsExported: 'Anotaciones exportadas.',
    searchAnnotations: 'Buscar en las anotaciones', noAnnotationResults: 'No hay anotaciones que coincidan.',
    selectionActions: 'Acciones para el texto seleccionado', highlight: 'Resaltar', addNote: 'Añadir nota',
    note: 'Nota', notePrompt: 'Nota sobre el texto seleccionado:', editNote: 'Editar nota', deleteAnnotation: 'Borrar anotación', deleteAnnotationConfirm: '¿Borrar esta anotación?', noteActions: 'Opciones de la nota',
    annotationAdded: 'Anotación guardada.', annotationDeleted: 'Anotación borrada.',
    bookmarkName: 'Nombre del marcador', bookmarkNamePlaceholder: 'Nombre del marcador (opcional)',
    bookmarkNamePrompt: 'Nombre del marcador (déjalo vacío para quitarlo):', editBookmark: 'Cambiar el nombre del marcador',
    noBookmarks: 'Todavía no hay marcadores.', bookmarkAdded: 'Marcador añadido.',
    bookmarkRenamed: 'Nombre del marcador actualizado.',
    bookmarkRemoved: 'Marcador borrado.', bookmarkExists: 'Ya hay un marcador en esta posición.',
    deleteBookmark: 'Borrar el marcador',
    cloudRoot: 'Inicio', currentFolder: 'Carpeta actual', targetFolder: 'Carpeta de destino',
    newFolder: 'Crear una carpeta', folderNamePrompt: 'Nombre de la carpeta nueva:',
    invalidFolderName: 'El nombre de la carpeta no es válido.',
    creatingFolder: 'Creando la carpeta «{name}»…', folderCreated: 'Carpeta «{name}» creada.',
    renamingFolder: 'Cambiando el nombre de «{name}»…',
    openFolder: 'Abrir la carpeta «{name}»',
    folderEmpty: 'Vacía', folderItemsOne: '1 elemento', folderItems: '{count} elementos',
    sectionFoldersOne: '1 carpeta', sectionFolders: '{count} carpetas',
    sectionBooksOne: '1 libro', sectionBooks: '{count} libros',
    deleteFolderConfirm: '¿Borrar la carpeta «{name}» y todo su contenido de tu nube?',
    folderDeleted: 'Carpeta borrada de la nube.', emptyFolder: 'Esta carpeta está vacía.',
    deviceRoot: 'Inicio', actionRenameFolder: 'Cambiar el nombre de la carpeta',
    actionSaveToDevice: 'Guardar en este dispositivo',
    imagesInvertedOff: 'Devolver su color a las imágenes',
    imagesInvertedOn: 'Imágenes en su color: activado. Pulsa para invertirlas con la página',
    library: 'Biblioteca', showContinueReading: 'Mostrar «Continuar leyendo»',
    showContinueReadingHelp: 'El recuadro con tus últimas lecturas, encima de la biblioteca. Al ocultarlo, los libros siguen donde estaban y conservan su página.',
    openLastOnStart: 'Abrir la última lectura al iniciar PageKeeper',
    openLastOnStartHelp: 'Al abrir la aplicación se va directamente al libro que estabas leyendo, sin pasar por la biblioteca. Se recuerda solo en este dispositivo: en los demás seguirás llegando a la biblioteca.',
    theme: 'Tema', themeAuto: 'El del sistema', themeLight: 'Claro', themeSepia: 'Sepia',
    statsBookCard: 'Ver el tiempo de «{title}»',
    themeDark: 'Oscuro', themeBlack: 'Negro',
    autoTheme: 'El tema del sistema',
    autoThemeHelp: 'Cuando el tema está en «el del sistema», la aplicación se aclara u oscurece con el resto del dispositivo. Aquí eliges con qué tema lo hace a cada lado. Los cinco temas siguen estando a mano en el botón de la cabecera; esto solo decide a cuál va «el del sistema».',
    autoThemeLight: 'Cuando el sistema va en claro',
    autoThemeDark: 'Cuando el sistema va en oscuro',
    autoThemeNow: 'Ahora mismo tu sistema pide el tema {theme}, que es lo que estás viendo.',
    autoThemeIdle: 'Tienes el tema puesto a mano en {theme}, así que esto no cambia nada de momento. Vuelve a «el del sistema» en el botón de la cabecera para que valga.',
    actionMoveFolder: 'Mover la carpeta', moveFolderTo: 'Mover la carpeta «{name}»',
    folderMoved: 'Carpeta «{name}» movida.',
    savedToDevice: '«{title}» guardado en este dispositivo.',
    folderRenamePrompt: 'Nombre nuevo de la carpeta:', folderRenamed: 'Carpeta renombrada.',
    folderExists: 'Ya hay una carpeta con ese nombre aquí.',
    deleteLocalFolderConfirm: '¿Borrar la carpeta «{name}» y todos los libros que contiene de este dispositivo?',
    localFolderDeleted: 'Carpeta borrada de este dispositivo.',
    emptyLocalFolder: 'Esta carpeta no tiene libros todavía.',
    moveToDeviceFolder: 'Mover «{title}» a otra carpeta del dispositivo',
    moveBook: 'Mover «{title}» a otra carpeta', moveHere: 'Mover aquí',
    moving: 'Moviendo «{title}»…', bookMoved: '«{title}» movido.', cancel: 'Cancelar',
    loadingFolders: 'Cargando carpetas…', noSubfolders: 'No hay subcarpetas.',
    textSettings: 'Ajustes de texto', fontFamily: 'Tipo de letra',
    bookFont: 'La del libro', serifFont: 'Con serifa', sansFont: 'Sin serifa',
    lineSpacing: 'Interlineado', bookSpacing: 'El del libro', spacingCompact: 'Compacto',
    spacingNormal: 'Normal', spacingWide: 'Amplio', spacingWider: 'Muy amplio',
    hyphenation: 'Partir palabras', hyphenationAuto: 'Sí, al final de línea',
    hyphenationBook: 'Como el libro', hyphenationNever: 'No partir',
    textAlignment: 'Alineación', bookAlignment: 'La del libro',
    unjustifiedAlignment: 'Sin justificar',
    justifiedAlignment: 'Justificado',
    columnsSettings: 'Columnas', columnsAuto: 'Automáticas',
    columnsOne: 'Una columna', columnsTwo: 'Dos columnas',
    columnsThree: 'Tres columnas', columnsFour: 'Cuatro columnas',
    columnsSettingsHelp: 'En cuántas columnas se reparte el texto en la pantalla. En automático caben las que quepan sin que las líneas se hagan incómodas, y cambian solas al girar el aparato o al tocar el tamaño de la letra. Con un libro abierto, el botón de las columnas cambia el de ese libro; lo de aquí es con lo que empiezan los demás. Esto no viaja a los otros dispositivos: cada pantalla es un mundo.',
    lineLength: 'Líneas de como mucho', lineLengthValue: '{value} letras',
    moreColumns: 'Más columnas', fewerColumns: 'Menos columnas',
    lineLengthHelp: 'Solo cuenta en automático: se abre otra columna en cuanto el texto da para que ninguna pase de ese largo. Con líneas cortas aparecen antes; con líneas largas, más tarde.',
  },
  ca: {
    appTagline: 'Lector de llibres electrònics',
    appVersion: 'PageKeeper {version}',
    // Imprimir el EPUB en papel o en PDF.
    printBook: 'Imprimeix o desa en PDF',
    printHelp: 'S’obrirà el diàleg d’impressió del navegador, on pots triar la impressora o «Desa com a PDF».',
    printPaper: 'Paper',
    printPaperLetter: 'Carta',
    printMargins: 'Marges',
    printMarginNarrow: 'Estrets',
    printMarginNormal: 'Normals',
    printMarginWide: 'Amples',
    printFont: 'Lletra',
    printFontSmall: 'Petita',
    printFontNormal: 'Normal',
    printFontLarge: 'Gran',
    printAnnotations: 'Inclou els subratllats i les notes',
    selectAll: 'Tots',
    selectNone: 'Cap',
    print: 'Imprimeix',
    printChapterNumber: 'Capítol {number}',
    printNoChapters: 'Cap capítol',
    printWholeBook: 'Tot el llibre',
    printSomeChapters: '{count} de {total} capítols',
    printPreparing: 'S’està preparant el document… {done} de {total}',
    printNotesHeading: 'Notes',
    printFallbackTitle: 'Llibre',
    printChapterFailed: 'No s’ha pogut compondre el capítol «{title}».',
    printFailed: 'No s’ha pogut preparar el document per imprimir.',
    language: 'Idioma', help: 'Ajuda', settings: 'Configuració', back: 'Torna', cloud: 'Al núvol',
    device: 'En aquest dispositiu', addLocal: 'Afegeix un llibre (PDF o EPUB) d’aquest dispositiu',
    addCloud: 'Puja un llibre (PDF o EPUB) al núvol', reload: 'Recarrega',
    addLocalFolder: 'Afegeix una carpeta sencera d’aquest dispositiu',
    addCloudFolder: 'Puja una carpeta sencera al núvol',
    backLibrary: 'Torna a la biblioteca', saveCloud: 'Desa al meu núvol', zoom: 'Zoom', zoomOut: 'Redueix', autoWidth: 'Ajusta a l’amplada', fitPage: 'Ajusta la pàgina completa', cropMargins: 'Retalla els marges', skipToContent: 'Vés al contingut', bookIndexShort: 'Índex', thumbnails: 'Miniatures', resizePanel: 'Canvia l’amplada del plafó', bookNavigation: 'Navegació del llibre', pageThumbnails: 'Miniatures de les pàgines', noMarginsToCrop: 'Aquesta obra no té marges per retallar.', zoomIn: 'Amplia',
    zoomLevel: 'Augment:', zoomChange: 'Prem per canviar-lo',
    zoomSettings: 'Tria l’augment', customZoom: 'Un altre', apply: 'Aplica',
    moreReaderActions: 'Més accions', readerActions: 'Accions de lectura',
    previous: 'Pàgina anterior', next: 'Pàgina següent', goPage: 'Ves a una pàgina',
    marginSide: 'Marge lateral', noMargin: 'Sense marge', moreMargin: 'Més marge',
    zoomHelp: 'Es desa només per a aquest llibre.',
    marginHelp: 'El text es reajusta en moure el control. El marge és d’aquest llibre.', reset: 'Restableix',
    webdavFolder: 'URL de la carpeta WebDAV', user: 'Usuari', appPassword: 'Contrasenya d’aplicació',
    webdav: 'Núvol (WebDAV)', transferConfig: 'Porta la configuració a un altre dispositiu',
    webdavShort: 'Núvol', settingsData: 'Dades', settingsSections: 'Seccions de la configuració',
    epubTextSettings: 'Text dels EPUB',
    epubTextSettingsHelp: 'Com es compon el text dels llibres EPUB (els PDF arriben ja maquetats i no admeten aquests canvis). Els mateixos ajustos són a mà mentre llegeixes, al botó de la lletra. Aquí decideixes amb què comença cada llibre nou: el marge i l’alineació que canviïs amb un llibre obert són només d’aquell llibre.',
    resetTextSettings: 'Restableix el text',
    importExport: 'Importa i exporta', addBooks: 'Afegeix llibres',
    addBooksHelp: 'Afegeix PDF o EPUB al dispositiu o puja’ls a la carpeta del núvol que tinguis oberta.',
    addToDevice: 'Afegeix al dispositiu', uploadToCloud: 'Puja al núvol',
    addFolderToDevice: 'Afegeix una carpeta al dispositiu', uploadFolderToCloud: 'Puja una carpeta al núvol',
    localBackup: 'Biblioteca d’aquest dispositiu',
    localBackupHelp: 'Desa en un ZIP els llibres de «En aquest dispositiu», el progrés, els marcadors, les anotacions i les preferències. No inclou la configuració ni la contrasenya del núvol; les pots desar a part des de Configuració.',
    exportLocalBackup: 'Crea una còpia', restoreLocalBackup: 'Restaura al dispositiu',
    creatingBackup: 'S’està creant la còpia…', restoringBackup: 'S’està restaurant la còpia…',
    noLocalBooksBackup: 'No hi ha llibres locals per copiar.',
    backupCreated: 'La còpia s’ha creat correctament ({count} llibres).',
    backupRestored: 'La còpia s’ha restaurat correctament ({count} llibres).',
    backupFailed: 'No s’ha pogut crear la còpia: {error}', restoreFailed: 'No s’ha pogut restaurar: {error}',
    invalidBackup: 'El fitxer no és una còpia vàlida de PageKeeper.',
    wrongLocalBackup: 'Aquesta és una còpia del núvol, no del dispositiu.',
    restoreBackupConfirm: 'Vols restaurar aquesta còpia? Els llibres amb el mateix identificador i les seves dades locals se substituiran; els altres es conservaran.',
    pdfPasswordTitle: 'PDF protegit', pdfPasswordHelp: 'Introdueix la contrasenya per obrir aquest PDF. No es desarà.',
    pdfPassword: 'Contrasenya del PDF', pdfPasswordIncorrect: 'La contrasenya no és correcta.',
    pdfNoTextTitle: 'PDF sense text seleccionable',
    pdfNoTextBadge: 'SENSE TEXT',
    pdfNoTextHelp: 'Aquest document sembla escanejat. La cerca, la selecció i la lectura en veu alta no funcionaran correctament.',
    pdfNoTextStep1: 'Baixa el PDF des del menú del llibre.',
    pdfNoTextStep2: 'Obre’l a Scribe OCR i genera una còpia PDF amb text.',
    pdfNoTextStep3: 'Baixa aquesta còpia i torna a pujar-la a PageKeeper.',
    pdfNoTextPrivacy: 'PageKeeper no enviarà el document: l’hauràs de seleccionar tu a l’eina externa.',
    openScribeOcr: 'Obre Scribe OCR', understood: 'Entesos',
    open: 'Obre', openFailed: 'No s’ha pogut obrir el llibre: {error}',
    cloudBackup: 'Biblioteca del núvol',
    cloudBackupHelp: 'Desa en un ZIP tots els PDF i EPUB de la carpeta WebDAV i les subcarpetes, juntament amb el progrés, els marcadors i les anotacions.',
    exportCloudBackup: 'Crea una còpia del núvol', restoreCloudBackup: 'Restaura al núvol',
    cloudBackupNeedsConfig: 'Configura primer un núvol WebDAV a Configuració.',
    readingCloudLibrary: 'S’està llegint la biblioteca del núvol…',
    noCloudBooksBackup: 'No hi ha llibres al núvol per copiar.',
    backingUpCloudBook: 'S’està copiant {current} de {total}: «{title}»…',
    cloudBackupCreated: 'La còpia del núvol s’ha creat correctament ({count} llibres).',
    restoreCloudConfirm: 'Vols restaurar aquesta còpia al núvol configurat? Se’n crearan les subcarpetes i se sobreescriuran els llibres amb la mateixa ruta.',
    restoringCloudBackup: 'S’està preparant la restauració al núvol…',
    restoringCloudBook: 'S’està pujant {current} de {total}: «{title}»…',
    cloudBackupRestored: 'La còpia s’ha restaurat al núvol ({count} llibres).',
    wrongCloudBackup: 'Aquesta és una còpia del dispositiu, no del núvol.',
    testConnection: 'Prova la connexió', save: 'Desa', deleteConfig: 'Esborra la configuració',
    copyConfig: 'Copia l’enllaç de configuració', exportConfigFile: 'Desa la configuració',
    importConfigFile: 'Restaura la configuració', configFileSaved: '✓ Configuració desada en un fitxer.',
    invalidConfigFile: 'El fitxer no conté una configuració vàlida de PageKeeper.',
    credits: 'Crèdits', license: 'Llicència MIT', source: 'Codi font',
    privacy: 'Privacitat',
    analyticsNotice: 'Aquesta aplicació recull únicament estadístiques d’ús agregades amb un sistema propi per conèixer-ne la utilització i millorar l’eina. No s’emmagatzemen adreces IP ni s’usen galetes d’analítica per als visitants.',
    continueReading: 'Continua llegint', recentCount: 'Quantes lectures mostrar', recentAuto: 'Les que hi càpiguen', recentN: '{count} lectures',
    recentCountHelp: '«Les que hi càpiguen» en mostra tres o quatre segons l’amplada de la pantalla. La resta són a un toc, a «Veure’n més».', removeContinue: 'Treu «Continua llegint» de la biblioteca', continueRemoved: 'S’ha tret «Continua llegint». El pots tornar a mostrar a Configuració → Biblioteca.', continueReadingHelp: 'La lectura més recent, amb les altres a un toc',
    devices: 'Dispositius connectats',
    devicesHelp: 'Els navegadors que estan fent servir aquesta biblioteca, amb l’última vegada que van sincronitzar. Si en veus un que no reconeixes, canvia la contrasenya d’aplicació.',
    devicesRevokeHelp: '⚠️ «Desconnecta» demana al dispositiu que oblidi la configuració del núvol i te la torni a demanar, i només fa efecte la propera vegada que s’obri allà. No retira l’accés al servidor: per això cal esborrar la contrasenya d’aplicació al teu núvol.',
    devicesNone: 'Encara no s’hi ha connectat cap dispositiu.',
    deviceThisOne: 'aquest dispositiu', deviceUnknown: 'Dispositiu sense nom',
    deviceAuto: '{browser} a {system}', deviceCode: 'codi {code}',
    deviceLastSeen: 'última vegada: {when}', deviceNeverSeen: 'sense dades',
    deviceToday: 'avui', deviceYesterday: 'ahir', deviceDaysAgo: 'fa {count} dies',
    deviceRevokedPending: 'desconnectat, a l’espera que s’obri',
    deviceRevoked: 'desconnectat',
    deviceRename: 'Canvia el nom', deviceRenamePrompt: 'Nom per a aquest dispositiu',
    deviceDisconnect: 'Desconnecta',
    deviceDisconnectConfirm: 'Voleu desconnectar «{name}»? La propera vegada que s’obri allà, PageKeeper oblidarà la configuració del núvol i la tornarà a demanar. L’accés al servidor no es retira: per això, esborra la contrasenya d’aplicació al teu núvol.',
    deviceDisconnected: 'S’ha demanat la desconnexió. Farà efecte la propera vegada que s’obri PageKeeper en aquell dispositiu.',
    deviceWasDisconnected: 'Aquest dispositiu s’ha desconnectat des d’un altre aparell: torna a escriure les dades del teu núvol per continuar sincronitzant.',
    cleanup: 'Llibres que ja no hi són',
    cleanupHelp: 'Quan un llibre desapareix del núvol, la marca de lectura, els marcadors i les notes es queden aquí. Primer es troba a faltar i només després s’esborren, per si el llibre era fora d’abast una estona.',
    cleanupDays: 'Quant s’espera abans d’esborrar-los',
    cleanupNever: 'No esborrar-los mai',
    cleanupDays7: 'Una setmana', cleanupDays15: 'Quinze dies', cleanupDays30: 'Un mes',
    cleanupDays60: 'Dos mesos', cleanupDays90: 'Tres mesos',
    cleanupDaysHelp: 'Aquest termini es comparteix amb els altres dispositius, perquè tots esborrin el mateix dia.',
    cleanupCheck: 'Comprovar el núvol', cleanupNow: 'Esborrar ara',
    cleanupChecking: 'Mirant què hi ha al núvol…',
    cleanupNoCloud: 'Sense núvol configurat. Els llibres d’aquest dispositiu es netegen sols en esborrar-los, sense espera.',
    cleanupUnchecked: 'Encara no s’ha comprovat el núvol en aquesta sessió.',
    cleanupClean: 'Tot en ordre: {count} elements al núvol i cap marca de lectura pendent d’esborrar.',
    cleanupCleanOne: 'Tot en ordre: 1 element al núvol i cap marca de lectura pendent d’esborrar.',
    cleanupMissingOne: 'Es troba a faltar 1 llibre; la marca de lectura encara es desa:',
    cleanupSideFilesOne: 'Hi ha, a més, 1 fitxer d’anotacions sense el seu llibre.',
    cleanupConfirmOne: 'Voleu esborrar ara la marca de lectura, els marcadors i les notes d’1 llibre que ja no hi és? No es pot desfer.',
    cleanupDoneOne: 'S’ha netejat 1 llibre que ja no hi era.',
    cleanupMissing: 'Es troben a faltar {count} llibres; la marca de lectura encara es desa:',
    cleanupMissingOn: '{name} — s’esborrarà el {date}',
    cleanupMissingNever: '{name} — no s’esborrarà (has triat no esborrar mai)',
    cleanupSideFiles: 'Hi ha, a més, {count} fitxers d’anotacions sense el seu llibre.',
    cleanupConfirm: 'Voleu esborrar ara la marca de lectura, els marcadors i les notes de {count} llibres que ja no hi són? No es pot desfer.',
    cleanupDone: 'S’han netejat {count} llibres que ja no hi eren.',
    cleanupNothing: 'No hi havia res per esborrar: els llibres han tornat a aparèixer.',
    showMoreRecent: 'Mostra’n {count} més', showFewerRecent: 'Mostra’n menys',
    removeFromContinue: 'Treu «{title}» de Continua llegint',
    filterBy: 'Mostra', filterAll: 'Tots', filterReading: 'En lectura', filterPending: 'Pendents', filterFinished: 'Acabats',
    sortBy: 'Ordena per', sortRecent: 'Lectura recent', sortTitle: 'Títol', sortAuthor: 'Autor', sortProgress: 'Progrés',
    rating: 'Qualificació', ratingNone: 'Sense qualificar', ratingOf: '{n} de {max} estrelles',
    openedWithoutSync: 'No s\'ha pogut comprovar si havies avançat en un altre dispositiu: s\'obre per on anaves aquí.',
    positionFromOtherDevice: 'S\'ha recuperat la posició que vas deixar en un altre dispositiu.',
    remotePositionAskEpub: 'En un altre dispositiu la lectura va arribar al {remoto} % i aquí vas pel {local} %. Hi vols anar?',
    remotePositionAskPdf: 'En un altre dispositiu la lectura va arribar a la pàgina {remoto} de {paginas} i aquí vas per la {local}. Hi vols anar?',
    remotePositionGo: 'Vés-hi',
    remotePositionStay: 'Quedar-me aquí',
    remotePositionStayed: 'Es manté la posició d\'aquest dispositiu.',
    bookNoteRating: 'Nota i qualificació',
    ratingHint: 'Prem l\'estrella marcada per treure la qualificació',
    sortRating: 'Qualificació', filterRated4: '4 estrelles o més', filterRated3: '3 estrelles o més', filterUnrated: 'Sense qualificar',
    filterGroupStatus: 'Lectura', filterGroupRating: 'Qualificació',
    viewLabel: 'Vista', viewList: 'Vista de llista', viewGrid: 'Vista de graella',
    toggleSection: 'Plega o desplega la secció',
    markFinished: 'Marca «{title}» com a acabat', markUnfinished: 'Treu l’etiqueta «Acabat» de «{title}»', finished: 'Acabat',
    sampleBookHeading: 'Comença amb un llibre d’exemple', sampleBookHelp: 'La biblioteca és buida. Afegeix un d’aquests exemples per provar PageKeeper:',
    loadingSampleBook: 'S’està preparant el llibre d’exemple…',
    loadingLibrary: 'S’està carregant la biblioteca…', noCloudBooks: 'Encara no hi ha llibres sincronitzats. Fes servir el botó de pujar per afegir-ne el primer.',
    notStarted: 'sense començar', read: 'llegit', page: 'Pàgina', of: 'de',
    bookActions: 'Accions de «{title}»',
    actionUpload: 'Puja al núvol', actionMove: 'Mou a una altra carpeta', actionDownload: 'Baixa',
    actionOffline: 'Disponible sense connexió', actionRemoveOffline: 'Treu la còpia sense connexió',
    actionUpdateOffline: 'Actualitza la còpia sense connexió', actionDelete: 'Esborra',
    actionBookNote: 'Nota del llibre', bookNote: 'Nota del llibre', bookNoteLabel: 'La teva nota sobre aquest llibre',
    bookNotePlaceholder: 'De què va, per on el vas deixar, què vols recordar…',
    actionFolderNote: 'Nota de la carpeta', folderNote: 'Nota de la carpeta',
    folderNotePlaceholder: 'Què hi guardes i per a què…',
    noFolderNote: 'Encara no hi ha cap nota sobre aquesta carpeta.',
    editBookNote: 'Escriu la nota del llibre', noBookNote: 'Encara no hi ha cap nota sobre aquest llibre.',
    actionRename: 'Canvia el nom',
    actionMarkFinished: 'Marca com a acabat', actionMarkUnfinished: 'Treu «Acabat»',
    renameBookPrompt: 'Nom per mostrar a la biblioteca (deixa-ho buit per fer servir el del fitxer):',
    actionDeleteFolder: 'Esborra la carpeta',
    actionDownloadFolderZip: 'Descarrega la carpeta (ZIP)',
    actionSaveFolderToDisk: 'Desa la carpeta a l’equip',
    packingFolder: 'S’està preparant la carpeta…',
    packingFolderItem: '«{title}» ({current} de {total})',
    folderDownloadedOne: 'S’ha desat la carpeta «{name}»: 1 llibre.',
    folderDownloadedMany: 'S’ha desat la carpeta «{name}»: {count} llibres.',
    folderHasNoBooks: 'Aquesta carpeta no conté cap llibre per descarregar.',
    folderDownloadedPartial: 'S’ha desat la carpeta «{name}». Sense incloure: {failed} de {total}.',
    folderDownloadFailed: 'No s’ha pogut obtenir cap llibre de la carpeta.',
    bookGone: 'el llibre ja no és al magatzem d’aquest dispositiu',
    removeOfflineConfirm: 'Vols treure la còpia sense connexió de «{title}»? El llibre del núvol no s’esborrarà.',
    savingOffline: 'S’està desant «{title}» per llegir-lo sense connexió…', offlineSaved: '«{title}» ja està disponible sense connexió ({size} MB).',
    offlineRemoved: 'S’ha eliminat la còpia sense connexió. El llibre continua al núvol.', availableOffline: 'SENSE CONNEXIÓ', offlineOutdated: 'ACTUALITZA',
    offlineLibrary: 'Sense connexió: es mostren les còpies desades en aquest dispositiu.',
    offlineFolderEmpty: 'No hi ha còpies sense connexió en aquesta carpeta.', openedOfflineCopy: 'Obert des de la còpia sense connexió.',
    offlineUpdateFailed: 'El llibre s’ha obert, però no s’ha pogut actualitzar la còpia sense connexió.',
    storageFull: 'No hi ha prou espai per desar «{title}» sense connexió.',
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
    replaceConfigConfirm: 'La configuració importada substituirà la configuració actual del núvol. Vols continuar?',
    epubMargin: '{value} % per costat', pageMode: 'Mostra pàgina a pàgina (com un llibre)', scrollMode: 'Mostra pàgines contínues (desplaçament)',
    twoPages: 'Mostra dues pàgines juntes', onePage: 'Mostra una sola pàgina', rotatePage: 'Gira la pàgina',
    readAloud: 'Lectura en veu alta', ttsPlay: 'Llegeix des d’aquí', ttsPause: 'Pausa', ttsResume: 'Continua',
    ttsStop: 'Atura', ttsVoice: 'Veu', ttsAutoVoice: 'Automàtica', ttsSpeed: 'Velocitat',
    ttsHelp: 'Comença a la pàgina actual, ressalta la frase que sona i passa de pàgina sola.',
    ttsNoSupport: 'Aquest navegador no permet la lectura en veu alta.',
    ttsNoText: 'No s’ha trobat text per llegir (pot ser un document escanejat).',
    immersive: 'Llegeix a pantalla completa', immersiveExit: 'Surt de la pantalla completa',
    timeLeft: 'Temps de lectura restant estimat', timeLeftMenu: 'Temps restant: {time}',
    reader: 'Lector', readerScreen: 'En pantalla', showStatusBar: 'Mostra la barra de dades al peu',
    showStatusBarHelp: 'La línia del final del lector amb la pàgina del capítol, la pantalla del llibre, el percentatge llegit i el temps que queda. Si l’amagues, guanyes aquest poc d’alçada per al text.',
    statusChapter: '{page} / {total} del cap.', statusChapterTitle: 'Pantalla dins del capítol',
    statusScreens: 'Pant. {page} de ~{total}',
    statusScreensTitle: 'Pantalles que ocupa el llibre en aquest dispositiu, amb la lletra i el marge d’ara. És una estimació i canvia si toques aquests ajustos.',
    statusPage: 'Pàgina {page} de {total}', statusPageTitle: 'Pàgina del document',
    statusRead: '{percent} % llegit', statusReadTitle: 'Part del llibre que has llegit',
    timeLessMinute: '< 1 m', timeMinutes: '{m} m', timeHoursMinutes: '{h} h {m} m', goPercent: 'Ves al percentatge del llibre (0–100):', goToPage: 'Ves a la pàgina (1–{total}):',
    sampleNoticeHtml: '<h2>Dos llibres per començar</h2><span>La teva biblioteca inclou dos llibres d’exemple perquè puguis provar PageKeeper des del primer moment. Són teus: pots llegir-los, conservar-los o esborrar-los quan vulguis des del menú d’accions de cada llibre.</span>',
    dontShowAgain: 'No ho tornis a mostrar',
    noConfigHtml: '<span>No hi ha cap servidor configurat. Pots obrir un llibre (PDF o EPUB) d’aquest dispositiu, o <a href="#" id="enlace-configurar">configurar el teu núvol (Nextcloud o un altre WebDAV)</a> per sincronitzar la posició de lectura entre dispositius.</span><p class="ayuda">No saps què és això o què necessites? <a href="#" id="enlace-ayuda-aviso">Llegeix l’ajuda</a>.</p>',
    syncError: 'Error de sincronització', syncFailed: 'No s’ha pogut sincronitzar el progrés: {error}',
    syncRecovered: 'Ja s’ha desat la teva posició al núvol',
    stats: 'Estadístiques de lectura', statsView: 'Veure les estadístiques',
    statsSettingsHelp: 'El temps que dediques a llegir, els dies seguits que portes i els llibres als quals dediques més estona, sumant tots els teus dispositius.',
    statsSummary: 'La teva lectura', statsLastDays: 'Els darrers 30 dies',
    actionBookStats: 'Temps de lectura',
    statusTimeSpentTitle: 'Temps que portes llegint aquest llibre. Prem per veure’l en detall.',
    statusPaused: 'En pausa',
    statusPausedTitle: 'El temps dedicat no està sumant: fa més de cinc minuts que ets a la mateixa pàgina. Tornarà a comptar tan bon punt canviïs de pàgina.',
    statsBookTime: 'Temps dedicat', statsBookRead: 'Llegit', statsBookPace: 'Ritme',
    statsPacePerPage: '{time} per pàgina', statsPaceSeconds: '{s} s per pàgina',
    statsBookByDevice: 'A cada dispositiu',
    statsHideFromList: 'Amaga\'l de la llista',
    statsShowInList: 'Torna\'l a la llista',
    statsHideNote: 'Deixarà de sortir a «On es va el temps». No s\'esborra res: tornarà a la llista tan bon punt el llegeixis una altra estona.',
    statsHiddenNote: 'Ara no surt a «On es va el temps». Hi tornarà tot sol quan el llegeixis una altra estona.',
    statsBookEmpty: 'Encara no hi ha temps apuntat d’aquest llibre. Tan bon punt llegeixis uns minuts amb ell obert, aquí apareixerà quant li has dedicat.',
    statsShared: 'Suma de tots els teus dispositius: el que has llegit al mòbil i a l’ordinador compta junt, i un dia en què hagis llegit als dos és un sol dia.',
    statsTopBooks: 'On se’n va el temps',
    statsSortBy: 'Ordena per', statsSortTime: 'Temps dedicat',
    statsSortRecent: 'Última lectura', statsSortTitle: 'Títol',
    statsLastRead: 'llegit el {date}', statsBookGone: 'ja no és a la biblioteca', statsDataTitle: 'Aquestes dades',
    statsEmptyTitle: 'Encara no hi ha res a explicar',
    statsEmpty: 'Tan bon punt llegeixis uns minuts amb un llibre obert, aquí apareixeran el temps dedicat, els dies seguits que portes llegint i en quins llibres se’t va l’estona.',
    statsPrivacy: 'Amb un núvol configurat, el temps viatja amb el progrés de lectura: cada dispositiu apunta el seu i aquí se’n mostra la suma, així saps quant has trigat a llegir un llibre encara que l’hagis llegit a estones en cada aparell. Van al teu propi servidor WebDAV, amb els teus llibres, i no s’envien enlloc més. Sense núvol configurat es queden en aquest navegador. Només compta el temps amb el llibre al davant: mentre l’aplicació no és a la vista el rellotge s’atura, i els salts de posició no se sumen. De cada pàgina es compten com a màxim cinc minuts; passada aquesta estona la barra del peu avisa que està en pausa, i torna a comptar quan canvies de pàgina.',
    statsDelete: 'Esborrar les estadístiques',
    statsDeleteConfirm: 'Voleu esborrar les estadístiques de lectura? S’esborren a tots els teus dispositius: els que estiguin connectats ho faran tan bon punt sincronitzin. No afecta els llibres, la pàgina on ets ni les anotacions.',
    statsDeleted: '✓ Estadístiques esborrades. Els altres dispositius les esborraran en sincronitzar.',
    statsOptOut: 'No mesurar el temps de lectura',
    statsOptOutHelp: 'Deixa de comptar el temps, els dies seguits i l’estona dedicada a cada llibre. En activar-ho s’esborra el que hi hagi apuntat fins ara, que no es pot recuperar. Amb el núvol configurat, la decisió arriba també als altres dispositius: deixen de mesurar tan bon punt sincronitzen.',
    statsOptOutConfirm: 'Vols deixar de mesurar el temps de lectura?\n\nS’esborrarà tot el que s’ha apuntat fins ara —el temps, els dies seguits i l’estona de cada llibre— i no es podrà recuperar. Amb el núvol configurat, tant l’esborrat com la decisió de no mesurar arribaran als altres dispositius.',
    statsOffTitle: 'No s’està mesurant res',
    statsOff: 'Tens desactivat el recompte del temps de lectura. Pots tornar a activar-lo aquí sota, a «Aquestes dades»; es començarà a comptar de nou des de zero.',
    statsOffDone: '✓ S’ha deixat de mesurar i s’ha esborrat el que hi havia.',
    statsOnAgain: '✓ Es torna a mesurar, començant des de zero.',
    statsTotal: 'Temps total', statsToday: 'Avui', statsWeek: 'Darrers 7 dies',
    statsStreak: 'Dies seguits', statsAverage: 'Mitjana per dia llegit',
    statsActiveDays: 'Dies amb lectura', statsBestDay: 'Millor dia', statsPdfPages: 'Pàgines de PDF',
    statsBestStreak: 'la teva millor ratxa: {streak}', statsStreakNow: 'ratxa en marxa',
    statsNoStreak: 'avui o demà en comença una',
    statsDays: '{count} dies', statsDaysOne: '{count} dia', statsHours: '{h} h',
    statsChartLabel: 'Gràfic del temps llegit cadascun dels darrers {days} dies.',
    statsChartSummary: 'Has llegit {days} dels darrers 30, {total} en total.',
    statsGroupBy: 'Agrupa per',
    statsByDay: 'Dies', statsByWeek: 'Setmanes', statsByMonth: 'Mesos', statsByYear: 'Anys',
    statsLastWeeks: 'Les darreres 12 setmanes', statsLastMonths: 'Els darrers 12 mesos',
    statsLastYears: 'Els darrers 5 anys',
    statsCount_semana: '{count} setmanes', statsCount_semanaOne: '{count} setmana',
    statsCount_mes: '{count} mesos', statsCount_mesOne: '{count} mes',
    statsCount_anno: '{count} anys', statsCount_annoOne: '{count} any',
    statsChartSummaryPeriod: 'Has llegit en {count}, {total} en total.',
    statsWeekOf: 'Setmana del {date}',
    statsThisWeek: 'Aquesta setmana', statsThisMonth: 'Aquest mes', statsThisYear: 'Enguany',
    statsThisDay: 'Avui',
    statsPrevWeek: 'La setmana anterior', statsPrevMonth: 'El mes anterior',
    statsPrevYear: 'L’any anterior', statsPrevDay: 'Ahir',
    statsSoFar: 'a hores d’ara', statsUpToMonth: 'fins al {month}',
    statsMoreThanBefore: '{percent} % més', statsLessThanBefore: '{percent} % menys',
    statsSame: 'Igual', statsFirstTime: 'Comences', statsNoTime: 'Res',
    statsHistoryFrom: 'El detall per dies arriba fins al {date}.',
    statsChartEmpty: 'Encara no has llegit res en aquests 30 dies.',
    statsChartDay: '{date}: {time}', statsChartDayNone: '{date}: sense lectura',
    statsBooksTracked: 'Dels {count} més recents.',
    statsBookUntitled: 'Llibre sense títol',
    activityLog: 'Registre d’activitat',
    activityLogHelp: 'Deixa constància de si la posició de lectura arriba al servidor i dels errors que ho impedeixen. Serveix per esbrinar per què un llibre s’ha quedat enrere en un altre dispositiu. Es desa només aquí, no surt mai d’aquest aparell i s’esborra sol al cap d’una setmana.',
    viewLog: 'Veure el registre', clearLog: 'Buidar', copyLog: 'Copiar', downloadLog: 'Desar',
    logEmpty: 'Encara no hi ha res registrat.',
    logWithErrors: '{errores} error(s) registrats',
    logNoErrors: '{total} esdeveniments, cap amb error',
    logCopied: 'Registre copiat', logCopyFailed: 'No s’ha pogut copiar; fes servir «Desar»',
    logRecovered: 'ha pujat després de {intentos} intent(s) fallit(s)',
    logRetrying: 'reintentant (errors seguits: {intentos})',
    logOffline: 'sense connexió: s’espera a recuperar-la',
    logBackOnline: 'connexió recuperada', logWentOffline: 'connexió perduda',
    cloudScope: 'Llibres i progrés disponibles en tots els teus dispositius',
    localScope: 'Llibres desats únicament en aquest dispositiu',
    emptyLocalAction: 'Afegeix llibres només a aquest dispositiu',
    emptyLocalHelp: 'No se sincronitzaran. Selecciona fitxers PDF o EPUB, o arrossega’ls aquí.',
    webdavHelpHtml: 'Compatible amb Nextcloud, ownCloud i qualsevol servidor WebDAV. Els PDF de la carpeta indicada apareixeran a la biblioteca i la posició de lectura se sincronitzarà entre tots els dispositius. No saps què hi has de posar? <a href="#" id="enlace-ayuda-ajustes">Llegeix l’ajuda</a>.',
    passwordHelpHtml: '⚠️ A Nextcloud crea una <strong>contrasenya d’aplicació</strong> (Configuració → Seguretat); no facis servir la contrasenya principal. Perquè el navegador es pugui connectar, el servidor ha de permetre CORS: a Nextcloud instal·la <strong>WebAppPassword</strong> i afegeix el domini d’aquest lector. Les dades només es desen en aquest navegador.',
    transferHelp: 'Pots copiar un enllaç o desar un fitxer amb l’URL, l’usuari i la contrasenya d’aplicació, i obrir-lo en un altre dispositiu. ⚠️ L’enllaç i el fitxer permeten accedir al núvol: desa’ls en privat i elimina les còpies que ja no necessitis.',
    creditsHtml: 'Construït amb <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) i icones <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC).',
    dropLocal: 'Deixa anar aquí per desar en aquest dispositiu', dropCloud: 'Deixa anar aquí per pujar al núvol',
    unsupportedFiles: 'Només es poden afegir fitxers PDF o EPUB.',
    localDuplicate: 'Aquest llibre ja és en aquest dispositiu, desat com a «{title}».',
    noBooksInFolder: 'Aquesta carpeta no conté cap PDF ni EPUB.', localAddedOne: 'Llibre desat en aquest dispositiu.', localAddedMany: 'S’han desat {count} llibres en aquest dispositiu.',
    saveFailed: 'No s’ha pogut desar «{title}»: {error}',
    searchLibrary: 'Cerca a la biblioteca', clearSearch: 'Esborra la cerca', searchLibraryPlaceholder: 'Cerca per títol, autor…',
    showIndex: 'Mostra l’índex', hideIndex: 'Amaga l’índex',
    showThumbs: 'Mostra les miniatures', hideThumbs: 'Amaga les miniatures',
    showIndexThumbs: 'Mostra l’índex i les miniatures',
    hideIndexThumbs: 'Amaga l’índex i les miniatures',
    searchBook: 'Cerca dins del llibre', bookIndex: 'Índex del llibre', bookStart: 'Inici del llibre', historyNavigation: 'Historial de navegació', backPosition: 'Torna a la posició anterior', forwardPosition: 'Avança a la posició següent', pageAndHistory: 'Pàgina i historial de navegació', wordOrPhrase: 'Paraula o frase', search: 'Cerca', close: 'Tanca', zoomedImage: 'Imatge ampliada',
    searchingBook: 'S’està cercant al llibre…', searchProgress: 'S’està cercant… {done}/{total} · {count} resultats.', noSearchResults: 'No s’han trobat resultats.', searchResults: '{count} resultats.',
    chapter: 'Capítol', noLibraryResults: 'No hi ha llibres que coincideixin amb la cerca.',
    searchingFolders: 'S’està cercant també dins de les carpetes…', inFolder: 'A la carpeta «{name}»',
    bookmarks: 'Marcadors', bookmark: 'Marcador', addBookmark: 'Afegeix un marcador aquí',
    annotations: 'Anotacions', noAnnotations: 'Encara no hi ha anotacions.',
    highlightColor: 'Color del ressaltat', highlightYellow: 'Ressalta en groc',
    highlightGreen: 'Ressalta en verd', highlightBlue: 'Ressalta en blau', highlightPink: 'Ressalta en rosa',
    exportAnnotations: 'Exporta les anotacions (Markdown)', exportHeader: 'Anotacions de «{title}»',
    exportSource: 'Exportades de PageKeeper', annotationsExported: 'Anotacions exportades.',
    searchAnnotations: 'Cerca a les anotacions', noAnnotationResults: 'No hi ha anotacions que coincideixin.',
    selectionActions: 'Accions per al text seleccionat', highlight: 'Ressalta', addNote: 'Afegeix una nota',
    note: 'Nota', notePrompt: 'Nota sobre el text seleccionat:', editNote: 'Edita la nota', deleteAnnotation: 'Esborra l’anotació', deleteAnnotationConfirm: 'Vols esborrar aquesta anotació?', noteActions: 'Opcions de la nota',
    annotationAdded: 'S’ha desat l’anotació.', annotationDeleted: 'S’ha esborrat l’anotació.',
    bookmarkName: 'Nom del marcador', bookmarkNamePlaceholder: 'Nom del marcador (opcional)',
    bookmarkNamePrompt: 'Nom del marcador (deixa’l buit per eliminar-lo):', editBookmark: 'Canvia el nom del marcador',
    noBookmarks: 'Encara no hi ha marcadors.', bookmarkAdded: 'S’ha afegit el marcador.',
    bookmarkRenamed: 'S’ha actualitzat el nom del marcador.',
    bookmarkRemoved: 'S’ha esborrat el marcador.', bookmarkExists: 'Ja hi ha un marcador en aquesta posició.',
    deleteBookmark: 'Esborra el marcador',
    cloudRoot: 'Inici', currentFolder: 'Carpeta actual', targetFolder: 'Carpeta de destinació',
    newFolder: 'Crea una carpeta', folderNamePrompt: 'Nom de la carpeta nova:',
    invalidFolderName: 'El nom de la carpeta no és vàlid.',
    creatingFolder: 'S’està creant la carpeta «{name}»…', folderCreated: 'S’ha creat la carpeta «{name}».',
    renamingFolder: 'S’està canviant el nom de «{name}»…',
    openFolder: 'Obre la carpeta «{name}»',
    folderEmpty: 'Buida', folderItemsOne: '1 element', folderItems: '{count} elements',
    sectionFoldersOne: '1 carpeta', sectionFolders: '{count} carpetes',
    sectionBooksOne: '1 llibre', sectionBooks: '{count} llibres',
    deleteFolderConfirm: 'Vols esborrar la carpeta «{name}» i tot el seu contingut del núvol?',
    folderDeleted: 'S’ha esborrat la carpeta del núvol.', emptyFolder: 'Aquesta carpeta és buida.',
    deviceRoot: 'Inici', actionRenameFolder: 'Canvia el nom de la carpeta',
    actionSaveToDevice: 'Desa en aquest dispositiu',
    imagesInvertedOff: 'Torna el color a les imatges',
    imagesInvertedOn: 'Imatges amb el seu color: actiu. Prem per invertir-les amb la pàgina',
    library: 'Biblioteca', showContinueReading: 'Mostra «Continua llegint»',
    showContinueReadingHelp: 'El requadre amb les teves últimes lectures, damunt de la biblioteca. Si l’amagues, els llibres es queden on eren i conserven la pàgina.',
    openLastOnStart: 'Obre l’última lectura en iniciar PageKeeper',
    openLastOnStartHelp: 'En obrir l’aplicació vas directament al llibre que estaves llegint, sense passar per la biblioteca. Només es recorda en aquest dispositiu: a la resta continuaràs arribant a la biblioteca.',
    theme: 'Tema', themeAuto: 'El del sistema', themeLight: 'Clar', themeSepia: 'Sèpia',
    statsBookCard: 'Mira el temps de «{title}»',
    themeDark: 'Fosc', themeBlack: 'Negre',
    autoTheme: 'El tema del sistema',
    autoThemeHelp: 'Quan el tema és «el del sistema», l’aplicació s’aclareix o s’enfosqueix amb la resta del dispositiu. Aquí tries amb quin tema ho fa a cada costat. Els cinc temes segueixen a mà al botó de la capçalera; això només decideix a quin va «el del sistema».',
    autoThemeLight: 'Quan el sistema va en clar',
    autoThemeDark: 'Quan el sistema va en fosc',
    autoThemeNow: 'Ara mateix el teu sistema demana el tema {theme}, que és el que estàs veient.',
    autoThemeIdle: 'Tens el tema posat a mà en {theme}, així que això no canvia res de moment. Torna a «el del sistema» al botó de la capçalera perquè valgui.',
    actionMoveFolder: 'Mou la carpeta', moveFolderTo: 'Mou la carpeta «{name}»',
    folderMoved: 'S’ha mogut la carpeta «{name}».',
    savedToDevice: 'S’ha desat «{title}» en aquest dispositiu.',
    folderRenamePrompt: 'Nom nou de la carpeta:', folderRenamed: 'S’ha canviat el nom de la carpeta.',
    folderExists: 'Ja hi ha una carpeta amb aquest nom aquí.',
    deleteLocalFolderConfirm: 'Vols esborrar la carpeta «{name}» i tots els llibres que conté d’aquest dispositiu?',
    localFolderDeleted: 'S’ha esborrat la carpeta d’aquest dispositiu.',
    emptyLocalFolder: 'Aquesta carpeta encara no té llibres.',
    moveToDeviceFolder: 'Mou «{title}» a una altra carpeta del dispositiu',
    moveBook: 'Mou «{title}» a una altra carpeta', moveHere: 'Mou aquí',
    moving: 'S’està movent «{title}»…', bookMoved: 'S’ha mogut «{title}».', cancel: 'Cancel·la',
    loadingFolders: 'S’estan carregant les carpetes…', noSubfolders: 'No hi ha subcarpetes.',
    textSettings: 'Configuració del text', fontFamily: 'Tipus de lletra',
    bookFont: 'La del llibre', serifFont: 'Amb serifa', sansFont: 'Sense serifa',
    lineSpacing: 'Interlineat', bookSpacing: 'El del llibre', spacingCompact: 'Compacte',
    spacingNormal: 'Normal', spacingWide: 'Ampli', spacingWider: 'Molt ampli',
    hyphenation: 'Partir paraules', hyphenationAuto: 'Sí, al final de línia',
    hyphenationBook: 'Com el llibre', hyphenationNever: 'No partir',
    textAlignment: 'Alineació', bookAlignment: 'La del llibre',
    unjustifiedAlignment: 'Sense justificar',
    justifiedAlignment: 'Justificat',
    columnsSettings: 'Columnes', columnsAuto: 'Automàtiques',
    columnsOne: 'Una columna', columnsTwo: 'Dues columnes',
    columnsThree: 'Tres columnes', columnsFour: 'Quatre columnes',
    columnsSettingsHelp: 'En quantes columnes es reparteix el text a la pantalla. En automàtic hi caben les que hi càpiguen sense que les línies es facin incòmodes, i canvien soles en girar l’aparell o en tocar la mida de la lletra. Amb un llibre obert, el botó de les columnes canvia el d’aquell llibre; això d’aquí és amb què comencen els altres. Això no viatja als altres dispositius: cada pantalla és un món.',
    lineLength: 'Línies de com a màxim', lineLengthValue: '{value} lletres',
    moreColumns: 'Més columnes', fewerColumns: 'Menys columnes',
    lineLengthHelp: 'Només compta en automàtic: s’obre una altra columna tan bon punt el text dona perquè cap no passi d’aquest llarg. Amb línies curtes apareixen abans; amb línies llargues, més tard.',
  },
  en: {
    appTagline: 'E-book reader',
    appVersion: 'PageKeeper {version}',
    // Imprimir el EPUB en papel o en PDF.
    printBook: 'Print or save as PDF',
    printHelp: 'Your browser’s print dialog will open, where you can pick a printer or “Save as PDF”.',
    printPaper: 'Paper',
    printPaperLetter: 'Letter',
    printMargins: 'Margins',
    printMarginNarrow: 'Narrow',
    printMarginNormal: 'Normal',
    printMarginWide: 'Wide',
    printFont: 'Text size',
    printFontSmall: 'Small',
    printFontNormal: 'Normal',
    printFontLarge: 'Large',
    printAnnotations: 'Include highlights and notes',
    selectAll: 'All',
    selectNone: 'None',
    print: 'Print',
    printChapterNumber: 'Chapter {number}',
    printNoChapters: 'No chapters',
    printWholeBook: 'The whole book',
    printSomeChapters: '{count} of {total} chapters',
    printPreparing: 'Preparing the document… {done} of {total}',
    printNotesHeading: 'Notes',
    printFallbackTitle: 'Book',
    printChapterFailed: 'Could not lay out the chapter “{title}”.',
    printFailed: 'The document could not be prepared for printing.',
    language: 'Language', help: 'Help', settings: 'Settings', back: 'Back', cloud: 'In the cloud',
    device: 'On this device', addLocal: 'Add a book (PDF or EPUB) from this device',
    addCloud: 'Upload a book (PDF or EPUB) to the cloud', reload: 'Reload',
    addLocalFolder: 'Add a whole folder from this device',
    addCloudFolder: 'Upload a whole folder to the cloud',
    backLibrary: 'Back to library', saveCloud: 'Save to my cloud', zoom: 'Zoom', zoomOut: 'Zoom out', autoWidth: 'Fit to width', fitPage: 'Fit full page', cropMargins: 'Crop margins', skipToContent: 'Skip to content', bookIndexShort: 'Contents', thumbnails: 'Thumbnails', resizePanel: 'Resize the panel', bookNavigation: 'Book navigation', pageThumbnails: 'Page thumbnails', noMarginsToCrop: 'This book has no margins to crop.', zoomIn: 'Zoom in',
    zoomLevel: 'Zoom:', zoomChange: 'Tap to change it',
    zoomSettings: 'Choose the zoom level', customZoom: 'Other', apply: 'Apply',
    moreReaderActions: 'More actions', readerActions: 'Reading actions',
    previous: 'Previous page', next: 'Next page', goPage: 'Go to a page',
    marginSide: 'Side margin', noMargin: 'No margin', moreMargin: 'More margin',
    zoomHelp: 'Saved for this book only.',
    marginHelp: 'The text reflows as you move the control. The margin belongs to this book.', reset: 'Reset',
    webdavFolder: 'WebDAV folder URL', user: 'Username', appPassword: 'App password',
    webdav: 'Cloud (WebDAV)', transferConfig: 'Move configuration to another device',
    webdavShort: 'Cloud', settingsData: 'Data', settingsSections: 'Settings sections',
    epubTextSettings: 'EPUB text',
    epubTextSettingsHelp: 'How the text of EPUB books is laid out (PDFs arrive already typeset and do not take these changes). The same settings are at hand while you read, under the font button. Here you set where every new book starts: the margin and alignment you change with a book open belong to that book alone.',
    resetTextSettings: 'Reset the text',
    importExport: 'Import and export', addBooks: 'Add books',
    addBooksHelp: 'Add PDF or EPUB books to the device or upload them to the cloud folder currently open.',
    addToDevice: 'Add to device', uploadToCloud: 'Upload to cloud',
    addFolderToDevice: 'Add a folder to the device', uploadFolderToCloud: 'Upload a folder to the cloud',
    localBackup: 'Library on this device',
    localBackupHelp: 'Saves the books under “On this device”, their progress, bookmarks, annotations and preferences in a ZIP. Cloud configuration and password are not included; you can save them separately under Settings.',
    exportLocalBackup: 'Create backup', restoreLocalBackup: 'Restore to device',
    creatingBackup: 'Creating backup…', restoringBackup: 'Restoring backup…',
    noLocalBooksBackup: 'There are no local books to back up.',
    backupCreated: 'Backup created successfully ({count} books).',
    backupRestored: 'Backup restored successfully ({count} books).',
    backupFailed: 'Could not create the backup: {error}', restoreFailed: 'Could not restore the backup: {error}',
    invalidBackup: 'This file is not a valid PageKeeper backup.',
    wrongLocalBackup: 'This is a cloud backup, not a device backup.',
    restoreBackupConfirm: 'Restore this backup? Books with the same identifier and their local data will be replaced; all others will be kept.',
    pdfPasswordTitle: 'Protected PDF', pdfPasswordHelp: 'Enter the password to open this PDF. It will not be saved.',
    pdfPassword: 'PDF password', pdfPasswordIncorrect: 'The password is incorrect.',
    pdfNoTextTitle: 'PDF without selectable text',
    pdfNoTextBadge: 'NO TEXT',
    pdfNoTextHelp: 'This document appears to be scanned. Search, text selection and read-aloud will not work correctly.',
    pdfNoTextStep1: 'Download the PDF from the book menu.',
    pdfNoTextStep2: 'Open it in Scribe OCR and generate a PDF copy with text.',
    pdfNoTextStep3: 'Download that copy and upload it back to PageKeeper.',
    pdfNoTextPrivacy: 'PageKeeper will not send the document: you must select it yourself in the external tool.',
    openScribeOcr: 'Open Scribe OCR', understood: 'Got it',
    open: 'Open', openFailed: 'Could not open the book: {error}',
    cloudBackup: 'Cloud library',
    cloudBackupHelp: 'Saves every PDF and EPUB in the WebDAV folder and its subfolders, together with progress, bookmarks and annotations, in a ZIP.',
    exportCloudBackup: 'Create cloud backup', restoreCloudBackup: 'Restore to cloud',
    cloudBackupNeedsConfig: 'Set up WebDAV cloud storage under Settings first.',
    readingCloudLibrary: 'Reading the cloud library…',
    noCloudBooksBackup: 'There are no cloud books to back up.',
    backingUpCloudBook: 'Backing up {current} of {total}: “{title}”…',
    cloudBackupCreated: 'Cloud backup created successfully ({count} books).',
    restoreCloudConfirm: 'Restore this backup to the configured cloud? Its subfolders will be created and books at the same paths will be overwritten.',
    restoringCloudBackup: 'Preparing cloud restore…',
    restoringCloudBook: 'Uploading {current} of {total}: “{title}”…',
    cloudBackupRestored: 'Backup restored to the cloud ({count} books).',
    wrongCloudBackup: 'This is a device backup, not a cloud backup.',
    testConnection: 'Test connection', save: 'Save', deleteConfig: 'Delete configuration',
    copyConfig: 'Copy configuration link', exportConfigFile: 'Save configuration',
    importConfigFile: 'Restore configuration', configFileSaved: '✓ Configuration saved to a file.',
    invalidConfigFile: 'The file does not contain a valid PageKeeper configuration.',
    credits: 'Credits', license: 'MIT License', source: 'Source code',
    privacy: 'Privacy',
    analyticsNotice: 'This application only collects aggregated usage statistics with a self-hosted system, in order to understand how it is used and improve the tool. No IP addresses are stored and no analytics cookies are used for visitors.',
    continueReading: 'Continue reading', recentCount: 'How many reads to show', recentAuto: 'As many as fit', recentN: '{count} reads',
    recentCountHelp: '“As many as fit” shows three or four depending on the screen width. The rest stay one tap away, under “Show more”.', removeContinue: 'Remove “Continue reading” from the library', continueRemoved: '“Continue reading” has been removed. You can show it again in Settings → Library.', continueReadingHelp: 'Your latest read, with the others one tap away',
    devices: 'Connected devices',
    devicesHelp: 'The browsers using this library, with the last time they synced. If you see one you do not recognise, change your app password.',
    devicesRevokeHelp: '⚠️ “Disconnect” asks the device to forget the cloud settings and ask for them again, and it only takes effect the next time PageKeeper is opened there. It does not revoke access to the server: for that, delete the app password in your cloud.',
    devicesNone: 'No device has connected yet.',
    deviceThisOne: 'this device', deviceUnknown: 'Unnamed device',
    deviceAuto: '{browser} on {system}', deviceCode: 'code {code}',
    deviceLastSeen: 'last seen: {when}', deviceNeverSeen: 'no data',
    deviceToday: 'today', deviceYesterday: 'yesterday', deviceDaysAgo: '{count} days ago',
    deviceRevokedPending: 'disconnected, waiting for it to open',
    deviceRevoked: 'disconnected',
    deviceRename: 'Rename', deviceRenamePrompt: 'Name for this device',
    deviceDisconnect: 'Disconnect',
    deviceDisconnectConfirm: 'Disconnect “{name}”? The next time PageKeeper opens there, it will forget the cloud settings and ask for them again. Access to the server is not revoked: for that, delete the app password in your cloud.',
    deviceDisconnected: 'Disconnection requested. It will take effect the next time PageKeeper is opened on that device.',
    deviceWasDisconnected: 'This device was disconnected from another one: enter your cloud details again to keep syncing.',
    cleanup: 'Books that are no longer there',
    cleanupHelp: 'When a book disappears from the cloud, its reading position, bookmarks and notes stay here. It is first noted as missing and only later are they deleted, in case the book was out of reach for a while.',
    cleanupDays: 'How long to wait before deleting them',
    cleanupNever: 'Never delete them',
    cleanupDays7: 'One week', cleanupDays15: 'Fifteen days', cleanupDays30: 'One month',
    cleanupDays60: 'Two months', cleanupDays90: 'Three months',
    cleanupDaysHelp: 'This waiting time is shared with your other devices, so they all delete on the same day.',
    cleanupCheck: 'Check the cloud', cleanupNow: 'Delete now',
    cleanupChecking: 'Checking what is in the cloud…',
    cleanupNoCloud: 'No cloud set up. Books on this device are cleaned up as soon as you delete them, with no waiting.',
    cleanupUnchecked: 'The cloud has not been checked yet in this session.',
    cleanupClean: 'All tidy: {count} items in the cloud and no reading marks waiting to be deleted.',
    cleanupCleanOne: 'All tidy: 1 item in the cloud and no reading marks waiting to be deleted.',
    cleanupMissingOne: '1 book is missing; its reading mark is still stored:',
    cleanupSideFilesOne: 'There is also 1 annotation file without its book.',
    cleanupConfirmOne: 'Delete now the reading position, bookmarks and notes of 1 book that is no longer there? This cannot be undone.',
    cleanupDoneOne: 'Cleaned up 1 book that was no longer there.',
    cleanupMissing: '{count} books are missing; their reading marks are still stored:',
    cleanupMissingOn: '{name} — will be deleted on {date}',
    cleanupMissingNever: '{name} — will not be deleted (you chose never to delete)',
    cleanupSideFiles: 'There are also {count} annotation files without their book.',
    cleanupConfirm: 'Delete now the reading position, bookmarks and notes of {count} books that are no longer there? This cannot be undone.',
    cleanupDone: 'Cleaned up {count} books that were no longer there.',
    cleanupNothing: 'Nothing to delete: the books are back.',
    showMoreRecent: 'Show {count} more', showFewerRecent: 'Show less',
    removeFromContinue: 'Remove “{title}” from Continue reading',
    filterBy: 'Show', filterAll: 'All', filterReading: 'Reading', filterPending: 'Pending', filterFinished: 'Finished',
    sortBy: 'Sort by', sortRecent: 'Recently read', sortTitle: 'Title', sortAuthor: 'Author', sortProgress: 'Progress',
    rating: 'Rating', ratingNone: 'Not rated', ratingOf: '{n} of {max} stars',
    openedWithoutSync: 'Could not check whether you had read further on another device: opening where you left off here.',
    positionFromOtherDevice: 'Restored the position you left on another device.',
    remotePositionAskEpub: 'Another device got to {remoto}% and you are at {local}%. Go there?',
    remotePositionAskPdf: 'Another device got to page {remoto} of {paginas} and you are on page {local}. Go there?',
    remotePositionGo: 'Go there',
    remotePositionStay: 'Stay here',
    remotePositionStayed: 'Keeping this device\'s position.',
    bookNoteRating: 'Note and rating',
    ratingHint: 'Tap the marked star to clear the rating',
    sortRating: 'Rating', filterRated4: '4 stars or more', filterRated3: '3 stars or more', filterUnrated: 'Not rated',
    filterGroupStatus: 'Reading', filterGroupRating: 'Rating',
    viewLabel: 'View', viewList: 'List view', viewGrid: 'Grid view',
    toggleSection: 'Collapse or expand the section',
    markFinished: 'Mark “{title}” as finished', markUnfinished: 'Remove the “Finished” label from “{title}”', finished: 'Finished',
    sampleBookHeading: 'Start with a sample book', sampleBookHelp: 'Your library is empty. Add one of these samples to try PageKeeper:',
    loadingSampleBook: 'Preparing the sample book…',
    loadingLibrary: 'Loading library…', noCloudBooks: 'There are no synced books yet. Use the upload button to add the first one.',
    notStarted: 'not started', read: 'read', page: 'Page', of: 'of',
    bookActions: 'Actions for “{title}”',
    actionUpload: 'Upload to the cloud', actionMove: 'Move to another folder', actionDownload: 'Download',
    actionOffline: 'Available offline', actionRemoveOffline: 'Remove offline copy',
    actionUpdateOffline: 'Update offline copy', actionDelete: 'Delete',
    actionBookNote: 'Book note', bookNote: 'Book note', bookNoteLabel: 'Your note about this book',
    bookNotePlaceholder: 'What it is about, where you left it, what you want to remember…',
    actionFolderNote: 'Folder note', folderNote: 'Folder note',
    folderNotePlaceholder: 'What you keep here and what for…',
    noFolderNote: 'No note about this folder yet.',
    editBookNote: 'Write the book note', noBookNote: 'No note about this book yet.',
    actionRename: 'Rename',
    actionMarkFinished: 'Mark as finished', actionMarkUnfinished: 'Remove “Finished”',
    renameBookPrompt: 'Name to show in the library (leave empty to use the file name):',
    actionDeleteFolder: 'Delete folder',
    actionDownloadFolderZip: 'Download folder (ZIP)',
    actionSaveFolderToDisk: 'Save folder to your computer',
    packingFolder: 'Preparing the folder…',
    packingFolderItem: '“{title}” ({current} of {total})',
    folderDownloadedOne: 'Folder “{name}” saved: 1 book.',
    folderDownloadedMany: 'Folder “{name}” saved: {count} books.',
    folderHasNoBooks: 'That folder has no books to download.',
    folderDownloadedPartial: 'Folder “{name}” saved. Not included: {failed} of {total}.',
    folderDownloadFailed: 'No book from that folder could be retrieved.',
    bookGone: 'the book is no longer in this device’s storage',
    removeOfflineConfirm: 'Remove the offline copy of “{title}”? The cloud book will not be deleted.',
    savingOffline: 'Saving “{title}” for offline reading…', offlineSaved: '“{title}” is now available offline ({size} MB).',
    offlineRemoved: 'Offline copy removed. The book remains in the cloud.', availableOffline: 'OFFLINE', offlineOutdated: 'UPDATE',
    offlineLibrary: 'Offline: showing copies saved on this device.',
    offlineFolderEmpty: 'There are no offline copies in this folder.', openedOfflineCopy: 'Opened from the offline copy.',
    offlineUpdateFailed: 'The book opened, but its offline copy could not be updated.',
    storageFull: 'There is not enough space to save “{title}” offline.',
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
    replaceConfigConfirm: 'The imported configuration will replace the current cloud configuration. Continue?',
    epubMargin: '{value} % on each side', pageMode: 'View one page at a time (like a book)', scrollMode: 'View continuous pages (scroll)',
    twoPages: 'Show two pages side by side', onePage: 'Show a single page', rotatePage: 'Rotate the page',
    readAloud: 'Read aloud', ttsPlay: 'Read from here', ttsPause: 'Pause', ttsResume: 'Resume',
    ttsStop: 'Stop', ttsVoice: 'Voice', ttsAutoVoice: 'Automatic', ttsSpeed: 'Speed',
    ttsHelp: 'Starts on the current page, highlights the sentence being read and turns pages by itself.',
    ttsNoSupport: 'This browser does not support read-aloud.',
    ttsNoText: 'No readable text was found (it may be a scanned document).',
    immersive: 'Read full screen', immersiveExit: 'Exit full screen',
    timeLeft: 'Estimated reading time left', timeLeftMenu: 'Time left: {time}',
    reader: 'Reader', readerScreen: 'On screen', showStatusBar: 'Show the status bar at the bottom',
    showStatusBarHelp: 'The line at the bottom of the reader with the page within the chapter, the screen of the book, the percentage read and the time left. Hiding it gives that bit of height back to the text.',
    statusChapter: '{page} / {total} in ch.', statusChapterTitle: 'Screen within the chapter',
    statusScreens: 'Scr. {page} of ~{total}',
    statusScreensTitle: 'Screens the book takes on this device, with the current text size and margin. It is an estimate and changes when you adjust them.',
    statusPage: 'Page {page} of {total}', statusPageTitle: 'Page of the document',
    statusRead: '{percent} % read', statusReadTitle: 'How much of the book you have read',
    timeLessMinute: '< 1 m', timeMinutes: '{m} m', timeHoursMinutes: '{h} h {m} m', goPercent: 'Go to book percentage (0–100):', goToPage: 'Go to page (1–{total}):',
    sampleNoticeHtml: '<h2>Two books to get you started</h2><span>Your library comes with two sample books so you can try PageKeeper right away. They are yours to keep: read them, leave them where they are, or delete them at any time from each book’s actions menu.</span>',
    dontShowAgain: 'Don’t show again',
    noConfigHtml: '<span>No server is configured. You can open a book (PDF or EPUB) from this device, or <a href="#" id="enlace-configurar">set up your cloud (Nextcloud or another WebDAV server)</a> to sync your reading position between devices.</span><p class="ayuda">Not sure what this is or what you need? <a href="#" id="enlace-ayuda-aviso">Read the help</a>.</p>',
    syncError: 'Sync error', syncFailed: 'Could not sync reading progress: {error}',
    syncRecovered: 'Your position is now saved to the cloud',
    stats: 'Reading statistics', statsView: 'View the statistics',
    statsSettingsHelp: 'How much time you spend reading, how many days in a row you have kept it up, and the books that take the most of your time, adding up all your devices.',
    statsSummary: 'Your reading', statsLastDays: 'The last 30 days',
    actionBookStats: 'Reading time',
    statusTimeSpentTitle: 'How long you have been reading this book. Tap to see the details.',
    statusPaused: 'Paused',
    statusPausedTitle: 'Time spent is not adding up: you have been on the same page for over five minutes. It starts counting again as soon as you turn the page.',
    statsBookTime: 'Time spent', statsBookRead: 'Read', statsBookPace: 'Pace',
    statsPacePerPage: '{time} per page', statsPaceSeconds: '{s} s per page',
    statsBookByDevice: 'On each device',
    statsHideFromList: 'Hide from the list',
    statsShowInList: 'Show in the list again',
    statsHideNote: 'It stops appearing in “Where your time goes”. Nothing is deleted: it comes back to the list as soon as you read it again for a while.',
    statsHiddenNote: 'It is no longer in “Where your time goes”. It will come back on its own as soon as you read it again for a while.',
    statsBookEmpty: 'No time recorded for this book yet. As soon as you read for a few minutes with it open, this is where you will see how long you have spent on it.',
    statsShared: 'Adding up all your devices: what you read on the phone and on the computer counts together, and a day you read on both is a single day.',
    statsTopBooks: 'Where the time goes',
    statsSortBy: 'Sort by', statsSortTime: 'Time spent',
    statsSortRecent: 'Last read', statsSortTitle: 'Title',
    statsLastRead: 'read on {date}', statsBookGone: 'no longer in the library', statsDataTitle: 'About this data',
    statsEmptyTitle: 'Nothing to show yet',
    statsEmpty: 'As soon as you read for a few minutes with a book open, this page will show the time you spent, how many days in a row you have been reading, and which books take up your time.',
    statsPrivacy: 'With cloud storage set up, reading time travels along with your reading position: each device records its own and the total is shown here, so you know how long a book took you even if you read it in bits on each device. It lives in your own WebDAV server, next to your books, and is never sent anywhere else. Without cloud storage it stays in this browser. Only time with the book in front of you counts: while the app is out of sight the clock stops, and jumps to another position are not added. Each page counts for at most five minutes; past that the footer bar says it is paused, and it counts again as soon as you turn the page.',
    statsDelete: 'Delete the statistics',
    statsDeleteConfirm: 'Delete the reading statistics? They are deleted on all your devices: any that are connected will do so as soon as they sync. Your books, your reading position and your annotations are not affected.',
    statsDeleted: '✓ Statistics deleted. Your other devices will delete them when they sync.',
    statsOptOut: 'Do not measure reading time',
    statsOptOutHelp: 'Stops counting time, streaks and how long you spend on each book. Turning it on deletes whatever has been recorded so far, and that cannot be undone. With cloud storage set up, the decision reaches your other devices too: they stop measuring as soon as they sync.',
    statsOptOutConfirm: 'Stop measuring reading time?\n\nEverything recorded so far —time, streaks and the time spent on each book— will be deleted and cannot be recovered. With the cloud set up, both the deletion and the decision to stop measuring will reach your other devices.',
    statsOffTitle: 'Nothing is being measured',
    statsOff: 'Reading-time tracking is turned off. You can turn it back on below, under “This data”; counting will start again from zero.',
    statsOffDone: '✓ Tracking stopped and the existing data deleted.',
    statsOnAgain: '✓ Tracking is on again, starting from zero.',
    statsTotal: 'Total time', statsToday: 'Today', statsWeek: 'Last 7 days',
    statsStreak: 'Days in a row', statsAverage: 'Average per day read',
    statsActiveDays: 'Days with reading', statsBestDay: 'Best day', statsPdfPages: 'PDF pages',
    statsBestStreak: 'your best streak: {streak}', statsStreakNow: 'streak going',
    statsNoStreak: 'today or tomorrow starts one',
    statsDays: '{count} days', statsDaysOne: '{count} day', statsHours: '{h} h',
    statsChartLabel: 'Chart of the time read on each of the last {days} days.',
    statsChartSummary: 'You read on {days} of the last 30, {total} in total.',
    statsGroupBy: 'Group by',
    statsByDay: 'Days', statsByWeek: 'Weeks', statsByMonth: 'Months', statsByYear: 'Years',
    statsLastWeeks: 'The last 12 weeks', statsLastMonths: 'The last 12 months',
    statsLastYears: 'The last 5 years',
    statsCount_semana: '{count} weeks', statsCount_semanaOne: '{count} week',
    statsCount_mes: '{count} months', statsCount_mesOne: '{count} month',
    statsCount_anno: '{count} years', statsCount_annoOne: '{count} year',
    statsChartSummaryPeriod: 'You read in {count}, {total} in total.',
    statsWeekOf: 'Week of {date}',
    statsThisWeek: 'This week', statsThisMonth: 'This month', statsThisYear: 'This year',
    statsThisDay: 'Today',
    statsPrevWeek: 'Previous week', statsPrevMonth: 'Previous month',
    statsPrevYear: 'Previous year', statsPrevDay: 'Yesterday',
    statsSoFar: 'so far', statsUpToMonth: 'up to {month}',
    statsMoreThanBefore: '{percent}% more', statsLessThanBefore: '{percent}% less',
    statsSame: 'The same', statsFirstTime: 'Just started', statsNoTime: 'Nothing',
    statsHistoryFrom: 'The day-by-day detail goes back to {date}.',
    statsChartEmpty: 'You have not read anything in these 30 days yet.',
    statsChartDay: '{date}: {time}', statsChartDayNone: '{date}: no reading',
    statsBooksTracked: 'Of the {count} most recent ones.',
    statsBookUntitled: 'Untitled book',
    activityLog: 'Activity log',
    activityLogHelp: 'Records whether your reading position reaches the server, and the errors that stop it. Useful for finding out why a book lagged behind on another device. Stored here only; it never leaves this device, and clears itself after a week.',
    viewLog: 'View the log', clearLog: 'Clear', copyLog: 'Copy', downloadLog: 'Save',
    logEmpty: 'Nothing recorded yet.',
    logWithErrors: '{errores} error(s) recorded',
    logNoErrors: '{total} events, none with errors',
    logCopied: 'Log copied', logCopyFailed: 'Could not copy; use “Save”',
    logRecovered: 'uploaded after {intentos} failed attempt(s)',
    logRetrying: 'retrying (consecutive failures: {intentos})',
    logOffline: 'offline: waiting for the connection',
    logBackOnline: 'connection restored', logWentOffline: 'connection lost',
    cloudScope: 'Books and reading progress available on all your devices',
    localScope: 'Books stored only on this device',
    emptyLocalAction: 'Add books only to this device',
    emptyLocalHelp: 'They will not sync. Select PDF or EPUB files, or drag them here.',
    webdavHelpHtml: 'Compatible with Nextcloud, ownCloud and any WebDAV server. PDFs in the chosen folder will appear in your library and reading position will sync across all your devices. Not sure what to enter? <a href="#" id="enlace-ayuda-ajustes">Read the help</a>.',
    passwordHelpHtml: '⚠️ In Nextcloud, create an <strong>app password</strong> (Settings → Security); do not use your main password. The server must also allow CORS so the browser can connect: in Nextcloud, install <strong>WebAppPassword</strong> and add this reader’s domain. Data is stored only in this browser.',
    transferHelp: 'You can copy a link or save a file containing the URL, username and app password, then open it on another device. ⚠️ The link and file provide access to your cloud: keep them private and delete copies you no longer need.',
    creditsHtml: 'Built with <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0), and <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> icons (ISC).',
    dropLocal: 'Drop here to save on this device', dropCloud: 'Drop here to upload to the cloud',
    unsupportedFiles: 'Only PDF or EPUB files can be added.',
    localDuplicate: 'That book is already on this device, saved as “{title}”.',
    noBooksInFolder: 'That folder has no PDF or EPUB files in it.', localAddedOne: 'Book saved on this device.', localAddedMany: '{count} books saved on this device.',
    saveFailed: 'Could not save “{title}”: {error}',
    searchLibrary: 'Search library', clearSearch: 'Clear search', searchLibraryPlaceholder: 'Search by title, author…',
    showIndex: 'Show table of contents', hideIndex: 'Hide table of contents',
    showThumbs: 'Show page thumbnails', hideThumbs: 'Hide page thumbnails',
    showIndexThumbs: 'Show contents and thumbnails',
    hideIndexThumbs: 'Hide contents and thumbnails',
    searchBook: 'Search inside the book', bookIndex: 'Table of contents', bookStart: 'Start of book', historyNavigation: 'Navigation history', backPosition: 'Back to previous position', forwardPosition: 'Forward to next position', pageAndHistory: 'Page and navigation history', wordOrPhrase: 'Word or phrase', search: 'Search', close: 'Close', zoomedImage: 'Enlarged image',
    searchingBook: 'Searching the book…', searchProgress: 'Searching… {done}/{total} · {count} results.', noSearchResults: 'No results found.', searchResults: '{count} results.',
    chapter: 'Chapter', noLibraryResults: 'No books match your search.',
    searchingFolders: 'Also searching inside folders…', inFolder: 'In the folder “{name}”',
    bookmarks: 'Bookmarks', bookmark: 'Bookmark', addBookmark: 'Add a bookmark here',
    annotations: 'Annotations', noAnnotations: 'No annotations yet.',
    highlightColor: 'Highlight colour', highlightYellow: 'Highlight in yellow',
    highlightGreen: 'Highlight in green', highlightBlue: 'Highlight in blue', highlightPink: 'Highlight in pink',
    exportAnnotations: 'Export annotations (Markdown)', exportHeader: 'Annotations from “{title}”',
    exportSource: 'Exported from PageKeeper', annotationsExported: 'Annotations exported.',
    searchAnnotations: 'Search annotations', noAnnotationResults: 'No matching annotations.',
    selectionActions: 'Actions for selected text', highlight: 'Highlight', addNote: 'Add note',
    note: 'Note', notePrompt: 'Note about the selected text:', editNote: 'Edit note', deleteAnnotation: 'Delete annotation', deleteAnnotationConfirm: 'Delete this annotation?', noteActions: 'Note options',
    annotationAdded: 'Annotation saved.', annotationDeleted: 'Annotation deleted.',
    bookmarkName: 'Bookmark name', bookmarkNamePlaceholder: 'Bookmark name (optional)',
    bookmarkNamePrompt: 'Bookmark name (leave blank to remove it):', editBookmark: 'Change bookmark name',
    noBookmarks: 'No bookmarks yet.', bookmarkAdded: 'Bookmark added.',
    bookmarkRenamed: 'Bookmark name updated.',
    bookmarkRemoved: 'Bookmark deleted.', bookmarkExists: 'There is already a bookmark at this position.',
    deleteBookmark: 'Delete bookmark',
    cloudRoot: 'Home', currentFolder: 'Current folder', targetFolder: 'Destination folder',
    newFolder: 'Create a folder', folderNamePrompt: 'Name for the new folder:',
    invalidFolderName: 'The folder name is not valid.',
    creatingFolder: 'Creating folder “{name}”…', folderCreated: 'Folder “{name}” created.',
    renamingFolder: 'Renaming “{name}”…',
    openFolder: 'Open the folder “{name}”',
    folderEmpty: 'Empty', folderItemsOne: '1 item', folderItems: '{count} items',
    sectionFoldersOne: '1 folder', sectionFolders: '{count} folders',
    sectionBooksOne: '1 book', sectionBooks: '{count} books',
    deleteFolderConfirm: 'Delete the folder “{name}” and all its contents from your cloud?',
    folderDeleted: 'Folder deleted from the cloud.', emptyFolder: 'This folder is empty.',
    deviceRoot: 'Home', actionRenameFolder: 'Rename folder',
    actionSaveToDevice: 'Save to this device',
    imagesInvertedOff: 'Keep images in their own colours',
    imagesInvertedOn: 'Images in their own colours: on. Tap to invert them with the page',
    library: 'Library', showContinueReading: 'Show “Continue reading”',
    showContinueReadingHelp: 'The box with your latest reads, above the library. Hiding it leaves the books where they were, with their page intact.',
    openLastOnStart: 'Open my latest read when PageKeeper starts',
    openLastOnStartHelp: 'Opening the app takes you straight to the book you were reading, skipping the library. It is remembered only on this device: elsewhere you will still land in the library.',
    theme: 'Theme', themeAuto: 'Match the system', themeLight: 'Light', themeSepia: 'Sepia',
    statsBookCard: 'See the time spent on “{title}”',
    themeDark: 'Dark', themeBlack: 'Black',
    autoTheme: 'The system theme',
    autoThemeHelp: 'When the theme is set to match the system, the app lightens or darkens along with the rest of the device. Here you choose which theme it uses on each side. All five themes stay one tap away in the header button; this only decides where “match the system” lands.',
    autoThemeLight: 'When the system is light',
    autoThemeDark: 'When the system is dark',
    autoThemeNow: 'Right now your system asks for the {theme} theme, which is what you are seeing.',
    autoThemeIdle: 'You have the theme set by hand to {theme}, so this changes nothing for now. Go back to “match the system” in the header button for it to take effect.',
    actionMoveFolder: 'Move folder', moveFolderTo: 'Move the folder “{name}”',
    folderMoved: 'Folder “{name}” moved.',
    savedToDevice: '“{title}” saved to this device.',
    folderRenamePrompt: 'New folder name:', folderRenamed: 'Folder renamed.',
    folderExists: 'There is already a folder with that name here.',
    deleteLocalFolderConfirm: 'Delete the folder “{name}” and every book in it from this device?',
    localFolderDeleted: 'Folder deleted from this device.',
    emptyLocalFolder: 'This folder has no books yet.',
    moveToDeviceFolder: 'Move “{title}” to another folder on this device',
    moveBook: 'Move “{title}” to another folder', moveHere: 'Move here',
    moving: 'Moving “{title}”…', bookMoved: '“{title}” moved.', cancel: 'Cancel',
    loadingFolders: 'Loading folders…', noSubfolders: 'No subfolders.',
    textSettings: 'Text settings', fontFamily: 'Font',
    bookFont: 'Book font', serifFont: 'Serif', sansFont: 'Sans serif',
    lineSpacing: 'Line spacing', bookSpacing: 'Book spacing', spacingCompact: 'Compact',
    spacingNormal: 'Normal', spacingWide: 'Wide', spacingWider: 'Extra wide',
    hyphenation: 'Hyphenation', hyphenationAuto: 'Yes, break at line end',
    hyphenationBook: 'As in the book', hyphenationNever: 'Never break',
    textAlignment: 'Alignment', bookAlignment: 'Book alignment',
    unjustifiedAlignment: 'Unjustified',
    justifiedAlignment: 'Justified',
    columnsSettings: 'Columns', columnsAuto: 'Automatic',
    columnsOne: 'One column', columnsTwo: 'Two columns',
    columnsThree: 'Three columns', columnsFour: 'Four columns',
    columnsSettingsHelp: 'How many columns the text is split into on screen. On automatic, as many fit as can without the lines becoming awkward, and they change by themselves when you turn the device or resize the text. With a book open, the columns button changes that book alone; this is where every other book starts. It does not travel to your other devices: every screen is its own case.',
    lineLength: 'Lines of at most', lineLengthValue: '{value} letters',
    moreColumns: 'More columns', fewerColumns: 'Fewer columns',
    lineLengthHelp: 'Only applies on automatic: another column opens as soon as the text allows without any of them going past that length. Short lines bring columns sooner; long lines, later.',
  },
  fr: {
    appTagline: 'Liseuse de livres électroniques',
    appVersion: 'PageKeeper {version}',
    // Imprimir el EPUB en papel o en PDF.
    printBook: 'Imprimer ou enregistrer en PDF',
    printHelp: 'La boîte de dialogue d’impression du navigateur s’ouvrira : vous pourrez y choisir l’imprimante ou « Enregistrer au format PDF ».',
    printPaper: 'Papier',
    printPaperLetter: 'Letter',
    printMargins: 'Marges',
    printMarginNarrow: 'Étroites',
    printMarginNormal: 'Normales',
    printMarginWide: 'Larges',
    printFont: 'Taille du texte',
    printFontSmall: 'Petite',
    printFontNormal: 'Normale',
    printFontLarge: 'Grande',
    printAnnotations: 'Inclure les surlignages et les notes',
    selectAll: 'Tous',
    selectNone: 'Aucun',
    print: 'Imprimer',
    printChapterNumber: 'Chapitre {number}',
    printNoChapters: 'Aucun chapitre',
    printWholeBook: 'Tout le livre',
    printSomeChapters: '{count} sur {total} chapitres',
    printPreparing: 'Préparation du document… {done} sur {total}',
    printNotesHeading: 'Notes',
    printFallbackTitle: 'Livre',
    printChapterFailed: 'Impossible de composer le chapitre « {title} ».',
    printFailed: 'Le document n’a pas pu être préparé pour l’impression.',
    language: 'Langue', help: 'Aide', settings: 'Réglages', back: 'Retour', cloud: 'Dans le nuage',
    device: 'Sur cet appareil', addLocal: 'Ajouter un livre (PDF ou EPUB) depuis cet appareil',
    addCloud: 'Envoyer un livre (PDF ou EPUB) dans le nuage', reload: 'Recharger',
    addLocalFolder: 'Ajouter un dossier entier depuis cet appareil',
    addCloudFolder: 'Envoyer un dossier entier dans le nuage',
    backLibrary: 'Retour à la bibliothèque', saveCloud: 'Enregistrer dans mon nuage', zoom: 'Zoom', zoomOut: 'Réduire', autoWidth: 'Ajuster à la largeur', fitPage: 'Ajuster la page entière', cropMargins: 'Rogner les marges', skipToContent: 'Aller au contenu', bookIndexShort: 'Sommaire', thumbnails: 'Miniatures', resizePanel: 'Modifier la largeur du panneau', bookNavigation: 'Navigation du livre', pageThumbnails: 'Miniatures des pages', noMarginsToCrop: 'Ce livre n’a pas de marges à rogner.', zoomIn: 'Agrandir',
    zoomLevel: 'Zoom :', zoomChange: 'Touchez pour le changer',
    zoomSettings: 'Choisir le niveau de zoom', customZoom: 'Autre', apply: 'Appliquer',
    moreReaderActions: 'Plus d’actions', readerActions: 'Actions de lecture',
    previous: 'Page précédente', next: 'Page suivante', goPage: 'Aller à une page',
    marginSide: 'Marge latérale', noMargin: 'Sans marge', moreMargin: 'Plus de marge',
    zoomHelp: 'Enregistré uniquement pour ce livre.',
    marginHelp: 'Le texte se réajuste au déplacement du curseur. La marge est propre à ce livre.', reset: 'Réinitialiser',
    webdavFolder: 'URL du dossier WebDAV', user: 'Utilisateur', appPassword: 'Mot de passe d’application',
    webdav: 'Nuage (WebDAV)', transferConfig: 'Transférer la configuration vers un autre appareil',
    webdavShort: 'Nuage', settingsData: 'Données', settingsSections: 'Sections des réglages',
    epubTextSettings: 'Texte des EPUB',
    epubTextSettingsHelp: 'Comment le texte des livres EPUB est composé (les PDF arrivent déjà mis en page et n’acceptent pas ces changements). Les mêmes réglages sont accessibles pendant la lecture, sous le bouton de la lettre. Vous décidez ici comment commence chaque nouveau livre : la marge et l’alignement que vous changez avec un livre ouvert ne concernent que ce livre.',
    resetTextSettings: 'Réinitialiser le texte',
    importExport: 'Importer et exporter', addBooks: 'Ajouter des livres',
    addBooksHelp: 'Ajoutez des PDF ou EPUB à l’appareil, ou envoyez-les dans le dossier du nuage actuellement ouvert.',
    addToDevice: 'Ajouter à l’appareil', uploadToCloud: 'Envoyer dans le nuage',
    addFolderToDevice: 'Ajouter un dossier à l’appareil', uploadFolderToCloud: 'Envoyer un dossier dans le nuage',
    localBackup: 'Bibliothèque de cet appareil',
    localBackupHelp: 'Enregistre dans un ZIP les livres « Sur cet appareil », leur progression, les signets, les annotations et les préférences. Ne comprend ni la configuration ni le mot de passe du nuage ; vous pouvez les enregistrer séparément depuis Réglages.',
    exportLocalBackup: 'Créer une copie', restoreLocalBackup: 'Restaurer sur l’appareil',
    creatingBackup: 'Création de la copie…', restoringBackup: 'Restauration de la copie…',
    noLocalBooksBackup: 'Aucun livre local à copier.',
    backupCreated: 'Copie créée avec succès ({count} livres).',
    backupRestored: 'Copie restaurée avec succès ({count} livres).',
    backupFailed: 'Impossible de créer la copie : {error}', restoreFailed: 'Impossible de restaurer : {error}',
    invalidBackup: 'Ce fichier n’est pas une copie valide de PageKeeper.',
    wrongLocalBackup: 'Ceci est une copie du nuage, pas de l’appareil.',
    restoreBackupConfirm: 'Restaurer cette copie ? Les livres portant le même identifiant et leurs données locales seront remplacés ; les autres seront conservés.',
    pdfPasswordTitle: 'PDF protégé', pdfPasswordHelp: 'Entrez le mot de passe pour ouvrir ce PDF. Il ne sera pas enregistré.',
    pdfPassword: 'Mot de passe du PDF', pdfPasswordIncorrect: 'Le mot de passe est incorrect.',
    pdfNoTextTitle: 'PDF sans texte sélectionnable',
    pdfNoTextBadge: 'SANS TEXTE',
    pdfNoTextHelp: 'Ce document semble être numérisé. La recherche, la sélection et la lecture à voix haute ne fonctionneront pas correctement.',
    pdfNoTextStep1: 'Téléchargez le PDF depuis le menu du livre.',
    pdfNoTextStep2: 'Ouvrez-le dans Scribe OCR et générez une copie PDF avec du texte.',
    pdfNoTextStep3: 'Téléchargez cette copie et renvoyez-la vers PageKeeper.',
    pdfNoTextPrivacy: 'PageKeeper n’enverra pas le document : vous devrez le sélectionner vous-même dans l’outil externe.',
    openScribeOcr: 'Ouvrir Scribe OCR', understood: 'Compris',
    open: 'Ouvrir', openFailed: 'Impossible d’ouvrir le livre : {error}',
    cloudBackup: 'Bibliothèque du nuage',
    cloudBackupHelp: 'Enregistre dans un ZIP tous les PDF et EPUB du dossier WebDAV et de ses sous-dossiers, avec la progression, les signets et les annotations.',
    exportCloudBackup: 'Créer une copie du nuage', restoreCloudBackup: 'Restaurer dans le nuage',
    cloudBackupNeedsConfig: 'Configurez d’abord un nuage WebDAV dans Réglages.',
    readingCloudLibrary: 'Lecture de la bibliothèque du nuage…',
    noCloudBooksBackup: 'Aucun livre dans le nuage à copier.',
    backingUpCloudBook: 'Copie de {current} sur {total} : « {title} »…',
    cloudBackupCreated: 'Copie du nuage créée avec succès ({count} livres).',
    restoreCloudConfirm: 'Restaurer cette copie dans le nuage configuré ? Ses sous-dossiers seront créés et les livres au même chemin seront remplacés.',
    restoringCloudBackup: 'Préparation de la restauration dans le nuage…',
    restoringCloudBook: 'Envoi de {current} sur {total} : « {title} »…',
    cloudBackupRestored: 'Copie restaurée dans le nuage ({count} livres).',
    wrongCloudBackup: 'Ceci est une copie de l’appareil, pas du nuage.',
    testConnection: 'Tester la connexion', save: 'Enregistrer', deleteConfig: 'Supprimer la configuration',
    copyConfig: 'Copier le lien de configuration', exportConfigFile: 'Enregistrer la configuration',
    importConfigFile: 'Restaurer la configuration', configFileSaved: '✓ Configuration enregistrée dans un fichier.',
    invalidConfigFile: 'Le fichier ne contient pas une configuration valide de PageKeeper.',
    credits: 'Crédits', license: 'Licence MIT', source: 'Code source',
    privacy: 'Confidentialité',
    analyticsNotice: 'Cette application recueille uniquement des statistiques d’utilisation agrégées, avec un système autohébergé, pour mieux comprendre son usage et améliorer l’outil. Aucune adresse IP n’est conservée et aucun cookie d’analyse n’est utilisé pour les visiteurs.',
    continueReading: 'Continuer la lecture', recentCount: 'Combien de lectures afficher', recentAuto: 'Autant que possible', recentN: '{count} lectures',
    recentCountHelp: '« Autant que possible » en montre trois ou quatre selon la largeur de l’écran. Les autres restent à portée de touche, dans « Voir plus ».', removeContinue: 'Retirer « Continuer la lecture » de la bibliothèque', continueRemoved: '« Continuer la lecture » a été retiré. Vous pouvez le réafficher dans Réglages → Bibliothèque.', continueReadingHelp: 'Votre lecture la plus récente, les autres à portée de touche',
    devices: 'Appareils connectés',
    devicesHelp: 'Les navigateurs qui utilisent cette bibliothèque, avec la dernière synchronisation. Si vous en voyez un que vous ne reconnaissez pas, changez le mot de passe d’application.',
    devicesRevokeHelp: '⚠️ « Déconnecter » demande à l’appareil d’oublier la configuration du nuage et de la redemander ; cela ne prend effet que la prochaine fois qu’il s’ouvrira là-bas. L’accès au serveur n’est pas retiré : pour cela, supprimez le mot de passe d’application dans votre nuage.',
    devicesNone: 'Aucun appareil ne s’est encore connecté.',
    deviceThisOne: 'cet appareil', deviceUnknown: 'Appareil sans nom',
    deviceAuto: '{browser} sur {system}', deviceCode: 'code {code}',
    deviceLastSeen: 'vu pour la dernière fois : {when}', deviceNeverSeen: 'aucune donnée',
    deviceToday: 'aujourd’hui', deviceYesterday: 'hier', deviceDaysAgo: 'il y a {count} jours',
    deviceRevokedPending: 'déconnecté, en attente d’ouverture',
    deviceRevoked: 'déconnecté',
    deviceRename: 'Renommer', deviceRenamePrompt: 'Nom pour cet appareil',
    deviceDisconnect: 'Déconnecter',
    deviceDisconnectConfirm: 'Déconnecter « {name} » ? La prochaine fois que PageKeeper s’ouvrira là-bas, il oubliera la configuration du nuage et la redemandera. L’accès au serveur n’est pas retiré : pour cela, supprimez le mot de passe d’application dans votre nuage.',
    deviceDisconnected: 'Déconnexion demandée. Elle prendra effet la prochaine fois que PageKeeper s’ouvrira sur cet appareil.',
    deviceWasDisconnected: 'Cet appareil a été déconnecté depuis un autre : ressaisissez les informations de votre nuage pour continuer à synchroniser.',
    cleanup: 'Livres qui ne sont plus là',
    cleanupHelp: 'Quand un livre disparaît du nuage, sa position de lecture, ses signets et ses notes restent ici. Il est d’abord noté comme manquant, et ce n’est que plus tard qu’ils sont supprimés, au cas où le livre aurait été hors de portée un moment.',
    cleanupDays: 'Combien de temps attendre avant de les supprimer',
    cleanupNever: 'Ne jamais les supprimer',
    cleanupDays7: 'Une semaine', cleanupDays15: 'Quinze jours', cleanupDays30: 'Un mois',
    cleanupDays60: 'Deux mois', cleanupDays90: 'Trois mois',
    cleanupDaysHelp: 'Ce délai est partagé avec vos autres appareils, pour qu’ils suppriment tous le même jour.',
    cleanupCheck: 'Vérifier le nuage', cleanupNow: 'Supprimer maintenant',
    cleanupChecking: 'Vérification du contenu du nuage…',
    cleanupNoCloud: 'Aucun nuage configuré. Les livres de cet appareil sont nettoyés dès que vous les supprimez, sans attente.',
    cleanupUnchecked: 'Le nuage n’a pas encore été vérifié durant cette session.',
    cleanupClean: 'Tout est en ordre : {count} éléments dans le nuage et aucune position de lecture en attente de suppression.',
    cleanupCleanOne: 'Tout est en ordre : 1 élément dans le nuage et aucune position de lecture en attente de suppression.',
    cleanupMissingOne: '1 livre est manquant ; sa position de lecture est toujours conservée :',
    cleanupSideFilesOne: 'Il y a aussi 1 fichier d’annotations sans son livre.',
    cleanupConfirmOne: 'Supprimer maintenant la position de lecture, les signets et les notes d’1 livre qui n’est plus là ? C’est irréversible.',
    cleanupDoneOne: '1 livre qui n’était plus là a été nettoyé.',
    cleanupMissing: '{count} livres sont manquants ; leur position de lecture est toujours conservée :',
    cleanupMissingOn: '{name} — sera supprimé le {date}',
    cleanupMissingNever: '{name} — ne sera pas supprimé (vous avez choisi de ne jamais supprimer)',
    cleanupSideFiles: 'Il y a aussi {count} fichiers d’annotations sans leur livre.',
    cleanupConfirm: 'Supprimer maintenant la position de lecture, les signets et les notes de {count} livres qui ne sont plus là ? C’est irréversible.',
    cleanupDone: '{count} livres qui n’étaient plus là ont été nettoyés.',
    cleanupNothing: 'Rien à supprimer : les livres sont revenus.',
    showMoreRecent: 'Afficher {count} de plus', showFewerRecent: 'Afficher moins',
    removeFromContinue: 'Retirer « {title} » de Continuer la lecture',
    filterBy: 'Afficher', filterAll: 'Tous', filterReading: 'En cours', filterPending: 'En attente', filterFinished: 'Terminés',
    sortBy: 'Trier par', sortRecent: 'Lecture récente', sortTitle: 'Titre', sortAuthor: 'Auteur', sortProgress: 'Progression',
    rating: 'Note', ratingNone: 'Non noté', ratingOf: '{n} étoiles sur {max}',
    openedWithoutSync: 'Impossible de vérifier si vous aviez avancé sur un autre appareil : le livre s\'ouvre où vous en étiez ici.',
    positionFromOtherDevice: 'La position laissée sur un autre appareil a été récupérée.',
    remotePositionAskEpub: 'Sur un autre appareil, la lecture est arrivée à {remoto} % et vous en êtes à {local} %. Y aller ?',
    remotePositionAskPdf: 'Sur un autre appareil, la lecture est arrivée à la page {remoto} sur {paginas} et vous en êtes à la page {local}. Y aller ?',
    remotePositionGo: 'Y aller',
    remotePositionStay: 'Rester ici',
    remotePositionStayed: 'La position de cet appareil est conservée.',
    bookNoteRating: 'Note et évaluation',
    ratingHint: 'Appuyez sur l\'étoile marquée pour retirer la note',
    sortRating: 'Note', filterRated4: '4 étoiles ou plus', filterRated3: '3 étoiles ou plus', filterUnrated: 'Non noté',
    filterGroupStatus: 'Lecture', filterGroupRating: 'Note',
    viewLabel: 'Affichage', viewList: 'Vue en liste', viewGrid: 'Vue en grille',
    toggleSection: 'Replier ou déplier la section',
    markFinished: 'Marquer « {title} » comme terminé', markUnfinished: 'Retirer l’étiquette « Terminé » de « {title} »', finished: 'Terminé',
    sampleBookHeading: 'Commencez avec un livre d’exemple', sampleBookHelp: 'Votre bibliothèque est vide. Ajoutez l’un de ces exemples pour essayer PageKeeper :',
    loadingSampleBook: 'Préparation du livre d’exemple…',
    loadingLibrary: 'Chargement de la bibliothèque…', noCloudBooks: 'Aucun livre synchronisé pour l’instant. Utilisez le bouton d’envoi pour ajouter le premier.',
    notStarted: 'non commencé', read: 'lu', page: 'Page', of: 'sur',
    bookActions: 'Actions pour « {title} »',
    actionUpload: 'Envoyer dans le nuage', actionMove: 'Déplacer vers un autre dossier', actionDownload: 'Télécharger',
    actionOffline: 'Disponible hors ligne', actionRemoveOffline: 'Retirer la copie hors ligne',
    actionUpdateOffline: 'Mettre à jour la copie hors ligne', actionDelete: 'Supprimer',
    actionBookNote: 'Note du livre', bookNote: 'Note du livre', bookNoteLabel: 'Votre note sur ce livre',
    bookNotePlaceholder: 'De quoi ça parle, où vous en étiez resté, ce que vous voulez retenir…',
    actionFolderNote: 'Note du dossier', folderNote: 'Note du dossier',
    folderNotePlaceholder: 'Ce que vous gardez ici et pourquoi…',
    noFolderNote: 'Aucune note sur ce dossier pour l’instant.',
    editBookNote: 'Écrire la note du livre', noBookNote: 'Aucune note sur ce livre pour l’instant.',
    actionRename: 'Renommer',
    actionMarkFinished: 'Marquer comme terminé', actionMarkUnfinished: 'Retirer « Terminé »',
    renameBookPrompt: 'Nom à afficher dans la bibliothèque (laissez vide pour utiliser celui du fichier) :',
    actionDeleteFolder: 'Supprimer le dossier',
    actionDownloadFolderZip: 'Télécharger le dossier (ZIP)',
    actionSaveFolderToDisk: 'Enregistrer le dossier sur l’ordinateur',
    packingFolder: 'Préparation du dossier…',
    packingFolderItem: '« {title} » ({current} sur {total})',
    folderDownloadedOne: 'Dossier « {name} » enregistré : 1 livre.',
    folderDownloadedMany: 'Dossier « {name} » enregistré : {count} livres.',
    folderHasNoBooks: 'Ce dossier ne contient aucun livre à télécharger.',
    folderDownloadedPartial: 'Dossier « {name} » enregistré. Non inclus : {failed} sur {total}.',
    folderDownloadFailed: 'Aucun livre de ce dossier n’a pu être récupéré.',
    bookGone: 'le livre n’est plus dans le stockage de cet appareil',
    removeOfflineConfirm: 'Retirer la copie hors ligne de « {title} » ? Le livre du nuage ne sera pas supprimé.',
    savingOffline: 'Enregistrement de « {title} » pour une lecture hors ligne…', offlineSaved: '« {title} » est maintenant disponible hors ligne ({size} Mo).',
    offlineRemoved: 'Copie hors ligne supprimée. Le livre reste dans le nuage.', availableOffline: 'HORS LIGNE', offlineOutdated: 'À METTRE À JOUR',
    offlineLibrary: 'Hors ligne : affichage des copies enregistrées sur cet appareil.',
    offlineFolderEmpty: 'Il n’y a pas de copies hors ligne dans ce dossier.', openedOfflineCopy: 'Ouvert depuis la copie hors ligne.',
    offlineUpdateFailed: 'Le livre s’est ouvert, mais sa copie hors ligne n’a pas pu être mise à jour.',
    storageFull: 'Il n’y a pas assez d’espace pour enregistrer « {title} » hors ligne.',
    fillUrlUser: 'Renseignez au moins l’URL et l’utilisateur.', configSaved: 'Configuration enregistrée.', connecting: 'Connexion…',
    connectionOk: '✓ Connexion réussie : {count} livres trouvés.', configDeleted: 'Configuration supprimée.',
    invalidConfigLink: 'Le lien de configuration n’est pas valide.', cloudConfigImported: 'Configuration du nuage importée.',
    copyLinkFirst: 'Renseignez (ou enregistrez) d’abord l’URL et l’utilisateur.', linkCopied: '✓ Lien copié. Ouvrez-le sur l’autre appareil.',
    copyLinkPrompt: 'Copiez le lien et ouvrez-le sur l’autre appareil :',
    downloading: 'Téléchargement de « {title} »…', opening: 'Ouverture de « {title} »…', adding: 'Ajout de « {title} »…', uploading: 'Envoi de « {title} » dans le nuage…', deleting: 'Suppression de « {title} »…',
    cloudBookDeleted: 'Livre supprimé du nuage.', localBookDeleted: 'Livre supprimé de cet appareil.',
    cloudBookDeletedPending: 'Livre supprimé. Le nettoyage de la progression sera retenté au retour de la connexion.',
    cloudUploaded: '« {title} » envoyé dans votre nuage.', cloudSaved: 'Enregistré dans votre nuage. La synchronisation se fait maintenant entre appareils.',
    continuing: 'Reprise là où vous en étiez resté', continuingPage: 'Reprise à la page {page}',
    overwrite: '« {title} » existe déjà dans votre nuage. Voulez-vous l’écraser ?',
    deleteCloudConfirm: 'Supprimer « {title} » de votre nuage ? Le fichier sera retiré du serveur.',
    deleteLocalConfirm: 'Supprimer « {title} » de cet appareil ?',
    deleteConfigConfirm: 'Supprimer la configuration du serveur ? La progression enregistrée dans le nuage n’est pas affectée.',
    replaceConfigConfirm: 'La configuration importée remplacera la configuration actuelle du nuage. Continuer ?',
    epubMargin: '{value} % de chaque côté', pageMode: 'Afficher une page à la fois (comme un livre)', scrollMode: 'Afficher les pages en continu (défilement)',
    twoPages: 'Afficher deux pages côte à côte', onePage: 'Afficher une seule page', rotatePage: 'Faire pivoter la page',
    readAloud: 'Lecture à voix haute', ttsPlay: 'Lire à partir d’ici', ttsPause: 'Mettre en pause', ttsResume: 'Reprendre',
    ttsStop: 'Arrêter', ttsVoice: 'Voix', ttsAutoVoice: 'Automatique', ttsSpeed: 'Vitesse',
    ttsHelp: 'Commence à la page actuelle, met en surbrillance la phrase lue et tourne les pages toute seule.',
    ttsNoSupport: 'Ce navigateur ne permet pas la lecture à voix haute.',
    ttsNoText: 'Aucun texte lisible n’a été trouvé (il peut s’agir d’un document numérisé).',
    immersive: 'Lire en plein écran', immersiveExit: 'Quitter le plein écran',
    timeLeft: 'Temps de lecture restant estimé', timeLeftMenu: 'Temps restant : {time}',
    reader: 'Lecteur', readerScreen: 'À l’écran', showStatusBar: 'Afficher la barre de données en bas',
    showStatusBarHelp: 'La ligne en bas du lecteur avec la page du chapitre, l’écran du livre, le pourcentage lu et le temps restant. La masquer redonne cette hauteur au texte.',
    statusChapter: '{page} / {total} du chap.', statusChapterTitle: 'Écran dans le chapitre',
    statusScreens: 'Écran {page} sur ~{total}',
    statusScreensTitle: 'Nombre d’écrans que le livre occupe sur cet appareil, avec la taille de texte et la marge actuelles. C’est une estimation qui change quand vous modifiez ces réglages.',
    statusPage: 'Page {page} sur {total}', statusPageTitle: 'Page du document',
    statusRead: '{percent} % lu', statusReadTitle: 'Part du livre déjà lue',
    timeLessMinute: '< 1 min', timeMinutes: '{m} min', timeHoursMinutes: '{h} h {m} min', goPercent: 'Aller au pourcentage du livre (0–100) :', goToPage: 'Aller à la page (1–{total}) :',
    sampleNoticeHtml: '<h2>Deux livres pour commencer</h2><span>Votre bibliothèque contient deux livres d’exemple pour essayer PageKeeper dès maintenant. Ils sont à vous : lisez-les, gardez-les ou supprimez-les quand vous voulez depuis le menu d’actions de chaque livre.</span>',
    dontShowAgain: 'Ne plus afficher',
    noConfigHtml: '<span>Aucun serveur n’est configuré. Vous pouvez ouvrir un livre (PDF ou EPUB) depuis cet appareil, ou <a href="#" id="enlace-configurar">configurer votre nuage (Nextcloud ou un autre serveur WebDAV)</a> pour synchroniser la position de lecture entre appareils.</span><p class="ayuda">Vous ne savez pas ce que c’est ou ce qu’il vous faut ? <a href="#" id="enlace-ayuda-aviso">Lisez l’aide</a>.</p>',
    syncError: 'Erreur de synchronisation', syncFailed: 'Impossible de synchroniser la progression : {error}',
    syncRecovered: 'Votre position est maintenant enregistrée dans le nuage',
    stats: 'Statistiques de lecture', statsView: 'Voir les statistiques',
    statsSettingsHelp: 'Le temps que vous passez à lire, les jours consécutifs et les livres qui prennent le plus de votre temps, en additionnant tous vos appareils.',
    statsSummary: 'Votre lecture', statsLastDays: 'Les 30 derniers jours',
    actionBookStats: 'Temps de lecture',
    statusTimeSpentTitle: 'Depuis combien de temps vous lisez ce livre. Touchez pour voir le détail.',
    statusPaused: 'En pause',
    statusPausedTitle: 'Le temps de lecture ne s’accumule plus : vous êtes sur la même page depuis plus de cinq minutes. Il repartira dès que vous tournerez la page.',
    statsBookTime: 'Temps passé', statsBookRead: 'Lu', statsBookPace: 'Rythme',
    statsPacePerPage: '{time} par page', statsPaceSeconds: '{s} s par page',
    statsBookByDevice: 'Sur chaque appareil',
    statsHideFromList: 'Masquer de la liste',
    statsShowInList: 'Remettre dans la liste',
    statsHideNote: 'Il n\'apparaîtra plus dans « Où passe le temps ». Rien n\'est supprimé : il revient dans la liste dès que vous le lisez à nouveau un moment.',
    statsHiddenNote: 'Il n\'est plus dans « Où passe le temps ». Il y reviendra tout seul dès que vous le lirez à nouveau un moment.',
    statsBookEmpty: 'Aucun temps enregistré pour ce livre pour l’instant. Dès que vous lirez quelques minutes avec ce livre ouvert, vous verrez ici le temps que vous y avez consacré.',
    statsShared: 'En additionnant tous vos appareils : ce que vous lisez sur le téléphone et sur l’ordinateur compte ensemble, et un jour où vous avez lu sur les deux ne compte que pour un jour.',
    statsTopBooks: 'Où passe le temps',
    statsSortBy: 'Trier par', statsSortTime: 'Temps passé',
    statsSortRecent: 'Dernière lecture', statsSortTitle: 'Titre',
    statsLastRead: 'lu le {date}', statsBookGone: 'ne fait plus partie de la bibliothèque', statsDataTitle: 'À propos de ces données',
    statsEmptyTitle: 'Rien à montrer pour l’instant',
    statsEmpty: 'Dès que vous lirez quelques minutes avec un livre ouvert, cette page affichera le temps consacré, les jours consécutifs de lecture et les livres qui prennent le plus de votre temps.',
    statsPrivacy: 'Avec un nuage configuré, le temps de lecture voyage avec la position de lecture : chaque appareil enregistre le sien et le total est affiché ici, pour savoir combien de temps un livre vous a pris même en le lisant par bouts sur chaque appareil. Ces données vivent sur votre propre serveur WebDAV, à côté de vos livres, et ne sont jamais envoyées ailleurs. Sans nuage configuré, elles restent dans ce navigateur. Seul le temps passé avec le livre devant vous compte : tant que l’application n’est pas visible, l’horloge s’arrête, et les sauts de position ne sont pas comptabilisés. Chaque page compte au maximum cinq minutes ; au-delà, la barre du bas signale la pause, et le compte reprend dès que vous tournez la page.',
    statsDelete: 'Supprimer les statistiques',
    statsDeleteConfirm: 'Supprimer les statistiques de lecture ? Elles seront supprimées sur tous vos appareils : ceux qui sont connectés le feront dès qu’ils synchroniseront. Vos livres, votre position de lecture et vos annotations ne sont pas affectés.',
    statsDeleted: '✓ Statistiques supprimées. Vos autres appareils les supprimeront lors de la synchronisation.',
    statsOptOut: 'Ne pas mesurer le temps de lecture',
    statsOptOutHelp: 'Arrête de compter le temps, les jours d’affilée et le temps passé sur chaque livre. En l’activant, tout ce qui a été enregistré jusqu’ici est supprimé et ne peut pas être récupéré. Avec le nuage configuré, la décision atteint aussi vos autres appareils : ils cessent de mesurer dès la synchronisation.',
    statsOptOutConfirm: 'Arrêter de mesurer le temps de lecture ?\n\nTout ce qui a été enregistré jusqu’ici —le temps, les jours d’affilée et le temps de chaque livre— sera supprimé sans possibilité de récupération. Avec le nuage configuré, la suppression et la décision de ne plus mesurer atteindront vos autres appareils.',
    statsOffTitle: 'Rien n’est mesuré',
    statsOff: 'Le comptage du temps de lecture est désactivé. Vous pouvez le réactiver ci-dessous, dans « Ces données » ; le comptage repartira de zéro.',
    statsOffDone: '✓ Mesure arrêtée et données existantes supprimées.',
    statsOnAgain: '✓ La mesure reprend, à partir de zéro.',
    statsTotal: 'Temps total', statsToday: 'Aujourd’hui', statsWeek: '7 derniers jours',
    statsStreak: 'Jours consécutifs', statsAverage: 'Moyenne par jour lu',
    statsActiveDays: 'Jours avec lecture', statsBestDay: 'Meilleur jour', statsPdfPages: 'Pages de PDF',
    statsBestStreak: 'votre meilleure série : {streak}', statsStreakNow: 'série en cours',
    statsNoStreak: 'aujourd’hui ou demain en commence une',
    statsDays: '{count} jours', statsDaysOne: '{count} jour', statsHours: '{h} h',
    statsChartLabel: 'Graphique du temps de lecture pour chacun des {days} derniers jours.',
    statsChartSummary: 'Vous avez lu {days} des 30 derniers jours, {total} au total.',
    statsGroupBy: 'Grouper par',
    statsByDay: 'Jours', statsByWeek: 'Semaines', statsByMonth: 'Mois', statsByYear: 'Années',
    statsLastWeeks: 'Les 12 dernières semaines', statsLastMonths: 'Les 12 derniers mois',
    statsLastYears: 'Les 5 dernières années',
    statsCount_semana: '{count} semaines', statsCount_semanaOne: '{count} semaine',
    statsCount_mes: '{count} mois', statsCount_mesOne: '{count} mois',
    statsCount_anno: '{count} années', statsCount_annoOne: '{count} année',
    statsChartSummaryPeriod: 'Vous avez lu sur {count}, {total} au total.',
    statsWeekOf: 'Semaine du {date}',
    statsThisWeek: 'Cette semaine', statsThisMonth: 'Ce mois-ci', statsThisYear: 'Cette année',
    statsThisDay: 'Aujourd’hui',
    statsPrevWeek: 'La semaine précédente', statsPrevMonth: 'Le mois précédent',
    statsPrevYear: 'L’année précédente', statsPrevDay: 'Hier',
    statsSoFar: 'au même stade', statsUpToMonth: 'jusqu’à {month}',
    statsMoreThanBefore: '{percent} % de plus', statsLessThanBefore: '{percent} % de moins',
    statsSame: 'Identique', statsFirstTime: 'Vous démarrez', statsNoTime: 'Rien',
    statsHistoryFrom: 'Le détail par jour remonte jusqu’au {date}.',
    statsChartEmpty: 'Vous n’avez encore rien lu pendant ces 30 jours.',
    statsChartDay: '{date} : {time}', statsChartDayNone: '{date} : aucune lecture',
    statsBooksTracked: 'Sur les {count} plus récents.',
    statsBookUntitled: 'Livre sans titre',
    activityLog: 'Journal d’activité',
    activityLogHelp: 'Indique si votre position de lecture arrive au serveur, et les erreurs qui l’en empêchent. Utile pour comprendre pourquoi un livre a pris du retard sur un autre appareil. Conservé uniquement ici, ne quitte jamais cet appareil et s’efface de lui-même au bout d’une semaine.',
    viewLog: 'Voir le journal', clearLog: 'Vider', copyLog: 'Copier', downloadLog: 'Enregistrer',
    logEmpty: 'Rien d’enregistré pour l’instant.',
    logWithErrors: '{errores} erreur(s) enregistrée(s)',
    logNoErrors: '{total} événements, aucune erreur',
    logCopied: 'Journal copié', logCopyFailed: 'Impossible de copier ; utilisez « Enregistrer »',
    logRecovered: 'envoyé après {intentos} tentative(s) échouée(s)',
    logRetrying: 'nouvelle tentative (échecs consécutifs : {intentos})',
    logOffline: 'hors ligne : en attente de la connexion',
    logBackOnline: 'connexion rétablie', logWentOffline: 'connexion perdue',
    cloudScope: 'Livres et progression disponibles sur tous vos appareils',
    localScope: 'Livres stockés uniquement sur cet appareil',
    emptyLocalAction: 'Ajouter des livres uniquement à cet appareil',
    emptyLocalHelp: 'Ils ne seront pas synchronisés. Sélectionnez des fichiers PDF ou EPUB, ou déposez-les ici.',
    webdavHelpHtml: 'Compatible avec Nextcloud, ownCloud et tout serveur WebDAV. Les PDF du dossier indiqué apparaîtront dans votre bibliothèque et la position de lecture se synchronisera entre tous vos appareils. Vous ne savez pas quoi indiquer ? <a href="#" id="enlace-ayuda-ajustes">Lisez l’aide</a>.',
    passwordHelpHtml: '⚠️ Dans Nextcloud, créez un <strong>mot de passe d’application</strong> (Réglages → Sécurité), n’utilisez pas votre mot de passe principal. Le serveur doit aussi autoriser CORS pour que le navigateur puisse se connecter : dans Nextcloud, installez <strong>WebAppPassword</strong> et ajoutez le domaine de cette liseuse. Les données sont enregistrées uniquement dans ce navigateur.',
    transferHelp: 'Vous pouvez copier un lien ou enregistrer un fichier contenant l’URL, l’utilisateur et le mot de passe d’application, puis l’ouvrir sur un autre appareil. ⚠️ Le lien et le fichier permettent d’accéder à votre nuage : gardez-les privés et supprimez les copies dont vous n’avez plus besoin.',
    creditsHtml: 'Construit avec <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) et les icônes <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC).',
    dropLocal: 'Déposez ici pour enregistrer sur cet appareil', dropCloud: 'Déposez ici pour envoyer dans le nuage',
    unsupportedFiles: 'Seuls les fichiers PDF ou EPUB peuvent être ajoutés.',
    localDuplicate: 'Ce livre est déjà sur cet appareil, enregistré sous « {title} ».',
    noBooksInFolder: 'Ce dossier ne contient aucun fichier PDF ni EPUB.', localAddedOne: 'Livre enregistré sur cet appareil.', localAddedMany: '{count} livres enregistrés sur cet appareil.',
    saveFailed: 'Impossible d’enregistrer « {title} » : {error}',
    searchLibrary: 'Rechercher dans la bibliothèque', clearSearch: 'Effacer la recherche', searchLibraryPlaceholder: 'Rechercher par titre, auteur…',
    showIndex: 'Afficher le sommaire', hideIndex: 'Masquer le sommaire',
    showThumbs: 'Afficher les miniatures', hideThumbs: 'Masquer les miniatures',
    showIndexThumbs: 'Afficher le sommaire et les miniatures',
    hideIndexThumbs: 'Masquer le sommaire et les miniatures',
    searchBook: 'Rechercher dans le livre', bookIndex: 'Sommaire du livre', bookStart: 'Début du livre', historyNavigation: 'Historique de navigation', backPosition: 'Revenir à la position précédente', forwardPosition: 'Avancer à la position suivante', pageAndHistory: 'Page et historique de navigation', wordOrPhrase: 'Mot ou phrase', search: 'Rechercher', close: 'Fermer', zoomedImage: 'Image agrandie',
    searchingBook: 'Recherche dans le livre…', searchProgress: 'Recherche… {done}/{total} · {count} résultats.', noSearchResults: 'Aucun résultat trouvé.', searchResults: '{count} résultats.',
    chapter: 'Chapitre', noLibraryResults: 'Aucun livre ne correspond à la recherche.',
    searchingFolders: 'Recherche également dans les dossiers…', inFolder: 'Dans le dossier « {name} »',
    bookmarks: 'Signets', bookmark: 'Signet', addBookmark: 'Ajouter un signet ici',
    annotations: 'Annotations', noAnnotations: 'Aucune annotation pour l’instant.',
    highlightColor: 'Couleur du surlignage', highlightYellow: 'Surligner en jaune',
    highlightGreen: 'Surligner en vert', highlightBlue: 'Surligner en bleu', highlightPink: 'Surligner en rose',
    exportAnnotations: 'Exporter les annotations (Markdown)', exportHeader: 'Annotations de « {title} »',
    exportSource: 'Exportées depuis PageKeeper', annotationsExported: 'Annotations exportées.',
    searchAnnotations: 'Rechercher dans les annotations', noAnnotationResults: 'Aucune annotation correspondante.',
    selectionActions: 'Actions pour le texte sélectionné', highlight: 'Surligner', addNote: 'Ajouter une note',
    note: 'Note', notePrompt: 'Note sur le texte sélectionné :', editNote: 'Modifier la note', deleteAnnotation: 'Supprimer l’annotation', deleteAnnotationConfirm: 'Supprimer cette annotation ?', noteActions: 'Options de la note',
    annotationAdded: 'Annotation enregistrée.', annotationDeleted: 'Annotation supprimée.',
    bookmarkName: 'Nom du signet', bookmarkNamePlaceholder: 'Nom du signet (facultatif)',
    bookmarkNamePrompt: 'Nom du signet (laissez vide pour le retirer) :', editBookmark: 'Modifier le nom du signet',
    noBookmarks: 'Aucun signet pour l’instant.', bookmarkAdded: 'Signet ajouté.',
    bookmarkRenamed: 'Nom du signet mis à jour.',
    bookmarkRemoved: 'Signet supprimé.', bookmarkExists: 'Il y a déjà un signet à cette position.',
    deleteBookmark: 'Supprimer le signet',
    cloudRoot: 'Accueil', currentFolder: 'Dossier actuel', targetFolder: 'Dossier de destination',
    newFolder: 'Créer un dossier', folderNamePrompt: 'Nom du nouveau dossier :',
    invalidFolderName: 'Le nom du dossier n’est pas valide.',
    creatingFolder: 'Création du dossier « {name} »…', folderCreated: 'Dossier « {name} » créé.',
    renamingFolder: 'Renommage de « {name} »…',
    openFolder: 'Ouvrir le dossier « {name} »',
    folderEmpty: 'Vide', folderItemsOne: '1 élément', folderItems: '{count} éléments',
    sectionFoldersOne: '1 dossier', sectionFolders: '{count} dossiers',
    sectionBooksOne: '1 livre', sectionBooks: '{count} livres',
    deleteFolderConfirm: 'Supprimer le dossier « {name} » et tout son contenu de votre nuage ?',
    folderDeleted: 'Dossier supprimé du nuage.', emptyFolder: 'Ce dossier est vide.',
    deviceRoot: 'Accueil', actionRenameFolder: 'Renommer le dossier',
    actionSaveToDevice: 'Enregistrer sur cet appareil',
    imagesInvertedOff: 'Rendre aux images leur couleur',
    imagesInvertedOn: 'Images dans leur couleur : activé. Touchez pour les inverser avec la page',
    library: 'Bibliothèque', showContinueReading: 'Afficher « Continuer la lecture »',
    showContinueReadingHelp: 'L’encadré avec vos dernières lectures, au-dessus de la bibliothèque. Le masquer laisse les livres où ils étaient, avec leur page intacte.',
    openLastOnStart: 'Ouvrir la dernière lecture au démarrage de PageKeeper',
    openLastOnStartHelp: 'À l’ouverture de l’application, vous arrivez directement dans le livre que vous étiez en train de lire, sans passer par la bibliothèque. Ce choix ne vaut que pour cet appareil : ailleurs, vous arriverez toujours dans la bibliothèque.',
    theme: 'Thème', themeAuto: 'Celui du système', themeLight: 'Clair', themeSepia: 'Sépia',
    statsBookCard: 'Voir le temps passé sur « {title} »',
    themeDark: 'Sombre', themeBlack: 'Noir',
    autoTheme: 'Le thème du système',
    autoThemeHelp: 'Quand le thème est réglé sur celui du système, l’application s’éclaircit ou s’assombrit avec le reste de l’appareil. Vous choisissez ici quel thème elle utilise de chaque côté. Les cinq thèmes restent à portée dans le bouton de l’en-tête ; ceci décide seulement où mène « celui du système ».',
    autoThemeLight: 'Quand le système est en clair',
    autoThemeDark: 'Quand le système est en sombre',
    autoThemeNow: 'Pour l’instant votre système demande le thème {theme}, c’est ce que vous voyez.',
    autoThemeIdle: 'Vous avez réglé le thème à la main sur {theme}, donc ceci ne change rien pour le moment. Revenez à « celui du système » dans le bouton de l’en-tête pour que cela s’applique.',
    actionMoveFolder: 'Déplacer le dossier', moveFolderTo: 'Déplacer le dossier « {name} »',
    folderMoved: 'Dossier « {name} » déplacé.',
    savedToDevice: '« {title} » enregistré sur cet appareil.',
    folderRenamePrompt: 'Nouveau nom du dossier :', folderRenamed: 'Dossier renommé.',
    folderExists: 'Il y a déjà un dossier portant ce nom ici.',
    deleteLocalFolderConfirm: 'Supprimer le dossier « {name} » et tous les livres qu’il contient de cet appareil ?',
    localFolderDeleted: 'Dossier supprimé de cet appareil.',
    emptyLocalFolder: 'Ce dossier n’a pas encore de livres.',
    moveToDeviceFolder: 'Déplacer « {title} » vers un autre dossier de l’appareil',
    moveBook: 'Déplacer « {title} » vers un autre dossier', moveHere: 'Déplacer ici',
    moving: 'Déplacement de « {title} »…', bookMoved: '« {title} » déplacé.', cancel: 'Annuler',
    loadingFolders: 'Chargement des dossiers…', noSubfolders: 'Aucun sous-dossier.',
    textSettings: 'Réglages du texte', fontFamily: 'Police',
    bookFont: 'Celle du livre', serifFont: 'Avec empattements', sansFont: 'Sans empattements',
    lineSpacing: 'Interligne', bookSpacing: 'Celui du livre', spacingCompact: 'Compact',
    spacingNormal: 'Normal', spacingWide: 'Large', spacingWider: 'Très large',
    hyphenation: 'Coupure des mots', hyphenationAuto: 'Oui, en fin de ligne',
    hyphenationBook: 'Comme dans le livre', hyphenationNever: 'Ne jamais couper',
    textAlignment: 'Alignement', bookAlignment: 'Celui du livre',
    unjustifiedAlignment: 'Non justifié',
    justifiedAlignment: 'Justifié',
    columnsSettings: 'Colonnes', columnsAuto: 'Automatiques',
    columnsOne: 'Une colonne', columnsTwo: 'Deux colonnes',
    columnsThree: 'Trois colonnes', columnsFour: 'Quatre colonnes',
    columnsSettingsHelp: 'En combien de colonnes le texte se répartit à l’écran. En automatique, il en tient autant que possible sans que les lignes deviennent pénibles, et elles changent d’elles-mêmes quand on tourne l’appareil ou qu’on modifie la taille du texte. Avec un livre ouvert, le bouton des colonnes ne change que ce livre ; ici, c’est le point de départ des autres. Cela ne voyage pas vers vos autres appareils : chaque écran est un cas à part.',
    lineLength: 'Lignes d’au plus', lineLengthValue: '{value} lettres',
    moreColumns: 'Plus de colonnes', fewerColumns: 'Moins de colonnes',
    lineLengthHelp: 'Ne compte qu’en automatique : une colonne de plus s’ouvre dès que le texte le permet sans qu’aucune dépasse cette longueur. Des lignes courtes les font apparaître plus tôt ; des lignes longues, plus tard.',
  },
  gl: {
    appTagline: 'Lector de libros electrónicos',
    appVersion: 'PageKeeper {version}',
    // Imprimir el EPUB en papel o en PDF.
    printBook: 'Imprimir ou gardar en PDF',
    printHelp: 'Abrirase o diálogo de impresión do navegador, onde podes escoller a impresora ou «Gardar como PDF».',
    printPaper: 'Papel',
    printPaperLetter: 'Carta',
    printMargins: 'Marxes',
    printMarginNarrow: 'Estreitas',
    printMarginNormal: 'Normais',
    printMarginWide: 'Anchas',
    printFont: 'Letra',
    printFontSmall: 'Pequena',
    printFontNormal: 'Normal',
    printFontLarge: 'Grande',
    printAnnotations: 'Incluír os subliñados e as notas',
    selectAll: 'Todos',
    selectNone: 'Ningún',
    print: 'Imprimir',
    printChapterNumber: 'Capítulo {number}',
    printNoChapters: 'Ningún capítulo',
    printWholeBook: 'Todo o libro',
    printSomeChapters: '{count} de {total} capítulos',
    printPreparing: 'Preparando o documento… {done} de {total}',
    printNotesHeading: 'Notas',
    printFallbackTitle: 'Libro',
    printChapterFailed: 'Non se puido compoñer o capítulo «{title}».',
    printFailed: 'Non se puido preparar o documento para imprimir.',
    language: 'Idioma', help: 'Axuda', settings: 'Axustes', back: 'Volver', cloud: 'Na nube',
    device: 'Neste dispositivo', addLocal: 'Engadir un libro (PDF ou EPUB) deste dispositivo',
    addCloud: 'Subir un libro (PDF ou EPUB) á nube', reload: 'Recargar',
    addLocalFolder: 'Engadir un cartafol enteiro deste dispositivo',
    addCloudFolder: 'Subir un cartafol enteiro á nube',
    backLibrary: 'Volver á biblioteca', saveCloud: 'Gardar na miña nube', zoom: 'Zoom', zoomOut: 'Reducir', autoWidth: 'Axustar ao ancho', fitPage: 'Axustar a páxina completa', cropMargins: 'Recortar as marxes', skipToContent: 'Saltar ao contido', bookIndexShort: 'Índice', thumbnails: 'Miniaturas', resizePanel: 'Cambiar o ancho do panel', bookNavigation: 'Navegación do libro', pageThumbnails: 'Miniaturas das páxinas', noMarginsToCrop: 'Esta obra non ten marxes que recortar.', zoomIn: 'Ampliar',
    zoomLevel: 'Aumento:', zoomChange: 'Preme para cambialo',
    zoomSettings: 'Escoller o aumento', customZoom: 'Outro', apply: 'Aplicar',
    moreReaderActions: 'Máis accións', readerActions: 'Accións de lectura',
    previous: 'Páxina anterior', next: 'Páxina seguinte', goPage: 'Ir a unha páxina',
    marginSide: 'Marxe lateral', noMargin: 'Sen marxe', moreMargin: 'Máis marxe',
    zoomHelp: 'Gárdase só para este libro.',
    marginHelp: 'O texto reaxústase ao mover o control. A marxe é deste libro.', reset: 'Restabelecer',
    webdavFolder: 'URL do cartafol WebDAV', user: 'Usuario', appPassword: 'Contrasinal de aplicación',
    webdav: 'Nube (WebDAV)', transferConfig: 'Levar a configuración a outro dispositivo',
    webdavShort: 'Nube', settingsData: 'Datos', settingsSections: 'Seccións dos axustes',
    epubTextSettings: 'Texto dos EPUB',
    epubTextSettingsHelp: 'Como se compón o texto dos libros EPUB (os PDF chegan xa maquetados e non admiten estes cambios). Os mesmos axustes están á man mentres les, no botón da letra. Aquí decides con que empeza cada libro novo: a marxe e o aliñamento que cambies cun libro aberto son só dese libro.',
    resetTextSettings: 'Restabelecer o texto',
    importExport: 'Importar e exportar', addBooks: 'Engadir libros',
    addBooksHelp: 'Engade PDF ou EPUB ao dispositivo ou súbeos ao cartafol da nube que teñas aberto.',
    addToDevice: 'Engadir ao dispositivo', uploadToCloud: 'Subir á nube',
    addFolderToDevice: 'Engadir un cartafol ao dispositivo', uploadFolderToCloud: 'Subir un cartafol á nube',
    localBackup: 'Biblioteca deste dispositivo',
    localBackupHelp: 'Garda nun ZIP os libros de «Neste dispositivo», o seu progreso, marcadores, anotacións e preferencias. Non inclúe a configuración nin o contrasinal da nube; podes gardalos á parte desde Axustes.',
    exportLocalBackup: 'Crear copia', restoreLocalBackup: 'Restaurar no dispositivo',
    creatingBackup: 'Creando a copia…', restoringBackup: 'Restaurando a copia…',
    noLocalBooksBackup: 'Non hai libros locais para copiar.',
    backupCreated: 'Copia creada correctamente ({count} libros).',
    backupRestored: 'Copia restaurada correctamente ({count} libros).',
    backupFailed: 'Non se puido crear a copia: {error}', restoreFailed: 'Non se puido restaurar: {error}',
    invalidBackup: 'O arquivo non é unha copia válida de PageKeeper.',
    wrongLocalBackup: 'Esta é unha copia da nube, non do dispositivo.',
    restoreBackupConfirm: 'Restaurar esta copia? Os libros co mesmo identificador e os seus datos locais serán substituídos; os demais conservaranse.',
    pdfPasswordTitle: 'PDF protexido', pdfPasswordHelp: 'Introduce o contrasinal para abrir este PDF. Non se gardará.',
    pdfPassword: 'Contrasinal do PDF', pdfPasswordIncorrect: 'O contrasinal non é correcto.',
    pdfNoTextTitle: 'PDF sen texto seleccionable',
    pdfNoTextBadge: 'SEN TEXTO',
    pdfNoTextHelp: 'Este documento parece estar escaneado. A busca, a selección e a lectura en voz alta non funcionarán correctamente.',
    pdfNoTextStep1: 'Descarga o PDF desde o menú do libro.',
    pdfNoTextStep2: 'Ábreo en Scribe OCR e xera unha copia PDF con texto.',
    pdfNoTextStep3: 'Descarga esa copia e vólvea subir a PageKeeper.',
    pdfNoTextPrivacy: 'PageKeeper non enviará o documento: terás que seleccionalo ti na ferramenta externa.',
    openScribeOcr: 'Abrir Scribe OCR', understood: 'Entendido',
    open: 'Abrir', openFailed: 'Non se puido abrir o libro: {error}',
    cloudBackup: 'Biblioteca da nube',
    cloudBackupHelp: 'Garda nun ZIP todos os PDF e EPUB do cartafol WebDAV e dos seus subcartafoles, xunto co progreso, os marcadores e as anotacións.',
    exportCloudBackup: 'Crear copia da nube', restoreCloudBackup: 'Restaurar na nube',
    cloudBackupNeedsConfig: 'Configura primeiro unha nube WebDAV en Axustes.',
    readingCloudLibrary: 'Lendo a biblioteca da nube…',
    noCloudBooksBackup: 'Non hai libros na nube para copiar.',
    backingUpCloudBook: 'Copiando {current} de {total}: «{title}»…',
    cloudBackupCreated: 'Copia da nube creada correctamente ({count} libros).',
    restoreCloudConfirm: 'Restaurar esta copia na nube configurada? Crearanse os seus subcartafoles e sobrescribiranse os libros que teñan a mesma ruta.',
    restoringCloudBackup: 'Preparando a restauración na nube…',
    restoringCloudBook: 'Subindo {current} de {total}: «{title}»…',
    cloudBackupRestored: 'Copia restaurada na nube ({count} libros).',
    wrongCloudBackup: 'Esta é unha copia do dispositivo, non da nube.',
    testConnection: 'Probar conexión', save: 'Gardar', deleteConfig: 'Borrar configuración',
    copyConfig: 'Copiar ligazón de configuración', exportConfigFile: 'Gardar configuración',
    importConfigFile: 'Restaurar configuración', configFileSaved: '✓ Configuración gardada nun arquivo.',
    invalidConfigFile: 'O arquivo non contén unha configuración válida de PageKeeper.',
    credits: 'Créditos', license: 'Licenza MIT', source: 'Código fonte',
    privacy: 'Privacidade',
    analyticsNotice: 'Esta aplicación recolle unicamente estatísticas de uso agregadas cun sistema propio para coñecer a súa utilización e mellorar a ferramenta. Non se almacenan enderezos IP nin se usan cookies de analítica para as persoas visitantes.',
    continueReading: 'Continuar lendo', recentCount: 'Cantas lecturas amosar', recentAuto: 'As que caiban', recentN: '{count} lecturas',
    recentCountHelp: '«As que caiban» amosa tres ou catro segundo o ancho da pantalla. As demais están a un toque, en «Ver máis».', removeContinue: 'Quitar «Continuar lendo» da biblioteca', continueRemoved: 'Quitouse «Continuar lendo». Podes volver a amosalo en Axustes → Biblioteca.', continueReadingHelp: 'A túa lectura máis recente, coas demais a un toque',
    devices: 'Dispositivos conectados',
    devicesHelp: 'Os navegadores que están a usar esta biblioteca, coa última vez que sincronizaron. Se ves un que non recoñeces, cambia o contrasinal de aplicación.',
    devicesRevokeHelp: '⚠️ «Desconectar» pídelle ao dispositivo que esqueza a configuración da nube e a volva pedir, e só ten efecto a próxima vez que se abra alí. Non retira o acceso ao servidor: para iso hai que borrar o contrasinal de aplicación na túa nube.',
    devicesNone: 'Aínda non se conectou ningún dispositivo.',
    deviceThisOne: 'este dispositivo', deviceUnknown: 'Dispositivo sen nome',
    deviceAuto: '{browser} en {system}', deviceCode: 'código {code}',
    deviceLastSeen: 'última vez: {when}', deviceNeverSeen: 'sen datos',
    deviceToday: 'hoxe', deviceYesterday: 'onte', deviceDaysAgo: 'hai {count} días',
    deviceRevokedPending: 'desconectado, á espera de que se abra',
    deviceRevoked: 'desconectado',
    deviceRename: 'Cambiar o nome', deviceRenamePrompt: 'Nome para este dispositivo',
    deviceDisconnect: 'Desconectar',
    deviceDisconnectConfirm: 'Desconectar «{name}»? A próxima vez que se abra alí, PageKeeper esquecerá a configuración da nube e a pedirá de novo. O acceso ao servidor non se retira: para iso, borra o contrasinal de aplicación na túa nube.',
    deviceDisconnected: 'Pedíuse a desconexión. Terá efecto a próxima vez que se abra PageKeeper nese dispositivo.',
    deviceWasDisconnected: 'Este dispositivo desconectouse desde outro aparello: volve escribir os datos da túa nube para seguir sincronizando.',
    cleanup: 'Libros que xa non están',
    cleanupHelp: 'Cando un libro desaparece da nube, a súa marca de lectura, os seus marcadores e as súas notas quedan aquí. Primeiro bótase en falta e só despois se borran, por se o libro estivese fóra de alcance un anaco.',
    cleanupDays: 'Canto se espera antes de borralos',
    cleanupNever: 'Non borralos nunca',
    cleanupDays7: 'Unha semana', cleanupDays15: 'Quince días', cleanupDays30: 'Un mes',
    cleanupDays60: 'Dous meses', cleanupDays90: 'Tres meses',
    cleanupDaysHelp: 'Este prazo compártese cos teus outros dispositivos, para que todos borren o mesmo día.',
    cleanupCheck: 'Comprobar a nube', cleanupNow: 'Borrar agora',
    cleanupChecking: 'Mirando que hai na nube…',
    cleanupNoCloud: 'Sen nube configurada. Os libros deste dispositivo límpanse sós ao borralos, sen espera.',
    cleanupUnchecked: 'Aínda non se comprobou a nube nesta sesión.',
    cleanupClean: 'Todo en orde: {count} elementos na nube e ningunha marca de lectura pendente de borrar.',
    cleanupCleanOne: 'Todo en orde: 1 elemento na nube e ningunha marca de lectura pendente de borrar.',
    cleanupMissingOne: 'Bótase en falta 1 libro; a súa marca de lectura segue gardada:',
    cleanupSideFilesOne: 'Hai ademais 1 arquivo de anotacións sen o seu libro.',
    cleanupConfirmOne: 'Borrar agora a marca de lectura, os marcadores e as notas de 1 libro que xa non está? Non se pode desfacer.',
    cleanupDoneOne: 'Limpouse 1 libro que xa non estaba.',
    cleanupMissing: 'Bótanse en falta {count} libros; a súa marca de lectura segue gardada:',
    cleanupMissingOn: '{name} — borarase o {date}',
    cleanupMissingNever: '{name} — non se borrará (escolliches non borrar nunca)',
    cleanupSideFiles: 'Hai ademais {count} arquivos de anotacións sen o seu libro.',
    cleanupConfirm: 'Borrar agora a marca de lectura, os marcadores e as notas de {count} libros que xa non están? Non se pode desfacer.',
    cleanupDone: 'Limpáronse {count} libros que xa non estaban.',
    cleanupNothing: 'Non había nada que borrar: os libros volveron aparecer.',
    showMoreRecent: 'Ver {count} máis', showFewerRecent: 'Ver menos',
    removeFromContinue: 'Quitar «{title}» de Continuar lendo',
    filterBy: 'Amosar', filterAll: 'Todos', filterReading: 'Lendo', filterPending: 'Pendentes', filterFinished: 'Rematados',
    sortBy: 'Ordenar por', sortRecent: 'Lectura recente', sortTitle: 'Título', sortAuthor: 'Autor', sortProgress: 'Progreso',
    rating: 'Cualificación', ratingNone: 'Sen cualificar', ratingOf: '{n} de {max} estrelas',
    openedWithoutSync: 'Non se puido comprobar se avanzaras noutro dispositivo: ábrese por onde ías aquí.',
    positionFromOtherDevice: 'Recuperouse a posición que deixaches noutro dispositivo.',
    remotePositionAskEpub: 'Noutro dispositivo a lectura chegou ao {remoto} % e aquí vas polo {local} %. Queres ir alí?',
    remotePositionAskPdf: 'Noutro dispositivo a lectura chegou á páxina {remoto} de {paginas} e aquí vas pola {local}. Queres ir alí?',
    remotePositionGo: 'Ir alí',
    remotePositionStay: 'Quedar aquí',
    remotePositionStayed: 'Mantense a posición deste dispositivo.',
    bookNoteRating: 'Nota e cualificación',
    ratingHint: 'Preme a estrela marcada para quitar a cualificación',
    sortRating: 'Cualificación', filterRated4: '4 estrelas ou máis', filterRated3: '3 estrelas ou máis', filterUnrated: 'Sen cualificar',
    filterGroupStatus: 'Lectura', filterGroupRating: 'Cualificación',
    viewLabel: 'Vista', viewList: 'Vista de lista', viewGrid: 'Vista de grella',
    toggleSection: 'Pregar ou despregar a sección',
    markFinished: 'Marcar «{title}» como rematado', markUnfinished: 'Quitar a etiqueta «Rematado» de «{title}»', finished: 'Rematado',
    sampleBookHeading: 'Comeza cun libro de exemplo', sampleBookHelp: 'A túa biblioteca está baleira. Engade un destes exemplos para probar PageKeeper:',
    loadingSampleBook: 'Preparando o libro de exemplo…',
    loadingLibrary: 'Cargando biblioteca…', noCloudBooks: 'Aínda non hai libros sincronizados. Usa o botón de subir para engadir o primeiro.',
    notStarted: 'sen empezar', read: 'lido', page: 'Páxina', of: 'de',
    bookActions: 'Accións de «{title}»',
    actionUpload: 'Subir á nube', actionMove: 'Mover a outro cartafol', actionDownload: 'Descargar',
    actionOffline: 'Dispoñible sen conexión', actionRemoveOffline: 'Quitar a copia sen conexión',
    actionUpdateOffline: 'Actualizar a copia sen conexión', actionDelete: 'Borrar',
    actionBookNote: 'Nota do libro', bookNote: 'Nota do libro', bookNoteLabel: 'A túa nota sobre este libro',
    bookNotePlaceholder: 'De que vai, por onde o deixaches, que queres lembrar…',
    actionFolderNote: 'Nota do cartafol', folderNote: 'Nota do cartafol',
    folderNotePlaceholder: 'Que gardas aquí e para que…',
    noFolderNote: 'Aínda non hai ningunha nota sobre este cartafol.',
    editBookNote: 'Escribir a nota do libro', noBookNote: 'Aínda non hai ningunha nota sobre este libro.',
    actionRename: 'Cambiar o nome',
    actionMarkFinished: 'Marcar como rematado', actionMarkUnfinished: 'Quitar «Rematado»',
    renameBookPrompt: 'Nome para amosar na biblioteca (déixao baleiro para usar o do arquivo):',
    actionDeleteFolder: 'Borrar o cartafol',
    actionDownloadFolderZip: 'Descargar o cartafol (ZIP)',
    actionSaveFolderToDisk: 'Gardar o cartafol no equipo',
    packingFolder: 'Preparando o cartafol…',
    packingFolderItem: '«{title}» ({current} de {total})',
    folderDownloadedOne: 'Cartafol «{name}» gardado: 1 libro.',
    folderDownloadedMany: 'Cartafol «{name}» gardado: {count} libros.',
    folderHasNoBooks: 'Ese cartafol non contén ningún libro que descargar.',
    folderDownloadedPartial: 'Cartafol «{name}» gardado. Sen incluír: {failed} de {total}.',
    folderDownloadFailed: 'Non se puido obter ningún libro do cartafol.',
    bookGone: 'o libro xa non está no almacén deste dispositivo',
    removeOfflineConfirm: 'Quitar a copia sen conexión de «{title}»? O libro da nube non se borrará.',
    savingOffline: 'Gardando «{title}» para ler sen conexión…', offlineSaved: '«{title}» xa está dispoñible sen conexión ({size} MB).',
    offlineRemoved: 'Copia sen conexión eliminada. O libro segue na nube.', availableOffline: 'SEN CONEXIÓN', offlineOutdated: 'ACTUALIZAR',
    offlineLibrary: 'Sen conexión: amósanse as copias gardadas neste dispositivo.',
    offlineFolderEmpty: 'Non hai copias sen conexión neste cartafol.', openedOfflineCopy: 'Aberto desde a copia sen conexión.',
    offlineUpdateFailed: 'O libro abriuse, pero non se puido actualizar a súa copia sen conexión.',
    storageFull: 'Non hai espazo suficiente para gardar «{title}» sen conexión.',
    fillUrlUser: 'Enche polo menos a URL e o usuario.', configSaved: 'Configuración gardada.', connecting: 'Conectando…',
    connectionOk: '✓ Conexión correcta: {count} libros atopados.', configDeleted: 'Configuración borrada.',
    invalidConfigLink: 'A ligazón de configuración non é válida.', cloudConfigImported: 'Configuración da nube importada.',
    copyLinkFirst: 'Enche (ou garda) antes a URL e o usuario.', linkCopied: '✓ Ligazón copiada. Ábrea no outro dispositivo.',
    copyLinkPrompt: 'Copia a ligazón e ábrea no outro dispositivo:',
    downloading: 'Descargando «{title}»…', opening: 'Abrindo «{title}»…', adding: 'Engadindo «{title}»…', uploading: 'Subindo «{title}» á túa nube…', deleting: 'Borrando «{title}»…',
    cloudBookDeleted: 'Libro borrado da nube.', localBookDeleted: 'Libro borrado deste dispositivo.',
    cloudBookDeletedPending: 'Libro borrado. A limpeza do progreso reintentarase cando volva a conexión.',
    cloudUploaded: '«{title}» subido á túa nube.', cloudSaved: 'Gardado na túa nube. Xa se sincroniza entre dispositivos.',
    continuing: 'Continuando onde o deixaches', continuingPage: 'Continuando na páxina {page}',
    overwrite: 'Xa existe «{title}» na túa nube. Queres sobrescribilo?',
    deleteCloudConfirm: 'Borrar «{title}» da túa nube? Eliminarase o arquivo do servidor.',
    deleteLocalConfirm: 'Borrar «{title}» deste dispositivo?',
    deleteConfigConfirm: 'Borrar a configuración do servidor? O progreso gardado na nube non se toca.',
    replaceConfigConfirm: 'A configuración importada substituirá a configuración de nube actual. Continuar?',
    epubMargin: '{value} % por lado', pageMode: 'Ver páxina a páxina (como un libro)', scrollMode: 'Ver páxinas continuas (desprazamento)',
    twoPages: 'Ver dúas páxinas xuntas', onePage: 'Ver unha soa páxina', rotatePage: 'Xirar a páxina',
    readAloud: 'Lectura en voz alta', ttsPlay: 'Ler desde aquí', ttsPause: 'Pausar', ttsResume: 'Continuar',
    ttsStop: 'Deter', ttsVoice: 'Voz', ttsAutoVoice: 'Automática', ttsSpeed: 'Velocidade',
    ttsHelp: 'Empeza na páxina actual, resalta a frase que soa e pasa de páxina soa.',
    ttsNoSupport: 'Este navegador non permite a lectura en voz alta.',
    ttsNoText: 'Non se atopou texto para ler (pode ser un documento escaneado).',
    immersive: 'Ler a pantalla completa', immersiveExit: 'Saír da pantalla completa',
    timeLeft: 'Tempo de lectura restante estimado', timeLeftMenu: 'Tempo restante: {time}',
    reader: 'Lector', readerScreen: 'En pantalla', showStatusBar: 'Amosar a barra de datos ao pé',
    showStatusBarHelp: 'A liña do final do lector coa páxina do capítulo, a pantalla do libro, a porcentaxe lida e o tempo que queda. Ao ocultala gáñase ese pouco de alto para o texto.',
    statusChapter: '{page} / {total} do cap.', statusChapterTitle: 'Pantalla dentro do capítulo',
    statusScreens: 'Pant. {page} de ~{total}',
    statusScreensTitle: 'Pantallas que ocupa o libro neste dispositivo, coa letra e a marxe de agora. É unha estimación e cambia ao tocar eses axustes.',
    statusPage: 'Páxina {page} de {total}', statusPageTitle: 'Páxina do documento',
    statusRead: '{percent} % lido', statusReadTitle: 'Parte do libro que levas lida',
    timeLessMinute: '< 1 m', timeMinutes: '{m} m', timeHoursMinutes: '{h} h {m} m', goPercent: 'Ir á porcentaxe do libro (0–100):', goToPage: 'Ir á páxina (1–{total}):',
    sampleNoticeHtml: '<h2>Dous libros para empezar</h2><span>A túa biblioteca inclúe dous libros de exemplo para que poidas probar PageKeeper desde o primeiro momento. Son teus: podes lelos, conservalos ou borralos cando queiras desde o menú de accións de cada libro.</span>',
    dontShowAgain: 'Non volver amosar',
    noConfigHtml: '<span>Non hai ningún servidor configurado. Podes abrir un libro (PDF ou EPUB) deste dispositivo, ou <a href="#" id="enlace-configurar">configurar a túa nube (Nextcloud ou outro WebDAV)</a> para sincronizar a posición de lectura entre dispositivos.</span><p class="ayuda">Non sabes que é isto ou que necesitas? <a href="#" id="enlace-ayuda-aviso">Le a axuda</a>.</p>',
    syncError: 'Erro de sincronización', syncFailed: 'Non se puido sincronizar o progreso: {error}',
    syncRecovered: 'Xa se gardou a túa posición na nube',
    stats: 'Estatísticas de lectura', statsView: 'Ver as estatísticas',
    statsSettingsHelp: 'O tempo que dedicas a ler, os días seguidos que levas e os libros aos que máis tempo lles dedicas, sumando todos os teus dispositivos.',
    statsSummary: 'A túa lectura', statsLastDays: 'Os últimos 30 días',
    actionBookStats: 'Tempo de lectura',
    statusTimeSpentTitle: 'Tempo que levas lendo este libro. Preme para velo en detalle.',
    statusPaused: 'En pausa',
    statusPausedTitle: 'O tempo dedicado non está sumando: levas máis de cinco minutos na mesma páxina. Volverá contar en canto pases de páxina.',
    statsBookTime: 'Tempo dedicado', statsBookRead: 'Lido', statsBookPace: 'Ritmo',
    statsPacePerPage: '{time} por páxina', statsPaceSeconds: '{s} s por páxina',
    statsBookByDevice: 'En cada dispositivo',
    statsHideFromList: 'Agochar da lista',
    statsShowInList: 'Volver á lista',
    statsHideNote: 'Deixará de aparecer en «En que se vai o tempo». Non se borra nada: volverá á lista en canto o leas outra vez un anaco.',
    statsHiddenNote: 'Agora non aparece en «En que se vai o tempo». Volverá só en canto o leas outra vez un anaco.',
    statsBookEmpty: 'Aínda non hai tempo apuntado deste libro. En canto leas uns minutos con el aberto, aquí aparecerá canto lle dedicaches.',
    statsShared: 'Suma de todos os teus dispositivos: o lido no móbil e no ordenador conta xunto, e un día no que lixeses nos dous é un só día.',
    statsTopBooks: 'En que se vai o tempo',
    statsSortBy: 'Ordenar por', statsSortTime: 'Tempo dedicado',
    statsSortRecent: 'Última lectura', statsSortTitle: 'Título',
    statsLastRead: 'lido o {date}', statsBookGone: 'xa non está na biblioteca', statsDataTitle: 'Estes datos',
    statsEmptyTitle: 'Aínda non hai nada que contar',
    statsEmpty: 'En canto leas uns minutos cun libro aberto, aquí aparecerán o tempo dedicado, os días seguidos que levas lendo e en que libros se che vai o tempo.',
    statsPrivacy: 'Cunha nube configurada, o tempo viaxa co progreso de lectura: cada dispositivo apunta o seu e aquí amósase a suma, así que sabes canto tardaches en ler un libro aínda que o lesses a anacos en cada aparello. Van no teu propio servidor WebDAV, cos teus libros, e non se envían a ningún outro sitio. Sen nube configurada quedan neste navegador. Só conta o tempo co libro diante: mentres a aplicación non está á vista o reloxo párase, e os saltos de posición non se suman. De cada páxina cóntanse como máximo cinco minutos; pasado ese tempo a barra do pé avisa de que está en pausa, e volve contar ao pasar de páxina.',
    statsDelete: 'Borrar as estatísticas',
    statsDeleteConfirm: 'Borrar as estatísticas de lectura? Bórranse en todos os teus dispositivos: os que estean conectados farano en canto sincronicen. Non afecta os teus libros, á páxina pola que vas nin ás túas anotacións.',
    statsDeleted: '✓ Estatísticas borradas. Os demais dispositivos borraranas ao sincronizar.',
    statsOptOut: 'Non medir o tempo de lectura',
    statsOptOutHelp: 'Deixa de contar o tempo, os días seguidos e o rato dedicado a cada libro. Ao activalo bórrase o que haxa apuntado ata agora, que non se pode recuperar. Coa nube configurada, a decisión chega tamén aos teus outros dispositivos: deixan de medir en canto sincronizan.',
    statsOptOutConfirm: 'Deixar de medir o tempo de lectura?\n\nBorrarase todo o apuntado ata agora —o tempo, os días seguidos e o rato de cada libro— e non se poderá recuperar. Coa nube configurada, tanto o borrado como a decisión de non medir chegarán aos teus outros dispositivos.',
    statsOffTitle: 'Non se está medindo nada',
    statsOff: 'Tes desactivado o reconto do tempo de lectura. Podes volver activalo aquí abaixo, en «Estes datos»; comezarase a contar de novo desde cero.',
    statsOffDone: '✓ Deixouse de medir e borrouse o que había.',
    statsOnAgain: '✓ Vólvese medir, comezando desde cero.',
    statsTotal: 'Tempo total', statsToday: 'Hoxe', statsWeek: 'Últimos 7 días',
    statsStreak: 'Días seguidos', statsAverage: 'Media por día lido',
    statsActiveDays: 'Días con lectura', statsBestDay: 'Mellor día', statsPdfPages: 'Páxinas de PDF',
    statsBestStreak: 'a túa mellor racha: {streak}', statsStreakNow: 'racha en marcha',
    statsNoStreak: 'hoxe ou mañá empeza unha',
    statsDays: '{count} días', statsDaysOne: '{count} día', statsHours: '{h} h',
    statsChartLabel: 'Gráfico do tempo lido cada un dos últimos {days} días.',
    statsChartSummary: 'Lixeches {days} dos últimos 30, {total} en total.',
    statsGroupBy: 'Agrupar por',
    statsByDay: 'Días', statsByWeek: 'Semanas', statsByMonth: 'Meses', statsByYear: 'Anos',
    statsLastWeeks: 'As últimas 12 semanas', statsLastMonths: 'Os últimos 12 meses',
    statsLastYears: 'Os últimos 5 anos',
    statsCount_semana: '{count} semanas', statsCount_semanaOne: '{count} semana',
    statsCount_mes: '{count} meses', statsCount_mesOne: '{count} mes',
    statsCount_anno: '{count} anos', statsCount_annoOne: '{count} ano',
    statsChartSummaryPeriod: 'Lixeches en {count}, {total} en total.',
    statsWeekOf: 'Semana do {date}',
    statsThisWeek: 'Esta semana', statsThisMonth: 'Este mes', statsThisYear: 'Este ano',
    statsThisDay: 'Hoxe',
    statsPrevWeek: 'A semana anterior', statsPrevMonth: 'O mes anterior',
    statsPrevYear: 'O ano anterior', statsPrevDay: 'Onte',
    statsSoFar: 'a estas alturas', statsUpToMonth: 'ata {month}',
    statsMoreThanBefore: '{percent} % máis', statsLessThanBefore: '{percent} % menos',
    statsSame: 'Igual', statsFirstTime: 'Comezas', statsNoTime: 'Nada',
    statsHistoryFrom: 'O detalle por días chega ata o {date}.',
    statsChartEmpty: 'Aínda non liches nada nestes 30 días.',
    statsChartDay: '{date}: {time}', statsChartDayNone: '{date}: sen lectura',
    statsBooksTracked: 'Dos {count} máis recentes.',
    statsBookUntitled: 'Libro sen título',
    activityLog: 'Rexistro de actividade',
    activityLogHelp: 'Deixa constancia de se a posición de lectura chega ao servidor e dos erros que o impiden. Serve para saber por que un libro quedou atrás noutro dispositivo. Gárdase só aquí, nunca sae deste aparello e bórrase só ao cabo dunha semana.',
    viewLog: 'Ver o rexistro', clearLog: 'Baleirar', copyLog: 'Copiar', downloadLog: 'Gardar',
    logEmpty: 'Aínda non hai nada rexistrado.',
    logWithErrors: '{errores} erro(s) rexistrados',
    logNoErrors: '{total} eventos, ningún con erro',
    logCopied: 'Rexistro copiado', logCopyFailed: 'Non se puido copiar; usa «Gardar»',
    logRecovered: 'subiu tras {intentos} intento(s) fallido(s)',
    logRetrying: 'reintentando (fallos seguidos: {intentos})',
    logOffline: 'sen conexión: espérase a recuperala',
    logBackOnline: 'conexión recuperada', logWentOffline: 'conexión perdida',
    cloudScope: 'Libros e progreso dispoñibles en todos os teus dispositivos',
    localScope: 'Libros gardados unicamente neste dispositivo',
    emptyLocalAction: 'Engadir libros só a este dispositivo',
    emptyLocalHelp: 'Non se sincronizarán. Selecciona arquivos PDF ou EPUB, ou arrástraos aquí.',
    webdavHelpHtml: 'Compatible con Nextcloud, ownCloud e calquera servidor WebDAV. Os PDF do cartafol indicado aparecerán na túa biblioteca e a posición de lectura sincronizarase entre todos os teus dispositivos. Non sabes que pór aquí? <a href="#" id="enlace-ayuda-ajustes">Le a axuda</a>.',
    passwordHelpHtml: '⚠️ En Nextcloud crea un <strong>contrasinal de aplicación</strong> (Axustes → Seguridade), non uses o teu contrasinal principal. Ademais, para que o navegador poida conectar, o servidor debe permitir CORS: en Nextcloud instala a app <strong>WebAppPassword</strong> e engade o dominio deste lector. Os datos gárdanse unicamente neste navegador.',
    transferHelp: 'Podes copiar unha ligazón ou gardar un arquivo coa URL, o usuario e o contrasinal de aplicación, e abrilo noutro dispositivo. ⚠️ A ligazón e o arquivo permiten acceder á túa nube: gárdaos en privado e elimina as copias que xa non precises.',
    creditsHtml: 'Construído con <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) e iconas <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC).',
    dropLocal: 'Solta aquí para gardar neste dispositivo', dropCloud: 'Solta aquí para subir á nube',
    unsupportedFiles: 'Só se poden engadir arquivos PDF ou EPUB.',
    localDuplicate: 'Ese libro xa está neste dispositivo, gardado como «{title}».',
    noBooksInFolder: 'Ese cartafol non contén ningún PDF nin EPUB.', localAddedOne: 'Libro gardado neste dispositivo.', localAddedMany: '{count} libros gardados neste dispositivo.',
    saveFailed: 'Non se puido gardar «{title}»: {error}',
    searchLibrary: 'Buscar na biblioteca', clearSearch: 'Borrar a busca', searchLibraryPlaceholder: 'Buscar por título, autor…',
    showIndex: 'Amosar o índice', hideIndex: 'Ocultar o índice',
    showThumbs: 'Amosar as miniaturas', hideThumbs: 'Ocultar as miniaturas',
    showIndexThumbs: 'Amosar o índice e as miniaturas',
    hideIndexThumbs: 'Ocultar o índice e as miniaturas',
    searchBook: 'Buscar dentro do libro', bookIndex: 'Índice do libro', bookStart: 'Inicio do libro', historyNavigation: 'Historial de navegación', backPosition: 'Volver á posición anterior', forwardPosition: 'Avanzar á posición seguinte', pageAndHistory: 'Páxina e historial de navegación', wordOrPhrase: 'Palabra ou frase', search: 'Buscar', close: 'Pechar', zoomedImage: 'Imaxe ampliada',
    searchingBook: 'Buscando no libro…', searchProgress: 'Buscando… {done}/{total} · {count} resultados.', noSearchResults: 'Non se atoparon resultados.', searchResults: '{count} resultados.',
    chapter: 'Capítulo', noLibraryResults: 'Non hai libros que coincidan coa busca.',
    searchingFolders: 'Buscando tamén dentro dos cartafoles…', inFolder: 'No cartafol «{name}»',
    bookmarks: 'Marcadores', bookmark: 'Marcador', addBookmark: 'Engadir un marcador aquí',
    annotations: 'Anotacións', noAnnotations: 'Aínda non hai anotacións.',
    highlightColor: 'Cor do resalte', highlightYellow: 'Resaltar en amarelo',
    highlightGreen: 'Resaltar en verde', highlightBlue: 'Resaltar en azul', highlightPink: 'Resaltar en rosa',
    exportAnnotations: 'Exportar as anotacións (Markdown)', exportHeader: 'Anotacións de «{title}»',
    exportSource: 'Exportadas de PageKeeper', annotationsExported: 'Anotacións exportadas.',
    searchAnnotations: 'Buscar nas anotacións', noAnnotationResults: 'Non hai anotacións que coincidan.',
    selectionActions: 'Accións para o texto seleccionado', highlight: 'Resaltar', addNote: 'Engadir nota',
    note: 'Nota', notePrompt: 'Nota sobre o texto seleccionado:', editNote: 'Editar nota', deleteAnnotation: 'Borrar anotación', deleteAnnotationConfirm: 'Borrar esta anotación?', noteActions: 'Opcións da nota',
    annotationAdded: 'Anotación gardada.', annotationDeleted: 'Anotación borrada.',
    bookmarkName: 'Nome do marcador', bookmarkNamePlaceholder: 'Nome do marcador (opcional)',
    bookmarkNamePrompt: 'Nome do marcador (déixao baleiro para quitalo):', editBookmark: 'Cambiar o nome do marcador',
    noBookmarks: 'Aínda non hai marcadores.', bookmarkAdded: 'Marcador engadido.',
    bookmarkRenamed: 'Nome do marcador actualizado.',
    bookmarkRemoved: 'Marcador borrado.', bookmarkExists: 'Xa hai un marcador nesta posición.',
    deleteBookmark: 'Borrar o marcador',
    cloudRoot: 'Inicio', currentFolder: 'Cartafol actual', targetFolder: 'Cartafol de destino',
    newFolder: 'Crear un cartafol', folderNamePrompt: 'Nome do cartafol novo:',
    invalidFolderName: 'O nome do cartafol non é válido.',
    creatingFolder: 'Creando o cartafol «{name}»…', folderCreated: 'Cartafol «{name}» creado.',
    renamingFolder: 'Cambiando o nome de «{name}»…',
    openFolder: 'Abrir o cartafol «{name}»',
    folderEmpty: 'Baleiro', folderItemsOne: '1 elemento', folderItems: '{count} elementos',
    sectionFoldersOne: '1 cartafol', sectionFolders: '{count} cartafoles',
    sectionBooksOne: '1 libro', sectionBooks: '{count} libros',
    deleteFolderConfirm: 'Borrar o cartafol «{name}» e todo o seu contido da túa nube?',
    folderDeleted: 'Cartafol borrado da nube.', emptyFolder: 'Este cartafol está baleiro.',
    deviceRoot: 'Inicio', actionRenameFolder: 'Cambiar o nome do cartafol',
    actionSaveToDevice: 'Gardar neste dispositivo',
    imagesInvertedOff: 'Devolver a súa cor ás imaxes',
    imagesInvertedOn: 'Imaxes na súa cor: activado. Preme para invertelas coa páxina',
    library: 'Biblioteca', showContinueReading: 'Amosar «Continuar lendo»',
    showContinueReadingHelp: 'O recadro coas túas últimas lecturas, enriba da biblioteca. Ao ocultalo, os libros seguen onde estaban e conservan a súa páxina.',
    openLastOnStart: 'Abrir a última lectura ao iniciar PageKeeper',
    openLastOnStartHelp: 'Ao abrir a aplicación vaise directamente ao libro que estabas a ler, sen pasar pola biblioteca. Lémbrase só neste dispositivo: nos demais seguirás chegando á biblioteca.',
    theme: 'Tema', themeAuto: 'O do sistema', themeLight: 'Claro', themeSepia: 'Sepia',
    statsBookCard: 'Ver o tempo de «{title}»',
    themeDark: 'Escuro', themeBlack: 'Negro',
    autoTheme: 'O tema do sistema',
    autoThemeHelp: 'Cando o tema está en «o do sistema», a aplicación clarea ou escurece co resto do dispositivo. Aquí escolles con que tema o fai a cada lado. Os cinco temas seguen a man no botón da cabeceira; isto só decide a cal vai «o do sistema».',
    autoThemeLight: 'Cando o sistema vai en claro',
    autoThemeDark: 'Cando o sistema vai en escuro',
    autoThemeNow: 'Agora mesmo o teu sistema pide o tema {theme}, que é o que estás vendo.',
    autoThemeIdle: 'Tes o tema posto a man en {theme}, así que isto non cambia nada polo momento. Volve a «o do sistema» no botón da cabeceira para que valla.',
    actionMoveFolder: 'Mover o cartafol', moveFolderTo: 'Mover o cartafol «{name}»',
    folderMoved: 'Cartafol «{name}» movido.',
    savedToDevice: '«{title}» gardado neste dispositivo.',
    folderRenamePrompt: 'Nome novo do cartafol:', folderRenamed: 'Cartafol renomeado.',
    folderExists: 'Xa hai un cartafol con ese nome aquí.',
    deleteLocalFolderConfirm: 'Borrar o cartafol «{name}» e todos os libros que contén deste dispositivo?',
    localFolderDeleted: 'Cartafol borrado deste dispositivo.',
    emptyLocalFolder: 'Este cartafol non ten libros todavía.',
    moveToDeviceFolder: 'Mover «{title}» a outro cartafol do dispositivo',
    moveBook: 'Mover «{title}» a outro cartafol', moveHere: 'Mover aquí',
    moving: 'Movendo «{title}»…', bookMoved: '«{title}» movido.', cancel: 'Cancelar',
    loadingFolders: 'Cargando cartafoles…', noSubfolders: 'Non hai subcartafoles.',
    textSettings: 'Axustes de texto', fontFamily: 'Tipo de letra',
    bookFont: 'A do libro', serifFont: 'Con serifa', sansFont: 'Sen serifa',
    lineSpacing: 'Interliñado', bookSpacing: 'O do libro', spacingCompact: 'Compacto',
    spacingNormal: 'Normal', spacingWide: 'Amplo', spacingWider: 'Moi amplo',
    hyphenation: 'Partir palabras', hyphenationAuto: 'Si, ao final de liña',
    hyphenationBook: 'Como o libro', hyphenationNever: 'Non partir',
    textAlignment: 'Aliñamento', bookAlignment: 'O do libro',
    unjustifiedAlignment: 'Sen xustificar',
    justifiedAlignment: 'Xustificado',
    columnsSettings: 'Columnas', columnsAuto: 'Automáticas',
    columnsOne: 'Unha columna', columnsTwo: 'Dúas columnas',
    columnsThree: 'Tres columnas', columnsFour: 'Catro columnas',
    columnsSettingsHelp: 'En cantas columnas se reparte o texto na pantalla. En automático caben as que caiban sen que as liñas se fagan incómodas, e cambian soas ao xirar o aparello ou ao tocar o tamaño da letra. Cun libro aberto, o botón das columnas cambia o dese libro; o de aquí é con que comezan os demais. Isto non viaxa aos outros dispositivos: cada pantalla é un mundo.',
    lineLength: 'Liñas de como moito', lineLengthValue: '{value} letras',
    moreColumns: 'Máis columnas', fewerColumns: 'Menos columnas',
    lineLengthHelp: 'Só conta en automático: ábrese outra columna en canto o texto dá para que ningunha pase dese longo. Con liñas curtas aparecen antes; con liñas longas, máis tarde.',
  },
  eu: {
    appTagline: 'Liburu elektronikoen irakurgailua',
    appVersion: 'PageKeeper {version}',
    // Imprimir el EPUB en papel o en PDF.
    printBook: 'Inprimatu edo gorde PDF gisa',
    printHelp: 'Nabigatzailearen inprimatze-elkarrizketa irekiko da: bertan inprimagailua edo «Gorde PDF gisa» aukera dezakezu.',
    printPaper: 'Papera',
    printPaperLetter: 'Letter',
    printMargins: 'Marjinak',
    printMarginNarrow: 'Estuak',
    printMarginNormal: 'Arruntak',
    printMarginWide: 'Zabalak',
    printFont: 'Letra',
    printFontSmall: 'Txikia',
    printFontNormal: 'Arrunta',
    printFontLarge: 'Handia',
    printAnnotations: 'Sartu azpimarratuak eta oharrak',
    selectAll: 'Guztiak',
    selectNone: 'Bat ere ez',
    print: 'Inprimatu',
    printChapterNumber: '{number}. kapitulua',
    printNoChapters: 'Kapitulurik ez',
    printWholeBook: 'Liburu osoa',
    printSomeChapters: '{total} kapitulutik {count}',
    printPreparing: 'Dokumentua prestatzen… {total}(e)tik {done}',
    printNotesHeading: 'Oharrak',
    printFallbackTitle: 'Liburua',
    printChapterFailed: 'Ezin izan da «{title}» kapitulua osatu.',
    printFailed: 'Ezin izan da dokumentua inprimatzeko prestatu.',
    language: 'Hizkuntza', help: 'Laguntza', settings: 'Ezarpenak', back: 'Itzuli', cloud: 'Hodeian',
    device: 'Gailu honetan', addLocal: 'Gehitu liburu bat (PDF edo EPUB) gailu honetatik',
    addCloud: 'Igo liburu bat (PDF edo EPUB) hodeira', reload: 'Berrkargatu',
    addLocalFolder: 'Gehitu karpeta oso bat gailu honetatik',
    addCloudFolder: 'Igo karpeta oso bat hodeira',
    backLibrary: 'Itzuli liburutegira', saveCloud: 'Gorde nire hodeian', zoom: 'Zooma', zoomOut: 'Txikitu', autoWidth: 'Egokitu zabalerara', fitPage: 'Egokitu orrialde osoa', cropMargins: 'Moztu marjinak', skipToContent: 'Jauzi edukira', bookIndexShort: 'Aurkibidea', thumbnails: 'Miniaturak', resizePanel: 'Aldatu panelaren zabalera', bookNavigation: 'Liburuko nabigazioa', pageThumbnails: 'Orrialdeen miniaturak', noMarginsToCrop: 'Lan honek ez du mozteko marjinarik.', zoomIn: 'Handitu',
    zoomLevel: 'Zooma:', zoomChange: 'Sakatu aldatzeko',
    zoomSettings: 'Aukeratu zoom-maila', customZoom: 'Beste bat', apply: 'Aplikatu',
    moreReaderActions: 'Ekintza gehiago', readerActions: 'Irakurketa-ekintzak',
    previous: 'Aurreko orrialdea', next: 'Hurrengo orrialdea', goPage: 'Joan orrialde batera',
    marginSide: 'Alboko marjina', noMargin: 'Marjinarik gabe', moreMargin: 'Marjina gehiago',
    zoomHelp: 'Liburu honentzat soilik gordetzen da.',
    marginHelp: 'Testua birrantolatzen da kontrola mugitzean. Marjina liburu honetakoa da.', reset: 'Berrezarri',
    webdavFolder: 'WebDAV karpetaren URLa', user: 'Erabiltzailea', appPassword: 'Aplikazio-pasahitza',
    webdav: 'Hodeia (WebDAV)', transferConfig: 'Eraman konfigurazioa beste gailu batera',
    webdavShort: 'Hodeia', settingsData: 'Datuak', settingsSections: 'Ezarpenen atalak',
    epubTextSettings: 'EPUBen testua',
    epubTextSettingsHelp: 'EPUB liburuen testua nola konposatzen den (PDFak jadanik maketatuta iristen dira eta ez dute aldaketa hau onartzen). Ezarpen berak eskura daude irakurtzen ari zarela, letraren botoian. Hemen erabakitzen duzu liburu berri bakoitza zerekin hasten den: liburu bat irekita duzula aldatzen dituzun marjina eta lerrokatzea liburu horrenak baino ez dira.',
    resetTextSettings: 'Berrezarri testua',
    importExport: 'Inportatu eta esportatu', addBooks: 'Gehitu liburuak',
    addBooksHelp: 'Gehitu PDF edo EPUB gailura, edo igo une honetan irekita duzun hodeiko karpetara.',
    addToDevice: 'Gehitu gailura', uploadToCloud: 'Igo hodeira',
    addFolderToDevice: 'Gehitu karpeta bat gailura', uploadFolderToCloud: 'Igo karpeta bat hodeira',
    localBackup: 'Gailu honetako liburutegia',
    localBackupHelp: '«Gailu honetan» dauden liburuak, haien aurrerapena, laster-markak, oharrak eta hobespenak ZIP batean gordetzen ditu. Ez dira konfigurazioa ez hodeiko pasahitza sartzen; Ezarpenetatik gorde ditzakezu bereizita.',
    exportLocalBackup: 'Sortu kopia', restoreLocalBackup: 'Leheneratu gailuan',
    creatingBackup: 'Kopia sortzen…', restoringBackup: 'Kopia leheneratzen…',
    noLocalBooksBackup: 'Ez dago liburu lokalik kopiatzeko.',
    backupCreated: 'Kopia ondo sortu da ({count} liburu).',
    backupRestored: 'Kopia ondo leheneratu da ({count} liburu).',
    backupFailed: 'Ezin izan da kopia sortu: {error}', restoreFailed: 'Ezin izan da leheneratu: {error}',
    invalidBackup: 'Fitxategi hau ez da PageKeeperren baliozko kopia bat.',
    wrongLocalBackup: 'Hau hodeiko kopia bat da, ez gailukoa.',
    restoreBackupConfirm: 'Kopia hau leheneratu? Identifikatzaile bera duten liburuak eta haien datu lokalak ordeztu egingo dira; gainerakoak mantendu egingo dira.',
    pdfPasswordTitle: 'Babestutako PDFa', pdfPasswordHelp: 'Sartu pasahitza PDF hau irekitzeko. Ez da gordeko.',
    pdfPassword: 'PDFaren pasahitza', pdfPasswordIncorrect: 'Pasahitza ez da zuzena.',
    pdfNoTextTitle: 'Testu hautagarririk gabeko PDFa',
    pdfNoTextBadge: 'TESTURIK GABE',
    pdfNoTextHelp: 'Dokumentu hau eskaneatuta dagoela dirudi. Bilaketak, hautapenak eta ozen irakurtzeak ez dute behar bezala funtzionatuko.',
    pdfNoTextStep1: 'Deskargatu PDFa liburuaren menutik.',
    pdfNoTextStep2: 'Ireki Scribe OCRen eta sortu testua duen PDF kopia bat.',
    pdfNoTextStep3: 'Deskargatu kopia hori eta igo berriro PageKeeperrera.',
    pdfNoTextPrivacy: 'PageKeeperrek ez du dokumentua bidaliko: zuk zeuk hautatu beharko duzu kanpoko tresnan.',
    openScribeOcr: 'Ireki Scribe OCR', understood: 'Ulertuta',
    open: 'Ireki', openFailed: 'Ezin izan da liburua ireki: {error}',
    cloudBackup: 'Hodeiko liburutegia',
    cloudBackupHelp: 'WebDAV karpetako eta bere azpikarpetetako PDF eta EPUB guztiak, aurrerapena, laster-markak eta oharrekin batera, ZIP batean gordetzen ditu.',
    exportCloudBackup: 'Sortu hodeiko kopia', restoreCloudBackup: 'Leheneratu hodeian',
    cloudBackupNeedsConfig: 'Konfiguratu lehenengo WebDAV hodei bat Ezarpenetan.',
    readingCloudLibrary: 'Hodeiko liburutegia irakurtzen…',
    noCloudBooksBackup: 'Ez dago hodeiko liburutik kopiatzeko.',
    backingUpCloudBook: '{current}/{total} kopiatzen: «{title}»…',
    cloudBackupCreated: 'Hodeiko kopia ondo sortu da ({count} liburu).',
    restoreCloudConfirm: 'Kopia hau konfiguratutako hodeian leheneratu? Bere azpikarpetak sortuko dira eta bide bera duten liburuak gainidatziko dira.',
    restoringCloudBackup: 'Hodeiko leheneratzea prestatzen…',
    restoringCloudBook: '{current}/{total} igotzen: «{title}»…',
    cloudBackupRestored: 'Kopia hodeian leheneratu da ({count} liburu).',
    wrongCloudBackup: 'Hau gailuko kopia bat da, ez hodeikoa.',
    testConnection: 'Probatu konexioa', save: 'Gorde', deleteConfig: 'Ezabatu konfigurazioa',
    copyConfig: 'Kopiatu konfigurazio-esteka', exportConfigFile: 'Gorde konfigurazioa',
    importConfigFile: 'Leheneratu konfigurazioa', configFileSaved: '✓ Konfigurazioa fitxategi batean gorde da.',
    invalidConfigFile: 'Fitxategiak ez du PageKeeperren baliozko konfiguraziorik.',
    credits: 'Kredituak', license: 'MIT lizentzia', source: 'Iturburu-kodea',
    privacy: 'Pribatutasuna',
    analyticsNotice: 'Aplikazio honek erabilera-estatistika agregatuak baino ez ditu biltzen, norberaren sistema batekin, tresna nola erabiltzen den ezagutu eta hobetzeko. Ez da IP helbiderik gordetzen, ez eta analitika-cookierik erabiltzen ere bisitarientzat.',
    continueReading: 'Jarraitu irakurtzen', recentCount: 'Zenbat irakurketa erakutsi', recentAuto: 'Sartzen diren guztiak', recentN: '{count} irakurketa',
    recentCountHelp: '«Sartzen diren guztiak» hiru edo lau erakusten ditu pantailaren zabaleraren arabera. Gainerakoak ukitu batera daude, «Ikusi gehiago» atalean.', removeContinue: 'Kendu «Jarraitu irakurtzen» liburutegitik', continueRemoved: '«Jarraitu irakurtzen» kendu da. Berriro erakuts dezakezu Ezarpenak → Liburutegia atalean.', continueReadingHelp: 'Zure azken irakurketa, gainerakoak ukitu batera',
    devices: 'Konektatutako gailuak',
    devicesHelp: 'Liburutegi hau erabiltzen ari diren nabigatzaileak, azken sinkronizazio-unearekin. Ezagutzen ez duzun bat ikusten baduzu, aldatu aplikazio-pasahitza.',
    devicesRevokeHelp: '⚠️ «Deskonektatu» gailuari hodeiaren konfigurazioa ahazteko eta berriro eskatzeko esaten dio, eta han irekitzen den hurrengo aldian bakarrik izango du eragina. Ez du zerbitzarirako sarbidea kentzen: horretarako, ezabatu aplikazio-pasahitza zure hodeian.',
    devicesNone: 'Oraindik ez da gailurik konektatu.',
    deviceThisOne: 'gailu hau', deviceUnknown: 'Izenik gabeko gailua',
    deviceAuto: '{browser}, {system} sisteman', deviceCode: '{code} kodea',
    deviceLastSeen: 'azken aldiz: {when}', deviceNeverSeen: 'daturik ez',
    deviceToday: 'gaur', deviceYesterday: 'atzo', deviceDaysAgo: 'duela {count} egun',
    deviceRevokedPending: 'deskonektatuta, irekitzeko zain',
    deviceRevoked: 'deskonektatuta',
    deviceRename: 'Aldatu izena', deviceRenamePrompt: 'Gailu honen izena',
    deviceDisconnect: 'Deskonektatu',
    deviceDisconnectConfirm: '«{name}» deskonektatu? Han PageKeeper hurrengo aldiz irekitzean, hodeiaren konfigurazioa ahaztu eta berriro eskatuko du. Zerbitzarirako sarbidea ez da kentzen: horretarako, ezabatu aplikazio-pasahitza zure hodeian.',
    deviceDisconnected: 'Deskonexioa eskatu da. Gailu horretan PageKeeper hurrengo aldiz irekitzean izango du eragina.',
    deviceWasDisconnected: 'Gailu hau beste batetik deskonektatu da: idatzi berriro zure hodeiaren datuak sinkronizatzen jarraitzeko.',
    cleanup: 'Jada ez dauden liburuak',
    cleanupHelp: 'Liburu bat hodeitik desagertzen denean, bere irakurketa-marka, laster-markak eta oharrak hemen geratzen dira. Lehenik falta dela adierazten da, eta gero baino ez dira ezabatzen, liburua une batez eskuragarri ez egotearen ordez.',
    cleanupDays: 'Zenbat itxaron ezabatu aurretik',
    cleanupNever: 'Ez ezabatu inoiz',
    cleanupDays7: 'Aste bat', cleanupDays15: 'Hamabost egun', cleanupDays30: 'Hilabete bat',
    cleanupDays60: 'Bi hilabete', cleanupDays90: 'Hiru hilabete',
    cleanupDaysHelp: 'Epe hau zure beste gailuekin partekatzen da, guztiek egun berean ezaba dezaten.',
    cleanupCheck: 'Egiaztatu hodeia', cleanupNow: 'Ezabatu orain',
    cleanupChecking: 'Hodeian dagoena begiratzen…',
    cleanupNoCloud: 'Hodeirik konfiguratu gabe. Gailu honetako liburuak bakarrik garbitzen dira ezabatzean, itxaron gabe.',
    cleanupUnchecked: 'Oraindik ez da hodeia egiaztatu saio honetan.',
    cleanupClean: 'Dena ondo dago: {count} elementu hodeian eta ezabatzeko zain dagoen irakurketa-markarik ez.',
    cleanupCleanOne: 'Dena ondo dago: elementu 1 hodeian eta ezabatzeko zain dagoen irakurketa-markarik ez.',
    cleanupMissingOne: 'Liburu 1 falta da; bere irakurketa-marka gordeta jarraitzen du:',
    cleanupSideFilesOne: 'Gainera, oharren fitxategi 1 dago bere liburuaren gabe.',
    cleanupConfirmOne: 'Jada ez dagoen liburu 1en irakurketa-marka, laster-markak eta oharrak orain ezabatu? Ezin da desegin.',
    cleanupDoneOne: 'Jada ez zegoen liburu 1 garbitu da.',
    cleanupMissing: '{count} liburu falta dira; haien irakurketa-marka gordeta jarraitzen du:',
    cleanupMissingOn: '{name} — {date} datan ezabatuko da',
    cleanupMissingNever: '{name} — ez da ezabatuko (inoiz ez ezabatzea aukeratu duzu)',
    cleanupSideFiles: 'Gainera, {count} oharren fitxategi daude beren liburuaren gabe.',
    cleanupConfirm: 'Jada ez dauden {count} liburuen irakurketa-marka, laster-markak eta oharrak orain ezabatu? Ezin da desegin.',
    cleanupDone: 'Jada ez zeuden {count} liburu garbitu dira.',
    cleanupNothing: 'Ez zegoen ezabatzeko ezer: liburuak berriro agertu dira.',
    showMoreRecent: 'Ikusi {count} gehiago', showFewerRecent: 'Ikusi gutxiago',
    removeFromContinue: 'Kendu «{title}» Jarraitu irakurtzen ataletik',
    filterBy: 'Erakutsi', filterAll: 'Guztiak', filterReading: 'Irakurtzen', filterPending: 'Zain', filterFinished: 'Amaituta',
    sortBy: 'Ordenatu honela', sortRecent: 'Irakurketa berriena', sortTitle: 'Izenburua', sortAuthor: 'Egilea', sortProgress: 'Aurrerapena',
    rating: 'Balorazioa', ratingNone: 'Baloratu gabe', ratingOf: '{max}(e)tik {n} izar',
    openedWithoutSync: 'Ezin izan da egiaztatu beste gailu batean aurrera egin zenuen: hemen zeunden lekuan irekitzen da.',
    positionFromOtherDevice: 'Beste gailu batean utzitako posizioa berreskuratu da.',
    remotePositionAskEpub: 'Beste gailu batean irakurketa % {remoto}(e)ra iritsi zen eta hemen % {local}(e)an zaude. Hara joan nahi duzu?',
    remotePositionAskPdf: 'Beste gailu batean irakurketa {paginas}(e)tik {remoto}. orrialdera iritsi zen eta hemen {local}. orrialdean zaude. Hara joan nahi duzu?',
    remotePositionGo: 'Joan hara',
    remotePositionStay: 'Hemen geratu',
    remotePositionStayed: 'Gailu honetako posizioa mantentzen da.',
    bookNoteRating: 'Oharra eta balorazioa',
    ratingHint: 'Sakatu markatutako izarra balorazioa kentzeko',
    sortRating: 'Balorazioa', filterRated4: '4 izar edo gehiago', filterRated3: '3 izar edo gehiago', filterUnrated: 'Baloratu gabe',
    filterGroupStatus: 'Irakurketa', filterGroupRating: 'Balorazioa',
    viewLabel: 'Ikuspegia', viewList: 'Zerrenda-ikuspegia', viewGrid: 'Sareta-ikuspegia',
    toggleSection: 'Tolestu edo zabaldu atala',
    markFinished: '«{title}» amaituta gisa markatu', markUnfinished: 'Kendu «Amaituta» etiketa «{title}»-tik', finished: 'Amaituta',
    sampleBookHeading: 'Hasi adibidezko liburu batekin', sampleBookHelp: 'Zure liburutegia hutsik dago. Gehitu adibide hauetako bat PageKeeper probatzeko:',
    loadingSampleBook: 'Adibidezko liburua prestatzen…',
    loadingLibrary: 'Liburutegia kargatzen…', noCloudBooks: 'Oraindik ez dago sinkronizatutako liburu bat ere. Erabili igotzeko botoia lehenengoa gehitzeko.',
    notStarted: 'hasi gabe', read: 'irakurrita', page: 'Orrialdea', of: 'guztira',
    bookActions: '«{title}»-ren ekintzak',
    actionUpload: 'Igo hodeira', actionMove: 'Eraman beste karpeta batera', actionDownload: 'Deskargatu',
    actionOffline: 'Lineaz kanpo eskuragarri', actionRemoveOffline: 'Kendu lineaz kanpoko kopia',
    actionUpdateOffline: 'Eguneratu lineaz kanpoko kopia', actionDelete: 'Ezabatu',
    actionBookNote: 'Liburuaren oharra', bookNote: 'Liburuaren oharra', bookNoteLabel: 'Liburu honi buruzko zure oharra',
    bookNotePlaceholder: 'Zertaz doan, non utzi zenuen, zer gogoratu nahi duzun…',
    actionFolderNote: 'Karpetaren oharra', folderNote: 'Karpetaren oharra',
    folderNotePlaceholder: 'Zer gordetzen duzun hemen eta zertarako…',
    noFolderNote: 'Oraindik ez dago oharrik karpeta honi buruz.',
    editBookNote: 'Idatzi liburuaren oharra', noBookNote: 'Oraindik ez dago oharrik liburu honi buruz.',
    actionRename: 'Aldatu izena',
    actionMarkFinished: 'Markatu amaituta gisa', actionMarkUnfinished: 'Kendu «Amaituta»',
    renameBookPrompt: 'Liburutegian erakusteko izena (utzi hutsik fitxategiarena erabiltzeko):',
    actionDeleteFolder: 'Ezabatu karpeta',
    actionDownloadFolderZip: 'Deskargatu karpeta (ZIP)',
    actionSaveFolderToDisk: 'Gorde karpeta ekipoan',
    packingFolder: 'Karpeta prestatzen…',
    packingFolderItem: '«{title}» ({current}/{total})',
    folderDownloadedOne: '«{name}» karpeta gorde da: liburu 1.',
    folderDownloadedMany: '«{name}» karpeta gorde da: {count} liburu.',
    folderHasNoBooks: 'Karpeta horrek ez du deskargatzeko liburu bat ere.',
    folderDownloadedPartial: '«{name}» karpeta gorde da. Ez dira sartu: {failed}/{total}.',
    folderDownloadFailed: 'Ezin izan da karpetako liburu bat ere lortu.',
    bookGone: 'liburua ez dago jada gailu honen biltegian',
    removeOfflineConfirm: '«{title}»-ren lineaz kanpoko kopia kendu? Hodeiko liburua ez da ezabatuko.',
    savingOffline: '«{title}» lineaz kanpo irakurtzeko gordetzen…', offlineSaved: '«{title}» lineaz kanpo eskuragarri dago jada ({size} MB).',
    offlineRemoved: 'Lineaz kanpoko kopia ezabatu da. Liburua hodeian jarraitzen du.', availableOffline: 'LINEAZ KANPO', offlineOutdated: 'EGUNERATU',
    offlineLibrary: 'Lineaz kanpo: gailu honetan gordetako kopiak erakusten dira.',
    offlineFolderEmpty: 'Ez dago lineaz kanpoko koparik karpeta honetan.', openedOfflineCopy: 'Lineaz kanpoko kopiatik irekita.',
    offlineUpdateFailed: 'Liburua ireki da, baina ezin izan da bere lineaz kanpoko kopia eguneratu.',
    storageFull: 'Ez dago nahikoa lekurik «{title}» lineaz kanpo gordetzeko.',
    fillUrlUser: 'Bete gutxienez URLa eta erabiltzailea.', configSaved: 'Konfigurazioa gorde da.', connecting: 'Konektatzen…',
    connectionOk: '✓ Konexioa ondo: {count} liburu aurkitu dira.', configDeleted: 'Konfigurazioa ezabatu da.',
    invalidConfigLink: 'Konfigurazio-esteka ez da baliozkoa.', cloudConfigImported: 'Hodeiaren konfigurazioa inportatu da.',
    copyLinkFirst: 'Bete (edo gorde) lehenengo URLa eta erabiltzailea.', linkCopied: '✓ Esteka kopiatu da. Ireki beste gailuan.',
    copyLinkPrompt: 'Kopiatu esteka eta ireki beste gailuan:',
    downloading: '«{title}» deskargatzen…', opening: '«{title}» irekitzen…', adding: '«{title}» gehitzen…', uploading: '«{title}» zure hodeira igotzen…', deleting: '«{title}» ezabatzen…',
    cloudBookDeleted: 'Liburua hodeitik ezabatu da.', localBookDeleted: 'Liburua gailu honetatik ezabatu da.',
    cloudBookDeletedPending: 'Liburua ezabatu da. Aurrerapena garbitzea berriro saiatuko da konexioa itzultzean.',
    cloudUploaded: '«{title}» zure hodeira igo da.', cloudSaved: 'Zure hodeian gorde da. Gailuen artean sinkronizatzen da jada.',
    continuing: 'Utzi zenuen tokitik jarraitzen', continuingPage: '{page} orrialdean jarraitzen',
    overwrite: '«{title}» jada existitzen da zure hodeian. Gainidatzi nahi duzu?',
    deleteCloudConfirm: '«{title}» zure hodeitik ezabatu? Fitxategia zerbitzaritik kenduko da.',
    deleteLocalConfirm: '«{title}» gailu honetatik ezabatu?',
    deleteConfigConfirm: 'Zerbitzariaren konfigurazioa ezabatu? Hodeian gordetako aurrerapena ez da ukituko.',
    replaceConfigConfirm: 'Inportatutako konfigurazioak uneko hodeiaren konfigurazioa ordeztuko du. Jarraitu?',
    epubMargin: '% {value} alde bakoitzean', pageMode: 'Ikusi orrialdez orrialde (liburu bat bezala)', scrollMode: 'Ikusi orrialde jarraituak (korritzea)',
    twoPages: 'Ikusi bi orrialde elkarrekin', onePage: 'Ikusi orrialde bakarra', rotatePage: 'Biratu orrialdea',
    readAloud: 'Ozen irakurtzea', ttsPlay: 'Irakurri hemendik', ttsPause: 'Pausatu', ttsResume: 'Jarraitu',
    ttsStop: 'Gelditu', ttsVoice: 'Ahotsa', ttsAutoVoice: 'Automatikoa', ttsSpeed: 'Abiadura',
    ttsHelp: 'Uneko orrialdean hasten da, entzuten ari den esaldia nabarmentzen du eta orrialdez bakarrik aldatzen da.',
    ttsNoSupport: 'Nabigatzaile honek ez du ozen irakurtzea onartzen.',
    ttsNoText: 'Ez da irakurtzeko testurik aurkitu (eskaneatutako dokumentu bat izan daiteke).',
    immersive: 'Irakurri pantaila osoan', immersiveExit: 'Irten pantaila osotik',
    timeLeft: 'Falta den irakurketa-denbora estimatua', timeLeftMenu: 'Falta den denbora: {time}',
    reader: 'Irakurgailua', readerScreen: 'Pantailan', showStatusBar: 'Erakutsi datu-barra behean',
    showStatusBarHelp: 'Irakurgailuaren beheko lerroa, kapituluko orrialdea, liburuaren pantaila, irakurritako ehunekoa eta falta den denbora dituena. Ezkutatzean, altuera pixka bat testuari itzultzen zaio.',
    statusChapter: '{page} / {total} kap.', statusChapterTitle: 'Kapituluko pantaila',
    statusScreens: '{page}. pant. ~{total}etik',
    statusScreensTitle: 'Liburuak gailu honetan hartzen dituen pantailak, uneko letra eta marjinarekin. Estimazio bat da eta ezarpen horiek ukitzean aldatzen da.',
    statusPage: '{page}. orrialdea, {total}etik', statusPageTitle: 'Dokumentuaren orrialdea',
    statusRead: '% {percent} irakurrita', statusReadTitle: 'Irakurritako liburuaren zatia',
    timeLessMinute: '< 1 min', timeMinutes: '{m} min', timeHoursMinutes: '{h} h {m} min', goPercent: 'Joan liburuaren ehunekora (0–100):', goToPage: 'Joan orrialdera (1–{total}):',
    sampleNoticeHtml: '<h2>Bi liburu hasteko</h2><span>Zure liburutegiak adibidezko bi liburu ditu, PageKeeper hasieratik bertatik proba dezazun. Zureak dira: irakur, gorde edo ezaba ditzakezu nahi duzunean, liburu bakoitzaren ekintza-menutik.</span>',
    dontShowAgain: 'Ez erakutsi berriro',
    noConfigHtml: '<span>Ez dago zerbitzaririk konfiguratuta. Liburu bat (PDF edo EPUB) gailu honetatik ireki dezakezu, edo <a href="#" id="enlace-configurar">zure hodeia konfiguratu (Nextcloud edo beste WebDAV bat)</a> irakurketaren posizioa gailuen artean sinkronizatzeko.</span><p class="ayuda">Ez dakizu hau zer den edo zer behar duzun? <a href="#" id="enlace-ayuda-aviso">Irakurri laguntza</a>.</p>',
    syncError: 'Sinkronizazio-errorea', syncFailed: 'Ezin izan da aurrerapena sinkronizatu: {error}',
    syncRecovered: 'Zure posizioa hodeian gorde da jada',
    stats: 'Irakurketa-estatistikak', statsView: 'Ikusi estatistikak',
    statsSettingsHelp: 'Irakurtzen ematen duzun denbora, jarraian daramatzazun egunak eta denbora gehien hartzen duten liburuak, zure gailu guztiak batuta.',
    statsSummary: 'Zure irakurketa', statsLastDays: 'Azken 30 egunak',
    actionBookStats: 'Irakurketa-denbora',
    statusTimeSpentTitle: 'Liburu hau irakurtzen daramazun denbora. Sakatu xehetasunean ikusteko.',
    statusPaused: 'Etenda',
    statusPausedTitle: 'Emandako denbora ez da gehitzen ari: bost minutu baino gehiago daramatzazu orrialde berean. Orrialdea aldatu bezain laster berriro kontatzen hasiko da.',
    statsBookTime: 'Emandako denbora', statsBookRead: 'Irakurrita', statsBookPace: 'Erritmoa',
    statsPacePerPage: 'orrialdeko {time}', statsPaceSeconds: 'orrialdeko {s} s',
    statsBookByDevice: 'Gailu bakoitzean',
    statsHideFromList: 'Ezkutatu zerrendatik',
    statsShowInList: 'Erakutsi berriro zerrendan',
    statsHideNote: '«Non joaten da denbora» atalean agertzeari utziko dio. Ez da ezer ezabatzen: berriro tarte batez irakurtzen duzunean zerrendara itzuliko da.',
    statsHiddenNote: 'Orain ez da «Non joaten da denbora» atalean agertzen. Berriro tarte batez irakurtzean itzuliko da bera bakarrik.',
    statsBookEmpty: 'Oraindik ez dago liburu honetako denborarik apuntatuta. Liburua irekita minutu batzuk irakurri bezain laster, hemen agertuko da zenbat denbora eman diozun.',
    statsShared: 'Zure gailu guztien batura: mugikorrean eta ordenagailuan irakurritakoa batera zenbatzen da, eta bietan irakurri duzun egun bat serie bereko egun bakar gisa zenbatzen da.',
    statsTopBooks: 'Nora doan denbora',
    statsSortBy: 'Ordenatu honela', statsSortTime: 'Emandako denbora',
    statsSortRecent: 'Azken irakurraldia', statsSortTitle: 'Izenburua',
    statsLastRead: '{date}(e)an irakurria', statsBookGone: 'jada ez dago liburutegian', statsDataTitle: 'Datu hauei buruz',
    statsEmptyTitle: 'Oraindik ez dago zer kontatu',
    statsEmpty: 'Liburu bat irekita minutu batzuk irakurri bezain laster, orrialde honetan agertuko dira emandako denbora, jarraian daramatzazun egunak eta denbora gehien hartzen duten liburuak.',
    statsPrivacy: 'Hodeia konfiguratuta dagoenean, irakurketa-denborak irakurketaren posizioarekin bidaiatzen du: gailu bakoitzak berea apuntatzen du eta hemen batura erakusten da, gailu bakoitzean zatika irakurri arren liburu batek zenbat denbora hartu dizun jakiteko. Zure WebDAV zerbitzari propioan bidaiatzen dute, zure liburuekin batera, eta ez dira inora bidaltzen. Hodeirik konfiguratu gabe, nabigatzaile honetan gelditzen dira. Liburua aurrean duzun denbora bakarrik zenbatzen da: aplikazioa bistan ez dagoen bitartean erlojua gelditzen da, eta posizio-jauziak ez dira batzen. Orrialde bakoitzeko bost minutu zenbatzen dira gehienez; hori igarota, oineko barrak etenda dagoela adierazten du, eta orrialdea pasatzean berriro zenbatzen hasten da.',
    statsDelete: 'Ezabatu estatistikak',
    statsDeleteConfirm: 'Irakurketa-estatistikak ezabatu? Zure gailu guztietan ezabatzen dira: konektatuta daudenek sinkronizatzean egingo dute. Ez die eragiten zure liburuei, zauden orrialdeari edo zure oharrei.',
    statsDeleted: '✓ Estatistikak ezabatu dira. Beste gailuek sinkronizatzean ezabatuko dituzte.',
    statsOptOut: 'Ez neurtu irakurketa-denbora',
    statsOptOutHelp: 'Denbora, egun jarraituak eta liburu bakoitzari eskainitako tartea zenbatzeari uzten dio. Aktibatzean orain arte apuntatutakoa ezabatzen da, eta ezin da berreskuratu. Hodeia konfiguratuta, erabakia zure beste gailuetara ere iristen da: sinkronizatu bezain laster neurtzeari uzten diote.',
    statsOptOutConfirm: 'Irakurketa-denbora neurtzeari utzi?\n\nOrain arte apuntatutako guztia —denbora, egun jarraituak eta liburu bakoitzaren tartea— ezabatuko da, eta ezin izango da berreskuratu. Hodeia konfiguratuta baduzu, ezabatzea zein ez neurtzeko erabakia zure beste gailuetara iritsiko dira.',
    statsOffTitle: 'Ez da ezer neurtzen ari',
    statsOff: 'Irakurketa-denboraren zenbaketa desaktibatuta duzu. Hemen behean, «Datu hauek» atalean, berriz aktiba dezakezu; zerotik hasiko da zenbatzen.',
    statsOffDone: '✓ Neurtzeari utzi zaio eta zegoena ezabatu da.',
    statsOnAgain: '✓ Berriro neurtzen da, zerotik hasita.',
    statsTotal: 'Denbora osoa', statsToday: 'Gaur', statsWeek: 'Azken 7 egunak',
    statsStreak: 'Jarraian dauden egunak', statsAverage: 'Irakurritako eguneko batez bestekoa',
    statsActiveDays: 'Irakurketa-egunak', statsBestDay: 'Egunik onena', statsPdfPages: 'PDF orrialdeak',
    statsBestStreak: 'zure serie onena: {streak}', statsStreakNow: 'serie martxan',
    statsNoStreak: 'gaur edo bihar hasten da bat',
    statsDays: '{count} egun', statsDaysOne: '{count} egun', statsHours: '{h} h',
    statsChartLabel: 'Azken {days} egunetako bakoitzean irakurritako denboraren grafikoa.',
    statsChartSummary: 'Azken 30etatik {days}etan irakurri duzu, {total} guztira.',
    statsGroupBy: 'Taldekatu honela',
    statsByDay: 'Egunak', statsByWeek: 'Asteak', statsByMonth: 'Hilabeteak', statsByYear: 'Urteak',
    statsLastWeeks: 'Azken 12 asteak', statsLastMonths: 'Azken 12 hilabeteak',
    statsLastYears: 'Azken 5 urteak',
    statsCount_semana: '{count} astetan', statsCount_semanaOne: 'aste {count}ean',
    statsCount_mes: '{count} hilabetetan', statsCount_mesOne: 'hilabete {count}ean',
    statsCount_anno: '{count} urtetan', statsCount_annoOne: 'urte {count}ean',
    statsChartSummaryPeriod: '{count} irakurri duzu, {total} guztira.',
    statsWeekOf: '{date}(e)ko astea',
    statsThisWeek: 'Aste honetan', statsThisMonth: 'Hilabete honetan', statsThisYear: 'Aurten',
    statsThisDay: 'Gaur',
    statsPrevWeek: 'Aurreko astea', statsPrevMonth: 'Aurreko hilabetea',
    statsPrevYear: 'Aurreko urtea', statsPrevDay: 'Atzo',
    statsSoFar: 'orain arte', statsUpToMonth: '{month} arte',
    statsMoreThanBefore: '% {percent} gehiago', statsLessThanBefore: '% {percent} gutxiago',
    statsSame: 'Berdin', statsFirstTime: 'Hasi zara', statsNoTime: 'Ezer ez',
    statsHistoryFrom: 'Eguneko xehetasuna {date} arte iristen da.',
    statsChartEmpty: 'Ez duzu ezer irakurri azken 30 egunotan.',
    statsChartDay: '{date}: {time}', statsChartDayNone: '{date}: irakurketarik ez',
    statsBooksTracked: 'Azken {count}en artean.',
    statsBookUntitled: 'Izenbururik gabeko liburua',
    activityLog: 'Jarduera-erregistroa',
    activityLogHelp: 'Irakurketa-posizioa zerbitzarira iristen den ala ez, eta iristea eragozten duten erroreak jasotzen ditu. Balio du liburu bat beste gailu batean atzean gelditu zergatik jakiteko. Hemen bakarrik gordetzen da, inoiz ez du gailu hau uzten eta bakarrik astebete pasa ondoren ezabatzen da.',
    viewLog: 'Ikusi erregistroa', clearLog: 'Hustu', copyLog: 'Kopiatu', downloadLog: 'Gorde',
    logEmpty: 'Oraindik ez dago ezer erregistratuta.',
    logWithErrors: '{errores} errore erregistratuta',
    logNoErrors: '{total} gertaera, bat bera ere errorerik gabe',
    logCopied: 'Erregistroa kopiatu da', logCopyFailed: 'Ezin izan da kopiatu; erabili «Gorde»',
    logRecovered: 'huts egindako {intentos} saioren ondoren igo da',
    logRetrying: 'berriro saiatzen (jarraian huts egindakoak: {intentos})',
    logOffline: 'lineaz kanpo: konexioa itzultzeko zain',
    logBackOnline: 'konexioa berreskuratu da', logWentOffline: 'konexioa galdu da',
    cloudScope: 'Zure gailu guztietan eskuragarri dauden liburuak eta aurrerapena',
    localScope: 'Gailu honetan bakarrik gordetako liburuak',
    emptyLocalAction: 'Gehitu liburuak gailu honetara bakarrik',
    emptyLocalHelp: 'Ez dira sinkronizatuko. Hautatu PDF edo EPUB fitxategiak, edo arrastatu hona.',
    webdavHelpHtml: 'Nextcloud, ownCloud eta edozein WebDAV zerbitzarirekin bateragarria. Adierazitako karpetako PDFak zure liburutegian agertuko dira eta irakurketaren posizioa zure gailu guztien artean sinkronizatuko da. Ez dakizu zer jarri hemen? <a href="#" id="enlace-ayuda-ajustes">Irakurri laguntza</a>.',
    passwordHelpHtml: '⚠️ Nextclouden sortu <strong>aplikazio-pasahitz</strong> bat (Ezarpenak → Segurtasuna), ez erabili zure pasahitz nagusia. Gainera, nabigatzaileak konektatu ahal izateko, zerbitzariak CORS onartu behar du: Nextclouden instalatu <strong>WebAppPassword</strong> aplikazioa eta gehitu irakurgailu honen domeinua. Datuak nabigatzaile honetan bakarrik gordetzen dira.',
    transferHelp: 'Esteka bat kopiatu edo URLa, erabiltzailea eta aplikazio-pasahitza dituen fitxategi bat gorde ditzakezu, eta beste gailu batean ireki. ⚠️ Estekak eta fitxategiak zure hodeirako sarbidea ematen dute: gorde pribatuki eta ezabatu behar ez dituzun kopiak.',
    creditsHtml: '<a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) eta <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> ikonoekin (ISC) eraikia.',
    dropLocal: 'Askatu hemen gailu honetan gordetzeko', dropCloud: 'Askatu hemen hodeira igotzeko',
    unsupportedFiles: 'PDF edo EPUB fitxategiak baino ezin dira gehitu.',
    localDuplicate: 'Liburu hori dagoeneko gailu honetan dago, «{title}» izenarekin gordeta.',
    noBooksInFolder: 'Karpeta horrek ez du PDF edo EPUB fitxategirik.', localAddedOne: 'Liburua gailu honetan gorde da.', localAddedMany: '{count} liburu gailu honetan gorde dira.',
    saveFailed: 'Ezin izan da «{title}» gorde: {error}',
    searchLibrary: 'Bilatu liburutegian', clearSearch: 'Garbitu bilaketa', searchLibraryPlaceholder: 'Bilatu izenburu, egilearen arabera…',
    showIndex: 'Erakutsi aurkibidea', hideIndex: 'Ezkutatu aurkibidea',
    showThumbs: 'Erakutsi miniaturak', hideThumbs: 'Ezkutatu miniaturak',
    showIndexThumbs: 'Erakutsi aurkibidea eta miniaturak',
    hideIndexThumbs: 'Ezkutatu aurkibidea eta miniaturak',
    searchBook: 'Bilatu liburuaren barruan', bookIndex: 'Liburuaren aurkibidea', bookStart: 'Liburuaren hasiera', historyNavigation: 'Nabigazio-historia', backPosition: 'Itzuli aurreko posiziora', forwardPosition: 'Aurreratu hurrengo posiziora', pageAndHistory: 'Orrialdea eta nabigazio-historia', wordOrPhrase: 'Hitza edo esaldia', search: 'Bilatu', close: 'Itxi', zoomedImage: 'Irudi handitua',
    searchingBook: 'Liburuan bilatzen…', searchProgress: 'Bilatzen… {done}/{total} · {count} emaitza.', noSearchResults: 'Ez da emaitzarik aurkitu.', searchResults: '{count} emaitza.',
    chapter: 'Kapitulua', noLibraryResults: 'Ez dago bilaketarekin bat datorren liburu bat ere.',
    searchingFolders: 'Karpeten barruan ere bilatzen…', inFolder: '«{name}» karpetan',
    bookmarks: 'Laster-markak', bookmark: 'Laster-marka', addBookmark: 'Gehitu laster-marka bat hemen',
    annotations: 'Oharrak', noAnnotations: 'Oraindik ez dago oharrik.',
    highlightColor: 'Nabarmentze-kolorea', highlightYellow: 'Nabarmendu horiz',
    highlightGreen: 'Nabarmendu berdez', highlightBlue: 'Nabarmendu urdinez', highlightPink: 'Nabarmendu arrosaz',
    exportAnnotations: 'Esportatu oharrak (Markdown)', exportHeader: '«{title}»-ren oharrak',
    exportSource: 'PageKeeperretik esportatuta', annotationsExported: 'Oharrak esportatu dira.',
    searchAnnotations: 'Bilatu oharretan', noAnnotationResults: 'Ez dago bat datorren oharrik.',
    selectionActions: 'Hautatutako testuarentzako ekintzak', highlight: 'Nabarmendu', addNote: 'Gehitu oharra',
    note: 'Oharra', notePrompt: 'Hautatutako testuari buruzko oharra:', editNote: 'Editatu oharra', deleteAnnotation: 'Ezabatu oharra', deleteAnnotationConfirm: 'Ohar hau ezabatu?', noteActions: 'Oharraren aukerak',
    annotationAdded: 'Oharra gorde da.', annotationDeleted: 'Oharra ezabatu da.',
    bookmarkName: 'Laster-markaren izena', bookmarkNamePlaceholder: 'Laster-markaren izena (aukerakoa)',
    bookmarkNamePrompt: 'Laster-markaren izena (utzi hutsik kentzeko):', editBookmark: 'Aldatu laster-markaren izena',
    noBookmarks: 'Oraindik ez dago laster-markarik.', bookmarkAdded: 'Laster-marka gehitu da.',
    bookmarkRenamed: 'Laster-markaren izena eguneratu da.',
    bookmarkRemoved: 'Laster-marka ezabatu da.', bookmarkExists: 'Jada badago laster-marka bat posizio honetan.',
    deleteBookmark: 'Ezabatu laster-marka',
    cloudRoot: 'Hasiera', currentFolder: 'Uneko karpeta', targetFolder: 'Helmugako karpeta',
    newFolder: 'Sortu karpeta bat', folderNamePrompt: 'Karpeta berriaren izena:',
    invalidFolderName: 'Karpetaren izena ez da baliozkoa.',
    creatingFolder: '«{name}» karpeta sortzen…', folderCreated: '«{name}» karpeta sortu da.',
    renamingFolder: '«{name}»-ren izena aldatzen…',
    openFolder: 'Ireki «{name}» karpeta',
    folderEmpty: 'Hutsik', folderItemsOne: 'elementu 1', folderItems: '{count} elementu',
    sectionFoldersOne: 'karpeta 1', sectionFolders: '{count} karpeta',
    sectionBooksOne: 'liburu 1', sectionBooks: '{count} liburu',
    deleteFolderConfirm: '«{name}» karpeta eta bere eduki guztia zure hodeitik ezabatu?',
    folderDeleted: 'Karpeta hodeitik ezabatu da.', emptyFolder: 'Karpeta hau hutsik dago.',
    deviceRoot: 'Hasiera', actionRenameFolder: 'Aldatu karpetaren izena',
    actionSaveToDevice: 'Gorde gailu honetan',
    imagesInvertedOff: 'Itzuli irudiei euren kolorea',
    imagesInvertedOn: 'Irudiak euren kolorean: aktibatuta. Sakatu orrialdearekin batera alderantzikatzeko',
    library: 'Liburutegia', showContinueReading: 'Erakutsi «Jarraitu irakurtzen»',
    showContinueReadingHelp: 'Zure azken irakurketak dituen kutxa, liburutegiaren gainean. Ezkutatzean, liburuak zeuden tokian jarraitzen dute eta euren orrialdea mantentzen dute.',
    openLastOnStart: 'Ireki azken irakurketa PageKeeper abiaraztean',
    openLastOnStartHelp: 'Aplikazioa irekitzean, zuzenean irakurtzen ari zinen liburura joango zara, liburutegitik pasatu gabe. Gailu honetan bakarrik gogoratzen da: gainerakoetan liburutegira iristen jarraituko duzu.',
    theme: 'Gaia', themeAuto: 'Sistemarena', themeLight: 'Argia', themeSepia: 'Sepia',
    statsBookCard: 'Ikusi «{title}» liburuaren denbora',
    themeDark: 'Iluna', themeBlack: 'Beltza',
    autoTheme: 'Sistemaren gaia',
    autoThemeHelp: 'Gaia «sistemarena» dagoenean, aplikazioa gailuaren gainerakoarekin batera argitzen edo iluntzen da. Hemen aukeratzen duzu alde bakoitzean zein gairekin egiten duen. Bost gaiak goiburuko botoian eskura jarraitzen dute; honek «sistemarena» nora doan bakarrik erabakitzen du.',
    autoThemeLight: 'Sistema argi dagoenean',
    autoThemeDark: 'Sistema ilun dagoenean',
    autoThemeNow: 'Oraintxe zure sistemak {theme} gaia eskatzen du, eta hori ari zara ikusten.',
    autoThemeIdle: 'Gaia eskuz {theme} jarrita duzu, beraz honek ez du ezer aldatzen oraingoz. Itzuli goiburuko botoian «sistemarena» aukerara balio izan dezan.',
    actionMoveFolder: 'Eraman karpeta', moveFolderTo: '«{name}» karpeta eraman',
    folderMoved: '«{name}» karpeta eraman da.',
    savedToDevice: '«{title}» gailu honetan gorde da.',
    folderRenamePrompt: 'Karpetaren izen berria:', folderRenamed: 'Karpetaren izena aldatu da.',
    folderExists: 'Jada badago izen hori duen karpeta bat hemen.',
    deleteLocalFolderConfirm: '«{name}» karpeta eta bertan dituen liburu guztiak gailu honetatik ezabatu?',
    localFolderDeleted: 'Karpeta gailu honetatik ezabatu da.',
    emptyLocalFolder: 'Karpeta honek ez du liburu bat ere oraindik.',
    moveToDeviceFolder: 'Eraman «{title}» gailuko beste karpeta batera',
    moveBook: 'Eraman «{title}» beste karpeta batera', moveHere: 'Eraman hona',
    moving: '«{title}» eramaten…', bookMoved: '«{title}» eraman da.', cancel: 'Utzi',
    loadingFolders: 'Karpetak kargatzen…', noSubfolders: 'Azpikarpetarik ez.',
    textSettings: 'Testu-ezarpenak', fontFamily: 'Letra-mota',
    bookFont: 'Liburuarena', serifFont: 'Serifarekin', sansFont: 'Serifarik gabe',
    lineSpacing: 'Lerroartea', bookSpacing: 'Liburuarena', spacingCompact: 'Trinkoa',
    spacingNormal: 'Normala', spacingWide: 'Zabala', spacingWider: 'Oso zabala',
    hyphenation: 'Hitzak zatitzea', hyphenationAuto: 'Bai, lerro amaieran',
    hyphenationBook: 'Liburuak bezala', hyphenationNever: 'Ez zatitu inoiz',
    textAlignment: 'Lerrokatzea', bookAlignment: 'Liburuarena',
    unjustifiedAlignment: 'Justifikatu gabe',
    justifiedAlignment: 'Justifikatuta',
    columnsSettings: 'Zutabeak', columnsAuto: 'Automatikoak',
    columnsOne: 'Zutabe bat', columnsTwo: 'Bi zutabe',
    columnsThree: 'Hiru zutabe', columnsFour: 'Lau zutabe',
    columnsSettingsHelp: 'Testua pantailan zenbat zutabetan banatzen den. Automatikoan, lerroak deseroso bihurtu gabe sartzen diren beste sartzen dira, eta berez aldatzen dira gailua biratzean edo letraren tamaina ukitzean. Liburu bat zabalik dagoela, zutabeen botoiak liburu horrena bakarrik aldatzen du; hemengoa gainerakoak hasteko modua da. Hau ez da beste gailuetara bidaltzen: pantaila bakoitza mundu bat da.',
    lineLength: 'Lerroak gehienez', lineLengthValue: '{value} letra',
    moreColumns: 'Zutabe gehiago', fewerColumns: 'Zutabe gutxiago',
    lineLengthHelp: 'Automatikoan bakarrik balio du: beste zutabe bat irekitzen da testuak ematen duen bezain laster, bat ere luzera horretatik pasatu gabe. Lerro laburrekin lehenago agertzen dira; lerro luzeekin, beranduago.',
  },
  de: {
    appTagline: 'E-Book-Reader',
    appVersion: 'PageKeeper {version}',
    // Imprimir el EPUB en papel o en PDF.
    printBook: 'Drucken oder als PDF speichern',
    printHelp: 'Es öffnet sich der Druckdialog des Browsers, in dem du den Drucker oder „Als PDF speichern“ wählen kannst.',
    printPaper: 'Papier',
    printPaperLetter: 'Letter',
    printMargins: 'Ränder',
    printMarginNarrow: 'Schmal',
    printMarginNormal: 'Normal',
    printMarginWide: 'Breit',
    printFont: 'Schriftgröße',
    printFontSmall: 'Klein',
    printFontNormal: 'Normal',
    printFontLarge: 'Groß',
    printAnnotations: 'Markierungen und Notizen einbeziehen',
    selectAll: 'Alle',
    selectNone: 'Keine',
    print: 'Drucken',
    printChapterNumber: 'Kapitel {number}',
    printNoChapters: 'Keine Kapitel',
    printWholeBook: 'Das ganze Buch',
    printSomeChapters: '{count} von {total} Kapiteln',
    printPreparing: 'Dokument wird vorbereitet… {done} von {total}',
    printNotesHeading: 'Notizen',
    printFallbackTitle: 'Buch',
    printChapterFailed: 'Das Kapitel „{title}“ konnte nicht gesetzt werden.',
    printFailed: 'Das Dokument konnte nicht zum Drucken vorbereitet werden.',
    language: 'Sprache', help: 'Hilfe', settings: 'Einstellungen', back: 'Zurück', cloud: 'In der Cloud',
    device: 'Auf diesem Gerät', addLocal: 'Ein Buch (PDF oder EPUB) von diesem Gerät hinzufügen',
    addCloud: 'Ein Buch (PDF oder EPUB) in die Cloud hochladen', reload: 'Neu laden',
    addLocalFolder: 'Einen ganzen Ordner von diesem Gerät hinzufügen',
    addCloudFolder: 'Einen ganzen Ordner in die Cloud hochladen',
    backLibrary: 'Zurück zur Bibliothek', saveCloud: 'In meiner Cloud speichern', zoom: 'Zoom', zoomOut: 'Verkleinern', autoWidth: 'An Breite anpassen', fitPage: 'Ganze Seite anpassen', cropMargins: 'Ränder zuschneiden', skipToContent: 'Zum Inhalt springen', bookIndexShort: 'Inhalt', thumbnails: 'Miniaturansichten', resizePanel: 'Breite des Bedienfelds ändern', bookNavigation: 'Navigation im Buch', pageThumbnails: 'Seitenminiaturen', noMarginsToCrop: 'Dieses Buch hat keine zuschneidbaren Ränder.', zoomIn: 'Vergrößern',
    zoomLevel: 'Zoom:', zoomChange: 'Zum Ändern tippen',
    zoomSettings: 'Zoomstufe wählen', customZoom: 'Andere', apply: 'Anwenden',
    moreReaderActions: 'Weitere Aktionen', readerActions: 'Leseaktionen',
    previous: 'Vorherige Seite', next: 'Nächste Seite', goPage: 'Zu einer Seite springen',
    marginSide: 'Seitenrand', noMargin: 'Kein Rand', moreMargin: 'Mehr Rand',
    zoomHelp: 'Wird nur für dieses Buch gespeichert.',
    marginHelp: 'Der Text passt sich beim Bewegen des Reglers neu an. Der Rand gehört zu diesem Buch.', reset: 'Zurücksetzen',
    webdavFolder: 'URL des WebDAV-Ordners', user: 'Benutzername', appPassword: 'App-Passwort',
    webdav: 'Cloud (WebDAV)', transferConfig: 'Konfiguration auf ein anderes Gerät übertragen',
    webdavShort: 'Cloud', settingsData: 'Daten', settingsSections: 'Einstellungsbereiche',
    epubTextSettings: 'EPUB-Text',
    epubTextSettingsHelp: 'So wird der Text von EPUB-Büchern gesetzt (PDFs kommen bereits fertig gesetzt an und übernehmen diese Änderungen nicht). Dieselben Einstellungen sind auch während des Lesens über die Schriftschaltfläche erreichbar. Hier legst du fest, womit jedes neue Buch beginnt: Der Rand und die Ausrichtung, die du bei geöffnetem Buch änderst, gelten nur für dieses Buch.',
    resetTextSettings: 'Text zurücksetzen',
    importExport: 'Importieren und exportieren', addBooks: 'Bücher hinzufügen',
    addBooksHelp: 'Füge PDF- oder EPUB-Dateien zum Gerät hinzu oder lade sie in den gerade geöffneten Cloud-Ordner hoch.',
    addToDevice: 'Zum Gerät hinzufügen', uploadToCloud: 'In die Cloud hochladen',
    addFolderToDevice: 'Einen Ordner zum Gerät hinzufügen', uploadFolderToCloud: 'Einen Ordner in die Cloud hochladen',
    localBackup: 'Bibliothek auf diesem Gerät',
    localBackupHelp: 'Speichert die Bücher unter „Auf diesem Gerät“, ihren Fortschritt, Lesezeichen, Anmerkungen und Einstellungen in einer ZIP-Datei. Die Cloud-Konfiguration und das Passwort sind nicht enthalten; du kannst sie separat unter Einstellungen sichern.',
    exportLocalBackup: 'Sicherung erstellen', restoreLocalBackup: 'Auf dem Gerät wiederherstellen',
    creatingBackup: 'Sicherung wird erstellt…', restoringBackup: 'Sicherung wird wiederhergestellt…',
    noLocalBooksBackup: 'Es gibt keine lokalen Bücher zum Sichern.',
    backupCreated: 'Sicherung erfolgreich erstellt ({count} Bücher).',
    backupRestored: 'Sicherung erfolgreich wiederhergestellt ({count} Bücher).',
    backupFailed: 'Sicherung konnte nicht erstellt werden: {error}', restoreFailed: 'Wiederherstellung fehlgeschlagen: {error}',
    invalidBackup: 'Diese Datei ist keine gültige PageKeeper-Sicherung.',
    wrongLocalBackup: 'Dies ist eine Cloud-Sicherung, keine Gerätesicherung.',
    restoreBackupConfirm: 'Diese Sicherung wiederherstellen? Bücher mit derselben Kennung und ihre lokalen Daten werden ersetzt; alle anderen bleiben erhalten.',
    pdfPasswordTitle: 'Geschütztes PDF', pdfPasswordHelp: 'Gib das Passwort ein, um dieses PDF zu öffnen. Es wird nicht gespeichert.',
    pdfPassword: 'PDF-Passwort', pdfPasswordIncorrect: 'Das Passwort ist falsch.',
    pdfNoTextTitle: 'PDF ohne auswählbaren Text',
    pdfNoTextBadge: 'KEIN TEXT',
    pdfNoTextHelp: 'Dieses Dokument scheint gescannt zu sein. Suche, Textauswahl und Vorlesen funktionieren nicht richtig.',
    pdfNoTextStep1: 'Lade das PDF über das Buchmenü herunter.',
    pdfNoTextStep2: 'Öffne es in Scribe OCR und erstelle eine PDF-Kopie mit Text.',
    pdfNoTextStep3: 'Lade diese Kopie herunter und lade sie wieder zu PageKeeper hoch.',
    pdfNoTextPrivacy: 'PageKeeper sendet das Dokument nicht: Du musst es selbst im externen Werkzeug auswählen.',
    openScribeOcr: 'Scribe OCR öffnen', understood: 'Verstanden',
    open: 'Öffnen', openFailed: 'Buch konnte nicht geöffnet werden: {error}',
    cloudBackup: 'Cloud-Bibliothek',
    cloudBackupHelp: 'Speichert alle PDF- und EPUB-Dateien im WebDAV-Ordner und seinen Unterordnern zusammen mit Fortschritt, Lesezeichen und Anmerkungen in einer ZIP-Datei.',
    exportCloudBackup: 'Cloud-Sicherung erstellen', restoreCloudBackup: 'In der Cloud wiederherstellen',
    cloudBackupNeedsConfig: 'Richte zuerst eine WebDAV-Cloud unter Einstellungen ein.',
    readingCloudLibrary: 'Cloud-Bibliothek wird gelesen…',
    noCloudBooksBackup: 'Es gibt keine Cloud-Bücher zum Sichern.',
    backingUpCloudBook: 'Sichere {current} von {total}: „{title}“…',
    cloudBackupCreated: 'Cloud-Sicherung erfolgreich erstellt ({count} Bücher).',
    restoreCloudConfirm: 'Diese Sicherung in der konfigurierten Cloud wiederherstellen? Die Unterordner werden erstellt und Bücher mit demselben Pfad überschrieben.',
    restoringCloudBackup: 'Wiederherstellung in der Cloud wird vorbereitet…',
    restoringCloudBook: 'Lade {current} von {total} hoch: „{title}“…',
    cloudBackupRestored: 'Sicherung in der Cloud wiederhergestellt ({count} Bücher).',
    wrongCloudBackup: 'Dies ist eine Gerätesicherung, keine Cloud-Sicherung.',
    testConnection: 'Verbindung testen', save: 'Speichern', deleteConfig: 'Konfiguration löschen',
    copyConfig: 'Konfigurationslink kopieren', exportConfigFile: 'Konfiguration speichern',
    importConfigFile: 'Konfiguration wiederherstellen', configFileSaved: '✓ Konfiguration in einer Datei gespeichert.',
    invalidConfigFile: 'Die Datei enthält keine gültige PageKeeper-Konfiguration.',
    credits: 'Danksagungen', license: 'MIT-Lizenz', source: 'Quellcode',
    privacy: 'Datenschutz',
    analyticsNotice: 'Diese Anwendung erfasst nur aggregierte Nutzungsstatistiken mit einem selbst betriebenen System, um zu verstehen, wie sie genutzt wird, und sie zu verbessern. Es werden keine IP-Adressen gespeichert und keine Analyse-Cookies für Besucher verwendet.',
    continueReading: 'Weiterlesen', recentCount: 'Wie viele Lektüren anzeigen', recentAuto: 'So viele wie passen', recentN: '{count} Lektüren',
    recentCountHelp: '„So viele wie passen“ zeigt je nach Bildschirmbreite drei oder vier an. Die übrigen sind einen Fingertipp entfernt, unter „Mehr anzeigen“.', removeContinue: '„Weiterlesen“ aus der Bibliothek entfernen', continueRemoved: '„Weiterlesen“ wurde entfernt. Du kannst es unter Einstellungen → Bibliothek wieder anzeigen.', continueReadingHelp: 'Deine letzte Lektüre, die anderen einen Fingertipp entfernt',
    devices: 'Verbundene Geräte',
    devicesHelp: 'Die Browser, die diese Bibliothek verwenden, mit dem Zeitpunkt der letzten Synchronisierung. Erkennst du einen nicht, ändere das App-Passwort.',
    devicesRevokeHelp: '⚠️ „Trennen“ bittet das Gerät, die Cloud-Einstellungen zu vergessen und erneut abzufragen; das wirkt erst, wenn PageKeeper dort das nächste Mal geöffnet wird. Der Serverzugriff wird dadurch nicht entzogen: Lösche dafür das App-Passwort in deiner Cloud.',
    devicesNone: 'Noch kein Gerät hat sich verbunden.',
    deviceThisOne: 'dieses Gerät', deviceUnknown: 'Unbenanntes Gerät',
    deviceAuto: '{browser} unter {system}', deviceCode: 'Code {code}',
    deviceLastSeen: 'zuletzt gesehen: {when}', deviceNeverSeen: 'keine Daten',
    deviceToday: 'heute', deviceYesterday: 'gestern', deviceDaysAgo: 'vor {count} Tagen',
    deviceRevokedPending: 'getrennt, wartet aufs Öffnen',
    deviceRevoked: 'getrennt',
    deviceRename: 'Umbenennen', deviceRenamePrompt: 'Name für dieses Gerät',
    deviceDisconnect: 'Trennen',
    deviceDisconnectConfirm: '„{name}“ trennen? Beim nächsten Öffnen von PageKeeper dort werden die Cloud-Einstellungen vergessen und erneut abgefragt. Der Serverzugriff wird nicht entzogen: Lösche dafür das App-Passwort in deiner Cloud.',
    deviceDisconnected: 'Trennung angefordert. Sie wirkt beim nächsten Öffnen von PageKeeper auf diesem Gerät.',
    deviceWasDisconnected: 'Dieses Gerät wurde von einem anderen aus getrennt: Gib die Cloud-Daten erneut ein, um die Synchronisierung fortzusetzen.',
    cleanup: 'Bücher, die nicht mehr da sind',
    cleanupHelp: 'Wenn ein Buch aus der Cloud verschwindet, bleiben seine Leseposition, Lesezeichen und Notizen hier erhalten. Es wird zunächst als fehlend vermerkt und erst später gelöscht, falls das Buch nur vorübergehend nicht erreichbar war.',
    cleanupDays: 'Wie lange vor dem Löschen gewartet wird',
    cleanupNever: 'Nie löschen',
    cleanupDays7: 'Eine Woche', cleanupDays15: 'Fünfzehn Tage', cleanupDays30: 'Ein Monat',
    cleanupDays60: 'Zwei Monate', cleanupDays90: 'Drei Monate',
    cleanupDaysHelp: 'Diese Wartezeit wird mit deinen anderen Geräten geteilt, damit alle am selben Tag löschen.',
    cleanupCheck: 'Cloud prüfen', cleanupNow: 'Jetzt löschen',
    cleanupChecking: 'Prüfe, was in der Cloud liegt…',
    cleanupNoCloud: 'Keine Cloud eingerichtet. Bücher auf diesem Gerät werden beim Löschen sofort bereinigt, ohne Wartezeit.',
    cleanupUnchecked: 'Die Cloud wurde in dieser Sitzung noch nicht geprüft.',
    cleanupClean: 'Alles in Ordnung: {count} Elemente in der Cloud, keine zu löschenden Lesemarkierungen.',
    cleanupCleanOne: 'Alles in Ordnung: 1 Element in der Cloud, keine zu löschenden Lesemarkierungen.',
    cleanupMissingOne: '1 Buch fehlt; seine Leseposition ist noch gespeichert:',
    cleanupSideFilesOne: 'Außerdem gibt es 1 Anmerkungsdatei ohne ihr Buch.',
    cleanupConfirmOne: 'Jetzt Leseposition, Lesezeichen und Notizen von 1 nicht mehr vorhandenen Buch löschen? Das kann nicht rückgängig gemacht werden.',
    cleanupDoneOne: '1 nicht mehr vorhandenes Buch wurde bereinigt.',
    cleanupMissing: '{count} Bücher fehlen; ihre Lesepositionen sind noch gespeichert:',
    cleanupMissingOn: '{name} — wird am {date} gelöscht',
    cleanupMissingNever: '{name} — wird nicht gelöscht (du hast „nie löschen“ gewählt)',
    cleanupSideFiles: 'Außerdem gibt es {count} Anmerkungsdateien ohne ihr Buch.',
    cleanupConfirm: 'Jetzt Leseposition, Lesezeichen und Notizen von {count} nicht mehr vorhandenen Büchern löschen? Das kann nicht rückgängig gemacht werden.',
    cleanupDone: '{count} nicht mehr vorhandene Bücher wurden bereinigt.',
    cleanupNothing: 'Nichts zu löschen: Die Bücher sind zurück.',
    showMoreRecent: '{count} weitere anzeigen', showFewerRecent: 'Weniger anzeigen',
    removeFromContinue: '„{title}“ aus Weiterlesen entfernen',
    filterBy: 'Anzeigen', filterAll: 'Alle', filterReading: 'In Arbeit', filterPending: 'Ausstehend', filterFinished: 'Beendet',
    sortBy: 'Sortieren nach', sortRecent: 'Zuletzt gelesen', sortTitle: 'Titel', sortAuthor: 'Autor', sortProgress: 'Fortschritt',
    rating: 'Bewertung', ratingNone: 'Nicht bewertet', ratingOf: '{n} von {max} Sternen',
    openedWithoutSync: 'Es ließ sich nicht prüfen, ob du auf einem anderen Gerät weitergelesen hast: Das Buch öffnet dort, wo du hier warst.',
    positionFromOtherDevice: 'Die auf einem anderen Gerät hinterlassene Position wurde wiederhergestellt.',
    remotePositionAskEpub: 'Auf einem anderen Gerät wurde bis {remoto} % gelesen, hier bist du bei {local} %. Dorthin springen?',
    remotePositionAskPdf: 'Auf einem anderen Gerät wurde bis Seite {remoto} von {paginas} gelesen, hier bist du auf Seite {local}. Dorthin springen?',
    remotePositionGo: 'Dorthin springen',
    remotePositionStay: 'Hier bleiben',
    remotePositionStayed: 'Die Position dieses Geräts bleibt erhalten.',
    bookNoteRating: 'Notiz und Bewertung',
    ratingHint: 'Tippe den markierten Stern an, um die Bewertung zu entfernen',
    sortRating: 'Bewertung', filterRated4: '4 Sterne oder mehr', filterRated3: '3 Sterne oder mehr', filterUnrated: 'Nicht bewertet',
    filterGroupStatus: 'Lesen', filterGroupRating: 'Bewertung',
    viewLabel: 'Ansicht', viewList: 'Listenansicht', viewGrid: 'Rasteransicht',
    toggleSection: 'Abschnitt ein- oder ausklappen',
    markFinished: '„{title}“ als beendet markieren', markUnfinished: 'Markierung „Beendet“ von „{title}“ entfernen', finished: 'Beendet',
    sampleBookHeading: 'Mit einem Beispielbuch starten', sampleBookHelp: 'Deine Bibliothek ist leer. Füge eines dieser Beispiele hinzu, um PageKeeper auszuprobieren:',
    loadingSampleBook: 'Beispielbuch wird vorbereitet…',
    loadingLibrary: 'Bibliothek wird geladen…', noCloudBooks: 'Es sind noch keine Bücher synchronisiert. Nutze die Hochladen-Schaltfläche, um das erste hinzuzufügen.',
    notStarted: 'nicht begonnen', read: 'gelesen', page: 'Seite', of: 'von',
    bookActions: 'Aktionen für „{title}“',
    actionUpload: 'In die Cloud hochladen', actionMove: 'In einen anderen Ordner verschieben', actionDownload: 'Herunterladen',
    actionOffline: 'Offline verfügbar', actionRemoveOffline: 'Offline-Kopie entfernen',
    actionUpdateOffline: 'Offline-Kopie aktualisieren', actionDelete: 'Löschen',
    actionBookNote: 'Buchnotiz', bookNote: 'Buchnotiz', bookNoteLabel: 'Deine Notiz zu diesem Buch',
    bookNotePlaceholder: 'Worum es geht, wo du aufgehört hast, was du dir merken willst…',
    actionFolderNote: 'Ordnernotiz', folderNote: 'Ordnernotiz',
    folderNotePlaceholder: 'Was du hier aufbewahrst und wofür…',
    noFolderNote: 'Noch keine Notiz zu diesem Ordner.',
    editBookNote: 'Buchnotiz schreiben', noBookNote: 'Noch keine Notiz zu diesem Buch.',
    actionRename: 'Umbenennen',
    actionMarkFinished: 'Als beendet markieren', actionMarkUnfinished: '„Beendet“ entfernen',
    renameBookPrompt: 'Name für die Anzeige in der Bibliothek (leer lassen für den Dateinamen):',
    actionDeleteFolder: 'Ordner löschen',
    actionDownloadFolderZip: 'Ordner herunterladen (ZIP)',
    actionSaveFolderToDisk: 'Ordner auf dem Computer speichern',
    packingFolder: 'Ordner wird vorbereitet…',
    packingFolderItem: '„{title}“ ({current} von {total})',
    folderDownloadedOne: 'Ordner „{name}“ gespeichert: 1 Buch.',
    folderDownloadedMany: 'Ordner „{name}“ gespeichert: {count} Bücher.',
    folderHasNoBooks: 'Dieser Ordner enthält keine herunterladbaren Bücher.',
    folderDownloadedPartial: 'Ordner „{name}“ gespeichert. Nicht enthalten: {failed} von {total}.',
    folderDownloadFailed: 'Es konnte kein Buch aus dem Ordner abgerufen werden.',
    bookGone: 'das Buch befindet sich nicht mehr im Speicher dieses Geräts',
    removeOfflineConfirm: 'Offline-Kopie von „{title}“ entfernen? Das Cloud-Buch wird nicht gelöscht.',
    savingOffline: '„{title}“ wird zum Offline-Lesen gespeichert…', offlineSaved: '„{title}“ ist jetzt offline verfügbar ({size} MB).',
    offlineRemoved: 'Offline-Kopie entfernt. Das Buch bleibt in der Cloud.', availableOffline: 'OFFLINE', offlineOutdated: 'AKTUALISIEREN',
    offlineLibrary: 'Offline: Es werden die auf diesem Gerät gespeicherten Kopien angezeigt.',
    offlineFolderEmpty: 'Es gibt keine Offline-Kopien in diesem Ordner.', openedOfflineCopy: 'Aus der Offline-Kopie geöffnet.',
    offlineUpdateFailed: 'Das Buch wurde geöffnet, aber seine Offline-Kopie konnte nicht aktualisiert werden.',
    storageFull: 'Nicht genug Speicherplatz, um „{title}“ offline zu speichern.',
    fillUrlUser: 'Gib mindestens URL und Benutzername ein.', configSaved: 'Konfiguration gespeichert.', connecting: 'Verbindung wird hergestellt…',
    connectionOk: '✓ Verbindung erfolgreich: {count} Bücher gefunden.', configDeleted: 'Konfiguration gelöscht.',
    invalidConfigLink: 'Der Konfigurationslink ist ungültig.', cloudConfigImported: 'Cloud-Konfiguration importiert.',
    copyLinkFirst: 'Gib zuerst URL und Benutzername ein (oder speichere sie).', linkCopied: '✓ Link kopiert. Öffne ihn auf dem anderen Gerät.',
    copyLinkPrompt: 'Kopiere den Link und öffne ihn auf dem anderen Gerät:',
    downloading: '„{title}“ wird heruntergeladen…', opening: '„{title}“ wird geöffnet…', adding: '„{title}“ wird hinzugefügt…', uploading: '„{title}“ wird in deine Cloud hochgeladen…', deleting: '„{title}“ wird gelöscht…',
    cloudBookDeleted: 'Buch aus der Cloud gelöscht.', localBookDeleted: 'Buch von diesem Gerät gelöscht.',
    cloudBookDeletedPending: 'Buch gelöscht. Die Bereinigung des Fortschritts wird erneut versucht, sobald die Verbindung zurückkehrt.',
    cloudUploaded: '„{title}“ in deine Cloud hochgeladen.', cloudSaved: 'In deiner Cloud gespeichert. Synchronisiert jetzt zwischen Geräten.',
    continuing: 'Setzt dort fort, wo du aufgehört hast', continuingPage: 'Setzt auf Seite {page} fort',
    overwrite: '„{title}“ existiert bereits in deiner Cloud. Möchtest du es überschreiben?',
    deleteCloudConfirm: '„{title}“ aus deiner Cloud löschen? Die Datei wird vom Server entfernt.',
    deleteLocalConfirm: '„{title}“ von diesem Gerät löschen?',
    deleteConfigConfirm: 'Serverkonfiguration löschen? Der in der Cloud gespeicherte Fortschritt bleibt unberührt.',
    replaceConfigConfirm: 'Die importierte Konfiguration ersetzt die aktuelle Cloud-Konfiguration. Fortfahren?',
    epubMargin: '{value} % je Seite', pageMode: 'Seite für Seite anzeigen (wie ein Buch)', scrollMode: 'Fortlaufende Seiten anzeigen (Scrollen)',
    twoPages: 'Zwei Seiten nebeneinander anzeigen', onePage: 'Nur eine Seite anzeigen', rotatePage: 'Seite drehen',
    readAloud: 'Vorlesen', ttsPlay: 'Von hier vorlesen', ttsPause: 'Pause', ttsResume: 'Fortsetzen',
    ttsStop: 'Stopp', ttsVoice: 'Stimme', ttsAutoVoice: 'Automatisch', ttsSpeed: 'Geschwindigkeit',
    ttsHelp: 'Beginnt auf der aktuellen Seite, hebt den vorgelesenen Satz hervor und blättert von selbst weiter.',
    ttsNoSupport: 'Dieser Browser unterstützt das Vorlesen nicht.',
    ttsNoText: 'Es wurde kein lesbarer Text gefunden (möglicherweise ein gescanntes Dokument).',
    immersive: 'Im Vollbild lesen', immersiveExit: 'Vollbild verlassen',
    timeLeft: 'Geschätzte verbleibende Lesezeit', timeLeftMenu: 'Verbleibende Zeit: {time}',
    reader: 'Lesegerät', readerScreen: 'Auf dem Bildschirm', showStatusBar: 'Statusleiste unten anzeigen',
    showStatusBarHelp: 'Die Zeile am unteren Rand des Lesers mit der Seite im Kapitel, dem Bildschirm des Buches, dem gelesenen Prozentsatz und der verbleibenden Zeit. Sie auszublenden gibt dem Text etwas mehr Höhe.',
    statusChapter: '{page} / {total} im Kap.', statusChapterTitle: 'Bildschirm innerhalb des Kapitels',
    statusScreens: 'Bildsch. {page} von ~{total}',
    statusScreensTitle: 'Bildschirme, die das Buch auf diesem Gerät mit der aktuellen Schriftgröße und dem Rand einnimmt. Das ist eine Schätzung und ändert sich bei Anpassung dieser Einstellungen.',
    statusPage: 'Seite {page} von {total}', statusPageTitle: 'Seite des Dokuments',
    statusRead: '{percent} % gelesen', statusReadTitle: 'Wie viel des Buches du gelesen hast',
    timeLessMinute: '< 1 Min.', timeMinutes: '{m} Min.', timeHoursMinutes: '{h} Std. {m} Min.', goPercent: 'Zum Prozentsatz des Buches springen (0–100):', goToPage: 'Zur Seite springen (1–{total}):',
    sampleNoticeHtml: '<h2>Zwei Bücher zum Einstieg</h2><span>Deine Bibliothek enthält zwei Beispielbücher, damit du PageKeeper sofort ausprobieren kannst. Sie gehören dir: Du kannst sie lesen, behalten oder jederzeit über das Aktionsmenü jedes Buches löschen.</span>',
    dontShowAgain: 'Nicht mehr anzeigen',
    noConfigHtml: '<span>Es ist kein Server konfiguriert. Du kannst ein Buch (PDF oder EPUB) von diesem Gerät öffnen oder <a href="#" id="enlace-configurar">deine Cloud einrichten (Nextcloud oder einen anderen WebDAV-Server)</a>, um die Leseposition zwischen Geräten zu synchronisieren.</span><p class="ayuda">Weißt du nicht, was das ist oder was du brauchst? <a href="#" id="enlace-ayuda-aviso">Lies die Hilfe</a>.</p>',
    syncError: 'Synchronisierungsfehler', syncFailed: 'Fortschritt konnte nicht synchronisiert werden: {error}',
    syncRecovered: 'Deine Position ist jetzt in der Cloud gespeichert',
    stats: 'Lesestatistiken', statsView: 'Statistiken ansehen',
    statsSettingsHelp: 'Wie viel Zeit du mit Lesen verbringst, wie viele Tage in Folge du dranbleibst und die Bücher, denen du am meisten Zeit widmest, über alle deine Geräte hinweg summiert.',
    statsSummary: 'Deine Lektüre', statsLastDays: 'Die letzten 30 Tage',
    actionBookStats: 'Lesezeit',
    statusTimeSpentTitle: 'Wie lange du dieses Buch schon liest. Tippen, um Details zu sehen.',
    statusPaused: 'Pausiert',
    statusPausedTitle: 'Die Lesezeit wächst nicht weiter: du bist seit über fünf Minuten auf derselben Seite. Sie zählt wieder, sobald du umblätterst.',
    statsBookTime: 'Verbrachte Zeit', statsBookRead: 'Gelesen', statsBookPace: 'Tempo',
    statsPacePerPage: '{time} pro Seite', statsPaceSeconds: '{s} s pro Seite',
    statsBookByDevice: 'Auf jedem Gerät',
    statsHideFromList: 'Aus der Liste ausblenden',
    statsShowInList: 'Wieder in die Liste',
    statsHideNote: 'Es erscheint nicht mehr unter „Wohin die Zeit geht“. Es wird nichts gelöscht: Es kehrt in die Liste zurück, sobald du wieder eine Weile darin liest.',
    statsHiddenNote: 'Es steht jetzt nicht mehr unter „Wohin die Zeit geht“. Es kommt von selbst zurück, sobald du wieder eine Weile darin liest.',
    statsBookEmpty: 'Für dieses Buch ist noch keine Zeit erfasst. Sobald du ein paar Minuten mit geöffnetem Buch liest, erscheint hier, wie viel Zeit du ihm gewidmet hast.',
    statsShared: 'Über alle deine Geräte summiert: Was du auf dem Handy und dem Computer liest, zählt zusammen, und ein Tag, an dem du auf beiden gelesen hast, zählt als ein Tag.',
    statsTopBooks: 'Wofür die Zeit draufgeht',
    statsSortBy: 'Sortieren nach', statsSortTime: 'Aufgewendete Zeit',
    statsSortRecent: 'Zuletzt gelesen', statsSortTitle: 'Titel',
    statsLastRead: 'gelesen am {date}', statsBookGone: 'nicht mehr in der Bibliothek', statsDataTitle: 'Über diese Daten',
    statsEmptyTitle: 'Noch nichts zu zeigen',
    statsEmpty: 'Sobald du ein paar Minuten mit geöffnetem Buch liest, zeigt diese Seite die verbrachte Zeit, die Tage in Folge und die Bücher, denen du am meisten Zeit widmest.',
    statsPrivacy: 'Bei eingerichteter Cloud reist die Lesezeit mit der Leseposition: Jedes Gerät erfasst seine eigene, und hier wird die Summe angezeigt, sodass du weißt, wie lange ein Buch gedauert hat, auch wenn du es auf jedem Gerät in Etappen gelesen hast. Sie liegt auf deinem eigenen WebDAV-Server, neben deinen Büchern, und wird nirgendwohin gesendet. Ohne eingerichtete Cloud bleibt sie in diesem Browser. Nur die Zeit mit dem Buch vor dir zählt: solange die App nicht zu sehen ist, steht die Uhr still, und Positionssprünge werden nicht addiert. Pro Seite werden höchstens fünf Minuten gezählt; danach weist die Fußzeile auf die Pause hin, und beim Umblättern zählt sie wieder.',
    statsDelete: 'Statistiken löschen',
    statsDeleteConfirm: 'Lesestatistiken löschen? Sie werden auf allen deinen Geräten gelöscht: Verbundene Geräte tun dies, sobald sie synchronisieren. Deine Bücher, deine Leseposition und deine Anmerkungen sind nicht betroffen.',
    statsDeleted: '✓ Statistiken gelöscht. Deine anderen Geräte löschen sie beim Synchronisieren.',
    statsOptOut: 'Lesezeit nicht messen',
    statsOptOutHelp: 'Beendet das Zählen von Zeit, Tagen in Folge und der Zeit pro Buch. Beim Einschalten wird alles bisher Erfasste gelöscht und lässt sich nicht wiederherstellen. Bei eingerichteter Cloud erreicht die Entscheidung auch deine anderen Geräte: Sie hören beim Synchronisieren auf zu messen.',
    statsOptOutConfirm: 'Die Lesezeit nicht mehr messen?\n\nAlles bisher Erfasste —Zeit, Tage in Folge und die Zeit pro Buch— wird gelöscht und kann nicht wiederhergestellt werden. Mit eingerichteter Cloud erreichen sowohl die Löschung als auch die Entscheidung, nicht zu messen, deine anderen Geräte.',
    statsOffTitle: 'Es wird nichts gemessen',
    statsOff: 'Die Erfassung der Lesezeit ist ausgeschaltet. Du kannst sie unten unter „Diese Daten“ wieder einschalten; gezählt wird dann wieder bei null begonnen.',
    statsOffDone: '✓ Messung beendet und vorhandene Daten gelöscht.',
    statsOnAgain: '✓ Es wird wieder gemessen, ab null.',
    statsTotal: 'Gesamtzeit', statsToday: 'Heute', statsWeek: 'Letzte 7 Tage',
    statsStreak: 'Tage in Folge', statsAverage: 'Durchschnitt pro Lesetag',
    statsActiveDays: 'Tage mit Lektüre', statsBestDay: 'Bester Tag', statsPdfPages: 'PDF-Seiten',
    statsBestStreak: 'deine beste Serie: {streak}', statsStreakNow: 'Serie läuft',
    statsNoStreak: 'heute oder morgen beginnt eine',
    statsDays: '{count} Tage', statsDaysOne: '{count} Tag', statsHours: '{h} Std.',
    statsChartLabel: 'Diagramm der gelesenen Zeit an jedem der letzten {days} Tage.',
    statsChartSummary: 'Du hast an {days} der letzten 30 Tage gelesen, {total} insgesamt.',
    statsGroupBy: 'Gruppieren nach',
    statsByDay: 'Tage', statsByWeek: 'Wochen', statsByMonth: 'Monate', statsByYear: 'Jahre',
    statsLastWeeks: 'Die letzten 12 Wochen', statsLastMonths: 'Die letzten 12 Monate',
    statsLastYears: 'Die letzten 5 Jahre',
    statsCount_semana: '{count} Wochen', statsCount_semanaOne: '{count} Woche',
    statsCount_mes: '{count} Monaten', statsCount_mesOne: '{count} Monat',
    statsCount_anno: '{count} Jahren', statsCount_annoOne: '{count} Jahr',
    statsChartSummaryPeriod: 'Du hast in {count} gelesen, {total} insgesamt.',
    statsWeekOf: 'Woche ab {date}',
    statsThisWeek: 'Diese Woche', statsThisMonth: 'Dieser Monat', statsThisYear: 'Dieses Jahr',
    statsThisDay: 'Heute',
    statsPrevWeek: 'Vorige Woche', statsPrevMonth: 'Voriger Monat',
    statsPrevYear: 'Voriges Jahr', statsPrevDay: 'Gestern',
    statsSoFar: 'bis jetzt', statsUpToMonth: 'bis {month}',
    statsMoreThanBefore: '{percent} % mehr', statsLessThanBefore: '{percent} % weniger',
    statsSame: 'Gleich', statsFirstTime: 'Du fängst an', statsNoTime: 'Nichts',
    statsHistoryFrom: 'Die Tagesansicht reicht bis zum {date} zurück.',
    statsChartEmpty: 'Du hast in diesen 30 Tagen noch nichts gelesen.',
    statsChartDay: '{date}: {time}', statsChartDayNone: '{date}: keine Lektüre',
    statsBooksTracked: 'Von den {count} zuletzt gelesenen.',
    statsBookUntitled: 'Buch ohne Titel',
    activityLog: 'Aktivitätsprotokoll',
    activityLogHelp: 'Hält fest, ob die Leseposition den Server erreicht, und die Fehler, die das verhindern. Nützlich, um herauszufinden, warum ein Buch auf einem anderen Gerät zurückgeblieben ist. Wird nur hier gespeichert, verlässt dieses Gerät nie und löscht sich nach einer Woche von selbst.',
    viewLog: 'Protokoll ansehen', clearLog: 'Leeren', copyLog: 'Kopieren', downloadLog: 'Speichern',
    logEmpty: 'Noch nichts protokolliert.',
    logWithErrors: '{errores} Fehler protokolliert',
    logNoErrors: '{total} Ereignisse, keine Fehler',
    logCopied: 'Protokoll kopiert', logCopyFailed: 'Konnte nicht kopiert werden; nutze „Speichern“',
    logRecovered: 'nach {intentos} fehlgeschlagenen Versuchen hochgeladen',
    logRetrying: 'erneuter Versuch (aufeinanderfolgende Fehler: {intentos})',
    logOffline: 'offline: wartet auf die Verbindung',
    logBackOnline: 'Verbindung wiederhergestellt', logWentOffline: 'Verbindung verloren',
    cloudScope: 'Bücher und Fortschritt auf allen deinen Geräten verfügbar',
    localScope: 'Bücher nur auf diesem Gerät gespeichert',
    emptyLocalAction: 'Bücher nur auf diesem Gerät hinzufügen',
    emptyLocalHelp: 'Sie werden nicht synchronisiert. Wähle PDF- oder EPUB-Dateien aus oder ziehe sie hierher.',
    webdavHelpHtml: 'Kompatibel mit Nextcloud, ownCloud und jedem WebDAV-Server. PDFs im angegebenen Ordner erscheinen in deiner Bibliothek, und die Leseposition wird zwischen allen deinen Geräten synchronisiert. Weißt du nicht, was du hier eintragen sollst? <a href="#" id="enlace-ayuda-ajustes">Lies die Hilfe</a>.',
    passwordHelpHtml: '⚠️ Erstelle in Nextcloud ein <strong>App-Passwort</strong> (Einstellungen → Sicherheit); verwende nicht dein Hauptpasswort. Außerdem muss der Server CORS erlauben, damit sich der Browser verbinden kann: Installiere in Nextcloud die App <strong>WebAppPassword</strong> und füge die Domain dieses Readers hinzu. Die Daten werden nur in diesem Browser gespeichert.',
    transferHelp: 'Du kannst einen Link kopieren oder eine Datei mit URL, Benutzername und App-Passwort speichern und sie auf einem anderen Gerät öffnen. ⚠️ Der Link und die Datei ermöglichen Zugriff auf deine Cloud: Bewahre sie privat auf und lösche nicht mehr benötigte Kopien.',
    creditsHtml: 'Erstellt mit <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) und <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a>-Symbolen (ISC).',
    dropLocal: 'Hier ablegen, um auf diesem Gerät zu speichern', dropCloud: 'Hier ablegen, um in die Cloud hochzuladen',
    unsupportedFiles: 'Es können nur PDF- oder EPUB-Dateien hinzugefügt werden.',
    localDuplicate: 'Dieses Buch ist bereits auf diesem Gerät, gespeichert als „{title}“.',
    noBooksInFolder: 'Dieser Ordner enthält keine PDF- oder EPUB-Dateien.', localAddedOne: 'Buch auf diesem Gerät gespeichert.', localAddedMany: '{count} Bücher auf diesem Gerät gespeichert.',
    saveFailed: '„{title}“ konnte nicht gespeichert werden: {error}',
    searchLibrary: 'Bibliothek durchsuchen', clearSearch: 'Suche löschen', searchLibraryPlaceholder: 'Nach Titel, Autor suchen…',
    showIndex: 'Inhaltsverzeichnis anzeigen', hideIndex: 'Inhaltsverzeichnis ausblenden',
    showThumbs: 'Miniaturansichten anzeigen', hideThumbs: 'Miniaturansichten ausblenden',
    showIndexThumbs: 'Inhaltsverzeichnis und Miniaturansichten anzeigen',
    hideIndexThumbs: 'Inhaltsverzeichnis und Miniaturansichten ausblenden',
    searchBook: 'Im Buch suchen', bookIndex: 'Inhaltsverzeichnis', bookStart: 'Buchanfang', historyNavigation: 'Navigationsverlauf', backPosition: 'Zur vorherigen Position zurück', forwardPosition: 'Zur nächsten Position vor', pageAndHistory: 'Seite und Navigationsverlauf', wordOrPhrase: 'Wort oder Satz', search: 'Suchen', close: 'Schließen', zoomedImage: 'Vergrößertes Bild',
    searchingBook: 'Suche im Buch…', searchProgress: 'Suche… {done}/{total} · {count} Ergebnisse.', noSearchResults: 'Keine Ergebnisse gefunden.', searchResults: '{count} Ergebnisse.',
    chapter: 'Kapitel', noLibraryResults: 'Keine Bücher passen zur Suche.',
    searchingFolders: 'Durchsucht auch Ordner…', inFolder: 'Im Ordner „{name}“',
    bookmarks: 'Lesezeichen', bookmark: 'Lesezeichen', addBookmark: 'Hier ein Lesezeichen hinzufügen',
    annotations: 'Anmerkungen', noAnnotations: 'Noch keine Anmerkungen.',
    highlightColor: 'Markierungsfarbe', highlightYellow: 'Gelb markieren',
    highlightGreen: 'Grün markieren', highlightBlue: 'Blau markieren', highlightPink: 'Pink markieren',
    exportAnnotations: 'Anmerkungen exportieren (Markdown)', exportHeader: 'Anmerkungen zu „{title}“',
    exportSource: 'Aus PageKeeper exportiert', annotationsExported: 'Anmerkungen exportiert.',
    searchAnnotations: 'In Anmerkungen suchen', noAnnotationResults: 'Keine passenden Anmerkungen.',
    selectionActions: 'Aktionen für ausgewählten Text', highlight: 'Markieren', addNote: 'Notiz hinzufügen',
    note: 'Notiz', notePrompt: 'Notiz zum ausgewählten Text:', editNote: 'Notiz bearbeiten', deleteAnnotation: 'Anmerkung löschen', deleteAnnotationConfirm: 'Diese Anmerkung löschen?', noteActions: 'Notizoptionen',
    annotationAdded: 'Anmerkung gespeichert.', annotationDeleted: 'Anmerkung gelöscht.',
    bookmarkName: 'Name des Lesezeichens', bookmarkNamePlaceholder: 'Name des Lesezeichens (optional)',
    bookmarkNamePrompt: 'Name des Lesezeichens (leer lassen, um es zu entfernen):', editBookmark: 'Namen des Lesezeichens ändern',
    noBookmarks: 'Noch keine Lesezeichen.', bookmarkAdded: 'Lesezeichen hinzugefügt.',
    bookmarkRenamed: 'Name des Lesezeichens aktualisiert.',
    bookmarkRemoved: 'Lesezeichen gelöscht.', bookmarkExists: 'An dieser Position gibt es bereits ein Lesezeichen.',
    deleteBookmark: 'Lesezeichen löschen',
    cloudRoot: 'Start', currentFolder: 'Aktueller Ordner', targetFolder: 'Zielordner',
    newFolder: 'Einen Ordner erstellen', folderNamePrompt: 'Name des neuen Ordners:',
    invalidFolderName: 'Der Ordnername ist ungültig.',
    creatingFolder: 'Ordner „{name}“ wird erstellt…', folderCreated: 'Ordner „{name}“ erstellt.',
    renamingFolder: '„{name}“ wird umbenannt…',
    openFolder: 'Ordner „{name}“ öffnen',
    folderEmpty: 'Leer', folderItemsOne: '1 Element', folderItems: '{count} Elemente',
    sectionFoldersOne: '1 Ordner', sectionFolders: '{count} Ordner',
    sectionBooksOne: '1 Buch', sectionBooks: '{count} Bücher',
    deleteFolderConfirm: 'Ordner „{name}“ und seinen gesamten Inhalt aus deiner Cloud löschen?',
    folderDeleted: 'Ordner aus der Cloud gelöscht.', emptyFolder: 'Dieser Ordner ist leer.',
    deviceRoot: 'Start', actionRenameFolder: 'Ordner umbenennen',
    actionSaveToDevice: 'Auf diesem Gerät speichern',
    imagesInvertedOff: 'Bildern ihre Farbe zurückgeben',
    imagesInvertedOn: 'Bilder in ihrer Farbe: aktiv. Zum Invertieren mit der Seite tippen',
    library: 'Bibliothek', showContinueReading: '„Weiterlesen“ anzeigen',
    showContinueReadingHelp: 'Der Kasten mit deinen letzten Lektüren über der Bibliothek. Ihn auszublenden lässt die Bücher, wo sie waren, mit ihrer Seite unverändert.',
    openLastOnStart: 'Beim Start von PageKeeper die letzte Lektüre öffnen',
    openLastOnStartHelp: 'Beim Öffnen der App landest du direkt in dem Buch, das du gerade liest, ohne Umweg über die Bibliothek. Das gilt nur für dieses Gerät: auf den anderen kommst du weiterhin in der Bibliothek an.',
    theme: 'Design', themeAuto: 'Systemvorgabe', themeLight: 'Hell', themeSepia: 'Sepia',
    statsBookCard: 'Die Zeit für „{title}“ ansehen',
    themeDark: 'Dunkel', themeBlack: 'Schwarz',
    autoTheme: 'Das Design des Systems',
    autoThemeHelp: 'Wenn das Design auf die Systemvorgabe steht, wird die Anwendung zusammen mit dem Rest des Geräts heller oder dunkler. Hier wählst du, mit welchem Design das auf jeder Seite geschieht. Alle fünf Designs bleiben in der Schaltfläche der Kopfzeile griffbereit; dies legt nur fest, wohin die Systemvorgabe führt.',
    autoThemeLight: 'Wenn das System hell ist',
    autoThemeDark: 'Wenn das System dunkel ist',
    autoThemeNow: 'Gerade verlangt dein System das Design {theme}, und genau das siehst du.',
    autoThemeIdle: 'Du hast das Design von Hand auf {theme} gestellt, daher ändert dies vorerst nichts. Stelle es in der Kopfzeile wieder auf die Systemvorgabe, damit es greift.',
    actionMoveFolder: 'Ordner verschieben', moveFolderTo: 'Ordner „{name}“ verschieben',
    folderMoved: 'Ordner „{name}“ verschoben.',
    savedToDevice: '„{title}“ auf diesem Gerät gespeichert.',
    folderRenamePrompt: 'Neuer Ordnername:', folderRenamed: 'Ordner umbenannt.',
    folderExists: 'Hier gibt es bereits einen Ordner mit diesem Namen.',
    deleteLocalFolderConfirm: 'Ordner „{name}“ und alle darin enthaltenen Bücher von diesem Gerät löschen?',
    localFolderDeleted: 'Ordner von diesem Gerät gelöscht.',
    emptyLocalFolder: 'Dieser Ordner hat noch keine Bücher.',
    moveToDeviceFolder: '„{title}“ in einen anderen Ordner auf dem Gerät verschieben',
    moveBook: '„{title}“ in einen anderen Ordner verschieben', moveHere: 'Hierher verschieben',
    moving: '„{title}“ wird verschoben…', bookMoved: '„{title}“ verschoben.', cancel: 'Abbrechen',
    loadingFolders: 'Ordner werden geladen…', noSubfolders: 'Keine Unterordner.',
    textSettings: 'Texteinstellungen', fontFamily: 'Schriftart',
    bookFont: 'Die des Buches', serifFont: 'Serifenschrift', sansFont: 'Serifenlose Schrift',
    lineSpacing: 'Zeilenabstand', bookSpacing: 'Der des Buches', spacingCompact: 'Kompakt',
    spacingNormal: 'Normal', spacingWide: 'Weit', spacingWider: 'Sehr weit',
    hyphenation: 'Silbentrennung', hyphenationAuto: 'Ja, am Zeilenende',
    hyphenationBook: 'Wie im Buch', hyphenationNever: 'Nie trennen',
    textAlignment: 'Ausrichtung', bookAlignment: 'Die des Buches',
    unjustifiedAlignment: 'Nicht ausgerichtet',
    justifiedAlignment: 'Blocksatz',
    columnsSettings: 'Spalten', columnsAuto: 'Automatisch',
    columnsOne: 'Eine Spalte', columnsTwo: 'Zwei Spalten',
    columnsThree: 'Drei Spalten', columnsFour: 'Vier Spalten',
    columnsSettingsHelp: 'In wie viele Spalten der Text auf dem Bildschirm aufgeteilt wird. Automatisch passen so viele hinein, wie ohne unbequeme Zeilen möglich sind; sie ändern sich von selbst, wenn Sie das Gerät drehen oder die Schriftgröße ändern. Bei geöffnetem Buch ändert die Spaltenschaltfläche nur dieses Buch; hier steht, womit alle anderen anfangen. Das wandert nicht auf Ihre anderen Geräte: jeder Bildschirm ist ein eigener Fall.',
    lineLength: 'Zeilen von höchstens', lineLengthValue: '{value} Zeichen',
    moreColumns: 'Mehr Spalten', fewerColumns: 'Weniger Spalten',
    lineLengthHelp: 'Gilt nur im Automatikmodus: eine weitere Spalte öffnet sich, sobald der Text es zulässt, ohne dass eine davon diese Länge überschreitet. Kurze Zeilen lassen Spalten früher erscheinen, lange Zeilen später.',
  },
  pt: {
    appTagline: 'Leitor de livros eletrónicos',
    appVersion: 'PageKeeper {version}',
    // Imprimir el EPUB en papel o en PDF.
    printBook: 'Imprimir ou guardar em PDF',
    printHelp: 'Abrir-se-á a caixa de impressão do navegador, onde podes escolher a impressora ou «Guardar como PDF».',
    printPaper: 'Papel',
    printPaperLetter: 'Carta',
    printMargins: 'Margens',
    printMarginNarrow: 'Estreitas',
    printMarginNormal: 'Normais',
    printMarginWide: 'Largas',
    printFont: 'Letra',
    printFontSmall: 'Pequena',
    printFontNormal: 'Normal',
    printFontLarge: 'Grande',
    printAnnotations: 'Incluir os sublinhados e as notas',
    selectAll: 'Todos',
    selectNone: 'Nenhum',
    print: 'Imprimir',
    printChapterNumber: 'Capítulo {number}',
    printNoChapters: 'Nenhum capítulo',
    printWholeBook: 'O livro inteiro',
    printSomeChapters: '{count} de {total} capítulos',
    printPreparing: 'A preparar o documento… {done} de {total}',
    printNotesHeading: 'Notas',
    printFallbackTitle: 'Livro',
    printChapterFailed: 'Não foi possível compor o capítulo «{title}».',
    printFailed: 'Não foi possível preparar o documento para impressão.',
    language: 'Idioma', help: 'Ajuda', settings: 'Definições', back: 'Voltar', cloud: 'Na nuvem',
    device: 'Neste dispositivo', addLocal: 'Adicionar um livro (PDF ou EPUB) deste dispositivo',
    addCloud: 'Enviar um livro (PDF ou EPUB) para a nuvem', reload: 'Recarregar',
    addLocalFolder: 'Adicionar uma pasta inteira deste dispositivo',
    addCloudFolder: 'Enviar uma pasta inteira para a nuvem',
    backLibrary: 'Voltar à biblioteca', saveCloud: 'Guardar na minha nuvem', zoom: 'Zoom', zoomOut: 'Reduzir', autoWidth: 'Ajustar à largura', fitPage: 'Ajustar a página inteira', cropMargins: 'Recortar as margens', skipToContent: 'Saltar para o conteúdo', bookIndexShort: 'Índice', thumbnails: 'Miniaturas', resizePanel: 'Alterar a largura do painel', bookNavigation: 'Navegação do livro', pageThumbnails: 'Miniaturas das páginas', noMarginsToCrop: 'Esta obra não tem margens para recortar.', zoomIn: 'Ampliar',
    zoomLevel: 'Zoom:', zoomChange: 'Toque para alterar',
    zoomSettings: 'Escolher o nível de zoom', customZoom: 'Outro', apply: 'Aplicar',
    moreReaderActions: 'Mais ações', readerActions: 'Ações de leitura',
    previous: 'Página anterior', next: 'Página seguinte', goPage: 'Ir para uma página',
    marginSide: 'Margem lateral', noMargin: 'Sem margem', moreMargin: 'Mais margem',
    zoomHelp: 'Guardado apenas para este livro.',
    marginHelp: 'O texto reajusta-se ao mover o controlo. A margem é deste livro.', reset: 'Repor',
    webdavFolder: 'URL da pasta WebDAV', user: 'Utilizador', appPassword: 'Palavra-passe de aplicação',
    webdav: 'Nuvem (WebDAV)', transferConfig: 'Levar a configuração para outro dispositivo',
    webdavShort: 'Nuvem', settingsData: 'Dados', settingsSections: 'Secções das definições',
    epubTextSettings: 'Texto dos EPUB',
    epubTextSettingsHelp: 'Como o texto dos livros EPUB é composto (os PDF chegam já paginados e não aceitam estas alterações). Os mesmos ajustes estão à mão enquanto lê, no botão da letra. Aqui decide com que começa cada livro novo: a margem e o alinhamento que altere com um livro aberto são só desse livro.',
    resetTextSettings: 'Repor o texto',
    importExport: 'Importar e exportar', addBooks: 'Adicionar livros',
    addBooksHelp: 'Adicione PDF ou EPUB ao dispositivo ou envie-os para a pasta da nuvem que tenha aberta.',
    addToDevice: 'Adicionar ao dispositivo', uploadToCloud: 'Enviar para a nuvem',
    addFolderToDevice: 'Adicionar uma pasta ao dispositivo', uploadFolderToCloud: 'Enviar uma pasta para a nuvem',
    localBackup: 'Biblioteca deste dispositivo',
    localBackupHelp: 'Guarda num ZIP os livros de «Neste dispositivo», o seu progresso, marcadores, anotações e preferências. Não inclui a configuração nem a palavra-passe da nuvem; pode guardá-las à parte em Definições.',
    exportLocalBackup: 'Criar cópia', restoreLocalBackup: 'Restaurar no dispositivo',
    creatingBackup: 'A criar a cópia…', restoringBackup: 'A restaurar a cópia…',
    noLocalBooksBackup: 'Não há livros locais para copiar.',
    backupCreated: 'Cópia criada com sucesso ({count} livros).',
    backupRestored: 'Cópia restaurada com sucesso ({count} livros).',
    backupFailed: 'Não foi possível criar a cópia: {error}', restoreFailed: 'Não foi possível restaurar: {error}',
    invalidBackup: 'Este ficheiro não é uma cópia válida do PageKeeper.',
    wrongLocalBackup: 'Esta é uma cópia da nuvem, não do dispositivo.',
    restoreBackupConfirm: 'Restaurar esta cópia? Os livros com o mesmo identificador e os seus dados locais serão substituídos; os restantes serão mantidos.',
    pdfPasswordTitle: 'PDF protegido', pdfPasswordHelp: 'Introduza a palavra-passe para abrir este PDF. Não será guardada.',
    pdfPassword: 'Palavra-passe do PDF', pdfPasswordIncorrect: 'A palavra-passe não está correta.',
    pdfNoTextTitle: 'PDF sem texto selecionável',
    pdfNoTextBadge: 'SEM TEXTO',
    pdfNoTextHelp: 'Este documento parece estar digitalizado. A pesquisa, a seleção e a leitura em voz alta não funcionarão corretamente.',
    pdfNoTextStep1: 'Transfira o PDF a partir do menu do livro.',
    pdfNoTextStep2: 'Abra-o no Scribe OCR e gere uma cópia PDF com texto.',
    pdfNoTextStep3: 'Transfira essa cópia e volte a enviá-la para o PageKeeper.',
    pdfNoTextPrivacy: 'O PageKeeper não enviará o documento: terá de o selecionar você mesmo na ferramenta externa.',
    openScribeOcr: 'Abrir o Scribe OCR', understood: 'Percebido',
    open: 'Abrir', openFailed: 'Não foi possível abrir o livro: {error}',
    cloudBackup: 'Biblioteca da nuvem',
    cloudBackupHelp: 'Guarda num ZIP todos os PDF e EPUB da pasta WebDAV e das suas subpastas, juntamente com o progresso, os marcadores e as anotações.',
    exportCloudBackup: 'Criar cópia da nuvem', restoreCloudBackup: 'Restaurar na nuvem',
    cloudBackupNeedsConfig: 'Configure primeiro uma nuvem WebDAV em Definições.',
    readingCloudLibrary: 'A ler a biblioteca da nuvem…',
    noCloudBooksBackup: 'Não há livros na nuvem para copiar.',
    backingUpCloudBook: 'A copiar {current} de {total}: «{title}»…',
    cloudBackupCreated: 'Cópia da nuvem criada com sucesso ({count} livros).',
    restoreCloudConfirm: 'Restaurar esta cópia na nuvem configurada? As suas subpastas serão criadas e os livros com o mesmo caminho serão substituídos.',
    restoringCloudBackup: 'A preparar a restauração na nuvem…',
    restoringCloudBook: 'A enviar {current} de {total}: «{title}»…',
    cloudBackupRestored: 'Cópia restaurada na nuvem ({count} livros).',
    wrongCloudBackup: 'Esta é uma cópia do dispositivo, não da nuvem.',
    testConnection: 'Testar ligação', save: 'Guardar', deleteConfig: 'Eliminar configuração',
    copyConfig: 'Copiar hiperligação de configuração', exportConfigFile: 'Guardar configuração',
    importConfigFile: 'Restaurar configuração', configFileSaved: '✓ Configuração guardada num ficheiro.',
    invalidConfigFile: 'O ficheiro não contém uma configuração válida do PageKeeper.',
    credits: 'Créditos', license: 'Licença MIT', source: 'Código-fonte',
    privacy: 'Privacidade',
    analyticsNotice: 'Esta aplicação recolhe apenas estatísticas de utilização agregadas com um sistema próprio, para conhecer a sua utilização e melhorar a ferramenta. Não são armazenados endereços IP nem são usados cookies de análise para os visitantes.',
    continueReading: 'Continuar a ler', recentCount: 'Quantas leituras mostrar', recentAuto: 'As que couberem', recentN: '{count} leituras',
    recentCountHelp: '«As que couberem» mostra três ou quatro consoante a largura do ecrã. As restantes ficam a um toque, em «Ver mais».', removeContinue: 'Remover «Continuar a ler» da biblioteca', continueRemoved: '«Continuar a ler» foi removido. Pode voltar a mostrá-lo em Definições → Biblioteca.', continueReadingHelp: 'A sua leitura mais recente, com as restantes a um toque',
    devices: 'Dispositivos ligados',
    devicesHelp: 'Os navegadores que estão a usar esta biblioteca, com a última vez que sincronizaram. Se vir um que não reconhece, mude a palavra-passe de aplicação.',
    devicesRevokeHelp: '⚠️ «Desligar» pede ao dispositivo para esquecer a configuração da nuvem e voltar a pedi-la, e só produz efeito na próxima vez que abrir aí. Não retira o acesso ao servidor: para isso, elimine a palavra-passe de aplicação na sua nuvem.',
    devicesNone: 'Ainda nenhum dispositivo se ligou.',
    deviceThisOne: 'este dispositivo', deviceUnknown: 'Dispositivo sem nome',
    deviceAuto: '{browser} em {system}', deviceCode: 'código {code}',
    deviceLastSeen: 'última vez: {when}', deviceNeverSeen: 'sem dados',
    deviceToday: 'hoje', deviceYesterday: 'ontem', deviceDaysAgo: 'há {count} dias',
    deviceRevokedPending: 'desligado, à espera de abrir',
    deviceRevoked: 'desligado',
    deviceRename: 'Mudar o nome', deviceRenamePrompt: 'Nome para este dispositivo',
    deviceDisconnect: 'Desligar',
    deviceDisconnectConfirm: 'Desligar «{name}»? Na próxima vez que abrir aí, o PageKeeper esquecerá a configuração da nuvem e voltará a pedi-la. O acesso ao servidor não é retirado: para isso, elimine a palavra-passe de aplicação na sua nuvem.',
    deviceDisconnected: 'Desligação pedida. Produzirá efeito na próxima vez que o PageKeeper for aberto nesse dispositivo.',
    deviceWasDisconnected: 'Este dispositivo foi desligado a partir de outro: introduza novamente os dados da sua nuvem para continuar a sincronizar.',
    cleanup: 'Livros que já não estão lá',
    cleanupHelp: 'Quando um livro desaparece da nuvem, a sua marca de leitura, marcadores e notas ficam aqui. Primeiro é assinalado como em falta e só depois é eliminado, caso o livro estivesse fora de alcance por algum tempo.',
    cleanupDays: 'Quanto tempo esperar antes de os eliminar',
    cleanupNever: 'Nunca os eliminar',
    cleanupDays7: 'Uma semana', cleanupDays15: 'Quinze dias', cleanupDays30: 'Um mês',
    cleanupDays60: 'Dois meses', cleanupDays90: 'Três meses',
    cleanupDaysHelp: 'Este prazo é partilhado com os seus outros dispositivos, para que todos eliminem no mesmo dia.',
    cleanupCheck: 'Verificar a nuvem', cleanupNow: 'Eliminar agora',
    cleanupChecking: 'A verificar o que há na nuvem…',
    cleanupNoCloud: 'Sem nuvem configurada. Os livros deste dispositivo são limpos automaticamente ao eliminá-los, sem espera.',
    cleanupUnchecked: 'A nuvem ainda não foi verificada nesta sessão.',
    cleanupClean: 'Tudo em ordem: {count} elementos na nuvem e nenhuma marca de leitura pendente de eliminação.',
    cleanupCleanOne: 'Tudo em ordem: 1 elemento na nuvem e nenhuma marca de leitura pendente de eliminação.',
    cleanupMissingOne: 'Falta 1 livro; a sua marca de leitura continua guardada:',
    cleanupSideFilesOne: 'Há ainda 1 ficheiro de anotações sem o seu livro.',
    cleanupConfirmOne: 'Eliminar agora a marca de leitura, os marcadores e as notas de 1 livro que já não está lá? Não pode ser desfeito.',
    cleanupDoneOne: 'Foi limpo 1 livro que já não estava lá.',
    cleanupMissing: 'Faltam {count} livros; a sua marca de leitura continua guardada:',
    cleanupMissingOn: '{name} — será eliminado em {date}',
    cleanupMissingNever: '{name} — não será eliminado (escolheu nunca eliminar)',
    cleanupSideFiles: 'Há ainda {count} ficheiros de anotações sem o seu livro.',
    cleanupConfirm: 'Eliminar agora a marca de leitura, os marcadores e as notas de {count} livros que já não estão lá? Não pode ser desfeito.',
    cleanupDone: 'Foram limpos {count} livros que já não estavam lá.',
    cleanupNothing: 'Não havia nada para eliminar: os livros voltaram a aparecer.',
    showMoreRecent: 'Ver mais {count}', showFewerRecent: 'Ver menos',
    removeFromContinue: 'Remover «{title}» de Continuar a ler',
    filterBy: 'Mostrar', filterAll: 'Todos', filterReading: 'A ler', filterPending: 'Pendentes', filterFinished: 'Concluídos',
    sortBy: 'Ordenar por', sortRecent: 'Leitura recente', sortTitle: 'Título', sortAuthor: 'Autor', sortProgress: 'Progresso',
    rating: 'Classificação', ratingNone: 'Sem classificação', ratingOf: '{n} de {max} estrelas',
    openedWithoutSync: 'Não foi possível verificar se tinha avançado noutro dispositivo: abre por onde ia aqui.',
    positionFromOtherDevice: 'Foi recuperada a posição que deixou noutro dispositivo.',
    remotePositionAskEpub: 'Noutro dispositivo a leitura chegou aos {remoto} % e aqui vai pelos {local} %. Quer ir para lá?',
    remotePositionAskPdf: 'Noutro dispositivo a leitura chegou à página {remoto} de {paginas} e aqui vai pela {local}. Quer ir para lá?',
    remotePositionGo: 'Ir para lá',
    remotePositionStay: 'Ficar aqui',
    remotePositionStayed: 'Mantém-se a posição deste dispositivo.',
    bookNoteRating: 'Nota e classificação',
    ratingHint: 'Toque na estrela marcada para retirar a classificação',
    sortRating: 'Classificação', filterRated4: '4 estrelas ou mais', filterRated3: '3 estrelas ou mais', filterUnrated: 'Sem classificação',
    filterGroupStatus: 'Leitura', filterGroupRating: 'Classificação',
    viewLabel: 'Vista', viewList: 'Vista de lista', viewGrid: 'Vista em grelha',
    toggleSection: 'Recolher ou expandir a secção',
    markFinished: 'Marcar «{title}» como concluído', markUnfinished: 'Remover a etiqueta «Concluído» de «{title}»', finished: 'Concluído',
    sampleBookHeading: 'Comece com um livro de exemplo', sampleBookHelp: 'A sua biblioteca está vazia. Adicione um destes exemplos para experimentar o PageKeeper:',
    loadingSampleBook: 'A preparar o livro de exemplo…',
    loadingLibrary: 'A carregar a biblioteca…', noCloudBooks: 'Ainda não há livros sincronizados. Use o botão de envio para adicionar o primeiro.',
    notStarted: 'não iniciado', read: 'lido', page: 'Página', of: 'de',
    bookActions: 'Ações de «{title}»',
    actionUpload: 'Enviar para a nuvem', actionMove: 'Mover para outra pasta', actionDownload: 'Transferir',
    actionOffline: 'Disponível offline', actionRemoveOffline: 'Remover a cópia offline',
    actionUpdateOffline: 'Atualizar a cópia offline', actionDelete: 'Eliminar',
    actionBookNote: 'Nota do livro', bookNote: 'Nota do livro', bookNoteLabel: 'A sua nota sobre este livro',
    bookNotePlaceholder: 'Do que trata, onde o deixou, o que quer lembrar…',
    actionFolderNote: 'Nota da pasta', folderNote: 'Nota da pasta',
    folderNotePlaceholder: 'O que guarda aqui e para quê…',
    noFolderNote: 'Ainda não há nenhuma nota sobre esta pasta.',
    editBookNote: 'Escrever a nota do livro', noBookNote: 'Ainda não há nenhuma nota sobre este livro.',
    actionRename: 'Mudar o nome',
    actionMarkFinished: 'Marcar como concluído', actionMarkUnfinished: 'Remover «Concluído»',
    renameBookPrompt: 'Nome a mostrar na biblioteca (deixe em branco para usar o do ficheiro):',
    actionDeleteFolder: 'Eliminar a pasta',
    actionDownloadFolderZip: 'Transferir a pasta (ZIP)',
    actionSaveFolderToDisk: 'Guardar a pasta no computador',
    packingFolder: 'A preparar a pasta…',
    packingFolderItem: '«{title}» ({current} de {total})',
    folderDownloadedOne: 'Pasta «{name}» guardada: 1 livro.',
    folderDownloadedMany: 'Pasta «{name}» guardada: {count} livros.',
    folderHasNoBooks: 'Essa pasta não contém nenhum livro para transferir.',
    folderDownloadedPartial: 'Pasta «{name}» guardada. Não incluídos: {failed} de {total}.',
    folderDownloadFailed: 'Não foi possível obter nenhum livro da pasta.',
    bookGone: 'o livro já não está no armazenamento deste dispositivo',
    removeOfflineConfirm: 'Remover a cópia offline de «{title}»? O livro da nuvem não será eliminado.',
    savingOffline: 'A guardar «{title}» para leitura offline…', offlineSaved: '«{title}» já está disponível offline ({size} MB).',
    offlineRemoved: 'Cópia offline eliminada. O livro continua na nuvem.', availableOffline: 'OFFLINE', offlineOutdated: 'ATUALIZAR',
    offlineLibrary: 'Offline: são mostradas as cópias guardadas neste dispositivo.',
    offlineFolderEmpty: 'Não há cópias offline nesta pasta.', openedOfflineCopy: 'Aberto a partir da cópia offline.',
    offlineUpdateFailed: 'O livro abriu-se, mas não foi possível atualizar a sua cópia offline.',
    storageFull: 'Não há espaço suficiente para guardar «{title}» offline.',
    fillUrlUser: 'Preencha pelo menos o URL e o utilizador.', configSaved: 'Configuração guardada.', connecting: 'A ligar…',
    connectionOk: '✓ Ligação bem-sucedida: {count} livros encontrados.', configDeleted: 'Configuração eliminada.',
    invalidConfigLink: 'A hiperligação de configuração não é válida.', cloudConfigImported: 'Configuração da nuvem importada.',
    copyLinkFirst: 'Preencha (ou guarde) primeiro o URL e o utilizador.', linkCopied: '✓ Hiperligação copiada. Abra-a no outro dispositivo.',
    copyLinkPrompt: 'Copie a hiperligação e abra-a no outro dispositivo:',
    downloading: 'A transferir «{title}»…', opening: 'A abrir «{title}»…', adding: 'A adicionar «{title}»…', uploading: 'A enviar «{title}» para a sua nuvem…', deleting: 'A eliminar «{title}»…',
    cloudBookDeleted: 'Livro eliminado da nuvem.', localBookDeleted: 'Livro eliminado deste dispositivo.',
    cloudBookDeletedPending: 'Livro eliminado. A limpeza do progresso será repetida quando a ligação voltar.',
    cloudUploaded: '«{title}» enviado para a sua nuvem.', cloudSaved: 'Guardado na sua nuvem. Já sincroniza entre dispositivos.',
    continuing: 'A continuar onde ficou', continuingPage: 'A continuar na página {page}',
    overwrite: '«{title}» já existe na sua nuvem. Quer substituí-lo?',
    deleteCloudConfirm: 'Eliminar «{title}» da sua nuvem? O ficheiro será removido do servidor.',
    deleteLocalConfirm: 'Eliminar «{title}» deste dispositivo?',
    deleteConfigConfirm: 'Eliminar a configuração do servidor? O progresso guardado na nuvem não é afetado.',
    replaceConfigConfirm: 'A configuração importada substituirá a configuração de nuvem atual. Continuar?',
    epubMargin: '{value} % de cada lado', pageMode: 'Ver página a página (como um livro)', scrollMode: 'Ver páginas contínuas (deslocamento)',
    twoPages: 'Ver duas páginas juntas', onePage: 'Ver uma só página', rotatePage: 'Rodar a página',
    readAloud: 'Leitura em voz alta', ttsPlay: 'Ler a partir daqui', ttsPause: 'Pausar', ttsResume: 'Continuar',
    ttsStop: 'Parar', ttsVoice: 'Voz', ttsAutoVoice: 'Automática', ttsSpeed: 'Velocidade',
    ttsHelp: 'Começa na página atual, realça a frase que está a soar e passa de página sozinha.',
    ttsNoSupport: 'Este navegador não permite a leitura em voz alta.',
    ttsNoText: 'Não foi encontrado texto para ler (pode ser um documento digitalizado).',
    immersive: 'Ler em ecrã inteiro', immersiveExit: 'Sair do ecrã inteiro',
    timeLeft: 'Tempo de leitura restante estimado', timeLeftMenu: 'Tempo restante: {time}',
    reader: 'Leitor', readerScreen: 'No ecrã', showStatusBar: 'Mostrar a barra de dados em baixo',
    showStatusBarHelp: 'A linha no fundo do leitor com a página do capítulo, o ecrã do livro, a percentagem lida e o tempo que falta. Ao escondê-la, ganha-se um pouco de altura para o texto.',
    statusChapter: '{page} / {total} do cap.', statusChapterTitle: 'Ecrã dentro do capítulo',
    statusScreens: 'Ecrã {page} de ~{total}',
    statusScreensTitle: 'Ecrãs que o livro ocupa neste dispositivo, com a letra e a margem atuais. É uma estimativa e muda ao alterar esses ajustes.',
    statusPage: 'Página {page} de {total}', statusPageTitle: 'Página do documento',
    statusRead: '{percent} % lido', statusReadTitle: 'Parte do livro que já leu',
    timeLessMinute: '< 1 min', timeMinutes: '{m} min', timeHoursMinutes: '{h} h {m} min', goPercent: 'Ir para a percentagem do livro (0–100):', goToPage: 'Ir para a página (1–{total}):',
    sampleNoticeHtml: '<h2>Dois livros para começar</h2><span>A sua biblioteca inclui dois livros de exemplo para poder experimentar o PageKeeper desde já. São seus: pode lê-los, guardá-los ou eliminá-los quando quiser, a partir do menu de ações de cada livro.</span>',
    dontShowAgain: 'Não mostrar novamente',
    noConfigHtml: '<span>Não há nenhum servidor configurado. Pode abrir um livro (PDF ou EPUB) deste dispositivo, ou <a href="#" id="enlace-configurar">configurar a sua nuvem (Nextcloud ou outro WebDAV)</a> para sincronizar a posição de leitura entre dispositivos.</span><p class="ayuda">Não sabe o que é isto ou de que precisa? <a href="#" id="enlace-ayuda-aviso">Leia a ajuda</a>.</p>',
    syncError: 'Erro de sincronização', syncFailed: 'Não foi possível sincronizar o progresso: {error}',
    syncRecovered: 'A sua posição já está guardada na nuvem',
    stats: 'Estatísticas de leitura', statsView: 'Ver as estatísticas',
    statsSettingsHelp: 'O tempo que dedica a ler, os dias seguidos que leva e os livros a que dedica mais tempo, somando todos os seus dispositivos.',
    statsSummary: 'A sua leitura', statsLastDays: 'Os últimos 30 dias',
    actionBookStats: 'Tempo de leitura',
    statusTimeSpentTitle: 'Tempo que leva a ler este livro. Toque para ver em detalhe.',
    statusPaused: 'Em pausa',
    statusPausedTitle: 'O tempo dedicado não está a somar: está na mesma página há mais de cinco minutos. Volta a contar assim que mudar de página.',
    statsBookTime: 'Tempo dedicado', statsBookRead: 'Lido', statsBookPace: 'Ritmo',
    statsPacePerPage: '{time} por página', statsPaceSeconds: '{s} s por página',
    statsBookByDevice: 'Em cada dispositivo',
    statsHideFromList: 'Ocultar da lista',
    statsShowInList: 'Voltar à lista',
    statsHideNote: 'Deixa de aparecer em «Onde vai o tempo». Não se apaga nada: volta à lista assim que o leres outro bocado.',
    statsHiddenNote: 'Agora não aparece em «Onde vai o tempo». Volta sozinho assim que o leres outro bocado.',
    statsBookEmpty: 'Ainda não há tempo registado para este livro. Assim que ler uns minutos com ele aberto, aqui aparecerá quanto tempo lhe dedicou.',
    statsShared: 'Soma de todos os seus dispositivos: o que leu no telemóvel e no computador conta em conjunto, e um dia em que tenha lido em ambos conta como um só dia.',
    statsTopBooks: 'Onde vai o tempo',
    statsSortBy: 'Ordenar por', statsSortTime: 'Tempo dedicado',
    statsSortRecent: 'Última leitura', statsSortTitle: 'Título',
    statsLastRead: 'lido a {date}', statsBookGone: 'já não está na biblioteca', statsDataTitle: 'Sobre estes dados',
    statsEmptyTitle: 'Ainda não há nada a mostrar',
    statsEmpty: 'Assim que ler uns minutos com um livro aberto, aqui aparecerão o tempo dedicado, os dias seguidos que leva a ler e os livros a que dedica mais tempo.',
    statsPrivacy: 'Com uma nuvem configurada, o tempo de leitura viaja com a posição de leitura: cada dispositivo regista o seu e aqui mostra-se a soma, para saber quanto tempo demorou a ler um livro mesmo que o tenha lido aos poucos em cada aparelho. Ficam no seu próprio servidor WebDAV, junto com os seus livros, e nunca são enviados para mais lado nenhum. Sem nuvem configurada, ficam neste navegador. Só conta o tempo com o livro à frente: enquanto a aplicação não está à vista o relógio para, e os saltos de posição não são somados. De cada página contam-se no máximo cinco minutos; passado esse tempo a barra do fundo avisa que está em pausa, e volta a contar ao mudar de página.',
    statsDelete: 'Eliminar as estatísticas',
    statsDeleteConfirm: 'Eliminar as estatísticas de leitura? São eliminadas em todos os seus dispositivos: os que estiverem ligados fá-lo-ão assim que sincronizarem. Não afeta os seus livros, a página em que vai nem as suas anotações.',
    statsDeleted: '✓ Estatísticas eliminadas. Os outros dispositivos eliminam-nas ao sincronizar.',
    statsOptOut: 'Não medir o tempo de leitura',
    statsOptOutHelp: 'Deixa de contar o tempo, os dias seguidos e o tempo dedicado a cada livro. Ao ativar, é eliminado o que estiver registado até agora, sem possibilidade de recuperação. Com a nuvem configurada, a decisão chega também aos seus outros dispositivos: deixam de medir assim que sincronizam.',
    statsOptOutConfirm: 'Deixar de medir o tempo de leitura?\n\nSerá eliminado tudo o que foi registado até agora —o tempo, os dias seguidos e o tempo de cada livro— e não poderá ser recuperado. Com a nuvem configurada, tanto a eliminação como a decisão de não medir chegarão aos seus outros dispositivos.',
    statsOffTitle: 'Não se está a medir nada',
    statsOff: 'Tem desativada a contagem do tempo de leitura. Pode voltar a ativá-la aqui em baixo, em «Estes dados»; a contagem recomeça do zero.',
    statsOffDone: '✓ Deixou de medir-se e o que havia foi eliminado.',
    statsOnAgain: '✓ Volta a medir-se, começando do zero.',
    statsTotal: 'Tempo total', statsToday: 'Hoje', statsWeek: 'Últimos 7 dias',
    statsStreak: 'Dias seguidos', statsAverage: 'Média por dia lido',
    statsActiveDays: 'Dias com leitura', statsBestDay: 'Melhor dia', statsPdfPages: 'Páginas de PDF',
    statsBestStreak: 'a sua melhor sequência: {streak}', statsStreakNow: 'sequência em curso',
    statsNoStreak: 'hoje ou amanhã começa uma',
    statsDays: '{count} dias', statsDaysOne: '{count} dia', statsHours: '{h} h',
    statsChartLabel: 'Gráfico do tempo lido em cada um dos últimos {days} dias.',
    statsChartSummary: 'Leu em {days} dos últimos 30, {total} no total.',
    statsGroupBy: 'Agrupar por',
    statsByDay: 'Dias', statsByWeek: 'Semanas', statsByMonth: 'Meses', statsByYear: 'Anos',
    statsLastWeeks: 'As últimas 12 semanas', statsLastMonths: 'Os últimos 12 meses',
    statsLastYears: 'Os últimos 5 anos',
    statsCount_semana: '{count} semanas', statsCount_semanaOne: '{count} semana',
    statsCount_mes: '{count} meses', statsCount_mesOne: '{count} mês',
    statsCount_anno: '{count} anos', statsCount_annoOne: '{count} ano',
    statsChartSummaryPeriod: 'Leu em {count}, {total} no total.',
    statsWeekOf: 'Semana de {date}',
    statsThisWeek: 'Esta semana', statsThisMonth: 'Este mês', statsThisYear: 'Este ano',
    statsThisDay: 'Hoje',
    statsPrevWeek: 'A semana anterior', statsPrevMonth: 'O mês anterior',
    statsPrevYear: 'O ano anterior', statsPrevDay: 'Ontem',
    statsSoFar: 'a esta altura', statsUpToMonth: 'até {month}',
    statsMoreThanBefore: '{percent} % mais', statsLessThanBefore: '{percent} % menos',
    statsSame: 'Igual', statsFirstTime: 'Está a começar', statsNoTime: 'Nada',
    statsHistoryFrom: 'O detalhe por dias chega até {date}.',
    statsChartEmpty: 'Ainda não leu nada nestes 30 dias.',
    statsChartDay: '{date}: {time}', statsChartDayNone: '{date}: sem leitura',
    statsBooksTracked: 'Dos {count} mais recentes.',
    statsBookUntitled: 'Livro sem título',
    activityLog: 'Registo de atividade',
    activityLogHelp: 'Regista se a posição de leitura chega ao servidor e os erros que o impedem. Serve para perceber por que razão um livro ficou atrasado noutro dispositivo. Guarda-se apenas aqui, nunca sai deste aparelho e apaga-se sozinho ao fim de uma semana.',
    viewLog: 'Ver o registo', clearLog: 'Limpar', copyLog: 'Copiar', downloadLog: 'Guardar',
    logEmpty: 'Ainda não há nada registado.',
    logWithErrors: '{errores} erro(s) registados',
    logNoErrors: '{total} eventos, nenhum com erro',
    logCopied: 'Registo copiado', logCopyFailed: 'Não foi possível copiar; use «Guardar»',
    logRecovered: 'enviado após {intentos} tentativa(s) falhada(s)',
    logRetrying: 'a tentar novamente (falhas seguidas: {intentos})',
    logOffline: 'offline: à espera de recuperar a ligação',
    logBackOnline: 'ligação recuperada', logWentOffline: 'ligação perdida',
    cloudScope: 'Livros e progresso disponíveis em todos os seus dispositivos',
    localScope: 'Livros guardados apenas neste dispositivo',
    emptyLocalAction: 'Adicionar livros apenas a este dispositivo',
    emptyLocalHelp: 'Não serão sincronizados. Selecione ficheiros PDF ou EPUB, ou arraste-os para aqui.',
    webdavHelpHtml: 'Compatível com Nextcloud, ownCloud e qualquer servidor WebDAV. Os PDF da pasta indicada aparecerão na sua biblioteca e a posição de leitura sincronizará entre todos os seus dispositivos. Não sabe o que colocar aqui? <a href="#" id="enlace-ayuda-ajustes">Leia a ajuda</a>.',
    passwordHelpHtml: '⚠️ No Nextcloud, crie uma <strong>palavra-passe de aplicação</strong> (Definições → Segurança); não use a sua palavra-passe principal. Além disso, para o navegador conseguir ligar-se, o servidor tem de permitir CORS: no Nextcloud, instale a aplicação <strong>WebAppPassword</strong> e adicione o domínio deste leitor. Os dados são guardados apenas neste navegador.',
    transferHelp: 'Pode copiar uma hiperligação ou guardar um ficheiro com o URL, o utilizador e a palavra-passe de aplicação, e abri-lo noutro dispositivo. ⚠️ A hiperligação e o ficheiro permitem aceder à sua nuvem: guarde-os em privado e elimine as cópias de que já não precisa.',
    creditsHtml: 'Construído com <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">PDF.js</a> (Apache 2.0), <a href="https://github.com/futurepress/epub.js" target="_blank" rel="noopener">epub.js</a> (BSD), JSZip (MIT), <a href="https://www.mathjax.org/" target="_blank" rel="noopener">MathJax</a> (Apache 2.0) e ícones <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC).',
    dropLocal: 'Largue aqui para guardar neste dispositivo', dropCloud: 'Largue aqui para enviar para a nuvem',
    unsupportedFiles: 'Só é possível adicionar ficheiros PDF ou EPUB.',
    localDuplicate: 'Esse livro já está neste dispositivo, guardado como «{title}».',
    noBooksInFolder: 'Essa pasta não contém nenhum PDF nem EPUB.', localAddedOne: 'Livro guardado neste dispositivo.', localAddedMany: '{count} livros guardados neste dispositivo.',
    saveFailed: 'Não foi possível guardar «{title}»: {error}',
    searchLibrary: 'Pesquisar na biblioteca', clearSearch: 'Limpar a pesquisa', searchLibraryPlaceholder: 'Pesquisar por título, autor…',
    showIndex: 'Mostrar o índice', hideIndex: 'Esconder o índice',
    showThumbs: 'Mostrar as miniaturas', hideThumbs: 'Esconder as miniaturas',
    showIndexThumbs: 'Mostrar o índice e as miniaturas',
    hideIndexThumbs: 'Esconder o índice e as miniaturas',
    searchBook: 'Pesquisar dentro do livro', bookIndex: 'Índice do livro', bookStart: 'Início do livro', historyNavigation: 'Histórico de navegação', backPosition: 'Voltar à posição anterior', forwardPosition: 'Avançar para a posição seguinte', pageAndHistory: 'Página e histórico de navegação', wordOrPhrase: 'Palavra ou frase', search: 'Pesquisar', close: 'Fechar', zoomedImage: 'Imagem ampliada',
    searchingBook: 'A pesquisar no livro…', searchProgress: 'A pesquisar… {done}/{total} · {count} resultados.', noSearchResults: 'Não foram encontrados resultados.', searchResults: '{count} resultados.',
    chapter: 'Capítulo', noLibraryResults: 'Não há livros que correspondam à pesquisa.',
    searchingFolders: 'A pesquisar também dentro das pastas…', inFolder: 'Na pasta «{name}»',
    bookmarks: 'Marcadores', bookmark: 'Marcador', addBookmark: 'Adicionar um marcador aqui',
    annotations: 'Anotações', noAnnotations: 'Ainda não há anotações.',
    highlightColor: 'Cor do realce', highlightYellow: 'Realçar a amarelo',
    highlightGreen: 'Realçar a verde', highlightBlue: 'Realçar a azul', highlightPink: 'Realçar a rosa',
    exportAnnotations: 'Exportar as anotações (Markdown)', exportHeader: 'Anotações de «{title}»',
    exportSource: 'Exportadas do PageKeeper', annotationsExported: 'Anotações exportadas.',
    searchAnnotations: 'Pesquisar nas anotações', noAnnotationResults: 'Não há anotações correspondentes.',
    selectionActions: 'Ações para o texto selecionado', highlight: 'Realçar', addNote: 'Adicionar nota',
    note: 'Nota', notePrompt: 'Nota sobre o texto selecionado:', editNote: 'Editar nota', deleteAnnotation: 'Eliminar anotação', deleteAnnotationConfirm: 'Eliminar esta anotação?', noteActions: 'Opções da nota',
    annotationAdded: 'Anotação guardada.', annotationDeleted: 'Anotação eliminada.',
    bookmarkName: 'Nome do marcador', bookmarkNamePlaceholder: 'Nome do marcador (opcional)',
    bookmarkNamePrompt: 'Nome do marcador (deixe em branco para o remover):', editBookmark: 'Mudar o nome do marcador',
    noBookmarks: 'Ainda não há marcadores.', bookmarkAdded: 'Marcador adicionado.',
    bookmarkRenamed: 'Nome do marcador atualizado.',
    bookmarkRemoved: 'Marcador eliminado.', bookmarkExists: 'Já existe um marcador nesta posição.',
    deleteBookmark: 'Eliminar o marcador',
    cloudRoot: 'Início', currentFolder: 'Pasta atual', targetFolder: 'Pasta de destino',
    newFolder: 'Criar uma pasta', folderNamePrompt: 'Nome da nova pasta:',
    invalidFolderName: 'O nome da pasta não é válido.',
    creatingFolder: 'A criar a pasta «{name}»…', folderCreated: 'Pasta «{name}» criada.',
    renamingFolder: 'A mudar o nome de «{name}»…',
    openFolder: 'Abrir a pasta «{name}»',
    folderEmpty: 'Vazia', folderItemsOne: '1 elemento', folderItems: '{count} elementos',
    sectionFoldersOne: '1 pasta', sectionFolders: '{count} pastas',
    sectionBooksOne: '1 livro', sectionBooks: '{count} livros',
    deleteFolderConfirm: 'Eliminar a pasta «{name}» e todo o seu conteúdo da sua nuvem?',
    folderDeleted: 'Pasta eliminada da nuvem.', emptyFolder: 'Esta pasta está vazia.',
    deviceRoot: 'Início', actionRenameFolder: 'Mudar o nome da pasta',
    actionSaveToDevice: 'Guardar neste dispositivo',
    imagesInvertedOff: 'Devolver a sua cor às imagens',
    imagesInvertedOn: 'Imagens na sua cor: ativado. Toque para as inverter com a página',
    library: 'Biblioteca', showContinueReading: 'Mostrar «Continuar a ler»',
    showContinueReadingHelp: 'O quadro com as suas últimas leituras, por cima da biblioteca. Ao escondê-lo, os livros continuam onde estavam e mantêm a sua página.',
    openLastOnStart: 'Abrir a última leitura ao iniciar o PageKeeper',
    openLastOnStartHelp: 'Ao abrir a aplicação vai diretamente para o livro que estava a ler, sem passar pela biblioteca. É lembrado apenas neste dispositivo: nos outros continuará a chegar à biblioteca.',
    theme: 'Tema', themeAuto: 'O do sistema', themeLight: 'Claro', themeSepia: 'Sépia',
    statsBookCard: 'Ver o tempo de «{title}»',
    themeDark: 'Escuro', themeBlack: 'Preto',
    autoTheme: 'O tema do sistema',
    autoThemeHelp: 'Quando o tema está em «o do sistema», a aplicação clareia ou escurece com o resto do dispositivo. Aqui escolhe com que tema o faz de cada lado. Os cinco temas continuam à mão no botão do cabeçalho; isto só decide para qual vai «o do sistema».',
    autoThemeLight: 'Quando o sistema está claro',
    autoThemeDark: 'Quando o sistema está escuro',
    autoThemeNow: 'Neste momento o seu sistema pede o tema {theme}, que é o que está a ver.',
    autoThemeIdle: 'Tem o tema definido à mão em {theme}, por isso isto não muda nada para já. Volte a «o do sistema» no botão do cabeçalho para que tenha efeito.',
    actionMoveFolder: 'Mover a pasta', moveFolderTo: 'Mover a pasta «{name}»',
    folderMoved: 'Pasta «{name}» movida.',
    savedToDevice: '«{title}» guardado neste dispositivo.',
    folderRenamePrompt: 'Novo nome da pasta:', folderRenamed: 'Pasta renomeada.',
    folderExists: 'Já há uma pasta com esse nome aqui.',
    deleteLocalFolderConfirm: 'Eliminar a pasta «{name}» e todos os livros que contém deste dispositivo?',
    localFolderDeleted: 'Pasta eliminada deste dispositivo.',
    emptyLocalFolder: 'Esta pasta ainda não tem livros.',
    moveToDeviceFolder: 'Mover «{title}» para outra pasta do dispositivo',
    moveBook: 'Mover «{title}» para outra pasta', moveHere: 'Mover para aqui',
    moving: 'A mover «{title}»…', bookMoved: '«{title}» movido.', cancel: 'Cancelar',
    loadingFolders: 'A carregar pastas…', noSubfolders: 'Sem subpastas.',
    textSettings: 'Definições de texto', fontFamily: 'Tipo de letra',
    bookFont: 'A do livro', serifFont: 'Com serifa', sansFont: 'Sem serifa',
    lineSpacing: 'Entrelinha', bookSpacing: 'A do livro', spacingCompact: 'Compacto',
    spacingNormal: 'Normal', spacingWide: 'Ampla', spacingWider: 'Muito ampla',
    hyphenation: 'Dividir palavras', hyphenationAuto: 'Sim, no final da linha',
    hyphenationBook: 'Como no livro', hyphenationNever: 'Não dividir',
    textAlignment: 'Alinhamento', bookAlignment: 'O do livro',
    unjustifiedAlignment: 'Não justificado',
    justifiedAlignment: 'Justificado',
    columnsSettings: 'Colunas', columnsAuto: 'Automáticas',
    columnsOne: 'Uma coluna', columnsTwo: 'Duas colunas',
    columnsThree: 'Três colunas', columnsFour: 'Quatro colunas',
    columnsSettingsHelp: 'Em quantas colunas o texto se reparte no ecrã. No automático cabem as que couberem sem que as linhas fiquem incómodas, e mudam sozinhas ao girar o aparelho ou ao mexer no tamanho da letra. Com um livro aberto, o botão das colunas muda o desse livro; o daqui é com que começam os outros. Isto não viaja para os outros dispositivos: cada ecrã é um caso.',
    lineLength: 'Linhas de no máximo', lineLengthValue: '{value} letras',
    moreColumns: 'Mais colunas', fewerColumns: 'Menos colunas',
    lineLengthHelp: 'Só conta no automático: abre-se outra coluna assim que o texto dá para que nenhuma passe desse comprimento. Com linhas curtas aparecem mais cedo; com linhas longas, mais tarde.',
  },
};

const ayudas = {
  ca: `
    <div class="pestanas" data-grupo="ayuda" role="tablist"
      aria-label="Seccions de l’ajuda">
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-empezar" data-panel="empezar"
        aria-selected="true">Primers passos</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-biblioteca" data-panel="biblioteca"
        aria-selected="false" tabindex="-1">Biblioteca</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-lector" data-panel="lector"
        aria-selected="false" tabindex="-1">Lector</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-nube" data-panel="nube"
        aria-selected="false" tabindex="-1">Núvol</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-privacidad" data-panel="privacidad"
        aria-selected="false" tabindex="-1">Privadesa</button>
    </div>

    <div id="panel-ayuda-empezar" class="panel-pestana" role="tabpanel"
      aria-label="Primers passos" tabindex="0">
<div class="tarjeta"><h2>Què fa PageKeeper?</h2><p>Llegeix llibres PDF i EPUB, incloses fórmules matemàtiques, des del mòbil, la tauleta o l’ordinador, i recorda el punt de lectura.</p><ul class="lista-ayuda"><li><strong>Afegeix un llibre del dispositiu (botó «+»):</strong> funciona de seguida, sense comptes. El llibre queda desat només en aquest navegador. També pots arrossegar un o diversos fitxers a la secció local.</li><li><strong>Afegeix una carpeta sencera:</strong> el botó de la carpeta amb la fletxa (i el mateix gest d’arrossegar-hi una carpeta) copia tots els PDF i EPUB que hi hagi dins, subcarpetes incloses, i refà aquesta mateixa estructura a la biblioteca. Amb el núvol funciona igual: les carpetes es creen al servidor.</li><li><strong>Connecta un núvol (WebDAV):</strong> els llibres i la posició de lectura se sincronitzen entre dispositius.</li></ul></div>

<div class="tarjeta"><h2>Clar, sèpia, fosc i negre</h2><p>El botó del tema, a la capçalera, obre un menú amb cinc opcions: <strong>el del sistema</strong> (cercle meitat clar meitat fosc), <strong>clar</strong> (sol), <strong>sèpia</strong> (tassa), <strong>fosc</strong> (lluna) i <strong>negre</strong> (lluna amb estrella). La icona del botó et diu en quin ets i la teva tria es recorda en aquest navegador. De primer s’usa el del sistema, de manera que l’aplicació s’aclareix o s’enfosqueix quan ho fa la resta del dispositiu.</p><p class="ayuda">El tema és també el paper amb què llegeixes: clar és paper blanc, sèpia el torrat dels lectors de tinta electrònica, fosc el mode nit de la pàgina i negre aquest mateix mode nit portat al negre pur, que a les pantalles OLED apaga el píxel i gasta menys bateria.</p><p class="ayuda">Amb «el del sistema» pots decidir a quin tema va cada costat: sèpia en lloc de clar de dia, o negre en lloc de fosc de nit. Es tria a <em>⚙️ Configuració → Biblioteca</em>, amb una mostra de cadascun per veure’ls sense canviar el tema del dispositiu.</p></div>
    </div>

    <div id="panel-ayuda-biblioteca" class="panel-pestana" role="tabpanel"
      aria-label="Biblioteca" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Els llibres a la vista</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Continua llegint</summary>
          <p>
        el darrer llibre apareix destacat. En pantalla ampla les lectures recents es
        veuen com a fitxes amb la portada gran i el títol sencer, totes alhora; en
        pantalla estreta es despleguen amb «Veure’n més». Pots treure’n les que ja no
        vulguis veure; a <em>⚙️ Configuració → Biblioteca</em> es tria quantes se’n
        mostren i s’apaga el requadre sencer, si prefereixes anar directament als
        llibres. Només surt a la pantalla inicial: en entrar en una carpeta es retira
        per deixar lloc al que hi ha dins. Un llibre descartat torna a aparèixer quan
        l’obres de nou. Els acabats i els fitxers que ja no existeixen queden fora
        d’aquesta llista. La casella del final del requadre fa que PageKeeper s’obri
        directament a la teva última lectura, sense passar per la biblioteca; només val
        per a aquest dispositiu, així que la pots tenir posada al mòbil i no a
        l’ordinador. El menú «⋯» de cada fitxa ofereix el mateix que a la
        biblioteca (canviar el nom, moure, pujar o desar, sense connexió, esborrar…),
        així que no cal baixar a buscar el llibre per fer-li res.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ordre i estats</summary>
          <p>
        pots ordenar per lectura recent, títol, autor o progrés, filtrar els llibres
        pendents, en lectura o acabats i marcar-ne qualsevol com a acabat. Prem la
        mateixa etiqueta «Acabat» per treure-la; també desapareix sola si tornes a
        obrir el llibre, sense perdre el progrés. Un llibre amb un 0 % llegit es
        considera pendent encara que s’hagi obert.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Portades</summary>
          <p>
        es generen soles (la coberta de l’EPUB o la primera pàgina del PDF) i mostren
        l’avenç de lectura de cada llibre. El cercador de la biblioteca filtra per nom,
        títol, autor, format i altres metadades disponibles. Al mòbil, mantén premut un
        títol tallat per veure’l sencer.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Resum del llibre</summary>
          <p>
        si el fitxer porta una sinopsi a les metadades (la descripció de l’EPUB o
        l’«assumpte» del PDF), apareix en un requadre en deixar-hi el ratolí a sobre,
        tant a «Continua llegint» com a les dues biblioteques, i també sota el títol al
        menú «⋯», que és com es llegeix en pantalla tàctil.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Llibre d’exemple</summary>
          <p>
        quan la biblioteca és completament buida pots afegir i obrir una obra de mostra
        en l’idioma de la interfície. Després funciona com qualsevol llibre local.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Carpetes</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Carpetes del dispositiu</summary>
          <p>
        la secció «En aquest dispositiu» també es pot organitzar en carpetes amb el
        botó de la carpeta amb «+». Hi entres prement-les (la ruta apareix sobre la
        llista per tornar), canvies el nom o les esborres des del seu menú «⋯», i mous
        un llibre amb l’opció «Mou a una altra carpeta» o arrossegant-lo fins a la
        carpeta. Les carpetes també es mouen: amb «Mou la carpeta» o arrossegant-les
        fins a una altra carpeta o fins a un tram de la ruta, i s’enduen tot el que hi
        ha dins. Moure un llibre aquí no l’afecta gens: conserva la pàgina, els
        marcadors i les anotacions. Els llibres nous van a parar a la carpeta que
        tinguis oberta, i el cercador els continua trobant siguin on siguin.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Carpetes al núvol</summary>
          <p>
        la secció «Al núvol» mostra les subcarpetes de la teva carpeta i permet
        entrar-hi (la ruta apareix sobre la llista per tornar). Pots crear carpetes
        noves, canviar-los el nom o esborrar-les des del seu menú «⋯» (en esborrar-les
        també se n’elimina el contingut) i moure un llibre d’una carpeta a una altra
        amb el seu botó de moure o arrossegant-lo fins a una carpeta de la llista (o
        fins a un tram de la ruta), conservant el progrés i els marcadors. Les carpetes
        també es mouen: fes servir «Mou la carpeta» o arrossega-les fins a una altra
        carpeta o fins a un tram de la ruta, i s’enduen tot el que guarden. Ni
        movent-les ni canviant-los el nom es perd res: els llibres de dins conserven la
        pàgina, els marcadors, les anotacions i la nota, i les subcarpetes igual.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Baixar una carpeta sencera</summary>
          <p>
        el menú «⋯» de cada carpeta la desa completa, amb les subcarpetes i tots els
        llibres. Al Chrome, l’Edge i l’Opera d’escriptori tries on posar-la i es copia
        tal qual; a la resta de navegadors (Firefox, Safari, mòbils) es baixa com un
        únic fitxer ZIP.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Enrere</summary>
          <p>
        el botó (o el gest) de tornar enrere del navegador puja un nivell de carpeta en
        comptes de sortir de PageKeeper: des d’una subcarpeta porta a l’anterior i des
        de l’arrel sí que surt. També tanca el lector, l’ajuda o la configuració.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Moure, desar i esborrar</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Pujar al núvol</summary>
          <p>
        amb un núvol configurat, el botó del núvol de cada llibre local el copia a la
        teva carpeta remota conservant la pàgina per la qual vas; també pots pujar un
        fitxer amb el «+» o arrossegar-lo fins a la secció «Al núvol»; i també pots
        arrossegar un llibre d’«En aquest dispositiu» fins al núvol o fins a una de les
        seves carpetes. Tot es puja a la carpeta que tinguis oberta.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Portar llibres d’un costat a l’altre</summary>
          <p>
        un llibre del núvol es pot desar al dispositiu amb «Desa en aquest dispositiu»
        o arrossegant-lo fins a la secció (o la carpeta) local; i un del dispositiu es
        puja al núvol amb el seu botó o arrossegant-lo fins a «Al núvol». En tots dos
        casos se’n fa una còpia: l’original es queda on era i cada biblioteca porta el
        seu propi progrés.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Disponible sense connexió</summary>
          <p>
        el botó del núvol amb fletxa desa una còpia gestionada del llibre remot. Si la
        xarxa falla, PageKeeper la mostra i l’obre automàticament. El botó verd permet
        treure només aquesta còpia sense esborrar el llibre del núvol.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Baixar</summary>
          <p>
        el botó de baixada desa una còpia del fitxer (PDF o EPUB) al dispositiu, vingui
        del núvol o de la biblioteca local.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Esborrar</summary>
          <p>
        la paperera de cada llibre l’elimina (del servidor si és del núvol, o d’aquest
        dispositiu si és local).</p>
        </details>
        <details class="punto-ayuda">
            <summary>Estadístiques de lectura</summary>
            <p>El botó del gràfic de la capçalera obre el temps que dediques a
          llegir: el total, el d’avui i el de la setmana, els dies seguits que
          portes, un gràfic de barres i els llibres
          als quals dediques més estona —els de menys de cinc minuts no surten en aquesta llista, perquè no l’omplin els que només vas obrir per veure de què anaven; el seu temps continua comptant als totals i a la fitxa del llibre—. Aquesta llista es pot ordenar per temps dedicat, per última lectura o per títol, i cada llibre obre la seva fitxa. El gràfic s’agrupa per <strong>dies, setmanes,
          mesos o anys</strong>, i a sota compara el tram en curs amb l’anterior: quant
          portes aquest mes respecte del passat, o enguany respecte de l’any passat. La
          barra ratllada és la del tram que encara va a mitges. El detall per dies arriba
          fins a uns tretze mesos enrere; el total de cada mes es guarda per sempre, així
          que els mesos i els anys es poden comparar encara que siguin vells. Només es compta el temps amb el llibre
          al davant: mentre l’aplicació no és a la vista —una altra pestanya, una altra
          aplicació, el mòbil blocat— el rellotge s’atura, així que deixar-la oberta no
          suma. De cada pàgina es compten com a màxim cinc minuts; si t’hi quedes més
          estona, la barra del peu avisa amb un «En pausa» i el rellotge torna a córrer
          tan bon punt canvies de pàgina.</p>
            <p>Si prefereixes que no es mesuri res, hi ha una casella —«No mesurar el
          temps de lectura»— a <em>⚙️ Configuració → Dades</em> i al peu de la mateixa
          pantalla d’estadístiques. En marcar-la s’avisa que s’esborrarà el que s’hagi
          apuntat fins aleshores. Es pot tornar a activar quan vulguis: llavors es
          comença a comptar des de zero. La decisió viatja amb la resta de les teves dades: si uses el núvol, els altres dispositius deixen de mesurar tan bon punt sincronitzen.</p>
            <p>Amb un núvol configurat, les xifres sumen tots els teus
          dispositius: el temps de cada llibre porta a sota el repartiment
          («aquest dispositiu 2 h · Chrome en Linux 45 min»), de manera que
          saps quant t’ha costat llegir-lo encara que l’hagis llegit a estones
          en cada aparell, i un dia en què hagis llegit en dos compta com un sol
          dia de la ratxa. Tot plegat viatja amb el progrés de lectura, al teu
          propi servidor, i no s’envia enlloc més. Les pots esborrar quan
          vulguis des d’aquesta mateixa pantalla —s’esborren a tots els
          dispositius— sense tocar els llibres ni el progrés.</p>
            <p>D’un llibre concret ho tens més a mà: mentre el llegeixes, la
          barra del peu comença amb el temps que hi portes dedicat, i en prémer-lo
          s’obre la seva fitxa, amb el que has llegit, les pàgines, el ritme, el
          que queda i el repartiment per dispositius. La mateixa fitxa és al
          menú «⋯» del llibre a la biblioteca.</p>
          </details>
          <details class="punto-ayuda">
          <summary>Importar i exportar</summary>
          <p>
        el botó de la carpeta amb fletxa de la capçalera obre una pantalla des d’on
        pots afegir llibres i baixar o restaurar còpies ZIP. Hi ha una còpia per als
        llibres d’«En aquest dispositiu» i una altra per a tota la biblioteca WebDAV,
        incloses les subcarpetes. Totes dues conserven el progrés, els marcadors i les
        anotacions; cap no conté la contrasenya. Per desar a part l’URL, l’usuari i la
        contrasenya d’aplicació, fes servir <em>Configuració → Porta la configuració a
        un altre dispositiu</em>.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-lector" class="panel-pestana" role="tabpanel"
      aria-label="Lector" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Veure la pàgina</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Mode de lectura</summary>
          <p>
        pàgina a pàgina (com un llibre) o pàgines contínues amb desplaçament vertical.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Passa pàgina</summary>
          <p>
        arrossega cap als costats i la pàgina acompanya el dit deixant veure on vas; si
        te’n penedeixes a mig camí, torna sola al seu lloc. Prement els marges esquerre
        i dret, o amb les fletxes i l’espai, la pàgina fa sola aquest mateix recorregut,
        així que també es veu a l’ordinador. Als PDF s’hi veu de debò la pàgina veïna.
        També val per dalt i per baix: prémer la part baixa o lliscar el dit cap
        amunt avança, i la part alta o el dit cap avall retrocedeix. Amb les pàgines
        contínues, o amb zoom, mana el desplaçament i no hi ha animació.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Columnes de text</summary>
          <p>
        el botó de les columnes obre un menú: automàtiques, o d’una a quatre. En automàtic n’hi caben les que hi càpiguen sense que les línies es facin incòmodes de llegir, i es refan soles en girar l’aparell o en canviar la mida de la lletra. El que triïs és d’aquell llibre i d’aquest dispositiu. En els PDF, que arriben maquetats, només es pot veure una pàgina o dues de juntes. Quan apareixen en automàtic ho decideixes a <em>⚙️ Ajustos → Lector</em>, dient de quantes lletres vols les línies.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Gira la pàgina (només PDF)</summary>
          <p>
        el botó de girar fa rotar el document 90° cada vegada, útil per a escanejos
        torts o apaïsats. El gir es recorda per a cada llibre en aquest dispositiu.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Pantalla completa</summary>
          <p>
        un toc al centre de la pàgina amaga la barra superior per llegir sense
        distraccions; un altre toc la recupera.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ajust i zoom</summary>
          <p>
        els tres comandaments del zoom van junts: les dues lupes, que amplien i
        redueixen, i al mig l’augment en tant per cent. En prémer aquest número s’obre
        un plafó amb «Ajusta a l’amplada», «Ajusta la pàgina completa», els augments
        més usats i un buit on escriure el que vulguis (205 %, si és el que et convé).
        Als PDF el percentatge és el de la pàgina —100 % és la mida natural, així que
        encaixar-la a l’amplada pot donar qualsevol xifra— i als EPUB és el de la
        lletra. Amb zoom pots arrossegar la pàgina amb el ratolí o el dit, i en
        pantalla tàctil pessigar per ampliar: als PDF canvia el zoom i als EPUB, la
        mida de la lletra.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Temps restant</summary>
          <p>
        després d’uns minuts de lectura apareix una estimació del temps que falta per
        acabar el llibre, calculada amb el teu ritme real en aquest dispositiu.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Text i color</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Configuració del text (només EPUB)</summary>
          <p>
        el botó de la lletra permet triar el tipus de lletra (la del llibre, amb serifa
        o sense), l’alineació, l’interlineat, el marge de tots dos costats i si les
        paraules es parteixen al final de línia. Els mateixos ajustos són a <em>⚙️
        Configuració → Lector</em>, per veure’ls i canviar-los sense obrir cap llibre;
        els dos llocs mostren sempre el mateix. Partir-les ve activat: en pantalla
        estreta, i encara més amb el text justificat, és el que evita els buits grans
        entre paraules. Ho fa el navegador segons l’idioma del llibre, així que pot no
        estar disponible per a tots els idiomes; també es pot deixar com vingui a cada
        llibre, o no partir mai.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Paper del llibre</summary>
          <p>
        el paper és el tema de l’aplicació: no hi ha dos ajustos per quadrar. El botó
        del tema, a la capçalera de la biblioteca, obre un menú amb cinc opcions —el del
        sistema, clar, sèpia (torrat, més descansat per a estones llargues), fosc i
        negre (negre pur, per a pantalles OLED)— i
        canvia alhora la pàgina del llibre i tota la resta. Als EPUB es canvien els
        colors del text, així que les il·lustracions es veuen tal qual; als PDF,
        que són una imatge ja dibuixada, es tenyeix la pàgina sencera.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Imatges amb els temes foscos (només PDF)</summary>
          <p>
        en invertir la pàgina, les fotos i els logotips queden en negatiu. El botó de
        la imatge, que surt a la barra del lector quan llegeixes un PDF amb el tema
        fosc o el negre, els torna el color. Es recorda d’un llibre a l’altre. Les pàgines escanejades
        no es toquen: allà el full sencer és una imatge i tornar-li el color deixaria
        el paper en blanc, que és justament el que es vol evitar de nit.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Moure’s pel llibre</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Ves a un punt</summary>
          <p>
        toca l’indicador de pàgina (o el percentatge als EPUB) per saltar-hi
        directament.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Índex i miniatures</summary>
          <p>
        el botó del plafó obre el que porti el llibre, i el seu text ho diu: l’índex,
        les miniatures de les pàgines o totes dues coses. En obrir-lo, el capítol pel
        qual vas apareix ressaltat i a la vista, sense buscar-lo. En pantalla ampla la
        barra lateral es queda oberta d’un llibre a l’altre fins que la tanquis tu.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Marcadors</summary>
          <p>
        el botó del marcador desa la posició actual per tornar-hi quan vulguis. Pots
        posar-li un nom i canviar-lo més tard. Als llibres del núvol, els marcadors se
        sincronitzen entre dispositius juntament amb la posició de lectura.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Torna després d’un salt</summary>
          <p>
        després de fer servir l’índex, la cerca o el selector de posició apareixen
        botons per tornar enrere o avançar de nou. Al mòbil queden integrats a banda i
        banda de l’indicador de pàgina o percentatge.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Cerca dins del llibre</summary>
          <p>
        la lupa troba paraules o frases, porta al punt exacte del resultat i el deixa
        ressaltat uns segons per localitzar-lo d’un cop d’ull.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Anotar i escoltar</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Ressaltats i notes</summary>
          <p>
        selecciona text del PDF o de l’EPUB i tria un color de ressaltat (groc, verd,
        blau o rosa) o afegeix-hi una nota. El color es pot canviar després en editar
        l’anotació. El botó del retolador mostra totes les anotacions del llibre. Als
        llibres del núvol se sincronitzen també quan treballes sense connexió.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Exporta les anotacions</summary>
          <p>
        el botó de baixada del plafó d’anotacions desa tots els ressaltats i notes del
        llibre en un fitxer Markdown (.md), amb la pàgina o la posició, a punt per als
        teus apunts o per a aplicacions com Obsidian.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Lectura en veu alta</summary>
          <p>
        el botó de l’altaveu llegeix el llibre amb la veu del navegador, començant a la
        pàgina actual. La frase que sona es va ressaltant per poder seguir-la amb la
        vista, i la pàgina avança sola quan la veu arriba al final del que es veu, així
        que també pots llegir mirant. Als EPUB, si una frase comença en una pàgina i
        acaba a la següent, la pàgina canvia a mitja frase, si fa no fa per on va la
        veu, per no deixar-te mirant un tros mentre sona la resta. El panell es retira en començar per no tapar el
        text: mentre sona, un control petit a baix permet fer pausa, continuar i
        aturar, i en pantalla ampla el mateix altaveu fa pausa i continua. En
        continuar, la frase que s’ha tallat es repeteix sencera. Els ajustos (veu i
        velocitat) es tornen a obrir des del menú «⋯». Passar de pàgina a mà atura la
        lectura. Als PDF escanejats sense text no funciona.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Imprimir i desar en PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Portar un EPUB al paper</summary>
          <p>
        el botó de la impressora (o «Imprimeix o desa en PDF» al menú «⋯») compon el llibre per a fulls de paper i obre el diàleg d’impressió del navegador, on pots triar la impressora o «Desa com a PDF». Es tria la mida del full (A4 o Carta), els marges i el cos de lletra; cada capítol comença en un full nou i el llibre conserva la seva maquetació i les seves il·lustracions. Els ajustos es recorden per a la propera vegada. Als PDF no hi surt: aquests s’imprimeixen baixant-los.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Imprimir només un capítol</summary>
          <p>
        la llista del diàleg porta tots els capítols marcats. Desmarca els que no vulguis —o prem «Cap» i tria’n només un— i el paper només portarà aquests. Un llibre sencer en A4 són molts fulls.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Subratllats i notes al paper</summary>
          <p>
        si el llibre té anotacions, una casella permet endur-se-les: els passatges surten amb el seu color i cada nota, amb la seva crida, es recull al final del seu capítol al costat del fragment que comenta. Desmarcada, s’imprimeix el text net.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Sobre els PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Text i enllaços del PDF</summary>
          <p>
        pots seleccionar i copiar text, i els enllaços del mateix PDF funcionen: els
        interns (índex, referències) salten a la seva pàgina i els externs s’obren en
        una altra pestanya.</p>
        </details>
        <details class="punto-ayuda">
          <summary>PDF protegits</summary>
          <p>
        si un PDF està xifrat, PageKeeper en demana la contrasenya per obrir-lo. La
        contrasenya no es desa.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-nube" class="panel-pestana" role="tabpanel"
      aria-label="Núvol" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Què és WebDAV?</h2>
        <p>És una manera estàndard d’accedir per internet als fitxers desats en
        un servidor, com si fos una carpeta remota. PageKeeper l’utilitza per
        llegir els teus llibres i per desar la posició de lectura al teu propi
        núvol, de manera que puguis continuar des d’un altre dispositiu.</p>
      </div>

      <div class="tarjeta importante">
        <h2>⚠️ Important: no serveix qualsevol núvol</h2>
        <p>El lector funciona dins del navegador i, per seguretat, el navegador
        només permet connectar amb un servidor si aquest servidor ho autoritza
        expressament (una regla tècnica anomenada <em>CORS</em>). Això deixa
        fora gairebé tots els serveis comercials:</p>
        <ul class="lista-ayuda">
          <li><strong>Google Drive, Dropbox, OneDrive:</strong> no serveixen; no
          ofereixen un WebDAV utilitzable d’aquesta manera.</li>
          <li><strong>Koofr, pCloud, Yandex i similars:</strong> tenen WebDAV,
          però bloquegen l’accés des de pàgines web, i no ho pots canviar perquè
          el servidor no és teu.</li>
          <li><strong>Nextcloud o ownCloud amb el permís activat:</strong>
          aquesta és, a la pràctica, l’única opció que funciona per
          sincronitzar.</li>
        </ul>
      </div>

      <details class="tarjeta tarjeta-plegable">
        <summary>No tinc servidor propi (el més habitual)</summary>
        <p>Gairebé ningú no té el seu propi servidor, i no passa res. Tens dos
        camins:</p>
        <ul class="lista-ayuda">
          <li><strong>Que algú et doni accés al seu Nextcloud</strong> (un
          familiar, el teu centre d’estudis, el teu equip de feina…). Demana-li
          tres dades: l’<em>URL de la teva carpeta WebDAV</em>, el teu
          <em>usuari</em> i una <em>contrasenya d’aplicació</em>. Amb això ja
          sincronitzes entre dispositius, sense muntar res tu.</li>
          <li><strong>Que ningú no et doni accés:</strong> afegeix els llibres
          amb el «+» d’«En aquest dispositiu». Es llegeixen igual de bé; només
          perds la sincronització automàtica entre aparells.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Tinc o administro un Nextcloud / ownCloud</summary>
        <p>Per permetre que PageKeeper s’hi connecti:</p>
        <ul class="lista-ayuda">
          <li>Instal·la l’aplicació <strong>WebAppPassword</strong> i afegeix el
          domini d’aquest lector (<code id="ayuda-dominio">aquest lloc</code>)
          als orígens permesos.</li>
          <li>Crea una <strong>contrasenya d’aplicació</strong> (Configuració →
          Seguretat). No facis servir la contrasenya principal.</li>
          <li>A <strong>⚙️ Configuració</strong> d’aquest lector, posa l’URL de
          la teva carpeta (per exemple
          <code>https://el-teu-nuvol.com/remote.php/dav/files/USUARI/Llibres</code>),
          el teu usuari i aquesta contrasenya.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Porta la configuració a un altre dispositiu</summary>
        <p>Un cop configurat el núvol, a <strong>⚙️ Configuració → «Copia
        l’enllaç de configuració»</strong> obtens un enllaç que ho porta tot
        (URL, usuari i contrasenya). Obre’l en un altre dispositiu i quedarà
        configurat a l’instant. Comparteix-lo només per canals privats i
        esborra’l després de fer-lo servir.</p>
      </details>

      <details class="tarjeta tarjeta-plegable destacado">
        <summary>🤖 Tens dubtes en configurar? Pregunta a una IA</summary>
        <p>Configurar un servidor té la seva feina, però una intel·ligència
        artificial (ChatGPT, Claude, Gemini…) t’hi guia pas a pas. Copia i
        enganxa preguntes com aquestes:</p>
        <ul class="lista-ayuda">
          <li>«Tinc un servidor Nextcloud. Com hi instal·lo l’aplicació
          <em>WebAppPassword</em> i permeto l’accés WebDAV des d’un web allotjat
          a <code id="ayuda-dominio-ia">aquest lloc</code>?»</li>
          <li>«Com creo una contrasenya d’aplicació al Nextcloud?»</li>
          <li>«El servei de núvol <em>[nom]</em> permet accés WebDAV des del
          navegador (CORS) per a un web extern?»</li>
        </ul>
      </details>
      </div>

    <div id="panel-ayuda-privacidad" class="panel-pestana" role="tabpanel"
      aria-label="Privadesa" tabindex="0" hidden>
<div class="tarjeta"><h2>Privadesa</h2><p>No hi ha cap servidor intermediari: el navegador es connecta directament al teu núvol. L’URL, l’usuari i la contrasenya es desen només en aquest navegador.</p></div>
    </div>
  `,
  en: `
    <div class="pestanas" data-grupo="ayuda" role="tablist"
      aria-label="Help sections">
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-empezar" data-panel="empezar"
        aria-selected="true">Getting started</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-biblioteca" data-panel="biblioteca"
        aria-selected="false" tabindex="-1">Library</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-lector" data-panel="lector"
        aria-selected="false" tabindex="-1">Reader</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-nube" data-panel="nube"
        aria-selected="false" tabindex="-1">Cloud</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-privacidad" data-panel="privacidad"
        aria-selected="false" tabindex="-1">Privacy</button>
    </div>

    <div id="panel-ayuda-empezar" class="panel-pestana" role="tabpanel"
      aria-label="Getting started" tabindex="0">
<div class="tarjeta"><h2>What does PageKeeper do?</h2><p>It reads PDF and EPUB books, including mathematical formulas, on a phone, tablet or computer and remembers your reading position.</p><ul class="lista-ayuda"><li><strong>Add a book from your device (“+” button):</strong> it works
        instantly, with no accounts and no settings. The book is stored in that
        browser’s library and it remembers where you left off. The one catch:
        everything is kept on that device only. You can also drag one or more
        PDFs or EPUBs onto the local section.</li><li><strong>Add a whole folder:</strong> the folder button with the arrow (and dragging a folder onto the section) copies every PDF and EPUB inside it, subfolders included, and rebuilds the same structure in your library. It works the same with the cloud, where the folders are created on the server.</li><li><strong>Connect cloud storage (WebDAV):</strong> your books and your
        reading position sync across all your devices. It needs some setting up
        first, explained further down.</li></ul></div>

<div class="tarjeta"><h2>Light, sepia, dark and black</h2><p>The theme button in the header opens a menu with five options: <strong>match the system</strong> (half-light, half-dark circle), <strong>light</strong> (sun), <strong>sepia</strong> (cup), <strong>dark</strong> (moon) and <strong>black</strong> (moon with a star). The button icon tells you which one you are on, and your choice is remembered in that browser. It starts on the system theme, so the app follows the rest of the device.</p><p class="ayuda">The theme is also the paper you read on: light is white paper, sepia the warm tone of e-ink readers, dark the page’s night mode and black that same night mode taken to pure black, which switches the pixel off on OLED screens and uses less battery.</p><p class="ayuda">With “match the system” you can decide where each side lands: sepia instead of light by day, or black instead of dark at night. You choose in <em>⚙️ Settings → Library</em>, with a sample of each so you can see them without changing the device theme.</p></div>
    </div>

    <div id="panel-ayuda-biblioteca" class="panel-pestana" role="tabpanel"
      aria-label="Library" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Your books at a glance</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Continue reading</summary>
          <p>
        your latest read sits at the top. On a wide screen the recent reads appear as
        cards with a large cover and the full title, all at once; on a narrow screen
        they unfold under “Show more”. You can drop the ones you no longer want; under
        <em>⚙️ Settings → Library</em> you choose how many to show and switch the whole
        box off, if you would rather go straight to your books. It only appears on the
        opening screen: entering a folder puts it away to make room for what is inside.
        A dismissed book comes back when you open it again. Finished books and files
        that no longer exist stay out of this list. The checkbox at the bottom of the box
        makes PageKeeper open straight into your latest read, skipping the library; it
        only applies to this device, so you can have it on for your phone and off for
        your computer. Each card’s “⋯” menu offers the
        same as the library (rename, move, upload or save, offline, delete…), so you
        never have to scroll down to find the book to act on it.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Sorting and states</summary>
          <p>
        you can sort by recent read, title, author or progress, filter books that are
        pending, in progress or finished, and mark any of them as finished. Tap the
        “Finished” tag itself to remove it; it also goes away on its own if you open
        the book again, without losing your progress. A book at 0 % counts as pending
        even if it has been opened.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Covers</summary>
          <p>
        are created automatically (the EPUB cover or the first PDF page) and show each
        book’s reading progress. The library search box filters by filename, title,
        author, format and other available metadata. On mobile, press and hold a
        truncated title to see it in full.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Book summary</summary>
          <p>
        if the file carries a synopsis in its metadata (the EPUB description or the PDF
        subject), it appears in a small box when you hover over the card, both in
        “Continue reading” and in either library, and also under the title in the “⋯”
        menu, which is how you read it on a touch screen.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Sample book</summary>
          <p>
        when the library is completely empty you can add and open a sample work in the
        interface language. After that it behaves like any other local book.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Folders</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Folders on this device</summary>
          <p>
        the “On this device” section can also be organised into folders with the
        folder-plus button. Tap a folder to open it (the path appears above the list so
        you can go back), rename or delete it from its “⋯” menu, and move a book with
        its “Move to another folder” option or by dragging it onto the folder. Folders
        move too: use “Move folder” or drag them onto another folder or onto a step of
        the path, and everything inside travels with them. Moving a book here changes
        nothing else: it keeps its page, bookmarks and annotations. New books land in
        whichever folder is open, and the search box still finds them wherever they
        are.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Folders in the cloud</summary>
          <p>
        the “In the cloud” section shows the subfolders of your folder and lets you
        enter them (the path appears above the list so you can go back). You can create
        new folders, rename them or delete them from their “⋯” menu (deleting one
        removes its contents too) and move a book from one folder to another with its
        move button or by dragging it onto a folder in the list (or onto a step of the
        path), keeping progress and bookmarks. Folders move too: use “Move folder” or
        drag them onto another folder or onto a step of the path, and everything inside
        travels with them. Neither moving nor renaming costs anything to what they
        hold: the books inside keep their page, bookmarks, annotations and note, and so
        do the subfolders.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Download a whole folder</summary>
          <p>
        each folder’s “⋯” menu saves it complete, with its subfolders and every book
        inside. On desktop Chrome, Edge and Opera you choose where to put it and it is
        copied as is; on other browsers (Firefox, Safari, mobile) it is downloaded as a
        single ZIP file.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Going back</summary>
          <p>
        the browser’s back button (or gesture) moves up one folder instead of leaving
        PageKeeper: from a subfolder it goes to the previous one, and from the root it
        does leave. It also closes the reader, the help or the settings.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Move, save and delete</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Upload to the cloud</summary>
          <p>
        with a cloud set up, each local book’s cloud button copies it to your remote
        folder keeping the page you are on; you can also upload a file with the “+” or
        drag it onto the “In the cloud” section, and you can drag a book from “On this
        device” onto the cloud or onto one of its folders. Everything is uploaded to
        whichever folder is open.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Moving books between libraries</summary>
          <p>
        a cloud book can be stored on the device with “Save to this device” or by
        dragging it onto the local section (or one of its folders); and a device book
        goes up with its own button or by dragging it onto “In the cloud”. Either way
        it is a copy: the original stays put and each library keeps its own reading
        position.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Available offline</summary>
          <p>
        the cloud-with-arrow button saves a managed copy of the remote book. If the
        network fails, PageKeeper shows it and opens it automatically. The green button
        removes just that copy without deleting the book from the cloud.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Download</summary>
          <p>
        the download button saves a copy of the file (PDF or EPUB) to the device,
        whether it comes from the cloud or from the local library.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Delete</summary>
          <p>
        each book’s bin removes it (from the server if it is a cloud book, or from this
        device if it is local).</p>
        </details>
        <details class="punto-ayuda">
            <summary>Reading statistics</summary>
            <p>The chart button in the header opens the time you spend reading:
          the total, today’s and this week’s, how many days in a row you have
          kept it up, a bar chart, and the books
          that take the most of your time —books under five minutes stay out of that list, so it is not filled by the ones you only opened to see what they were; their time still counts in the totals and in the book’s own card—. That list can be sorted by time spent, by last read or by title, and each book opens its own card. The chart groups by <strong>days, weeks,
          months or years</strong>, and below it compares the current stretch with the
          previous one: how much you have read this month against last month, or this
          year against last year. The striped bar is the stretch still under way. The
          day-by-day detail goes back about thirteen months; each month’s total is kept
          for good, so months and years can be compared however old they are. Only time with the book in front of you
          is counted: while the app is out of sight —another tab, another app, a locked
          phone— the clock stops, so leaving it open adds nothing. Each page counts for
          at most five minutes; stay longer on the same one and the footer bar says
          “Paused”, with the clock running again as soon as you turn the page.</p>
            <p>If you would rather nothing was measured, there is a tick box —“Do not
          measure reading time”— in <em>⚙️ Settings → Data</em> and at the foot of the
          statistics screen itself. Ticking it warns you that whatever has been recorded
          until then will be deleted. You can turn it back on whenever you like:
          counting then starts from zero. The decision travels with the rest of your data: if you use the cloud, your other devices stop measuring as soon as they sync.</p>
            <p>With cloud storage set up, the figures add up all your devices:
          each book’s time carries the split underneath (“this device 2 h ·
          Chrome on Linux 45 min”), so you know how long it took you even if you
          read it in bits on each device, and a day you read on two of them
          counts as a single day of the streak. All of it travels with your
          reading position, in your own server, and is never sent anywhere else.
          You can delete it whenever you like from that same screen — it is
          deleted on every device — without touching your books or your
          progress.</p>
            <p>For a single book it is closer at hand: while you read, the
          bottom bar starts with the time you have spent on it, and tapping that
          opens its card, with how much you have read, the pages, the pace, what
          is left and the split across devices. The same card is in the book’s
          «⋯» menu in the library.</p>
          </details>
          <details class="punto-ayuda">
          <summary>Import and export</summary>
          <p>
        the folder-with-arrow button in the header opens a screen where you can add
        books and download or restore ZIP backups. There is one backup for the books
        under “On this device” and another for the whole WebDAV library, subfolders
        included. Both keep progress, bookmarks and annotations; neither contains your
        password. To save the URL, username and app password separately, use
        <em>Settings → Move configuration to another device</em>.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-lector" class="panel-pestana" role="tabpanel"
      aria-label="Reader" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Viewing the page</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Reading mode</summary>
          <p>
        page by page (like a book) or continuous pages with vertical scrolling.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Turning pages</summary>
          <p>
        drag sideways and the page follows your finger, showing where you are heading;
        change your mind halfway and it slides back. Tapping the left and right margins,
        or using the arrow keys and the space bar, makes the page do that same run on
        its own, so you also see it on a computer. In PDFs the neighbouring page really
        does peek in. Top and bottom work too: tapping the lower part or swiping up
        goes forward, and the upper part or swiping down goes back. With continuous
        pages, or while zoomed, scrolling takes over and there is no animation.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Text columns</summary>
          <p>
        the columns button opens a menu: automatic, or one to four. On automatic, as many fit as can without the lines becoming awkward to read, and they are redone by themselves when you turn the device or change the text size. Your choice belongs to that book and to this device. PDFs arrive already typeset, so they only offer one page or two side by side. When they appear on automatic is up to you in <em>⚙️ Settings → Reader</em>, by saying how long you want the lines.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Rotate the page (PDF only)</summary>
          <p>
        the rotate button turns the document 90° each time, handy for crooked or
        landscape scans. The rotation is remembered per book on this device.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Full screen</summary>
          <p>
        a tap in the middle of the page hides the top bar so you can read without
        distractions; another tap brings it back.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Fit and zoom</summary>
          <p>
        the three zoom controls sit together: the two magnifiers, which enlarge and
        reduce, and the zoom level as a percentage in between. Tapping that number
        opens a panel with “Fit to width”, “Fit full page”, the most used zoom levels
        and a box where you can type any other (205 %, if that is what suits you). In
        PDFs the percentage is the page’s —100 % is its natural size, so fitting it to
        the width can give any figure— and in EPUBs it is the text’s. While zoomed you
        can drag the page with the mouse or your finger, and on touch screens you can
        pinch to zoom: in PDFs it changes the zoom, in EPUBs the text size.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Time left</summary>
          <p>
        after a few minutes of reading, an estimate of the time left to finish the book
        appears, worked out from your actual pace on this device.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Text and colour</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Text settings (EPUB only)</summary>
          <p>
        the font button lets you choose the typeface (the book’s own, serif or sans
        serif), the alignment, the line spacing, the margin on both sides and whether
        words break at the end of a line. The same settings live in <em>⚙️ Settings →
        Reader</em>, so you can see and change them without opening a book; both places
        always show the same. Breaking is on by default: on a narrow screen, and more
        so with justified text, it is what avoids the wide gaps between words. The
        browser does it from the book’s language, so it may not be available for every
        language; you can also leave it as each book has it, or never break.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Book paper</summary>
          <p>
        the paper is the app theme: there are no two settings to keep in step. The
        theme button, in the library header, opens a menu with five options —the system
        one, light, sepia (warm, easier on the eyes for long sessions), dark and black
        (pure black, for OLED screens)— and
        changes the book page and everything else at once. In EPUBs the text
        colours change, so illustrations look untouched; in PDFs, which are already
        drawn images, the whole page is tinted.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Images with the dark themes (PDF only)</summary>
          <p>
        when the page is inverted, photos and logos end up as negatives. The image
        button, which appears in the reader bar when you read a PDF with the dark or
        black theme, gives them their colour back. It is remembered from one book to the next.
        Scanned pages are left alone: there the whole sheet is an image and restoring
        its colour would leave the paper white, which is exactly what you are avoiding
        at night.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Getting around the book</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Go to a point</summary>
          <p>
        tap the page indicator (or the percentage in EPUBs) to jump straight there.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Contents and thumbnails</summary>
          <p>
        the panel button opens whatever the book carries, and its label says which: the
        table of contents, the page thumbnails or both. When it opens, the chapter you
        are on is highlighted and in view, without looking for it. On a wide screen the
        sidebar stays open from one book to the next until you close it.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Bookmarks</summary>
          <p>
        the bookmark button saves the current position so you can come back to it
        whenever you like. You can give it a name and change it later. In cloud books,
        bookmarks sync across devices along with the reading position.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Return after a jump</summary>
          <p>
        after using the contents, the search or the position picker, buttons appear to
        go back or forward again. On mobile they sit on either side of the page or
        percentage indicator.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Search inside the book</summary>
          <p>
        the magnifier finds words or phrases, takes you to the exact spot and leaves it
        highlighted for a few seconds so you can spot it at a glance.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Annotating and listening</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Highlights and notes</summary>
          <p>
        select text in a PDF or EPUB and pick a highlight colour (yellow, green, blue
        or pink) or add a note. The colour can be changed later when you edit the
        annotation. The marker button shows every annotation in the book. In cloud
        books they sync even when you work offline.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Export annotations</summary>
          <p>
        the download button in the annotations panel saves every highlight and note in
        the book to a Markdown file (.md), with its page or position, ready for your
        notes or for apps like Obsidian.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Read aloud</summary>
          <p>
        the speaker button reads the book with the browser’s voice, starting on the
        current page. The sentence being read is highlighted so you can follow it with
        your eyes, and the page turns by itself once the voice reaches the end of what
        is on screen, so you can read along too. In EPUBs, when a sentence starts on one
        page and ends on the next, the page turns mid-sentence, roughly where the voice
        is, so you are not left staring at a fragment while the rest plays. The panel steps aside when reading
        starts so it does not cover the text: while it plays, a small control at the
        bottom pauses, resumes and stops, and on a wide screen the speaker button
        itself pauses and resumes. When you resume, the interrupted sentence is read
        again from the start. The settings (voice and speed) reopen from the “⋯” menu.
        Turning a page by hand stops the reading. It does not work on scanned PDFs
        without text.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Printing and saving as PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Taking an EPUB to paper</summary>
          <p>
        the printer button (or “Print or save as PDF” in the “⋯” menu) lays the book out for sheets of paper and opens your browser’s print dialog, where you can pick a printer or “Save as PDF”. You choose the paper size (A4 or Letter), the margins and the text size; each chapter starts on a new sheet, and the book keeps its own layout and illustrations. The settings are remembered for next time. It does not show up for PDFs: those you print by downloading them.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Printing a single chapter</summary>
          <p>
        every chapter starts ticked in the dialog’s list. Untick the ones you don’t want —or press “None” and pick just one— and only those reach the paper. A whole book in A4 is a lot of sheets.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Highlights and notes on paper</summary>
          <p>
        if the book has annotations, a checkbox brings them along: passages come out in their colour, and each note, with its marker, is collected at the end of its chapter next to the passage it comments on. Unticked, the text prints clean.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>About PDFs</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>PDF text and links</summary>
          <p>
        you can select and copy text, and the PDF’s own links work: internal ones
        (contents, references) jump to their page and external ones open in another
        tab.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Protected PDFs</summary>
          <p>
        if a PDF is encrypted, PageKeeper asks for its password to open it. The
        password is not stored.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-nube" class="panel-pestana" role="tabpanel"
      aria-label="Cloud" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>What is WebDAV?</h2>
        <p>It is a standard way of reaching files stored on a server over the
        internet, as if it were a remote folder. PageKeeper uses it to read your
        books and to save your reading position in your own cloud, so you can
        carry on from another device.</p>
      </div>

      <div class="tarjeta importante">
        <h2>⚠️ Important: not every cloud works</h2>
        <p>The reader runs inside the browser and, for safety, the browser only
        allows a connection to a server if that server expressly permits it (a
        technical rule called <em>CORS</em>). That rules out almost every
        commercial service:</p>
        <ul class="lista-ayuda">
          <li><strong>Google Drive, Dropbox, OneDrive:</strong> no good; they do
          not offer a WebDAV that can be used this way.</li>
          <li><strong>Koofr, pCloud, Yandex and the like:</strong> they do have
          WebDAV, but they block access from web pages, and you cannot change
          that because the server is not yours.</li>
          <li><strong>Nextcloud or ownCloud with the permission enabled:</strong>
          in practice, this is the only option that works for syncing.</li>
        </ul>
      </div>

      <details class="tarjeta tarjeta-plegable">
        <summary>I do not have my own server (the usual case)</summary>
        <p>Hardly anyone has their own server, and that is fine. You have two
        options:</p>
        <ul class="lista-ayuda">
          <li><strong>Someone gives you access to their Nextcloud</strong> (a
          relative, your school, your team at work…). Ask them for three things:
          the <em>URL of your WebDAV folder</em>, your <em>username</em> and an
          <em>app password</em>. With those you already sync across devices,
          without setting anything up yourself.</li>
          <li><strong>Nobody gives you access:</strong> add your books with the
          “+” under “On this device”. Reading works just as well; you only lose
          automatic syncing between devices.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>I have or administer Nextcloud / ownCloud</summary>
        <p>To let PageKeeper connect:</p>
        <ul class="lista-ayuda">
          <li>Install the <strong>WebAppPassword</strong> app and add this
          reader’s domain (<code id="ayuda-dominio">this site</code>) to the
          allowed origins.</li>
          <li>Create an <strong>app password</strong> (Settings → Security). Do
          not use your main password.</li>
          <li>In this reader’s <strong>⚙️ Settings</strong>, enter your folder
          URL (for example
          <code>https://your-cloud.com/remote.php/dav/files/USER/Books</code>),
          your username and that password.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Move configuration to another device</summary>
        <p>Once your cloud is set up, <strong>⚙️ Settings → “Copy configuration
        link”</strong> gives you a link that carries everything (URL, username
        and password). Open it on another device and it will be configured at
        once. Share it only through private channels and delete it after
        use.</p>
      </details>

      <details class="tarjeta tarjeta-plegable destacado">
        <summary>🤖 Stuck setting it up? Ask an AI</summary>
        <p>Setting up a server takes some doing, but an artificial intelligence
        (ChatGPT, Claude, Gemini…) will walk you through it. Copy and paste
        questions like these:</p>
        <ul class="lista-ayuda">
          <li>“I have a Nextcloud server. How do I install the
          <em>WebAppPassword</em> app and allow WebDAV access from a site hosted
          at <code id="ayuda-dominio-ia">this site</code>?”</li>
          <li>“How do I create an app password in Nextcloud?”</li>
          <li>“Does the cloud service <em>[name]</em> allow WebDAV access from
          the browser (CORS) for an external website?”</li>
        </ul>
      </details>
      </div>

    <div id="panel-ayuda-privacidad" class="panel-pestana" role="tabpanel"
      aria-label="Privacy" tabindex="0" hidden>
<div class="tarjeta"><h2>Privacy</h2><p>There is no intermediary server: your browser connects directly to your cloud. The URL, username and password are stored only in this browser.</p></div>
    </div>
  `,

  fr: `
    <div class="pestanas" data-grupo="ayuda" role="tablist"
      aria-label="Sections de l’aide">
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-empezar" data-panel="empezar"
        aria-selected="true">Premiers pas</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-biblioteca" data-panel="biblioteca"
        aria-selected="false" tabindex="-1">Bibliothèque</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-lector" data-panel="lector"
        aria-selected="false" tabindex="-1">Lecteur</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-nube" data-panel="nube"
        aria-selected="false" tabindex="-1">Nuage</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-privacidad" data-panel="privacidad"
        aria-selected="false" tabindex="-1">Confidentialité</button>
    </div>

    <div id="panel-ayuda-empezar" class="panel-pestana" role="tabpanel"
      aria-label="Premiers pas" tabindex="0">
<div class="tarjeta"><h2>Que fait PageKeeper ?</h2><p>Il lit les livres PDF et EPUB, formules mathématiques comprises, sur un téléphone, une tablette ou un ordinateur, et se souvient de votre position de lecture.</p><ul class="lista-ayuda"><li><strong>Ajouter un livre depuis votre appareil (bouton « + ») :</strong> ça
        fonctionne aussitôt, sans compte ni réglage. Le livre est conservé dans la
        bibliothèque de ce navigateur et l’application se souvient d’où vous en étiez
        resté. Le seul hic : tout reste uniquement sur cet appareil. Vous pouvez aussi
        déposer un ou plusieurs PDF ou EPUB sur la section locale.</li><li><strong>Ajouter un dossier entier :</strong> le bouton de dossier avec la flèche (et déposer un dossier sur la section) copie tous les PDF et EPUB qu’il contient, sous-dossiers compris, et reconstruit la même arborescence dans votre bibliothèque. Cela fonctionne de la même façon avec le nuage, où les dossiers sont créés sur le serveur.</li><li><strong>Connecter un nuage (WebDAV) :</strong> vos livres et votre
        position de lecture se synchronisent sur tous vos appareils. Cela demande
        d’abord un peu de configuration, expliquée plus bas.</li></ul></div>

<div class="tarjeta"><h2>Clair, sépia, sombre et noir</h2><p>Le bouton de thème dans l’en-tête ouvre un menu à cinq options : <strong>celui du système</strong> (cercle mi-clair mi-sombre), <strong>clair</strong> (soleil), <strong>sépia</strong> (tasse), <strong>sombre</strong> (lune) et <strong>noir</strong> (lune avec une étoile). L’icône du bouton indique lequel est actif, et votre choix est mémorisé dans ce navigateur. Il démarre sur le thème du système, pour que l’application suive le reste de l’appareil.</p><p class="ayuda">Le thème, c’est aussi le papier sur lequel vous lisez : le clair est un papier blanc, le sépia le ton chaud des liseuses à encre électronique, le sombre le mode nuit de la page et le noir ce même mode nuit poussé au noir pur, qui éteint le pixel sur les écrans OLED et consomme moins.</p><p class="ayuda">Avec « celui du système », vous pouvez décider où mène chaque côté : le sépia plutôt que le clair le jour, ou le noir plutôt que le sombre la nuit. Cela se choisit dans <em>⚙️ Réglages → Bibliothèque</em>, avec un aperçu de chacun pour les voir sans changer le thème de l’appareil.</p></div>
    </div>

    <div id="panel-ayuda-biblioteca" class="panel-pestana" role="tabpanel"
      aria-label="Bibliothèque" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Vos livres en un coup d’œil</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Continuer la lecture</summary>
          <p>
        votre dernière lecture se trouve en haut. Sur un grand écran, les lectures récentes
        apparaissent toutes ensemble sous forme de cartes avec une grande couverture et le
        titre complet ; sur un écran étroit, elles se déplient sous « Voir plus ». Vous
        pouvez retirer celles dont vous ne voulez plus ; dans
        <em>⚙️ Réglages → Bibliothèque</em>, vous choisissez combien en afficher et pouvez
        désactiver complètement l’encadré, si vous préférez aller droit à vos livres. Il
        n’apparaît que sur l’écran d’accueil : entrer dans un dossier le range pour faire
        de la place à son contenu. Un livre retiré revient dès que vous le rouvrez. Les
        livres terminés et les fichiers qui n’existent plus restent hors de cette liste. La
        case en bas de l’encadré fait que PageKeeper s’ouvre directement sur votre
        dernière lecture, sans passer par la bibliothèque ; elle ne vaut que pour cet
        appareil, vous pouvez donc l’activer sur le téléphone et pas sur l’ordinateur.
        Le menu « ⋯ » de chaque carte propose les mêmes actions que la bibliothèque
        (renommer, déplacer, envoyer ou enregistrer, hors ligne, supprimer…), pour ne
        jamais avoir à faire défiler la page à la recherche du livre sur lequel agir.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Tri et états</summary>
          <p>
        vous pouvez trier par lecture récente, titre, auteur ou progression, filtrer les
        livres en attente, en cours ou terminés, et marquer n’importe lequel comme
        terminé. Touchez l’étiquette « Terminé » elle-même pour la retirer ; elle
        disparaît aussi toute seule si vous rouvrez le livre, sans perdre votre
        progression. Un livre à 0 % compte comme en attente même s’il a déjà été ouvert.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Couvertures</summary>
          <p>
        elles sont créées automatiquement (la couverture de l’EPUB ou la première page du
        PDF) et montrent la progression de lecture de chaque livre. Le champ de recherche
        de la bibliothèque filtre par nom de fichier, titre, auteur, format et autres
        métadonnées disponibles. Sur mobile, un appui long sur un titre tronqué l’affiche
        en entier.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Résumé du livre</summary>
          <p>
        si le fichier contient un résumé dans ses métadonnées (la description de l’EPUB ou
        le sujet du PDF), il apparaît dans un petit encadré au survol de la carte, aussi
        bien dans « Continuer la lecture » que dans les deux bibliothèques, et aussi sous
        le titre dans le menu « ⋯ », ce qui permet de le lire sur un écran tactile.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Livre d’exemple</summary>
          <p>
        quand la bibliothèque est complètement vide, vous pouvez ajouter et ouvrir un
        livre d’exemple dans la langue de l’interface. Ensuite, il se comporte comme
        n’importe quel autre livre local.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Dossiers</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Dossiers sur cet appareil</summary>
          <p>
        la section « Sur cet appareil » peut elle aussi être organisée en dossiers avec le
        bouton de dossier plus. Touchez un dossier pour l’ouvrir (le chemin apparaît
        au-dessus de la liste pour pouvoir revenir en arrière), renommez-le ou
        supprimez-le depuis son menu « ⋯ », et déplacez un livre avec son option
        « Déplacer vers un autre dossier » ou en le faisant glisser sur le dossier. Les
        dossiers se déplacent aussi : utilisez « Déplacer le dossier » ou faites-les
        glisser sur un autre dossier ou sur une étape du chemin, et tout leur contenu
        voyage avec eux. Déplacer un livre ici ne change rien d’autre : il garde sa page,
        ses signets et ses annotations. Les nouveaux livres arrivent dans le dossier
        ouvert, et le champ de recherche les trouve toujours où qu’ils soient.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Dossiers dans le nuage</summary>
          <p>
        la section « Dans le nuage » montre les sous-dossiers de votre dossier et permet
        d’y entrer (le chemin apparaît au-dessus de la liste pour pouvoir revenir en
        arrière). Vous pouvez créer de nouveaux dossiers, les renommer ou les supprimer
        depuis leur menu « ⋯ » (en supprimer un retire aussi son contenu) et déplacer un
        livre d’un dossier à un autre avec son bouton de déplacement ou en le faisant
        glisser sur un dossier de la liste (ou sur une étape du chemin), en conservant la
        progression et les signets. Les dossiers se déplacent aussi : utilisez « Déplacer
        le dossier » ou faites-les glisser sur un autre dossier ou sur une étape du
        chemin, et tout leur contenu voyage avec eux. Ni le déplacement ni le
        renommage ne coûtent rien à ce qu’ils contiennent : les livres à l’intérieur
        gardent leur page, leurs signets, leurs annotations et leur note, tout comme les
        sous-dossiers.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Télécharger un dossier entier</summary>
          <p>
        le menu « ⋯ » de chaque dossier l’enregistre en entier, avec ses sous-dossiers et
        tous les livres qu’il contient. Sur Chrome, Edge et Opera pour ordinateur, vous
        choisissez où le placer et il est copié tel quel ; sur les autres navigateurs
        (Firefox, Safari, mobile), il est téléchargé sous forme d’un unique fichier
        ZIP.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Revenir en arrière</summary>
          <p>
        le bouton (ou le geste) de retour du navigateur remonte d’un dossier au lieu de
        quitter PageKeeper : depuis un sous-dossier, il va au précédent, et depuis la
        racine, il quitte bel et bien l’application. Il ferme aussi le lecteur, l’aide ou
        les réglages.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Déplacer, enregistrer et supprimer</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Envoyer dans le nuage</summary>
          <p>
        une fois un nuage configuré, le bouton nuage de chaque livre local le copie dans
        votre dossier distant en gardant la page où vous en étiez ; vous pouvez aussi
        envoyer un fichier avec le « + » ou le déposer sur la section « Dans le nuage »,
        et vous pouvez faire glisser un livre depuis « Sur cet appareil » vers le nuage ou
        vers un de ses dossiers. Tout est envoyé dans le dossier actuellement ouvert.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Déplacer des livres entre bibliothèques</summary>
          <p>
        un livre du nuage peut être stocké sur l’appareil avec « Enregistrer sur cet
        appareil » ou en le faisant glisser sur la section locale (ou l’un de ses
        dossiers) ; et un livre de l’appareil monte dans le nuage avec son propre bouton
        ou en le faisant glisser sur « Dans le nuage ». Dans les deux cas, il s’agit d’une
        copie : l’original reste en place et chaque bibliothèque garde sa propre position
        de lecture.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Disponible hors ligne</summary>
          <p>
        le bouton nuage avec flèche enregistre une copie gérée du livre distant. Si le
        réseau tombe en panne, PageKeeper l’affiche et l’ouvre automatiquement. Le bouton
        vert retire uniquement cette copie sans supprimer le livre du nuage.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Télécharger</summary>
          <p>
        le bouton de téléchargement enregistre une copie du fichier (PDF ou EPUB) sur
        l’appareil, qu’il vienne du nuage ou de la bibliothèque locale.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Supprimer</summary>
          <p>
        la corbeille de chaque livre le supprime (du serveur s’il s’agit d’un livre du
        nuage, ou de cet appareil s’il est local).</p>
        </details>
        <details class="punto-ayuda">
            <summary>Statistiques de lecture</summary>
            <p>Le bouton graphique dans l’en-tête ouvre le temps que vous passez à lire :
          le total, celui d’aujourd’hui et de cette semaine, combien de jours d’affilée
          vous avez tenu, un graphique à barres, et les livres
          qui prennent le plus de votre temps —ceux de moins de cinq minutes ne figurent
          pas dans cette liste, pour qu’elle ne soit pas remplie par ceux que vous avez
          seulement ouverts pour voir ce que c’était ; leur temps compte toujours dans
          les totaux et dans la fiche du livre—. Cette liste peut être triée par temps passé, par dernière lecture ou par titre, et chaque livre ouvre sa fiche. Le graphique se groupe par <strong>jours,
          semaines, mois ou années</strong>, et en dessous il compare la période en cours
          avec la précédente : ce que vous avez lu ce mois-ci face au mois dernier, ou
          cette année face à l’an dernier. La barre hachurée est celle de la période
          encore en cours. Le détail par jour remonte à environ treize mois ; le total de
          chaque mois est conservé pour toujours, de sorte que les mois et les années
          restent comparables même anciens. Seul le temps passé avec le livre devant
          vous est compté : tant que l’application n’est pas visible —un autre onglet, une
          autre application, le téléphone verrouillé— l’horloge s’arrête, donc la laisser
          ouverte n’ajoute rien. Chaque page compte au maximum cinq minutes ; si vous
          restez plus longtemps sur la même, la barre du bas affiche « En pause », et
          l’horloge repart dès que vous tournez la page.</p>
            <p>Si vous préférez que rien ne soit mesuré, une case —« Ne pas mesurer le
          temps de lecture »— se trouve dans <em>⚙️ Réglages → Données</em> et au bas de
          l’écran des statistiques. En la cochant, un avertissement précise que tout ce
          qui a été enregistré jusque-là sera supprimé. Vous pouvez la réactiver quand
          vous voulez : le comptage repart alors de zéro. La décision voyage avec le reste de vos données : si vous utilisez le nuage, vos autres appareils cessent de mesurer dès la synchronisation.</p>
            <p>Avec un nuage configuré, les chiffres additionnent tous vos appareils :
          le temps de chaque livre porte la répartition en dessous (« cet appareil 2 h ·
          Chrome sur Linux 45 min »), pour savoir combien de temps il vous a pris même en
          le lisant par bouts sur chaque appareil, et un jour où vous avez lu sur deux
          d’entre eux ne compte que pour un seul jour de la série. Tout cela voyage avec
          votre position de lecture, sur votre propre serveur, et n’est jamais envoyé
          ailleurs. Vous pouvez le supprimer quand vous voulez depuis ce même écran — il
          est supprimé sur tous les appareils — sans toucher à vos livres ni à votre
          progression.</p>
            <p>Pour un seul livre, c’est encore plus à portée de main : pendant la
          lecture, la barre du bas commence par le temps que vous y avez passé, et la
          toucher ouvre sa fiche, avec ce que vous avez lu, les pages, le rythme, ce
          qu’il reste et la répartition entre appareils. La même fiche se trouve dans le
          menu « ⋯ » du livre, dans la bibliothèque.</p>
          </details>
          <details class="punto-ayuda">
          <summary>Importer et exporter</summary>
          <p>
        le bouton de dossier avec flèche dans l’en-tête ouvre un écran où vous pouvez
        ajouter des livres et télécharger ou restaurer des copies ZIP. Il y a une copie
        pour les livres « Sur cet appareil » et une autre pour toute la bibliothèque
        WebDAV, sous-dossiers compris. Les deux conservent la progression, les signets et
        les annotations ; aucune ne contient votre mot de passe. Pour enregistrer l’URL,
        l’utilisateur et le mot de passe d’application séparément, utilisez
        <em>Réglages → Transférer la configuration vers un autre appareil</em>.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-lector" class="panel-pestana" role="tabpanel"
      aria-label="Lecteur" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Afficher la page</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Mode de lecture</summary>
          <p>
        page par page (comme un livre) ou pages continues avec défilement vertical.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Tourner les pages</summary>
          <p>
        faites glisser latéralement et la page suit votre doigt, montrant vers où elle se
        dirige ; changez d’avis à mi-chemin et elle revient en glissant. Toucher les
        marges gauche et droite, ou utiliser les flèches et la barre d’espace, fait faire
        à la page ce même mouvement toute seule, pour le voir aussi sur un ordinateur.
        Dans les PDF, la page voisine apparaît vraiment en partie. Le haut et le bas
        marchent aussi : toucher la partie basse ou faire glisser le doigt vers le
        haut avance, et la partie haute ou le doigt vers le bas recule. Avec les pages
        continues, ou en zoomant, c’est le défilement qui prend le relais et il n’y a
        pas d’animation.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Colonnes de texte</summary>
          <p>
        le bouton des colonnes ouvre un menu : automatiques, ou de une à quatre. En automatique, il en tient autant que possible sans que les lignes deviennent pénibles à lire, et elles se refont d’elles-mêmes quand on tourne l’appareil ou qu’on change la taille du texte. Votre choix appartient à ce livre et à cet appareil. Les PDF arrivent déjà mis en page : ils n’offrent qu’une page ou deux côte à côte. Quand elles apparaissent en automatique se règle dans <em>⚙️ Réglages → Lecteur</em>, en indiquant la longueur de ligne voulue.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Faire pivoter la page (PDF uniquement)</summary>
          <p>
        le bouton de rotation tourne le document de 90° à chaque pression, pratique pour
        les scans de travers ou au format paysage. La rotation est mémorisée par livre sur
        cet appareil.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Plein écran</summary>
          <p>
        un toucher au centre de la page masque la barre du haut pour lire sans
        distraction ; un autre toucher la fait réapparaître.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ajuster et zoomer</summary>
          <p>
        les trois contrôles de zoom sont regroupés : les deux loupes, qui agrandissent et
        réduisent, et le niveau de zoom en pourcentage entre les deux. Toucher ce nombre
        ouvre un panneau avec « Ajuster à la largeur », « Ajuster la page entière », les
        niveaux de zoom les plus utilisés et une case où saisir n’importe quel autre
        (205 %, si c’est ce qui vous convient). Dans les PDF, le pourcentage est celui de
        la page — 100 % est sa taille naturelle, donc l’ajuster à la largeur peut donner
        n’importe quel chiffre — et dans les EPUB, celui du texte. En zoomant, vous
        pouvez faire glisser la page avec la souris ou le doigt, et sur les écrans
        tactiles, pincer pour zoomer : dans les PDF cela change le zoom, dans les EPUB la
        taille du texte.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Temps restant</summary>
          <p>
        après quelques minutes de lecture, une estimation du temps restant pour finir le
        livre apparaît, calculée à partir de votre rythme réel sur cet appareil.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Texte et couleur</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Réglages du texte (EPUB uniquement)</summary>
          <p>
        le bouton de la lettre permet de choisir la police (celle du livre, avec ou sans
        empattements), l’alignement, l’interligne, la marge des deux côtés et si les mots
        se coupent en fin de ligne. Les mêmes réglages se trouvent dans <em>⚙️ Réglages →
        Lecteur</em>, pour les voir et les changer sans ouvrir de livre ; les deux
        endroits affichent toujours la même chose. La coupure des mots est activée par
        défaut : sur un écran étroit, et encore plus avec un texte justifié, c’est ce qui
        évite les grands espaces entre les mots. Le navigateur s’en charge selon la
        langue du livre, donc elle peut ne pas être disponible pour toutes les langues ;
        vous pouvez aussi la laisser comme dans chaque livre, ou ne jamais couper.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Papier du livre</summary>
          <p>
        le papier, c’est le thème de l’application : il n’y a pas deux réglages à
        synchroniser. Le bouton de thème, dans l’en-tête de la bibliothèque, parcourt
        un menu à cinq options — celui du système, clair, sépia (chaud, plus reposant pour
        les longues séances), sombre et noir (noir pur, pour les écrans OLED) — et
        change à la fois la page du livre et tout le
        reste. Dans les EPUB, les couleurs du texte changent, pour que les illustrations
        restent intactes ; dans les PDF, qui sont déjà des images composées, c’est toute
        la page qui est teintée.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Images avec les thèmes sombres (PDF uniquement)</summary>
          <p>
        quand la page est inversée, les photos et les logos se retrouvent en négatif. Le
        bouton image, qui apparaît dans la barre du lecteur en lisant un PDF avec le
        thème sombre ou le noir, leur rend leur couleur. Ce choix est mémorisé d’un livre à l’autre.
        Les pages numérisées ne sont pas concernées : là, toute la feuille est une image,
        et lui rendre sa couleur laisserait le papier blanc, ce qu’on cherche justement à
        éviter la nuit.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Se repérer dans le livre</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Aller à un endroit précis</summary>
          <p>
        touchez l’indicateur de page (ou le pourcentage dans les EPUB) pour y sauter
        directement.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Sommaire et miniatures</summary>
          <p>
        le bouton de panneau ouvre ce que le livre contient, et son libellé indique quoi :
        le sommaire, les miniatures des pages, ou les deux. À l’ouverture, le chapitre où
        vous êtes est mis en évidence et visible, sans avoir à le chercher. Sur un grand
        écran, le panneau latéral reste ouvert d’un livre à l’autre jusqu’à ce que vous le
        fermiez.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Signets</summary>
          <p>
        le bouton de signet enregistre la position actuelle pour pouvoir y revenir
        quand vous voulez. Vous pouvez lui donner un nom et le modifier plus tard. Dans
        les livres du nuage, les signets se synchronisent entre appareils avec la
        position de lecture.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Revenir après un saut</summary>
          <p>
        après avoir utilisé le sommaire, la recherche ou le sélecteur de position, des
        boutons apparaissent pour revenir en arrière ou avancer à nouveau. Sur mobile,
        ils se trouvent de chaque côté de l’indicateur de page ou de pourcentage.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Rechercher dans le livre</summary>
          <p>
        la loupe trouve des mots ou des phrases, vous emmène exactement à l’endroit voulu
        et le laisse surligné quelques secondes pour le repérer d’un coup d’œil.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Annoter et écouter</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Surlignages et notes</summary>
          <p>
        sélectionnez du texte dans un PDF ou un EPUB et choisissez une couleur de
        surlignage (jaune, vert, bleu ou rose), ou ajoutez une note. La couleur peut être
        changée plus tard en modifiant l’annotation. Le bouton marqueur affiche toutes
        les annotations du livre. Dans les livres du nuage, elles se synchronisent même
        en travaillant hors ligne.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Exporter les annotations</summary>
          <p>
        le bouton de téléchargement dans le panneau des annotations enregistre tous les
        surlignages et notes du livre dans un fichier Markdown (.md), avec leur page ou
        position, prêt pour vos notes ou pour des applications comme Obsidian.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Lecture à voix haute</summary>
          <p>
        le bouton haut-parleur lit le livre avec la voix du navigateur, en commençant à
        la page actuelle. La phrase en cours de lecture est surlignée pour la suivre des
        yeux, et la page tourne toute seule une fois que la voix atteint la fin de ce qui
        est à l’écran, pour pouvoir suivre en même temps. Dans les EPUB, quand une phrase
        commence sur une page et se termine sur la suivante, la page tourne en plein
        milieu de la phrase, à peu près là où en est la voix, pour ne pas rester à
        regarder un fragment pendant que le reste se lit. Le panneau s’efface au début de
        la lecture pour ne pas cacher le texte : pendant qu’elle joue, un petit contrôle
        en bas permet de mettre en pause, reprendre et arrêter, et sur un grand écran, le
        bouton haut-parleur lui-même permet de mettre en pause et de reprendre. En
        reprenant, la phrase interrompue est relue depuis le début. Les réglages (voix et
        vitesse) se rouvrent depuis le menu « ⋯ ». Tourner une page à la main arrête la
        lecture. Cela ne fonctionne pas sur les PDF numérisés sans texte.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Imprimer et enregistrer en PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Porter un EPUB sur le papier</summary>
          <p>
        le bouton de l’imprimante (ou « Imprimer ou enregistrer en PDF » dans le menu « ⋯ ») compose le livre pour des feuilles de papier et ouvre la boîte de dialogue d’impression du navigateur, où vous pouvez choisir l’imprimante ou « Enregistrer au format PDF ». Vous choisissez le format (A4 ou Letter), les marges et le corps du texte ; chaque chapitre commence sur une nouvelle feuille et le livre garde sa mise en page et ses illustrations. Les réglages sont mémorisés pour la fois suivante. Pour les PDF, l’option n’apparaît pas : ceux-là s’impriment en les téléchargeant.</p>
        </details>
        <details class="punto-ayuda">
          <summary>N’imprimer qu’un chapitre</summary>
          <p>
        la liste de la boîte de dialogue arrive avec tous les chapitres cochés. Décochez ceux dont vous ne voulez pas — ou appuyez sur « Aucun » et n’en choisissez qu’un — et le papier ne portera que ceux-là. Un livre entier en A4, cela fait beaucoup de feuilles.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Surlignages et notes sur le papier</summary>
          <p>
        si le livre a des annotations, une case permet de les emporter : les passages sortent avec leur couleur et chaque note, avec son appel, est reprise à la fin de son chapitre, à côté du passage qu’elle commente. Décochée, le texte s’imprime net.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>À propos des PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Texte et liens du PDF</summary>
          <p>
        vous pouvez sélectionner et copier le texte, et les liens propres au PDF
        fonctionnent : les liens internes (sommaire, références) sautent à leur page et
        les liens externes s’ouvrent dans un autre onglet.</p>
        </details>
        <details class="punto-ayuda">
          <summary>PDF protégés</summary>
          <p>
        si un PDF est chiffré, PageKeeper demande son mot de passe pour l’ouvrir. Le mot
        de passe n’est pas conservé.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-nube" class="panel-pestana" role="tabpanel"
      aria-label="Nuage" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Qu’est-ce que le WebDAV ?</h2>
        <p>C’est un moyen standard d’accéder à des fichiers stockés sur un serveur par
        internet, comme s’il s’agissait d’un dossier distant. PageKeeper l’utilise pour
        lire vos livres et pour enregistrer votre position de lecture dans votre propre
        nuage, afin de pouvoir continuer depuis un autre appareil.</p>
      </div>

      <div class="tarjeta importante">
        <h2>⚠️ Important : tous les nuages ne fonctionnent pas</h2>
        <p>Le lecteur s’exécute dans le navigateur et, par sécurité, celui-ci
        n’autorise une connexion à un serveur que si ce serveur le permet
        expressément (une règle technique appelée <em>CORS</em>). Cela écarte presque
        tous les services commerciaux :</p>
        <ul class="lista-ayuda">
          <li><strong>Google Drive, Dropbox, OneDrive :</strong> non, ils
          n’offrent pas de WebDAV utilisable de cette façon.</li>
          <li><strong>Koofr, pCloud, Yandex et similaires :</strong> ils ont
          bien du WebDAV, mais bloquent l’accès depuis les pages web, et vous ne
          pouvez pas y changer quoi que ce soit car le serveur ne vous appartient
          pas.</li>
          <li><strong>Nextcloud ou ownCloud avec l’autorisation activée :</strong>
          en pratique, c’est la seule option qui fonctionne pour la synchronisation.</li>
        </ul>
      </div>

      <details class="tarjeta tarjeta-plegable">
        <summary>Je n’ai pas mon propre serveur (le cas le plus fréquent)</summary>
        <p>Presque personne n’a son propre serveur, et ce n’est pas grave. Vous avez
        deux options :</p>
        <ul class="lista-ayuda">
          <li><strong>Quelqu’un vous donne accès à son Nextcloud</strong> (un
          proche, votre établissement, votre équipe au travail…). Demandez-lui
          trois choses : l’<em>URL de votre dossier WebDAV</em>, votre
          <em>nom d’utilisateur</em> et un <em>mot de passe d’application</em>.
          Avec cela, vous synchronisez déjà entre appareils, sans rien configurer
          vous-même.</li>
          <li><strong>Personne ne vous donne accès :</strong> ajoutez vos livres
          avec le « + » sous « Sur cet appareil ». La lecture fonctionne tout
          aussi bien ; vous perdez seulement la synchronisation automatique entre
          appareils.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>J’ai ou j’administre Nextcloud / ownCloud</summary>
        <p>Pour permettre à PageKeeper de se connecter :</p>
        <ul class="lista-ayuda">
          <li>Installez l’application <strong>WebAppPassword</strong> et ajoutez
          le domaine de cette liseuse (<code id="ayuda-dominio">ce site</code>)
          aux origines autorisées.</li>
          <li>Créez un <strong>mot de passe d’application</strong> (Réglages →
          Sécurité). N’utilisez pas votre mot de passe principal.</li>
          <li>Dans les <strong>⚙️ Réglages</strong> de cette liseuse, saisissez
          l’URL de votre dossier (par exemple
          <code>https://votre-nuage.com/remote.php/dav/files/UTILISATEUR/Livres</code>),
          votre nom d’utilisateur et ce mot de passe.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Transférer la configuration vers un autre appareil</summary>
        <p>Une fois votre nuage configuré, <strong>⚙️ Réglages → « Copier le lien
        de configuration »</strong> vous donne un lien qui transporte tout (URL,
        utilisateur et mot de passe). Ouvrez-le sur un autre appareil et il sera
        configuré aussitôt. Ne le partagez que par des canaux privés et
        supprimez-le après usage.</p>
      </details>

      <details class="tarjeta tarjeta-plegable destacado">
        <summary>🤖 Bloqué dans la configuration ? Demandez à une IA</summary>
        <p>Configurer un serveur demande un peu d’effort, mais une intelligence
        artificielle (ChatGPT, Claude, Gemini…) peut vous guider pas à pas.
        Copiez-collez des questions comme celles-ci :</p>
        <ul class="lista-ayuda">
          <li>« J’ai un serveur Nextcloud. Comment installer l’application
          <em>WebAppPassword</em> et autoriser l’accès WebDAV depuis un site
          hébergé à <code id="ayuda-dominio-ia">ce site</code> ? »</li>
          <li>« Comment créer un mot de passe d’application dans Nextcloud ? »</li>
          <li>« Le service de stockage en nuage <em>[nom]</em> autorise-t-il
          l’accès WebDAV depuis le navigateur (CORS) pour un site externe ? »</li>
        </ul>
      </details>
      </div>

    <div id="panel-ayuda-privacidad" class="panel-pestana" role="tabpanel"
      aria-label="Confidentialité" tabindex="0" hidden>
<div class="tarjeta"><h2>Confidentialité</h2><p>Il n’y a aucun serveur intermédiaire : votre navigateur se connecte directement à votre nuage. L’URL, l’utilisateur et le mot de passe sont enregistrés uniquement dans ce navigateur.</p></div>
    </div>
  `,


  gl: `
    <div class="pestanas" data-grupo="ayuda" role="tablist"
      aria-label="Seccións da axuda">
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-empezar" data-panel="empezar"
        aria-selected="true">Primeiros pasos</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-biblioteca" data-panel="biblioteca"
        aria-selected="false" tabindex="-1">Biblioteca</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-lector" data-panel="lector"
        aria-selected="false" tabindex="-1">Lector</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-nube" data-panel="nube"
        aria-selected="false" tabindex="-1">Nube</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-privacidad" data-panel="privacidad"
        aria-selected="false" tabindex="-1">Privacidade</button>
    </div>

    <div id="panel-ayuda-empezar" class="panel-pestana" role="tabpanel"
      aria-label="Primeiros pasos" tabindex="0">
<div class="tarjeta"><h2>Que fai PageKeeper?</h2><p>Le libros PDF e EPUB, fórmulas matemáticas incluídas, nun teléfono, unha tableta ou un ordenador, e lembra a túa posición de lectura.</p><ul class="lista-ayuda"><li><strong>Engadir un libro desde o teu dispositivo (botón «+»):</strong> funciona
        ao instante, sen contas nin axustes. O libro gárdase na biblioteca dese
        navegador e lembra por onde o deixaches. O único pero: todo queda unicamente
        nese dispositivo. Tamén podes arrastrar un ou varios PDF ou EPUB á sección
        local.</li><li><strong>Engadir un cartafol enteiro:</strong> o botón de cartafol coa frecha (e arrastrar un cartafol á sección) copia todos os PDF e EPUB que contén, subcartafoles incluídos, e reconstrúe a mesma estrutura na túa biblioteca. Funciona igual coa nube, onde os cartafoles se crean no servidor.</li><li><strong>Conectar unha nube (WebDAV):</strong> os teus libros e a túa
        posición de lectura sincronízanse en todos os teus dispositivos. Require
        primeiro algo de configuración, explicada máis abaixo.</li></ul></div>

<div class="tarjeta"><h2>Claro, sepia, escuro e negro</h2><p>O botón de tema da cabeceira abre un menú con cinco opcións: <strong>o do sistema</strong> (círculo medio claro medio escuro), <strong>claro</strong> (sol), <strong>sepia</strong> (cunca), <strong>escuro</strong> (lúa) e <strong>negro</strong> (lúa con estrela). A icona do botón indica en cal estás, e a túa escolla lémbrase nese navegador. Comeza no tema do sistema, para que a aplicación siga o resto do dispositivo.</p><p class="ayuda">O tema é tamén o papel no que les: o claro é papel branco, o sepia o ton cálido dos lectores de tinta electrónica, o escuro o modo noite da páxina e o negro ese mesmo modo noite levado ao negro puro, que nas pantallas OLED apaga o píxel e gasta menos batería.</p><p class="ayuda">Con «o do sistema» podes decidir a que tema vai cada lado: sepia en vez de claro de día, ou negro en vez de escuro de noite. Escóllese en <em>⚙️ Axustes → Biblioteca</em>, cunha mostra de cada un para velos sen cambiar o tema do dispositivo.</p></div>
    </div>

    <div id="panel-ayuda-biblioteca" class="panel-pestana" role="tabpanel"
      aria-label="Biblioteca" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Os teus libros dun ollo</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Continuar lendo</summary>
          <p>
        a túa última lectura ocupa o primeiro posto. Nunha pantalla ancha, as lecturas
        recentes móstranse todas xuntas como tarxetas cunha portada grande e o título
        completo; nunha pantalla estreita, despregan baixo «Ver máis». Podes retirar as
        que xa non queiras; en <em>⚙️ Axustes → Biblioteca</em> escolles cantas
        mostrar e podes desactivar de todo o recadro, se prefires ir directo aos teus
        libros. Só aparece na pantalla de inicio: entrar nun cartafol retírao para
        deixar sitio ao que contén. Un libro retirado volve cando o abres de novo. Os
        libros rematados e os arquivos que xa non existen quedan fóra desta lista. A caixa
        do final do recadro fai que PageKeeper se abra directamente na túa última
        lectura, sen pasar pola biblioteca; só vale para este dispositivo, así que podes
        tela posta no móbil e non no ordenador. O
        menú «⋯» de cada tarxeta ofrece as mesmas accións que a biblioteca (renomear,
        mover, subir ou gardar, sen conexión, borrar…), para non ter que baixar
        buscando o libro sobre o que actuar.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Orde e estados</summary>
          <p>
        podes ordenar por lectura recente, título, autor ou progreso, filtrar os libros
        pendentes, en curso ou rematados, e marcar calquera deles como rematado. Preme
        a propia etiqueta «Rematado» para quitala; tamén desaparece soa se volves abrir
        o libro, sen perder o progreso. Un libro ao 0 % conta como pendente aínda que
        xa se abrise.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Portadas</summary>
          <p>
        créanse automaticamente (a portada do EPUB ou a primeira páxina do PDF) e
        mostran o progreso de lectura de cada libro. A caixa de busca da biblioteca
        filtra por nome de arquivo, título, autor, formato e outros metadatos
        dispoñibles. No móbil, unha presión longa nun título truncado móstrao enteiro.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Resumo do libro</summary>
          <p>
        se o arquivo trae unha sinopse nos seus metadatos (a descrición do EPUB ou o
        asunto do PDF), aparece nun pequeno recadro ao pasar por riba da tarxeta, tanto
        en «Continuar lendo» como en calquera das dúas bibliotecas, e tamén baixo o
        título no menú «⋯», que é como se le nunha pantalla táctil.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Libro de exemplo</summary>
          <p>
        cando a biblioteca está completamente baleira podes engadir e abrir unha obra
        de exemplo no idioma da interface. Despois compórtase como calquera outro
        libro local.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Cartafoles</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Cartafoles neste dispositivo</summary>
          <p>
        a sección «Neste dispositivo» tamén se pode organizar en cartafoles co botón
        de cartafol con máis. Preme un cartafol para abrilo (a ruta aparece enriba da
        lista para poder volver), renoméao ou bórrao desde o seu menú «⋯», e move un
        libro coa súa opción «Mover a outro cartafol» ou arrastrándoo sobre o
        cartafol. Os cartafoles móvense tamén: usa «Mover o cartafol» ou arrástraos
        sobre outro cartafol ou sobre un chanzo da ruta, e todo o seu contido viaxa con
        eles. Mover un libro aquí non cambia nada máis: mantén a súa páxina, os seus
        marcadores e as súas anotacións. Os libros novos chegan ao cartafol que teñas
        aberto, e a caixa de busca segue atopándoos onde queira que estean.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Cartafoles na nube</summary>
          <p>
        a sección «Na nube» mostra os subcartafoles do teu cartafol e permite
        entrar neles (a ruta aparece enriba da lista para poder volver). Podes crear
        cartafoles novos, renomealos ou borralos desde o seu menú «⋯» (borrar un
        tamén retira o seu contido) e mover un libro dun cartafol a outro co seu botón
        de mover ou arrastrándoo sobre un cartafol da lista (ou sobre un chanzo da
        ruta), conservando o progreso e os marcadores. Os cartafoles móvense tamén:
        usa «Mover o cartafol» ou arrástraos sobre outro cartafol ou sobre un chanzo da
        ruta, e todo o seu contido viaxa con eles. Nin mover nin renomear custa nada ao
        que conteñen: os libros de dentro conservan a súa páxina, os seus marcadores,
        as súas anotacións e a súa nota, e os subcartafoles tamén.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Descargar un cartafol enteiro</summary>
          <p>
        o menú «⋯» de cada cartafol gárdao completo, cos seus subcartafoles e todos os
        libros que contén. En Chrome, Edge e Opera de escritorio escolles onde
        colocalo e cópiase tal cal; nos demais navegadores (Firefox, Safari, móbil)
        descárgase como un único arquivo ZIP.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Volver atrás</summary>
          <p>
        o botón (ou o xesto) de volver do navegador sobe un cartafol en lugar de saír
        de PageKeeper: desde un subcartafol vai ao anterior, e desde a raíz si que sae.
        Tamén pecha o lector, a axuda ou os axustes.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Mover, gardar e borrar</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Subir á nube</summary>
          <p>
        cunha nube configurada, o botón de nube de cada libro local cópiao ao teu
        cartafol remoto conservando a páxina na que vas; tamén podes subir un arquivo
        co «+» ou soltalo na sección «Na nube», e podes arrastrar un libro desde
        «Neste dispositivo» á nube ou a un dos seus cartafoles. Todo se sobe ao
        cartafol que teñas aberto.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Mover libros entre bibliotecas</summary>
          <p>
        un libro da nube pódese gardar no dispositivo con «Gardar neste dispositivo»
        ou arrastrándoo sobre a sección local (ou un dos seus cartafoles); e un libro
        do dispositivo sobe co seu propio botón ou arrastrándoo sobre «Na nube». En
        ambos os casos trátase dunha copia: o orixinal queda no seu sitio e cada
        biblioteca garda a súa propia posición de lectura.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Dispoñible sen conexión</summary>
          <p>
        o botón de nube con frecha garda unha copia xestionada do libro remoto. Se
        falla a rede, PageKeeper amósaa e ábrea automaticamente. O botón verde retira
        só esa copia sen borrar o libro da nube.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Descargar</summary>
          <p>
        o botón de descarga garda unha copia do arquivo (PDF ou EPUB) no dispositivo,
        veña da nube ou da biblioteca local.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Borrar</summary>
          <p>
        o lixo de cada libro elimínao (do servidor se é un libro da nube, ou deste
        dispositivo se é local).</p>
        </details>
        <details class="punto-ayuda">
            <summary>Estatísticas de lectura</summary>
            <p>O botón do gráfico da cabeceira abre o tempo que dedicas a ler:
          o total, o de hoxe e o desta semana, cantos días seguidos levas, un gráfico
          de barras e os libros aos que máis tempo lles
          dedicas —os de menos de cinco minutos non saen nesa lista, para que non a enchan os que só abriches para ver de que ían; o seu tempo segue contando nos totais e na ficha do libro—. Esa lista pódese ordenar por tempo dedicado, por última lectura ou por título, e cada libro abre a súa ficha. O gráfico agrúpase por <strong>días, semanas, meses ou anos</strong>,
          e debaixo compara o tramo en curso co anterior: canto levas este mes fronte ao
          pasado, ou este ano fronte ao outro. A barra raiada é a do tramo que aínda vai
          a medias. O detalle por días chega ata uns trece meses atrás; o total de cada
          mes gárdase para sempre, así que os meses e os anos pódense comparar aínda que
          sexan vellos. Só conta o tempo co libro diante: mentres a aplicación non está á
          vista —outra lapela, outra aplicación, o móbil bloqueado— o reloxo párase, así
          que deixala aberta non suma nada. De cada páxina cóntanse como máximo cinco
          minutos; se quedas máis tempo na mesma, a barra do pé avisa cun «En pausa» e o
          reloxo volve correr en canto pasas de páxina.</p>
            <p>Se prefires que non se mida nada, hai unha caixa —«Non medir o tempo de
          lectura»— en <em>⚙️ Axustes → Datos</em> e ao pé da propia pantalla de
          estatísticas. Ao marcala avísase de que se borrará o apuntado ata entón.
          Pódese volver activar cando queiras: entón cóntase desde cero. A decisión viaxa co resto dos teus datos: se usas a nube, os teus outros dispositivos deixan de medir en canto sincronizan.</p>
            <p>Cunha nube configurada, as cifras suman todos os teus dispositivos:
          o tempo de cada libro leva embaixo o reparto («este dispositivo 2 h ·
          Chrome en Linux 45 min»), así que sabes canto tardaches en lelo aínda que o
          lesses a anacos en cada aparello, e un día no que liches en dous deles conta
          como un só día da racha. Todo isto viaxa coa túa posición de lectura, no teu
          propio servidor, e nunca se envía a ningún outro sitio. Podes borralas cando
          queiras desde esa mesma pantalla — bórranse en todos os dispositivos — sen
          tocar os teus libros nin o teu progreso.</p>
            <p>Dun único libro tenllo aínda máis a man: mentres les, a barra de abaixo
          comeza co tempo que lle levas dedicado, e ao tocala ábrese a súa ficha, con
          canto liches, as páxinas, o ritmo, o que falta e o reparto entre
          dispositivos. A mesma ficha está no menú «⋯» do libro, na biblioteca.</p>
          </details>
          <details class="punto-ayuda">
          <summary>Importar e exportar</summary>
          <p>
        o botón de cartafol con frecha da cabeceira abre unha pantalla onde podes
        engadir libros e descargar ou restaurar copias ZIP. Hai unha copia para os
        libros «Neste dispositivo» e outra para toda a biblioteca WebDAV, subcartafoles
        incluídos. Ambas conservan o progreso, os marcadores e as anotacións; ningunha
        contén o teu contrasinal. Para gardar a URL, o usuario e o contrasinal de
        aplicación por separado, usa <em>Axustes → Levar a configuración a outro
        dispositivo</em>.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-lector" class="panel-pestana" role="tabpanel"
      aria-label="Lector" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Ver a páxina</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Modo de lectura</summary>
          <p>
        páxina a páxina (como un libro) ou páxinas continuas con desprazamento
        vertical.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Pasar páxina</summary>
          <p>
        arrastra cara aos lados e a páxina segue o teu dedo, mostrando cara a onde se
        dirixe; se te arrepentes a medio camiño, volve deslizando ao seu sitio. Premer
        as marxes esquerda e dereita, ou usar as frechas e a barra espazadora, fai que
        a páxina faga soa ese mesmo percorrido, para velo tamén nun ordenador. Nos PDF a
        páxina veciña asómase de verdade. Tamén vale por arriba e por abaixo: premer a
        parte baixa ou esvarar o dedo cara arriba avanza, e a parte alta ou o dedo cara
        abaixo retrocede. Coas páxinas continuas, ou con zoom, é o desprazamento o que
        manda e non hai animación.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Columnas de texto</summary>
          <p>
        o botón das columnas abre un menú: automáticas, ou dunha a catro. En automático caben as que caiban sen que as liñas se fagan incómodas de ler, e refanse soas ao xirar o aparello ou ao cambiar o tamaño da letra. O que escollas é dese libro e deste dispositivo. Nos PDF, que chegan maquetados, só se pode ver unha páxina ou dúas xuntas. Cando aparecen en automático decídelo en <em>⚙️ Axustes → Lector</em>, dicindo de cantas letras queres as liñas.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Xirar a páxina (só PDF)</summary>
          <p>
        o botón de xiro rota o documento 90° cada vez, útil para escaneos torcidos ou
        apaisados. O xiro lémbrase por libro neste dispositivo.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Pantalla completa</summary>
          <p>
        un toque no centro da páxina agocha a barra superior para ler sen distraccións;
        outro toque tráea de volta.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Axustar e ampliar</summary>
          <p>
        os tres controis do zoom van xuntos: as dúas lupas, que amplían e reducen, e o
        nivel de zoom en porcentaxe entre elas. Ao premer ese número ábrese un panel
        con «Axustar ao ancho», «Axustar a páxina completa», os niveis de zoom máis
        usados e unha caixa onde escribir calquera outro (205 %, se é o que che
        convén). Nos PDF a porcentaxe é a da páxina —o 100 % é o seu tamaño natural, así
        que axustala ao ancho pode dar calquera cifra— e nos EPUB é a do texto. Con
        zoom podes arrastrar a páxina co rato ou co dedo, e nas pantallas táctiles
        pizcar para ampliar: nos PDF cambia o zoom, nos EPUB o tamaño do texto.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Tempo restante</summary>
          <p>
        despois duns minutos de lectura, aparece unha estimación do tempo que falta
        para rematar o libro, calculada a partir do teu ritmo real neste dispositivo.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Texto e cor</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Axustes de texto (só EPUB)</summary>
          <p>
        o botón da letra permite escoller o tipo de letra (o do libro, con serifa ou
        sen ela), o aliñamento, o interliñado, a marxe a ambos os lados e se as
        palabras se parten ao final de liña. Os mesmos axustes están en <em>⚙️ Axustes
        → Lector</em>, para velos e cambialos sen abrir ningún libro; os dous lugares
        mostran sempre o mesmo. Partir palabras vén activado por defecto: nunha
        pantalla estreita, e aínda máis co texto xustificado, é o que evita os grandes
        ocos entre palabras. Faino o navegador segundo o idioma do libro, así que pode
        non estar dispoñible para todos os idiomas; tamén se pode deixar como veña en
        cada libro, ou non partir nunca.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Papel do libro</summary>
          <p>
        o papel é o tema da aplicación: non hai dous axustes que cadrar. O botón de
        tema, na cabeceira da biblioteca, abre un menú con cinco opcións —o do sistema,
        claro, sepia (cálido, máis descansado en sesións longas), escuro e negro (negro
        puro, para pantallas OLED)— e cambia á vez a
        páxina do libro e todo o demais. Nos EPUB cambian as cores do texto, así que as
        ilustracións se ven intactas; nos PDF, que xa son imaxes debuxadas, tínxese a
        páxina enteira.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Imaxes cos temas escuros (só PDF)</summary>
          <p>
        cando a páxina se inverte, as fotos e os logotipos quedan en negativo. O botón
        de imaxe, que aparece na barra do lector ao ler un PDF co tema escuro ou co
        negro, devólvelles a súa cor. Lémbrase dun libro a outro. As páxinas escaneadas
        déixanse tal cal: alí a folla enteira é unha imaxe e devolverlle a cor deixaría
        o papel en branco, que é xustamente o que se busca evitar pola noite.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Moverse polo libro</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Ir a un punto</summary>
          <p>
        preme o indicador de páxina (ou a porcentaxe nos EPUB) para saltar
        directamente alí.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Índice e miniaturas</summary>
          <p>
        o botón de panel abre o que traia o libro, e a súa etiqueta indica cal: o
        índice, as miniaturas das páxinas ou ambas as cousas. Ao abrilo, o capítulo no
        que vas queda resaltado e á vista, sen ter que buscalo. Nunha pantalla ancha, o
        panel lateral queda aberto dun libro a outro ata que o pechas ti.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Marcadores</summary>
          <p>
        o botón de marcador garda a posición actual para volver a ela cando queiras.
        Podes poñerlle un nome e cambialo máis tarde. Nos libros da nube, os
        marcadores sincronízanse entre dispositivos xunto coa posición de lectura.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Volver despois dun salto</summary>
          <p>
        despois de usar o índice, a busca ou o selector de posición, aparecen botóns
        para volver atrás ou avanzar de novo. No móbil sitúanse a ambos os lados do
        indicador de páxina ou porcentaxe.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Buscar dentro do libro</summary>
          <p>
        a lupa atopa palabras ou frases, lévate ao punto exacto e déixao resaltado
        uns segundos para localizalo dun ollo.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Anotar e escoitar</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Resaltados e notas</summary>
          <p>
        selecciona texto nun PDF ou EPUB e escolle unha cor de resalte (amarelo,
        verde, azul ou rosa) ou engade unha nota. A cor pódese cambiar máis tarde ao
        editar a anotación. O botón do marcador de texto mostra todas as anotacións do
        libro. Nos libros da nube sincronízanse mesmo traballando sen conexión.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Exportar anotacións</summary>
          <p>
        o botón de descarga do panel de anotacións garda todos os resaltados e notas
        do libro nun arquivo Markdown (.md), coa súa páxina ou posición, listo para os
        teus apuntamentos ou para aplicacións como Obsidian.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Lectura en voz alta</summary>
          <p>
        o botón do altofalante le o libro coa voz do navegador, comezando na páxina
        actual. A frase que se está lendo vaise resaltando para poder seguila coa
        vista, e a páxina avanza soa cando a voz chega ao final do que hai en pantalla,
        así que tamén podes seguir a lectura. Nos EPUB, cando unha frase comeza nunha
        páxina e remata na seguinte, a páxina cambia a media frase, máis ou menos por
        onde vai a voz, para non deixarte mirando un fragmento mentres soa o resto. O
        panel retírase ao comezar a lectura para non tapar o texto: mentres soa, un
        pequeno control abaixo permite pausar, continuar e deter, e nunha pantalla
        ancha o propio botón do altofalante pausa e continúa. Ao continuar, a frase
        interrompida lese de novo desde o inicio. Os axustes (voz e velocidade)
        ábrense de novo desde o menú «⋯». Pasar unha páxina á man detén a lectura. Non
        funciona en PDF escaneados sen texto.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Imprimir e gardar en PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Levar un EPUB ao papel</summary>
          <p>
        o botón da impresora (ou «Imprimir ou gardar en PDF» no menú «⋯») compón o libro para follas de papel e abre o diálogo de impresión do navegador, onde podes escoller a impresora ou «Gardar como PDF». Escóllese o tamaño da folla (A4 ou Carta), as marxes e o corpo de letra; cada capítulo comeza en folla nova e o libro conserva a súa maquetación e as súas ilustracións. Os axustes lémbranse para a próxima vez. Nos PDF non aparece: eses imprímense descargándoos.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Imprimir só un capítulo</summary>
          <p>
        a lista do diálogo trae todos os capítulos marcados. Desmarca os que non queiras —ou preme «Ningún» e escolle só un— e o papel levará unicamente eses. Un libro enteiro en A4 son moitas follas.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Subliñados e notas no papel</summary>
          <p>
        se o libro ten anotacións, unha caixa permite levalas: as pasaxes saen coa súa cor e cada nota, coa súa chamada, recóllese ao final do seu capítulo canda o fragmento que comenta. Desmarcada, imprímese o texto limpo.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Sobre os PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Texto e ligazóns do PDF</summary>
          <p>
        podes seleccionar e copiar texto, e as ligazóns propias do PDF funcionan: as
        internas (índice, referencias) saltan á súa páxina e as externas ábrense
        noutra lapela.</p>
        </details>
        <details class="punto-ayuda">
          <summary>PDF protexidos</summary>
          <p>
        se un PDF está cifrado, PageKeeper pide o seu contrasinal para abrilo. O
        contrasinal non se garda.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-nube" class="panel-pestana" role="tabpanel"
      aria-label="Nube" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Que é o WebDAV?</h2>
        <p>É unha forma estándar de acceder a arquivos gardados nun servidor a través de
        internet, coma se fose un cartafol remoto. PageKeeper úsao para ler os teus
        libros e para gardar a túa posición de lectura na túa propia nube, para poder
        continuar desde outro dispositivo.</p>
      </div>

      <div class="tarjeta importante">
        <h2>⚠️ Importante: nin toda nube vale</h2>
        <p>O lector execútase dentro do navegador e, por seguridade, este só permite
        unha conexión a un servidor se ese servidor o autoriza expresamente (unha
        regra técnica chamada <em>CORS</em>). Iso descarta case todos os servizos
        comerciais:</p>
        <ul class="lista-ayuda">
          <li><strong>Google Drive, Dropbox, OneDrive:</strong> non valen; non
          ofrecen un WebDAV que se poida usar así.</li>
          <li><strong>Koofr, pCloud, Yandex e similares:</strong> teñen WebDAV,
          pero bloquean o acceso desde páxinas web, e non podes cambiar iso
          porque o servidor non é teu.</li>
          <li><strong>Nextcloud ou ownCloud co permiso activado:</strong> na
          práctica, é a única opción que funciona para sincronizar.</li>
        </ul>
      </div>

      <details class="tarjeta tarjeta-plegable">
        <summary>Non teño servidor propio (o caso máis habitual)</summary>
        <p>Case ninguén ten servidor propio, e non pasa nada. Tes dúas opcións:</p>
        <ul class="lista-ayuda">
          <li><strong>Alguén dáche acceso ao seu Nextcloud</strong> (un familiar,
          o teu centro, o teu equipo no traballo…). Pídelle tres cousas: a
          <em>URL do teu cartafol WebDAV</em>, o teu <em>usuario</em> e un
          <em>contrasinal de aplicación</em>. Con iso xa sincronizas entre
          dispositivos, sen configurar nada ti mesmo.</li>
          <li><strong>Ninguén che dá acceso:</strong> engade os teus libros co
          «+» baixo «Neste dispositivo». A lectura funciona igual de ben;
          só perdes a sincronización automática entre dispositivos.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Teño ou administro Nextcloud / ownCloud</summary>
        <p>Para deixar que PageKeeper se conecte:</p>
        <ul class="lista-ayuda">
          <li>Instala a app <strong>WebAppPassword</strong> e engade o dominio
          deste lector (<code id="ayuda-dominio">este sitio</code>) ás orixes
          permitidas.</li>
          <li>Crea un <strong>contrasinal de aplicación</strong> (Axustes →
          Seguridade). Non uses o teu contrasinal principal.</li>
          <li>Nos <strong>⚙️ Axustes</strong> deste lector, escribe a URL do teu
          cartafol (por exemplo
          <code>https://a-tua-nube.com/remote.php/dav/files/USUARIO/Libros</code>),
          o teu usuario e ese contrasinal.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Levar a configuración a outro dispositivo</summary>
        <p>Unha vez configurada a túa nube, <strong>⚙️ Axustes → «Copiar ligazón
        de configuración»</strong> dáche unha ligazón que leva todo (URL,
        usuario e contrasinal). Ábrea noutro dispositivo e quedará configurado
        ao instante. Compártea só por canles privadas e bórraa despois de
        usala.</p>
      </details>

      <details class="tarjeta tarjeta-plegable destacado">
        <summary>🤖 Atrancado configurándoo? Pregúntalle a unha IA</summary>
        <p>Configurar un servidor require algo de esforzo, pero unha intelixencia
        artificial (ChatGPT, Claude, Gemini…) pode guiarte paso a paso. Copia e
        pega preguntas coma estas:</p>
        <ul class="lista-ayuda">
          <li>«Teño un servidor Nextcloud. Como instalo a app
          <em>WebAppPassword</em> e permito o acceso WebDAV desde un sitio
          aloxado en <code id="ayuda-dominio-ia">este sitio</code>?»</li>
          <li>«Como creo un contrasinal de aplicación en Nextcloud?»</li>
          <li>«O servizo de nube <em>[nome]</em> permite o acceso WebDAV desde o
          navegador (CORS) para un sitio web externo?»</li>
        </ul>
      </details>
      </div>

    <div id="panel-ayuda-privacidad" class="panel-pestana" role="tabpanel"
      aria-label="Privacidade" tabindex="0" hidden>
<div class="tarjeta"><h2>Privacidade</h2><p>Non hai ningún servidor intermediario: o teu navegador conéctase directamente á túa nube. A URL, o usuario e o contrasinal gárdanse unicamente neste navegador.</p></div>
    </div>
  `,

  eu: `
    <div class="pestanas" data-grupo="ayuda" role="tablist"
      aria-label="Laguntzaren atalak">
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-empezar" data-panel="empezar"
        aria-selected="true">Lehen urratsak</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-biblioteca" data-panel="biblioteca"
        aria-selected="false" tabindex="-1">Liburutegia</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-lector" data-panel="lector"
        aria-selected="false" tabindex="-1">Irakurgailua</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-nube" data-panel="nube"
        aria-selected="false" tabindex="-1">Hodeia</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-privacidad" data-panel="privacidad"
        aria-selected="false" tabindex="-1">Pribatutasuna</button>
    </div>

    <div id="panel-ayuda-empezar" class="panel-pestana" role="tabpanel"
      aria-label="Lehen urratsak" tabindex="0">
<div class="tarjeta"><h2>Zer egiten du PageKeeperrek?</h2><p>PDF eta EPUB liburuak irakurtzen ditu, formula matematikoak barne, telefono, tableta edo ordenagailu batean, eta zure irakurketa-posizioa gogoratzen du.</p><ul class="lista-ayuda"><li><strong>Gehitu liburu bat zure gailutik («+» botoia):</strong> berehala
        funtzionatzen du, konturik eta ezarpenik gabe. Liburua nabigatzaile horren
        liburutegian gordetzen da eta non utzi zenuen gogoratzen du. Aparteko gauza
        bakarra: dena gailu horretan bakarrik gelditzen da. PDF edo EPUB bat edo
        gehiago atal lokalera ere arrasta ditzakezu.</li><li><strong>Gehitu karpeta oso bat:</strong> gezia duen karpeta-botoiak (eta karpeta bat atalera arrastatzeak) barruan dituen PDF eta EPUB guztiak kopiatzen ditu, azpikarpetak barne, eta egitura bera berreraikitzen du zure liburutegian. Modu berean funtzionatzen du hodeiarekin, non karpetak zerbitzarian sortzen diren.</li><li><strong>Konektatu hodei bat (WebDAV):</strong> zure liburuak eta zure
        irakurketa-posizioa zure gailu guztien artean sinkronizatzen dira. Lehenik
        konfigurazio pixka bat behar du, aurrerago azalduta.</li></ul></div>

<div class="tarjeta"><h2>Argia, sepia, iluna eta beltza</h2><p>Goiburuko gai-botoiak bost aukerako menu bat irekitzen du: <strong>sistemarena</strong> (erdi argi erdi ilun zirkulua), <strong>argia</strong> (eguzkia), <strong>sepia</strong> (kikara), <strong>iluna</strong> (ilargia) eta <strong>beltza</strong> (izardun ilargia). Botoiaren ikonoak zein daukazun esaten dizu, eta zure aukera nabigatzaile horretan gogoratzen da. Sistemaren gaiarekin hasten da, aplikazioak gailuaren gainerakoa jarraitu dezan.</p><p class="ayuda">Gaia irakurtzen duzun papera ere bada: argia paper zuria da, sepia tinta elektronikoko irakurgailuen tono beroa, iluna orriaren gau-modua eta beltza gau-modu bera beltz hutsera eramanda, OLED pantailetan pixela itzaltzen duena eta bateria gutxiago gastatzen duena.</p><p class="ayuda">«Sistemarena» aukerarekin alde bakoitza zein gaitara doan erabaki dezakezu: sepia argiaren ordez egunez, edo beltza ilunaren ordez gauez. <em>⚙️ Ezarpenak → Liburutegia</em> atalean aukeratzen da, bakoitzaren lagin batekin, gailuaren gaia aldatu gabe ikusteko.</p></div>
    </div>

    <div id="panel-ayuda-biblioteca" class="panel-pestana" role="tabpanel"
      aria-label="Liburutegia" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Zure liburuak begi-kolpe batean</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Jarraitu irakurtzen</summary>
          <p>
        zure azken irakurketa goian dago. Pantaila zabalean, azken irakurketak
        azal handi eta izenburu osoko txartel gisa agertzen dira, denak batera;
        pantaila estuan, «Ikusi gehiago» azpian zabaltzen dira. Nahi ez dituzunak
        kendu ditzakezu; <em>⚙️ Ezarpenak → Liburutegia</em> atalean zenbat erakutsi
        aukeratzen duzu eta kutxa osoa itzali dezakezu, zure liburuetara zuzenean
        joatea nahiago baduzu. Hasierako pantailan bakarrik agertzen da: karpeta batean
        sartzeak barruan dagoenari lekua egiteko baztertzen du. Baztertutako liburu bat
        berriro irekitzean itzultzen da. Amaitutako liburuak eta jada existitzen ez
        diren fitxategiak zerrenda honetatik kanpo geratzen dira. Kutxaren amaierako
        kontrol-laukiak PageKeeper zure azken irakurketan zuzenean irekitzea eragiten du,
        liburutegitik pasatu gabe; gailu honetarako bakarrik balio du, beraz mugikorrean
        piztuta eta ordenagailuan itzalita eduki dezakezu. Txartel bakoitzaren
        «⋯» menuak liburutegiak dituen ekintza berak eskaintzen ditu (izena aldatu,
        eraman, igo edo gorde, lineaz kanpo, ezabatu…), liburua bilatzeko behera
        joan behar izan gabe.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ordena eta egoerak</summary>
          <p>
        irakurketa berriaren, izenburuaren, egilearen edo aurrerapenaren arabera
        ordenatu, zain, irakurtzen edo amaituta dauden liburuak iragazi eta edozein
        amaituta gisa marka dezakezu. Sakatu «Amaituta» etiketa bera kentzeko; liburua
        berriro irekitzean ere bakarrik desagertzen da, aurrerapena galdu gabe.
        % 0an dagoen liburu bat zain gisa zenbatzen da, irekita egon arren.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Azalak</summary>
          <p>
        automatikoki sortzen dira (EPUBaren azala edo PDFaren lehen orrialdea) eta
        liburu bakoitzaren irakurketa-aurrerapena erakusten dute. Liburutegiaren
        bilaketa-koadroak fitxategi-izenaren, izenburuaren, egilearen, formatuaren eta
        beste metadatu erabilgarrien arabera iragazten du. Mugikorrean, moztutako
        izenburu baten gainean luze sakatzeak osorik erakusten du.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Liburuaren laburpena</summary>
          <p>
        fitxategiak bere metadatuetan laburpen bat baldin badu (EPUBaren
        deskribapena edo PDFaren gaia), txartelaren gainean sagua jartzean kutxa txiki
        batean agertzen da, bai «Jarraitu irakurtzen» atalean bai bi liburutegietan,
        eta baita izenburuaren azpian «⋯» menuan ere, hori baita pantaila ukigarri
        batean irakurtzeko modua.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Adibidezko liburua</summary>
          <p>
        liburutegia guztiz hutsik dagoenean, interfazearen hizkuntzan dagoen
        adibidezko lan bat gehitu eta ireki dezakezu. Ondoren beste edozein liburu
        lokal bezala jokatzen du.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Karpetak</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Gailu honetako karpetak</summary>
          <p>
        «Gailu honetan» atala ere karpetatan antola daiteke gehi ikurra duen
        karpeta-botoiaren bidez. Sakatu karpeta bat irekitzeko (bidea zerrendaren
        gainean agertzen da atzera egiteko), izena aldatu edo ezabatu bere «⋯»
        menutik, eta eraman liburu bat «Eraman beste karpeta batera» aukerarekin edo
        karpetaren gainean arrastatuz. Karpetak ere mugitzen dira: erabili «Eraman
        karpeta» edo arrastatu beste karpeta baten gainera edo bidearen urrats
        baten gainera, eta barruan duten guztia haiekin bidaiatzen du. Liburu bat
        hemen mugitzeak ez du beste ezer aldatzen: bere orrialdea, laster-markak eta
        oharrak mantentzen ditu. Liburu berriak irekita duzun karpetara heltzen dira,
        eta bilaketa-koadroak beti aurkitzen ditu, edonon egon.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Hodeiko karpetak</summary>
          <p>
        «Hodeian» atalak zure karpetaren azpikarpetak erakusten ditu eta sartzen
        uzten dizu (bidea zerrendaren gainean agertzen da atzera egiteko). Karpeta
        berriak sor ditzakezu, izena aldatu edo bere «⋯» menutik ezabatu (bat
        ezabatzeak bere edukia ere kentzen du) eta liburu bat karpeta batetik
        bestera eraman bere eramateko botoiarekin edo zerrendako karpeta baten
        gainean arrastatuz (edo bidearen urrats baten gainean), aurrerapena eta
        laster-markak mantenduz. Karpetak ere mugitzen dira: erabili «Eraman
        karpeta» edo arrastatu beste karpeta baten gainera edo bidearen urrats
        baten gainera, eta barruan duten guztia haiekin bidaiatzen du. Ez mugitzeak ez
        eta izena aldatzeak ere ez die ezer kentzen barruan dutenei: barruko
        liburuek beren orrialdea, laster-markak, oharrak eta nota mantentzen dituzte,
        eta azpikarpetek berdin.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Deskargatu karpeta oso bat</summary>
          <p>
        karpeta bakoitzaren «⋯» menuak osorik gordetzen du, bere azpikarpeta eta
        barruan dituen liburu guztiekin. Mahaigaineko Chrome, Edge eta Operan non
        jarri aukeratzen duzu eta dagoen bezala kopiatzen da; beste nabigatzaile
        batzuetan (Firefox, Safari, mugikorra) ZIP fitxategi bakar gisa deskargatzen
        da.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Atzera egin</summary>
          <p>
        nabigatzailearen atzera botoiak (edo keinuak) karpeta bat igotzen du
        PageKeeper uzteko ordez: azpikarpeta batetik aurrekora joaten da, eta
        errotik bai uzten du. Irakurgailua, laguntza edo ezarpenak ere ixten ditu.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Eraman, gorde eta ezabatu</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Igo hodeira</summary>
          <p>
        hodei bat konfiguratuta dagoela, liburu lokal bakoitzaren hodei-botoiak zauden
        orrialdea mantenduz zure urruneko karpetara kopiatzen du; fitxategi bat «+»
        botoiarekin ere igo dezakezu, edo «Hodeian» atalera arrastatu, eta liburu bat
        «Gailu honetan» ataletik hodeira edo bere karpeta batera arrasta dezakezu. Dena
        irekita duzun karpetara igotzen da.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Liburuak liburutegien artean eraman</summary>
          <p>
        hodeiko liburu bat «Gorde gailu honetan» erabiliz edo atal lokalaren (edo
        bere karpeta baten) gainean arrastatuz gorde daiteke gailuan; eta gailuko
        liburu bat bere botoiarekin edo «Hodeian» ataleraren gainean arrastatuz igotzen
        da. Bi kasuetan ere kopia bat da: jatorrizkoa bere lekuan geratzen da eta
        liburutegi bakoitzak bere irakurketa-posizioa gordetzen du.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Lineaz kanpo eskuragarri</summary>
          <p>
        gezia duen hodei-botoiak urruneko liburuaren kudeatutako kopia bat gordetzen
        du. Sarea huts egiten badu, PageKeeperrek erakusten eta automatikoki
        irekitzen du. Botoi berdeak kopia hori bakarrik kentzen du, liburua hodeitik
        ezabatu gabe.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Deskargatu</summary>
          <p>
        deskarga-botoiak fitxategiaren kopia bat (PDF edo EPUB) gordetzen du gailuan,
        hodeitik nahiz liburutegi lokaletik badator.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ezabatu</summary>
          <p>
        liburu bakoitzaren zakarrontziak ezabatzen du (zerbitzaritik hodeiko liburua
        bada, edo gailu honetatik lokala bada).</p>
        </details>
        <details class="punto-ayuda">
            <summary>Irakurketa-estatistikak</summary>
            <p>Goiburuko grafiko-botoiak irakurtzen ematen duzun denbora irekitzen
          du: guztira, gaurkoa eta asteko denbora, zenbat egun jarraian daramatzazun,
          barra-grafiko bat, eta denbora gehien
          hartzen duten liburuak —bost minutu baino gutxiagokoak ez dira zerrenda horretan agertzen, zertaz zihoazen ikusteko soilik ireki zenituenek bete ez dezaten; haien denborak guztizkoetan eta liburuaren fitxan zenbatzen jarraitzen du—. Zerrenda hori emandako denboraren, azken irakurraldiaren edo izenburuaren arabera ordena daiteke, eta liburu bakoitzak bere fitxa irekitzen du. Grafikoa <strong>egunka, astez aste, hilabetez edo
          urtez</strong> taldeka daiteke, eta azpian uneko tartea aurrekoarekin
          alderatzen du: hilabete honetan zenbat daramazun aurrekoaren aldean, edo
          aurten iaz baino gehiago ala gutxiago. Marradun barra oraindik erdibidean
          dagoen tartearena da. Eguneko xehetasuna hamahiru hilabete ingurura arte
          iristen da; hilabete bakoitzaren guztizkoa betiko gordetzen da, beraz
          hilabeteak eta urteak zaharrak izanda ere aldera daitezke. Liburua aurrean duzun denbora bakarrik
          zenbatzen da: aplikazioa bistan ez dagoen bitartean —beste fitxa bat, beste
          aplikazio bat, mugikorra blokeatuta— erlojua gelditzen da, beraz irekita
          uzteak ez du ezer gehitzen. Orrialde bakoitzeko bost minutu zenbatzen dira
          gehienez; orrialde berean gehiago geratzen bazara, oineko barrak «Etenda»
          adierazten du, eta erlojua orrialdea pasatzean berriro hasten da.</p>
            <p>Ezer neurtzerik nahi ez baduzu, lauki bat dago —«Ez neurtu irakurketa-
          denbora»— <em>⚙️ Ezarpenak → Datuak</em> atalean eta estatistiken pantailaren
          behealdean. Markatzean, ordura arte apuntatutakoa ezabatuko dela abisatzen du.
          Nahi duzunean berriz aktiba daiteke: orduan zerotik hasten da zenbatzen. Erabakia gainerako datuekin batera bidaiatzen du: hodeia erabiltzen baduzu, zure beste gailuek neurtzeari uzten diote sinkronizatu bezain laster.</p>
            <p>Hodei bat konfiguratuta dagoela, zenbakiek zure gailu guztiak batzen
          dituzte: liburu bakoitzaren denborak azpian banaketa darama («gailu hau
          2 o · Chrome Linuxen 45 min»), gailu bakoitzean zatika irakurri arren
          zenbat denbora hartu dizun jakiteko, eta bietan irakurritako egun bat
          seriearen egun bakar gisa zenbatzen da. Guztia zure irakurketa-posizioarekin
          bidaiatzen du, zure zerbitzari propioan, eta ez da inora bidaltzen. Pantaila
          horretatik bertatik ezaba ditzakezu nahi duzunean — gailu guztietan
          ezabatzen dira — zure liburuak edo aurrerapena ukitu gabe.</p>
            <p>Liburu bakar batentzat are eskurago dago: irakurtzen ari zarela,
          beheko barra hari eman diozun denborarekin hasten da, eta hori sakatzeak
          bere txartela irekitzen du, irakurritakoarekin, orrialdeekin, erritmoarekin,
          falta denarekin eta gailuen arteko banaketarekin. Txartel bera dago
          liburuaren «⋯» menuan, liburutegian.</p>
          </details>
          <details class="punto-ayuda">
          <summary>Inportatu eta esportatu</summary>
          <p>
        goiburuko gezia duen karpeta-botoiak liburuak gehitu eta ZIP kopiak deskargatu
        edo leheneratu ditzakezun pantaila bat irekitzen du. Kopia bat dago «Gailu
        honetan» dauden liburuentzat eta beste bat WebDAV liburutegi osoarentzat,
        azpikarpetak barne. Biek gordetzen dituzte aurrerapena, laster-markak eta
        oharrak; bat ere ez du zure pasahitza gordetzen. URLa, erabiltzailea eta
        aplikazio-pasahitza bereizita gordetzeko, erabili <em>Ezarpenak → Eraman
        konfigurazioa beste gailu batera</em>.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-lector" class="panel-pestana" role="tabpanel"
      aria-label="Irakurgailua" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Orrialdea ikustea</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Irakurketa-modua</summary>
          <p>
        orrialdez orrialde (liburu bat bezala) edo etengabeko orrialdeak
        korritze bertikalarekin.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Orrialdeak pasatzea</summary>
          <p>
        arrastatu alboetara eta orrialdeak zure hatza jarraitzen du, norantz
        doan erakutsiz; erdibidean iritzia aldatzen baduzu, deslizatuz itzultzen da.
        Ezker eta eskuineko marjinak sakatzeak, edo geziak eta zuriune-barra
        erabiltzeak, orrialdeari ibilbide hori bera bakarrik egiten dio, ordenagailu
        batean ere ikusteko. PDFetan ondoko orrialdea benetan asomatzen da. Goitik eta
        behetik ere balio du: beheko aldea sakatzeak edo hatza gorantz arrastatzeak
        aurrera egiten du, eta goiko aldeak edo hatzak beherantz atzera. Etengabeko
        orrialdeekin, edo zoomarekin, korritzeak agintzen du eta ez dago
        animaziorik.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Testu zutabeak</summary>
          <p>
        zutabeen botoiak menu bat irekitzen du: automatikoak, edo batetik laura. Automatikoan, lerroak irakurtzeko deseroso bihurtu gabe sartzen diren beste sartzen dira, eta berez berregiten dira gailua biratzean edo letraren tamaina aldatzean. Aukeratzen duzuna liburu horrena eta gailu honena da. PDFak maketatuta iristen dira: orrialde bat edo bi elkarrekin baino ez dute eskaintzen. Automatikoan noiz agertzen diren <em>⚙️ Ezarpenak → Irakurgailua</em> atalean erabakitzen duzu, lerroak zenbat letrakoak nahi dituzun esanez.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Biratu orrialdea (PDF bakarrik)</summary>
          <p>
        biratzeko botoiak dokumentua 90° biratzen du sakatu bakoitzean, baliagarria
        okertutako edo horizontaleko eskaneoentzat. Biraketa liburuko gogoratzen da
        gailu honetan.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Pantaila osoa</summary>
          <p>
        orrialdearen erdian ukitzeak goiko barra ezkutatzen du distrakziorik gabe
        irakurtzeko; beste ukitu batek berreskuratzen du.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Egokitu eta zoom egin</summary>
          <p>
        zoomaren hiru kontrolak elkarrekin daude: handitu eta txikitzen duten bi
        luparrak, eta artean ehunekotan zoom-maila. Zenbaki hori sakatzeak «Egokitu
        zabalerara», «Egokitu orrialde osoa», gehien erabiltzen diren zoom-mailak eta
        nahi duzun beste edozein idazteko kutxa (% 205, hori bada komeni zaizuna)
        dituen panel bat irekitzen du. PDFetan ehunekoa orrialdearena da —% 100 bere
        neurri naturala da, beraz zabalerara egokitzeak edozein zifra eman dezake— eta
        EPUBetan testuarena da. Zoomarekin orrialdea saguarekin edo hatzarekin
        arrasta dezakezu, eta pantaila ukigarrietan atximurra egin dezakezu handitzeko:
        PDFetan zooma aldatzen du, EPUBetan testuaren tamaina.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Falta den denbora</summary>
          <p>
        irakurketa-minutu batzuen ondoren, liburua amaitzeko falta den denboraren
        estimazio bat agertzen da, gailu honetan duzun benetako erritmotik kalkulatuta.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Testua eta kolorea</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Testu-ezarpenak (EPUB bakarrik)</summary>
          <p>
        letraren botoiak letra-mota aukeratzen uzten dizu (liburuarena, serifarekin
        edo gabe), lerrokatzea, lerroartea, bi aldeetako marjina eta hitzak lerro
        amaieran zatitzen diren ala ez. Ezarpen berak <em>⚙️ Ezarpenak →
        Irakurgailua</em> atalean daude, liburu bat ireki gabe ikusi eta aldatzeko;
        bi tokiek beti gauza bera erakusten dute. Zatitzea lehenetsita dago aktibatuta:
        pantaila estuan, eta are gehiago testu justifikatuarekin, hitzen arteko tarte
        handiak saihesten dituen gauza da. Nabigatzaileak liburuaren hizkuntzaren
        arabera egiten du, beraz baliteke hizkuntza guztientzat erabilgarri ez
        egotea; liburu bakoitzak duen bezala ere utz dezakezu, edo inoiz ez zatitu.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Liburuaren papera</summary>
          <p>
        papera aplikazioaren gaia da: ez dago bi ezarpen bat etortzeko. Liburutegiaren
        goiburuko gai-botoiak bost aukerako menu bat irekitzen du —sistemarena, argia,
        sepia (beroa, saio luzeetan atsedengarriagoa), iluna eta beltza (beltz hutsa,
        OLED pantailetarako)— eta liburuaren orrialdea eta
        gainerako guztia batera aldatzen ditu. EPUBetan testuaren koloreak aldatzen
        dira, ilustrazioak ukitu gabe geratu daitezen; PDFetan, jada marraztutako
        irudiak direnez, orrialde osoa tindatzen da.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Irudiak gai ilunekin (PDF bakarrik)</summary>
          <p>
        orrialdea alderantzikatzean, argazkiak eta logotipoak negatibo gisa geratzen
        dira. Gai ilunarekin edo beltzarekin PDF bat irakurtzean irakurgailuaren barran agertzen den
        irudi-botoiak beren kolorea itzultzen die. Liburu batetik bestera gogoratzen
        da. Eskaneatutako orrialdeak ukitu gabe geratzen dira: han orri osoa irudi bat
        da eta kolorea itzultzeak papera zuri utziko luke, gauean saihestu nahi den
        hain justu.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Liburuan mugitzea</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Joan puntu batera</summary>
          <p>
        ukitu orrialde-adierazlea (edo ehunekoa EPUBetan) bertara zuzenean
        saltatzeko.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Aurkibidea eta miniaturak</summary>
          <p>
        panel-botoiak liburuak daramana irekitzen du, eta bere etiketak zein den
        esaten du: aurkibidea, orrialdeen miniaturak edo biak. Irekitzean, zauden
        kapitulua nabarmenduta eta ikusgai agertzen da, bilatu gabe. Pantaila zabalean,
        alboko panela liburu batetik bestera irekita geratzen da zuk itxi arte.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Laster-markak</summary>
          <p>
        laster-marka-botoiak uneko posizioa gordetzen du nahi duzunean itzultzeko.
        Izena jarri eta geroago alda diezaiokezu. Hodeiko liburuetan, laster-markak
        gailuen artean sinkronizatzen dira irakurketa-posizioarekin batera.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Jauzi baten ondoren itzuli</summary>
          <p>
        aurkibidea, bilaketa edo posizio-hautatzailea erabili ondoren, atzera egiteko
        edo berriro aurreratzeko botoiak agertzen dira. Mugikorrean orrialde- edo
        ehuneko-adierazlearen bi aldeetan kokatzen dira.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Bilatu liburuaren barruan</summary>
          <p>
        luparrak hitzak edo esaldiak aurkitzen ditu, puntu zehatzera eramaten zaitu eta
        segundo batzuez nabarmenduta uzten du begi-kolpe batean ikusteko.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Oharrak eta entzutea</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Nabarmentzeak eta oharrak</summary>
          <p>
        hautatu testua PDF edo EPUB batean eta aukeratu nabarmentze-kolore bat
        (horia, berdea, urdina edo arrosa) edo gehitu ohar bat. Kolorea geroago alda
        daiteke oharra editatzean. Markatzaile-botoiak liburuko ohar guztiak
        erakusten ditu. Hodeiko liburuetan lineaz kanpo lan egitean ere
        sinkronizatzen dira.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Esportatu oharrak</summary>
          <p>
        oharren panelaren deskarga-botoiak liburuko nabarmentze eta ohar guztiak
        Markdown fitxategi batean (.md) gordetzen ditu, bere orrialde edo posizioarekin,
        zure apunteentzat edo Obsidian bezalako aplikazioentzat prest.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ozen irakurtzea</summary>
          <p>
        bozgorailu-botoiak liburua nabigatzailearen ahotsarekin irakurtzen du, uneko
        orrialdean hasita. Entzuten ari den esaldia nabarmentzen joaten da begiekin
        jarraitu ahal izateko, eta orrialdea bakarrik aurreratzen da ahotsak
        pantailan dagoenaren amaierara heltzen denean, jarraitzeko ere. EPUBetan,
        esaldi bat orrialde batean hasi eta hurrengoan amaitzen denean, orrialdea
        esaldi erdian aldatzen da, gutxi gorabehera ahotsa dagoen puntuan, gainerakoa
        entzuten den bitartean zati bati begira ez uzteko. Panela alde batera egiten
        da irakurketa hastean testua estali ez dezan: entzuten ari den bitartean,
        beheko kontrol txiki batek pausatu, jarraitu eta gelditu egiten du, eta
        pantaila zabalean bozgorailu-botoiak berak pausatu eta jarraitzen du.
        Jarraitzean, eten den esaldia hasieratik berriro entzuten da. Ezarpenak
        (ahotsa eta abiadura) «⋯» menutik berriro irekitzen dira. Eskuz orrialdea
        aldatzeak irakurketa gelditzen du. Ez du funtzionatzen testurik gabeko
        eskaneatutako PDFetan.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Inprimatu eta PDF gisa gorde</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>EPUB bat paperera eraman</summary>
          <p>
        inprimagailuaren botoiak (edo «⋯» menuko «Inprimatu edo gorde PDF gisa») liburua paper-orrietarako osatzen du eta nabigatzailearen inprimatze-elkarrizketa irekitzen du; bertan inprimagailua edo «Gorde PDF gisa» aukera dezakezu. Orriaren tamaina (A4 edo Letter), marjinak eta letra-tamaina aukeratzen dira; kapitulu bakoitza orri berrian hasten da, eta liburuak bere maketazioa eta ilustrazioak gordetzen ditu. Ezarpenak hurrengorako gogoratzen dira. PDFetan ez da agertzen: horiek deskargatuz inprimatzen dira.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Kapitulu bakarra inprimatu</summary>
          <p>
        elkarrizketako zerrendan kapitulu guztiak markatuta daude. Kendu marka nahi ez dituzunei —edo sakatu «Bat ere ez» eta aukeratu bakarra— eta paperean horiek bakarrik aterako dira. Liburu oso bat A4 tamainan orri asko dira.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Azpimarratuak eta oharrak paperean</summary>
          <p>
        liburuak oharpenak baditu, kontrol-lauki batek eramaten uzten ditu: pasarteak beren kolorearekin ateratzen dira, eta ohar bakoitza, bere deiarekin, kapituluaren amaieran biltzen da, iruzkintzen duen zatiaren ondoan. Markarik gabe, testua garbi inprimatzen da.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>PDFei buruz</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>PDFaren testua eta estekak</summary>
          <p>
        testua hauta eta kopia dezakezu, eta PDFaren berezko estekek funtzionatzen
        dute: barnekoek (aurkibidea, erreferentziak) beren orrialdera saltatzen dute
        eta kanpokoek beste fitxa batean irekitzen dira.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Babestutako PDFak</summary>
          <p>
        PDF bat zifratuta badago, PageKeeperrek pasahitza eskatzen du irekitzeko.
        Pasahitza ez da gordetzen.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-nube" class="panel-pestana" role="tabpanel"
      aria-label="Hodeia" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Zer da WebDAV?</h2>
        <p>Zerbitzari batean gordetako fitxategietara internet bidez, urruneko
        karpeta bat balitz bezala, iristeko modu estandar bat da. PageKeeperrek
        zure liburuak irakurtzeko eta zure irakurketa-posizioa zure hodei propioan
        gordetzeko erabiltzen du, beste gailu batetik jarraitu ahal izateko.</p>
      </div>

      <div class="tarjeta importante">
        <h2>⚠️ Garrantzitsua: hodei guztiek ez dute balio</h2>
        <p>Irakurgailua nabigatzailearen barruan exekutatzen da, eta segurtasunagatik,
        nabigatzaileak zerbitzari batekiko konexioa baino ez du onartzen zerbitzari
        horrek berariaz baimentzen badu (<em>CORS</em> izeneko arau tekniko bat).
        Horrek merkataritza-zerbitzu ia guztiak baztertzen ditu:</p>
        <ul class="lista-ayuda">
          <li><strong>Google Drive, Dropbox, OneDrive:</strong> ez dute balio;
          ez dute modu honetan erabil daitekeen WebDAVrik eskaintzen.</li>
          <li><strong>Koofr, pCloud, Yandex eta antzekoak:</strong> WebDAV badute,
          baina web orrialdeetatik sarbidea blokeatzen dute, eta ezin duzu hori
          aldatu zerbitzaria ez delako zurea.</li>
          <li><strong>Nextcloud edo ownCloud baimena aktibatuta:</strong>
          praktikan, sinkronizatzeko funtzionatzen duen aukera bakarra da.</li>
        </ul>
      </div>

      <details class="tarjeta tarjeta-plegable">
        <summary>Ez dut nire zerbitzaririk (ohikoena)</summary>
        <p>Ia inork ez du bere zerbitzaririk, eta ez da arazorik. Bi aukera dituzu:</p>
        <ul class="lista-ayuda">
          <li><strong>Norbaitek bere Nextcloudera sarbidea ematen dizu</strong>
          (senide bat, zure ikastetxea, laneko taldea…). Eskatu hiru gauza: zure
          <em>WebDAV karpetaren URLa</em>, zure <em>erabiltzaile-izena</em> eta
          <em>aplikazio-pasahitz</em> bat. Horrekin jada gailuen artean
          sinkronizatzen duzu, ezer zeuk konfiguratu gabe.</li>
          <li><strong>Inork ez dizu sarbidea ematen:</strong> gehitu zure liburuak
          «Gailu honetan» azpiko «+» botoiarekin. Irakurketak berdin funtzionatzen
          du; gailuen arteko sinkronizazio automatikoa bakarrik galtzen duzu.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Nextcloud / ownCloud dut edo administratzen dut</summary>
        <p>PageKeeper konekta dadin:</p>
        <ul class="lista-ayuda">
          <li>Instalatu <strong>WebAppPassword</strong> aplikazioa eta gehitu
          irakurgailu honen domeinua (<code id="ayuda-dominio">gune hau</code>)
          baimendutako jatorrien artean.</li>
          <li>Sortu <strong>aplikazio-pasahitz</strong> bat (Ezarpenak →
          Segurtasuna). Ez erabili zure pasahitz nagusia.</li>
          <li>Irakurgailu honen <strong>⚙️ Ezarpenak</strong> atalean, idatzi
          zure karpetaren URLa (adibidez
          <code>https://zure-hodeia.com/remote.php/dav/files/ERABILTZAILEA/Liburuak</code>),
          zure erabiltzaile-izena eta pasahitz hori.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Eraman konfigurazioa beste gailu batera</summary>
        <p>Zure hodeia konfiguratuta dagoenean, <strong>⚙️ Ezarpenak → «Kopiatu
        konfigurazio-esteka»</strong> guztia daraman esteka bat ematen dizu (URLa,
        erabiltzailea eta pasahitza). Ireki beste gailu batean eta berehala
        konfiguratuta geratuko da. Partekatu bakarrik kanal pribatuen bidez eta
        ezabatu erabili ondoren.</p>
      </details>

      <details class="tarjeta tarjeta-plegable destacado">
        <summary>🤖 Konfiguratzen trabatuta? Galdetu AI bati</summary>
        <p>Zerbitzari bat konfiguratzeak lan pixka bat behar du, baina adimen
        artifizial batek (ChatGPT, Claude, Gemini…) urratsez urrats gidatuko zaitu.
        Kopiatu eta itsatsi honelako galderak:</p>
        <ul class="lista-ayuda">
          <li>«Nextcloud zerbitzari bat dut. Nola instalatzen dut
          <em>WebAppPassword</em> aplikazioa eta nola baimentzen dut WebDAV sarbidea
          <code id="ayuda-dominio-ia">gune hau</code>n ostatatutako gune batetik?»</li>
          <li>«Nola sortzen dut aplikazio-pasahitz bat Nextclouden?»</li>
          <li>«<em>[izena]</em> hodei-zerbitzuak WebDAV sarbidea onartzen du
          nabigatzailetik (CORS) kanpoko webgune batentzat?»</li>
        </ul>
      </details>
      </div>

    <div id="panel-ayuda-privacidad" class="panel-pestana" role="tabpanel"
      aria-label="Pribatutasuna" tabindex="0" hidden>
<div class="tarjeta"><h2>Pribatutasuna</h2><p>Ez dago bitarteko zerbitzaririk: zure nabigatzailea zure hodeira zuzenean konektatzen da. URLa, erabiltzailea eta pasahitza nabigatzaile honetan bakarrik gordetzen dira.</p></div>
    </div>
  `,


  de: `
    <div class="pestanas" data-grupo="ayuda" role="tablist"
      aria-label="Hilfebereiche">
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-empezar" data-panel="empezar"
        aria-selected="true">Erste Schritte</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-biblioteca" data-panel="biblioteca"
        aria-selected="false" tabindex="-1">Bibliothek</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-lector" data-panel="lector"
        aria-selected="false" tabindex="-1">Lesegerät</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-nube" data-panel="nube"
        aria-selected="false" tabindex="-1">Cloud</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-privacidad" data-panel="privacidad"
        aria-selected="false" tabindex="-1">Datenschutz</button>
    </div>

    <div id="panel-ayuda-empezar" class="panel-pestana" role="tabpanel"
      aria-label="Erste Schritte" tabindex="0">
<div class="tarjeta"><h2>Was macht PageKeeper?</h2><p>Es liest PDF- und EPUB-Bücher, einschließlich mathematischer Formeln, auf Handy, Tablet oder Computer und merkt sich deine Leseposition.</p><ul class="lista-ayuda"><li><strong>Ein Buch von deinem Gerät hinzufügen („+“-Schaltfläche):</strong> funktioniert
        sofort, ohne Konten und ohne Einstellungen. Das Buch wird in der Bibliothek
        dieses Browsers gespeichert und merkt sich, wo du aufgehört hast. Der einzige
        Haken: Alles bleibt nur auf diesem Gerät. Du kannst auch ein oder mehrere PDF-
        oder EPUB-Dateien in den lokalen Bereich ziehen.</li><li><strong>Einen ganzen Ordner hinzufügen:</strong> Die Ordnerschaltfläche mit dem Pfeil (und das Ziehen eines Ordners in den Bereich) kopiert alle darin enthaltenen PDF- und EPUB-Dateien, einschließlich Unterordner, und baut dieselbe Struktur in deiner Bibliothek nach. Bei der Cloud funktioniert es genauso, dort werden die Ordner auf dem Server angelegt.</li><li><strong>Eine Cloud verbinden (WebDAV):</strong> Deine Bücher und deine
        Leseposition werden zwischen all deinen Geräten synchronisiert. Dafür ist
        zunächst etwas Einrichtung nötig, weiter unten erklärt.</li></ul></div>

<div class="tarjeta"><h2>Hell, Sepia, Dunkel und Schwarz</h2><p>Die Design-Schaltfläche in der Kopfzeile öffnet ein Menü mit fünf Optionen: <strong>Systemvorgabe</strong> (halb helles, halb dunkles Kreis-Symbol), <strong>Hell</strong> (Sonne), <strong>Sepia</strong> (Tasse), <strong>Dunkel</strong> (Mond) und <strong>Schwarz</strong> (Mond mit Stern). Das Symbol der Schaltfläche zeigt an, welches gerade aktiv ist, und deine Wahl wird in diesem Browser gemerkt. Es beginnt mit der Systemvorgabe, damit die Anwendung dem Rest des Geräts folgt.</p><p class="ayuda">Das Design ist auch das Papier, auf dem du liest: Hell ist weißes Papier, Sepia der warme Ton von E-Ink-Lesegeräten, Dunkel der Nachtmodus der Seite und Schwarz derselbe Nachtmodus in reinem Schwarz, das auf OLED-Bildschirmen das Pixel abschaltet und weniger Akku verbraucht.</p><p class="ayuda">Mit der Systemvorgabe kannst du festlegen, wohin jede Seite führt: Sepia statt Hell am Tag oder Schwarz statt Dunkel in der Nacht. Das wählst du unter <em>⚙️ Einstellungen → Bibliothek</em>, mit einer Vorschau von beiden, um sie ohne Wechsel des Gerätedesigns zu sehen.</p></div>
    </div>

    <div id="panel-ayuda-biblioteca" class="panel-pestana" role="tabpanel"
      aria-label="Bibliothek" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Deine Bücher auf einen Blick</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Weiterlesen</summary>
          <p>
        deine letzte Lektüre steht ganz oben. Auf einem breiten Bildschirm werden die
        zuletzt gelesenen Bücher gleichzeitig als Karten mit großem Cover und
        vollständigem Titel angezeigt; auf einem schmalen Bildschirm klappen sie sich
        unter „Mehr anzeigen“ auf. Du kannst nicht mehr gewünschte entfernen; unter
        <em>⚙️ Einstellungen → Bibliothek</em> legst du fest, wie viele angezeigt
        werden, und kannst das ganze Feld auch ausschalten, wenn du lieber direkt zu
        deinen Büchern springen willst. Es erscheint nur auf dem Startbildschirm: Beim
        Betreten eines Ordners wird es beiseitegeräumt, um Platz für dessen Inhalt zu
        machen. Ein entferntes Buch kehrt zurück, sobald du es erneut öffnest.
        Beendete Bücher und nicht mehr vorhandene Dateien bleiben außerhalb dieser
        Liste. Das Kästchen am Ende des Feldes lässt PageKeeper direkt in deiner letzten
        Lektüre starten, ohne Umweg über die Bibliothek; es gilt nur für dieses Gerät,
        du kannst es also auf dem Handy anhaben und auf dem Rechner nicht.
        Das „⋯“-Menü jeder Karte bietet dieselben Aktionen wie die Bibliothek
        (umbenennen, verschieben, hochladen oder speichern, offline, löschen…), damit
        du nie nach unten scrollen musst, um das Buch zu finden, an dem du etwas
        ändern willst.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Sortierung und Zustände</summary>
          <p>
        du kannst nach zuletzt gelesen, Titel, Autor oder Fortschritt sortieren,
        ausstehende, laufende oder beendete Bücher filtern und jedes davon als
        beendet markieren. Tippe auf die Markierung „Beendet“ selbst, um sie zu
        entfernen; sie verschwindet auch von selbst, wenn du das Buch erneut öffnest,
        ohne den Fortschritt zu verlieren. Ein Buch bei 0 % zählt als ausstehend,
        selbst wenn es schon geöffnet wurde.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Cover</summary>
          <p>
        werden automatisch erstellt (das EPUB-Cover oder die erste PDF-Seite) und
        zeigen den Lesefortschritt jedes Buches. Das Suchfeld der Bibliothek filtert
        nach Dateiname, Titel, Autor, Format und weiteren verfügbaren Metadaten. Auf
        dem Handy zeigt ein langes Antippen eines abgeschnittenen Titels ihn
        vollständig an.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Buchzusammenfassung</summary>
          <p>
        wenn die Datei in ihren Metadaten eine Kurzbeschreibung enthält (die
        EPUB-Beschreibung oder das PDF-Thema), erscheint sie in einem kleinen Feld
        beim Überfahren der Karte, sowohl unter „Weiterlesen“ als auch in beiden
        Bibliotheken, sowie unter dem Titel im „⋯“-Menü, das ist der Weg dazu auf
        einem Touchscreen.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Beispielbuch</summary>
          <p>
        wenn die Bibliothek völlig leer ist, kannst du ein Beispielwerk in der
        Sprache der Oberfläche hinzufügen und öffnen. Danach verhält es sich wie
        jedes andere lokale Buch.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Ordner</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Ordner auf diesem Gerät</summary>
          <p>
        der Bereich „Auf diesem Gerät“ kann auch mit der Schaltfläche „Ordner mit
        Plus“ in Ordner gegliedert werden. Tippe auf einen Ordner, um ihn zu öffnen
        (der Pfad erscheint über der Liste, um zurückzugehen), benenne ihn um oder
        lösche ihn über sein „⋯“-Menü, und verschiebe ein Buch mit der Option „In
        einen anderen Ordner verschieben“ oder indem du es auf den Ordner ziehst.
        Ordner lassen sich ebenfalls verschieben: Nutze „Ordner verschieben“ oder
        ziehe sie auf einen anderen Ordner oder auf eine Station des Pfades, und
        alles darin reist mit. Ein Buch hier zu verschieben ändert sonst nichts:
        Seite, Lesezeichen und Anmerkungen bleiben erhalten. Neue Bücher landen im
        gerade geöffneten Ordner, und das Suchfeld findet sie weiterhin, egal wo sie
        sind.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ordner in der Cloud</summary>
          <p>
        der Bereich „In der Cloud“ zeigt die Unterordner deines Ordners und lässt
        dich hineingehen (der Pfad erscheint über der Liste, um zurückzugehen). Du
        kannst neue Ordner erstellen, sie umbenennen oder über ihr „⋯“-Menü löschen
        (das Löschen entfernt auch ihren Inhalt) und ein Buch von einem Ordner in
        einen anderen verschieben, mit der Verschieben-Schaltfläche oder indem du es
        auf einen Ordner in der Liste ziehst (oder auf eine Station des Pfades), wobei
        Fortschritt und Lesezeichen erhalten bleiben. Ordner lassen sich ebenfalls
        verschieben: Nutze „Ordner verschieben“ oder ziehe sie auf einen anderen
        Ordner oder auf eine Station des Pfades, und alles darin reist mit. Weder das
        Verschieben noch das Umbenennen kostet ihrem Inhalt etwas: Die Bücher darin
        behalten ihre Seite, ihre Lesezeichen, ihre Anmerkungen und ihre Notiz, und
        die Unterordner ebenso.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Einen ganzen Ordner herunterladen</summary>
          <p>
        das „⋯“-Menü jedes Ordners speichert ihn vollständig, mit seinen
        Unterordnern und allen enthaltenen Büchern. Auf Chrome, Edge und Opera für
        Desktop wählst du, wo er hinkommt, und er wird unverändert kopiert; bei
        anderen Browsern (Firefox, Safari, Mobilgeräte) wird er als einzelne
        ZIP-Datei heruntergeladen.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Zurückgehen</summary>
          <p>
        die Zurück-Schaltfläche (oder -Geste) des Browsers geht einen Ordner nach
        oben, statt PageKeeper zu verlassen: Von einem Unterordner aus geht es zum
        vorherigen, und von der Wurzel aus verlässt sie die Anwendung tatsächlich.
        Sie schließt auch das Lesegerät, die Hilfe oder die Einstellungen.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Verschieben, speichern und löschen</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>In die Cloud hochladen</summary>
          <p>
        ist eine Cloud eingerichtet, kopiert die Cloud-Schaltfläche jedes lokalen
        Buches es in deinen entfernten Ordner, wobei die aktuelle Seite erhalten
        bleibt; du kannst auch eine Datei mit dem „+“ hochladen oder sie in den
        Bereich „In der Cloud“ ziehen, und du kannst ein Buch von „Auf diesem Gerät“
        in die Cloud oder in einen ihrer Ordner ziehen. Alles wird in den gerade
        geöffneten Ordner hochgeladen.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Bücher zwischen Bibliotheken verschieben</summary>
          <p>
        ein Cloud-Buch kann mit „Auf diesem Gerät speichern“ auf dem Gerät
        gespeichert werden oder indem du es auf den lokalen Bereich (oder einen
        seiner Ordner) ziehst; und ein Gerätebuch geht mit seiner eigenen
        Schaltfläche in die Cloud oder indem du es auf „In der Cloud“ ziehst. In
        beiden Fällen handelt es sich um eine Kopie: Das Original bleibt an seinem
        Platz, und jede Bibliothek führt ihre eigene Leseposition.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Offline verfügbar</summary>
          <p>
        die Cloud-Schaltfläche mit Pfeil speichert eine verwaltete Kopie des
        entfernten Buches. Fällt das Netzwerk aus, zeigt PageKeeper sie an und öffnet
        sie automatisch. Die grüne Schaltfläche entfernt nur diese Kopie, ohne das
        Buch aus der Cloud zu löschen.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Herunterladen</summary>
          <p>
        die Download-Schaltfläche speichert eine Kopie der Datei (PDF oder EPUB)
        auf dem Gerät, egal ob sie aus der Cloud oder aus der lokalen Bibliothek
        kommt.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Löschen</summary>
          <p>
        der Papierkorb jedes Buches entfernt es (vom Server, wenn es ein
        Cloud-Buch ist, oder von diesem Gerät, wenn es lokal ist).</p>
        </details>
        <details class="punto-ayuda">
            <summary>Lesestatistiken</summary>
            <p>Die Diagramm-Schaltfläche in der Kopfzeile öffnet die Zeit, die du mit
          Lesen verbringst: die Gesamtzeit, die von heute und dieser Woche, wie viele
          Tage in Folge du dranbleibst, ein Balkendiagramm
          und die Bücher, denen du am meisten Zeit widmest —Bücher unter fünf Minuten
          erscheinen nicht in dieser Liste, damit sie nicht von denen gefüllt wird, die
          du nur geöffnet hast, um zu sehen, worum es geht; ihre Zeit zählt weiterhin in
          den Summen und in der Karte des Buches—. Diese Liste lässt sich nach aufgewendeter Zeit, nach zuletzt gelesen oder nach Titel sortieren, und jedes Buch öffnet seine Karte. Das Diagramm gruppiert nach
          <strong>Tagen, Wochen, Monaten oder Jahren</strong>, und darunter vergleicht es
          den laufenden Abschnitt mit dem vorigen: wie viel du diesen Monat gegenüber dem
          letzten gelesen hast, oder dieses Jahr gegenüber dem vorigen. Der schraffierte
          Balken ist der noch laufende Abschnitt. Die Tagesansicht reicht etwa dreizehn
          Monate zurück; die Summe jedes Monats bleibt für immer erhalten, sodass Monate
          und Jahre auch alt noch vergleichbar sind. Nur die Zeit mit dem Buch vor dir
          zählt: solange die App nicht zu sehen ist —ein anderer Tab, eine andere App,
          das gesperrte Handy— steht die Uhr still, ein offen gelassener Tab fügt also
          nichts hinzu. Pro Seite werden höchstens fünf Minuten gezählt; bleibst du
          länger auf derselben, weist die Fußzeile mit „Pausiert“ darauf hin, und beim
          Umblättern läuft die Uhr wieder.</p>
            <p>Wenn dir lieber wäre, dass nichts gemessen wird, gibt es ein Kästchen
          —„Lesezeit nicht messen“— unter <em>⚙️ Einstellungen → Daten</em> und am Fuß
          der Statistikseite selbst. Beim Ankreuzen wird gewarnt, dass alles bis dahin
          Erfasste gelöscht wird. Du kannst es jederzeit wieder einschalten: dann wird
          ab null gezählt. Die Entscheidung reist mit deinen übrigen Daten: bei Nutzung der Cloud hören deine anderen Geräte beim Synchronisieren auf zu messen.</p>
            <p>Bei eingerichteter Cloud summieren die Zahlen alle deine Geräte: Die
          Zeit jedes Buches trägt darunter die Aufteilung („dieses Gerät 2 Std. ·
          Chrome unter Linux 45 Min.“), sodass du weißt, wie lange du gebraucht hast,
          auch wenn du es auf jedem Gerät in Etappen gelesen hast, und ein Tag, an
          dem du auf zweien gelesen hast, zählt als ein einziger Tag der Serie. All
          das reist mit deiner Leseposition, auf deinem eigenen Server, und wird
          nirgendwohin sonst gesendet. Du kannst es jederzeit von genau diesem
          Bildschirm aus löschen — es wird auf allen Geräten gelöscht —, ohne deine
          Bücher oder deinen Fortschritt zu berühren.</p>
            <p>Für ein einzelnes Buch ist es noch griffbereiter: Während du liest,
          beginnt die untere Leiste mit der dafür aufgewendeten Zeit, und ein Tippen
          darauf öffnet seine Karte, mit dem Gelesenen, den Seiten, dem Tempo, dem,
          was noch fehlt, und der Aufteilung nach Geräten. Dieselbe Karte findet sich
          im „⋯“-Menü des Buches in der Bibliothek.</p>
          </details>
          <details class="punto-ayuda">
          <summary>Importieren und exportieren</summary>
          <p>
        die Ordnerschaltfläche mit Pfeil in der Kopfzeile öffnet einen Bildschirm,
        auf dem du Bücher hinzufügen und ZIP-Sicherungen herunterladen oder
        wiederherstellen kannst. Es gibt eine Sicherung für die Bücher „Auf diesem
        Gerät“ und eine weitere für die gesamte WebDAV-Bibliothek, einschließlich
        Unterordner. Beide bewahren Fortschritt, Lesezeichen und Anmerkungen; keine
        enthält dein Passwort. Um URL, Benutzername und App-Passwort separat zu
        speichern, nutze <em>Einstellungen → Konfiguration auf ein anderes Gerät
        übertragen</em>.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-lector" class="panel-pestana" role="tabpanel"
      aria-label="Lesegerät" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Die Seite betrachten</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Lesemodus</summary>
          <p>
        Seite für Seite (wie ein Buch) oder fortlaufende Seiten mit vertikalem
        Scrollen.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Umblättern</summary>
          <p>
        ziehe zur Seite, und die Seite folgt deinem Finger und zeigt, wohin es geht;
        überlegst du es dir auf halbem Weg anders, gleitet sie zurück an ihren Platz.
        Tippen auf den linken oder rechten Rand, oder die Pfeiltasten und die
        Leertaste, lassen die Seite denselben Weg von selbst zurücklegen, sodass man
        es auch am Computer sieht. Bei PDFs schaut die Nachbarseite wirklich herein.
        Oben und unten geht es auch: ein Tippen auf den unteren Teil oder ein Wischen
        nach oben blättert vor, der obere Teil oder ein Wischen nach unten zurück.
        Bei fortlaufenden Seiten oder beim Zoomen übernimmt das Scrollen, und es gibt
        keine Animation.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Textspalten</summary>
          <p>
        die Spaltenschaltfläche öffnet ein Menü: automatisch oder eine bis vier. Automatisch passen so viele hinein, wie ohne unbequem zu lesende Zeilen möglich sind; sie werden von selbst neu berechnet, wenn Sie das Gerät drehen oder die Schriftgröße ändern. Ihre Wahl gilt für dieses Buch und dieses Gerät. PDFs kommen fertig gesetzt an und bieten nur eine Seite oder zwei nebeneinander. Wann sie automatisch erscheinen, legen Sie in <em>⚙️ Einstellungen → Leser</em> fest, indem Sie die gewünschte Zeilenlänge angeben.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Seite drehen (nur PDF)</summary>
          <p>
        die Dreh-Schaltfläche dreht das Dokument bei jedem Tippen um 90°, praktisch
        für schiefe oder querformatige Scans. Die Drehung wird pro Buch auf diesem
        Gerät gemerkt.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Vollbild</summary>
          <p>
        ein Tippen in die Seitenmitte blendet die obere Leiste aus, um ohne
        Ablenkung zu lesen; ein weiteres Tippen holt sie zurück.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Anpassen und zoomen</summary>
          <p>
        die drei Zoom-Bedienelemente gehören zusammen: die beiden Lupen, die
        vergrößern und verkleinern, und dazwischen die Zoomstufe in Prozent. Tippen
        auf diese Zahl öffnet ein Bedienfeld mit „An Breite anpassen“, „Ganze Seite
        anpassen“, den am häufigsten genutzten Zoomstufen und einem Feld, in das du
        jede beliebige eingeben kannst (205 %, falls dir das zusagt). Bei PDFs ist
        der Prozentsatz der der Seite —100 % ist ihre natürliche Größe, sodass die
        Anpassung an die Breite jede Zahl ergeben kann— und bei EPUBs der des Textes.
        Beim Zoomen kannst du die Seite mit Maus oder Finger ziehen, und auf
        Touchscreens zum Vergrößern zwei Finger auseinanderziehen: Bei PDFs ändert
        das den Zoom, bei EPUBs die Textgröße.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Verbleibende Zeit</summary>
          <p>
        nach ein paar Minuten Lesen erscheint eine Schätzung der Zeit, die noch
        fehlt, um das Buch zu beenden, berechnet aus deinem tatsächlichen Tempo auf
        diesem Gerät.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Text und Farbe</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Texteinstellungen (nur EPUB)</summary>
          <p>
        die Schriftschaltfläche lässt dich die Schriftart wählen (die des Buches,
        Serifen- oder serifenlos), die Ausrichtung, den Zeilenabstand, den Rand auf
        beiden Seiten und ob Wörter am Zeilenende getrennt werden. Dieselben
        Einstellungen finden sich unter <em>⚙️ Einstellungen → Lesegerät</em>, um sie
        anzusehen und zu ändern, ohne ein Buch zu öffnen; beide Orte zeigen immer
        dasselbe. Die Silbentrennung ist standardmäßig aktiviert: Auf einem schmalen
        Bildschirm, und noch mehr bei Blocksatz, verhindert sie große Lücken
        zwischen Wörtern. Der Browser übernimmt das je nach Sprache des Buches, es
        ist also möglicherweise nicht für alle Sprachen verfügbar; man kann es auch
        so lassen, wie es in jedem Buch vorgesehen ist, oder nie trennen.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Papier des Buches</summary>
          <p>
        das Papier ist das Design der Anwendung: Es gibt nicht zwei Einstellungen,
        die aufeinander abgestimmt werden müssen. Die Design-Schaltfläche in der
        Kopfzeile der Bibliothek öffnet ein Menü mit fünf Optionen —Systemvorgabe, Hell,
        Sepia (warm, entspannter für lange Sitzungen), Dunkel und Schwarz (reines
        Schwarz, für OLED-Bildschirme)— und ändert
        gleichzeitig die Buchseite und alles andere. Bei EPUBs ändern sich die
        Textfarben, sodass Illustrationen unangetastet bleiben; bei PDFs, die
        bereits gezeichnete Bilder sind, wird die ganze Seite eingefärbt.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Bilder mit den dunklen Designs (nur PDF)</summary>
          <p>
        beim Invertieren der Seite werden Fotos und Logos zu Negativen. Die
        Bild-Schaltfläche, die in der Leseleiste erscheint, wenn du ein PDF mit
        dunklem oder schwarzem Design liest, gibt ihnen ihre Farbe zurück. Sie wird von Buch zu
        Buch gemerkt. Gescannte Seiten bleiben unangetastet: Dort ist das ganze
        Blatt ein Bild, und ihm die Farbe zurückzugeben würde das Papier weiß
        lassen, genau das, was man nachts vermeiden möchte.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Sich im Buch bewegen</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Zu einer Stelle springen</summary>
          <p>
        tippe auf die Seitenanzeige (oder den Prozentsatz bei EPUBs), um direkt
        dorthin zu springen.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Inhaltsverzeichnis und Miniaturansichten</summary>
          <p>
        die Panel-Schaltfläche öffnet das, was das Buch mitbringt, und ihre
        Beschriftung sagt, was: das Inhaltsverzeichnis, die Seitenminiaturen oder
        beides. Beim Öffnen wird das Kapitel, in dem du dich befindest, hervorgehoben
        und sichtbar angezeigt, ohne dass du danach suchen musst. Auf einem breiten
        Bildschirm bleibt die Seitenleiste von Buch zu Buch geöffnet, bis du sie
        selbst schließt.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Lesezeichen</summary>
          <p>
        die Lesezeichen-Schaltfläche speichert die aktuelle Position, um jederzeit
        dorthin zurückzukehren. Du kannst ihr einen Namen geben und ihn später
        ändern. Bei Cloud-Büchern synchronisieren sich Lesezeichen zusammen mit der
        Leseposition zwischen Geräten.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Nach einem Sprung zurückkehren</summary>
          <p>
        nach der Nutzung des Inhaltsverzeichnisses, der Suche oder des
        Positionswählers erscheinen Schaltflächen, um zurückzugehen oder wieder
        vorwärtszugehen. Auf dem Handy sitzen sie zu beiden Seiten der Seiten- oder
        Prozentanzeige.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Im Buch suchen</summary>
          <p>
        die Lupe findet Wörter oder Sätze, bringt dich genau zur richtigen Stelle
        und lässt sie einige Sekunden lang hervorgehoben, damit du sie auf einen
        Blick erkennst.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Anmerken und zuhören</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Markierungen und Notizen</summary>
          <p>
        wähle Text in einem PDF oder EPUB aus und wähle eine Markierungsfarbe (Gelb,
        Grün, Blau oder Pink) oder füge eine Notiz hinzu. Die Farbe kann später beim
        Bearbeiten der Anmerkung geändert werden. Die Textmarker-Schaltfläche zeigt
        alle Anmerkungen des Buches an. Bei Cloud-Büchern synchronisieren sie sich
        auch, wenn du offline arbeitest.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Anmerkungen exportieren</summary>
          <p>
        die Download-Schaltfläche im Anmerkungsfenster speichert alle Markierungen
        und Notizen des Buches in einer Markdown-Datei (.md), mit ihrer Seite oder
        Position, bereit für deine Notizen oder für Anwendungen wie Obsidian.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Vorlesen</summary>
          <p>
        die Lautsprecher-Schaltfläche liest das Buch mit der Stimme des Browsers vor
        und beginnt auf der aktuellen Seite. Der gerade vorgelesene Satz wird
        fortlaufend hervorgehoben, damit du ihm mit den Augen folgen kannst, und die
        Seite blättert von selbst weiter, sobald die Stimme das Ende dessen
        erreicht, was auf dem Bildschirm zu sehen ist, sodass du auch mitlesen
        kannst. Bei EPUBs, wenn ein Satz auf einer Seite beginnt und auf der
        nächsten endet, wechselt die Seite mitten im Satz, ungefähr dort, wo sich
        die Stimme gerade befindet, damit du nicht auf ein Bruchstück starrst,
        während der Rest vorgelesen wird. Das Fenster tritt beim Beginn des
        Vorlesens zurück, um den Text nicht zu verdecken: Während es läuft,
        ermöglicht eine kleine Steuerung unten das Pausieren, Fortsetzen und
        Anhalten, und auf einem breiten Bildschirm pausiert und setzt die
        Lautsprecher-Schaltfläche selbst fort. Beim Fortsetzen wird der
        unterbrochene Satz von vorn erneut vorgelesen. Die Einstellungen (Stimme und
        Geschwindigkeit) öffnen sich erneut über das „⋯“-Menü. Manuelles Umblättern
        stoppt das Vorlesen. Bei gescannten PDFs ohne Text funktioniert es nicht.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Drucken und als PDF speichern</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Ein EPUB aufs Papier bringen</summary>
          <p>
        die Druckerschaltfläche (oder „Drucken oder als PDF speichern“ im Menü „⋯“) setzt das Buch für Papierseiten und öffnet den Druckdialog des Browsers, in dem du den Drucker oder „Als PDF speichern“ wählen kannst. Du wählst das Papierformat (A4 oder Letter), die Ränder und die Schriftgröße; jedes Kapitel beginnt auf einer neuen Seite, und das Buch behält sein Layout und seine Illustrationen. Die Einstellungen werden für das nächste Mal gemerkt. Bei PDFs erscheint sie nicht: die druckt man, indem man sie herunterlädt.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Nur ein Kapitel drucken</summary>
          <p>
        in der Liste des Dialogs sind alle Kapitel angehakt. Nimm bei denen das Häkchen weg, die du nicht willst – oder drücke „Keine“ und wähle nur eines –, und aufs Papier kommen nur diese. Ein ganzes Buch in A4 sind viele Blätter.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Markierungen und Notizen auf dem Papier</summary>
          <p>
        hat das Buch Anmerkungen, nimmt ein Kontrollkästchen sie mit: die Stellen erscheinen in ihrer Farbe, und jede Notiz wird mit ihrer Ziffer am Ende ihres Kapitels gesammelt, neben der Stelle, die sie kommentiert. Ohne Häkchen wird der Text sauber gedruckt.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Über PDFs</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>PDF-Text und -Links</summary>
          <p>
        du kannst Text auswählen und kopieren, und die eigenen Links des PDFs
        funktionieren: interne (Inhaltsverzeichnis, Verweise) springen zu ihrer
        Seite, und externe öffnen sich in einem anderen Tab.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Geschützte PDFs</summary>
          <p>
        ist ein PDF verschlüsselt, fragt PageKeeper nach dem Passwort, um es zu
        öffnen. Das Passwort wird nicht gespeichert.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-nube" class="panel-pestana" role="tabpanel"
      aria-label="Cloud" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Was ist WebDAV?</h2>
        <p>Es ist eine standardisierte Möglichkeit, über das Internet auf Dateien
        zuzugreifen, die auf einem Server gespeichert sind, so als wäre es ein
        entfernter Ordner. PageKeeper nutzt es, um deine Bücher zu lesen und deine
        Leseposition in deiner eigenen Cloud zu speichern, damit du von einem
        anderen Gerät aus weitermachen kannst.</p>
      </div>

      <div class="tarjeta importante">
        <h2>⚠️ Wichtig: nicht jede Cloud funktioniert</h2>
        <p>Das Lesegerät läuft im Browser, und aus Sicherheitsgründen erlaubt dieser
        eine Verbindung zu einem Server nur, wenn dieser Server das ausdrücklich
        gestattet (eine technische Regel namens <em>CORS</em>). Das schließt fast
        alle kommerziellen Dienste aus:</p>
        <ul class="lista-ayuda">
          <li><strong>Google Drive, Dropbox, OneDrive:</strong> ungeeignet; sie
          bieten kein so nutzbares WebDAV an.</li>
          <li><strong>Koofr, pCloud, Yandex und Ähnliche:</strong> sie haben zwar
          WebDAV, blockieren aber den Zugriff von Webseiten aus, und du kannst
          das nicht ändern, weil der Server nicht dir gehört.</li>
          <li><strong>Nextcloud oder ownCloud mit aktivierter Berechtigung:</strong>
          in der Praxis die einzige Option, die zum Synchronisieren funktioniert.</li>
        </ul>
      </div>

      <details class="tarjeta tarjeta-plegable">
        <summary>Ich habe keinen eigenen Server (der übliche Fall)</summary>
        <p>Kaum jemand hat einen eigenen Server, und das ist völlig in Ordnung. Du
        hast zwei Möglichkeiten:</p>
        <ul class="lista-ayuda">
          <li><strong>Jemand gibt dir Zugriff auf sein Nextcloud</strong> (ein
          Verwandter, deine Schule, dein Team bei der Arbeit…). Bitte um drei
          Dinge: die <em>URL deines WebDAV-Ordners</em>, deinen
          <em>Benutzernamen</em> und ein <em>App-Passwort</em>. Damit
          synchronisierst du bereits zwischen Geräten, ohne selbst etwas
          einzurichten.</li>
          <li><strong>Niemand gibt dir Zugriff:</strong> Füge deine Bücher mit
          dem „+“ unter „Auf diesem Gerät“ hinzu. Das Lesen funktioniert genauso
          gut; du verlierst nur die automatische Synchronisierung zwischen
          Geräten.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Ich habe oder verwalte Nextcloud / ownCloud</summary>
        <p>Damit sich PageKeeper verbinden kann:</p>
        <ul class="lista-ayuda">
          <li>Installiere die App <strong>WebAppPassword</strong> und füge die
          Domain dieses Readers (<code id="ayuda-dominio">diese Seite</code>) zu
          den erlaubten Ursprüngen hinzu.</li>
          <li>Erstelle ein <strong>App-Passwort</strong> (Einstellungen →
          Sicherheit). Verwende nicht dein Hauptpasswort.</li>
          <li>Trage in den <strong>⚙️ Einstellungen</strong> dieses Readers die
          URL deines Ordners ein (zum Beispiel
          <code>https://deine-cloud.de/remote.php/dav/files/BENUTZER/Bücher</code>),
          deinen Benutzernamen und dieses Passwort.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Konfiguration auf ein anderes Gerät übertragen</summary>
        <p>Sobald deine Cloud eingerichtet ist, gibt dir <strong>⚙️ Einstellungen →
        „Konfigurationslink kopieren“</strong> einen Link, der alles enthält (URL,
        Benutzername und Passwort). Öffne ihn auf einem anderen Gerät, und es ist
        sofort eingerichtet. Teile ihn nur über private Kanäle und lösche ihn nach
        Gebrauch.</p>
      </details>

      <details class="tarjeta tarjeta-plegable destacado">
        <summary>🤖 Kommst du bei der Einrichtung nicht weiter? Frag eine KI</summary>
        <p>Einen Server einzurichten erfordert etwas Aufwand, aber eine künstliche
        Intelligenz (ChatGPT, Claude, Gemini…) kann dich Schritt für Schritt
        anleiten. Kopiere und füge Fragen wie diese ein:</p>
        <ul class="lista-ayuda">
          <li>„Ich habe einen Nextcloud-Server. Wie installiere ich die App
          <em>WebAppPassword</em> und erlaube WebDAV-Zugriff von einer auf
          <code id="ayuda-dominio-ia">diese Seite</code> gehosteten Website?“</li>
          <li>„Wie erstelle ich ein App-Passwort in Nextcloud?“</li>
          <li>„Erlaubt der Cloud-Dienst <em>[Name]</em> WebDAV-Zugriff aus dem
          Browser (CORS) für eine externe Website?“</li>
        </ul>
      </details>
      </div>

    <div id="panel-ayuda-privacidad" class="panel-pestana" role="tabpanel"
      aria-label="Datenschutz" tabindex="0" hidden>
<div class="tarjeta"><h2>Datenschutz</h2><p>Es gibt keinen zwischengeschalteten Server: Dein Browser verbindet sich direkt mit deiner Cloud. URL, Benutzername und Passwort werden nur in diesem Browser gespeichert.</p></div>
    </div>
  `,

  pt: `
    <div class="pestanas" data-grupo="ayuda" role="tablist"
      aria-label="Secções da ajuda">
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-empezar" data-panel="empezar"
        aria-selected="true">Primeiros passos</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-biblioteca" data-panel="biblioteca"
        aria-selected="false" tabindex="-1">Biblioteca</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-lector" data-panel="lector"
        aria-selected="false" tabindex="-1">Leitor</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-nube" data-panel="nube"
        aria-selected="false" tabindex="-1">Nuvem</button>
      <button type="button" class="pestana" role="tab"
        aria-controls="panel-ayuda-privacidad" data-panel="privacidad"
        aria-selected="false" tabindex="-1">Privacidade</button>
    </div>

    <div id="panel-ayuda-empezar" class="panel-pestana" role="tabpanel"
      aria-label="Primeiros passos" tabindex="0">
<div class="tarjeta"><h2>O que faz o PageKeeper?</h2><p>Lê livros PDF e EPUB, incluindo fórmulas matemáticas, num telemóvel, tablet ou computador, e memoriza a sua posição de leitura.</p><ul class="lista-ayuda"><li><strong>Adicionar um livro a partir do seu dispositivo (botão «+»):</strong> funciona
        de imediato, sem contas nem configurações. O livro é guardado na biblioteca
        desse navegador e lembra-se de onde ficou. O único senão: tudo fica apenas
        nesse dispositivo. Também pode arrastar um ou vários PDF ou EPUB para a
        secção local.</li><li><strong>Adicionar uma pasta inteira:</strong> o botão de pasta com a seta (e arrastar uma pasta para a secção) copia todos os PDF e EPUB que contém, incluindo subpastas, e recria a mesma estrutura na sua biblioteca. Funciona da mesma forma com a nuvem, onde as pastas são criadas no servidor.</li><li><strong>Ligar a uma nuvem (WebDAV):</strong> os seus livros e a sua
        posição de leitura sincronizam-se em todos os seus dispositivos. É
        necessária primeiro alguma configuração, explicada mais abaixo.</li></ul></div>

<div class="tarjeta"><h2>Claro, sépia, escuro e preto</h2><p>O botão de tema no cabeçalho abre um menu com cinco opções: <strong>o do sistema</strong> (círculo meio claro meio escuro), <strong>claro</strong> (sol), <strong>sépia</strong> (chávena), <strong>escuro</strong> (lua) e <strong>preto</strong> (lua com estrela). O ícone do botão indica em qual está, e a sua escolha é memorizada nesse navegador. Começa no tema do sistema, para que a aplicação siga o resto do dispositivo.</p><p class="ayuda">O tema é também o papel em que lê: o claro é papel branco, o sépia o tom quente dos leitores de tinta eletrónica, o escuro o modo noturno da página e o preto esse mesmo modo noturno levado ao preto puro, que nos ecrãs OLED apaga o píxel e gasta menos bateria.</p><p class="ayuda">Com «o do sistema» pode decidir para que tema vai cada lado: sépia em vez de claro de dia, ou preto em vez de escuro à noite. Escolhe-se em <em>⚙️ Definições → Biblioteca</em>, com uma amostra de cada um para os ver sem mudar o tema do dispositivo.</p></div>
    </div>

    <div id="panel-ayuda-biblioteca" class="panel-pestana" role="tabpanel"
      aria-label="Biblioteca" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Os seus livros num relance</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Continuar a ler</summary>
          <p>
        a sua leitura mais recente fica no topo. Num ecrã largo, as leituras
        recentes aparecem todas juntas como cartões com uma capa grande e o título
        completo; num ecrã estreito, desdobram-se sob «Ver mais». Pode remover as
        que já não quer ver; em <em>⚙️ Definições → Biblioteca</em> escolhe
        quantas mostrar e pode desligar a caixa por completo, se preferir ir
        diretamente aos seus livros. Só aparece no ecrã inicial: entrar numa pasta
        retira-a para dar lugar ao que contém. Um livro removido volta a aparecer
        quando o reabre. Os livros concluídos e os ficheiros que já não existem
        ficam fora desta lista. A caixa no final do quadro faz com que o PageKeeper abra
        diretamente na sua última leitura, sem passar pela biblioteca; só vale para este
        dispositivo, pelo que a pode ter ligada no telemóvel e desligada no
        computador. O menu «⋯» de cada cartão oferece as mesmas ações
        que a biblioteca (mudar o nome, mover, enviar ou guardar, offline,
        eliminar…), para nunca ter de percorrer a lista à procura do livro sobre o
        qual quer agir.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ordem e estados</summary>
          <p>
        pode ordenar por leitura recente, título, autor ou progresso, filtrar os
        livros pendentes, em leitura ou concluídos, e marcar qualquer um deles como
        concluído. Toque na própria etiqueta «Concluído» para a remover; também
        desaparece sozinha se reabrir o livro, sem perder o progresso. Um livro a
        0 % conta como pendente mesmo que já tenha sido aberto.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Capas</summary>
          <p>
        são criadas automaticamente (a capa do EPUB ou a primeira página do PDF) e
        mostram o progresso de leitura de cada livro. A caixa de pesquisa da
        biblioteca filtra por nome de ficheiro, título, autor, formato e outros
        metadados disponíveis. No telemóvel, uma pressão longa num título truncado
        mostra-o por inteiro.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Resumo do livro</summary>
          <p>
        se o ficheiro trouxer uma sinopse nos seus metadados (a descrição do EPUB
        ou o assunto do PDF), aparece numa pequena caixa ao passar o rato por cima
        do cartão, tanto em «Continuar a ler» como em qualquer das bibliotecas, e
        também sob o título no menu «⋯», que é como se lê num ecrã tátil.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Livro de exemplo</summary>
          <p>
        quando a biblioteca está completamente vazia, pode adicionar e abrir uma
        obra de exemplo no idioma da interface. Depois comporta-se como qualquer
        outro livro local.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Pastas</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Pastas neste dispositivo</summary>
          <p>
        a secção «Neste dispositivo» também pode ser organizada em pastas com o
        botão de pasta com mais. Toque numa pasta para a abrir (o caminho aparece
        acima da lista para poder voltar), mude o nome ou elimine-a a partir do seu
        menu «⋯», e mova um livro com a opção «Mover para outra pasta» ou
        arrastando-o para a pasta. As pastas também se movem: use «Mover a pasta»
        ou arraste-as para outra pasta ou para um ponto do caminho, e tudo o que
        contêm viaja com elas. Mover um livro aqui não altera mais nada: mantém a
        sua página, os seus marcadores e as suas anotações. Os livros novos chegam
        à pasta que tenha aberta, e a caixa de pesquisa continua a encontrá-los
        onde quer que estejam.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Pastas na nuvem</summary>
          <p>
        a secção «Na nuvem» mostra as subpastas da sua pasta e permite entrar
        nelas (o caminho aparece acima da lista para poder voltar). Pode criar
        pastas novas, mudar-lhes o nome ou eliminá-las a partir do seu menu «⋯»
        (eliminar uma também remove o seu conteúdo) e mover um livro de uma pasta
        para outra com o seu botão de mover ou arrastando-o para uma pasta da
        lista (ou para um ponto do caminho), mantendo o progresso e os
        marcadores. As pastas também se movem: use «Mover a pasta» ou arraste-as
        para outra pasta ou para um ponto do caminho, e tudo o que contêm viaja
        com elas. Nem mover nem mudar o nome custa nada ao que contêm: os livros
        lá dentro mantêm a sua página, os seus marcadores, as suas anotações e a
        sua nota, e as subpastas do mesmo modo.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Transferir uma pasta inteira</summary>
          <p>
        o menu «⋯» de cada pasta guarda-a completa, com as suas subpastas e todos
        os livros que contém. No Chrome, Edge e Opera de computador, escolhe onde
        a colocar e é copiada tal como está; nos restantes navegadores (Firefox,
        Safari, telemóvel) é transferida como um único ficheiro ZIP.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Voltar atrás</summary>
          <p>
        o botão (ou o gesto) de voltar atrás do navegador sobe uma pasta em vez
        de sair do PageKeeper: de uma subpasta vai para a anterior, e a partir da
        raiz sai mesmo. Fecha também o leitor, a ajuda ou as definições.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Mover, guardar e eliminar</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Enviar para a nuvem</summary>
          <p>
        com uma nuvem configurada, o botão de nuvem de cada livro local copia-o
        para a sua pasta remota mantendo a página em que vai; também pode enviar
        um ficheiro com o «+» ou arrastá-lo para a secção «Na nuvem», e pode
        arrastar um livro de «Neste dispositivo» para a nuvem ou para uma das
        suas pastas. Tudo é enviado para a pasta que tenha aberta.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Mover livros entre bibliotecas</summary>
          <p>
        um livro da nuvem pode ser guardado no dispositivo com «Guardar neste
        dispositivo» ou arrastando-o para a secção local (ou uma das suas
        pastas); e um livro do dispositivo sobe com o seu próprio botão ou
        arrastando-o para «Na nuvem». Em ambos os casos trata-se de uma cópia: o
        original fica no seu lugar e cada biblioteca guarda a sua própria posição
        de leitura.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Disponível offline</summary>
          <p>
        o botão de nuvem com seta guarda uma cópia gerida do livro remoto. Se a
        rede falhar, o PageKeeper mostra-a e abre-a automaticamente. O botão verde
        remove apenas essa cópia sem eliminar o livro da nuvem.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Transferir</summary>
          <p>
        o botão de transferência guarda uma cópia do ficheiro (PDF ou EPUB) no
        dispositivo, venha ele da nuvem ou da biblioteca local.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Eliminar</summary>
          <p>
        o caixote do lixo de cada livro elimina-o (do servidor, se for um livro
        da nuvem, ou deste dispositivo, se for local).</p>
        </details>
        <details class="punto-ayuda">
            <summary>Estatísticas de leitura</summary>
            <p>O botão do gráfico no cabeçalho abre o tempo que dedica a ler: o
          total, o de hoje e o desta semana, quantos dias seguidos leva, um
          gráfico de barras e os livros a que dedica
          mais tempo —os de menos de cinco minutos não aparecem nessa lista, para que não seja preenchida pelos que abriu só para ver do que se tratava; o seu tempo continua a contar nos totais e na ficha do livro—. Essa lista pode ordenar-se por tempo dedicado, por última leitura ou por título, e cada livro abre a sua ficha. O gráfico agrupa-se por <strong>dias, semanas, meses ou
          anos</strong>, e por baixo compara o troço em curso com o anterior: quanto leva
          este mês face ao passado, ou este ano face ao outro. A barra às riscas é a do
          troço que ainda vai a meio. O detalhe por dias chega até cerca de treze meses
          atrás; o total de cada mês guarda-se para sempre, por isso os meses e os anos
          podem comparar-se por mais antigos que sejam. Só conta o tempo com o livro à frente: enquanto a
          aplicação não está à vista —outro separador, outra aplicação, o telemóvel
          bloqueado— o relógio para, por isso deixá-la aberta não soma nada. De cada
          página contam-se no máximo cinco minutos; se ficar mais tempo na mesma, a
          barra do fundo avisa com um «Em pausa» e o relógio volta a correr assim que
          mudar de página.</p>
            <p>Se prefere que nada seja medido, há uma caixa —«Não medir o tempo de
          leitura»— em <em>⚙️ Definições → Dados</em> e no fim do próprio ecrã de
          estatísticas. Ao marcá-la avisa-se de que será eliminado o que estiver
          registado até então. Pode voltar a ativá-la quando quiser: a contagem
          recomeça do zero. A decisão viaja com o resto dos seus dados: se usa a nuvem, os seus outros dispositivos deixam de medir assim que sincronizam.</p>
            <p>Com uma nuvem configurada, os números somam todos os seus
          dispositivos: o tempo de cada livro traz por baixo a repartição
          («este dispositivo 2 h · Chrome no Linux 45 min»), para saber quanto
          tempo demorou a lê-lo mesmo que o tenha lido aos poucos em cada
          aparelho, e um dia em que tenha lido em dois deles conta como um só
          dia da sequência. Tudo isto viaja com a sua posição de leitura, no seu
          próprio servidor, e nunca é enviado para mais lado nenhum. Pode
          eliminá-las quando quiser a partir deste mesmo ecrã — são eliminadas
          em todos os dispositivos — sem tocar nos seus livros nem no seu
          progresso.</p>
            <p>Para um único livro está ainda mais à mão: enquanto lê, a barra
          inferior começa com o tempo que já lhe dedicou, e ao tocar nela abre-se
          o seu cartão, com o que já leu, as páginas, o ritmo, o que falta e a
          repartição por dispositivos. O mesmo cartão está no menu «⋯» do livro,
          na biblioteca.</p>
          </details>
          <details class="punto-ayuda">
          <summary>Importar e exportar</summary>
          <p>
        o botão de pasta com seta no cabeçalho abre um ecrã onde pode adicionar
        livros e transferir ou restaurar cópias ZIP. Há uma cópia para os livros
        «Neste dispositivo» e outra para toda a biblioteca WebDAV, incluindo
        subpastas. Ambas mantêm o progresso, os marcadores e as anotações; nenhuma
        contém a sua palavra-passe. Para guardar o URL, o utilizador e a
        palavra-passe de aplicação em separado, use <em>Definições → Levar a
        configuração para outro dispositivo</em>.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-lector" class="panel-pestana" role="tabpanel"
      aria-label="Leitor" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>Ver a página</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Modo de leitura</summary>
          <p>
        página a página (como um livro) ou páginas contínuas com deslocamento
        vertical.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Passar de página</summary>
          <p>
        arraste para os lados e a página acompanha o dedo, mostrando para onde
        vai; se mudar de ideias a meio caminho, volta a deslizar para o seu
        lugar. Tocar nas margens esquerda e direita, ou usar as setas e a barra
        de espaço, faz a página percorrer sozinha esse mesmo caminho, para se ver
        também num computador. Nos PDF, a página vizinha espreita mesmo. Também
        serve por cima e por baixo: tocar na parte baixa ou deslizar o dedo para
        cima avança, e a parte alta ou o dedo para baixo recua. Com páginas
        contínuas, ou com zoom, é o deslocamento que manda e não há animação.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Colunas de texto</summary>
          <p>
        o botão das colunas abre um menu: automáticas, ou de uma a quatro. No automático cabem as que couberem sem que as linhas fiquem incómodas de ler, e refazem-se sozinhas ao girar o aparelho ou ao mudar o tamanho da letra. O que escolher é desse livro e deste dispositivo. Nos PDF, que chegam maquetados, só se pode ver uma página ou duas juntas. Quando aparecem no automático decide em <em>⚙️ Definições → Leitor</em>, dizendo de quantas letras quer as linhas.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Rodar a página (só PDF)</summary>
          <p>
        o botão de rodar faz o documento girar 90° a cada toque, útil para
        digitalizações tortas ou em formato paisagem. A rotação é memorizada por
        livro neste dispositivo.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ecrã inteiro</summary>
          <p>
        um toque no centro da página esconde a barra superior para ler sem
        distrações; outro toque traz-a de volta.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Ajustar e ampliar</summary>
          <p>
        os três controlos de zoom estão juntos: as duas lupas, que ampliam e
        reduzem, e o nível de zoom em percentagem entre elas. Tocar nesse número
        abre um painel com «Ajustar à largura», «Ajustar a página inteira», os
        níveis de zoom mais usados e uma caixa onde escrever qualquer outro
        (205 %, se for isso que lhe convém). Nos PDF, a percentagem é a da
        página —100 % é o seu tamanho natural, pelo que ajustá-la à largura pode
        dar qualquer valor— e nos EPUB é a do texto. Com zoom, pode arrastar a
        página com o rato ou o dedo, e nos ecrãs táteis fazer o gesto de
        beliscar para ampliar: nos PDF muda o zoom, nos EPUB o tamanho do
        texto.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Tempo restante</summary>
          <p>
        depois de uns minutos de leitura, aparece uma estimativa do tempo que
        falta para terminar o livro, calculada a partir do seu ritmo real neste
        dispositivo.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Texto e cor</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Definições de texto (só EPUB)</summary>
          <p>
        o botão da letra permite escolher o tipo de letra (a do livro, com ou
        sem serifa), o alinhamento, a entrelinha, a margem em ambos os lados e
        se as palavras se dividem no final da linha. As mesmas definições estão
        em <em>⚙️ Definições → Leitor</em>, para as ver e alterar sem abrir
        nenhum livro; os dois locais mostram sempre o mesmo. A divisão de
        palavras vem ativada por predefinição: num ecrã estreito, e ainda mais
        com o texto justificado, é o que evita grandes espaços entre palavras.
        O navegador faz isso segundo o idioma do livro, pelo que pode não estar
        disponível para todos os idiomas; também pode deixá-la como vier em
        cada livro, ou nunca dividir.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Papel do livro</summary>
          <p>
        o papel é o tema da aplicação: não há dois ajustes para fazer coincidir.
        O botão de tema, no cabeçalho da biblioteca, abre um menu com cinco
        opções —o do sistema, claro, sépia (quente, mais repousante em sessões
        longas), escuro e preto (preto puro, para ecrãs OLED)— e muda ao mesmo
        tempo a página do livro e tudo o resto. Nos
        EPUB mudam as cores do texto, para que as ilustrações fiquem intactas;
        nos PDF, que já são imagens desenhadas, tinge-se a página inteira.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Imagens com os temas escuros (só PDF)</summary>
          <p>
        ao inverter a página, as fotos e os logótipos ficam em negativo. O
        botão de imagem, que aparece na barra do leitor ao ler um PDF com o
        tema escuro ou o preto, devolve-lhes a cor. É memorizado de um livro para outro.
        As páginas digitalizadas não são tocadas: aí a folha inteira é uma
        imagem e devolver-lhe a cor deixaria o papel em branco, que é
        precisamente o que se quer evitar à noite.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Mover-se pelo livro</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Ir para um ponto</summary>
          <p>
        toque no indicador de página (ou na percentagem nos EPUB) para saltar
        diretamente para lá.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Índice e miniaturas</summary>
          <p>
        o botão de painel abre o que o livro trouxer, e a sua etiqueta diz qual
        é: o índice, as miniaturas das páginas ou ambos. Ao abri-lo, o capítulo
        em que vai fica realçado e à vista, sem ter de o procurar. Num ecrã
        largo, o painel lateral fica aberto de um livro para outro até o
        fechar.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Marcadores</summary>
          <p>
        o botão de marcador guarda a posição atual para voltar a ela quando
        quiser. Pode dar-lhe um nome e alterá-lo mais tarde. Nos livros da
        nuvem, os marcadores sincronizam-se entre dispositivos juntamente com
        a posição de leitura.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Voltar após um salto</summary>
          <p>
        depois de usar o índice, a pesquisa ou o seletor de posição, aparecem
        botões para voltar atrás ou avançar de novo. No telemóvel ficam
        colocados de ambos os lados do indicador de página ou percentagem.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Pesquisar dentro do livro</summary>
          <p>
        a lupa encontra palavras ou frases, leva-o ao ponto exato e deixa-o
        realçado durante alguns segundos para o localizar num relance.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Anotar e ouvir</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Realces e notas</summary>
          <p>
        selecione texto num PDF ou EPUB e escolha uma cor de realce (amarelo,
        verde, azul ou rosa) ou adicione uma nota. A cor pode ser alterada mais
        tarde ao editar a anotação. O botão do marca-texto mostra todas as
        anotações do livro. Nos livros da nuvem sincronizam-se mesmo a
        trabalhar offline.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Exportar anotações</summary>
          <p>
        o botão de transferência no painel de anotações guarda todos os
        realces e notas do livro num ficheiro Markdown (.md), com a sua página
        ou posição, pronto para os seus apontamentos ou para aplicações como o
        Obsidian.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Leitura em voz alta</summary>
          <p>
        o botão do altifalante lê o livro com a voz do navegador, começando na
        página atual. A frase que está a soar vai sendo realçada para a poder
        acompanhar com os olhos, e a página avança sozinha quando a voz chega ao
        fim do que está no ecrã, para também poder ler ao mesmo tempo. Nos
        EPUB, quando uma frase começa numa página e termina na seguinte, a
        página muda a meio da frase, mais ou menos onde vai a voz, para não o
        deixar a olhar para um fragmento enquanto soa o resto. O painel
        afasta-se ao começar a leitura para não tapar o texto: enquanto soa,
        um pequeno controlo em baixo permite pausar, continuar e parar, e num
        ecrã largo o próprio botão do altifalante pausa e continua. Ao
        continuar, a frase interrompida é lida novamente desde o início. As
        definições (voz e velocidade) voltam a abrir-se a partir do menu «⋯».
        Passar de página à mão para a leitura. Não funciona em PDF
        digitalizados sem texto.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Imprimir e guardar em PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Levar um EPUB ao papel</summary>
          <p>
        o botão da impressora (ou «Imprimir ou guardar em PDF» no menu «⋯») compõe o livro para folhas de papel e abre a caixa de impressão do navegador, onde podes escolher a impressora ou «Guardar como PDF». Escolhe-se o tamanho da folha (A4 ou Carta), as margens e o corpo de letra; cada capítulo começa em folha nova e o livro conserva a sua paginação e as suas ilustrações. Os ajustes ficam memorizados para a próxima vez. Nos PDF não aparece: esses imprimem-se descarregando-os.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Imprimir só um capítulo</summary>
          <p>
        a lista da caixa traz todos os capítulos marcados. Desmarca os que não quiseres —ou carrega em «Nenhum» e escolhe só um— e o papel levará apenas esses. Um livro inteiro em A4 são muitas folhas.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Sublinhados e notas no papel</summary>
          <p>
        se o livro tiver anotações, uma caixa permite levá-las: as passagens saem com a sua cor e cada nota, com a sua chamada, é recolhida no fim do seu capítulo junto ao trecho que comenta. Desmarcada, imprime-se o texto limpo.</p>
        </details>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Sobre os PDF</h2>
        <div class="puntos-ayuda">
        <details class="punto-ayuda">
          <summary>Texto e hiperligações do PDF</summary>
          <p>
        pode selecionar e copiar texto, e as hiperligações próprias do PDF
        funcionam: as internas (índice, referências) saltam para a sua página
        e as externas abrem-se noutro separador.</p>
        </details>
        <details class="punto-ayuda">
          <summary>PDF protegidos</summary>
          <p>
        se um PDF estiver cifrado, o PageKeeper pede a palavra-passe para o
        abrir. A palavra-passe não é guardada.</p>
        </details>
        </div>
      </div>
      </div>

    <div id="panel-ayuda-nube" class="panel-pestana" role="tabpanel"
      aria-label="Nuvem" tabindex="0" hidden>
      <div class="tarjeta">
        <h2>O que é o WebDAV?</h2>
        <p>É uma forma padronizada de aceder a ficheiros guardados num servidor
        através da internet, como se fosse uma pasta remota. O PageKeeper usa-o
        para ler os seus livros e para guardar a sua posição de leitura na sua
        própria nuvem, para poder continuar a partir de outro dispositivo.</p>
      </div>

      <div class="tarjeta importante">
        <h2>⚠️ Importante: nem toda a nuvem serve</h2>
        <p>O leitor é executado dentro do navegador e, por segurança, este só
        permite uma ligação a um servidor se esse servidor a autorizar
        expressamente (uma regra técnica chamada <em>CORS</em>). Isso exclui
        quase todos os serviços comerciais:</p>
        <ul class="lista-ayuda">
          <li><strong>Google Drive, Dropbox, OneDrive:</strong> não servem;
          não oferecem um WebDAV que possa ser usado desta forma.</li>
          <li><strong>Koofr, pCloud, Yandex e semelhantes:</strong> têm WebDAV,
          mas bloqueiam o acesso a partir de páginas web, e não pode alterar
          isso porque o servidor não é seu.</li>
          <li><strong>Nextcloud ou ownCloud com a permissão ativada:</strong>
          na prática, é a única opção que funciona para sincronizar.</li>
        </ul>
      </div>

      <details class="tarjeta tarjeta-plegable">
        <summary>Não tenho servidor próprio (o caso mais habitual)</summary>
        <p>Quase ninguém tem servidor próprio, e não há problema nenhum. Tem
        duas opções:</p>
        <ul class="lista-ayuda">
          <li><strong>Alguém lhe dá acesso ao seu Nextcloud</strong> (um
          familiar, a sua escola, a sua equipa no trabalho…). Peça-lhe três
          coisas: o <em>URL da sua pasta WebDAV</em>, o seu <em>utilizador</em>
          e uma <em>palavra-passe de aplicação</em>. Com isso já sincroniza
          entre dispositivos, sem configurar nada você mesmo.</li>
          <li><strong>Ninguém lhe dá acesso:</strong> adicione os seus livros
          com o «+» em «Neste dispositivo». A leitura funciona igualmente
          bem; só perde a sincronização automática entre dispositivos.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Tenho ou administro Nextcloud / ownCloud</summary>
        <p>Para que o PageKeeper se possa ligar:</p>
        <ul class="lista-ayuda">
          <li>Instale a aplicação <strong>WebAppPassword</strong> e adicione o
          domínio deste leitor (<code id="ayuda-dominio">este site</code>) às
          origens permitidas.</li>
          <li>Crie uma <strong>palavra-passe de aplicação</strong> (Definições
          → Segurança). Não use a sua palavra-passe principal.</li>
          <li>Nas <strong>⚙️ Definições</strong> deste leitor, introduza o URL
          da sua pasta (por exemplo
          <code>https://a-sua-nuvem.pt/remote.php/dav/files/UTILIZADOR/Livros</code>),
          o seu utilizador e essa palavra-passe.</li>
        </ul>
      </details>

      <details class="tarjeta tarjeta-plegable">
        <summary>Levar a configuração para outro dispositivo</summary>
        <p>Depois de configurar a sua nuvem, <strong>⚙️ Definições → «Copiar
        hiperligação de configuração»</strong> dá-lhe uma hiperligação que leva
        tudo (URL, utilizador e palavra-passe). Abra-a noutro dispositivo e
        ficará configurado de imediato. Partilhe-a apenas por canais privados e
        elimine-a depois de a usar.</p>
      </details>

      <details class="tarjeta tarjeta-plegable destacado">
        <summary>🤖 Bloqueado a configurar? Pergunte a uma IA</summary>
        <p>Configurar um servidor exige algum esforço, mas uma inteligência
        artificial (ChatGPT, Claude, Gemini…) pode guiá-lo passo a passo. Copie
        e cole perguntas como estas:</p>
        <ul class="lista-ayuda">
          <li>«Tenho um servidor Nextcloud. Como instalo a aplicação
          <em>WebAppPassword</em> e permito o acesso WebDAV a partir de um
          site alojado em <code id="ayuda-dominio-ia">este site</code>?»</li>
          <li>«Como crio uma palavra-passe de aplicação no Nextcloud?»</li>
          <li>«O serviço de nuvem <em>[nome]</em> permite o acesso WebDAV a
          partir do navegador (CORS) para um site externo?»</li>
        </ul>
      </details>
      </div>

    <div id="panel-ayuda-privacidad" class="panel-pestana" role="tabpanel"
      aria-label="Privacidade" tabindex="0" hidden>
<div class="tarjeta"><h2>Privacidade</h2><p>Não há nenhum servidor intermediário: o seu navegador liga-se diretamente à sua nuvem. O URL, o utilizador e a palavra-passe são guardados apenas neste navegador.</p></div>
    </div>
  `,
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
  const texto = textos[idioma]?.[clave] ?? textos.en[clave] ?? textos.es[clave] ?? clave;
  return texto.replace(/\{(\w+)\}/g, (_, nombre) => valores[nombre] ?? '');
}

export function idiomaActual() { return idioma; }

// Los controles que solo llevan un icono se quedarían sin nombre accesible. El
// «title» sirve de último recurso, pero no se anuncia en pantallas táctiles ni
// sobrevive al modo de alto contraste, así que se copia a aria-label. Se
// respetan los que ya tienen etiqueta propia y los que muestran texto (ahí el
// título es información añadida, no el nombre del control).
const CONTROLES = 'button, a[href], label, summary, [role="button"], [role="menuitem"]';

function etiquetarUno(control) {
  const puesto = control.hasAttribute('data-etiqueta-de-titulo');
  if (!puesto && (control.getAttribute('aria-label') || control.textContent.trim())) return;
  if (!control.title) return;
  control.setAttribute('data-etiqueta-de-titulo', '');
  control.setAttribute('aria-label', control.title);
}

export function etiquetarPorTitulo(raiz = document) {
  if (raiz instanceof Element && raiz.matches(CONTROLES)) etiquetarUno(raiz);
  for (const control of raiz.querySelectorAll(CONTROLES)) etiquetarUno(control);
}

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
    elemento.innerHTML = idioma === 'es' ? originales.get(elemento) : (ayudas[idioma] ?? ayudas.en);
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
  // El nombre de un grupo de opciones va en un atributo, no en el contenido:
  // un <optgroup> no tiene texto propio que traducir.
  document.querySelectorAll('[data-i18n-label]').forEach((elemento) => {
    elemento.label = t(elemento.dataset.i18nLabel);
  });
  etiquetarPorTitulo();
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
