# Gaza: Cenizas del Olivo

Vertical slice jugable de un run-and-gun 2D de rescate. Samir atraviesa el Barrio del Olivo, localiza una radio, neutraliza el dron bloqueador **Ojo del Cielo** y restablece una señal civil. El adversario es la fuerza ficticia El Directorio; la obra no atribuye sus acciones a una identidad étnica o religiosa.

## Estado actual

- Misión 1 jugable de principio a fin, con menú, HUD y pantalla de resultados.
- Movimiento con aceleración, carrera, salto variable, coyote time, jump buffer y plataformas de una dirección.
- Disparo en varias direcciones, proyectiles, daño, muerte y reaparición.
- Soldado con patrulla/alerta y mini-jefe aéreo con patrón de tres proyectiles.
- Checkpoint persistente en IndexedDB, sonido Web Audio y teclado/gamepad.
- Arte de prototipo extraído de las láminas originales mediante un script reproducible.

## Desarrollo únicamente en contenedor

Requisitos: Docker Compose v2, o Podman con compatibilidad Docker/Compose.

```bash
docker compose up --build game
```

Abrir `http://localhost:3000`. No es necesario instalar Node ni pnpm en el host.

Validación:

```bash
docker compose run --rm game pnpm lint
docker compose run --rm game pnpm test
docker compose run --rm game pnpm build
docker compose --profile test run --rm e2e
```

Regenerar los recortes:

```bash
docker compose run --rm game pnpm assets:extract
```

## Controles

| Acción        | Teclado   | Gamepad         |
| ------------- | --------- | --------------- |
| Mover/apuntar | A/D y W/S | Stick izquierdo |
| Saltar        | Espacio   | A / botón 0     |
| Correr        | Shift     | —               |
| Disparar      | J         | X / botón 2     |
| Interactuar   | E o L     | RB / botón 5    |
| Pausa         | Esc       | Start           |
| Reiniciar     | R         | —               |
| Hitboxes      | F3        | —               |

Consulta [GAME_DESIGN.md](GAME_DESIGN.md), [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) y [ASSET_AUDIT.md](ASSET_AUDIT.md) para el alcance y las decisiones.
