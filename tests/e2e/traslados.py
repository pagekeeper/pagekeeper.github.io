"""Llevar un libro de la nube al dispositivo y al revés: traslado, no copia.

Lo que la lógica sola no demuestra: que después de «Mover a este dispositivo»
el libro ya no está en el servidor, que después de «Mover a la nube» ya no está
en este aparato, y que en ningún momento aparece en los dos sitios a la vez.

Necesita rclone. Si no está, la prueba se salta.
"""

import shutil

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('traslados')


def configurar_nube(page, url):
    page.click('#btn-ajustes')
    page.fill('#campo-url', url)
    page.fill('#campo-usuario', 'usuario')
    page.fill('#campo-clave', 'clave')
    page.click('#formulario-webdav button[type="submit"]')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)', timeout=20000)
    page.wait_for_timeout(1500)


def accion_del_menu(page, lista, texto, trozo):
    """Abre el menú «⋯» de una ficha (buscada por su identificador) y pulsa una acción."""
    return page.evaluate("""([lista, texto, trozo]) => {
      const fila = [...document.querySelectorAll(`#${lista} li[data-id-libro]`)]
        .find((l) => (l.dataset.idLibro || '').toLowerCase().includes(trozo));
      if (!fila) return false;
      fila.querySelector('.btn-menu-libro, [aria-haspopup]')?.click();
      const item = [...document.querySelectorAll('button, [role="menuitem"]')]
        .find((b) => b.textContent.trim() === texto && b.offsetParent !== null);
      if (!item) return false;
      item.click();
      return true;
    }""", [lista, texto, trozo])


def esta(page, lista, trozo):
    """¿Hay en esa lista una ficha cuyo identificador contenga el trozo?"""
    return page.evaluate("""([lista, trozo]) => [...document.querySelectorAll(
      `#${lista} li[data-id-libro]`)].some((l) => (l.dataset.idLibro || '').toLowerCase().includes(trozo))
    """, [lista, trozo])


with comun.nube_webdav() as (url, carpeta):
    if not url:
        print('rclone no está instalado: se salta la prueba de traslados.')
        raise SystemExit(0)

    # Un nombre propio, para no confundirlo con los libros de ejemplo que la
    # aplicación deja en el dispositivo la primera vez que se abre.
    NOMBRE = 'libro-de-la-nube.epub'
    TROZO = 'libro-de-la-nube'
    shutil.copy(comun.EPUB, carpeta / NOMBRE)

    with comun.servidor() as base, sync_playwright() as p:
        nav = comun.navegador(p)
        page = comun.pagina(nav, r, base)
        configurar_nube(page, url)

        # ── De la nube a este dispositivo ──
        r.comprobar(esta(page, 'lista-libros', TROZO), 'el libro debería estar en la nube al empezar')
        r.comprobar(not esta(page, 'lista-locales', TROZO),
                    'el libro no debería estar en el dispositivo al empezar')

        r.comprobar(accion_del_menu(page, 'lista-libros', 'Mover a este dispositivo', TROZO),
                    'no encuentro «Mover a este dispositivo» en el menú del libro de la nube')
        page.wait_for_timeout(7000)

        r.comprobar(esta(page, 'lista-locales', TROZO),
                    'el libro debería estar ahora en el dispositivo')
        r.comprobar(not esta(page, 'lista-libros', TROZO),
                    'el libro no debería seguir en la lista de la nube')
        r.comprobar(not (carpeta / NOMBRE).exists(),
                    'el archivo debería haber desaparecido del servidor WebDAV')

        # ── Y de vuelta a la nube ──
        r.comprobar(accion_del_menu(page, 'lista-locales', 'Mover a la nube', TROZO),
                    'no encuentro «Mover a la nube» en el menú del libro local')
        page.wait_for_timeout(7000)

        r.comprobar(esta(page, 'lista-libros', TROZO),
                    'el libro debería estar de vuelta en la nube')
        r.comprobar(not esta(page, 'lista-locales', TROZO),
                    'el libro no debería seguir en el dispositivo')
        r.comprobar((carpeta / NOMBRE).exists(),
                    'el archivo debería estar otra vez en el servidor WebDAV')

        page.screenshot(path=str(comun.SALIDA / 'traslados.png'))
        nav.close()

r.terminar()
