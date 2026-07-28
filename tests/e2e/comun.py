"""Utilidades compartidas por las pruebas de navegador.

Las pruebas de `tests/*.test.mjs` comprueban la lógica (fusiones, rachas,
cuentas) sin navegador. Estas otras conducen un Chromium de verdad: pulsan
botones, abren libros y miran lo que sale en pantalla. Sirven para lo que la
lógica sola no puede demostrar —que un PDF se pinta, que la barra del pie cabe
en un móvil o que dos dispositivos acaban viendo el mismo total—, y por eso
necesitan levantar un servidor y, en algún caso, un WebDAV de mentira.

Cada archivo se puede lanzar por separado; `todas.py` los ejecuta en fila.
"""

import contextlib
import http.server
import os
import pathlib
import socket
import subprocess
import sys
import tempfile
import threading
import time

RAIZ = pathlib.Path(__file__).resolve().parents[2]
EJEMPLOS = RAIZ / 'ejemplos'
PDF = EJEMPLOS / 'orientaciones-herramientas-digitales-es.pdf'
EPUB = EJEMPLOS / 'lazarillo-de-tormes-es.epub'
# El proxy que le pone cabeceras CORS a rclone vive con la skill que explica
# cómo verificar la aplicación, para no tener dos copias del mismo archivo.
PROXY_CORS = RAIZ / '.claude' / 'skills' / 'verify' / 'proxy_cors.py'

# Las capturas no van al repositorio: se dejan en un directorio del sistema y
# cada prueba dice al terminar dónde han quedado.
SALIDA = pathlib.Path(tempfile.gettempdir()) / 'pagekeeper-e2e'
SALIDA.mkdir(exist_ok=True)

CHROMIUM = '/usr/bin/chromium'


def puerto_libre():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


@contextlib.contextmanager
def servidor(raiz=RAIZ):
    """Sirve el proyecto por HTTP en un puerto libre mientras dure el bloque."""
    puerto = puerto_libre()

    class Manejador(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(raiz), **kwargs)

        def log_message(self, *args):
            pass  # sin ruido: lo que interesa es lo que diga la prueba

    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', puerto), Manejador)
    hilo = threading.Thread(target=httpd.serve_forever, daemon=True)
    hilo.start()
    try:
        yield f'http://127.0.0.1:{puerto}/'
    finally:
        httpd.shutdown()
        httpd.server_close()


