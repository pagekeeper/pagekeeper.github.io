"""Las dos maneras de moverse por el libro, que se estorban con facilidad.

En modo página se pasa de página por los cuatro márgenes, arrastrando el dedo
y con las flechas; en modo continuo manda el desplazamiento y ninguna de esas
cosas debe cambiar de página. La frontera entre las dos es fina: una regla de
CSS puesta para que el dedo hacia abajo no recargara la aplicación dejó sin
efecto la rueda del ratón en los EPUB continuos, porque cortaba justo la
propagación con la que epub.js desplaza el capítulo. Nada de lo que había lo
vio venir, así que esta prueba mira las dos a la vez.
"""

from playwright.sync_api import sync_playwright

import comun

# El toque no se lanza como ratón: en EPUB lo recoge el iframe del libro y
# app.js lo reenvía, así que hay que despacharlo en el documento que toque.
DESLIZA = """([x, y, dx, dy]) => {
  const marco = document.querySelector('#contenedor-epub iframe');
  const enEpub = marco && !document.getElementById('contenedor-epub').classList.contains('oculto');
  const ventana = enEpub ? marco.contentWindow : window;
  const destino = enEpub ? marco.contentDocument.body : document.getElementById('area-lectura');
  const caja = enEpub ? marco.getBoundingClientRect() : { x: 0, y: 0 };
  const toque = (tipo, cx, cy) => {
    const punto = new ventana.Touch(
      { identifier: 1, target: destino, clientX: cx - caja.x, clientY: cy - caja.y });
    destino.dispatchEvent(new ventana.TouchEvent(tipo, {
      touches: tipo === 'touchend' ? [] : [punto], changedTouches: [punto],
      bubbles: true, cancelable: true }));
  };
  toque('touchstart', x, y);
  for (let i = 1; i <= 10; i++) toque('touchmove', x + dx * i / 10, y + dy * i / 10);
  toque('touchend', x + dx, y + dy);
}"""

# Dónde está el libro. En los PDF basta el número de página. En los EPUB no
# sirve mirar el texto del iframe: dos páginas seguidas del mismo capítulo son
# el mismo documento movido de columna, así que se lee el CFI que se guarda con
# el progreso, que es lo que de verdad dice por dónde va.
POSICION = """() => {
  if (!document.getElementById('contenedor-epub').classList.contains('oculto')) {
    const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{}');
    const libros = Object.entries(datos.libros || {});
    if (!libros.length) return '';
    const reciente = libros.sort((a, b) =>
      (b[1].posicionActualizada ?? '').localeCompare(a[1].posicionActualizada ?? ''))[0];
    return String(reciente[1].cfi ?? reciente[1].pagina ?? '');
  }
  return document.getElementById('btn-indicador').textContent;
}"""

# Cuánto se ha desplazado: el área de lectura en PDF, y en EPUB el contenedor
# que epub.js hace scrollear cuando las páginas van seguidas.
DESPLAZAMIENTO = """() => {
  const area = document.getElementById('area-lectura');
  return area.scrollTop + [...document.querySelectorAll('#contenedor-epub *')]
    .reduce((maximo, elemento) => Math.max(maximo, elemento.scrollTop), 0);
}"""


def en_modo_pagina(page, r, etiqueta):
    """Los márgenes, el dedo y las flechas cambian de página."""
    def paso(nombre, accion):
        antes = page.evaluate(POSICION)
        accion()
        page.wait_for_timeout(1600)
        cambio = page.evaluate(POSICION) != antes
        print(f'[{etiqueta}] {nombre}:', 'pasa' if cambio else 'NO pasa')
        r.comprobar(cambio, f'{etiqueta}: {nombre} no pasa de página')

    for zona in ('zona-siguiente', 'zona-abajo', 'zona-anterior', 'zona-arriba'):
        paso(f'pulsar {zona}', lambda z=zona: page.click(f'#{z}'))
    paso('arrastrar el dedo a la izquierda', lambda: page.evaluate(DESLIZA, [700, 450, -300, 0]))
    paso('deslizar el dedo hacia arriba', lambda: page.evaluate(DESLIZA, [640, 450, 0, -220]))
    paso('deslizar el dedo hacia abajo', lambda: page.evaluate(DESLIZA, [640, 450, 0, 220]))
    for tecla in ('ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'):
        paso(f'la tecla {tecla}', lambda t=tecla: page.keyboard.press(t))

    # Un roce corto es un roce, no una orden.
    antes = page.evaluate(POSICION)
    page.evaluate(DESLIZA, [640, 450, 0, -25])
    page.wait_for_timeout(1200)
    r.comprobar(page.evaluate(POSICION) == antes,
                f'{etiqueta}: un deslizamiento corto no debería pasar de página')


