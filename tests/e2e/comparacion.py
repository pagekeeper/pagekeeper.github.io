"""La comparación de periodos, con el tramo en curso a medias.

Un tramo en curso nunca está terminado: el martes, «esta semana» son dos días
y la anterior fueron siete, así que compararlos enteros solo contaba qué día
era hoy. Aquí se siembra una lectura idéntica todos los días —una hora— y se
comprueba que ningún periodo enseña subidas ni bajadas: si las hubiera,
vendrían de la forma de comparar y no de la lectura.
"""

import json
import sys

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('comparación de periodos')

# Un histórico a medida: la semana pasada se leyó mucho el fin de semana, y
# esta semana (a medias) se lleva un rato parecido al de los mismos días.
SEMBRAR = """() => {
  const mio = 'aparato-prueba';
  localStorage.setItem('lector.idDispositivo', mio);
  const clave = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hoy = new Date();
  const dias = {};
  const meses = {};
  // Tres años de lectura pareja, una hora al día: así los dos años que se
  // comparan están completos, y no hay diferencia real que enseñar.
  for (let i = 0; i < 1100; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
    if (i < 400) dias[clave(d)] = { s: 3600, p: 20 };
    const mes = clave(d).slice(0, 7);
    meses[mes] = { s: (meses[mes]?.s ?? 0) + 3600, p: (meses[mes]?.p ?? 0) + 20 };
  }
  const datos = { version: 2, libros: {}, estadisticas: { [mio]: { dias, meses } } };
  localStorage.setItem('lector.progreso', JSON.stringify(datos));
}"""

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base)
    page.evaluate(SEMBRAR)
    page.reload()
    page.wait_for_selector('#btn-estadisticas')
    page.wait_for_timeout(800)
    page.click('#btn-estadisticas')
    page.wait_for_selector('#vista-estadisticas:not(.oculto)')
    page.wait_for_timeout(400)

    for periodo in ('semana', 'mes', 'anno'):
        page.click(f'#grupo-periodos button[data-periodo="{periodo}"]')
        page.wait_for_timeout(400)
        visible = not page.locator('#comparacion-periodos').evaluate(
            "(e) => e.classList.contains('oculto')")
        if not visible:
            print(f'[{periodo}] sin comparación (enero, o nada que comparar)')
            continue
        fila = {
            'actual': page.inner_text('#etiqueta-periodo-actual'),
            'valorActual': page.inner_text('#valor-periodo-actual'),
            'anterior': page.inner_text('#etiqueta-periodo-anterior'),
            'valorAnterior': page.inner_text('#valor-periodo-anterior'),
            'variacion': page.inner_text('#variacion-periodos'),
        }
        print(f'[{periodo}]', json.dumps(fila, ensure_ascii=False))
        # Con una hora al día todos los días, cada tramo debe empatar con el
        # anterior a la misma altura: es lo que antes daba «un 70 % menos».
        r.comprobar(fila['valorActual'] == fila['valorAnterior'],
                    f'en {periodo} las dos cifras deberían coincidir: {fila}')
        # El idioma de la prueba es el español (ver comun.pagina).
        r.comprobar('menos' not in fila['variacion'],
                    f'en {periodo} sale una bajada que no existe: {fila["variacion"]}')
        page.screenshot(path=str(comun.SALIDA / f'comparacion-{periodo}.png'))

    nav.close()

r.terminar()
