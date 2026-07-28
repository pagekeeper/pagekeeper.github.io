"""El tiempo dedicado en la barra del pie y la ficha que abre al pulsarlo.

Mira también que la barra quepa: es de donde nació esta prueba, porque en un
móvil estrecho el dato se salía por la izquierda y no había forma de pulsarlo.
"""

import json

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('ficha del libro')

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)

    for etiqueta, ancho, movil in (('escritorio', 1200, False), ('móvil', 390, True)):
        page = comun.pagina(nav, r, base, ancho=ancho, movil=movil, etiqueta=etiqueta)
        comun.anadir_libro(page, comun.PDF)
        comun.abrir_libro(page, '.pdf')
        page.wait_for_timeout(1200)
        comun.sembrar_tiempo(page, comun.id_libro_abierto(page), otro_aparato=2700)
        page.keyboard.press('ArrowRight')      # fuerza el repintado de la barra
        page.wait_for_timeout(900)

        datos = page.locator('#barra-estado-lector .dato-estado').all_inner_texts()
        print(f'[{etiqueta}] barra:', json.dumps(datos, ensure_ascii=False))
        pulsable = page.locator('#barra-estado-lector .dato-estado-pulsable')
        if not r.comprobar(pulsable.count() == 1,
                           f'[{etiqueta}] debería haber un único dato pulsable, hay {pulsable.count()}'):
            continue

        sitio = page.evaluate("""() => {
          const barra = document.getElementById('barra-estado-lector');
          const boton = document.querySelector('.dato-estado-pulsable');
          const cb = barra.getBoundingClientRect(), db = boton.getBoundingClientRect();
          return { dentro: db.left >= cb.left - 1 && db.right <= cb.right + 1 };
        }""")
        r.comprobar(sitio['dentro'], f'[{etiqueta}] el tiempo se sale de la barra y no se puede pulsar')
        page.locator('#vista-lector').screenshot(path=str(comun.SALIDA / f'barra-{etiqueta}.png'))

        # Desde la barra
        pulsable.click()
        page.wait_for_selector('#ficha-libro:not(.oculto)')
        page.wait_for_timeout(400)
        cifras = page.locator('#cifras-ficha-libro li').all_inner_texts()
        reparto = page.locator('#lista-reparto-ficha li').all_inner_texts()
        print(f'[{etiqueta}] cifras:', json.dumps(cifras, ensure_ascii=False))
        print(f'[{etiqueta}] reparto:', json.dumps(reparto, ensure_ascii=False))
        r.comprobar(len(cifras) >= 3, f'[{etiqueta}] la ficha enseña muy pocas cifras')
        r.comprobar(len(reparto) == 2, f'[{etiqueta}] el reparto debería listar los dos aparatos')
        page.screenshot(path=str(comun.SALIDA / f'ficha-{etiqueta}.png'))

        page.keyboard.press('Escape')
        page.wait_for_function("() => document.getElementById('ficha-libro').classList.contains('oculto')")

        # Desde el menú «⋯» de la biblioteca
        page.click('#btn-volver')
        page.wait_for_selector('#vista-biblioteca:not(.oculto)')
        abierto = page.evaluate("""() => {
          const fila = document.querySelector('#lista-locales li[data-id-libro]');
          const boton = fila?.querySelector('.btn-menu-libro, [class*="menu"]');
          if (!boton) return false;
          boton.click();
          return true;
        }""")
        page.wait_for_timeout(400)
        opcion = page.locator('.item-menu-libro', has_text='Tiempo de lectura')
        if r.comprobar(abierto and opcion.count() > 0,
                       f'[{etiqueta}] falta «Tiempo de lectura» en el menú «⋯»'):
            opcion.first.click()
            page.wait_for_selector('#ficha-libro:not(.oculto)')
            page.mouse.click(5, 5)      # pulsar fuera cierra
            page.wait_for_function("() => document.getElementById('ficha-libro').classList.contains('oculto')")
            print(f'[{etiqueta}] se abre desde el menú y se cierra pulsando fuera ✓')
        page.context.close()

    # ── Un libro recién abierto no enseña tiempo que no tiene
    page = comun.pagina(nav, r, base, etiqueta='limpio')
    comun.anadir_libro(page, comun.PDF)
    comun.abrir_libro(page, '.pdf')
    page.wait_for_timeout(1500)
    r.comprobar(page.locator('#barra-estado-lector .dato-estado-pulsable').count() == 0,
                'un libro sin leer no debería enseñar tiempo dedicado')

    nav.close()

r.terminar()
