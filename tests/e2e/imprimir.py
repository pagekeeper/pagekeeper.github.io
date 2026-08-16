"""Llevar un EPUB al papel: qué se compone y qué acaba en la hoja.

El PDF lo genera el navegador desde su propio diálogo, así que lo que se puede
comprobar aquí es lo de antes: que el documento que se le entrega tiene los
capítulos elegidos, el tamaño de papel pedido y —si se marca la casilla— los
subrayados y las notas. Es justo lo que se rompe sin avisar, porque el
documento se compone en un marco que no se ve.

Además vigila dos cosas que ya han fallado una vez: que las hojas de estilo
del libro se leen del propio archivo (pedirlas por la red las bloquea la
política de seguridad) y que las imágenes llegan de verdad, que si no se
imprimen huecos en blanco.
"""

from playwright.sync_api import sync_playwright

import comun

# Lo que hay dentro del marco de impresión, que es el documento que se manda a
# imprimir. Se mira desde la aplicación porque es suyo.
DOCUMENTO = """() => {
  const doc = document.getElementById('marco-impresion').contentDocument;
  if (!doc || !doc.body) return null;
  const imagenes = [...doc.images];
  return {
    titulo: doc.title,
    capitulos: doc.querySelectorAll('.pk-capitulo').length,
    portada: doc.querySelector('.pk-portada h1')?.textContent ?? '',
    hayPortada: Boolean(doc.querySelector('.pk-portada')),
    primero: doc.body.firstElementChild?.className ?? '',
    hojas: doc.querySelectorAll('head style').length,
    imagenes: imagenes.length,
    imagenesRotas: imagenes.filter((i) => !i.naturalWidth).length,
    subrayados: doc.querySelectorAll('.pk-subrayado').length,
    notas: doc.querySelectorAll('.pk-notas li').length,
    texto: (doc.body.textContent || '').replace(/\\s+/g, ' ').trim().length,
    cuerpo: doc.defaultView.getComputedStyle(doc.body).fontSize,
    pagina: [...doc.styleSheets].flatMap((hoja) => {
      try {
        return [...hoja.cssRules]
          .filter((regla) => regla.constructor.name === 'CSSPageRule')
          .map((regla) => regla.cssText);
      } catch { return []; }
    }).at(-1) ?? '',
  };
}"""

# Selecciona un trozo de un párrafo del capítulo que se está leyendo. Al
# cambiar la selección, epub.js avisa a la aplicación y sale la barra de
# resaltar; es el mismo camino que el dedo, sin el dedo.
SELECCIONAR = """(cual) => {
  const marco = document.querySelector('#contenedor-epub iframe');
  const doc = marco.contentDocument;
  const parrafo = [...doc.querySelectorAll('p')]
    .filter((p) => (p.textContent || '').trim().length > 120)[cual];
  if (!parrafo) return null;
  const nodo = [...parrafo.childNodes].find((n) => n.nodeType === 3 && n.data.trim().length > 50);
  if (!nodo) return null;
  const rango = doc.createRange();
  rango.setStart(nodo, 0);
  rango.setEnd(nodo, 45);
  const seleccion = marco.contentWindow.getSelection();
  seleccion.removeAllRanges();
  seleccion.addRange(rango);
  return rango.toString().trim();
}"""


def imprimir(page, espera=12000):
    page.click('#btn-confirmar-imprimir')
    page.wait_for_timeout(espera)
    return page.evaluate(DOCUMENTO)


def el_documento_lleva_el_libro(page, r):
    """Todo el libro, en A4, con su título y sus hojas de estilo."""
    page.click('#btn-imprimir')
    page.wait_for_timeout(800)
    capitulos = page.locator('#lista-capitulos-impresion li').count()
    r.comprobar(capitulos > 1, f'solo se ofrecen {capitulos} capítulos para imprimir')
    page.select_option('#impresion-tamano', 'a4')
    page.select_option('#impresion-margen', 'normal')
    documento = imprimir(page)
    print('[imprimir] documento entero:', documento)
    if not documento:
        r.fallo('no se compuso ningún documento')
        return
    r.comprobar(documento['capitulos'] == capitulos,
                f'se pidieron {capitulos} capítulos y salieron {documento["capitulos"]}')
    r.comprobar('210mm 297mm' in documento['pagina'], f'el papel no es A4: {documento["pagina"]}')
    r.comprobar(documento['texto'] > 10000, 'el documento salió casi vacío')
    r.comprobar(documento['hojas'] > 1, 'no se recogió ninguna hoja de estilo del libro')
    r.comprobar('Lazarillo' in documento['titulo'], f'el título es «{documento["titulo"]}»')
    r.comprobar('Lazarillo' in documento['portada'], 'la portadilla no lleva el título')
    r.comprobar(documento['imagenesRotas'] == 0,
                f'{documento["imagenesRotas"]} imágenes sin cargar')


