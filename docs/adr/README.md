# Decisiones de arquitectura (ADR)

Cada archivo recoge una decisión que condiciona el trabajo futuro: por qué se
tomó, qué se descartó y qué consecuencias tiene. Los que llevan «registro
retroactivo» se redactaron el 2026-09-28 a partir del código, el historial de
commits y la documentación, para describir el proyecto tal como está. Para
crear uno nuevo: `nuevo-adr "Título de la decisión"`, a partir de
[la plantilla](0000-plantilla.md).

| Nº | Decisión | Estado |
|---|---|---|
| [1](0001-sin-servidor-propio-con-la-nube-de-cada-persona.md) | PageKeeper no tiene servidor propio: cada persona conecta su nube | aceptado |
| [2](0002-sin-compilacion-y-bibliotecas-en-vendor.md) | Sin compilación y con las bibliotecas de terceros en `vendor/` | aceptado |
| [3](0003-politica-de-seguridad-en-meta.md) | La política de seguridad va en un `<meta>` y deja abierto `connect-src` | aceptado |
| [4](0004-configuracion-de-la-nube-en-el-fragmento.md) | La configuración de la nube viaja en el fragmento de un enlace | aceptado |
| [5](0005-libros-de-ejemplo-en-la-primera-visita.md) | La primera visita trae dos libros de ejemplo con licencia libre | aceptado |
| [6](0006-despliegue-con-un-flujo-de-actions.md) | El despliegue lo hace un flujo de GitHub Actions | aceptado |
| [7](0007-sin-analitica-ni-contadores.md) | PageKeeper no lleva analítica ni contadores de visitas | aceptado |
| [8](0008-mover-entre-nube-y-dispositivo-es-un-traslado.md) | Llevar un libro entre la nube y el dispositivo es un traslado | aceptado |
