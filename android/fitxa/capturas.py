"""Saca las capturas de la ficha de Google Play: 1080 × 1920, de la app real.

    python3 android/fitxa/capturas.py [es,ca,...]

Cuatro por idioma, con los libros de ejemplo de cada uno (gallego y euskera
usan los castellanos): la biblioteca, un capítulo de EPUB en sepia, el índice
y un PDF en oscuro. Quedan en android/fitxa/capturas/ en JPEG, que Play admite:
unos 260 KB cada una, frente a los 320 KB del PNG.
"""

import pathlib
import subprocess
import sys

AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / 'tests' / 'e2e'))

from playwright.sync_api import sync_playwright  # noqa: E402
import comun  # noqa: E402

SALIDA = AQUI / 'capturas'
# La entrada del índice que lleva a un capítulo con texto, y las páginas que
# se avanzan en el PDF para llegar a una que se lea (el inglés tiene cinco).
CAPITULO = {'es': 6, 'gl': 6, 'eu': 6, 'ca': 4, 'en': 5}
PAGINAS_PDF = {'es': 4, 'gl': 4, 'eu': 4, 'ca': 4, 'en': 0}


def preparar(nav, base, idioma, tema):
    c = nav.new_context(locale=idioma, viewport={'width': 360, 'height': 640},
                        device_scale_factor=3, is_mobile=True, has_touch=True)
    c.add_init_script(f"localStorage.setItem('lector.idioma', '{idioma}');"
                      f"localStorage.setItem('lector.tema', '{tema}');")
    page = c.new_page()
    page.goto(base)
    page.wait_for_selector('#lista-locales li[data-id-libro]')
    # Las portadas se generan después de pintar la lista: se recarga para verlas.
    page.wait_for_timeout(6000)
    page.reload()
    page.wait_for_selector('#lista-locales li[data-id-libro]')
    page.wait_for_timeout(3000)
    for boton in ('#btn-cerrar-aviso-config', '#btn-cerrar-aviso-ejemplos'):
        if page.is_visible(boton):
            page.click(boton)
    page.wait_for_timeout(600)
    return c, page


def abrir(page, formato):
    page.evaluate("""(formato) => {
      const fila = [...document.querySelectorAll('#lista-locales li[data-id-libro]')]
        .find((l) => l.dataset.idLibro.toLowerCase().includes('.' + formato));
      (fila.querySelector('.nombre') || fila).click();
    }""", formato)
    page.wait_for_selector('#vista-lector:not(.oculto)')
    page.wait_for_timeout(3500)


def indice(page):
    # En el móvil el botón del índice va dentro del menú: se pulsa por código.
    page.evaluate("document.getElementById('btn-indice-libro').click()")
    page.wait_for_timeout(1500)


def guardar(page, nombre):
    png = SALIDA / f'{nombre}.png'
    page.screenshot(path=str(png))
    subprocess.run(['convert', str(png), '-quality', '90', str(png.with_suffix('.jpg'))], check=True)
    png.unlink()


idiomas = sys.argv[1].split(',') if len(sys.argv) > 1 else list(CAPITULO)
SALIDA.mkdir(exist_ok=True)
with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    for idioma in idiomas:
        c, page = preparar(nav, base, idioma, 'claro')
        guardar(page, f'{idioma}-1-biblioteca')
        abrir(page, 'epub')
        indice(page)
        guardar(page, f'{idioma}-3-indice')
        c.close()

        c, page = preparar(nav, base, idioma, 'sepia')
        abrir(page, 'epub')
        indice(page)
        page.locator('.entrada-indice-libro').nth(CAPITULO[idioma]).click()
        page.wait_for_timeout(2500)
        page.keyboard.press('Escape')
        page.wait_for_timeout(1200)
        guardar(page, f'{idioma}-2-epub')
        c.close()

        c, page = preparar(nav, base, idioma, 'oscuro')
        abrir(page, 'pdf')
        for _ in range(PAGINAS_PDF[idioma]):
            page.keyboard.press('ArrowRight')
            page.wait_for_timeout(800)
        page.wait_for_timeout(2000)
        guardar(page, f'{idioma}-4-pdf')
        c.close()
    nav.close()
