"""Qué tiempo cuenta como lectura y qué no.

Lo que se puede decidir con una cuenta ya lo comprueba `tests/ritmo.test.mjs`;
aquí se mira lo que solo existe en un navegador: que el tramo abierto se cierre
al perder de vista la página o al cerrar el libro, y que el rato de ausencia no
se sume.

El aviso de pausa de la barra del pie no se comprueba aquí a propósito: lo
dispara un temporizador de cinco minutos con el reloj del navegador, y no hay
manera de adelantarlo desde fuera sin falsear justo lo que se quiere medir.
Cinco minutos de espera en la suite no valen lo que aportan.
"""

import json

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('tiempo de lectura')


def segundos_del_libro(page, id_libro):
    """Los segundos apuntados al libro, sumando todos los dispositivos."""
    return page.evaluate("""(id) => {
      const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{}');
      const tiempos = ((datos.libros || {})[id] || {}).tiempos || {};
      return Object.values(tiempos).reduce((suma, casilla) => suma + (casilla.s || 0), 0);
    }""", id_libro)


def cambiar_visibilidad(page, estado):
    """Oculta o devuelve la página como lo haría cambiar de pestaña."""
    page.evaluate("""(estado) => {
      Object.defineProperty(document, 'visibilityState',
        { get: () => estado, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    }""", estado)


with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base, ancho=1200, alto=900)
    comun.anadir_libro(page, comun.PDF)
    comun.abrir_libro(page, '.pdf')
    page.wait_for_timeout(2000)
    libro = comun.id_libro_abierto(page)

    # Un tramo normal: unos segundos en la página y pasar.
    page.wait_for_timeout(5000)
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(800)
    leido = segundos_del_libro(page, libro)
    print('tramo de 5 s →', leido, 's')
    r.comprobar(4 <= leido <= 9, f'un tramo de 5 s debería sumar unos 5, sumó {leido}')

    # Quedarse quieto mucho rato no cuesta el tramo entero (antes se descartaba
    # y sumaba cero): cuenta hasta el tope. Se adelanta el reloj en lugar de
    # esperar, que es lo mismo que pasaría estando quieto con el libro delante.
    page.evaluate("""() => {
      const original = Date.now;
      const salto = 20 * 60 * 1000;
      Date.now = () => original() + salto;
    }""")
    page.wait_for_timeout(400)
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(800)
    acotado = segundos_del_libro(page, libro) - leido
    print('tramo de 20 min →', acotado, 's')
    r.comprobar(295 <= acotado <= 305, f'debería acotarse a 300 s, sumó {acotado}')

    # Con la página fuera de la vista el reloj no corre.
    antes = segundos_del_libro(page, libro)
    cambiar_visibilidad(page, 'hidden')
    page.wait_for_timeout(6000)
    cambiar_visibilidad(page, 'visible')
    page.wait_for_timeout(300)
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(800)
    oculto = segundos_del_libro(page, libro) - antes
    print('6 s oculta →', oculto, 's')
    r.comprobar(oculto <= 3, f'el rato con la página oculta no debería sumar, sumó {oculto}')

    # Y la última página de la sesión también cuenta, aunque se cierre el libro
    # sin pasar de página.
    antes = segundos_del_libro(page, libro)
    page.wait_for_timeout(6000)
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')
    page.wait_for_timeout(800)
    final = segundos_del_libro(page, libro) - antes
    print('6 s y cerrar →', final, 's')
    r.comprobar(final >= 4, f'la última página antes de cerrar debería contar, sumó {final}')

    print('barra al final:', json.dumps(
        page.locator('#barra-estado-lector .dato-estado').all_inner_texts(), ensure_ascii=False))
    nav.close()

r.terminar()
