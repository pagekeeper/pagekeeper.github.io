"""Dos navegadores distintos sobre la misma nube WebDAV.

Es la prueba que la lógica sola no puede dar: que el tiempo dedicado a un
libro acabe sumando lo leído en cada aparato, que los días sean comunes y que
borrar las estadísticas en uno las borre en el otro sin llevarse por delante
la posición de lectura.

Necesita rclone. Si no está, la prueba se salta.
"""

import json

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('dos dispositivos')

APAGADAS = """() => JSON.parse(localStorage.getItem('lector.progreso') || '{}')
  .sinEstadisticas?.activo === true"""


def configurar_nube(page, url):
    page.click('#btn-ajustes')
    page.fill('#campo-url', url)
    page.fill('#campo-usuario', 'usuario')
    page.fill('#campo-clave', 'clave')
    page.click('#formulario-webdav button[type="submit"]')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)', timeout=20000)
    page.wait_for_selector('#lista-libros li[data-id-libro]', timeout=20000)


def leer_de_la_nube(page, vueltas):
    page.locator('#lista-libros li[data-id-libro]').first.click()
    page.wait_for_selector('#vista-lector:not(.oculto)', timeout=30000)
    comun.leer_un_rato(page, vueltas=vueltas)
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')
    page.wait_for_timeout(2500)      # deja que suba la sincronización


def registro(page):
    return page.evaluate("""() => {
      const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{}');
      const libros = {};
      for (const [id, e] of Object.entries(datos.libros || {})) if (e.tiempos) libros[id] = e.tiempos;
      return { libros, estadisticas: datos.estadisticas || {} };
    }""")


with comun.nube_webdav() as (url, carpeta):
    if not url:
        print('rclone no está instalado: se salta la prueba de la nube.')
        raise SystemExit(0)

    import shutil
    shutil.copy(comun.EPUB, carpeta / comun.EPUB.name)

    with comun.servidor() as base, sync_playwright() as p:
        nav = comun.navegador(p)

        # ── Aparato A, el «ordenador»
        a = comun.pagina(nav, r, base, etiqueta='A')
        configurar_nube(a, url)
        leer_de_la_nube(a, vueltas=3)
        datos_a = registro(a)
        print('A apunta:', json.dumps(datos_a['libros'], ensure_ascii=False))

        # ── Aparato B, otro navegador con su propio almacenamiento
        b = comun.pagina(nav, r, base, ancho=390, alto=844, movil=True, etiqueta='B')
        configurar_nube(b, url)
        b.wait_for_timeout(1500)
        leer_de_la_nube(b, vueltas=2)
        datos_b = registro(b)
        print('B apunta:', json.dumps(datos_b['libros'], ensure_ascii=False))

        libro = next(iter(datos_b['libros']), None)
        if not r.comprobar(libro is not None, 'B no ha apuntado tiempo de ningún libro'):
            r.terminar()
        casillas_b = datos_b['libros'][libro]
        r.comprobar(len(casillas_b) == 2,
                    f'B debería ver los dos aparatos en «{libro}», ve {len(casillas_b)}')

        # ── A vuelve y ve el total
        a.reload()
        a.wait_for_selector('#lista-libros li[data-id-libro]', timeout=20000)
        a.wait_for_timeout(3000)
        casillas_a = registro(a)['libros'].get(libro, {})
        total_a = sum(c['s'] for c in casillas_a.values())
        total_b = sum(c['s'] for c in casillas_b.values())
        print(f'total visto por A: {total_a} s · por B: {total_b} s')
        r.comprobar(len(casillas_a) == 2, 'A debería ver los dos aparatos tras sincronizar')
        r.comprobar(total_a == total_b, f'los dos no ven el mismo total ({total_a} vs {total_b})')

        dias = registro(a)['estadisticas']
        r.comprobar(len(dias) == 2, f'los días deberían venir de dos aparatos, vienen de {len(dias)}')

        # El reparto se mira en la ficha del libro y no en «En qué se va el
        # tiempo»: esa lista deja fuera los libros de menos de cinco minutos, y
        # una prueba no puede leer tanto rato de verdad.
        a.click('#btn-estadisticas')
        a.wait_for_selector('#vista-estadisticas:not(.oculto)')
        a.wait_for_timeout(400)
        a.screenshot(path=str(comun.SALIDA / 'dos-dispositivos.png'), full_page=True)
        a.click('#btn-cerrar-estadisticas')
        a.wait_for_selector('#vista-biblioteca:not(.oculto)')
        a.locator('#lista-libros li[data-id-libro]').first.click()
        a.wait_for_selector('#vista-lector:not(.oculto)', timeout=30000)
        a.wait_for_timeout(1500)
        pulsable = a.locator('.dato-estado-pulsable')   # el tiempo de la barra del pie
        if r.comprobar(pulsable.count() == 1, 'la barra del pie no ofrece el tiempo dedicado'):
            pulsable.click()
            a.wait_for_selector('#ficha-libro:not(.oculto)')
            a.wait_for_timeout(400)
            reparto = a.locator('#lista-reparto-ficha li').all_inner_texts()
            print('desglose:', ' | '.join(t.replace('\n', ' ') for t in reparto) or '—')
            r.comprobar(len(reparto) == 2,
                        f'la ficha debería repartir el tiempo entre dos aparatos, enseña {len(reparto)}')
            a.keyboard.press('Escape')
            a.wait_for_function("() => document.getElementById('ficha-libro').classList.contains('oculto')")
        a.click('#btn-volver')
        a.wait_for_selector('#vista-biblioteca:not(.oculto)')

        # ── Borrar desde A alcanza a B
        a.click('#btn-estadisticas')      # se salió de aquí para ver la ficha
        a.wait_for_selector('#vista-estadisticas:not(.oculto)')
        a.wait_for_timeout(400)
        a.once('dialog', lambda d: d.accept())
        a.click('#btn-borrar-estadisticas')
        a.wait_for_timeout(3000)
        b.reload()
        b.wait_for_selector('#lista-libros li[data-id-libro]', timeout=20000)
        b.wait_for_timeout(3500)
        resto = registro(b)
        r.comprobar(not resto['libros'] and not resto['estadisticas'],
                    'el borrado no ha llegado al otro dispositivo')
        posiciones = b.evaluate("""() => {
          const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{}');
          return Object.values(datos.libros || {}).map((e) => e.pagina ?? e.cfi ?? null);
        }""")
        r.comprobar(any(posiciones), 'el borrado se ha llevado por delante la posición de lectura')

        # ── «No medir» decidido en A alcanza a B
        a.once('dialog', lambda d: d.accept())
        a.click('#casilla-sin-estadisticas')
        a.wait_for_timeout(3000)
        r.comprobar(a.evaluate(APAGADAS), 'A no ha registrado que no quiere que se le mida')

        b.reload()
        b.wait_for_selector('#lista-libros li[data-id-libro]', timeout=20000)
        b.wait_for_timeout(3500)
        r.comprobar(b.evaluate(APAGADAS), 'la decisión de no medir no ha llegado al otro dispositivo')
        r.comprobar(b.is_checked('#casilla-sin-estadisticas-ajustes'),
                    'B ha recibido la decisión pero su casilla no la enseña')

        # Y B, aunque lea, no apunta nada.
        leer_de_la_nube(b, vueltas=2)
        despues = registro(b)
        r.comprobar(not despues['libros'] and not despues['estadisticas'],
                    'B ha seguido midiendo con las estadísticas apagadas')

        nav.close()

r.terminar()
