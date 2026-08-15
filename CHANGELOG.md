# Novedades de PageKeeper

Lo que cambia en cada versión, de lo más reciente a lo más antiguo. Las
versiones se numeran MAYOR.MENOR.PARCHE (ver `js/version.js`) y cada una lleva
su etiqueta en git (`v1.0.0`).

Antes de la 1.0.0 no había versiones numeradas: el detalle de aquel periodo
está en el historial de commits.

## 1.3.1 — 15 de agosto de 2026

### Cambiado
- **La biblioteca se abre en cuadrícula.** Quien no haya elegido vista verá
  ahora las portadas en lugar de la lista: una biblioteca se reconoce por las
  cubiertas mucho antes que por los títulos. Los dos botones de siempre siguen
  ahí, y quien elija la lista se queda con ella.

### Arreglado
- **El libro se llama igual en todas partes.** La biblioteca enseñaba el
  título del libro y la cabecera del lector, el nombre del archivo, así que el
  mismo libro aparecía con dos nombres. Ahora manda el mismo en los dos sitios
  —el que hayas puesto tú, si lo has puesto, y si no el del propio libro—, y
  también en el menú «⋯», en la exportación de anotaciones y en la hoja de
  título de la impresión.

## 1.3.0 — 15 de agosto de 2026

### Añadido
- **La hoja de título de la impresión se puede quitar.** El documento empezaba
  siempre con una hoja con el nombre del libro y el autor, incluso desmarcando
  la cubierta y los primeros capítulos, que es justo cuando no se quiere: al
  imprimir un capítulo suelto, esa hoja sobra. Ahora es una casilla, marcada de
  partida, y lo que elijas se recuerda.

## 1.2.0 — 15 de agosto de 2026

### Añadido
- **Las medidas de la impresión se pueden escribir exactas.** Las tres listas
  del diálogo —papel, márgenes y letra— tienen ahora «Personalizado»: el papel
  admite el ancho y el alto en milímetros (un A5 son 148 × 210), el margen sus
  milímetros y la letra sus puntos, con medios puntos. Se recuerda lo escrito
  aunque después se vuelva a A4, y un número imposible se recorta a lo que cabe
  en cuanto se suelta el campo, para verlo antes de que salga en el papel.

## 1.1.1 — 15 de agosto de 2026

### Cambiado
- **La ayuda explica cómo imprimir.** La pestaña «Lector» tiene un apartado
  nuevo con cómo llevar un EPUB al papel, cómo imprimir solo un capítulo y qué
  pasa con los subrayados y las notas. En los ocho idiomas.

## 1.1.0 — 15 de agosto de 2026

### Añadido
- **Los EPUB se pueden imprimir, o guardar en PDF.** En el lector hay un botón
  nuevo (y su entrada en el menú «⋯») que compone el libro para el papel y
  abre el diálogo de impresión del navegador, donde está «Guardar como PDF».
  Se elige el tamaño de la hoja —A4 o Carta—, los márgenes y el cuerpo de
  letra, y qué capítulos van: por omisión el libro entero, pero se puede
  desmarcar lo que no interese e imprimir solo un capítulo.
- **Los subrayados y las notas pueden ir al papel.** Los pasajes salen con su
  color y cada nota, con su llamada, se recoge al final del capítulo junto al
  fragmento al que acompaña. Es una casilla, así que también se puede imprimir
  el texto limpio.

El libro se compone con su propia maquetación —sus hojas de estilo y sus
ilustraciones—, cada capítulo empieza en hoja nueva y los títulos no se quedan
colgando al pie. En los PDF no aparece la opción: esos ya se imprimen
descargándolos.

## 1.0.4 — 15 de agosto de 2026

### Cambiado
- **La versión se ve al pie de la biblioteca**, junto al aviso de copyright.
  Estaba solo al final de los ajustes, y para saber qué versión se está usando
  —lo primero que hace falta cuando algo no va— había que ir a buscarla.

## 1.0.3 — 15 de agosto de 2026

### Arreglado
- **El espacio vuelve a avanzar siempre.** Si lo último que se había pulsado
  con el ratón era el margen de retroceder, ese margen se quedaba con el foco y
  el espacio lo volvía a activar: en vez de seguir leyendo, se retrocedía otra
  vez. Mayúsculas+espacio sigue siendo el camino de vuelta.

## 1.0.2 — 15 de agosto de 2026

### Cambiado
- **La última página ya no finge que pasa.** En los EPUB, al llegar al final
  del libro la página hacía la animación entera y volvía a aparecer la misma,
  como si algo no se hubiera pintado. Ahora el libro sabe cuándo se ha
  terminado: la página se asoma un poco y vuelve, igual que cuando se arrastra
  con el dedo contra el tope. Lo mismo al principio, hacia atrás.
- **El tope se nota también sin dedo.** Pulsando el margen o con las flechas,
  en la primera y la última página no ocurría absolutamente nada, y no
  moverse se parece demasiado a que el toque no se haya registrado. Ahora
  responde con el mismo rebote corto.

## 1.0.1 — 15 de agosto de 2026

### Arreglado
- **Se acabaron los avisos de «en otro dispositivo» que no venían de ningún
  otro dispositivo.** Al ir y volver deprisa —cambiar el zoom, abrir una nota,
  retroceder— mientras se estaba subiendo la posición, lo que bajaba de la nube
  era la lectura de uno mismo de hace unos segundos, y aparecía el cartel
  preguntando adónde ir. Ahora la posición lleva apuntado qué aparato la
  escribió: si fue este, no se pregunta nada y se deja anotado el sitio por el
  que se va de verdad.

## 1.0.0 — 15 de agosto de 2026

Primera versión numerada. Recoge el estado de la aplicación a día de hoy y los
cambios de esta tanda:

### Añadido
- **Las estadísticas conservan los libros borrados.** Al quitar un libro de la
  biblioteca se aparta lo que se leyó de él, así que sigue contando en la lista
  y en su ficha, marcado con un «ya no está en la biblioteca». Se sincroniza
  entre dispositivos, se poda a los 400 días y desaparece al borrar las
  estadísticas.
- **Ocultar un libro de la lista de estadísticas**, desde su ficha. No borra
  nada: vuelve solo en cuanto se lea otro rato.

### Cambiado
- **La comparación entre periodos se hace a la misma altura.** Un tramo en
  curso nunca está terminado, así que enfrentarlo entero al anterior solo decía
  qué día de la semana era hoy («72 % menos» un martes). Ahora la semana y el
  mes se comparan con los mismos días transcurridos del anterior, y el año, con
  los mismos meses cerrados.
- **Repaginar deja de contar como lectura.** Girar el móvil, abrir el índice o
  cambiar el ancho de la ventana reajusta la vista sin que nadie pase de
  página; eso cerraba el tramo de tiempo abierto y regalaba minutos al tiempo
  dedicado.

### Arreglado
- **El mismo libro ya no entra dos veces en el dispositivo.** Se compara el
  contenido y no el nombre del archivo, así que una copia con otro nombre —o el
  ejemplo precargado— ya no aparece como un libro aparte.
