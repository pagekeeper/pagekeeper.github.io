// Internacionalización de la interfaz. La preferencia es local a este
// dispositivo; si no existe se usa el idioma preferido del navegador.

const CLAVE_IDIOMA = 'lector.idioma';
const IDIOMAS = ['es', 'ca', 'en'];

const textos = {
  es: {
    appTagline: 'Lector de libros electrónicos',
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
    marginHelp: 'El texto se reajusta al mover el control.', reset: 'Restablecer',
    webdavFolder: 'URL de la carpeta WebDAV', user: 'Usuario', appPassword: 'Contraseña de aplicación',
    webdav: 'Nube (WebDAV)', transferConfig: 'Llevar la configuración a otro dispositivo',
    webdavShort: 'Nube', settingsData: 'Datos', settingsSections: 'Secciones de los ajustes',
    epubTextSettings: 'Texto de los EPUB',
    epubTextSettingsHelp: 'Cómo se compone el texto de los libros EPUB (los PDF llegan ya maquetados y no admiten estos cambios). Los mismos ajustes están a mano mientras lees, en el botón de la letra.',
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
    noConfigHtml: '<span>No hay ningún servidor configurado. Puedes abrir un libro (PDF o EPUB) de este dispositivo, o <a href="#" id="enlace-configurar">configurar tu nube (Nextcloud u otro WebDAV)</a> para sincronizar la posición de lectura entre dispositivos.</span><p class="ayuda">¿No sabes qué es esto o qué necesitas? <a href="#" id="enlace-ayuda-aviso">Lee la ayuda</a>.</p>',
    syncError: 'Error de sincronización', syncFailed: 'No se pudo sincronizar el progreso: {error}',
    syncRecovered: 'Ya se ha guardado tu posición en la nube',
    stats: 'Estadísticas de lectura', statsView: 'Ver las estadísticas',
    statsSettingsHelp: 'El tiempo que dedicas a leer, los días seguidos que llevas y los libros a los que más rato les echas, sumando todos tus dispositivos.',
    statsSummary: 'Tu lectura', statsLastDays: 'Los últimos 30 días',
    actionBookStats: 'Tiempo de lectura',
    statusTimeSpentTitle: 'Tiempo que llevas leyendo este libro. Pulsa para verlo en detalle.',
    statsBookTime: 'Tiempo dedicado', statsBookRead: 'Leído', statsBookPace: 'Ritmo',
    statsPacePerPage: '{time} por página', statsPaceSeconds: '{s} s por página',
    statsBookByDevice: 'En cada dispositivo',
    statsBookEmpty: 'Todavía no hay tiempo apuntado de este libro. En cuanto leas unos minutos con él abierto, aquí aparecerá cuánto le has dedicado.',
    statsShared: 'Suma de todos tus dispositivos: lo leído en el móvil y en el ordenador cuenta junto, y un día en el que hayas leído en los dos es un solo día.',
    statsTopBooks: 'En qué se va el tiempo', statsDataTitle: 'Estos datos',
    statsEmptyTitle: 'Todavía no hay nada que contar',
    statsEmpty: 'En cuanto leas unos minutos con un libro abierto, aquí aparecerán el tiempo dedicado, los días seguidos que llevas leyendo y en qué libros se te va el rato.',
    statsPrivacy: 'Con una nube configurada, el tiempo viaja con el progreso de lectura: cada dispositivo apunta el suyo y aquí se enseña la suma, así que sabes cuánto has tardado en leer un libro aunque lo hayas leído a ratos en cada aparato. Van en tu propio servidor WebDAV, con tus libros, y no se envían a ningún otro sitio. Sin nube configurada se quedan en este navegador. Solo cuenta el tiempo con un libro abierto y pasando páginas; las pausas largas y los saltos de posición no se suman.',
    statsDelete: 'Borrar las estadísticas',
    statsDeleteConfirm: '¿Borrar las estadísticas de lectura? Se borran en todos tus dispositivos: los que estén conectados lo harán en cuanto sincronicen. No afecta a tus libros, a la página por la que vas ni a tus anotaciones.',
    statsDeleted: '✓ Estadísticas borradas. Los demás dispositivos las borrarán al sincronizar.',
    statsTotal: 'Tiempo total', statsToday: 'Hoy', statsWeek: 'Últimos 7 días',
    statsStreak: 'Días seguidos', statsAverage: 'Media por día leído',
    statsActiveDays: 'Días con lectura', statsBestDay: 'Mejor día', statsPdfPages: 'Páginas de PDF',
    statsBestStreak: 'tu mejor racha: {streak}', statsStreakNow: 'racha en marcha',
    statsNoStreak: 'hoy o mañana empieza una',
    statsDays: '{count} días', statsDaysOne: '{count} día', statsHours: '{h} h',
    statsChartLabel: 'Gráfico del tiempo leído cada uno de los últimos {days} días.',
    statsChartSummary: 'Has leído {days} de los últimos 30, {total} en total.',
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
    noBooksInFolder: 'Esa carpeta no contiene ningún PDF ni EPUB.', localAddedOne: 'Libro guardado en este dispositivo.', localAddedMany: '{count} libros guardados en este dispositivo.',
    saveFailed: 'No se pudo guardar «{title}»: {error}',
    searchLibrary: 'Buscar en la biblioteca', clearSearch: 'Borrar la búsqueda', searchLibraryPlaceholder: 'Buscar por título, autor…',
    showIndex: 'Mostrar el índice', hideIndex: 'Ocultar el índice',
    showThumbs: 'Mostrar las miniaturas', hideThumbs: 'Ocultar las miniaturas',
    showIndexThumbs: 'Mostrar el índice y las miniaturas',
    hideIndexThumbs: 'Ocultar el índice y las miniaturas',
    searchBook: 'Buscar dentro del libro', bookIndex: 'Índice del libro', bookStart: 'Inicio del libro', historyNavigation: 'Historial de navegación', backPosition: 'Volver a la posición anterior', forwardPosition: 'Avanzar a la posición siguiente', pageAndHistory: 'Página e historial de navegación', wordOrPhrase: 'Palabra o frase', search: 'Buscar', close: 'Cerrar',
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
    themeAuto: 'El del sistema', themeLight: 'Claro', themeSepia: 'Sepia', themeDark: 'Oscuro',
    themeNowAuto: 'Tema: el del sistema. Pulsa para el claro',
    themeNowLight: 'Tema: claro. Pulsa para el sepia',
    themeNowSepia: 'Tema: sepia. Pulsa para el oscuro',
    themeNowDark: 'Tema: oscuro. Pulsa para seguir el del sistema',
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
  },
  ca: {
    appTagline: 'Lector de llibres electrònics',
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
    marginHelp: 'El text es reajusta en moure el control.', reset: 'Restableix',
    webdavFolder: 'URL de la carpeta WebDAV', user: 'Usuari', appPassword: 'Contrasenya d’aplicació',
    webdav: 'Núvol (WebDAV)', transferConfig: 'Porta la configuració a un altre dispositiu',
    webdavShort: 'Núvol', settingsData: 'Dades', settingsSections: 'Seccions de la configuració',
    epubTextSettings: 'Text dels EPUB',
    epubTextSettingsHelp: 'Com es compon el text dels llibres EPUB (els PDF arriben ja maquetats i no admeten aquests canvis). Els mateixos ajustos són a mà mentre llegeixes, al botó de la lletra.',
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
    noConfigHtml: '<span>No hi ha cap servidor configurat. Pots obrir un llibre (PDF o EPUB) d’aquest dispositiu, o <a href="#" id="enlace-configurar">configurar el teu núvol (Nextcloud o un altre WebDAV)</a> per sincronitzar la posició de lectura entre dispositius.</span><p class="ayuda">No saps què és això o què necessites? <a href="#" id="enlace-ayuda-aviso">Llegeix l’ajuda</a>.</p>',
    syncError: 'Error de sincronització', syncFailed: 'No s’ha pogut sincronitzar el progrés: {error}',
    syncRecovered: 'Ja s’ha desat la teva posició al núvol',
    stats: 'Estadístiques de lectura', statsView: 'Veure les estadístiques',
    statsSettingsHelp: 'El temps que dediques a llegir, els dies seguits que portes i els llibres als quals dediques més estona, sumant tots els teus dispositius.',
    statsSummary: 'La teva lectura', statsLastDays: 'Els darrers 30 dies',
    actionBookStats: 'Temps de lectura',
    statusTimeSpentTitle: 'Temps que portes llegint aquest llibre. Prem per veure’l en detall.',
    statsBookTime: 'Temps dedicat', statsBookRead: 'Llegit', statsBookPace: 'Ritme',
    statsPacePerPage: '{time} per pàgina', statsPaceSeconds: '{s} s per pàgina',
    statsBookByDevice: 'A cada dispositiu',
    statsBookEmpty: 'Encara no hi ha temps apuntat d’aquest llibre. Tan bon punt llegeixis uns minuts amb ell obert, aquí apareixerà quant li has dedicat.',
    statsShared: 'Suma de tots els teus dispositius: el que has llegit al mòbil i a l’ordinador compta junt, i un dia en què hagis llegit als dos és un sol dia.',
    statsTopBooks: 'On se’n va el temps', statsDataTitle: 'Aquestes dades',
    statsEmptyTitle: 'Encara no hi ha res a explicar',
    statsEmpty: 'Tan bon punt llegeixis uns minuts amb un llibre obert, aquí apareixeran el temps dedicat, els dies seguits que portes llegint i en quins llibres se’t va l’estona.',
    statsPrivacy: 'Amb un núvol configurat, el temps viatja amb el progrés de lectura: cada dispositiu apunta el seu i aquí se’n mostra la suma, així saps quant has trigat a llegir un llibre encara que l’hagis llegit a estones en cada aparell. Van al teu propi servidor WebDAV, amb els teus llibres, i no s’envien enlloc més. Sense núvol configurat es queden en aquest navegador. Només compta el temps amb un llibre obert i passant pàgines; les pauses llargues i els salts de posició no se sumen.',
    statsDelete: 'Esborrar les estadístiques',
    statsDeleteConfirm: 'Voleu esborrar les estadístiques de lectura? S’esborren a tots els teus dispositius: els que estiguin connectats ho faran tan bon punt sincronitzin. No afecta els llibres, la pàgina on ets ni les anotacions.',
    statsDeleted: '✓ Estadístiques esborrades. Els altres dispositius les esborraran en sincronitzar.',
    statsTotal: 'Temps total', statsToday: 'Avui', statsWeek: 'Darrers 7 dies',
    statsStreak: 'Dies seguits', statsAverage: 'Mitjana per dia llegit',
    statsActiveDays: 'Dies amb lectura', statsBestDay: 'Millor dia', statsPdfPages: 'Pàgines de PDF',
    statsBestStreak: 'la teva millor ratxa: {streak}', statsStreakNow: 'ratxa en marxa',
    statsNoStreak: 'avui o demà en comença una',
    statsDays: '{count} dies', statsDaysOne: '{count} dia', statsHours: '{h} h',
    statsChartLabel: 'Gràfic del temps llegit cadascun dels darrers {days} dies.',
    statsChartSummary: 'Has llegit {days} dels darrers 30, {total} en total.',
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
    noBooksInFolder: 'Aquesta carpeta no conté cap PDF ni EPUB.', localAddedOne: 'Llibre desat en aquest dispositiu.', localAddedMany: 'S’han desat {count} llibres en aquest dispositiu.',
    saveFailed: 'No s’ha pogut desar «{title}»: {error}',
    searchLibrary: 'Cerca a la biblioteca', clearSearch: 'Esborra la cerca', searchLibraryPlaceholder: 'Cerca per títol, autor…',
    showIndex: 'Mostra l’índex', hideIndex: 'Amaga l’índex',
    showThumbs: 'Mostra les miniatures', hideThumbs: 'Amaga les miniatures',
    showIndexThumbs: 'Mostra l’índex i les miniatures',
    hideIndexThumbs: 'Amaga l’índex i les miniatures',
    searchBook: 'Cerca dins del llibre', bookIndex: 'Índex del llibre', bookStart: 'Inici del llibre', historyNavigation: 'Historial de navegació', backPosition: 'Torna a la posició anterior', forwardPosition: 'Avança a la posició següent', pageAndHistory: 'Pàgina i historial de navegació', wordOrPhrase: 'Paraula o frase', search: 'Cerca', close: 'Tanca',
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
    themeAuto: 'El del sistema', themeLight: 'Clar', themeSepia: 'Sèpia', themeDark: 'Fosc',
    themeNowAuto: 'Tema: el del sistema. Prem per al clar',
    themeNowLight: 'Tema: clar. Prem per al sèpia',
    themeNowSepia: 'Tema: sèpia. Prem per al fosc',
    themeNowDark: 'Tema: fosc. Prem per seguir el del sistema',
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
  },
  en: {
    appTagline: 'E-book reader',
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
    marginHelp: 'The text reflows as you move the control.', reset: 'Reset',
    webdavFolder: 'WebDAV folder URL', user: 'Username', appPassword: 'App password',
    webdav: 'Cloud (WebDAV)', transferConfig: 'Move configuration to another device',
    webdavShort: 'Cloud', settingsData: 'Data', settingsSections: 'Settings sections',
    epubTextSettings: 'EPUB text',
    epubTextSettingsHelp: 'How the text of EPUB books is laid out (PDFs arrive already typeset and do not take these changes). The same settings are at hand while you read, under the font button.',
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
    noConfigHtml: '<span>No server is configured. You can open a book (PDF or EPUB) from this device, or <a href="#" id="enlace-configurar">set up your cloud (Nextcloud or another WebDAV server)</a> to sync your reading position between devices.</span><p class="ayuda">Not sure what this is or what you need? <a href="#" id="enlace-ayuda-aviso">Read the help</a>.</p>',
    syncError: 'Sync error', syncFailed: 'Could not sync reading progress: {error}',
    syncRecovered: 'Your position is now saved to the cloud',
    stats: 'Reading statistics', statsView: 'View the statistics',
    statsSettingsHelp: 'How much time you spend reading, how many days in a row you have kept it up, and the books that take the most of your time, adding up all your devices.',
    statsSummary: 'Your reading', statsLastDays: 'The last 30 days',
    actionBookStats: 'Reading time',
    statusTimeSpentTitle: 'How long you have been reading this book. Tap to see the details.',
    statsBookTime: 'Time spent', statsBookRead: 'Read', statsBookPace: 'Pace',
    statsPacePerPage: '{time} per page', statsPaceSeconds: '{s} s per page',
    statsBookByDevice: 'On each device',
    statsBookEmpty: 'No time recorded for this book yet. As soon as you read for a few minutes with it open, this is where you will see how long you have spent on it.',
    statsShared: 'Adding up all your devices: what you read on the phone and on the computer counts together, and a day you read on both is a single day.',
    statsTopBooks: 'Where the time goes', statsDataTitle: 'About this data',
    statsEmptyTitle: 'Nothing to show yet',
    statsEmpty: 'As soon as you read for a few minutes with a book open, this page will show the time you spent, how many days in a row you have been reading, and which books take up your time.',
    statsPrivacy: 'With cloud storage set up, reading time travels along with your reading position: each device records its own and the total is shown here, so you know how long a book took you even if you read it in bits on each device. It lives in your own WebDAV server, next to your books, and is never sent anywhere else. Without cloud storage it stays in this browser. Only time spent with a book open and turning pages counts; long pauses and jumps to another position are not added.',
    statsDelete: 'Delete the statistics',
    statsDeleteConfirm: 'Delete the reading statistics? They are deleted on all your devices: any that are connected will do so as soon as they sync. Your books, your reading position and your annotations are not affected.',
    statsDeleted: '✓ Statistics deleted. Your other devices will delete them when they sync.',
    statsTotal: 'Total time', statsToday: 'Today', statsWeek: 'Last 7 days',
    statsStreak: 'Days in a row', statsAverage: 'Average per day read',
    statsActiveDays: 'Days with reading', statsBestDay: 'Best day', statsPdfPages: 'PDF pages',
    statsBestStreak: 'your best streak: {streak}', statsStreakNow: 'streak going',
    statsNoStreak: 'today or tomorrow starts one',
    statsDays: '{count} days', statsDaysOne: '{count} day', statsHours: '{h} h',
    statsChartLabel: 'Chart of the time read on each of the last {days} days.',
    statsChartSummary: 'You read on {days} of the last 30, {total} in total.',
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
    noBooksInFolder: 'That folder has no PDF or EPUB files in it.', localAddedOne: 'Book saved on this device.', localAddedMany: '{count} books saved on this device.',
    saveFailed: 'Could not save “{title}”: {error}',
    searchLibrary: 'Search library', clearSearch: 'Clear search', searchLibraryPlaceholder: 'Search by title, author…',
    showIndex: 'Show table of contents', hideIndex: 'Hide table of contents',
    showThumbs: 'Show page thumbnails', hideThumbs: 'Hide page thumbnails',
    showIndexThumbs: 'Show contents and thumbnails',
    hideIndexThumbs: 'Hide contents and thumbnails',
    searchBook: 'Search inside the book', bookIndex: 'Table of contents', bookStart: 'Start of book', historyNavigation: 'Navigation history', backPosition: 'Back to previous position', forwardPosition: 'Forward to next position', pageAndHistory: 'Page and navigation history', wordOrPhrase: 'Word or phrase', search: 'Search', close: 'Close',
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
    themeAuto: 'Match the system', themeLight: 'Light', themeSepia: 'Sepia', themeDark: 'Dark',
    themeNowAuto: 'Theme: match the system. Tap for light',
    themeNowLight: 'Theme: light. Tap for sepia',
    themeNowSepia: 'Theme: sepia. Tap for dark',
    themeNowDark: 'Theme: dark. Tap to match the system',
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

<div class="tarjeta"><h2>Clar, sèpia i fosc</h2><p>El botó del tema, a la capçalera, va passant pels quatre estats cada cop que el prems: <strong>el del sistema</strong> (cercle meitat clar meitat fosc), <strong>clar</strong> (sol), <strong>sèpia</strong> (tassa) i <strong>fosc</strong> (lluna). La icona et diu en quin ets i la teva tria es recorda en aquest navegador. De primer s’usa el del sistema, de manera que l’aplicació s’aclareix o s’enfosqueix quan ho fa la resta del dispositiu.</p><p class="ayuda">El tema és també el paper amb què llegeixes: clar és paper blanc, sèpia el torrat dels lectors de tinta electrònica i fosc el mode nit de la pàgina.</p></div>
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
        d’aquesta llista. El menú «⋯» de cada fitxa ofereix el mateix que a la
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
          portes, una barra per cadascun dels darrers trenta dies i els llibres
          als quals dediques més estona. Només es compta el temps amb un llibre
          obert i passant pàgines, així que deixar la pestanya oberta no
          suma.</p>
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
        Amb les pàgines contínues, o amb zoom, mana el desplaçament i no hi ha
        animació.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Dues pàgines juntes</summary>
          <p>
        en mode pàgina a pàgina, el botó de les dues columnes mostra les pàgines de
        dues en dues (ideal en pantalles amples); un altre toc torna a una sola pàgina.</p>
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
        del tema, a la capçalera de la biblioteca, recorre quatre estats —el del
        sistema, clar, sèpia (torrat, més descansat per a estones llargues) i fosc— i
        canvia alhora la pàgina del llibre i tota la resta. Als EPUB es canvien els
        colors del text, així que les il·lustracions es veuen tal qual; als PDF,
        que són una imatge ja dibuixada, es tenyeix la pàgina sencera.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Imatges amb el tema fosc (només PDF)</summary>
          <p>
        en invertir la pàgina, les fotos i els logotips queden en negatiu. El botó de
        la imatge, que surt a la barra del lector quan llegeixes un PDF amb el tema
        fosc, els torna el color. Es recorda d’un llibre a l’altre. Les pàgines escanejades
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

<div class="tarjeta"><h2>Light, sepia and dark</h2><p>The theme button in the header steps through four states each time you press it: <strong>match the system</strong> (half-light, half-dark circle), <strong>light</strong> (sun), <strong>sepia</strong> (cup) and <strong>dark</strong> (moon). The icon tells you which one you are on, and your choice is remembered in that browser. It starts on the system theme, so the app follows the rest of the device.</p><p class="ayuda">The theme is also the paper you read on: light is white paper, sepia the warm tone of e-ink readers and dark the page’s night mode.</p></div>
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
        that no longer exist stay out of this list. Each card’s “⋯” menu offers the
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
          kept it up, one bar for each of the last thirty days, and the books
          that take the most of your time. Only time with a book open and pages
          turning is counted, so leaving the tab open adds nothing.</p>
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
        does peek in. With continuous pages, or while zoomed, scrolling takes over and
        there is no animation.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Two pages side by side</summary>
          <p>
        in page-by-page mode, the two-column button shows pages in pairs (ideal on wide
        screens); another tap returns to a single page.</p>
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
        theme button, in the library header, cycles through four states —the system
        one, light, sepia (warm, easier on the eyes for long sessions) and dark— and
        changes the book page and everything else at once. In EPUBs the text
        colours change, so illustrations look untouched; in PDFs, which are already
        drawn images, the whole page is tinted.</p>
        </details>
        <details class="punto-ayuda">
          <summary>Images with the dark theme (PDF only)</summary>
          <p>
        when the page is inverted, photos and logos end up as negatives. The image
        button, which appears in the reader bar when you read a PDF with the dark
        theme, gives them their colour back. It is remembered from one book to the next.
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
