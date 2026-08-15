"""Lanza todas las pruebas de navegador, una detrás de otra, y resume.

    python3 tests/e2e/todas.py            todas
    python3 tests/e2e/todas.py seguridad  solo esa
"""

import pathlib
import subprocess
import sys
import time

AQUI = pathlib.Path(__file__).resolve().parent
# En orden de lo más básico a lo más costoso, para que un destrozo salte pronto.
PRUEBAS = ['seguridad', 'duplicados', 'estadisticas', 'ficha_libro', 'barra_pie',
           'pasar_pagina', 'imagen_ampliada', 'tiempo_lectura', 'apertura_directa',
           'ayuda', 'dos_dispositivos']


def main():
    pedidas = sys.argv[1:] or PRUEBAS
    desconocidas = [p for p in pedidas if p not in PRUEBAS]
    if desconocidas:
        print(f'No conozco: {", ".join(desconocidas)}. Hay: {", ".join(PRUEBAS)}')
        return 2

    resultados = []
    for nombre in pedidas:
        print(f'\n{"─" * 60}\n▶ {nombre}\n{"─" * 60}')
        empezo = time.time()
        codigo = subprocess.call([sys.executable, str(AQUI / f'{nombre}.py')], cwd=AQUI)
        resultados.append((nombre, codigo, time.time() - empezo))

    print(f'\n{"═" * 60}')
    for nombre, codigo, tardo in resultados:
        print(f'{"✓" if codigo == 0 else "✗"} {nombre:<18} {tardo:5.0f} s')
    fallidas = [n for n, c, _ in resultados if c != 0]
    print(f'{"═" * 60}')
    print('Todo en orden.' if not fallidas else f'Con fallos: {", ".join(fallidas)}')
    return 1 if fallidas else 0


if __name__ == '__main__':
    sys.exit(main())
