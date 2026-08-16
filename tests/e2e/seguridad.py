"""Que la política de seguridad no bloquee nada que la aplicación necesite.

Recorre lo que carga recursos de verdad —PDF con su worker, miniaturas, EPUB
en su iframe, fórmulas con MathJax, portadas, ZIP, WebDAV— y da por fallo
cualquier aviso de CSP en la consola. Comprueba además que cada capítulo EPUB
conserva su propia política, que es la que impide que un libro ejecute código.
"""

import pathlib
import shutil
import zipfile

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('seguridad')

CAPITULO = """<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Fórmulas</title></head>
<body><h1>Capítulo con fórmulas</h1>
<p>En línea: \\(E = mc^2\\) y en bloque:</p>
<p>$$\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}$$</p>
<p>%RELLENO%</p></body></html>"""


def epub_con_formulas(destino):
    """Un EPUB mínimo con LaTeX: ninguno de los ejemplos lleva fórmulas, y es
    el caso donde la política más apretaba (MathJax dentro del iframe)."""
    opf = """<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="id">prueba-formulas</dc:identifier>
<dc:title>Prueba de fórmulas</dc:title><dc:language>es</dc:language></metadata>
<manifest><item id="c1" href="cap1.xhtml" media-type="application/xhtml+xml"/>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest>
<spine><itemref idref="c1"/></spine></package>"""
    nav = """<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Índice</title></head><body><nav epub:type="toc"><ol>
<li><a href="cap1.xhtml">Capítulo</a></li></ol></nav></body></html>"""
    container = """<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf"
media-type="application/oebps-package+xml"/></rootfiles></container>"""
    with zipfile.ZipFile(destino, 'w') as z:
        z.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
        z.writestr('META-INF/container.xml', container)
        z.writestr('OEBPS/content.opf', opf)
        z.writestr('OEBPS/nav.xhtml', nav)
        z.writestr('OEBPS/cap1.xhtml', CAPITULO.replace('%RELLENO%', 'Palabras y más palabras. ' * 60))
    return destino


def fuente_del_sistema():
    """Cualquier tipografía que haya en la máquina, para incrustarla en un
    libro de prueba. Ninguno de los ejemplos trae una, y meter un archivo de
    fuente en el repositorio por una prueba no compensa. Si la máquina no tiene
    ninguna, el caso se salta en vez de fallar."""
    for carpeta in ('/usr/share/fonts', '/usr/local/share/fonts'):
        raiz = pathlib.Path(carpeta)
        if not raiz.is_dir():
            continue
        for archivo in sorted(raiz.rglob('*.ttf')):
            if archivo.stat().st_size < 500_000:
                return archivo
    return None


def epub_con_fuente(destino, fuente):
    """Un EPUB mínimo cuyo texto pide una tipografía incrustada."""
    opf = """<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="id">prueba-fuente</dc:identifier>
<dc:title>Prueba de fuente</dc:title><dc:language>es</dc:language></metadata>
<manifest><item id="c1" href="cap1.xhtml" media-type="application/xhtml+xml"/>
<item id="css" href="estilo.css" media-type="text/css"/>
<item id="f" href="letra.ttf" media-type="font/ttf"/>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest>
<spine><itemref idref="c1"/></spine></package>"""
    css = ('@font-face { font-family: "LetraDelLibro"; '
           'src: url("letra.ttf") format("truetype"); }\n'
           'body { font-family: "LetraDelLibro", serif; }')
    capitulo = """<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Capítulo</title>
<link rel="stylesheet" href="estilo.css"/></head>
<body><h1>Con su letra</h1><p>%RELLENO%</p></body></html>"""
    nav = """<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Índice</title></head><body><nav epub:type="toc"><ol>
<li><a href="cap1.xhtml">Capítulo</a></li></ol></nav></body></html>"""
    container = """<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf"
media-type="application/oebps-package+xml"/></rootfiles></container>"""
    with zipfile.ZipFile(destino, 'w') as z:
        z.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
        z.writestr('META-INF/container.xml', container)
        z.writestr('OEBPS/content.opf', opf)
        z.writestr('OEBPS/nav.xhtml', nav)
        z.writestr('OEBPS/estilo.css', css)
        z.writestr('OEBPS/cap1.xhtml', capitulo.replace('%RELLENO%', 'Palabras con su letra. ' * 80))
        z.write(fuente, 'OEBPS/letra.ttf')
    return destino