def no_salta_la_ultima_pagina_epub(page, r):
    """Un píxel de redondeo no convierte la penúltima en la última página."""
    # Se busca un capítulo de al menos tres páginas para poder colocar el
    # marco en la penúltima. El desfase reproduce el redondeo que aparece de
    # forma intermitente con algunos tamaños de pantalla.
    for _ in range(80):
        medidas = page.evaluate("""() => {
          const marco = document.querySelector('#contenedor-epub .epub-container');
          const vista = document.querySelector('#contenedor-epub .epub-view');
          return {
            capitulo: vista?.getAttribute('ref'),
            ancho: marco?.offsetWidth ?? 0,
            total: marco?.scrollWidth ?? 0,
          };
        }""")
        if medidas['ancho'] and medidas['total'] >= medidas['ancho'] * 3:
            break
        page.click('#zona-siguiente')
        page.wait_for_timeout(350)
    else:
        r.fallo('EPUB: no se encontró un capítulo con tres páginas para probar el borde')
        return

    page.evaluate("""({ ancho, total }) => {
      const marco = document.querySelector('#contenedor-epub .epub-container');
      marco.scrollLeft = total - 2 * ancho;
    }""", medidas)
    page.wait_for_timeout(150)
    page.evaluate("""() => {
      document.querySelector('#contenedor-epub .epub-container').scrollLeft += 1;
    }""")
    page.wait_for_timeout(100)
    page.click('#zona-siguiente')
    page.wait_for_timeout(600)
    despues = page.evaluate("""() => {
      const marco = document.querySelector('#contenedor-epub .epub-container');
      const vista = document.querySelector('#contenedor-epub .epub-view');
      return {
        capitulo: vista?.getAttribute('ref'),
        ultima: marco.scrollLeft + marco.offsetWidth >= marco.scrollWidth - 1,
      };
    }""")
    r.comprobar(despues['capitulo'] == medidas['capitulo'] and despues['ultima'],
                'EPUB: un píxel de desfase se salta la última página del capítulo')


# Por dónde va, en número: la página en los PDF y el porcentaje en los EPUB.
# Sirve para saber si se ha avanzado o retrocedido, que el CFI no dice.
AVANCE = """() => parseFloat(
  document.getElementById('btn-indicador').textContent.replace(',', '.'))"""


def el_espacio_siempre_avanza(page, r, etiqueta):
    """Aunque lo último que se haya pulsado sea el margen de retroceder.

    Las zonas son botones y se quedaban con el foco al pulsarlas con el ratón:
    el espacio volvía a activar la última, así que después de retroceder por el
    margen izquierdo el espacio retrocedía otra vez.
    """
    # Con sitio por delante y por detrás: pegado al principio del libro no hay
    # retroceso que probar, y en EPUB el porcentaje ni se mueve.
    for _ in range(10):
        page.click('#zona-siguiente')
        page.wait_for_timeout(400)
    page.click('#zona-anterior')
    page.wait_for_timeout(1400)
    atras = page.evaluate(AVANCE)
    r.comprobar(page.evaluate(
        "() => !document.activeElement.classList.contains('zona-toque')"),
        f'{etiqueta}: la zona se queda con el foco tras pulsarla con el ratón')
    page.keyboard.press(' ')
    page.wait_for_timeout(1600)
    despues = page.evaluate(AVANCE)
    print(f'[{etiqueta}] tras retroceder con el ratón, el espacio: {atras} → {despues}')
    r.comprobar(despues > atras, f'{etiqueta}: el espacio no avanza tras pulsar el margen')
    # Y Mayúsculas+espacio sigue siendo el camino de vuelta.
    page.keyboard.press('Shift+ ')
    page.wait_for_timeout(1600)
    r.comprobar(page.evaluate(AVANCE) < despues,
                f'{etiqueta}: Mayúsculas+espacio no retrocede')


# Lo que se ve al llegar al borde: se apuntan las clases que van y vienen en el
# área de lectura mientras dura el intento.
VIGILAR = """() => {
  window.__clases = [];
  new MutationObserver((cambios) => cambios.forEach((c) => window.__clases.push(
    String(c.target.className)))).observe(document.getElementById('area-lectura'),
    { attributes: true, subtree: true, attributeFilter: ['class'] });
}"""