@contextlib.contextmanager
def nube_webdav():
    """WebDAV de mentira (rclone) con un proxy que le añade CORS.

    Devuelve (url, carpeta) o (None, None) si falta rclone: sin él la prueba
    se salta en lugar de fallar, porque no todos los equipos lo tienen.
    """
    if not _hay('rclone'):
        yield None, None
        return
    carpeta = pathlib.Path(tempfile.mkdtemp(prefix='pagekeeper-dav-'))
    dentro = puerto_libre()
    fuera = puerto_libre()
    rclone = subprocess.Popen(
        ['rclone', 'serve', 'webdav', str(carpeta), '--addr', f'127.0.0.1:{dentro}',
         '--dir-cache-time', '1s'],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    proxy = subprocess.Popen(
        [sys.executable, str(PROXY_CORS)],
        env={**os.environ, 'PUERTO_ORIGEN': str(dentro), 'PUERTO_PROXY': str(fuera)},
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        _esperar_puerto(fuera)
        yield f'http://127.0.0.1:{fuera}', carpeta
    finally:
        for proceso in (proxy, rclone):
            proceso.terminate()
            with contextlib.suppress(subprocess.TimeoutExpired):
                proceso.wait(timeout=5)


def _hay(programa):
    from shutil import which
    return which(programa) is not None


def _esperar_puerto(puerto, segundos=10):
    limite = time.time() + segundos
    while time.time() < limite:
        with socket.socket() as s:
            s.settimeout(0.3)
            if s.connect_ex(('127.0.0.1', puerto)) == 0:
                return True
        time.sleep(0.2)
    return False


class Resultado:
    """Recoge los fallos de una prueba y decide con qué código sale."""

    def __init__(self, nombre):
        self.nombre = nombre
        self.fallos = []

    def comprobar(self, condicion, mensaje):
        if not condicion:
            self.fallos.append(mensaje)
        return bool(condicion)

    def fallo(self, mensaje):
        self.fallos.append(mensaje)

    def terminar(self):
        print(f'\n=== {self.nombre}: '
              + ('SIN FALLOS ===' if not self.fallos else f'{len(self.fallos)} FALLOS ==='))
        for fallo in self.fallos:
            print(' -', fallo)
        print(f'(capturas en {SALIDA})')
        sys.exit(1 if self.fallos else 0)


def escuchar(page, resultado, etiqueta=''):
    """Apunta como fallo cualquier error de consola que no sea esperable.

    Los 404 se dejan pasar: en un servidor WebDAV recién estrenado, el archivo
    de progreso y el de anotaciones aún no existen y la aplicación los pide
    antes de crearlos.
    """
    marca = f'[{etiqueta}] ' if etiqueta else ''

    def consola(mensaje):
        texto = mensaje.text
        if 'Content Security Policy' in texto or 'Refused to' in texto:
            resultado.fallo(f'{marca}CSP: {texto[:120]}')
        elif mensaje.type == 'error' and '404' not in texto:
            resultado.fallo(f'{marca}consola: {texto[:120]}')

    page.on('console', consola)
    page.on('pageerror', lambda e: resultado.fallo(f'{marca}excepción: {e}'))


def navegador(playwright, **kwargs):
    return playwright.chromium.launch(executable_path=CHROMIUM, headless=True, **kwargs)


def pagina(nav, resultado, base, ancho=1280, alto=900, movil=False, etiqueta=''):
    """Abre la aplicación en un contexto nuevo y espera a que esté lista."""
    opciones = {'locale': 'es-ES', 'viewport': {'width': ancho, 'height': alto}}
    if movil:
        opciones |= {'is_mobile': True, 'has_touch': True}
    page = nav.new_context(**opciones).new_page()
    escuchar(page, resultado, etiqueta)
    page.goto(base)
    page.wait_for_selector('#btn-estadisticas')
    page.wait_for_timeout(800)
    return page


def anadir_libro(page, ruta):
    """Mete un libro en la biblioteca del dispositivo."""
    page.set_input_files('#selector-archivo', str(ruta))
    page.wait_for_timeout(2500)


def abrir_libro(page, trozo):
    """Abre un libro local buscándolo por un trozo de su identificador.

    El clic lo da el propio JavaScript porque «Continuar leyendo» empuja las
    listas fuera de la pantalla y el clic de Playwright exige que el elemento
    se vea; aquí lo que importa es abrir el libro, no simular el dedo.

    Se pulsa el título y no «el primer botón de la fila»: ese primero es el
    círculo de marcar como terminado, que abre el libro igual (el clic sube
    hasta la ficha) pero de paso lo daba por leído, y entonces las pruebas
    comprobaban una biblioteca que ellas mismas habían alterado.
    """
    encontrado = page.evaluate("""(trozo) => {
      const fila = [...document.querySelectorAll('#lista-locales li[data-id-libro]')]
        .find((l) => (l.dataset.idLibro || '').toLowerCase().includes(trozo));
      if (!fila) return false;
      (fila.querySelector('.nombre') || fila.querySelector('.libro') || fila).click();
      return true;
    }""", trozo)
    if not encontrado:
        raise AssertionError(f'no hay ningún libro local que contenga «{trozo}»')
    page.wait_for_selector('#vista-lector:not(.oculto)', timeout=30000)


def id_libro_abierto(page):
    """El identificador del libro que está abierto: el de posición más reciente.

    La primera fila de la lista no tiene por qué ser la que se abrió.
    """
    return page.evaluate("""() => {
      const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{}');
      const libros = Object.entries(datos.libros || {});
      if (!libros.length) return null;
      return libros.sort((a, b) =>
        (b[1].posicionActualizada ?? '').localeCompare(a[1].posicionActualizada ?? ''))[0][0];
    }""")


def sembrar_tiempo(page, id_libro, segundos=5400, paginas=60, otro_aparato=None):
    """Le pone tiempo de lectura a un libro sin tener que leerlo de verdad.

    Cada muestra real necesita más de tres segundos con el libro delante, así
    que acumular horas a base de esperas dejaría las pruebas en media hora.
    """
    page.evaluate("""([id, segundos, paginas, otro]) => {
      const mio = localStorage.getItem('lector.idDispositivo') || 'este-aparato';
      localStorage.setItem('lector.idDispositivo', mio);
      const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{"version":2,"libros":{}}');
      const entrada = datos.libros[id] || {};
      entrada.tiempos = { [mio]: { s: segundos, p: paginas } };
      if (otro) entrada.tiempos['otro-aparato'] = { s: otro, p: Math.round(paginas / 2) };
      datos.libros[id] = entrada;
      datos.dispositivos = {
        ...(datos.dispositivos || {}),
        [mio]: { sistema: 'Linux', navegador: 'Chrome',
                 alta: new Date().toISOString(), ultimaVez: new Date().toISOString() },
        ...(otro ? { 'otro-aparato': { sistema: 'Android', navegador: 'Chrome',
                     nombre: 'Móvil de prueba', alta: new Date().toISOString(),
                     ultimaVez: new Date().toISOString() } } : {}),
      };
      localStorage.setItem('lector.progreso', JSON.stringify(datos));
    }""", [id_libro, segundos, paginas, otro_aparato])


def sembrar_dias(page, dias=40):
    """Un histórico de lectura repartido, con huecos, para el gráfico."""
    page.evaluate("""(cuantos) => {
      const mio = localStorage.getItem('lector.idDispositivo') || 'este-aparato';
      localStorage.setItem('lector.idDispositivo', mio);
      const clave = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const hoy = new Date();
      const dias = {};
      for (let i = 0; i < cuantos; i++) {
        if (i % 7 === 3 || i % 11 === 5) continue;   // días sin leer
        const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
        dias[clave(d)] = { s: 600 + ((i * 397) % 3000), p: 5 + (i % 20) };
      }
      const datos = JSON.parse(localStorage.getItem('lector.progreso') || '{"version":2,"libros":{}}');
      datos.estadisticas = { ...(datos.estadisticas || {}) };
      datos.estadisticas[mio] = { dias: { ...dias, ...((datos.estadisticas[mio] || {}).dias || {}) } };
      localStorage.setItem('lector.progreso', JSON.stringify(datos));
    }""", dias)


def sembrar_ritmo(page, id_libro):
    """Ritmo ya acumulado, para que aparezca el tiempo restante estimado."""
    page.evaluate("""(id) => {
      const ritmos = JSON.parse(localStorage.getItem('lector.ritmoLectura') || '{}');
      ritmos[id] = { s: 600, u: 3, t: Date.now() };
      localStorage.setItem('lector.ritmoLectura', JSON.stringify(ritmos));
    }""", id_libro)


def leer_un_rato(page, vueltas=3, espera=4200):
    """Pasa páginas despacio para generar muestras de lectura válidas.

    Por debajo de tres segundos la muestra se descarta (es un vistazo, no
    lectura), así que las esperas son largas a propósito.
    """
    page.wait_for_timeout(3500)
    for _ in range(vueltas):
        page.wait_for_timeout(espera)
        page.keyboard.press('ArrowRight')
    page.wait_for_timeout(1500)
