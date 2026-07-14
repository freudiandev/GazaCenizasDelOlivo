# Pipeline artístico

## Contrato del vertical slice

- Personaje nativo: 64×96 px aproximados; suelo anclado en `(0.5, 0.94)`.
- Paleta: arena/piedra, verde oliva, óxido y azul frío para tecnología del Directorio.
- Contorno: oscuro y selectivo; máximo contraste reservado para interacción/proyectiles.
- Luz: cálida desde arriba-izquierda; tecnología hostil con acento azul.
- Sin subpíxel visual: posiciones finales redondeadas, filtro nearest y sin blur.
- Hitboxes estables y menores que la silueta; hurtboxes independientes.

## Extracción reproducible

`scripts/extract-prototype-assets.mjs` recorta con Sharp, crea alfa desde el papel claro, recorta espacio transparente, reescala con nearest y escribe PNG + manifiesto JSON. Se ejecuta dentro del contenedor con `pnpm assets:extract`.

## Criterios de aceptación artística

Revisar a 1× y 4×: silueta, pies sin deslizamiento, pivote estable, bordes sin halo, ausencia de texto vecino, coherencia de luz y separación visual de partes jugables. No se considerará terminado un sprite obtenido sólo reduciendo una ilustración: los assets actuales se etiquetan explícitamente como prototipo.

## Animación final

Crear tags semánticos `idle`, `walk`, `run`, `brake`, `jump_rise`, `jump_turn`, `fall`, `land`, `crouch`, `roll`, `shoot_*`, `hurt`, `heal`, `carry` e `interact`. Mantener anticipación/contacto/extremo/recuperación, duración por frame y pivote común; no espejar texto, radio ni asimetrías sin variante dedicada.
