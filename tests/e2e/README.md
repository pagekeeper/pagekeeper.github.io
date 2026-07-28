# Pruebas de navegador

Las pruebas de `tests/*.test.mjs` comprueban la lógica —fusiones, rachas,
cuentas— sin navegador, y se lanzan con `node --test`. Estas otras conducen un
Chromium de verdad: pulsan botones, abren libros y miran lo que sale en
pantalla. Sirven para lo que la lógica sola no puede demostrar: que un PDF se
pinta, que la barra del pie cabe en un móvil o que dos dispositivos acaban
viendo el mismo total.

## Lanzarlas

```bash
python3 tests/e2e/todas.py             # todas, en fila
python3 tests/e2e/todas.py seguridad   # solo una
python3 tests/e2e/seguridad.py         # igual, directamente
```

No hay que preparar nada: cada prueba levanta su propio servidor en un puerto
libre y lo cierra al terminar. Tardan unos minutos porque hay esperas de
verdad: una muestra de lectura solo cuenta si pasan más de tres segundos con
el libro delante, y epub.js necesita su tiempo para repaginar.

Las capturas quedan en `/tmp/pagekeeper-e2e` (lo dice cada prueba al acabar).

## Qué comprueba cada una

| Archivo | Qué mira |
|---|---|
| `seguridad.py` | Que la política de seguridad no bloquee nada: PDF con su worker, miniaturas, EPUB en su iframe, fórmulas con MathJax, portadas, ZIP y WebDAV. Y que cada capítulo conserve su propia política. |
| `estadisticas.py` | La pantalla de estadísticas: vacía, con histórico, en tres idiomas, el botón atrás, el borrado y que quepa en un móvil. Y que leer de verdad deje rastro. |
| `ficha_libro.py` | El tiempo dedicado en la barra del pie y la ficha que abre al pulsarlo, por sus dos caminos (la barra y el menú «⋯»). |
| `barra_pie.py` | Que la barra quepa a 360, 390 y 430 px con PDF y EPUB, y que en páginas continuas salga el porcentaje en lugar de las pantallas. |
| `ayuda.py` | Que los apartados de la ayuda existan en español, catalán e inglés. |
| `dos_dispositivos.py` | Dos navegadores sobre la misma nube: que el tiempo sume, que los días sean comunes y que borrar en uno borre en el otro sin tocar la posición. |

## Hace falta

- **Playwright de Python** y un Chromium en `/usr/bin/chromium` (se cambia en
  `comun.py`, constante `CHROMIUM`).
- **rclone**, solo para las que usan la nube. Si no está, `dos_dispositivos.py`
  se salta y `seguridad.py` omite su último apartado, en vez de fallar. El
  proxy que le añade cabeceras CORS es el de `.claude/skills/verify/`.

## Escribir una nueva

`comun.py` tiene lo repetido: levantar el servidor y la nube, abrir la
aplicación, meter un libro, abrirlo, sembrar tiempo o días sin tener que
leerlos de verdad, y recoger los fallos.

```python
from playwright.sync_api import sync_playwright
import comun

r = comun.Resultado('lo que sea')

with comun.servidor() as base, sync_playwright() as p:
    nav = comun.navegador(p)
    page = comun.pagina(nav, r, base)          # apunta solos los errores de consola
    comun.anadir_libro(page, comun.PDF)
    comun.abrir_libro(page, '.pdf')
    r.comprobar(page.is_visible('#vista-lector'), 'el lector no se ha abierto')
    nav.close()

r.terminar()                                    # resume y sale con 0 o 1
```

Dos avisos que costaron su rato:

- Los paneles se ocultan con la clase `oculto`, no se desmontan. Para esperar a
  que se cierre uno hay que usar `wait_for_function` mirando esa clase, nunca
  `wait_for_selector('#x.oculto')`, que espera a que sea visible y expira.
- El primer `<button>` de la ficha de un libro es el círculo de marcar como
  terminado. Abrir el libro pulsándolo funciona —el clic sube hasta la ficha—
  pero de paso lo da por leído, y la prueba acaba comprobando una biblioteca
  que ella misma ha cambiado. Por eso `abrir_libro` pulsa el título.
