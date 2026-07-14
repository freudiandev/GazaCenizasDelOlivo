# Pruebas

## Automatizadas

`pnpm test` ejecuta Vitest sobre aterrizaje, coyote time, jump buffering y salto variable. `pnpm test:e2e` abre el menú, inicia Pixi, mueve a Samir, salta y pausa; también comprueba atributos de diagnóstico expuestos por el host sin acoplarse a píxeles del Canvas.

`pnpm lint` no acepta warnings y `pnpm build` realiza el chequeo estricto de TypeScript y exporta las cinco rutas estáticas.

## Matriz manual mínima

- Teclado y gamepad; ventana 1280×720 y móvil horizontal.
- Muerte antes/después del checkpoint y recarga de página.
- Apuntado arriba contra Ojo del Cielo, barra de jefe y reparación bloqueada.
- Pausa sin avance de simulación; F3 alineado con sprites.
- Audio tras gesto del usuario y funcionamiento sin Web Audio.

Pendiente para campaña: pruebas unitarias de daño/puntuación/IA extraídos de `Game`, migración de saves, escenas, rescates, jefes restantes y accesibilidad.
