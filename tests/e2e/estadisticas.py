"""La pantalla de estadísticas: vacía, con datos, en tres idiomas y borrándola.

Comprueba además que leer de verdad deja rastro: se pasan páginas despacio
para que las muestras cuenten, y se mira que el registro las haya apuntado.
"""

import json
import sys

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('estadísticas')

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)

    # ── Sin nada leído
    page = comun.pagina(nav, r, base)
    page.click('#btn-estadisticas')
    page.wait_for_selector('#vista-estadisticas:not(.oculto)')
    r.comprobar(page.is_visible('#estadisticas-vacio'),
                'sin lecturas debería salir el aviso de que no hay nada que contar')
    page.screenshot(path=str(comun.SALIDA / 'estadisticas-vacia.png'))
    page.click('#btn-cerrar-estadisticas')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')

    # ── Leer de verdad deja rastro
    comun.anadir_libro(page, comun.PDF)
    comun.abrir_libro(page, '.pdf')
    comun.leer_un_rato(page, vueltas=4)
    apuntado = page.evaluate("""() => {
      const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{}');
      const libros = Object.entries(datos.libros || {}).filter(([, e]) => e.tiempos);
      return { libros: libros.length, dias: Object.keys(datos.estadisticas || {}).length };
    }""")
    print('tras leer:', apuntado)
    r.comprobar(apuntado['libros'] >= 1, 'leer no ha dejado tiempo apuntado en ningún libro')
    r.comprobar(apuntado['dias'] >= 1, 'leer no ha dejado ningún día apuntado')
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')

    # ── Con un histórico sembrado
    comun.sembrar_dias(page)
    comun.sembrar_tiempo(page, comun.id_libro_abierto(page), segundos=9000,
                         paginas=210, otro_aparato=5400)
    page.click('#btn-estadisticas')
    page.wait_for_selector('#vista-estadisticas:not(.oculto)')
    page.wait_for_timeout(400)

    cifras = page.locator('.cifra-estadistica').all_inner_texts()
    print('cifras:', json.dumps(cifras, ensure_ascii=False))
    r.comprobar(len(cifras) >= 5, f'esperaba varias cifras y hay {len(cifras)}')
    r.comprobar(page.locator('.columna-dia').count() == 30,
                'el gráfico debería tener 30 columnas')
    r.comprobar(page.locator('.barra-dia.sin-lectura').count() > 0,
                'los días sin leer deberían dejar su raya')
    r.comprobar(page.locator('.reparto-estadistica').count() > 0,
                'falta el reparto por dispositivo en la lista de libros')
    r.comprobar(page.is_visible('#nota-varios-dispositivos'),
                'con dos aparatos hay que avisar de que las cifras son la suma')
    etiqueta = page.get_attribute('#grafico-estadisticas', 'aria-label') or ''
    r.comprobar('30' in etiqueta, 'el gráfico debe anunciarse con su resumen')
    page.screenshot(path=str(comun.SALIDA / 'estadisticas.png'), full_page=True)

    # ── Los tres idiomas (el selector vive en la cabecera de la biblioteca)
    for idioma, titulo in (('ca', 'Estadístiques'), ('en', 'Reading statistics'), ('es', 'Estadísticas')):
        page.click('#btn-cerrar-estadisticas')
        page.wait_for_selector('#vista-biblioteca:not(.oculto)')
        page.select_option('#selector-idioma', idioma)
        page.wait_for_timeout(300)
        page.click('#btn-estadisticas')
        page.wait_for_selector('#vista-estadisticas:not(.oculto)')
        page.wait_for_timeout(300)
        visto = page.inner_text('#vista-estadisticas h1')
        print(f'[{idioma}]', visto, '|', page.inner_text('#pie-grafico')[:50])
        r.comprobar(titulo in visto, f'en {idioma} el título no está traducido: {visto}')

    # ── Volver atrás cierra la pantalla
    page.go_back()
    page.wait_for_timeout(400)
    r.comprobar(page.is_visible('#vista-biblioteca') and not page.is_visible('#vista-estadisticas'),
                'el botón atrás del navegador debería volver a la biblioteca')

    # ── Se abre también desde Ajustes → Datos
    page.click('#btn-ajustes')
    page.click('#pestana-ajustes-datos')
    page.wait_for_timeout(300)
    print('resumen en ajustes:', page.inner_text('#resumen-estadisticas')[:60])
    page.click('#btn-ver-estadisticas')
    page.wait_for_selector('#vista-estadisticas:not(.oculto)')

    # ── Borrar
    page.once('dialog', lambda d: d.accept())
    page.click('#btn-borrar-estadisticas')
    page.wait_for_timeout(500)
    queda = page.evaluate("""() => {
      const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{}');
      return Object.values(datos.libros || {}).some((e) => e.tiempos) || Boolean(datos.estadisticas);
    }""")
    r.comprobar(page.is_visible('#estadisticas-vacio'), 'tras borrar debería quedar la pantalla vacía')
    r.comprobar(not queda, 'tras borrar siguen quedando tiempos en el registro')

    # ── Y todo esto cabe en un móvil
    m = comun.pagina(nav, r, base, ancho=390, alto=844, movil=True, etiqueta='móvil')
    comun.sembrar_dias(m)
    m.click('#btn-estadisticas')
    m.wait_for_selector('#vista-estadisticas:not(.oculto)')
    m.wait_for_timeout(400)
    r.comprobar(m.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth"),
                'en móvil la página se desborda a lo ancho')
    m.screenshot(path=str(comun.SALIDA / 'estadisticas-movil.png'), full_page=True)

    nav.close()

r.terminar()