def solo_los_capitulos_elegidos(page, r):
    """Desmarcar un capítulo lo deja fuera del papel."""
    page.click('#btn-imprimir')
    page.wait_for_timeout(700)
    page.click('#impresion-ninguno')
    r.comprobar(page.locator('#btn-confirmar-imprimir').is_disabled(),
                'sin capítulos elegidos todavía se puede imprimir')
    for indice in (1, 2):
        page.locator('#lista-capitulos-impresion li input').nth(indice).check()
    documento = imprimir(page)
    print('[imprimir] dos capítulos:', documento['capitulos'], 'artículos')
    r.comprobar(documento['capitulos'] == 2,
                f'se eligieron dos capítulos y salieron {documento["capitulos"]}')


def la_hoja_de_titulo_se_puede_quitar(page, r):
    """Quien imprime un capítulo suelto no quiere la hoja del título."""
    page.click('#btn-imprimir')
    page.wait_for_timeout(700)
    r.comprobar(page.is_checked('#impresion-portada'),
                'la hoja de título debería venir marcada de partida')
    page.uncheck('#impresion-portada')
    page.click('#impresion-ninguno')
    page.locator('#lista-capitulos-impresion li input').nth(5).check()
    documento = imprimir(page)
    print('[imprimir] sin hoja de título, empieza por:', documento['primero'])
    r.comprobar(not documento['hayPortada'], 'la hoja de título salió aunque se desmarcó')
    r.comprobar(documento['primero'] == 'pk-capitulo',
                f'el documento empieza por «{documento["primero"]}» y no por el capítulo')

    # Y la casilla se recuerda, como el resto de los ajustes.
    page.click('#btn-imprimir')
    page.wait_for_timeout(700)
    r.comprobar(not page.is_checked('#impresion-portada'),
                'la casilla de la hoja de título no se recuerda')
    page.check('#impresion-portada')
    page.click('#btn-cancelar-imprimir')
    page.wait_for_timeout(300)


def las_medidas_a_mano(page, r):
    """Elegir «Personalizado» y escribir los milímetros y los puntos exactos."""
    page.click('#btn-imprimir')
    page.wait_for_timeout(700)
    r.comprobar(not page.locator('#medida-papel').is_visible(),
                'los campos a mano no deberían verse con un papel de la lista')
    for lista in ('impresion-tamano', 'impresion-margen', 'impresion-letra'):
        page.select_option(f'#{lista}', 'personalizado')
    page.wait_for_timeout(300)
    r.comprobar(page.locator('#medida-papel').is_visible()
                and page.locator('#medida-margen').is_visible()
                and page.locator('#medida-letra').is_visible(),
                'pidiendo medidas a mano, los campos deberían salir')

    # Un número imposible se recorta en cuanto se suelta el campo.
    page.fill('#impresion-letra-pt', '900')
    page.locator('#impresion-margen-mm').focus()
    page.wait_for_timeout(300)
    recortado = page.input_value('#impresion-letra-pt')
    print('[imprimir] 900 pt se quedan en', recortado)
    r.comprobar(float(recortado) <= 30, f'900 pt no se recortaron: quedaron en {recortado}')

    # A5 con márgenes de 8 mm y letra de 10,5 pt (que son 14 px).
    page.fill('#impresion-ancho', '148')
    page.fill('#impresion-alto', '210')
    page.fill('#impresion-margen-mm', '8')
    page.fill('#impresion-letra-pt', '10.5')
    page.locator('#btn-confirmar-imprimir').focus()
    page.wait_for_timeout(300)
    page.click('#impresion-ninguno')
    page.locator('#lista-capitulos-impresion li input').nth(4).check()
    documento = imprimir(page)
    print('[imprimir] a mano:', documento['pagina'], documento['cuerpo'])
    r.comprobar('148mm 210mm' in documento['pagina'] and 'margin: 8mm' in documento['pagina'],
                f'el papel a mano no llegó: {documento["pagina"]}')
    r.comprobar(documento['cuerpo'] == '14px',
                f'10,5 pt deberían ser 14 px y son {documento["cuerpo"]}')

    # Y lo escrito sigue ahí la próxima vez.
    page.click('#btn-imprimir')
    page.wait_for_timeout(700)
    r.comprobar(page.input_value('#impresion-ancho') == '148'
                and page.input_value('#impresion-letra-pt') == '10.5',
                'las medidas escritas a mano no se recuerdan')
    page.click('#btn-cancelar-imprimir')
    page.wait_for_timeout(300)


