"""Que la barra del pie quepa en pantallas estrechas, con todos sus datos.

El peor caso es un EPUB en modo «página a página»: tiempo dedicado, pantalla
del capítulo, pantalla del libro y tiempo restante, los cuatro a la vez. Se
comprueba además el modo continuo, donde no hay pantallas que contar y en su
lugar va el porcentaje.
"""

from playwright.sync_api import sync_playwright

import comun

ANCHOS = (360, 390, 430)

r = comun.Resultado('barra del pie')

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)

    for libro, nombre in ((comun.EPUB, 'EPUB'), (comun.PDF, 'PDF')):
        for ancho in ANCHOS:
            page = comun.pagina(nav, r, base, ancho=ancho, alto=780, movil=True,
                                etiqueta=f'{nombre} {ancho}px')
            comun.anadir_libro(page, libro)
            comun.abrir_libro(page, '.epub' if libro is comun.EPUB else '.pdf')
            page.wait_for_timeout(5000)
            id_libro = comun.id_libro_abierto(page)
            comun.sembrar_tiempo(page, id_libro, segundos=45296, paginas=300)
            comun.sembrar_ritmo(page, id_libro)
            for _ in range(4):
                page.keyboard.press('ArrowRight')
                page.wait_for_timeout(900)
            page.wait_for_timeout(1200)

            datos = page.locator('#barra-estado-lector .dato-estado').all_inner_texts()
            medida = page.evaluate("""() => {
              const barra = document.getElementById('barra-estado-lector');
              const hijos = [...barra.querySelectorAll('.dato-estado')];
              if (!hijos.length) return null;
              const caja = barra.getBoundingClientRect();
              const primero = hijos[0].getBoundingClientRect();
              const ultimo = hijos.at(-1).getBoundingClientRect();
              return {
                sobra: Math.round(caja.width - (ultimo.right - primero.left)),
                cabe: primero.left >= caja.left - 1 && ultimo.right <= caja.right + 1,
              };
            }""")
            print(f'{nombre} {ancho}px', ' · '.join(datos), '→', medida)
            r.comprobar(medida and medida['cabe'],
                        f'{nombre} a {ancho}px: la barra no cabe y algún dato queda inalcanzable')
            if ancho == ANCHOS[0]:
                page.locator('#barra-estado-lector').screenshot(
                    path=str(comun.SALIDA / f'barra-pie-{nombre}.png'))
            page.context.close()

    # ── Modo continuo: sin pantallas, pero con porcentaje
    page = comun.pagina(nav, r, base, ancho=1280, etiqueta='continuo')
    comun.anadir_libro(page, comun.EPUB)
    comun.abrir_libro(page, '.epub')
    page.wait_for_timeout(6000)
    comun.sembrar_tiempo(page, comun.id_libro_abierto(page))
    for _ in range(2):
        page.keyboard.press('ArrowRight')
        page.wait_for_timeout(1000)
    pagina_a_pagina = page.locator('#barra-estado-lector .dato-estado').all_inner_texts()
    print('página a página →', pagina_a_pagina)
    r.comprobar(any('%' not in d for d in pagina_a_pagina) and not any('%' in d for d in pagina_a_pagina),
                'con pantallas no debería repetirse el porcentaje')

    page.click('#btn-modo')
    page.wait_for_timeout(7000)
    continuo = page.locator('#barra-estado-lector .dato-estado').all_inner_texts()
    print('continuo      →', continuo)
    r.comprobar(any('%' in d for d in continuo),
                'en páginas continuas debería aparecer el porcentaje leído')

    nav.close()

r.terminar()
