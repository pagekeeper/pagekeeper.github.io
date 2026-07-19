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

- **Local**: pulsar `#btn-libro-ejemplo` (añade el Lazarillo y abre el lector);
  volver con `#btn-volver`. Las filas aparecen en `#lista-locales li[data-id-libro]`.
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

## Trampas

- Los paneles se ocultan con la clase `oculto`, no se desmontan: para esperar
  un cierre usa `wait_for_function("...classList.contains('oculto')")`,
  nunca `wait_for_selector('#x.oculto')` (espera visibilidad y expira).
- `confirm()`/`prompt()` nativos: registrar `page.once('dialog', ...)` antes de pulsar.
- El service worker cachea agresivamente: si se toca css/js/html, subir la
  versión en `sw.js` (`pagekeeper-vNN`); en Playwright con contexto nuevo no afecta.
