"""Una palabra más ancha que la columna no se corta ni invade la de al lado.

En un móvil de 360 px, el título del Lazarillo de ejemplo (al 300 % y con
las letras separadas) no cabe palabra a palabra: «FORTUNAS» salía cortada, la
«O» de «LAZARILLO» caía encima de la «A» de «ADVERSIDADES» en la pantalla
siguiente, y el final de la dirección de Project Gutenberg («320») aparecía
suelto junto a «TORMES». Aquí se mide cada renglón del título y de esa
dirección: ninguno puede ser más ancho que la columna. Y en el título, además,
ninguna palabra puede quedar partida: la letra encoge hasta que quepan
enteras, también después de agrandarla con el zoom.
"""

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('palabras_largas')

MEDIR = """() => {
  // epub.js puede tener más de un capítulo montado: se mide el que trae el título.
  const marco = [...document.querySelectorAll('#contenedor-epub iframe')]
    .find((f) => f.contentDocument?.querySelector('h1'));
  const doc = marco?.contentDocument;
  if (!doc) return null;
  // El ancho de columna lo pone epub.js en línea en <html>.
  const columna = parseFloat(doc.documentElement.style.columnWidth)
    || parseFloat(marco.contentWindow.getComputedStyle(doc.body).columnWidth);
  const renglones = (elemento) => {
    if (!elemento) return [];
    const rango = doc.createRange();
    rango.selectNodeContents(elemento);
    return [...rango.getClientRects()].map((caja) => Math.round(caja.width));
  };
  // Una palabra partida en dos renglones da dos cajas.
  const partidas = [];
  const recorrido = doc.createTreeWalker(doc.querySelector('h1'), NodeFilter.SHOW_TEXT);
  for (let nodo = recorrido.nextNode(); nodo; nodo = recorrido.nextNode()) {
    for (const m of nodo.data.matchAll(/\S+/g)) {
      const rango = doc.createRange();
      rango.setStart(nodo, m.index);
      rango.setEnd(nodo, m.index + m[0].length);
      if (rango.getClientRects().length > 1) partidas.push(m[0]);
    }
  }
  return {
    partidas,
    cuerpo: marco.contentWindow.getComputedStyle(doc.querySelector('h1')).fontSize,
    texto: marco.contentWindow.getComputedStyle(doc.body).fontSize,
    columna: Math.round(columna),
    titulo: renglones(doc.querySelector('h1')),
    enlace: renglones([...doc.querySelectorAll('a')].find((a) => a.href.includes('/ebooks/320'))),
  };
}"""

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base, ancho=360, alto=640, movil=True)
    comun.abrir_libro(page, 'lazarillo')
    page.wait_for_selector('#vista-lector:not(.oculto)')
    page.wait_for_timeout(3000)
    # La primera pantalla es la portada; el título viene en la siguiente.
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(1500)
    medida = page.evaluate(MEDIR)
    print('medida:', medida)
    if not medida or not medida['titulo']:
        r.fallo('no se encontró el título del Lazarillo en el primer capítulo')
    else:
        # Un píxel de margen por el redondeo de las cajas.
        for nombre in ('titulo', 'enlace'):
            anchos = medida[nombre]
            r.comprobar(anchos, f'no se encontró el {nombre} que se mide')
            r.comprobar(all(ancho <= medida['columna'] + 1 for ancho in anchos),
                        f'un renglón del {nombre} es más ancho que la columna '
                        f'({max(anchos, default=0)} > {medida["columna"]} px)')
        r.comprobar(not medida['partidas'], f'palabras del título partidas: {medida["partidas"]}')

    # Con la letra más grande el título vuelve a medirse.
    page.evaluate("document.getElementById('btn-zoom-mas').click()")
    page.wait_for_timeout(2500)
    texto_antes = medida['texto']
    medida = page.evaluate(MEDIR)
    print('con zoom:', medida)
    r.comprobar(medida and medida['texto'] != texto_antes, 'el zoom no ha agrandado el texto')
    r.comprobar(medida and not medida['partidas'],
                f'con zoom, palabras del título partidas: {medida and medida["partidas"]}')
    r.comprobar(medida and all(ancho <= medida['columna'] + 1 for ancho in medida['titulo']),
                'con zoom, un renglón del título es más ancho que la columna')
    page.screenshot(path=str(comun.SALIDA / 'palabras-largas.png'))
    nav.close()

r.terminar()
