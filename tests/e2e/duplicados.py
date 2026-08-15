"""El mismo libro no puede entrar dos veces en la biblioteca del dispositivo.

Un libro local se identifica por nombre y tamaño, así que el mismo texto con
otro nombre —una copia descargada dos veces, o el ejemplo que la aplicación
precarga con un nombre más presentable— entraba como un libro aparte. Aquí se
comprueba que lo que decide es el contenido: mismo archivo con otro nombre no
entra, y añadir el mismo archivo tal cual sigue reemplazándolo sin quejarse.
"""

import json
import pathlib
import shutil
import sys
import tempfile

from playwright.sync_api import sync_playwright

import comun

r = comun.Resultado('duplicados')
OTRO_EPUB = comun.EJEMPLOS / 'alice-in-wonderland-en.epub'

INVENTARIO = """() => new Promise((listo) => {
  const p = indexedDB.open('lector-pdf');
  p.onsuccess = () => {
    const bd = p.result;
    const tx = bd.transaction('libros', 'readonly');
    const q = tx.objectStore('libros').getAll();
    q.onsuccess = () => { listo(q.result.map((l) => ({ id: l.id, huella: (l.huella || '').slice(0, 8) }))); bd.close(); };
  };
})"""

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base)

    # La primera visita precarga dos ejemplos con nombres propios: añadir esos
    # mismos archivos desde «ejemplos/» era el duplicado que se veía.
    precargados = page.evaluate(INVENTARIO)
    print('precargados:', json.dumps([l['id'] for l in precargados], ensure_ascii=False))

    comun.anadir_libro(page, comun.PDF)
    page.wait_for_timeout(600)
    tras_ejemplo = page.evaluate(INVENTARIO)
    print('tras añadir el mismo PDF de ejemplo:', json.dumps([l['id'] for l in tras_ejemplo], ensure_ascii=False))
    print('aviso:', page.inner_text('#toast'))
    r.comprobar(len(tras_ejemplo) == len(precargados),
                'el libro ya precargado ha entrado otra vez')
    r.comprobar('ya está en este dispositivo' in page.inner_text('#toast'),
                'no se ha avisado de que el libro ya estaba')
    # Y se abre el que ya estaba, que es lo que se quería leer.
    r.comprobar(page.is_visible('#vista-lector'), 'debería haberse abierto el libro que ya estaba')
    page.click('#btn-volver')
    page.wait_for_selector('#vista-biblioteca:not(.oculto)')

    # Una copia con otro nombre tampoco entra.
    tmp = pathlib.Path(tempfile.mkdtemp())
    copia = tmp / 'copia con otro nombre.pdf'
    shutil.copy(comun.PDF, copia)
    comun.anadir_libro(page, copia)
    page.wait_for_timeout(600)
    inv = page.evaluate(INVENTARIO)
    print('tras la copia renombrada:', json.dumps([l['id'] for l in inv], ensure_ascii=False))
    r.comprobar(len(inv) == len(precargados), 'una copia con otro nombre ha entrado como libro nuevo')

    # Un libro distinto sí entra, y con su huella guardada.
    comun.anadir_libro(page, OTRO_EPUB)
    page.wait_for_timeout(600)
    inv = page.evaluate(INVENTARIO)
    print('tras un libro distinto:', json.dumps(inv, ensure_ascii=False))
    r.comprobar(len(inv) == len(precargados) + 1, 'un libro distinto no ha entrado')
    # La huella se guarda al añadir y al comparar; un precargado con el que
    # nadie se ha comparado todavía no tiene por qué tenerla.
    r.comprobar(next(l['huella'] for l in inv if 'alice' in l['id']) != '',
                'el libro recién añadido se ha quedado sin huella guardada')
    r.comprobar(next(l['huella'] for l in inv if 'Orientaciones' in l['id']) != '',
                'el libro con el que se comparó no ha guardado su huella')

    # Volver a añadir el mismo archivo con el mismo nombre sigue reemplazándolo
    # sin quejarse y sin crear otra ficha.
    if not page.is_visible('#vista-biblioteca'):
        page.click('#btn-volver')
        page.wait_for_selector('#vista-biblioteca:not(.oculto)')
    comun.anadir_libro(page, OTRO_EPUB)
    page.wait_for_timeout(600)
    inv = page.evaluate(INVENTARIO)
    print('tras reemplazar el mismo archivo:', len(inv), 'libros')
    r.comprobar(len(inv) == len(precargados) + 1, 'reemplazar el mismo archivo ha creado otro libro')
    r.comprobar('ya está en este dispositivo' not in page.inner_text('#toast'),
                'reemplazar el mismo archivo no debería avisar de duplicado')

    nav.close()

r.terminar()