def los_subrayados_van_al_papel(page, r):
    """Con la casilla marcada salen; sin marcarla, el texto va limpio."""
    for _ in range(14):
        page.click('#zona-siguiente')
        page.wait_for_timeout(400)

    for cual, con_nota in [(0, False), (1, True)]:
        if not page.evaluate(SELECCIONAR, cual):
            r.fallo('no se encontró un párrafo que subrayar')
            return
        page.wait_for_timeout(900)
        if not page.locator('#barra-seleccion').is_visible():
            r.fallo('seleccionar texto no saca la barra de resaltar')
            return
        if con_nota:
            # La nota se escribe en un prompt del navegador.
            page.once('dialog', lambda dialogo: dialogo.accept('Mirar esto con calma.'))
            page.click('#btn-nota-seleccion')
        else:
            page.click('#barra-seleccion .punto-color[data-color="verde"]')
        page.wait_for_timeout(1400)

    page.click('#btn-imprimir')
    page.wait_for_timeout(700)
    r.comprobar(page.locator('#impresion-anotaciones').is_visible(),
                'con anotaciones en el libro, la casilla debería ofrecerse')
    page.check('#impresion-anotaciones')
    con = imprimir(page)
    print('[imprimir] con anotaciones:', con['subrayados'], 'subrayados,', con['notas'], 'notas')
    r.comprobar(con['subrayados'] == 2, f'salieron {con["subrayados"]} subrayados de 2')
    r.comprobar(con['notas'] == 1, f'salieron {con["notas"]} notas de 1')

    page.click('#btn-imprimir')
    page.wait_for_timeout(700)
    page.uncheck('#impresion-anotaciones')
    sin = imprimir(page)
    print('[imprimir] sin anotaciones:', sin['subrayados'], 'subrayados')
    r.comprobar(sin['subrayados'] == 0 and sin['notas'] == 0,
                'desmarcada la casilla, el papel sigue llevando subrayados')


def volver_al_libro_y_salir(page, r, historial):
    """Después de imprimir, una sola pulsación saca del libro.

    El marco donde se compone el documento apuntaba una navegación en el
    historial del navegador por cada documento que pasaba por él, y la flecha
    de volver se gastaba en deshacer esos pasos invisibles: unas veces hacía
    falta pulsarla una vez y otras tres, según cuánto se hubiera imprimido.
    """
    ahora = page.evaluate('() => history.length')
    print(f'[imprimir] historial: {historial} al abrir, {ahora} tras imprimir')
    r.comprobar(ahora == historial,
                f'imprimir dejó {ahora - historial} pasos de más en el historial')
    page.click('#btn-volver')
    page.wait_for_timeout(1500)
    r.comprobar(page.locator('#vista-lector').evaluate("e => e.classList.contains('oculto')"),
                'tras imprimir hace falta más de una pulsación para salir del libro')


r = comun.Resultado('imprimir')

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base, etiqueta='EPUB')
    comun.anadir_libro(page, comun.EPUB)
    comun.abrir_libro(page, 'lazarillo')
    page.wait_for_timeout(3000)
    r.comprobar(page.locator('#btn-imprimir').is_visible(),
                'en un EPUB debería poder imprimirse')
    historial = page.evaluate('() => history.length')
    el_documento_lleva_el_libro(page, r)
    solo_los_capitulos_elegidos(page, r)
    la_hoja_de_titulo_se_puede_quitar(page, r)
    las_medidas_a_mano(page, r)
    los_subrayados_van_al_papel(page, r)
    volver_al_libro_y_salir(page, r, historial)
    page.close()

    # En PDF no se ofrece: ese ya se imprime descargándolo.
    page = comun.pagina(nav, r, base, etiqueta='PDF')
    comun.anadir_libro(page, comun.PDF)
    comun.abrir_libro(page, 'orientaciones')
    page.wait_for_timeout(3000)
    r.comprobar(not page.locator('#btn-imprimir').is_visible(),
                'en un PDF no debería salir el botón de imprimir el EPUB')
    page.close()
    nav.close()

r.terminar()
