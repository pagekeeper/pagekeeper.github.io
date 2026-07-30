"""Abrir PageKeeper y aparecer directamente en el último libro.

La casilla del final de «Continuar leyendo» solo se puede comprobar en un
navegador de verdad: lo que decide es qué se ve al cargar la página, y eso pasa
por el arranque entero (biblioteca, progreso y lector).
"""

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('apertura directa')


def en_el_lector(page):
    return page.evaluate(
        "() => !document.getElementById('vista-lector').classList.contains('oculto')")


with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base)

    comun.anadir_libro(page, comun.EPUB)
    comun.abrir_libro(page, '.epub')
    page.wait_for_timeout(1500)
    page.click('#btn-volver')
    page.wait_for_selector('#continuar-leyendo:not(.oculto)')

    casilla = page.locator('#casilla-abrir-ultimo')
    r.comprobar(casilla.count() == 1, 'no hay casilla de apertura directa en el recuadro')
    r.comprobar(not casilla.is_checked(), 'la casilla debería venir desmarcada')

    # Sin marcarla, recargar deja la biblioteca delante.
    page.reload()
    page.wait_for_selector('#continuar-leyendo:not(.oculto)')
    page.wait_for_timeout(1500)
    r.comprobar(not en_el_lector(page), 'apagada, el arranque no debería abrir ningún libro')

    casilla.check()
    r.comprobar(
        page.evaluate("() => localStorage.getItem('lector.abrirUltimoAlArrancar')") == '1',
        'la casilla no guarda la preferencia')
    # La de los ajustes es la misma preferencia vista desde otro sitio.
    page.click('#btn-ajustes')
    page.wait_for_timeout(400)
    page.click('#pestana-ajustes-biblioteca')
    page.wait_for_timeout(300)
    r.comprobar(page.locator('#casilla-abrir-ultimo-ajustes').is_checked(),
                'la casilla de los ajustes no refleja lo elegido en el recuadro')
    page.keyboard.press('Escape')
    page.wait_for_timeout(400)

    page.reload()
    page.wait_for_selector('#vista-lector:not(.oculto)', timeout=30000)
    page.wait_for_timeout(1500)
    r.comprobar(en_el_lector(page), 'encendida, el arranque debería llevar al último libro')
    page.screenshot(path=str(comun.SALIDA / 'apertura-directa.png'))

    # Y al cerrar el libro se vuelve a la biblioteca, no a un hueco: la entrada
    # del historial del lector tiene que estar puesta aunque nadie la pulsara.
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')
    page.wait_for_timeout(800)
    r.comprobar(not en_el_lector(page), 'al cerrar el libro no se vuelve a la biblioteca')

    # Un libro quitado de «Continuar leyendo» tampoco se abre solo.
    page.wait_for_selector('#continuar-leyendo:not(.oculto)')
    page.locator('#libro-continuar .btn-quitar-continuar').first.click()
    page.wait_for_timeout(600)
    page.reload()
    page.wait_for_timeout(3000)
    r.comprobar(not en_el_lector(page),
                'un libro apartado del recuadro no debería abrirse al arrancar')

r.terminar()