def topa_en_los_bordes(page, r, etiqueta, final):
    """En el último página del libro no se pasa página: se topa y se vuelve.

    El EPUB no sabe contar páginas y durante un tiempo dio por hecho que
    siempre había una más: al final del libro hacía la animación entera y
    volvía a caer la misma página, que parecía un fallo de pintado. Y el PDF,
    que sí lo sabía, no hacía nada de nada, que se confunde con un toque que
    no se ha registrado.
    """
    page.once('dialog', lambda dialogo: dialogo.accept(final))
    page.click('#btn-indicador')
    page.wait_for_timeout(3000)
    borde = page.evaluate(POSICION)

    page.evaluate(VIGILAR)
    page.click('#zona-siguiente')
    page.wait_for_timeout(900)
    clases = page.evaluate('() => window.__clases')
    print(f'[{etiqueta}] al final, pulsar el margen:', clases[:2])
    r.comprobar(any('tope-pagina' in c for c in clases),
                f'{etiqueta}: al final del libro el margen no da ninguna señal')
    r.comprobar(page.evaluate(POSICION) == borde,
                f'{etiqueta}: al final del libro el margen cambia de página')

    # Un arrastre largo tampoco: el tope frena el recorrido, pero pasarse del
    # umbral era posible y entonces la página salía entera para nada.
    page.evaluate(DESLIZA, [700, 450, -700, 0])
    page.wait_for_timeout(1200)
    r.comprobar(page.evaluate(POSICION) == borde,
                f'{etiqueta}: al final del libro el arrastre cambia de página')
    r.comprobar(page.evaluate(
        "() => [...document.querySelectorAll('#contenedor-epub,.par-paginas')]"
        ".every((e) => !e.style.transform)"),
        f'{etiqueta}: al final del libro la página se queda desplazada')

    # Y hacia atrás se sigue pudiendo, que es lo que evita quedarse encerrado.
    page.click('#zona-anterior')
    page.wait_for_timeout(1500)
    r.comprobar(page.evaluate(POSICION) != borde,
                f'{etiqueta}: desde el final del libro no se puede volver atrás')

    # Se devuelve el libro al principio: quedarse en el final dejaría sin
    # margen a lo que venga después, que espera poder desplazarse hacia abajo.
    page.once('dialog', lambda dialogo: dialogo.accept('1'))
    page.click('#btn-indicador')
    page.wait_for_timeout(3000)


def en_modo_continuo(page, r, etiqueta):
    """La rueda y las flechas desplazan, y nada cambia de página."""
    page.evaluate("() => document.getElementById('btn-modo').click()")
    page.wait_for_timeout(3000)

    def paso(nombre, accion):
        antes = (page.evaluate(POSICION), page.evaluate(DESPLAZAMIENTO))
        accion()
        page.wait_for_timeout(1200)
        despues = (page.evaluate(POSICION), page.evaluate(DESPLAZAMIENTO))
        print(f'[{etiqueta}] {nombre}: {antes[1]} → {despues[1]} px')
        r.comprobar(despues[1] > antes[1], f'{etiqueta}: {nombre} no desplaza')

    def rueda():
        page.mouse.move(640, 500)
        for _ in range(5):
            page.mouse.wheel(0, 200)
            page.wait_for_timeout(200)

    paso('la rueda del ratón', rueda)
    # El clic es lo que le da el foco al área que se desplaza; sin él las
    # flechas no son de nadie y el navegador no mueve nada.
    page.mouse.click(640, 500)
    page.wait_for_timeout(400)

    def flechas():
        for _ in range(6):
            page.keyboard.press('ArrowDown')
            page.wait_for_timeout(150)

    paso('las flechas', flechas)


r = comun.Resultado('pasar página')

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    for etiqueta, libro, trozo in [('PDF', comun.PDF, 'orientaciones'),
                                   ('EPUB', comun.EPUB, 'lazarillo')]:
        page = comun.pagina(nav, r, base, etiqueta=etiqueta)
        comun.anadir_libro(page, libro)
        comun.abrir_libro(page, trozo)
        page.wait_for_timeout(3000)
        # Con la página entera a la vista, que es cuando el gesto vertical
        # tiene sentido: si algo desborda, el dedo y las flechas son del
        # desplazamiento.
        page.evaluate("() => document.getElementById('zoom-pagina').click()")
        page.wait_for_timeout(1500)
        en_modo_pagina(page, r, etiqueta)
        el_espacio_siempre_avanza(page, r, etiqueta)
        if etiqueta == 'EPUB':
            no_salta_la_ultima_pagina_epub(page, r)
        # A dónde saltar para ponerse en el borde: el EPUB va por porcentaje.
        final = '100' if etiqueta == 'EPUB' else page.inner_text('#btn-indicador').split('/')[-1]
        topa_en_los_bordes(page, r, etiqueta, final.strip())
        en_modo_continuo(page, r, etiqueta)
        page.close()
    nav.close()

r.terminar()
