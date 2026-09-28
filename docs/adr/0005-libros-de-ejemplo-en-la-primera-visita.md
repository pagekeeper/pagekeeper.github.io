# 5. La primera visita trae dos libros de ejemplo con licencia libre

Fecha: 2026-07-19 · Estado: aceptado (registro retroactivo, redactado el 2026-09-28)

## Contexto

Una biblioteca vacía no deja probar el lector sin tener antes un PDF o un EPUB
a mano, y configurar la nube es un paso que mucha gente dejará para después.

## Decisión

La primera vez que se abre en un navegador, si no hay nube configurada ni
libros en el dispositivo, la biblioteca local recibe dos libros en el idioma
de la interfaz: un EPUB y un PDF. Hay parejas en español, catalán e inglés;
con los demás idiomas
de la interfaz se usa la española. Una tarjeta explica de dónde salen y que
se pueden borrar. La precarga se hace una sola vez por navegador.

Solo se usan obras que permiten redistribuirlas: tres novelas de dominio
público de Project Gutenberg y tres PDF con licencia Creative Commons (INTEF,
Generalitat de Catalunya y un editorial de acceso abierto). Su autoría y su
licencia constan en los créditos de la aplicación y en el README.

## Alternativas descartadas

- **Ofrecerlos solo con un botón**: se hizo primero, pero obligaba a un paso
  más antes de ver nada.
- **Un único EPUB por idioma**: fue la primera forma, y dejaba sin probar el
  lector de PDF, que tiene funciones propias (miniaturas, recorte de márgenes,
  giro). El PDF de cada idioma se añadió el 2026-07-19.

## Consecuencias

El repositorio pesa unos 21 MB más, casi todo por los PDF. Los tres EPUB de
ejemplo están además en la caché del service worker; los PDF, más pesados, no,
y se descargan en la primera visita. Una vez precargados, todos se leen sin
red, porque quedan en IndexedDB como cualquier libro local.