with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base)

    # ── El tema se aplica antes del primer pintado (script propio, no incrustado)
    r.comprobar(bool(page.evaluate("() => document.documentElement.dataset.tema")),
                'el script del tema inicial no se ha ejecutado')

    # ── PDF: worker, lienzo, capa de texto y miniaturas
    comun.anadir_libro(page, comun.PDF)
    comun.abrir_libro(page, '.pdf')
    page.wait_for_timeout(4000)
    lienzo = page.evaluate(
        "() => { const c = document.querySelector('#contenedor-pagina canvas'); return c ? c.width : 0; }")
    print('PDF pintado, ancho del lienzo:', lienzo)
    r.comprobar(lienzo > 0, 'el PDF no se ha pintado: ¿worker bloqueado?')
    page.click('#btn-indice-libro')
    page.wait_for_timeout(1500)
    if page.locator('#pestana-miniaturas').count():
        page.click('#pestana-miniaturas')
        page.wait_for_timeout(3000)
    minis = page.locator('#rejilla-miniaturas canvas, #rejilla-miniaturas img').count()
    print('miniaturas pintadas:', minis)
    r.comprobar(minis > 0, 'las miniaturas no se pintan')
    page.keyboard.press('Escape')
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')
    page.wait_for_timeout(2500)
    portadas = page.evaluate(
        "() => [...document.querySelectorAll('img')].filter((i) => i.src.startsWith('blob:')).length")
    print('portadas guardadas (blob:):', portadas)
    r.comprobar(portadas > 0, 'no se ve ninguna portada: ¿blob: bloqueado?')

    # ── EPUB: iframe, hojas de estilo blob: y su política propia
    comun.anadir_libro(page, comun.EPUB)
    comun.abrir_libro(page, '.epub')
    page.wait_for_timeout(5000)
    for _ in range(3):     # el libro abre por la cubierta, que no tiene texto
        page.keyboard.press('ArrowRight')
        page.wait_for_timeout(1500)
    page.wait_for_timeout(1200)
    hijos = [f for f in page.frames if f != page.main_frame]
    texto, politica = 0, ''
    for f in hijos:
        try:
            texto = max(texto, f.evaluate("() => (document.body?.textContent || '').trim().length"))
            politica = f.evaluate(
                """() => document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || ''"""
            ) or politica
        except Exception:
            pass
    print('texto del capítulo:', texto, 'caracteres')
    r.comprobar(texto > 0, 'el capítulo EPUB no se ha cargado en su iframe')
    r.comprobar("default-src 'none'" in politica and 'nonce-' in politica,
                'el capítulo EPUB ha perdido su propia política de seguridad')
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')

    # ── Fórmulas: MathJax dentro del iframe, con su configuración
    formulas = comun.SALIDA / 'formulas.epub'
    epub_con_formulas(formulas)
    comun.anadir_libro(page, formulas)
    comun.abrir_libro(page, 'formulas')
    page.wait_for_timeout(9000)
    cargado = renderizadas = 0
    configurado = False
    for f in [x for x in page.frames if x != page.main_frame]:
        try:
            cargado = max(cargado, int(bool(f.evaluate("() => typeof window.MathJax === 'object'"))))
            renderizadas = max(renderizadas, f.evaluate("() => document.querySelectorAll('mjx-container').length"))
            configurado = configurado or f.evaluate(
                "() => window.MathJax?.config?.options?.enableMenu === false")
        except Exception:
            pass
    print('MathJax cargado:', bool(cargado), '| fórmulas:', renderizadas, '| con su configuración:', configurado)
    r.comprobar(renderizadas > 0, 'MathJax no ha renderizado las fórmulas')
    r.comprobar(configurado, 'MathJax se ha quedado con su configuración de fábrica')
    page.locator('#contenedor-epub').screenshot(path=str(comun.SALIDA / 'formulas.png'))
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')

    # ── La tipografía que trae el libro
    #
    # Las fuentes incrustadas se sirven desde una dirección «blob:», y la
    # política las bloqueaba: un libro con fórmulas —que casi siempre trae la
    # suya— se veía con la letra del sistema y los símbolos donde podían.
    fuente = fuente_del_sistema()
    if not fuente:
        print('sin fuentes en /usr/share/fonts: no se prueba la tipografía del libro.')
    else:
        libro = comun.SALIDA / 'con-fuente.epub'
        epub_con_fuente(libro, fuente)
        comun.anadir_libro(page, libro)
        comun.abrir_libro(page, 'con-fuente')
        page.wait_for_timeout(6000)
        estado = ''
        for f in [x for x in page.frames if x != page.main_frame]:
            try:
                estado = f.evaluate(
                    """() => [...document.fonts]
                         .filter((f) => f.family === 'LetraDelLibro')
                         .map((f) => f.status).join(',')""") or estado
            except Exception:
                pass
        print('tipografía del libro:', estado or '(no aparece)')
        r.comprobar(estado == 'loaded',
                    f'la fuente del libro no se ha cargado (estado: {estado or "ninguno"})')
        page.click('#btn-volver')
        page.wait_for_selector('#vista-biblioteca:not(.oculto)')

    # ── Descarga de una copia (blob + JSZip)
    page.click('#btn-archivos')
    page.wait_for_timeout(500)
    with page.expect_download(timeout=60000) as descarga:
        page.click('#btn-exportar-biblioteca')
    print('copia descargada:', descarga.value.suggested_filename)
    page.click('#btn-cerrar-archivos')

    # ── WebDAV: conexión a otro origen
    with comun.nube_webdav() as (url, carpeta):
        if url:
            shutil.copy(comun.EPUB, carpeta / comun.EPUB.name)
            page.click('#btn-ajustes')
            page.fill('#campo-url', url)
            page.fill('#campo-usuario', 'u')
            page.fill('#campo-clave', 'c')
            page.click('#btn-probar')
            page.wait_for_timeout(3000)
            clases = page.get_attribute('#resultado-prueba', 'class') or ''
            print('prueba de conexión:', page.inner_text('#resultado-prueba')[:60])
            r.comprobar('error' not in clases, 'la conexión WebDAV falla: ¿connect-src bloqueado?')
        else:
            print('rclone no está: no se prueba el WebDAV.')

    nav.close()

r.terminar()
