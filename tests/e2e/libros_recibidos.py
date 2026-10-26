"""Los libros que llegan de otra aplicación: «Abrir con» y «Compartir».

«Abrir con» llega por `launchQueue`, que Chromium solo rellena cuando lo lanza
el sistema; aquí se pone uno de mentira antes de cargar la página y se le
entregan los archivos a mano, como haría el navegador. Se prueba con un libro
ya abierto, que es el caso delicado: el que llega tiene que ocupar el lector.

«Compartir» pasa por el service worker, que la aplicación solo registra en
https; aquí se registra a mano y se le manda el mismo POST que mandaría
Android, con un archivo sin extensión, como los que pasan muchas aplicaciones.
"""

import pathlib

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('libros_recibidos')
ALICE = comun.EJEMPLOS / 'alice-in-wonderland-en.epub'

LANZADOR_FALSO = """
// Chromium ya trae un launchQueue propio, que no deja reasignar.
Object.defineProperty(window, 'launchQueue', {
  configurable: true,
  value: { setConsumer(consumidor) { window.__consumidor = consumidor; } },
});
window.__lanzar = async (archivos) => {
  const manejadores = archivos.map(({ nombre, tipo, base64 }) => ({
    getFile: async () => new File(
      [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], nombre, { type: tipo }),
  }));
  window.__consumidor({ files: manejadores });
};
"""

INVENTARIO = """() => new Promise((listo) => {
  const p = indexedDB.open('lector-pdf');
  p.onsuccess = () => {
    const tx = p.result.transaction('libros', 'readonly');
    const q = tx.objectStore('libros').getAll();
    q.onsuccess = () => { listo(q.result.map((l) => l.nombre)); p.result.close(); };
  };
})"""


def base64(ruta):
    import base64 as b64
    return b64.b64encode(pathlib.Path(ruta).read_bytes()).decode()


