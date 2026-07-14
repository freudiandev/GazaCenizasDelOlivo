# Auditoría de recursos visuales

Todas las entradas son RGB sin alfa. Son láminas conceptuales compuestas, no spritesheets listos para producción; por ello los originales se conservan en `public/assets/concept` y sólo los recortes validados pasan a `public/assets/generated`.

| Archivo                     |    Tamaño | Clasificación                           | Uso actual / acción                           |
| --------------------------- | --------: | --------------------------------------- | --------------------------------------------- |
| `central-concept.png`       | 1448×1086 | concepto, protagonista, fondo           | referencia de tono y silueta                  |
| `samir-animation-board.png` | 1448×1086 | animaciones, lámina para recorte        | idle y dos poses de carrera extraídas         |
| `jump-reference.png`        | 1448×1086 | animación, referencia                   | guía de arco; requiere redibujo frame a frame |
| `samir-design.png`          | 1448×1086 | protagonista, paleta                    | contrato de vestuario y materiales            |
| `tools.png`                 | 1448×1086 | armas, herramientas, iconos             | pendiente de atlas por herramienta            |
| `environments.png`          | 1448×1086 | escenarios y fondos                     | Barrio del Olivo extraído y usado             |
| `missions.png`              | 1448×1086 | narrativa, escenarios, UI               | referencia de campaña                         |
| `bosses.png`                | 1448×1086 | jefes, vehículos                        | referencia de siluetas y fases                |
| `endings.png`               | 1448×1086 | narrativa, finales                      | referencia para cinemáticas futuras           |
| `art-direction.png`         | 1448×1086 | paleta, UI, VFX, escenarios             | contrato artístico                            |
| `world-overview.png`        | 1448×1086 | lore, misiones, jefes, UI               | mapa de contenido                             |
| `directorio-reference.png`  | 1536×1024 | enemigos, armas, vehículos, iconos, VFX | fusilero y dron extraídos                     |

## Recursos runtime generados

El manifiesto `public/assets/generated/manifest.json` registra fuente, recorte, dimensiones, ancla, animación, duración, hitbox y hurtbox. Actualmente contiene Samir idle/run, fusilero, Ojo del Cielo y el fondo del barrio.

## Riesgos

- Las láminas generadas incorporan texto, fondos y escalas inconsistentes; un recorte automático no sustituye limpieza manual.
- Las poses disponibles no forman ciclos completos y coherentes. Los dos frames de carrera son prototipo, no arte final.
- Los símbolos médicos y escritura árabe requieren revisión cultural/legal antes de publicación.
- Jefes y escenarios pintados necesitan separación por capas para parallax, destrucción y animación.

## Estructura final propuesta

`concept/` conserva originales; `source/` alojará `.aseprite`; `generated/characters`, `generated/enemies`, `generated/bosses`, `generated/backgrounds`, `generated/vfx` y `generated/ui` serán exports runtime; cada familia tendrá PNG/atlas y JSON versionado.
