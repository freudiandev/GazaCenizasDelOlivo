const bindings = {
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
  up: ["KeyW", "ArrowUp"],
  down: ["KeyS", "ArrowDown"],
  jump: ["Space"],
  run: ["ShiftLeft", "ShiftRight"],
  roll: ["ControlLeft", "ControlRight"],
  shoot: ["KeyJ"],
  tool: ["KeyK", "KeyQ"],
  interact: ["KeyL", "KeyE"],
  pause: ["Escape"],
  restart: ["KeyR"],
  debug: ["F3"],
} as const;

export type Action = keyof typeof bindings;

export class Input {
  private readonly down = new Set<string>();
  private readonly pressed = new Set<string>();
  private gamepadButtons = new Set<number>();
  private gamepadPrevious = new Set<number>();

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!this.down.has(event.code)) this.pressed.add(event.code);
    this.down.add(event.code);
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
        event.code,
      )
    ) {
      event.preventDefault();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent) =>
    this.down.delete(event.code);

  attach(): void {
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
  }

  detach(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  updateGamepad(): void {
    this.gamepadPrevious = this.gamepadButtons;
    this.gamepadButtons = new Set<number>();
    const pad = navigator.getGamepads?.()[0];
    pad?.buttons.forEach((button, index) => {
      if (button.pressed) this.gamepadButtons.add(index);
    });
  }

  axisX(): number {
    const pad = navigator.getGamepads?.()[0];
    const analog =
      pad && Math.abs(pad.axes[0] ?? 0) > 0.2 ? (pad.axes[0] ?? 0) : 0;
    const digital = Number(this.isDown("right")) - Number(this.isDown("left"));
    return Math.max(-1, Math.min(1, digital || analog));
  }

  isDown(action: Action): boolean {
    if (bindings[action].some((key) => this.down.has(key))) return true;
    const button = gamepadButton(action);
    return button !== null && this.gamepadButtons.has(button);
  }

  wasPressed(action: Action): boolean {
    if (bindings[action].some((key) => this.pressed.has(key))) return true;
    const button = gamepadButton(action);
    return (
      button !== null &&
      this.gamepadButtons.has(button) &&
      !this.gamepadPrevious.has(button)
    );
  }

  endFrame(): void {
    this.pressed.clear();
  }
}

function gamepadButton(action: Action): number | null {
  const map: Partial<Record<Action, number>> = {
    jump: 0,
    roll: 1,
    shoot: 2,
    tool: 3,
    interact: 5,
    pause: 9,
  };
  return map[action] ?? null;
}