with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)

    # ── «Abrir con», con otro libro ya en el lector ──
    contexto = nav.new_context(locale='es-ES', viewport={'width': 412, 'height': 860},
                               is_mobile=True, has_touch=True)
    contexto.add_init_script(LANZADOR_FALSO)
    page = contexto.new_page()
    comun.escuchar(page, r, 'abrir con')
    page.goto(base)
    page.wait_for_selector('#btn-estadisticas')
    page.wait_for_timeout(1500)
    comun.abrir_libro(page, 'lazarillo')
    page.wait_for_selector('#vista-lector:not(.oculto)')
    page.wait_for_timeout(1500)
    r.comprobar('Lazarillo' in page.inner_text('#titulo-libro'), 'no se abrió el Lazarillo de partida')

    page.evaluate('(archivos) => window.__lanzar(archivos)',
                  [{'nombre': 'alice-in-wonderland-en.epub', 'tipo': 'application/epub+zip',
                    'base64': base64(ALICE)}])
    page.wait_for_timeout(3000)
    titulo = page.inner_text('#titulo-libro')
    print('lector tras «Abrir con»:', titulo)
    r.comprobar(page.is_visible('#vista-lector'), 'el lector se ha cerrado al recibir un libro')
    r.comprobar('alice' in titulo.lower(), f'el lector no enseña el libro recibido: «{titulo}»')
    page.screenshot(path=str(comun.SALIDA / 'recibido-abrir-con.png'))
    nombres = page.evaluate(INVENTARIO)
    r.comprobar('alice-in-wonderland-en.epub' in nombres, 'el libro recibido no está en la biblioteca')

    # El mismo archivo otra vez no entra repetido: se abre el que ya hay.
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')
    page.evaluate('(archivos) => window.__lanzar(archivos)',
                  [{'nombre': 'alice-in-wonderland-en.epub', 'tipo': 'application/epub+zip',
                    'base64': base64(ALICE)}])
    page.wait_for_timeout(3000)
    r.comprobar(page.evaluate(INVENTARIO).count('alice-in-wonderland-en.epub') == 1,
                'el mismo libro ha entrado dos veces')
    r.comprobar(page.is_visible('#vista-lector'), 'el libro repetido no se ha abierto')
    contexto.close()

    # ── «Compartir», por el service worker ──
    contexto = nav.new_context(locale='es-ES', viewport={'width': 412, 'height': 860},
                               is_mobile=True, has_touch=True)
    page = contexto.new_page()
    comun.escuchar(page, r, 'compartir')
    page.goto(base)
    page.wait_for_selector('#btn-estadisticas')
    controlada = page.evaluate("""async () => {
      await navigator.serviceWorker.register('sw.js');
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise((listo) => navigator.serviceWorker.addEventListener('controllerchange', listo));
      }
      return !!navigator.serviceWorker.controller;
    }""")
    r.comprobar(controlada, 'el service worker no controla la página')
    respuesta = page.evaluate("""async (base64) => {
      const datos = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const formulario = new FormData();
      formulario.append('libros', new File([datos], 'document', { type: 'application/pdf' }));
      const r = await fetch('./?compartir', { method: 'POST', body: formulario });
      return { estado: r.status, url: r.url };
    }""", base64(comun.PDF.with_name('orientaciones-herramientas-digitales-es.pdf')))
    print('respuesta al POST:', respuesta)
    # Una redirección que fabrica el service worker no sale como «redirected»,
    # pero la respuesta ya es la de la página a la que manda.
    r.comprobar(respuesta['url'].endswith('?compartido'),
                f'el service worker no ha redirigido a ?compartido: {respuesta}')

    page.goto(base + '?compartido')
    page.wait_for_selector('#btn-estadisticas')
    page.wait_for_timeout(4000)
    print('dirección tras recoger:', page.url)
    r.comprobar('compartido' not in page.url, 'la dirección sigue con ?compartido')
    nombres = page.evaluate(INVENTARIO)
    print('biblioteca:', nombres)
    # Es el mismo PDF que el ejemplo precargado: entra como duplicado y se abre el que había.
    r.comprobar(page.is_visible('#vista-lector'), 'el libro compartido no se ha abierto')
    r.comprobar('document.pdf' not in nombres, 'el compartido repetido ha entrado como libro nuevo')
    quedan = page.evaluate("async () => (await (await caches.open('pagekeeper-compartidos')).keys()).length")
    r.comprobar(quedan == 0, f'quedan {quedan} archivos compartidos en la caché')
    page.screenshot(path=str(comun.SALIDA / 'recibido-compartir.png'))

    # Uno que no estaba: un EPUB sin extensión.
    page.click('#btn-volver')
    page.evaluate("""async (base64) => {
      const datos = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const formulario = new FormData();
      formulario.append('libros', new File([datos], '12345', { type: 'application/epub+zip' }));
      await fetch('./?compartir', { method: 'POST', body: formulario });
    }""", base64(ALICE))
    page.goto(base + '?compartido')
    page.wait_for_selector('#btn-estadisticas')
    page.wait_for_timeout(4000)
    nombres = page.evaluate(INVENTARIO)
    print('biblioteca:', nombres)
    r.comprobar('12345.epub' in nombres, 'el EPUB sin extensión no ha entrado como «12345.epub»')
    r.comprobar(page.is_visible('#vista-lector'), 'el EPUB compartido no se ha abierto')
    contexto.close()

    # ── La política de privacidad ──
    contexto = nav.new_context(locale='es-ES', viewport={'width': 360, 'height': 800})
    page = contexto.new_page()
    comun.escuchar(page, r, 'privacidad')
    page.goto(base)
    page.wait_for_selector('#btn-estadisticas')
    r.comprobar(page.locator('a[href="privacidad.html"]').count() == 1, 'el pie no enlaza la política')
    page.evaluate("localStorage.setItem('lector.idioma', 'ca')")
    page.goto(base + 'privacidad.html')
    visibles = page.evaluate("[...document.querySelectorAll('article')].filter((a) => !a.hidden).map((a) => a.lang)")
    r.comprobar(visibles == ['ca'], f'la política debería verse solo en catalán: {visibles}')
    r.comprobar(page.evaluate('document.documentElement.scrollWidth <= innerWidth'),
                'la política se sale de lado a 360 px')
    page.select_option('#selector-idioma', 'eu')
    r.comprobar(page.inner_text('h1:visible') == 'Pribatutasun-politika', 'el selector no cambia de idioma')
    page.screenshot(path=str(comun.SALIDA / 'privacidad-360.png'), full_page=True)
    contexto.close()

    nav.close()

r.terminar()
