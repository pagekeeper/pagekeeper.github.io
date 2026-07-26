---
name: verify
description: Cómo lanzar y verificar PageKeeper en un navegador real (Playwright + WebDAV local).
---

# Verificar PageKeeper

Aplicación estática sin build. Servir y conducir con Playwright de Python
(instalado a nivel de usuario) usando el Chromium del sistema.

## Lanzar

```bash
python3 -m http.server 8765 --bind 127.0.0.1 &   # desde la raíz del repo
```

Playwright: `chromium.launch(executable_path='/usr/bin/chromium', headless=True)`.
Móvil: viewport 390x844 con `is_mobile=True`; escritorio: 1200x800. `locale='es-ES'`.

## Conseguir libros en la biblioteca

- **Local**: pulsar un botón de `#botones-libro-ejemplo` (hay un EPUB y un PDF
  de ejemplo por idioma; añaden el libro y abren el lector); volver con
  `#btn-volver`. Las filas aparecen en `#lista-locales li[data-id-libro]`.
  También vale `page.set_input_files('#selector-archivo', ruta)` con cualquier
  PDF/EPUB propio.
- **Nube**: rclone sirve WebDAV pero sin CORS; hace falta el proxy
  `proxy_cors.py` (en esta misma carpeta): proxy HTTP en 8768 → rclone en 8767
  que añade `Access-Control-Allow-*` y responde OPTIONS con 204.

```bash
rclone serve webdav "$CARPETA" --addr 127.0.0.1:8767 &
python3 proxy_cors.py &   # escucha en 8768
```

  En la app: `#btn-ajustes`, rellenar `#campo-url` (http://127.0.0.1:8768),
  `#campo-usuario` y `#campo-clave` (obligatorios aunque rclone no valide),
  y enviar `#formulario-webdav`. Las filas remotas salen en `#lista-libros`.

## Arrastrar y soltar

`locator.drag_to()` no dispara de forma fiable el arrastre nativo de Chromium
(en las pruebas de carpetas no llegaba ni el `dragstart`). Hay que conducir el
ratón a mano, y antes hacer visible el origen: tras abrir un libro aparece
«Continuar leyendo» y empuja las listas fuera del viewport, así que el
`bounding_box` cae en coordenadas que ya no están en pantalla y el `mousedown`
se pierde sin error.

```python
def arrastrar(page, origen, destino):
    page.locator(destino).scroll_into_view_if_needed()
    page.locator(origen).scroll_into_view_if_needed()
    page.wait_for_timeout(300)
    o, d = page.locator(origen).bounding_box(), page.locator(destino).bounding_box()
    ox, oy = o['x'] + 20, o['y'] + 20   # por el icono: en el centro cae la nota o el «⋯»
    dx, dy = d['x'] + d['width'] / 2, d['y'] + d['height'] / 2
    page.mouse.move(ox, oy)
    page.mouse.down()
    page.mouse.move(ox + 6, oy + 6)    # supera el umbral que inicia el arrastre
    page.wait_for_timeout(80)
    for i in range(1, 11):             # en pasos: un solo salto no lo activa
        page.mouse.move(ox + (dx - ox) * i / 10, oy + (dy - oy) * i / 10)
        page.wait_for_timeout(60)
    page.mouse.up()
```

Para depurar por qué no cae un arrastre, escuchar en la propia página con
`document.addEventListener(tipo, ..., true)` sobre `dragstart`/`dragover`/`drop`
y volcarlo por `console.log`: dice si el arrastre ni empezó o si el destino lo
rechazó.

## Trampas

- Los paneles se ocultan con la clase `oculto`, no se desmontan: para esperar
  un cierre usa `wait_for_function("...classList.contains('oculto')")`,
  nunca `wait_for_selector('#x.oculto')` (espera visibilidad y expira).
- `confirm()`/`prompt()` nativos: registrar `page.once('dialog', ...)` antes de pulsar.
- El service worker cachea agresivamente: si se toca css/js/html, subir la
  versión en `sw.js` (`pagekeeper-vNN`); en Playwright con contexto nuevo no afecta.
- El 8765 lo puede tener ocupado otro proyecto del usuario (OpenWorksheets):
  comprobar que `index.html` servido es el de PageKeeper o usar otro puerto.
- `rclone serve` cachea el listado de directorios: si se recrea la carpeta
  servida entre pruebas, relanzarlo (o `--dir-cache-time 1s`) o seguirá
  sirviendo el árbol anterior.
- Las opciones de un menú «⋯» son `.item-menu-libro`; buscarlas por rol y
  nombre choca con los botones de la cabecera, que repiten la etiqueta.
- Al parar los servidores de prueba, matar por PID (nunca `pkill -f`: el patrón
  coincide con la propia shell del agente y la mata) y no tocar los
  `rclone mount` del usuario.
