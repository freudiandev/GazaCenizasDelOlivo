# Diseño técnico

## Stack

Next.js 16 App Router genera un sitio estático; React contiene menús/HUD; PixiJS 8 dibuja el juego; TypeScript está en modo estricto; Zustand comunica motor y HUD; `idb` persiste el checkpoint; Web Audio produce señales provisionales. pnpm, ESLint, Vitest y Playwright completan la cadena.

## Tiempo y física

El render usa `requestAnimationFrame`, mientras la simulación consume pasos fijos de 1/60 s con un acumulador y limita deltas largos a 100 ms. La física cinemática es propia y determinista: AABB, plataformas de una dirección, aceleración diferenciada aire/suelo, gravedad, velocidad terminal, coyote time y jump buffer. El sprite es visual; la hitbox estable evita que cada pose altere la jugabilidad.

## Capas

- Next/React: navegación, HUD y overlays.
- `Game`: orquestación del vertical slice y ciclo fijo.
- `Input`: teclado y gamepad convertidos a acciones semánticas.
- `physics.ts`: lógica pura cubierta por Vitest.
- `SaveManager`: IndexedDB versionada.
- Pixi: fondo, terreno, entidades, proyectiles y depuración.

## Cámara y píxel

La cámara sigue con anticipación según la dirección, interpolación y posición redondeada. Los sprites usan `scaleMode = nearest`; Canvas y CSS fuerzan `pixelated/crisp-edges`. Las colisiones no se derivan de píxeles opacos.

## Evolución

Al ampliar la campaña, `Game` debe dividirse en SceneManager, sistemas y entidades data-driven. El corte actual evita abstracciones vacías: cada módulo existente ejecuta una función real.
