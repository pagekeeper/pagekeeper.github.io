"""Genera la cabecera de la ficha de Google Play (1024 × 500) en cada idioma.

    python3 android/fitxa/cabecera.py      deja cabecera-XX.svg y .png aquí

Un portátil, una tableta y un móvil, vistos de frente y con sus proporciones,
enseñan la misma página con el mismo marcador y el mismo subrayado: es lo que
hace PageKeeper. Los PNG salen con rsvg-convert.
"""

import pathlib
import subprocess

AQUI = pathlib.Path(__file__).resolve().parent

LEMAS = {
    'es': ('Sigue en la misma página', 'en todos tus dispositivos'),
    'ca': ('Continua a la mateixa pàgina', 'a tots els teus dispositius'),
    'gl': ('Continúa na mesma páxina', 'en todos os teus dispositivos'),
    'eu': ('Jarraitu orri berean', 'zure gailu guztietan'),
    'en': ('Pick up on the same page', 'on every device'),
}

LIBRO = '''<g fill="none" stroke="#38bdf8" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">
    <path d="M256 152 C 216 120, 140 120, 104 144 V 376 C 140 352, 216 352, 256 384 C 296 352, 372 352, 408 376 V 144 C 372 120, 296 120, 256 152 Z"/>
    <path d="M256 152 V 384"/></g>
  <g stroke="#7dd3fc" stroke-width="12" stroke-linecap="round">
    <path d="M140 200 H 220 M140 240 H 220 M140 280 H 220"/>
    <path d="M292 200 H 372 M292 240 H 372 M292 280 H 372"/></g>'''


def pagina(x, y, ancho, alto):
    """La misma página en cualquier pantalla: título, renglones, el subrayado
    a la misma altura, la cinta del marcador y el número de página."""
    m = ancho * 0.12
    partes = [f'<rect x="{x}" y="{y}" width="{ancho}" height="{alto}" fill="#f8fafc"/>']
    partes.append(f'<rect x="{x + m}" y="{y + alto * 0.13}" width="{ancho * 0.45}" height="{max(alto * 0.035, 3)}" rx="1.5" fill="#334155"/>')
    renglon = alto * 0.062
    for i in range(10):
        ry = y + alto * 0.24 + i * renglon
        largo = ancho - 2 * m if i not in (4, 9) else (ancho - 2 * m) * 0.6
        if i == 5:
            partes.append(f'<rect x="{x + m - 2}" y="{ry - renglon * 0.28}" width="{largo + 4}" height="{renglon * 0.8}" rx="2" fill="#fde68a"/>')
        partes.append(f'<rect x="{x + m}" y="{ry}" width="{largo}" height="{max(renglon * 0.24, 1.6)}" rx="1" fill="#94a3b8"/>')
    cx = x + ancho - m * 1.1
    cw = max(ancho * 0.07, 7)
    partes.append(f'<path d="M{cx} {y} h{cw} v{alto * 0.16} l{-cw / 2} {-cw * 0.55} l{-cw / 2} {cw * 0.55} z" fill="#0ea5e9"/>')
    pw, ph = max(ancho * 0.26, 30), max(alto * 0.075, 12)
    partes.append(f'<rect x="{x + ancho / 2 - pw / 2}" y="{y + alto - ph - alto * 0.04}" width="{pw}" height="{ph}" rx="{ph / 2}" fill="#0f172a"/>')
    partes.append(f'<text x="{x + ancho / 2}" y="{y + alto - alto * 0.04 - ph * 0.28}" font-size="{ph * 0.62}" text-anchor="middle" fill="#e2e8f0" font-family="Inter" font-weight="600">128</text>')
    return '\n'.join(partes)


def svg(idioma):
    lema1, lema2 = LEMAS[idioma]
    portatil = (f'<rect x="590" y="118" width="350" height="226" rx="12" fill="#1e293b" stroke="#475569" stroke-width="2"/>'
                + pagina(603, 131, 324, 200)
                + '<path d="M560 344 H970 L986 362 Q986 368 978 368 H572 Q564 368 564 362 Z" fill="#334155"/>'
                + '<rect x="735" y="344" width="60" height="7" rx="3" fill="#1e293b"/>')
    tableta = (f'<rect x="528" y="196" width="168" height="224" rx="16" fill="#0b1220" stroke="#475569" stroke-width="2"/>'
               + pagina(540, 208, 144, 200))
    movil = (f'<rect x="884" y="232" width="96" height="198" rx="15" fill="#0b1220" stroke="#475569" stroke-width="2"/>'
             + pagina(890, 248, 84, 172)
             + '<rect x="918" y="238" width="28" height="5" rx="2.5" fill="#1e293b"/>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#132a4a"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#fondo)"/>
  <path d="M612 455 C 700 488, 850 488, 932 445" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round" opacity="0.7"/>
  {portatil}
  {tableta}
  {movil}
  <g transform="translate(64 112) scale(0.16)">{LIBRO}</g>
  <text x="64" y="232" font-family="Inter" font-weight="700" font-size="62" fill="#f8fafc">PageKeeper</text>
  <text x="64" y="292" font-family="Inter" font-weight="500" font-size="29" fill="#7dd3fc">{lema1}</text>
  <text x="64" y="330" font-family="Inter" font-weight="500" font-size="29" fill="#7dd3fc">{lema2}</text>
  <text x="64" y="392" font-family="Inter" font-size="19" fill="#94a3b8">PDF · EPUB · Nextcloud · WebDAV</text>
</svg>
'''


for idioma in LEMAS:
    destino = AQUI / f'cabecera-{idioma}.svg'
    destino.write_text(svg(idioma), encoding='utf-8')
    subprocess.run(['rsvg-convert', '-w', '1024', '-h', '500', str(destino),
                    '-o', str(destino.with_suffix('.png'))], check=True)
