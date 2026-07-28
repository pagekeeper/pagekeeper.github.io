"""Que la ayuda esté traducida a los tres idiomas.

La ayuda en español vive en index.html y las otras dos son copias completas
dentro de js/i18n.js, así que es fácil añadir un apartado y olvidarse de las
traducciones: eso es justo lo que mira esta prueba.
"""

from playwright.sync_api import sync_playwright

import comun

# Un apartado de cada pestaña, con su título en los tres idiomas.
APARTADOS = [
    ('biblioteca', {'es': 'Estadísticas de lectura',
                    'ca': 'Estadístiques de lectura',
                    'en': 'Reading statistics'}),
    ('biblioteca', {'es': 'Importar y exportar',
                    'ca': 'Importar i exportar',
                    'en': 'Import and export'}),
]

r = comun.Resultado('ayuda')

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base)

    for idioma in ('es', 'ca', 'en'):
        page.select_option('#selector-idioma', idioma)
        page.wait_for_timeout(400)
        page.click('#btn-ayuda')
        page.wait_for_selector('#vista-ayuda:not(.oculto)')
        for pestana, titulos in APARTADOS:
            page.click(f'#vista-ayuda [data-panel="{pestana}"][role="tab"]')
            page.wait_for_timeout(250)
            titulo = titulos[idioma]
            encontrado = page.locator(
                f'#panel-ayuda-{pestana} summary:text-is("{titulo}")').count()
            print(f'[{idioma}] {titulo}:', 'sí' if encontrado else 'NO')
            r.comprobar(encontrado == 1,
                        f'en {idioma} falta (o está repetido) el apartado «{titulo}»')
        page.click('#btn-cerrar-ayuda')
        page.wait_for_selector('#vista-biblioteca:not(.oculto)')

    nav.close()

r.terminar()
