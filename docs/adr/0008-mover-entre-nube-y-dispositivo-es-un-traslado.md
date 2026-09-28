# 8. Llevar un libro entre la nube y el dispositivo es un traslado

Fecha: 2026-09-28 · Estado: aceptado (registro retroactivo del cambio de la versión 1.6.0)

## Contexto

«Subir a la nube» y «Guardar en este dispositivo» copiaban el libro: quedaba en
los dos sitios, con dos posiciones de lectura distintas y dos juegos de
anotaciones que no se sincronizaban entre sí.

## Decisión

Las acciones pasan a llamarse «Mover a la nube» y «Mover a este dispositivo»,
y también arrastrar un libro de una sección a la otra es un traslado. El libro
se lleva la página, los marcadores y las anotaciones. El original solo se
retira cuando la copia del destino está completa; si falla la retirada, se
avisa de que el libro ha quedado en los dos sitios.

## Alternativas descartadas

- **Mantener la copia y sincronizar las dos**: dos libros que son el mismo
  obligan a decidir cuál manda en cada conflicto.

## Consecuencias

Cambia el comportamiento para quien ya usaba la aplicación: el libro deja de
estar en el origen. Se anotó así en el CHANGELOG de la 1.6.0.

## Validación

`tests/e2e/traslados.py` comprueba, contra un servidor WebDAV local, que el
libro aparece en el destino y desaparece del origen, en la lista y en el
servidor, en los dos sentidos.
