"""Las ilustraciones de un EPUB se abren a pantalla completa al pulsarlas.

El motivo es que subir el tamaño de la letra no las agranda: epub.js cambia el
`font-size` del cuerpo y el ancho de una foto está en píxeles o en un tanto por
ciento de la columna, así que con la letra grande la ilustración se queda igual
de pequeña.

Lo delicado no es abrirla, sino que las bandas invisibles de pasar página tapan
buena parte del texto —imágenes incluidas—, y el clic llega primero a la banda.
Esta prueba mira las dos cosas a la vez: que pulsando la imagen desde la banda
se abra el visor, y que un palmo más allá la misma banda siga pasando página.
"""

from playwright.sync_api import sync_playwright

import comun

# El libro de ejemplo con ilustraciones dentro del texto: el resto solo traen
# portada, y una portada no prueba la convivencia con las bandas.
EPUB_ILUSTRADO = comun.EJEMPLOS / 'lauca-del-senyor-esteve-ca.epub'

# La primera ilustración visible, en coordenadas de la ventana. El capítulo va
# en un iframe con las suyas propias, así que hay que sumar la caja del marco.
ILUSTRACION = """() => {
  for (const marco of document.querySelectorAll('#contenedor-epub iframe')) {
    const caja = marco.getBoundingClientRect();
    if (caja.width <= 0) continue;
    for (const img of marco.contentDocument.querySelectorAll('img, svg image, image')) {
      const c = img.getBoundingClientRect();
      if (c.width < 48 || c.height < 48) continue;
      const izq = caja.left + c.left;
      const arr = caja.top + c.top;
      if (izq + c.width < 0 || arr + c.height < 0 || izq > innerWidth || arr > innerHeight) continue;
      return { izq, arr, ancho: c.width, alto: c.height };
    }
  }
  return null;
}"""

VISOR_ABIERTO = "() => !document.getElementById('visor-imagen').classList.contains('oculto')"

POSICION = """() => {
  const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{}');
  const libros = Object.values(datos.libros || {});
  return libros.map((l) => String(l.cfi ?? '')).join('|');
}"""


def buscar_ilustracion(page, r):
    """Pasa páginas hasta encontrar una ilustración a la vista."""
    for _ in range(60):
        imagen = page.evaluate(ILUSTRACION)
        if imagen:
            return imagen
        page.click('#zona-siguiente')
        page.wait_for_timeout(400)
    r.fallo('no se encontró ninguna ilustración en las primeras 60 pantallas')
    return None


r = comun.Resultado('imagen ampliada')

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    # En móvil las bandas se comen una porción mayor de la pantalla, que es
    # donde el estorbo se nota.
    page = comun.pagina(nav, r, base, ancho=390, alto=844, movil=True)
    comun.anadir_libro(page, EPUB_ILUSTRADO)
    page.wait_for_selector('#contenedor-epub iframe', timeout=20000)
    page.wait_for_timeout(3000)

    imagen = buscar_ilustracion(page, r)
    if imagen:
        centro_y = imagen['arr'] + imagen['alto'] / 2
        # Un punto de la imagen que caiga dentro de la banda derecha; si no
        # llega hasta ella, vale su centro, que es el otro camino de entrada.
        borde = page.viewport_size['width'] - 8
        x = min(borde, imagen['izq'] + imagen['ancho'] - 4)
        encima = page.evaluate("([x, y]) => document.elementFromPoint(x, y)?.id", [x, centro_y])
        print('se pulsa la imagen sobre:', encima or '(el libro)')

        page.mouse.click(x, centro_y)
        page.wait_for_timeout(800)
        r.comprobar(page.evaluate(VISOR_ABIERTO), 'pulsar la ilustración no abre el visor')
        medidas = page.evaluate("""() => {
          const img = document.getElementById('imagen-ampliada');
          const c = img.getBoundingClientRect();
          return { ancho: c.width, alto: c.height, cargada: img.complete && img.naturalWidth > 0 };
        }""")
        r.comprobar(medidas['cargada'], 'la imagen ampliada no llega a cargarse')
        r.comprobar(medidas['ancho'] > imagen['ancho'],
                    f"ampliada no es mayor: {imagen['ancho']} → {medidas['ancho']}")
        page.screenshot(path=str(comun.SALIDA / 'imagen-ampliada.png'))

        # Escape cierra el visor y no toca el libro que hay debajo.
        antes = page.evaluate(POSICION)
        page.keyboard.press('Escape')
        page.wait_for_timeout(500)
        r.comprobar(not page.evaluate(VISOR_ABIERTO), 'Escape no cierra el visor')
        r.comprobar(page.evaluate(POSICION) == antes, 'cerrar el visor ha movido la lectura')

        # Y la misma banda, lejos de la imagen, sigue pasando página.
        fuera_y = max(imagen['arr'] - 40, page.viewport_size['height'] * 0.25)
        if fuera_y > imagen['arr'] - 10:
            fuera_y = min(imagen['arr'] + imagen['alto'] + 40,
                          page.viewport_size['height'] * 0.85)
        antes = page.evaluate(POSICION)
        page.mouse.click(borde, fuera_y)
        page.wait_for_timeout(1500)
        r.comprobar(not page.evaluate(VISOR_ABIERTO),
                    'la banda ha abierto el visor sin imagen debajo')
        r.comprobar(page.evaluate(POSICION) != antes,
                    'la banda ya no pasa de página fuera de la ilustración')

    page.close()
    nav.close()

r.terminar()
